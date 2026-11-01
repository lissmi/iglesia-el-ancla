// Importamos los datos de los 27 libros
// del Nuevo Testamento.
import newTestamentBooks from "../../../data/bible/newTestamentBooks";

// Importamos la tarjeta reutilizable.
import BibleBookCard from "./BibleBookCard";

// Creamos el componente del Nuevo Testamento.
function NewTestamentBooks({ onOpenBook }) {
    return (
        // Sección correspondiente al Nuevo Testamento.
        <section
            className="bible-testament-section"
            aria-labelledby="new-testament-title"
        >
            {/* Encabezado de la sección. */}
            <div className="bible-testament-section__header">
                {/* Bloque de título. */}
                <div>
                    <p className="bible-tools-section__eyebrow">
                        27 libros
                    </p>

                    <h3
                        className="bible-testament-section__title"
                        id="new-testament-title"
                    >
                        Nuevo Testamento
                    </h3>
                </div>

                {/* Descripción breve. */}
                <p className="bible-testament-section__description">
                    Conoce la vida de Jesús, el nacimiento de la
                    iglesia, las cartas apostólicas y el libro de
                    Apocalipsis.
                </p>
            </div>

            {/* Conservamos la misma cuadrícula original. */}
            <div className="bible-books__grid">
                {/* Recorremos los 27 libros. */}
                {newTestamentBooks.map((book) => (
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
export default NewTestamentBooks;