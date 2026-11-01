// =========================================================
// ADMINISTRACIÓN DEL CANCIONERO - IGLESIA EL ANCLA
// =========================================================

// React controla el listado, el formulario y el modal de eliminación.
import { useEffect, useState } from "react";

// Link permite consultar la vista real de los miembros.
import { Link } from "react-router-dom";

// Iconos compartidos por los módulos administrativos.
import { Music2, Plus, Search, Pencil, Trash2, X, AlertTriangle } from "lucide-react";

// API del proyecto: envía las cookies de sesión HttpOnly.
import api from "../../services/api";

// Estilos exclusivos de esta página administrativa.
import "../../styles/pages/administration/SongbookManagement.css";

// Mantener estas categorías alineadas con el esquema Song.js.
const SONG_CATEGORIES = ["General", "Alabanza", "Infantil"];

// Valores iniciales de un formulario nuevo.
const EMPTY_FORM = { title: "", author: "", category: "General", lyrics: "" };

// Obtiene un mensaje breve cuando la API responde con error.
function getErrorMessage(error, fallback) {
    return error?.response?.data?.message || error?.message || fallback;
}

// Módulo accesible desde los paneles admin y super_admin.
function SongbookManagement() {
    // Canciones recuperadas del servidor.
    const [songs, setSongs] = useState([]);

    // Filtros del catálogo administrativo.
    const [query, setQuery] = useState("");
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("Todos");
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [total, setTotal] = useState(0);

    // Estado de carga y errores del catálogo.
    const [loading, setLoading] = useState(true);
    const [listError, setListError] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

    // Datos que el administrador escribe o modifica.
    const [form, setForm] = useState(EMPTY_FORM);

    // Identificador de la canción editada o null para una nueva.
    const [editingId, setEditingId] = useState(null);

    // Indicadores de publicación o actualización.
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Canción cuya eliminación debe confirmarse.
    const [deletingSong, setDeletingSong] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    // Evitamos solicitudes de búsqueda en cada tecla.
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(query.trim());
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [query]);

    // Consultamos el repertorio al iniciar y al cambiar de filtros.
    useEffect(() => {
        const controller = new AbortController();

        async function loadSongs() {
            setLoading(true);
            setListError("");

            try {
                const response = await api.get("/songbook/songs", {
                    params: { q: search, category, page },
                    signal: controller.signal,
                });

                // Confirmamos la forma de la respuesta antes de guardar datos.
                if (!Array.isArray(response.data?.songs)) {
                    throw new Error("El servidor devolvió un catálogo inválido.");
                }

                if (!controller.signal.aborted) {
                    setSongs(response.data.songs);
                    setTotal(response.data.total || 0);
                    setPages(response.data.pages || 1);
                }
            } catch (error) {
                if (!controller.signal.aborted) {
                    setListError(getErrorMessage(error, "No se pudo cargar el cancionero."));
                }
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }

        loadSongs();
        return () => controller.abort();
    }, [search, category, page, refreshKey]);

    // Cambiamos un único campo sin perder los demás valores del formulario.
    function updateField(event) {
        const { name, value } = event.target;
        setForm((previous) => ({ ...previous, [name]: value }));
    }

    // Limpiamos el formulario para una publicación nueva.
    function resetForm() {
        setForm({ ...EMPTY_FORM });
        setEditingId(null);
        setFormError("");
    }

    // Obtenemos la letra completa cuando el administrador quiere editar.
    async function handleEdit(songId) {
        setFormError("");
        setSuccessMessage("");

        try {
            const response = await api.get(`/songbook/songs/${encodeURIComponent(songId)}/edit`);
            const song = response.data?.song;

            // Nos aseguramos de tener el texto necesario para editar.
            if (!song) throw new Error("No se encontraron los datos de la canción.");

            // Rellenamos el formulario con el registro existente.
            setEditingId(song._id);
            setForm({
                title: song.title || "",
                author: song.author || "",
                category: song.category || "General",
                lyrics: song.lyrics || "",
            });

            // Llevamos al usuario al formulario en pantallas largas.
            document.getElementById("songbook-admin-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
        } catch (error) {
            setFormError(getErrorMessage(error, "No fue posible abrir esta canción."));
        }
    }

    // Guardamos una nueva canción o los cambios de una existente.
    async function handleSubmit(event) {
        event.preventDefault();
        if (saving) return;

        // Validamos lo básico antes de enviar el formulario al backend.
        if (!form.title.trim() || !form.lyrics.trim()) {
            setFormError("El título y la letra son obligatorios.");
            return;
        }

        setSaving(true);
        setFormError("");
        setSuccessMessage("");

        try {
            // Se envía JSON porque las letras no son archivos adjuntos.
            const payload = {
                title: form.title.trim(),
                author: form.author.trim(),
                category: form.category,
                lyrics: form.lyrics.trim(),
            };

            // PATCH conserva el registro; POST crea uno nuevo.
            let result;
            if (editingId) {
                result = await api.patch(`/songbook/songs/${encodeURIComponent(editingId)}`, payload);
            } else {
                result = await api.post("/songbook/songs", payload);
            }

            // Informamos el resultado y renovamos el catálogo.
            setSuccessMessage(result?.data?.message || (editingId ? "Canción actualizada correctamente." : "Canción publicada correctamente."));
            resetForm();
            setRefreshKey((value) => value + 1);
        } catch (error) {
            setFormError(getErrorMessage(error, "No fue posible guardar la canción."));
        } finally {
            setSaving(false);
        }
    }

    // Abrimos el modal antes de permitir una eliminación irreversible.
    function requestDelete(song) {
        setDeletingSong(song);
        setDeleteError("");
        setSuccessMessage("");
    }

    // Eliminamos la canción y ambos archivos privados tras la confirmación expresa.
    async function confirmDelete() {
        if (!deletingSong || deleting) return;
        setDeleting(true);
        setDeleteError("");

        try {
            await api.delete(`/songbook/songs/${encodeURIComponent(deletingSong._id)}`);

            // Cerramos el modal y restablecemos el formulario si estaba editándose.
            if (editingId === deletingSong._id) resetForm();
            setDeletingSong(null);
            setSuccessMessage("Canción eliminada correctamente.");
            setPage(1);
            setRefreshKey((value) => value + 1);
        } catch (error) {
            setDeleteError(getErrorMessage(error, "No fue posible eliminar esta canción."));
        } finally {
            setDeleting(false);
        }
    }

    // Evitamos cerrar un modal mientras el servidor elimina el registro.
    function closeDeleteModal() {
        if (deleting) return;
        setDeletingSong(null);
        setDeleteError("");
    }

    return (
        <main className="songbook-admin">
            {/* Encabezado administrativo sin botón Volver duplicado. */}
            <header className="songbook-admin__header">
                <div>
                    <span className="songbook-admin__eyebrow">Gestión de contenidos</span>
                    <h1>Cancionero de alabanzas</h1>
                    <p>Escribe las letras de las canciones. El sistema generará automáticamente un PDF para los miembros.</p>
                </div>
                <Link to="/member/recursos/cancionero" className="songbook-admin__view-link">
                    <Music2 size={17} aria-hidden="true" /> Ver cancionero
                </Link>
            </header>

            {/* Formulario de alta y edición en la misma página. */}
            <section id="songbook-admin-form" className="songbook-admin__panel">
                <div className="songbook-admin__panel-heading">
                    <div>
                        <span className="songbook-admin__eyebrow">Repertorio de la iglesia</span>
                        <h2>{editingId ? "Editar canción" : "Publicar nueva canción"}</h2>
                    </div>
                    {editingId && <button className="songbook-admin__light-button" type="button" onClick={resetForm} disabled={saving}>Cancelar edición</button>}
                </div>

                {/* Mensajes accesibles del resultado de guardar. */}
                {formError && <div className="songbook-admin__alert songbook-admin__alert--error" role="alert">{formError}</div>}
                {successMessage && <div className="songbook-admin__alert songbook-admin__alert--success" role="status">{successMessage}</div>}

                <form className="songbook-admin-form" onSubmit={handleSubmit}>
                    <div className="songbook-admin-form__row">
                        <label>
                            <span>Título de la canción *</span>
                            <input name="title" value={form.title} onChange={updateField} maxLength={160} required placeholder="Ej.: Nombre de la alabanza" />
                        </label>
                        <label>
                            <span>Autor o intérprete (opcional)</span>
                            <input name="author" value={form.author} onChange={updateField} maxLength={160} placeholder="Nombre del autor o grupo" />
                        </label>
                    </div>
                    <label>
                        <span>Categoría *</span>
                        <select name="category" value={form.category} onChange={updateField} required>
                            {SONG_CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
                        </select>
                    </label>
                    <label>
                        <span>Letra de la canción *</span>
                        <textarea
                            name="lyrics"
                            value={form.lyrics}
                            onChange={updateField}
                            maxLength={15000}
                            required
                            rows={12}
                            placeholder={"Escribe aquí la letra...\n\nEstrofa 1\n...\n\nCoro\n..."}
                        />
                        <small>Utiliza saltos de línea para separar estrofas y coro. {form.lyrics.length}/15.000 caracteres. Publica únicamente letras con autorización para compartirlas.</small>
                    </label>
                    <div className="songbook-admin-form__actions">
                        <button className="songbook-admin__primary-button" type="submit" disabled={saving}>
                            {saving ? "Guardando..." : editingId ? "Guardar cambios" : <><Plus size={17} aria-hidden="true" /> Publicar canción</>}
                        </button>
                        {editingId && <button className="songbook-admin__light-button" type="button" onClick={resetForm} disabled={saving}>Cancelar</button>}
                    </div>
                </form>
            </section>

            {/* Listado administrativo con buscador y filtros. */}
            <section className="songbook-admin__panel songbook-admin__catalog">
                <div className="songbook-admin__panel-heading">
                    <div>
                        <span className="songbook-admin__eyebrow">Contenido disponible</span>
                        <h2>Canciones publicadas</h2>
                    </div>
                    <span className="songbook-admin__total">{total} canciones</span>
                </div>

                <div className="songbook-admin__toolbar">
                    <label className="songbook-admin__search">
                        <Search size={19} aria-hidden="true" />
                        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} maxLength={80} placeholder="Buscar por título o autor..." aria-label="Buscar canciones" />
                    </label>
                    <label className="songbook-admin__category-filter">
                        <span>Filtrar categoría</span>
                        <select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }}>
                            {["Todos", ...SONG_CATEGORIES].map((item) => <option key={item} value={item}>{item}</option>)}
                        </select>
                    </label>
                </div>

                {/* Mensajes del catálogo. */}
                {loading && <p className="songbook-admin__empty" role="status">Cargando canciones...</p>}
                {!loading && listError && <p className="songbook-admin__empty" role="alert">{listError}</p>}
                {!loading && !listError && songs.length === 0 && (
                    <div className="songbook-admin__empty">
                        <Music2 size={28} aria-hidden="true" />
                        <p>{query || category !== "Todos" ? "No hay canciones con esos filtros." : "Todavía no has publicado canciones."}</p>
                    </div>
                )}

                {/* Acciones Editar y Eliminar de cada registro. */}
                {!loading && !listError && songs.length > 0 && (
                    <div className="songbook-admin__list">
                        {songs.map((song) => (
                            <article key={song._id} className="songbook-admin__song">
                                <div className="songbook-admin__song-icon"><Music2 size={22} aria-hidden="true" /></div>
                                <div className="songbook-admin__song-info">
                                    <h3>{song.title}</h3>
                                    <p>{song.author || "Autor no indicado"}</p>
                                    <span>{song.category}</span>
                                </div>
                                <div className="songbook-admin__song-actions">
                                    <button type="button" className="songbook-admin__light-button" onClick={() => handleEdit(song._id)}>
                                        <Pencil size={16} aria-hidden="true" /> Editar
                                    </button>
                                    <button type="button" className="songbook-admin__delete-button" onClick={() => requestDelete(song)}>
                                        <Trash2 size={16} aria-hidden="true" /> Eliminar
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                {/* Paginación compartida con el catálogo de miembros. */}
                {!loading && !listError && pages > 1 && (
                    <div className="songbook-admin__pagination">
                        <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1}>Anterior</button>
                        <span>Página {page} de {pages}</span>
                        <button type="button" onClick={() => setPage((value) => Math.min(pages, value + 1))} disabled={page === pages}>Siguiente</button>
                    </div>
                )}
            </section>

            {/* Confirmación personalizada en vez de window.confirm. */}
            {deletingSong && (
                <div className="songbook-admin-modal__overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeDeleteModal(); }}>
                    <section className="songbook-admin-modal" role="alertdialog" aria-modal="true" aria-labelledby="songbook-delete-title" aria-describedby="songbook-delete-description">
                        <button className="songbook-admin-modal__close" type="button" onClick={closeDeleteModal} disabled={deleting} aria-label="Cerrar confirmación">
                            <X size={19} aria-hidden="true" />
                        </button>
                        <span className="songbook-admin-modal__warning"><AlertTriangle size={26} aria-hidden="true" /></span>
                        <h2 id="songbook-delete-title">¿Eliminar esta canción?</h2>
                        <p id="songbook-delete-description">Esta acción es <strong>irreversible</strong>. La letra dejará de estar disponible para los miembros.</p>
                        <div className="songbook-admin-modal__song">
                            <Music2 size={25} aria-hidden="true" />
                            <div><strong>{deletingSong.title}</strong><span>{deletingSong.author || "Autor no indicado"}</span></div>
                        </div>
                        {deleteError && <p className="songbook-admin__alert songbook-admin__alert--error" role="alert">{deleteError}</p>}
                        <div className="songbook-admin-modal__actions">
                            <button className="songbook-admin__light-button" type="button" onClick={closeDeleteModal} disabled={deleting}>Cancelar</button>
                            <button className="songbook-admin__delete-button" type="button" onClick={confirmDelete} disabled={deleting}>
                                {deleting ? "Eliminando..." : "Sí, eliminar canción"}
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </main>
    );
}

// Registramos esta página en las rutas administrativas compartidas.
export default SongbookManagement;
