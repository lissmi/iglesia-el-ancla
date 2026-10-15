// =========================================================
// IMPORTACIONES
// =========================================================

import { useMemo } from "react";

import {
    AlertTriangle,
    CalendarClock,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Eye,
    Pencil,
    Wallet,
} from "lucide-react";

import {
    formatExpenseCurrency,
    formatExpenseDate,
    getExpenseLocalDate,
    isPendingExpense,
    isValidExpenseAmount,
} from "../../../utils/expenseUtils";

import "../../../styles/components/administration/expenses/UpcomingExpenses.css";


// =========================================================
// FUNCIONES AUXILIARES
// =========================================================

// Validamos fechas reales con formato YYYY-MM-DD.
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


// Calculamos una fecha futura utilizando el calendario local.
const addDays = (date, days) => {

    const result = new Date(`${date}T12:00:00`);

    result.setDate(result.getDate() + days);

    return getExpenseLocalDate(result);

};


// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function UpcomingExpenses({
    expenses = [],
    onViewExpense,
    onEditExpense,
    onMarkAsPaid,
}) {

    // =====================================================
    // FECHAS DE REFERENCIA
    // =====================================================

    const today = getExpenseLocalDate();

    const nextSevenDays = addDays(today, 7);


    // =====================================================
    // OBTENER GASTOS PENDIENTES
    // =====================================================

    const pendingExpenses = useMemo(() => {

        return expenses

            .filter((expense) => {

                return (
                    isPendingExpense(expense) &&
                    isValidExpenseAmount(expense.amount)
                );

            })

            .sort((first, second) => {

                // Priorizamos fechas válidas.
                const firstDate = isValidDate(first.date)
                    ? first.date
                    : "9999-12-31";

                const secondDate = isValidDate(second.date)
                    ? second.date
                    : "9999-12-31";

                return firstDate.localeCompare(secondDate);

            });

    }, [expenses]);


    // =====================================================
    // CALCULAR INDICADORES
    // =====================================================

    const summary = useMemo(() => {

        let totalCommitted = 0;

        let overdueCount = 0;

        let overdueAmount = 0;

        let upcomingCount = 0;


        pendingExpenses.forEach((expense) => {

            const amount = Number(expense.amount);

            totalCommitted += amount;

            if (!isValidDate(expense.date)) {
                return;
            }


            // --------------------------------------------
            // PAGOS VENCIDOS
            // --------------------------------------------

            if (expense.date < today) {

                overdueCount += 1;

                overdueAmount += amount;

            }


            // --------------------------------------------
            // PRÓXIMOS 7 DÍAS
            // --------------------------------------------

            if (
                expense.date >= today &&
                expense.date <= nextSevenDays
            ) {

                upcomingCount += 1;

            }

        });


        return {
            totalCommitted,
            pendingCount: pendingExpenses.length,
            overdueCount,
            overdueAmount,
            upcomingCount,
        };

    }, [
        pendingExpenses,
        today,
        nextSevenDays,
    ]);


    // =====================================================
    // OBTENER ESTADO DE VENCIMIENTO
    // =====================================================

    const getDueStatus = (expense) => {

        if (!isValidDate(expense.date)) {

            return {
                label: "Sin fecha válida",
                variant: "neutral",
            };

        }

        if (expense.date < today) {

            return {
                label: "Vencido",
                variant: "overdue",
            };

        }

        if (expense.date === today) {

            return {
                label: "Vence hoy",
                variant: "today",
            };

        }

        if (expense.date <= nextSevenDays) {

            return {
                label: "Próximo a vencer",
                variant: "upcoming",
            };

        }

        return {
            label: "Programado",
            variant: "scheduled",
        };

    };


    // =====================================================
    // CONFIGURACIÓN DE INDICADORES
    // =====================================================

    const summaryCards = [

        {
            id: "committed",
            title: "Total comprometido",
            value: formatExpenseCurrency(
                summary.totalCommitted
            ),
            description: "Monto pendiente de pago",
            icon: Wallet,
            variant: "primary",
        },

        {
            id: "pending",
            title: "Pagos pendientes",
            value: summary.pendingCount.toLocaleString(
                "es-CL"
            ),
            description: "Compromisos registrados",
            icon: CalendarClock,
            variant: "info",
        },

        {
            id: "overdue",
            title: "Pagos vencidos",
            value: summary.overdueCount.toLocaleString(
                "es-CL"
            ),
            description: formatExpenseCurrency(
                summary.overdueAmount
            ) + " vencidos",
            icon: AlertTriangle,
            variant: "warning",
        },

        {
            id: "upcoming",
            title: "Próximos 7 días",
            value: summary.upcomingCount.toLocaleString(
                "es-CL"
            ),
            description: "Pagos con fecha cercana",
            icon: Clock3,
            variant: "purple",
        },

    ];


    // =====================================================
    // INTERFAZ
    // =====================================================

    return (
        <section className="upcoming-expenses">

            {/* =========================================== */}
            {/* ENCABEZADO */}
            {/* =========================================== */}

            <div className="upcoming-expenses__header">

                <div>

                    <span className="upcoming-expenses__eyebrow">
                        Seguimiento financiero
                    </span>

                    <h2 className="upcoming-expenses__title">
                        Gastos pendientes
                    </h2>

                    <p className="upcoming-expenses__description">
                        Supervisa los compromisos financieros
                        y las fechas previstas de pago.
                    </p>

                </div>

            </div>


            {/* =========================================== */}
            {/* TARJETAS DE INDICADORES */}
            {/* =========================================== */}

            <div className="upcoming-expenses__summary">

                {summaryCards.map((card) => {

                    const CardIcon = card.icon;

                    return (

                        <article
                            key={card.id}
                            className={
                                "upcoming-expenses__summary-card " +
                                `upcoming-expenses__summary-card--${card.variant}`
                            }
                        >

                            <div className="upcoming-expenses__summary-top">

                                <span>
                                    {card.title}
                                </span>

                                <div className="upcoming-expenses__summary-icon">

                                    <CardIcon
                                        size={20}
                                        strokeWidth={1.8}
                                        aria-hidden="true"
                                    />

                                </div>

                            </div>

                            <strong className="upcoming-expenses__summary-value">
                                {card.value}
                            </strong>

                            <p className="upcoming-expenses__summary-description">
                                {card.description}
                            </p>

                        </article>

                    );

                })}

            </div>


            {/* =========================================== */}
            {/* LISTADO DE COMPROMISOS */}
            {/* =========================================== */}

            <div className="upcoming-expenses__panel">

                <div className="upcoming-expenses__panel-header">

                    <div>

                        <h3>
                            Compromisos registrados
                        </h3>

                        <p>
                            Ordenados por fecha prevista de pago.
                        </p>

                    </div>

                    <span className="upcoming-expenses__count">
                        {pendingExpenses.length} pendientes
                    </span>

                </div>


                {/* ======================================= */}
                {/* LISTA */}
                {/* ======================================= */}

                {pendingExpenses.length > 0 ? (

                    <div className="upcoming-expenses__list">

                        {pendingExpenses.map((expense) => {

                            const dueStatus =
                                getDueStatus(expense);

                            return (

                                <article
                                    className="upcoming-expenses__item"
                                    key={expense.id}
                                >

                                    {/* =================== */}
                                    {/* INFORMACIÓN */}
                                    {/* =================== */}

                                    <div className="upcoming-expenses__main">

                                        <div className="upcoming-expenses__icon">

                                            <CalendarDays
                                                size={20}
                                                aria-hidden="true"
                                            />

                                        </div>

                                        <div className="upcoming-expenses__info">

                                            <h4 className="upcoming-expenses__name">
                                                {expense.description}
                                            </h4>

                                            <span className="upcoming-expenses__category">
                                                {expense.category || "Sin categoría"}
                                            </span>

                                        </div>

                                    </div>


                                    {/* =================== */}
                                    {/* FECHA */}
                                    {/* =================== */}

                                    <div className="upcoming-expenses__column">

                                        <span className="upcoming-expenses__column-label">
                                            Fecha prevista
                                        </span>

                                        <strong className="upcoming-expenses__column-value">
                                            {formatExpenseDate(expense.date)}
                                        </strong>

                                    </div>


                                    {/* =================== */}
                                    {/* VENCIMIENTO */}
                                    {/* =================== */}

                                    <div className="upcoming-expenses__status-wrapper">

                                        <span
                                            className={
                                                "upcoming-expenses__status " +
                                                `upcoming-expenses__status--${dueStatus.variant}`
                                            }
                                        >
                                            {dueStatus.label}
                                        </span>

                                    </div>


                                    {/* =================== */}
                                    {/* MONTO */}
                                    {/* =================== */}

                                    <div className="upcoming-expenses__amount">

                                        <span className="upcoming-expenses__column-label">
                                            Monto pendiente
                                        </span>

                                        <strong>
                                            {formatExpenseCurrency(
                                                expense.amount
                                            )}
                                        </strong>

                                    </div>


                                    {/* =================== */}
                                    {/* ACCIONES */}
                                    {/* =================== */}

                                    <div className="upcoming-expenses__actions">

                                        {onViewExpense && (

                                            <button
                                                type="button"
                                                className="upcoming-expenses__action"
                                                onClick={() =>
                                                    onViewExpense(expense)
                                                }
                                                title="Ver detalles"
                                                aria-label={
                                                    `Ver detalles de ${expense.description}`
                                                }
                                            >
                                                <Eye size={17} />
                                            </button>

                                        )}


                                        {onEditExpense && (

                                            <button
                                                type="button"
                                                className="upcoming-expenses__action"
                                                onClick={() =>
                                                    onEditExpense(expense)
                                                }
                                                title="Editar gasto"
                                                aria-label={
                                                    `Editar ${expense.description}`
                                                }
                                            >
                                                <Pencil size={16} />
                                            </button>

                                        )}


                                        {onMarkAsPaid && (

                                            <button
                                                type="button"
                                                className="upcoming-expenses__pay-button"
                                                onClick={() =>
                                                    onMarkAsPaid(expense)
                                                }
                                            >

                                                <CheckCircle2
                                                    size={16}
                                                    aria-hidden="true"
                                                />

                                                Marcar pagado

                                            </button>

                                        )}

                                    </div>

                                </article>

                            );

                        })}

                    </div>

                ) : (

                    // =====================================
                    // ESTADO VACÍO
                    // =====================================

                    <div className="upcoming-expenses__empty">

                        <CheckCircle2
                            size={39}
                            strokeWidth={1.5}
                            aria-hidden="true"
                        />

                        <strong>
                            No hay gastos pendientes
                        </strong>

                        <p>
                            Todos los compromisos registrados
                            se encuentran pagados.
                        </p>

                    </div>

                )}

            </div>

        </section>
    );
}

export default UpcomingExpenses;