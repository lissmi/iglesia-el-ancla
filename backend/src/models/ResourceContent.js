// =========================================================
// RECURSOS EDUCATIVOS - ÍNDICE DE CAMBIOS EDITORIALES
// =========================================================
// El contenido original vive en los archivos de datos del frontend.
// Solo creamos documentos cuando la iglesia edita o agrega material.
import mongoose from "mongoose";

export const RESOURCE_CONTENT_SECTIONS = Object.freeze([
  "bible", "studies", "devotionals", "discipleship",
  "prayer_guides", "downloads", "faq",
]);

const resourceContentSchema = new mongoose.Schema({
  section: { type: String, required: true, enum: RESOURCE_CONTENT_SECTIONS, immutable: true },
  key: { type: String, required: true, trim: true, maxlength: 100, immutable: true },
  kind: { type: String, required: true, enum: ["page", "entry"], immutable: true },
  // Los documentos nuevos no existen dentro de los datos incorporados en React.
  isCustom: { type: Boolean, default: false, immutable: true },
  // El borrador nunca sustituye el material que ya está publicado.
  draftContent: { type: mongoose.Schema.Types.Mixed, default: undefined },
  publishedContent: { type: mongoose.Schema.Types.Mixed, default: undefined },
  draftRevision: { type: Number, min: 0, default: 0 },
  publishedRevision: { type: Number, min: 0, default: 0 },
  // Ocultar un contenido original NO borra el contenido inicial de código.
  publishedHidden: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
}, {
  timestamps: true,
  collection: "resource_contents",
  strict: "throw",
});

// Índice único: una modificación por categoría y por recurso original o nuevo.
resourceContentSchema.index({ section: 1, kind: 1, key: 1 }, { unique: true });

export default mongoose.models.ResourceContent ||
  mongoose.model("ResourceContent", resourceContentSchema);
