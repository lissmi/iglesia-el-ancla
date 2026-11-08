// =========================================================
// EL ANCLA - VERIFICACIÓN DE LA BIBLIA POR VERSÍCULOS
// =========================================================
// Solo lee archivos locales. No accede a MongoDB ni a Internet.
// Ejecutar desde backend/: node src/scripts/bible/validarVersiculos.js

// Utilizamos la API de archivos y la ruta portable de Node.js.
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

// La carpeta coincide con los JSON del proyecto original.
const bibleDir = fileURLToPath(new URL("../../data/bible/rvr1960/", import.meta.url));

// Leemos un JSON sin instalar librerías externas.
const readJson = async (file) => JSON.parse(await readFile(file, "utf8"));

// Comprobamos la integridad de cada libro y cada número de versículo.
async function validate() {
  const index = await readJson(path.join(bibleDir, "index.json"));
  const manifest = await readJson(path.join(bibleDir, "verses", "manifest.json"));
  let books = 0;
  let chapters = 0;
  let verses = 0;
  let sampleJuan316 = null;

  // Nuestro catálogo original es la fuente de identidad de los libros.
  for (const metadata of index.libros) {
    const file = path.join(bibleDir, "verses", "books", `${metadata.id}.json`);
    const data = await readJson(file);
    if (data.libro !== metadata.id || data.version !== "rvr1960") {
      throw new Error(`Archivo inconsistente: ${metadata.id}`);
    }

    // Cada libro debe contener todos sus capítulos canónicos.
    for (let ch = 1; ch <= metadata.capitulos; ch += 1) {
      const list = data.capitulos[String(ch)];
      if (!Array.isArray(list) || list.length < 1) {
        throw new Error(`Faltan versículos en ${metadata.id} ${ch}`);
      }

      // El número de versículo debe avanzar sin saltos ni duplicados.
      for (let index = 0; index < list.length; index += 1) {
        const item = list[index];
        if (item.numero !== index + 1 || typeof item.texto !== "string" || !item.texto.trim()) {
          throw new Error(`Versículo inválido en ${metadata.id} ${ch}:${index + 1}`);
        }
      }

      // Guardamos el caso conocido Juan 3:16 para comprobar su referencia.
      if (metadata.id === "juan" && ch === 3) sampleJuan316 = list[15]?.texto ?? null;
      chapters += 1;
      verses += list.length;
    }
    books += 1;
  }

  // La edición RVR1960 conserva 3 Juan 1:15.
  // Algunos recuentos de otras tradiciones terminan ese libro en 1:14.
  const thirdJohn = await readJson(path.join(bibleDir, "verses", "books", "3-juan.json"));
  const thirdJohnVerses = thirdJohn.capitulos?.["1"];
  if (!Array.isArray(thirdJohnVerses) || thirdJohnVerses.length !== 15 ||
      !thirdJohnVerses[14]?.texto?.toLowerCase().includes("la paz sea contigo")) {
    throw new Error("Falta o no coincide 3 Juan 1:15 (RVR1960).");
  }

  // Una Biblia de 66 libros contiene estas cantidades en este canon.
  if (books !== 66 || chapters !== 1189 || verses !== 31103) {
    throw new Error(`Cantidades incorrectas: ${books} libros, ${chapters} capítulos, ${verses} versículos.`);
  }

  // Comparar con el manifiesto impide publicar un conjunto parcialmente actualizado.
  if (manifest.libros !== books || manifest.capitulos !== chapters || manifest.versiculos !== verses) {
    throw new Error("El manifiesto no coincide con los archivos de versículos.");
  }

  // Esta prueba detecta desplazamientos de numeración en un pasaje muy consultado.
  if (!sampleJuan316 || !sampleJuan316.toLowerCase().includes("de tal manera")) {
    throw new Error("Juan 3:16 no coincide con el pasaje esperado.");
  }

  console.log("✅ Biblia local por versículos verificada correctamente.");
  console.log(`Libros: ${books} | Capítulos: ${chapters} | Versículos: ${verses}`);
  console.log("Referencia comprobada: Juan 3:16");
}

// Si falta un JSON, el proceso terminará con un error verificable.
validate().catch((error) => {
  console.error("❌ Error de validación:", error.message);
  process.exitCode = 1;
});
