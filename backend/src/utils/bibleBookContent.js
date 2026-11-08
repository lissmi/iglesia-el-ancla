// =========================================================
// FICHAS INFORMATIVAS DE LOS 66 LIBROS BÍBLICOS
// =========================================================
// Lista canónica: valida qué libros existentes pueden editarse.
// No contiene los textos bíblicos ni introduce una API de terceros.
const BOOK_SLUGS = new Set([
  "genesis",
  "exodo",
  "levitico",
  "numeros",
  "deuteronomio",
  "josue",
  "jueces",
  "rut",
  "1-samuel",
  "2-samuel",
  "1-reyes",
  "2-reyes",
  "1-cronicas",
  "2-cronicas",
  "esdras",
  "nehemias",
  "ester",
  "job",
  "salmos",
  "proverbios",
  "eclesiastes",
  "cantares",
  "isaias",
  "jeremias",
  "lamentaciones",
  "ezequiel",
  "daniel",
  "oseas",
  "joel",
  "amos",
  "abdias",
  "jonas",
  "miqueas",
  "nahum",
  "habacuc",
  "sofonias",
  "hageo",
  "zacarias",
  "malaquias",
  "mateo",
  "marcos",
  "lucas",
  "juan",
  "hechos",
  "romanos",
  "1-corintios",
  "2-corintios",
  "galatas",
  "efesios",
  "filipenses",
  "colosenses",
  "1-tesalonicenses",
  "2-tesalonicenses",
  "1-timoteo",
  "2-timoteo",
  "tito",
  "filemon",
  "hebreos",
  "santiago",
  "1-pedro",
  "2-pedro",
  "1-juan",
  "2-juan",
  "3-juan",
  "judas",
  "apocalipsis"
]);

// Los límites permiten conservar sin recortes los 66 textos originales.
export const BIBLE_BOOK_LIMITS = Object.freeze({
  theme: 150, description: 600, keyCharacters: 80,
  keyEvents: 150, keyThemes: 60, reference: 80,
  verseText: 400, suggestedStart: 80,
});

export function isBibleBookKey(key) {
  return typeof key === "string" && key.startsWith("book-");
}

export function validateBibleBookContent(key, input) {
  if (!isBibleBookKey(key) || !BOOK_SLUGS.has(key.slice(5))) {
    throw Object.assign(new Error("No encontramos el libro bíblico seleccionado."), { status: 400 });
  }
  const error = (message) => { throw Object.assign(new Error(message), { status: 400 }); };
  if (!input || Array.isArray(input) || typeof input !== "object") error("Revisa los datos de la ficha.");
  const fields = ["theme", "description", "keyCharacters", "keyEvents", "keyThemes", "featuredVerse", "suggestedStart"];
  if (Object.keys(input).some((field) => !fields.includes(field)) ||
      fields.some((field) => !Object.prototype.hasOwnProperty.call(input, field))) {
    error("Esta ficha solo permite modificar información de apoyo del libro bíblico.");
  }
  const checkText = (value, maximum, field, required = false) => {
    if (typeof value !== "string" || value.length > maximum || (required && !value.trim())) {
      error(`Revisa ${field}: máximo ${maximum} caracteres.`);
    }
    return value.trim();
  };
  const checkList = (items, field, maximumItems, maximumLength) => {
    if (!Array.isArray(items) || items.length > maximumItems ||
        items.some((item) => typeof item !== "string" || !item.trim() || item.length > maximumLength)) {
      error(`Revisa ${field}: admite hasta ${maximumItems} elementos de ${maximumLength} caracteres.`);
    }
    return items.map((item) => item.trim());
  };
  if (!Array.isArray(input.description) || input.description.length === 0) {
    error("Agrega al menos un párrafo de descripción.");
  }
  if (!input.featuredVerse || Array.isArray(input.featuredVerse) ||
      typeof input.featuredVerse !== "object" ||
      Object.keys(input.featuredVerse).some((field) => !["reference", "text"].includes(field))) {
    error("Revisa el versículo destacado.");
  }
  const verseReference = checkText(input.featuredVerse.reference, BIBLE_BOOK_LIMITS.reference, "la referencia bíblica");
  const verseText = checkText(input.featuredVerse.text, BIBLE_BOOK_LIMITS.verseText, "el versículo");
  if (Boolean(verseReference) !== Boolean(verseText)) {
    error("Completa la referencia y el texto del versículo, o deja ambos vacíos.");
  }
  return {
    theme: checkText(input.theme, BIBLE_BOOK_LIMITS.theme, "el tema principal", true),
    description: checkList(input.description, "la descripción", 8, BIBLE_BOOK_LIMITS.description),
    keyCharacters: checkList(input.keyCharacters, "los personajes", 20, BIBLE_BOOK_LIMITS.keyCharacters),
    keyEvents: checkList(input.keyEvents, "los acontecimientos", 25, BIBLE_BOOK_LIMITS.keyEvents),
    keyThemes: checkList(input.keyThemes, "las enseñanzas", 20, BIBLE_BOOK_LIMITS.keyThemes),
    featuredVerse: {
      reference: verseReference,
      text: verseText,
    },
    suggestedStart: checkText(input.suggestedStart, BIBLE_BOOK_LIMITS.suggestedStart, "la lectura sugerida"),
  };
}
