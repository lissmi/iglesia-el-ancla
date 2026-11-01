// =========================================================
// ALMACENAMIENTO PRIVADO DEL CANCIONERO EN GOOGLE DRIVE
// =========================================================

// Convertimos los Buffer en transmisiones compatibles con Drive API.
import { Readable } from "node:stream";

// Reutilizamos OAuth institucional ya configurado en el proyecto.
import { getGoogleDriveClient } from "../drive/googleDrive.js";

// Recuperamos la carpeta exclusiva del cancionero.
function getSongFolderId() {
    const id = process.env.GOOGLE_DRIVE_SONGBOOK_FOLDER_ID;
    if (!id) throw new Error("Falta GOOGLE_DRIVE_SONGBOOK_FOLDER_ID en el backend");
    return id;
}

// Subimos un archivo privado y devolvemos exclusivamente su identificador.
export async function uploadSongFile(buffer, name, mimeType) {
    // Creamos una conexión autenticada con Google Drive.
    const drive = getGoogleDriveClient();

    // Subimos el archivo a la carpeta institucional del cancionero.
    const response = await drive.files.create({
        requestBody: { name, parents: [getSongFolderId()] },
        media: { mimeType, body: Readable.from(buffer) },
        fields: "id",
    });

    // Confirmamos que Drive entregó un identificador válido.
    if (!response.data.id) throw new Error("Drive no devolvió el ID del archivo");

    // MongoDB conservará este identificador, nunca el archivo.
    return response.data.id;
}

// Recuperamos un archivo privado como un flujo de lectura.
export async function getSongFileStream(fileId) {
    // Creamos el cliente OAuth.
    const drive = getGoogleDriveClient();

    // Solicitamos el contenido binario sin compartirlo públicamente.
    const response = await drive.files.get(
        { fileId, alt: "media" },
        { responseType: "stream" }
    );

    // Devolvemos el flujo para transmitirlo al navegador o editor.
    return response.data;
}

// Borramos un archivo y permitimos repetir la operación si ya fue eliminado.
export async function deleteSongFile(fileId) {
    // No intentamos borrar identificadores inexistentes.
    if (!fileId) return;

    // Obtenemos el cliente autenticado.
    const drive = getGoogleDriveClient();

    try {
        // Eliminamos definitivamente el documento privado.
        await drive.files.delete({ fileId });
    } catch (error) {
        // Un archivo ya inexistente se considera limpiado.
        if (error?.code === 404 || error?.response?.status === 404) return;

        // Otros errores se propagan para evitar afirmar un éxito falso.
        throw error;
    }
}

// Recuperamos el texto original para rellenar el formulario de edición.
export async function readSongSource(fileId) {
    // Obtenemos el flujo TXT desde Google Drive.
    const stream = await getSongFileStream(fileId);

    // Limitamos la cantidad de datos para proteger memoria del servidor.
    const MAX_BYTES = 80 * 1024;
    const parts = [];
    let size = 0;

    // Leemos cada fragmento del archivo.
    for await (const chunk of stream) {
        size += chunk.length;
        if (size > MAX_BYTES) {
            stream.destroy();
            throw new Error("El texto de la canción excede el límite permitido");
        }
        parts.push(chunk);
    }

    // Devolvemos el texto UTF-8 conservando sus saltos de línea.
    return Buffer.concat(parts).toString("utf8");
}
