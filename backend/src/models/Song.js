// =========================================================
// MODELO - CANCIONERO DE ALABANZAS / IGLESIA EL ANCLA
// =========================================================

// Mongoose registra solamente metadatos, nunca letras ni archivos.
import mongoose from "mongoose";

// Categorías controladas para mantener el repertorio ordenado.
export const SONG_CATEGORIES = [
    "General",
    "Alabanza",
    "Infantil",
];

// Definimos la estructura mínima de una canción.
const songSchema = new mongoose.Schema(
    {
        // Título que aparece en el catálogo y buscador.
        title: { type: String, required: true, trim: true, maxlength: 160 },

        // Autor, compositor o intérprete indicado por la iglesia.
        author: { type: String, default: "", trim: true, maxlength: 160 },

        // Clasificación elegida desde un selector.
        category: { type: String, required: true, enum: SONG_CATEGORIES, default: "General" },

        // ID del PDF privado generado automáticamente en Google Drive.
        pdfFileId: { type: String, required: true, select: false },

        // ID del texto editable original guardado en Drive (no en MongoDB).
        sourceFileId: { type: String, required: true, select: false },

        // Administrador responsable de la publicación.
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    },
    {
        // Registramos creación y última edición.
        timestamps: true,
        // Rechazamos propiedades no definidas.
        strict: true,
    }
);

// Índice de consulta por título.
songSchema.index({ title: 1 });

// Registramos el modelo una sola vez.
const Song = mongoose.models.Song || mongoose.model("Song", songSchema);

// Exportamos el modelo al router.
export default Song;
