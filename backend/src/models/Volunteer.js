// =========================================================
// VOLUNTARIADO - PERFIL VINCULADO A UN MIEMBRO REAL
// =========================================================
import mongoose from "mongoose";

const { Schema } = mongoose;

// Los códigos corresponden a VolunteersTeams.jsx.
export const VOLUNTEER_TEAM_IDS = [
  "worship", "bible_studies", "children", "youth",
  "communications", "cleaning", "events",
];

// No duplicamos nombre, correo ni contraseña; pertenecen a User.
const volunteerSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  teams: {
    type: [{ type: String, enum: VOLUNTEER_TEAM_IDS }],
    validate: {
      validator: (teams) => Array.isArray(teams) && teams.length >= 1 &&
        teams.length <= VOLUNTEER_TEAM_IDS.length && new Set(teams).size === teams.length,
      message: "Selecciona entre uno y siete equipos distintos",
    },
  },
  status: { type: String, enum: ["active", "inactive"], default: "active", required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: undefined },
}, { timestamps: true, strict: true });

volunteerSchema.index({ status: 1 });

const Volunteer = mongoose.models.Volunteer || mongoose.model("Volunteer", volunteerSchema);
export default Volunteer;
