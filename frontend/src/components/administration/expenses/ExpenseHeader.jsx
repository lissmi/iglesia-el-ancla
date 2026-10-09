// Importamos los estilos específicos del encabezado.
import "../../../styles/components/administration/expenses/ExpenseHeader.css";


// Creamos el componente del encabezado.
//
// Recibimos la función onRegisterExpense desde
// la página principal ExpenseManagement.
//
// Esta función será ejecutada cuando el usuario
// presione el botón "Registrar gasto".
function ExpenseHeader({ onRegisterExpense }) {

  // Retornamos la estructura visual del encabezado.
  return (
    <section className="expense-header">

      {/* Contenedor izquierdo con la información principal. */}
      <div className="expense-header__content">

        {/* Texto pequeño que identifica el módulo. */}
        <span className="expense-header__eyebrow">
          Administración financiera
        </span>

        {/* Título principal de la página. */}
        <h1 className="expense-header__title">
          Gestión de gastos
        </h1>

        {/* Descripción breve de la función de esta sección. */}
        <p className="expense-header__description">
          Registra, organiza y revisa los gastos de la comunidad
          para mantener un control claro y ordenado de los recursos.
        </p>

      </div>


      {/* Creamos el bloque destinado a las acciones. */}
      <div className="expense-header__actions">

        {/* Botón para abrir el formulario
            de registro de un nuevo gasto. */}
        <button
          className="expense-header__add-button"
          type="button"
          onClick={onRegisterExpense}
        >
          + Registrar gasto
        </button>

      </div>

    </section>
  );
}


// Exportamos el componente para utilizarlo
// dentro de ExpenseManagement.
export default ExpenseHeader;