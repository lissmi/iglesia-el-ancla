// =========================================================
// TARJETA DE ASISTENCIA REAL - IGLESIA EL ANCLA
// =========================================================

// Reutilizamos los iconos existentes de la tarjeta.
import { CalendarCheck, CheckCircle2, XCircle } from "lucide-react";

// Conservamos los estilos originales de la tarjeta.
import "../../../styles/components/member/events/EventAttendanceCard.css";

// La tarjeta recibe el estado real desde MemberActivities.jsx.
function ActivityAttendanceCard({
  activity,
  isConfirmed,
  confirmedCount = 0,
  isSaving = false,
  attendanceAvailable = true,
  onConfirm,
  onCancel,
}) {
  // No renderizamos nada si no hay una actividad válida.
  if (!activity) return null;

  // Las actividades abiertas no requieren una reserva.
  if (!activity.requiresConfirmation) {
    return (
      <div className="event-attendance-card">
        <CalendarCheck size={21} aria-hidden="true" />
        <div>
          <strong>Actividad abierta</strong>
          <p>Esta actividad no requiere confirmación previa.</p>
        </div>
      </div>
    );
  }

  // Una actividad sin capacidad definida no tiene límite de cupos.
  const capacity = Number(activity.capacity) > 0 ? Number(activity.capacity) : null;

  // Impedimos confirmar cuando no queda espacio; sí permitimos cancelar.
  const full = capacity !== null && confirmedCount >= capacity;

  return (
    <section className="event-attendance-card" aria-label={`Asistencia a ${activity.title}`}>
      <div className="event-attendance-card__heading">
        {isConfirmed ? <CheckCircle2 size={23} aria-hidden="true" /> : <CalendarCheck size={23} aria-hidden="true" />}
        <div>
          <h3>{isConfirmed ? "Asistencia confirmada" : full ? "Cupos agotados" : "¿Participarás en esta actividad?"}</h3>
          <p>
            {isConfirmed
              ? "Tu asistencia quedó registrada en la iglesia."
              : full ? "Ya no quedan cupos para esta fecha."
                : "Confirma tu asistencia para participar."}
          </p>
          {capacity !== null && attendanceAvailable && (
            <small>{confirmedCount} de {capacity} cupos ocupados</small>
          )}
          {!attendanceAvailable && (
            <small>Las confirmaciones aún no están disponibles en el servidor.</small>
          )}
        </div>
      </div>

      {isConfirmed ? (
        <button
          type="button"
          className="event-attendance-card__button event-attendance-card__button--cancel"
          disabled={isSaving || !attendanceAvailable}
          onClick={() => onCancel(activity)}
        >
          <XCircle size={18} aria-hidden="true" />
          {isSaving ? "Guardando..." : "Cancelar confirmación"}
        </button>
      ) : (
        <button
          type="button"
          className="event-attendance-card__button event-attendance-card__button--confirm"
          disabled={isSaving || full || !attendanceAvailable}
          onClick={() => onConfirm(activity)}
        >
          <CheckCircle2 size={18} aria-hidden="true" />
          {isSaving ? "Guardando..." : "Confirmar asistencia"}
        </button>
      )}
    </section>
  );
}

// Exportamos la tarjeta para las páginas de miembros.
export default ActivityAttendanceCard;
