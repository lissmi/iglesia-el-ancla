// =========================================================
// RECURSOS - SERVICIO HTTP Y CONSULTA REUTILIZABLE
// =========================================================
// Utilizamos la MISMA instancia Axios global con cookies HttpOnly.
import { useEffect, useMemo, useState } from "react";
import api from "./api";

const url = (section) => `/resource-content/${encodeURIComponent(section)}`;
const adminUrl = (section) => `/resource-content/admin/${encodeURIComponent(section)}`;

export async function getPublishedResourceContent(section) {
  const { data } = await api.get(url(section));
  return data;
}
// Los estudios extensos se consultan solo cuando el miembro abre uno.
// El listado devuelve metadatos breves para que las tarjetas carguen rápido.
export async function getPublishedDiscipleshipContent(key) {
  const { data } = await api.get(`${url("discipleship")}/entries/${encodeURIComponent(key)}/content`);
  return data.content;
}
// El catálogo solo entrega los datos breves de las guías guardadas en Drive.
// La guía completa se recupera al abrir su ficha.
export async function getPublishedPrayerGuideContent(key) {
  const { data } = await api.get(`${url("prayer_guides")}/entries/${encodeURIComponent(key)}/content`);
  return data.content;
}
export async function getAdminResourceContent(section) {
  const { data } = await api.get(`${adminUrl(section)}`);
  return data;
}
export async function saveResourcePageDraft(section, content, expectedRevision) {
  const { data } = await api.put(`${adminUrl(section)}/page/draft`,
    { content, expectedRevision });
  return data.item;
}
export async function publishResourcePage(section, expectedRevision) {
  const { data } = await api.post(`${adminUrl(section)}/page/publish`,
    { expectedRevision });
  return data.item;
}
export async function saveResourceEntryDraft(section, key, content, isCustom, expectedRevision) {
  const { data } = await api.put(
    `${adminUrl(section)}/entries/${encodeURIComponent(key)}/draft`,
    { content, isCustom, expectedRevision }
  );
  return data.item;
}
export async function publishResourceEntry(section, key, expectedRevision) {
  const { data } = await api.post(
    `${adminUrl(section)}/entries/${encodeURIComponent(key)}/publish`,
    { expectedRevision }
  );
  return data.item;
}
// Oculta temporalmente tanto materiales iniciales como documentos añadidos.
// El archivo original permanece guardado en Drive.
export async function hideResourceEntry(section, key, isBuiltin, expectedRevision) {
  const { data } = await api.post(
    `${adminUrl(section)}/entries/${encodeURIComponent(key)}/hide`,
    { isBuiltin, expectedRevision }
  );
  return data;
}

// Borra el registro de MongoDB; si es un material nuevo, también desaparece
// del catálogo. Los originales de React recuperan su contenido inicial.
export async function permanentlyDeleteResourceEntry(section, key, expectedRevision) {
  const { data } = await api.delete(
    `${adminUrl(section)}/entries/${encodeURIComponent(key)}/permanent`,
    { data: { expectedRevision } }
  );
  return data;
}

export async function restoreResourceEntry(section, key) {
  const { data } = await api.post(
    `${adminUrl(section)}/entries/${encodeURIComponent(key)}/restore`, {}
  );
  return data;
}

// Carga un PDF o Word y guarda su borrador en una sola petición.
// El backend identifica su formato; nunca guarda los bytes en MongoDB.
export async function saveDownloadFileDraft(key, content, isCustom, expectedRevision, file) {
  const form = new FormData();
  form.append("content", JSON.stringify(content));
  form.append("isCustom", String(isCustom));
  form.append("expectedRevision", String(expectedRevision));
  form.append("file", file, file.name);
  const { data } = await api.put(
    `${adminUrl("downloads")}/entries/${encodeURIComponent(key)}/file-draft`,
    form,
    { timeout: 90000, headers: { "Content-Type": undefined } }
  );
  return data.item;
}

// =========================================================
// DESCARGA DE RECURSOS PUBLICADOS (DRIVE Y ARCHIVOS ANTERIORES)
// =========================================================

// Evitamos que el nombre del material se utilice como una ruta de archivo.
function safeDownloadName(title, format = "pdf") {
  const extension = ["pdf", "doc", "docx"].includes(String(format).toLowerCase())
    ? String(format).toLowerCase() : "pdf";
  const name = String(title || "Material")
    .replace(/[\\/:*?"<>|]/g, "").replace(/\p{Cc}/gu, "").trim().slice(0, 120) || "Material";
  return `${name}.${extension}`;
}

// Descargamos un Blob conservando el formato que indicó el backend.
function saveBlob(blob, name) {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Liberamos la memoria cuando el navegador ya haya recibido el archivo.
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
}

// Axios recibe los errores de una petición blob también como Blob.
// Los convertimos a texto para mostrar un aviso útil en vez de [object Blob].
async function downloadErrorMessage(error) {
  const data = error?.response?.data;
  if (data instanceof Blob) {
    try {
      const parsed = JSON.parse(await data.text());
      if (typeof parsed?.message === "string") return parsed.message;
    } catch { /* Si no hay JSON válido, mostramos un mensaje general. */ }
  }
  return typeof data?.message === "string" ? data.message :
    error?.message || "No pudimos descargar el documento. Inténtalo nuevamente.";
}

// El servidor comprueba nuevamente que el recurso esté publicado y que
// el usuario haya iniciado sesión; el ID privado de Drive nunca llega a React.
export async function downloadResourceFile(key, title = "Material", format = "pdf") {
  try {
    const response = await api.get(
      `${url("downloads")}/entries/${encodeURIComponent(key)}/file`,
      { responseType: "blob", timeout: 90000 }
    );
    // Un archivo exitoso no debe ser un documento de error JSON.
    if (/application\/json/i.test(response.headers?.["content-type"] || "")) {
      throw new Error("El servidor no devolvió un archivo descargable");
    }
    saveBlob(response.data, safeDownloadName(title, format));
  } catch (error) {
    throw new Error(await downloadErrorMessage(error));
  }
}

// Exportamos un estudio completo a PDF sin crear archivos adicionales en Drive.
// Los originales se envían solo para generar el PDF; el backend utiliza su
// propia publicación cuando el administrador haya editado el material.
export async function downloadDiscipleshipPdf(material) {
  if (!material?.id) {
    throw new Error("No encontramos el estudio que deseas descargar.");
  }

  // En React se guarda la versión inicial, pero las modificaciones publicadas
  // se recuperan del servidor y no deben reemplazarse por ese contenido inicial.
  const originalContent = material.driveStored ? undefined : material;
  try {
    const response = await api.post(
      `${url("discipleship")}/entries/${encodeURIComponent(resourceEntryKey(material))}/pdf`,
      { ...(originalContent ? { originalContent } : {}) },
      { responseType: "blob", timeout: 90000 }
    );
    if (!/application\/pdf/i.test(response.headers?.["content-type"] || "")) {
      throw new Error("El servidor no devolvió un documento PDF.");
    }
    saveBlob(response.data, safeDownloadName(material.title, "pdf"));
  } catch (error) {
    throw new Error(await downloadErrorMessage(error));
  }
}

// Generamos la guía de oración publicada en PDF al solicitarla.
// No se crea otro archivo en Google Drive ni en la base de datos.
export async function downloadPrayerGuidePdf(guide) {
  if (!guide?.id) throw new Error("No encontramos la guía que deseas descargar.");
  const originalContent = guide.driveStored ? undefined : guide;
  try {
    const response = await api.post(
      `${url("prayer_guides")}/entries/${encodeURIComponent(resourceEntryKey(guide))}/pdf`,
      { ...(originalContent ? { originalContent } : {}) },
      { responseType: "blob", timeout: 90000 }
    );
    if (!/application\/pdf/i.test(response.headers?.["content-type"] || "")) {
      throw new Error("El servidor no devolvió un documento PDF.");
    }
    saveBlob(response.data, safeDownloadName(guide.title, "pdf"));
  } catch (error) {
    throw new Error(await downloadErrorMessage(error));
  }
}

// Reutilizamos un único flujo para la tarjeta y la página de detalles.
// Los materiales originales sin archivo siguen visibles como Próximamente.
export async function downloadAvailableResource(material) {
  if (!material?.available) {
    throw new Error("Este material todavía no tiene un archivo disponible para descargar.");
  }

  if (material.driveStored) {
    return downloadResourceFile(resourceEntryKey(material), material.title, material.format);
  }

  const filePath = material.filePath;
  // Compatibilidad con antiguos archivos guardados en public/downloads/.
  if (typeof filePath === "string" &&
      /^\/downloads\/[\w./%-]+\.(pdf|doc|docx)$/i.test(filePath) &&
      !filePath.includes("..")) {
    const response = await fetch(filePath, { credentials: "same-origin" });
    if (!response.ok || /text\/html/i.test(response.headers.get("content-type") || "")) {
      // React puede devolver index.html cuando no existe el archivo solicitado.
      throw new Error("No encontramos el documento anterior. Solicita su actualización a Administración.");
    }
    return saveBlob(await response.blob(), safeDownloadName(material.title, material.format));
  }

  // Enlaces HTTPS antiguos: el sitio de origen determina si permite la descarga.
  if (typeof filePath === "string" && /^https:\/\//i.test(filePath)) {
    const external = new URL(filePath);
    if (external.protocol !== "https:") throw new Error("El enlace del archivo no es válido");
    // Un archivo externo se abre de forma segura, pero su proveedor decide
    // si permite descargarlo; no podemos forzar esa política desde React.
    const anchor = document.createElement("a");
    anchor.href = external.href;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    return;
  }
  throw new Error("Este recurso todavía no tiene un documento adjunto.");
}

// La clave permanece estable aunque el administrador edite el título.
export function resourceEntryKey(entry) {
  return String(entry.id ?? entry.slug ?? "");
}

// La base de datos guarda descripciones cortas, no dos copias del resumen.
// Convertimos el contenido compacto en los campos que ya leen las vistas de miembros.
function normalizeDownload(entry, original = null) {
  const description = Array.isArray(entry.description)
    ? entry.description.filter((part) => typeof part === "string").join(" ")
    : String(entry.description || "");
  const includedContent = Array.isArray(entry.includedContent)
    ? entry.includedContent : String(entry.includedContent || "")
      .split("\n").map((item) => item.trim()).filter(Boolean);
  const format = String(entry.format || original?.format || "").toLowerCase();
  const stored = Boolean(entry.driveStored);
  return {
    ...entry,
    description: [description].filter(Boolean),
    includedContent,
    summary: description.slice(0, 120),
    format: format ? format.toUpperCase() : "PDF",
    available: stored || Boolean(entry.available),
    driveStored: stored,
    ...(stored ? { fileSize: undefined, pages: undefined } : {}),
  };
}

// Las páginas conservan los originales React y aplican solo publicaciones.
export function mergePublishedResources(originalItems, records = [], section = "") {
  const overrides = new Map(records.map((record) => [record.key, record]));
  const existingKeys = new Set(originalItems.map(resourceEntryKey));
  const builtins = originalItems.flatMap((entry) => {
    const record = overrides.get(resourceEntryKey(entry));
    if (record?.hidden) return [];
    const merged = record?.content ? { ...entry, ...record.content } : entry;
    if (section === "downloads") {
      // Sin modificación publicada, dejamos el contenido inicial intacto.
      return [record?.content ? normalizeDownload(merged, entry) : entry];
    }
    return [Array.isArray(merged.content) && typeof merged.lessons === "number" ?
      { ...merged, lessons: merged.content.length } : merged];
  });
  const created = records.filter((record) => record.isCustom &&
    !record.hidden && record.content && !existingKeys.has(record.key))
    .map((record) => {
      const content = { id: record.key, slug: record.key, ...record.content };
      if (section === "downloads") return normalizeDownload(content);
      return Array.isArray(content.content) && typeof content.lessons === "number" ?
        { ...content, lessons: content.content.length } : content;
    });
  return [...builtins, ...created];
}

// Hook único para listados y páginas de detalle de member.
// Ante un fallo de red conservamos los contenidos originales,
// pero exponemos un aviso para no confundirlos con datos sincronizados.
export function useResourceCatalog(section, originals, defaultHeading = {}) {
  const [remote, setRemote] = useState({ page: null, entries: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    getPublishedResourceContent(section)
      .then((data) => {
        if (alive) setRemote({ page: data.page || null, entries: data.entries || [] });
      })
      .catch(() => {
        if (alive) setError("No pudimos consultar las últimas actualizaciones. Mostramos el material disponible.");
      })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [section]);

  const items = useMemo(() => mergePublishedResources(originals, remote.entries, section),
    [originals, remote.entries, section]);
  const heading = useMemo(() => ({ ...defaultHeading, ...(remote.page || {}) }),
    [defaultHeading, remote.page]);
  return { items, heading, loading, error };
}
