import {
    Search,
    SlidersHorizontal,
    X,
} from "lucide-react";

import "../../../styles/components/administration/resources/ResourcesToolbar.css";

function ResourcesToolbar({
    search = "",
    onSearchChange,
    statusFilter = "all",
    onStatusChange,
    sortOrder = "newest",
    devotionalMode = false,
    onSortChange,
    onClearFilters,
}) {

    const hasActiveFilters =
        search.trim() !== "" ||
        statusFilter !== "all" ||
        sortOrder !== (devotionalMode ? "step" : "newest");

    return (
        <div className="resources-toolbar">

            <div className="resources-toolbar__search">

                <Search size={19} aria-hidden="true" />

                <input
                    type="search"
                    value={search}
                    onChange={(event) =>
                        onSearchChange?.(event.target.value)
                    }
                    placeholder="Buscar recursos..."
                    aria-label="Buscar recursos"
                />

            </div>

            <div className="resources-toolbar__filters">

                <div className="resources-toolbar__filter-icon">
                    <SlidersHorizontal
                        size={18}
                        aria-hidden="true"
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={(event) =>
                        onStatusChange?.(event.target.value)
                    }
                    aria-label="Filtrar por estado"
                >
                    <option value="all">Todos los estados</option>
                    <option value="published">Publicados</option>
                    <option value="draft">Borradores</option>
                </select>

                <select
                    value={sortOrder}
                    onChange={(event) =>
                        onSortChange?.(event.target.value)
                    }
                    aria-label="Ordenar recursos"
                >
                    {devotionalMode && <option value="step">Orden de los pasos</option>}
                    <option value="newest">Más recientes</option>
                    <option value="oldest">Más antiguos</option>
                    <option value="title-asc">Título A-Z</option>
                    <option value="title-desc">Título Z-A</option>
                </select>

                {hasActiveFilters && (
                    <button
                        type="button"
                        className="resources-toolbar__clear"
                        onClick={onClearFilters}
                    >
                        <X size={15} aria-hidden="true" />
                        Limpiar
                    </button>
                )}

            </div>

        </div>
    );
}

export default ResourcesToolbar;
