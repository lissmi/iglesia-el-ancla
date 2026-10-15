
/* ========================================================= */
/* IMPORTACIONES */
/* ========================================================= */

import { useState } from "react";

import { Link } from "react-router-dom";

import {
    ArrowLeft,
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    Scale,
    Clock3,
    CalendarDays,
    BarChart3,
    PieChart,
    TrendingUp,
    ShieldCheck,
    Info,
} from "lucide-react";

import "../../styles/pages/administration/FinanceOverview.css";


// =========================================================
// TARJETA DE INDICADOR FINANCIERO
// =========================================================

function FinanceMetricCard({
    title,
    value,
    description,
    icon: Icon,
    variant = "primary",
}) {

    return (

        <article
            className={`finance-overview__metric finance-overview__metric--${variant}`}
        >

            <div className="finance-overview__metric-top">

                <span className="finance-overview__metric-label">
                    {title}
                </span>

                <span className="finance-overview__metric-icon">
                    <Icon size={20} aria-hidden="true" />
                </span>

            </div>

            <strong className="finance-overview__metric-value">
                {value}
            </strong>

            <p className="finance-overview__metric-description">
                {description}
            </p>

        </article>

    );

}


// =========================================================
// CONTENEDOR DE GRÁFICO
// =========================================================

// Este componente representa el espacio donde
// incorporaremos los gráficos reales con Recharts.

function FinanceChartPlaceholder({
    title,
    description,
    icon: Icon,
    className = "",
}) {

    return (

        <section
            className={`finance-overview__panel ${className}`}
        >

            <div className="finance-overview__panel-header">

                <div>

                    <h2>{title}</h2>

                    <p>{description}</p>

                </div>

                <span className="finance-overview__panel-icon">
                    <Icon size={19} aria-hidden="true" />
                </span>

            </div>

            <div className="finance-overview__chart-placeholder">

                <BarChart3
                    size={36}
                    strokeWidth={1.4}
                    aria-hidden="true"
                />

                <strong>
                    Visualización en preparación
                </strong>

                <span>
                    Aquí mostraremos los datos financieros
                    consolidados de la iglesia.
                </span>

            </div>

        </section>

    );

}


// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function FinanceOverview() {

    // =====================================================
    // FILTROS
    // =====================================================

    // El período seleccionado se utilizará
    // posteriormente para filtrar los movimientos
    // financieros y actualizar los gráficos.

    const currentYear = new Date().getFullYear();

    const [selectedYear, setSelectedYear] =
        useState(currentYear);

    const [selectedPeriod, setSelectedPeriod] =
        useState("year");


    // =====================================================
    // OPCIONES DE AÑOS
    // =====================================================

    const availableYears = Array.from(
        { length: 5 },
        (_, index) => currentYear - index
    );


    // =====================================================
    // INDICADORES TEMPORALES
    // =====================================================

    // Todavía no conectamos los datos de ingresos
    // y gastos a este módulo.
    //
    // Usamos un guion en lugar de valores inventados.

    const financialMetrics = [

        {
            id: "income",
            title: "Ingresos totales",
            value: "—",
            description: "Recursos recibidos en el período",
            icon: ArrowUpRight,
            variant: "income",
        },

        {
            id: "expenses",
            title: "Gastos realizados",
            value: "—",
            description: "Egresos efectivamente pagados",
            icon: ArrowDownRight,
            variant: "expense",
        },

        {
            id: "balance",
            title: "Balance del período",
            value: "—",
            description: "Diferencia entre ingresos y gastos",
            icon: Scale,
            variant: "balance",
        },

        {
            id: "pending",
            title: "Pagos pendientes",
            value: "—",
            description: "Compromisos aún no pagados",
            icon: Clock3,
            variant: "pending",
        },

    ];


    // =====================================================
    // INTERFAZ
    // =====================================================

    return (

        <main className="finance-overview">

            <div className="finance-overview__container">


                {/* ======================================= */}
                {/* ENCABEZADO */}
                {/* ======================================= */}

                <header className="finance-overview__header">

                    <div className="finance-overview__header-content">

                        <Link
                            to="/admin"
                            className="finance-overview__back"
                        >
                            <ArrowLeft
                                size={16}
                                aria-hidden="true"
                            />

                            Volver al panel
                        </Link>

                        <span className="finance-overview__eyebrow">
                            Administración financiera
                        </span>

                        <h1>
                            Resumen de finanzas
                        </h1>

                        <p>
                            Una visión clara y organizada
                            de los recursos financieros
                            de Iglesia El Ancla.
                        </p>

                    </div>

                    <div className="finance-overview__header-icon">
                        <Wallet
                            size={30}
                            strokeWidth={1.7}
                            aria-hidden="true"
                        />
                    </div>

                </header>


                {/* ======================================= */}
                {/* BARRA DE FILTROS */}
                {/* ======================================= */}

                <section
                    className="finance-overview__filters"
                    aria-label="Filtros financieros"
                >

                    <div className="finance-overview__filters-heading">

                        <CalendarDays
                            size={19}
                            aria-hidden="true"
                        />

                        <div>

                            <strong>
                                Período de consulta
                            </strong>

                            <span>
                                Selecciona el período que
                                deseas visualizar.
                            </span>

                        </div>

                    </div>

                    <div className="finance-overview__filters-controls">

                        <label className="finance-overview__select-field">

                            <span>
                                Período
                            </span>

                            <select
                                value={selectedPeriod}
                                onChange={(event) =>
                                    setSelectedPeriod(event.target.value)
                                }
                            >
                                <option value="year">
                                    Año completo
                                </option>

                                <option value="month">
                                    Mes actual
                                </option>
                            </select>

                        </label>

                        <label className="finance-overview__select-field">

                            <span>
                                Año
                            </span>

                            <select
                                value={selectedYear}
                                onChange={(event) =>
                                    setSelectedYear(Number(event.target.value))
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

                        </label>

                    </div>

                </section>


                {/* ======================================= */}
                {/* INDICADORES PRINCIPALES */}
                {/* ======================================= */}

                <section
                    className="finance-overview__metrics-section"
                    aria-labelledby="finance-metrics-title"
                >

                    <div className="finance-overview__section-heading">

                        <div>

                            <h2 id="finance-metrics-title">
                                Panorama financiero
                            </h2>

                            <p>
                                Indicadores principales de
                                los recursos de la iglesia.
                            </p>

                        </div>

                        <span className="finance-overview__section-tag">
                            <TrendingUp
                                size={14}
                                aria-hidden="true"
                            />

                            Vista general
                        </span>

                    </div>

                    <div className="finance-overview__metrics-grid">

                        {financialMetrics.map((metric) => (

                            <FinanceMetricCard
                                key={metric.id}
                                title={metric.title}
                                value={metric.value}
                                description={metric.description}
                                icon={metric.icon}
                                variant={metric.variant}
                            />

                        ))}

                    </div>

                </section>


                {/* ======================================= */}
                {/* EVOLUCIÓN FINANCIERA */}
                {/* ======================================= */}

                <div className="finance-overview__charts-grid">

                    <FinanceChartPlaceholder
                        title="Evolución financiera"
                        description="Comparación de ingresos y gastos a lo largo del tiempo."
                        icon={TrendingUp}
                        className="finance-overview__panel--wide"
                    />

                    <FinanceChartPlaceholder
                        title="Distribución de ingresos"
                        description="Origen de los recursos recibidos."
                        icon={PieChart}
                    />

                    <FinanceChartPlaceholder
                        title="Distribución de gastos"
                        description="Destino de los recursos utilizados."
                        icon={PieChart}
                    />

                </div>


                {/* ======================================= */}
                {/* BALANCE Y TRANSPARENCIA */}
                {/* ======================================= */}

                <div className="finance-overview__bottom-grid">

                    <section className="finance-overview__panel">

                        <div className="finance-overview__panel-header">

                            <div>

                                <h2>
                                    Balance financiero
                                </h2>

                                <p>
                                    Resultado general del
                                    período seleccionado.
                                </p>

                            </div>

                            <span className="finance-overview__panel-icon">
                                <Scale
                                    size={19}
                                    aria-hidden="true"
                                />
                            </span>

                        </div>

                        <div className="finance-overview__balance-empty">

                            <Info
                                size={22}
                                aria-hidden="true"
                            />

                            <p>
                                El balance se calculará
                                automáticamente utilizando
                                los ingresos y gastos
                                registrados.
                            </p>

                        </div>

                    </section>


                    <section className="finance-overview__transparency">

                        <div className="finance-overview__transparency-icon">

                            <ShieldCheck
                                size={24}
                                aria-hidden="true"
                            />

                        </div>

                        <h2>
                            Transparencia financiera
                        </h2>

                        <p>
                            Este espacio permitirá a los
                            miembros registrados conocer
                            de manera clara y responsable
                            cómo se administran los recursos
                            de nuestra comunidad.
                        </p>

                        <div className="finance-overview__transparency-note">

                            <Info
                                size={16}
                                aria-hidden="true"
                            />

                            <span>
                                La información compartida
                                será de carácter general.
                                No incluirá datos personales
                                ni movimientos administrativos
                                individuales.
                            </span>

                        </div>

                    </section>

                </div>

            </div>

        </main>

    );

}

export default FinanceOverview;
