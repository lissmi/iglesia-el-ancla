// =========================================================
// BIBLIOTECA SOLIDARIA - CATÁLOGO PARA MIEMBROS
// =========================================================

// useEffect consulta MongoDB a través de nuestra API.
// useMemo evita recalcular filtros innecesariamente.
// useState mantiene el catálogo y los estados de la interfaz.
import { useEffect, useMemo, useState } from "react";

// Link permite navegar sin recargar la aplicación.
import { Link } from "react-router-dom";

// Iconos ya utilizados en otros módulos del proyecto.
import { BookOpen, Download, LibraryBig, Search } from "lucide-react";

// Reutilizamos el cliente Axios configurado para la sesión actual.
import api from "../../../services/api";

// Hoja de estilos exclusiva del módulo.
import "../../../styles/pages/member/resources/SolidarityLibrary.css";

// Página integrada al MemberLayout: no debe importar Header ni Footer.
function SolidarityLibrary() {
    // Guarda los libros publicados en MongoDB.
    const [libraryBooks, setLibraryBooks] = useState([]);

    // Indica si estamos consultando los libros al servidor.
    const [loading, setLoading] = useState(true);

    // Guarda el mensaje de error si no podemos consultar la API.
    const [loadError, setLoadError] = useState("");

    // Incrementar este valor permite reintentar una consulta fallida.
    const [reloadKey, setReloadKey] = useState(0);

    // Guarda las palabras introducidas en el buscador.
    const [searchTerm, setSearchTerm] = useState("");

    // Guarda el filtro seleccionado por el miembro.
    const [selectedCategory, setSelectedCategory] = useState("Todos");

    // Consultamos el catálogo al abrir la página o reintentar la petición.
    useEffect(() => {
        // AbortController cancela una petición si la página se desmonta.
        const controller = new AbortController();

        // Encapsulamos la llamada asíncrona en una función.
        const loadBooks = async () => {
            // Activamos el indicador de carga y limpiamos errores anteriores.
            setLoading(true);
            setLoadError("");

            try {
                // El cliente api agrega la URL base y envía la sesión configurada.
                const response = await api.get("/library/books", {
                    signal: controller.signal,
                });

                // Comprobamos que la respuesta tenga la estructura esperada.
                if (!Array.isArray(response.data?.books)) {
                    throw new Error("La API devolvió un catálogo inválido.");
                }

                // Solo actualizamos el estado si la solicitud sigue activa.
                if (!controller.signal.aborted) {
                    setLibraryBooks(response.data.books);
                }
            } catch (error) {
                // No mostramos errores originados por una cancelación normal.
                if (controller.signal.aborted) return;

                // Diferenciamos los fallos del servidor de los de formato.
                setLoadError(
                    error.response?.data?.message ||
                    error.message ||
                    "No fue posible cargar los libros."
                );
            } finally {
                // Finalizamos el indicador de carga si aún estamos en la página.
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        // Iniciamos la consulta al catálogo de libros.
        loadBooks();

        // Cancelamos la petición cuando React deja de mostrar esta página.
        return () => controller.abort();
    }, [reloadKey]);

    // Construye la dirección de descarga que comprueba la sesión en el backend.
    const getBookDownloadUrl = (bookId) => {
        // Se reutiliza la URL de la API sin la barra final.
        const baseUrl = (api.defaults.baseURL || "/api").replace(/\/+$/, "");

        // Codificamos el identificador antes de incorporarlo en la ruta.
        return `${baseUrl}/library/books/${encodeURIComponent(bookId)}/download`;
    };

    // Construye la lista de categorías a partir de los libros publicados.
    const categories = useMemo(() => {
        // Descarta categorías vacías y evita duplicados.
        const bookCategories = libraryBooks
            .map((book) => book.category)
            .filter(Boolean);

        // Siempre mantenemos la opción para mostrar todos los libros.
        return ["Todos", ...new Set(bookCategories)];
    }, [libraryBooks]);

    // Busca por título, autor, categoría o descripción.
    const filteredBooks = useMemo(() => {
        // Normaliza el texto para realizar una búsqueda sin distinguir mayúsculas.
        const search = searchTerm.trim().toLocaleLowerCase("es");

        // Devuelve únicamente los libros que cumplen ambos filtros.
        return libraryBooks.filter((book) => {
            // Compara la categoría elegida con la del libro.
            const matchesCategory =
                selectedCategory === "Todos" ||
                book.category === selectedCategory;

            // Agrupa los campos que podrán utilizarse en las búsquedas.
            const searchableText = [
                book.title,
                book.author,
                book.category,
                book.description,
            ]
                .filter(Boolean)
                .join(" ")
                .toLocaleLowerCase("es");

            // Una búsqueda vacía debe mostrar todos los resultados.
            const matchesSearch = search === "" || searchableText.includes(search);

            // Ambos filtros deben cumplirse.
            return matchesCategory && matchesSearch;
        });
    }, [libraryBooks, searchTerm, selectedCategory]);

    // Cuenta solamente categorías reales, sin la opción "Todos".
    const categoryCount = Math.max(0, categories.length - 1);

    // Limpia el buscador y restablece el catálogo completo.
    const clearFilters = () => {
        setSearchTerm("");
        setSelectedCategory("Todos");
    };

    // Retorna el contenido de la página: MemberLayout dibuja la navegación global.
    return (
        <main className="solidarity-library-page">
            {/* ================================================= */}
            {/* HERO INSTITUCIONAL */}
            {/* ================================================= */}
            <section className="solidarity-library-hero">
                {/* Superposición dorada suave para enriquecer la fotografía. */}
                <div className="solidarity-library-hero__overlay" aria-hidden="true" />

                <div className="solidarity-library-hero__container">
                    <p className="solidarity-library-hero__eyebrow">
                        Lectura y crecimiento espiritual
                    </p>

                    <h1>Biblioteca Solidaria</h1>

                    <p className="solidarity-library-hero__description">
                        Un espacio para descubrir libros cristianos, profundizar
                        en la Palabra de Dios y compartir el conocimiento que
                        fortalece nuestra comunidad.
                    </p>
                </div>

                {/* Curva blanca característica de las páginas de Recursos. */}
                <div className="solidarity-library-hero__curve" aria-hidden="true" />
            </section>

            {/* ================================================= */}
            {/* INTRODUCCIÓN Y ESTADÍSTICAS */}
            {/* ================================================= */}
            <section className="solidarity-library-intro">
                <div className="solidarity-library-intro__container">
                    <div className="solidarity-library-intro__content">
                        <p className="solidarity-library-section__eyebrow">
                            Una biblioteca para nuestra comunidad
                        </p>

                        <h2>Libros que inspiran, enseñan y acompañan</h2>

                        <p>
                            Reunimos materiales de lectura para que cada miembro
                            pueda encontrar orientación, estudiar a su ritmo y
                            continuar creciendo en su fe. Los libros publicados
                            estarán disponibles para su descarga gratuita.
                        </p>
                    </div>

                    {/* Resumen del catálogo, calculado a partir de sus registros. */}
                    <div className="solidarity-library-intro__summary">
                        <div className="solidarity-library-intro__stat">
                            <strong>{loading ? "—" : libraryBooks.length}</strong>
                            <span>Libros publicados</span>
                        </div>

                        <div className="solidarity-library-intro__stat">
                            <strong>{loading ? "—" : categoryCount}</strong>
                            <span>Categorías de lectura</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================================================= */}
            {/* BUSCADOR Y FILTROS */}
            {/* ================================================= */}
            <section className="solidarity-library-tools">
                <div className="solidarity-library-tools__container">
                    <div className="solidarity-library-tools__heading">
                        <div>
                            <p className="solidarity-library-section__eyebrow">
                                Explora nuestra colección
                            </p>
                            <h2>Encuentra tu próxima lectura</h2>
                        </div>

                        <p>
                            Busca por título, autor o temática. También puedes
                            seleccionar una categoría para descubrir los libros
                            disponibles.
                        </p>
                    </div>

                    {/* Campo de búsqueda controlado por React. */}
                    <div className="solidarity-library-search">
                        <Search size={20} className="solidarity-library-search__icon" aria-hidden="true" />
                        <input
                            type="search"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Buscar un libro, autor o tema..."
                            aria-label="Buscar libros en Biblioteca Solidaria"
                        />

                        {/* Solo aparece cuando existe texto que podamos limpiar. */}
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm("")}
                                aria-label="Limpiar búsqueda"
                            >
                                ×
                            </button>
                        )}
                    </div>

                    {/* Categorías que se actualizarán con los libros publicados. */}
                    <div className="solidarity-library-filter-group">
                        <p>Categorías</p>

                        <div className="solidarity-library-filters" role="group" aria-label="Filtrar libros por categoría">
                            {categories.map((category) => {
                                // Comprueba si este filtro está seleccionado.
                                const isActive = selectedCategory === category;

                                return (
                                    <button
                                        key={category}
                                        type="button"
                                        className={
                                            isActive
                                                ? "solidarity-library-filter solidarity-library-filter--active"
                                                : "solidarity-library-filter"
                                        }
                                        onClick={() => setSelectedCategory(category)}
                                        aria-pressed={isActive}
                                    >
                                        {category}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* ================================================= */}
            {/* CATÁLOGO DE LIBROS */}
            {/* ================================================= */}
            <section className="solidarity-library-list">
                <div className="solidarity-library-list__container">
                    <div className="solidarity-library-list__heading">
                        <div>
                            <p className="solidarity-library-section__eyebrow">
                                Biblioteca digital
                            </p>
                            <h2>Nuestros libros</h2>
                        </div>

                        {/* Contador accesible para cambios en los filtros. */}
                        <p className="solidarity-library-list__count" aria-live="polite">
                            {loading
                                ? "Cargando libros..."
                                : loadError
                                    ? "Catálogo no disponible"
                                    : `${filteredBooks.length} ${filteredBooks.length === 1 ? "libro encontrado" : "libros encontrados"}`}
                        </p>
                    </div>

                    {/* Mostramos primero carga, luego error y finalmente el catálogo. */}
                    {loading ? (
                        <div className="solidarity-library-empty" role="status" aria-live="polite">
                            <div className="solidarity-library-empty__icon" aria-hidden="true">
                                <LibraryBig size={38} strokeWidth={1.5} />
                            </div>
                            <p className="solidarity-library-empty__eyebrow">Consultando catálogo</p>
                            <h3>Cargando biblioteca...</h3>
                            <p>Estamos buscando los libros publicados por nuestra comunidad.</p>
                        </div>
                    ) : loadError ? (
                        <div className="solidarity-library-empty" role="alert">
                            <p className="solidarity-library-empty__eyebrow">Error de conexión</p>
                            <h3>No pudimos cargar los libros</h3>
                            <p>{loadError}</p>
                            <button
                                type="button"
                                onClick={() => setReloadKey((previousValue) => previousValue + 1)}
                            >
                                Intentar nuevamente
                            </button>
                        </div>
                    ) : libraryBooks.length === 0 ? (
                        <div className="solidarity-library-empty">
                            <div className="solidarity-library-empty__icon" aria-hidden="true">
                                <LibraryBig size={38} strokeWidth={1.5} />
                            </div>

                            <p className="solidarity-library-empty__eyebrow">
                                Una colección en preparación
                            </p>

                            <h3>Pronto compartiremos nuestros primeros libros</h3>

                            <p>
                                Estamos preparando la Biblioteca Solidaria para
                                que puedas encontrar libros organizados por autor
                                y temática, y descargarlos cuando estén publicados.
                            </p>

                            <Link to="/member/recursos">Explorar otros recursos <span aria-hidden="true">→</span></Link>
                        </div>
                    ) : filteredBooks.length > 0 ? (
                        // Cada tarjeta proviene de un libro publicado por administración.
                        <div className="solidarity-library-grid">
                            {filteredBooks.map((book) => (
                                <article className="solidarity-library-card" key={book._id}>
                                    <div className="solidarity-library-card__top">
                                        <span className="solidarity-library-card__category">{book.category}</span>
                                        <div className="solidarity-library-card__cover">
                                            {book.coverUrl ? (
                                                <img src={book.coverUrl} alt={`Portada de ${book.title}`} loading="lazy" />
                                            ) : (
                                                <BookOpen size={55} strokeWidth={1.2} aria-hidden="true" />
                                            )}
                                        </div>
                                    </div>

                                    <div className="solidarity-library-card__content">
                                        <p className="solidarity-library-card__eyebrow">Lectura cristiana</p>
                                        <h3>{book.title}</h3>
                                        <p className="solidarity-library-card__author">Por {book.author || "Autor no indicado"}</p>
                                        {book.description && (
                                            <p className="solidarity-library-card__description">{book.description}</p>
                                        )}
                                    </div>

                                    <div className="solidarity-library-card__footer">
                                        <span>Formato PDF</span>
                                        {/* El PDF se solicita a una ruta que valida el rol y la sesión. */}
                                        {book._id ? (
                                            <a
                                                href={getBookDownloadUrl(book._id)}
                                                aria-label={`Descargar libro ${book.title} en PDF`}
                                            >
                                                Descargar <Download size={15} aria-hidden="true" />
                                            </a>
                                        ) : (
                                            <span className="solidarity-library-card__unavailable">No disponible</span>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        // Mensaje cuando hay libros, pero ninguno coincide con los filtros.
                        <div className="solidarity-library-empty">
                            <p className="solidarity-library-empty__eyebrow">Sin resultados</p>
                            <h3>No encontramos libros con esos filtros</h3>
                            <p>Prueba con otro autor, título o categoría.</p>
                            <button type="button" onClick={clearFilters}>Limpiar filtros</button>
                        </div>
                    )}
                </div>
            </section>

            {/* ================================================= */}
            {/* ORIENTACIÓN PARA UTILIZAR LA BIBLIOTECA */}
            {/* ================================================= */}
            <section className="solidarity-library-info">
                <div className="solidarity-library-info__container">
                    <div className="solidarity-library-info__content">
                        <p className="solidarity-library-info__eyebrow">Un recurso para compartir</p>
                        <h2>La lectura también es una forma de crecer juntos</h2>
                        <p>
                            Encuentra un libro, conoce su contenido y descarga
                            su PDF para leerlo desde tu dispositivo cuando lo
                            necesites.
                        </p>
                    </div>

                    <div className="solidarity-library-info__steps">
                        <article>
                            <span>01</span>
                            <div><h3>Explora la colección</h3><p>Busca por título, autor o tema de interés.</p></div>
                        </article>
                        <article>
                            <span>02</span>
                            <div><h3>Elige un libro</h3><p>Revisa su descripción y selecciona tu próxima lectura.</p></div>
                        </article>
                        <article>
                            <span>03</span>
                            <div><h3>Descárgalo y aprende</h3><p>Accede gratuitamente a los archivos autorizados para compartir.</p></div>
                        </article>
                    </div>
                </div>
            </section>

            {/* ================================================= */}
            {/* CIERRE INSTITUCIONAL */}
            {/* ================================================= */}
            <section className="solidarity-library-closing">
                <div className="solidarity-library-closing__container">
                    <div>
                        <p className="solidarity-library-closing__eyebrow">Continúa aprendiendo</p>
                        <h2>Siempre hay algo nuevo por descubrir en la Palabra</h2>
                        <p>
                            Complementa tus lecturas con nuestros estudios bíblicos,
                            guías de oración y materiales de discipulado.
                        </p>
                    </div>
                    <Link to="/member/recursos">Explorar Recursos</Link>
                </div>
            </section>
        </main>
    );
}

// Permite importar esta página desde App.js.
export default SolidarityLibrary;
