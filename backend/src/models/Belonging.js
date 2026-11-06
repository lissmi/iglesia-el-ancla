// =========================================================
// BIENES DE LA IGLESIA: MODELOS COMPACTOS
// Un archivo para los bienes y sus movimientos históricos.
// No almacenamos ubicación, responsable ni adquisición.
// =========================================================
import mongoose from "mongoose";

export const BELONGING_CATEGORIES = [
  "CAT-001", "CAT-002", "CAT-003", "CAT-004", "CAT-005", "CAT-006",
];
export const BELONGING_CONDITIONS = [
  "excellent", "good", "fair", "damaged", "out_of_service",
];
export const BELONGING_MOVEMENT_TYPES = ["registration", "inspection", "adjustment"];

// Documento principal: solo la información necesaria para el inventario.
const belongingSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
  categoryId: { type: String, required: true, enum: BELONGING_CATEGORIES },
  quantity: { type: Number, required: true, min: 1, max: 100000 },
  condition: { type: String, required: true, enum: BELONGING_CONDITIONS, default: "good" },
  description: { type: String, trim: true, maxlength: 1000, default: "" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true, strict: true, collection: "belongings" });

belongingSchema.pre("validate", function () {
  // Todas las existencias se registran en unidades completas.
  if (!Number.isSafeInteger(this.quantity)) {
    this.invalidate("quantity", "Indica una cantidad entera válida de unidades");
  }
});
belongingSchema.index({ categoryId: 1, name: 1 });

// Historial separado para que no crezca ilimitadamente cada bien.
// Es otro modelo, pero no necesitamos crear otro archivo JS.
const movementSchema = new mongoose.Schema({
  belongingId: { type: mongoose.Schema.Types.ObjectId, ref: "Belonging", required: true, index: true },
  type: { type: String, required: true, enum: BELONGING_MOVEMENT_TYPES },
  quantity: { type: Number, required: true, min: 1, max: 100000 },
  // En ajustes: cantidad de diferencia (+/-). En inspecciones: unidad 0.
  delta: { type: Number, default: 0 },
  previousCondition: { type: String, enum: BELONGING_CONDITIONS },
  newCondition: { type: String, enum: BELONGING_CONDITIONS },
  date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  description: { type: String, trim: true, maxlength: 1000, default: "" },
  by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true, strict: true, collection: "belonging_movements" });
movementSchema.index({ date: -1, createdAt: -1 });

const Belonging = mongoose.models.Belonging || mongoose.model("Belonging", belongingSchema);
export const BelongingMovement = mongoose.models.BelongingMovement || mongoose.model("BelongingMovement", movementSchema);
export default Belonging;
