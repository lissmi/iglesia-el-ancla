import { useEffect, useId, useRef, useState } from "react";

import {

    X,

    BookOpen,

    ExternalLink,

    FileDown,

    CalendarDays,

    UserRound,

    Link2,

    BookMarked,

    FileText,

} from "lucide-react";

import { RESOURCE_CATEGORIES } from "./ResourcesCategories";

import {

    getSafeResourceUrl,
} from "../../../utils/resourceMedia";

import "../../../styles/components/administration/resources/ResourceDetailsModal.css";

// =========================================================

// FUNCIONES AUXILIARES

// =========================================================

function formatDate(value) {

    if (!value) return "Sin fecha";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {

        return "Fecha no disponible";

    }

    return new Intl.DateTimeFormat("es-CL", {

        day: "2-digit",

        month: "long",

        year: "numeric",

        hour: "2-digit",

        minute: "2-digit",

    }).format(date);

}

// =========================================================

// COMPONENTE PRINCIPAL

// =========================================================

function ResourceDetailsModal({

    resource,

    onClose,

    onEdit,

}) {

    const titleId = useId();

    const modalRef = useRef(null);

    const closeRef = useRef(null);

    const [temporaryFileUrl, setTemporaryFileUrl] =

        useState(null);


    // =====================================================

    // ARCHIVO PDF TEMPORAL

    // =====================================================

    useEffect(() => {

        if (!(resource?.file instanceof File)) {

            setTemporaryFileUrl(null);

            return undefined;

        }

        const objectUrl = URL.createObjectURL(resource.file);

        setTemporaryFileUrl(objectUrl);

        return () => {

            URL.revokeObjectURL(objectUrl);

        };

    }, [resource]);

    // =====================================================

    // ACCESIBILIDAD

    // =====================================================

    useEffect(() => {

        if (!resource) return undefined;

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

                    'button:not(:disabled), a[href], input:not(:disabled)'

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

    }, [resource, onClose]);

    if (!resource) return null;

    // =====================================================

    // DATOS DEL RECURSO

    // =====================================================

    const category = RESOURCE_CATEGORIES.find(

        (item) => item.id === resource.category

    );

    const categoryName = category?.name || "Sin categoría";

    const isPublished = resource.status === "published";

    const resourceUrl = getSafeResourceUrl(resource.url);

    // URL temporal para descargar el PDF adjunto.
    const fileUrl = temporaryFileUrl;

    // INTERFAZ

    // =====================================================

    return (

        <div

            className="resource-details-modal__overlay"

            onMouseDown={(event) => {

                if (event.target === event.currentTarget) {

                    onClose?.();

                }

            }}

        >

            <section

                ref={modalRef}

                className="resource-details-modal"

                role="dialog"

                aria-modal="true"

                aria-labelledby={titleId}

            >

                {/* ======================================= */}

                {/* ENCABEZADO */}

                {/* ======================================= */}

                <header className="resource-details-modal__header">

                    <div>

                        <span className="resource-details-modal__eyebrow">

                            DETALLES DEL RECURSO

                        </span>

                        <h2 id={titleId}>

                            {resource.title}

                        </h2>

                        <div className="resource-details-modal__badges">

                            <span className="resource-details-modal__category">

                                {categoryName}

                            </span>

                            <span

                                className={

                                    "resource-details-modal__status " +

                                    (isPublished

                                        ? "resource-details-modal__status--published"

                                        : "resource-details-modal__status--draft")

                                }

                            >

                                {isPublished

                                    ? "Publicado"

                                    : "Borrador"}

                            </span>

                        </div>

                    </div>

                    <button

                        ref={closeRef}

                        type="button"

                        className="resource-details-modal__close"

                        onClick={onClose}

                        aria-label="Cerrar detalles"

                    >

                        <X size={20} />

                    </button>

                </header>

                {/* ======================================= */}

                {/* CONTENIDO */}

                {/* ======================================= */}

                <div className="resource-details-modal__body">

                    {/* DESCRIPCIÓN */}

                    <div className="resource-details-modal__section">

                        <h3>

                            <BookOpen size={18} />

                            Descripción

                        </h3>

                        <p>{resource.description}</p>

                    </div>

                    {/* INFORMACIÓN ADICIONAL */}

                    <div className="resource-details-modal__metadata">

                        {resource.author && (

                            <div className="resource-details-modal__metadata-item">

                                <UserRound size={17} />

                                <div>

                                    <span>Autor o responsable</span>

                                    <strong>{resource.author}</strong>

                                </div>

                            </div>

                        )}

                        {resource.reference && (

                            <div className="resource-details-modal__metadata-item">

                                <BookMarked size={17} />

                                <div>

                                    <span>Referencia bíblica</span>

                                    <strong>{resource.reference}</strong>

                                </div>

                            </div>

                        )}

                        <div className="resource-details-modal__metadata-item">

                            <CalendarDays size={17} />

                            <div>

                                <span>Fecha de creación</span>

                                <strong>

                                    {formatDate(resource.createdAt)}

                                </strong>

                            </div>

                        </div>

                        {resource.updatedAt && (

                            <div className="resource-details-modal__metadata-item">

                                <CalendarDays size={17} />

                                <div>

                                    <span>Última actualización</span>

                                    <strong>

                                        {formatDate(resource.updatedAt)}

                                    </strong>

                                </div>

                            </div>

                        )}

                    </div>

                    {/* CONTENIDO ESCRITO */}

                    {resource.content && (

                        <div className="resource-details-modal__section">

                            <h3>

                                <FileText size={18} />

                                {resource.category === "faq"

                                    ? "Respuesta"

                                    : "Contenido"}

                            </h3>

                            <div className="resource-details-modal__written">

                                {resource.content}

                            </div>

                        </div>

                    )}

                    {/* ENLACE EXTERNO */}

                    {resourceUrl && (

                        <div className="resource-details-modal__section">

                            <h3>

                                <Link2 size={18} />

                                Enlace del recurso

                            </h3>

                            <a

                                href={resourceUrl}

                                target="_blank"

                                rel="noopener noreferrer"

                                className="resource-details-modal__link"

                            >

                                <ExternalLink size={17} />

                                Abrir recurso externo

                            </a>

                        </div>

                    )}

                    {/* ARCHIVO PDF TEMPORAL */}

                    {resource.fileName && (

                        <div className="resource-details-modal__section">

                            <h3>

                                <FileDown size={18} />

                                Archivo adjunto

                            </h3>

                            <div className="resource-details-modal__file">

                                <div>

                                    <FileText size={21} />

                                    <span>

                                        {resource.fileName}

                                    </span>

                                </div>

                                {fileUrl ? (

                                    <a

                                        href={fileUrl}

                                        download={resource.fileName}

                                        className="resource-details-modal__download"

                                    >

                                        <FileDown size={16} />

                                        Descargar PDF

                                    </a>

                                ) : (

                                    <small>

                                        Archivo no disponible en esta sesión.

                                    </small>

                                )}

                            </div>

                        </div>

                    )}

                </div>

                {/* ======================================= */}

                {/* ACCIONES */}

                {/* ======================================= */}

                <footer className="resource-details-modal__footer">

                    <button

                        type="button"

                        className="resource-details-modal__secondary"

                        onClick={onClose}

                    >

                        Cerrar

                    </button>

                    <button

                        type="button"

                        className="resource-details-modal__primary"

                        onClick={() => onEdit?.(resource)}

                        disabled={!onEdit}

                    >

                        Editar recurso

                    </button>

                </footer>

            </section>

        </div>

    );

}

export default ResourceDetailsModal;
