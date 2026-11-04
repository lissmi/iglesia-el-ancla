
/* =========================================================
   EVENTOS PÚBLICOS RECURRENTES - IGLESIA EL ANCLA
   Archivo: backend/src/routes/eventRoutes.js

   Este módulo NO administra confirmaciones ni cupos.
   Las actividades puntuales pertenecen a activitiesRoutes.js.
========================================================= */

// Importamos Express para declarar nuestras rutas.
import { Router } from "express";

// Multer permite recibir una portada opcional.
import multer from "multer";

// Verificamos el tipo real de las imágenes.
import { fileTypeFromBuffer } from "file-type";

// Generamos identificadores únicos para las imágenes.
import { randomUUID } from "node:crypto";

// Mongoose permite validar identificadores de MongoDB.
import mongoose from "mongoose";

// Importamos el modelo de eventos y la zona horaria oficial compartida.
import Event, { EVENT_TIME_ZONE } from "../models/Event.js";

// Reutilizamos la configuración institucional para los textos de la página.
import SystemSettings from "../models/SystemSettings.js";

// Reutilizamos la autenticación existente.
import authenticateUser from "../middleware/authenticateUser.js";

// Reutilizamos el control de roles administrativos.
import authorizeRoles from "../middleware/authorizeRoles.js";

// Protegemos las solicitudes que modifican información.
import validateRequestOrigin from "../middleware/validateRequestOrigin.js";

// Usamos la configuración actual de Cloudinary.
import cloudinary from "../services/cloudinary/cloudinary.js";

// Registramos las eliminaciones en el historial global.
import { deleteResourceWithAudit } from "../services/audit/deletionService.js";

// Creamos el router de eventos públicos.
const router = Router();

// Roles que pueden administrar las publicaciones.
const ADMIN_ROLES = ["admin", "super_admin"];

// Tamaño máximo de una portada.
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

// Formatos de imagen permitidos.
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

// Campos que el administrador puede editar.
// No incluimos confirmaciones, cupos ni datos de auditoría.
const EDITABLE_FIELDS = new Set([
  "title",
  "category",
  "description",
  "date",
  "time",
  "endTime",
  "modality",
  "location",
  "meetingUrl",
  "recurrence",
  "publicationStatus",
]);

/* =========================================================
   CONFIGURACIÓN DE MULTER
========================================================= */

// Almacenamos temporalmente la imagen en memoria.
const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: MAX_IMAGE_BYTES,
    files: 1,
    fields: 1,
    parts: 2,
    fieldSize: 32 * 1024,
  },
}).single("image");

// Procesamos archivos solamente cuando la solicitud es multipart.
function receiveOptionalImage(req, res, next) {

  // Las solicitudes JSON pueden continuar directamente.
  if (!req.is("multipart/form-data")) {
    return next();
  }

  // Procesamos el archivo enviado desde React.
  return upload(req, res, (error) => {

    // Respondemos con un error controlado si Multer falla.
    if (error) {
      return next(
        httpError(
          400,
          "Imagen inválida. Usa JPG, PNG o WebP, máximo 5 MB"
        )
      );
    }

    // Continuamos con las validaciones.
    return next();
  });
}

/* =========================================================
   UTILIDADES DE VALIDACIÓN
========================================================= */

// Construimos errores con un código HTTP específico.
function httpError(status, message) {

  // Creamos el error.
  const error = new Error(message);

  // Indicamos el código que utilizará Express.
  error.status = status;

  // Devolvemos el error.
  return error;
}

// Comprobamos el contenido auténtico de la imagen.
async function validateImage(file) {

  // La portada es opcional.
  if (!file) return;

  // Rechazamos archivos vacíos o demasiado grandes.
  if (!file.buffer?.length || file.size > MAX_IMAGE_BYTES) {
    throw httpError(
      400,
      "La imagen está vacía o supera los 5 MB"
    );
  }

  // Detectamos el formato a partir de los bytes.
  const detected = await fileTypeFromBuffer(file.buffer);

  // Solo aceptamos los formatos autorizados.
  if (!ALLOWED_IMAGE_TYPES.has(detected?.mime)) {
    throw httpError(
      400,
      "La imagen debe ser JPG, PNG o WebP válido"
    );
  }
}

/* =========================================================
   LECTURA SEGURA DEL FORMULARIO
========================================================= */

// Procesamos los campos permitidos del evento.
function readEventPayload(req, { isCreate = false } = {}) {

  // Obtenemos el cuerpo recibido desde React.
  let payload = req.body;

  // Los formularios multipart incluyen un campo JSON.
  if (req.is("multipart/form-data")) {

    // Exigimos que exista el campo data.
    if (typeof req.body?.data !== "string") {
      throw httpError(400, "Falta el campo 'data'");
    }

    // Interpretamos su contenido JSON.
    try {
      payload = JSON.parse(req.body.data);
    } catch {
      throw httpError(
        400,
        "El campo 'data' no contiene JSON válido"
      );
    }
  }

  // Rechazamos valores que no sean objetos.
  if (
    !payload ||
    typeof payload !== "object" ||
    Array.isArray(payload)
  ) {
    throw httpError(
      400,
      "Los datos del evento deben ser un objeto JSON"
    );
  }

  // Detectamos campos ajenos al módulo de eventos públicos.
  for (const key of Object.keys(payload)) {

    // Solo permitimos campos editables y removeImage.
    if (!EDITABLE_FIELDS.has(key) && key !== "removeImage") {
      throw httpError(
        400,
        `El campo '${key}' no corresponde a eventos públicos`
      );
    }
  }

  // Validamos la instrucción opcional de quitar la portada.
  if (
    payload.removeImage !== undefined &&
    typeof payload.removeImage !== "boolean"
  ) {
    throw httpError(
      400,
      "removeImage debe ser true o false"
    );
  }

  // Al crear no existe una imagen anterior.
  if (isCreate && payload.removeImage) {
    throw httpError(
      400,
      "No existe una imagen anterior para eliminar"
    );
  }

  // Construimos un objeto exclusivamente con campos autorizados.
  const fields = {};

  // Copiamos únicamente los valores permitidos.
  for (const key of EDITABLE_FIELDS) {
    if (Object.hasOwn(payload, key)) {
      fields[key] = payload[key];
    }
  }

  // Normalizamos los textos opcionales vacíos.
  for (const key of ["endTime", "location", "meetingUrl"]) {
    if (fields[key] === "" || fields[key] === null) {
      fields[key] = undefined;
    }
  }

  // Los eventos públicos se configuran como recurrentes.
  if (isCreate && !Object.hasOwn(fields, "recurrence")) {
    throw httpError(
      400,
      "Debes indicar la frecuencia de repetición del evento"
    );
  }

  // La recurrencia puede ser semanal o mensual; nunca se mezcla.
  if (Object.hasOwn(fields, "recurrence")) {
    const recurrence = fields.recurrence;

    // Exigimos uno de los dos tipos y días de la semana sin duplicados.
    if (
      !recurrence ||
      typeof recurrence !== "object" ||
      Array.isArray(recurrence) ||
      !["weekly", "monthly"].includes(recurrence.type) ||
      !Array.isArray(recurrence.daysOfWeek) ||
      (recurrence.type === "weekly" && recurrence.daysOfWeek.length === 0) ||
      recurrence.daysOfWeek.some((day) =>
        !Number.isInteger(day) || day < 0 || day > 6
      ) ||
      new Set(recurrence.daysOfWeek).size !== recurrence.daysOfWeek.length
    ) {
      throw httpError(400, "Selecciona una frecuencia y días válidos para el evento");
    }

    // La modalidad mensual admite un día o fechas completamente por confirmar.
    if (recurrence.type === "monthly" && recurrence.daysOfWeek.length > 1) {
      throw httpError(400, "Selecciona como máximo un día de la semana para la recurrencia mensual");
    }

    // Normalizamos únicamente los campos que pertenecen a la recurrencia.
    const normalized = {
      type: recurrence.type,
      daysOfWeek: recurrence.daysOfWeek,
      ...(recurrence.endDate ? { endDate: recurrence.endDate } : {}),
    };

    if (recurrence.type === "monthly") {
      // Cantidad de encuentros al mes: uno, dos, tres o cuatro.
      if (!Number.isInteger(recurrence.monthlyCount) ||
          recurrence.monthlyCount < 1 || recurrence.monthlyCount > 4) {
        throw httpError(400, "Indica cuántas veces al mes se realiza el evento");
      }
      normalized.monthlyCount = recurrence.monthlyCount;

      // Si no se definen semanas, las fechas concretas están por confirmar.
      if (recurrence.weeksOfMonth !== undefined) {
        // Las semanas fijas requieren conocer el día (p. ej., domingo).
        if (recurrence.daysOfWeek.length !== 1) {
          throw httpError(400, "Para fijar semanas, selecciona un día de la semana");
        }
        const weeks = recurrence.weeksOfMonth;
        if (!Array.isArray(weeks) ||
            weeks.length !== recurrence.monthlyCount ||
            weeks.some((week) => ![1, 2, 3, 4, -1].includes(week)) ||
            new Set(weeks).size !== weeks.length ||
            (weeks.includes(4) && weeks.includes(-1))) {
          throw httpError(400, "Selecciona semanas del mes válidas y sin repeticiones");
        }
        normalized.weeksOfMonth = weeks;
      }
    }

    // El modelo vuelve a validar esta estructura antes de guardar.
    fields.recurrence = normalized;
  }

  // Comprobamos el estado de publicación recibido.
  if (
    fields.publicationStatus !== undefined &&
    !["draft", "published"].includes(
      fields.publicationStatus
    )
  ) {
    throw httpError(
      400,
      "Estado de publicación inválido"
    );
  }

  // Entregamos los campos y la decisión sobre la portada.
  return {
    fields,
    removeImage: payload.removeImage === true,
  };
}

/* =========================================================
   PREPARACIÓN DE RESPUESTAS
========================================================= */

// Convertimos el documento MongoDB en un objeto para React.
function serializeEvent(event) {

  // Solo compartimos datos necesarios para mostrar el evento.
  return {
    id: String(event._id),
    title: event.title,
    category: event.category,
    description: event.description,
    date: event.date,
    time: event.time,
    endTime: event.endTime,
    timezone: EVENT_TIME_ZONE,
    modality: event.modality,
    location: event.location,
    meetingUrl: event.meetingUrl,
    recurrence: event.recurrence,
    publicationStatus: event.publicationStatus,

    // Nunca enviamos el publicId privado de Cloudinary.
    image: event.image?.url
      ? {
        url: event.image.url,
        alt: `Imagen de ${event.title}`,
      }
      : null,

    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  };
}

/* =========================================================
   GESTIÓN DE PORTADAS EN CLOUDINARY
========================================================= */

// Subimos una imagen validada a Cloudinary.
async function uploadImage(file) {

  // Convertimos la operación en una promesa.
  return new Promise((resolve, reject) => {

    // Cloudinary recibe los bytes directamente desde memoria.
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "el-ancla/eventos/imagenes",
        public_id: randomUUID(),
        resource_type: "image",
        overwrite: false,
      },

      // Comprobamos la respuesta del proveedor.
      (error, result) => {

        // Rechazamos si falla Cloudinary.
        if (error) return reject(error);

        // Verificamos que exista una URL y un identificador.
        if (!result?.secure_url || !result?.public_id) {
          return reject(
            new Error("Cloudinary no devolvió la imagen subida")
          );
        }

        // Guardamos únicamente los datos necesarios.
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    // Entregamos el archivo a Cloudinary.
    stream.end(file.buffer);
  });
}

// Eliminamos una imagen utilizando su identificador privado.
async function deleteImage(publicId) {

  // Si no hay imagen, no hay nada que eliminar.
  if (!publicId) return;

  // Solicitamos el borrado y la invalidación de caché.
  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
    invalidate: true,
  });

  // Admitimos imágenes eliminadas previamente.
  if (!["ok", "not found"].includes(result?.result)) {
    throw new Error("Cloudinary no pudo eliminar la imagen");
  }
}

// Limpiamos imágenes nuevas cuando una operación falla.
async function cleanupImage(publicId) {

  // No hacemos nada si no se subió una imagen.
  if (!publicId) return;

  try {
    // Intentamos retirar el archivo temporal.
    await deleteImage(publicId);
  } catch (error) {

    // Registramos una limpieza pendiente.
    console.error(
      "Imagen de evento pendiente de limpieza:",
      publicId,
      error.message
    );
  }
}

// Traducimos los errores de validación de Mongoose.
function forwardError(error, next) {

  // Las validaciones inválidas generan una respuesta 400.
  if (
    ["ValidationError", "CastError"].includes(error?.name)
  ) {
    error.status = 400;
  }

  // Delegamos el resto al middleware global.
  return next(error);
}

// =========================================================
// PRESENTACIÓN DE LA PÁGINA PÚBLICA DE EVENTOS
// =========================================================

// Textos iniciales para una instalación sin configuración guardada.
// Son contenido institucional predeterminado, NO eventos de ejemplo.
const DEFAULT_EVENT_PAGE = Object.freeze({
  heroEyebrow: "Encuentros de nuestra comunidad",
  heroTitle: "Vive nuestros",
  heroHighlight: "eventos semanales",
  heroDescription: "Conoce las reuniones habituales de El Ancla y encuentra un espacio para compartir, aprender y crecer con nuestra comunidad.",
  heroIcon: "original",
  featuredEyebrow: "Evento destacado",
  featuredTitle: "Un espacio para encontrarnos",
  listEyebrow: "Nuestra programación",
  listTitle: "Otros eventos semanales",
  listDescription: "Descubre los encuentros que realizamos durante la semana y cómo participar.",
  invitationEyebrow: "Te esperamos",
  invitationTitle: "¿Tienes dudas sobre algún evento?",
  invitationDescription: "Escríbenos y te ayudaremos con horarios, ubicación y cualquier información para visitarnos.",
  invitationButtonText: "Contáctanos",
  featuredEventId: "",
});

// Lista de campos y límites del editor. Nunca aceptamos llaves arbitrarias.
const EVENT_PAGE_LIMITS = Object.freeze({
  heroEyebrow: 90, heroTitle: 100, heroHighlight: 100,
  heroDescription: 600, heroIcon: 30, featuredEyebrow: 90,
  featuredTitle: 120, listEyebrow: 90, listTitle: 120,
  listDescription: 600, invitationEyebrow: 90,
  invitationTitle: 140, invitationDescription: 600,
  invitationButtonText: 60, featuredEventId: 24,
});

const EVENT_PAGE_ICONS = new Set(["original", "calendar", "church", "users", "heart"]);

// Sustituye cualquier contenido incompleto por valores por defecto.
// Las lecturas con .lean() entregan objetos planos, pero findOneAndUpdate()
// puede devolver subdocumentos Mongoose: hay que convertirlos antes del spread.
function publicPageContent(doc) {
  // Convertimos el subdocumento hidratado sin perder sus campos reales.
  const plainContent = typeof doc?.toObject === "function"
    ? doc.toObject({ getters: false, virtuals: false })
    : doc;

  // Mantenemos los textos iniciales cuando aún no hay configuración guardada.
  return {
    ...DEFAULT_EVENT_PAGE,
    ...(plainContent && typeof plainContent === "object" && !Array.isArray(plainContent)
      ? plainContent
      : {}),
  };
}

// Valida una versión completa para no guardar borradores incoherentes.
function validatePageContent(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw httpError(400, "La página enviada no es válida");
  }

  const keys = Object.keys(EVENT_PAGE_LIMITS);
  if (Object.keys(body).some((key) => !keys.includes(key))) {
    throw httpError(400, "La página contiene datos no permitidos");
  }

  const normalized = {};
  for (const key of keys) {
    if (typeof body[key] !== "string") {
      throw httpError(400, `El campo ${key} debe contener texto`);
    }
    normalized[key] = body[key].trim();
    if (normalized[key].length > EVENT_PAGE_LIMITS[key]) {
      throw httpError(400, `El campo ${key} es demasiado largo`);
    }
    if (!normalized[key] && key !== "featuredEventId") {
      throw httpError(400, "Completa los textos de la página antes de guardar");
    }
  }

  if (!EVENT_PAGE_ICONS.has(normalized.heroIcon)) {
    throw httpError(400, "Selecciona un icono de la lista");
  }
  if (normalized.featuredEventId && !mongoose.isValidObjectId(normalized.featuredEventId)) {
    throw httpError(400, "El evento destacado seleccionado no es válido");
  }
  return normalized;
}

// =========================================================
// GET /api/events/page — LECTURA PÚBLICA
// =========================================================

// Debe declararse ANTES de exigir autenticación en este router.
router.get("/page", async (_req, res, next) => {
  try {
    const settings = await SystemSettings.findOne({ key: "general" })
      .select("eventsPage.published")
      .lean();
    res.set("Cache-Control", "no-store");
    return res.status(200).json({
      success: true,
      page: publicPageContent(settings?.eventsPage?.published),
    });
  } catch (error) {
    return next(error);
  }
});

/* =========================================================
   GET /api/events/public
   EVENTOS VISIBLES PARA TODOS
========================================================= */

// Esta ruta es pública y NO requiere iniciar sesión.
router.get("/public", async (req, res, next) => {
  try {

    // Consultamos el día actual en Chile, sin depender de la zona del servidor.
    const dateParts = new Intl.DateTimeFormat("en-GB", {
      timeZone: EVENT_TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());

    // Recuperamos cada parte para construir el formato YYYY-MM-DD.
    const part = (type) => dateParts.find((item) => item.type === type)?.value;
    const today = `${part("year")}-${part("month")}-${part("day")}`;

    // Solo los eventos publicados y cuya programación aún está vigente.
    const events = await Event.find({
      publicationStatus: "published",
      $or: [
        // Sin fecha final: evento semanal permanente.
        { "recurrence.endDate": { $exists: false } },
        // Con fecha final: la recurrencia todavía no ha terminado.
        { "recurrence.endDate": { $gte: today } },
      ],
    })
      .sort({ date: 1, time: 1 })
      .lean();

    // Evitamos presentar datos publicados antiguos desde caché.
    res.set("Cache-Control", "no-store");

    // Devolvemos los eventos autorizados.
    return res.json({
      success: true,
      events: events.map(serializeEvent),
    });

  } catch (error) {
    return forwardError(error, next);
  }
});

/* =========================================================
   PROTECCIÓN DE LA ADMINISTRACIÓN
========================================================= */

// Desde aquí todas las operaciones exigen sesión y rol administrativo.
router.use(
  authenticateUser,
  authorizeRoles(...ADMIN_ROLES)
);

// =========================================================
// GET /api/events/page/admin — BORRADOR Y VERSIÓN PUBLICADA
// =========================================================
router.get("/page/admin", async (_req, res, next) => {
  try {
    const settings = await SystemSettings.findOne({ key: "general" })
      .select("eventsPage")
      .lean();
    const published = publicPageContent(settings?.eventsPage?.published);
    const draft = publicPageContent(settings?.eventsPage?.draft || published);
    res.set("Cache-Control", "private, no-store");
    return res.status(200).json({ success: true, draft, published });
  } catch (error) {
    return next(error);
  }
});

// =========================================================
// PATCH /api/events/page/draft — GUARDAR SIN PUBLICAR
// =========================================================
router.patch("/page/draft", validateRequestOrigin, async (req, res, next) => {
  try {
    const draft = validatePageContent(req.body);
    const updated = await SystemSettings.findOneAndUpdate(
      { key: "general" },
      {
        $set: { "eventsPage.draft": draft, updatedBy: req.user._id },
        $setOnInsert: { key: "general" },
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.set("Cache-Control", "private, no-store");
    return res.status(200).json({
      success: true,
      message: "Borrador de la página guardado",
      draft: publicPageContent(updated.eventsPage?.draft),
    });
  } catch (error) {
    return next(error);
  }
});

// =========================================================
// PATCH /api/events/page/featured — DESTACAR Y PUBLICAR
// =========================================================

// Solo cambia el ID destacado en ambas versiones de la página.
// Los textos que aún estén en borrador NO se publican por accidente.
router.patch("/page/featured", validateRequestOrigin, async (req, res, next) => {
  try {
    // Aceptamos únicamente el campo previsto, no objetos arbitrarios.
    const body = req.body;
    if (!body || typeof body !== "object" || Array.isArray(body) ||
        Object.keys(body).length !== 1 || typeof body.featuredEventId !== "string") {
      throw httpError(400, "Selecciona un evento destacado válido");
    }

    // Comprobamos el formato del ID de MongoDB.
    const featuredEventId = body.featuredEventId.trim();
    if (!mongoose.isObjectIdOrHexString(featuredEventId)) {
      throw httpError(400, "Identificador de evento inválido");
    }

    // Solo permitimos destacar un evento publicado y todavía vigente.
    // Aplicamos el mismo criterio que GET /api/events/public.
    const todayParts = new Intl.DateTimeFormat("en-GB", {
      timeZone: EVENT_TIME_ZONE,
      year: "numeric", month: "2-digit", day: "2-digit",
    }).formatToParts(new Date());
    const part = (type) => todayParts.find((item) => item.type === type)?.value;
    const today = `${part("year")}-${part("month")}-${part("day")}`;

    const eligible = await Event.exists({
      _id: featuredEventId,
      publicationStatus: "published",
      $or: [
        { "recurrence.endDate": { $exists: false } },
        { "recurrence.endDate": { $gte: today } },
      ],
    });
    if (!eligible) {
      throw httpError(400, "Primero publica el evento que deseas destacar");
    }

    // Actualizamos ÚNICAMENTE el destacado de ambas versiones.
    // $set sobre rutas concretas conserva todos los textos previos.
    const settings = await SystemSettings.findOneAndUpdate(
      { key: "general" },
      {
        $set: {
          "eventsPage.draft.featuredEventId": featuredEventId,
          "eventsPage.published.featuredEventId": featuredEventId,
          updatedBy: req.user._id,
        },
        $setOnInsert: { key: "general" },
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean();

    // Confirmamos la nueva selección desde los datos realmente guardados.
    // .lean() evita el problema al extender subdocumentos Mongoose hidratados.
    const draft = publicPageContent(settings?.eventsPage?.draft);
    const published = publicPageContent(settings?.eventsPage?.published);
    if (published.featuredEventId !== featuredEventId) {
      throw new Error("La selección pública no se guardó correctamente");
    }

    res.set("Cache-Control", "private, no-store");
    return res.status(200).json({
      success: true,
      message: "Evento destacado publicado correctamente",
      draft,
      published,
    });
  } catch (error) {
    return next(error);
  }
});

// =========================================================
// POST /api/events/page/publish — PUBLICAR TEXTOS Y DISEÑO
// =========================================================
router.post("/page/publish", validateRequestOrigin, async (req, res, next) => {
  try {
    // Publicamos la versión enviada: así también se pueden publicar
    // cambios que el administrador aún está viendo en pantalla.
    const nextPage = validatePageContent(req.body);

    // Nunca destacamos un evento borrador o inexistente en la página pública.
    if (nextPage.featuredEventId) {
      // La programación del destacado debe continuar vigente.
      const todayParts = new Intl.DateTimeFormat("en-GB", {
        timeZone: EVENT_TIME_ZONE,
        year: "numeric", month: "2-digit", day: "2-digit",
      }).formatToParts(new Date());
      const part = (type) => todayParts.find((item) => item.type === type)?.value;
      const today = `${part("year")}-${part("month")}-${part("day")}`;

      const selected = await Event.exists({
        _id: nextPage.featuredEventId,
        publicationStatus: "published",
        $or: [
          { "recurrence.endDate": { $exists: false } },
          { "recurrence.endDate": { $gte: today } },
        ],
      });
      if (!selected) {
        throw httpError(400, "Publica primero el evento que deseas destacar");
      }
    }

    const updated = await SystemSettings.findOneAndUpdate(
      { key: "general" },
      {
        $set: {
          "eventsPage.draft": nextPage,
          "eventsPage.published": nextPage,
          updatedBy: req.user._id,
        },
        $setOnInsert: { key: "general" },
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.set("Cache-Control", "private, no-store");
    return res.status(200).json({
      success: true,
      message: "Cambios publicados en la página de eventos",
      page: publicPageContent(updated.eventsPage?.published),
    });
  } catch (error) {
    return next(error);
  }
});


// =========================================================
// LIMPIEZA DE REFERENCIAS A EVENTOS QUE YA NO SON PÚBLICOS
// =========================================================

// Limpiamos solamente el ID afectado y respetamos los demás campos.
// Dos actualizaciones independientes permiten conservar los textos de ambas versiones.
async function clearFeaturedReferences(eventId, adminId) {
  const id = String(eventId);
  const fields = ["draft", "published"];

  // Solo se modifica una versión si aún apunta a este evento.
  const results = await Promise.allSettled(fields.map((version) =>
    SystemSettings.updateOne(
      { key: "general", [`eventsPage.${version}.featuredEventId`]: id },
      { $set: { [`eventsPage.${version}.featuredEventId`]: "", updatedBy: adminId } }
    )
  ));

  // Nunca ocultamos errores de limpieza; el evento ya puede estar eliminado.
  const failed = results.filter((result) => result.status === "rejected");
  for (const result of failed) {
    console.error("No se pudo retirar la referencia al evento destacado:", result.reason);
  }
  return failed.length === 0;
}

/* =========================================================
   GET /api/events/admin
   LISTADO ADMINISTRATIVO
========================================================= */

router.get("/admin", async (req, res, next) => {
  try {

    // Administración puede consultar publicados y borradores.
    const events = await Event.find()
      .sort({ createdAt: -1 })
      .lean();

    // Los datos administrativos no deben almacenarse en caché.
    res.set("Cache-Control", "private, no-store");

    // Entregamos las publicaciones para administración.
    return res.json({
      success: true,
      events: events.map(serializeEvent),
    });

  } catch (error) {
    return forwardError(error, next);
  }
});

/* =========================================================
   POST /api/events
   CREAR EVENTO RECURRENTE
========================================================= */

router.post(
  "/",
  validateRequestOrigin,
  receiveOptionalImage,

  async (req, res, next) => {

    // Conservamos el identificador de una posible imagen nueva.
    let newImageId = null;

    // Indica si MongoDB confirmó el guardado.
    let saved = false;

    try {

      // Leemos los campos permitidos del formulario.
      const { fields } = readEventPayload(req, {
        isCreate: true,
      });

      // Construimos el evento con los campos validados.
      const event = new Event({
        ...fields,

        // Identificamos al administrador mediante su sesión.
        createdBy: req.user._id,
      });

      // Validamos los datos antes de subir una imagen.
      await event.validate();

      // Validamos la portada opcional.
      await validateImage(req.file);

      // Subimos la imagen solamente si se adjuntó una.
      if (req.file) {
        event.image = await uploadImage(req.file);
        newImageId = event.image.publicId;
      }

      // Guardamos el evento en MongoDB Atlas.
      await event.save();
      saved = true;

      // Evitamos caché con datos administrativos.
      res.set("Cache-Control", "private, no-store");

      // Devolvemos la publicación creada.
      return res.status(201).json({
        success: true,
        message: "Evento público creado correctamente",
        event: serializeEvent(event),
      });

    } catch (error) {

      // Si MongoDB falló, limpiamos la imagen recién subida.
      if (!saved) {
        await cleanupImage(newImageId);
      }

      // Respondemos mediante el manejador global.
      return forwardError(error, next);
    }
  }
);

/* =========================================================
   PATCH /api/events/:id/publication
   PUBLICAR O GUARDAR BORRADOR
========================================================= */

router.patch(
  "/:id/publication",
  validateRequestOrigin,

  async (req, res, next) => {
    try {

      // Validamos el identificador solicitado.
      if (!mongoose.isObjectIdOrHexString(req.params.id)) {
        throw httpError(
          400,
          "Identificador de evento inválido"
        );
      }

      // Solo permitimos los dos estados definidos.
      const status = req.body?.publicationStatus;

      if (!["draft", "published"].includes(status)) {
        throw httpError(
          400,
          "Estado de publicación inválido"
        );
      }

      // Buscamos el evento existente.
      const event = await Event.findById(req.params.id);

      // No podemos actualizar un evento inexistente.
      if (!event) {
        throw httpError(404, "Evento no encontrado");
      }

      // Modificamos el estado de publicación.
      event.publicationStatus = status;

      // Registramos al administrador responsable.
      event.updatedBy = req.user._id;

      // Persistimos el cambio.
      await event.save();

      // Si ya no es público, retiramos referencias a su destacado.
      // No afecta los textos guardados de la página de Eventos.
      const referencesCleared = status === "draft"
        ? await clearFeaturedReferences(event._id, req.user._id)
        : true;

      // Protegemos la respuesta administrativa.
      res.set("Cache-Control", "private, no-store");

      // Devolvemos el registro actualizado.
      return res.json({
        success: true,
        ...(referencesCleared ? {} : {
          warning: "El evento pasó a borrador, pero queda pendiente actualizar el destacado público",
        }),
        event: serializeEvent(event),
      });

    } catch (error) {
      return forwardError(error, next);
    }
  }
);

/* =========================================================
   PATCH /api/events/:id
   EDITAR EVENTO Y PORTADA
========================================================= */

router.patch(
  "/:id",
  validateRequestOrigin,
  receiveOptionalImage,

  async (req, res, next) => {

    // Identificador de una posible imagen nueva.
    let newImageId = null;

    // Controlamos si los cambios se guardaron.
    let saved = false;

    try {

      // Verificamos que el ID tenga formato válido.
      if (!mongoose.isObjectIdOrHexString(req.params.id)) {
        throw httpError(
          400,
          "Identificador de evento inválido"
        );
      }

      // Obtenemos el evento y el identificador privado de imagen.
      const event = await Event.findById(req.params.id)
        .select("+image.publicId");

      // Devolvemos 404 si el evento no existe.
      if (!event) {
        throw httpError(404, "Evento no encontrado");
      }

      // Leemos el contenido editable del formulario.
      const { fields, removeImage } = readEventPayload(req);

      // No permitimos reemplazar y eliminar simultáneamente.
      if (removeImage && req.file) {
        throw httpError(
          400,
          "No puedes reemplazar y eliminar la portada al mismo tiempo"
        );
      }

      // Conservamos la referencia a la imagen anterior.
      const previousImageId = event.image?.publicId;

      // Actualizamos solamente los campos permitidos.
      event.set(fields);


      // Registramos la última modificación.
      event.updatedBy = req.user._id;

      // Quitamos la portada si así se solicitó.
      if (removeImage) {
        event.image = undefined;
      }

      // Validamos el documento antes de subir archivos.
      await event.validate();
      await validateImage(req.file);

      // Subimos la portada nueva cuando corresponda.
      if (req.file) {
        event.image = await uploadImage(req.file);
        newImageId = event.image.publicId;
      }

      // Confirmamos los cambios en MongoDB.
      await event.save();
      saved = true;

      // La eliminación de una imagen antigua es posterior al guardado.
      let warning = null;

      if (
        previousImageId &&
        (removeImage || newImageId)
      ) {
        try {

          // Intentamos retirar la imagen reemplazada.
          await deleteImage(previousImageId);

        } catch (error) {

          // La edición sigue guardada correctamente.
          warning =
            "El evento se guardó, pero quedó pendiente limpiar la imagen anterior";

          // Registramos el identificador para revisión técnica.
          console.error(
            "Imagen anterior pendiente:",
            previousImageId,
            error.message
          );
        }
      }

      // No almacenamos en caché la respuesta.
      res.set("Cache-Control", "private, no-store");

      // Devolvemos la versión actualizada.
      return res.json({
        success: true,
        message: "Evento actualizado correctamente",
        ...(warning ? { warning } : {}),
        event: serializeEvent(event),
      });

    } catch (error) {

      // Retiramos una portada nueva si MongoDB falló.
      if (!saved) {
        await cleanupImage(newImageId);
      }

      // Enviamos el error al manejador global.
      return forwardError(error, next);
    }
  }
);

/* =========================================================
   DELETE /api/events/:id
   ELIMINAR EVENTO CON AUDITORÍA
========================================================= */

router.delete(
  "/:id",
  validateRequestOrigin,

  async (req, res, next) => {
    try {

      // Comprobamos el identificador recibido.
      if (!mongoose.isObjectIdOrHexString(req.params.id)) {
        throw httpError(
          400,
          "Identificador de evento inválido"
        );
      }

      // Recuperamos el evento y su imagen opcional.
      const event = await Event.findById(req.params.id)
        .select("+image.publicId");

      // Respondemos si el evento ya no existe.
      if (!event) {
        throw httpError(404, "Evento no encontrado");
      }

      // Conservamos el ID de su imagen.
      const previousImageId = event.image?.publicId;

      // Eliminamos en MongoDB junto al registro de auditoría.
      await deleteResourceWithAudit({
        model: Event,
        resourceId: event._id,
        resourceType: "event",
        deletedBy: req.user._id,
      });

      // El evento eliminado ya no debe ser el destacado en ninguna versión.
      // El backend ajusta estas referencias incluso si se borra fuera de React.
      const referencesCleared = await clearFeaturedReferences(
        event._id,
        req.user._id
      );

      // Cloudinary no participa en transacciones de MongoDB.
      // Por eso limpiamos la portada después del borrado confirmado.
      let warning = referencesCleared
        ? null
        : "Evento eliminado; queda pendiente actualizar el destacado de la página";

      try {

        // Eliminamos la imagen si existe.
        await deleteImage(previousImageId);

      } catch (error) {

        // El registro de MongoDB ya fue eliminado.
        warning = warning
          ? `${warning}. También queda pendiente retirar la imagen anterior`
          : "Evento eliminado; queda pendiente retirar su imagen anterior";

        // Dejamos evidencia para realizar la limpieza.
        console.error(
          "Imagen de evento pendiente:",
          previousImageId,
          error.message
        );
      }

      // Deshabilitamos el almacenamiento en caché.
      res.set("Cache-Control", "private, no-store");

      // Confirmamos la operación.
      return res.json({
        success: true,
        message: "Evento eliminado correctamente",
        ...(warning ? { warning } : {}),
      });

    } catch (error) {
      return forwardError(error, next);
    }
  }
);

// Exportamos el router para registrarlo en app.js.
export default router;
