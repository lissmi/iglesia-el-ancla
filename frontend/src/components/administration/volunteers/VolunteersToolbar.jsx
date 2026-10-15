// =========================================================
// IMPORTACIONES
// =========================================================

import {
    Search,
    SlidersHorizontal,
    ArrowUpDown,
    RotateCcw,
    CalendarDays,
} from "lucide-react";

// Importamos los estilos exclusivos del componente.
import "../../../styles/components/administration/volunteers/VolunteersToolbar.css";


// =========================================================
// OPCIONES DE FILTROS
// =========================================================

const STATUS_OPTIONS = [
    { value: "all", label: "Todos los estados" },
    { value: "pending", label: "Pendiente de confirmación" },
    { value: "confirmed", label: "Confirmado" },
    { value: "declined", label: "No disponible" },
    { value: "unassigned", label: "Sin voluntario" },
    { value: "cancelled", label: "Cancelado" },
];

const DATE_OPTIONS = [
    { value: "all", label: "Todas las fechas" },
    { value: "today", label: "Hoy" },
    { value: "week", label: "Esta semana" },
    { value: "month", label: "Este mes" },
    { value: "upcoming", label: "Próximas asignaciones" },
    { value: "past", label: "Asignaciones anteriores" },
];

const SORT_OPTIONS = [
    { value: "date_asc", label: "Fecha: más próxima" },
    { value: "date_desc", label: "Fecha: más lejana" },
    { value: "volunteer_asc", label: "Voluntario: A - Z" },
    { value: "volunteer_desc", label: "Voluntario: Z - A" },
    { value: "team_asc", label: "Equipo: A - Z" },
];


// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function VolunteersToolbar({
    searchTerm = "",
    onSearchChange,
    statusFilter = "all",
    onStatusChange,
    dateFilter = "all",
    onDateChange,
    sortBy = "date_asc",
    onSortChange,
    onClearFilters,
}) {

    // =====================================================
    // IDENTIFICACIÓN DE FILTROS ACTIVOS
    // =====================================================

    const hasActiveFilters =
        searchTerm.trim() !== "" ||
        statusFilter !== "all" ||
        dateFilter !== "all" ||
        sortBy !== "date_asc";


    // =====================================================
    // INTERFAZ
    // =====================================================

    return (
        <section
            className="volunteers-toolbar"
            aria-label="Herramientas de búsqueda y filtrado de asignaciones"
        >

            {/* =========================================== */}
            {/* ENCABEZADO */}
            {/* =========================================== */}

            <div className="volunteers-toolbar__heading">

                <div className="volunteers-toolbar__heading-info">

                    <div className="volunteers-toolbar__heading-icon">
                        <SlidersHorizontal
                            size={19}
                            strokeWidth={1.8}
                            aria-hidden="true"
                        />
                    </div>

                    <div>
                        <h2>Buscar y filtrar asignaciones</h2>

                        <p>
                            Encuentra turnos por voluntario,
                            responsabilidad, fecha o estado.
                        </p>
                    </div>

                </div>

                <button
                    className="volunteers-toolbar__clear"
                    type="button"
                    onClick={() => onClearFilters?.()}
                    disabled={!hasActiveFilters || !onClearFilters}
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

            <div className="volunteers-toolbar__controls">

                {/* Búsqueda general. */}
                <div className="volunteers-toolbar__field volunteers-toolbar__field--search">

                    <label htmlFor="volunteers-search">
                        Buscar asignación
                    </label>

                    <div className="volunteers-toolbar__input-wrapper">

                        <Search
                            size={18}
                            aria-hidden="true"
                        />

                        <input
                            id="volunteers-search"
                            type="search"
                            placeholder="Voluntario, responsabilidad o actividad..."
                            value={searchTerm}
                            onChange={(event) =>
                                onSearchChange?.(event.target.value)
                            }
                        />

                    </div>

                </div>


                {/* Estado de confirmación. */}
                <div className="volunteers-toolbar__field">

                    <label htmlFor="volunteers-status">
                        Estado
                    </label>

                    <div className="volunteers-toolbar__select-wrapper">

                        <select
                            id="volunteers-status"
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


                {/* Filtro por período. */}
                <div className="volunteers-toolbar__field">

                    <label htmlFor="volunteers-date">
                        Período
                    </label>

                    <div className="volunteers-toolbar__select-wrapper">

                        <CalendarDays
                            size={16}
                            aria-hidden="true"
                        />

                        <select
                            id="volunteers-date"
                            value={dateFilter}
                            onChange={(event) =>
                                onDateChange?.(event.target.value)
                            }
                        >
                            {DATE_OPTIONS.map((option) => (
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
                <div className="volunteers-toolbar__field">

                    <label htmlFor="volunteers-sort">
                        Ordenar por
                    </label>

                    <div className="volunteers-toolbar__select-wrapper">

                        <ArrowUpDown
                            size={16}
                            aria-hidden="true"
                        />

                        <select
                            id="volunteers-sort"
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

export default VolunteersToolbar;