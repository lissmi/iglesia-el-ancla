// =========================================================
// IMPORTACIONES
// =========================================================

import { useMemo, useState } from "react";

import {
    BarChart3,
    CalendarDays,
    TrendingUp,
    PieChart as PieChartIcon,
    Wallet,
} from "lucide-react";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell,
} from "recharts";

import "../../../styles/components/administration/income/IncomeDashboard.css";


// =========================================================
// CONFIGURACIÓN GENERAL
// =========================================================

const MONTH_NAMES = [
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

const CATEGORY_CONFIG = {
    tithes: {
        label: "Diezmos",
        color: "#2c8199",
    },
    offerings: {
        label: "Ofrendas",
        color: "#17384c",
    },
    donations: {
        label: "Donaciones",
        color: "#49a99a",
    },
    activities: {
        label: "Actividades",
        color: "#e0a65c",
    },
    other: {
        label: "Otros ingresos",
        color: "#8b83b7",
    },
};

const PAYMENT_CONFIG = {
    cash: {
        label: "Efectivo",
        color: "#2c8199",
    },
    transfer: {
        label: "Transferencia",
        color: "#17384c",
    },
    card: {
        label: "Tarjeta",
        color: "#49a99a",
    },
    other: {
        label: "Otro medio",
        color: "#e0a65c",
    },
};


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
// FORMATO ABREVIADO DE MONTOS
// =========================================================

const formatCompactCurrency = (amount) => {

    if (Math.abs(amount) >= 1000000) {
        return `$${(amount / 1000000).toLocaleString(
            "es-CL",
            { maximumFractionDigits: 1 }
        )}M`;
    }

    if (Math.abs(amount) >= 1000) {
        return `$${(amount / 1000).toLocaleString(
            "es-CL",
            { maximumFractionDigits: 0 }
        )} mil`;
    }

    return formatCurrency(amount);

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
// VALIDAR INGRESO RECIBIDO
// =========================================================

const isReceivedIncome = (income, todayKey) => {

    if (
        typeof income.date !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(income.date)
    ) {
        return false;
    }

    // Evitamos contabilizar fechas futuras.
    if (income.date > todayKey) {
        return false;
    }

    // Los registros anulados o pendientes no se contabilizan.
    if (
        income.status &&
        income.status !== "received"
    ) {
        return false;
    }

    const amount = Number(income.amount);

    return Number.isFinite(amount) && amount > 0;

};


// =========================================================
// AGRUPAR MONTOS POR CLAVE
// =========================================================

const groupAmounts = (
    incomes,
    field,
    config
) => {

    const totals = {};

    incomes.forEach((income) => {

        const key = income[field] || "other";

        const normalizedKey =
            Object.prototype.hasOwnProperty.call(config, key)
                ? key
                : "other";

        totals[normalizedKey] =
            (totals[normalizedKey] || 0) +
            Number(income.amount);

    });

    return Object.entries(totals)
        .map(([key, value]) => ({
            key,
            name: config[key].label,
            value,
            color: config[key].color,
        }))
        .sort((a, b) => b.value - a.value);

};


// =========================================================
// TOOLTIP PARA GRÁFICO DE BARRAS
// =========================================================

function IncomeBarTooltip({
    active,
    payload,
    label,
}) {

    if (!active || !payload?.length) {
        return null;
    }

    return (
        <div className="income-dashboard__tooltip">

            <strong>{label}</strong>

            <span>
                {formatCurrency(
                    Number(payload[0].value) || 0
                )}
            </span>

        </div>
    );
}


// =========================================================
// TOOLTIP PARA GRÁFICOS CIRCULARES
// =========================================================

function IncomePieTooltip({
    active,
    payload,
}) {

    if (!active || !payload?.length) {
        return null;
    }

    const item = payload[0];

    return (
        <div className="income-dashboard__tooltip">

            <strong>{item.name}</strong>

            <span>
                {formatCurrency(
                    Number(item.value) || 0
                )}
            </span>

        </div>
    );
}


// =========================================================
// LEYENDA DE DISTRIBUCIÓN
// =========================================================

function IncomeChartLegend({
    data,
    total,
}) {

    if (!data.length) {
        return null;
    }

    return (
        <div className="income-dashboard__legend">

            {data.map((item) => {

                const percentage =
                    total > 0
                        ? (item.value / total) * 100
                        : 0;

                return (
                    <div
                        className="income-dashboard__legend-item"
                        key={item.key}
                    >

                        <div className="income-dashboard__legend-name">

                            <span
                                className="income-dashboard__legend-dot"
                                style={{
                                    backgroundColor: item.color,
                                }}
                            />

                            <span>{item.name}</span>

                        </div>

                        <div className="income-dashboard__legend-values">

                            <strong>
                                {percentage.toLocaleString(
                                    "es-CL",
                                    {
                                        maximumFractionDigits: 1,
                                    }
                                )}%
                            </strong>

                            <span>
                                {formatCurrency(item.value)}
                            </span>

                        </div>

                    </div>
                );

            })}

        </div>
    );
}


// =========================================================
// ESTADO VACÍO
// =========================================================

function IncomeChartEmpty({
    message = "No hay ingresos registrados para este período.",
}) {

    return (
        <div className="income-dashboard__empty">

            <BarChart3
                size={29}
                strokeWidth={1.5}
                aria-hidden="true"
            />

            <p>{message}</p>

        </div>
    );
}


// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function IncomeDashboard({
    incomes = [],
}) {

    // =====================================================
    // FILTRO DE AÑO
    // =====================================================

    const currentYear = new Date().getFullYear();

    const [selectedYear, setSelectedYear] = useState(
        currentYear
    );

    const todayKey = getLocalDate(new Date());


    // =====================================================
    // AÑOS DISPONIBLES
    // =====================================================

    const availableYears = useMemo(() => {

        const years = new Set([currentYear]);

        incomes.forEach((income) => {

            if (
                typeof income.date === "string" &&
                /^\d{4}-\d{2}-\d{2}$/.test(income.date)
            ) {

                years.add(
                    Number(income.date.slice(0, 4))
                );

            }

        });

        return [...years]
            .filter((year) => year <= currentYear)
            .sort((a, b) => b - a);

    }, [incomes, currentYear]);


    // =====================================================
    // INGRESOS DEL AÑO SELECCIONADO
    // =====================================================

    const yearlyIncomes = useMemo(() => {

        return incomes.filter((income) => {

            if (!isReceivedIncome(income, todayKey)) {
                return false;
            }

            return (
                Number(income.date.slice(0, 4)) ===
                selectedYear
            );

        });

    }, [incomes, todayKey, selectedYear]);


    // =====================================================
    // EVOLUCIÓN MENSUAL
    // =====================================================

    const monthlyData = useMemo(() => {

        const months = MONTH_NAMES.map((month, index) => ({
            month,
            monthNumber: index + 1,
            amount: 0,
        }));

        yearlyIncomes.forEach((income) => {

            const monthIndex =
                Number(income.date.slice(5, 7)) - 1;

            if (
                monthIndex >= 0 &&
                monthIndex < 12
            ) {

                months[monthIndex].amount +=
                    Number(income.amount);

            }

        });

        return months;

    }, [yearlyIncomes]);


    // =====================================================
    // DISTRIBUCIÓN POR CATEGORÍAS
    // =====================================================

    const categoryData = useMemo(() => {

        return groupAmounts(
            yearlyIncomes,
            "category",
            CATEGORY_CONFIG
        );

    }, [yearlyIncomes]);


    // =====================================================
    // DISTRIBUCIÓN POR MEDIO DE RECEPCIÓN
    // =====================================================

    const paymentData = useMemo(() => {

        return groupAmounts(
            yearlyIncomes,
            "paymentMethod",
            PAYMENT_CONFIG
        );

    }, [yearlyIncomes]);


    // =====================================================
    // TOTALES
    // =====================================================

    const yearlyTotal = yearlyIncomes.reduce(
        (total, income) =>
            total + Number(income.amount),
        0
    );

    const categoryTotal = categoryData.reduce(
        (total, item) => total + item.value,
        0
    );

    const paymentTotal = paymentData.reduce(
        (total, item) => total + item.value,
        0
    );


    // =====================================================
    // INTERFAZ
    // =====================================================

    return (
        <section
            className="income-dashboard"
            aria-labelledby="income-dashboard-title"
        >

            {/* =========================================== */}
            {/* ENCABEZADO DEL DASHBOARD */}
            {/* =========================================== */}

            <div className="income-dashboard__header">

                <div className="income-dashboard__heading">

                    <div className="income-dashboard__heading-icon">

                        <BarChart3
                            size={20}
                            aria-hidden="true"
                        />

                    </div>

                    <div>

                        <h2 id="income-dashboard-title">
                            Análisis de ingresos
                        </h2>

                        <p>
                            Evolución y distribución de los
                            ingresos recibidos.
                        </p>

                    </div>

                </div>


                {/* ======================================= */}
                {/* SELECTOR DE AÑO */}
                {/* ======================================= */}

                <div className="income-dashboard__year-filter">

                    <CalendarDays
                        size={16}
                        aria-hidden="true"
                    />

                    <label htmlFor="income-dashboard-year">
                        Año
                    </label>

                    <select
                        id="income-dashboard-year"
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
            {/* EVOLUCIÓN MENSUAL */}
            {/* =========================================== */}

            <div className="income-dashboard__monthly-card">

                <div className="income-dashboard__card-header">

                    <div>

                        <h3>
                            Evolución mensual
                        </h3>

                        <p>
                            Ingresos registrados durante
                            {` ${selectedYear}`}
                        </p>

                    </div>

                    <div className="income-dashboard__card-icon">

                        <TrendingUp
                            size={19}
                            aria-hidden="true"
                        />

                    </div>

                </div>


                {/* ======================================= */}
                {/* TOTAL ANUAL */}
                {/* ======================================= */}

                <div className="income-dashboard__monthly-total">

                    <span>Total del período</span>

                    <strong>
                        {formatCurrency(yearlyTotal)}
                    </strong>

                </div>


                {/* ======================================= */}
                {/* GRÁFICO DE BARRAS */}
                {/* ======================================= */}

                {yearlyIncomes.length > 0 ? (

                    <div className="income-dashboard__bar-chart">

                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >

                            <BarChart
                                data={monthlyData}
                                margin={{
                                    top: 12,
                                    right: 12,
                                    left: 0,
                                    bottom: 0,
                                }}
                            >

                                <CartesianGrid
                                    strokeDasharray="4 4"
                                    vertical={false}
                                    stroke="#e9eff2"
                                />

                                <XAxis
                                    dataKey="month"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{
                                        fill: "#8295a3",
                                        fontSize: 11,
                                    }}
                                />

                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{
                                        fill: "#8295a3",
                                        fontSize: 10,
                                    }}
                                    tickFormatter={
                                        formatCompactCurrency
                                    }
                                    width={74}
                                />

                                <Tooltip
                                    content={
                                        <IncomeBarTooltip />
                                    }
                                    cursor={{
                                        fill: "#edf6f8",
                                    }}
                                />

                                <Bar
                                    dataKey="amount"
                                    fill="#2c8199"
                                    radius={[6, 6, 0, 0]}
                                    maxBarSize={46}
                                />

                            </BarChart>

                        </ResponsiveContainer>

                    </div>

                ) : (

                    <IncomeChartEmpty />

                )}

            </div>


            {/* =========================================== */}
            {/* GRÁFICOS DE DISTRIBUCIÓN */}
            {/* =========================================== */}

            <div className="income-dashboard__distribution-grid">

                {/* ======================================= */}
                {/* CATEGORÍAS */}
                {/* ======================================= */}

                <div className="income-dashboard__distribution-card">

                    <div className="income-dashboard__card-header">

                        <div>

                            <h3>
                                Ingresos por categoría
                            </h3>

                            <p>
                                Distribución según el origen
                                de los recursos.
                            </p>

                        </div>

                        <div className="income-dashboard__card-icon">

                            <PieChartIcon
                                size={19}
                                aria-hidden="true"
                            />

                        </div>

                    </div>


                    {categoryData.length > 0 ? (

                        <>

                            <div className="income-dashboard__pie-chart">

                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                >

                                    <PieChart>

                                        <Pie
                                            data={categoryData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={65}
                                            outerRadius={95}
                                            paddingAngle={3}
                                            stroke="none"
                                        >

                                            {categoryData.map((item) => (

                                                <Cell
                                                    key={item.key}
                                                    fill={item.color}
                                                />

                                            ))}

                                        </Pie>

                                        <Tooltip
                                            content={
                                                <IncomePieTooltip />
                                            }
                                        />

                                    </PieChart>

                                </ResponsiveContainer>

                                <div className="income-dashboard__pie-center">

                                    <span>Total</span>

                                    <strong>
                                        {formatCompactCurrency(
                                            categoryTotal
                                        )}
                                    </strong>

                                </div>

                            </div>

                            <IncomeChartLegend
                                data={categoryData}
                                total={categoryTotal}
                            />

                        </>

                    ) : (

                        <IncomeChartEmpty />

                    )}

                </div>


                {/* ======================================= */}
                {/* MEDIOS DE RECEPCIÓN */}
                {/* ======================================= */}

                <div className="income-dashboard__distribution-card">

                    <div className="income-dashboard__card-header">

                        <div>

                            <h3>
                                Medios de recepción
                            </h3>

                            <p>
                                Distribución según el método
                                utilizado para recibir ingresos.
                            </p>

                        </div>

                        <div className="income-dashboard__card-icon">

                            <Wallet
                                size={19}
                                aria-hidden="true"
                            />

                        </div>

                    </div>


                    {paymentData.length > 0 ? (

                        <>

                            <div className="income-dashboard__pie-chart">

                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                >

                                    <PieChart>

                                        <Pie
                                            data={paymentData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={65}
                                            outerRadius={95}
                                            paddingAngle={3}
                                            stroke="none"
                                        >

                                            {paymentData.map((item) => (

                                                <Cell
                                                    key={item.key}
                                                    fill={item.color}
                                                />

                                            ))}

                                        </Pie>

                                        <Tooltip
                                            content={
                                                <IncomePieTooltip />
                                            }
                                        />

                                    </PieChart>

                                </ResponsiveContainer>

                                <div className="income-dashboard__pie-center">

                                    <span>Total</span>

                                    <strong>
                                        {formatCompactCurrency(
                                            paymentTotal
                                        )}
                                    </strong>

                                </div>

                            </div>

                            <IncomeChartLegend
                                data={paymentData}
                                total={paymentTotal}
                            />

                        </>

                    ) : (

                        <IncomeChartEmpty />

                    )}

                </div>

            </div>

        </section>
    );
}

export default IncomeDashboard;