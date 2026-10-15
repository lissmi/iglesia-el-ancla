// =========================================================
// IMPORTACIONES
// =========================================================

import {
    useMemo,
    useState,
} from "react";

import {
    ChartPie,
    Layers3,
    ReceiptText,
    Wallet,
} from "lucide-react";

import {
    formatExpenseCurrency,
    getExpenseLocalDate,
    isPaidExpense,
    isValidExpenseAmount,
} from "../../../utils/expenseUtils";

import "../../../styles/components/administration/expenses/ExpenseCategories.css";


// =========================================================
// CONFIGURACIÓN DE COLORES
// =========================================================

// Utilizamos colores asociados a la identidad
// visual de Iglesia El Ancla.

const CATEGORY_COLORS = [
    "#2c8199",
    "#17384c",
    "#49a99a",
    "#e0a65c",
    "#8b83b7",
    "#638bb5",
    "#ba8585",
    "#7896a5",
];


// =========================================================
// OPCIONES DE PERÍODO
// =========================================================

const PERIOD_OPTIONS = [
    {
        value: "month",
        label: "Este mes",
    },
    {
        value: "year",
        label: "Este año",
    },
    {
        value: "all",
        label: "Histórico",
    },
];


// =========================================================
// VALIDAR FECHA
// =========================================================

const isValidDate = (value) => {

    if (
        typeof value !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
        return false;
    }

    const parsedDate = new Date(`${value}T12:00:00`);

    return (
        !Number.isNaN(parsedDate.getTime()) &&
        getExpenseLocalDate(parsedDate) === value
    );

};


// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function ExpenseCategories({
    expenses = [],
}) {

    // =====================================================
    // PERÍODO SELECCIONADO
    // =====================================================

    const [selectedPeriod, setSelectedPeriod] =
        useState("year");


    // =====================================================
    // FECHA ACTUAL
    // =====================================================

    const today = getExpenseLocalDate();

    const currentMonth = today.slice(0, 7);

    const currentYear = today.slice(0, 4);


    // =====================================================
    // FILTRAR GASTOS
    // =====================================================

    const filteredExpenses = useMemo(() => {

        return expenses.filter((expense) => {

            // --------------------------------------------
            // SOLO GASTOS PAGADOS
            // --------------------------------------------

            if (!isPaidExpense(expense)) {
                return false;
            }


            // --------------------------------------------
            // VALIDAR MONTO
            // --------------------------------------------

            if (!isValidExpenseAmount(expense.amount)) {
                return false;
            }


            // --------------------------------------------
            // VALIDAR FECHA
            // --------------------------------------------

            if (!isValidDate(expense.date)) {
                return false;
            }


            // --------------------------------------------
            // EXCLUIR FECHAS FUTURAS
            // --------------------------------------------

            if (expense.date > today) {
                return false;
            }


            // --------------------------------------------
            // FILTRAR PERÍODO
            // --------------------------------------------

            if (selectedPeriod === "month") {

                return (
                    expense.date.slice(0, 7) ===
                    currentMonth
                );

            }

            if (selectedPeriod === "year") {

                return (
                    expense.date.slice(0, 4) ===
                    currentYear
                );

            }

            return true;

        });

    }, [
        expenses,
        selectedPeriod,
        today,
        currentMonth,
        currentYear,
    ]);


    // =====================================================
    // AGRUPAR GASTOS POR CATEGORÍA
    // =====================================================

    const categoryData = useMemo(() => {

        const categories = new Map();

        filteredExpenses.forEach((expense) => {

            const category =
                typeof expense.category === "string" &&
                expense.category.trim()
                    ? expense.category.trim()
                    : "Sin categoría";


            // --------------------------------------------
            // CREAR CATEGORÍA
            // --------------------------------------------

            if (!categories.has(category)) {

                categories.set(category, {
                    name: category,
                    amount: 0,
                    count: 0,
                });

            }


            // --------------------------------------------
            // ACUMULAR INFORMACIÓN
            // --------------------------------------------

            const current = categories.get(category);

            current.amount += Number(expense.amount);

            current.count += 1;

        });


        // --------------------------------------------
        // ORDENAR POR MAYOR MONTO
        // --------------------------------------------

        return [...categories.values()].sort(
            (a, b) => b.amount - a.amount
        );

    }, [filteredExpenses]);


    // =====================================================
    // TOTAL PAGADO
    // =====================================================

    const totalAmount = useMemo(() => {

        return categoryData.reduce(
            (total, category) =>
                total + category.amount,
            0
        );

    }, [categoryData]);


    // =====================================================
    // CATEGORÍAS CON PORCENTAJES
    // =====================================================

    const categoriesWithPercentages = useMemo(() => {

        return categoryData.map((category, index) => {

            const percentage =
                totalAmount > 0
                    ? (category.amount / totalAmount) * 100
                    : 0;

            return {
                ...category,

                percentage,

                color:
                    CATEGORY_COLORS[
                        index % CATEGORY_COLORS.length
                    ],
            };

        });

    }, [categoryData, totalAmount]);


    // =====================================================
    // INTERFAZ
    // =====================================================

    return (
        <section
            className="expense-categories"
            aria-label="Distribución de gastos por categoría"
        >

            {/* =========================================== */}
            {/* ENCABEZADO */}
            {/* =========================================== */}

            <div className="expense-categories__header">

                <div className="expense-categories__heading">

                    <span className="expense-categories__eyebrow">

                        <ChartPie
                            size={15}
                            aria-hidden="true"
                        />

                        Distribución financiera

                    </span>

                    <h2 className="expense-categories__title">
                        Gastos por categoría
                    </h2>

                    <p className="expense-categories__description">
                        Consulta cómo se distribuyen los
                        recursos utilizados por la iglesia.
                    </p>

                </div>


                {/* ======================================= */}
                {/* SELECTOR DE PERÍODO */}
                {/* ======================================= */}

                <div className="expense-categories__period">

                    <label htmlFor="expense-category-period">
                        Período
                    </label>

                    <select
                        id="expense-category-period"
                        value={selectedPeriod}
                        onChange={(event) =>
                            setSelectedPeriod(event.target.value)
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

            </div>


            {/* =========================================== */}
            {/* INDICADORES GENERALES */}
            {/* =========================================== */}

            <div className="expense-categories__summary">

                {/* TOTAL DISTRIBUIDO */}

                <div className="expense-categories__summary-item">

                    <div className="expense-categories__summary-icon">

                        <Wallet
                            size={20}
                            aria-hidden="true"
                        />

                    </div>

                    <div>

                        <span>
                            Total distribuido
                        </span>

                        <strong>
                            {formatExpenseCurrency(totalAmount)}
                        </strong>

                    </div>

                </div>


                {/* CATEGORÍAS UTILIZADAS */}

                <div className="expense-categories__summary-item">

                    <div className="expense-categories__summary-icon">

                        <Layers3
                            size={20}
                            aria-hidden="true"
                        />

                    </div>

                    <div>

                        <span>
                            Categorías utilizadas
                        </span>

                        <strong>
                            {categoryData.length.toLocaleString(
                                "es-CL"
                            )}
                        </strong>

                    </div>

                </div>


                {/* MOVIMIENTOS */}

                <div className="expense-categories__summary-item">

                    <div className="expense-categories__summary-icon">

                        <ReceiptText
                            size={20}
                            aria-hidden="true"
                        />

                    </div>

                    <div>

                        <span>
                            Gastos pagados
                        </span>

                        <strong>
                            {filteredExpenses.length.toLocaleString(
                                "es-CL"
                            )}
                        </strong>

                    </div>

                </div>

            </div>


            {/* =========================================== */}
            {/* DISTRIBUCIÓN POR CATEGORÍA */}
            {/* =========================================== */}

            <div className="expense-categories__card">

                <div className="expense-categories__card-header">

                    <div>

                        <h3>
                            Distribución de recursos
                        </h3>

                        <p>
                            Participación de cada categoría
                            sobre el total pagado.
                        </p>

                    </div>

                    <span className="expense-categories__count">
                        {categoryData.length} categorías
                    </span>

                </div>


                {/* ======================================= */}
                {/* LISTADO */}
                {/* ======================================= */}

                {categoriesWithPercentages.length > 0 ? (

                    <div className="expense-categories__list">

                        {categoriesWithPercentages.map((category) => (

                            <article
                                className="expense-categories__item"
                                key={category.name}
                            >

                                {/* ======================= */}
                                {/* INFORMACIÓN SUPERIOR */}
                                {/* ======================= */}

                                <div className="expense-categories__item-header">

                                    <div className="expense-categories__item-name">

                                        <span
                                            className="expense-categories__dot"
                                            style={{
                                                backgroundColor:
                                                    category.color,
                                            }}
                                        />

                                        <strong>
                                            {category.name}
                                        </strong>

                                    </div>


                                    <div className="expense-categories__item-amount">

                                        <strong>
                                            {formatExpenseCurrency(
                                                category.amount
                                            )}
                                        </strong>

                                        <span>
                                            {category.percentage.toLocaleString(
                                                "es-CL",
                                                {
                                                    minimumFractionDigits: 1,
                                                    maximumFractionDigits: 1,
                                                }
                                            )}%
                                        </span>

                                    </div>

                                </div>


                                {/* ======================= */}
                                {/* BARRA DE DISTRIBUCIÓN */}
                                {/* ======================= */}

                                <div
                                    className="expense-categories__progress"
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
                                        className="expense-categories__progress-fill"
                                        style={{
                                            width:
                                                `${category.percentage}%`,

                                            backgroundColor:
                                                category.color,
                                        }}
                                    />

                                </div>


                                {/* ======================= */}
                                {/* CANTIDAD DE REGISTROS */}
                                {/* ======================= */}

                                <span className="expense-categories__movements">

                                    {category.count}{" "}

                                    {category.count === 1
                                        ? "movimiento registrado"
                                        : "movimientos registrados"
                                    }

                                </span>

                            </article>

                        ))}

                    </div>

                ) : (

                    // =====================================
                    // ESTADO SIN DATOS
                    // =====================================

                    <div className="expense-categories__empty">

                        <ChartPie
                            size={35}
                            strokeWidth={1.5}
                            aria-hidden="true"
                        />

                        <strong>
                            No hay gastos para este período
                        </strong>

                        <p>
                            No se encontraron gastos pagados
                            en el período seleccionado.
                        </p>

                    </div>

                )}

            </div>

        </section>
    );
}

export default ExpenseCategories;