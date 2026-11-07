import {
    BookOpen,
    NotebookTabs,
    Sun,
    GraduationCap,
    HandHeart,
    FileDown,
    CircleHelp,
    Eye,
    Pencil,
    Trash2,
    ExternalLink,
    FileDown as PdfDownloadIcon,
} from "lucide-react";

import "../../../styles/components/administration/resources/ResourceCard.css";

// =========================================================
// ICONOS POR CATEGORÍA
// =========================================================

const CATEGORY_ICONS = {
    bible: BookOpen,
    studies: NotebookTabs,
    devotionals: Sun,
    discipleship: GraduationCap,
    prayer_guides: HandHeart,
    downloads: FileDown,
    faq: CircleHelp,
};

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
        month: "short",
        year: "numeric",
        timeZone: "UTC",
    }).format(date);
}

function getSafeUrl(value) {
    if (!value) return null;

    try {
        const url = new URL(value);

        return ["https:", "http:"].includes(url.protocol)
            ? url.href
            : null;
    } catch {
        return null;
    }
}

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function ResourceCard({
    resource,
    categoryName,
    onView,
    onEdit,
    onDelete,
    onDownloadPdf,
    downloadingPdf = false,
}) {

    // =====================================================
    // INFORMACIÓN DEL RECURSO
    // =====================================================

    const Icon =
        CATEGORY_ICONS[resource.category] || BookOpen;

    const isPublished = resource.status === "published";

    const safeUrl = getSafeUrl(resource.url);

    // =====================================================
    // INTERFAZ
    // =====================================================

    return (
        <article className="resource-card">

            {/* =========================================== */}
            {/* ENCABEZADO */}
            {/* =========================================== */}

            <div className="resource-card__header">

                <div className="resource-card__icon">
                    <Icon
                        size={23}
                        strokeWidth={1.7}
                        aria-hidden="true"
                    />
                </div>

                <span
                    className={
                        "resource-card__status " +
                        (isPublished
                            ? "resource-card__status--published"
                            : "resource-card__status--draft")
                    }
                >
                    {isPublished ? "Publicado" : (resource.hasPublishedVersion ? "Cambios sin publicar" : "Borrador")}
                </span>

            </div>

            {/* =========================================== */}
            {/* INFORMACIÓN */}
            {/* =========================================== */}

            <div className="resource-card__content">

                {resource.category === "devotionals" ? (
                    // Identificamos de inmediato el orden de cada paso.
                    <span className="resource-card__step">
                        Paso {Number(resource.content?.number) || "sin asignar"}
                    </span>
                ) : (
                    <span className="resource-card__category">
                        {categoryName || "Sin categoría"}
                    </span>
                )}

                <h3>
                    <button type="button" className="resource-cms__card-title-link"
                        onClick={() => onView?.(resource)} disabled={!onView}
                        aria-label={`Ver contenido de ${resource.title}`}>
                        {resource.title || "Sin título"}
                    </button>
                </h3>

                <p>
                    {resource.description ||
                        "Este recurso no tiene descripción."}
                </p>

                {resource.author && (
                    <span className="resource-card__author">
                        Por {resource.author}
                    </span>
                )}

            </div>

            {/* =========================================== */}
            {/* PIE DE TARJETA */}
            {/* =========================================== */}

            <div className="resource-card__footer">

                <span className="resource-card__date">
                    {resource.createdAt ? formatDate(resource.createdAt) : "Material de la iglesia"}
                </span>

                <div className="resource-card__actions">

                    {/* ENLACE EXTERNO */}

                    {safeUrl && (
                        <a
                            href={safeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="resource-card__action"
                            aria-label={`Abrir enlace de ${resource.title}`}
                            title="Abrir enlace"
                        >
                            <ExternalLink size={17} />
                        </a>
                    )}

                    {/* Descarga PDF: Discipulado y Guías de oración. */}
                    {["discipleship", "prayer_guides"].includes(resource.category) && (
                        <button
                            type="button"
                            className="resource-card__action"
                            onClick={() => onDownloadPdf?.(resource)}
                            disabled={
                                !onDownloadPdf ||
                                downloadingPdf ||
                                (!resource.isBuiltin && !resource.hasPublishedVersion)
                            }
                            aria-label={downloadingPdf
                                ? `Preparando PDF de ${resource.title}`
                                : `Descargar PDF de ${resource.title}`}
                            title={!resource.isBuiltin && !resource.hasPublishedVersion
                                ? "Publica este material para poder descargarlo"
                                : downloadingPdf ? "Preparando PDF..." : "Descargar material en PDF"}
                            aria-busy={downloadingPdf}
                        >
                            <PdfDownloadIcon size={17} aria-hidden="true" />
                        </button>
                    )}

                    {/* VER DETALLES */}

                    <button
                        type="button"
                        className="resource-card__action"
                        onClick={() => onView?.(resource)}
                        disabled={!onView}
                        aria-label={`Ver ${resource.title}`}
                        title="Ver detalles"
                    >
                        <Eye size={17} />
                    </button>

                    {/* EDITAR */}

                    <button
                        type="button"
                        className="resource-card__action"
                        onClick={() => onEdit?.(resource)}
                        disabled={!onEdit}
                        aria-label={`Editar ${resource.title}`}
                        title="Editar"
                    >
                        <Pencil size={17} />
                    </button>

                    {/* ELIMINAR */}

                    <button
                        type="button"
                        className="resource-card__action resource-card__action--delete"
                        onClick={() => onDelete?.(resource)}
                        disabled={!onDelete}
                        aria-label={`Eliminar ${resource.title}`}
                        title="Eliminar"
                    >
                        <Trash2 size={17} />
                    </button>

                </div>

            </div>

        </article>
    );
}

export default ResourceCard;
