// =========================================================
// AUTORIZACIÓN INICIAL DE GOOGLE DRIVE - IGLESIA EL ANCLA
// =========================================================

// Importamos el servidor HTTP nativo de Node.js.
const http = require("node:http");

// Importamos herramientas para trabajar con archivos.
const fs = require("node:fs");

// Importamos herramientas para construir rutas.
const path = require("node:path");

// Importamos crypto para generar un estado de seguridad.
const { randomBytes } = require("node:crypto");

// Importamos dotenv para cargar las variables privadas.
const dotenv = require("dotenv");

// Importamos el SDK oficial de Google.
const { google } = require("googleapis");

// =========================================================
// CONFIGURACIÓN DEL ENTORNO
// =========================================================

// =========================================================
// UBICACIÓN DEL ARCHIVO .ENV
// =========================================================

// Definimos las posibles ubicaciones del archivo .env.
const envPaths = [

    // Ubicación actual del .env en nuestro proyecto.
    path.resolve(__dirname, "../../middleware/.env"),

    // Alternativa si el .env está en la raíz de backend.
    path.resolve(__dirname, "../../../.env"),

];

// Buscamos el archivo de configuración existente.
const envPath = envPaths.find((file) => fs.existsSync(file));

// Detenemos el script si no encontramos el .env.
if (!envPath) {
    console.error("No se encontró el archivo .env del backend.");
    process.exit(1);
}

// Cargamos las variables desde el .env encontrado.
dotenv.config({ path: envPath });

// Recuperamos las credenciales OAuth existentes.
const CLIENT_ID = process.env.GOOGLE_DRIVE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_DRIVE_CLIENT_SECRET;

// Utilizamos la misma URI registrada en Google Cloud.
const REDIRECT_URI = "http://localhost:53682/oauth2callback";

// Comprobamos que tengamos las credenciales.
if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error("Faltan GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET.");
    process.exit(1);
}

// =========================================================
// CLIENTE OAUTH
// =========================================================

// Creamos el cliente OAuth 2.0.
const oauthClient = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

// Generamos un código aleatorio para proteger la autorización.
const state = randomBytes(32).toString("hex");

// Construimos la URL de autorización de Google.
const authorizationUrl = oauthClient.generateAuthUrl({
    // Solicitamos acceso aunque el usuario no esté presente.
    access_type: "offline",

    // Pedimos consentimiento para obtener el refresh token.
    prompt: "consent select_account",

    // Limitamos el acceso a archivos usados por nuestra app.
    scope: ["https://www.googleapis.com/auth/drive.file"],

    // Protegemos el flujo mediante un estado aleatorio.
    state,
});

// =========================================================
// SERVIDOR TEMPORAL PARA RECIBIR LA AUTORIZACIÓN
// =========================================================

// Creamos un servidor local únicamente para este proceso.
const server = http.createServer(async (req, res) => {
    // Interpretamos la dirección solicitada.
    const url = new URL(req.url, REDIRECT_URI);

    // Solo aceptamos la ruta de autorización esperada.
    if (url.pathname !== "/oauth2callback") {
        res.writeHead(404);
        res.end("Ruta no encontrada.");
        return;
    }

    // Verificamos el código de seguridad del flujo OAuth.
    if (url.searchParams.get("state") !== state) {
        res.writeHead(403);
        res.end("Estado OAuth no válido.");
        return;
    }

    // Revisamos si el usuario rechazó la autorización.
    if (url.searchParams.has("error")) {
        res.writeHead(400);
        res.end("Autorización cancelada o rechazada.");
        server.close();
        return;
    }

    // Recuperamos el código temporal enviado por Google.
    const code = url.searchParams.get("code");

    // Verificamos que Google haya enviado un código.
    if (!code) {
        res.writeHead(400);
        res.end("Google no entregó un código de autorización.");
        return;
    }

    try {
        // Intercambiamos el código temporal por los tokens.
        const { tokens } = await oauthClient.getToken(code);

        // Comprobamos que recibimos un refresh token.
        if (!tokens.refresh_token) {
            res.writeHead(400);
            res.end("No se recibió un refresh token.");

            console.error(
                "Google no entregó un refresh token. Revisa el consentimiento."
            );

            server.close();
            return;
        }

        // Informamos al navegador que terminó el proceso.
        res.writeHead(200, {
            "Content-Type": "text/html; charset=utf-8",
        });

        res.end(
            "<h2>Google Drive autorizado correctamente.</h2>" +
            "<p>Regresa a la terminal de Visual Studio Code.</p>"
        );

        // Mostramos el token solo en la terminal local.
        console.log("\n========================================");
        console.log("AUTORIZACIÓN COMPLETADA");
        console.log("========================================");

        console.log("\nGOOGLE_DRIVE_REFRESH_TOKEN=");
        console.log(tokens.refresh_token);

        console.log("\nGuarda este token en tu archivo .env.");
        console.log("No lo compartas ni lo subas a GitHub.");

        // Cerramos el servidor temporal.
        server.close();

    } catch (error) {
        // Informamos de errores sin imprimir credenciales.
        console.error("Falló el intercambio del código OAuth.");

        res.writeHead(500);
        res.end("No fue posible completar la autorización.");

        // Cerramos el servidor temporal.
        server.close();
    }
});

// =========================================================
// INICIAR AUTORIZACIÓN
// =========================================================

// Informamos si el puerto local no está disponible.
server.on("error", (error) => {
    console.error("No se pudo iniciar el servidor:", error.message);
});

// Iniciamos el servidor solo en este computador.
server.listen(53682, "127.0.0.1", () => {
    // Mostramos la dirección para autorizar Google Drive.
    console.log("\nABRE ESTA DIRECCIÓN EN TU NAVEGADOR:\n");

    console.log(authorizationUrl);

    console.log("\nAutoriza la cuenta institucional de El Ancla.");
});