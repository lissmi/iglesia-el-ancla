// =========================================================
// IMPORTACIONES
// =========================================================

import {
    Search,
    SlidersHorizontal,
    ArrowUpDown,
    RotateCcw,
} from "lucide-react";

// Importamos los estilos exclusivos del componente.
import "../../../styles/components/administration/recommendations/RecommendationsToolbar.css";


// =========================================================
// OPCIONES DE FILTROS
// =========================================================

const STATUS_OPTIONS = [
    {
        value: "all",
        label: "Todos los estados",
    },
    {
        value: "published",
        label: "Publicadas",
    },
    {
        value: "draft",
        label: "Borradores",
    },
];

const SORT_OPTIONS = [
    {
        value: "newest",
        label: "Más recientes",
    },
    {
        value: "oldest",
        label: "Más antiguas",
    },
    {
        value: "title_asc",
        label: "Título: A - Z",
    },
    {
        value: "title_desc",
        label: "Título: Z - A",
    },
];


// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function RecommendationsToolbar({
    searchTerm = "",
    onSearchChange,
    statusFilter = "all",
    onStatusChange,
    sortBy = "newest",
    onSortChange,
    onClearFilters,
}) {

    // =====================================================
    // IDENTIFICACIÓN DE FILTROS ACTIVOS
    // =====================================================

    const hasActiveFilters =
        searchTerm.trim() !== "" ||
        statusFilter !== "all" ||
        sortBy !== "newest";


    // =====================================================
    // INTERFAZ
    // =====================================================

    return (
        <section
            className="recommendations-toolbar"
            aria-label="Herramientas de búsqueda y filtrado"
        >

            {/* =========================================== */}
            {/* ENCABEZADO */}
            {/* =========================================== */}

            <div className="recommendations-toolbar__heading">

                <div className="recommendations-toolbar__heading-info">

                    <div className="recommendations-toolbar__heading-icon">

                        <SlidersHorizontal
                            size={19}
                            strokeWidth={1.8}
                            aria-hidden="true"
                        />

                    </div>

                    <div>

                        <h2>
                            Buscar y filtrar
                        </h2>

                        <p>
                            Encuentra recomendaciones por título,
                            creador o estado de publicación.
                        </p>

                    </div>

                </div>

                <button
                    className="recommendations-toolbar__clear"
                    type="button"
                    onClick={() => onClearFilters?.()}
                    disabled={!hasActiveFilters}
                >

                    <RotateCcw
                        size={15}
                        aria-hidden="true"
                    />

                    Limpiar filtros

                </button>

            </div>


            {/* =========================================== */}
            {/* CONTROLES */}
            {/* =========================================== */}

            <div className="recommendations-toolbar__controls">

                {/* Búsqueda. */}
                <div className="recommendations-toolbar__field recommendations-toolbar__field--search">

                    <label htmlFor="recommendations-search">
                        Buscar recomendación
                    </label>

                    <div className="recommendations-toolbar__input-wrapper">

                        <Search
                            size={18}
                            aria-hidden="true"
                        />

                        <input
                            id="recommendations-search"
                            type="search"
                            placeholder="Título, creador o descripción..."
                            value={searchTerm}
                            onChange={(event) =>
                                onSearchChange?.(event.target.value)
                            }
                        />

                    </div>

                </div>


                {/* Estado de publicación. */}
                <div className="recommendations-toolbar__field">

                    <label htmlFor="recommendations-status">
                        Estado
                    </label>

                    <div className="recommendations-toolbar__select-wrapper">

                        <select
                            id="recommendations-status"
                            value={statusFilter}
                            onChange={(event) =>
                                onStatusChange?.(event.target.value)
                            }
                        >

                            {STATUS_OPTIONS.map((option) => (
                                <option
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </option>
                            ))}

                        </select>

                    </div>

                </div>


                {/* Ordenamiento. */}
                <div className="recommendations-toolbar__field">

                    <label htmlFor="recommendations-sort">
                        Ordenar por
                    </label>

                    <div className="recommendations-toolbar__select-wrapper">

                        <ArrowUpDown
                            size={16}
                            aria-hidden="true"
                        />

                        <select
                            id="recommendations-sort"
                            value={sortBy}
                            onChange={(event) =>
                                onSortChange?.(event.target.value)
                            }
                        >

                            {SORT_OPTIONS.map((option) => (
                                <option
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </option>
                            ))}

                        </select>

                    </div>

                </div>

            </div>

        </section>
    );
}

export default RecommendationsToolbar;