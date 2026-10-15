// =========================================================
// UTILIDADES DE GESTIÓN DE GASTOS
// =========================================================

// Estas funciones permiten mantener criterios
// consistentes entre los diferentes componentes
// del módulo financiero.


// =========================================================
// FORMATEAR MONEDA
// =========================================================

export const formatExpenseCurrency = (value) => {

    return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0,
    }).format(Number(value) || 0);

};


// =========================================================
// FORMATEAR FECHA
// =========================================================

export const formatExpenseDate = (value) => {

    if (
        typeof value !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
        return "Fecha no disponible";
    }

    const date = new Date(`${value}T12:00:00`);

    if (Number.isNaN(date.getTime())) {
        return "Fecha no disponible";
    }

    return new Intl.DateTimeFormat("es-CL", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);

};


// =========================================================
// COMPROBAR GASTO PAGADO
// =========================================================

export const isPaidExpense = (expense) => {

    return expense?.status === "Pagado";

};


// =========================================================
// COMPROBAR GASTO PENDIENTE
// =========================================================

export const isPendingExpense = (expense) => {

    return expense?.status === "Pendiente";

};


// =========================================================
// VALIDAR MONTO
// =========================================================

export const isValidExpenseAmount = (value) => {

    const amount = Number(value);

    return (
        Number.isSafeInteger(amount) &&
        amount > 0
    );

};


// =========================================================
// SUMAR MONTOS
// =========================================================

export const sumExpenseAmounts = (expenses = []) => {

    return expenses.reduce((total, expense) => {

        const amount = Number(expense.amount);

        if (!isValidExpenseAmount(amount)) {
            return total;
        }

        return total + amount;

    }, 0);

};


// =========================================================
// OBTENER FECHA LOCAL
// =========================================================

export const getExpenseLocalDate = (date = new Date()) => {

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
// FILTRAR POR MES ACTUAL
// =========================================================

export const getCurrentMonthExpenses = (expenses = []) => {

    const currentMonth =
        getExpenseLocalDate().slice(0, 7);

    return expenses.filter((expense) => {

        return (
            typeof expense.date === "string" &&
            expense.date.slice(0, 7) === currentMonth
        );

    });

};


// =========================================================
// FILTRAR POR AÑO ACTUAL
// =========================================================

export const getCurrentYearExpenses = (expenses = []) => {

    const currentYear =
        getExpenseLocalDate().slice(0, 4);

    return expenses.filter((expense) => {

        return (
            typeof expense.date === "string" &&
            expense.date.slice(0, 4) === currentYear
        );

    });

};