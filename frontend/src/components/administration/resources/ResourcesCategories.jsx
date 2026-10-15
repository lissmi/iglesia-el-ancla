
import {
    BookOpen,
    NotebookTabs,
    Sun,
    GraduationCap,
    HandHeart,
    FileDown,
    CircleHelp,
    LayoutGrid,
    ArrowRight,
} from "lucide-react";

import "../../../styles/components/administration/resources/ResourcesCategories.css";

// =========================================================
// CONFIGURACIÓN DE CATEGORÍAS
// =========================================================

export const RESOURCE_CATEGORIES = [
    {
        id: "bible",
        name: "Biblia",
        description: "Lectura y consulta bíblica",
        icon: BookOpen,
    },
    {
        id: "studies",
        name: "Guías y estudios",
        description: "Material de formación bíblica",
        icon: NotebookTabs,
    },
    {
        id: "devotionals",
        name: "Devocionales",
        description: "Reflexiones y lecturas diarias",
        icon: Sun,
    },
    {
        id: "discipleship",
        name: "Discipulado",
        description: "Crecimiento y formación espiritual",
        icon: GraduationCap,
    },
    {
        id: "prayer_guides",
        name: "Guías de oración",
        description: "Materiales para fortalecer la vida de oración",
        icon: HandHeart,
    },
    {
        id: "downloads",
        name: "Archivos y descargables",
        description: "Documentos y materiales PDF",
        icon: FileDown,
    },
    {
        id: "faq",
        name: "Preguntas frecuentes",
        description: "Respuestas y orientación",
        icon: CircleHelp,
    },
];

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function ResourcesCategories({
    resources = [],
    selectedCategory = "all",
    onSelectCategory,
}) {

    // =====================================================
    // CANTIDAD DE RECURSOS POR CATEGORÍA
    // =====================================================

    function getCategoryCount(categoryId) {

        if (categoryId === "all") {
            return resources.length;
        }

        return resources.filter(
            (resource) => resource.category === categoryId
        ).length;
    }

    // =====================================================
    // CATEGORÍAS DISPONIBLES
    // =====================================================

    const categories = [
        {
            id: "all",
            name: "Todos los recursos",
            description: "Explorar el catálogo completo",
            icon: LayoutGrid,
        },
        ...RESOURCE_CATEGORIES,
    ];

    // =====================================================
    // INTERFAZ
    // =====================================================

    return (
        <section className="resources-categories">

            {/* =========================================== */}
            {/* ENCABEZADO */}
            {/* =========================================== */}

            <div className="resources-categories__heading">

                <div>
                    <h2>
                        Categorías de recursos
                    </h2>

                    <p>
                        Organiza y consulta los contenidos
                        disponibles por categoría.
                    </p>
                </div>

                <span className="resources-categories__total">
                    {RESOURCE_CATEGORIES.length} categorías
                </span>

            </div>

            {/* =========================================== */}
            {/* CUADRÍCULA DE CATEGORÍAS */}
            {/* =========================================== */}

            <div className="resources-categories__grid">

                {categories.map((category) => {

                    const Icon = category.icon;

                    const isSelected =
                        selectedCategory === category.id;

                    const count = getCategoryCount(category.id);

                    return (
                        <button
                            key={category.id}
                            type="button"
                            className={
                                "resources-categories__card" +
                                (isSelected
                                    ? " resources-categories__card--active"
                                    : "")
                            }
                            onClick={() => {
                                onSelectCategory?.(category.id);
                            }}
                            aria-pressed={isSelected}
                        >

                            <div className="resources-categories__icon">

                                <Icon
                                    size={21}
                                    strokeWidth={1.8}
                                    aria-hidden="true"
                                />

                            </div>

                            <div className="resources-categories__info">

                                <strong>
                                    {category.name}
                                </strong>

                                <span>
                                    {category.description}
                                </span>

                            </div>

                            <div className="resources-categories__meta">

                                <span className="resources-categories__count">
                                    {count}
                                </span>

                                <ArrowRight
                                    size={16}
                                    aria-hidden="true"
                                />

                            </div>

                        </button>
                    );
                })}

            </div>

        </section>
    );
}

export default ResourcesCategories;
