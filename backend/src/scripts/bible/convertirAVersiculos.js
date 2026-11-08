// =========================================================
// EL ANCLA - IMPORTACIÓN ÚNICA DE VERSÍCULOS RVR1960
// =========================================================
// Objetivo: añadir una capa local de versículos sin modificar
// los 66 JSON originales que ya contienen capítulos completos.
//
// La fuente de segmentación es un conjunto de JSON ya versificados.
// Se consulta ÚNICAMENTE durante esta importación, nunca al leer.
// Origen de referencia:
// https://github.com/xtiam57/church-utils/tree/main/dist/biblia
//
// Ejecutar desde backend/: node src/scripts/bible/convertirAVersiculos.js
// Alternativa sin descargar:
// node src/scripts/bible/convertirAVersiculos.js --carpeta=RUTA_ABSOLUTA

// Leemos y escribimos exclusivamente archivos locales.
import { readFile, writeFile, mkdir, rename, rm, access } from "node:fs/promises";

// Construimos rutas compatibles con Windows y Vercel.
import path from "node:path";
import { fileURLToPath } from "node:url";

// Esta ubicación coincide con los datos instalados en la versión anterior.
const BIBLE_DIR = fileURLToPath(new URL("../../data/bible/rvr1960/", import.meta.url));

// Este repositorio ofrece una matriz de capítulos y versículos por libro.
const SOURCE_URL = "https://raw.githubusercontent.com/xtiam57/church-utils/refs/heads/main/dist/biblia";

// Conservamos el texto original en /books y añadimos /verses/books.
const FINAL_DIR = path.join(BIBLE_DIR, "verses");

// Una importación incompleta no debe reemplazar los datos ya funcionales.
const TEMP_DIR = path.join(BIBLE_DIR, ".verses-importacion-temporal");

// Leemos el argumento opcional para trabajar con archivos descargados.
const folderArgument = process.argv.find((value) => value.startsWith("--carpeta="));
const LOCAL_SOURCE_DIR = folderArgument ? path.resolve(folderArgument.slice(10)) : null;

// Normalizamos diferencias de acentuación y puntuación para comparar textos.
function normalizeText(text) {
  return text.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

// Calculamos una similitud de pares de caracteres sin paquetes externos.
// Esta comparación no modifica el texto de ningún versículo.
function similarity(textA, textB) {
  const a = normalizeText(textA);
  const b = normalizeText(textB);
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return 0;

  // Contamos la frecuencia de cada par del texto original.
  const frequencies = new Map();
  for (let i = 0; i < a.length - 1; i += 1) {
    const pair = a.slice(i, i + 2);
    frequencies.set(pair, (frequencies.get(pair) || 0) + 1);
  }

  // Contamos coincidencias sin reutilizar pares ya consumidos.
  let matches = 0;
  for (let i = 0; i < b.length - 1; i += 1) {
    const pair = b.slice(i, i + 2);
    const remaining = frequencies.get(pair) || 0;
    if (remaining > 0) {
      matches += 1;
      frequencies.set(pair, remaining - 1);
    }
  }

  // El coeficiente de Dice toma valores entre 0 y 1.
  return (2 * matches) / (a.length + b.length - 2);
}

// Leemos JSON y mostramos la ruta relativa si no tiene estructura válida.
async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

// Obtenemos la matriz de versículos desde la carpeta local o la fuente HTTP.
async function loadSourceBook(slug) {
  // Los archivos de la fuente usan guion bajo en lugar de guion medio.
  const filename = `${slug.replaceAll("-", "_")}.json`;

  // Permite importar sin conexión cuando el material ya se descargó.
  if (LOCAL_SOURCE_DIR) {
    return readJson(path.join(LOCAL_SOURCE_DIR, filename));
  }

  // La descarga se realiza SOLO en esta tarea de preparación.
  const url = `${SOURCE_URL}/${encodeURIComponent(filename)}`;
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(20000),
  });

  // Nunca aceptamos HTML de error como si fuera texto bíblico.
  if (!response.ok) {
    throw new Error(`No se pudo obtener ${filename}: HTTP ${response.status}`);
  }

  return response.json();
}

// Generamos una capa de versículos sin inventar numeraciones ni texto.
async function createBookVerses(metadata) {
  // Abrimos los capítulos originales para comparar el contenido descargado.
  const original = await readJson(path.join(BIBLE_DIR, "books", `${metadata.id}.json`));
  const source = await loadSourceBook(metadata.id);

  // Una posición en el arreglo corresponde al capítulo correspondiente.
  if (!Array.isArray(source) || source.length !== metadata.capitulos) {
    throw new Error(`${metadata.id}: la cantidad de capítulos no coincide.`);
  }

  // Este objeto será utilizado después por bibleLocalService.js.
  const chapters = {};
  let verseCount = 0;
  const differences = [];

  // Recorremos los capítulos en el orden en que están escritos.
  for (let chapterNumber = 1; chapterNumber <= metadata.capitulos; chapterNumber += 1) {
    const sourceVerses = source[chapterNumber - 1];
    const originalChapter = original.capitulos?.[String(chapterNumber)];

    // Rechazamos capítulos faltantes o versículos que no sean texto.
    if (!Array.isArray(sourceVerses) || sourceVerses.length === 0 ||
        !sourceVerses.every((verse) => typeof verse === "string" && verse.trim()) ||
        typeof originalChapter !== "string" || !originalChapter.trim()) {
      throw new Error(`${metadata.id} ${chapterNumber}: capítulos o versículos incompletos.`);
    }

    // Contrasta el capítulo previo con la versión dividida en versículos.
    const joinedSource = sourceVerses.join(" ").replaceAll("/n", " ");
    const score = similarity(originalChapter, joinedSource);

    // Una diferencia importante se registra para revisión editorial.
    // La fuente mantiene su numeración explícita y no inventamos cortes de verso.
    // No modificamos los capítulos originales: siguen intactos como respaldo.
    if (score < 0.86) {
      differences.push({ capitulo: chapterNumber, similitud: Number(score.toFixed(4)) });
    }

    // El índice cero de la fuente equivale al versículo bíblico número uno.
    chapters[String(chapterNumber)] = sourceVerses.map((text, index) => ({
      numero: index + 1,
      texto: text.replaceAll("/n", "\n").replace(/_+/g, "").trim(),
    }));

    // Sumamos versículos estructuralmente válidos; las diferencias textuales
    // se documentan y requieren revisión editorial antes de publicar.
    verseCount += sourceVerses.length;
  }

  // La RVR1960 numera el cierre de 3 Juan como versículo 15.
  // Comprobamos expresamente esta diferencia respecto de recuentos con 14 versículos.
  if (metadata.id === "3-juan") {
    const endVerse = chapters["1"]?.[14]?.texto ?? "";
    if (chapters["1"]?.length !== 15 ||
        !normalizeText(endVerse).includes("lapazseacontigo")) {
      throw new Error("3 Juan 1:15 no coincide con la numeración RVR1960 esperada.");
    }
  }

  // Devolvemos el nuevo archivo y las observaciones para el reporte final.
  return {
    data: {
      version: "rvr1960",
      libro: metadata.id,
      nombre: metadata.nombre,
      capitulos: chapters,
    },
    chapterCount: Object.keys(chapters).length,
    verseCount,
    differences,
  };
}

// Ejecutamos la importación sin tocar modelos Mongoose ni variables .env.
async function main() {
  // Comprobamos que el catálogo original esté correctamente instalado.
  const index = await readJson(path.join(BIBLE_DIR, "index.json"));
  if (!Array.isArray(index.libros) || index.libros.length !== 66) {
    throw new Error("No encontramos el índice original de los 66 libros.");
  }

  // Limpiamos restos de una importación previa interrumpida.
  await rm(TEMP_DIR, { recursive: true, force: true });
  await mkdir(path.join(TEMP_DIR, "books"), { recursive: true });

  // Contadores de integridad para revisar antes de publicar los resultados.
  const summary = { libros: 66, capitulos: 0, versiculos: 0, diferencias: [], fuente: SOURCE_URL };

  try {
    // Consultamos los 66 libros y generamos cada JSON dentro de staging.
    for (const metadata of index.libros) {
      const result = await createBookVerses(metadata);
      const target = path.join(TEMP_DIR, "books", `${metadata.id}.json`);
      await writeFile(target, JSON.stringify(result.data, null, 2) + "\n", "utf8");
      summary.capitulos += result.chapterCount;
      summary.versiculos += result.verseCount;
      if (result.differences.length) {
        summary.diferencias.push({ libro: metadata.id, capitulos: result.differences });
      }
      console.log(`✓ ${metadata.nombre}: ${result.chapterCount}/${metadata.capitulos} capítulos`);
    }

    // RVR1960: 1189 capítulos y 31103 versículos; 3 Juan termina en 1:15.
    // Si hay discrepancias, no sustituimos la versión activa.
    if (summary.capitulos !== 1189 || summary.versiculos !== 31103) {
      throw new Error(
        `Importación incompleta: ${summary.capitulos}/1189 capítulos y ` +
        `${summary.versiculos}/31103 versículos. Revisa la fuente y las diferencias.`
      );
    }

    // Escribimos el manifiesto solo cuando TODOS los libros fueron comprobados.
    await writeFile(path.join(TEMP_DIR, "manifest.json"), JSON.stringify(summary, null, 2) + "\n", "utf8");

    // Si ya existían datos, hacemos una copia de recuperación temporal.
    const backup = path.join(BIBLE_DIR, ".verses-respaldo-temporal");
    await rm(backup, { recursive: true, force: true });
    let hadPrevious = false;
    try { await access(FINAL_DIR); hadPrevious = true; } catch { /* primera importación */ }
    if (hadPrevious) await rename(FINAL_DIR, backup);

    // Publicamos los archivos como un solo directorio tras la validación.
    try {
      await rename(TEMP_DIR, FINAL_DIR);
      await rm(backup, { recursive: true, force: true });
    } catch (error) {
      // Si falla el reemplazo, restituimos el directorio anterior.
      if (hadPrevious) await rename(backup, FINAL_DIR);
      throw error;
    }

    console.log(`\n✅ Datos locales listos: ${summary.libros} libros, ` +
      `${summary.capitulos} capítulos y ${summary.versiculos} versículos.`);
    console.log("El backend y la PWA ya pueden consultar versículos SIN Internet.");
    if (summary.diferencias.length > 0) {
      const flagged = summary.diferencias.reduce((sum, item) => sum + item.capitulos.length, 0);
      console.warn(`⚠️ ${flagged} capítulos difieren significativamente del PDF original.`);
      console.warn("Revisa verses/manifest.json antes de publicar la edición completa.");
    }
  } catch (error) {
    // Nunca dejamos archivos temporales a medio importar.
    await rm(TEMP_DIR, { recursive: true, force: true });
    throw error;
  }
}

// Mostramos errores concretos y comunicamos fallo al comando de terminal.
main().catch((error) => {
  console.error("❌ No se instaló la capa de versículos:", error.message);
  process.exitCode = 1;
});
