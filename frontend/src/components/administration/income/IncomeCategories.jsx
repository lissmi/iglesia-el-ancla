// =========================================================
// IMPORTACIONES
// =========================================================

import { useMemo, useState } from "react";

import {
    LayoutGrid,
    HandCoins,
    HeartHandshake,
    Gift,
    CalendarDays,
    CircleDollarSign,
    ChevronDown,
    ChevronUp,
    ReceiptText,
} from "lucide-react";

import "../../../styles/components/administration/income/IncomeCategories.css";


// =========================================================
// CONFIGURACIÓN DE CATEGORÍAS
// =========================================================

const INCOME_CATEGORIES = [
    {
        id: "tithes",
        name: "Diezmos",
        description: "Aportes correspondientes a diezmos.",
        icon: HandCoins,
        color: "#2c8199",
    },
    {
        id: "offerings",
        name: "Ofrendas",
        description: "Ofrendas recibidas durante las reuniones.",
        icon: HeartHandshake,
        color: "#17384c",
    },
    {
        id: "donations",
        name: "Donaciones",
        description: "Donaciones y aportes voluntarios.",
        icon: Gift,
        color: "#49a99a",
    },
    {
        id: "activities",
        name: "Actividades",
        description: "Ingresos provenientes de actividades.",
        icon: CalendarDays,
        color: "#d59b52",
    },
    {
        id: "other",
        name: "Otros ingresos",
        description: "Otros recursos recibidos por la iglesia.",
        icon: CircleDollarSign,
        color: "#8b83b7",
    },
];


// =========================================================
// FORMATO DE MONEDA
// =========================================================

const formatCurrency = (amount) => {

    return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0,
    }).format(amount);

};


// =========================================================
// FECHA LOCAL
// =========================================================

const getLocalDate = (date) => {

    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;

};


// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function IncomeCategories({
    incomes = [],
}) {

    // =====================================================
    // ESTADOS
    // =====================================================

    const [selectedPeriod, setSelectedPeriod] = useState(
        "month"
    );

    const [showAll, setShowAll] = useState(false);


    // =====================================================
    // FECHA ACTUAL
    // =====================================================

    const today = new Date();

    const currentYear = today.getFullYear();

    const currentMonth = today.getMonth() + 1;

    const todayKey = getLocalDate(today);


    // =====================================================
    // FILTRAR INGRESOS POR PERÍODO
    // =====================================================

    const periodIncomes = useMemo(() => {

        return incomes.filter((income) => {

            // Solo ingresos recibidos.
            if (
                income.status &&
                income.status !== "received"
            ) {
                return false;
            }

            // Validación del monto.
            const amount = Number(income.amount);

            if (
                !Number.isFinite(amount) ||
                amount <= 0
            ) {
                return false;
            }

            // Validación de fecha.
            if (
                typeof income.date !== "string" ||
                !/^\d{4}-\d{2}-\d{2}$/.test(income.date)
            ) {
                return false;
            }

            // Excluir ingresos futuros.
            if (income.date > todayKey) {
                return false;
            }

            const year = Number(
                income.date.slice(0, 4)
            );

            const month = Number(
                income.date.slice(5, 7)
            );


            // ============================================
            // FILTRO MENSUAL
            // ============================================

            if (selectedPeriod === "month") {

                return (
                    year === currentYear &&
                    month === currentMonth
                );

            }


            // ============================================
            // FILTRO ANUAL
            // ============================================

            if (selectedPeriod === "year") {

                return year === currentYear;

            }


            // ============================================
            // TODOS LOS PERÍODOS
            // ============================================

            return true;

        });

    }, [
        incomes,
        selectedPeriod,
        currentYear,
        currentMonth,
        todayKey,
    ]);


    // =====================================================
    // CALCULAR TOTALES POR CATEGORÍA
    // =====================================================

    const categorySummary = useMemo(() => {

        const totals = INCOME_CATEGORIES.map(
            (category) => ({
                ...category,
                total: 0,
                movements: 0,
                percentage: 0,
            })
        );

        periodIncomes.forEach((income) => {

            const categoryId = INCOME_CATEGORIES.some(
                (category) =>
                    category.id === income.category
            )
                ? income.category
                : "other";

            const category = totals.find(
                (item) => item.id === categoryId
            );

            if (category) {

                category.total += Number(income.amount);

                category.movements += 1;

            }

        });


        // ================================================
        // TOTAL GENERAL
        // ================================================

        const grandTotal = totals.reduce(
            (sum, category) =>
                sum + category.total,
            0
        );


        // ================================================
        // PORCENTAJE DE PARTICIPACIÓN
        // ================================================

        totals.forEach((category) => {

            category.percentage =
                grandTotal > 0
                    ? (category.total / grandTotal) * 100
                    : 0;

        });


        // ================================================
        // ORDENAR POR MAYOR MONTO
        // ================================================

        totals.sort(
            (a, b) => b.total - a.total
        );

        return {
            categories: totals,
            grandTotal,
            totalMovements: periodIncomes.length,
        };

    }, [periodIncomes]);


    // =====================================================
    // CATEGORÍAS VISIBLES
    // =====================================================

    const visibleCategories = showAll
        ? categorySummary.categories
        : categorySummary.categories.slice(0, 4);


    // =====================================================
    // INTERFAZ
    // =====================================================

    return (
        <section
            className="income-categories"
            aria-labelledby="income-categories-title"
        >

            {/* =========================================== */}
            {/* ENCABEZADO */}
            {/* =========================================== */}

            <div className="income-categories__header">

                <div className="income-categories__heading">

                    <div className="income-categories__heading-icon">

                        <LayoutGrid
                            size={20}
                            aria-hidden="true"
                        />

                    </div>

                    <div>

                        <h2 id="income-categories-title">
                            Ingresos por categoría
                        </h2>

                        <p>
                            Consulta el origen de los recursos
                            económicos recibidos.
                        </p>

                    </div>

                </div>


                {/* ======================================= */}
                {/* FILTRO DE PERÍODO */}
                {/* ======================================= */}

                <div className="income-categories__period">

                    <label htmlFor="income-categories-period">
                        Período
                    </label>

                    <select
                        id="income-categories-period"
                        value={selectedPeriod}
                        onChange={(event) =>
                            setSelectedPeriod(
                                event.target.value
                            )
                        }
                    >

                        <option value="month">
                            Este mes
                        </option>

                        <option value="year">
                            Este año
                        </option>

                        <option value="all">
                            Histórico
                        </option>

                    </select>

                </div>

            </div>


            {/* =========================================== */}
            {/* RESUMEN DEL PERÍODO */}
            {/* =========================================== */}

            <div className="income-categories__summary">

                <div>

                    <span>
                        Total de ingresos
                    </span>

                    <strong>
                        {formatCurrency(
                            categorySummary.grandTotal
                        )}
                    </strong>

                </div>

                <div className="income-categories__summary-count">

                    <ReceiptText
                        size={16}
                        aria-hidden="true"
                    />

                    {categorySummary.totalMovements}{" "}
                    {categorySummary.totalMovements === 1
                        ? "movimiento"
                        : "movimientos"}

                </div>

            </div>


            {/* =========================================== */}
            {/* TARJETAS POR CATEGORÍA */}
            {/* =========================================== */}

            <div className="income-categories__grid">

                {visibleCategories.map((category) => {

                    const CategoryIcon = category.icon;

                    return (

                        <article
                            className="income-categories__card"
                            key={category.id}
                        >

                            {/* ================================= */}
                            {/* ENCABEZADO DE TARJETA */}
                            {/* ================================= */}

                            <div className="income-categories__card-header">

                                <div
                                    className="income-categories__card-icon"
                                    style={{
                                        color: category.color,
                                        backgroundColor:
                                            `${category.color}14`,
                                    }}
                                >

                                    <CategoryIcon
                                        size={21}
                                        strokeWidth={1.8}
                                        aria-hidden="true"
                                    />

                                </div>

                                <div className="income-categories__card-heading">

                                    <h3>
                                        {category.name}
                                    </h3>

                                    <p>
                                        {category.description}
                                    </p>

                                </div>

                            </div>


                            {/* ================================= */}
                            {/* MONTO TOTAL */}
                            {/* ================================= */}

                            <strong className="income-categories__amount">
                                {formatCurrency(category.total)}
                            </strong>


                            {/* ================================= */}
                            {/* MOVIMIENTOS Y PORCENTAJE */}
                            {/* ================================= */}

                            <div className="income-categories__details">

                                <span>
                                    {category.movements}{" "}
                                    {category.movements === 1
                                        ? "movimiento"
                                        : "movimientos"}
                                </span>

                                <strong>
                                    {category.percentage.toLocaleString(
                                        "es-CL",
                                        {
                                            maximumFractionDigits: 1,
                                        }
                                    )}%
                                </strong>

                            </div>


                            {/* ================================= */}
                            {/* BARRA DE PARTICIPACIÓN */}
                            {/* ================================= */}

                            <div
                                className="income-categories__progress"
                                role="progressbar"
                                aria-label={
                                    `Participación de ${category.name}`
                                }
                                aria-valuenow={
                                    Number(
                                        category.percentage.toFixed(1)
                                    )
                                }
                                aria-valuemin={0}
                                aria-valuemax={100}
                            >

                                <div
                                    className="income-categories__progress-fill"
                                    style={{
                                        width:
                                            `${category.percentage}%`,
                                        backgroundColor:
                                            category.color,
                                    }}
                                />

                            </div>

                        </article>

                    );

                })}

            </div>


            {/* =========================================== */}
            {/* MOSTRAR TODAS LAS CATEGORÍAS */}
            {/* =========================================== */}

            {categorySummary.categories.length > 4 && (

                <div className="income-categories__footer">

                    <button
                        type="button"
                        className="income-categories__toggle"
                        onClick={() =>
                            setShowAll((previous) => !previous)
                        }
                    >

                        {showAll ? (

                            <>
                                <ChevronUp
                                    size={17}
                                    aria-hidden="true"
                                />

                                Mostrar menos
                            </>

                        ) : (

                            <>
                                <ChevronDown
                                    size={17}
                                    aria-hidden="true"
                                />

                                Ver todas las categorías
                            </>

                        )}

                    </button>

                </div>

            )}

        </section>
    );
}

export default IncomeCategories;