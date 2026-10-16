
import {
    ArrowUpRight,
    ArrowDownRight,
    Scale,
    Clock3,
    TrendingUp,
} from "lucide-react";

// =========================================================
// ESTILOS
// =========================================================

import "../../../styles/components/administration/finances/FinanceSummary.css";

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
// COMPONENTE DE TARJETA FINANCIERA
// =========================================================

function FinanceSummaryCard({
    title,
    amount,
    description,
    icon: Icon,
    variant,
}) {

    return (

        <article
            className={`finance-summary__card finance-summary__card--${variant}`}
        >

            {/* =========================================== */}
            {/* ENCABEZADO DE LA TARJETA */}
            {/* =========================================== */}

            <div className="finance-summary__card-header">

                <span className="finance-summary__label">
                    {title}
                </span>

                <div className="finance-summary__icon">

                    <Icon
                        size={22}
                        strokeWidth={1.8}
                        aria-hidden="true"
                    />

                </div>

            </div>

            {/* =========================================== */}
            {/* MONTO PRINCIPAL */}
            {/* =========================================== */}

            <strong className="finance-summary__amount">

                {amount === null
                    ? "—"
                    : formatCurrency(amount)}

            </strong>

            {/* =========================================== */}
            {/* DESCRIPCIÓN */}
            {/* =========================================== */}

            <p className="finance-summary__description">
                {description}
            </p>

            {/* =========================================== */}
            {/* LÍNEA DECORATIVA */}
            {/* =========================================== */}

            <div className="finance-summary__accent" />

        </article>

    );
}

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function FinanceSummary({ data = null }) {

    // =====================================================
    // DISPONIBILIDAD DE INFORMACIÓN
    // =====================================================

    // Si no existen datos para el período seleccionado,
    // mostramos un guion en lugar de valores incorrectos.

    const hasData = data !== null;

    // =====================================================
    // INDICADORES FINANCIEROS
    // =====================================================

    // Todos los valores provienen de la fuente
    // centralizada, procesada en FinanceOverview.
    //
    // El balance corresponde a ingresos menos
    // gastos efectivamente pagados.
    //
    // Los pagos pendientes se muestran por separado.

    const income = hasData ? data.income : null;

    const expenses = hasData ? data.expenses : null;

    const balance = hasData ? data.balance : null;

    const pending = hasData ? data.pending : null;

    // =====================================================
    // CONFIGURACIÓN DE TARJETAS
    // =====================================================

    const metrics = [
        {
            id: "income",
            title: "Ingresos totales",
            amount: income,
            description: "Recursos recibidos durante el período.",
            icon: ArrowUpRight,
            variant: "income",
        },
        {
            id: "expenses",
            title: "Gastos realizados",
            amount: expenses,
            description: "Egresos efectivamente pagados.",
            icon: ArrowDownRight,
            variant: "expense",
        },
        {
            id: "balance",
            title: "Balance del período",
            amount: balance,
            description: "Diferencia entre ingresos y gastos.",
            icon: Scale,
            variant: "balance",
        },
        {
            id: "pending",
            title: "Pagos pendientes",
            amount: pending,
            description: "Compromisos aún no pagados.",
            icon: Clock3,
            variant: "pending",
        },
    ];

    // =====================================================
    // INTERFAZ PRINCIPAL
    // =====================================================

    return (

        <section
            className="finance-summary"
            aria-labelledby="finance-summary-title"
        >

            {/* =========================================== */}
            {/* ENCABEZADO */}
            {/* =========================================== */}

            <div className="finance-summary__heading">

                <div className="finance-summary__heading-text">

                    <h2 id="finance-summary-title">
                        Panorama financiero
                    </h2>

                    <p>
                        Indicadores principales de los
                        recursos de la iglesia.
                    </p>

                </div>

                <span className="finance-summary__tag">

                    <TrendingUp
                        size={15}
                        aria-hidden="true"
                    />

                    Vista general

                </span>

            </div>

            {/* =========================================== */}
            {/* TARJETAS FINANCIERAS */}
            {/* =========================================== */}

            <div className="finance-summary__grid">

                {metrics.map((metric) => (

                    <FinanceSummaryCard
                        key={metric.id}
                        title={metric.title}
                        amount={metric.amount}
                        description={metric.description}
                        icon={metric.icon}
                        variant={metric.variant}
                    />

                ))}

            </div>

            {/* =========================================== */}
            {/* AVISO INFORMATIVO */}
            {/* =========================================== */}

            <p className="finance-summary__disclaimer">

                {hasData
                    ? "Los valores presentados son datos de demostración y no corresponden a registros financieros reales."
                    : "No existen datos de demostración para el período seleccionado."}

            </p>

        </section>

    );
}

export default FinanceSummary;
