// =========================================================
// LIMPIEZA SEGURA DE IMÁGENES DE PÁGINAS INFORMATIVAS
// Solo elimina imágenes subidas POR ESTE MÓDULO y sin referencias.
// =========================================================

// Reutilizamos la configuración Cloudinary del proyecto.
import cloudinary from "./cloudinary.js";

// UUID generado por el endpoint POST /image.
const IMAGE_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Extraemos el public_id de una URL propia, sin confiar en IDs del navegador.
export function ownedInformationalImageId(imageUrl, slug, cloudName = process.env.CLOUDINARY_CLOUD_NAME) {
  if (typeof imageUrl !== "string" || !cloudName || !/^[a-z0-9-]+$/i.test(slug)) return null;
  let url;
  try { url = new URL(imageUrl); } catch { return null; }
  if (url.protocol !== "https:" || url.hostname !== "res.cloudinary.com" ||
      url.username || url.password || url.search || url.hash) return null;

  // El formato generado por upload_stream es /cloud/image/upload/vN/folder/uuid.ext.
  const prefix = `/${cloudName}/image/upload/`;
  if (!url.pathname.startsWith(prefix)) return null;
  const suffix = url.pathname.slice(prefix.length).replace(/^v\d+\//, "");
  const folder = `el-ancla/informational-pages/${slug}/`;
  if (!suffix.startsWith(folder)) return null;
  const match = suffix.slice(folder.length).match(/^([^/]+)\.(png|jpe?g|webp)$/i);
  if (!match || !IMAGE_UUID.test(match[1])) return null;

  // Cloudinary espera el public_id sin extensión para los formatos habituales.
  return `${folder}${match[1]}`;
}

// Recopilamos las referencias utilizadas sin tratar el texto de la página como HTML.
export function usedInformationalImageIds(content, slug) {
  const ids = new Set();
  const visit = (node) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) { node.forEach(visit); return; }
    for (const [key, value] of Object.entries(node)) {
      if ((key === "image" || key === "icon") && typeof value === "string") {
        const publicId = ownedInformationalImageId(value, slug);
        if (publicId) ids.add(publicId);
      } else if (value && typeof value === "object") {
        visit(value);
      }
    }
  };
  visit(content);
  return ids;
}

// Compara imágenes candidatas con ambos TXT vigentes. Nunca borra referencias
// que continúen apareciendo en borrador o publicación; el texto puro no cambia nada.
export async function cleanupUploadedInformationalImages({
  slug,
  candidates = [],
  retained = [],
  uploader = cloudinary.uploader,
}) {
  const retainedIds = new Set();
  for (const doc of retained) {
    for (const id of usedInformationalImageIds(doc, slug)) retainedIds.add(id);
  }
  const candidateIds = new Set();
  for (const url of candidates) {
    const id = ownedInformationalImageId(url, slug);
    if (id && !retainedIds.has(id)) candidateIds.add(id);
  }

  let deleted = 0;
  const failed = [];
  for (const id of candidateIds) {
    try {
      const result = await uploader.destroy(id, { resource_type: "image", invalidate: true });
      if (result?.result === "ok" || result?.result === "not found") deleted++;
      else failed.push(id);
    } catch (error) {
      // No se compromete un guardado válido si Cloudinary está temporalmente caído.
      console.error("No fue posible limpiar imagen informativa:", id, error?.message);
      failed.push(id);
    }
  }
  return { deleted, failed: failed.length };
}
