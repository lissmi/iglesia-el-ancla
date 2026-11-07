// =========================================================
// EDICIÓN DE LOS RECURSOS BÍBLICOS - IGLESIA EL ANCLA
// =========================================================
// No agregamos controllers: la lógica pequeña vive en este router.
// MongoDB almacena solo ediciones y recursos nuevos, no todos los originales.
import { Router } from "express";
import multer from "multer";
import { fileTypeFromBuffer } from "file-type";
import JSZip from "jszip";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { createHash, randomUUID } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import rateLimit from "express-rate-limit";
import { createDiscipleshipPdf } from "../services/resources/discipleshipPdf.js";
import { createPrayerGuidePdf } from "../services/resources/prayerGuidePdf.js";
import { setTimeout as wait } from "node:timers/promises";
import { getGoogleDriveClient } from "../services/drive/googleDrive.js";
import ResourceContent, { RESOURCE_CONTENT_SECTIONS } from "../models/ResourceContent.js";
import authenticateUser from "../middleware/authenticateUser.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import validateRequestOrigin from "../middleware/validateRequestOrigin.js";

const router = Router();
const SECTIONS = new Set(RESOURCE_CONTENT_SECTIONS);
const adminOnly = authorizeRoles("admin", "super_admin");
const MAX_BYTES = 60 * 1024;
const MAX_FILE_BYTES = 4 * 1024 * 1024;
// Un estudio puede ser extenso, pero nunca ilimitado: 512 KiB por TXT.
// Este límite también evita que una solicitud consuma memoria sin control.
const MAX_DISCIPLESHIP_BYTES = 512 * 1024;
// Las guías extensas reutilizan el mismo límite seguro para los TXT.
const MAX_PRAYER_GUIDE_BYTES = MAX_DISCIPLESHIP_BYTES;
const DISCIPLESHIP_LEVELS = new Set(["Inicial", "Intermedio", "Avanzado"]);
const DISCIPLESHIP_CATEGORIES = new Set([
  "Fundamentos de la fe", "Biblia", "Oración", "Carácter cristiano",
  "Servicio", "Vida cristiana",
]);
// Conservamos los materiales originales y validamos por campo sin
// imponer límites pequeños a los párrafos de las lecciones.
const DISCIPLESHIP_LIMITS = Object.freeze({
  title: 50, category: 60, summary: 180, description: 1500,
  objectives: 300, topics: 80, reference: 90, text: 1500,
  paragraphs: 6000, reflection: 1200, reflectionQuestions: 600, steps: 450,
});
const DISCIPLESHIP_LIST_LIMITS = Object.freeze({
  content: 40, description: 12, objectives: 30, topics: 30,
  paragraphs: 30, reflectionQuestions: 30, steps: 30,
});
// Campos cortos para tarjetas; el cuerpo completo se almacena en TXT privado.
const PRAYER_GUIDE_LIMITS = Object.freeze({
  title: 80, summary: 240, description: 6000,
  reference: 120, text: 1500, prayerPoints: 1200, samplePrayer: 10000,
});
const MAX_PRAYER_PARAGRAPHS = 20;
const MAX_PRAYER_POINTS = 40;
const DOWNLOAD_LIMITS = Object.freeze({ title: 50, includedContent: 200, description: 300 });
// Los estudios solo pueden clasificarse en estos tres niveles.
const STUDY_LEVELS = new Set(["Inicial", "Intermedio", "Avanzado"]);
// Mantener sincronizados con los límites visibles en el formulario devocional.
const DEVOTIONAL_LIMITS = Object.freeze({
  title: 50, summary: 120, description: 400, tips: 120, reminder: 180,
});
const MAX_DEVOTIONAL_TIPS = 8;
const MAX_DEVOTIONAL_STEPS = 999;
const BUILTIN_DEVOTIONAL_STEPS = 7;
// Preguntas frecuentes: no se generan archivos externos para este contenido.
const FAQ_LIMITS = Object.freeze({ question: 80, answer: 200, highlightedInfo: 250 });
const MAX_FAQ_ANSWERS = 5;
// Las categorías disponibles corresponden al catálogo inicial de la iglesia.
const FAQ_CATEGORIES = new Set([
  "Horarios y reuniones", "Primera visita", "Actividades y talleres",
  "Reuniones online", "Niños y familia", "Contacto y ayuda", "Participación",
]);
// Las categorías de descargables son las que ya existen en el catálogo inicial.
const DOWNLOAD_CATEGORIES = new Set([
  "Devocional", "Discipulado", "Estudio bíblico", "Evangelismo",
  "Familia", "Lectura bíblica", "Oración",
]);
const bad = (message, status = 400) => Object.assign(new Error(message), { status });
const safeKey = (value) => typeof value === "string" && /^[a-zA-Z0-9_-]{1,100}$/.test(value);
const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

// Reutilizamos la cuenta OAuth existente; solo añadimos una carpeta para documentos educativos.
function resourcesFolderId() {
  const id = process.env.GOOGLE_DRIVE_RESOURCES_FOLDER_ID;
  if (!id) throw bad("No se configuró la carpeta de recursos en Google Drive", 503);
  return id;
}

function readableName(value) {
  return (String(value || "Material").replace(/[\\/:*?"<>|]/g, "").replace(/\p{Cc}/gu, "").trim().slice(0, 95) || "Material");
}

// El mismo flujo sirve para PDF y documentos de Word; no calculamos páginas ni tamaño.
const DOCUMENT_TYPES = Object.freeze({
  pdf: { mime: "application/pdf", extension: "pdf" },
  doc: { mime: "application/msword", extension: "doc" },
  docx: { mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", extension: "docx" },
});

// Identificamos archivos por su contenido, no por el nombre elegido en el navegador.
async function inspectDocument(file) {
  if (!file?.buffer || file.size < 100 || file.size > MAX_FILE_BYTES) {
    throw bad("El archivo debe ser PDF o Word y pesar como máximo 4 MB");
  }
  const extension = file.originalname?.split(".").pop()?.toLowerCase();
  if (!DOCUMENT_TYPES[extension]) throw bad("Selecciona un archivo PDF, DOC o DOCX");
  const detected = await fileTypeFromBuffer(file.buffer);
  const header = file.buffer;
  if (extension === "pdf") {
    if (detected?.mime !== "application/pdf" || header.subarray(0, 5).toString() !== "%PDF-") {
      throw bad("El archivo seleccionado no es un PDF válido");
    }
  } else if (extension === "docx") {
    // DOCX es un paquete ZIP con una estructura interna específica de Word.
    if (!["application/zip", DOCUMENT_TYPES.docx.mime].includes(detected?.mime)) {
      throw bad("El documento Word no tiene un formato válido");
    }
    try {
      const zip = await JSZip.loadAsync(header, { checkCRC32: false });
      if (!zip.file("[Content_Types].xml") || !zip.file("word/document.xml")) {
        throw new Error("No se encontraron los componentes de Word");
      }
    } catch {
      throw bad("No pudimos abrir el documento DOCX. Revisa que no esté dañado");
    }
  } else {
    // DOC antiguo utiliza contenedor OLE; exigimos también su flujo WordDocument.
    const oleSignature = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
    if (!header.subarray(0, 8).equals(oleSignature) ||
        header.indexOf(Buffer.from("WordDocument", "utf16le")) < 0) {
      throw bad("El archivo no corresponde a un documento Word (.doc)");
    }
  }
  return { format: extension, mime: DOCUMENT_TYPES[extension].mime };
}

// Drive puede responder 429/5xx de forma temporal. Reintentamos solamente
// esos errores; si persisten, los dejamos registrados para la auditoría.
async function removeDriveFile(fileId) {
  if (!fileId) return;
  const drive = getGoogleDriveClient();
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await drive.files.delete({ fileId });
      return;
    } catch (error) {
      const status = Number(error?.response?.status || error?.code);
      // El archivo ya eliminado es un resultado correcto.
      if (status === 404) return;
      const recoverable = [429, 500, 502, 503, 504].includes(status) ||
        ["ETIMEDOUT", "ECONNRESET"].includes(error?.code);
      if (!recoverable || attempt === 2) throw error;
      await wait([200, 600, 1200][attempt]);
    }
  }
}

// Antes de volver a subir un PDF o Word comprobamos si ya existe exactamente
// el mismo documento en el borrador o la versión publicada del MISMO recurso.
// Drive calcula md5Checksum para los binarios. Comprobamos además tamaño,
// formato, carpeta y estado para no aceptar un archivo ajeno o eliminado.
async function findExistingDocument(file, attachment, existing) {
  const checksum = createHash("md5").update(file.buffer).digest("hex");
  const options = [existing?.draftContent, existing?.publishedContent];
  const drive = getGoogleDriveClient();
  const visited = new Set();
  for (const option of options) {
    const fileId = option?.driveFileId;
    if (!fileId || visited.has(fileId) ||
        String(option.format).toLowerCase() !== attachment.format) continue;
    visited.add(fileId);
    try {
      const { data } = await drive.files.get({
        fileId, fields: "id,md5Checksum,size,mimeType,parents,trashed",
      });
      if (!data.trashed && data.parents?.includes(resourcesFolderId()) &&
          data.mimeType === attachment.mime &&
          Number(data.size) === file.size && data.md5Checksum === checksum) {
        return fileId;
      }
    } catch (error) {
      // Si un archivo antiguo desapareció, intentamos una carga nueva.
      if (Number(error?.response?.status || error?.code) === 404) continue;
      throw error;
    }
  }
  return null;
}

async function uploadDriveFile(buffer, title, format) {
  const result = await getGoogleDriveClient().files.create({
    requestBody: {
      name: `${readableName(title)}-${randomUUID().slice(0, 8)}.${format}`,
      parents: [resourcesFolderId()],
    },
    media: { mimeType: DOCUMENT_TYPES[format].mime, body: Readable.from([buffer]) },
    fields: "id",
  });
  if (!result.data.id) throw bad("Google Drive no confirmó la carga del documento", 502);
  return result.data.id;
}

// =========================================================
// TEXTOS EDUCATIVOS EN DRIVE: DISCIPULADO Y GUÍAS DE ORACIÓN
// =========================================================
// Usamos la carpeta institucional ya configurada, sin nuevas credenciales.
// Cada versión guarda su propia referencia: publicar nunca modifica el TXT anterior.
async function uploadDiscipleshipText(content, key, section = "discipleship") {
  const body = Buffer.from(JSON.stringify(content), "utf8");
  if (!body.length || body.length > (section === "prayer_guides" ? MAX_PRAYER_GUIDE_BYTES : MAX_DISCIPLESHIP_BYTES)) {
    throw bad("El contenido es demasiado extenso. Divide el material en varias partes.", 413);
  }
  const { data } = await getGoogleDriveClient().files.create({
    requestBody: {
      name: `${section === "prayer_guides" ? "guia-oracion" : "discipulado"}-${key}-${randomUUID()}.txt`,
      mimeType: "text/plain",
      parents: [resourcesFolderId()],
    },
    media: { mimeType: "text/plain", body: Readable.from([body]) },
    fields: "id",
  });
  if (!data?.id) throw bad("No pudimos guardar el texto del material", 502);
  return data.id;
}

// Reutilizamos el mismo TXT cuando el contenido es idéntico al borrador
// o a la publicación. Así «Guardar» no genera archivos de más.
async function findExistingDiscipleshipText(content, existing, section = "discipleship") {
  const options = [existing?.draftContent, existing?.publishedContent];
  const visited = new Set();
  for (const option of options) {
    const fileId = option?.contentFileId;
    if (!fileId || visited.has(fileId)) continue;
    visited.add(fileId);
    try {
      const previous = await readDiscipleshipText(fileId, section);
      if (isDeepStrictEqual(previous, content)) return fileId;
    } catch (error) {
      // Solo un archivo inexistente se trata como no reutilizable.
      if (Number(error?.response?.status || error?.code) === 404) continue;
      throw error;
    }
  }
  return null;
}

// El identificador procede exclusivamente de MongoDB, no del navegador.
// Verificamos además que sea un TXT de la carpeta autorizada.
async function readDiscipleshipText(fileId, section = "discipleship") {
  const drive = getGoogleDriveClient();
  const { data: file } = await drive.files.get({
    fileId, fields: "id,mimeType,parents,trashed",
  });
  if (file.trashed || file.mimeType !== "text/plain" ||
      !file.parents?.includes(resourcesFolderId())) {
    throw bad("El documento guardado no está disponible", 502);
  }
  const { data } = await drive.files.get(
    { fileId, alt: "media" }, { responseType: "arraybuffer" }
  );
  const body = Buffer.from(data);
  if (!body.length || body.length > (section === "prayer_guides" ? MAX_PRAYER_GUIDE_BYTES : MAX_DISCIPLESHIP_BYTES)) {
    throw bad("El documento guardado supera el tamaño permitido", 502);
  }
  let content;
  try { content = JSON.parse(body.toString("utf8")); }
  catch { throw bad("No pudimos leer el contenido del documento", 502); }
  // No enviamos formatos arbitrarios o HTML si alguien alteró el TXT en Drive.
  return validateContent(content, "entry", section);
}

// Los registros anteriores con contenido dentro de MongoDB siguen funcionando.
// Los nuevos usan un identificador privado para recuperar el TXT.
async function resolveDiscipleshipContent(content, section = "discipleship") {
  if (!content?.contentFileId) return content || null;
  return readDiscipleshipText(content.contentFileId, section);
}

// Todos los datos largos quedan fuera de MongoDB. Guardamos lo necesario
// para las tarjetas y para localizar la versión correcta del estudio.
function discipleshipMetadata(content, fileId) {
  return {
    title: content.title,
    category: content.category,
    level: content.level,
    summary: content.summary,
    lessons: content.content.length,
    topics: content.topics,
    contentFileId: fileId,
  };
}

// Validamos títulos, listas y textos de estudio sin recortar el material.
function cleanDiscipleshipContent(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw bad("Completa el material de discipulado");
  }
  if (!DISCIPLESHIP_LEVELS.has(input.level)) {
    throw bad("Selecciona un nivel: Inicial, Intermedio o Avanzado");
  }
  if (!DISCIPLESHIP_CATEGORIES.has(input.category)) {
    throw bad("Selecciona una categoría disponible");
  }
  // id y slug siguen identificando los contenidos iniciales del frontend;
  // no se necesitan duplicar en el TXT ni en los metadatos de MongoDB.
  const { duration, lessons, id, slug, driveStored, contentFileId, ...content } = input;
  const allowed = new Set([
    "title", "category", "level", "summary", "description", "objectives",
    "topics", "keyVerse", "content", "reflectionQuestions", "practicalActivity",
  ]);
  if (Object.keys(content).some((key) => !allowed.has(key))) {
    throw bad("El estudio incluye campos que no corresponden al formulario");
  }
  if (typeof content.title !== "string" || !content.title.trim() ||
      content.title.trim().length > DISCIPLESHIP_LIMITS.title ||
      typeof content.summary !== "string" || content.summary.trim().length < 12 ||
      content.summary.trim().length > DISCIPLESHIP_LIMITS.summary ||
      !Array.isArray(content.content) || !content.content.length ||
      !Array.isArray(content.topics)) {
    throw bad("Revisa el título, resumen y las lecciones del material");
  }
  function check(value, name = "", path = []) {
    if (Array.isArray(value)) {
      const max = DISCIPLESHIP_LIST_LIMITS[name] || 30;
      if (value.length > max) throw bad(`La lista ${name} admite hasta ${max} elementos`);
      value.forEach((part, index) => check(part, name, [...path, index]));
    } else if (value && typeof value === "object") {
      Object.entries(value).forEach(([field, part]) => check(part, field, [...path, field]));
    } else if (typeof value === "string") {
      const max = name === "title" && path.length > 1 ? 100 : DISCIPLESHIP_LIMITS[name];
      if (max && value.trim().length > max) throw bad(`${name}: máximo ${max} caracteres`);
    }
  }
  check(content);
  if (content.content.some((lesson) => !lesson?.title?.trim() ||
      !Array.isArray(lesson.paragraphs) ||
      !lesson.paragraphs.some((paragraph) => typeof paragraph === "string" && paragraph.trim().length >= 12))) {
    throw bad("Cada lección necesita un título y al menos un párrafo explicativo");
  }
  // El contador de lecciones no se introduce manualmente.
  const valid = validateContent(content, "entry", "discipleship");
  if (Buffer.byteLength(JSON.stringify(valid), "utf8") > MAX_DISCIPLESHIP_BYTES) {
    throw bad("El estudio supera el tamaño máximo permitido. Divídelo en varios materiales.", 413);
  }
  return valid;
}

// =========================================================
// GUÍAS DE ORACIÓN: METADATOS CORTOS Y DOCUMENTO EXTENSO EN DRIVE
// =========================================================
// Usamos las mismas funciones TXT de discipulado: no creamos un segundo
// mecanismo de almacenamiento, ni duplicamos archivos en cada guardado.
function prayerGuideMetadata(content, fileId) {
  return {
    title: content.title,
    category: content.category,
    summary: content.summary,
    prayerPointsCount: content.prayerPoints.length,
    contentFileId: fileId,
  };
}

// Validamos el contenido completo ANTES de subirlo a Google Drive.
// La duración anterior se descarta y los IDs continúan en la clave del registro.
function cleanPrayerGuideContent(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw bad("Completa la guía de oración antes de guardarla");
  }
  const { duration, id, slug, driveStored, contentFileId, prayerPointsCount, ...content } = input;
  const allowed = new Set([
    "title", "category", "summary", "description", "keyVerse",
    "prayerPoints", "samplePrayer",
  ]);
  if (Object.keys(content).some((key) => !allowed.has(key))) {
    throw bad("La guía incluye campos que no corresponden al formulario");
  }
  if (typeof content.title !== "string" || !content.title.trim() ||
      content.title.trim().length > PRAYER_GUIDE_LIMITS.title ||
      typeof content.category !== "string" || !content.category.trim() ||
      content.category.length > 80 ||
      typeof content.summary !== "string" || content.summary.trim().length < 12 ||
      content.summary.trim().length > PRAYER_GUIDE_LIMITS.summary ||
      !Array.isArray(content.description) || content.description.length < 1 ||
      content.description.length > MAX_PRAYER_PARAGRAPHS ||
      !content.description.some((text) => typeof text === "string" && text.trim().length >= 12) ||
      !Array.isArray(content.prayerPoints) || content.prayerPoints.length < 1 ||
      content.prayerPoints.length > MAX_PRAYER_POINTS ||
      !content.prayerPoints.some((point) => typeof point === "string" && point.trim().length >= 8) ||
      typeof content.samplePrayer !== "string" || content.samplePrayer.trim().length < 12 ||
      !content.keyVerse || typeof content.keyVerse !== "object" || Array.isArray(content.keyVerse)) {
    throw bad("Revisa el título, resumen, descripción, puntos y oración sugerida");
  }
  if (Object.keys(content.keyVerse).some((key) => !["reference", "text"].includes(key))) {
    throw bad("Revisa los datos del versículo bíblico");
  }
  for (const [field, limit] of Object.entries(PRAYER_GUIDE_LIMITS)) {
    const value = content[field];
    const values = Array.isArray(value) ? value : [value];
    if (field === "reference" || field === "text") continue;
    if (values.some((part) => typeof part !== "string" || part.trim().length > limit)) {
      throw bad(`${field}: máximo ${limit} caracteres por campo`);
    }
  }
  for (const field of ["reference", "text"]) {
    const value = content.keyVerse[field];
    if (typeof value !== "string" || value.length > PRAYER_GUIDE_LIMITS[field]) {
      throw bad(`El versículo supera el máximo de caracteres permitido (${field})`);
    }
  }
  const validated = validateContent(content, "entry", "prayer_guides");
  if (Buffer.byteLength(JSON.stringify(validated), "utf8") > MAX_PRAYER_GUIDE_BYTES) {
    throw bad("La guía es demasiado extensa. Divídela en varios materiales.", 413);
  }
  return validated;
}

// La validación final ocurre en inspectDocument; el navegador no es fuente fiable.
const documentUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_BYTES, files: 1, fields: 3, fieldSize: MAX_BYTES },
  fileFilter: (_req, file, cb) => {
    const extension = file.originalname.split(".").pop().toLowerCase();
    return DOCUMENT_TYPES[extension] ? cb(null, true) : cb(bad("Solo se admiten documentos PDF o Word"));
  },
}).single("file");

function handleDocumentUpload(req, _res, next) {
  documentUpload(req, _res, (error) => {
    if (!error) return next();
    if (error.code === "LIMIT_FILE_SIZE") return next(bad("El archivo no puede superar 4 MB", 413));
    return next(error);
  });
}

// Convertimos los textos antiguos (arreglos de párrafos) a campos compactos.
function compactText(value, separator) {
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value) && value.every((part) => typeof part === "string")) {
    return value.map((part) => part.trim()).filter(Boolean).join(separator).trim();
  }
  return "";
}

// Descargables guarda SOLO cuatro campos de edición y la referencia al documento.
// Los identificadores de navegación están en la clave del registro, no dentro del contenido.
function cleanDownloadContent(input, previous = null, uploaded = null) {
  const title = typeof input?.title === "string" ? input.title.trim() : "";
  const category = input?.category;
  const includedContent = compactText(input?.includedContent, "\n");
  const description = compactText(input?.description, "\n\n");

  if (!title || title.length > DOWNLOAD_LIMITS.title) {
    throw bad("Escribe un título de máximo 50 caracteres");
  }
  if (!DOWNLOAD_CATEGORIES.has(category)) throw bad("Selecciona una categoría válida");
  if (includedContent.length > DOWNLOAD_LIMITS.includedContent) {
    throw bad("'Este material incluye' admite máximo 200 caracteres");
  }
  if (description.length < 12 || description.length > DOWNLOAD_LIMITS.description) {
    throw bad("La descripción debe tener entre 12 y 300 caracteres");
  }

  const result = { title, category, includedContent, description };
  // Solo el servidor puede indicar el formato tras revisar el archivo.
  const fileId = uploaded?.fileId || previous?.driveFileId;
  const format = uploaded?.format || String(previous?.format || "").toLowerCase();
  if (fileId) {
    if (!DOCUMENT_TYPES[format]) throw bad("El documento anterior tiene un formato no reconocido");
    result.driveFileId = fileId;
    result.format = format;
  } else if (previous?.available && typeof previous.filePath === "string") {
    // Compatibilidad con materiales antiguos que aún usan /downloads/ o HTTPS.
    const path = previous.filePath;
    if (/^\/downloads\/[\w./%-]+\.(pdf|doc|docx)$/i.test(path) || /^https:\/\/[^\s]+$/i.test(path)) {
      result.filePath = path;
    }
  }
  return result;
}

// Quitamos la duración de los estudios al guardar, aunque un cliente antiguo
// todavía la envíe. Los estudios originales permanecen en los datos de React.
function cleanStudyContent(content) {
  if (!content || typeof content !== "object" || Array.isArray(content)) {
    throw bad("Completa los datos del estudio antes de guardar");
  }
  if (!STUDY_LEVELS.has(content.level)) {
    throw bad("Selecciona un nivel: Inicial, Intermedio o Avanzado");
  }
  const { duration, ...rest } = content;
  return rest;
}

// Validamos y normalizamos un paso devocional: se almacena su número
// como texto de dos dígitos, pero siempre se interpreta numéricamente.
function cleanDevotionalContent(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw bad("Completa los datos del paso antes de guardar");
  }
  const raw = input.number;
  const text = String(raw ?? "");
  if (!/^\d{1,3}$/.test(text)) throw bad("Selecciona un número de paso válido");
  const number = Number(text);
  if (!Number.isSafeInteger(number) || number < 1 || number > MAX_DEVOTIONAL_STEPS) {
    throw bad("El número del paso debe estar entre 1 y 999");
  }
  const clean = { ...input, number: String(number).padStart(2, "0") };
  for (const [name, limit] of Object.entries(DEVOTIONAL_LIMITS)) {
    if (name === "tips") continue;
    if (typeof clean[name] !== "string" || clean[name].trim().length > limit) {
      throw bad(`${name === "summary" ? "Resumen" : name === "reminder" ? "Recordatorio" :
        name === "description" ? "Descripción" : "Título"}: máximo ${limit} caracteres`);
    }
    clean[name] = clean[name].trim();
  }
  if (!clean.title || !clean.summary || !clean.description) {
    throw bad("Completa el título, el resumen y la descripción del paso");
  }
  if (!Array.isArray(clean.tips) || clean.tips.length > MAX_DEVOTIONAL_TIPS ||
      clean.tips.some((tip) => typeof tip !== "string" || tip.trim().length > DEVOTIONAL_LIMITS.tips)) {
    throw bad("Incluye hasta 8 consejos, con máximo 120 caracteres por consejo");
  }
  clean.tips = clean.tips.map((tip) => tip.trim()).filter(Boolean);
  return clean;
}

// Los pasos iniciales del 1 al 7 viven en React: no se copian a MongoDB.
// Incluimos las ediciones, materiales nuevos y ocultos al reservar números.
// También comprobamos publicaciones y borradores para no crear conflictos.
async function ensureDevotionalNumberAvailable(targetKey, rawNumber) {
  const requested = Number(rawNumber);
  const records = await ResourceContent.find({ section: "devotionals", kind: "entry" })
    .select("key isCustom draftContent publishedContent").lean();
  const indexed = new Map(records.map((item) => [item.key, item]));

  // En ausencia de una publicación editada, el paso original sigue existiendo.
  for (let number = 1; number <= BUILTIN_DEVOTIONAL_STEPS; number += 1) {
    const key = String(number);
    if (key === targetKey) continue;
    const record = indexed.get(key);
    const usedNumbers = [record?.draftContent?.number,
      record?.publishedContent?.number];
    if (!record?.publishedContent) usedNumbers.push(number);
    if (usedNumbers.some((value) => Number(value) === requested)) {
      throw bad(`El paso ${requested} ya está ocupado. Selecciona otro número.`, 409);
    }
  }

  // Un paso nuevo también reserva su número mientras sea borrador u oculto.
  for (const record of records) {
    if (record.key === targetKey || /^([1-7])$/.test(record.key)) continue;
    if ([record.draftContent?.number, record.publishedContent?.number]
      .some((value) => value !== undefined && Number(value) === requested)) {
      throw bad(`El paso ${requested} ya está ocupado. Selecciona otro número.`, 409);
    }
  }
}

// Verificamos cada texto antes de guardar preguntas frecuentes en MongoDB.
// Los materiales originales de React no se modifican automáticamente.
function cleanFaqContent(content) {
  if (!content || typeof content !== "object" || Array.isArray(content)) {
    throw bad("Completa los datos de la pregunta frecuente");
  }
  const clean = { ...content };
  if (typeof clean.question !== "string" ||
      clean.question.trim().length < 1 ||
      clean.question.trim().length > FAQ_LIMITS.question) {
    throw bad("La pregunta debe tener como máximo 80 caracteres");
  }
  clean.question = clean.question.trim();
  if (typeof clean.category !== "string" || !FAQ_CATEGORIES.has(clean.category)) {
    throw bad("Selecciona una categoría válida para la pregunta");
  }
  if (!Array.isArray(clean.answer) || clean.answer.length < 1 ||
      clean.answer.length > MAX_FAQ_ANSWERS ||
      clean.answer.some((part) => typeof part !== "string" ||
        part.trim().length < 12 || part.trim().length > FAQ_LIMITS.answer)) {
    throw bad("Agrega entre 1 y 5 respuestas de 12 a 200 caracteres cada una");
  }
  clean.answer = clean.answer.map((part) => part.trim());
  if (clean.highlightedInfo !== undefined) {
    if (typeof clean.highlightedInfo !== "string" ||
        clean.highlightedInfo.trim().length > FAQ_LIMITS.highlightedInfo) {
      throw bad("La información destacada admite hasta 250 caracteres");
    }
    clean.highlightedInfo = clean.highlightedInfo.trim();
  }
  return clean;
}

// Protegemos la API con la sesión HttpOnly y los roles reales de MongoDB.
router.use(authenticateUser, authorizeRoles("member", "admin", "super_admin"));
router.param("section", (req, _res, next, value) => {
  if (!SECTIONS.has(value)) return next(bad("Sección de recursos no reconocida", 404));
  return next();
});
router.param("key", (req, _res, next, value) => {
  if (!safeKey(value) || value === "__page__") return next(bad("Identificador de contenido inválido"));
  return next();
});

// Aceptamos SOLO JSON simple: sin HTML, binarios, tipos raros ni propiedades peligrosas.
function validateContent(content, kind, section = "") {
  if (!content || typeof content !== "object" || Array.isArray(content)) {
    throw bad("Completa los datos del contenido antes de guardar");
  }
  const serialized = JSON.stringify(content);
  const sectionLimit = ["discipleship", "prayer_guides"].includes(section) && kind === "entry"
    ? MAX_DISCIPLESHIP_BYTES : MAX_BYTES;
  if (!serialized || Buffer.byteLength(serialized, "utf8") > sectionLimit) {
    throw bad("El contenido es demasiado extenso para guardarlo");
  }
  let nodes = 0;
  function inspect(value, depth = 0, name = "") {
    nodes += 1;
    if (nodes > 3000 || depth > 12) throw bad("El contenido tiene demasiados niveles o elementos");
    if (value === null || value === undefined) throw bad("No se permiten valores vacíos no definidos");
    if (typeof value === "string") {
      if (value.length > 12000) throw bad("Un campo de texto supera el límite permitido");
      if (/<\s*(script|iframe|object|embed)\b/i.test(value)) throw bad("No se permite incorporar código HTML");
      if (/^(?:url|link|path|filePath|meetingUrl)$/i.test(name) && value.trim()) {
        // Los enlaces son HTTPS; los documentos empaquetados usan /downloads/.
        const internal = /^\/(?!\/)[\w./%-]+$/.test(value);
        let external = false;
        try { external = new URL(value).protocol === "https:"; } catch { /* No es URL. */ }
        if (!internal && !external) throw bad("Los enlaces deben usar HTTPS o una ruta interna válida");
      }
      return;
    }
    if (typeof value === "number") {
      if (!Number.isSafeInteger(value) || Math.abs(value) > 1000000) throw bad("Hay un número inválido");
      return;
    }
    if (typeof value === "boolean") return;
    if (Array.isArray(value)) {
      if (value.length > 120) throw bad("Hay demasiados elementos en una lista");
      value.forEach((item) => inspect(item, depth + 1, name));
      return;
    }
    if (typeof value !== "object" || Object.getPrototypeOf(value) !== Object.prototype) {
      throw bad("La estructura del contenido no es válida");
    }
    const keys = Object.keys(value);
    if (keys.length > 55) throw bad("Un bloque contiene demasiados campos");
    for (const key of keys) {
      if (["__proto__", "prototype", "constructor"].includes(key) || !/^[a-zA-Z][\w-]{0,79}$/.test(key)) {
        throw bad("El contenido contiene un campo no permitido");
      }
      inspect(value[key], depth + 1, key);
    }
  }
  inspect(content);
  if (kind === "page") {
    const allowed = new Set(["eyebrow", "title", "highlight", "description"]);
    if (Object.keys(content).some((field) => !allowed.has(field)) ||
        typeof content.title !== "string" || !content.title.trim() ||
        typeof content.description !== "string" || !content.description.trim()) {
      throw bad("Completa el título y la descripción de la página");
    }
  } else {
    if (!(typeof content.title === "string" && content.title.trim()) &&
        !(typeof content.question === "string" && content.question.trim())) {
      throw bad("El recurso debe tener un título o una pregunta");
    }
    if (content.slug !== undefined && !safeKey(content.slug)) {
      throw bad("El identificador del enlace no es válido");
    }
    // No publicamos un material vacío: necesita una explicación además del título.
    const substantive = [content.summary, content.description, content.answer,
      content.introduction, content.samplePrayer, content.content];
    const hasText = (value) => typeof value === "string" ? value.trim().length >= 12 :
      Array.isArray(value) ? value.some(hasText) :
        value && typeof value === "object" ? Object.values(value).some(hasText) : false;
    if (!substantive.some(hasText)) {
      throw bad("Agrega una explicación, respuesta o contenido de al menos 12 caracteres");
    }
    if (section !== "downloads" && content.available === true && !content.filePath?.trim()) {
      throw bad("Para habilitar una descarga debes indicar su enlace o ruta de archivo");
    }
  }
  return JSON.parse(serialized); // Aislamos el documento de referencias del cuerpo HTTP.
}

function publicItem(doc) {
  const content = doc.publishedContent ? { ...doc.publishedContent } : null;
  if (content) {
    // El navegador no necesita conocer el identificador privado de Drive.
    content.driveStored = Boolean(content.driveFileId || content.contentFileId);
    delete content.driveFileId;
    delete content.contentFileId;
  }
  return {
    key: doc.key,
    isCustom: doc.isCustom,
    hidden: doc.publishedHidden,
    content,
  };
}
function adminItem(doc) {
  return {
    key: doc.key,
    kind: doc.kind,
    isCustom: doc.isCustom,
    hidden: doc.publishedHidden,
    draftRevision: doc.draftRevision,
    publishedRevision: doc.publishedRevision,
    draft: doc.draftContent ?? null,
    published: doc.publishedContent ?? null,
    updatedAt: doc.updatedAt,
  };
}

// =========================================================
// ADMINISTRACIÓN - CONSULTA PRIVADA
// =========================================================
router.get("/admin/:section", adminOnly, async (req, res, next) => {
  try {
    let documents = await ResourceContent.find({ section: req.params.section }).lean();
    if (["discipleship", "prayer_guides"].includes(req.params.section)) {
      // Solo Administración obtiene el contenido completo para poder editarlo.
      // Los miembros cargan el TXT exclusivamente al abrir el material.
      documents = await Promise.all(documents.map(async (document) => ({
        ...document,
        draftContent: await resolveDiscipleshipContent(document.draftContent, req.params.section),
        publishedContent: await resolveDiscipleshipContent(document.publishedContent, req.params.section),
      })));
    }
    return res.json({
      success: true,
      page: documents.find((doc) => doc.kind === "page") ?
        adminItem(documents.find((doc) => doc.kind === "page")) : null,
      entries: documents.filter((doc) => doc.kind === "entry").map(adminItem),
    });
  } catch (error) { return next(error); }
});

// Crea o modifica un borrador SIN reemplazar lo que consultan los miembros.
async function saveDraft(req, res, next, kind) {
  let uploadedId = null;
  let uploadedTxtId = null;
  try {
    const section = req.params.section;
    const key = kind === "page" ? "__page__" : req.params.key;
    // La carga de PDF es multipart; el resto continúa usando JSON.
    const payload = req.file ? {
      content: JSON.parse(req.body.content || "null"),
      expectedRevision: Number(req.body.expectedRevision),
      isCustom: req.body.isCustom === "true",
    } : (req.body || {});
    const { content, expectedRevision, isCustom = false } = payload;
    if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0 || typeof isCustom !== "boolean") {
      throw bad("Actualiza la página antes de guardar este cambio");
    }
    const lookup = { section, kind, key };
    const existing = await ResourceContent.findOne(lookup).lean();
    if ((existing?.draftRevision || 0) !== expectedRevision) {
      throw bad("Otro administrador editó el recurso. Actualiza antes de guardar", 409);
    }
    if (req.file && (section !== "downloads" || kind !== "entry")) {
      throw bad("Esta sección no admite archivos adjuntos");
    }
    // Primero validamos el formulario; nunca subimos un archivo si ya está mal.
    const previous = existing?.draftContent || existing?.publishedContent || null;
    let clean = section === "downloads" && kind === "entry"
      ? cleanDownloadContent(content, {
          ...(existing?.publishedContent || {}), ...(existing?.draftContent || {}),
        })
      : section === "studies" && kind === "entry"
        ? cleanStudyContent(content)
        : section === "devotionals" && kind === "entry"
          ? cleanDevotionalContent(content)
          : section === "faq" && kind === "entry"
            ? cleanFaqContent(content)
            : content;
    const attachment = req.file ? await inspectDocument(req.file) : null;
    if (attachment) {
      // Subimos solamente si el documento no coincide con ninguno vigente.
      attachment.fileId = await findExistingDocument(req.file, attachment, existing);
      if (!attachment.fileId) {
        uploadedId = await uploadDriveFile(req.file.buffer, content?.title, attachment.format);
        attachment.fileId = uploadedId;
      }
      clean = cleanDownloadContent(content, previous, attachment);
    }
    if (section === "discipleship" && kind === "entry") {
      // Validamos antes de subir y reutilizamos la misma versión sin cambios.
      const fullContent = cleanDiscipleshipContent(clean);
      const currentTxtId = await findExistingDiscipleshipText(fullContent, existing);
      if (!currentTxtId) uploadedTxtId = await uploadDiscipleshipText(fullContent, key);
      clean = discipleshipMetadata(fullContent, currentTxtId || uploadedTxtId);
    }
    if (section === "prayer_guides" && kind === "entry") {
      // Conservamos separado el TXT de cada versión y reutilizamos el existente
      // si el administrador no cambió el contenido.
      const fullGuide = cleanPrayerGuideContent(clean);
      const matchingId = await findExistingDiscipleshipText(fullGuide, existing, section);
      if (!matchingId) uploadedTxtId = await uploadDiscipleshipText(fullGuide, key, section);
      clean = prayerGuideMetadata(fullGuide, matchingId || uploadedTxtId);
    }
    clean = validateContent(clean, kind, section);
    if (section === "devotionals" && kind === "entry") {
      await ensureDevotionalNumberAvailable(key, clean.number);
    }
    if (kind === "entry" && section !== "downloads" &&
        (own(clean, "id") && String(clean.id) !== key ||
        isCustom && own(clean, "slug") && clean.slug !== key)) {
      throw bad("No se puede cambiar el identificador de un recurso existente");
    }
    let doc;
    if (!existing) {
      if (expectedRevision !== 0) throw bad("El recurso cambió. Actualiza antes de guardar", 409);
      try {
        doc = await ResourceContent.create({ ...lookup, isCustom: kind === "page" ? false : isCustom,
          draftContent: clean, draftRevision: 1, createdBy: req.user._id, updatedBy: req.user._id });
      } catch (error) {
        if (error.code === 11000) throw bad("Otro administrador guardó cambios. Actualiza", 409);
        throw error;
      }
    } else {
      if (existing.isCustom !== (kind === "page" ? false : isCustom)) {
        throw bad("El tipo de recurso no coincide con el original");
      }
      doc = await ResourceContent.findOneAndUpdate(
        { ...lookup, draftRevision: expectedRevision },
        { $set: { draftContent: clean, updatedBy: req.user._id }, $inc: { draftRevision: 1 } },
        { new: true, runValidators: true }
      );
      if (!doc) throw bad("Otro administrador editó el recurso. Actualiza y vuelve a intentar", 409);
    }
    // Retiramos el borrador reemplazado solamente cuando ya no esté en uso.
    // También funciona si reutilizamos un archivo publicado sin volverlo a subir.
    const previousDraftId = existing?.draftContent?.driveFileId || existing?.draftContent?.contentFileId;
    const publishedId = existing?.publishedContent?.driveFileId || existing?.publishedContent?.contentFileId;
    const savedId = doc.draftContent?.driveFileId || doc.draftContent?.contentFileId;
    if (previousDraftId && previousDraftId !== savedId && previousDraftId !== publishedId) {
      try { await removeDriveFile(previousDraftId); }
      catch (error) { console.error("No se pudo limpiar el archivo anterior del borrador:", error); }
    }
    return res.json({ success: true, item: adminItem(doc) });
  } catch (error) {
    // Si falla MongoDB, el PDF recién subido no debe quedar huérfano.
    if (uploadedId || uploadedTxtId) {
      try { await removeDriveFile(uploadedId || uploadedTxtId); }
      catch (cleanupError) { console.error("No se pudo revertir la carga del archivo:", cleanupError); }
    }
    return next(error instanceof SyntaxError ? bad("No pudimos leer los datos del formulario") : error);
  }
}

// Al publicar, el borrador deja de duplicarse: solo queda la publicación actual.
async function publishDraft(req, res, next, kind) {
  try {
    const expectedRevision = req.body?.expectedRevision;
    if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 1) {
      throw bad("Guarda primero el borrador que deseas publicar");
    }
    const lookup = { section: req.params.section, kind,
      key: kind === "page" ? "__page__" : req.params.key, draftRevision: expectedRevision };
    const current = await ResourceContent.findOne(lookup).lean();
    if (!current?.draftContent) throw bad("El borrador cambió o ya no existe. Actualiza", 409);
    if (req.params.section === "downloads" && current.isCustom &&
        !current.draftContent.driveFileId && !current.draftContent.filePath) {
      throw bad("Antes de publicar este material, adjunta un PDF o un documento Word");
    }
    if (req.params.section === "devotionals" && kind === "entry") {
      await ensureDevotionalNumberAvailable(req.params.key, current.draftContent.number);
    }
    if (["discipleship", "prayer_guides"].includes(req.params.section) && kind === "entry" &&
        !current.draftContent.contentFileId &&
        !Array.isArray(current.draftContent.content) &&
        !Array.isArray(current.draftContent.prayerPoints)) {
      throw bad("Guarda el material antes de publicarlo");
    }
    const oldPublishedPdf = current.publishedContent?.driveFileId || current.publishedContent?.contentFileId;
    const doc = await ResourceContent.findOneAndUpdate(
      lookup,
      { $set: { publishedContent: current.draftContent, publishedRevision: expectedRevision,
        publishedHidden: false, publishedBy: req.user._id, updatedBy: req.user._id },
        $unset: { draftContent: "" } },
      { new: true, runValidators: true }
    );
    if (!doc) throw bad("No fue posible publicar: el contenido cambió", 409);
    const newPdf = doc.publishedContent?.driveFileId || doc.publishedContent?.contentFileId;
    if (oldPublishedPdf && oldPublishedPdf !== newPdf) {
      try { await removeDriveFile(oldPublishedPdf); }
      catch (error) { console.error("Quedó un PDF antiguo pendiente de limpieza:", error); }
    }
    return res.json({ success: true, item: adminItem(doc) });
  } catch (error) { return next(error); }
}

router.put("/admin/:section/page/draft", adminOnly, validateRequestOrigin,
  (req, res, next) => saveDraft(req, res, next, "page"));
router.post("/admin/:section/page/publish", adminOnly, validateRequestOrigin,
  (req, res, next) => publishDraft(req, res, next, "page"));
router.put("/admin/:section/entries/:key/draft", adminOnly, validateRequestOrigin,
  (req, res, next) => saveDraft(req, res, next, "entry"));
// Carga privada de PDF o Word con su borrador, en una sola operación.
router.put("/admin/downloads/entries/:key/file-draft", adminOnly, validateRequestOrigin,
  handleDocumentUpload, (req, res, next) => {
    if (!req.file) return next(bad("Selecciona un archivo PDF o Word"));
    req.params.section = "downloads";
    return saveDraft(req, res, next, "entry");
  });
router.post("/admin/:section/entries/:key/publish", adminOnly, validateRequestOrigin,
  (req, res, next) => publishDraft(req, res, next, "entry"));

// =========================================================
// OCULTAR SIN ELIMINAR EL RECURSO NI SU ARCHIVO EN DRIVE
// =========================================================
// Conservamos la publicación actual y el borrador para que puedan recuperarse.
router.post("/admin/:section/entries/:key/hide", adminOnly, validateRequestOrigin, async (req, res, next) => {
  try {
    const { section, key } = req.params;
    const { expectedRevision, isBuiltin } = req.body || {};
    if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0 ||
        typeof isBuiltin !== "boolean") {
      throw bad("Actualiza los recursos antes de cambiar su visibilidad");
    }
    const lookup = { section, kind: "entry", key };
    const existing = await ResourceContent.findOne(lookup).lean();
    if (!existing) {
      // El original reside en React. Solo insertamos un marcador para ocultarlo.
      if (!isBuiltin || expectedRevision !== 0) {
        throw bad("El recurso cambió o no existe. Actualiza", 409);
      }
      try {
        await ResourceContent.create({ ...lookup, isCustom: false, publishedHidden: true,
          createdBy: req.user._id, updatedBy: req.user._id });
      } catch (error) {
        if (error.code === 11000) throw bad("Otro administrador cambió el recurso. Actualiza", 409);
        throw error;
      }
    } else {
      if (existing.isCustom === isBuiltin || existing.draftRevision !== expectedRevision) {
        throw bad("El recurso cambió. Actualiza antes de continuar", 409);
      }
      const updated = await ResourceContent.updateOne(
        { ...lookup, draftRevision: expectedRevision, publishedHidden: false },
        { $set: { publishedHidden: true, updatedBy: req.user._id } }
      );
      if (!updated.modifiedCount) throw bad("El recurso ya está oculto o cambió. Actualiza", 409);
    }
    return res.json({ success: true, message: "Material oculto. Puedes volver a mostrarlo." });
  } catch (error) { return next(error); }
});

// =========================================================
// ELIMINAR EL DOCUMENTO DE MONGODB Y EL ARCHIVO DE DRIVE
// =========================================================
// Material nuevo: desaparece del catálogo. Original editado: vuelve a su
// versión inicial de React, porque eliminar su registro NO borra el código.
router.delete("/admin/:section/entries/:key/permanent", adminOnly, validateRequestOrigin, async (req, res, next) => {
  try {
    const { section, key } = req.params;
    const { expectedRevision } = req.body || {};
    if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0) {
      throw bad("Actualiza los recursos antes de eliminar este documento");
    }
    const lookup = { section, kind: "entry", key, draftRevision: expectedRevision };
    // findOneAndDelete aplica la misma revisión mostrada en Administración.
    const removed = await ResourceContent.findOneAndDelete(lookup);
    if (!removed) throw bad("No existe un registro guardado con esa revisión. Actualiza", 409);

    // Un documento puede tener un archivo publicado y otro en borrador.
    // Eliminamos ambos sin repetir el mismo identificador.
    const fileIds = [...new Set([
      removed.draftContent?.driveFileId,
      removed.publishedContent?.driveFileId,
      removed.draftContent?.contentFileId,
      removed.publishedContent?.contentFileId,
    ].filter(Boolean))];
    let driveErrors = 0;
    for (const fileId of fileIds) {
      try { await removeDriveFile(fileId); }
      catch (driveError) {
        driveErrors += 1;
        // La eliminación de Mongo ya ocurrió; informamos el fallo de Drive.
        console.error("No se pudo eliminar un archivo del material borrado en Drive:", fileId, driveError);
      }
    }
    return res.json({
      success: true,
      restoredOriginal: !removed.isCustom,
      driveCleanupPending: driveErrors > 0,
      message: driveErrors > 0
        ? "El material dejó de mostrarse, pero uno de sus archivos no pudo eliminarse. Contacta al encargado del sistema."
        : removed.isCustom
          ? "El material se eliminó definitivamente."
          : "Se restauró la versión original del material.",
    });
  } catch (error) { return next(error); }
});

// Vuelve a mostrar tanto originales como documentos nuevos sin recrearlos.
router.post("/admin/:section/entries/:key/restore", adminOnly, validateRequestOrigin, async (req, res, next) => {
  try {
    const document = await ResourceContent.findOneAndUpdate(
      { section: req.params.section, kind: "entry", key: req.params.key, publishedHidden: true },
      { $set: { publishedHidden: false, updatedBy: req.user._id } },
      { new: true }
    );
    if (!document) throw bad("No encontramos el recurso oculto", 404);
    return res.json({ success: true, item: adminItem(document) });
  } catch (error) { return next(error); }
});

// =========================================================
// DESCARGAS AUTENTICADAS - PDF Y WORD PRIVADOS EN DRIVE
// =========================================================
router.get("/downloads/entries/:key/file", async (req, res, next) => {
  try {
    const resource = await ResourceContent.findOne({
      section: "downloads", kind: "entry", key: req.params.key,
      publishedRevision: { $gt: 0 }, publishedHidden: false,
    }).select("publishedContent").lean();
    const fileId = resource?.publishedContent?.driveFileId;
    if (!fileId) throw bad("Este documento aún no está disponible para descargar", 404);
    const format = String(resource.publishedContent.format || "").toLowerCase();
    if (!DOCUMENT_TYPES[format]) throw bad("Formato de documento no reconocido", 422);
    const result = await getGoogleDriveClient().files.get(
      { fileId, alt: "media" }, { responseType: "stream" }
    );
    const name = readableName(resource.publishedContent.title);
    res.setHeader("Content-Type", DOCUMENT_TYPES[format].mime);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(name)}.${format}`);
    await pipeline(result.data, res);
  } catch (error) { if (!res.headersSent) return next(error); req.destroy(); }
});

// =========================================================
// DISCIPULADO: CONTENIDO COMPLETO DE UN MATERIAL PUBLICADO
// =========================================================
router.get("/discipleship/entries/:key/content", async (req, res, next) => {
  try {
    const record = await ResourceContent.findOne({
      section: "discipleship", kind: "entry", key: req.params.key,
      publishedRevision: { $gt: 0 }, publishedHidden: false,
    }).select("publishedContent").lean();
    if (!record?.publishedContent) throw bad("Este material todavía no está publicado", 404);
    const content = await resolveDiscipleshipContent(record.publishedContent);
    res.setHeader("Cache-Control", "private, no-store");
    return res.json({ success: true, content });
  } catch (error) { return next(error); }
});

// =========================================================
// GUÍAS DE ORACIÓN: LECTURA COMPLETA SOLO DE LA VERSIÓN PUBLICADA
// =========================================================
router.get("/prayer_guides/entries/:key/content", async (req, res, next) => {
  try {
    const record = await ResourceContent.findOne({
      section: "prayer_guides", kind: "entry", key: req.params.key,
      publishedRevision: { $gt: 0 }, publishedHidden: false,
    }).select("publishedContent").lean();
    if (!record?.publishedContent) throw bad("Esta guía todavía no está publicada", 404);
    const content = await resolveDiscipleshipContent(record.publishedContent, "prayer_guides");
    res.setHeader("Cache-Control", "private, no-store");
    return res.json({ success: true, content });
  } catch (error) { return next(error); }
});

// =========================================================
// DISCIPULADO: DESCARGA PDF BAJO DEMANDA, SIN DUPLICAR EN DRIVE
// =========================================================
// Las diez fichas iniciales viven en React, por eso únicamente en esos casos
// recibimos el contenido original desde el frontend. Un material editado o
// creado en Administración se obtiene SIEMPRE desde su publicación en Drive.
const BUILTIN_DISCIPLESHIP_KEYS = new Set(
  Array.from({ length: 10 }, (_, index) => `discipleship-material-${index + 1}`)
);

// Crear documentos es más costoso que consultar un catálogo.
const pdfDownloadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, message: "Se solicitaron muchas descargas. Intenta nuevamente más tarde." },
});

router.post("/discipleship/entries/:key/pdf", pdfDownloadLimiter,
  validateRequestOrigin, async (req, res, next) => {
    try {
      const key = req.params.key;
      const record = await ResourceContent.findOne({
        section: "discipleship", kind: "entry", key,
      }).select("publishedContent publishedRevision publishedHidden isCustom").lean();

      // Ni un material oculto ni un borrador sin publicar pueden descargarse.
      if (record?.publishedHidden) throw bad("Este material no está disponible", 404);

      let content;
      if (record?.publishedRevision > 0 && record.publishedContent) {
        // Fuente de verdad: TXT o contenido antiguo publicado en MongoDB.
        content = await resolveDiscipleshipContent(record.publishedContent);
      } else if (BUILTIN_DISCIPLESHIP_KEYS.has(key) && !record?.isCustom) {
        // Los diez originales solo existen en los archivos React del proyecto.
        // Validamos estrictamente cualquier texto recibido; no lo guardamos.
        content = cleanDiscipleshipContent(req.body?.originalContent);
      } else {
        throw bad("Este material todavía no está publicado", 404);
      }

      // Si la publicación está incompleta, devolvemos un aviso controlado.
      if (!content || !Array.isArray(content.content) || !content.content.length) {
        throw bad("No pudimos preparar el estudio para descargar", 422);
      }

      // El PDF se genera en el momento: no se sube ni guarda en ninguna parte.
      const pdf = createDiscipleshipPdf(content);
      const name = readableName(content.title || "Material de discipulado");
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Cache-Control", "private, no-store");
      res.setHeader("Content-Disposition",
        `attachment; filename="material-discipulado.pdf"; filename*=UTF-8''${encodeURIComponent(name)}.pdf`);

      // Interrumpimos correctamente la respuesta si ocurre un error de renderizado.
      pdf.on("error", (error) => {
        console.error("Error al generar PDF de discipulado:", error);
        if (!res.headersSent) next(error);
        else res.destroy(error);
      });
      pdf.pipe(res);
      pdf.end();
    } catch (error) {
      return next(error);
    }
  });

// =========================================================
// GUÍAS DE ORACIÓN: PDF BAJO DEMANDA PARA MIEMBROS Y ADMINISTRADORES
// =========================================================
// Los originales proceden de React; los editados se recuperan del TXT publicado.
const BUILTIN_PRAYER_GUIDE_KEYS = new Set(
  Array.from({ length: 10 }, (_, index) => `prayer-guide-${index + 1}`)
);
router.post("/prayer_guides/entries/:key/pdf", pdfDownloadLimiter,
  validateRequestOrigin, async (req, res, next) => {
    try {
      const key = req.params.key;
      const record = await ResourceContent.findOne({
        section: "prayer_guides", kind: "entry", key,
      }).select("publishedContent publishedRevision publishedHidden isCustom").lean();
      if (record?.publishedHidden) throw bad("Esta guía no está disponible", 404);

      let content;
      if (record?.publishedRevision > 0 && record.publishedContent) {
        // Jamás descargamos un borrador privado desde una cuenta de miembro.
        content = await resolveDiscipleshipContent(record.publishedContent, "prayer_guides");
      } else if (BUILTIN_PRAYER_GUIDE_KEYS.has(key) && !record?.isCustom) {
        // Solamente las diez guías originales pueden venir del catálogo inicial.
        content = cleanPrayerGuideContent(req.body?.originalContent);
      } else {
        throw bad("Esta guía todavía no está publicada", 404);
      }
      if (!content?.title || !Array.isArray(content.prayerPoints)) {
        throw bad("No pudimos preparar la guía para descargar", 422);
      }
      const pdf = createPrayerGuidePdf(content);
      const name = readableName(content.title);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Cache-Control", "private, no-store");
      res.setHeader("Content-Disposition",
        `attachment; filename="guia-oracion.pdf"; filename*=UTF-8''${encodeURIComponent(name)}.pdf`);
      pdf.on("error", (error) => {
        console.error("Error al generar PDF de guía de oración:", error);
        if (!res.headersSent) next(error);
        else res.destroy(error);
      });
      pdf.pipe(res);
      pdf.end();
    } catch (error) { return next(error); }
  });

// =========================================================
// MIEMBROS - SOLO LO PUBLICADO, SIN BORRADORES NI AUTORES
// =========================================================
router.get("/:section", async (req, res, next) => {
  try {
    const documents = await ResourceContent.find({ section: req.params.section,
      $or: [{ publishedRevision: { $gt: 0 } }, { publishedHidden: true }] })
      .select("kind key isCustom publishedContent publishedHidden").lean();
    const page = documents.find((item) => item.kind === "page");
    return res.json({ success: true, page: page?.publishedContent ?? null,
      entries: documents.filter((item) => item.kind === "entry").map(publicItem) });
  } catch (error) { return next(error); }
});

export default router;
