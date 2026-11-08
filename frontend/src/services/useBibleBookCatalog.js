// =========================================================
// FICHAS BÍBLICAS: CONTENIDO INICIAL + CAMBIOS PUBLICADOS
// =========================================================
// Los 66 libros siguen siendo parte de React. El administrador solo
// publica textos auxiliares; no puede cambiar su orden ni sus capítulos.
import { useMemo } from "react";
import originalOld from "../data/bible/oldTestamentBooks";
import originalNew from "../data/bible/newTestamentBooks";
import { useResourceCatalog } from "./resourcesContentApi";

const ORIGINAL_BOOKS = [...originalOld, ...originalNew];
// El prefijo book- separa los 66 libros de las seis herramientas del catálogo.
const EDITABLE_BOOKS = ORIGINAL_BOOKS.map((book) => ({ ...book, id: `book-${book.slug}` }));

export function useBibleBookCatalog() {
  const { items, loading, error } = useResourceCatalog("bible", EDITABLE_BOOKS);
  const books = useMemo(() => {
    const published = new Map(items.map((item) => [item.slug, item]));
    // La identidad del libro siempre procede de los datos canónicos de React.
    return ORIGINAL_BOOKS.map((book) => {
      const edit = published.get(book.slug);
      if (!edit) return book;
      return {
        ...book,
        theme: edit.theme ?? book.theme,
        description: edit.description ?? book.description,
        keyCharacters: edit.keyCharacters ?? book.keyCharacters,
        keyEvents: edit.keyEvents ?? book.keyEvents,
        keyThemes: edit.keyThemes ?? book.keyThemes,
        featuredVerse: edit.featuredVerse ?? book.featuredVerse,
        suggestedStart: edit.suggestedStart ?? book.suggestedStart,
      };
    });
  }, [items]);
  return {
    oldTestamentBooks: books.slice(0, originalOld.length),
    newTestamentBooks: books.slice(originalOld.length),
    allBibleBooks: books, loading, error,
  };
}
