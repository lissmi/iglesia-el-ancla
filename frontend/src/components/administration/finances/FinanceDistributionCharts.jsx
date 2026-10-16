
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

import {
    ArrowUpRight,
    ArrowDownRight,
    Info,
} from "lucide-react";

// =========================================================
// ESTILOS
// =========================================================

import "../../../styles/components/administration/finances/FinanceDistributionCharts.css";

// =========================================================
// PALETAS DE COLORES
// =========================================================

const INCOME_COLORS = [
    "#2c8199",
    "#17384c",
    "#60b3c4",
    "#a2d8df",
];

const EXPENSE_COLORS = [
    "#b36c55",
    "#d49a72",
    "#e4bc91",
    "#8c554e",
    "#efd6b8",
];

// =========================================================
// FORMATO DE MONEDA CHILENA
// =========================================================

const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0,
    }).format(amount);
};

// =========================================================
// TOOLTIP PERSONALIZADO
// =========================================================

function FinanceDistributionTooltip({
    active,
    payload,
}) {

    if (!active || !payload || payload.length === 0) {
        return null;
    }

    const item = payload[0].payload;

    return (

        <div className="finance-distribution__tooltip">

            <strong>{item.name}</strong>

            <span>
                {formatCurrency(item.value)}
            </span>

        </div>

    );
}

// =========================================================
// TARJETA DE DISTRIBUCIÓN
// =========================================================

function FinanceDistributionCard({
    title,
    description,
    data,
    colors,
    icon: Icon,
    variant,
}) {

    // =====================================================
    // TOTAL DE LA DISTRIBUCIÓN
    // =====================================================

    const total = data.reduce(
        (sum, item) => sum + item.value,
        0
    );

    // =====================================================
    // INTERFAZ
    // =====================================================

    return (

        <section
            className={`finance-distribution__card finance-distribution__card--${variant}`}
        >

            {/* =========================================== */}
            {/* ENCABEZADO */}
            {/* =========================================== */}

            <div className="finance-distribution__header">

                <div>

                    <h2>{title}</h2>

                    <p>{description}</p>

                </div>

                <div className="finance-distribution__header-icon">

                    <Icon
                        size={20}
                        aria-hidden="true"
                    />

                </div>

            </div>

            {/* =========================================== */}
            {/* GRÁFICO CIRCULAR */}
            {/* =========================================== */}

            <div className="finance-distribution__chart">

                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >

                    <PieChart>

                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={105}
                            paddingAngle={3}
                            stroke="none"
                        >

                            {data.map((item, index) => (

                                <Cell
                                    key={item.name}
                                    fill={colors[index % colors.length]}
                                />

                            ))}

                        </Pie>

                        <Tooltip
                            content={<FinanceDistributionTooltip />}
                        />

                    </PieChart>

                </ResponsiveContainer>

                {/* ======================================= */}
                {/* TOTAL CENTRAL */}
                {/* ======================================= */}

                <div className="finance-distribution__center">

                    <span>Total</span>

                    <strong>
                        {formatCurrency(total)}
                    </strong>

                </div>

            </div>

            {/* =========================================== */}
            {/* LEYENDA DE CATEGORÍAS */}
            {/* =========================================== */}

            <div className="finance-distribution__legend">

                {data.map((item, index) => {

                    const percentage = total > 0
                        ? (item.value / total) * 100
                        : 0;

                    return (

                        <div
                            className="finance-distribution__legend-item"
                            key={item.name}
                        >

                            <div className="finance-distribution__legend-name">

                                <span
                                    className="finance-distribution__legend-dot"
                                    style={{
                                        backgroundColor:
                                            colors[index % colors.length],
                                    }}
                                />

                                <span>
                                    {item.name}
                                </span>

                            </div>

                            <div className="finance-distribution__legend-values">

                                <strong>
                                    {percentage.toFixed(1)}%
                                </strong>

                                <span>
                                    {formatCurrency(item.value)}
                                </span>

                            </div>

                        </div>

                    );

                })}

            </div>

        </section>

    );
}

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function FinanceDistributionCharts({ data = null }) {

    // =====================================================
    // DISPONIBILIDAD DE DATOS
    // =====================================================

    // Los gráficos reciben las distribuciones
    // desde FinanceOverview.
    //
    // No utilizamos arreglos locales duplicados.

    const hasDemoData = data !== null;

    // =====================================================
    // INTERFAZ PRINCIPAL
    // =====================================================

    return (

        <div className="finance-distribution">

            {hasDemoData ? (

                <div className="finance-distribution__grid">

                    {/* =================================== */}
                    {/* DISTRIBUCIÓN DE INGRESOS */}
                    {/* =================================== */}

                    <FinanceDistributionCard
                        title="Distribución de ingresos"
                        description="Origen de los recursos recibidos."
                        data={data.incomeDistribution}
                        colors={INCOME_COLORS}
                        icon={ArrowUpRight}
                        variant="income"
                    />

                    {/* =================================== */}
                    {/* DISTRIBUCIÓN DE GASTOS */}
                    {/* =================================== */}

                    <FinanceDistributionCard
                        title="Distribución de gastos"
                        description="Destino de los recursos utilizados."
                        data={data.expenseDistribution}
                        colors={EXPENSE_COLORS}
                        icon={ArrowDownRight}
                        variant="expense"
                    />

                </div>

            ) : (

                /* ======================================= */
                /* ESTADO SIN DATOS */
                /* ======================================= */

                <div className="finance-distribution__empty">

                    <Info
                        size={26}
                        aria-hidden="true"
                    />

                    <strong>
                        Sin datos de demostración
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

            <p className="finance-distribution__note">

                <Info
                    size={15}
                    aria-hidden="true"
                />

                Los valores son ficticios y se utilizan
                exclusivamente para el diseño.

            </p>

        </div>

    );
}

export default FinanceDistributionCharts;
