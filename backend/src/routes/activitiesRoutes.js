
// =========================================================
// RUTAS DE ACTIVIDADES - PWA IGLESIA EL ANCLA
// MongoDB Atlas + Cloudinary + roles y cookies HttpOnly
// activitiesRoutes.js
// =========================================================

// Importamos las dependencias que ya utiliza el proyecto.
import { Router } from "express";
import multer from "multer";
import { fileTypeFromBuffer } from "file-type";
import { randomUUID } from "node:crypto";
import mongoose from "mongoose";

// Reutilizamos modelo, autenticación y Cloudinary existentes.
import Activity, { ACTIVITY_TIME_ZONE } from "../models/Activity.js";

// Gestionamos las confirmaciones individuales sin duplicarlas en Activity.
import ActivityConfirmation from "../models/ActivityConfirmation.js";
import activityAttendanceRoutes from "./activityAttendanceRoutes.js";
// Notificamos novedades reales sin exponer datos de actividades en pantalla bloqueada.
import { announceCommunityChange } from "../services/push/automaticPushService.js";
import authenticateUser from "../middleware/authenticateUser.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import validateRequestOrigin from "../middleware/validateRequestOrigin.js";
import cloudinary from "../services/cloudinary/cloudinary.js";

// Registramos toda eliminación completa en el historial global.
import { deleteResourceWithAudit } from "../services/audit/deletionService.js";

// Separamos todas las rutas en un Router de Express.
const router = Router();

// Definimos los roles que pueden administrar las actividades.
const adminRoles = ["admin", "super_admin"];

// Definimos los roles que pueden consultar actividades internas.
const memberRoles = ["member", "admin", "super_admin"];

// Admitimos una imagen opcional de hasta cinco mebibytes.
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

// Lista cerrada de formatos de imagen permitidos.
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

// Lista cerrada de campos editables desde el formulario.
// Nunca aceptamos createdBy, updatedBy ni los metadatos internos de Cloudinary.
const WRITABLE_FIELDS = [
  "title",
  "description",
  "category",
  "date",
  "time",
  "endTime",
  "modality",
  "location",
  "meetingUrl",
  "requiresConfirmation",
  "capacity",
  "cooperation",
  "publicationStatus",
];

// Multer mantiene el archivo temporalmente en RAM, no en disco.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_IMAGE_BYTES, // Tamaño máximo por imagen.
    files: 1, // Un archivo como máximo.
    fields: 1, // Un campo JSON llamado "data".
    parts: 2, // Máximo: JSON + imagen.
    fieldSize: 32 * 1024, // JSON de hasta 32 KiB.
  },
}).single("image");

// Recibimos imágenes opcionales sin romper solicitudes JSON.
function receiveOptionalImage(req, res, next) {
  // Multer solo debe interpretar formularios multipart.
  if (!req.is("multipart/form-data")) return next();

  // Procesamos una imagen cuyo campo se llama "image".
  return upload(req, res, (error) => {
    // Devolvemos un error controlado ante límites o campos inválidos.
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Imagen inválida. Usa JPG, PNG o WebP (máximo 5 MB).",
      });
    }

    // Continuamos hacia la validación del contenido.
    return next();
  });
}

// Creamos errores HTTP con códigos de respuesta específicos.
function httpError(status, message) {
  // Express leerá el código en el manejador de errores.
  const error = new Error(message);
  error.status = status;
  return error;
}

// Extraemos el JSON del formulario, sin confiar en campos privados.
function readActivityPayload(req) {
  // En formularios multipart "data" contiene un JSON serializado.
  let payload = req.body;

  // Los campos del multipart se interpretan después de Multer.
  if (req.is("multipart/form-data")) {
    // Exigimos que la información se envíe en un único campo.
    if (typeof req.body?.data !== "string") {
      throw httpError(400, "Falta el campo 'data' del formulario");
    }

    // Convertimos el JSON textual a un objeto JavaScript.
    try {
      payload = JSON.parse(req.body.data);
    } catch {
      throw httpError(400, "El campo 'data' no contiene un JSON válido");
    }
  }

  // Rechazamos valores nulos, arrays u otros formatos.
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw httpError(400, "Los datos de la actividad deben ser un objeto JSON");
  }

  // Los eventos recurrentes y las publicaciones públicas son otro módulo.
  // Rechazamos explícitamente campos antiguos, en lugar de ignorarlos.
  if (Object.hasOwn(payload, "recurrence") || Object.hasOwn(payload, "visibility")) {
    throw httpError(400, "Las actividades no admiten recurrencia ni visibilidad pública");
  }

  // Validamos la intención de quitar una imagen existente.
  if (payload.removeImage !== undefined && typeof payload.removeImage !== "boolean") {
    throw httpError(400, "removeImage debe ser true o false");
  }

  // Copiamos únicamente los campos permitidos por el servidor.
  const fields = {};
  for (const key of WRITABLE_FIELDS) {
    if (Object.hasOwn(payload, key)) fields[key] = payload[key];
  }

  // No almacenamos campos opcionales vacíos que vienen desde React.
  for (const key of ["endTime", "location", "meetingUrl"]) {
    if (fields[key] === "" || fields[key] === null) fields[key] = undefined;
  }

  // Normalizamos solo las opciones permitidas: nunca aceptamos referencias a usuarios.
  if (fields.cooperation !== undefined) {
    const value = fields.cooperation;
    if (!value || typeof value !== "object" || Array.isArray(value) ||
        typeof value.enabled !== "boolean" ||
        (value.enabled && !Array.isArray(value.items))) {
      throw httpError(400, "La configuración de cooperación no es válida");
    }
    if (value.enabled) {
      if (value.items.length < 1 || value.items.length > 20) {
        throw httpError(400, "Define entre 1 y 20 aportes");
      }
      fields.cooperation = {
        enabled: true,
        items: value.items.map((item) => {
          if (!item || typeof item.name !== "string" ||
              !Number.isInteger(item.maxQuantity) ||
              item.maxQuantity < 1 || item.maxQuantity > 500 ||
              item.name.trim().length < 2 || item.name.trim().length > 60) {
            throw httpError(400, "Cada aporte requiere nombre y cupo válido");
          }
          if (item.id !== undefined && !mongoose.isObjectIdOrHexString(item.id)) {
            throw httpError(400, "Identificador de aporte inválido");
          }
          return { ...(item.id ? { _id: item.id } : {}),
            name: item.name.trim(), maxQuantity: item.maxQuantity };
        }),
      };
    } else {
      fields.cooperation = { enabled: false };
    }
  }

  // Una capacidad ilimitada no necesita un campo con valor null.
  if (fields.capacity === null || fields.capacity === "") fields.capacity = undefined;

  // Si la actividad deja de requerir confirmaciones, el límite deja de aplicarse.
  if (fields.requiresConfirmation === false) fields.capacity = undefined;

  // Devolvemos los datos filtrados y la petición de eliminación.
  return { fields, removeImage: payload.removeImage === true };
}

// Verificamos el contenido real del archivo, no solo su extensión.
async function validateActivityImage(file) {
  // Una actividad puede no tener imagen; entonces no validamos nada.
  if (!file) return null;

  // El archivo no puede estar vacío ni superar el límite.
  if (!file.buffer?.length || file.size > MAX_IMAGE_BYTES) {
    throw httpError(400, "La imagen está vacía o supera los 5 MB");
  }

  // Detectamos el formato real a partir de la firma binaria.
  const detected = await fileTypeFromBuffer(file.buffer);

  // Permitimos exclusivamente los formatos declarados.
  if (!ALLOWED_MIME_TYPES.has(detected?.mime)) {
    throw httpError(400, "La imagen debe ser JPG, PNG o WebP válido");
  }

  // La firma del archivo es válida; no guardamos su formato en MongoDB.
  return true;
}

// Subimos una imagen validada a una carpeta propia de Cloudinary.
function uploadActivityImage(file) {
  // upload_stream permite recibir bytes directamente desde RAM.
  return new Promise((resolve, reject) => {
    // Creamos una imagen con un identificador aleatorio único.
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "el-ancla/actividades/imagenes",
        public_id: randomUUID(),
        resource_type: "image",
        overwrite: false,
      },
      (error, result) => {
        // Si Cloudinary falla, no debemos guardar un enlace falso.
        if (error) return reject(error);
        if (!result?.secure_url || !result?.public_id) {
          return reject(new Error("Cloudinary no devolvió la imagen"));
        }

        // Guardamos solamente URL e identificador de Cloudinary.
        return resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    // Entregamos los bytes del archivo al flujo de Cloudinary.
    stream.end(file.buffer);
  });
}

// Eliminamos imágenes antiguas usando el identificador guardado en BD.
async function deleteCloudinaryImage(publicId) {
  // Si la actividad no tiene imagen, no hacemos ninguna petición.
  if (!publicId) return;

  // Solicitamos la eliminación y la invalidación de caché.
  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
    invalidate: true,
  });

  // Si ya no existe, consideramos correcta la limpieza.
  if (!["ok", "not found"].includes(result?.result)) {
    throw httpError(502, "Cloudinary no pudo eliminar la imagen");
  }
}

// Intentamos limpiar subidas fallidas sin ocultar el error principal.
async function cleanupNewImage(publicId) {
  // Una creación sin imagen no necesita limpieza.
  if (!publicId) return;
  try {
    await deleteCloudinaryImage(publicId);
  } catch (error) {
    // Este registro ayuda a detectar archivos pendientes de limpieza.
    console.error("Limpieza pendiente de imagen de actividad:", publicId, error.message);
  }
}

// Preparamos una respuesta segura sin enviar publicId al navegador.
function serializeActivity(activity) {
  // Funciona tanto con documentos Mongoose como con objetos lean().
  return {
    id: String(activity._id),
    title: activity.title,
    category: activity.category,
    description: activity.description,
    date: activity.date,
    time: activity.time,
    endTime: activity.endTime,
    // La zona horaria oficial se comparte; no se duplica por documento.
    timezone: ACTIVITY_TIME_ZONE,
    modality: activity.modality,
    location: activity.location,
    meetingUrl: activity.meetingUrl,
    requiresConfirmation: activity.requiresConfirmation,
    capacity: activity.capacity,
    // No enviamos documentos Mongoose completos al navegador.
    cooperation: {
      enabled: Boolean(activity.cooperation?.enabled),
      items: activity.cooperation?.enabled
        ? (activity.cooperation.items || []).map((item) => ({
            id: String(item._id), name: item.name, maxQuantity: item.maxQuantity,
          }))
        : [],
    },
    publicationStatus: activity.publicationStatus,
    // El contador se calcula en /attendance/admin-summary, no se duplica en Atlas.
    confirmations: 0,
    image: activity.image?.url ? {
      url: activity.image.url,
      // El texto alternativo se calcula sin guardarlo en MongoDB.
      alt: `Imagen de ${activity.title}`,
    } : null,
    createdAt: activity.createdAt,
    updatedAt: activity.updatedAt,
  };
}

// Traducimos errores de datos a respuestas 400, sin filtrar secretos.
function sendError(error, next) {
  // Mongoose usa ValidationError para campos obligatorios o inválidos.
  if (error?.name === "ValidationError" || error?.name === "CastError") {
    error.status = 400;
  }
  // Delegamos los demás errores al manejador global de app.js.
  return next(error);
}

// Las actividades son exclusivas del área de miembros: no hay endpoint público.
// Todas las rutas requieren sesión válida mediante cookie HttpOnly.
router.use(authenticateUser);

// =========================================================
// GET /api/activities/member - ACTIVIDADES PARA MIEMBROS
// =========================================================
router.get("/member", authorizeRoles(...memberRoles), async (req, res, next) => {
  try {
    // Los miembros ven actividades internas que estén publicadas.
    const activities = await Activity.find({ publicationStatus: "published" })
      .sort({ date: 1, time: 1 }).lean();

    // No almacenamos en cachés compartidas datos de miembros.
    res.set("Cache-Control", "private, no-store");
    return res.json({ success: true, activities: activities.map(serializeActivity) });
  } catch (error) {
    return sendError(error, next);
  }
});

// =========================================================
// GET /api/activities/admin - LISTADO COMPLETO ADMINISTRATIVO
// =========================================================
router.get("/admin", authorizeRoles(...adminRoles), async (req, res, next) => {
  try {
    // Administración puede consultar borradores y publicados.
    const activities = await Activity.find().sort({ date: -1, time: 1 }).lean();

    // Los datos administrativos no deben quedar en cachés compartidas.
    res.set("Cache-Control", "private, no-store");
    return res.json({ success: true, activities: activities.map(serializeActivity) });
  } catch (error) {
    return sendError(error, next);
  }
});

// =========================================================
// POST /api/activities - CREAR ACTIVIDAD CON IMAGEN OPCIONAL
// =========================================================
router.post(
  "/",
  authorizeRoles(...adminRoles),
  validateRequestOrigin,
  receiveOptionalImage,
  async (req, res, next) => {
    // Conservamos el ID de una imagen nueva para revertir fallos.
    let uploadedId = null;
    let saved = false;

    try {
      // Solo procesamos los campos del formulario autorizados.
      const { fields, removeImage } = readActivityPayload(req);

      // En creación no hay ninguna imagen anterior que eliminar.
      if (removeImage) throw httpError(400, "No hay imagen anterior que eliminar");

      // Construimos el documento con autor identificado por la sesión.
      const activity = new Activity({ ...fields, createdBy: req.user._id });

      // Validamos la actividad ANTES de ocupar espacio en Cloudinary.
      await activity.validate();

      // Confirmamos que la imagen adjunta es de un formato auténtico.
      await validateActivityImage(req.file);

      // Solo subimos un archivo si el administrador adjuntó uno.
      if (req.file) {
        const image = await uploadActivityImage(req.file);
        uploadedId = image.publicId;
        activity.image = image;
      }

      // Guardamos la actividad y la URL de Cloudinary en MongoDB Atlas.
      await activity.save();
      saved = true;

      // Una actividad publicada desde su creación es una novedad real.
      // El error de push no debe anular una publicación ya guardada.
      if (activity.publicationStatus === "published") {
        try { await announceCommunityChange("activity"); }
        catch (error) { console.error("Aviso de nueva actividad no enviado:", error.message); }
      }

      // Devolvemos la actividad creada sin el identificador privado de imagen.
      res.set("Cache-Control", "private, no-store");
      return res.status(201).json({
        success: true,
        message: "Actividad creada correctamente",
        activity: serializeActivity(activity),
      });
    } catch (error) {
      // Si no se guardó en MongoDB, intentamos eliminar la subida nueva.
      if (!saved) await cleanupNewImage(uploadedId);
      return sendError(error, next);
    }
  }
);

// =========================================================
// PATCH /api/activities/:id/publication - PUBLICAR / BORRADOR
// =========================================================
router.patch(
  "/:id/publication",
  authorizeRoles(...adminRoles),
  validateRequestOrigin,
  async (req, res, next) => {
    try {
      // Rechazamos identificadores de MongoDB mal formados.
      if (!mongoose.isObjectIdOrHexString(req.params.id)) {
        throw httpError(400, "Identificador de actividad inválido");
      }

      // Solo admitimos los estados contemplados en el modelo.
      const status = req.body?.publicationStatus;
      if (!["draft", "published"].includes(status)) {
        throw httpError(400, "Estado de publicación inválido");
      }

      // Recuperamos la actividad para mantener la validación de Mongoose.
      const activity = await Activity.findById(req.params.id);
      if (!activity) throw httpError(404, "Actividad no encontrada");

      // Conservamos el estado anterior para avisar solo al publicar de verdad.
      const wasPublished = activity.publicationStatus === "published";
      // Guardamos la transición y la identidad de quien la efectuó.
      activity.publicationStatus = status;
      activity.updatedBy = req.user._id;
      await activity.save();
      if (!wasPublished && status === "published") {
        try { await announceCommunityChange("activity"); }
        catch (error) { console.error("Aviso de publicación no enviado:", error.message); }
      }

      // Respondemos sin exponer el identificador privado de Cloudinary.
      res.set("Cache-Control", "private, no-store");
      return res.json({ success: true, activity: serializeActivity(activity) });
    } catch (error) {
      return sendError(error, next);
    }
  }
);

// =========================================================
// PATCH /api/activities/:id - ACTUALIZAR ACTIVIDAD E IMAGEN
// =========================================================
router.patch(
  "/:id",
  authorizeRoles(...adminRoles),
  validateRequestOrigin,
  receiveOptionalImage,
  async (req, res, next) => {
    // Registramos los IDs para poder limpiar archivos temporales.
    let uploadedId = null;
    let saved = false;

    try {
      // Validamos el ID antes de consultar la base de datos.
      if (!mongoose.isObjectIdOrHexString(req.params.id)) {
        throw httpError(400, "Identificador de actividad inválido");
      }

      // Obtenemos el publicId privado solo para operaciones internas.
      const activity = await Activity.findById(req.params.id).select("+image.publicId");
      if (!activity) throw httpError(404, "Actividad no encontrada");

      // Leemos exclusivamente los campos editables.
      const { fields, removeImage } = readActivityPayload(req);
      // Solo avisamos cambios de calendario, no cada edición de texto.
      const previousSchedule = `${activity.date}|${activity.time}|${activity.publicationStatus}`;

      // No se permite subir y quitar la imagen al mismo tiempo.
      if (removeImage && req.file) {
        throw httpError(400, "No puedes adjuntar y eliminar una imagen a la vez");
      }

      // Conservamos la referencia antigua para borrar después del guardado.
      const oldImageId = activity.image?.publicId || null;

      // Evitamos invalidar registros de asistencia por cambios estructurales.
      // Más adelante podremos ofrecer reasignación/cancelación administrativa.
      const hasConfirmations = await ActivityConfirmation.exists({ activity: activity._id });
      if (hasConfirmations) {
        // Una confirmación existente no debe quedar en una fecha/hora diferente.
        const dateChanged = fields.date !== undefined && fields.date !== activity.date;
        const timeChanged = fields.time !== undefined && fields.time !== activity.time;
        const endTimeChanged = fields.endTime !== undefined && fields.endTime !== activity.endTime;
        const confirmationDisabled = fields.requiresConfirmation === false;
        if (dateChanged || timeChanged || endTimeChanged || confirmationDisabled) {
          throw httpError(409, "La actividad tiene confirmaciones: no puedes cambiar su fecha, horario ni desactivar la asistencia");
        }
        if (fields.capacity !== undefined) {
          const currentTotal = await ActivityConfirmation.countDocuments({ activity: activity._id });
          if (fields.capacity && currentTotal > fields.capacity) {
            throw httpError(409, "La capacidad es inferior a las confirmaciones existentes");
          }
        }
      }

      // Protegemos aportes comprometidos al editar opciones o sus cupos.
      if (fields.cooperation !== undefined) {
        const existingReservations = await ActivityConfirmation.aggregate([
          { $match: { activity: activity._id } },
          { $unwind: "$contributions" },
          { $group: { _id: "$contributions.itemId", total: { $sum: "$contributions.quantity" } } },
        ]);
        const nextItems = new Map(
          (fields.cooperation.enabled ? fields.cooperation.items : [])
            .filter((item) => item._id)
            .map((item) => [String(item._id), item.maxQuantity])
        );
        const currentIds = new Set(
          (activity.cooperation?.items || []).map((item) => String(item._id))
        );
        // Evitamos que el cliente reutilice el ID de un aporte de otra actividad.
        for (const item of (fields.cooperation.items || [])) {
          if (item._id && !currentIds.has(String(item._id))) {
            throw httpError(400, "La opción de cooperación no pertenece a esta actividad");
          }
        }
        for (const row of existingReservations) {
          if (!nextItems.has(String(row._id)) || nextItems.get(String(row._id)) < row.total) {
            throw httpError(409, "No puedes quitar un aporte ni reducir su cupo mientras tenga reservas");
          }
        }
      }

      // Aplicamos las modificaciones de texto y configuración autorizadas.
      activity.set(fields);
      activity.updatedBy = req.user._id;

      // Retiramos la imagen solo cuando se solicitó expresamente.
      if (removeImage) activity.image = undefined;

      // Validamos la información antes de subir la nueva imagen.
      await activity.validate();
      await validateActivityImage(req.file);

      // Si llegó un archivo nuevo, lo subimos sin eliminar el anterior aún.
      if (req.file) {
        const image = await uploadActivityImage(req.file);
        uploadedId = image.publicId;
        activity.image = image;
      }

      // Persistimos todos los cambios primero en MongoDB.
      await activity.save();
      saved = true;

      const newSchedule = `${activity.date}|${activity.time}|${activity.publicationStatus}`;
      if (activity.publicationStatus === "published" && previousSchedule !== newSchedule) {
        try { await announceCommunityChange("activityChange"); }
        catch (error) { console.error("Aviso de cambio de actividad no enviado:", error.message); }
      }

      // Eliminamos la imagen anterior solo después de guardar el reemplazo.
      let warning = null;
      if (oldImageId && (removeImage || uploadedId)) {
        try {
          await deleteCloudinaryImage(oldImageId);
        } catch (error) {
          // La edición ya está guardada; informamos limpieza pendiente.
          warning = "La actividad se guardó, pero falta limpiar la imagen anterior";
          console.error("Imagen antigua pendiente:", oldImageId, error.message);
        }
      }

      // Devolvemos el estado final dla actividad.
      res.set("Cache-Control", "private, no-store");
      return res.json({
        success: true,
        message: "Actividad actualizada correctamente",
        ...(warning ? { warning } : {}),
        activity: serializeActivity(activity),
      });
    } catch (error) {
      // Nunca eliminamos la imagen antigua si MongoDB no pudo guardar.
      if (!saved) await cleanupNewImage(uploadedId);
      return sendError(error, next);
    }
  }
);

// =========================================================
// DELETE /api/activities/:id - ELIMINAR ACTIVIDAD
// =========================================================
router.delete(
  "/:id",
  authorizeRoles(...adminRoles),
  validateRequestOrigin,
  async (req, res, next) => {
    try {
      // Rechazamos identificadores mal formados.
      if (!mongoose.isObjectIdOrHexString(req.params.id)) {
        throw httpError(400, "Identificador de actividad inválido");
      }

      // Leemos el identificador de la imagen antes de borrar el registro.
      const activity = await Activity.findById(req.params.id).select("+image.publicId");
      if (!activity) throw httpError(404, "Actividad no encontrada");

      // Eliminamos primero Cloudinary; si falla, conservamos el registro.
      await deleteCloudinaryImage(activity.image?.publicId);

      // MongoDB elimina la actividad y guarda su historial en una transacción.
      // Si falla la auditoría, se revierte también el borrado de MongoDB.
      await deleteResourceWithAudit({
        model: Activity,
        resourceId: activity._id,
        resourceType: "activity",
        deletedBy: req.user?._id || req.user?.id,
        // Eliminamos también inscripciones huérfanas en la transacción.
        onDelete: async ({ session, deleted }) => {
          await ActivityConfirmation.deleteMany({ activity: deleted._id }).session(session);
        },
      });

      // Evitamos cachés con datos administrativos eliminados.
      res.set("Cache-Control", "private, no-store");
      return res.json({ success: true, message: "Actividad eliminada correctamente" });
    } catch (error) {
      return sendError(error, next);
    }
  }
);

// Montamos la API de asistencia dentro del mismo módulo y sesión.
router.use(activityAttendanceRoutes);

// Exportamos las rutas para montarlas en app.js.
export default router;
