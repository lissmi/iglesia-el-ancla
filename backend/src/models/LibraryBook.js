

/* =========================================================
   MODELO - BIBLIOTECA SOLIDARIA
   IGLESIA EL ANCLA
   ========================================================= */

// Importamos Mongoose para definir los esquemas de MongoDB.
import mongoose from "mongoose";


// =========================================================
// ESQUEMA DEL DOCUMENTO - GOOGLE DRIVE
// =========================================================

// Guardamos únicamente los datos necesarios para
// localizar y descargar el documento desde Google Drive.
const libraryDocumentSchema = new mongoose.Schema(
    {
        // Identificador único del archivo en Google Drive.
        fileId: {
            type: String,
            required: true,
            trim: true,

            // No se incluye automáticamente en las consultas.
            select: false,
        },

        // Formato del documento almacenado.
        format: {
            type: String,
            required: true,
            enum: ["pdf", "doc", "docx"],
            lowercase: true,
            trim: true,
        },
    },
    {
        // Evitamos generar un _id adicional.
        _id: false,

        // No permitimos propiedades fuera del esquema.
        strict: true,
    }
);


// =========================================================
// ESQUEMA PRINCIPAL - BIBLIOTECA SOLIDARIA
// =========================================================

// Definimos la estructura de cada libro publicado.
const libraryBookSchema = new mongoose.Schema(
    {
        // =================================================
        // INFORMACIÓN GENERAL DEL LIBRO
        // =================================================

        // Título obligatorio del libro.
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150,
        },

        // Autor obligatorio del libro.
        author: {
            type: String,
            required: true,
            trim: true,
            maxlength: 120,
        },

        // Categoría del libro, limitada a opciones oficiales.
        category: {
            type: String,
            default: "General",
            trim: true,
            maxlength: 80,

            // Categorías permitidas en Biblioteca Solidaria.
            enum: [
                "General",
                "Estudio bíblico",
                "Vida cristiana",
                "Devocionales",
                "Oración",
                "Discipulado",
                "Familia y comunidad",
                "Literatura infantil",
            ],
        },

        // Descripción opcional del contenido del libro.
        description: {
            type: String,
            default: "",
            trim: true,
            maxlength: 1000,
        },


        // =================================================
        // CLOUDINARY - PORTADA DEL LIBRO
        // =================================================

        // URL pública de la imagen almacenada en Cloudinary.
        // React utilizará esta URL para mostrar la portada.
        coverUrl: {
            type: String,
            required: true,
            trim: true,
        },

        // Identificador de la portada dentro de Cloudinary.
        // Permite reemplazarla o eliminarla posteriormente.
        coverPublicId: {
            type: String,
            required: true,
            trim: true,

            // No necesitamos enviarlo al catálogo público.
            select: false,
        },


        // =================================================
        // GOOGLE DRIVE - DOCUMENTO PDF O WORD
        // =================================================

        // Referencia mínima al documento almacenado en Drive.
        // MongoDB no guarda el contenido del archivo.
        document: {
            type: libraryDocumentSchema,
            required: true,
        },


        // =================================================
        // ADMINISTRACIÓN DEL CONTENIDO
        // =================================================

        // Identificador del administrador que publicó el libro.
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Administrador responsable de la última modificación.
        // Permanece ausente mientras el libro no haya sido editado.
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: undefined,
        },
    },
    {
        // Agrega automáticamente createdAt y updatedAt.
        timestamps: true,

        // Evita almacenar campos no definidos.
        strict: true,
    }
);


// =========================================================
// ÍNDICES DE MONGODB
// =========================================================

// Optimiza las consultas ordenadas por fecha de publicación.
libraryBookSchema.index({
    createdAt: -1,
});


// =========================================================
// CREACIÓN Y EXPORTACIÓN DEL MODELO
// =========================================================

// Creamos el modelo de Biblioteca Solidaria.
const LibraryBook = mongoose.model(
    "LibraryBook",
    libraryBookSchema
);

// Exportamos el modelo para utilizarlo en nuestra API.
export default LibraryBook;
