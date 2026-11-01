// =========================================================
// CREAR LA CARPETA PRIVADA DE CANCIONERO EN GOOGLE DRIVE
// =========================================================

// Importamos las herramientas de Node.js y el SDK de Google.
const path = require("node:path");
const dotenv = require("dotenv");
const { google } = require("googleapis");

// Cargamos el mismo .env utilizado por el backend.
dotenv.config({ path: path.resolve(__dirname, "../../middleware/.env") });

// Recuperamos credenciales ya autorizadas en Biblioteca Solidaria.
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_DRIVE_REFRESH_TOKEN } = process.env;

// Validamos que no falten credenciales.
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_DRIVE_REFRESH_TOKEN) {
    console.error("Faltan las credenciales de Google Drive en el .env");
    process.exit(1);
}

// Creamos el cliente OAuth 2.0.
const auth = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);

// Instalamos el refresh token autorizado previamente.
auth.setCredentials({ refresh_token: GOOGLE_DRIVE_REFRESH_TOKEN });

// Creamos el cliente de Google Drive API v3.
const drive = google.drive({ version: "v3", auth });

// Creamos una carpeta exclusiva en la raíz del Drive institucional.
async function main() {
    // No creamos una carpeta duplicada si ya tenemos el identificador.
    if (process.env.GOOGLE_DRIVE_SONGBOOK_FOLDER_ID) {
        console.log("Ya existe GOOGLE_DRIVE_SONGBOOK_FOLDER_ID. No se creó otra carpeta.");
        return;
    }

    // Solicitamos la creación de una carpeta, no de un archivo.
    const result = await drive.files.create({
        requestBody: {
            name: "Cancionero de Alabanzas - El Ancla",
            mimeType: "application/vnd.google-apps.folder",
        },
        fields: "id,name",
    });

    // Mostramos el ID que debe agregarse a las variables del backend.
    console.log("Carpeta creada:", result.data.name);
    console.log("GOOGLE_DRIVE_SONGBOOK_FOLDER_ID=" + result.data.id);
}

// Ejecutamos el procedimiento y reportamos errores sin imprimir secretos.
main().catch((error) => {
    console.error("No se pudo crear la carpeta:", error.message);
    process.exitCode = 1;
});
