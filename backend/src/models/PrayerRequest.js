// =========================================================
// PETICIONES DE ORACIÓN - IGLESIA EL ANCLA
// Archivo: backend/src/models/PrayerRequest.js
// Un solo documento guarda la petición y quiénes la acompañan.
// =========================================================

// Importamos Mongoose para declarar los datos persistentes.
import mongoose from "mongoose";

// Extraemos el constructor de esquemas.
const { Schema } = mongoose;

// Categorías compartidas con los formularios existentes.
export const PRAYER_CATEGORIES = [
  "Salud", "Familia", "Trabajo", "Estudios", "Espiritual",
  "Personal", "Agradecimiento", "Otro",
];

// Estados gestionados exclusivamente por administradores.
export const PRAYER_STATUSES = ["pending", "praying", "answered", "completed"];

// Esquema liviano: no guardamos nombres repetidos ni registros por cada oración.
const prayerRequestSchema = new Schema({
  title: { type: String, required: true, trim: true, minlength: 3, maxlength: 120 },
  description: { type: String, required: true, trim: true, minlength: 5, maxlength: 2000 },
  category: { type: String, required: true, enum: PRAYER_CATEGORIES },
  visibility: { type: String, required: true, enum: ["community", "private"], default: "community" },
  anonymous: { type: Boolean, default: false },
  status: { type: String, enum: PRAYER_STATUSES, default: "pending" },

  // Nota estrictamente interna: nunca se serializa para miembros.
  followUpNote: { type: String, trim: true, maxlength: 1000, default: "", select: false },

  // Solo identificadores; $addToSet evita duplicados por miembro.
  // Nunca devolvemos esta lista al navegador (solo contador y "prayingByMe").
  prayingMembers: { type: [{ type: Schema.Types.ObjectId, ref: "User" }], default: [], select: false },

  // La identidad siempre procede de la sesión, no de React.
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: undefined },
}, {
  timestamps: true,
  strict: true,
  versionKey: false,
});

// Lectura de la pestaña comunitaria por fecha más reciente.
prayerRequestSchema.index({ visibility: 1, createdAt: -1 });

// Consulta de las peticiones personales de un miembro.
prayerRequestSchema.index({ createdBy: 1, createdAt: -1 });

// Administración: permite filtrar por estado y fecha.
prayerRequestSchema.index({ status: 1, createdAt: -1 });

// Evitamos redefinir el modelo en recargas del servidor.
const PrayerRequest = mongoose.models.PrayerRequest ||
  mongoose.model("PrayerRequest", prayerRequestSchema);

// Exportamos el modelo único del módulo.
export default PrayerRequest;
