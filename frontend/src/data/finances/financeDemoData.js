
/* ========================================================= */
/* DATOS FINANCIEROS DE DEMOSTRACIÓN */
/* IGLESIA EL ANCLA */
/* ========================================================= */

// IMPORTANTE:
// Todos los valores son ficticios.
// No corresponden a registros financieros reales.
//
// Los montos se expresan en pesos chilenos (CLP).

export const FINANCE_DEMO_YEAR = 2026;

// =========================================================
// DATOS MENSUALES
// =========================================================

// Cada mes contiene ingresos y gastos desglosados
// por categoría.
//
// Los totales anuales son:
// Ingresos: $4.850.000
// Gastos:   $3.120.000
// Pendientes: $420.000

export const financeDemoData = [
    {
        month: 1,
        label: "Ene",
        income: {
            offerings: 190000,
            tithes: 140000,
            donations: 40000,
            other: 10000,
        },
        expenses: {
            maintenance: 85000,
            utilities: 60000,
            ministries: 55000,
            activities: 30000,
            other: 15000,
        },
        pending: 20000,
    },
    {
        month: 2,
        label: "Feb",
        income: {
            offerings: 210000,
            tithes: 155000,
            donations: 40000,
            other: 15000,
        },
        expenses: {
            maintenance: 95000,
            utilities: 70000,
            ministries: 55000,
            activities: 35000,
            other: 15000,
        },
        pending: 25000,
    },
    {
        month: 3,
        label: "Mar",
        income: {
            offerings: 230000,
            tithes: 165000,
            donations: 40000,
            other: 15000,
        },
        expenses: {
            maintenance: 105000,
            utilities: 75000,
            ministries: 60000,
            activities: 35000,
            other: 20000,
        },
        pending: 30000,
    },
    {
        month: 4,
        label: "Abr",
        income: {
            offerings: 195000,
            tithes: 145000,
            donations: 40000,
            other: 10000,
        },
        expenses: {
            maintenance: 95000,
            utilities: 65000,
            ministries: 55000,
            activities: 30000,
            other: 15000,
        },
        pending: 25000,
    },
    {
        month: 5,
        label: "May",
        income: {
            offerings: 240000,
            tithes: 170000,
            donations: 45000,
            other: 15000,
        },
        expenses: {
            maintenance: 115000,
            utilities: 80000,
            ministries: 65000,
            activities: 40000,
            other: 20000,
        },
        pending: 40000,
    },
    {
        month: 6,
        label: "Jun",
        income: {
            offerings: 260000,
            tithes: 185000,
            donations: 50000,
            other: 15000,
        },
        expenses: {
            maintenance: 125000,
            utilities: 85000,
            ministries: 70000,
            activities: 45000,
            other: 20000,
        },
        pending: 50000,
    },
    {
        month: 7,
        label: "Jul",
        income: {
            offerings: 185000,
            tithes: 135000,
            donations: 30000,
            other: 10000,
        },
        expenses: {
            maintenance: 85000,
            utilities: 60000,
            ministries: 50000,
            activities: 30000,
            other: 15000,
        },
        pending: 30000,
    },
    {
        month: 8,
        label: "Ago",
        income: {
            offerings: 220000,
            tithes: 160000,
            donations: 40000,
            other: 10000,
        },
        expenses: {
            maintenance: 100000,
            utilities: 70000,
            ministries: 60000,
            activities: 35000,
            other: 20000,
        },
        pending: 40000,
    },
    {
        month: 9,
        label: "Sep",
        income: {
            offerings: 210000,
            tithes: 150000,
            donations: 40000,
            other: 10000,
        },
        expenses: {
            maintenance: 95000,
            utilities: 65000,
            ministries: 55000,
            activities: 30000,
            other: 15000,
        },
        pending: 45000,
    },
    {
        month: 10,
        label: "Oct",
        income: {
            offerings: 200000,
            tithes: 145000,
            donations: 35000,
            other: 10000,
        },
        expenses: {
            maintenance: 90000,
            utilities: 60000,
            ministries: 50000,
            activities: 25000,
            other: 15000,
        },
        pending: 45000,
    },
    {
        month: 11,
        label: "Nov",
        income: {
            offerings: 170000,
            tithes: 125000,
            donations: 25000,
            other: 10000,
        },
        expenses: {
            maintenance: 65000,
            utilities: 45000,
            ministries: 35000,
            activities: 25000,
            other: 10000,
        },
        pending: 35000,
    },
    {
        month: 12,
        label: "Dic",
        income: {
            offerings: 140000,
            tithes: 125000,
            donations: 65000,
            other: -20000,
        },
        expenses: {
            maintenance: 45000,
            utilities: 45000,
            ministries: 40000,
            activities: 30000,
            other: 20000,
        },
        pending: 35000,
    },
];

// =========================================================
// CATEGORÍAS
// =========================================================

export const financeIncomeCategories = [
    { key: "offerings", name: "Ofrendas" },
    { key: "tithes", name: "Diezmos" },
    { key: "donations", name: "Donaciones" },
    { key: "other", name: "Otros ingresos" },
];

export const financeExpenseCategories = [
    { key: "maintenance", name: "Mantención" },
    { key: "utilities", name: "Servicios básicos" },
    { key: "ministries", name: "Ministerios" },
    { key: "activities", name: "Actividades" },
    { key: "other", name: "Otros gastos" },
];

// =========================================================
// FUNCIONES DE CÁLCULO
// =========================================================

// Suma los valores numéricos de un objeto.

const sumValues = (values) =>
    Object.values(values).reduce(
        (total, value) => total + value,
        0
    );

// Construye una distribución por categoría.

const buildDistribution = (records, field, categories) =>
    categories.map((category) => ({
        name: category.name,
        value: records.reduce(
            (total, record) =>
                total + (record[field][category.key] || 0),
            0
        ),
    }));

// =========================================================
// OBTENER RESUMEN FINANCIERO
// =========================================================

export function getFinanceDemoSummary({
    year,
    period,
}) {

    const selectedYear = Number(year);

    // No inventamos registros de años no disponibles.

    if (selectedYear !== FINANCE_DEMO_YEAR) {
        return null;
    }

    // Filtramos por el mes actual cuando corresponda.

    const today = new Date();

    const selectedRecords = period === "month"
        ? today.getFullYear() === selectedYear
            ? financeDemoData.filter(
                (record) =>
                    record.month === today.getMonth() + 1
            )
            : []
        : financeDemoData;

    if (selectedRecords.length === 0) {
        return null;
    }

    // Construimos los totales por mes.

    const monthlyData = selectedRecords.map((record) => ({
        month: record.label,
        income: sumValues(record.income),
        expenses: sumValues(record.expenses),
    }));

    const income = monthlyData.reduce(
        (total, record) => total + record.income,
        0
    );

    const expenses = monthlyData.reduce(
        (total, record) => total + record.expenses,
        0
    );

    const pending = selectedRecords.reduce(
        (total, record) => total + record.pending,
        0
    );

    const balance = income - expenses;

    return {
        year: selectedYear,
        period,
        income,
        expenses,
        pending,
        balance,
        projectedBalance: balance - pending,
        monthlyData,
        incomeDistribution: buildDistribution(
            selectedRecords,
            "income",
            financeIncomeCategories
        ),
        expenseDistribution: buildDistribution(
            selectedRecords,
            "expenses",
            financeExpenseCategories
        ),
    };
}
