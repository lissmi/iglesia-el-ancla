
// Importamos useMemo para calcular los resultados filtrados
// solamente cuando cambie la búsqueda, el filtro o los datos.
import { useMemo, useState } from "react";

// Importamos Link para navegar sin recargar la aplicación.
import { Link } from "react-router-dom";

// Importamos los componentes generales del sitio.
import Header from "../../../components/public/Header";


// Importamos los 27 libros del Nuevo Testamento.
import { useBibleBookCatalog } from "../../../services/useBibleBookCatalog";

import "../../../styles/pages/member/resources/BibleReaderUnavailable.css";

// Importamos el CSS exclusivo de esta página.
import "../../../styles/pages/member/resources/NewTestamentBooks.css";

// Creamos una función que normaliza los textos.
// Esto permite que una búsqueda como "mateo"
// también encuentre textos escritos con mayúsculas o tildes.
function normalizeText(text = "") {
    return text
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

// Creamos el componente principal.
function NewTestamentBooks() {
    // Recuperamos las fichas publicadas sin alterar el catálogo bíblico.
    const { newTestamentBooks } = useBibleBookCatalog();
    // Guardamos el texto escrito en la barra de búsqueda.
    const [searchTerm, setSearchTerm] = useState("");

    // Guardamos el grupo seleccionado.
    // Por defecto se muestran todos los libros.
    const [selectedGroup, setSelectedGroup] = useState("Todos");

    // Obtenemos automáticamente los grupos existentes
    // dentro del archivo newTestamentBooks.
    const bookGroups = useMemo(() => {
        // Extraemos el grupo de cada libro.
        const groups = newTestamentBooks.map((book) => book.group);

        // Utilizamos Set para eliminar los grupos repetidos.
        return ["Todos", ...new Set(groups)];
    }, [newTestamentBooks]);

    // Filtramos los libros según la búsqueda y el grupo.
    const filteredBooks = useMemo(() => {
        // Normalizamos el texto ingresado por el usuario.
        const normalizedSearch = normalizeText(searchTerm);

        return newTestamentBooks.filter((book) => {
            // Comprobamos si el libro pertenece al grupo seleccionado.
            const matchesGroup =
                selectedGroup === "Todos" ||
                book.group === selectedGroup;

            // Reunimos distintos datos del libro
            // para que todos puedan utilizarse en la búsqueda.
            const searchableContent = normalizeText(
                [
                    book.name,
                    book.theme,
                    book.group,
                    book.testament,
                ].join(" ")
            );

            // Comprobamos si el contenido incluye
            // el texto ingresado por el usuario.
            const matchesSearch =
                normalizedSearch === "" ||
                searchableContent.includes(normalizedSearch);

            // El libro se muestra solamente si cumple
            // tanto con el filtro como con la búsqueda.
            return matchesGroup && matchesSearch;
        });
    }, [searchTerm, selectedGroup, newTestamentBooks]);

    // Esta variable indica si existe algún filtro activo.
    const hasActiveFilters =
        searchTerm.trim() !== "" || selectedGroup !== "Todos";

    // Función para limpiar la búsqueda y los filtros.
    const handleClearFilters = () => {
        setSearchTerm("");
        setSelectedGroup("Todos");
    };

    return (
        <>
            {/* Encabezado general del sitio. */}
            <Header />

            {/* Contenido principal de la página. */}
            <main className="new-testament-page">
                {/* Hero de la página. */}
                <section className="new-testament-hero">
                    {/* Capa decorativa sobre el fondo. */}
                    <div className="new-testament-hero__overlay" />

                    {/* Contenido del hero. */}
                    <div className="new-testament-hero__container">
                        {/* Ruta de navegación. */}
                        <nav
                            className="new-testament-breadcrumb"
                            aria-label="Ruta de navegación"
                        >
                            <Link to="/">
                                Inicio
                            </Link>

                            <span aria-hidden="true">
                                /
                            </span>

                            <Link to="/member/recursos">
                                Recursos
                            </Link>

                            <span aria-hidden="true">
                                /
                            </span>

                            <Link to="/member/recursos/biblia">
                                Biblia y herramientas
                            </Link>

                            <span aria-hidden="true">
                                /
                            </span>

                            <span aria-current="page">
                                Nuevo Testamento
                            </span>
                        </nav>

                        {/* Texto pequeño superior. */}
                        <p className="new-testament-hero__eyebrow">
                            Explora las Escrituras
                        </p>

                        {/* Título principal. */}
                        <h1 className="new-testament-hero__title">
                            Libros del
                            <span>Nuevo Testamento</span>
                        </h1>

                        {/* Descripción principal. */}
                        <p className="new-testament-hero__description">
                            Descubre los 27 libros que presentan la vida y
                            enseñanza de Jesús, el nacimiento de la iglesia,
                            las cartas apostólicas y la esperanza futura.
                        </p>

                        {/* Dato rápido. */}
                        <div className="new-testament-hero__fact">
                            <strong>
                                {newTestamentBooks.length}
                            </strong>

                            <span>
                                libros para explorar
                            </span>
                        </div>
                    </div>

                    {/* Curva inferior decorativa. */}
                    <div className="new-testament-hero__curve" />
                </section>

                {/* Sección que contiene los libros. */}
                <section className="new-testament-books">
                    <div className="new-testament-books__container">
                        {/* Encabezado de la sección. */}
                        <header className="new-testament-books__header">
                            <div>
                                <p className="new-testament-section__eyebrow">
                                    Biblioteca bíblica
                                </p>

                                <h2 className="new-testament-section__title">
                                    Encuentra un libro
                                </h2>
                            </div>

                            <p className="new-testament-books__description">
                                Busca un libro por su nombre, tema o grupo,
                                o utiliza los filtros para explorar las
                                distintas secciones del Nuevo Testamento.
                            </p>
                        </header>

                        {/* Panel con buscador y filtros. */}
                        <div className="new-testament-controls">
                            {/* Barra de búsqueda. */}
                            <div className="new-testament-search">
                                <label
                                    className="new-testament-search__label"
                                    htmlFor="new-testament-search"
                                >
                                    Buscar un libro
                                </label>

                                <div className="new-testament-search__field">
                                    <span
                                        className="new-testament-search__icon"
                                        aria-hidden="true"
                                    >
                                        ⌕
                                    </span>

                                    <input
                                        id="new-testament-search"
                                        type="search"
                                        value={searchTerm}
                                        onChange={(event) =>
                                            setSearchTerm(event.target.value)
                                        }
                                        placeholder="Ejemplo: Mateo, evangelios o cartas"
                                    />

                                    {searchTerm && (
                                        <button
                                            className="new-testament-search__clear"
                                            type="button"
                                            onClick={() => setSearchTerm("")}
                                            aria-label="Borrar búsqueda"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Filtros por grupo. */}
                            <div className="new-testament-filters">
                                <p className="new-testament-filters__label">
                                    Filtrar por grupo
                                </p>

                                <div className="new-testament-filters__buttons">
                                    {bookGroups.map((group) => {
                                        const isActive =
                                            selectedGroup === group;

                                        return (
                                            <button
                                                className={
                                                    isActive
                                                        ? "new-testament-filter new-testament-filter--active"
                                                        : "new-testament-filter"
                                                }
                                                type="button"
                                                key={group}
                                                onClick={() =>
                                                    setSelectedGroup(group)
                                                }
                                                aria-pressed={isActive}
                                            >
                                                {group}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Resumen de los resultados. */}
                        <div className="new-testament-results">
                            <p
                                className="new-testament-results__counter"
                                aria-live="polite"
                            >
                                Mostrando{" "}
                                <strong>
                                    {filteredBooks.length}
                                </strong>{" "}
                                de {newTestamentBooks.length} libros
                            </p>

                            {hasActiveFilters && (
                                <button
                                    className="new-testament-results__clear"
                                    type="button"
                                    onClick={handleClearFilters}
                                >
                                    Limpiar búsqueda y filtros
                                </button>
                            )}
                        </div>

                        {/* Mostramos las tarjetas cuando hay resultados. */}
                        {filteredBooks.length > 0 ? (
                            <div className="new-testament-books__grid">
                                {filteredBooks.map((book) => (
                                    <article
                                        className="new-testament-book-card"
                                        key={book.id}
                                    >
                                        {/* Parte superior de la tarjeta. */}
                                        <div className="new-testament-book-card__top">
                                            <span className="new-testament-book-card__testament">
                                                {book.testament}
                                            </span>

                                            <span className="new-testament-book-card__chapters">
                                                {book.chapters} capítulos
                                            </span>
                                        </div>

                                        {/* Contenido de la tarjeta. */}
                                        <div className="new-testament-book-card__content">
                                            <p className="new-testament-book-card__group">
                                                {book.group}
                                            </p>

                                            <h3 className="new-testament-book-card__title">
                                                {book.name}
                                            </h3>

                                            <p className="new-testament-book-card__theme">
                                                {book.theme}
                                            </p>

                                            {/* Enlaces de la tarjeta. */}
                                            <div className="new-testament-book-card__actions">
                                                <Link
                                                    className="new-testament-book-card__details"
                                                    to={`/member/recursos/biblia/libro/${book.slug}`}
                                                >
                                                    Conocer el libro

                                                    <span aria-hidden="true">
                                                        →
                                                    </span>
                                                </Link>

                                                <Link
                                                    className="new-testament-book-card__reader"
                                                    to={`/member/recursos/biblia/leer/${book.slug}/1`}
                                                    aria-label={`Leer ${book.name} desde el capítulo 1`}
                                                >
                                                    Leer libro
                                                </Link>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            /* Mensaje cuando no existen coincidencias. */
                            <div className="new-testament-empty">
                                <span
                                    className="new-testament-empty__icon"
                                    aria-hidden="true"
                                >
                                    ♡
                                </span>

                                <h3>
                                    No encontramos ese libro
                                </h3>

                                <p>
                                    Prueba escribiendo otro nombre o selecciona
                                    un grupo diferente del Nuevo Testamento.
                                </p>

                                <button
                                    type="button"
                                    onClick={handleClearFilters}
                                >
                                    Mostrar todos los libros
                                </button>
                            </div>
                        )}

                        {/* Navegación inferior. */}
                        <div className="new-testament-books__back">
                            <Link to="/member/recursos/biblia">
                                <span aria-hidden="true">
                                    ←
                                </span>

                                Volver a Biblia y herramientas
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

        </>
    );
}

// Exportamos el componente.
export default NewTestamentBooks;
