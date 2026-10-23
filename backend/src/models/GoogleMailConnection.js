// =========================================================
// CONEXIÓN INSTITUCIONAL CON GOOGLE GMAIL
// =========================================================
// Este modelo conserva exclusivamente la información
// necesaria para identificar una autorización de Gmail.
//
// IMPORTANTE:
// - El refresh token NUNCA se guarda en texto plano.
// - El cifrado AES-256-GCM se implementará en un servicio
//   separado ANTES de escribir datos en esta colección.
// - Este modelo no envía correos ni inicia OAuth.

import mongoose from "mongoose";

const { Schema } = mongoose;

const googleMailConnectionSchema = new Schema(
  {
    // Habrá una única conexión institucional activa.
    connectionKey: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      enum: ["institutional-gmail"],
      default: "institutional-gmail",
    },

    // Cuenta autorizada para enviar mensajes.
    senderEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },

    // Componentes del token cifrado con AES-256-GCM.
    // Los tres elementos se necesitan para descifrarlo.
    // Nunca enviar estos valores a React.
    encryptedRefreshToken: {
      type: String,
      required: true,
      select: false,
    },
    encryptionIv: {
      type: String,
      required: true,
      select: false,
    },
    encryptionAuthTag: {
      type: String,
      required: true,
      select: false,
    },

    // Permisos concedidos por la cuenta emisora.
    scopes: {
      type: [String],
      default: [],
    },

    // Fecha de autorización o reconexión.
    authorizedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },

    // Permite inhabilitar el envío sin borrar el registro.
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "google_mail_connections",
    toJSON: {
      transform(_document, output) {
        delete output.encryptedRefreshToken;
        delete output.encryptionIv;
        delete output.encryptionAuthTag;
        delete output.__v;
        return output;
      },
    },
  }
);

const GoogleMailConnection = mongoose.model(
  "GoogleMailConnection",
  googleMailConnectionSchema
);

export default GoogleMailConnection;
