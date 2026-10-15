// =========================================================
// IMPORTACIONES
// =========================================================

import {
    Clapperboard,
    CheckCircle2,
    FilePenLine,
    Star,
} from "lucide-react";

// Importamos los estilos exclusivos del componente.
import "../../../styles/components/administration/recommendations/RecommendationsSummary.css";


// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function RecommendationsSummary({
    recommendations = [],
}) {

    // =====================================================
    // CÁLCULO DE ESTADÍSTICAS
    // =====================================================

    // Cantidad total de recomendaciones registradas.
    const totalRecommendations = recommendations.length;

    // Recomendaciones publicadas.
    const publishedRecommendations = recommendations.filter(
        (recommendation) =>
            recommendation.status === "published"
    ).length;

    // Recomendaciones guardadas como borrador.
    const draftRecommendations = recommendations.filter(
        (recommendation) =>
            recommendation.status === "draft"
    ).length;

    // Recomendaciones marcadas como destacadas.
    const featuredRecommendations = recommendations.filter(
        (recommendation) =>
            recommendation.featured === true
    ).length;


    // =====================================================
    // CONFIGURACIÓN DE TARJETAS
    // =====================================================

    const summaryCards = [
        {
            id: "total",
            title: "Total de recomendaciones",
            value: totalRecommendations,
            description: "Contenidos registrados",
            icon: Clapperboard,
            variant: "total",
        },
        {
            id: "published",
            title: "Publicadas",
            value: publishedRecommendations,
            description: "Visibles para la comunidad",
            icon: CheckCircle2,
            variant: "published",
        },
        {
            id: "draft",
            title: "Borradores",
            value: draftRecommendations,
            description: "Pendientes de publicación",
            icon: FilePenLine,
            variant: "draft",
        },
        {
            id: "featured",
            title: "Destacadas",
            value: featuredRecommendations,
            description: "Marcadas como recomendadas especiales",
            icon: Star,
            variant: "featured",
        },
    ];


    // =====================================================
    // INTERFAZ
    // =====================================================

    return (
        <section
            className="recommendations-summary"
            aria-label="Resumen de recomendaciones"
        >

            <div className="recommendations-summary__grid">

                {summaryCards.map((card) => {

                    const Icon = card.icon;

                    return (
                        <article
                            className={
                                `recommendations-summary__card ` +
                                `recommendations-summary__card--${card.variant}`
                            }
                            key={card.id}
                        >

                            {/* Información principal. */}
                            <div className="recommendations-summary__content">

                                <span className="recommendations-summary__label">
                                    {card.title}
                                </span>

                                <strong className="recommendations-summary__value">
                                    {card.value}
                                </strong>

                                <span className="recommendations-summary__description">
                                    {card.description}
                                </span>

                            </div>

                            {/* Icono del indicador. */}
                            <div className="recommendations-summary__icon">

                                <Icon
                                    size={23}
                                    strokeWidth={1.8}
                                    aria-hidden="true"
                                />

                            </div>

                        </article>
                    );
                })}

            </div>

        </section>
    );
}

export default RecommendationsSummary;