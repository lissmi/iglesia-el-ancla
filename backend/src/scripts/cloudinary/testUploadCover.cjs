// =========================================================
// IGLESIA EL ANCLA - PRUEBA DE CLOUDINARY
// =========================================================

// Importamos Node.js para leer archivos.
const fs = require("node:fs");

// Importamos Node.js para trabajar con rutas.
const path = require("node:path");

// Importamos dotenv para cargar las credenciales.
const dotenv = require("dotenv");

// Importamos el SDK oficial de Cloudinary.
const { v2: cloudinary } = require("cloudinary");

// =========================================================
// CONFIGURACIÓN
// =========================================================

// Ubicamos el .env actual del proyecto.
const envPath = path.resolve(
    __dirname,
    "../../middleware/.env"
);

// Cargamos las variables privadas.
dotenv.config({ path: envPath });

// Comprobamos que existan las credenciales.
const requiredVariables = [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
];

// Revisamos cada variable de entorno.
for (const variable of requiredVariables) {
    if (!process.env[variable]) {
        console.error(`Falta configurar ${variable}`);
        process.exit(1);
    }
}

// Configuramos nuestra cuenta Cloudinary.
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

// =========================================================
// VALIDAR IMAGEN DE PRUEBA
// =========================================================

// Recuperamos la ruta indicada desde la terminal.
const filePath = process.argv[2]
    ? path.resolve(process.argv[2])
    : null;

// Comprobamos que exista el archivo.
if (!filePath || !fs.existsSync(filePath)) {
    console.error("No se encontró la imagen indicada.");
    process.exit(1);
}

// Consultamos las propiedades del archivo.
const fileStats = fs.statSync(filePath);

// Verificamos que sea un archivo y no una carpeta.
if (!fileStats.isFile()) {
    console.error("La ruta debe corresponder a un archivo.");
    process.exit(1);
}

// Permitimos un máximo de 5 MB para la prueba.
if (fileStats.size > 5 * 1024 * 1024) {
    console.error("La imagen supera los 5 MB.");
    process.exit(1);
}

// Obtenemos la extensión de la imagen.
const extension = path.extname(filePath).toLowerCase();

// Definimos las extensiones admitidas.
const allowedExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
];

// Rechazamos extensiones no permitidas.
if (!allowedExtensions.includes(extension)) {
    console.error("Solo se permiten JPG, PNG o WebP.");
    process.exit(1);
}

// =========================================================
// SUBIR IMAGEN A CLOUDINARY
// =========================================================

// Creamos la función de prueba.
async function testUploadCover() {
    try {
        // Subimos la imagen al almacenamiento.
        const result = await cloudinary.uploader.upload(
            filePath,
            {
                // Carpeta exclusiva de portadas.
                folder: "el-ancla/biblioteca/portadas",

                // Indicamos que el archivo es una imagen.
                resource_type: "image",

                // Evitamos sobrescribir imágenes existentes.
                overwrite: false,

                // Generamos un nombre único.
                unique_filename: true,
            }
        );

        // Confirmamos que la subida terminó.
        console.log("\nIMAGEN SUBIDA CORRECTAMENTE");

        // Mostramos la URL HTTPS de la portada.
        console.log("URL:", result.secure_url);

        // Mostramos el identificador del archivo.
        console.log("Public ID:", result.public_id);

        // Mostramos la carpeta de almacenamiento.
        console.log("Carpeta: el-ancla/biblioteca/portadas");

    } catch (error) {
        // Informamos el error sin mostrar las credenciales.
        console.error("\nERROR AL SUBIR LA IMAGEN:");

        console.error(error.message);

        // Indicamos que falló la prueba.
        process.exitCode = 1;
    }
}

// Ejecutamos la prueba.
testUploadCover();