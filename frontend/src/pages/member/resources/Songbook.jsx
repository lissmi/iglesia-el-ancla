// =========================================================
// CANCIONERO DE ALABANZAS - ÁREA DE MIEMBROS
// =========================================================

// React controla búsqueda, filtros, paginación y lectura.
import { useEffect, useRef, useState } from "react";

// Iconos reutilizados del estilo de Iglesia El Ancla.
import {
    BookOpenText,
    Music2,
    Search,
    ChevronRight,
    X,
    RefreshCw,
    Minus,
    Plus,
    RotateCcw,
    Download,
} from "lucide-react";

// Imagen existente del proyecto para el encabezado institucional.
import bibliaImage from "../../../assets/images/resources/biblia-estudio.png";

// Cliente HTTP que envía automáticamente la cookie de sesión.
import api from "../../../services/api";

// Estilos exclusivos y adaptados a dispositivos móviles.
import "../../../styles/pages/member/resources/Songbook.css";

// Categorías permitidas en la API y en MongoDB.
const SONG_CATEGORIES = [
    "Todos",
    "General",
    "Alabanza",
    "Infantil",
];

// Tamaño inicial de lectura y límites accesibles para móviles.
const DEFAULT_LYRICS_SIZE = 22;
const MIN_LYRICS_SIZE = 16;
const MAX_LYRICS_SIZE = 34;
const LYRICS_SIZE_STEP = 2;

// Normalizamos el mensaje que devuelve una solicitud fallida.
function getErrorMessage(error, fallback) {
    return error?.response?.data?.message || error?.message || fallback;
}

// Componente integrado en MemberLayout: ya dispone de botón Volver global.
function Songbook() {
    // Texto que está escribiendo el miembro.
    const [searchInput, setSearchInput] = useState("");

    // Texto que realmente enviamos al backend, con pequeño retraso.
    const [searchTerm, setSearchTerm] = useState("");

    // Categoría musical seleccionada.
    const [category, setCategory] = useState("Todos");

    // Página actual para no descargar cientos de canciones a la vez.
    const [page, setPage] = useState(1);

    // Resultados recibidos desde MongoDB.
    const [songs, setSongs] = useState([]);

    // Cantidad total de canciones que coinciden con la búsqueda.
    const [total, setTotal] = useState(0);

    // Cantidad total de páginas disponibles.
    const [pages, setPages] = useState(1);

    // Estados de carga y error del listado.
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    // Valor que permite volver a cargar el catálogo.
    const [reloadKey, setReloadKey] = useState(0);

    // Canción seleccionada para leer su letra dentro de la PWA.
    const [selectedSong, setSelectedSong] = useState(null);

    // La letra original se obtiene del TXT privado de Google Drive.
    const [lyrics, setLyrics] = useState("");

    // Cada miembro puede modificar el tamaño de letra en el lector.
    const [lyricsFontSize, setLyricsFontSize] = useState(DEFAULT_LYRICS_SIZE);

    // Indicadores para mostrar la carga o errores al leer la canción.
    const [reading, setReading] = useState(false);
    const [readingError, setReadingError] = useState("");

    // Estados separados para descargar el PDF solamente cuando se solicita.
    const [downloading, setDownloading] = useState(false);
    const [downloadError, setDownloadError] = useState("");

    // Elemento al que dirigimos el foco cuando seleccionamos una canción.
    const readerRef = useRef(null);

    // Cancelamos una petición de lectura si el miembro cambia de canción.
    const detailRequestRef = useRef(null);

    // Cancelamos una descarga si el miembro cierra el lector.
    const downloadRequestRef = useRef(null);

    // Retrasamos la búsqueda para evitar solicitar en cada pulsación.
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchTerm(searchInput.trim());
            setPage(1);
        }, 300);

        // Cancelamos el temporizador si el usuario sigue escribiendo.
        return () => clearTimeout(timer);
    }, [searchInput]);

    // Recuperamos el catálogo cada vez que cambian los filtros o la página.
    useEffect(() => {
        const controller = new AbortController();

        async function loadSongs() {
            setLoading(true);
            setLoadError("");

            try {
                // El backend busca títulos y autores usando solo metadatos.
                const response = await api.get("/songbook/songs", {
                    params: {
                        q: searchTerm,
                        category,
                        page,
                    },
                    signal: controller.signal,
                });

                // Validamos el formato recibido antes de renderizar.
                if (!Array.isArray(response.data?.songs)) {
                    throw new Error("La API devolvió un listado inválido.");
                }

                // Actualizamos resultados únicamente si la petición sigue activa.
                if (!controller.signal.aborted) {
                    setSongs(response.data.songs);
                    setTotal(response.data.total || 0);
                    setPages(response.data.pages || 1);
                }
            } catch (error) {
                if (controller.signal.aborted) return;
                setLoadError(getErrorMessage(error, "No fue posible cargar el cancionero."));
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }

        loadSongs();
        return () => controller.abort();
    }, [searchTerm, category, page, reloadKey]);

    // Interrumpimos las solicitudes si el miembro abandona esta página.
    useEffect(() => {
        return () => {
            detailRequestRef.current?.abort();
            downloadRequestRef.current?.abort();
        };
    }, []);

    // Cargamos la letra como texto, sin solicitar ni descargar el PDF.
    async function openSong(song) {
        // Evitamos mezclar resultados de una canción con otra.
        detailRequestRef.current?.abort();
        downloadRequestRef.current?.abort();

        // Creamos una petición cancelable para el TXT seleccionado.
        const controller = new AbortController();
        detailRequestRef.current = controller;

        // Mostramos la información de la canción mientras carga la letra.
        setSelectedSong(song);
        setLyrics("");
        setReading(true);
        setReadingError("");
        setDownloading(false);
        setDownloadError("");

        // En pantallas pequeñas desplazamos la vista al lector.
        // El lector permanece debajo del listado en tablets y teléfonos.
        if (window.matchMedia("(max-width: 950px)").matches) {
            const reducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;

            requestAnimationFrame(() => {
                readerRef.current?.scrollIntoView({
                    behavior: reducedMotion ? "auto" : "smooth",
                    block: "start",
                });
            });
        }

        try {
            // Express comprueba la sesión antes de consultar el TXT en Drive.
            const response = await api.get(
                `/songbook/songs/${encodeURIComponent(song._id)}/lyrics`,
                { signal: controller.signal, timeout: 20000 }
            );

            // No confiamos en respuestas que no contengan texto legible.
            if (
                typeof response.data?.lyrics !== "string" ||
                !response.data.lyrics.trim()
            ) {
                throw new Error("La letra de esta canción no está disponible.");
            }

            // Ignoramos resultados de peticiones que fueron canceladas.
            if (controller.signal.aborted) return;

            // Conservamos saltos de línea y estrofas sin interpretar HTML.
            setLyrics(response.data.lyrics);

            // Hacemos accesible el nuevo contenido a la navegación por teclado.
            readerRef.current?.focus({ preventScroll: true });
        } catch (error) {
            // No mostramos errores si el miembro cambió de canción.
            if (controller.signal.aborted) return;

            // Informamos los problemas reales de la lectura.
            setReadingError(
                getErrorMessage(error, "No fue posible cargar la letra de la canción.")
            );
        } finally {
            // Finalizamos la carga únicamente para la canción aún seleccionada.
            if (!controller.signal.aborted) setReading(false);
        }
    }

    // Cerramos la canción y cancelamos solicitudes todavía activas.
    function closeReader() {
        // Cerramos consultas o descargas pendientes.
        detailRequestRef.current?.abort();
        downloadRequestRef.current?.abort();

        // Limpiamos el panel de lectura sin modificar el tamaño elegido.
        setSelectedSong(null);
        setLyrics("");
        setReading(false);
        setReadingError("");
        setDownloading(false);
        setDownloadError("");
    }

    // Aumentamos o reducimos el tamaño respetando límites accesibles.
    function changeLyricsFontSize(delta) {
        setLyricsFontSize((current) =>
            Math.min(MAX_LYRICS_SIZE, Math.max(MIN_LYRICS_SIZE, current + delta))
        );
    }

    // Descargamos el PDF privado solamente cuando el miembro lo solicita.
    async function downloadSelectedSong() {
        // No descargamos sin una canción o durante otra descarga activa.
        if (!selectedSong || downloading) return;

        // Guardamos la canción actual antes de iniciar la petición.
        const song = selectedSong;

        // Creamos un controlador para poder cancelar la operación.
        const controller = new AbortController();
        downloadRequestRef.current?.abort();
        downloadRequestRef.current = controller;

        // Informamos el estado de la descarga en el botón.
        setDownloading(true);
        setDownloadError("");

        try {
            // El PDF continúa protegido por la autenticación del backend.
            const response = await api.get(
                `/songbook/songs/${encodeURIComponent(song._id)}/pdf`,
                {
                    params: { download: 1 },
                    responseType: "blob",
                    signal: controller.signal,
                    timeout: 45000,
                }
            );

            // No iniciamos la descarga si se cambió de canción.
            if (controller.signal.aborted) return;

            // Creamos una URL local efímera a partir del PDF recibido.
            const blob = new Blob([response.data], { type: "application/pdf" });
            const objectUrl = URL.createObjectURL(blob);

            // Normalizamos el nombre del archivo descargado.
            const filename = `${song.title.replace(/[\\/:*?"<>|]/g, "").slice(0, 80) || "Cancion"}.pdf`;

            // Disparamos una descarga nativa del navegador sin abrir Drive.
            const anchor = document.createElement("a");
            anchor.href = objectUrl;
            anchor.download = filename;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();

            // Liberamos la memoria del PDF después de iniciar la descarga.
            window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
        } catch (error) {
            // Cancelar por cierre o cambio no constituye un error visible.
            if (controller.signal.aborted) return;

            // Mostramos una explicación sencilla sin revelar Google Drive.
            setDownloadError(
                getErrorMessage(error, "No fue posible descargar el PDF. Inténtalo nuevamente.")
            );
        } finally {
            // Restablecemos el botón si la petición no se canceló.
            if (!controller.signal.aborted) setDownloading(false);
        }
    }

    // Reiniciamos todos los controles de búsqueda.
    function clearFilters() {
        setSearchInput("");
        setSearchTerm("");
        setCategory("Todos");
        setPage(1);
    }

    // Presentamos la página sin repetir Header, Footer ni botón Volver.
    return (
        <main className="songbook-page">
            {/* Encabezado con la paleta institucional. */}
            <section
                className="songbook-hero"
                style={{ "--songbook-hero-image": `url("${bibliaImage}")` }}
            >
                <div className="songbook-hero__container">
                    <span className="songbook-hero__eyebrow">Música que acompaña nuestra fe</span>
                    <h1>Cancionero de alabanzas</h1>
                    <p>
                        Encuentra las letras que compartimos como comunidad.
                        Busca por título o autor y lee las letras directamente aquí, con el tamaño que prefieras.
                    </p>
                </div>
                <div className="songbook-hero__curve" aria-hidden="true" />
            </section>

            {/* Introducción a la consulta musical. */}
            <section className="songbook-intro">
                <div className="songbook-container songbook-intro__layout">
                    <div>
                        <span className="songbook-eyebrow">Un repertorio para nuestra comunidad</span>
                        <h2>Encuentra la letra que buscas</h2>
                        <p>
                            Consulta las canciones disponibles para acompañar tus
                            momentos de alabanza, oración y reunión.
                        </p>
                    </div>
                    <div className="songbook-intro__stat" aria-live="polite">
                        <Music2 aria-hidden="true" size={23} />
                        <strong>{loading ? "—" : total}</strong>
                        <span>Canciones encontradas</span>
                    </div>
                </div>
            </section>

            {/* Controles de búsqueda y selección de categorías. */}
            <section className="songbook-search-section">
                <div className="songbook-container">
                    <div className="songbook-search-heading">
                        <span className="songbook-eyebrow">Explorar cancionero</span>
                        <h2>Busca y descubre canciones</h2>
                    </div>

                    <div className="songbook-search-field">
                        <Search size={21} aria-hidden="true" />
                        <input
                            type="search"
                            value={searchInput}
                            onChange={(event) => setSearchInput(event.target.value)}
                            placeholder="Buscar canción por título o autor..."
                            maxLength={80}
                            aria-label="Buscar canciones por título o autor"
                        />
                        {searchInput && (
                            <button
                                type="button"
                                onClick={() => setSearchInput("")}
                                aria-label="Limpiar búsqueda"
                            >
                                <X size={17} aria-hidden="true" />
                            </button>
                        )}
                    </div>

                    <div className="songbook-filters" role="group" aria-label="Filtrar por categoría musical">
                        {SONG_CATEGORIES.map((item) => (
                            <button
                                key={item}
                                type="button"
                                onClick={() => {
                                    setCategory(item);
                                    setPage(1);
                                }}
                                className={category === item ? "songbook-filter songbook-filter--active" : "songbook-filter"}
                                aria-pressed={category === item}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Resultados y panel de lectura en la misma página. */}
            <section className="songbook-results-section">
                <div className="songbook-container songbook-results-layout">
                    <div className="songbook-results">
                        <div className="songbook-results__heading">
                            <h2>Listado de canciones</h2>
                            <span aria-live="polite">{loading ? "Buscando..." : `${total} resultado${total === 1 ? "" : "s"}`}</span>
                        </div>

                        {/* Estado de carga mientras llega la respuesta. */}
                        {loading && (
                            <div className="songbook-state" role="status">
                                <RefreshCw size={26} aria-hidden="true" />
                                <p>Cargando canciones...</p>
                            </div>
                        )}

                        {/* Error de la conexión con la API. */}
                        {!loading && loadError && (
                            <div className="songbook-state" role="alert">
                                <p>{loadError}</p>
                                <button type="button" onClick={() => setReloadKey((value) => value + 1)}>
                                    Intentar nuevamente
                                </button>
                            </div>
                        )}

                        {/* Estado vacío: todavía no hay canciones o filtros coincidentes. */}
                        {!loading && !loadError && songs.length === 0 && (
                            <div className="songbook-state">
                                <Music2 size={33} aria-hidden="true" />
                                <h3>{searchTerm || category !== "Todos" ? "No encontramos coincidencias" : "Pronto compartiremos nuestras canciones"}</h3>
                                <p>
                                    {searchTerm || category !== "Todos"
                                        ? "Prueba otra palabra o selecciona una categoría diferente."
                                        : "Cuando se publiquen las primeras letras, podrás encontrarlas aquí."}
                                </p>
                                {(searchTerm || category !== "Todos") && (
                                    <button type="button" onClick={clearFilters}>Limpiar filtros</button>
                                )}
                            </div>
                        )}

                        {/* Lista de canciones recibidas desde MongoDB. */}
                        {!loading && !loadError && songs.length > 0 && (
                            <div className="songbook-list">
                                {songs.map((song) => (
                                    <button
                                        key={song._id}
                                        type="button"
                                        onClick={() => openSong(song)}
                                        className={selectedSong?._id === song._id ? "songbook-song songbook-song--selected" : "songbook-song"}
                                    >
                                        <span className="songbook-song__icon"><Music2 size={22} aria-hidden="true" /></span>
                                        <span className="songbook-song__info">
                                            <strong>{song.title}</strong>
                                            <small>{song.author || "Autor no indicado"}</small>
                                            <em>{song.category}</em>
                                        </span>
                                        <ChevronRight size={19} aria-hidden="true" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Paginación para mantener rápido el catálogo. */}
                        {!loading && !loadError && total > 0 && pages > 1 && (
                            <div className="songbook-pagination">
                                <button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>
                                    Anterior
                                </button>
                                <span>Página {page} de {pages}</span>
                                <button type="button" disabled={page >= pages} onClick={() => setPage((value) => value + 1)}>
                                    Siguiente
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Lector accesible de texto; no exponemos enlaces públicos de Drive. */}
                    <article
                        className="songbook-reader"
                        aria-label="Letra de la canción seleccionada"
                        tabIndex={-1}
                        ref={readerRef}
                    >
                        {selectedSong ? (
                            <>
                                {/* Encabezado y cierre del lector. */}
                                <div className="songbook-reader__header">
                                    <span className="songbook-eyebrow">Letra de la canción</span>
                                    <button
                                        type="button"
                                        onClick={closeReader}
                                        aria-label="Cerrar letra de la canción"
                                    >
                                        <X size={20} aria-hidden="true" />
                                    </button>
                                </div>

                                {/* Metadatos obtenidos de MongoDB. */}
                                <span className="songbook-reader__category">{selectedSong.category}</span>
                                <h2>{selectedSong.title}</h2>
                                {selectedSong.author && (
                                    <p className="songbook-reader__author">{selectedSong.author}</p>
                                )}

                                {/* Ajustes de lectura; funcionan sin modificar el PDF. */}
                                <div className="songbook-reader__controls" role="group" aria-label="Ajustar tamaño de la letra">
                                    <span className="songbook-reader__controls-label">Tamaño de letra</span>

                                    <div className="songbook-reader__controls-actions">
                                        {/* Disminuimos el texto en pasos de dos píxeles. */}
                                        <button
                                            type="button"
                                            className="songbook-reader__size-button"
                                            onClick={() => changeLyricsFontSize(-LYRICS_SIZE_STEP)}
                                            disabled={lyricsFontSize <= MIN_LYRICS_SIZE}
                                            aria-label="Disminuir tamaño de letra"
                                            title="Disminuir tamaño de letra"
                                        >
                                            <Minus size={18} aria-hidden="true" />
                                            <span>A−</span>
                                        </button>

                                        {/* El tamaño actual también queda disponible a lectores de pantalla. */}
                                        <output className="songbook-reader__size-value" aria-live="polite">
                                            {lyricsFontSize} px
                                        </output>

                                        {/* Aumentamos el texto sin desbordar el ancho del móvil. */}
                                        <button
                                            type="button"
                                            className="songbook-reader__size-button"
                                            onClick={() => changeLyricsFontSize(LYRICS_SIZE_STEP)}
                                            disabled={lyricsFontSize >= MAX_LYRICS_SIZE}
                                            aria-label="Aumentar tamaño de letra"
                                            title="Aumentar tamaño de letra"
                                        >
                                            <Plus size={18} aria-hidden="true" />
                                            <span>A+</span>
                                        </button>

                                        {/* Recuperamos el tamaño inicial del lector. */}
                                        <button
                                            type="button"
                                            className="songbook-reader__reset-button"
                                            onClick={() => setLyricsFontSize(DEFAULT_LYRICS_SIZE)}
                                            disabled={lyricsFontSize === DEFAULT_LYRICS_SIZE}
                                            aria-label="Restablecer tamaño de letra"
                                        >
                                            <RotateCcw size={15} aria-hidden="true" />
                                            <span>Restablecer</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Estado de carga de la letra original. */}
                                {reading ? (
                                    <div className="songbook-reader__reading-state" role="status">
                                        <RefreshCw size={22} aria-hidden="true" />
                                        <span>Preparando la letra...</span>
                                    </div>
                                ) : readingError ? (
                                    <div className="songbook-reader__reading-state" role="alert">
                                        <span>{readingError}</span>
                                        <button type="button" onClick={() => openSong(selectedSong)}>
                                            Reintentar lectura
                                        </button>
                                    </div>
                                ) : (
                                    /* React presenta el TXT como texto seguro y conserva cada estrofa. */
                                    <div
                                        className="songbook-reader__lyrics"
                                        style={{ fontSize: `${lyricsFontSize}px` }}
                                    >
                                        {lyrics}
                                    </div>
                                )}

                                {/* El PDF solo se obtiene al presionar este botón. */}
                                <div className="songbook-reader__actions">
                                    <button
                                        type="button"
                                        className="songbook-reader__download"
                                        onClick={downloadSelectedSong}
                                        disabled={downloading}
                                    >
                                        <Download size={18} aria-hidden="true" />
                                        {downloading ? "Preparando descarga..." : "Descargar letra en PDF"}
                                    </button>
                                </div>

                                {/* Informamos errores de descarga sin cerrar la letra. */}
                                {downloadError && (
                                    <p className="songbook-reader__download-error" role="alert">
                                        {downloadError}
                                    </p>
                                )}
                            </>
                        ) : (
                            <div className="songbook-reader__empty">
                                <BookOpenText size={44} strokeWidth={1.3} aria-hidden="true" />
                                <h3>Selecciona una canción</h3>
                                <p>Presiona una canción del listado para leer su letra aquí, sin descargarla.</p>
                            </div>
                        )}
                    </article>
                </div>
            </section>

            {/* Mensaje final propio de la comunidad. */}
            <section className="songbook-closing">
                <div className="songbook-container">
                    <Music2 size={27} aria-hidden="true" />
                    <div>
                        <h2>Alabanzas para compartir</h2>
                        <p>Un espacio de consulta pensado para acompañar la música y la vida comunitaria de El Ancla.</p>
                    </div>
                </div>
            </section>
        </main>
    );
}

// Exportamos la página para registrarla en App.js.
export default Songbook;
