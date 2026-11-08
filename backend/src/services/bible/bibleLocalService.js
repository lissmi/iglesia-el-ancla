// =========================================================
// BIBLIA LOCAL — LECTURA SEGURA DE ARCHIVOS JSON (ES MODULES)
// =========================================================

// Leemos archivos con las utilidades nativas de Node.js.
import { readFile, access } from "node:fs/promises";

// Convertimos las URL de módulos a rutas de sistema compatibles con Windows y Linux.
import { fileURLToPath } from "node:url";

// Construimos las rutas de nuestros archivos sin depender del directorio de ejecución.
import path from "node:path";

// Identificamos la carpeta creada en la etapa Data ver1.
const BIBLE_DIR = fileURLToPath(new URL("../../data/bible/rvr1960/", import.meta.url));

// Evitamos leer repetidamente el índice, que contiene solo metadatos de 66 libros.
let cachedIndex = null;

// Conservamos únicamente los últimos libros consultados para reducir lecturas de disco.
const bookCache = new Map();
const MAX_CACHED_BOOKS = 8;

// El directorio de versículos se genera con un importador de una sola ejecución.
// Si todavía no está disponible, conservamos el lector por capítulos.
const verseCache = new Map();
const VERSE_DIR = path.join(BIBLE_DIR, "verses", "books");
const VERSE_MANIFEST = path.join(BIBLE_DIR, "verses", "manifest.json");

// Construimos errores con estado HTTP; Express los traducirá a respuestas amigables.
function bibleError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

// Retornamos el catálogo completo en el orden original de la Biblia.
export async function getBibleIndex() {
  // Reutilizamos el índice si ya está validado y cargado en memoria.
  if (cachedIndex) return cachedIndex;

  // Leemos el archivo ubicado junto a los 66 JSON de libros.
  const raw = await readFile(path.join(BIBLE_DIR, "index.json"), "utf8");

  // Convertimos el contenido a objeto JavaScript.
  const index = JSON.parse(raw);

  // Detectamos una instalación incompleta antes de responder a la aplicación.
  if (!Array.isArray(index.libros) || index.libros.length !== 66) {
    throw bibleError("El catálogo bíblico todavía no está disponible.", 503);
  }

  // Guardamos el índice para las próximas consultas.
  cachedIndex = index;
  return cachedIndex;
}

// Entregamos los metadatos de la traducción, sin consultar servicios externos.
export async function getBibleVersion() {
  const index = await getBibleIndex();
  return {
    id: index.version,
    name: index.nombre,
    abbreviation: "RVR1960",
    language: index.idioma,
    format: index.formato,
    supportsVerses: await hasBibleVerses(),
  };
}

// Solo anunciamos soporte de versículos si la importación quedó finalizada.
async function hasBibleVerses() {
  try {
    await access(VERSE_MANIFEST);
    return true;
  } catch {
    return false;
  }
}

// Los JSON de versículos se consultan por identificadores del índice validado.
async function loadVerses(book) {
  // No realizamos lecturas si aún no se completó la importación.
  if (!await hasBibleVerses()) return null;

  // Reutilizamos en memoria únicamente los últimos libros solicitados.
  if (verseCache.has(book.id)) return verseCache.get(book.id);

  // La ruta procede del catálogo local, no de un valor arbitrario del usuario.
  const filename = path.join(VERSE_DIR, `${book.id}.json`);
  let data;
  try {
    data = JSON.parse(await readFile(filename, "utf8"));
  } catch (error) {
    // Un archivo faltante o corrupto es un error de instalación, no un verso vacío.
    throw bibleError("No pudimos cargar los versículos de este libro.", 503);
  }

  // Confirmamos que el archivo contiene el libro que se solicitó.
  if (data.libro !== book.id || !data.capitulos || typeof data.capitulos !== "object") {
    throw bibleError("El archivo de versículos no coincide con el catálogo.", 503);
  }

  // Limitamos la memoria igual que en el servicio de lectura anterior.
  if (verseCache.size >= MAX_CACHED_BOOKS) {
    verseCache.delete(verseCache.keys().next().value);
  }
  verseCache.set(book.id, data);
  return data;
}

// Cargamos un libro después de haber confirmado su presencia en el índice.
async function loadBook(book) {
  // Evitamos releer JSON ya consultados durante esta sesión del servidor.
  if (bookCache.has(book.id)) return bookCache.get(book.id);

  // Solo usamos un identificador proveniente del índice validado.
  const filePath = path.join(BIBLE_DIR, "books", `${book.id}.json`);

  // Leemos y convertimos exclusivamente el libro seleccionado.
  const data = JSON.parse(await readFile(filePath, "utf8"));

  // Comprobamos que el archivo corresponda al libro solicitado.
  if (data.libro !== book.id || !data.capitulos) {
    throw bibleError("El contenido de este libro no está disponible.", 503);
  }

  // Limitamos el caché a ocho libros para mantener bajo el consumo de memoria.
  if (bookCache.size >= MAX_CACHED_BOOKS) {
    const oldest = bookCache.keys().next().value;
    bookCache.delete(oldest);
  }
  bookCache.set(book.id, data);
  return data;
}

// Consultamos un único capítulo mediante el identificador del libro y su número.
export async function getBibleChapter(bookId, chapterNumber) {
  // Un capítulo debe ser entero; no aceptamos decimales ni valores negativos.
  const chapter = Number(chapterNumber);
  if (!Number.isSafeInteger(chapter) || chapter < 1) {
    throw bibleError("Selecciona un número de capítulo válido.");
  }

  // Obtenemos los 66 identificadores permitidos desde el índice.
  const index = await getBibleIndex();

  // Solo admitimos ID canónicos y evitamos usar rutas indicadas por el navegador.
  const book = index.libros.find((item) => item.id === bookId);
  if (!book) {
    throw bibleError("No encontramos ese libro de la Biblia.", 404);
  }

  // Los capítulos deben respetar la cantidad definida en el índice.
  if (chapter > book.capitulos) {
    throw bibleError("El capítulo seleccionado no existe.", 404);
  }

  // Recuperamos el JSON del libro y el texto de su capítulo.
  const bookData = await loadBook(book);
  const texto = bookData.capitulos[String(chapter)];

  // Un capítulo vacío indica un problema de datos, no una lectura válida.
  if (typeof texto !== "string" || !texto.trim()) {
    throw bibleError("El contenido de este capítulo no está disponible.", 503);
  }

  // Buscamos la segmentación del capítulo; el texto original nunca se elimina.
  const verseBook = await loadVerses(book);
  const versiculos = verseBook?.capitulos?.[String(chapter)] ?? null;

  // Rechazamos datos inconsistentes antes de mostrar un número equivocado.
  if (versiculos && (!Array.isArray(versiculos) ||
      !versiculos.every((item, index) => item.numero === index + 1 &&
        typeof item.texto === "string" && item.texto.trim()))) {
    throw bibleError("La numeración de este capítulo no es válida.", 503);
  }

  // Entregamos un resultado pequeño, sin exponer rutas internas ni cargar otros libros.
  return {
    version: index.version,
    nombreVersion: index.nombre,
    libro: book.id,
    nombreLibro: book.nombre,
    capitulo: chapter,
    totalCapitulos: book.capitulos,
    texto,
    // null mantiene la compatibilidad con la etapa anterior (sin versículos).
    versiculos,
    totalVersiculos: versiculos?.length ?? null,
  };
}

// La búsqueda exacta usa los mismos datos que el lector visual.
export async function getBibleVerse(bookId, chapterNumber, verseNumber) {
  // Reutilizamos las validaciones de libro, capítulo y sesión del módulo.
  const chapter = await getBibleChapter(bookId, chapterNumber);

  // El versículo solicitado debe ser un entero positivo.
  const number = Number(verseNumber);
  if (!Number.isSafeInteger(number) || number < 1) {
    throw bibleError("Selecciona un número de versículo válido.");
  }

  // Si todavía no importamos versículos, evitamos ofrecer un texto inventado.
  if (!chapter.versiculos) {
    throw bibleError("Los versículos de este capítulo aún no están disponibles.", 503);
  }

  // El número se busca directamente: el arreglo comienza en el versículo uno.
  const chosen = chapter.versiculos[number - 1];
  if (!chosen || chosen.numero !== number) {
    throw bibleError("Ese versículo no existe en el capítulo indicado.", 404);
  }

  // Devolvemos un registro acotado, útil para futuros enlaces de Martín.
  return {
    version: chapter.version,
    libro: chapter.libro,
    nombreLibro: chapter.nombreLibro,
    capitulo: chapter.capitulo,
    versiculo: number,
    referencia: `${chapter.nombreLibro} ${chapter.capitulo}:${number}`,
    texto: chosen.texto,
  };
}
