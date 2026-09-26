// Importamos las categorías que ya utilizamos
// dentro del módulo financiero.
import {
  expenseCategories,
} from "../../../data/admin/expensesData";

// Importamos los estilos específicos del modal.
import "../../../styles/components/super-admin/expenses/ExpenseFormModal.css";


// Creamos el modal de registro de gastos.
//
// isOpen indica si el modal debe mostrarse.
// onClose permite cerrarlo.
function ExpenseFormModal({
  isOpen,
  onClose,
}) {

  // Si el modal no se encuentra abierto,
  // no renderizamos absolutamente nada.
  if (!isOpen) {
    return null;
  }


  // Retornamos la interfaz del modal.
  return (
    <div
      className="expense-modal__overlay"
      onMouseDown={onClose}
    >

      {/* Creamos la ventana principal.
          Detenemos el evento para evitar que
          hacer clic dentro cierre accidentalmente el modal. */}
      <section
        className="expense-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="expense-modal-title"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >

        {/* ================================================= */}
        {/* ENCABEZADO */}
        {/* ================================================= */}

        <div className="expense-modal__header">

          {/* Información principal. */}
          <div>

            {/* Etiqueta superior. */}
            <span className="expense-modal__eyebrow">
              Administración financiera
            </span>

            {/* Título. */}
            <h2 id="expense-modal-title">
              Registrar nuevo gasto
            </h2>

            {/* Descripción. */}
            <p>
              Completa la información correspondiente
              al egreso que deseas registrar.
            </p>

          </div>


          {/* Botón para cerrar el modal. */}
          <button
            type="button"
            className="expense-modal__close"
            onClick={onClose}
            aria-label="Cerrar formulario"
          >
            ×
          </button>

        </div>


        {/* ================================================= */}
        {/* FORMULARIO DE DEMOSTRACIÓN */}
        {/* ================================================= */}

        <form
          className="expense-form"
          onSubmit={(event) =>
            event.preventDefault()
          }
        >

          {/* Descripción. */}
          <div className="expense-form__field expense-form__field--full">

            <label htmlFor="expense-description">
              Descripción
            </label>

            <input
              id="expense-description"
              type="text"
              placeholder="Ej: Compra de útiles de aseo"
            />

          </div>


          {/* Monto. */}
          <div className="expense-form__field">

            <label htmlFor="expense-amount">
              Monto
            </label>

            <div className="expense-form__amount">

              {/* Símbolo correspondiente al peso chileno. */}
              <span>$</span>

              <input
                id="expense-amount"
                type="number"
                placeholder="45000"
              />

            </div>

          </div>


          {/* Categoría. */}
          <div className="expense-form__field">

            <label htmlFor="expense-category">
              Categoría
            </label>

            <select id="expense-category">

              {/* Opción inicial. */}
              <option value="">
                Selecciona una categoría
              </option>

              {/* Generamos las opciones. */}
              {expenseCategories.map((category) => (

                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>

              ))}

            </select>

          </div>


          {/* Fecha. */}
          <div className="expense-form__field">

            <label htmlFor="expense-date">
              Fecha
            </label>

            <input
              id="expense-date"
              type="date"
            />

          </div>


          {/* Estado. */}
          <div className="expense-form__field">

            <label htmlFor="expense-status">
              Estado
            </label>

            <select
              id="expense-status"
              defaultValue="Pagado"
            >
              <option value="Pagado">
                Pagado
              </option>

              <option value="Pendiente">
                Pendiente
              </option>
            </select>

          </div>


          {/* Medio de pago. */}
          <div className="expense-form__field expense-form__field--full">

            <label htmlFor="expense-payment-method">
              Medio de pago
            </label>

            <select
              id="expense-payment-method"
              defaultValue="Transferencia"
            >
              <option value="Transferencia">
                Transferencia
              </option>

              <option value="Efectivo">
                Efectivo
              </option>

              <option value="Débito">
                Débito
              </option>

              <option value="Crédito">
                Crédito
              </option>

              <option value="Otro">
                Otro
              </option>
            </select>

          </div>


          {/* Observaciones. */}
          <div className="expense-form__field expense-form__field--full">

            <label htmlFor="expense-notes">
              Observaciones
            </label>

            <textarea
              id="expense-notes"
              rows="4"
              placeholder="Agrega algún detalle adicional sobre este gasto..."
            />

          </div>


          {/* ================================================= */}
          {/* ACCIONES */}
          {/* ================================================= */}

          <div className="expense-form__actions">

            {/* Permitimos cerrar el modal. */}
            <button
              type="button"
              className="expense-form__cancel"
              onClick={onClose}
            >
              Cancelar
            </button>


            {/* Este botón es solamente visual por ahora.
                No registra información todavía. */}
            <button
              type="button"
              className="expense-form__submit"
            >
              Registrar gasto
            </button>

          </div>

        </form>

      </section>

    </div>
  );
}


// Exportamos el componente.
export default ExpenseFormModal;