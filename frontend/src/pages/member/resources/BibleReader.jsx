// =========================================================
// LECTOR BÍBLICO - REINA-VALERA 1960
// =========================================================
// El diseño es independiente de la edición de fichas informativas.
// Cada capítulo se solicita a nuestra API Express, que lee archivos JSON.
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Header from "../../../components/public/Header";
import { useBibleBookCatalog } from "../../../services/useBibleBookCatalog";
import { fetchBibleChapter } from "../../../services/bibleReaderApi";
import "../../../styles/pages/member/resources/BibleReader.css";

// Configuramos un rango accesible, con pasos de dos píxeles.
const MIN_FONT_SIZE = 16;
const MAX_FONT_SIZE = 28;
const DEFAULT_FONT_SIZE = 18;
const FONT_STEP = 2;

// Esta clave conserva la preferencia de lectura en el navegador del miembro.
const FONT_PREFERENCE_KEY = "el-ancla-bible-reader-font-size";

// Recuperamos la preferencia anterior sin interrumpir la página si el navegador
// bloquea el almacenamiento local (por ejemplo, modo privado restringido).
function readPreferredFontSize() {
  try {
    if (typeof window === "undefined") return DEFAULT_FONT_SIZE;

    const saved = Number(window.localStorage.getItem(FONT_PREFERENCE_KEY));

    // Solo aceptamos los tamaños previstos para evitar valores corruptos.
    if (
      Number.isInteger(saved) &&
      saved >= MIN_FONT_SIZE &&
      saved <= MAX_FONT_SIZE &&
      (saved - MIN_FONT_SIZE) % FONT_STEP === 0
    ) {
      return saved;
    }
  } catch {
    // El lector sigue funcionando aunque localStorage no esté disponible.
  }

  return DEFAULT_FONT_SIZE;
}

// Texto corto, comprensible y sin detalles técnicos para el usuario final.
function displayError(error) {
  const message = error?.response?.data?.message;
  return typeof message === "string" && message.length < 250
    ? message
    : "No pudimos abrir este capítulo. Intenta nuevamente en unos momentos.";
}

// Normalizamos las referencias escritas por un miembro, por ejemplo: "Génesis" y "Genesis".
function normalizeBookName(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

// Separamos una referencia del tipo "Juan 3:16" o "1 Corintios 13:4".
// No adivinamos números de versículo: la API verificará que existan.
function parseBibleReference(text, allBibleBooks) {
  const match = text.trim().match(/^(.+?)\s+(\d{1,3})(?:\s*[:.,]\s*(\d{1,3}))?$/u);
  if (!match) return null;

  const [, typedBook, typedChapter, typedVerse] = match;
  const bookName = normalizeBookName(typedBook);
  const desiredChapter = Number(typedChapter);
  const desiredVerse = typedVerse ? Number(typedVerse) : null;

  // "Salmo" y "Salmos" son referencias equivalentes para el buscador.
  const aliases = bookName === "salmo" ? ["salmo", "salmos"] : [bookName];

  // Reutilizamos los nombres y los slugs canónicos de nuestro catálogo React.
  const book = allBibleBooks.find((item) => {
    const candidates = [normalizeBookName(item.name), normalizeBookName(item.slug)];
    return aliases.some((alias) => candidates.includes(alias));
  });

  if (!book || !Number.isSafeInteger(desiredChapter) || desiredChapter < 1 ||
      desiredChapter > book.chapters ||
      (desiredVerse !== null && (!Number.isSafeInteger(desiredVerse) || desiredVerse < 1))) {
    return null;
  }

  return { slug: book.slug, chapter: desiredChapter, verse: desiredVerse };
}

function BibleReader() {
  // React Router entrega el libro y capítulo elegidos por el miembro.
  const { slug, chapter: chapterParam } = useParams();
  const navigate = useNavigate();

  // Conservamos el versículo elegido dentro de la URL para poder compartirlo.
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedVerseParam = searchParams.get("versiculo");
  const selectedVerse = /^[1-9]\d{0,2}$/.test(selectedVerseParam || "")
    ? Number(selectedVerseParam)
    : null;

  // La búsqueda rápida acepta referencias completas, como "Juan 3:16".
  const [quickReference, setQuickReference] = useState("");
  const [lookupError, setLookupError] = useState("");

  // Reutilizamos los 66 libros actuales, incluido el orden y número de capítulos.
  const { allBibleBooks } = useBibleBookCatalog();
  const book = useMemo(
    () => allBibleBooks.find((item) => item.slug === slug),
    [allBibleBooks, slug]
  );

  // Convertimos el parámetro de ruta a capítulo entero y válido.
  const chapter = /^\d+$/.test(chapterParam || "") ? Number(chapterParam) : NaN;
  const validSelection = Boolean(book && Number.isSafeInteger(chapter) && chapter >= 1 && chapter <= book.chapters);

  // Contenido de la lectura actual y sus estados de consulta.
  const [reading, setReading] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // El tamaño elegido afecta únicamente al texto del capítulo, no al resto de la PWA.
  const [fontSize, setFontSize] = useState(readPreferredFontSize);

  // Conservamos el tamaño al cambiar de capítulo o volver a abrir el lector.
  useEffect(() => {
    try {
      window.localStorage.setItem(FONT_PREFERENCE_KEY, String(fontSize));
    } catch {
      // La preferencia queda activa durante esta sesión aunque no pueda guardarse.
    }
  }, [fontSize]);

  // Recuperamos cada capítulo desde el backend, leyendo únicamente nuestros archivos JSON locales.
  useEffect(() => {
    let active = true;
    setReading(null);
    setError("");
    if (!validSelection) {
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    fetchBibleChapter(slug, chapter)
      .then((result) => {
        if (active) setReading(result);
      })
      .catch((requestError) => {
        if (active) setError(displayError(requestError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    // Impedimos que una solicitud antigua reemplace un capítulo nuevo.
    return () => { active = false; };
  }, [slug, chapter, validSelection]);

  // Si se indica un versículo válido, lo llevamos al centro de la lectura.
  useEffect(() => {
    if (loading || !reading?.versiculos || selectedVerse === null) return;
    const exists = reading.versiculos.some((item) => item.numero === selectedVerse);
    if (!exists) return;

    // Esperamos al siguiente fotograma para asegurar que React dibujó el elemento.
    const frameId = window.requestAnimationFrame(() => {
      document.getElementById(`bible-reader-versiculo-${selectedVerse}`)
        ?.scrollIntoView({ block: "center", behavior: "smooth" });
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [loading, reading, selectedVerse]);

  // Convertimos la búsqueda del usuario en una ruta de capítulo + versículo.
  const searchReference = (event) => {
    event.preventDefault();
    const found = parseBibleReference(quickReference, allBibleBooks);
    if (!found) {
      setLookupError("Escribe una referencia válida, por ejemplo Juan 3:16.");
      return;
    }

    // Dejamos que el backend compruebe el límite real de versículos del capítulo.
    const query = found.verse ? `?versiculo=${found.verse}` : "";
    setLookupError("");
    navigate(`/member/recursos/biblia/leer/${found.slug}/${found.chapter}${query}`);
  };

  // Al pulsar un número de versículo, actualizamos la URL sin recargar el capítulo.
  const chooseVerse = (number) => {
    setSearchParams({ versiculo: String(number) });
  };

  // Esta función construye rutas siempre dentro del espacio de miembros.
  const goTo = (newSlug, newChapter) => {
    // Mostramos el inicio del nuevo capítulo después de navegar.
    window.scrollTo({ top: 0, behavior: "auto" });
    navigate(`/member/recursos/biblia/leer/${newSlug}/${newChapter}`);
  };

  // Cuando la dirección es incorrecta, ofrecemos volver al catálogo.
  if (!validSelection) {
    return (
      <>
        <Header />
        <main className="bible-reader bible-reader--empty">
          <h1>No encontramos esta lectura</h1>
          <p>Selecciona un libro de la Biblia para comenzar.</p>
          <Link to="/member/recursos/biblia">Volver a Biblia y herramientas</Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="bible-reader">
        {/* Introducción con la misma identidad visual de los recursos. */}
        <section className="bible-reader__hero">
          <div className="bible-reader__shell">
            <nav className="bible-reader__breadcrumbs" aria-label="Ruta de navegación">
              <Link to="/member/recursos">Recursos</Link>
              <span aria-hidden="true">/</span>
              <Link to="/member/recursos/biblia">Biblia y herramientas</Link>
              <span aria-hidden="true">/</span>
              <Link to={`/member/recursos/biblia/libro/${book.slug}`}>{book.name}</Link>
            </nav>
            <p className="bible-reader__eyebrow">LECTURA BÍBLICA</p>
            <h1>{book.name} <span>{chapter}</span></h1>
            <p>Lee las Escrituras a tu ritmo, capítulo por capítulo.</p>
          </div>
        </section>

        <section className="bible-reader__body">
          <div className="bible-reader__shell">
            {/* Los controles solo consultan combinaciones admitidas por el catálogo. */}
            <div className="bible-reader__toolbar">
              <label>
                Libro
                <select
                  value={book.slug}
                  onChange={(event) => goTo(event.target.value, 1)}
                >
                  {allBibleBooks.map((item) => (
                    <option key={item.slug} value={item.slug}>{item.name}</option>
                  ))}
                </select>
              </label>
              <label>
                Capítulo
                <select
                  value={chapter}
                  onChange={(event) => goTo(book.slug, Number(event.target.value))}
                >
                  {Array.from({ length: book.chapters }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </label>
              <label>
                Versículo
                <select
                  value={selectedVerse ?? ""}
                  onChange={(event) => {
                    const number = Number(event.target.value);
                    if (number > 0) chooseVerse(number);
                    else setSearchParams({});
                  }}
                  disabled={!reading?.versiculos?.length || loading}
                  aria-label="Ir a un versículo del capítulo"
                >
                  <option value="">Todos</option>
                  {(reading?.versiculos || []).map((item) => (
                    <option key={item.numero} value={item.numero}>{item.numero}</option>
                  ))}
                </select>
              </label>
              <div className="bible-reader__version">
                <small>Versión de la Biblia</small>
                <strong>{reading?.nombreVersion || "Reina-Valera 1960"}</strong>
              </div>

              {/* Controles accesibles para ajustar el tamaño de lectura. */}
              <div
                className="bible-reader__font-controls"
                role="group"
                aria-label="Ajustar tamaño de letra de la Biblia"
              >
                <span className="bible-reader__font-label">Tamaño de letra</span>
                <div className="bible-reader__font-buttons">
                  <button
                    type="button"
                    className="bible-reader__font-button"
                    onClick={() => setFontSize((current) => Math.max(MIN_FONT_SIZE, current - FONT_STEP))}
                    disabled={fontSize === MIN_FONT_SIZE}
                    aria-label="Achicar letra"
                    title="Achicar letra"
                  >
                    A−
                  </button>
                  <output
                    className="bible-reader__font-current"
                    aria-live="polite"
                    aria-label={`Tamaño actual: ${fontSize} píxeles`}
                  >
                    {fontSize} px
                  </output>
                  <button
                    type="button"
                    className="bible-reader__font-button"
                    onClick={() => setFontSize((current) => Math.min(MAX_FONT_SIZE, current + FONT_STEP))}
                    disabled={fontSize === MAX_FONT_SIZE}
                    aria-label="Agrandar letra"
                    title="Agrandar letra"
                  >
                    A+
                  </button>
                </div>
              </div>
            </div>

            {/* Buscador de referencias: no requiere una nueva ruta en App.js. */}
            <form className="bible-reader__quick-search" onSubmit={searchReference}>
              <div className="bible-reader__quick-search-copy">
                <label htmlFor="bible-reader-reference">Buscar un versículo</label>
                <small>Ejemplos: Juan 3:16 · Salmos 23:1 · 1 Corintios 13:4</small>
              </div>
              <div className="bible-reader__quick-search-inputs">
                <input
                  id="bible-reader-reference"
                  type="search"
                  value={quickReference}
                  placeholder="Ej. Juan 3:16"
                  onChange={(event) => {
                    setQuickReference(event.target.value);
                    if (lookupError) setLookupError("");
                  }}
                  autoComplete="off"
                  aria-invalid={Boolean(lookupError)}
                  aria-describedby={lookupError ? "bible-reader-reference-error" : undefined}
                />
                <button type="submit">Buscar</button>
              </div>
              {lookupError && (
                <p id="bible-reader-reference-error" className="bible-reader__lookup-error" role="alert">
                  {lookupError}
                </p>
              )}
            </form>

            <article className="bible-reader__reading" aria-busy={loading}>
              <div className="bible-reader__reading-heading">
                <p>CAPÍTULO {chapter}</p>
                <h2>{book.name} {chapter}</h2>
              </div>
              {loading && <p className="bible-reader__notice" role="status">Cargando lectura...</p>}
              {error && (
                <div className="bible-reader__notice bible-reader__notice--error" role="alert">
                  <p>{error}</p>
                  <Link to="/member/recursos/biblia">Volver al catálogo bíblico</Link>
                </div>
              )}
              {!loading && !error && reading && (
                <>
                  {/* Si se importaron los versículos, renderizamos su numeración real. */}
                  {reading.versiculos?.length ? (
                    <div
                      className="bible-reader__chapter-text bible-reader__verses"
                      style={{ fontSize: `${fontSize}px` }}
                    >
                      {reading.versiculos.map((item) => (
                        <p
                          key={item.numero}
                          id={`bible-reader-versiculo-${item.numero}`}
                          className={`bible-reader__verse${selectedVerse === item.numero ? " bible-reader__verse--selected" : ""}`}
                        >
                          {/* El número es un botón: permite elegir o enlazar una referencia. */}
                          <button
                            type="button"
                            className="bible-reader__verse-number"
                            onClick={() => chooseVerse(item.numero)}
                            aria-label={`Seleccionar ${book.name} ${chapter}:${item.numero}`}
                            aria-current={selectedVerse === item.numero ? "location" : undefined}
                            title={`${book.name} ${chapter}:${item.numero}`}
                          >
                            {item.numero}
                          </button>
                          {/* Mostramos el texto como dato, nunca como HTML ejecutable. */}
                          <span>{item.texto}</span>
                        </p>
                      ))}
                    </div>
                  ) : (
                    // Mantenemos intacta la lectura antigua si aún falta convertir ese libro.
                    <div
                      className="bible-reader__chapter-text"
                      style={{ fontSize: `${fontSize}px` }}
                    >
                      {reading.texto}
                    </div>
                  )}

                  {/* Una referencia fuera del capítulo no debe resaltar otro versículo. */}
                  {reading.versiculos?.length && selectedVerse !== null &&
                    !reading.versiculos.some((item) => item.numero === selectedVerse) && (
                      <p className="bible-reader__notice bible-reader__notice--error" role="alert">
                        El versículo {selectedVerse} no existe en {book.name} {chapter}.
                      </p>
                    )}

                  {/* Identificamos el origen local y el estado real de numeración. */}
                  <div className="bible-reader__credits">
                    <strong>Versión: {reading.nombreVersion}</strong>
                    <p>
                      {reading.versiculos?.length
                        ? `${reading.versiculos.length} versículos disponibles en este capítulo.`
                        : "Lectura por capítulos. Aún falta ejecutar la importación de versículos en el backend."}
                    </p>
                  </div>
                </>
              )}
            </article>

            {/* Navegación dentro del libro; no genera enlaces 404. */}
            <nav className="bible-reader__navigation" aria-label="Navegación por capítulos">
              <button type="button" disabled={chapter <= 1} onClick={() => goTo(book.slug, chapter - 1)}>
                ← Capítulo anterior
              </button>
              <Link to={`/member/recursos/biblia/libro/${book.slug}`}>Sobre {book.name}</Link>
              <button type="button" disabled={chapter >= book.chapters} onClick={() => goTo(book.slug, chapter + 1)}>
                Capítulo siguiente →
              </button>
            </nav>
          </div>
        </section>
      </main>
    </>
  );
}

export default BibleReader;
