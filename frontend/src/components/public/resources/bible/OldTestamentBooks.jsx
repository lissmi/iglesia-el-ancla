// Importamos los datos de los 39 libros
// del Antiguo Testamento.
import oldTestamentBooks from "../../../../data/bible/oldTestamentBooks";

// Importamos la tarjeta reutilizable.
import BibleBookCard from "./BibleBookCard";

// Creamos el componente del Antiguo Testamento.
function OldTestamentBooks({ onOpenBook }) {
    return (
        // Sección correspondiente al Antiguo Testamento.
        <section
            className="bible-testament-section"
            aria-labelledby="old-testament-title"
        >
            {/* Encabezado de la sección. */}
            <div className="bible-testament-section__header">
                {/* Bloque de título. */}
                <div>
                    <p className="bible-tools-section__eyebrow">
                        39 libros
                    </p>

                    <h3
                        className="bible-testament-section__title"
                        id="old-testament-title"
                    >
                        Antiguo Testamento
                    </h3>
                </div>

                {/* Descripción breve. */}
                <p className="bible-testament-section__description">
                    Conoce la creación, la historia de Israel,
                    los libros de sabiduría y el mensaje de los
                    profetas.
                </p>
            </div>

            {/* Conservamos la misma cuadrícula original. */}
            <div className="bible-books__grid">
                {/* Recorremos los 39 libros. */}
                {oldTestamentBooks.map((book) => (
                    <BibleBookCard
                        key={book.id}
                        book={book}
                        onOpenBook={onOpenBook}
                    />
                ))}
            </div>
        </section>
    );
}

// Exportamos el componente.
export default OldTestamentBooks;