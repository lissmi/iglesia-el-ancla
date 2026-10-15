// =========================================================
// IMPORTACIONES
// =========================================================

import { useMemo } from "react";

import {
    Wallet,
    TrendingUp,
    ReceiptText,
    ChartNoAxesColumnIncreasing,
} from "lucide-react";

import "../../../styles/components/administration/income/IncomeSummary.css";


// =========================================================
// FUNCIONES AUXILIARES
// =========================================================

// Formateamos montos como pesos chilenos.
const formatCurrency = (amount) => {

    return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0,
    }).format(amount);

};


// =========================================================
// OBTENER FECHA LOCAL
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

function IncomeSummary({
    incomes = [],
}) {

    // =====================================================
    // FECHA ACTUAL
    // =====================================================

    const today = new Date();

    const currentYear = today.getFullYear();

    const currentMonth = today.getMonth() + 1;

    const currentDate = getLocalDate(today);


    // =====================================================
    // CÁLCULO DE INDICADORES
    // =====================================================

    const summary = useMemo(() => {

        let monthlyIncome = 0;

        let yearlyIncome = 0;

        let monthlyMovements = 0;


        // ================================================
        // RECORRER INGRESOS
        // ================================================

        incomes.forEach((income) => {

            // Se esperan fechas YYYY-MM-DD.
            const incomeDate = income.date;

            if (
                typeof incomeDate !== "string" ||
                !/^\d{4}-\d{2}-\d{2}$/.test(incomeDate)
            ) {
                return;
            }

            // Excluimos registros con fecha futura.
            if (incomeDate > currentDate) {
                return;
            }

            // Excluimos ingresos anulados.
            if (
                income.status === "cancelled" ||
                income.status === "void"
            ) {
                return;
            }

            // Los ingresos deben estar efectivamente recibidos.
            // Un registro sin estado se considera recibido
            // para compatibilidad con datos iniciales.
            if (
                income.status &&
                income.status !== "received"
            ) {
                return;
            }

            const amount = Number(income.amount);

            if (
                !Number.isFinite(amount) ||
                amount <= 0
            ) {
                return;
            }

            const incomeYear = Number(
                incomeDate.slice(0, 4)
            );

            const incomeMonth = Number(
                incomeDate.slice(5, 7)
            );


            // ============================================
            // INGRESOS DEL AÑO
            // ============================================

            if (incomeYear === currentYear) {

                yearlyIncome += amount;

            }


            // ============================================
            // INGRESOS DEL MES
            // ============================================

            if (
                incomeYear === currentYear &&
                incomeMonth === currentMonth
            ) {

                monthlyIncome += amount;

                monthlyMovements += 1;

            }

        });


        // ================================================
        // PROMEDIO MENSUAL
        // ================================================

        // Se divide entre los meses transcurridos del año,
        // incluyendo el mes actual.

        const monthlyAverage =
            yearlyIncome / currentMonth;


        return {
            monthlyIncome,
            yearlyIncome,
            monthlyMovements,
            monthlyAverage,
        };

    }, [
        incomes,
        currentYear,
        currentMonth,
        currentDate,
    ]);


    // =====================================================
    // CONFIGURACIÓN DE TARJETAS
    // =====================================================

    const summaryCards = [

        // -------------------------------------------------
        // INGRESOS DEL MES
        // -------------------------------------------------

        {
            id: "monthly-income",

            title: "Ingresos del mes",

            value: formatCurrency(
                summary.monthlyIncome
            ),

            description: "Total recibido durante el mes actual",

            icon: Wallet,

            variant: "primary",
        },


        // -------------------------------------------------
        // INGRESOS DEL AÑO
        // -------------------------------------------------

        {
            id: "yearly-income",

            title: "Ingresos del año",

            value: formatCurrency(
                summary.yearlyIncome
            ),

            description: "Total acumulado durante el año",

            icon: TrendingUp,

            variant: "success",
        },


        // -------------------------------------------------
        // MOVIMIENTOS DEL MES
        // -------------------------------------------------

        {
            id: "monthly-movements",

            title: "Movimientos del mes",

            value: summary.monthlyMovements.toLocaleString(
                "es-CL"
            ),

            description: "Registros de ingresos del mes actual",

            icon: ReceiptText,

            variant: "info",
        },


        // -------------------------------------------------
        // PROMEDIO MENSUAL
        // -------------------------------------------------

        {
            id: "monthly-average",

            title: "Promedio mensual",

            value: formatCurrency(
                summary.monthlyAverage
            ),

            description: "Promedio de los meses transcurridos",

            icon: ChartNoAxesColumnIncreasing,

            variant: "purple",
        },

    ];


    // =====================================================
    // INTERFAZ
    // =====================================================

    return (
        <section
            className="income-summary"
            aria-label="Resumen financiero de ingresos"
        >

            {/* =========================================== */}
            {/* TARJETAS DE INDICADORES */}
            {/* =========================================== */}

            <div className="income-summary__grid">

                {summaryCards.map((card) => {

                    const CardIcon = card.icon;

                    return (

                        <article
                            key={card.id}
                            className={
                                "income-summary__card " +
                                `income-summary__card--${card.variant}`
                            }
                        >

                            {/* ================================= */}
                            {/* ENCABEZADO */}
                            {/* ================================= */}

                            <div className="income-summary__card-header">

                                <span className="income-summary__card-title">
                                    {card.title}
                                </span>

                                <div className="income-summary__icon">

                                    <CardIcon
                                        size={21}
                                        strokeWidth={1.8}
                                        aria-hidden="true"
                                    />

                                </div>

                            </div>


                            {/* ================================= */}
                            {/* VALOR */}
                            {/* ================================= */}

                            <strong className="income-summary__value">
                                {card.value}
                            </strong>


                            {/* ================================= */}
                            {/* DESCRIPCIÓN */}
                            {/* ================================= */}

                            <p className="income-summary__description">
                                {card.description}
                            </p>

                        </article>

                    );

                })}

            </div>

        </section>
    );
}

export default IncomeSummary;