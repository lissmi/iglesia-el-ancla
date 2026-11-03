
/* =========================================================
   MODELO DE EVENTOS PÚBLICOS - IGLESIA EL ANCLA
   Archivo: backend/src/models/Event.js

   Los eventos son reuniones habituales y recurrentes.
   No tienen confirmaciones de asistencia ni cupos.

   Las actividades puntuales utilizan Activity.js.
========================================================= */

// Importamos Mongoose para definir el modelo de MongoDB.
import mongoose from "mongoose";

// Extraemos el constructor de esquemas.
const { Schema } = mongoose;

// Definimos la zona horaria oficial del sistema.
// No la repetimos en cada documento de MongoDB.
export const EVENT_TIME_ZONE = "America/Santiago";


/* =========================================================
   VALIDACIÓN DE FECHAS Y HORAS
========================================================= */

// Verificamos que una fecha exista y tenga formato YYYY-MM-DD.
function isValidDateOnly(value) {

  // Exigimos una cadena con el formato esperado.
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false;
  }

  // Construimos la fecha en UTC solamente para validarla.
  // Los horarios reales siguen perteneciendo a Chile.
  const date = new Date(`${value}T12:00:00.000Z`);

  // Rechazamos fechas inexistentes, como 2026-02-30.
  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

// Comprobamos que la hora utilice el formato HH:mm.
function isValidLocalTime(value) {

  // Admitimos horas entre las 00:00 y las 23:59.
  return (
    typeof value === "string" &&
    /^([01]\d|2[0-3]):[0-5]\d$/.test(value)
  );
}


/* =========================================================
   RECURRENCIA SEMANAL
========================================================= */

// Un evento puede repetirse uno o varios días de la semana.
const recurrenceSchema = new Schema(
  {

    // Los eventos de este módulo siempre son recurrentes.
    type: {
      type: String,
      enum: ["weekly"],
      default: "weekly",
      required: true,
    },

    // Identificamos los días de la semana.
    // 0 = domingo, 1 = lunes, ... 6 = sábado.
    daysOfWeek: {
      type: [Number],

      // No creamos arreglos vacíos innecesarios.
      default: undefined,

      // Verificamos que existan días válidos.
      validate: {
        validator: (days) =>
          Array.isArray(days) &&
          days.length > 0 &&
          days.every(
            (day) =>
              Number.isInteger(day) &&
              day >= 0 &&
              day <= 6
          ) &&
          new Set(days).size === days.length,

        message:
          "Selecciona uno o más días válidos, sin repetirlos",
      },
    },

    // La recurrencia puede finalizar en una fecha definida.
    // Si no existe término, no almacenamos este campo.
    endDate: {
      type: String,
      default: undefined,

      // Validamos las fechas cuando estén presentes.
      validate: {
        validator: (value) =>
          value == null || isValidDateOnly(value),

        message:
          "Fecha de término de recurrencia inválida",
      },
    },
  },

  // No generamos otro ObjectId para la recurrencia.
  {
    _id: false,
    strict: true,
  }
);


/* =========================================================
   IMAGEN OPCIONAL DE CLOUDINARY
========================================================= */

// MongoDB conserva únicamente los datos de la imagen.
const imageSchema = new Schema(
  {

    // Dirección de la portada para mostrarla en React.
    url: {
      type: String,
      required: true,
      trim: true,
    },

    // Identificador necesario para editar o eliminar.
    // No lo incluimos en consultas normales.
    publicId: {
      type: String,
      required: true,
      trim: true,
      select: false,
    },
  },

  // La imagen no necesita un ObjectId propio.
  {
    _id: false,
    strict: true,
  }
);


/* =========================================================
   ESQUEMA PRINCIPAL DE EVENTOS
========================================================= */

const eventSchema = new Schema(
  {

    // Nombre del evento.
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    // Clasificación del evento recurrente.
    category: {
      type: String,
      required: true,
      enum: [
        "Culto",
        "Oración",
        "Estudio bíblico",
        "Jóvenes",
        "Niños",
        "Taller",
        "Otro",
      ],
    },

    // Descripción visible en la página pública.
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    // Fecha desde la que comienza la programación.
    // Se guarda como fecha civil YYYY-MM-DD.
    date: {
      type: String,
      required: true,

      validate: {
        validator: isValidDateOnly,
        message: "Fecha de inicio inválida",
      },
    },

    // Horario habitual de comienzo.
    time: {
      type: String,
      required: true,

      validate: {
        validator: isValidLocalTime,
        message: "Hora de inicio inválida",
      },
    },

    // Horario habitual de finalización, si se conoce.
    endTime: {
      type: String,
      default: undefined,

      validate: {
        validator: (value) =>
          value == null || isValidLocalTime(value),

        message: "Hora de término inválida",
      },
    },

    // Modalidad habitual del evento.
    modality: {
      type: String,
      required: true,
      enum: [
        "Presencial",
        "Online",
        "Híbrida",
      ],
    },

    // Dirección utilizada para reuniones presenciales.
    location: {
      type: String,
      trim: true,
      maxlength: 300,
      default: undefined,
    },

    // Enlace utilizado para reuniones online.
    meetingUrl: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: undefined,
    },

    // Programación semanal del evento.
    recurrence: {
      type: recurrenceSchema,
      required: true,

      // Inicializamos la estructura sin duplicar otros datos.
      default: () => ({
        type: "weekly",
      }),
    },

    // Permite preparar eventos sin publicarlos.
    publicationStatus: {
      type: String,
      enum: [
        "draft",
        "published",
      ],
      default: "draft",
    },

    // Portada opcional almacenada en Cloudinary.
    image: {
      type: imageSchema,
      default: undefined,
    },

    // Usuario administrativo que creó el evento.
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Último administrador que modificó el evento.
    // No se almacena hasta que exista una edición.
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: undefined,
    },
  },

  // Opciones generales del esquema.
  {
    // Mongoose genera createdAt y updatedAt.
    timestamps: true,

    // Ignoramos propiedades desconocidas.
    strict: true,
  }
);


/* =========================================================
   VALIDACIONES ENTRE CAMPOS
========================================================= */

// Ejecutamos las validaciones antes de guardar el evento.
eventSchema.pre("validate", function validateEventFields() {

  // La hora final debe ser posterior al inicio.
  if (
    this.endTime &&
    this.time &&
    this.endTime <= this.time
  ) {
    this.invalidate(
      "endTime",
      "La hora de término debe ser posterior al inicio"
    );
  }

  // Los eventos presenciales e híbridos requieren ubicación.
  if (
    this.modality &&
    this.modality !== "Online" &&
    !this.location?.trim()
  ) {
    this.invalidate(
      "location",
      "Debes indicar la ubicación del evento"
    );
  }

  // Los eventos online e híbridos requieren un enlace válido.
  if (
    this.modality &&
    this.modality !== "Presencial"
  ) {
    try {

      // Analizamos el enlace proporcionado.
      const url = new URL(this.meetingUrl || "");

      // Solo admitimos HTTP y HTTPS.
      if (!["http:", "https:"].includes(url.protocol)) {
        throw new Error("Protocolo no permitido");
      }

    } catch {

      // Marcamos el campo como inválido.
      this.invalidate(
        "meetingUrl",
        "Debes indicar un enlace de reunión válido"
      );
    }
  }

  // No almacenamos un enlace si el evento es solo presencial.
  if (this.modality === "Presencial") {
    this.meetingUrl = undefined;
  }

  // No almacenamos una dirección si el evento es solo online.
  if (this.modality === "Online") {
    this.location = undefined;
  }

  // Todos los eventos deben tener programación semanal.
  if (this.recurrence?.type !== "weekly") {
    this.invalidate(
      "recurrence.type",
      "Los eventos deben tener recurrencia semanal"
    );
  }

  // Debe seleccionarse al menos un día de la semana.
  if (!this.recurrence?.daysOfWeek?.length) {
    this.invalidate(
      "recurrence.daysOfWeek",
      "Selecciona al menos un día de repetición"
    );
  }

  // La recurrencia no puede terminar antes de comenzar.
  if (
    this.recurrence?.endDate &&
    this.date &&
    this.recurrence.endDate < this.date
  ) {
    this.invalidate(
      "recurrence.endDate",
      "La fecha final no puede ser anterior al inicio"
    );
  }
});


/* =========================================================
   ÍNDICE DE CONSULTA
========================================================= */

// Optimiza la consulta de eventos publicados por fecha.
eventSchema.index({
  publicationStatus: 1,
  date: 1,
});


/* =========================================================
   EXPORTACIÓN
========================================================= */

// Utilizamos el nombre Event para la colección events.
const Event = mongoose.model("Event", eventSchema);

// Exportamos el modelo para eventRoutes.js.
export default Event;
