
/* =========================================================
   ADMINISTRACIÓN DEL CANCIONERO - IGLESIA EL ANCLA
   Archivo: frontend/src/pages/administration/SongbookManagement.jsx
========================================================= */

// Hooks de React para controlar datos y formularios.
import { useEffect, useState } from "react";

// Navegación hacia el cancionero de miembros.
import { Link } from "react-router-dom";

// Iconos utilizados por la interfaz.
import {
    Music2,
    Plus,
    Search,
    Pencil,
    Trash2,
    X,
    AlertTriangle,
    ListFilter,
    ChevronDown,
    ExternalLink,
} from "lucide-react";

// Instancia Axios existente del proyecto.
import api from "../../services/api";

// Hoja de estilos administrativa.
import "../../styles/pages/administration/SongbookManagement.css";

// Categorías permitidas por el modelo Song.js.
const SONG_CATEGORIES = [
    "General",
    "Alabanza",
    "Infantil",
];

// Datos iniciales de una canción nueva.
const EMPTY_FORM = {
    title: "",
    author: "",
    category: "General",
    lyrics: "",

    // Enlace opcional a una pista de Spotify.
    spotifyUrl: "",
};

// Recuperamos los mensajes enviados desde el backend.
function getErrorMessage(error, fallback) {
    return (
        error?.response?.data?.message ||
        error?.message ||
        fallback
    );
}

// Componente administrativo compartido por admin y super_admin.
function SongbookManagement() {

    // =====================================================
    // CATÁLOGO DE CANCIONES
    // =====================================================

    // Canciones obtenidas desde MongoDB.
    const [songs, setSongs] = useState([]);

    // Texto que escribe el administrador.
    const [query, setQuery] = useState("");

    // Texto utilizado realmente para consultar la API.
    const [search, setSearch] = useState("");

    // Categoría seleccionada.
    const [category, setCategory] = useState("Todos");

    // Paginación del catálogo.
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [total, setTotal] = useState(0);

    // Estado de carga y errores del listado.
    const [loading, setLoading] = useState(true);
    const [listError, setListError] = useState("");

    // Permite renovar el catálogo después de guardar.
    const [refreshKey, setRefreshKey] = useState(0);

    // =====================================================
    // FORMULARIO DE CREACIÓN Y EDICIÓN
    // =====================================================

    // Almacena los datos de la canción.
    const [form, setForm] = useState({
        ...EMPTY_FORM,
    });

    // null significa crear; un ID significa editar.
    const [editingId, setEditingId] = useState(null);

    // Controlamos las solicitudes de guardado.
    const [saving, setSaving] = useState(false);

    // Mensajes del formulario.
    const [formError, setFormError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // =====================================================
    // ELIMINACIÓN DE CANCIONES
    // =====================================================

    // Canción seleccionada para eliminar.
    const [deletingSong, setDeletingSong] = useState(null);

    // Evita solicitudes de eliminación repetidas.
    const [deleting, setDeleting] = useState(false);

    // Error mostrado dentro del modal de eliminación.
    const [deleteError, setDeleteError] = useState("");

    // =====================================================
    // BÚSQUEDA CON RETARDO
    // =====================================================

    useEffect(() => {

        // Esperamos antes de consultar para no enviar
        // una solicitud por cada tecla escrita.
        const timer = setTimeout(() => {
            setSearch(query.trim());
            setPage(1);
        }, 300);

        // Cancelamos el temporizador anterior.
        return () => clearTimeout(timer);

    }, [query]);

    // =====================================================
    // CONSULTAR CANCIONES EN EL BACKEND
    // =====================================================

    useEffect(() => {

        // Permite cancelar la solicitud al desmontar.
        const controller = new AbortController();

        async function loadSongs() {

            // Activamos el indicador de carga.
            setLoading(true);
            setListError("");

            try {

                // Utilizamos la API existente.
                const response = await api.get(
                    "/songbook/songs",
                    {
                        params: {
                            q: search,
                            category,
                            page,
                        },
                        signal: controller.signal,
                    }
                );

                // Verificamos que el servidor devolvió un array.
                if (!Array.isArray(response.data?.songs)) {
                    throw new Error(
                        "El servidor devolvió un catálogo inválido."
                    );
                }

                // Actualizamos React si la solicitud sigue activa.
                if (!controller.signal.aborted) {
                    setSongs(response.data.songs);
                    setTotal(response.data.total || 0);
                    setPages(response.data.pages || 1);
                }

            } catch (error) {

                // Ignoramos solicitudes canceladas.
                if (!controller.signal.aborted) {
                    setListError(
                        getErrorMessage(
                            error,
                            "No se pudo cargar el cancionero."
                        )
                    );
                }

            } finally {

                // Finalizamos el estado de carga.
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        // Ejecutamos la consulta.
        loadSongs();

        // Cancelamos al desmontar o cambiar filtros.
        return () => controller.abort();

    }, [search, category, page, refreshKey]);

    // =====================================================
    // ACTUALIZAR CAMPOS DEL FORMULARIO
    // =====================================================

    function updateField(event) {

        // Obtenemos el nombre y el valor del input.
        const { name, value } = event.target;

        // Modificamos solamente el campo correspondiente.
        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    // =====================================================
    // RESTABLECER FORMULARIO
    // =====================================================

    function resetForm() {

        // Limpiamos todos los campos, incluido Spotify.
        setForm({ ...EMPTY_FORM });

        // Volvemos al modo de creación.
        setEditingId(null);

        // Retiramos mensajes de error anteriores.
        setFormError("");
    }

    // =====================================================
    // EDITAR UNA CANCIÓN
    // =====================================================

    async function handleEdit(songId) {

        // Limpiamos los mensajes anteriores.
        setFormError("");
        setSuccessMessage("");

        try {

            // Consultamos la letra original y sus metadatos.
            const response = await api.get(
                `/songbook/songs/${encodeURIComponent(songId)}/edit`
            );

            // Recuperamos la canción.
            const song = response.data?.song;

            // Comprobamos la respuesta del backend.
            if (!song) {
                throw new Error(
                    "No se encontraron los datos de la canción."
                );
            }

            // Activamos el modo de edición.
            setEditingId(song._id);

            // Rellenamos todos los campos existentes.
            setForm({
                title: song.title || "",
                author: song.author || "",
                category: song.category || "General",
                lyrics: song.lyrics || "",

                // Recuperamos Spotify cuando exista.
                spotifyUrl: song.spotifyUrl || "",
            });

            // Desplazamos la página hasta el formulario.
            document
                .getElementById("songbook-admin-form")
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });

        } catch (error) {

            // Informamos el problema sin perder el catálogo.
            setFormError(
                getErrorMessage(
                    error,
                    "No fue posible abrir esta canción."
                )
            );
        }
    }

    // =====================================================
    // GUARDAR CANCIÓN
    // =====================================================

    async function handleSubmit(event) {

        // Evitamos la recarga completa del navegador.
        event.preventDefault();

        // No permitimos guardar dos veces simultáneamente.
        if (saving) return;

        // Comprobamos los campos obligatorios.
        if (
            !form.title.trim() ||
            !form.lyrics.trim()
        ) {
            setFormError(
                "El título y la letra son obligatorios."
            );
            return;
        }

        // Activamos el estado de guardado.
        setSaving(true);
        setFormError("");
        setSuccessMessage("");

        try {

            // Construimos el JSON para el backend.
            const payload = {
                title: form.title.trim(),
                author: form.author.trim(),
                category: form.category,
                lyrics: form.lyrics.trim(),

                // Spotify es opcional.
                // Una cadena vacía permite quitar el enlace.
                spotifyUrl: form.spotifyUrl.trim(),
            };

            // Guardaremos la respuesta para mostrar su mensaje.
            let result;

            // Editamos si existe un identificador.
            if (editingId) {

                result = await api.patch(
                    `/songbook/songs/${encodeURIComponent(editingId)}`,
                    payload
                );

            } else {

                // Creamos una canción nueva.
                result = await api.post(
                    "/songbook/songs",
                    payload
                );
            }

            // Mostramos la confirmación del servidor.
            setSuccessMessage(
                result?.data?.message ||
                (
                    editingId
                        ? "Canción actualizada correctamente."
                        : "Canción publicada correctamente."
                )
            );

            // Limpiamos el formulario.
            resetForm();

            // Actualizamos la lista de canciones.
            setRefreshKey((value) => value + 1);

        } catch (error) {

            // Conservamos los datos escritos si falla el guardado.
            setFormError(
                getErrorMessage(
                    error,
                    "No fue posible guardar la canción."
                )
            );

        } finally {

            // Permitimos realizar nuevas operaciones.
            setSaving(false);
        }
    }

    // =====================================================
    // ABRIR MODAL DE ELIMINACIÓN
    // =====================================================

    function requestDelete(song) {

        // Guardamos la canción seleccionada.
        setDeletingSong(song);

        // Limpiamos mensajes anteriores.
        setDeleteError("");
        setSuccessMessage("");
    }

    // =====================================================
    // CONFIRMAR ELIMINACIÓN
    // =====================================================

    async function confirmDelete() {

        // No continuamos sin canción o durante otra eliminación.
        if (!deletingSong || deleting) return;

        // Activamos el estado de eliminación.
        setDeleting(true);
        setDeleteError("");

        try {

            // Eliminamos mediante el endpoint protegido.
            await api.delete(
                `/songbook/songs/${encodeURIComponent(deletingSong._id)}`
            );

            // Limpiamos el formulario si editábamos esa canción.
            if (editingId === deletingSong._id) {
                resetForm();
            }

            // Cerramos el diálogo.
            setDeletingSong(null);

            // Mostramos el resultado.
            setSuccessMessage(
                "Canción eliminada correctamente."
            );

            // Regresamos a la primera página.
            setPage(1);

            // Actualizamos el listado.
            setRefreshKey((value) => value + 1);

        } catch (error) {

            // Informamos cualquier problema de eliminación.
            setDeleteError(
                getErrorMessage(
                    error,
                    "No fue posible eliminar esta canción."
                )
            );

        } finally {

            // Desactivamos el estado de eliminación.
            setDeleting(false);
        }
    }

    // =====================================================
    // CERRAR MODAL
    // =====================================================

    function closeDeleteModal() {

        // Impedimos cerrar mientras se está eliminando.
        if (deleting) return;

        // Cerramos y limpiamos el modal.
        setDeletingSong(null);
        setDeleteError("");
    }

    // =====================================================
    // INTERFAZ
    // =====================================================

    return (
        <main className="songbook-admin">

            {/* ========================================== */}
            {/* ENCABEZADO */}
            {/* ========================================== */}

            <header className="songbook-admin__header">
                <div>
                    <span className="songbook-admin__eyebrow">
                        Gestión de contenidos
                    </span>

                    <h1>Cancionero de alabanzas</h1>

                    <p>
                        Escribe las letras de las canciones.
                        El sistema generará automáticamente
                        un PDF para los miembros.
                    </p>
                </div>

                <Link
                    to="/member/recursos/cancionero"
                    className="songbook-admin__view-link"
                >
                    <Music2 size={17} aria-hidden="true" />
                    Ver cancionero
                </Link>
            </header>

            {/* ========================================== */}
            {/* FORMULARIO DE CREACIÓN Y EDICIÓN */}
            {/* ========================================== */}

            <section
                id="songbook-admin-form"
                className="songbook-admin__panel"
            >

                <div className="songbook-admin__panel-heading">
                    <div>
                        <span className="songbook-admin__eyebrow">
                            Repertorio de la iglesia
                        </span>

                        <h2>
                            {editingId
                                ? "Editar canción"
                                : "Publicar nueva canción"}
                        </h2>
                    </div>

                    {editingId && (
                        <button
                            className="songbook-admin__light-button"
                            type="button"
                            onClick={resetForm}
                            disabled={saving}
                        >
                            Cancelar edición
                        </button>
                    )}
                </div>

                {/* Mensajes del formulario. */}

                {formError && (
                    <div
                        className="songbook-admin__alert songbook-admin__alert--error"
                        role="alert"
                    >
                        {formError}
                    </div>
                )}

                {successMessage && (
                    <div
                        className="songbook-admin__alert songbook-admin__alert--success"
                        role="status"
                    >
                        {successMessage}
                    </div>
                )}

                <form
                    className="songbook-admin-form"
                    onSubmit={handleSubmit}
                >

                    {/* Título y autor. */}

                    <div className="songbook-admin-form__row">

                        <label>
                            <span>Título de la canción *</span>

                            <input
                                name="title"
                                value={form.title}
                                onChange={updateField}
                                maxLength={160}
                                required
                                placeholder="Ej.: Nombre de la alabanza"
                            />
                        </label>

                        <label>
                            <span>Autor o intérprete (opcional)</span>

                            <input
                                name="author"
                                value={form.author}
                                onChange={updateField}
                                maxLength={160}
                                placeholder="Nombre del autor o grupo"
                            />
                        </label>
                    </div>

                    {/* Categoría de la canción. */}

                    <label>
                        <span>Categoría *</span>

                        <select
                            name="category"
                            value={form.category}
                            onChange={updateField}
                            required
                        >
                            {SONG_CATEGORIES.map((item) => (
                                <option
                                    key={item}
                                    value={item}
                                >
                                    {item}
                                </option>
                            ))}
                        </select>
                    </label>

                    {/* ================================== */}
                    {/* NUEVO CAMPO OPCIONAL DE SPOTIFY */}
                    {/* ================================== */}

                    <label className="songbook-admin-form__spotify-field">

                        <span>
                            Enlace de Spotify (opcional)
                        </span>

                        <input
                            // El navegador comprueba el formato URL.
                            type="url"

                            // Nombre conectado al estado del formulario.
                            name="spotifyUrl"

                            // Valor actual del campo.
                            value={form.spotifyUrl}

                            // Actualizamos el campo al escribir.
                            onChange={updateField}

                            // Límite compartido con el backend.
                            maxLength={300}

                            // Optimiza el teclado en teléfonos.
                            inputMode="url"

                            // Ejemplo del enlace esperado.
                            placeholder="https://open.spotify.com/track/..."

                            // Asocia la explicación al input.
                            aria-describedby="songbook-admin-spotify-help"
                        />

                        <small id="songbook-admin-spotify-help">
                            Pega el enlace de una pista de Spotify.
                            Los miembros podrán abrirla para escuchar.
                            Puedes dejar este campo vacío.
                        </small>

                    </label>

                    {/* Letra de la canción. */}

                    <label>
                        <span>Letra de la canción *</span>

                        <textarea
                            name="lyrics"
                            value={form.lyrics}
                            onChange={updateField}
                            maxLength={15000}
                            required
                            rows={12}
                            placeholder={
                                "Escribe aquí la letra...\n\nEstrofa 1\n...\n\nCoro\n..."
                            }
                        />

                        <small>
                            Utiliza saltos de línea para separar
                            estrofas y coro. {form.lyrics.length}/15.000
                            caracteres. Publica únicamente letras con
                            autorización para compartirlas.
                        </small>
                    </label>

                    {/* Botones de guardar y cancelar. */}

                    <div className="songbook-admin-form__actions">

                        <button
                            className="songbook-admin__primary-button"
                            type="submit"
                            disabled={saving}
                        >
                            {saving
                                ? "Guardando..."
                                : editingId
                                    ? "Guardar cambios"
                                    : (
                                        <>
                                            <Plus
                                                size={17}
                                                aria-hidden="true"
                                            />
                                            Publicar canción
                                        </>
                                    )}
                        </button>

                        {editingId && (
                            <button
                                className="songbook-admin__light-button"
                                type="button"
                                onClick={resetForm}
                                disabled={saving}
                            >
                                Cancelar
                            </button>
                        )}

                    </div>
                </form>
            </section>

            {/* ========================================== */}
            {/* CATÁLOGO DE CANCIONES */}
            {/* ========================================== */}

            <section className="songbook-admin__panel songbook-admin__catalog">

                <div className="songbook-admin__panel-heading">
                    <div>
                        <span className="songbook-admin__eyebrow">
                            Contenido disponible
                        </span>

                        <h2>Canciones publicadas</h2>
                    </div>

                    <span className="songbook-admin__total">
                        {total} canciones
                    </span>
                </div>

                {/* ====================================== */}
                {/* BÚSQUEDA Y FILTRO REDISEÑADO */}
                {/* ====================================== */}

                <div className="songbook-admin__toolbar">

                    {/* Buscador existente. */}

                    <label className="songbook-admin__search">

                        <Search
                            size={19}
                            aria-hidden="true"
                        />

                        <input
                            type="search"
                            value={query}
                            onChange={(event) =>
                                setQuery(event.target.value)
                            }
                            maxLength={80}
                            placeholder="Buscar por título o autor..."
                            aria-label="Buscar canciones"
                        />
                    </label>

                    {/* Selector nuevo con un solo contenedor visual. */}

                    <label className="songbook-admin__filter">

                        <ListFilter
                            size={18}
                            aria-hidden="true"
                            className="songbook-admin__filter-icon"
                        />

                        <select
                            value={category}
                            onChange={(event) => {
                                setCategory(event.target.value);
                                setPage(1);
                            }}
                            aria-label="Filtrar canciones por categoría"
                        >

                            <option value="Todos">
                                Todas las categorías
                            </option>

                            {SONG_CATEGORIES.map((item) => (
                                <option
                                    key={item}
                                    value={item}
                                >
                                    {item}
                                </option>
                            ))}

                        </select>

                        <ChevronDown
                            size={18}
                            aria-hidden="true"
                            className="songbook-admin__filter-chevron"
                        />

                    </label>
                </div>

                {/* ====================================== */}
                {/* MENSAJES DEL CATÁLOGO */}
                {/* ====================================== */}

                {loading && (
                    <p
                        className="songbook-admin__empty"
                        role="status"
                    >
                        Cargando canciones...
                    </p>
                )}

                {!loading && listError && (
                    <p
                        className="songbook-admin__empty"
                        role="alert"
                    >
                        {listError}
                    </p>
                )}

                {!loading && !listError && songs.length === 0 && (
                    <div className="songbook-admin__empty">

                        <Music2
                            size={28}
                            aria-hidden="true"
                        />

                        <p>
                            {query || category !== "Todos"
                                ? "No hay canciones con esos filtros."
                                : "Todavía no has publicado canciones."}
                        </p>

                    </div>
                )}

                {/* ====================================== */}
                {/* LISTADO DE CANCIONES */}
                {/* ====================================== */}

                {!loading && !listError && songs.length > 0 && (

                    <div className="songbook-admin__list">

                        {songs.map((song) => (

                            <article
                                key={song._id}
                                className="songbook-admin__song"
                            >

                                {/* Icono de la canción. */}

                                <div className="songbook-admin__song-icon">
                                    <Music2
                                        size={22}
                                        aria-hidden="true"
                                    />
                                </div>

                                {/* Información principal. */}

                                <div className="songbook-admin__song-info">

                                    <h3>{song.title}</h3>

                                    <p>
                                        {song.author || "Autor no indicado"}
                                    </p>

                                    <span>{song.category}</span>

                                    {/* Enlace opcional para comprobar Spotify. */}

                                    {song.spotifyUrl && (
                                        <a
                                            className="songbook-admin__spotify-preview"
                                            href={song.spotifyUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Escuchar en Spotify

                                            <ExternalLink
                                                size={13}
                                                aria-hidden="true"
                                            />
                                        </a>
                                    )}

                                </div>

                                {/* Acciones administrativas. */}

                                <div className="songbook-admin__song-actions">

                                    <button
                                        type="button"
                                        className="songbook-admin__light-button"
                                        onClick={() =>
                                            handleEdit(song._id)
                                        }
                                    >
                                        <Pencil
                                            size={16}
                                            aria-hidden="true"
                                        />
                                        Editar
                                    </button>

                                    <button
                                        type="button"
                                        className="songbook-admin__delete-button"
                                        onClick={() =>
                                            requestDelete(song)
                                        }
                                    >
                                        <Trash2
                                            size={16}
                                            aria-hidden="true"
                                        />
                                        Eliminar
                                    </button>

                                </div>
                            </article>
                        ))}
                    </div>
                )}

                {/* ====================================== */}
                {/* PAGINACIÓN */}
                {/* ====================================== */}

                {!loading && !listError && pages > 1 && (

                    <div className="songbook-admin__pagination">

                        <button
                            type="button"
                            onClick={() =>
                                setPage((value) =>
                                    Math.max(1, value - 1)
                                )
                            }
                            disabled={page === 1}
                        >
                            Anterior
                        </button>

                        <span>
                            Página {page} de {pages}
                        </span>

                        <button
                            type="button"
                            onClick={() =>
                                setPage((value) =>
                                    Math.min(pages, value + 1)
                                )
                            }
                            disabled={page === pages}
                        >
                            Siguiente
                        </button>

                    </div>
                )}

            </section>

            {/* ========================================== */}
            {/* MODAL DE ELIMINACIÓN */}
            {/* ========================================== */}

            {deletingSong && (

                <div
                    className="songbook-admin-modal__overlay"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeDeleteModal();
                        }
                    }}
                >

                    <section
                        className="songbook-admin-modal"
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="songbook-delete-title"
                        aria-describedby="songbook-delete-description"
                    >

                        {/* Cerrar modal. */}

                        <button
                            className="songbook-admin-modal__close"
                            type="button"
                            onClick={closeDeleteModal}
                            disabled={deleting}
                            aria-label="Cerrar confirmación"
                        >
                            <X
                                size={19}
                                aria-hidden="true"
                            />
                        </button>

                        {/* Icono de advertencia. */}

                        <span className="songbook-admin-modal__warning">
                            <AlertTriangle
                                size={26}
                                aria-hidden="true"
                            />
                        </span>

                        <h2 id="songbook-delete-title">
                            ¿Eliminar esta canción?
                        </h2>

                        <p id="songbook-delete-description">
                            Esta acción es <strong>irreversible</strong>.
                            La letra dejará de estar disponible
                            para los miembros.
                        </p>

                        {/* Canción que será eliminada. */}

                        <div className="songbook-admin-modal__song">

                            <Music2
                                size={25}
                                aria-hidden="true"
                            />

                            <div>
                                <strong>
                                    {deletingSong.title}
                                </strong>

                                <span>
                                    {deletingSong.author ||
                                        "Autor no indicado"}
                                </span>
                            </div>

                        </div>

                        {/* Error de eliminación. */}

                        {deleteError && (
                            <p
                                className="songbook-admin__alert songbook-admin__alert--error"
                                role="alert"
                            >
                                {deleteError}
                            </p>
                        )}

                        {/* Acciones del modal. */}

                        <div className="songbook-admin-modal__actions">

                            <button
                                className="songbook-admin__light-button"
                                type="button"
                                onClick={closeDeleteModal}
                                disabled={deleting}
                            >
                                Cancelar
                            </button>

                            <button
                                className="songbook-admin__delete-button"
                                type="button"
                                onClick={confirmDelete}
                                disabled={deleting}
                            >
                                {deleting
                                    ? "Eliminando..."
                                    : "Sí, eliminar canción"}
                            </button>

                        </div>

                    </section>
                </div>
            )}

        </main>
    );
}

// Exportamos el componente administrativo.
export default SongbookManagement;
