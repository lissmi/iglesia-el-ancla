import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

import {
    TrendingUp,
    Info,
} from "lucide-react";

// =========================================================
// ESTILOS
// =========================================================

import "../../../styles/components/administration/finances/FinanceEvolutionChart.css";

// =========================================================
// FORMATO DE MONEDA CHILENA
// =========================================================

const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0,
    }).format(value);
};

// =========================================================
// FORMATO ABREVIADO DEL EJE VERTICAL
// =========================================================

const formatAxisValue = (value) => {
    return `${Math.round(value / 1000)} mil`;
};

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function FinanceEvolutionChart({ data = null }) {

    // =====================================================
    // INFORMACIÓN FINANCIERA
    // =====================================================

    // Los datos se obtienen desde FinanceOverview.
    //
    // Este componente no administra filtros ni
    // contiene información financiera duplicada.

    const chartData = data?.monthlyData ?? [];

    const selectedYear = data?.year ?? null;

    const selectedPeriod = data?.period ?? null;

    const hasData = chartData.some((item) => item.income > 0 || item.expenses > 0);

    // =====================================================
    // DESCRIPCIÓN DEL PERÍODO
    // =====================================================

    const periodDescription = selectedPeriod === "month"
        ? "Ingresos y gastos del mes seleccionado."
        : "Comparación mensual de ingresos y gastos durante el año seleccionado.";

    // =====================================================
    // INTERFAZ PRINCIPAL
    // =====================================================

    return (

        <section
            className="finance-evolution"
            aria-labelledby="finance-evolution-title"
        >

            {/* =========================================== */}
            {/* ENCABEZADO */}
            {/* =========================================== */}

            <div className="finance-evolution__header">

                <div className="finance-evolution__heading">

                    <div className="finance-evolution__title-row">

                        <div className="finance-evolution__icon">

                            <TrendingUp
                                size={20}
                                aria-hidden="true"
                            />

                        </div>

                        <h2 id="finance-evolution-title">
                            Evolución financiera
                        </h2>

                    </div>

                    <p>
                        {periodDescription}
                    </p>

                </div>

                <span className="finance-evolution__year">
                    {selectedYear ?? "Sin datos"}
                </span>

            </div>

            {/* =========================================== */}
            {/* GRÁFICO FINANCIERO */}
            {/* =========================================== */}

            {hasData ? (

                <div
                    className="finance-evolution__chart"
                    role="img"
                    aria-label={`Gráfico de ingresos y gastos del período ${selectedYear}`}
                >

                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                    >

                        <BarChart
                            data={chartData}
                            margin={{
                                top: 15,
                                right: 10,
                                left: 0,
                                bottom: 5,
                            }}
                            barGap={5}
                        >

                            {/* Cuadrícula */}

                            <CartesianGrid
                                strokeDasharray="4 4"
                                vertical={false}
                                stroke="#e8eef2"
                            />

                            {/* Eje horizontal */}

                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                axisLine={false}
                                tick={{
                                    fill: "#718491",
                                    fontSize: 12,
                                }}
                            />

                            {/* Eje vertical */}

                            <YAxis
                                tickFormatter={formatAxisValue}
                                tickLine={false}
                                axisLine={false}
                                width={65}
                                tick={{
                                    fill: "#718491",
                                    fontSize: 11,
                                }}
                            />

                            {/* Información al pasar el cursor */}

                            <Tooltip
                                formatter={(value, name) => [
                                    formatCurrency(value),
                                    name,
                                ]}
                                contentStyle={{
                                    borderRadius: "12px",
                                    border: "1px solid #e5edf1",
                                    boxShadow:
                                        "0 8px 24px rgba(23,56,76,0.08)",
                                }}
                            />

                            {/* Leyenda */}

                            <Legend
                                verticalAlign="bottom"
                                iconType="circle"
                                wrapperStyle={{
                                    paddingTop: "18px",
                                    fontSize: "13px",
                                }}
                            />

                            {/* Barras de ingresos */}

                            <Bar
                                dataKey="income"
                                name="Ingresos"
                                fill="#2c8199"
                                radius={[5, 5, 0, 0]}
                                maxBarSize={34}
                            />

                            {/* Barras de gastos */}

                            <Bar
                                dataKey="expenses"
                                name="Gastos"
                                fill="#b36c55"
                                radius={[5, 5, 0, 0]}
                                maxBarSize={34}
                            />

                        </BarChart>

                    </ResponsiveContainer>

                </div>

            ) : (

                /* ======================================= */
                /* ESTADO SIN DATOS */
                /* ======================================= */

                <div className="finance-evolution__empty">

                    <Info size={26} aria-hidden="true" />

                    <strong>
                        Todavía no hay movimientos
                    </strong>

                    <p>
                        No existe información financiera
                        disponible para el período
                        seleccionado.
                    </p>

                </div>

            )}

            {/* =========================================== */}
            {/* NOTA INFORMATIVA */}
            {/* =========================================== */}

            <div className="finance-evolution__footer">

                <Info
                    size={15}
                    aria-hidden="true"
                />

                <span>
                    Solo se consideran ingresos recibidos y gastos pagados. Los pendientes se presentan por separado.
                </span>

            </div>

        </section>

    );
}

export default FinanceEvolutionChart;
