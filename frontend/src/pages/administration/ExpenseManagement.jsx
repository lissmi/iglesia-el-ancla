
/* ========================================================= */
/* IMPORTACIONES */
/* ========================================================= */

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";


// =========================================================
// COMPONENTES DE GESTIÓN DE GASTOS
// =========================================================

// Encabezado principal.
import ExpenseHeader from "../../components/administration/expenses/ExpenseHeader";

// Navegación interna.
import ExpenseNavigation from "../../components/administration/expenses/ExpenseNavigation";

// Tarjetas de resumen financiero.
import ExpenseSummary from "../../components/administration/expenses/ExpenseSummary";

// Indicadores administrativos, alertas y movimientos recientes.
import ExpenseOverview from "../../components/administration/expenses/ExpenseOverview";
import ExpenseAlerts from "../../components/administration/expenses/ExpenseAlerts";
import ExpenseRecentActivity from "../../components/administration/expenses/ExpenseRecentActivity";


// Gráficos y análisis de gastos.
import ExpenseCharts from "../../components/administration/expenses/ExpenseCharts";

// Distribución de gastos por categorías.
import ExpenseCategories from "../../components/administration/expenses/ExpenseCategories";

// Gastos pendientes y próximos pagos.
import UpcomingExpenses from "../../components/administration/expenses/UpcomingExpenses";

// Historial de gastos.
import ExpenseTable from "../../components/administration/expenses/ExpenseTable";

// Modal para registrar y editar gastos.
import ExpenseFormModal from "../../components/administration/expenses/ExpenseFormModal";

// Modal para visualizar detalles.
import ExpenseDetailsModal from "../../components/administration/expenses/ExpenseDetailsModal";

import ExpenseDeleteModal from "../../components/administration/expenses/ExpenseDeleteModal";



// =========================================================
// CONTEXTO COMPARTIDO DE GASTOS
// =========================================================

// Utilizamos una única fuente de datos para los gastos.
// Así, el encabezado y otras páginas administrativas
// pueden consultar los registros actualizados.
import { useExpenses } from "../../context/expenses/ExpensesContext";


// =========================================================
// ESTILOS
// =========================================================

import "../../styles/pages/administration/ExpenseManagement.css";



// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function ExpenseManagement() {

  // =====================================================
  // NAVEGACIÓN DESDE NOTIFICACIONES
  // =====================================================

  const location = useLocation();
  const navigate = useNavigate();


  // =====================================================
  // SECCIÓN ACTIVA
  // =====================================================

  // summary    = Resumen financiero.
  // charts     = Análisis de gastos.
  // categories = Distribución por categorías.
  // upcoming   = Gastos pendientes.
  // history    = Historial completo.

  const [activeSection, setActiveSection] =
    useState("summary");


  // =====================================================
  // DATOS COMPARTIDOS DE GASTOS
  // =====================================================

  // Leemos los registros y las operaciones del contexto.
  // No creamos otro useState para expenses, porque eso
  // produciría dos fuentes de datos independientes.
  const {
    expenses,
    saveExpense,
    deleteExpense,
  } = useExpenses();


  // =====================================================
  // ESTADO DEL FORMULARIO
  // =====================================================

  // Controlamos si el modal de registro
  // y edición se encuentra abierto.

  const [isExpenseModalOpen, setIsExpenseModalOpen] =
    useState(false);


  // =====================================================
  // GASTO SELECCIONADO PARA EDICIÓN
  // =====================================================

  // null = Registrar un gasto nuevo.
  //
  // Objeto = Editar un gasto existente.

  const [editingExpense, setEditingExpense] =
    useState(null);


  // =====================================================
  // GASTO SELECCIONADO PARA VISUALIZACIÓN
  // =====================================================

  // Almacenamos el identificador del gasto
  // cuyos detalles queremos consultar.

  const [selectedExpenseId, setSelectedExpenseId] =
    useState(null);


  // Obtenemos el registro actualizado desde
  // el estado principal de gastos.

  const selectedExpense = expenses.find(
    (expense) => expense.id === selectedExpenseId
  ) ?? null;


  // =====================================================
  // ABRIR UN GASTO DESDE LA URL DE LA NOTIFICACIÓN
  // =====================================================

  useEffect(() => {
    // Ejemplo: /admin/finanzas/gastos?gasto=123
    const requestedId = new URLSearchParams(location.search).get("gasto");
    if (!requestedId) return;

    const expense = expenses.find(
      (item) => String(item.id) === requestedId
    );

    if (!expense) {
      // Evitamos abrir registros inexistentes o eliminados.
      console.warn("No se encontró el gasto solicitado:", requestedId);
      return;
    }

    setActiveSection("upcoming");
    setSelectedExpenseId(expense.id);

    // IMPORTANTE: no quitamos el parámetro aquí.
    // Se elimina al cerrar el modal para no interferir
    // con la transición y evitar reaperturas.
  }, [expenses, location.search]);


  // =====================================================
  // ABRIR FORMULARIO PARA REGISTRAR
  // =====================================================

  const handleOpenExpenseModal = () => {

    // Limpiamos cualquier selección anterior.

    setEditingExpense(null);

    // Abrimos el formulario vacío.

    setIsExpenseModalOpen(true);

  };


  // =====================================================
  // ABRIR FORMULARIO PARA EDITAR
  // =====================================================

  const handleEditExpense = (expense) => {

    // Guardamos el gasto seleccionado.

    setEditingExpense(expense);

    // Abrimos el formulario.
    //
    // ExpenseFormModal detectará el objeto
    // y cargará sus valores automáticamente.

    setIsExpenseModalOpen(true);

  };


  // =====================================================
  // CERRAR FORMULARIO
  // =====================================================

  const handleCloseExpenseModal = () => {

    setIsExpenseModalOpen(false);

    // No limpiamos editingExpense aquí.
    //
    // Al abrir nuevamente el formulario
    // se establecerá el modo correspondiente.

  };


  // =====================================================
  // VISUALIZAR DETALLES DE UN GASTO
  // =====================================================

  const handleViewExpense = (expense) => {

    // Guardamos únicamente su identificador.

    setSelectedExpenseId(expense.id);

  };



  // =====================================================
  // CERRAR DETALLES
  // =====================================================

  const handleCloseExpenseDetails = () => {

    setSelectedExpenseId(null);

    // Limpiamos el enlace de la notificación al cerrar la ficha.
    const params = new URLSearchParams(location.search);
    if (params.has("gasto")) {
      params.delete("gasto");
      navigate({
        pathname: location.pathname,
        search: params.toString() ? `?${params.toString()}` : "",
      }, { replace: true });
    }

  };


  // =========================================================
  // GASTO SELECCIONADO PARA ELIMINACIÓN
  // =========================================================

  // Almacenamos el identificador del gasto
  // que el administrador desea eliminar.

  const [expenseToDeleteId, setExpenseToDeleteId] =
    useState(null);


  // Buscamos siempre el gasto actualizado
  // dentro del estado principal.

  const expenseToDelete = expenses.find(
    (expense) => expense.id === expenseToDeleteId
  ) ?? null;


  // =========================================================
  // ABRIR CONFIRMACIÓN DE ELIMINACIÓN
  // =========================================================

  const handleDeleteExpense = (expense) => {

    setExpenseToDeleteId(expense.id);

  };


  // =========================================================
  // CERRAR CONFIRMACIÓN
  // =========================================================

  const handleCloseDeleteModal = () => {

    setExpenseToDeleteId(null);

  };


  // =========================================================
  // CONFIRMAR ELIMINACIÓN
  // =========================================================

  const handleConfirmDeleteExpense = (expense) => {

    // Eliminamos el registro desde el contexto compartido.
    deleteExpense(expense.id);

    // Cerramos los detalles si correspondían al gasto eliminado.
    setSelectedExpenseId((previousId) =>
      previousId === expense.id ? null : previousId
    );

    // Cerramos el modal de confirmación.
    setExpenseToDeleteId(null);

  };



  // =====================================================
  // GUARDAR UN GASTO
  // =====================================================

  // Recibimos los datos validados desde
  // ExpenseFormModal.
  //
  // expenseToEdit:
  //
  // - null: creamos un registro.
  // - objeto: actualizamos un registro existente.

  const handleSaveExpense = (
    expenseData,
    expenseToEdit
  ) => {

    // El contexto se encarga de actualizar o crear el gasto.
    // Conserva todos los campos, incluido receiptImage.
    saveExpense(expenseData, expenseToEdit);

  };


  // =====================================================
  // INTERFAZ
  // =====================================================

  return (

    <main className="expense-management">

      {/* =========================================== */}
      {/* CONTENEDOR PRINCIPAL */}
      {/* =========================================== */}

      <div className="expense-management__container">


        {/* ======================================= */}
        {/* ENCABEZADO */}
        {/* ======================================= */}

        <ExpenseHeader
          onRegisterExpense={handleOpenExpenseModal}
        />


        {/* ======================================= */}
        {/* NAVEGACIÓN INTERNA */}
        {/* ======================================= */}

        <ExpenseNavigation
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />


        {/* ======================================= */}
        {/* CONTENIDO DINÁMICO */}
        {/* ======================================= */}

        <div className="expense-management__content">


          {/* =================================== */}
          {/* RESUMEN FINANCIERO */}
          {/* =================================== */}

          {activeSection === "summary" && (
            <>
              {/* Indicadores originales del resumen. */}
              <ExpenseSummary expenses={expenses} />

              {/* Control general de pagos y comprobantes. */}
              <ExpenseOverview expenses={expenses} />

              {/* Alertas y movimientos recientes sin duplicar otras pestañas. */}
              <div className="expense-management__summary-details">
                <ExpenseAlerts expenses={expenses} onViewExpense={handleViewExpense} />
                <ExpenseRecentActivity expenses={expenses} onViewExpense={handleViewExpense} />
              </div>
            </>
          )}


          {/* =================================== */}
          {/* ANÁLISIS Y GRÁFICOS */}
          {/* =================================== */}

          {activeSection === "charts" && (

            <ExpenseCharts
              expenses={expenses}
            />

          )}


          {/* =================================== */}
          {/* DISTRIBUCIÓN POR CATEGORÍAS */}
          {/* =================================== */}

          {activeSection === "categories" && (

            <ExpenseCategories
              expenses={expenses}
            />

          )}


          {/* =================================== */}
          {/* SEGUIMIENTO DE GASTOS PENDIENTES */}
          {/* =================================== */}


          {activeSection === "upcoming" && (

            <UpcomingExpenses
              expenses={expenses}
              onViewExpense={handleViewExpense}
              onEditExpense={handleEditExpense}
              onDeleteExpense={handleDeleteExpense}
            />

          )}



          {/* =================================== */}
          {/* HISTORIAL DE GASTOS */}
          {/* =================================== */}


          {activeSection === "history" && (

            <ExpenseTable
              expenses={expenses}
              onViewExpense={handleViewExpense}
              onEditExpense={handleEditExpense}
              onDeleteExpense={handleDeleteExpense}
            />

          )}


        </div>

      </div>


      {/* =========================================== */}
      {/* MODAL PARA REGISTRAR Y EDITAR GASTOS */}
      {/* =========================================== */}

      <ExpenseFormModal
        isOpen={isExpenseModalOpen}
        onClose={handleCloseExpenseModal}
        onSave={handleSaveExpense}
        expense={editingExpense}
      />


      {/* =========================================== */}
      {/* MODAL DE DETALLES DEL GASTO */}
      {/* =========================================== */}

      <ExpenseDetailsModal
        isOpen={selectedExpense !== null}
        expense={selectedExpense}
        onClose={handleCloseExpenseDetails}
      />


      {/* ================================================= */}
      {/* MODAL PARA CONFIRMAR ELIMINACIÓN */}
      {/* ================================================= */}

      <ExpenseDeleteModal
        isOpen={expenseToDelete !== null}
        expense={expenseToDelete}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDeleteExpense}
      />


    </main>

  );

}


// =========================================================
// EXPORTACIÓN
// =========================================================

export default ExpenseManagement;
