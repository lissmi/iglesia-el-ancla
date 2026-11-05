// =========================================================
// TURNOS DE VOLUNTARIADO - IGLESIA EL ANCLA
// Un documento representa un servicio con varios participantes.
// Se conservan los campos heredados para leer los turnos existentes.
// =========================================================
import mongoose from "mongoose";
import { VOLUNTEER_TEAM_IDS } from "./Volunteer.js";

const { Schema } = mongoose;

// Fechas y horas civiles de Chile, sin convertirlas a UTC al guardarlas.
function validDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
const validTime = (value) => typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

// Cada persona confirma o rechaza su participación de manera independiente.
const participantSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["pending", "confirmed", "declined"], default: "pending" },
  respondedAt: { type: Date, default: null },

  // Control del correo recordatorio para ESTE participante y ESTE horario.
  // Se guarda dentro del mismo turno; no crea una colección adicional.
  reminderEmail: {
    scheduleKey: { type: String, default: null },
    claimedAt: { type: Date, default: null },
    sentAt: { type: Date, default: null },
  },
}, { _id: false, strict: true });

const assignmentSchema = new Schema({
  teamId: { type: String, required: true, enum: VOLUNTEER_TEAM_IDS },
  branchId: { type: Schema.Types.ObjectId, ref: "Sucursal", required: true },
  title: { type: String, trim: true, required: true, minlength: 3, maxlength: 120 },
  description: { type: String, trim: true, maxlength: 500, default: "" },
  date: { type: String, required: true, validate: { validator: validDate, message: "Fecha inválida" } },
  startTime: { type: String, required: true, validate: { validator: validTime, message: "Hora inicial inválida" } },
  endTime: { type: String, required: true, validate: { validator: validTime, message: "Hora final inválida" } },
  location: { type: String, trim: true, maxlength: 150, default: "" },
  activityId: { type: Schema.Types.ObjectId, ref: "Activity", default: null },
  notes: { type: String, trim: true, maxlength: 1000, default: "" },

  // Cupos requeridos: por ejemplo, 2 personas para el equipo de alabanza.
  requiredVolunteers: { type: Number, min: 1, max: 20, default: 1 },
  participants: {
    type: [participantSchema], default: undefined,
    validate: {
      validator: (items) => !items || (items.length <= 20 &&
        new Set(items.map((person) => String(person.userId))).size === items.length),
      message: "No puedes repetir voluntarios dentro de un servicio",
    },
  },

  // Estado de SERVICIO: no reemplaza el estado individual de cada miembro.
  status: { type: String, enum: ["pending", "confirmed", "declined", "cancelled"], default: "pending" },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: undefined },

  // Compatibilidad de lectura con turnos creados en la primera versión.
  volunteerId: { type: Schema.Types.ObjectId, ref: "User", default: null },
  respondedAt: { type: Date, default: null },
}, { timestamps: true, strict: true });

assignmentSchema.pre("validate", function validateService(next) {
  if (this.startTime && this.endTime && this.endTime <= this.startTime) {
    this.invalidate("endTime", "La hora de término debe ser posterior al inicio");
  }
  if (this.participants?.length > this.requiredVolunteers) {
    this.invalidate("participants", "Aumenta los cupos antes de asignar más personas");
  }
  next();
});

assignmentSchema.index({ branchId: 1, date: 1, startTime: 1 });
assignmentSchema.index({ volunteerId: 1, date: 1 }); // Turnos heredados.
assignmentSchema.index({ "participants.userId": 1, date: 1 }); // Turnos nuevos.

const VolunteerAssignment = mongoose.models.VolunteerAssignment ||
  mongoose.model("VolunteerAssignment", assignmentSchema);
export default VolunteerAssignment;
