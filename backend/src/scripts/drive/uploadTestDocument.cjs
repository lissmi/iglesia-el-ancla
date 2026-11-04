// =========================================================
// IGLESIA EL ANCLA - PRUEBA DE SUBIDA A GOOGLE DRIVE
// =========================================================

// Importamos el sistema de archivos de Node.js.
const fs = require("node:fs");

// Importamos las herramientas para manejar rutas.
const path = require("node:path");

// Importamos dotenv para leer el archivo .env.
const dotenv = require("dotenv");

// Importamos la API oficial de Google.
const { google } = require("googleapis");


// =========================================================
// VARIABLES DE ENTORNO
// =========================================================

// Localizamos el .env existente del proyecto.
const envPath = path.resolve(
    __dirname,
    "../../middleware/.env"
);

// Cargamos las variables privadas.
dotenv.config({ path: envPath });

// Recuperamos las credenciales OAuth.
const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;

// Recuperamos el ID de nuestra carpeta institucional.
const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;


// =========================================================
// VALIDACIONES INICIALES
// =========================================================

// Verificamos las credenciales.
if (!clientId || !clientSecret || !refreshToken || !folderId) {
    console.error("Faltan variables de Google Drive en el .env.");
    process.exit(1);
}

// Obtenemos la ruta del documento desde PowerShell.
const filePath = process.argv[2];

// Exigimos que se indique un archivo.
if (!filePath) {
    console.error("Debes indicar la ruta de un PDF o Word.");
    process.exit(1);
}

// Comprobamos que el archivo exista.
if (!fs.existsSync(filePath)) {
    console.error("No se encontró el archivo indicado.");
    process.exit(1);
}

// Obtenemos los datos del archivo.
const fileStats = fs.statSync(filePath);

// Rechazamos carpetas.
if (!fileStats.isFile()) {
    console.error("La ruta debe corresponder a un archivo.");
    process.exit(1);
}

// Limitamos esta prueba a documentos de 20 MB.
if (fileStats.size > 20 * 1024 * 1024) {
    console.error("El documento supera los 20 MB.");
    process.exit(1);
}

// Obtenemos la extensión del archivo.
const extension = path.extname(filePath).toLowerCase();

// Definimos los tipos de documentos permitidos.
const mimeTypes = {
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

// Obtenemos el tipo MIME correspondiente.
const mimeType = mimeTypes[extension];

// Rechazamos extensiones no permitidas.
if (!mimeType) {
    console.error("Solo se permiten PDF, DOC y DOCX.");
    process.exit(1);
}


// =========================================================
// CONFIGURACIÓN DE GOOGLE DRIVE
// =========================================================

// Creamos nuestro cliente OAuth.
const oauthClient = new google.auth.OAuth2(
    clientId,
    clientSecret
);

// Configuramos el token institucional.
oauthClient.setCredentials({
    refresh_token: refreshToken,
});

// Creamos el cliente de Google Drive.
const drive = google.drive({
    version: "v3",
    auth: oauthClient,
});


// =========================================================
// SUBIR DOCUMENTO
// =========================================================

// Función principal de subida.
async function uploadDocument() {
    try {
        // Recuperamos el nombre original del archivo.
        const fileName = path.basename(filePath);

        // Enviamos el documento a Google Drive.
        const response = await drive.files.create({
            // Definimos dónde se almacenará.
            requestBody: {
                name: fileName,
                parents: [folderId],
            },

            // Enviamos el contenido real del documento.
            media: {
                mimeType: mimeType,
                body: fs.createReadStream(filePath),
            },

            // Solicitamos los datos del archivo creado.
            fields: "id,name,mimeType,size,parents",
        });

        // Mostramos el resultado.
        console.log("\nDOCUMENTO SUBIDO CORRECTAMENTE");

        // Mostramos el nombre almacenado.
        console.log("Nombre:", response.data.name);

        // Mostramos el identificador de Google Drive.
        console.log("ID:", response.data.id);

        // Mostramos el tamaño del documento.
        console.log("Tamaño:", response.data.size, "bytes");

        // Confirmamos que está en la carpeta indicada.
        console.log("Carpeta:", folderId);

    } catch (error) {
        // Informamos el error sin imprimir credenciales.
        console.error("\nERROR AL SUBIR DOCUMENTO:");

        console.error(
            error.response?.data?.error?.message ||
            error.message
        );

        // Marcamos la ejecución como fallida.
        process.exitCode = 1;
    }
}

// Ejecutamos la subida.
uploadDocument();