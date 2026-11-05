// =========================================================
// PÁGINAS INFORMATIVAS - ÍNDICE MONGODB + ARCHIVOS DRIVE
// Iglesia El Ancla: Mongo guarda IDs, versiones y responsables.
// El contenido editorial NO se guarda en MongoDB.
// =========================================================

// Creamos streams para los archivos TXT de Drive.
import { Readable } from "node:stream";

// Los tokens del bloqueo evitan que dos solicitudes escriban simultáneamente.
import { randomUUID } from "node:crypto";

// Reutilizamos el mismo cliente de Google Drive que las canciones.
import { getGoogleDriveClient } from "./googleDrive.js";

// Limpiamos solo imágenes que ya no aparecen en borrador ni publicación.
import { cleanupUploadedInformationalImages } from "../cloudinary/informationalPagesImages.js";

// Reutilizamos el catálogo y el modelo de metadatos.
import InformationalPage, {
  INFORMATIONAL_PAGE_SLUGS,
} from "../../models/InformationalPage.js";

// Conservamos la exportación esperada por informationalPageRoutes.js.
export { INFORMATIONAL_PAGE_SLUGS };

// Identificadores legibles de las dos variantes de cada página.
const VERSIONS = Object.freeze({ draft: "borrador", published: "publicado" });

// Los TXT no deben exceder este tamaño (en bytes UTF-8).
const MAX_FILE_BYTES = 150 * 1024;

// El bloqueo es temporal para poder recuperarse de procesos interrumpidos.
const LOCK_DURATION_MS = 120_000;

// Controlamos los errores que deben llegar como códigos HTTP específicos.
function serviceError(message, status = 503) {
  const error = new Error(message);
  error.status = status;
  return error;
}

// Tomamos el ID de la carpeta existente desde el .env del backend.
export function getInformationalFolderId() {
  const id = process.env.GOOGLE_DRIVE_INFORMATIONAL_PAGES_FOLDER_ID?.trim();
  if (!id) {
    throw serviceError("Falta configurar GOOGLE_DRIVE_INFORMATIONAL_PAGES_FOLDER_ID");
  }
  return id;
}

// Impedimos construir nombres a partir de slugs arbitrarios del cliente.
function fileName(slug, kind) {
  if (!INFORMATIONAL_PAGE_SLUGS.includes(slug) || !Object.hasOwn(VERSIONS, kind)) {
    throw serviceError("Página o versión desconocida", 400);
  }
  return `${slug}.${VERSIONS[kind]}.txt`;
}

// Escapamos caracteres especiales en las búsquedas de Drive.
function escapeDriveQuery(value) {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

// Buscamos por nombre SOLO al recuperar archivos de la versión anterior.
async function findLegacyFile(drive, folderId, name) {
  let pageToken;
  const matches = [];
  do {
    const { data } = await drive.files.list({
      q: `'${escapeDriveQuery(folderId)}' in parents and name = '${escapeDriveQuery(name)}' and trashed = false`,
      fields: "nextPageToken,files(id,name,mimeType,parents,trashed)",
      pageSize: 100,
      pageToken,
    });
    matches.push(...(data.files || []));
    pageToken = data.nextPageToken || undefined;
  } while (pageToken);

  // Google Drive acepta nombres duplicados, por eso no elegimos uno al azar.
  if (matches.length > 1) {
    throw serviceError(`Existen varios archivos llamados ${name} en Drive. Corrígelos antes de continuar.`);
  }
  if (matches[0] && matches[0].mimeType !== "text/plain") {
    throw serviceError(`El archivo ${name} no es un TXT válido.`);
  }
  return matches[0] || null;
}

// Descargamos exclusivamente el contenido del archivo con el ID indicado.
async function downloadJsonFile(drive, fileId, name) {
  const { data } = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "arraybuffer" }
  );
  const buffer = Buffer.from(data);
  if (!buffer.length || buffer.length > MAX_FILE_BYTES) {
    throw serviceError(`El contenido de ${name} está vacío o excede el límite.`);
  }
  try {
    return JSON.parse(buffer.toString("utf8"));
  } catch {
    throw serviceError(`El archivo ${name} no contiene JSON válido.`);
  }
}

// Verificamos que el TXT corresponde a la página y versión solicitadas.
function validateSavedDocument(value, slug, kind, name) {
  if (!value || typeof value !== "object" || Array.isArray(value) ||
      value.schemaVersion !== 1 || value.slug !== slug || value.kind !== kind ||
      !Number.isSafeInteger(value.revision) || value.revision < 1 ||
      typeof value.updatedAt !== "string" ||
      Number.isNaN(new Date(value.updatedAt).getTime()) ||
      !value.content || typeof value.content !== "object" || Array.isArray(value.content)) {
    throw serviceError(`El archivo ${name} tiene una estructura inválida.`);
  }
  return value;
}

// Lee un TXT por su ID de MongoDB y verifica su carpeta, nombre y tipo.
async function readById(drive, folderId, fileId, slug, kind) {
  if (!fileId) return null;
  const name = fileName(slug, kind);
  const { data: file } = await drive.files.get({
    fileId,
    fields: "id,name,mimeType,parents,trashed",
  });
  if (file.trashed || file.mimeType !== "text/plain" || file.name !== name ||
      !file.parents?.includes(folderId)) {
    throw serviceError(`El archivo vinculado a ${name} no coincide con los metadatos de Drive.`);
  }
  return validateSavedDocument(await downloadJsonFile(drive, fileId, name), slug, kind, name);
}

// Actualizamos un TXT existente o lo creamos una sola vez en la carpeta.
async function writeDocument(drive, folderId, slug, kind, document, currentFileId) {
  const name = fileName(slug, kind);
  const text = `${JSON.stringify(document, null, 2)}\n`;
  if (Buffer.byteLength(text, "utf8") > MAX_FILE_BYTES) {
    throw serviceError("El TXT de la página supera el límite permitido", 400);
  }
  const requestBody = {
    appProperties: {
      informationalPage: "yes",
      slug,
      kind,
      revision: String(document.revision),
      updatedAt: document.updatedAt,
    },
  };
  const media = {
    mimeType: "text/plain",
    body: Readable.from([Buffer.from(text, "utf8")]),
  };

  if (currentFileId) {
    // El ID permanece estable incluso después de modificar el TXT.
    const { data } = await drive.files.update({
      fileId: currentFileId,
      requestBody,
      media,
      fields: "id",
    });
    return data.id || currentFileId;
  }

  // En una creación nueva guardamos el ID retornado para registrar en Mongo.
  const { data } = await drive.files.create({
    requestBody: {
      ...requestBody,
      name,
      mimeType: "text/plain",
      parents: [folderId],
    },
    media,
    fields: "id",
  });
  if (!data.id) throw serviceError(`Google Drive no devolvió el ID de ${name}.`);
  return data.id;
}

// Recuperamos un registro con IDs ocultos; no se devolverán al frontend.
async function findMetadata(slug) {
  return InformationalPage.findOne({ slug })
    .select("+draftFileId +publishedFileId +writeLockToken +writeLockUntil");
}

// Esta función migra automáticamente los TXT creados por la versión 3.
// Se consulta por nombre solamente si Mongo aún no contiene los IDs.
async function indexExistingFiles(slug, drive, folderId) {
  const current = await findMetadata(slug);
  if (current && current.draftFileId && current.publishedFileId) return current;

  // Si se está escribiendo un archivo, no indexamos estados intermedios.
  if (current?.writeLockUntil && current.writeLockUntil > new Date()) return current;

  // Al faltar el índice, buscamos la(s) versión(es) preexistentes.
  const [draftFile, publishedFile] = await Promise.all([
    current?.draftFileId ? null : findLegacyFile(drive, folderId, fileName(slug, "draft")),
    current?.publishedFileId ? null : findLegacyFile(drive, folderId, fileName(slug, "published")),
  ]);

  // Leer el TXT verifica que un nombre coincidente no tenga otro contenido.
  const [draftDoc, publishedDoc] = await Promise.all([
    draftFile ? readById(drive, folderId, draftFile.id, slug, "draft") : null,
    publishedFile ? readById(drive, folderId, publishedFile.id, slug, "published") : null,
  ]);

  // Si falta una fila, se crea con los IDs y revisiones existentes.
  // Con $setOnInsert conservamos cualquier fila creada por otra solicitud.
  let row;
  try {
    row = await InformationalPage.findOneAndUpdate(
      { slug },
      {
        $setOnInsert: {
          slug,
          draftFileId: draftFile?.id || null,
          publishedFileId: publishedFile?.id || null,
          draftRevision: draftDoc?.revision || 0,
          publishedRevision: publishedDoc?.revision || 0,
          draftUpdatedAt: draftDoc ? new Date(draftDoc.updatedAt) : null,
          publishedAt: publishedDoc ? new Date(publishedDoc.updatedAt) : null,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).select("+draftFileId +publishedFileId +writeLockToken +writeLockUntil");
  } catch (error) {
    if (error.code !== 11000) throw error;
    row = await findMetadata(slug);
  }

  // Una fila antigua sin vínculo puede enlazarse, sin reemplazar IDs existentes.
  if (row && ((!row.draftFileId && draftFile) || (!row.publishedFileId && publishedFile))) {
    const patch = {};
    if (!row.draftFileId && draftFile) {
      patch.draftFileId = draftFile.id;
      patch.draftRevision = draftDoc.revision;
      patch.draftUpdatedAt = new Date(draftDoc.updatedAt);
    }
    if (!row.publishedFileId && publishedFile) {
      patch.publishedFileId = publishedFile.id;
      patch.publishedRevision = publishedDoc.revision;
      patch.publishedAt = new Date(publishedDoc.updatedAt);
    }
    await InformationalPage.updateOne({ slug }, { $set: patch });
    row = await findMetadata(slug);
  }
  // Si Mongo indica una versión pero falta su TXT, evitamos perder datos.
  if (row.draftRevision > 0 && !row.draftFileId) {
    throw serviceError(`No se encontró el TXT del borrador de ${slug}.`);
  }
  if (row.publishedRevision > 0 && !row.publishedFileId) {
    throw serviceError(`No se encontró el TXT publicado de ${slug}.`);
  }
  return row;
}

// Sincronizamos metadatos si Drive escribió correctamente, pero el proceso
// se interrumpió antes de registrar la revisión en MongoDB.
async function reconcileRevision(row, kind, doc) {
  if (!doc) return row;
  const revisionField = kind === "draft" ? "draftRevision" : "publishedRevision";
  const dateField = kind === "draft" ? "draftUpdatedAt" : "publishedAt";
  if (doc.revision === row[revisionField]) return row;
  if (doc.revision < row[revisionField]) {
    throw serviceError(`Los metadatos de ${row.slug} están adelantados respecto del TXT de Drive.`);
  }
  // No retrocedemos revisiones; un registro atrasado se corrige con el TXT real.
  await InformationalPage.updateOne(
    { _id: row._id, [revisionField]: row[revisionField] },
    { $set: { [revisionField]: doc.revision, [dateField]: new Date(doc.updatedAt) } }
  );
  return (await findMetadata(row.slug)) || row;
}

// Un bloqueo en Mongo evita que instancias distintas escriban a la vez.
async function acquireWriteLock(slug) {
  const token = randomUUID();
  const now = new Date();
  const locked = await InformationalPage.findOneAndUpdate(
    {
      slug,
      $or: [
        { writeLockUntil: null },
        { writeLockUntil: { $lte: now } },
      ],
    },
    {
      $set: {
        writeLockToken: token,
        writeLockUntil: new Date(Date.now() + LOCK_DURATION_MS),
      },
    },
    { new: true }
  ).select("+draftFileId +publishedFileId +writeLockToken +writeLockUntil");
  if (!locked) {
    throw serviceError("Esta página está siendo guardada por otra solicitud. Reintenta en unos segundos.", 409);
  }
  return { token, row: locked };
}

// Liberamos el bloqueo aunque Drive falle o se rechace una versión antigua.
async function releaseWriteLock(slug, token) {
  await InformationalPage.updateOne(
    { slug, writeLockToken: token },
    { $set: { writeLockToken: null, writeLockUntil: null } }
  );
}

// Identificamos imágenes existentes en un documento para compararlas tras guardar.
function imageUrls(content) {
  const values = [];
  const visit = (node) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) { node.forEach(visit); return; }
    for (const [key, value] of Object.entries(node)) {
      if ((key === "image" || key === "icon") && typeof value === "string") {
        values.push(value);
      } else if (value && typeof value === "object") visit(value);
    }
  };
  visit(content);
  return values;
}

// Servicio con la misma interfaz HTTP de la versión 3.
export function createInformationalPagesDriveService({
  getDrive = getGoogleDriveClient,
  getFolderId = getInformationalFolderId,
} = {}) {
  // El público consulta exclusivamente la versión publicada por su ID.
  async function loadPublished(slug) {
    const drive = getDrive();
    const folderId = getFolderId();
    let row = await indexExistingFiles(slug, drive, folderId);
    const published = await readById(drive, folderId, row.publishedFileId, slug, "published");
    row = await reconcileRevision(row, "published", published);
    return {
      published: Boolean(published),
      content: published?.content || null,
      publishedAt: published?.updatedAt || null,
    };
  }

  // La administración ve ambos TXT y sus versiones.
  async function loadAdmin(slug) {
    const drive = getDrive();
    const folderId = getFolderId();
    let row = await indexExistingFiles(slug, drive, folderId);
    const [draft, published] = await Promise.all([
      readById(drive, folderId, row.draftFileId, slug, "draft"),
      readById(drive, folderId, row.publishedFileId, slug, "published"),
    ]);
    row = await reconcileRevision(row, "draft", draft);
    row = await reconcileRevision(row, "published", published);
    return {
      draft: draft?.content || null,
      published: published?.content || null,
      draftRevision: row.draftRevision,
      publishedRevision: row.publishedRevision,
      lastSaved: row.draftUpdatedAt || null,
      publishedAt: row.publishedAt || null,
    };
  }

  // El listado se construye desde los metadatos, sin descargar ocho TXT.
  async function listStatuses() {
    const drive = getDrive();
    const folderId = getFolderId();
    await Promise.all(INFORMATIONAL_PAGE_SLUGS.map((slug) => indexExistingFiles(slug, drive, folderId)));
    const rows = await InformationalPage.find({ slug: { $in: INFORMATIONAL_PAGE_SLUGS } }).lean();
    const bySlug = new Map(rows.map((row) => [row.slug, row]));
    return INFORMATIONAL_PAGE_SLUGS.map((slug) => {
      const row = bySlug.get(slug);
      return {
        slug,
        draftRevision: row?.draftRevision || 0,
        publishedRevision: row?.publishedRevision || 0,
        publishedAt: row?.publishedAt || null,
        updatedAt: row?.draftUpdatedAt || null,
      };
    });
  }

  // Guardamos una revisión nueva del borrador, sin tocar el TXT publicado.
  async function saveDraft(slug, content, expectedRevision, userId) {
    const drive = getDrive();
    const folderId = getFolderId();
    await indexExistingFiles(slug, drive, folderId);
    const { token } = await acquireWriteLock(slug);
    // La limpieza se realiza DESPUÉS de persistir el TXT y MongoDB.
    let removedImageCandidates = [];
    try {
      let row = await findMetadata(slug);
      const current = await readById(drive, folderId, row.draftFileId, slug, "draft");
      row = await reconcileRevision(row, "draft", current);
      if (row.draftRevision !== expectedRevision) {
        throw serviceError("Otro administrador guardó una versión más reciente. Recarga el editor.", 409);
      }
      const now = new Date().toISOString();
      const next = {
        schemaVersion: 1,
        slug,
        kind: "draft",
        revision: expectedRevision + 1,
        updatedAt: now,
        updatedBy: String(userId || "administracion"),
        content,
      };
      const fileId = await writeDocument(drive, folderId, slug, "draft", next, row.draftFileId);
      const updated = await InformationalPage.findOneAndUpdate(
        { _id: row._id, writeLockToken: token, draftRevision: expectedRevision },
        {
          $set: {
            draftFileId: fileId,
            draftUpdatedAt: new Date(now),
            draftUpdatedBy: userId || null,
          },
          $inc: { draftRevision: 1 },
        },
        { new: true }
      );
      if (!updated) throw serviceError("No se pudo registrar la revisión en MongoDB. Revisa el estado antes de repetir el guardado.");
      // Guardamos solo las imágenes que figuraban en el borrador anterior.
      // Nunca se eliminará ninguna si continúa en el TXT publicado.
      if (current?.content) removedImageCandidates = [current.content];
      return { draftRevision: next.revision, lastSaved: now };
    } finally {
      await releaseWriteLock(slug, token);
      if (removedImageCandidates.length) {
        try {
          const latest = await loadAdmin(slug);
          await cleanupUploadedInformationalImages({
            slug,
            candidates: removedImageCandidates.flatMap((doc) => imageUrls(doc)),
            retained: [latest.draft, latest.published],
          });
        } catch (error) {
          // La limpieza no revierte un guardado que ya quedó confirmado.
          console.error("Limpieza diferida de imágenes informativas:", error?.message);
        }
      }
    }
  }

  // Publicamos el último borrador guardado usando el ID de Drive de la página.
  async function publishDraft(slug, expectedRevision, userId) {
    const drive = getDrive();
    const folderId = getFolderId();
    await indexExistingFiles(slug, drive, folderId);
    const { token } = await acquireWriteLock(slug);
    let previousPublishedImages = [];
    try {
      let row = await findMetadata(slug);
      const draft = await readById(drive, folderId, row.draftFileId, slug, "draft");
      row = await reconcileRevision(row, "draft", draft);
      if (!draft || row.draftRevision !== expectedRevision) {
        throw serviceError("El borrador no existe o fue modificado. Recarga antes de publicar.", 409);
      }
      // Antes de cambiar el TXT público leemos las referencias antiguas.
      const previous = await readById(drive, folderId, row.publishedFileId, slug, "published");
      const now = new Date().toISOString();
      const next = {
        schemaVersion: 1,
        slug,
        kind: "published",
        revision: draft.revision,
        updatedAt: now,
        updatedBy: String(userId || "administracion"),
        content: draft.content,
      };
      const publishedFileId = await writeDocument(drive, folderId, slug, "published", next, row.publishedFileId);
      const updated = await InformationalPage.findOneAndUpdate(
        { _id: row._id, writeLockToken: token, draftRevision: expectedRevision },
        {
          $set: {
            publishedFileId,
            publishedRevision: next.revision,
            publishedAt: new Date(now),
            publishedBy: userId || null,
          },
        },
        { new: true }
      );
      if (!updated) throw serviceError("El TXT se publicó, pero falló el registro de metadatos. Comprueba la publicación antes de reintentar.");
      if (previous?.content) previousPublishedImages = imageUrls(previous.content);
      return { publishedRevision: next.revision, publishedAt: now };
    } finally {
      await releaseWriteLock(slug, token);
      if (previousPublishedImages.length) {
        try {
          const latest = await loadAdmin(slug);
          await cleanupUploadedInformationalImages({
            slug,
            candidates: previousPublishedImages,
            retained: [latest.draft, latest.published],
          });
        } catch (error) {
          console.error("Limpieza diferida de imágenes publicadas:", error?.message);
        }
      }
    }
  }

  return { loadPublished, loadAdmin, listStatuses, saveDraft, publishDraft };
}

// Instancia compartida por los endpoints existentes de Express.
export const informationalPagesDrive = createInformationalPagesDriveService();
