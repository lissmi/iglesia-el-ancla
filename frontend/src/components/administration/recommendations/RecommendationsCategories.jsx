import {
    BookMarked,
    Music2,
    Clapperboard,
    Tv,
    Film,
    Mic2,
    Baby,
    LayoutGrid,
    ArrowRight,
} from "lucide-react";

import "../../../styles/components/administration/recommendations/RecommendationsCategories.css";

// =========================================================
// CONFIGURACIÓN DE CATEGORÍAS
// =========================================================

export const RECOMMENDATION_CATEGORIES = [
    {
        id: "books",
        name: "Libros",
        description: "Libros cristianos y lecturas sugeridas",
        icon: BookMarked,
    },
    {
        id: "music",
        name: "Música",
        description: "Canciones, álbumes y playlists",
        icon: Music2,
    },
    {
        id: "movies",
        name: "Películas",
        description: "Películas y contenido cinematográfico recomendado",
        icon: Clapperboard,
    },
    {
        id: "series",
        name: "Series",
        description: "Series cristianas y contenido episódico",
        icon: Tv,
    },
    {
        id: "documentaries",
        name: "Documentales",
        description: "Contenido educativo, histórico y audiovisual",
        icon: Film,
    },
    {
        id: "podcasts",
        name: "Podcasts",
        description: "Programas de audio y conversaciones",
        icon: Mic2,
    },
    {
        id: "kids_youth",
        name: "Niños y jóvenes",
        description: "Contenido especialmente seleccionado para estas edades",
        icon: Baby,
    },
];

// =========================================================
// FILTRADO COMPARTIDO
// =========================================================

export function matchesRecommendationCategory(recommendation, categoryId) {
    if (categoryId === "all") return true;

    if (categoryId === "kids_youth") {
        return Array.isArray(recommendation.audience)
            ? recommendation.audience.includes("kids_youth")
            : recommendation.audience === "kids_youth";
    }

    return recommendation.category === categoryId;
}

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function RecommendationsCategories({
    recommendations = [],
    selectedCategory = "all",
    onSelectCategory,
}) {
    // =====================================================
    // CANTIDAD DE RECOMENDACIONES POR CATEGORÍA
    // =====================================================

    function getCategoryCount(categoryId) {
        return recommendations.filter((recommendation) =>
            matchesRecommendationCategory(recommendation, categoryId)
        ).length;
    }

    // =====================================================
    // CATEGORÍAS DISPONIBLES
    // =====================================================

    const categories = [
        {
            id: "all",
            name: "Todas las recomendaciones",
            description: "Explorar el catálogo completo",
            icon: LayoutGrid,
        },
        ...RECOMMENDATION_CATEGORIES,
    ];

    // =====================================================
    // INTERFAZ
    // =====================================================

    return (
        <section className="recommendations-categories">
            {/* ENCABEZADO */}
            <div className="recommendations-categories__heading">
                <div>
                    <h2>Categorías de recomendaciones</h2>
                    <p>
                        Organiza y consulta los contenidos
                        recomendados por categoría.
                    </p>
                </div>

                <span className="recommendations-categories__total">
                    {RECOMMENDATION_CATEGORIES.length} categorías
                </span>
            </div>

            {/* CUADRÍCULA DE CATEGORÍAS */}
            <div className="recommendations-categories__grid">
                {categories.map((category) => {
                    const Icon = category.icon;
                    const isSelected = selectedCategory === category.id;
                    const count = getCategoryCount(category.id);

                    return (
                        <button
                            key={category.id}
                            type="button"
                            className={
                                "recommendations-categories__card" +
                                (isSelected
                                    ? " recommendations-categories__card--active"
                                    : "")
                            }
                            onClick={() => onSelectCategory?.(category.id)}
                            aria-pressed={isSelected}
                        >
                            <div className="recommendations-categories__icon">
                                <Icon
                                    size={21}
                                    strokeWidth={1.8}
                                    aria-hidden="true"
                                />
                            </div>

                            <div className="recommendations-categories__info">
                                <strong>{category.name}</strong>
                                <span>{category.description}</span>
                            </div>

                            <div className="recommendations-categories__meta">
                                <span className="recommendations-categories__count">
                                    {count}
                                </span>
                                <ArrowRight size={16} aria-hidden="true" />
                            </div>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}

export default RecommendationsCategories;
