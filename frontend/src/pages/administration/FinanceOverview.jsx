/* ========================================================= */
/* IMPORTACIONES */
/* ========================================================= */

import { useState } from "react";

import { useLocation } from "react-router-dom";


// =========================================================
// COMPONENTES FINANCIEROS
// =========================================================

import FinanceHeader from "../../components/administration/finances/FinanceHeader";

import FinanceSummary from "../../components/administration/finances/FinanceSummary";

import FinanceEvolutionChart from "../../components/administration/finances/FinanceEvolutionChart";

import FinanceDistributionCharts from "../../components/administration/finances/FinanceDistributionCharts";

import FinanceBalance from "../../components/administration/finances/FinanceBalance";

import FinanceTransparency from "../../components/administration/finances/FinanceTransparency";

import FinanceFilters from "../../components/administration/finances/FinanceFilters";

import {
    getFinanceDemoSummary,
    FINANCE_DEMO_YEAR,
} from "../../data/finances/financeDemoData";

// =========================================================
// ESTILOS
// =========================================================

import "../../styles/pages/administration/FinanceOverview.css";





// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function FinanceOverview() {

    // =====================================================
    // NAVEGACIÓN SEGÚN EL ESPACIO DEL USUARIO
    // =====================================================

    // Identificamos la ruta desde la cual
    // se está mostrando el resumen financiero.

    const location = useLocation();

    // Determinamos a qué panel debe regresar
    // el usuario cuando presione el botón Volver.

    const backTo = location.pathname.startsWith("/super-admin")
        ? "/super-admin"
        : location.pathname.startsWith("/admin")
            ? "/admin"
            : "/member";


    // =====================================================
    // FILTROS
    // =====================================================

    // Los filtros se conectarán posteriormente
    // con los datos financieros de demostración.

    const currentYear = new Date().getFullYear();

    const [selectedYear, setSelectedYear] =
        useState(FINANCE_DEMO_YEAR);

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
    // DATOS FINANCIEROS SEGÚN LOS FILTROS
    // =====================================================

    const financialData = getFinanceDemoSummary({
        year: selectedYear,
        period: selectedPeriod,
    });



    // =====================================================
    // INTERFAZ PRINCIPAL
    // =====================================================

    return (

        <main className="finance-overview">

            <div className="finance-overview__container">


                {/* ======================================= */}
                {/* ENCABEZADO FINANCIERO */}
                {/* ======================================= */}

                {/* El encabezado ahora es independiente.
                    FinanceHeader administra su propio
                    diseño, estilos y navegación. */}

                <FinanceHeader
                    backTo={backTo}
                    showBackLink={!location.pathname.startsWith("/member/")}
                />

                {/* ======================================= */}
                {/* FILTROS FINANCIEROS */}
                {/* ======================================= */}

                <FinanceFilters
                    selectedYear={selectedYear}
                    setSelectedYear={setSelectedYear}
                    selectedPeriod={selectedPeriod}
                    setSelectedPeriod={setSelectedPeriod}
                    availableYears={availableYears}
                />


                {/* ======================================= */}
                {/* INDICADORES PRINCIPALES */}
                {/* ======================================= */}

                <FinanceSummary
                    data={financialData}
                />


                {/* ======================================= */}
                {/* EVOLUCIÓN FINANCIERA */}
                {/* ======================================= */}

                <div className="finance-overview__charts-grid">
                    <div className="finance-overview__panel--wide">
                        <FinanceEvolutionChart
                            data={financialData}
                        />
                    </div>
                </div>


                {/* ======================================= */}
                {/* DISTRIBUCIÓN DE INGRESOS Y GASTOS */}
                {/* ======================================= */}

                <FinanceDistributionCharts
                    data={financialData}
                />


                {/* ======================================= */}
                {/* BALANCE Y TRANSPARENCIA */}
                {/* ======================================= */}

                <div className="finance-overview__bottom-grid">
                    <FinanceBalance
                        data={financialData}
                    />

                    <FinanceTransparency />
                </div>

            </div>

        </main>

    );

}

export default FinanceOverview;
