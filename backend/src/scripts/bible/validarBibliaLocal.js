// =========================================================
// AUDITORÍA LOCAL DE LOS 66 LIBROS Y SUS 1.189 CAPÍTULOS
// =========================================================

// Reutilizamos el mismo servicio que utiliza el lector de miembros.
import { getBibleIndex, getBibleChapter } from "../../services/bible/bibleLocalService.js";

// Contabilizamos el contenido del índice sin acudir a MongoDB ni Drive.
const index = await getBibleIndex();
const books = index.libros;
const expectedChapters = books.reduce((total, book) => total + book.capitulos, 0);

// Contamos los capítulos reales y acumulamos observaciones del contenido.
let chaptersReviewed = 0;
const failures = [];

// Recorremos cada libro usando exactamente su identificador canónico.
for (const book of books) {
  // Recorremos todos los capítulos definidos para este libro.
  for (let chapter = 1; chapter <= book.capitulos; chapter += 1) {
    try {
      // La consulta debe devolver texto y metadatos compatibles con la API.
      const reading = await getBibleChapter(book.id, chapter);
      if (!reading.texto?.trim() || reading.capitulo !== chapter) {
        throw new Error("Capítulo vacío o con identificador incorrecto");
      }
      chaptersReviewed += 1;
    } catch (error) {
      failures.push(`${book.id} ${chapter}: ${error.message}`);
    }
  }
}

// Mostramos un resumen pequeño sin imprimir contenido bíblico completo.
console.log("\n========== VALIDACIÓN DE BIBLIA LOCAL ==========");
console.log(`Versión: ${index.nombre}`);
console.log(`Libros: ${books.length}`);
console.log(`Capítulos esperados: ${expectedChapters}`);
console.log(`Capítulos con texto: ${chaptersReviewed}`);
console.log(`Incidencias: ${failures.length}`);

// Indicamos al sistema operativo si la instalación está incompleta.
if (books.length !== 66 || expectedChapters !== 1189 || failures.length > 0) {
  failures.slice(0, 15).forEach((problem) => console.error(`- ${problem}`));
  process.exitCode = 1;
} else {
  console.log("Verificación correcta. La API local puede consultar todo el catálogo.");
}
