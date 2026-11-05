// =========================================================
// MODELO - ÍNDICE DE PÁGINAS INFORMATIVAS / IGLESIA EL ANCLA
// MongoDB almacena únicamente metadatos e IDs de Google Drive.
// El contenido de las páginas vive exclusivamente en archivos TXT.
// =========================================================

// Importamos Mongoose para definir el esquema de metadatos.
import mongoose from "mongoose";

// Definimos las únicas páginas que administra este módulo.
export const INFORMATIONAL_PAGE_SLUGS = Object.freeze([
  "nosotros",
  "contacto",
  "terminos-y-condiciones",
  "politica-de-privacidad",
]);

// Un documento corresponde a una sola página del sitio público.
const informationalPageSchema = new mongoose.Schema(
  {
    // El slug es la clave estable que identifica cada página.
    slug: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      enum: INFORMATIONAL_PAGE_SLUGS,
    },

    // ID del archivo editable: <slug>.borrador.txt en Drive.
    // Se oculta en consultas normales para evitar exponerlo por accidente.
    draftFileId: {
      type: String,
      trim: true,
      default: null,
      select: false,
    },

    // ID del archivo visible públicamente: <slug>.publicado.txt.
    // Solo el backend utiliza este identificador privado.
    publishedFileId: {
      type: String,
      trim: true,
      default: null,
      select: false,
    },

    // Última revisión guardada del borrador.
    draftRevision: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Revisión del borrador de la cual se generó la publicación.
    publishedRevision: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Administrador que guardó el último borrador.
    draftUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Fecha en que se guardó por última vez el borrador.
    draftUpdatedAt: {
      type: Date,
      default: null,
    },

    // Administrador responsable de la publicación vigente.
    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Fecha en que se publicó la versión vigente.
    publishedAt: {
      type: Date,
      default: null,
    },

    // Token y vencimiento de bloqueo para evitar escrituras simultáneas.
    // Es un mecanismo de coordinación, NO contenido de la página.
    writeLockToken: { type: String, default: null, select: false },
    writeLockUntil: { type: Date, default: null, select: false },
  },
  {
    // Conservamos cuándo se creó y actualizó el registro de metadatos.
    timestamps: true,
    // Usamos exactamente la colección que ya aparece en MongoDB Compass.
    collection: "informational_pages",
    // Impedimos que datos no declarados terminen almacenados.
    strict: "throw",
  }
);

// Reutilizamos el modelo si ya se registró durante el desarrollo.
const InformationalPage =
  mongoose.models.InformationalPage ||
  mongoose.model("InformationalPage", informationalPageSchema);

// Exportamos el modelo para el servicio que comunica MongoDB y Drive.
export default InformationalPage;
