// =========================================================
// MODELO DE INGRESOS - IGLESIA EL ANCLA
// Un documento por movimiento; sin archivos ni montos decimales.
// =========================================================

import mongoose from "mongoose";

// Los valores coinciden con los formularios y gráficos existentes.
export const INCOME_CATEGORIES = [
  "tithes", "offerings", "donations", "activities", "other",
];
export const INCOME_PAYMENT_METHODS = [
  "cash", "transfer", "card", "other",
];
export const INCOME_STATUSES = [
  "received", "pending", "cancelled",
];

// Conservamos los cambios de campos sin duplicar documentos completos.
const changeSchema = new mongoose.Schema({
  field: { type: String, required: true },
  before: { type: mongoose.Schema.Types.Mixed },
  after: { type: mongoose.Schema.Types.Mixed },
}, { _id: false });

// Registro interno: quién cambió qué y cuándo.
const historySchema = new mongoose.Schema({
  action: { type: String, enum: ["updated", "archived"], required: true },
  by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  at: { type: Date, required: true },
  changes: { type: [changeSchema], default: undefined },
}, { _id: false });

const incomeSchema = new mongoose.Schema({
  concept: { type: String, required: true, trim: true, maxlength: 120 },
  category: { type: String, required: true, enum: INCOME_CATEGORIES },
  amount: {
    type: Number,
    required: true,
    validate: {
      validator: (value) => Number.isSafeInteger(value) && value > 0,
      message: "El monto debe ser un entero CLP positivo y seguro",
    },
  },
  // YYYY-MM-DD evita desplazar el día al convertir zonas horarias.
  date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  paymentMethod: { type: String, required: true, enum: INCOME_PAYMENT_METHODS },
  status: { type: String, required: true, enum: INCOME_STATUSES },
  reference: { type: String, trim: true, maxlength: 100, default: "" },
  responsible: { type: String, trim: true, maxlength: 100, default: "" },
  notes: { type: String, trim: true, maxlength: 1000, default: "" },
  // Solo guardamos la referencia privada: los bytes permanecen en Cloudinary.
  // Si se reemplaza un respaldo, el anterior queda en history para auditoría.
  receipt: {
    publicId: { type: String, trim: true },
    format: { type: String, enum: ["jpg", "jpeg", "png", "webp"] },
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  // El borrado es lógico para preservar la trazabilidad contable.
  deletedAt: { type: Date, default: null },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  history: { type: [historySchema], default: undefined },
}, {
  timestamps: true,
  collection: "incomes",
  versionKey: "__v", // Se incrementa al editar para evitar sobreescrituras concurrentes.
});

// Índice útil para el listado administrativo y consultas futuras.
incomeSchema.index({ deletedAt: 1, date: -1, createdAt: -1 });

export default mongoose.model("Income", incomeSchema);
