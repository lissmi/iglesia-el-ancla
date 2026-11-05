// =========================================================
// CREAR / COMPROBAR CARPETA "Páginas informativas" EN GOOGLE DRIVE
// Usar desde backend/ con --env-file=./src/middleware/.env.
// =========================================================

// Reutilizamos el cliente OAuth ya autorizado para Drive.
import { getGoogleDriveClient } from "../../services/drive/googleDrive.js";

// Nombre visible solicitado para la carpeta institucional.
const FOLDER_NAME = "Páginas informativas";

// Evitamos que una ejecución accidental genere carpetas duplicadas.
async function main() {
  const drive = getGoogleDriveClient();
  const configuredId = process.env.GOOGLE_DRIVE_INFORMATIONAL_PAGES_FOLDER_ID?.trim();

  // Si existe un ID configurado, comprobamos que realmente sea una carpeta.
  if (configuredId) {
    const { data } = await drive.files.get({
      fileId: configuredId,
      fields: "id,name,mimeType",
    });
    if (data.mimeType !== "application/vnd.google-apps.folder") {
      throw new Error("El ID configurado no corresponde a una carpeta de Google Drive");
    }
    console.log(`Carpeta ya configurada: ${data.name}`);
    console.log(`GOOGLE_DRIVE_INFORMATIONAL_PAGES_FOLDER_ID=${data.id}`);
    return;
  }

  // Con drive.file solo vemos carpetas creadas/seleccionadas por esta aplicación.
  // Si ya se creó mediante este script, la encontramos y reutilizamos.
  const { data: listing } = await drive.files.list({
    q: "name = 'Páginas informativas' and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
    fields: "nextPageToken,files(id,name,mimeType)",
    pageSize: 100,
  });

  if (listing.nextPageToken) {
    throw new Error("Hay demasiadas coincidencias; comprueba la carpeta manualmente");
  }
  if (listing.files?.length > 1) {
    throw new Error("Se encontraron varias carpetas con el mismo nombre. Define manualmente el ID correcto.");
  }

  // Solo se crea la carpeta cuando no existe ninguna accesible para la app.
  let folder = listing.files?.[0];
  if (!folder) {
    const result = await drive.files.create({
      requestBody: {
        name: FOLDER_NAME,
        mimeType: "application/vnd.google-apps.folder",
      },
      fields: "id,name,mimeType",
    });
    folder = result.data;
    console.log("Carpeta creada correctamente.");
  } else {
    console.log("Se encontró una carpeta existente de la aplicación.");
  }

  // Esta es la ÚNICA variable nueva que debes agregar al .env privado.
  console.log(`GOOGLE_DRIVE_INFORMATIONAL_PAGES_FOLDER_ID=${folder.id}`);
  console.log(`Ver carpeta: https://drive.google.com/drive/folders/${folder.id}`);
}

// Un error de OAuth o de permisos se comunica, sin imprimir tokens.
main().catch((error) => {
  console.error("No se pudo preparar la carpeta:", error.message);
  process.exitCode = 1;
});
