// =========================================================
// RUTAS DE INGRESOS - IGLESIA EL ANCLA
// Autenticación y autorización compartidas; SIN controllers/.
// =========================================================

import { Router } from "express";
import mongoose from "mongoose";
import multer from "multer";
import { fileTypeFromBuffer } from "file-type";
import { randomUUID } from "node:crypto";
import { Readable } from "node:stream";
import cloudinary from "../services/cloudinary/cloudinary.js";
import Income, {
  INCOME_CATEGORIES,
  INCOME_PAYMENT_METHODS,
  INCOME_STATUSES,
} from "../models/Income.js";
import authenticateUser from "../middleware/authenticateUser.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import validateRequestOrigin from "../middleware/validateRequestOrigin.js";

const router = Router();

// No guardamos bytes en MongoDB ni exponemos URLs públicas de comprobantes.
const MAX_RECEIPT_BYTES = 3 * 1024 * 1024;
const RECEIPT_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 1, fileSize: MAX_RECEIPT_BYTES, fields: 1, fieldSize: 20 * 1024 },
});

// Ejecutamos el parser solo en operaciones que aceptan una imagen opcional.
function optionalReceiptUpload(req, res, next) {
  upload.single("receiptFile")(req, res, (error) => {
    if (!error) return next();
    const status = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    return res.status(status).json({
      message: status === 413
        ? "El comprobante no puede superar los 3 MB"
        : "Archivo de comprobante inválido",
    });
  });
}

// Para imágenes enviamos FormData; los ingresos sin imagen continúan en JSON.
function requestFields(req) {
  if (typeof req.body?.payload !== "string") return req.body;
  let value;
  try { value = JSON.parse(req.body.payload); }
  catch { throw httpError(400, "El formulario contiene datos inválidos"); }
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw httpError(400, "El formulario debe contener un objeto JSON");
  }
  return value;
}

// No confiamos solamente en la extensión o MIME enviados por el navegador.
async function uploadReceipt(file) {
  const detected = await fileTypeFromBuffer(file.buffer);
  if (!detected || !RECEIPT_MIME.has(detected.mime) ||
      !file.size || file.size > MAX_RECEIPT_BYTES) {
    throw httpError(400, "Solo se aceptan imágenes JPG, PNG o WebP de hasta 3 MB");
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({
      folder: "el-ancla/finanzas/ingresos-comprobantes",
      public_id: randomUUID(),
      resource_type: "image",
      type: "authenticated", // Original y transformaciones protegidos.
      overwrite: false,
    }, (error, result) => {
      if (error) return reject(error);
      if (!result?.public_id || !result?.format) {
        return reject(new Error("Cloudinary no confirmó el comprobante"));
      }
      resolve({ publicId: result.public_id, format: result.format });
    });
    stream.end(file.buffer);
  });
}

// Solo limpiamos una subida NUEVA si la escritura MongoDB falla.
// Los comprobantes anteriores nunca se borran automáticamente por auditoría.
async function cleanupFailedUpload(receipt) {
  if (!receipt?.publicId) return;
  try {
    await cloudinary.uploader.destroy(receipt.publicId, {
      resource_type: "image", type: "authenticated", invalidate: true,
    });
  } catch (error) {
    console.error("Comprobante recién subido pendiente de limpieza:", error.message);
  }
}
const WRITABLE_FIELDS = [
  "concept", "category", "amount", "date", "paymentMethod",
  "status", "reference", "responsible", "notes",
];
const OPTIONAL_TEXT = { reference: 100, responsible: 100, notes: 1000 };

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

// La fecha contable se interpreta en Chile, no en el huso horario del servidor.
function getChileToday() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Santiago", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const get = (type) => parts.find((part) => part.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function isRealDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function requiredText(value, label, maximum) {
  if (typeof value !== "string") throw httpError(400, `${label} debe ser texto`);
  const text = value.trim();
  if (!text || text.length > maximum) {
    throw httpError(400, `${label} debe tener entre 1 y ${maximum} caracteres`);
  }
  return text;
}

// Solo acepta datos del formulario; nunca IDs ni campos de auditoría del navegador.
function validateIncomePayload(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw httpError(400, "El ingreso debe ser un objeto JSON");
  }
  const permitted = new Set(WRITABLE_FIELDS);
  for (const key of Object.keys(payload)) {
    if (!permitted.has(key)) throw httpError(400, `No se permite modificar '${key}'`);
  }
  const concept = requiredText(payload.concept, "Concepto", 120);
  if (!INCOME_CATEGORIES.includes(payload.category)) {
    throw httpError(400, "Selecciona una categoría válida");
  }
  if (typeof payload.amount !== "number" || !Number.isSafeInteger(payload.amount) || payload.amount <= 0) {
    throw httpError(400, "El monto CLP debe ser un entero positivo");
  }
  if (!isRealDate(payload.date) || payload.date > getChileToday()) {
    throw httpError(400, "La fecha es inválida o futura");
  }
  if (!INCOME_PAYMENT_METHODS.includes(payload.paymentMethod)) {
    throw httpError(400, "Selecciona un medio de recepción válido");
  }
  if (!INCOME_STATUSES.includes(payload.status)) {
    throw httpError(400, "Selecciona un estado válido");
  }
  const optional = {};
  for (const [key, maximum] of Object.entries(OPTIONAL_TEXT)) {
    const raw = payload[key] ?? "";
    if (typeof raw !== "string" || raw.trim().length > maximum) {
      throw httpError(400, `${key} no puede superar ${maximum} caracteres`);
    }
    optional[key] = raw.trim();
  }
  return {
    concept, category: payload.category, amount: payload.amount,
    date: payload.date, paymentMethod: payload.paymentMethod,
    status: payload.status, ...optional,
  };
}

function toResponse(doc) {
  return {
    id: String(doc._id),
    _id: String(doc._id),
    concept: doc.concept,
    category: doc.category,
    amount: doc.amount,
    date: doc.date,
    paymentMethod: doc.paymentMethod,
    status: doc.status,
    reference: doc.reference || "",
    responsible: doc.responsible || "",
    notes: doc.notes || "",
    hasReceipt: Boolean(doc.receipt?.publicId),
    version: doc.__v,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function validId(id) {
  if (!mongoose.isObjectIdOrHexString(id)) {
    throw httpError(400, "Identificador de ingreso inválido");
  }
  return id;
}

function validVersion(version) {
  if (!Number.isSafeInteger(version) || version < 0) {
    throw httpError(400, "Falta la versión de registro. Actualiza el listado");
  }
  return version;
}

// Todas las rutas financieras son privadas, incluso las consultas.
router.use(authenticateUser, authorizeRoles("admin", "super_admin"));

// GET /api/incomes
router.get("/", async (_req, res, next) => {
  try {
    const docs = await Income.find({ deletedAt: null })
      .sort({ date: -1, createdAt: -1 })
      .lean();
    res.set("Cache-Control", "private, no-store");
    return res.json({ success: true, incomes: docs.map(toResponse) });
  } catch (error) { return next(error); }
});

// GET /api/incomes/:id/receipt
// El servidor verifica sesión y rol antes de transmitir el comprobante.
// No entregamos publicId ni URLs firmadas al navegador.
router.get("/:id/receipt", async (req, res, next) => {
  try {
    const id = validId(req.params.id);
    const doc = await Income.findOne({ _id: id, deletedAt: null })
      .select("receipt")
      .lean();
    if (!doc) throw httpError(404, "Ingreso no encontrado");
    if (!doc.receipt?.publicId || !doc.receipt?.format) {
      throw httpError(404, "Este ingreso no tiene comprobante");
    }

    // Creamos un enlace privado de corta duración SOLO dentro del backend.
    const signedUrl = cloudinary.utils.private_download_url(
      doc.receipt.publicId,
      doc.receipt.format,
      {
        type: "authenticated",
        resource_type: "image",
        expires_at: Math.floor(Date.now() / 1000) + 60,
        attachment: false,
      }
    );

    // Descargamos el original y lo transmitimos sin mostrar su URL.
    const upstream = await fetch(signedUrl);
    if (!upstream.ok || !upstream.body) {
      throw httpError(502, "No fue posible recuperar el comprobante privado");
    }
    const mime = doc.receipt.format === "png"
      ? "image/png"
      : doc.receipt.format === "webp"
        ? "image/webp"
        : "image/jpeg";
    res.set({
      "Content-Type": mime,
      "Content-Disposition": "inline; filename=comprobante",
      "Cache-Control": "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
    });
    const stream = Readable.fromWeb(upstream.body);
    stream.on("error", (error) => res.destroy(error));
    return stream.pipe(res);
  } catch (error) { return next(error); }
});

// Origen válido para cualquier operación de escritura con cookies.
router.use(validateRequestOrigin);

// POST /api/incomes
router.post("/", optionalReceiptUpload, async (req, res, next) => {
  try {
    const fields = validateIncomePayload(requestFields(req));
    // El comprobante es opcional y privado: no afecta a los cálculos.
    let receipt = null;
    try {
      if (req.file) receipt = await uploadReceipt(req.file);
      const doc = await Income.create({
        ...fields,
        ...(receipt ? { receipt } : {}),
        createdBy: req.user._id,
      });
      res.set("Cache-Control", "private, no-store");
      return res.status(201).json({ success: true, income: toResponse(doc) });
    } catch (error) {
      await cleanupFailedUpload(receipt);
      throw error;
    }
  } catch (error) { return next(error); }
});

// PATCH /api/incomes/:id
router.patch("/:id", optionalReceiptUpload, async (req, res, next) => {
  try {
    const id = validId(req.params.id);
    const { expectedVersion, ...raw } = requestFields(req) ?? {};
    const version = validVersion(expectedVersion);
    const fields = validateIncomePayload(raw);
    const previous = await Income.findOne({ _id: id, deletedAt: null }).lean();
    if (!previous) throw httpError(404, "Ingreso no encontrado");
    if (previous.__v !== version) {
      throw httpError(409, "Otro administrador modificó el ingreso. Actualiza el listado");
    }
    // Registramos únicamente diferencias: el historial queda dentro del documento.
    const changes = WRITABLE_FIELDS.filter((field) => previous[field] !== fields[field])
      .map((field) => ({ field, before: previous[field], after: fields[field] }));
    if (!changes.length && !req.file) {
      return res.json({ success: true, income: toResponse(previous) });
    }

    let receipt = null;
    try {
      // Reemplazar es explícito: se conserva la referencia anterior en history.
      if (req.file) {
        receipt = await uploadReceipt(req.file);
        changes.push({
          field: "receipt",
          before: previous.receipt || null,
          after: receipt,
        });
      }
      const updated = await Income.findOneAndUpdate(
        { _id: id, deletedAt: null, __v: version },
        {
          $set: {
            ...fields,
            ...(receipt ? { receipt } : {}),
            updatedBy: req.user._id,
          },
          $inc: { __v: 1 },
          $push: { history: { action: "updated", by: req.user._id, at: new Date(), changes } },
        },
        { new: true, runValidators: true }
      );
      if (!updated) throw httpError(409, "El ingreso cambió mientras editabas. Actualiza el listado");
      res.set("Cache-Control", "private, no-store");
      return res.json({ success: true, income: toResponse(updated) });
    } catch (error) {
      await cleanupFailedUpload(receipt);
      throw error;
    }
  } catch (error) { return next(error); }
});

// DELETE /api/incomes/:id: solo archivado lógico, nunca borrado físico.
// No se permite retirar un ingreso recibido: primero debe anularse con auditoría.
router.delete("/:id", async (req, res, next) => {
  try {
    const id = validId(req.params.id);
    const version = validVersion(req.body?.expectedVersion);
    const previous = await Income.findOne({ _id: id, deletedAt: null }).lean();
    if (!previous) throw httpError(404, "Ingreso no encontrado");
    if (previous.status === "received") {
      throw httpError(409, "Primero edita el ingreso y cambia su estado a Anulado. Los ingresos recibidos no se eliminan directamente");
    }
    if (previous.__v !== version) {
      throw httpError(409, "Otro administrador modificó el ingreso. Actualiza el listado");
    }
    const now = new Date();
    const updated = await Income.findOneAndUpdate(
      { _id: id, deletedAt: null, __v: version, status: { $in: ["pending", "cancelled"] } },
      {
        $set: { deletedAt: now, deletedBy: req.user._id, updatedBy: req.user._id },
        $inc: { __v: 1 },
        $push: { history: { action: "archived", by: req.user._id, at: now } },
      },
      { new: true }
    );
    if (!updated) throw httpError(409, "El ingreso cambió mientras intentabas archivarlo");
    res.set("Cache-Control", "private, no-store");
    return res.json({ success: true, message: "Ingreso retirado del listado, con historial conservado" });
  } catch (error) { return next(error); }
});

export default router;
