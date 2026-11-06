// =========================================================
// API DE GASTOS - IGLESIA EL ANCLA
// Sin controllers: seguimos la arquitectura actual del proyecto.
// =========================================================

import { Router } from "express";
import mongoose from "mongoose";
import multer from "multer";
import { fileTypeFromBuffer } from "file-type";
import { randomUUID } from "node:crypto";
import { Readable } from "node:stream";

import cloudinary from "../services/cloudinary/cloudinary.js";
import authenticateUser from "../middleware/authenticateUser.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import validateRequestOrigin from "../middleware/validateRequestOrigin.js";
import { deleteFinancialMovement } from "../services/audit/deletionService.js";
import Expense, {
  EXPENSE_CATEGORIES, EXPENSE_PAYMENT_METHODS, EXPENSE_STATUSES,
} from "../models/Expense.js";

const router = Router();
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const ALLOWED_IMAGE_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

// Multer almacena temporalmente el archivo en RAM, no en disco ni MongoDB.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 1, fileSize: MAX_IMAGE_BYTES, fields: 1, fieldSize: 16 * 1024 },
});

function optionalReceipt(req, res, next) {
  upload.single("receiptFile")(req, res, (error) => {
    if (!error) return next();
    return res.status(error.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({
      message: error.code === "LIMIT_FILE_SIZE"
        ? "La boleta no puede superar los 3 MB"
        : "Archivo de boleta inválido",
    });
  });
}

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function parsePayload(req) {
  // JSON directo para gastos sin imagen; FormData para gastos con imagen.
  if (typeof req.body?.payload !== "string") return req.body;
  try {
    const payload = JSON.parse(req.body.payload);
    if (payload && typeof payload === "object" && !Array.isArray(payload)) return payload;
  } catch { /* Se reporta el mismo error para cualquier JSON inválido. */ }
  throw httpError(400, "Los datos del formulario no son válidos");
}

function isRealDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
}

function getChileToday() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Santiago", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const part = (type) => parts.find((item) => item.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function requiredText(value, name, maxLength) {
  if (typeof value !== "string" || !value.trim() || value.trim().length > maxLength) {
    throw httpError(400, `${name} es obligatorio y no puede superar ${maxLength} caracteres`);
  }
  return value.trim();
}

const WRITABLE_FIELDS = [
  "description", "amount", "category", "date", "status",
  "paymentMethod", "dueDate", "paidAt", "notes",
];

function validateExpense(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw httpError(400, "El gasto debe ser un objeto JSON");
  }
  const allowed = new Set([...WRITABLE_FIELDS, "removeReceipt"]);
  for (const key of Object.keys(input)) {
    if (!allowed.has(key)) throw httpError(400, `No se permite modificar '${key}'`);
  }
  const description = requiredText(input.description, "La descripción", 150);
  if (!Number.isSafeInteger(input.amount) || input.amount <= 0) {
    throw httpError(400, "El monto CLP debe ser un número entero positivo");
  }
  if (!EXPENSE_CATEGORIES.includes(input.category)) {
    throw httpError(400, "Selecciona una categoría válida");
  }
  if (!isRealDate(input.date)) throw httpError(400, "La fecha del gasto es inválida");
  if (!EXPENSE_STATUSES.includes(input.status)) throw httpError(400, "Selecciona un estado válido");
  if (!EXPENSE_PAYMENT_METHODS.includes(input.paymentMethod)) {
    throw httpError(400, "Selecciona un medio de pago válido");
  }
  if (typeof input.removeReceipt !== "undefined" && typeof input.removeReceipt !== "boolean") {
    throw httpError(400, "La opción de quitar boleta no es válida");
  }
  const dueDate = input.dueDate || null;
  const paidAt = input.status === "Pagado" ? (input.paidAt || null) : null;
  if (dueDate !== null && !isRealDate(dueDate)) {
    throw httpError(400, "La fecha de vencimiento es inválida");
  }
  if (input.status === "Pendiente" && dueDate === null) {
    throw httpError(400, "Los gastos pendientes necesitan fecha de vencimiento");
  }
  if (input.status === "Pagado") {
    if (!isRealDate(paidAt) || paidAt < input.date || paidAt > getChileToday()) {
      throw httpError(400, "La fecha de pago debe ser válida, no anterior al gasto ni futura");
    }
  }
  const notes = input.notes ?? "";
  if (typeof notes !== "string" || notes.trim().length > 1000) {
    throw httpError(400, "Las observaciones no pueden superar 1000 caracteres");
  }
  return {
    fields: {
      description,
      amount: input.amount,
      category: input.category,
      date: input.date,
      status: input.status,
      paymentMethod: input.paymentMethod,
      dueDate,
      paidAt,
      notes: notes.trim(),
    },
    removeReceipt: input.removeReceipt === true,
  };
}

function validId(id) {
  if (!mongoose.isObjectIdOrHexString(id)) throw httpError(400, "Identificador de gasto inválido");
  return id;
}
function validVersion(value) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw httpError(400, "Versión del gasto inválida; recarga la página");
  }
  return value;
}

// Los datos que recibe React no revelan IDs internos de Cloudinary.
function toResponse(doc) {
  return {
    id: String(doc._id),
    description: doc.description,
    amount: doc.amount,
    category: doc.category,
    date: doc.date,
    status: doc.status,
    paymentMethod: doc.paymentMethod,
    dueDate: doc.dueDate || "",
    paidAt: doc.paidAt || "",
    notes: doc.notes || "",
    hasReceipt: Boolean(doc.receipt?.publicId),
    version: doc.__v,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

// Las boletas siempre se guardan como originales autenticados, no públicos.
async function uploadReceipt(file) {
  const detected = await fileTypeFromBuffer(file.buffer);
  if (!detected || !ALLOWED_IMAGE_MIME.has(detected.mime) ||
      file.size <= 0 || file.size > MAX_IMAGE_BYTES) {
    throw httpError(400, "Solo se admiten imágenes JPG, PNG o WebP de hasta 3 MB");
  }
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({
      folder: "el-ancla/finanzas/gastos-comprobantes",
      public_id: randomUUID(),
      resource_type: "image",
      type: "authenticated",
      overwrite: false,
    }, (error, result) => {
      if (error) return reject(error);
      if (!result?.public_id || !result?.format) {
        return reject(new Error("Cloudinary no confirmó la imagen"));
      }
      resolve({ publicId: result.public_id, format: result.format });
    });
    stream.end(file.buffer);
  });
}

async function cleanupFailedUpload(receipt) {
  if (!receipt?.publicId) return;
  try {
    await cloudinary.uploader.destroy(receipt.publicId, {
      resource_type: "image", type: "authenticated", invalidate: true,
    });
  } catch (error) {
    console.error("Subida nueva de boleta pendiente de limpieza:", error.message);
  }
}

// Nunca permitimos a miembros consultar gastos ni boletas.
router.use(authenticateUser, authorizeRoles("admin", "super_admin"));

// GET /api/expenses - todas las entradas activas para paneles y notificaciones.
router.get("/", async (_req, res, next) => {
  try {
    const docs = await Expense.find({ deletedAt: null })
      .sort({ date: -1, createdAt: -1 }).lean();
    res.set("Cache-Control", "private, no-store");
    return res.json({ success: true, expenses: docs.map(toResponse) });
  } catch (error) { return next(error); }
});

// GET /api/expenses/:id/receipt - stream seguro desde Express con cookies JWT.
router.get("/:id/receipt", async (req, res, next) => {
  try {
    const doc = await Expense.findOne({ _id: validId(req.params.id), deletedAt: null })
      .select("receipt").lean();
    if (!doc) throw httpError(404, "Gasto no encontrado");
    if (!doc.receipt?.publicId || !doc.receipt?.format) {
      throw httpError(404, "El gasto no tiene comprobante");
    }
    const signedUrl = cloudinary.utils.private_download_url(
      doc.receipt.publicId,
      doc.receipt.format,
      {
        type: "authenticated", resource_type: "image",
        expires_at: Math.floor(Date.now() / 1000) + 60,
        attachment: false,
      }
    );
    const upstream = await fetch(signedUrl);
    if (!upstream.ok || !upstream.body) {
      throw httpError(502, "No fue posible recuperar la boleta privada");
    }
    const mime = doc.receipt.format === "png" ? "image/png"
      : doc.receipt.format === "webp" ? "image/webp" : "image/jpeg";
    res.set({
      "Content-Type": mime,
      "Content-Disposition": "inline; filename=boleta",
      "Cache-Control": "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
    });
    const stream = Readable.fromWeb(upstream.body);
    stream.on("error", (error) => res.destroy(error));
    return stream.pipe(res);
  } catch (error) { return next(error); }
});

// Origen confiable obligatorio para crear, editar y eliminar con cookies.
router.use(validateRequestOrigin);

// POST /api/expenses - crear gasto y opcionalmente subir comprobante.
router.post("/", optionalReceipt, async (req, res, next) => {
  try {
    const { fields, removeReceipt } = validateExpense(parsePayload(req));
    if (removeReceipt && req.file) throw httpError(400, "No se puede adjuntar y retirar una boleta a la vez");
    let receipt = null;
    try {
      if (req.file) receipt = await uploadReceipt(req.file);
      const doc = await Expense.create({
        ...fields,
        ...(receipt ? { receipt } : {}),
        createdBy: req.user._id,
      });
      res.set("Cache-Control", "private, no-store");
      return res.status(201).json({ success: true, expense: toResponse(doc) });
    } catch (error) {
      await cleanupFailedUpload(receipt);
      throw error;
    }
  } catch (error) { return next(error); }
});

// PATCH /api/expenses/:id - control de versiones y cambios auditados.
router.patch("/:id", optionalReceipt, async (req, res, next) => {
  try {
    const id = validId(req.params.id);
    const { expectedVersion, ...raw } = parsePayload(req) ?? {};
    const version = validVersion(expectedVersion);
    const { fields, removeReceipt } = validateExpense(raw);
    if (removeReceipt && req.file) throw httpError(400, "No se puede adjuntar y retirar una boleta a la vez");
    const previous = await Expense.findOne({ _id: id, deletedAt: null }).lean();
    if (!previous) throw httpError(404, "Gasto no encontrado");
    if (previous.__v !== version) throw httpError(409, "Otro administrador modificó el gasto. Recarga la página");

    // Cambios mínimos: valores antes y después, sin clonar todo el documento.
    const changes = WRITABLE_FIELDS.filter((field) => (previous[field] ?? null) !== (fields[field] ?? null))
      .map((field) => ({ field, before: previous[field] ?? null, after: fields[field] ?? null }));
    const hasReceiptChange = Boolean(req.file || (removeReceipt && previous.receipt?.publicId));
    if (!changes.length && !hasReceiptChange) {
      return res.json({ success: true, expense: toResponse(previous) });
    }

    let receipt = null;
    try {
      if (req.file) receipt = await uploadReceipt(req.file);
      if (hasReceiptChange) {
        changes.push({ field: "receipt", before: previous.receipt || null,
          after: receipt || null });
      }
      const setFields = { ...fields, updatedBy: req.user._id };
      const update = {
        $set: { ...setFields, ...(receipt ? { receipt } : {}) },
        $inc: { __v: 1 },
        $push: { history: { action: "updated", by: req.user._id, at: new Date(), changes } },
      };
      if (removeReceipt && !receipt && previous.receipt?.publicId) {
        update.$unset = { receipt: 1 };
      }
      const updated = await Expense.findOneAndUpdate(
        { _id: id, deletedAt: null, __v: version }, update,
        { new: true, runValidators: true }
      );
      if (!updated) throw httpError(409, "El gasto cambió mientras editabas. Recarga la página");
      res.set("Cache-Control", "private, no-store");
      return res.json({ success: true, expense: toResponse(updated) });
    } catch (error) {
      await cleanupFailedUpload(receipt);
      throw error;
    }
  } catch (error) { return next(error); }
});

// DELETE /api/expenses/:id - SOLO TRAS ANULAR.
// Solo confirma éxito después de borrar en MongoDB y registrar la auditoría.
// Si Cloudinary falla, sus referencias quedan pendientes para mantenimiento.
router.delete("/:id", async (req, res, next) => {
  try {
    const id = validId(req.params.id);
    const expectedVersion = validVersion(req.body?.expectedVersion);
    const outcome = await deleteFinancialMovement({
      model: Expense, resourceType: "expense",
      resourceId: id, expectedVersion, deletedBy: req.user._id,
    });
    res.set("Cache-Control", "private, no-store");
    return res.json({
      success: true,
      ...outcome,
      message: outcome.cleanupPending
        ? "Gasto eliminado definitivamente. Hay comprobantes pendientes de limpieza externa"
        : "Gasto eliminado definitivamente; auditoría conservada",
    });
  } catch (error) { return next(error); }
});

export default router;
