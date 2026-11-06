// =========================================================
// INSUMOS BÁSICOS - IGLESIA EL ANCLA
// Solo existencias, mínimo, datos descriptivos y compromisos.
// =========================================================
import mongoose from "mongoose";

// Categorías que pueden elegir los administradores.
export const BASIC_SUPPLY_CATEGORIES = [
  "Alimentos", "Aseo e higiene", "Materiales educativos", "Otros",
];

// Una colaboración ofrecida todavía NO aumenta las existencias.
const pledgeSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  quantity: { type: Number, required: true, min: 1, max: 500 },
  createdAt: { type: Date, required: true, default: Date.now },
}, { _id: false, strict: true });

// Historial pequeño de entradas, consumos y entregas recibidas.
const movementSchema = new mongoose.Schema({
  type: { type: String, required: true, enum: ["income", "expense", "delivered"] },
  quantity: { type: Number, required: true, min: 1 },
  by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  at: { type: Date, required: true, default: Date.now },
}, { _id: false, strict: true });

// Todos los insumos son de uso habitual y sus necesidades son visibles.
// Ya no se almacenan unidad, ubicación, stock objetivo ni interruptores.
const supplySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
  category: { type: String, required: true, enum: BASIC_SUPPLY_CATEGORIES },
  stock: { type: Number, required: true, min: 0, max: 1000000, default: 0 },
  minimumStock: { type: Number, required: true, min: 0, max: 1000000, default: 2 },
  // Las observaciones serán visibles para los miembros cuando falte el producto.
  notes: { type: String, trim: true, maxlength: 500, default: "" },
  pledges: { type: [pledgeSchema], default: undefined },
  movements: { type: [movementSchema], default: undefined },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true, strict: true, collection: "basic_supplies" });

// El stock y el umbral mínimo no pueden tener decimales.
supplySchema.pre("validate", function () {
  if (!Number.isSafeInteger(this.stock) || !Number.isSafeInteger(this.minimumStock)) {
    this.invalidate("stock", "Las existencias y el mínimo deben ser números enteros");
  }
});

// Índice útil para ordenar el inventario administrativo.
supplySchema.index({ category: 1, name: 1 });

export default mongoose.models.BasicSupply || mongoose.model("BasicSupply", supplySchema);
