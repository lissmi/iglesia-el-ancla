// =========================================================
// MODELO DE GASTOS - IGLESIA EL ANCLA
// Un documento por movimiento. Los archivos viven en Cloudinary.
// =========================================================

import mongoose from "mongoose";

// Valores compatibles con el formulario y los filtros existentes.
export const EXPENSE_CATEGORIES = [
  "Arriendo", "Servicios básicos", "Internet", "Materiales", "Alimentación",
  "Actividades", "Aseo", "Mantención", "Equipamiento", "Otros",
];
export const EXPENSE_PAYMENT_METHODS = [
  "Transferencia", "Efectivo", "Débito", "Crédito", "Otro",
];
export const EXPENSE_STATUSES = ["Pagado", "Pendiente", "Anulado"];

// Únicamente guardamos referencias de imágenes privadas, nunca sus bytes.
const receiptSchema = new mongoose.Schema({
  publicId: { type: String, required: true, trim: true },
  format: { type: String, required: true, enum: ["jpg", "jpeg", "png", "webp"] },
}, { _id: false, strict: true });

// Guardamos las diferencias para poder auditar actualizaciones.
const changeSchema = new mongoose.Schema({
  field: { type: String, required: true },
  before: mongoose.Schema.Types.Mixed,
  after: mongoose.Schema.Types.Mixed,
}, { _id: false });

const historySchema = new mongoose.Schema({
  action: { type: String, required: true, enum: ["updated", "archived"] },
  by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  at: { type: Date, required: true },
  changes: { type: [changeSchema], default: undefined },
}, { _id: false });

const expenseSchema = new mongoose.Schema({
  description: { type: String, required: true, trim: true, maxlength: 150 },
  amount: {
    type: Number,
    required: true,
    validate: {
      validator: (value) => Number.isSafeInteger(value) && value > 0,
      message: "El monto debe ser un entero positivo en CLP",
    },
  },
  category: { type: String, required: true, enum: EXPENSE_CATEGORIES },
  // Fechas civiles (YYYY-MM-DD) para evitar desplazamientos por zona horaria.
  date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  status: { type: String, required: true, enum: EXPENSE_STATUSES },
  paymentMethod: { type: String, required: true, enum: EXPENSE_PAYMENT_METHODS },
  dueDate: { type: String, default: null },
  paidAt: { type: String, default: null },
  notes: { type: String, trim: true, maxlength: 1000, default: "" },
  receipt: { type: receiptSchema, default: undefined },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  deletedAt: { type: Date, default: null },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  history: { type: [historySchema], default: undefined },
}, {
  timestamps: true,
  collection: "expenses",
  versionKey: "__v",
});

// Consultas administrativas por estado y fechas.
expenseSchema.index({ deletedAt: 1, date: -1, createdAt: -1 });

export default mongoose.model("Expense", expenseSchema);
