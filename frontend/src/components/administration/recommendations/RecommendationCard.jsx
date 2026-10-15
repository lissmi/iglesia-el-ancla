// =========================================================
// IMPORTACIONES
// =========================================================

import {
    BookMarked,
    Music2,
    Clapperboard,
    Tv,
    Film,
    Mic2,
    ImageOff,
    Eye,
    Pencil,
    Trash2,
    Star,
    Users,
    ExternalLink,
} from "lucide-react";

// Importamos las categorías definidas anteriormente.
import {
    RECOMMENDATION_CATEGORIES,
} from "./RecommendationsCategories";

// Importamos los estilos exclusivos del componente.
import "../../../styles/components/administration/recommendations/RecommendationCard.css";


// =========================================================
// CONFIGURACIÓN DE CATEGORÍAS
// =========================================================

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

function RecommendationCard({
    recommendation,
    onView,
    onEdit,
    onDelete,
}) {

    // =====================================================
    // VALIDACIÓN DEL REGISTRO
    // =====================================================

    if (!recommendation) {
        return null;
    }


    // =====================================================
    // INFORMACIÓN DE LA RECOMENDACIÓN
    // =====================================================

    const {
        title = "Sin título",
        category = "",
        creator = "",
        description = "",
        image = "",
        status = "draft",
        featured = false,
        audience = [],
        link = "",
    } = recommendation;


    // Buscamos la categoría correspondiente.
    const categoryData = RECOMMENDATION_CATEGORIES.find(
        (item) => item.id === category
    );

    // Nombre visible de la categoría.
    const categoryName = categoryData?.name || "Sin categoría";

    // Icono correspondiente al tipo de contenido.
    const CategoryIcon =
        CATEGORY_ICONS[category] || Clapperboard;


    // =====================================================
    // ESTADO DE PUBLICACIÓN
    // =====================================================

    const isPublished = status === "published";

    const statusLabel = isPublished
        ? "Publicada"
        : "Borrador";


    // =====================================================
    // PÚBLICO OBJETIVO
    // =====================================================

    const isKidsYouth = Array.isArray(audience)
        ? audience.includes("kids_youth")
        : audience === "kids_youth";


    // =====================================================
    // INTERFAZ
    // =====================================================

    return (
        <article className="recommendation-admin-card">

            {/* =========================================== */}
            {/* PORTADA */}
            {/* =========================================== */}

            <div className="recommendation-admin-card__image-wrapper">

                {image ? (
                    <img
                        className="recommendation-admin-card__image"
                        src={image}
                        alt={`Portada de ${title}`}
                        loading="lazy"
                    />
                ) : (
                    <div className="recommendation-admin-card__placeholder">

                        <ImageOff
                            size={32}
                            strokeWidth={1.5}
                            aria-hidden="true"
                        />

                        <span>
                            Sin portada
                        </span>

                    </div>
                )}

                {/* Estado de publicación. */}
                <span
                    className={
                        "recommendation-admin-card__status " +
                        (isPublished
                            ? "recommendation-admin-card__status--published"
                            : "recommendation-admin-card__status--draft")
                    }
                >
                    {statusLabel}
                </span>

                {/* Indicador de destacado. */}
                {featured && (
                    <span className="recommendation-admin-card__featured">

                        <Star
                            size={13}
                            fill="currentColor"
                            aria-hidden="true"
                        />

                        Destacada

                    </span>
                )}

            </div>


            {/* =========================================== */}
            {/* CONTENIDO */}
            {/* =========================================== */}

            <div className="recommendation-admin-card__content">

                {/* Categoría principal. */}
                <div className="recommendation-admin-card__category">

                    <CategoryIcon
                        size={15}
                        strokeWidth={1.8}
                        aria-hidden="true"
                    />

                    <span>
                        {categoryName}
                    </span>

                </div>


                {/* Título. */}
                <h3 className="recommendation-admin-card__title">
                    {title}
                </h3>


                {/* Creador. */}
                <p className="recommendation-admin-card__creator">

                    {creator || "Creador no especificado"}

                </p>


                {/* Descripción. */}
                <p className="recommendation-admin-card__description">

                    {description || "Esta recomendación no tiene descripción."}

                </p>


                {/* Etiquetas adicionales. */}
                <div className="recommendation-admin-card__tags">

                    {isKidsYouth && (
                        <span className="recommendation-admin-card__audience">

                            <Users
                                size={13}
                                aria-hidden="true"
                            />

                            Niños y jóvenes

                        </span>
                    )}

                    {link && (
                        <span className="recommendation-admin-card__external">

                            <ExternalLink
                                size={13}
                                aria-hidden="true"
                            />

                            Enlace disponible

                        </span>
                    )}

                </div>


                {/* ======================================= */}
                {/* ACCIONES */}
                {/* ======================================= */}

                <div className="recommendation-admin-card__actions">

                    <button
                        className="recommendation-admin-card__action recommendation-admin-card__action--view"
                        type="button"
                        onClick={() => onView?.(recommendation)}
                        aria-label={`Ver detalles de ${title}`}
                        title="Ver detalles"
                    >

                        <Eye
                            size={17}
                            aria-hidden="true"
                        />

                        <span>
                            Ver
                        </span>

                    </button>


                    <button
                        className="recommendation-admin-card__action recommendation-admin-card__action--edit"
                        type="button"
                        onClick={() => onEdit?.(recommendation)}
                        aria-label={`Editar ${title}`}
                        title="Editar recomendación"
                    >

                        <Pencil
                            size={17}
                            aria-hidden="true"
                        />

                        <span>
                            Editar
                        </span>

                    </button>


                    <button
                        className="recommendation-admin-card__action recommendation-admin-card__action--delete"
                        type="button"
                        onClick={() => onDelete?.(recommendation)}
                        aria-label={`Eliminar ${title}`}
                        title="Eliminar recomendación"
                    >

                        <Trash2
                            size={17}
                            aria-hidden="true"
                        />

                        <span>
                            Eliminar
                        </span>

                    </button>

                </div>

            </div>

        </article>
    );
}

export default RecommendationCard;