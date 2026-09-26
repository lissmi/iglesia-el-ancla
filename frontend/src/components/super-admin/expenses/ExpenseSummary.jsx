// Importamos useMemo desde React.
// Nos permitirá memorizar cálculos derivados de los gastos
// para evitar realizarlos nuevamente en cada render innecesariamente.
import { useMemo } from "react";

// Importamos los gastos simulados que creamos anteriormente.
// Más adelante estos datos serán reemplazados por información
// obtenida desde nuestra API.
import { expenses } from "../../../data/admin/expensesData";

// Importamos los estilos específicos del componente.
import "../../../styles/components/super-admin/expenses/ExpenseSummary.css";

// Creamos el componente encargado de mostrar
// los principales indicadores relacionados con los gastos.
function ExpenseSummary() {

  // ---------------------------------------------------------
  // FORMATEAR MONEDA
  // ---------------------------------------------------------

  // Creamos una función para transformar números
  // en valores monetarios con formato chileno.
  const formatCurrency = (value) => {

    // Utilizamos Intl.NumberFormat para evitar
    // formatear manualmente los números.
    return new Intl.NumberFormat("es-CL", {

      // Indicamos que queremos mostrar una moneda.
      style: "currency",

      // Indicamos que utilizaremos pesos chilenos.
      currency: "CLP",

      // Eliminamos los decimales porque normalmente
      // los pesos chilenos se muestran sin ellos.
      maximumFractionDigits: 0,

    }).format(value);
  };

  // ---------------------------------------------------------
  // GASTOS PAGADOS DEL MES
  // ---------------------------------------------------------

  // Calculamos el total de gastos que aparecen
  // actualmente como pagados.
  const totalPaidExpenses = useMemo(() => {

    // Filtramos solamente los movimientos
    // cuyo estado sea "Pagado".
    return expenses

      // Dejamos solamente los gastos pagados.
      .filter((expense) => expense.status === "Pagado")

      // Sumamos el monto de todos esos movimientos.
      .reduce(
        (total, expense) => total + expense.amount,
        0
      );

  }, []);

  // ---------------------------------------------------------
  // CANTIDAD DE GASTOS PAGADOS
  // ---------------------------------------------------------

  // Contamos cuántos gastos tienen estado "Pagado".
  const paidExpensesCount = useMemo(() => {

    // Filtramos los gastos pagados.
    return expenses.filter(
      (expense) => expense.status === "Pagado"
    ).length;

  }, []);

  // ---------------------------------------------------------
  // GASTOS PENDIENTES
  // ---------------------------------------------------------

  // Calculamos el total de dinero que corresponde
  // a gastos registrados pero todavía pendientes de pago.
  const pendingExpensesTotal = useMemo(() => {

    // Filtramos solamente los gastos pendientes.
    return expenses

      // Dejamos únicamente los movimientos pendientes.
      .filter((expense) => expense.status === "Pendiente")

      // Sumamos sus montos.
      .reduce(
        (total, expense) => total + expense.amount,
        0
      );

  }, []);

  // ---------------------------------------------------------
  // CANTIDAD DE GASTOS PENDIENTES
  // ---------------------------------------------------------

  // Calculamos cuántos movimientos siguen pendientes.
  const pendingExpensesCount = useMemo(() => {

    // Filtramos los movimientos pendientes
    // y obtenemos la cantidad resultante.
    return expenses.filter(
      (expense) => expense.status === "Pendiente"
    ).length;

  }, []);

  // ---------------------------------------------------------
  // GASTO DEL MES ANTERIOR
  // ---------------------------------------------------------

  // Guardamos temporalmente el total correspondiente
  // al mes anterior.
  // Más adelante este valor se calculará automáticamente
  // utilizando los movimientos almacenados en MongoDB.
  const previousMonthExpenses = 580000;

  // ---------------------------------------------------------
  // VARIACIÓN RESPECTO AL MES ANTERIOR
  // ---------------------------------------------------------

  // Calculamos la diferencia porcentual entre
  // el gasto actual y el gasto del mes anterior.
  const monthlyVariation =
    ((totalPaidExpenses - previousMonthExpenses) /
      previousMonthExpenses) *
    100;

  // ---------------------------------------------------------
  // GASTOS AGRUPADOS POR CATEGORÍA
  // ---------------------------------------------------------

  // Agrupamos los gastos pagados según su categoría
  // para determinar posteriormente cuál concentra
  // el mayor monto de dinero.
  const expensesByCategory = useMemo(() => {

    // Creamos un objeto vacío donde iremos
    // acumulando los montos.
    const categories = {};

    // Recorremos cada gasto.
    expenses.forEach((expense) => {

      // Solo utilizamos gastos que ya fueron pagados.
      if (expense.status === "Pagado") {

        // Si todavía no existe esta categoría dentro
        // del objeto, la creamos inicialmente con valor cero.
        if (!categories[expense.category]) {
          categories[expense.category] = 0;
        }

        // Sumamos el monto del gasto al total
        // correspondiente a su categoría.
        categories[expense.category] += expense.amount;
      }
    });

    // Transformamos el objeto en un arreglo.
    // Esto también será útil posteriormente
    // cuando construyamos nuestros gráficos.
    return Object.entries(categories).map(
      ([category, amount]) => ({

        // Guardamos el nombre de la categoría.
        category,

        // Guardamos el monto acumulado.
        amount,
      })
    );

  }, []);

  // ---------------------------------------------------------
  // CATEGORÍA CON MAYOR GASTO
  // ---------------------------------------------------------

  // Buscamos cuál categoría concentra el mayor monto.
  const highestExpenseCategory = useMemo(() => {

    // Si no existen gastos registrados,
    // devolvemos información predeterminada.
    if (expensesByCategory.length === 0) {
      return {
        category: "Sin datos",
        amount: 0,
      };
    }

    // Comparamos cada categoría hasta encontrar
    // aquella que tenga el monto más alto.
    return expensesByCategory.reduce(
      (highest, current) =>

        // Si el monto actual es mayor que el anterior,
        // utilizamos la categoría actual.
        current.amount > highest.amount
          ? current
          : highest
    );

  }, [expensesByCategory]);

  // ---------------------------------------------------------
  // TEXTO DE VARIACIÓN
  // ---------------------------------------------------------

  // Determinamos si este mes se gastó más o menos
  // que durante el mes anterior.
  const variationText =
    monthlyVariation > 0
      ? "más que el mes anterior"
      : monthlyVariation < 0
      ? "menos que el mes anterior"
      : "igual que el mes anterior";

  // ---------------------------------------------------------
  // INTERFAZ
  // ---------------------------------------------------------

  // Retornamos las tarjetas del resumen financiero.
  return (
    <section className="expense-summary">

      {/* -------------------------------------------------- */}
      {/* TARJETA: GASTOS DEL MES */}
      {/* -------------------------------------------------- */}

      <article className="expense-summary__card">

        {/* Mostramos el nombre del indicador. */}
        <span className="expense-summary__label">
          Gastos del mes
        </span>

        {/* Mostramos el total pagado. */}
        <strong className="expense-summary__value">
          {formatCurrency(totalPaidExpenses)}
        </strong>

        {/* Mostramos cuántos movimientos forman el total. */}
        <span className="expense-summary__detail">
          {paidExpensesCount} gastos pagados
        </span>

      </article>

      {/* -------------------------------------------------- */}
      {/* TARJETA: MES ANTERIOR */}
      {/* -------------------------------------------------- */}

      <article className="expense-summary__card">

        {/* Nombre del indicador. */}
        <span className="expense-summary__label">
          Mes anterior
        </span>

        {/* Total temporal del mes anterior. */}
        <strong className="expense-summary__value">
          {formatCurrency(previousMonthExpenses)}
        </strong>

        {/* Mostramos la comparación porcentual. */}
        <span
          className={`expense-summary__detail ${
            monthlyVariation > 0
              ? "expense-summary__detail--increase"
              : "expense-summary__detail--decrease"
          }`}
        >
          {monthlyVariation > 0 ? "↑" : "↓"}{" "}
          {Math.abs(monthlyVariation).toFixed(1)}%{" "}
          {variationText}
        </span>

      </article>

      {/* -------------------------------------------------- */}
      {/* TARJETA: GASTOS COMPROMETIDOS */}
      {/* -------------------------------------------------- */}

      <article className="expense-summary__card">

        {/* Nombre del indicador. */}
        <span className="expense-summary__label">
          Gastos comprometidos
        </span>

        {/* Total pendiente de pago. */}
        <strong className="expense-summary__value">
          {formatCurrency(pendingExpensesTotal)}
        </strong>

        {/* Cantidad de movimientos pendientes. */}
        <span className="expense-summary__detail">
          {pendingExpensesCount} gastos pendientes
        </span>

      </article>

      {/* -------------------------------------------------- */}
      {/* TARJETA: MAYOR CATEGORÍA */}
      {/* -------------------------------------------------- */}

      <article className="expense-summary__card">

        {/* Nombre del indicador. */}
        <span className="expense-summary__label">
          Mayor categoría de gasto
        </span>

        {/* Categoría con mayor monto. */}
        <strong className="expense-summary__value expense-summary__value--text">
          {highestExpenseCategory.category}
        </strong>

        {/* Monto acumulado de esa categoría. */}
        <span className="expense-summary__detail">
          {formatCurrency(highestExpenseCategory.amount)}
        </span>

      </article>

    </section>
  );
}

// Exportamos el componente para poder utilizarlo
// dentro de nuestra página principal.
export default ExpenseSummary;