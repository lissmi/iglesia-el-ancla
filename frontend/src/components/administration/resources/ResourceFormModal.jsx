import { useEffect, useId, useRef, useState } from "react";

import {

    BookOpen,

    FileUp,

    FileText,

    Upload,

    Save,

    X,

} from "lucide-react";

import {

    RESOURCE_CATEGORIES,

} from "./ResourcesCategories";

import "../../../styles/components/administration/resources/ResourceFormModal.css";

// =========================================================

// VALORES INICIALES

// =========================================================

const EMPTY_FORM = {

    category: "",

    title: "",

    description: "",

    author: "",

    reference: "",

    content: "",
    url: "",

    status: "draft",

    file: null,

    fileName: "",

};

const CATEGORY_LABELS = Object.fromEntries(

    RESOURCE_CATEGORIES.map(({ id, name }) => [id, name])

);

const AUTHOR_CATEGORIES = [

    "studies", "devotionals", "discipleship", "prayer_guides",

];

const CONTENT_CATEGORIES = [

    "studies", "devotionals", "discipleship", "prayer_guides", "faq",

];

const FILE_CATEGORIES = [

    "studies", "devotionals", "discipleship", "prayer_guides", "downloads",

];

const LINK_CATEGORIES = [

    "bible", "studies", "devotionals", "discipleship", "prayer_guides", "downloads",

];

function isValidHttpUrl(value) {

    try {

        const url = new URL(value);

        return ["https:", "http:"].includes(url.protocol);

    } catch {

        return false;

    }

}

// =========================================================

// COMPONENTE PRINCIPAL

// =========================================================

function ResourceFormModal({

    isOpen,

    resource = null,

    onClose,

    onSave,

}) {

    const [form, setForm] = useState(EMPTY_FORM);

    const [errors, setErrors] = useState({});

    const modalRef = useRef(null);

    const closeRef = useRef(null);

    const titleId = useId();

    const isEditing = Boolean(resource);

    // =====================================================

    // INICIALIZACIÓN DEL FORMULARIO

    // =====================================================

    useEffect(() => {

        if (!isOpen) return;

        setForm(

            resource

                ? { ...EMPTY_FORM, ...resource }

                : { ...EMPTY_FORM }

        );

        setErrors({});

    }, [isOpen, resource]);

    // =====================================================

    // ACCESIBILIDAD DEL MODAL

    // =====================================================

    useEffect(() => {

        if (!isOpen) return undefined;

        const previousFocus = document.activeElement;

        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = "hidden";

        closeRef.current?.focus();

        function handleKeyDown(event) {

            if (event.key === "Escape") {

                event.preventDefault();

                onClose?.();

                return;

            }

            if (event.key !== "Tab") return;

            const focusable = Array.from(

                modalRef.current?.querySelectorAll(

                    'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href]'

                ) || []

            );

            if (!focusable.length) return;

            const first = focusable[0];

            const last = focusable[focusable.length - 1];

            if (

                event.shiftKey &&

                document.activeElement === first

            ) {

                event.preventDefault();

                last.focus();

            } else if (

                !event.shiftKey &&

                document.activeElement === last

            ) {

                event.preventDefault();

                first.focus();

            }

        }

        document.addEventListener("keydown", handleKeyDown);

        return () => {

            document.removeEventListener("keydown", handleKeyDown);

            document.body.style.overflow = previousOverflow;

            previousFocus?.focus?.();

        };

    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // =====================================================

    // ACTUALIZACIÓN DE CAMPOS

    // =====================================================

    function updateField(name, value) {

        setForm((previous) => ({

            ...previous,

            [name]: value,

        }));

        setErrors((previous) => ({

            ...previous,

            [name]: undefined,

        }));

    }

    function handleCategoryChange(category) {

        setForm((previous) => ({

            ...EMPTY_FORM,

            category,

            status: previous.status,

        }));

        setErrors({});

    }

    function handleFileChange(event) {

        const file = event.target.files?.[0];

        if (!file) return;

        const isPdf =

            file.type === "application/pdf" ||

            file.name.toLowerCase().endsWith(".pdf");

        if (!isPdf) {

            setErrors((previous) => ({

                ...previous,

                file: "Selecciona un archivo PDF válido.",

            }));

            event.target.value = "";

            return;

        }

        // Límite provisional para evitar almacenar

        // archivos excesivamente grandes en memoria.

        if (file.size > 10 * 1024 * 1024) {

            setErrors((previous) => ({

                ...previous,

                file: "El archivo no puede superar los 10 MB.",

            }));

            event.target.value = "";

            return;

        }

        setForm((previous) => ({

            ...previous,

            file,

            fileName: file.name,

        }));

        setErrors((previous) => ({

            ...previous,

            file: undefined,

        }));

    }

    // =====================================================

    // VALIDACIÓN

    // =====================================================

    function validate() {

        const nextErrors = {};

        if (!CATEGORY_LABELS[form.category]) {

            nextErrors.category = "Selecciona una categoría.";

        }

        if (!form.title.trim()) {

            nextErrors.title = "Ingresa el título del recurso.";

        }

        if (!form.description.trim()) {

            nextErrors.description = "Ingresa una descripción.";

        }

        if (form.category === "faq" && !form.content.trim()) {

            nextErrors.content = "Ingresa la respuesta.";

        }

        if ((form.url ?? "").trim() && !isValidHttpUrl((form.url ?? "").trim())) {

            nextErrors.url = "Ingresa una URL válida (https://).";

        }

        setErrors(nextErrors);

        return Object.keys(nextErrors).length === 0;

    }

    // =====================================================

    // GUARDADO

    // =====================================================

    function handleSubmit(event) {

        event.preventDefault();

        if (!validate()) return;

        const payload = {

            ...form,

            title: form.title.trim(),

            description: form.description.trim(),

            author: form.author.trim(),

            reference: form.reference.trim(),

            content: form.content.trim(),

            url: (form.url ?? "").trim(),

        };

        onSave?.(payload);

    }

    // =====================================================

    // CAMPOS CONDICIONALES

    // =====================================================

    const showAuthor = AUTHOR_CATEGORIES.includes(form.category);

    const showContent = CONTENT_CATEGORIES.includes(form.category);

    const showFile = FILE_CATEGORIES.includes(form.category);

    const showLink = LINK_CATEGORIES.includes(form.category);

    const showReference = [

        "bible", "studies", "devotionals", "discipleship", "prayer_guides",

    ].includes(form.category);

    return (

        <div

            className="resource-form-modal__overlay"

            onMouseDown={(event) => {

                if (event.target === event.currentTarget) {

                    onClose?.();

                }

            }}

        >

            <section

                ref={modalRef}

                className="resource-form-modal"

                role="dialog"

                aria-modal="true"

                aria-labelledby={titleId}

            >

                {/* ENCABEZADO */}

                <header className="resource-form-modal__header">

                    <div className="resource-form-modal__heading">

                        <span>ADMINISTRACIÓN DE CONTENIDOS</span>

                        <h2 id={titleId}>

                            {isEditing

                                ? "Editar recurso"

                                : "Nuevo recurso"}

                        </h2>

                        <p>

                            Completa la información del material

                            que estará disponible para la comunidad.

                        </p>

                    </div>

                    <button

                        ref={closeRef}

                        type="button"

                        className="resource-form-modal__close"

                        onClick={onClose}

                        aria-label="Cerrar formulario"

                    >

                        <X size={20} />

                    </button>

                </header>

                {/* FORMULARIO */}

                <form

                    className="resource-form-modal__form"

                    onSubmit={handleSubmit}

                    noValidate

                >

                    <div className="resource-form-modal__body">

                        <div className="resource-form-modal__section-title">

                            <BookOpen size={18} />

                            Información general

                        </div>

                        <div className="resource-form-modal__field">

                            <label htmlFor="resource-category">

                                Categoría *

                            </label>

                            <select

                                id="resource-category"

                                value={form.category}

                                onChange={(event) =>

                                    handleCategoryChange(event.target.value)

                                }

                                aria-invalid={Boolean(errors.category)}

                            >

                                <option value="">

                                    Seleccionar categoría

                                </option>

                                {RESOURCE_CATEGORIES.map((category) => (

                                    <option

                                        key={category.id}

                                        value={category.id}

                                    >

                                        {category.name}

                                    </option>

                                ))}

                            </select>

                            {errors.category && (

                                <small className="resource-form-modal__error">

                                    {errors.category}

                                </small>

                            )}

                        </div>

                        <div className="resource-form-modal__field">

                            <label htmlFor="resource-title">

                                {form.category === "faq"

                                    ? "Pregunta *"

                                    : "Título *"}

                            </label>

                            <input

                                id="resource-title"

                                type="text"

                                maxLength={160}

                                value={form.title}

                                onChange={(event) =>

                                    updateField("title", event.target.value)

                                }

                                placeholder="Nombre del recurso"

                                aria-invalid={Boolean(errors.title)}

                            />

                            {errors.title && (

                                <small className="resource-form-modal__error">

                                    {errors.title}

                                </small>

                            )}

                        </div>

                        <div className="resource-form-modal__field">

                            <label htmlFor="resource-description">

                                Descripción *

                            </label>

                            <textarea

                                id="resource-description"

                                rows={3}

                                maxLength={1000}

                                value={form.description}

                                onChange={(event) =>

                                    updateField(

                                        "description",

                                        event.target.value

                                    )

                                }

                                placeholder="Describe brevemente el contenido..."

                                aria-invalid={Boolean(errors.description)}

                            />

                            {errors.description && (

                                <small className="resource-form-modal__error">

                                    {errors.description}

                                </small>

                            )}

                        </div>

                        {form.category && (

                            <>

                                <div className="resource-form-modal__section-title">

                                    <FileUp size={18} />

                                    Datos específicos

                                </div>

                                <div className="resource-form-modal__grid">

                                    {showAuthor && (

                                        <div className="resource-form-modal__field">

                                            <label htmlFor="resource-author">

                                                Autor o responsable

                                            </label>

                                            <input

                                                id="resource-author"

                                                value={form.author}

                                                onChange={(event) =>

                                                    updateField(

                                                        "author",

                                                        event.target.value

                                                    )

                                                }

                                                placeholder="Nombre del autor"

                                            />

                                        </div>

                                    )}

                                    {showReference && (

                                        <div className="resource-form-modal__field">

                                            <label htmlFor="resource-reference">

                                                Referencia bíblica

                                            </label>

                                            <input

                                                id="resource-reference"

                                                value={form.reference}

                                                onChange={(event) =>

                                                    updateField(

                                                        "reference",

                                                        event.target.value

                                                    )

                                                }

                                                placeholder="Ej.: Salmos 23"

                                            />

                                        </div>

                                    )}

                                </div>

                                {showContent && (

                                    <div className="resource-form-modal__field">

                                        <label htmlFor="resource-content">

                                            {form.category === "faq"

                                                ? "Respuesta *"

                                                : form.category === "prayer_guides"

                                                    ? "Contenido de la guía de oración"

                                                    : "Contenido"}

                                        </label>

                                        <textarea

                                            id="resource-content"

                                            rows={5}

                                            value={form.content}

                                            onChange={(event) =>

                                                updateField(

                                                    "content",

                                                    event.target.value

                                                )

                                            }

                                            placeholder={form.category === "prayer_guides"

                                            ? "Escribe los pasos, motivos o indicaciones para la oración..."

                                            : "Escribe aquí el contenido..."}

                                        />

                                        {errors.content && (

                                            <small className="resource-form-modal__error">

                                                {errors.content}

                                            </small>

                                        )}

                                    </div>

                                )}

                                {showLink && (

                                    <div className="resource-form-modal__field">

                                        <label htmlFor="resource-url">

                                            Enlace del recurso

                                            </label>

                                        <input

                                            id="resource-url"

                                            type="url"

                                            value={form.url}

                                            onChange={(event) =>

                                                updateField(

                                                    "url",

                                                    event.target.value

                                                )

                                            }

                                            placeholder="https://..."

                                        />

                                        {errors.url && (

                                            <small className="resource-form-modal__error">

                                                {errors.url}

                                            </small>

                                        )}

                                    </div>

                                )}

                                {showFile && (

                                    <div className="resource-form-modal__field">

                                        <label htmlFor="resource-file">

                                            Archivo PDF

                                        </label>

                                        <div className="resource-form-modal__upload">

                                            <input

                                                id="resource-file"

                                                className="resource-form-modal__file-input"

                                                type="file"

                                                accept=".pdf,application/pdf"

                                                onChange={handleFileChange}

                                            />

                                            <label

                                                htmlFor="resource-file"

                                                className="resource-form-modal__upload-area"

                                            >

                                                <div className="resource-form-modal__upload-icon">

                                                    {form.fileName ? (

                                                        <FileText size={25} />

                                                    ) : (

                                                        <FileUp size={25} />

                                                    )}

                                                </div>

                                                <strong>

                                                    {form.fileName

                                                        ? "Archivo seleccionado"

                                                        : "Adjuntar archivo PDF"}

                                                </strong>

                                                <span>

                                                    {form.fileName

                                                        ? form.fileName

                                                        : "Selecciona un documento desde tu computador."}

                                                </span>

                                                <span className="resource-form-modal__upload-button">

                                                    <Upload size={16} />

                                                    {form.fileName

                                                        ? "Cambiar archivo"

                                                        : "Seleccionar archivo"}

                                                </span>

                                                <small>

                                                    Formato PDF · Máximo 10 MB

                                                </small>

                                            </label>

                                        </div>

                                        <small className="resource-form-modal__hint">

                                            El documento se conservará temporalmente

                                            en memoria hasta conectar el almacenamiento.

                                        </small>

                                        {errors.file && (

                                            <small className="resource-form-modal__error">

                                                {errors.file}

                                            </small>

                                        )}

                                    </div>

                                )}

                            </>

                        )}

                        <div className="resource-form-modal__section-title">

                            <Save size={18} />

                            Publicación

                        </div>

                        <div className="resource-form-modal__field">

                            <label htmlFor="resource-status">

                                Estado del recurso

                            </label>

                            <select

                                id="resource-status"

                                value={form.status}

                                onChange={(event) =>

                                    updateField(

                                        "status",

                                        event.target.value

                                    )

                                }

                            >

                                <option value="draft">

                                    Borrador

                                </option>

                                <option value="published">

                                    Publicado

                                </option>

                            </select>

                            <small className="resource-form-modal__hint">

                                Los borradores no se mostrarán a los

                                miembros registrados.

                            </small>

                        </div>

                    </div>

                    {/* ACCIONES */}

                    <footer className="resource-form-modal__footer">

                        <button

                            type="button"

                            className="resource-form-modal__cancel"

                            onClick={onClose}

                        >

                            Cancelar

                        </button>

                        <button

                            type="submit"

                            className="resource-form-modal__save"

                        >

                            <Save size={17} />

                            {isEditing

                                ? "Guardar cambios"

                                : "Guardar recurso"}

                        </button>

                    </footer>

                </form>

            </section>

        </div>

    );

}

export default ResourceFormModal;
