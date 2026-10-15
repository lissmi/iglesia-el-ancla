// =========================================================
// IMPORTACIONES
// =========================================================
import { useEffect, useId } from "react";
import {
    X, ImageOff, Star, Users, ExternalLink, Pencil,
    BookMarked, Music2, Clapperboard, Tv, Film, Mic2,
    CheckCircle2, FilePenLine,
} from "lucide-react";
import { RECOMMENDATION_CATEGORIES } from "./RecommendationsCategories";
import "../../../styles/components/administration/recommendations/RecommendationDetailsModal.css";

const CATEGORY_ICONS = {
    books: BookMarked,
    music: Music2,
    movies: Clapperboard,
    series: Tv,
    documentaries: Film,
    podcasts: Mic2,
};

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================
function RecommendationDetailsModal({
    isOpen = false,
    recommendation = null,
    onClose,
    onEdit,
}) {
    const titleId = useId();

    useEffect(() => {
        if (!isOpen) return undefined;

        function handleKeyDown(event) {
            if (event.key === "Escape") onClose?.();
        }

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen || !recommendation) return null;

    const {
        title = "Sin título",
        category = "",
        creator = "",
        description = "",
        reason = "",
        image = "",
        link = "",
        status = "draft",
        featured = false,
        audience = [],
    } = recommendation;

    const categoryData = RECOMMENDATION_CATEGORIES.find(
        (item) => item.id === category
    );
    const CategoryIcon = CATEGORY_ICONS[category] || Clapperboard;
    const isPublished = status === "published";
    const audienceValues = Array.isArray(audience) ? audience : [audience];
    const audienceLabels = [
        audienceValues.includes("general") && "Público general",
        audienceValues.includes("kids_youth") && "Niños y jóvenes",
    ].filter(Boolean);

    // Solo permitimos enlaces externos HTTP(S).
    let safeLink = "";
    if (typeof link === "string" && link.trim()) {
        try {
            const parsedUrl = new URL(link);
            if (["https:", "http:"].includes(parsedUrl.protocol)) {
                safeLink = parsedUrl.href;
            }
        } catch {
            // Un enlace inválido no se muestra.
        }
    }

    function handleEdit() {
        onEdit?.(recommendation);
    }

    return (
        <div
            className="recommendation-details-modal__overlay"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose?.();
            }}
        >
            <section
                className="recommendation-details-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
            >
                {/* ENCABEZADO */}
                <header className="recommendation-details-modal__header">
                    <div>
                        <span className="recommendation-details-modal__eyebrow">
                            Gestión de recomendados
                        </span>
                        <h2 id={titleId}>Detalle de recomendación</h2>
                        <p>Información registrada para la comunidad.</p>
                    </div>
                    <button
                        type="button"
                        className="recommendation-details-modal__close"
                        onClick={onClose}
                        aria-label="Cerrar detalles"
                    >
                        <X size={20} aria-hidden="true" />
                    </button>
                </header>

                {/* CONTENIDO */}
                <div className="recommendation-details-modal__body">
                    <div className="recommendation-details-modal__intro">
                        <div className="recommendation-details-modal__cover">
                            {image ? (
                                <img src={image} alt={`Portada de ${title}`} />
                            ) : (
                                <div className="recommendation-details-modal__placeholder">
                                    <ImageOff size={30} aria-hidden="true" />
                                    <span>Sin portada</span>
                                </div>
                            )}
                        </div>
                        <div className="recommendation-details-modal__intro-info">
                            <span className="recommendation-details-modal__category">
                                <CategoryIcon size={16} aria-hidden="true" />
                                {categoryData?.name || "Sin categoría"}
                            </span>
                            <h3>{title}</h3>
                            <p className="recommendation-details-modal__creator">
                                {creator || "Creador no especificado"}
                            </p>
                            <div className="recommendation-details-modal__badges">
                                <span className={`recommendation-details-modal__status recommendation-details-modal__status--${isPublished ? "published" : "draft"}`}>
                                    {isPublished ? <CheckCircle2 size={14} /> : <FilePenLine size={14} />}
                                    {isPublished ? "Publicada" : "Borrador"}
                                </span>
                                {featured && (
                                    <span className="recommendation-details-modal__featured">
                                        <Star size={14} fill="currentColor" />
                                        Destacada
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="recommendation-details-modal__section">
                        <h4>Descripción</h4>
                        <p>{description || "No se ha registrado una descripción."}</p>
                    </div>

                    <div className="recommendation-details-modal__section">
                        <h4>¿Por qué lo recomendamos?</h4>
                        <p>{reason || "No se ha registrado un motivo de recomendación."}</p>
                    </div>

                    <div className="recommendation-details-modal__section">
                        <h4><Users size={17} aria-hidden="true" /> Público objetivo</h4>
                        <div className="recommendation-details-modal__audiences">
                            {audienceLabels.length ? audienceLabels.map((label) => (
                                <span key={label}>{label}</span>
                            )) : <p>No especificado.</p>}
                        </div>
                    </div>

                    <div className="recommendation-details-modal__section">
                        <h4>Enlace al contenido</h4>
                        {safeLink ? (
                            <a
                                className="recommendation-details-modal__link"
                                href={safeLink}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <ExternalLink size={16} aria-hidden="true" />
                                Abrir contenido recomendado
                            </a>
                        ) : (
                            <p>No se ha registrado un enlace válido.</p>
                        )}
                    </div>
                </div>

                {/* ACCIONES */}
                <footer className="recommendation-details-modal__footer">
                    <button
                        type="button"
                        className="recommendation-details-modal__cancel"
                        onClick={onClose}
                    >
                        Cerrar
                    </button>
                    <button
                        type="button"
                        className="recommendation-details-modal__edit"
                        onClick={handleEdit}
                        disabled={!onEdit}
                    >
                        <Pencil size={17} aria-hidden="true" />
                        Editar recomendación
                    </button>
                </footer>
            </section>
        </div>
    );
}

export default RecommendationDetailsModal;
