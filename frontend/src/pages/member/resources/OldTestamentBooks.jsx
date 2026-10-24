// Importamos useMemo para calcular los resultados filtrados
// solamente cuando cambie la búsqueda, el filtro o los datos.
import { useMemo, useState } from "react";

// Importamos Link para navegar sin recargar la aplicación.
import { Link } from "react-router-dom";

// Importamos los componentes generales del sitio.
// Ajusta las rutas si Header y Footer están en otra carpeta.
import Header from "../../../components/public/Header";


// Importamos los 39 libros del Antiguo Testamento.
import oldTestamentBooks from "../../../data/bible/oldTestamentBooks";

// Importamos el CSS exclusivo de esta página.
import "../../../styles/pages/public/resources/OldTestamentBooks.css";

// Creamos una función que normaliza los textos.
// Esto permite que una búsqueda como "genesis"
// también encuentre "Génesis".
function normalizeText(text = "") {
    return text
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

// Creamos el componente principal.
function OldTestamentBooks() {
    // Guardamos el texto escrito en la barra de búsqueda.
    const [searchTerm, setSearchTerm] = useState("");

    // Guardamos el grupo seleccionado.
    // Por defecto se muestran todos los libros.
    const [selectedGroup, setSelectedGroup] = useState("Todos");

    // Obtenemos automáticamente los grupos existentes
    // dentro del archivo oldTestamentBooks.
    const bookGroups = useMemo(() => {
        // Extraemos el grupo de cada libro.
        const groups = oldTestamentBooks.map((book) => book.group);

        // Utilizamos Set para eliminar los grupos repetidos.
        return ["Todos", ...new Set(groups)];
    }, []);

    // Filtramos los libros según la búsqueda y el grupo.
    const filteredBooks = useMemo(() => {
        // Normalizamos el texto ingresado por el usuario.
        const normalizedSearch = normalizeText(searchTerm);

        return oldTestamentBooks.filter((book) => {
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
    }, [searchTerm, selectedGroup]);

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
            <main className="old-testament-page">
                {/* Hero de la página. */}
                <section className="old-testament-hero">
                    {/* Capa decorativa sobre el fondo. */}
                    <div className="old-testament-hero__overlay" />

                    {/* Contenido del hero. */}
                    <div className="old-testament-hero__container">
                        {/* Ruta de navegación. */}
                        <nav
                            className="old-testament-breadcrumb"
                            aria-label="Ruta de navegación"
                        >
                            <Link to="/">
                                Inicio
                            </Link>

                            <span aria-hidden="true">
                                /
                            </span>

                            <Link to="/recursos">
                                Recursos
                            </Link>

                            <span aria-hidden="true">
                                /
                            </span>

                            <Link to="/recursos/biblia">
                                Biblia y herramientas
                            </Link>

                            <span aria-hidden="true">
                                /
                            </span>

                            <span aria-current="page">
                                Antiguo Testamento
                            </span>
                        </nav>

                        {/* Texto pequeño superior. */}
                        <p className="old-testament-hero__eyebrow">
                            Explora las Escrituras
                        </p>

                        {/* Título principal. */}
                        <h1 className="old-testament-hero__title">
                            Libros del
                            <span>Antiguo Testamento</span>
                        </h1>

                        {/* Descripción principal. */}
                        <p className="old-testament-hero__description">
                            Descubre los 39 libros que narran la creación,
                            la historia de Israel, la sabiduría, la poesía
                            y el mensaje de los profetas.
                        </p>

                        {/* Dato rápido. */}
                        <div className="old-testament-hero__fact">
                            <strong>
                                {oldTestamentBooks.length}
                            </strong>

                            <span>
                                libros para explorar
                            </span>
                        </div>
                    </div>

                    {/* Curva inferior decorativa. */}
                    <div className="old-testament-hero__curve" />
                </section>

                {/* Sección que contiene los libros. */}
                <section className="old-testament-books">
                    <div className="old-testament-books__container">
                        {/* Encabezado de la sección. */}
                        <header className="old-testament-books__header">
                            <div>
                                <p className="old-testament-section__eyebrow">
                                    Biblioteca bíblica
                                </p>

                                <h2 className="old-testament-section__title">
                                    Encuentra un libro
                                </h2>
                            </div>

                            <p className="old-testament-books__description">
                                Busca un libro por su nombre, tema o grupo,
                                o utiliza los filtros para explorar las
                                distintas secciones del Antiguo Testamento.
                            </p>
                        </header>

                        {/* Panel con buscador y filtros. */}
                        <div className="old-testament-controls">
                            {/* Barra de búsqueda. */}
                            <div className="old-testament-search">
                                {/* Etiqueta accesible. */}
                                <label
                                    className="old-testament-search__label"
                                    htmlFor="old-testament-search"
                                >
                                    Buscar un libro
                                </label>

                                {/* Contenedor visual del input. */}
                                <div className="old-testament-search__field">
                                    {/* Icono decorativo de búsqueda. */}
                                    <span
                                        className="old-testament-search__icon"
                                        aria-hidden="true"
                                    >
                                        ⌕
                                    </span>

                                    {/* Campo de búsqueda. */}
                                    <input
                                        id="old-testament-search"
                                        type="search"
                                        value={searchTerm}
                                        onChange={(event) =>
                                            setSearchTerm(event.target.value)
                                        }
                                        placeholder="Ejemplo: Génesis, sabiduría o profetas"
                                    />

                                    {/* Botón para borrar solamente el texto. */}
                                    {searchTerm && (
                                        <button
                                            className="old-testament-search__clear"
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
                            <div className="old-testament-filters">
                                {/* Título de los filtros. */}
                                <p className="old-testament-filters__label">
                                    Filtrar por grupo
                                </p>

                                {/* Lista de botones. */}
                                <div className="old-testament-filters__buttons">
                                    {bookGroups.map((group) => {
                                        // Comprobamos si el botón corresponde
                                        // al filtro seleccionado.
                                        const isActive =
                                            selectedGroup === group;

                                        return (
                                            <button
                                                className={
                                                    isActive
                                                        ? "old-testament-filter old-testament-filter--active"
                                                        : "old-testament-filter"
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
                        <div className="old-testament-results">
                            {/* Contador dinámico. */}
                            <p
                                className="old-testament-results__counter"
                                aria-live="polite"
                            >
                                Mostrando{" "}
                                <strong>
                                    {filteredBooks.length}
                                </strong>{" "}
                                de {oldTestamentBooks.length} libros
                            </p>

                            {/* Botón para limpiar todos los filtros. */}
                            {hasActiveFilters && (
                                <button
                                    className="old-testament-results__clear"
                                    type="button"
                                    onClick={handleClearFilters}
                                >
                                    Limpiar búsqueda y filtros
                                </button>
                            )}
                        </div>

                        {/* Mostramos las tarjetas cuando hay resultados. */}
                        {filteredBooks.length > 0 ? (
                            <div className="old-testament-books__grid">
                                {filteredBooks.map((book) => (
                                    <article
                                        className="old-testament-book-card"
                                        key={book.id}
                                    >
                                        {/* Parte superior de la tarjeta. */}
                                        <div className="old-testament-book-card__top">
                                            <span className="old-testament-book-card__testament">
                                                {book.testament}
                                            </span>

                                            <span className="old-testament-book-card__chapters">
                                                {book.chapters} capítulos
                                            </span>
                                        </div>

                                        {/* Contenido de la tarjeta. */}
                                        <div className="old-testament-book-card__content">
                                            <p className="old-testament-book-card__group">
                                                {book.group}
                                            </p>

                                            <h3 className="old-testament-book-card__title">
                                                {book.name}
                                            </h3>

                                            <p className="old-testament-book-card__theme">
                                                {book.theme}
                                            </p>

                                            {/* Enlaces de la tarjeta. */}
                                            <div className="old-testament-book-card__actions">
                                                <Link
                                                    className="old-testament-book-card__details"
                                                    to={`/recursos/biblia/libro/${book.slug}`}
                                                >
                                                    Conocer el libro

                                                    <span aria-hidden="true">
                                                        →
                                                    </span>
                                                </Link>

                                                <Link
                                                    className="old-testament-book-card__reader"
                                                    to={`/recursos/biblia/leer/${book.slug}`}
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
                            <div className="old-testament-empty">
                                <span
                                    className="old-testament-empty__icon"
                                    aria-hidden="true"
                                >
                                    ♡
                                </span>

                                <h3>
                                    No encontramos ese libro
                                </h3>

                                <p>
                                    Prueba escribiendo otro nombre o selecciona
                                    un grupo diferente del Antiguo Testamento.
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
                        <div className="old-testament-books__back">
                            <Link to="/recursos/biblia">
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
export default OldTestamentBooks;