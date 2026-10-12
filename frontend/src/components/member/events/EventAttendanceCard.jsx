
import { CalendarCheck, CheckCircle2, XCircle } from "lucide-react";

import "../../../styles/components/member/events/EventAttendanceCard.css";

// =========================================================
// COMPONENTE DE CONFIRMACIÓN DE ASISTENCIA
// =========================================================

function EventAttendanceCard({
  event,
  isConfirmed,
  onConfirm,
  onCancel,
}) {
  if (!event) return null;

  // Si el evento no admite confirmaciones,
  // no mostramos los botones de asistencia.
  const requiresConfirmation =
    event.requiresConfirmation === true;

  if (!requiresConfirmation) {
    return (
      <div className="event-attendance-card">
        <CalendarCheck size={21} aria-hidden="true" />

        <div>
          <strong>Actividad abierta</strong>
          <p>
            Este evento no requiere confirmación previa.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section
      className="event-attendance-card"
      aria-label={`Asistencia a ${event.title}`}
    >
      <div className="event-attendance-card__heading">
        {isConfirmed ? (
          <CheckCircle2
            size={23}
            aria-hidden="true"
          />
        ) : (
          <CalendarCheck
            size={23}
            aria-hidden="true"
          />
        )}

        <div>
          <h3>
            {isConfirmed
              ? "Asistencia confirmada"
              : "¿Participarás en esta actividad?"}
          </h3>

          <p>
            {isConfirmed
              ? "Tu participación está registrada en esta demostración."
              : "Confirma tu asistencia para participar."}
          </p>
        </div>
      </div>

      {isConfirmed ? (
        <button
          type="button"
          className="event-attendance-card__button event-attendance-card__button--cancel"
          onClick={() => onCancel(event)}
        >
          <XCircle size={18} aria-hidden="true" />
          Cancelar confirmación
        </button>
      ) : (
        <button
          type="button"
          className="event-attendance-card__button event-attendance-card__button--confirm"
          onClick={() => onConfirm(event)}
        >
          <CheckCircle2 size={18} aria-hidden="true" />
          Confirmar asistencia
        </button>
      )}

      <small>
        Modo demostración: esta acción todavía no
        registra asistencia en el servidor.
      </small>
    </section>
  );
}

export default EventAttendanceCard;
