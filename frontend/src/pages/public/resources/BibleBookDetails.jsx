// Importamos Link para navegar dentro de la aplicación
// y useParams para obtener el slug incluido en la URL.
import { Link, useParams } from "react-router-dom";

// Importamos el encabezado general del sitio.
import Header from "../../../components/public/Header";

// Importamos los libros de ambos testamentos.
import oldTestamentBooks from "../../../data/bible/oldTestamentBooks";
import newTestamentBooks from "../../../data/bible/newTestamentBooks";

// Importamos el CSS exclusivo de esta página.
import "../../../styles/pages/public/resources/BibleBookDetails.css";

// Unimos los libros de ambos testamentos en un solo arreglo.
// De esta forma, una sola página puede buscar cualquiera de los 66 libros.
const allBibleBooks = [
    ...oldTestamentBooks,
    ...newTestamentBooks,
];

// Creamos el componente reutilizable.
function BibleBookDetails() {
    // Obtenemos el slug desde una URL como:
    // /recursos/biblia/libro/genesis
    const { slug } = useParams();

    // Buscamos el libro cuyo slug coincida con el de la URL.
    const book = allBibleBooks.find(
        (currentBook) => currentBook.slug === slug
    );

    // Si el slug no corresponde a ningún libro,
    // mostramos una página de error sencilla.
    if (!book) {
        return (
            <>
                <Header />

                <main className="book-details-not-found">
                    <section className="book-details-not-found__container">
                        <p className="book-details-not-found__eyebrow">
                            Libro no encontrado
                        </p>

                        <h1>
                            No pudimos encontrar este libro
                        </h1>

                        <p>
                            Es posible que el enlace sea incorrecto o que el
                            libro todavía no esté disponible.
                        </p>

                        <Link to="/recursos/biblia">
                            Volver a Biblia y herramientas
                        </Link>
                    </section>
                </main>
            </>
        );
    }

    // Comprobamos a qué testamento pertenece el libro.
    const isOldTestament =
        book.testament === "Antiguo Testamento";

    // Definimos la ruta de regreso según el testamento.
    const testamentBooksPath = isOldTestament
        ? "/recursos/biblia/libros/antiguo-testamento"
        : "/recursos/biblia/libros/nuevo-testamento";

    // Definimos el texto del enlace de regreso.
    const testamentBooksLabel = isOldTestament
        ? "Ver libros del Antiguo Testamento"
        : "Ver libros del Nuevo Testamento";

    // Seleccionamos solamente los libros del mismo testamento
    // para crear la navegación anterior y siguiente.
    const booksFromSameTestament = isOldTestament
        ? oldTestamentBooks
        : newTestamentBooks;

    // Buscamos la posición actual del libro.
    const currentBookIndex = booksFromSameTestament.findIndex(
        (currentBook) => currentBook.slug === book.slug
    );

    // Obtenemos el libro anterior cuando existe.
    const previousBook =
        currentBookIndex > 0
            ? booksFromSameTestament[currentBookIndex - 1]
            : null;

    // Obtenemos el libro siguiente cuando existe.
    const nextBook =
        currentBookIndex < booksFromSameTestament.length - 1
            ? booksFromSameTestament[currentBookIndex + 1]
            : null;

    // Comprobamos si la descripción está guardada como arreglo.
    // Esta validación permite mantener compatibilidad con libros
    // que todavía tengan una descripción antigua de tipo string.
    const descriptionParagraphs = Array.isArray(book.description)
        ? book.description
        : [book.description];

    // Comprobamos si existen personajes principales.
    const hasKeyCharacters =
        Array.isArray(book.keyCharacters) &&
        book.keyCharacters.length > 0;

    // Comprobamos si existen acontecimientos importantes.
    const hasKeyEvents =
        Array.isArray(book.keyEvents) &&
        book.keyEvents.length > 0;

    // Comprobamos si existen temas principales.
    const hasKeyThemes =
        Array.isArray(book.keyThemes) &&
        book.keyThemes.length > 0;

    // Comprobamos si existe un versículo destacado completo.
    const hasFeaturedVerse =
        book.featuredVerse &&
        book.featuredVerse.reference &&
        book.featuredVerse.text;

    return (
        <>
            {/* Encabezado general del sitio. */}
            <Header />

            {/* Contenido principal de la página. */}
            <main className="book-details-page">
                {/* Hero dinámico del libro. */}
                <section className="book-details-hero">
                    {/* Capa decorativa del hero. */}
                    <div className="book-details-hero__overlay" />

                    {/* Contenedor principal del hero. */}
                    <div className="book-details-hero__container">
                        {/* Ruta de navegación. */}
                        <nav
                            className="book-details-breadcrumb"
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

                            <Link to={testamentBooksPath}>
                                {book.testament}
                            </Link>

                            <span aria-hidden="true">
                                /
                            </span>

                            <span aria-current="page">
                                {book.name}
                            </span>
                        </nav>

                        {/* Etiqueta con la clasificación del libro. */}
                        <p className="book-details-hero__eyebrow">
                            {book.group}
                        </p>

                        {/* Nombre del libro. */}
                        <h1 className="book-details-hero__title">
                            {book.name}
                        </h1>

                        {/* Tema principal del libro. */}
                        <p className="book-details-hero__theme">
                            {book.theme}
                        </p>

                        {/* Datos rápidos del libro. */}
                        <div className="book-details-hero__facts">
                            <div className="book-details-hero__fact">
                                <strong>
                                    {book.chapters}
                                </strong>

                                <span>
                                    capítulos
                                </span>
                            </div>

                            <div className="book-details-hero__fact">
                                <strong>
                                    {book.testament}
                                </strong>

                                <span>
                                    testamento
                                </span>
                            </div>

                            <div className="book-details-hero__fact">
                                <strong>
                                    {book.group}
                                </strong>

                                <span>
                                    clasificación
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Curva decorativa inferior del hero. */}
                    <div className="book-details-hero__curve" />
                </section>

                {/* Sección de descripción y resumen lateral. */}
                <section className="book-details-content">
                    <div className="book-details-content__container">
                        {/* Columna principal con la descripción. */}
                        <article className="book-details-main">
                            <p className="book-details-section__eyebrow">
                                Conoce el libro
                            </p>

                            <h2 className="book-details-section__title">
                                ¿De qué trata {book.name}?
                            </h2>

                            {/* Recorremos los párrafos de la descripción. */}
                            <div className="book-details-main__description">
                                {descriptionParagraphs.map(
                                    (paragraph, index) => (
                                        <p key={`${book.slug}-description-${index}`}>
                                            {paragraph}
                                        </p>
                                    )
                                )}
                            </div>

                            {/* Tarjeta con el tema central. */}
                            <div className="book-details-theme">
                                <span>
                                    Tema principal
                                </span>

                                <p>
                                    {book.theme}
                                </p>
                            </div>
                        </article>
                    </div>
                </section>

                {/* Sección con información complementaria del libro. */}
                <section className="book-details-information">
                    <div className="book-details-information__container">
                        <div className="book-details-information__heading">
                            <p className="book-details-section__eyebrow">
                                Información del libro
                            </p>

                            <h2 className="book-details-section__title">
                                Elementos importantes de {book.name}
                            </h2>

                            <p>
                                Conoce sus personajes, acontecimientos,
                                enseñanzas y pasajes más representativos.
                            </p>
                        </div>

                        {/* Cuadrícula de tarjetas informativas. */}
                        <div className="book-details-information__grid">
                            {/* Tarjeta de personajes principales. */}
                            {hasKeyCharacters && (
                                <article className="book-details-info-card">
                                    <p className="book-details-info-card__eyebrow">
                                        Personas del relato
                                    </p>

                                    <h3>
                                        Personajes principales
                                    </h3>

                                    <ul className="book-details-info-card__list">
                                        {book.keyCharacters.map(
                                            (character) => (
                                                <li key={character}>
                                                    {character}
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </article>
                            )}

                            {/* Tarjeta de acontecimientos importantes. */}
                            {hasKeyEvents && (
                                <article className="book-details-info-card">
                                    <p className="book-details-info-card__eyebrow">
                                        Desarrollo del libro
                                    </p>

                                    <h3>
                                        Acontecimientos importantes
                                    </h3>

                                    <ul className="book-details-info-card__list">
                                        {book.keyEvents.map(
                                            (event) => (
                                                <li key={event}>
                                                    {event}
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </article>
                            )}

                            {/* Tarjeta de temas principales. */}
                            {hasKeyThemes && (
                                <article className="book-details-info-card">
                                    <p className="book-details-info-card__eyebrow">
                                        Enseñanzas centrales
                                    </p>

                                    <h3>
                                        Temas principales
                                    </h3>

                                    <div className="book-details-info-card__tags">
                                        {book.keyThemes.map(
                                            (keyTheme) => (
                                                <span key={keyTheme}>
                                                    {keyTheme}
                                                </span>
                                            )
                                        )}
                                    </div>
                                </article>
                            )}

                            {/* Tarjeta con la cantidad de capítulos. */}
                            <article className="book-details-info-card">
                                <p className="book-details-info-card__eyebrow">
                                    Extensión
                                </p>

                                <h3>
                                    Capítulos
                                </h3>

                                <strong className="book-details-info-card__number">
                                    {book.chapters}
                                </strong>

                                <p>
                                    El libro de {book.name} contiene{" "}
                                    {book.chapters}{" "}
                                    {book.chapters === 1
                                        ? "capítulo"
                                        : "capítulos"}.
                                </p>
                            </article>
                        </div>
                    </div>
                </section>

                {/* Versículo destacado del libro. */}
                {hasFeaturedVerse && (
                    <section className="book-details-verse">
                        <div className="book-details-verse__container">
                            <p className="book-details-verse__eyebrow">
                                Versículo destacado
                            </p>

                            <blockquote>
                                <p>
                                    “{book.featuredVerse.text}”
                                </p>

                                <footer>
                                    {book.featuredVerse.reference}
                                </footer>
                            </blockquote>
                        </div>
                    </section>
                )}

                {/* Sección para comenzar a leer el libro. */}
                <section className="book-details-read">
                    <div className="book-details-read__container">
                        <div>
                            <p className="book-details-read__eyebrow">
                                Lectura bíblica
                            </p>

                            <h2>
                                Lee el libro de {book.name}
                            </h2>

                            <p>
                                Avanza por sus capítulos y conoce directamente
                                el mensaje, los acontecimientos y las
                                enseñanzas que contiene.
                            </p>
                        </div>

                        <Link
                            className="book-details-read__button"
                            to={`/recursos/biblia/leer/${book.slug}`}
                        >
                            Leer {book.name}

                            <span aria-hidden="true">
                                →
                            </span>
                        </Link>
                    </div>
                </section>

                {/* Invitación a continuar explorando la Biblia. */}
                <section className="book-details-explore">
                    <div className="book-details-explore__container">
                        <div>
                            <p className="book-details-explore__eyebrow">
                                Continúa aprendiendo
                            </p>

                            <h2>
                                Continúa explorando las Escrituras
                            </h2>

                            <p>
                                Descubre otros libros de la Biblia, sus temas,
                                personajes, acontecimientos y enseñanzas principales.
                            </p>
                        </div>

                        <div className="book-details-explore__actions">
                            <Link
                                className="book-details-explore__button book-details-explore__button--secondary"
                                to={testamentBooksPath}
                            >
                                {testamentBooksLabel}
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Navegación entre libros del mismo testamento. */}
                <nav
                    className="book-details-navigation"
                    aria-label="Navegación entre libros"
                >
                    <div className="book-details-navigation__container">
                        {/* Enlace al libro anterior. */}
                        {previousBook ? (
                            <Link
                                className="book-details-navigation__link book-details-navigation__link--previous"
                                to={`/recursos/biblia/libro/${previousBook.slug}`}
                            >
                                <span aria-hidden="true">
                                    ←
                                </span>

                                <div>
                                    <small>
                                        Libro anterior
                                    </small>

                                    <strong>
                                        {previousBook.name}
                                    </strong>
                                </div>
                            </Link>
                        ) : (
                            <div className="book-details-navigation__placeholder" />
                        )}

                        {/* Enlace para volver al listado completo. */}
                        <Link
                            className="book-details-navigation__all"
                            to={testamentBooksPath}
                        >
                            Ver todos los libros
                        </Link>

                        {/* Enlace al libro siguiente. */}
                        {nextBook ? (
                            <Link
                                className="book-details-navigation__link book-details-navigation__link--next"
                                to={`/recursos/biblia/libro/${nextBook.slug}`}
                            >
                                <div>
                                    <small>
                                        Libro siguiente
                                    </small>

                                    <strong>
                                        {nextBook.name}
                                    </strong>
                                </div>

                                <span aria-hidden="true">
                                    →
                                </span>
                            </Link>
                        ) : (
                            <div className="book-details-navigation__placeholder" />
                        )}
                    </div>
                </nav>
            </main>
        </>
    );
}

// Exportamos el componente para utilizarlo en App.js.
export default BibleBookDetails;