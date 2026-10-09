//frontend/src/pages/ExpenseManagement.jsx

// Importamos useState para controlar
// la sección seleccionada y el modal.
import { useState } from "react";

// Importamos el componente que contiene el encabezado
// de la página de gestión de gastos.
import ExpenseHeader from "../../components/administration/expenses/ExpenseHeader";

// Importamos el menú interno del módulo.
import ExpenseNavigation from "../../components/administration/expenses/ExpenseNavigation";

// Importamos las tarjetas con los indicadores
// principales de los gastos.
import ExpenseSummary from "../../components/administration/expenses/ExpenseSummary";

// Importamos los gráficos correspondientes
// al análisis de los gastos.
import ExpenseCharts from "../../components/administration/expenses/ExpenseCharts";

// Importamos la sección de gastos próximos.
import UpcomingExpenses from "../../components/administration/expenses/UpcomingExpenses";

// Importamos el historial completo de gastos.
import ExpenseTable from "../../components/administration/expenses/ExpenseTable";

// Importamos el modal visual
// para registrar un nuevo gasto.
import ExpenseFormModal from "../../components/administration/expenses/ExpenseFormModal";

// Importamos los estilos generales de la página.
import "../../styles/pages/administration/ExpenseManagement.css";


// Creamos el componente principal de la página.
function ExpenseManagement() {

  // ---------------------------------------------------------
  // SECCIÓN ACTIVA
  // ---------------------------------------------------------

  // Guardamos qué sección desea visualizar el administrador.
  // Por defecto mostramos el resumen.
  const [activeSection, setActiveSection] = useState("summary");


  // ---------------------------------------------------------
  // MODAL
  // ---------------------------------------------------------

  // Guardamos si el modal de registro
  // se encuentra abierto o cerrado.
  const [isExpenseModalOpen, setIsExpenseModalOpen] =
    useState(false);


  // Retornamos la estructura base de la página.
  return (
    <main className="expense-management">

      {/* Contenedor central de toda la página. */}
      <div className="expense-management__container">

        {/* Mostramos el encabezado.
            Cuando se presiona Registrar gasto,
            abrimos el modal. */}
        <ExpenseHeader
          onRegisterExpense={() =>
            setIsExpenseModalOpen(true)
          }
        />


        {/* Mostramos el menú interno
            correspondiente al módulo financiero. */}
        <ExpenseNavigation
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />


        {/* ================================================= */}
        {/* CONTENIDO DINÁMICO */}
        {/* ================================================= */}

        <div className="expense-management__content">

          {/* Mostramos el resumen solamente
              cuando esta sección se encuentra activa. */}
          {activeSection === "summary" && (
            <ExpenseSummary />
          )}


          {/* Mostramos los gráficos solamente
              cuando el usuario selecciona Análisis. */}
          {activeSection === "charts" && (
            <ExpenseCharts />
          )}


          {/* Mostramos los gastos pendientes
              solamente cuando corresponde. */}
          {activeSection === "upcoming" && (
            <UpcomingExpenses />
          )}


          {/* Mostramos la tabla histórica
              solamente al seleccionar Historial. */}
          {activeSection === "history" && (
            <ExpenseTable />
          )}

        </div>

      </div>


      {/* El modal se encuentra fuera del contenedor
          porque debe cubrir toda la pantalla. */}
      <ExpenseFormModal
        isOpen={isExpenseModalOpen}
        onClose={() =>
          setIsExpenseModalOpen(false)
        }
      />

    </main>
  );
}


// Exportamos el componente.
export default ExpenseManagement;