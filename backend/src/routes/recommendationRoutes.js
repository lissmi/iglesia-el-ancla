// =========================================================
// RUTAS DE RECOMENDACIONES - IGLESIA EL ANCLA
// Operaciones en un router, siguiendo eventRoutes.js y libraryRoutes.js.
// =========================================================

// Express define los endpoints públicos y administrativos.
import { Router } from "express";

// Multer recibe una portada opcional exclusivamente en memoria.
import multer from "multer";

// Verificamos la firma real del archivo (no solo su extensión).
import { fileTypeFromBuffer } from "file-type";

// Mongoose valida los identificadores antes de consultar.
import mongoose from "mongoose";

// Reutilizamos el modelo liviano de recomendaciones.
import Recommendation, {
  RECOMMENDATION_CATEGORIES,
  RECOMMENDATION_AUDIENCES,
} from "../models/Recommendation.js";

// Reutilizamos las protecciones existentes; NO se crea otra autenticación.
import authenticateUser from "../middleware/authenticateUser.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import validateRequestOrigin from "../middleware/validateRequestOrigin.js";

// Reutilizamos la conexión centralizada con Cloudinary.
import cloudinary from "../services/cloudinary/cloudinary.js";

// Construimos el router como en el resto del backend.
const router = Router();

// Solo estos roles pueden gestionar recomendaciones.
const ADMIN_ROLES = ["admin", "super_admin"];

// Una portada subida pesa como máximo 1,5 MB.
const MAX_IMAGE_BYTES = 1_500_000;

// Formatos de imagen que permitimos almacenar en Cloudinary.
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

// Campos que puede editar un administrador; las fechas e IDs nunca se aceptan.
const EDITABLE_FIELDS = new Set([
  "title", "category", "creator", "description", "reason",
  "link", "image", "audience", "status", "featured",
]);

// Multer solo recibe el campo JSON y una imagen opcional.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_IMAGE_BYTES,
    files: 1,
    fields: 1,
    parts: 2,
    fieldSize: 32 * 1024,
  },
}).single("imageFile");

// Genera un error que comprende el manejador global de app.js.
function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

// Recibe un archivo opcional, enviando fallos de Multer al manejador global.
function receiveOptionalImage(req, _res, next) {
  if (!req.is("multipart/form-data")) {
    return next(httpError(415, "Envía la recomendación como multipart/form-data"));
  }
  return upload(req, _res, (error) => {
    if (error) {
      return next(httpError(400, error.code === "LIMIT_FILE_SIZE"
        ? "La portada supera 1,5 MB"
        : "Archivo o formulario inválido"));
    }
    return next();
  });
}

// Comprueba la firma real del archivo y rechaza formatos no autorizados.
async function validateImage(file) {
  if (!file) return;
  if (!file.buffer?.length || file.size > MAX_IMAGE_BYTES) {
    throw httpError(400, "La imagen está vacía o supera 1,5 MB");
  }
  const type = await fileTypeFromBuffer(file.buffer);
  if (!IMAGE_TYPES.has(type?.mime)) {
    throw httpError(400, "La portada debe ser una imagen JPG, PNG o WebP válida");
  }
}

// Valida un enlace HTTPS sin credenciales embebidas.
function normalizeHttps(value, field) {
  if (typeof value !== "string") throw httpError(400, `${field} debe ser texto`);
  const input = value.trim();
  if (!input) return undefined;
  if (input.length > 2000) throw httpError(400, `${field} supera el máximo de caracteres`);
  try {
    const url = new URL(input);
    if (url.protocol !== "https:" || !url.hostname || url.username || url.password) {
      throw new Error("Formato no permitido");
    }
    return url.href;
  } catch {
    throw httpError(400, `${field} debe ser una URL HTTPS válida`);
  }
}

// Lee una cadena de texto con máximo de caracteres y contenido obligatorio.
function requiredText(value, field, maxLength) {
  if (typeof value !== "string") throw httpError(400, `${field} debe ser texto`);
  const result = value.trim();
  if (!result || result.length > maxLength) {
    throw httpError(400, `${field} debe tener entre 1 y ${maxLength} caracteres`);
  }
  return result;
}

// Aceptamos exclusivamente los campos del formulario publicado en React.
function readPayload(req) {
  let raw;
  try {
    raw = JSON.parse(req.body?.payload ?? "");
  } catch {
    throw httpError(400, "No se pudo leer el contenido de la recomendación");
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw httpError(400, "La recomendación debe ser un objeto");
  }
  for (const key of Object.keys(raw)) {
    if (!EDITABLE_FIELDS.has(key)) {
      throw httpError(400, `El campo '${key}' no puede modificarse`);
    }
  }
  const title = requiredText(raw.title, "Título", 160);
  const creator = requiredText(raw.creator, "Creador", 160);
  const description = requiredText(raw.description, "Descripción", 1500);
  const reason = requiredText(raw.reason, "Motivo", 1500);
  if (!RECOMMENDATION_CATEGORIES.includes(raw.category)) {
    throw httpError(400, "Selecciona una categoría válida");
  }
  if (!Array.isArray(raw.audience) || raw.audience.length === 0 ||
      raw.audience.some((item) => !RECOMMENDATION_AUDIENCES.includes(item))) {
    throw httpError(400, "Selecciona al menos un público válido");
  }
  if (!["draft", "published"].includes(raw.status)) {
    throw httpError(400, "Selecciona un estado válido");
  }
  if (typeof raw.featured !== "boolean") {
    throw httpError(400, "El indicador destacado debe ser verdadero o falso");
  }
  const link = normalizeHttps(raw.link, "Enlace recomendado");
  const image = normalizeHttps(raw.image, "Portada");
  if (raw.status === "published" && !link) {
    throw httpError(400, "Una recomendación publicada necesita un enlace externo");
  }
  return {
    title, category: raw.category, creator, description, reason,
    link, image,
    audience: [...new Set(raw.audience)],
    status: raw.status,
    featured: raw.featured,
  };
}

// Exponemos solamente los campos que consumen los componentes React.
function serialize(record) {
  return {
    id: String(record._id),
    title: record.title,
    category: record.category,
    creator: record.creator,
    description: record.description,
    reason: record.reason,
    image: record.image || "",
    link: record.link || "",
    audience: record.audience || [],
    status: record.status,
    featured: record.featured === true,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

// Sube únicamente las imágenes entregadas como archivos por el administrador.
async function uploadToCloudinary(file) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "el-ancla/recomendaciones", resource_type: "image" },
      (error, result) => error ? reject(error) : resolve(result)
    );
    stream.end(file.buffer);
  });
}

// Solo retiramos recursos que realmente subimos y cuyo ID está en MongoDB.
async function removeCloudinaryImage(publicId) {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch (error) {
    // No anulamos un guardado correcto por un fallo de limpieza externa.
    console.error("No se pudo eliminar una portada anterior de Cloudinary:", error.message);
  }
}

// =========================================================
// CATÁLOGO PÚBLICO - SOLO PUBLICACIONES
// =========================================================
router.get("/", async (_req, res, next) => {
  try {
    // La API no entrega borradores ni identificadores internos de Cloudinary.
    const items = await Recommendation.find({ status: "published" })
      .sort({ featured: -1, createdAt: -1 })
      .lean();
    return res.json({ success: true, recommendations: items.map(serialize) });
  } catch (error) {
    return next(error);
  }
});

// =========================================================
// RUTAS ADMINISTRATIVAS - SEGURIDAD COMPARTIDA
// =========================================================
router.use("/admin", authenticateUser, authorizeRoles(...ADMIN_ROLES));

// Lista borradores y publicaciones para el panel administrativo.
router.get("/admin", async (_req, res, next) => {
  try {
    const items = await Recommendation.find({}).sort({ createdAt: -1 }).lean();
    res.set("Cache-Control", "private, no-store");
    return res.json({ success: true, recommendations: items.map(serialize) });
  } catch (error) {
    return next(error);
  }
});

// Crea una recomendación: primero valida, luego sube y finalmente guarda.
router.post("/admin", validateRequestOrigin, receiveOptionalImage, async (req, res, next) => {
  let newImageId = null;
  try {
    const fields = readPayload(req);
    await validateImage(req.file);
    if (req.file) {
      const uploaded = await uploadToCloudinary(req.file);
      fields.image = uploaded.secure_url;
      newImageId = uploaded.public_id;
    }
    const created = await Recommendation.create({
      ...fields,
      ...(newImageId ? { imagePublicId: newImageId } : {}),
      createdBy: req.user._id,
    });
    return res.status(201).json({ success: true, recommendation: serialize(created) });
  } catch (error) {
    // Retiramos una subida nueva si MongoDB no confirmó su creación.
    if (newImageId) await removeCloudinaryImage(newImageId);
    return next(error);
  }
});

// Modifica una recomendación sin volver a subir imágenes si la URL no cambió.
router.put("/admin/:id", validateRequestOrigin, receiveOptionalImage, async (req, res, next) => {
  // Rechazamos IDs mal formados antes de consultar la base de datos.
  if (!mongoose.isObjectIdOrHexString(req.params.id)) {
    return next(httpError(400, "Identificador de recomendación inválido"));
  }
  let newImageId = null;
  try {
    const fields = readPayload(req);
    await validateImage(req.file);
    // Incluimos el identificador privado de la imagen que ya poseemos.
    const record = await Recommendation.findById(req.params.id).select("+imagePublicId");
    if (!record) throw httpError(404, "Recomendación no encontrada");
    const previousPublicId = record.imagePublicId;
    if (req.file) {
      const uploaded = await uploadToCloudinary(req.file);
      fields.image = uploaded.secure_url;
      newImageId = uploaded.public_id;
    }
    // Conservamos el ID privado solo si el usuario mantuvo esa misma portada.
    const keepPrevious = !req.file && (fields.image || "") === (record.image || "");
    record.set({
      ...fields,
      imagePublicId: newImageId || (keepPrevious ? previousPublicId : undefined),
      updatedBy: req.user._id,
    });
    await record.save();
    // Limpiamos Cloudinary después del guardado, nunca antes.
    if (!keepPrevious && previousPublicId) await removeCloudinaryImage(previousPublicId);
    return res.json({ success: true, recommendation: serialize(record) });
  } catch (error) {
    // No dejamos portadas huérfanas cuando falla la actualización.
    if (newImageId) await removeCloudinaryImage(newImageId);
    return next(error);
  }
});

// Elimina la recomendación y retira su portada propia (no portadas externas).
router.delete("/admin/:id", validateRequestOrigin, async (req, res, next) => {
  if (!mongoose.isObjectIdOrHexString(req.params.id)) {
    return next(httpError(400, "Identificador de recomendación inválido"));
  }
  try {
    // Recuperamos el ID privado que solo conoce el backend.
    const record = await Recommendation.findByIdAndDelete(req.params.id).select("+imagePublicId");
    if (!record) throw httpError(404, "Recomendación no encontrada");
    // Cloudinary solo se limpia cuando el recurso fue subido por nosotros.
    await removeCloudinaryImage(record.imagePublicId);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

// Exportamos el router para registrarlo en app.js junto al resto de módulos.
export default router;
