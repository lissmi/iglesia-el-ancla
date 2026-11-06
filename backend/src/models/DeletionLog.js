// =========================================================
// MODELO DE HISTORIAL DE ELIMINACIONES - IGLESIA EL ANCLA
// Archivo: backend/src/models/DeletionLog.js
// =========================================================

// Importamos Mongoose para declarar el documento de auditoría.
import mongoose from "mongoose";

// Extraemos el constructor de esquemas de Mongoose.
const { Schema } = mongoose;

// Guardaremos solo datos mínimos del recurso eliminado.
const deletionLogSchema = new Schema(
  {

    // =========================================================
    // TIPO DE RECURSO ELIMINADO
    // =========================================================

    // Identificamos qué módulo originó la eliminación.
    resourceType: {
      type: String,

      // El tipo de recurso es obligatorio.
      required: true,

      // Debe coincidir con los tipos del servicio de auditoría.
      enum: [
        "activity",
        "event",
        "book",
        "song",
        "prayer_request",
        "basic_supply", // Insumos del inventario.
        "belonging", // Bienes de la iglesia.
        "income",   // Movimiento financiero de ingreso.
        "expense",  // Movimiento financiero de gasto.
      ],
    },


    // ID del documento eliminado (ya no existirá en su colección original).
    resourceId: {
      type: Schema.Types.ObjectId,
      required: true,
    },

    // Título breve para entender qué contenido fue eliminado.
    resourceTitle: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },

    // Administrador que creó originalmente el recurso.
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Último editor, solo si el recurso fue editado.
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: undefined,
    },

    // Administrador que solicitó y completó la eliminación.
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Para finanzas conservamos la fecha original de creación, sin el monto.
    resourceCreatedAt: { type: Date, default: undefined },

    // Registro mínimo de ediciones anteriores de un movimiento BORRADO.
    // No copiamos el documento ni los valores anteriores de sus campos.
    financialEdits: {
      type: [new Schema({
        by: { type: Schema.Types.ObjectId, ref: "User", required: true },
        at: { type: Date, required: true },
        fields: { type: [String], default: undefined },
      }, { _id: false, strict: true })],
      default: undefined,
    },

    // IDs transitorios para limpiar los comprobantes en Cloudinary.
    // Se van retirando cuando el borrado externo se confirma.
    pendingCloudinaryIds: { type: [String], default: undefined, select: false },

    // Fecha real de eliminación (MongoDB almacena fechas en UTC).
    deletedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    // No duplicamos createdAt / updatedAt en estos registros inmutables.
    timestamps: false,
    // Impedimos que aparezcan datos ajenos al historial.
    strict: true,
  }
);

// Único índice adicional: historial de eliminaciones más recientes.
deletionLogSchema.index({ deletedAt: -1 });

// Evitamos redefinir el modelo durante recargas del servidor.
const DeletionLog = mongoose.models.DeletionLog ||
  mongoose.model("DeletionLog", deletionLogSchema);

// Exportamos el modelo para el servicio de auditoría.
export default DeletionLog;
