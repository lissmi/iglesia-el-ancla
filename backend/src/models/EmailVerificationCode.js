import mongoose from "mongoose";

// Cada documento representa un desafío de verificación de correo
// asociado a un usuario específico.
const emailVerificationCodeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // =========================================================
    // PROPÓSITO DEL CÓDIGO DE SEGURIDAD
    // =========================================================

    // Cada código pertenece a una operación específica.
    //
    // verify_email:
    // Permite verificar la dirección de correo registrada.
    //
    // password_change:
    // Permitirá autorizar un cambio de contraseña
    // mediante una segunda comprobación de identidad.
    //
    // Los códigos de un propósito nunca podrán
    // utilizarse para completar otro procedimiento.

    purpose: {
      type: String,

      enum: [
        "verify_email",
        "password_change",
      ],

      default: "verify_email",

      required: true,

      immutable: true,
    },

    // Hash criptográfico del código; nunca guardar el código en claro.
    codeHash: {
      type: String,
      required: true,
      select: false,
    },

    // La dirección se normaliza antes de crear el documento en el servicio.
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    attempts: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    maxAttempts: {
      type: Number,
      default: 5,
      min: 1,
      max: 5,
      immutable: true,
    },

    // Control del intervalo mínimo entre envíos, aplicado por el servicio.
    lastSentAt: {
      type: Date,
      required: true,
      default: Date.now,
    },

    // Se establece después de usar el código correctamente.
    consumedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "email_verification_codes",
  }
);

// Máximo un desafío vigente en almacenamiento por usuario y propósito.
// El servicio deberá actualizar/reemplazar el desafío al reenviar.
emailVerificationCodeSchema.index(
  { user: 1, purpose: 1 },
  { unique: true }
);

// MongoDB elimina documentos vencidos de manera asíncrona.
// El servicio SIEMPRE debe comprobar expiresAt en cada validación.
emailVerificationCodeSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

const EmailVerificationCode =
  mongoose.models.EmailVerificationCode ||
  mongoose.model("EmailVerificationCode", emailVerificationCodeSchema);

export default EmailVerificationCode;
