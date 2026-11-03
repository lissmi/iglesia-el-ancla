
import { useEffect, useId, useRef } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import "../../../styles/components/administration/events/EventDeleteModal.css";

// =========================================================
// CONFIRMACIÓN DE ELIMINACIÓN DE UN EVENTO
// =========================================================

function EventDeleteModal({ event, onCancel, onConfirm, isDeleting = false }) {
  // Identificador accesible único para el título del diálogo.
  const titleId = useId();

  // Referencia del botón seguro, seleccionado al abrir.
  const cancelButtonRef = useRef(null);

  // Al abrir, permite cancelar con Escape y mantiene el foco en el diálogo.
  useEffect(() => {
    if (!event) return undefined;

    // Conserva el elemento que tenía el foco para devolverlo al cerrar.
    const previousFocus = document.activeElement;

    // Envía inicialmente el foco a la opción no destructiva.
    cancelButtonRef.current?.focus();

    function handleKeyDown(keyboardEvent) {
      // Escape cierra sin borrar.
      if (keyboardEvent.key === "Escape") {
        keyboardEvent.preventDefault();
        if (!isDeleting) onCancel();
      }

      // Tab permanece dentro de los controles del diálogo.
      if (keyboardEvent.key === "Tab") {
        const modal = cancelButtonRef.current?.closest("[role='alertdialog']");
        if (!modal) return;
        const focusable = Array.from(modal.querySelectorAll("button:not([disabled])"));
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (keyboardEvent.shiftKey && document.activeElement === first) {
          keyboardEvent.preventDefault();
          last?.focus();
        } else if (!keyboardEvent.shiftKey && document.activeElement === last) {
          keyboardEvent.preventDefault();
          first?.focus();
        }
      }
    }

    // Escucha teclas únicamente mientras el diálogo exista.
    document.addEventListener("keydown", handleKeyDown);

    // Limpia el evento y restaura el foco al salir.
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [event, onCancel, isDeleting]);

  // No montamos ningún diálogo si nadie solicitó eliminar un evento.
  if (!event) return null;

  return (
    <div
      className="event-delete-modal__overlay"
      onMouseDown={(mouseEvent) => {
        // Al pulsar fuera se interpreta como cancelar, nunca como confirmar.
        if (!isDeleting && mouseEvent.target === mouseEvent.currentTarget) onCancel();
      }}
    >
      <section
        className="event-delete-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={`${titleId}-description`}
      >
        <div className="event-delete-modal__top">
          <span className="event-delete-modal__icon">
            <AlertTriangle size={25} aria-hidden="true" />
          </span>
          <button
            type="button"
            className="event-delete-modal__close"
            onClick={onCancel}
            disabled={isDeleting}
            aria-label="Cancelar eliminación"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <h2 id={titleId}>¿Eliminar esta actividad?</h2>
        <p id={`${titleId}-description`}>
          Vas a eliminar <strong>{event.title}</strong> del listado de actividades.
          Esta acción es permanente y no se puede deshacer.
        </p>

        <div className="event-delete-modal__actions">
          <button
            ref={cancelButtonRef}
            type="button"
            className="event-delete-modal__cancel"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="event-delete-modal__confirm"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            <Trash2 size={17} aria-hidden="true" />
            {isDeleting ? "Eliminando..." : "Sí, eliminar actividad"}
          </button>
        </div>
      </section>
    </div>
  );
}

export default EventDeleteModal;
