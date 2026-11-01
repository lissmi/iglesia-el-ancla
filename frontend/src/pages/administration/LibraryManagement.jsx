// =========================================================
// BIBLIOTECA SOLIDARIA - GESTIÓN ADMINISTRATIVA (CRUD)
// IGLESIA EL ANCLA
// =========================================================

// useState mantiene el catálogo, el formulario y sus estados.
// useEffect consulta los libros y administra la vista previa.
// useRef permite regresar al formulario cuando editamos un libro.
import { useEffect, useMemo, useRef, useState } from "react";

// Renderizamos el diálogo fuera de los contenedores del panel.
import { createPortal } from "react-dom";

// Link realiza navegación interna sin recargar React.
import { Link } from "react-router-dom";

// Utilizamos los iconos ya empleados en otros módulos.
import { AlertTriangle, BookOpen, ChevronDown, ChevronUp, LoaderCircle, Pencil, Search, Trash2, UploadCloud, X } from "lucide-react";

// Reutilizamos el cliente Axios con la cookie de sesión.
import api from "../../services/api";

// Preservamos los estilos existentes de la página administrativa.
import "../../styles/pages/administration/LibraryManagement.css";

// Agregamos únicamente los estilos complementarios del CRUD.
import "../../styles/pages/administration/LibraryManagementCrud.css";

// =========================================================
// CONFIGURACIÓN DE CATEGORÍAS Y FORMULARIO
// =========================================================

// Estas categorías coinciden con el enum del modelo Mongoose.
const LIBRARY_CATEGORIES = [
    "General",
    "Estudio bíblico",
    "Vida cristiana",
    "Devocionales",
    "Oración",
    "Discipulado",
    "Familia y comunidad",
    "Literatura infantil",
];

// Datos iniciales para crear una publicación nueva.
const INITIAL_FORM = {
    title: "",
    author: "",
    category: "General",
    description: "",
};

// Límites iguales a los que impone el backend.
const MAX_COVER_SIZE = 5 * 1024 * 1024;
const MAX_DOCUMENT_SIZE = 20 * 1024 * 1024;

// Formatos que admitimos en el selector de documentos.
const DOCUMENT_ACCEPT = ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

// Devuelve el mensaje enviado por la API cuando existe.
function getErrorMessage(error) {
    return error?.response?.data?.message ||
        "No se pudo completar la operación. Inténtalo nuevamente.";
}

// =========================================================
// AYUDAS PARA EL BUSCADOR DEL CATÁLOGO
// =========================================================

// Normalizamos tildes y mayúsculas para encontrar, por ejemplo,
// "oracion" aunque el título contenga "Oración".
function normalizeCatalogText(value) {
    return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("es")
        .trim();
}

// Evitamos mostrar una categoría vacía si algún libro antiguo
// no tiene asignada una categoría dentro de MongoDB.
function getBookCategory(book) {
    return book.category?.trim() || "General";
}

// Número de tarjetas iniciales por categoría para no saturar
// el panel cuando la biblioteca tenga decenas de publicaciones.
const BOOKS_PER_GROUP = 8;

// =========================================================
// DIÁLOGO DE CONFIRMACIÓN DE ELIMINACIÓN
// =========================================================

// Modal independiente y accesible para confirmar una acción destructiva.
function DeleteBookModal({ book, deleting, error, onCancel, onConfirm }) {
    // Referencia al cuadro para mantener el foco dentro del diálogo.
    const dialogRef = useRef(null);

    // Referencia al botón menos destructivo: cancelar.
    const cancelRef = useRef(null);

    // Conservamos los callbacks vigentes para el listener de teclado.
    const cancelCallbackRef = useRef(onCancel);
    cancelCallbackRef.current = onCancel;

    // Conservamos el estado actual, sin reinstalar los listeners.
    const deletingRef = useRef(deleting);
    deletingRef.current = deleting;

    // Gestionamos el foco, Escape, Tab y el desplazamiento del fondo.
    useEffect(() => {
        // Recordamos qué elemento tenía el foco antes de abrir el modal.
        const previousFocus = document.activeElement;

        // Evitamos que la página se desplace detrás del diálogo.
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        // Situamos el foco en Cancelar por seguridad.
        cancelRef.current?.focus();

        // Escuchamos únicamente las teclas relevantes para el diálogo.
        function handleKeyDown(event) {
            // No se puede cerrar el modal durante la solicitud DELETE.
            if (event.key === "Escape") {
                event.preventDefault();
                if (!deletingRef.current) cancelCallbackRef.current();
                return;
            }

            // Mantenemos el foco dentro del cuadro de confirmación.
            if (event.key !== "Tab") return;

            // Buscamos solo botones que permiten recibir el foco.
            const focusable = Array.from(
                dialogRef.current?.querySelectorAll("button:not(:disabled)") || []
            );

            // Si no hubiera controles disponibles, inmovilizamos Tab.
            if (focusable.length === 0) {
                event.preventDefault();
                return;
            }

            // Identificamos los extremos del recorrido de teclado.
            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            // Shift+Tab desde el primero vuelve al último.
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
                // Tab desde el último vuelve al primero.
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }

        // Activamos el control de teclado mientras existe el modal.
        document.addEventListener("keydown", handleKeyDown);

        // Restauramos la página al cerrar el diálogo.
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = originalOverflow;

            // Devolvemos el foco al botón original, si aún existe.
            if (previousFocus?.isConnected) {
                previousFocus.focus();
            } else {
                // Si la tarjeta fue eliminada, enfocamos el catálogo.
                document.getElementById("library-management-list-title")?.focus();
            }
        };
    }, []);

    // Portal: evita que estilos o transformaciones del layout tapen el modal.
    return createPortal(
        <div className="library-delete-modal__backdrop">
            <section
                ref={dialogRef}
                className="library-delete-modal"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="library-delete-modal-title"
                aria-describedby="library-delete-modal-description"
                aria-busy={deleting}
            >
                {/* Encabezado con icono de advertencia y cierre accesible. */}
                <div className="library-delete-modal__heading">
                    <span className="library-delete-modal__warning-icon" aria-hidden="true">
                        <AlertTriangle size={25} strokeWidth={1.8} />
                    </span>
                    <button
                        type="button"
                        className="library-delete-modal__close"
                        onClick={onCancel}
                        disabled={deleting}
                        aria-label="Cerrar confirmación de eliminación"
                    >
                        <X size={21} aria-hidden="true" />
                    </button>
                </div>

                {/* Mensaje principal de confirmación. */}
                <h2 id="library-delete-modal-title">
                    ¿Eliminar este libro?
                </h2>

                {/* Advertimos al administrador sobre la eliminación definitiva. */}
                <p
                    id="library-delete-modal-description"
                    className="library-delete-modal__description"
                >
                    Esta acción es <strong>irreversible</strong>.
                    El libro dejará de estar disponible para los miembros
                    y se eliminarán permanentemente su información,
                    imagen de portada y archivo adjunto.
                </p>

                {/* Libro exacto seleccionado para evitar borrar otro por error. */}
                <div className="library-delete-modal__book">
                    <img src={book.coverUrl} alt={`Portada de ${book.title}`} />
                    <div className="library-delete-modal__book-info">
                        <span>LIBRO SELECCIONADO</span>
                        <h3>{book.title}</h3>
                        <p>Por {book.author || "Autor no indicado"}</p>
                        <small>{getBookCategory(book)} · {book.document?.format?.toUpperCase() || "Documento"}</small>
                    </div>
                </div>

                {/* Informamos qué hacer si ocurre un problema. */}
                <p className="library-delete-modal__note">
                    Si ocurre un problema durante la eliminación,
                    podrás intentar completar la operación nuevamente.
                </p>

                {/* Los errores se muestran aquí sin cerrar el modal. */}
                {error && (
                    <div className="library-delete-modal__error" role="alert">
                        {error}
                    </div>
                )}

                {/* El administrador puede cancelar o confirmar explícitamente. */}
                <div className="library-delete-modal__actions">
                    <button
                        ref={cancelRef}
                        type="button"
                        className="library-delete-modal__cancel"
                        onClick={onCancel}
                        disabled={deleting}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        className="library-delete-modal__confirm"
                        aria-disabled={deleting}
                        onClick={() => { if (!deleting) onConfirm(); }}
                    >
                        {deleting ? (
                            <>
                                <LoaderCircle size={18} className="library-delete-modal__spinner" aria-hidden="true" />
                                Eliminando...
                            </>
                        ) : (
                            <>
                                <Trash2 size={17} aria-hidden="true" />
                                Sí, eliminar libro
                            </>
                        )}
                    </button>
                </div>
            </section>
        </div>,
        document.body
    );
}

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function LibraryManagement() {
    // Conservamos los libros publicados que devuelve MongoDB.
    const [books, setBooks] = useState([]);

    // Estado inicial de la consulta al abrir la página.
    const [loading, setLoading] = useState(true);

    // Permite reintentar la carga si falla la conexión.
    const [reloadKey, setReloadKey] = useState(0);

    // Impide enviar dos veces el formulario.
    const [saving, setSaving] = useState(false);

    // Identifica el libro que se está eliminando.
    const [deletingId, setDeletingId] = useState(null);

    // Libro que el administrador seleccionó para confirmar su eliminación.
    const [bookToDelete, setBookToDelete] = useState(null);

    // Error de eliminación mostrado dentro del modal, para poder reintentar.
    const [deleteError, setDeleteError] = useState("");

    // Es null al crear o contiene el ID al editar.
    const [editingId, setEditingId] = useState(null);

    // Guarda los campos de texto del libro.
    const [formValues, setFormValues] = useState({ ...INITIAL_FORM });

    // Archivo de portada elegido para crear o reemplazar.
    const [selectedCover, setSelectedCover] = useState(null);

    // Documento elegido para crear o reemplazar.
    const [selectedDocument, setSelectedDocument] = useState(null);

    // URL temporal para visualizar la nueva portada antes de guardar.
    const [coverPreview, setCoverPreview] = useState("");

    // Al cambiar esta clave se limpian los selectores de archivo.
    const [fileInputKey, setFileInputKey] = useState(0);

    // Mensaje visible de éxito, aviso o error.
    const [notice, setNotice] = useState(null);

    // Error exclusivo de la carga inicial del listado.
    const [loadError, setLoadError] = useState("");

    // Texto del buscador independiente del formulario de publicación.
    const [catalogSearch, setCatalogSearch] = useState("");

    // Categoría activa del catálogo; "all" muestra todas agrupadas.
    const [catalogCategory, setCatalogCategory] = useState("all");

    // Permite expandir una categoría con muchos libros publicados.
    const [expandedCategories, setExpandedCategories] = useState({});

    // Referencia al formulario para desplazarnos al editar.
    const formRef = useRef(null);

    // =====================================================
    // BÚSQUEDA, CATEGORÍAS Y AGRUPACIÓN DEL CATÁLOGO
    // =====================================================

    // Calculamos qué categorías tienen al menos un libro.
    const categoryCounts = useMemo(() => {
        const counts = new Map();

        for (const book of books) {
            const category = getBookCategory(book);
            counts.set(category, (counts.get(category) || 0) + 1);
        }

        return counts;
    }, [books]);

    // Respetamos el orden de las ocho categorías oficiales.
    // También mostramos cualquier categoría antigua que exista.
    const availableCategories = useMemo(() => {
        const official = LIBRARY_CATEGORIES.filter((category) =>
            categoryCounts.has(category)
        );

        const extras = [...categoryCounts.keys()]
            .filter((category) => !LIBRARY_CATEGORIES.includes(category))
            .sort((a, b) => a.localeCompare(b, "es"));

        return [...official, ...extras];
    }, [categoryCounts]);

    // Filtramos por categoría y por texto de forma simultánea.
    const filteredBooks = useMemo(() => {
        const search = normalizeCatalogText(catalogSearch);

        return books.filter((book) => {
            const category = getBookCategory(book);
            const matchesCategory =
                catalogCategory === "all" || category === catalogCategory;

            // Buscamos por título, autor, categoría o descripción.
            const searchableText = normalizeCatalogText([
                book.title,
                book.author,
                category,
                book.description,
            ].filter(Boolean).join(" "));

            const matchesSearch =
                search === "" || searchableText.includes(search);

            return matchesCategory && matchesSearch;
        });
    }, [books, catalogCategory, catalogSearch]);

    // Separamos los resultados en secciones, una por categoría.
    const groupedBooks = useMemo(() => {
        return availableCategories
            .map((category) => ({
                category,
                books: filteredBooks.filter(
                    (book) => getBookCategory(book) === category
                ),
            }))
            .filter((group) => group.books.length > 0);
    }, [availableCategories, filteredBooks]);

    // Cambiar de categoría restablece las expansiones anteriores.
    const handleCatalogCategoryChange = (event) => {
        setCatalogCategory(event.target.value);
        setExpandedCategories({});
    };

    // Actualizar la búsqueda vuelve a mostrar los primeros resultados.
    const handleCatalogSearchChange = (event) => {
        setCatalogSearch(event.target.value);
        setExpandedCategories({});
    };

    // Limpiamos ambos filtros sin afectar el formulario de libros.
    const clearCatalogFilters = () => {
        setCatalogSearch("");
        setCatalogCategory("all");
        setExpandedCategories({});
    };

    // Alternamos entre los primeros ocho libros y la categoría completa.
    const toggleCategoryExpansion = (category) => {
        setExpandedCategories((previous) => ({
            ...previous,
            [category]: !previous[category],
        }));
    };

    // Libro actualmente seleccionado en el modo edición.
    const editingBook = books.find((book) => book._id === editingId);

    // =====================================================
    // CONSULTAR LIBROS PUBLICADOS
    // =====================================================

    useEffect(() => {
        // Cancelamos la solicitud si el componente se desmonta.
        const controller = new AbortController();

        // Definimos la consulta asíncrona a nuestro backend.
        const loadBooks = async () => {
            setLoading(true);
            setLoadError("");

            try {
                // La ruta GET permite acceso a los roles administrativos.
                const response = await api.get("/library/books", {
                    signal: controller.signal,
                });

                // Verificamos que recibimos una lista válida.
                if (!Array.isArray(response.data?.books)) {
                    throw new Error("El servidor devolvió un catálogo inválido.");
                }

                // Actualizamos el listado mientras la petición esté activa.
                if (!controller.signal.aborted) {
                    setBooks(response.data.books);
                }
            } catch (error) {
                // Una cancelación normal no debe aparecer como error.
                if (!controller.signal.aborted) {
                    setLoadError(error?.response?.data?.message || error.message);
                }
            } finally {
                // Finalizamos el indicador de consulta.
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        // Realizamos la consulta inicial.
        loadBooks();

        // Liberamos cualquier solicitud pendiente.
        return () => controller.abort();
    }, [reloadKey]);

    // =====================================================
    // VISTA PREVIA DE PORTADA
    // =====================================================

    useEffect(() => {
        // Si no se eligió una portada nueva, no creamos una URL.
        if (!selectedCover) {
            setCoverPreview("");
            return;
        }

        // Creamos una URL local temporal para la imagen elegida.
        const objectUrl = URL.createObjectURL(selectedCover);
        setCoverPreview(objectUrl);

        // Liberamos memoria cuando se cambie la portada o se cierre.
        return () => URL.revokeObjectURL(objectUrl);
    }, [selectedCover]);

    // =====================================================
    // CONTROL DEL FORMULARIO
    // =====================================================

    // Actualizamos el campo de texto que el administrador modifica.
    const handleFieldChange = (event) => {
        const { name, value } = event.target;
        setFormValues((previous) => ({ ...previous, [name]: value }));
    };

    // Volvemos al modo creación y limpiamos archivos temporales.
    const resetForm = () => {
        setEditingId(null);
        setFormValues({ ...INITIAL_FORM });
        setSelectedCover(null);
        setSelectedDocument(null);
        setFileInputKey((current) => current + 1);
        formRef.current?.reset();
    };

    // Precargamos un libro en el formulario sin alterar sus archivos.
    const startEditing = (book) => {
        setEditingId(book._id);
        setFormValues({
            title: book.title || "",
            author: book.author || "",
            category: book.category || "General",
            description: book.description || "",
        });
        setSelectedCover(null);
        setSelectedDocument(null);
        setFileInputKey((current) => current + 1);
        setNotice(null);

        // Acercamos el formulario a la vista del administrador.
        requestAnimationFrame(() => {
            formRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        });
    };

    // Validamos el peso de la portada antes de enviarla.
    const handleCoverChange = (event) => {
        const file = event.target.files?.[0] || null;

        if (file && file.size > MAX_COVER_SIZE) {
            event.target.value = "";
            setSelectedCover(null);
            setNotice({ type: "error", text: "La portada no puede superar los 5 MB." });
            return;
        }

        setSelectedCover(file);
        setNotice(null);
    };

    // Validamos el tamaño del documento antes de enviarlo.
    const handleDocumentChange = (event) => {
        const file = event.target.files?.[0] || null;

        if (file && file.size > MAX_DOCUMENT_SIZE) {
            event.target.value = "";
            setSelectedDocument(null);
            setNotice({ type: "error", text: "El PDF o Word no puede superar los 20 MB." });
            return;
        }

        setSelectedDocument(file);
        setNotice(null);
    };

    // =====================================================
    // CREAR O ACTUALIZAR LIBRO
    // =====================================================

    const handleSubmit = async (event) => {
        // Impedimos que el formulario recargue la PWA.
        event.preventDefault();

        // Evitamos publicar si faltan archivos en un libro nuevo.
        if (!editingId && (!selectedCover || !selectedDocument)) {
            setNotice({
                type: "error",
                text: "Para publicar debes elegir una portada y un documento.",
            });
            return;
        }

        // Bloqueamos las acciones mientras se publica.
        setSaving(true);
        setNotice(null);

        // Creamos una solicitud multipart con los cuatro campos de texto.
        const formData = new FormData();
        formData.append("title", formValues.title.trim());
        formData.append("author", formValues.author.trim());
        formData.append("category", formValues.category);
        formData.append("description", formValues.description.trim());

        // Al editar, los archivos se envían SOLO si se reemplazan.
        if (selectedCover) formData.append("cover", selectedCover);
        if (selectedDocument) formData.append("document", selectedDocument);

        try {
            // PATCH modifica un libro; POST registra una nueva publicación.
            const response = editingId
                ? await api.patch(`/library/books/${editingId}`, formData, {
                    // Conservamos el tipo de solicitud usado por el formulario actual.
                    headers: { "Content-Type": "multipart/form-data" },
                    timeout: 120000,
                })
                : await api.post("/library/books", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                    timeout: 120000,
                });

            // Recuperamos el libro actualizado desde la respuesta del backend.
            const savedBook = response.data.book;

            if (editingId) {
                // Reemplazamos su tarjeta sin recargar toda la página.
                setBooks((current) => current.map((book) =>
                    book._id === savedBook._id ? savedBook : book
                ));
            } else {
                // Mostramos el nuevo libro al inicio del catálogo.
                setBooks((current) => [savedBook, ...current]);
            }

            // Conservamos un mensaje de éxito o advertencia de limpieza.
            setNotice({
                type: response.data.warning ? "warning" : "success",
                text: response.data.warning || response.data.message || "Cambios guardados.",
            });

            // Restablecemos el formulario para una nueva publicación.
            resetForm();
        } catch (error) {
            // Mostramos el error que devuelve la API.
            setNotice({ type: "error", text: getErrorMessage(error) });
        } finally {
            // Desbloqueamos los controles.
            setSaving(false);
        }
    };

    // =====================================================
    // ELIMINAR LIBRO CON CONFIRMACIÓN
    // =====================================================

    // Solo abrimos el modal al presionar el botón de una tarjeta.
    const requestDelete = (book) => {
        // No abrimos otro diálogo si existe una operación en progreso.
        if (saving || deletingId || bookToDelete) return;

        // Limpiamos errores anteriores y guardamos el libro seleccionado.
        setDeleteError("");
        setBookToDelete(book);
    };

    // Cancelamos la eliminación sin contactar al servidor.
    const cancelDelete = () => {
        // Evitamos cerrar el diálogo durante una eliminación real.
        if (deletingId) return;

        // Restablecemos el estado del modal.
        setBookToDelete(null);
        setDeleteError("");
    };

    // Solo esta función llama a DELETE, tras la confirmación explícita.
    const confirmDelete = async () => {
        // Evitamos doble clic o solicitudes simultáneas.
        if (!bookToDelete || deletingId || saving) return;

        // Conservamos el libro exacto seleccionado durante toda la petición.
        const book = bookToDelete;

        // Mostramos el estado de progreso y limpiamos el error del modal.
        setDeletingId(book._id);
        setDeleteError("");
        setNotice(null);

        try {
            // El backend comprueba la sesión y los permisos administrativos.
            const response = await api.delete(`/library/books/${book._id}`);

            // Solo quitamos la tarjeta cuando la API confirma el borrado.
            setBooks((current) => current.filter((item) => item._id !== book._id));

            // Si editábamos el mismo libro, abandonamos el modo edición.
            if (editingId === book._id) resetForm();

            // Notificamos la operación finalizada.
            setNotice({
                type: "success",
                text: response.data?.message || "Libro y archivos eliminados correctamente.",
            });

            // Cerramos el modal después de confirmar la eliminación.
            setBookToDelete(null);
        } catch (error) {
            // Si falla Cloudinary, Drive o MongoDB, conservamos el modal
            // y la tarjeta para que el administrador pueda reintentar.
            setDeleteError(getErrorMessage(error));
        } finally {
            // Liberamos las acciones independientemente del resultado.
            setDeletingId(null);
        }
    };

    // =====================================================
    // INTERFAZ ADMINISTRATIVA
    // =====================================================

    return (
        <main className="library-management">
            {/* Encabezado general del módulo administrativo. */}
            <header className="library-management__header">
                <div>
                    <p>Gestión de contenidos</p>
                    <h1>Biblioteca Solidaria</h1>
                    <p>Publica y administra los libros disponibles para nuestra comunidad.</p>
                </div>

                {/* Acceso a la misma biblioteca que visualizan los miembros. */}
                <Link to="/member/recursos/biblioteca-solidaria">Ver biblioteca</Link>
            </header>

            {/* Anunciamos errores y operaciones completadas de forma accesible. */}
            {notice && (
                <div
                    className={`library-management__notice library-management__notice--${notice.type}`}
                    role={notice.type === "error" ? "alert" : "status"}
                >
                    {notice.text}
                </div>
            )}

            {/* Panel que permite crear o editar usando el mismo formulario. */}
            <section className="library-management__panel" aria-labelledby="library-management-form-title">
                <div className="library-management__panel-heading">
                    <div>
                        <h2 id="library-management-form-title">
                            {editingId ? "Editar libro publicado" : "Publicar nuevo libro"}
                        </h2>
                        <p>
                            {editingId
                                ? "Actualiza los datos. Solo selecciona archivos nuevos si deseas reemplazarlos."
                                : "Completa los datos y adjunta la portada y el documento."}
                        </p>
                    </div>
                    {/* Acción para abandonar la edición. */}
                    {editingId && (
                        <button
                            type="button"
                            className="library-management__cancel-top"
                            onClick={resetForm}
                            disabled={saving}
                        >
                            <X size={16} aria-hidden="true" /> Cancelar edición
                        </button>
                    )}
                </div>

                {/* Formulario multipart; los campos de texto están controlados. */}
                <form ref={formRef} onSubmit={handleSubmit}>
                    {/* Título obligatorio del libro. */}
                    <label htmlFor="library-book-title">
                        Título del libro
                        <input
                            id="library-book-title"
                            name="title"
                            type="text"
                            value={formValues.title}
                            onChange={handleFieldChange}
                            maxLength={150}
                            placeholder="Escribe el título"
                            disabled={saving}
                            required
                        />
                    </label>

                    {/* Autor obligatorio. */}
                    <label htmlFor="library-book-author">
                        Autor del libro
                        <input
                            id="library-book-author"
                            name="author"
                            type="text"
                            value={formValues.author}
                            onChange={handleFieldChange}
                            maxLength={120}
                            placeholder="Nombre del autor"
                            disabled={saving}
                            required
                        />
                    </label>

                    {/* Categorías predefinidas para evitar nombres duplicados. */}
                    <label htmlFor="library-book-category">
                        Categoría del libro
                        <select
                            id="library-book-category"
                            name="category"
                            value={formValues.category}
                            onChange={handleFieldChange}
                            disabled={saving}
                            required
                        >
                            {LIBRARY_CATEGORIES.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </label>

                    {/* Descripción opcional del libro. */}
                    <label htmlFor="library-book-description">
                        Descripción
                        <textarea
                            id="library-book-description"
                            name="description"
                            rows={4}
                            maxLength={1000}
                            value={formValues.description}
                            onChange={handleFieldChange}
                            placeholder="Breve descripción del libro"
                            disabled={saving}
                        />
                    </label>

                    {/* Portada obligatoria solo al publicar un libro nuevo. */}
                    <label htmlFor="library-book-cover">
                        {editingId ? "Reemplazar portada (opcional)" : "Imagen de portada"}
                        <input
                            key={`cover-${fileInputKey}`}
                            id="library-book-cover"
                            name="cover"
                            type="file"
                            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                            onChange={handleCoverChange}
                            disabled={saving}
                            required={!editingId}
                        />
                        <small>JPG, PNG o WebP. Máximo 5 MB.</small>
                    </label>

                    {/* Documento obligatorio solo en el modo creación. */}
                    <label htmlFor="library-book-document">
                        {editingId ? "Reemplazar documento (opcional)" : "Archivo del libro (PDF o Word)"}
                        <input
                            key={`document-${fileInputKey}`}
                            id="library-book-document"
                            name="document"
                            type="file"
                            accept={DOCUMENT_ACCEPT}
                            onChange={handleDocumentChange}
                            disabled={saving}
                            required={!editingId}
                        />
                        <small>PDF, DOC o DOCX. Máximo 20 MB.</small>
                        {editingId && (
                            <small>Documento actual: {editingBook?.document?.format?.toUpperCase() || "Disponible"}</small>
                        )}
                    </label>

                    {/* Mostramos la portada seleccionada o la portada vigente. */}
                    {(coverPreview || editingBook?.coverUrl) && (
                        <div className="library-management__cover-preview">
                            <img
                                src={coverPreview || editingBook.coverUrl}
                                alt="Vista previa de la portada"
                            />
                            <span>{coverPreview ? "Nueva portada seleccionada" : "Portada actual"}</span>
                        </div>
                    )}

                    {/* Acciones principales del formulario. */}
                    <div className="library-management__form-actions">
                        <button type="submit" disabled={saving || Boolean(deletingId)}>
                            <UploadCloud size={17} aria-hidden="true" />
                            {saving
                                ? "Guardando cambios..."
                                : editingId
                                    ? "Guardar cambios"
                                    : "Publicar libro"}
                        </button>
                        {editingId && (
                            <button type="button" onClick={resetForm} disabled={saving}>
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>
            </section>

            {/* ================================================= */}
            {/* CATÁLOGO ADMINISTRATIVO CON BÚSQUEDA Y CATEGORÍAS */}
            {/* ================================================= */}
            <section
                className="library-management__panel"
                aria-labelledby="library-management-list-title"
            >
                {/* Encabezado y contador general de publicaciones. */}
                <div className="library-management__panel-heading">
                    <div>
                        <h2 id="library-management-list-title" tabIndex={-1}>
                            Libros publicados ({books.length})
                        </h2>
                        <p>
                            Encuentra un libro por título o autor y administra
                            las publicaciones organizadas por categoría.
                        </p>
                    </div>
                </div>

                {/* Mostramos los filtros solo cuando hay libros disponibles. */}
                {!loading && !loadError && books.length > 0 && (
                    <>
                        {/* Herramientas independientes del formulario superior. */}
                        <div className="library-management__catalog-tools">
                            {/* Buscador con coincidencias sin distinguir tildes. */}
                            <div className="library-management__catalog-field">
                                <label htmlFor="library-catalog-search">
                                    Buscar libros
                                </label>

                                <div className="library-management__catalog-search">
                                    <Search
                                        size={19}
                                        className="library-management__catalog-search-icon"
                                        aria-hidden="true"
                                    />

                                    <input
                                        id="library-catalog-search"
                                        type="search"
                                        value={catalogSearch}
                                        onChange={handleCatalogSearchChange}
                                        placeholder="Título, autor o temática..."
                                        autoComplete="off"
                                    />

                                    {/* Permitimos borrar la búsqueda rápidamente. */}
                                    {catalogSearch && (
                                        <button
                                            type="button"
                                            className="library-management__catalog-clear-search"
                                            aria-label="Borrar búsqueda de libros"
                                            onClick={() => {
                                                setCatalogSearch("");
                                                setExpandedCategories({});
                                            }}
                                        >
                                            <X size={17} aria-hidden="true" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Selector que utiliza categorías publicadas. */}
                            <div className="library-management__catalog-field">
                                <label htmlFor="library-catalog-category">
                                    Filtrar por categoría
                                </label>

                                <select
                                    id="library-catalog-category"
                                    className="library-management__catalog-select"
                                    value={catalogCategory}
                                    onChange={handleCatalogCategoryChange}
                                >
                                    <option value="all">
                                        Todas las categorías ({books.length})
                                    </option>
                                    {availableCategories.map((category) => (
                                        <option key={category} value={category}>
                                            {category} ({categoryCounts.get(category)})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Resumen de los resultados de búsqueda y filtro. */}
                        <div className="library-management__catalog-summary">
                            <p aria-live="polite" aria-atomic="true">
                                <strong>{filteredBooks.length}</strong>{" "}
                                {filteredBooks.length === 1
                                    ? "libro encontrado"
                                    : "libros encontrados"}
                                {catalogCategory === "all"
                                    ? ` · ${groupedBooks.length} categorías`
                                    : ` · ${catalogCategory}`}
                            </p>

                            {(catalogSearch || catalogCategory !== "all") && (
                                <button
                                    type="button"
                                    className="library-management__catalog-reset"
                                    onClick={clearCatalogFilters}
                                >
                                    <X size={15} aria-hidden="true" />
                                    Limpiar filtros
                                </button>
                            )}
                        </div>
                    </>
                )}

                {/* Estado de carga o error de la API. */}
                {loading ? (
                    <p role="status">Cargando libros publicados...</p>
                ) : loadError ? (
                    <div className="library-management__load-error" role="alert">
                        <p>{loadError}</p>
                        <button
                            type="button"
                            onClick={() => setReloadKey((value) => value + 1)}
                        >
                            Reintentar
                        </button>
                    </div>
                ) : books.length === 0 ? (
                    // La biblioteca aún no tiene publicaciones.
                    <div className="library-management__empty">
                        <BookOpen size={35} strokeWidth={1.5} aria-hidden="true" />
                        <p>Todavía no hay libros publicados.</p>
                    </div>
                ) : filteredBooks.length === 0 ? (
                    // Existen libros, pero ninguno coincide con los filtros.
                    <div className="library-management__empty">
                        <Search size={35} strokeWidth={1.5} aria-hidden="true" />
                        <p>No encontramos libros con esos filtros.</p>
                        <button
                            type="button"
                            className="library-management__catalog-reset"
                            onClick={clearCatalogFilters}
                        >
                            Limpiar filtros
                        </button>
                    </div>
                ) : (
                    // Organizamos el catálogo en secciones independientes.
                    <div className="library-management__catalog-groups">
                        {groupedBooks.map(({ category, books: categoryBooks }) => {
                            // Por defecto mostramos solo los primeros ocho libros.
                            const expanded = Boolean(expandedCategories[category]);
                            const visibleBooks = expanded
                                ? categoryBooks
                                : categoryBooks.slice(0, BOOKS_PER_GROUP);

                            // Comprobamos si hay más libros que mostrar.
                            const hasMore = categoryBooks.length > BOOKS_PER_GROUP;

                            return (
                                <section
                                    key={category}
                                    className="library-management__category-section"
                                    aria-label={`Libros de ${category}`}
                                >
                                    {/* Título y contador de la categoría. */}
                                    <div className="library-management__category-heading">
                                        <div className="library-management__category-heading-title">
                                            <BookOpen size={20} strokeWidth={1.7} aria-hidden="true" />
                                            <h3>{category}</h3>
                                        </div>
                                        <span className="library-management__category-total">
                                            {categoryBooks.length}{" "}
                                            {categoryBooks.length === 1 ? "libro" : "libros"}
                                        </span>
                                    </div>

                                    {/* Tarjetas con las acciones CRUD existentes. */}
                                    <div className="library-management__grid">
                                        {visibleBooks.map((book) => (
                                            <article
                                                key={book._id}
                                                className="library-management__book-card"
                                            >
                                                {/* Portada almacenada en Cloudinary. */}
                                                <img
                                                    src={book.coverUrl}
                                                    alt={`Portada de ${book.title}`}
                                                    loading="lazy"
                                                />

                                                {/* Datos bibliográficos. */}
                                                <div className="library-management__book-info">
                                                    <span className="library-management__category">
                                                        {getBookCategory(book)}
                                                    </span>
                                                    <h3>{book.title}</h3>
                                                    <p>Por {book.author}</p>
                                                    <small>
                                                        Documento: {book.document?.format?.toUpperCase() || "Disponible"}
                                                    </small>
                                                </div>

                                                {/* Edición y eliminación sin modificar su API. */}
                                                <div className="library-management__book-actions">
                                                    <button
                                                        type="button"
                                                        className="library-management__edit-button"
                                                        onClick={() => startEditing(book)}
                                                        disabled={saving || Boolean(deletingId)}
                                                        aria-label={`Editar ${book.title}`}
                                                    >
                                                        <Pencil size={15} aria-hidden="true" />
                                                        Editar
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="library-management__delete-button"
                                                        onClick={() => requestDelete(book)}
                                                        disabled={saving || Boolean(deletingId)}
                                                        aria-label={`Eliminar ${book.title}`}
                                                    >
                                                        <Trash2 size={15} aria-hidden="true" />
                                                        {deletingId === book._id
                                                            ? "Eliminando..."
                                                            : "Eliminar"}
                                                    </button>
                                                </div>
                                            </article>
                                        ))}
                                    </div>

                                    {/* Evitamos mostrar 100 tarjetas al mismo tiempo. */}
                                    {hasMore && (
                                        <div className="library-management__category-more">
                                            <button
                                                type="button"
                                                onClick={() => toggleCategoryExpansion(category)}
                                                aria-expanded={expanded}
                                            >
                                                {expanded ? (
                                                    <ChevronUp size={17} aria-hidden="true" />
                                                ) : (
                                                    <ChevronDown size={17} aria-hidden="true" />
                                                )}
                                                {expanded
                                                    ? "Mostrar menos"
                                                    : `Ver ${categoryBooks.length - BOOKS_PER_GROUP} libros más`}
                                            </button>
                                        </div>
                                    )}
                                </section>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Portal del diálogo: se abre únicamente al seleccionar Eliminar. */}
            {bookToDelete && (
                <DeleteBookModal
                    book={bookToDelete}
                    deleting={deletingId === bookToDelete._id}
                    error={deleteError}
                    onCancel={cancelDelete}
                    onConfirm={confirmDelete}
                />
            )}
        </main>
    );
}

// Exportamos el componente para las rutas admin y superadmin.
export default LibraryManagement;
