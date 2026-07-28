// Importamos Link para preparar la navegación
// hacia el futuro lector bíblico.
import { Link } from "react-router-dom";

// Creamos una tarjeta reutilizable para cada libro de la Biblia.
function BibleBookCard({ book, onOpenBook }) {
    // Retornamos la misma estructura visual
    // que utilizaban las tarjetas originales.
    return (
        <article className="bible-book-card">
            {/* Parte superior decorativa de la tarjeta. */}
            <div className="bible-book-card__top">
                {/* Testamento al que pertenece el libro. */}
                <span className="bible-book-card__testament">
                    {book.testament}
                </span>

                {/* Cantidad de capítulos. */}
                <span className="bible-book-card__chapters">
                    {book.chapters}{" "}
                    {book.chapters === 1
                        ? "capítulo"
                        : "capítulos"}
                </span>
            </div>

            {/* Contenido principal de la tarjeta. */}
            <div className="bible-book-card__content">
                {/* Grupo o clasificación del libro. */}
                <p className="bible-book-card__group">
                    {book.group}
                </p>

                {/* Nombre del libro. */}
                <h3 className="bible-book-card__title">
                    {book.name}
                </h3>

                {/* Tema principal del libro. */}
                <p className="bible-book-card__theme">
                    {book.theme}
                </p>

                {/* Contenedor de acciones. */}
                <div className="bible-book-card__actions">
                    {/* Botón para mostrar la información del libro. */}
                    <button
                        className="bible-book-card__button"
                        type="button"
                        onClick={() => onOpenBook(book.id)}
                    >
                        Conocer el libro
                        <span aria-hidden="true">→</span>
                    </button>

                    {/* Enlace preparado para el futuro lector bíblico. */}
                    <Link
                        className="bible-book-card__reader-link"
                        to={`/recursos/biblia/leer/${book.slug}`}
                        aria-label={`Leer el libro de ${book.name}`}
                    >
                        Leer libro
                    </Link>
                </div>
            </div>
        </article>
    );
}

// Exportamos la tarjeta para reutilizarla.
export default BibleBookCard;