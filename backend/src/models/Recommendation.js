// =========================================================
// RECOMENDACIONES EXTERNAS - IGLESIA EL ANCLA
// MongoDB guarda texto y URLs; nunca almacena archivos de imagen.
// =========================================================

// Importamos el ODM utilizado en todo el backend.
import mongoose from "mongoose";

// Mantener sincronizadas estas categorías con RecommendationsCategories.jsx.
export const RECOMMENDATION_CATEGORIES = Object.freeze([
  "books", "music", "movies", "series", "documentaries", "podcasts",
]);

// Audiencias reconocidas por el formulario actual.
export const RECOMMENDATION_AUDIENCES = Object.freeze(["general", "kids_youth"]);

// Un documento representa solamente una recomendación a un sitio externo.
const recommendationSchema = new mongoose.Schema(
  {
    // Título mostrado en el catálogo.
    title: { type: String, required: true, trim: true, maxlength: 160 },
    // Clasificación del contenido recomendado.
    category: { type: String, required: true, enum: RECOMMENDATION_CATEGORIES },
    // Autor, artista, plataforma o creador.
    creator: { type: String, required: true, trim: true, maxlength: 160 },
    // Breve explicación para el visitante.
    description: { type: String, required: true, trim: true, maxlength: 1500 },
    // Razón por la cual la iglesia sugiere el material.
    reason: { type: String, required: true, trim: true, maxlength: 1500 },
    // Enlace HTTPS de la página externa (Spotify, YouTube, Netflix, etc.).
    link: { type: String, trim: true, maxlength: 2000, default: undefined },
    // Solo la URL HTTPS de la portada (puede provenir de Cloudinary).
    image: { type: String, trim: true, maxlength: 2000, default: undefined },
    // ID privado de Cloudinary; solo existe si se subió un archivo.
    imagePublicId: { type: String, trim: true, default: undefined, select: false },
    // Etiquetas de audiencia, no crean colecciones adicionales.
    audience: {
      type: [{ type: String, enum: RECOMMENDATION_AUDIENCES }],
      default: ["general"],
    },
    // Borrador o publicación visible para visitantes.
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    // Permite destacar un registro sin duplicarlo.
    featured: { type: Boolean, default: false },
    // Identidad tomada del JWT validado por el backend.
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // Solo se registra después de modificar el documento.
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: undefined },
  },
  {
    // Conservamos fechas de creación y última modificación.
    timestamps: true,
    // Colección explícita; se creará al guardar el primer documento.
    collection: "recommendations",
    // Se rechazan propiedades no contempladas por el modelo.
    strict: "throw",
    // No necesitamos guardar __v por cada documento.
    versionKey: false,
  }
);

// Un índice compuesto cubre la consulta pública y su orden habitual.
recommendationSchema.index({ status: 1, featured: -1, createdAt: -1 });

// Evitamos redefinir el modelo en recargas del entorno de desarrollo.
const Recommendation = mongoose.models.Recommendation ||
  mongoose.model("Recommendation", recommendationSchema);

// Exportamos el modelo para el router.
export default Recommendation;
