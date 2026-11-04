/* =========================================================
   EVENTOS PÚBLICOS RECURRENTES - IGLESIA EL ANCLA
   Archivo: backend/src/models/Event.js
   Las actividades puntuales usan Activity.js.
========================================================= */

// Mongoose define el esquema y la colección de MongoDB.
import mongoose from "mongoose";
const { Schema } = mongoose;

// Los horarios se guardan como hora local de Chile continental.
export const EVENT_TIME_ZONE = "America/Santiago";

// Valida fechas civiles YYYY-MM-DD sin convertir la hora del evento.
function isValidDateOnly(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

// Acepta horas entre 00:00 y 23:59.
function isValidLocalTime(value) {
  return typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

// Un evento puede repetirse semanalmente o cierto número de veces al mes.
const recurrenceSchema = new Schema({
  type: {
    type: String,
    enum: ["weekly", "monthly"],
    required: true,
    default: "weekly",
  },
  daysOfWeek: {
    type: [Number],
    default: undefined,
    validate: {
      // Sin día fijo: para un evento mensual permitimos [] y publicamos
      // «fechas por confirmar». En semanal sí se requiere al menos un día.
      validator: function validateDays(days) {
        return Array.isArray(days) &&
          (this.type === "monthly" || days.length > 0) &&
          days.every((day) => Number.isInteger(day) && day >= 0 && day <= 6) &&
          new Set(days).size === days.length;
      },
      message: "Selecciona uno o más días válidos, sin repetirlos",
    },
  },
  // Para eventos mensuales: cantidad de encuentros en un mismo mes.
  // En eventos semanales no se almacena.
  monthlyCount: {
    type: Number,
    min: 1,
    max: 4,
    default: undefined,
  },
  // Semanas concretas del mes (opcional): 1, 2, 3, 4 o -1 (última).
  // Si no se guarda, las fechas exactas están por confirmar.
  weeksOfMonth: {
    type: [Number],
    default: undefined,
    validate: {
      validator: (weeks) => weeks === undefined || (
        Array.isArray(weeks) &&
        weeks.length > 0 &&
        weeks.every((week) => [1, 2, 3, 4, -1].includes(week)) &&
        new Set(weeks).size === weeks.length &&
        !(weeks.includes(4) && weeks.includes(-1))
      ),
      message: "Las semanas elegidas deben ser válidas y no repetirse",
    },
  },
  endDate: {
    type: String,
    default: undefined,
    validate: {
      validator: (date) => date == null || isValidDateOnly(date),
      message: "Fecha de término de recurrencia inválida",
    },
  },
}, { _id: false, strict: true });

// En MongoDB solo almacenamos la URL y el ID de Cloudinary.
const imageSchema = new Schema({
  url: { type: String, required: true, trim: true },
  publicId: { type: String, required: true, trim: true, select: false },
}, { _id: false, strict: true });

// Datos de las reuniones públicas; no hay confirmaciones ni cupos.
const eventSchema = new Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  category: {
    type: String,
    required: true,
    enum: ["Culto", "Oración", "Estudio bíblico", "Jóvenes", "Niños", "Taller", "Otro"],
  },
  description: { type: String, required: true, trim: true, maxlength: 2000 },

  // Fecha inicial y horarios habituales de la reunión.
  date: {
    type: String,
    required: true,
    validate: { validator: isValidDateOnly, message: "Fecha de inicio inválida" },
  },
  time: {
    type: String,
    required: true,
    validate: { validator: isValidLocalTime, message: "Hora de inicio inválida" },
  },
  endTime: {
    type: String,
    default: undefined,
    validate: {
      validator: (value) => value == null || isValidLocalTime(value),
      message: "Hora de término inválida",
    },
  },

  // Modalidad presencial, en línea o combinada.
  modality: {
    type: String,
    required: true,
    enum: ["Presencial", "Online", "Híbrida"],
  },
  location: { type: String, trim: true, maxlength: 300, default: undefined },

  // Enlace opcional: la iglesia puede enviarlo por privado.
  meetingUrl: { type: String, trim: true, maxlength: 2000, default: undefined },

  // Una programación puede ser indefinida o tener fecha de término.
  recurrence: {
    type: recurrenceSchema,
    required: true,
    default: () => ({ type: "weekly" }),
  },
  publicationStatus: {
    type: String,
    enum: ["draft", "published"],
    default: "draft",
  },
  image: { type: imageSchema, default: undefined },

  // Auditoría de creación y última edición.
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: undefined },
}, { timestamps: true, strict: true });

/* =========================================================
   VALIDACIONES ENTRE CAMPOS
========================================================= */

eventSchema.pre("validate", function validateEventFields() {
  // Una hora final no puede ser anterior al inicio.
  if (this.endTime && this.time && this.endTime <= this.time) {
    this.invalidate("endTime", "La hora de término debe ser posterior al inicio");
  }

  // Los encuentros presenciales e híbridos sí requieren ubicación.
  if (this.modality && this.modality !== "Online" && !this.location?.trim()) {
    this.invalidate("location", "Debes indicar la ubicación del evento");
  }

  // Si el evento es exclusivamente online, no almacenamos ubicación física.
  if (this.modality === "Online") {
    this.location = undefined;
  }

  // El enlace online es OPCIONAL, pero debe ser válido si se escribe.
  const meetingUrl = typeof this.meetingUrl === "string" ? this.meetingUrl.trim() : "";

  // Las reuniones presenciales tampoco guardan enlaces online innecesarios.
  if (this.modality === "Presencial" || !meetingUrl) {
    this.meetingUrl = undefined;
  } else {
    try {
      const url = new URL(meetingUrl);
      if (!["http:", "https:"].includes(url.protocol)) {
        throw new Error("Protocolo no permitido");
      }
      this.meetingUrl = meetingUrl;
    } catch {
      this.invalidate("meetingUrl", "Ingresa un enlace HTTP o HTTPS válido, o deja el campo vacío");
    }
  }

  // En eventos semanales se admiten uno o varios días.
  if (this.recurrence?.type === "weekly") {
    // El esquema compartido exige al menos un día válido.
    if (!this.recurrence.daysOfWeek?.length) {
      this.invalidate("recurrence.daysOfWeek", "Selecciona al menos un día de la semana");
    }

    // Los campos de frecuencia mensual no corresponden a esta modalidad.
    this.recurrence.monthlyCount = undefined;
    this.recurrence.weeksOfMonth = undefined;
  } else if (this.recurrence?.type === "monthly") {
    // Un evento mensual puede tener un solo día habitual o ninguno
    // cuando aún no se sabe cuál será el día de cada encuentro.
    if ((this.recurrence.daysOfWeek?.length ?? 0) > 1) {
      this.invalidate("recurrence.daysOfWeek", "Selecciona como máximo un día para el evento mensual");
    }

    // Una reunión mensual puede repetirse entre una y cuatro veces.
    if (!Number.isInteger(this.recurrence.monthlyCount) ||
        this.recurrence.monthlyCount < 1 || this.recurrence.monthlyCount > 4) {
      this.invalidate("recurrence.monthlyCount", "Selecciona cuántas veces al mes se realiza");
    }

    // Cuando se fijan las semanas, la cantidad debe coincidir.
    const weeks = this.recurrence.weeksOfMonth;
    if (weeks !== undefined && weeks.length !== this.recurrence.monthlyCount) {
      this.invalidate("recurrence.weeksOfMonth", "Selecciona tantas semanas como encuentros al mes");
    }
    // No es posible fijar una semana sin saber el día de la semana.
    if (weeks !== undefined && this.recurrence.daysOfWeek?.length !== 1) {
      this.invalidate("recurrence.daysOfWeek", "Para fijar semanas, selecciona un día de la semana");
    }
  } else {
    this.invalidate("recurrence.type", "Selecciona una frecuencia semanal o mensual");
  }
  if (this.recurrence?.endDate && this.date && this.recurrence.endDate < this.date) {
    this.invalidate("recurrence.endDate", "La fecha final no puede ser anterior al inicio");
  }
});

// Índice para consultar rápidamente los eventos publicados.
eventSchema.index({ publicationStatus: 1, date: 1 });

// La colección de MongoDB se llama events.
const Event = mongoose.model("Event", eventSchema);
export default Event;
