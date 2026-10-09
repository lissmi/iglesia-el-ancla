// Importamos useMemo desde React.
// Lo utilizaremos para obtener solamente
// los gastos que todavía están pendientes.
import { useMemo } from "react";

// Importamos los gastos temporales
// que actualmente simulan la información de MongoDB.
import { expenses } from "../../../data/admin/expensesData";

// Importamos los estilos específicos del componente.
import "../../../styles/components/administration/expenses/UpcomingExpenses.css";


// Creamos el componente que mostrará
// los gastos próximos o comprometidos.
function UpcomingExpenses() {

  // ---------------------------------------------------------
  // FORMATEAR MONEDA
  // ---------------------------------------------------------

  // Creamos una función reutilizable para mostrar
  // los montos en formato de peso chileno.
  const formatCurrency = (value) => {

    // Utilizamos Intl.NumberFormat para aplicar
    // correctamente el formato monetario.
    return new Intl.NumberFormat("es-CL", {

      // Indicamos que queremos mostrar una moneda.
      style: "currency",

      // Definimos pesos chilenos.
      currency: "CLP",

      // Evitamos mostrar decimales.
      maximumFractionDigits: 0,

    }).format(value);
  };


  // ---------------------------------------------------------
  // FORMATEAR FECHA
  // ---------------------------------------------------------

  // Creamos una función para transformar
  // una fecha como "2026-08-28"
  // en una fecha más amigable para el usuario.
  const formatDate = (date) => {

    // Creamos un objeto Date.
    const parsedDate = new Date(`${date}T00:00:00`);

    // Retornamos la fecha utilizando formato chileno.
    return new Intl.DateTimeFormat("es-CL", {

      // Mostramos el día con dos dígitos.
      day: "2-digit",

      // Mostramos el nombre abreviado del mes.
      month: "short",

      // Mostramos el año completo.
      year: "numeric",

    }).format(parsedDate);
  };


  // ---------------------------------------------------------
  // OBTENER GASTOS PENDIENTES
  // ---------------------------------------------------------

  // Filtramos los gastos para mostrar solamente
  // aquellos cuyo estado sea "Pendiente".
  const upcomingExpenses = useMemo(() => {

    // Filtramos y ordenamos los gastos pendientes.
    return expenses

      // Dejamos solamente los gastos pendientes.
      .filter(
        (expense) => expense.status === "Pendiente"
      )

      // Ordenamos los movimientos por fecha,
      // mostrando primero los más próximos.
      .sort(
        (firstExpense, secondExpense) =>
          new Date(firstExpense.date) -
          new Date(secondExpense.date)
      );

  }, []);


  // ---------------------------------------------------------
  // TOTAL COMPROMETIDO
  // ---------------------------------------------------------

  // Calculamos cuánto dinero representan
  // todos los gastos pendientes.
  const totalUpcomingExpenses = useMemo(() => {

    // Sumamos los montos de cada gasto pendiente.
    return upcomingExpenses.reduce(
      (total, expense) => total + expense.amount,
      0
    );

  }, [upcomingExpenses]);


  // ---------------------------------------------------------
  // INTERFAZ
  // ---------------------------------------------------------

  // Retornamos la sección completa.
  return (
    <section className="upcoming-expenses">

      {/* ================================================== */}
      {/* ENCABEZADO */}
      {/* ================================================== */}

      <div className="upcoming-expenses__header">

        {/* Contenedor del título y descripción. */}
        <div>

          {/* Título principal. */}
          <h2 className="upcoming-expenses__title">
            Gastos próximos
          </h2>

          {/* Descripción breve de la sección. */}
          <p className="upcoming-expenses__description">
            Pagos comprometidos que todavía se encuentran pendientes.
          </p>

        </div>


        {/* Mostramos el total comprometido. */}
        <div className="upcoming-expenses__total">

          {/* Etiqueta explicativa. */}
          <span className="upcoming-expenses__total-label">
            Total comprometido
          </span>

          {/* Monto total. */}
          <strong className="upcoming-expenses__total-value">
            {formatCurrency(totalUpcomingExpenses)}
          </strong>

        </div>

      </div>


      {/* ================================================== */}
      {/* LISTADO DE GASTOS */}
      {/* ================================================== */}

      <div className="upcoming-expenses__list">

        {/* Comprobamos si existen gastos pendientes. */}
        {upcomingExpenses.length > 0 ? (

          // Recorremos los gastos pendientes.
          upcomingExpenses.map((expense) => (

            // Creamos una fila para cada gasto.
            <article
              className="upcoming-expenses__item"
              key={expense.id}
            >

              {/* ------------------------------------------------ */}
              {/* INFORMACIÓN PRINCIPAL */}
              {/* ------------------------------------------------ */}

              <div className="upcoming-expenses__main">

                {/* Indicador visual. */}
                <div className="upcoming-expenses__icon">

                  {/* Utilizamos un símbolo sencillo
                      mientras todavía no incorporamos
                      una librería de iconos. */}
                  $
                </div>


                {/* Agrupamos nombre y categoría. */}
                <div className="upcoming-expenses__info">

                  {/* Nombre del gasto. */}
                  <h3 className="upcoming-expenses__name">
                    {expense.description}
                  </h3>

                  {/* Categoría del gasto. */}
                  <span className="upcoming-expenses__category">
                    {expense.category}
                  </span>

                </div>

              </div>


              {/* ------------------------------------------------ */}
              {/* FECHA */}
              {/* ------------------------------------------------ */}

              <div className="upcoming-expenses__column">

                {/* Etiqueta. */}
                <span className="upcoming-expenses__column-label">
                  Fecha
                </span>

                {/* Fecha del gasto. */}
                <span className="upcoming-expenses__column-value">
                  {formatDate(expense.date)}
                </span>

              </div>


              {/* ------------------------------------------------ */}
              {/* MEDIO DE PAGO */}
              {/* ------------------------------------------------ */}

              <div className="upcoming-expenses__column">

                {/* Etiqueta. */}
                <span className="upcoming-expenses__column-label">
                  Medio de pago
                </span>

                {/* Medio esperado. */}
                <span className="upcoming-expenses__column-value">
                  {expense.paymentMethod}
                </span>

              </div>


              {/* ------------------------------------------------ */}
              {/* ESTADO */}
              {/* ------------------------------------------------ */}

              <div className="upcoming-expenses__status-wrapper">

                {/* Mostramos el estado como una etiqueta visual. */}
                <span className="upcoming-expenses__status">
                  {expense.status}
                </span>

              </div>


              {/* ------------------------------------------------ */}
              {/* MONTO */}
              {/* ------------------------------------------------ */}

              <div className="upcoming-expenses__amount">

                {/* Etiqueta. */}
                <span className="upcoming-expenses__column-label">
                  Monto
                </span>

                {/* Monto del gasto. */}
                <strong>
                  {formatCurrency(expense.amount)}
                </strong>

              </div>

            </article>

          ))

        ) : (

          // Si no existen gastos pendientes,
          // mostramos un mensaje informativo.
          <div className="upcoming-expenses__empty">

            {/* Mensaje principal. */}
            <strong>
              No existen gastos pendientes.
            </strong>

            {/* Mensaje complementario. */}
            <span>
              Todos los gastos registrados se encuentran pagados.
            </span>

          </div>

        )}

      </div>

    </section>
  );
}


// Exportamos el componente para utilizarlo
// dentro de ExpenseManagement.
export default UpcomingExpenses;