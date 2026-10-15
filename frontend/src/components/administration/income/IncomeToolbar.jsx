// =========================================================
// IMPORTACIONES
// =========================================================

import {
    Search,
    Filter,
    CalendarDays,
    CreditCard,
    ArrowDownUp,
    RotateCcw,
    ListFilter,
} from "lucide-react";

import "../../../styles/components/administration/income/IncomeToolbar.css";


// =========================================================
// OPCIONES DE CATEGORÍAS
// =========================================================

const CATEGORY_OPTIONS = [
    {
        value: "all",
        label: "Todas las categorías",
    },
    {
        value: "tithes",
        label: "Diezmos",
    },
    {
        value: "offerings",
        label: "Ofrendas",
    },
    {
        value: "donations",
        label: "Donaciones",
    },
    {
        value: "activities",
        label: "Actividades",
    },
    {
        value: "other",
        label: "Otros ingresos",
    },
];


// =========================================================
// OPCIONES DE PERÍODO
// =========================================================

const PERIOD_OPTIONS = [
    {
        value: "all",
        label: "Todos los períodos",
    },
    {
        value: "today",
        label: "Hoy",
    },
    {
        value: "week",
        label: "Esta semana",
    },
    {
        value: "month",
        label: "Este mes",
    },
    {
        value: "year",
        label: "Este año",
    },
    {
        value: "custom",
        label: "Rango personalizado",
    },
];


// =========================================================
// OPCIONES DE MEDIO DE RECEPCIÓN
// =========================================================

const PAYMENT_OPTIONS = [
    {
        value: "all",
        label: "Todos los medios",
    },
    {
        value: "cash",
        label: "Efectivo",
    },
    {
        value: "transfer",
        label: "Transferencia",
    },
    {
        value: "card",
        label: "Tarjeta",
    },
    {
        value: "other",
        label: "Otro medio",
    },
];


// =========================================================
// OPCIONES DE ORDENAMIENTO
// =========================================================

const SORT_OPTIONS = [
    {
        value: "date_desc",
        label: "Más recientes primero",
    },
    {
        value: "date_asc",
        label: "Más antiguos primero",
    },
    {
        value: "amount_desc",
        label: "Mayor monto",
    },
    {
        value: "amount_asc",
        label: "Menor monto",
    },
    {
        value: "concept_asc",
        label: "Concepto A-Z",
    },
    {
        value: "concept_desc",
        label: "Concepto Z-A",
    },
];


// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function IncomeToolbar({

    searchTerm = "",
    onSearchChange,

    categoryFilter = "all",
    onCategoryChange,

    periodFilter = "all",
    onPeriodChange,

    paymentFilter = "all",
    onPaymentChange,

    sortBy = "date_desc",
    onSortChange,

    startDate = "",
    onStartDateChange,

    endDate = "",
    onEndDateChange,

    resultsCount = 0,
    totalCount = 0,

    onClearFilters,

}) {

    // =====================================================
    // VERIFICAR FILTROS ACTIVOS
    // =====================================================

    const hasActiveFilters =
        searchTerm.trim() !== "" ||
        categoryFilter !== "all" ||
        periodFilter !== "all" ||
        paymentFilter !== "all" ||
        sortBy !== "date_desc" ||
        startDate !== "" ||
        endDate !== "";


    // =====================================================
    // INTERFAZ
    // =====================================================

    return (
        <section
            className="income-toolbar"
            aria-labelledby="income-toolbar-title"
        >

            {/* =========================================== */}
            {/* ENCABEZADO */}
            {/* =========================================== */}

            <div className="income-toolbar__header">

                <div className="income-toolbar__heading">

                    <div className="income-toolbar__heading-icon">

                        <ListFilter
                            size={20}
                            aria-hidden="true"
                        />

                    </div>

                    <div>

                        <h2 id="income-toolbar-title">
                            Movimientos de ingresos
                        </h2>

                        <p>
                            Busca, filtra y organiza los
                            registros financieros.
                        </p>

                    </div>

                </div>

                <div className="income-toolbar__total">

                    <span>Total de registros</span>

                    <strong>
                        {totalCount.toLocaleString("es-CL")}
                    </strong>

                </div>

            </div>


            {/* =========================================== */}
            {/* PANEL DE FILTROS */}
            {/* =========================================== */}

            <div className="income-toolbar__panel">

                {/* ======================================= */}
                {/* BUSCADOR */}
                {/* ======================================= */}

                <div className="income-toolbar__search">

                    <label
                        htmlFor="income-toolbar-search"
                        className="income-toolbar__label"
                    >
                        Buscar ingreso
                    </label>

                    <div className="income-toolbar__input-wrapper">

                        <Search
                            size={18}
                            aria-hidden="true"
                        />

                        <input
                            id="income-toolbar-search"
                            type="search"
                            value={searchTerm}
                            onChange={(event) =>
                                onSearchChange?.(
                                    event.target.value
                                )
                            }
                            placeholder="Concepto, referencia o responsable..."
                            autoComplete="off"
                        />

                    </div>

                </div>


                {/* ======================================= */}
                {/* CUADRÍCULA DE FILTROS */}
                {/* ======================================= */}

                <div className="income-toolbar__filters-grid">

                    {/* =================================== */}
                    {/* CATEGORÍA */}
                    {/* =================================== */}

                    <div className="income-toolbar__field">

                        <label
                            htmlFor="income-toolbar-category"
                            className="income-toolbar__label"
                        >
                            <Filter
                                size={14}
                                aria-hidden="true"
                            />

                            Categoría
                        </label>

                        <select
                            id="income-toolbar-category"
                            value={categoryFilter}
                            onChange={(event) =>
                                onCategoryChange?.(
                                    event.target.value
                                )
                            }
                        >

                            {CATEGORY_OPTIONS.map((option) => (

                                <option
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </option>

                            ))}

                        </select>

                    </div>


                    {/* =================================== */}
                    {/* PERÍODO */}
                    {/* =================================== */}

                    <div className="income-toolbar__field">

                        <label
                            htmlFor="income-toolbar-period"
                            className="income-toolbar__label"
                        >
                            <CalendarDays
                                size={14}
                                aria-hidden="true"
                            />

                            Período
                        </label>

                        <select
                            id="income-toolbar-period"
                            value={periodFilter}
                            onChange={(event) =>
                                onPeriodChange?.(
                                    event.target.value
                                )
                            }
                        >

                            {PERIOD_OPTIONS.map((option) => (

                                <option
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </option>

                            ))}

                        </select>

                    </div>


                    {/* =================================== */}
                    {/* MEDIO DE RECEPCIÓN */}
                    {/* =================================== */}

                    <div className="income-toolbar__field">

                        <label
                            htmlFor="income-toolbar-payment"
                            className="income-toolbar__label"
                        >
                            <CreditCard
                                size={14}
                                aria-hidden="true"
                            />

                            Medio de recepción
                        </label>

                        <select
                            id="income-toolbar-payment"
                            value={paymentFilter}
                            onChange={(event) =>
                                onPaymentChange?.(
                                    event.target.value
                                )
                            }
                        >

                            {PAYMENT_OPTIONS.map((option) => (

                                <option
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </option>

                            ))}

                        </select>

                    </div>


                    {/* =================================== */}
                    {/* ORDENAMIENTO */}
                    {/* =================================== */}

                    <div className="income-toolbar__field">

                        <label
                            htmlFor="income-toolbar-sort"
                            className="income-toolbar__label"
                        >
                            <ArrowDownUp
                                size={14}
                                aria-hidden="true"
                            />

                            Ordenar por
                        </label>

                        <select
                            id="income-toolbar-sort"
                            value={sortBy}
                            onChange={(event) =>
                                onSortChange?.(
                                    event.target.value
                                )
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


                {/* ======================================= */}
                {/* RANGO PERSONALIZADO */}
                {/* ======================================= */}

                {periodFilter === "custom" && (

                    <div className="income-toolbar__date-range">

                        <div className="income-toolbar__field">

                            <label
                                htmlFor="income-toolbar-start"
                                className="income-toolbar__label"
                            >
                                Fecha desde
                            </label>

                            <input
                                id="income-toolbar-start"
                                type="date"
                                value={startDate}
                                max={endDate || undefined}
                                onChange={(event) =>
                                    onStartDateChange?.(
                                        event.target.value
                                    )
                                }
                            />

                        </div>

                        <div className="income-toolbar__field">

                            <label
                                htmlFor="income-toolbar-end"
                                className="income-toolbar__label"
                            >
                                Fecha hasta
                            </label>

                            <input
                                id="income-toolbar-end"
                                type="date"
                                value={endDate}
                                min={startDate || undefined}
                                onChange={(event) =>
                                    onEndDateChange?.(
                                        event.target.value
                                    )
                                }
                            />

                        </div>

                    </div>

                )}


                {/* ======================================= */}
                {/* PIE DEL PANEL */}
                {/* ======================================= */}

                <div className="income-toolbar__footer">

                    <div
                        className="income-toolbar__results"
                        role="status"
                        aria-live="polite"
                    >

                        <strong>
                            {resultsCount.toLocaleString("es-CL")}
                        </strong>

                        <span>
                            {resultsCount === 1
                                ? "movimiento encontrado"
                                : "movimientos encontrados"}
                        </span>

                    </div>


                    <button
                        type="button"
                        className="income-toolbar__clear"
                        onClick={onClearFilters}
                        disabled={!hasActiveFilters}
                    >

                        <RotateCcw
                            size={15}
                            aria-hidden="true"
                        />

                        Limpiar filtros

                    </button>

                </div>

            </div>

        </section>
    );
}

export default IncomeToolbar;