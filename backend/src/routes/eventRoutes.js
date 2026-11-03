
/* =========================================================
   EVENTOS PÚBLICOS RECURRENTES - IGLESIA EL ANCLA
   Archivo: backend/src/routes/eventRoutes.js

   Gestiona los eventos habituales de la iglesia.

   - Consulta pública de eventos vigentes.
   - Creación de eventos recurrentes.
   - Edición de información y portadas.
   - Publicación y borradores.
   - Eliminación con auditoría.

   NO gestiona confirmaciones ni cupos.
   Las actividades puntuales usan activitiesRoutes.js.
========================================================= */

// Importamos Express para definir las rutas.
import { Router } from "express";

// Multer permite recibir imágenes opcionales.
import multer from "multer";

// Verificamos el formato real de los archivos.
import { fileTypeFromBuffer } from "file-type";

// Generamos identificadores únicos para Cloudinary.
import { randomUUID } from "node:crypto";

// Utilizamos Mongoose para validar identificadores.
import mongoose from "mongoose";

// Importamos el modelo y la zona horaria compartida.
import Event, {
  EVENT_TIME_ZONE,
} from "../models/Event.js";

// Middleware de autenticación mediante sesión.
import authenticateUser from "../middleware/authenticateUser.js";

// Middleware de autorización administrativa.
import authorizeRoles from "../middleware/authorizeRoles.js";

// Protección de solicitudes que modifican información.
import validateRequestOrigin from "../middleware/validateRequestOrigin.js";

// Reutilizamos la configuración existente de Cloudinary.
import cloudinary from "../services/cloudinary/cloudinary.js";

// Servicio existente de eliminación con auditoría.
import {
  deleteResourceWithAudit,
} from "../services/audit/deletionService.js";

// Creamos el router.
const router = Router();

// Roles que pueden administrar los eventos.
const ADMIN_ROLES = ["admin", "super_admin"];

// Tamaño máximo permitido para imágenes: 5 MiB.
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

// Formatos de imágenes permitidos.
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

// Campos editables desde el frontend.
// No admitimos cupos, confirmaciones ni datos de auditoría.
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

// Configuramos la recepción de una imagen opcional.
const upload = multer({

  // Los archivos se procesan temporalmente en memoria.
  storage: multer.memoryStorage(),

  // Limitamos los datos que puede recibir el servidor.
  limits: {
    fileSize: MAX_IMAGE_BYTES,
    files: 1,
    fields: 1,
    parts: 2,
    fieldSize: 32 * 1024,
  },

}).single("image");


/* =========================================================
   MANEJO DE ERRORES HTTP
========================================================= */

// Construimos errores que incluyen el código de respuesta.
function httpError(status, message) {

  // Creamos el error.
  const error = new Error(message);

  // Definimos el código HTTP.
  error.status = status;

  // Entregamos el error.
  return error;
}


/* =========================================================
   RECEPCIÓN DE IMAGEN OPCIONAL
========================================================= */

// Permite recibir JSON o formularios con imagen.
function receiveOptionalImage(req, res, next) {

  // Si no es multipart, continuamos directamente.
  if (!req.is("multipart/form-data")) {
    return next();
  }

  // Multer procesa el archivo de imagen.
  return upload(req, res, (error) => {

    // Comprobamos si hubo un problema.
    if (error) {
      return next(
        httpError(
          400,
          "Imagen inválida. Usa JPG, PNG o WebP, máximo 5 MB"
        )
      );
    }

    // Continuamos hacia el controlador.
    return next();
  });
}


/* =========================================================
   VALIDACIÓN DE IMÁGENES
========================================================= */

// Verificamos el contenido real del archivo recibido.
async function validateImage(file) {

  // La imagen es opcional.
  if (!file) return;

  // Comprobamos que exista contenido válido.
  if (!file.buffer?.length || file.size > MAX_IMAGE_BYTES) {
    throw httpError(
      400,
      "La imagen está vacía o supera los 5 MB"
    );
  }

  // Detectamos el tipo real a partir de sus bytes.
  const detected = await fileTypeFromBuffer(file.buffer);

  // Validamos que corresponda a un formato permitido.
  if (!ALLOWED_IMAGE_TYPES.has(detected?.mime)) {
    throw httpError(
      400,
      "La imagen debe ser JPG, PNG o WebP válido"
    );
  }
}


/* =========================================================
   LECTURA SEGURA DE DATOS
========================================================= */

// Procesamos los datos recibidos desde React.
function readEventPayload(
  req,
  { isCreate = false } = {}
) {

  // Inicialmente utilizamos el cuerpo de la solicitud.
  let payload = req.body;

  // Si recibimos multipart, los datos vienen en JSON textual.
  if (req.is("multipart/form-data")) {

    // Comprobamos que el campo data exista.
    if (typeof req.body?.data !== "string") {
      throw httpError(
        400,
        "Falta el campo 'data'"
      );
    }

    // Convertimos el texto recibido en un objeto.
    try {
      payload = JSON.parse(req.body.data);
    } catch {
      throw httpError(
        400,
        "El campo 'data' no contiene JSON válido"
      );
    }
  }

  // Rechazamos datos con una estructura incorrecta.
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

  // Recorremos las propiedades recibidas.
  for (const key of Object.keys(payload)) {

    // Solamente admitimos campos permitidos y removeImage.
    if (
      !EDITABLE_FIELDS.has(key) &&
      key !== "removeImage"
    ) {
      throw httpError(
        400,
        `El campo '${key}' no corresponde a eventos públicos`
      );
    }
  }

  // Validamos la instrucción para eliminar una portada.
  if (
    payload.removeImage !== undefined &&
    typeof payload.removeImage !== "boolean"
  ) {
    throw httpError(
      400,
      "removeImage debe ser true o false"
    );
  }

  // No se puede eliminar una imagen al crear un evento.
  if (isCreate && payload.removeImage) {
    throw httpError(
      400,
      "No existe una imagen anterior para eliminar"
    );
  }

  // Creamos un objeto con los campos autorizados.
  const fields = {};

  // Copiamos únicamente la información permitida.
  for (const key of EDITABLE_FIELDS) {

    // Solo copiamos propiedades presentes en la solicitud.
    if (Object.hasOwn(payload, key)) {
      fields[key] = payload[key];
    }
  }

  // Los campos opcionales vacíos no necesitan almacenarse.
  for (const key of [
    "endTime",
    "location",
    "meetingUrl",
  ]) {

    // Convertimos los valores vacíos a undefined.
    if (
      fields[key] === "" ||
      fields[key] === null
    ) {
      fields[key] = undefined;
    }
  }

  // Al crear, exigimos la programación recurrente.
  if (
    isCreate &&
    !Object.hasOwn(fields, "recurrence")
  ) {
    throw httpError(
      400,
      "Debes indicar la recurrencia semanal del evento"
    );
  }

  // Validamos la recurrencia cuando fue proporcionada.
  if (Object.hasOwn(fields, "recurrence")) {

    // Obtenemos la configuración de recurrencia.
    const recurrence = fields.recurrence;

    // Comprobamos que sea una recurrencia semanal válida.
    if (
      !recurrence ||
      typeof recurrence !== "object" ||
      Array.isArray(recurrence) ||
      recurrence.type !== "weekly" ||
      !Array.isArray(recurrence.daysOfWeek) ||
      recurrence.daysOfWeek.length === 0 ||
      recurrence.daysOfWeek.some(
        (day) =>
          !Number.isInteger(day) ||
          day < 0 ||
          day > 6
      ) ||
      new Set(recurrence.daysOfWeek).size !==
        recurrence.daysOfWeek.length
    ) {
      throw httpError(
        400,
        "Selecciona uno o más días semanales válidos para el evento"
      );
    }

    // Guardamos únicamente los campos necesarios.
    fields.recurrence = {
      type: "weekly",

      // Días seleccionados de la semana.
      daysOfWeek: recurrence.daysOfWeek,

      // Fecha final opcional de la programación.
      ...(recurrence.endDate
        ? { endDate: recurrence.endDate }
        : {}),
    };
  }

  // Validamos el estado de publicación recibido.
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

  // Entregamos los datos autorizados.
  return {
    fields,
    removeImage: payload.removeImage === true,
  };
}


/* =========================================================
   SERIALIZACIÓN DE EVENTOS
========================================================= */

// Preparamos los datos que recibirá React.
function serializeEvent(event) {

  // Convertimos el documento a un objeto público.
  return {

    // Identificador del evento.
    id: String(event._id),

    // Información principal.
    title: event.title,
    category: event.category,
    description: event.description,

    // Programación y horarios.
    date: event.date,
    time: event.time,
    endTime: event.endTime,

    // Reutilizamos la zona horaria definida en Event.js.
    timezone: EVENT_TIME_ZONE,

    // Información de ubicación y modalidad.
    modality: event.modality,
    location: event.location,
    meetingUrl: event.meetingUrl,

    // Programación semanal.
    recurrence: event.recurrence,

    // Estado de publicación.
    publicationStatus: event.publicationStatus,

    // Imagen opcional sin exponer su publicId.
    image: event.image?.url
      ? {
          url: event.image.url,
          alt: `Imagen de ${event.title}`,
        }
      : null,

    // Fechas utilizadas por el historial administrativo.
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  };
}


/* =========================================================
   SUBIR IMÁGENES A CLOUDINARY
========================================================= */

// Subimos una portada a Cloudinary.
async function uploadImage(file) {

  // Envolvemos upload_stream en una promesa.
  return new Promise((resolve, reject) => {

    // Creamos el flujo de subida.
    const stream = cloudinary.uploader.upload_stream(
      {

        // Carpeta exclusiva de eventos públicos.
        folder: "el-ancla/eventos/imagenes",

        // Identificador aleatorio para evitar colisiones.
        public_id: randomUUID(),

        // El archivo es una imagen.
        resource_type: "image",

        // No reemplazamos archivos con el mismo identificador.
        overwrite: false,
      },

      // Procesamos la respuesta de Cloudinary.
      (error, result) => {

        // Rechazamos la operación si ocurre un error.
        if (error) return reject(error);

        // Comprobamos que la subida tenga datos válidos.
        if (
          !result?.secure_url ||
          !result?.public_id
        ) {
          return reject(
            new Error(
              "Cloudinary no devolvió la imagen subida"
            )
          );
        }

        // Guardamos únicamente la URL y el identificador.
        return resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    // Enviamos el contenido binario de la imagen.
    stream.end(file.buffer);
  });
}


/* =========================================================
   ELIMINACIÓN DE IMÁGENES
========================================================= */

// Elimina una portada almacenada en Cloudinary.
async function deleteImage(publicId) {

  // Si no existe identificador, terminamos.
  if (!publicId) return;

  // Solicitamos la eliminación.
  const result = await cloudinary.uploader.destroy(
    publicId,
    {
      resource_type: "image",
      invalidate: true,
    }
  );

  // Consideramos correcto un borrado previo.
  if (
    !["ok", "not found"].includes(result?.result)
  ) {
    throw new Error(
      "Cloudinary no pudo eliminar la imagen"
    );
  }
}


/* =========================================================
   LIMPIEZA DE IMÁGENES TEMPORALES
========================================================= */

// Retiramos una imagen recién subida si falla MongoDB.
async function cleanupImage(publicId) {

  // No hacemos nada si no existe una imagen nueva.
  if (!publicId) return;

  try {

    // Solicitamos su eliminación.
    await deleteImage(publicId);

  } catch (error) {

    // Dejamos registro de una limpieza pendiente.
    console.error(
      "Imagen de evento pendiente de limpieza:",
      publicId,
      error.message
    );
  }
}


/* =========================================================
   TRATAMIENTO DE ERRORES
========================================================= */

// Traducimos errores del modelo antes de enviarlos a Express.
function forwardError(error, next) {

  // Las validaciones de Mongoose generan un error 400.
  if (
    ["ValidationError", "CastError"].includes(
      error?.name
    )
  ) {
    error.status = 400;
  }

  // Delegamos el error al middleware global.
  return next(error);
}


/* =========================================================
   CONSULTA PÚBLICA DE EVENTOS
   GET /api/events/public
========================================================= */

// Esta ruta puede utilizarse sin iniciar sesión.
router.get(
  "/public",

  async (req, res, next) => {

    try {

      // =====================================================
      // OBTENER FECHA ACTUAL DE CHILE
      // =====================================================

      // Extraemos el día actual utilizando la zona horaria oficial.
      const dateParts = new Intl.DateTimeFormat(
        "en-GB",
        {
          timeZone: EVENT_TIME_ZONE,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }
      ).formatToParts(new Date());

      // Función para recuperar una parte de la fecha.
      const getPart = (type) =>
        dateParts.find(
          (item) => item.type === type
        )?.value;

      // Construimos la fecha local YYYY-MM-DD.
      const today = [
        getPart("year"),
        getPart("month"),
        getPart("day"),
      ].join("-");

      // =====================================================
      // CONSULTAR EVENTOS VIGENTES
      // =====================================================

      // Obtenemos eventos publicados y no finalizados.
      const events = await Event.find({

        // Solo se muestran los eventos publicados.
        publicationStatus: "published",

        // La programación debe seguir vigente.
        $or: [

          // Eventos sin fecha final.
          // MongoDB también considera un valor null como ausente.
          {
            "recurrence.endDate": null,
          },

          // Eventos cuya fecha final es hoy o posterior.
          {
            "recurrence.endDate": {
              $gte: today,
            },
          },
        ],
      })

        // Ordenamos según su fecha de inicio y horario.
        .sort({
          date: 1,
          time: 1,
        })

        // Evitamos crear documentos Mongoose innecesarios.
        .lean();

      // Evitamos que se almacenen respuestas públicas antiguas.
      res.set(
        "Cache-Control",
        "no-store"
      );

      // Enviamos únicamente los eventos vigentes.
      return res.status(200).json({
        success: true,
        events: events.map(serializeEvent),
      });

    } catch (error) {

      // Delegamos los errores al middleware general.
      return forwardError(error, next);
    }
  }
);


/* =========================================================
   PROTECCIÓN DE RUTAS ADMINISTRATIVAS
========================================================= */

// Todas las rutas siguientes necesitan sesión y rol.
router.use(
  authenticateUser,
  authorizeRoles(...ADMIN_ROLES)
);


/* =========================================================
   LISTADO ADMINISTRATIVO DE EVENTOS
   GET /api/events/admin
========================================================= */

router.get(
  "/admin",

  async (req, res, next) => {

    try {

      // Consultamos todos los eventos, incluidos borradores.
      const events = await Event.find()

        // Mostramos primero las publicaciones más recientes.
        .sort({
          createdAt: -1,
        })

        // Mejoramos el rendimiento de la consulta.
        .lean();

      // Evitamos almacenar información administrativa en caché.
      res.set(
        "Cache-Control",
        "private, no-store"
      );

      // Devolvemos el listado completo.
      return res.status(200).json({
        success: true,
        events: events.map(serializeEvent),
      });

    } catch (error) {

      // Delegamos cualquier error.
      return forwardError(error, next);
    }
  }
);


/* =========================================================
   CREAR EVENTO RECURRENTE
   POST /api/events
========================================================= */

router.post(
  "/",

  // Protegemos la operación contra solicitudes de origen inválido.
  validateRequestOrigin,

  // Permitimos adjuntar una imagen opcional.
  receiveOptionalImage,

  async (req, res, next) => {

    // Identificador de la posible imagen nueva.
    let newImageId = null;

    // Indica si el evento quedó guardado en MongoDB.
    let saved = false;

    try {

      // Leemos únicamente los datos autorizados.
      const { fields } = readEventPayload(req, {
        isCreate: true,
      });

      // Creamos el documento del evento.
      const event = new Event({

        // Campos validados del formulario.
        ...fields,

        // El creador se obtiene desde la sesión autenticada.
        createdBy: req.user._id,
      });

      // Validamos el modelo antes de ocupar Cloudinary.
      await event.validate();

      // Comprobamos el archivo adjunto.
      await validateImage(req.file);

      // Subimos una portada solo si se seleccionó una.
      if (req.file) {

        // Subimos la imagen validada.
        const image = await uploadImage(req.file);

        // Guardamos la URL y el identificador.
        event.image = image;

        // Conservamos el ID para limpiar si MongoDB falla.
        newImageId = image.publicId;
      }

      // Guardamos el evento en MongoDB Atlas.
      await event.save();

      // Registramos que MongoDB confirmó el guardado.
      saved = true;

      // Evitamos guardar la respuesta en caché.
      res.set(
        "Cache-Control",
        "private, no-store"
      );

      // Respondemos con el evento guardado.
      return res.status(201).json({
        success: true,
        message: "Evento público creado correctamente",
        event: serializeEvent(event),
      });

    } catch (error) {

      // Si MongoDB no guardó, retiramos la imagen nueva.
      if (!saved) {
        await cleanupImage(newImageId);
      }

      // Enviamos el error al middleware general.
      return forwardError(error, next);
    }
  }
);


/* =========================================================
   CAMBIAR ESTADO DE PUBLICACIÓN
   PATCH /api/events/:id/publication
========================================================= */

router.patch(
  "/:id/publication",

  // Validamos el origen de la solicitud.
  validateRequestOrigin,

  async (req, res, next) => {

    try {

      // Comprobamos que el ID tenga formato MongoDB.
      if (
        !mongoose.isObjectIdOrHexString(
          req.params.id
        )
      ) {
        throw httpError(
          400,
          "Identificador de evento inválido"
        );
      }

      // Leemos el estado solicitado.
      const status = req.body?.publicationStatus;

      // Solo aceptamos borrador o publicado.
      if (
        !["draft", "published"].includes(status)
      ) {
        throw httpError(
          400,
          "Estado de publicación inválido"
        );
      }

      // Recuperamos el evento.
      const event = await Event.findById(
        req.params.id
      );

      // Respondemos si el evento no existe.
      if (!event) {
        throw httpError(
          404,
          "Evento no encontrado"
        );
      }

      // Actualizamos el estado.
      event.publicationStatus = status;

      // Registramos quién modificó el evento.
      event.updatedBy = req.user._id;

      // Persistimos la modificación.
      await event.save();

      // Evitamos almacenar la respuesta en caché.
      res.set(
        "Cache-Control",
        "private, no-store"
      );

      // Devolvemos la versión actualizada.
      return res.status(200).json({
        success: true,
        event: serializeEvent(event),
      });

    } catch (error) {

      // Enviamos los errores a Express.
      return forwardError(error, next);
    }
  }
);


/* =========================================================
   EDITAR EVENTO Y PORTADA
   PATCH /api/events/:id
========================================================= */

router.patch(
  "/:id",

  // Comprobamos el origen de la solicitud.
  validateRequestOrigin,

  // Procesamos una imagen opcional.
  receiveOptionalImage,

  async (req, res, next) => {

    // Identificador de la posible portada nueva.
    let newImageId = null;

    // Indica si MongoDB confirmó la edición.
    let saved = false;

    try {

      // Validamos el identificador.
      if (
        !mongoose.isObjectIdOrHexString(
          req.params.id
        )
      ) {
        throw httpError(
          400,
          "Identificador de evento inválido"
        );
      }

      // Consultamos el evento.
      // Recuperamos expresamente el publicId de Cloudinary.
      const event = await Event.findById(
        req.params.id
      ).select("+image.publicId");

      // Verificamos su existencia.
      if (!event) {
        throw httpError(
          404,
          "Evento no encontrado"
        );
      }

      // Obtenemos los campos editables.
      const {
        fields,
        removeImage,
      } = readEventPayload(req);

      // No permitimos quitar y subir una portada simultáneamente.
      if (removeImage && req.file) {
        throw httpError(
          400,
          "No puedes reemplazar y eliminar la portada al mismo tiempo"
        );
      }

      // Conservamos la referencia de la portada anterior.
      const previousImageId =
        event.image?.publicId;

      // Aplicamos los campos permitidos.
      event.set(fields);

      // Registramos al administrador que está editando.
      event.updatedBy = req.user._id;

      // Eliminamos la referencia de portada si se solicitó.
      if (removeImage) {
        event.image = undefined;
      }

      // Validamos los datos del modelo.
      await event.validate();

      // Verificamos el formato de la nueva portada.
      await validateImage(req.file);

      // Subimos una imagen nueva cuando existe.
      if (req.file) {

        // Subimos la portada validada.
        const image = await uploadImage(req.file);

        // Actualizamos su referencia.
        event.image = image;

        // Conservamos el ID para una posible limpieza.
        newImageId = image.publicId;
      }

      // Persistimos los cambios del evento.
      await event.save();

      // Confirmamos que la edición fue almacenada.
      saved = true;

      // Guardamos un posible aviso de limpieza pendiente.
      let warning = null;

      // Eliminamos la imagen anterior cuando fue reemplazada.
      if (
        previousImageId &&
        (removeImage || newImageId)
      ) {

        try {

          // Solicitamos la eliminación de la portada anterior.
          await deleteImage(previousImageId);

        } catch (error) {

          // El evento ya está guardado; informamos el problema.
          warning =
            "El evento se guardó, pero quedó pendiente limpiar la imagen anterior";

          // Registramos el identificador para soporte.
          console.error(
            "Imagen anterior pendiente:",
            previousImageId,
            error.message
          );
        }
      }

      // Evitamos almacenar datos administrativos en caché.
      res.set(
        "Cache-Control",
        "private, no-store"
      );

      // Devolvemos la edición realizada.
      return res.status(200).json({
        success: true,
        message: "Evento actualizado correctamente",

        // Incluimos advertencia solo si ocurrió un problema.
        ...(warning ? { warning } : {}),

        // Enviamos los datos actualizados.
        event: serializeEvent(event),
      });

    } catch (error) {

      // Si no se guardó, retiramos la nueva imagen.
      if (!saved) {
        await cleanupImage(newImageId);
      }

      // Delegamos el error al middleware global.
      return forwardError(error, next);
    }
  }
);


/* =========================================================
   ELIMINAR EVENTO CON AUDITORÍA
   DELETE /api/events/:id
========================================================= */

router.delete(
  "/:id",

  // Protegemos las operaciones destructivas.
  validateRequestOrigin,

  async (req, res, next) => {

    try {

      // Verificamos el formato del identificador.
      if (
        !mongoose.isObjectIdOrHexString(
          req.params.id
        )
      ) {
        throw httpError(
          400,
          "Identificador de evento inválido"
        );
      }

      // Recuperamos el evento y su identificador de imagen.
      const event = await Event.findById(
        req.params.id
      ).select("+image.publicId");

      // Comprobamos que exista.
      if (!event) {
        throw httpError(
          404,
          "Evento no encontrado"
        );
      }

      // Conservamos la referencia de su portada.
      const previousImageId =
        event.image?.publicId;

      // Eliminamos el evento dentro de una transacción.
      // El servicio también registra quién lo eliminó.
      await deleteResourceWithAudit({

        // Modelo utilizado por MongoDB.
        model: Event,

        // Identificador del evento que será eliminado.
        resourceId: event._id,

        // Diferenciamos los eventos de las actividades.
        resourceType: "event",

        // Usuario autenticado responsable.
        deletedBy: req.user._id,
      });

      // =====================================================
      // LIMPIAR IMAGEN DE CLOUDINARY
      // =====================================================

      // Las transacciones de MongoDB no incluyen Cloudinary.
      // Por eso limpiamos después de confirmar el borrado.

      // Aviso opcional para informar problemas de limpieza.
      let warning = null;

      try {

        // Eliminamos la portada antigua si existe.
        await deleteImage(previousImageId);

      } catch (error) {

        // El evento ya fue eliminado de MongoDB.
        warning =
          "Evento eliminado; queda pendiente retirar su imagen anterior";

        // Dejamos evidencia para soporte técnico.
        console.error(
          "Imagen de evento pendiente:",
          previousImageId,
          error.message
        );
      }

      // Evitamos almacenar respuestas administrativas.
      res.set(
        "Cache-Control",
        "private, no-store"
      );

      // Confirmamos el resultado de la eliminación.
      return res.status(200).json({
        success: true,
        message: "Evento eliminado correctamente",

        // Indicamos una limpieza pendiente cuando corresponda.
        ...(warning ? { warning } : {}),
      });

    } catch (error) {

      // Delegamos errores de MongoDB o auditoría.
      return forwardError(error, next);
    }
  }
);


/* =========================================================
   EXPORTACIÓN
========================================================= */

// Exportamos las rutas existentes de eventos públicos.
export default router;
