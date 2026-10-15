// =========================================================
// IMPORTACIONES
// =========================================================

import { useMemo } from "react";

import {
    Wallet,
    TrendingDown,
    ReceiptText,
    ChartNoAxesColumnIncreasing,
} from "lucide-react";

import {
    formatExpenseCurrency,
    getExpenseLocalDate,
} from "../../../utils/expenseUtils";

import "../../../styles/components/administration/expenses/ExpenseSummary.css";


// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function ExpenseSummary({
    expenses = [],
}) {

    // =====================================================
    // FECHA ACTUAL
    // =====================================================

    const today = new Date();

    const currentYear = today.getFullYear();

    const currentMonth = today.getMonth() + 1;

    const currentDate = getExpenseLocalDate(today);


    // =====================================================
    // CÁLCULO DE INDICADORES
    // =====================================================

    const summary = useMemo(() => {

        let monthlyExpenses = 0;

        let yearlyExpenses = 0;

        let monthlyMovements = 0;


        // ================================================
        // RECORRER GASTOS
        // ================================================

        expenses.forEach((expense) => {

            const expenseDate = expense.date;

            // --------------------------------------------
            // VALIDAR FECHA
            // --------------------------------------------

            if (
                typeof expenseDate !== "string" ||
                !/^\d{4}-\d{2}-\d{2}$/.test(expenseDate)
            ) {
                return;
            }


            // --------------------------------------------
            // EXCLUIR FECHAS FUTURAS
            // --------------------------------------------

            if (expenseDate > currentDate) {
                return;
            }


            // --------------------------------------------
            // SOLO GASTOS PAGADOS
            // --------------------------------------------

            // Los pendientes no deben contabilizarse
            // como egresos efectivamente realizados.

            if (expense.status !== "Pagado") {
                return;
            }


            // --------------------------------------------
            // VALIDAR MONTO
            // --------------------------------------------

            const amount = Number(expense.amount);

            if (
                !Number.isSafeInteger(amount) ||
                amount <= 0
            ) {
                return;
            }


            // --------------------------------------------
            // EXTRAER AÑO Y MES
            // --------------------------------------------

            const expenseYear = Number(
                expenseDate.slice(0, 4)
            );

            const expenseMonth = Number(
                expenseDate.slice(5, 7)
            );


            // ============================================
            // GASTOS DEL AÑO
            // ============================================

            if (expenseYear === currentYear) {

                yearlyExpenses += amount;

            }


            // ============================================
            // GASTOS DEL MES
            // ============================================

            if (
                expenseYear === currentYear &&
                expenseMonth === currentMonth
            ) {

                monthlyExpenses += amount;

                monthlyMovements += 1;

            }

        });


        // ================================================
        // PROMEDIO MENSUAL
        // ================================================

        const monthlyAverage =
            yearlyExpenses / currentMonth;


        return {
            monthlyExpenses,
            yearlyExpenses,
            monthlyMovements,
            monthlyAverage,
        };

    }, [
        expenses,
        currentYear,
        currentMonth,
        currentDate,
    ]);


    // =====================================================
    // CONFIGURACIÓN DE TARJETAS
    // =====================================================

    const summaryCards = [

        // -------------------------------------------------
        // GASTOS DEL MES
        // -------------------------------------------------

        {
            id: "monthly-expenses",

            title: "Gastos del mes",

            value: formatExpenseCurrency(
                summary.monthlyExpenses
            ),

            description: "Total pagado durante el mes actual",

            icon: Wallet,

            variant: "primary",
        },


        // -------------------------------------------------
        // GASTOS DEL AÑO
        // -------------------------------------------------

        {
            id: "yearly-expenses",

            title: "Gastos del año",

            value: formatExpenseCurrency(
                summary.yearlyExpenses
            ),

            description: "Total acumulado durante el año",

            icon: TrendingDown,

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

            description: "Registros de gastos pagados del mes actual",

            icon: ReceiptText,

            variant: "info",
        },


        // -------------------------------------------------
        // PROMEDIO MENSUAL
        // -------------------------------------------------

        {
            id: "monthly-average",

            title: "Promedio mensual",

            value: formatExpenseCurrency(
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
            className="expense-summary"
            aria-label="Resumen financiero de gastos"
        >

            {/* =========================================== */}
            {/* TARJETAS DE INDICADORES */}
            {/* =========================================== */}

            <div className="expense-summary__grid">

                {summaryCards.map((card) => {

                    const CardIcon = card.icon;

                    return (

                        <article
                            key={card.id}
                            className={
                                "expense-summary__card " +
                                `expense-summary__card--${card.variant}`
                            }
                        >

                            {/* ================================= */}
                            {/* ENCABEZADO */}
                            {/* ================================= */}

                            <div className="expense-summary__card-header">

                                <span className="expense-summary__card-title">
                                    {card.title}
                                </span>

                                <div className="expense-summary__icon">

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

                            <strong className="expense-summary__value">
                                {card.value}
                            </strong>


                            {/* ================================= */}
                            {/* DESCRIPCIÓN */}
                            {/* ================================= */}

                            <p className="expense-summary__description">
                                {card.description}
                            </p>

                        </article>

                    );

                })}

            </div>

        </section>
    );
}

export default ExpenseSummary;