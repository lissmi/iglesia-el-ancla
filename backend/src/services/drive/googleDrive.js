// =========================================================
// CONFIGURACIÓN DE GOOGLE DRIVE
// =========================================================

// Importamos la biblioteca oficial de Google.
import { google } from "googleapis";

// Creamos un cliente autenticado para Google Drive.
export function getGoogleDriveClient() {

    // Credenciales necesarias para operar.
    const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;

    // No permitimos conexiones sin configuración completa.
    if (!clientId || !clientSecret || !refreshToken) {
        throw new Error(
            "Faltan credenciales de Google Drive"
        );
    }

    // Creamos el cliente OAuth 2.0.
    const oauth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret
    );

    // Autorizamos la cuenta institucional.
    oauth2Client.setCredentials({
        refresh_token: refreshToken,
    });

    // Creamos la conexión a Google Drive API v3.
    return google.drive({
        version: "v3",
        auth: oauth2Client,
    });
}
