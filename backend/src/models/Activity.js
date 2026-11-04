// =========================================================
// MODELO DE ACTIVIDADES PUNTUALES - IGLESIA EL ANCLA
// Colección: activities | SIN recurrencia semanal.
// =========================================================

// Importamos Mongoose para definir el documento de actividad.
import mongoose from "mongoose";

// Reutilizamos el constructor oficial de esquemas.
const { Schema } = mongoose;

// Las fechas y horas se interpretan en Chile continental.
// No guardamos esta cadena repetida en cada documento.
export const ACTIVITY_TIME_ZONE = "America/Santiago";

// Verifica que YYYY-MM-DD sea una fecha real del calendario.
function isValidDateOnly(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

// Comprueba una hora civil HH:mm sin transformarla a UTC.
function isValidLocalTime(value) {
  return typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

// Solo guardamos la URL y el identificador de una imagen Cloudinary.
const imageSchema = new Schema(
  {
    // URL HTTPS utilizada para visualizar la imagen.
    url: { type: String, trim: true, required: true },
    // Referencia interna necesaria para eliminar o reemplazar la imagen.
    publicId: { type: String, trim: true, required: true, select: false },
  },
  { _id: false, strict: true }
);

// Las opciones para cooperar viven dentro de la actividad, no en una colección nueva.
const cooperationItemSchema = new Schema({
  name: { type: String, trim: true, required: true, maxlength: 60 },
  // Cantidad total que todos los miembros pueden comprometer para este aporte.
  maxQuantity: { type: Number, required: true, min: 1, max: 500 },
}, { strict: true });

const cooperationSchema = new Schema({
  enabled: { type: Boolean, default: false },
  items: { type: [cooperationItemSchema], default: undefined },
}, { _id: false, strict: true });

// Cada actividad corresponde a una fecha concreta: bingo, lota, taller, etc.
const activitySchema = new Schema(
  {
    // Nombre y contenido que verá la comunidad registrada.
    title: { type: String, trim: true, required: true, maxlength: 120 },
    category: {
      type: String,
      required: true,
      enum: [
        "Bingo", "Lota", "Encuentro", "Taller", "Jóvenes",
        "Niños", "Actividad solidaria", "Convivencia",
        "Actividad especial", "Otro",
      ],
    },
    description: { type: String, trim: true, required: true, maxlength: 2000 },

    // Día de la actividad; se almacena como fecha civil YYYY-MM-DD.
    date: {
      type: String,
      required: true,
      validate: { validator: isValidDateOnly, message: "Fecha de actividad inválida" },
    },
    // Hora de inicio local.
    time: {
      type: String,
      required: true,
      validate: { validator: isValidLocalTime, message: "Hora de inicio inválida" },
    },
    // Hora de término opcional, en el mismo día.
    endTime: {
      type: String,
      default: undefined,
      validate: {
        validator: (value) => value == null || value === "" || isValidLocalTime(value),
        message: "Hora de término inválida",
      },
    },

    // Datos de la convocatoria según su modalidad.
    modality: {
      type: String,
      required: true,
      enum: ["Presencial", "Online", "Híbrida"],
    },
    location: { type: String, trim: true, maxlength: 300, default: undefined },
    meetingUrl: { type: String, trim: true, maxlength: 2000, default: undefined },

    // Las actividades pueden tener inscripción; no los eventos públicos.
    requiresConfirmation: { type: Boolean, default: false },
    capacity: { type: Number, min: 1, default: undefined },

    // Lista opcional de aportes (bebida, queque, galletas...) y cupos máximos.
    cooperation: { type: cooperationSchema, default: () => ({ enabled: false }) },

    // Solo se muestra al miembro si el administrador la publicó.
    publicationStatus: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    // Portada opcional alojada fuera de Atlas.
    image: { type: imageSchema, default: undefined },

    // Auditoría liviana: creador y último editor.
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: undefined },
  },
  {
    // Registra createdAt y updatedAt automáticamente.
    timestamps: true,
    // Ignora campos que no forman parte de actividades puntuales.
    strict: true,
  }
);

// Verifica condiciones que dependen de varios campos a la vez.
activitySchema.pre("validate", function validateRelatedFields(next) {
  // La actividad finaliza el mismo día después de comenzar.
  if (this.endTime && this.time && this.endTime <= this.time) {
    this.invalidate("endTime", "La hora de término debe ser posterior a la de inicio");
  }
  // Se necesita dirección para actividad presencial o híbrida.
  if (this.modality && this.modality !== "Online" && !this.location?.trim()) {
    this.invalidate("location", "Debes indicar la ubicación de la actividad");
  }
  // Se necesita enlace para actividad online o híbrida.
  if (this.modality && this.modality !== "Presencial") {
    try {
      const url = new URL(this.meetingUrl || "");
      if (!["http:", "https:"].includes(url.protocol)) throw new Error("Protocolo inválido");
    } catch {
      this.invalidate("meetingUrl", "Debes indicar un enlace de reunión válido");
    }
  }
  // Cooperar exige una inscripción, pues el aporte debe pertenecer a un miembro.
  if (this.cooperation?.enabled) {
    if (!this.requiresConfirmation) {
      this.invalidate("requiresConfirmation", "Activa la confirmación para organizar cooperaciones");
    }
    const items = this.cooperation.items || [];
    if (items.length < 1 || items.length > 20) {
      this.invalidate("cooperation.items", "Define entre 1 y 20 tipos de cooperación");
    }
    const names = items.map((item) => (item.name || "").trim().toLocaleLowerCase("es-CL"));
    if (new Set(names).size !== names.length) {
      this.invalidate("cooperation.items", "No repitas nombres de aportes dentro de la actividad");
    }
  } else if (this.cooperation) {
    // Una actividad sin cooperación no guarda listas vacías innecesarias.
    this.cooperation.items = undefined;
  }
  // Sin confirmaciones tampoco necesitamos un límite de cupos.
  if (!this.requiresConfirmation) this.capacity = undefined;
  next();
});

// Índice para recuperar actividades publicadas ordenadas por fecha.
activitySchema.index({ publicationStatus: 1, date: 1, time: 1 });

// Mongoose crea la colección 'activities', nunca 'events'.
const Activity = mongoose.models.Activity || mongoose.model("Activity", activitySchema);

// Exportamos el modelo para las rutas y el historial administrativo.
export default Activity;
