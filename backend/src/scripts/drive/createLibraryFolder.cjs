// =========================================================
// IGLESIA EL ANCLA - CREAR CARPETA EN GOOGLE DRIVE
// =========================================================

// Importamos herramientas para trabajar con rutas.
const path = require("node:path");

// Importamos dotenv para leer las credenciales.
const dotenv = require("dotenv");

// Importamos el SDK oficial de Google.
const { google } = require("googleapis");

// =========================================================
// CARGAR VARIABLES DE ENTORNO
// =========================================================

// Localizamos el .env dentro de src/middleware.
const envPath = path.resolve(
    __dirname,
    "../../middleware/.env"
);

// Cargamos las credenciales privadas.
dotenv.config({ path: envPath });

// Recuperamos las variables necesarias.
const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;

// Comprobamos que existan todas las credenciales.
if (!clientId || !clientSecret || !refreshToken) {
    console.error(
        "Error: faltan credenciales de Google Drive en el .env"
    );

    process.exit(1);
}

// =========================================================
// CONFIGURAR GOOGLE DRIVE
// =========================================================

// Creamos el cliente OAuth usando las credenciales existentes.
const oauthClient = new google.auth.OAuth2(
    clientId,
    clientSecret
);

// Configuramos el refresh token autorizado.
oauthClient.setCredentials({
    refresh_token: refreshToken,
});

// Creamos el cliente de Google Drive API v3.
const drive = google.drive({
    version: "v3",
    auth: oauthClient,
});

// =========================================================
// CREAR CARPETA DE BIBLIOTECA SOLIDARIA
// =========================================================

// Función principal para comprobar la conexión.
async function createLibraryFolder() {
    try {
        // Comprobamos si ya configuramos una carpeta anteriormente.
        const existingFolderId =
            process.env.GOOGLE_DRIVE_FOLDER_ID;

        if (existingFolderId) {
            // Verificamos que la carpeta configurada exista.
            const response = await drive.files.get({
                fileId: existingFolderId,
                fields: "id,name,mimeType",
            });

            // Comprobamos que realmente sea una carpeta.
            if (
                response.data.mimeType !==
                "application/vnd.google-apps.folder"
            ) {
                throw new Error(
                    "GOOGLE_DRIVE_FOLDER_ID no corresponde a una carpeta"
                );
            }

            // Informamos que no es necesario crear otra.
            console.log("Carpeta existente verificada:");
            console.log(response.data.name);

            return;
        }

        // Creamos la carpeta en el Drive institucional.
        const response = await drive.files.create({
            requestBody: {
                // Nombre visible de la carpeta.
                name: "Biblioteca Solidaria - El Ancla",

                // Tipo especial de carpeta de Google Drive.
                mimeType: "application/vnd.google-apps.folder",
            },

            // Solicitamos los datos necesarios.
            fields: "id,name,mimeType",
        });

        // Recuperamos el identificador creado por Google.
        const folderId = response.data.id;

        // Mostramos el resultado de la operación.
        console.log("\nCONEXIÓN EXITOSA CON GOOGLE DRIVE");

        console.log("Carpeta creada:");
        console.log(response.data.name);

        console.log("\nGOOGLE_DRIVE_FOLDER_ID:");
        console.log(folderId);

        // Mostramos la dirección para abrir la carpeta.
        console.log("\nPuedes abrirla en:");
        console.log(
            `https://drive.google.com/drive/folders/${folderId}`
        );

        // Recordamos guardar el ID para las próximas subidas.
        console.log(
            "\nGuarda GOOGLE_DRIVE_FOLDER_ID en tu archivo .env"
        );
    } catch (error) {
        // Informamos si falla la conexión o creación.
        console.error("\nError al conectar con Google Drive:");

        // Mostramos el mensaje sin imprimir las credenciales.
        console.error(
            error.response?.data?.error?.message ||
            error.message
        );

        // Indicamos que la operación falló.
        process.exitCode = 1;
    }
}

// Ejecutamos la comprobación de Google Drive.
createLibraryFolder();