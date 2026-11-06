// =========================================================
// API DE PÁGINAS INFORMATIVAS - IGLESIA EL ANCLA
// =========================================================
// Este archivo organiza las funciones de las páginas informativas.
// NO crea otra instancia Axios: reutiliza la configuración global.

// Cliente HTTP compartido con los demás módulos de la PWA.
import api from "./api";

// Recursos originales incorporados en el frontend.
// Se identifican para evitar subirlos otra vez a Cloudinary.
import aboutDemoData from "../data/informationalPages/aboutDemoData";

// =========================================================
// PETICIONES Y PROCESAMIENTO DE IMÁGENES
// =========================================================

// Consulta la versión vigente para visitantes sin revelar borradores.
export async function getPublishedInformationalPage(slug) {
  const response = await api.get(`/informational-pages/${encodeURIComponent(slug)}`);
  return response.data;
}

// Recupera el borrador, la publicación y los metadatos para administración.
export async function getAdminInformationalPage(slug) {
  const response = await api.get(`/informational-pages/admin/${encodeURIComponent(slug)}`);
  return response.data;
}

// Obtiene los estados reales del módulo para el listado administrativo.
export async function getInformationalPageStatuses() {
  const response = await api.get("/informational-pages/admin/statuses");
  return response.data.pages;
}

// Guarda el borrador. La revisión previene cambios perdidos entre administradores.
export async function saveInformationalPageDraft(slug, content, expectedRevision) {
  const response = await api.put(
    `/informational-pages/admin/${encodeURIComponent(slug)}/draft`,
    { content, expectedRevision },
    { timeout: 30000 }
  );
  return response.data;
}

// Publica la revisión guardada; no se envía información arbitraria del navegador.
export async function publishInformationalPage(slug, expectedRevision) {
  const response = await api.post(
    `/informational-pages/admin/${encodeURIComponent(slug)}/publish`,
    { expectedRevision }
  );
  return response.data;
}

// =========================================================
// IMÁGENES INFORMATIVAS: SOLO SUBIR CAMBIOS REALES
// =========================================================

// Las imágenes originales del build se representan mediante claves estables.
// Así un cambio de texto jamás fuerza a subir los iconos originales.
const ABOUT_BUILTIN_IMAGES = Object.freeze({
  "intro.image": aboutDemoData.intro.image,
  "purpose.mission.icon": aboutDemoData.purpose.mission.icon,
  "purpose.vision.icon": aboutDemoData.purpose.vision.icon,
  "conviction.icon": aboutDemoData.conviction.icon,
  "pastor.image": aboutDemoData.pastor.image,
  ...Object.fromEntries(
    aboutDemoData.values.items.map((item, index) => [
      `values.items.${index}.icon`, item.icon,
    ])
  ),
});

// Compara un recurso importado por Webpack aunque cambie su hash tras un deploy.
// Se aplica exclusivamente a iconos/fotos originales conocidos por su campo.
function sameBundledAsset(first, second) {
  if (typeof first !== "string" || typeof second !== "string") return false;
  try {
    const left = new URL(first, window.location.origin).pathname;
    const right = new URL(second, window.location.origin).pathname;
    if (!left.startsWith("/static/media/") || !right.startsWith("/static/media/")) return false;
    const simplify = (name) => {
      const chunks = name.split("/").pop().split(".");
      // CRA: fichero.<hash>.png (la extensión permanece igual).
      if (chunks.length > 2) chunks.splice(chunks.length - 2, 1);
      return chunks.join(".");
    };
    return simplify(left) === simplify(right);
  } catch { return false; }
}

// Solo Nosotros utiliza actualmente imágenes configurables en sus datos.
function builtinImagesFor(slug) {
  return slug === "nosotros" ? ABOUT_BUILTIN_IMAGES : {};
}

// Recorre recursivamente las propiedades image/icon, conservando su ruta.
function visitImageFields(node, visitor, path = []) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    node.forEach((item, index) => visitImageFields(item, visitor, [...path, String(index)]));
    return;
  }
  for (const [key, value] of Object.entries(node)) {
    const location = [...path, key].join(".");
    if ((key === "image" || key === "icon") && typeof value === "string") {
      visitor(node, key, value, location);
    } else if (value && typeof value === "object") {
      visitImageFields(value, visitor, [...path, key]);
    }
  }
}

// Convierte referencias integradas (builtin) a imágenes importadas por React.
// Este paso es solo de presentación; los TXT conservan identificadores estables.
export function resolveInformationalImages(slug, content) {
  if (!content) return content;
  const result = structuredClone(content);
  const originals = builtinImagesFor(slug);
  visitImageFields(result, (node, key, src, location) => {
    const marker = `builtin:${slug}.${location}`;
    if ((src === marker || sameBundledAsset(src, originals[location])) && originals[location]) {
      node[key] = originals[location];
    }
  });
  return result;
}

// Subida segura de archivos realmente seleccionados por el administrador.
async function uploadImage(slug, imageFile) {
  const form = new FormData();
  form.append("image", imageFile, imageFile.name || "imagen.png");
  const response = await api.post(
    `/informational-pages/admin/${encodeURIComponent(slug)}/image`,
    form,
    { headers: { "Content-Type": undefined }, timeout: 60000 }
  );
  return response.data.url;
}

// Si un guardado falla, el backend verifica que la imagen no esté referenciada
// en Drive antes de retirar una subida nueva. No se borra a ciegas.
export async function cleanupPendingInformationalImages(slug, urls) {
  if (!urls?.length) return;
  await api.post(
    `/informational-pages/admin/${encodeURIComponent(slug)}/images/cleanup`,
    { urls },
    { timeout: 30000 }
  );
}

// Con las imágenes del editor usamos data URLs solo cuando el administrador
// seleccionó un nuevo archivo. No transformamos assets locales en subidas.
async function imageDataUrlToFile(src) {
  const response = await fetch(src);
  if (!response.ok) throw new Error("No fue posible leer la imagen seleccionada");
  const blob = await response.blob();
  const extensions = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };
  if (!extensions[blob.type] || !blob.size || blob.size > 5 * 1024 * 1024) {
    throw new Error("La imagen debe ser JPG, PNG o WebP y pesar máximo 5 MB");
  }
  return new File([blob], `imagen.${extensions[blob.type]}`, { type: blob.type });
}

// Resultado: { content, uploadedUrls }. Las URLs Cloudinary existentes no cambian.
export async function prepareInformationalImages(slug, content) {
  const prepared = structuredClone(content);
  const originals = builtinImagesFor(slug);
  const pending = [];
  const uploadedUrls = [];
  const seen = new Map();

  visitImageFields(prepared, (node, key, src, location) => {
    const marker = `builtin:${slug}.${location}`;
    if (src === originals[location] || src === marker || sameBundledAsset(src, originals[location])) {
      // Texto modificado, pero icono original intacto: ninguna subida.
      node[key] = marker;
    } else if (src.startsWith("data:image/")) {
      // Solo el selector EditableImage genera estos datos nuevos.
      pending.push({ node, key, src });
    }
    // Si src ya es URL Cloudinary, mantenemos exactamente la misma URL.
  });

  try {
    for (const item of pending) {
      if (!seen.has(item.src)) {
        const file = await imageDataUrlToFile(item.src);
        const url = await uploadImage(slug, file);
        seen.set(item.src, url);
        uploadedUrls.push(url);
      }
      item.node[item.key] = seen.get(item.src);
    }
  } catch (error) {
    // Evitamos archivos huérfanos si falla la subida número N.
    try { await cleanupPendingInformationalImages(slug, uploadedUrls); }
    catch (cleanupError) { console.error("Limpieza Cloudinary pendiente:", cleanupError); }
    throw error;
  }

  return { content: prepared, uploadedUrls };
}

// Mensaje comprensible, usando la respuesta real de Express si está presente.
export function informationalPageError(error) {
  return error?.response?.data?.message ||
    error?.message ||
    "No fue posible completar la operación";
}
