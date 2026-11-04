// =========================================================
// CONFIRMACIÓN DE UNA ACTIVIDAD PUNTUAL - IGLESIA EL ANCLA
// Colección: activityconfirmations | Una fila por miembro.
// =========================================================

// Importamos el ODM utilizado por el backend.
import mongoose from "mongoose";

// Guardamos solo las referencias y la fecha real de confirmación.
const activityConfirmationSchema = new mongoose.Schema(
  {
    // Actividad puntual a la que se confirma el miembro.
    activity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Activity",
      required: true,
    },
    // Cuenta que confirma, siempre obtenida de la sesión.
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Aportes reservados por el miembro; permanecen en su confirmación existente.
    contributions: {
      type: [new mongoose.Schema({
        itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
        quantity: { type: Number, required: true, min: 1, max: 20 },
      }, { _id: false, strict: true })],
      default: undefined,
    },
    // Instante en que se creó la confirmación.
    confirmedAt: { type: Date, default: Date.now, required: true },
  },
  { strict: true, timestamps: false }
);

// Cada miembro puede confirmar una única vez una actividad.
activityConfirmationSchema.index({ activity: 1, member: 1 }, { unique: true });

// Optimiza las consultas por actividad y el cómputo de cupos.
activityConfirmationSchema.index({ activity: 1, confirmedAt: 1 });

// Creamos la colección activityconfirmations sin referirnos a eventos.
const ActivityConfirmation = mongoose.models.ActivityConfirmation ||
  mongoose.model("ActivityConfirmation", activityConfirmationSchema);

// Exportamos la referencia para las rutas protegidas.
export default ActivityConfirmation;
