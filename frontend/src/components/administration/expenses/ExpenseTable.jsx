// Importamos useMemo y useState desde React.
// useState nos permitirá controlar los filtros.
// useMemo nos permitirá calcular los resultados filtrados.
import { useMemo, useState } from "react";

// Importamos los gastos simulados
// y las categorías disponibles.
import {
  expenses,
  expenseCategories,
} from "../../../data/admin/expensesData";

// Importamos los estilos exclusivos del componente.
import "../../../styles/components/administration/expenses/ExpenseTable.css";


// Creamos el componente encargado de mostrar
// el historial completo de gastos.
function ExpenseTable() {

  // ---------------------------------------------------------
  // ESTADOS DE LOS FILTROS
  // ---------------------------------------------------------

  // Guardamos el texto escrito en la barra de búsqueda.
  const [searchTerm, setSearchTerm] = useState("");

  // Guardamos la categoría seleccionada.
  const [selectedCategory, setSelectedCategory] = useState("Todas");

  // Guardamos el estado seleccionado.
  const [selectedStatus, setSelectedStatus] = useState("Todos");


  // ---------------------------------------------------------
  // FORMATEAR MONEDA
  // ---------------------------------------------------------

  // Creamos una función reutilizable
  // para mostrar montos en pesos chilenos.
  const formatCurrency = (value) => {

    // Utilizamos Intl.NumberFormat
    // para aplicar correctamente el formato chileno.
    return new Intl.NumberFormat("es-CL", {

      // Indicamos que se trata de una moneda.
      style: "currency",

      // Definimos pesos chilenos.
      currency: "CLP",

      // Eliminamos decimales.
      maximumFractionDigits: 0,

    }).format(value);
  };


  // ---------------------------------------------------------
  // FORMATEAR FECHA
  // ---------------------------------------------------------

  // Creamos una función para mostrar
  // las fechas de forma más fácil de leer.
  const formatDate = (date) => {

    // Convertimos el texto recibido en un objeto Date.
    const parsedDate = new Date(`${date}T00:00:00`);

    // Retornamos la fecha utilizando formato chileno.
    return new Intl.DateTimeFormat("es-CL", {

      // Mostramos día con dos dígitos.
      day: "2-digit",

      // Mostramos el mes abreviado.
      month: "short",

      // Mostramos el año completo.
      year: "numeric",

    }).format(parsedDate);
  };


  // ---------------------------------------------------------
  // FILTRAR GASTOS
  // ---------------------------------------------------------

  // Calculamos qué gastos deben mostrarse
  // según los filtros seleccionados.
  const filteredExpenses = useMemo(() => {

    // Normalizamos el texto de búsqueda
    // para facilitar las comparaciones.
    const normalizedSearch = searchTerm
      .trim()
      .toLowerCase();

    // Filtramos todos los movimientos.
    return expenses.filter((expense) => {

      // Comprobamos si la descripción contiene
      // el texto escrito por el usuario.
      const matchesDescription =
        expense.description
          .toLowerCase()
          .includes(normalizedSearch);

      // Comprobamos también la categoría.
      const matchesCategorySearch =
        expense.category
          .toLowerCase()
          .includes(normalizedSearch);

      // Comprobamos si cumple con el filtro
      // específico de categoría.
      const matchesCategory =
        selectedCategory === "Todas" ||
        expense.category === selectedCategory;

      // Comprobamos si cumple con
      // el filtro correspondiente al estado.
      const matchesStatus =
        selectedStatus === "Todos" ||
        expense.status === selectedStatus;

      // El gasto será mostrado solamente
      // si cumple todas las condiciones.
      return (
        (matchesDescription || matchesCategorySearch) &&
        matchesCategory &&
        matchesStatus
      );
    });

  }, [
    searchTerm,
    selectedCategory,
    selectedStatus,
  ]);


  // ---------------------------------------------------------
  // LIMPIAR FILTROS
  // ---------------------------------------------------------

  // Creamos una función para devolver
  // todos los filtros a su estado inicial.
  const handleClearFilters = () => {

    // Limpiamos la búsqueda.
    setSearchTerm("");

    // Volvemos a mostrar todas las categorías.
    setSelectedCategory("Todas");

    // Volvemos a mostrar todos los estados.
    setSelectedStatus("Todos");
  };


  // ---------------------------------------------------------
  // ACCIONES TEMPORALES
  // ---------------------------------------------------------

  // Creamos una función temporal para visualizar
  // el detalle completo de un gasto.
  const handleViewExpense = (expense) => {

    // Por ahora mostramos la información en consola.
    console.log("Ver gasto:", expense);
  };


  // Creamos una función temporal para editar un gasto.
  const handleEditExpense = (expense) => {

    // Por ahora solamente utilizamos la consola.
    console.log("Editar gasto:", expense);
  };


  // ---------------------------------------------------------
  // INTERFAZ
  // ---------------------------------------------------------

  // Retornamos la sección completa.
  return (
    <section className="expense-table-section">

      {/* ================================================== */}
      {/* ENCABEZADO */}
      {/* ================================================== */}

      <div className="expense-table-section__header">

        {/* Contenedor textual. */}
        <div>

          {/* Título de la sección. */}
          <h2 className="expense-table-section__title">
            Historial de gastos
          </h2>

          {/* Descripción breve. */}
          <p className="expense-table-section__description">
            Revisa y filtra todos los movimientos registrados.
          </p>

        </div>


        {/* Mostramos la cantidad de resultados encontrados. */}
        <span className="expense-table-section__count">
          {filteredExpenses.length} movimientos
        </span>

      </div>


      {/* ================================================== */}
      {/* FILTROS */}
      {/* ================================================== */}

      <div className="expense-table-filters">

        {/* Barra de búsqueda. */}
        <div className="expense-table-filters__search">

          {/* Etiqueta accesible para el campo. */}
          <label
            htmlFor="expense-search"
            className="expense-table-filters__label"
          >
            Buscar
          </label>

          {/* Campo de búsqueda. */}
          <input
            id="expense-search"
            type="search"
            placeholder="Ej: arriendo, aseo, internet..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />

        </div>


        {/* Filtro por categoría. */}
        <div className="expense-table-filters__field">

          {/* Etiqueta. */}
          <label
            htmlFor="expense-category-filter"
            className="expense-table-filters__label"
          >
            Categoría
          </label>

          {/* Selector de categoría. */}
          <select
            id="expense-category-filter"
            value={selectedCategory}
            onChange={(event) =>
              setSelectedCategory(event.target.value)
            }
          >

            {/* Opción inicial. */}
            <option value="Todas">
              Todas
            </option>

            {/* Generamos las categorías desde nuestro archivo data. */}
            {expenseCategories.map((category) => (

              // Creamos una opción por cada categoría.
              <option
                key={category}
                value={category}
              >
                {category}
              </option>

            ))}

          </select>

        </div>


        {/* Filtro por estado. */}
        <div className="expense-table-filters__field">

          {/* Etiqueta. */}
          <label
            htmlFor="expense-status-filter"
            className="expense-table-filters__label"
          >
            Estado
          </label>

          {/* Selector del estado. */}
          <select
            id="expense-status-filter"
            value={selectedStatus}
            onChange={(event) =>
              setSelectedStatus(event.target.value)
            }
          >

            {/* Mostramos todos los movimientos. */}
            <option value="Todos">
              Todos
            </option>

            {/* Mostramos solamente gastos pagados. */}
            <option value="Pagado">
              Pagados
            </option>

            {/* Mostramos solamente gastos pendientes. */}
            <option value="Pendiente">
              Pendientes
            </option>

          </select>

        </div>


        {/* Botón para limpiar filtros. */}
        <button
          className="expense-table-filters__clear"
          type="button"
          onClick={handleClearFilters}
        >
          Limpiar filtros
        </button>

      </div>


      {/* ================================================== */}
      {/* TABLA PARA ESCRITORIO */}
      {/* ================================================== */}

      <div className="expense-table-wrapper">

        {/* Creamos la tabla principal. */}
        <table className="expense-table">

          {/* Encabezado de la tabla. */}
          <thead>

            <tr>

              {/* Fecha. */}
              <th>Fecha</th>

              {/* Descripción. */}
              <th>Descripción</th>

              {/* Categoría. */}
              <th>Categoría</th>

              {/* Medio de pago. */}
              <th>Medio de pago</th>

              {/* Estado. */}
              <th>Estado</th>

              {/* Monto. */}
              <th className="expense-table__amount-heading">
                Monto
              </th>

              {/* Acciones. */}
              <th className="expense-table__actions-heading">
                Acciones
              </th>

            </tr>

          </thead>


          {/* Cuerpo de la tabla. */}
          <tbody>

            {/* Verificamos si existen resultados. */}
            {filteredExpenses.length > 0 ? (

              // Recorremos los gastos filtrados.
              filteredExpenses.map((expense) => (

                // Creamos una fila para cada gasto.
                <tr key={expense.id}>

                  {/* Mostramos la fecha. */}
                  <td>
                    {formatDate(expense.date)}
                  </td>


                  {/* Mostramos la descripción. */}
                  <td>

                    {/* Agrupamos descripción y notas. */}
                    <div className="expense-table__description">

                      {/* Nombre principal. */}
                      <strong>
                        {expense.description}
                      </strong>

                      {/* Observación complementaria. */}
                      <span>
                        {expense.notes}
                      </span>

                    </div>

                  </td>


                  {/* Categoría. */}
                  <td>
                    {expense.category}
                  </td>


                  {/* Medio de pago. */}
                  <td>
                    {expense.paymentMethod}
                  </td>


                  {/* Estado. */}
                  <td>

                    {/* Aplicamos una clase diferente
                        dependiendo del estado. */}
                    <span
                      className={`expense-table__status ${
                        expense.status === "Pagado"
                          ? "expense-table__status--paid"
                          : "expense-table__status--pending"
                      }`}
                    >
                      {expense.status}
                    </span>

                  </td>


                  {/* Monto. */}
                  <td className="expense-table__amount">
                    {formatCurrency(expense.amount)}
                  </td>


                  {/* Acciones disponibles. */}
                  <td>

                    <div className="expense-table__actions">

                      {/* Botón para visualizar. */}
                      <button
                        type="button"
                        onClick={() =>
                          handleViewExpense(expense)
                        }
                      >
                        Ver
                      </button>

                      {/* Botón para editar. */}
                      <button
                        type="button"
                        onClick={() =>
                          handleEditExpense(expense)
                        }
                      >
                        Editar
                      </button>

                    </div>

                  </td>

                </tr>

              ))

            ) : (

              // Mostramos una fila vacía
              // cuando ningún gasto cumple los filtros.
              <tr>

                <td
                  colSpan="7"
                  className="expense-table__empty"
                >
                  No se encontraron gastos con los filtros seleccionados.
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>


      {/* ================================================== */}
      {/* TARJETAS PARA MÓVIL */}
      {/* ================================================== */}

      <div className="expense-mobile-list">

        {/* Recorremos los mismos resultados filtrados. */}
        {filteredExpenses.map((expense) => (

          // Creamos una tarjeta móvil.
          <article
            className="expense-mobile-card"
            key={`mobile-${expense.id}`}
          >

            {/* Cabecera de la tarjeta. */}
            <div className="expense-mobile-card__header">

              {/* Información principal. */}
              <div>

                {/* Nombre del gasto. */}
                <h3>
                  {expense.description}
                </h3>

                {/* Fecha. */}
                <span>
                  {formatDate(expense.date)}
                </span>

              </div>


              {/* Monto principal. */}
              <strong className="expense-mobile-card__amount">
                {formatCurrency(expense.amount)}
              </strong>

            </div>


            {/* Información secundaria. */}
            <div className="expense-mobile-card__details">

              {/* Categoría. */}
              <div>
                <span>Categoría</span>
                <strong>{expense.category}</strong>
              </div>


              {/* Medio de pago. */}
              <div>
                <span>Medio de pago</span>
                <strong>{expense.paymentMethod}</strong>
              </div>

            </div>


            {/* Parte inferior. */}
            <div className="expense-mobile-card__footer">

              {/* Estado del gasto. */}
              <span
                className={`expense-table__status ${
                  expense.status === "Pagado"
                    ? "expense-table__status--paid"
                    : "expense-table__status--pending"
                }`}
              >
                {expense.status}
              </span>


              {/* Acciones móviles. */}
              <div className="expense-mobile-card__actions">

                {/* Visualizar. */}
                <button
                  type="button"
                  onClick={() =>
                    handleViewExpense(expense)
                  }
                >
                  Ver
                </button>

                {/* Editar. */}
                <button
                  type="button"
                  onClick={() =>
                    handleEditExpense(expense)
                  }
                >
                  Editar
                </button>

              </div>

            </div>

          </article>

        ))}


        {/* Estado vacío móvil. */}
        {filteredExpenses.length === 0 && (

          <div className="expense-mobile-list__empty">
            No se encontraron gastos con los filtros seleccionados.
          </div>

        )}

      </div>

    </section>
  );
}


// Exportamos el componente.
export default ExpenseTable;