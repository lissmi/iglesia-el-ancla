import { useEffect, useId } from "react";
import {
  CalendarDays, Clock3, MapPin, MonitorPlay, Pencil,
  Repeat2, UsersRound, X,
} from "lucide-react";
import "../../../styles/components/administration/events/EventDetailsModal.css";

const WEEK_DAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

function formatDate(value) {
  if (!value) return "No especificada";
  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return "Fecha no válida";
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit", month: "long", year: "numeric", timeZone: "UTC",
  }).format(date);
}

function EventDetailsModal({ isOpen, event, onClose, onEdit }) {
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return undefined;
    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !event) return null;

  const isRecurring = event.recurrence?.type === "weekly";
  const days = event.recurrence?.daysOfWeek ??
    (event.recurrence?.dayOfWeek !== undefined ? [event.recurrence.dayOfWeek] : []);
  const recurringDays = days
    .map((day) => WEEK_DAYS[day])
    .filter(Boolean)
    .join(", ");
  const isOnline = event.modality === "Online";
  const isPresential = event.modality === "Presencial";
  const meetingUrl = event.meetingUrl?.trim();
  let safeMeetingUrl = null;
  if (meetingUrl) {
    try {
      const parsed = new URL(meetingUrl);
      if (["http:", "https:"].includes(parsed.protocol)) safeMeetingUrl = parsed.href;
    } catch { /* El enlace se mostrará solo como texto. */ }
  }

  return (
    <div className="event-details__overlay" onMouseDown={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <section className="event-details" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <header className="event-details__header">
          <div>
            <span className="event-details__eyebrow">FICHA DE ACTIVIDAD</span>
            <h2 id={titleId}>{event.title}</h2>
            <div className="event-details__badges">
              <span>{event.category || "Sin categoría"}</span>
              <span className={event.publicationStatus === "published" ? "event-details__published" : "event-details__draft"}>
                {event.publicationStatus === "published" ? "Publicado" : "Borrador"}
              </span>
            </div>
          </div>
          <button type="button" className="event-details__close" onClick={onClose} aria-label="Cerrar detalles">
            <X size={21} />
          </button>
        </header>

        <div className="event-details__body">
          <section className="event-details__section">
            <h3>Descripción</h3>
            <p>{event.description || "No se ha registrado una descripción."}</p>
          </section>

          <section className="event-details__section">
            <h3><CalendarDays size={18} /> Programación</h3>
            <dl className="event-details__grid">
              <div><dt>Fecha {isRecurring ? "de inicio" : "del evento"}</dt><dd>{formatDate(event.date)}</dd></div>
              <div><dt><Clock3 size={15} /> Horario</dt><dd>{event.time || "Sin hora"}{event.endTime ? ` – ${event.endTime}` : ""} hrs</dd></div>
              <div><dt><Repeat2 size={15} /> Frecuencia</dt><dd>{isRecurring ? "Semanal" : "Evento único"}</dd></div>
              {isRecurring && <div><dt>Días de repetición</dt><dd>{recurringDays || "Sin días configurados"}</dd></div>}
              {isRecurring && <div><dt>Repetir hasta</dt><dd>{event.recurrence?.endDate ? formatDate(event.recurrence.endDate) : "Sin fecha de término"}</dd></div>}
            </dl>
          </section>

          <section className="event-details__section">
            <h3>{isOnline ? <MonitorPlay size={18} /> : <MapPin size={18} />} Modalidad y acceso</h3>
            <dl className="event-details__grid">
              <div><dt>Modalidad</dt><dd>{event.modality || "No especificada"}</dd></div>
              {!isOnline && <div><dt>Ubicación</dt><dd>{event.location || "Sin ubicación"}</dd></div>}
              {!isPresential && <div><dt>Acceso online</dt><dd>{safeMeetingUrl ? <a href={safeMeetingUrl} target="_blank" rel="noopener noreferrer">Abrir enlace de reunión</a> : meetingUrl || "Sin enlace configurado"}</dd></div>}
            </dl>
          </section>

          <section className="event-details__section">
            <h3><UsersRound size={18} /> Asistencia</h3>
            <dl className="event-details__grid">
              <div><dt>Confirmación requerida</dt><dd>{event.requiresConfirmation ? "Sí" : "No"}</dd></div>
              <div><dt>Cupos</dt><dd>{event.capacity != null && event.capacity !== "" ? event.capacity : "Sin límite configurado"}</dd></div>
              <div><dt>Confirmaciones registradas</dt><dd>{event.confirmations ?? 0}</dd></div>
            </dl>
            <p className="event-details__hint">Las confirmaciones mostradas son datos temporales; aún no se conectan con los miembros.</p>
          </section>
        </div>

        <footer className="event-details__actions">
          <button type="button" className="event-details__secondary" onClick={onClose}>Cerrar</button>
          <button type="button" className="event-details__primary" onClick={() => onEdit(event)}>
            <Pencil size={17} /> Editar evento
          </button>
        </footer>
      </section>
    </div>
  );
}

export default EventDetailsModal;
