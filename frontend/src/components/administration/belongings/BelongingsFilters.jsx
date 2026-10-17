
import { Search, RotateCcw } from "lucide-react";

import "../../../styles/components/administration/belongings/BelongingsFilters.css";

// =========================================================
// FILTROS DEL INVENTARIO DE BIENES
// IGLESIA EL ANCLA
// =========================================================

function BelongingsFilters({
    search,
    category,
    condition,
    location,
    categories = [],
    conditions = [],
    locations = [],
    onSearchChange,
    onCategoryChange,
    onConditionChange,
    onLocationChange,
    onReset,
}) {
    return (
        <section
            className="belongings-filters"
            aria-label="Filtros del inventario"
        >

            {/* ========================================= */}
            {/* BÚSQUEDA */}
            {/* ========================================= */}

            <div className="belongings-filters__search">

                <Search
                    size={19}
                    strokeWidth={1.8}
                    aria-hidden="true"
                />

                <input
                    type="search"
                    value={search}
                    onChange={(event) =>
                        onSearchChange(event.target.value)
                    }
                    placeholder="Buscar por nombre o código..."
                    aria-label="Buscar bienes"
                />

            </div>

            {/* ========================================= */}
            {/* FILTROS */}
            {/* ========================================= */}

            <div className="belongings-filters__controls">

                <label className="belongings-filters__field">

                    <span>Categoría</span>

                    <select
                        value={category}
                        onChange={(event) =>
                            onCategoryChange(event.target.value)
                        }
                    >
                        <option value="">Todas las categorías</option>

                        {categories.map((item) => (
                            <option
                                key={item.id}
                                value={item.id}
                            >
                                {item.name}
                            </option>
                        ))}
                    </select>

                </label>

                <label className="belongings-filters__field">

                    <span>Estado</span>

                    <select
                        value={condition}
                        onChange={(event) =>
                            onConditionChange(event.target.value)
                        }
                    >
                        <option value="">Todos los estados</option>

                        {conditions.map((item) => (
                            <option
                                key={item.value}
                                value={item.value}
                            >
                                {item.label}
                            </option>
                        ))}
                    </select>

                </label>

                <label className="belongings-filters__field">

                    <span>Ubicación</span>

                    <select
                        value={location}
                        onChange={(event) =>
                            onLocationChange(event.target.value)
                        }
                    >
                        <option value="">Todas las ubicaciones</option>

                        {locations.map((item) => (
                            <option
                                key={item.id}
                                value={item.id}
                            >
                                {item.name}
                            </option>
                        ))}
                    </select>

                </label>

                <button
                    type="button"
                    className="belongings-filters__reset"
                    onClick={onReset}
                    title="Limpiar filtros"
                >
                    <RotateCcw
                        size={17}
                        strokeWidth={1.8}
                        aria-hidden="true"
                    />

                    <span>Limpiar</span>
                </button>

            </div>

        </section>
    );
}

export default BelongingsFilters;
