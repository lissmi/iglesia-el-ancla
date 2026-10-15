// =========================================================
// IMPORTACIONES
// =========================================================

import {
    useMemo,
    useState,
} from "react";

import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";

import {
    BarChart3,
    CalendarDays,
    CreditCard,
    PieChart as PieChartIcon,
} from "lucide-react";

import {
    formatExpenseCurrency,
    getExpenseLocalDate,
    isPaidExpense,
    isValidExpenseAmount,
} from "../../../utils/expenseUtils";

import "../../../styles/components/administration/expenses/ExpenseCharts.css";


// =========================================================
// CONFIGURACIÓN
// =========================================================

const MONTHS = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
];

const CHART_COLORS = [
    "#2c8199",
    "#17384c",
    "#49a99a",
    "#e0a65c",
    "#8b83b7",
    "#638bb5",
    "#ba8585",
];


// =========================================================
// VALIDAR FECHA
// =========================================================

const isValidExpenseDate = (value) => {

    if (
        typeof value !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
        return false;
    }

    const date = new Date(`${value}T12:00:00`);

    return (
        !Number.isNaN(date.getTime()) &&
        getExpenseLocalDate(date) === value
    );

};


// =========================================================
// TOOLTIP PERSONALIZADO
// =========================================================

function ExpenseChartTooltip({
    active,
    payload,
    label,
}) {

    if (!active || !payload?.length) {
        return null;
    }

    const item = payload[0];

    return (
        <div className="expense-chart-tooltip">

            <span className="expense-chart-tooltip__label">
                {label || item.name || item.payload?.name}
            </span>

            <strong className="expense-chart-tooltip__value">
                {formatExpenseCurrency(item.value)}
            </strong>

        </div>
    );
}


// =========================================================
// GRÁFICO CIRCULAR REUTILIZABLE
// =========================================================

function ExpenseDistributionChart({
    data,
    emptyMessage,
}) {

    if (data.length === 0) {

        return (
            <div className="expense-chart-card__empty">
                {emptyMessage}
            </div>
        );

    }

    return (
        <ResponsiveContainer width="100%" height={310}>

            <PieChart>

                <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={62}
                    outerRadius={96}
                    paddingAngle={3}
                    stroke="#ffffff"
                    strokeWidth={2}
                >

                    {data.map((item, index) => (

                        <Cell
                            key={item.name}
                            fill={
                                CHART_COLORS[
                                    index % CHART_COLORS.length
                                ]
                            }
                        />

                    ))}

                </Pie>

                <Tooltip
                    content={<ExpenseChartTooltip />}
                />

                <Legend
                    verticalAlign="bottom"
                    align="center"
                    iconType="circle"
                    iconSize={9}
                />

            </PieChart>

        </ResponsiveContainer>
    );
}


// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function ExpenseCharts({
    expenses = [],
}) {

    // =====================================================
    // AÑO SELECCIONADO
    // =====================================================

    const currentYear = new Date().getFullYear();

    const [selectedYear, setSelectedYear] =
        useState(currentYear);


    // =====================================================
    // OBTENER AÑOS DISPONIBLES
    // =====================================================

    const availableYears = useMemo(() => {

        const years = new Set([currentYear]);

        expenses.forEach((expense) => {

            if (isValidExpenseDate(expense.date)) {

                const year = Number(
                    expense.date.slice(0, 4)
                );

                if (year <= currentYear) {
                    years.add(year);
                }

            }

        });

        return [...years].sort(
            (a, b) => b - a
        );

    }, [expenses, currentYear]);


    // =====================================================
    // FILTRAR GASTOS PAGADOS DEL AÑO
    // =====================================================

    const yearlyExpenses = useMemo(() => {

        const today = getExpenseLocalDate();

        return expenses.filter((expense) => {

            if (!isPaidExpense(expense)) {
                return false;
            }

            if (!isValidExpenseAmount(expense.amount)) {
                return false;
            }

            if (!isValidExpenseDate(expense.date)) {
                return false;
            }

            if (expense.date > today) {
                return false;
            }

            return (
                Number(expense.date.slice(0, 4)) ===
                selectedYear
            );

        });

    }, [expenses, selectedYear]);


    // =====================================================
    // EVOLUCIÓN MENSUAL
    // =====================================================

    const monthlyData = useMemo(() => {

        const result = MONTHS.map((month) => ({
            month,
            amount: 0,
        }));

        yearlyExpenses.forEach((expense) => {

            const monthIndex =
                Number(expense.date.slice(5, 7)) - 1;

            result[monthIndex].amount +=
                Number(expense.amount);

        });

        return result;

    }, [yearlyExpenses]);


    // =====================================================
    // DISTRIBUCIÓN POR CATEGORÍA
    // =====================================================

    const categoryData = useMemo(() => {

        const categories = {};

        yearlyExpenses.forEach((expense) => {

            const category =
                expense.category || "Sin categoría";

            categories[category] =
                (categories[category] || 0) +
                Number(expense.amount);

        });

        return Object.entries(categories)
            .map(([name, value]) => ({
                name,
                value,
            }))
            .sort((a, b) => b.value - a.value);

    }, [yearlyExpenses]);


    // =====================================================
    // DISTRIBUCIÓN POR MEDIO DE PAGO
    // =====================================================

    const paymentData = useMemo(() => {

        const methods = {};

        yearlyExpenses.forEach((expense) => {

            const method =
                expense.paymentMethod || "No especificado";

            methods[method] =
                (methods[method] || 0) +
                Number(expense.amount);

        });

        return Object.entries(methods)
            .map(([name, value]) => ({
                name,
                value,
            }))
            .sort((a, b) => b.value - a.value);

    }, [yearlyExpenses]);


    // =====================================================
    // TOTAL DEL AÑO
    // =====================================================

    const yearlyTotal = useMemo(() => {

        return yearlyExpenses.reduce(
            (total, expense) =>
                total + Number(expense.amount),
            0
        );

    }, [yearlyExpenses]);


    // =====================================================
    // INTERFAZ
    // =====================================================

    return (
        <section
            className="expense-charts"
            aria-label="Análisis financiero de gastos"
        >

            {/* =========================================== */}
            {/* ENCABEZADO GENERAL */}
            {/* =========================================== */}

            <div className="expense-charts__header">

                <div>

                    <span className="expense-charts__eyebrow">
                        Análisis financiero
                    </span>

                    <h2 className="expense-charts__title">
                        Estadísticas de gastos
                    </h2>

                    <p className="expense-charts__description">
                        Analiza la evolución y distribución
                        de los gastos pagados durante el año.
                    </p>

                </div>


                {/* SELECTOR DE AÑO */}

                <div className="expense-charts__year-control">

                    <label htmlFor="expense-chart-year">

                        <CalendarDays
                            size={16}
                            aria-hidden="true"
                        />

                        Año

                    </label>

                    <select
                        id="expense-chart-year"
                        value={selectedYear}
                        onChange={(event) =>
                            setSelectedYear(
                                Number(event.target.value)
                            )
                        }
                    >

                        {availableYears.map((year) => (

                            <option
                                key={year}
                                value={year}
                            >
                                {year}
                            </option>

                        ))}

                    </select>

                </div>

            </div>


            {/* =========================================== */}
            {/* RESUMEN DEL AÑO SELECCIONADO */}
            {/* =========================================== */}

            <div className="expense-charts__period-summary">

                <div>

                    <span>
                        Total pagado en {selectedYear}
                    </span>

                    <strong>
                        {formatExpenseCurrency(yearlyTotal)}
                    </strong>

                </div>

                <div>

                    <span>
                        Movimientos registrados
                    </span>

                    <strong>
                        {yearlyExpenses.length.toLocaleString(
                            "es-CL"
                        )}
                    </strong>

                </div>

            </div>


            {/* =========================================== */}
            {/* CUADRÍCULA DE GRÁFICOS */}
            {/* =========================================== */}

            <div className="expense-charts__grid">

                {/* ======================================= */}
                {/* EVOLUCIÓN MENSUAL */}
                {/* ======================================= */}

                <article className="expense-chart-card expense-chart-card--history">

                    <div className="expense-chart-card__header">

                        <div>

                            <span className="expense-chart-card__eyebrow">

                                <BarChart3
                                    size={15}
                                    aria-hidden="true"
                                />

                                Evolución

                            </span>

                            <h3 className="expense-chart-card__title">
                                Gastos por mes
                            </h3>

                            <p className="expense-chart-card__description">
                                Total de gastos pagados
                                mensualmente durante {selectedYear}.
                            </p>

                        </div>

                    </div>


                    <div className="expense-chart-card__content">

                        {yearlyExpenses.length > 0 ? (

                            <ResponsiveContainer
                                width="100%"
                                height={310}
                            >

                                <BarChart
                                    data={monthlyData}
                                    margin={{
                                        top: 15,
                                        right: 10,
                                        left: 5,
                                        bottom: 5,
                                    }}
                                >

                                    <CartesianGrid
                                        strokeDasharray="4 4"
                                        vertical={false}
                                        stroke="#e8edf1"
                                    />

                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{
                                            fill: "#748591",
                                            fontSize: 11,
                                        }}
                                    />

                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        width={58}
                                        tickFormatter={(value) =>
                                            `$${Math.round(value / 1000)}k`
                                        }
                                        tick={{
                                            fill: "#748591",
                                            fontSize: 11,
                                        }}
                                    />

                                    <Tooltip
                                        content={
                                            <ExpenseChartTooltip />
                                        }
                                    />

                                    <Bar
                                        dataKey="amount"
                                        name="Gastos pagados"
                                        fill="#2c8199"
                                        radius={[6, 6, 0, 0]}
                                        maxBarSize={45}
                                    />

                                </BarChart>

                            </ResponsiveContainer>

                        ) : (

                            <div className="expense-chart-card__empty">
                                No hay gastos pagados para
                                el año seleccionado.
                            </div>

                        )}

                    </div>

                </article>


                {/* ======================================= */}
                {/* CATEGORÍAS */}
                {/* ======================================= */}

                <article className="expense-chart-card expense-chart-card--categories">

                    <div className="expense-chart-card__header">

                        <div>

                            <span className="expense-chart-card__eyebrow">

                                <PieChartIcon
                                    size={15}
                                    aria-hidden="true"
                                />

                                Distribución

                            </span>

                            <h3 className="expense-chart-card__title">
                                Gastos por categoría
                            </h3>

                            <p className="expense-chart-card__description">
                                Distribución de los egresos
                                según su categoría.
                            </p>

                        </div>

                    </div>

                    <div className="expense-chart-card__content">

                        <ExpenseDistributionChart
                            data={categoryData}
                            emptyMessage="No hay categorías con gastos pagados para este año."
                        />

                    </div>

                </article>


                {/* ======================================= */}
                {/* MEDIOS DE PAGO */}
                {/* ======================================= */}

                <article className="expense-chart-card expense-chart-card--payments">

                    <div className="expense-chart-card__header">

                        <div>

                            <span className="expense-chart-card__eyebrow">

                                <CreditCard
                                    size={15}
                                    aria-hidden="true"
                                />

                                Medios de pago

                            </span>

                            <h3 className="expense-chart-card__title">
                                Distribución por pago
                            </h3>

                            <p className="expense-chart-card__description">
                                Compara los medios utilizados
                                para realizar los pagos.
                            </p>

                        </div>

                    </div>

                    <div className="expense-chart-card__content">

                        <ExpenseDistributionChart
                            data={paymentData}
                            emptyMessage="No hay medios de pago registrados para este año."
                        />

                    </div>

                </article>

            </div>

        </section>
    );
}

export default ExpenseCharts;