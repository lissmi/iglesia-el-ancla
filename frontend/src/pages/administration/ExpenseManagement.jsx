
/* ========================================================= */
/* IMPORTACIONES */
/* ========================================================= */

import { useState } from "react";


// =========================================================
// COMPONENTES DE GESTIÓN DE GASTOS
// =========================================================

// Encabezado principal.
import ExpenseHeader from "../../components/administration/expenses/ExpenseHeader";

// Navegación interna.
import ExpenseNavigation from "../../components/administration/expenses/ExpenseNavigation";

// Tarjetas de resumen financiero.
import ExpenseSummary from "../../components/administration/expenses/ExpenseSummary";

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
// DATOS TEMPORALES
// =========================================================

// Importamos los registros iniciales.
//
// Más adelante serán reemplazados por información
// obtenida desde el backend y MongoDB.

import {
  expenses as initialExpenses,
} from "../../data/admin/expensesData";


// =========================================================
// ESTILOS
// =========================================================

import "../../styles/pages/administration/ExpenseManagement.css";


// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function ExpenseManagement() {

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
  // ESTADO PRINCIPAL DE GASTOS
  // =====================================================

  // Guardamos los gastos dentro del estado de React.
  //
  // Esto permite registrar y editar movimientos
  // y actualizar automáticamente los componentes.

  const [expenses, setExpenses] = useState(
    () => initialExpenses.map((expense) => ({
      ...expense,
    }))
  );


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

    // Eliminamos únicamente el registro
    // cuyo identificador coincide.

    setExpenses((previousExpenses) =>
      previousExpenses.filter(
        (item) => item.id !== expense.id
      )
    );

    // Si sus detalles estaban seleccionados,
    // también limpiamos esa selección.

    setSelectedExpenseId((previousId) =>
      previousId === expense.id ? null : previousId
    );

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

    // ================================================
    // EDITAR GASTO EXISTENTE
    // ================================================

    if (expenseToEdit) {

      setExpenses((previousExpenses) =>

        previousExpenses.map((item) =>

          item.id === expenseToEdit.id

            ? {
              ...item,
              ...expenseData,
            }

            : item

        )

      );

      return;

    }


    // ================================================
    // REGISTRAR NUEVO GASTO
    // ================================================

    // Generamos un identificador único
    // para el nuevo registro.

    const newExpense = {

      ...expenseData,

      id: crypto.randomUUID(),

    };


    // Agregamos el gasto al inicio
    // de la lista.

    setExpenses((previousExpenses) => [

      newExpense,

      ...previousExpenses,

    ]);

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

            <ExpenseSummary
              expenses={expenses}
            />

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
