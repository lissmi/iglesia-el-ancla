
import {
    Search,
    Filter,
    Package,
    ArrowUpRight,
    ArrowDownRight,
    ChevronDown,
} from "lucide-react";

import {
    basicSupplyCategories,
    getBasicSupplyStatus,
} from "../../../data/basicSupplies/basicSuppliesDemoData";

import "../../../styles/components/administration/basicSupplies/BasicSuppliesInventory.css";

// =========================================================
// CONFIGURACIÓN DE ESTADOS
// =========================================================

const STATUS_CONFIG = {
    available: {
        label: "Disponible",
        className: "available",
    },
    low: {
        label: "Stock bajo",
        className: "low",
    },
    out: {
        label: "Agotado",
        className: "out",
    },
};

// =========================================================
// INVENTARIO DE INSUMOS BÁSICOS
// =========================================================

function BasicSuppliesInventory({
    filteredSupplies,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    onOpenMovement,
}) {

    return (

        <section className="basic-supplies__panel">

            {/* =========================================== */}
            {/* ENCABEZADO */}
            {/* =========================================== */}

            <div className="basic-supplies__panel-header">

                <div>

                    <h2>
                        Inventario de insumos
                    </h2>

                    <p>
                        Consulta las existencias y
                        registra entradas o consumos.
                    </p>

                </div>

                <span className="basic-supplies__count">
                    {filteredSupplies.length} insumos
                </span>

            </div>

            {/* =========================================== */}
            {/* FILTROS */}
            {/* =========================================== */}

            <div className="basic-supplies__filters">

                <label className="basic-supplies__search">

                    <Search
                        size={18}
                        aria-hidden="true"
                    />

                    <input
                        type="search"
                        placeholder="Buscar insumo..."
                        aria-label="Buscar insumo"
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                    />

                </label>

                {/* =========================================== */}
                {/* FILTRO POR CATEGORÍA */}
                {/* =========================================== */}

                <label className="basic-supplies__filter-field">

                    <Filter
                        className="basic-supplies__filter-icon"
                        size={17}
                        strokeWidth={1.8}
                        aria-hidden="true"
                    />

                    <select
                        aria-label="Filtrar por categoría"
                        value={categoryFilter}
                        onChange={(event) =>
                            setCategoryFilter(event.target.value)
                        }
                    >

                        <option value="all">
                            Todas las categorías
                        </option>

                        {basicSupplyCategories.map((category) => (

                            <option
                                key={category}
                                value={category}
                            >
                                {category}
                            </option>

                        ))}

                    </select>

                    <ChevronDown
                        className="basic-supplies__filter-chevron"
                        size={16}
                        strokeWidth={2}
                        aria-hidden="true"
                    />

                </label>


                {/* =========================================== */}
                {/* FILTRO POR ESTADO */}
                {/* =========================================== */}

                <label className="basic-supplies__filter-field">

                    <select
                        aria-label="Filtrar por estado"
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(event.target.value)
                        }
                    >

                        <option value="all">
                            Todos los estados
                        </option>

                        <option value="available">
                            Disponible
                        </option>

                        <option value="low">
                            Stock bajo
                        </option>

                        <option value="out">
                            Agotado
                        </option>

                    </select>

                    <ChevronDown
                        className="basic-supplies__filter-chevron"
                        size={16}
                        strokeWidth={2}
                        aria-hidden="true"
                    />

                </label>

            </div>

            {/* =========================================== */}
            {/* TABLA DE INVENTARIO */}
            {/* =========================================== */}

            <div className="basic-supplies__table-wrapper">

                <table className="basic-supplies__table">

                    <thead>

                        <tr>
                            <th>Insumo</th>
                            <th>Categoría</th>
                            <th>Existencias</th>
                            <th>Stock mínimo</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>

                    </thead>

                    <tbody>

                        {filteredSupplies.map((supply) => {

                            const status =
                                getBasicSupplyStatus(supply);

                            const statusInfo =
                                STATUS_CONFIG[status];

                            return (

                                <tr key={supply.id}>

                                    <td>

                                        <div className="basic-supplies__supply-name">

                                            <strong>
                                                {supply.name}
                                            </strong>

                                            <span>
                                                {supply.id}
                                            </span>

                                        </div>

                                    </td>

                                    <td>
                                        {supply.category}
                                    </td>

                                    <td>
                                        <strong>
                                            {supply.stock}
                                        </strong>
                                        {" "}
                                        {supply.unit}
                                    </td>

                                    <td>
                                        {supply.minimumStock}
                                        {" "}
                                        {supply.unit}
                                    </td>

                                    <td>

                                        <span
                                            className={`basic-supplies__status basic-supplies__status--${statusInfo.className}`}
                                        >
                                            {statusInfo.label}
                                        </span>

                                    </td>

                                    <td>

                                        <div className="basic-supplies__actions">

                                            <button
                                                type="button"
                                                title="Registrar entrada"
                                                aria-label={`Registrar entrada de ${supply.name}`}
                                                onClick={() =>
                                                    onOpenMovement(
                                                        supply,
                                                        "income"
                                                    )
                                                }
                                            >
                                                <ArrowUpRight size={17} />
                                            </button>

                                            <button
                                                type="button"
                                                title="Registrar consumo"
                                                aria-label={`Registrar consumo de ${supply.name}`}
                                                onClick={() =>
                                                    onOpenMovement(
                                                        supply,
                                                        "expense"
                                                    )
                                                }
                                            >
                                                <ArrowDownRight size={17} />
                                            </button>

                                        </div>

                                    </td>

                                </tr>

                            );

                        })}

                    </tbody>

                </table>

            </div>

            {/* =========================================== */}
            {/* SIN RESULTADOS */}
            {/* =========================================== */}

            {filteredSupplies.length === 0 && (

                <div className="basic-supplies__empty">

                    <Package size={28} />

                    <strong>
                        No se encontraron insumos
                    </strong>

                    <p>
                        Prueba modificando los filtros
                        de búsqueda.
                    </p>

                </div>

            )}

        </section>

    );
}

export default BasicSuppliesInventory;
