
import {
    ArrowUpDown,
    Eye,
    Package,
    Pencil,
    Trash2,
} from "lucide-react";

import "../../../styles/components/administration/belongings/BelongingsTable.css";

// =========================================================
// TABLA DEL INVENTARIO DE BIENES
// IGLESIA EL ANCLA
// =========================================================

function BelongingsTable({
    belongings = [],
    categories = [],
    locations = [],
    conditions = [],
    sortBy = "name",
    sortDirection = "asc",
    onSort,
    onView,
    onEdit,
    onDelete,
}) {

    // =====================================================
    // OBTENER NOMBRE DE CATEGORÍA
    // =====================================================

    const getCategoryName = (categoryId) => {

        const category = categories.find(
            (item) => item.id === categoryId
        );

        return category?.name || "Sin categoría";
    };

    // =====================================================
    // OBTENER NOMBRE DE UBICACIÓN
    // =====================================================

    const getLocationName = (locationId) => {

        const location = locations.find(
            (item) => item.id === locationId
        );

        return location?.name || "Sin ubicación";
    };

    // =====================================================
    // OBTENER ESTADO
    // =====================================================

    const getCondition = (conditionValue) => {

        const condition = conditions.find(
            (item) => item.value === conditionValue
        );

        return condition?.label || "Sin estado";
    };

    // =====================================================
    // ESTILOS DE ESTADO
    // =====================================================

    const getConditionClass = (condition) => {

        const conditionClasses = {
            excellent: "excellent",
            good: "good",
            fair: "fair",
            damaged: "damaged",
            out_of_service: "out-of-service",
        };

        return conditionClasses[condition] || "unknown";
    };

    // =====================================================
    // BOTÓN DE ORDENAMIENTO
    // =====================================================

    const renderSortButton = (field, label) => (

        <button
            type="button"
            className={`belongings-table__sort ${
                sortBy === field
                    ? "belongings-table__sort--active"
                    : ""
            }`}
            onClick={() => onSort?.(field)}
            aria-label={`Ordenar por ${label}`}
            title={`Ordenar por ${label}`}
        >

            <span>{label}</span>

            <ArrowUpDown
                size={14}
                strokeWidth={1.8}
                aria-hidden="true"
            />

            {sortBy === field && (
                <span className="belongings-table__sort-direction">
                    {sortDirection === "asc" ? "↑" : "↓"}
                </span>
            )}

        </button>
    );

    // =====================================================
    // RENDERIZADO
    // =====================================================

    return (
        <div className="belongings-table">

            <div className="belongings-table__scroll">

                <table>

                    <thead>
                        <tr>

                            <th scope="col">
                                {renderSortButton("name", "Bien")}
                            </th>

                            <th scope="col">
                                Categoría
                            </th>

                            <th scope="col">
                                {renderSortButton("quantity", "Cantidad")}
                            </th>

                            <th scope="col">
                                Ubicación
                            </th>

                            <th scope="col">
                                Estado
                            </th>

                            <th scope="col">
                                Acciones
                            </th>

                        </tr>
                    </thead>

                    <tbody>

                        {belongings.map((belonging) => (

                            <tr key={belonging.id}>

                                {/* ======================= */}
                                {/* BIEN */}
                                {/* ======================= */}

                                <td>

                                    <div className="belongings-table__item">

                                        <div className="belongings-table__item-icon">
                                            <Package
                                                size={19}
                                                strokeWidth={1.8}
                                            />
                                        </div>

                                        <div className="belongings-table__item-info">

                                            <strong>
                                                {belonging.name}
                                            </strong>

                                            <span>
                                                {belonging.code}
                                            </span>

                                        </div>

                                    </div>

                                </td>

                                {/* ======================= */}
                                {/* CATEGORÍA */}
                                {/* ======================= */}

                                <td>

                                    <span className="belongings-table__secondary">
                                        {getCategoryName(
                                            belonging.categoryId
                                        )}
                                    </span>

                                </td>

                                {/* ======================= */}
                                {/* CANTIDAD */}
                                {/* ======================= */}

                                <td>

                                    <span className="belongings-table__quantity">
                                        {Number(
                                            belonging.quantity || 0
                                        ).toLocaleString("es-CL")}
                                    </span>

                                </td>

                                {/* ======================= */}
                                {/* UBICACIÓN */}
                                {/* ======================= */}

                                <td>

                                    <span className="belongings-table__secondary">
                                        {getLocationName(
                                            belonging.locationId
                                        )}
                                    </span>

                                </td>

                                {/* ======================= */}
                                {/* ESTADO */}
                                {/* ======================= */}

                                <td>

                                    <span
                                        className={`belongings-table__condition belongings-table__condition--${getConditionClass(
                                            belonging.condition
                                        )}`}
                                    >
                                        {getCondition(
                                            belonging.condition
                                        )}
                                    </span>

                                </td>

                                {/* ======================= */}
                                {/* ACCIONES */}
                                {/* ======================= */}

                                <td>

                                    <div className="belongings-table__actions">

                                        {/* VER DETALLE */}

                                        <button
                                            type="button"
                                            className="belongings-table__action"
                                            onClick={() =>
                                                onView?.(belonging)
                                            }
                                            aria-label={`Ver ${belonging.name}`}
                                            title="Ver detalle"
                                            disabled={!onView}
                                        >
                                            <Eye size={17} />
                                        </button>

                                        {/* EDITAR BIEN */}

                                        <button
                                            type="button"
                                            className="belongings-table__action"
                                            onClick={() =>
                                                onEdit?.(belonging)
                                            }
                                            aria-label={`Editar ${belonging.name}`}
                                            title="Editar bien"
                                            disabled={!onEdit}
                                        >
                                            <Pencil size={16} />
                                        </button>

                                        {/* ELIMINAR BIEN */}

                                        <button
                                            type="button"
                                            className="belongings-table__action belongings-table__action--delete"
                                            onClick={() =>
                                                onDelete?.(belonging)
                                            }
                                            aria-label={`Eliminar ${belonging.name}`}
                                            title="Eliminar bien"
                                            disabled={!onDelete}
                                        >
                                            <Trash2 size={17} />
                                        </button>

                                    </div>

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </div>
    );
}

export default BelongingsTable;
