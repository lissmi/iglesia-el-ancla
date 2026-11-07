// =========================================================
// AUDITORÍA SEGURA DE ARCHIVOS EDUCATIVOS DE GOOGLE DRIVE
// =========================================================
// SOLO LECTURA: no elimina archivos ni modifica MongoDB.
// Uso desde backend/:
// node --env-file=./src/middleware/.env ./src/scripts/resources/auditarArchivosRecursosDrive.js

// Reutilizamos el cliente de Drive ya configurado en el proyecto.
import { getGoogleDriveClient } from "../../services/drive/googleDrive.js";

// Reutilizamos el modelo de cambios editoriales del módulo.
import ResourceContent from "../../models/ResourceContent.js";

// Reutilizamos la conexión existente con MongoDB Atlas.
import connectDatabase from "../../config/database.js";

// Cerramos correctamente la conexión una vez terminada la auditoría.
import mongoose from "mongoose";

// Nombres generados por resourceContentRoutes.js para los PDF/Word o TXT.
const GENERATED_NAME = /(?:-[a-f0-9]{8}\.(?:pdf|doc|docx)|^discipulado-.+-[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.txt)$/i;

// Recopilamos todas las referencias de los dos estados de cada recurso.
function findReferences(documents) {
  const used = new Map();
  for (const document of documents) {
    for (const version of ["draftContent", "publishedContent"]) {
      const item = document[version];
      for (const field of ["driveFileId", "contentFileId"]) {
        const id = item?.[field];
        if (!id) continue;
        const references = used.get(id) || [];
        references.push(`${document.section}/${document.key} (${version})`);
        used.set(id, references);
      }
    }
  }
  return used;
}

// Leemos todas las páginas del catálogo de una sola carpeta de Drive.
async function listFolderFiles(drive, folderId) {
  const files = [];
  let pageToken;
  do {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: "nextPageToken,files(id,name,mimeType,size,createdTime)",
      pageSize: 1000,
      pageToken,
    });
    files.push(...(response.data.files || []));
    pageToken = response.data.nextPageToken;
  } while (pageToken);
  return files;
}

async function main() {
  const folderId = process.env.GOOGLE_DRIVE_RESOURCES_FOLDER_ID?.trim();
  // No permitimos incorporar una consulta arbitraria al identificador.
  if (!folderId || !/^[a-zA-Z0-9_-]+$/.test(folderId)) {
    throw new Error("Configura GOOGLE_DRIVE_RESOURCES_FOLDER_ID correctamente");
  }

  // Primero recuperamos los IDs utilizados por cualquiera de las versiones.
  await connectDatabase();
  const records = await ResourceContent.find({})
    .select("section key draftContent publishedContent")
    .lean();
  const references = findReferences(records);

  // Consultamos los archivos reales, sin descargarlos ni modificarlos.
  const driveFiles = await listFolderFiles(getGoogleDriveClient(), folderId);
  const recognized = driveFiles.filter((file) => GENERATED_NAME.test(file.name || ""));
  const unused = recognized.filter((file) => !references.has(file.id));
  const active = recognized.filter((file) => references.has(file.id));
  const other = driveFiles.length - recognized.length;

  console.log("\n========== AUDITORÍA DE RECURSOS ==========\n");
  console.log(`Documentos examinados en MongoDB: ${records.length}`);
  console.log(`Archivos en la carpeta: ${driveFiles.length}`);
  console.log(`Archivos reconocidos como generados por Recursos: ${recognized.length}`);
  console.log(`Archivos con referencia activa: ${active.length}`);
  console.log(`Posibles archivos sin referencia: ${unused.length}`);
  console.log(`Otros archivos (sin clasificar): ${other}`);

  if (unused.length) {
    console.log("\nPOSIBLES SOBRANTES (NO SE ELIMINARON):");
    for (const file of unused) {
      console.log(`- ${file.name} | ID: ${file.id} | creado: ${file.createdTime || "desconocido"}`);
    }
  }

  console.log("\nADVERTENCIA: un archivo sin referencia podría corresponder a una carga todavía en curso.");
  console.log("Ejecuta esta auditoría con las ediciones detenidas y comprueba los resultados antes de borrar nada.");
  console.log("No borres archivos automáticamente por nombre, tamaño ni parecido.\n");
}

try {
  await main();
} catch (error) {
  console.error("No se pudo completar la auditoría:", error?.message || error);
  process.exitCode = 1;
} finally {
  // Cerramos la conexión incluso si Drive no está disponible.
  await mongoose.disconnect();
}
