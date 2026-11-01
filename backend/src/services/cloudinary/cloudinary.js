// =========================================================
// CONFIGURACIÓN DE CLOUDINARY
// =========================================================

// Importamos el SDK oficial de Cloudinary.
import { v2 as cloudinary } from "cloudinary";

// Configuramos las credenciales desde el entorno.
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

// Exportamos la conexión.
export default cloudinary;