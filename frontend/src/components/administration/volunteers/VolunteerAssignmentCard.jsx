// =========================================================
// TARJETA DE SERVICIO - VARIOS VOLUNTARIOS POR ASIGNACIÓN
// Conserva las clases del CSS original del módulo.
// =========================================================
import {
  UsersRound, CalendarDays, Clock3, Eye, Pencil, Trash2, UserRoundPlus,
  CheckCircle2, AlertCircle, CircleHelp,
} from "lucide-react";
import { VOLUNTEER_TEAMS } from "./VolunteersTeams";
import "../../../styles/components/administration/volunteers/VolunteerAssignmentCard.css";

const STATUS = {
  pending: { label: "Pendiente", icon: Clock3 },
  confirmed: { label: "Confirmado", icon: CheckCircle2 },
  declined: { label: "No disponible", icon: AlertCircle },
  mixed: { label: "Respuestas diferentes", icon: Clock3 },
  unassigned: { label: "Sin voluntarios", icon: CircleHelp },
  cancelled: { label: "Cancelado", icon: AlertCircle },
};

function formatDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return "Fecha por confirmar";
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return "Fecha no válida";
  return new Intl.DateTimeFormat("es-CL", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function VolunteerAssignmentCard({ assignment, volunteers = [], onView, onEdit, onManage, onDelete }) {
  if (!assignment) return null;

  // El servidor entrega una sola tarjeta por servicio, con varios participantes.
  const people = assignment.participants || [];
  const names = people.map((person) =>
    volunteers.find((volunteer) => String(volunteer.id) === String(person.volunteerId))?.name || "Voluntario no encontrado"
  );
  const assignedText = names.length === 0
    ? "Sin voluntarios asignados"
    : names.length === 1 ? names[0] : `${names.length} voluntarios asignados`;
  const team = VOLUNTEER_TEAMS.find((item) => item.id === assignment.teamId);
  const statusKey = assignment.status === "cancelled"
    ? "cancelled" : !people.length ? "unassigned" : assignment.status;
  const status = STATUS[statusKey] || STATUS.pending;
  const StatusIcon = status.icon;
  const title = assignment.title || "Servicio sin título";

  return (
    <article className="volunteer-assignment-card">
      <div className="volunteer-assignment-card__main">
        <div className="volunteer-assignment-card__top">
          <span className="volunteer-assignment-card__team">{team?.name || "Equipo de servicio"}</span>
          <span className={`volunteer-assignment-card__status volunteer-assignment-card__status--${statusKey}`}>
            <StatusIcon size={13} aria-hidden="true" />{status.label}
          </span>
        </div>
        <h3 className="volunteer-assignment-card__title">{title}</h3>
        {assignment.description && <p className="volunteer-assignment-card__description">{assignment.description}</p>}
        <div className="volunteer-assignment-card__metadata">
          <span><UsersRound size={15} aria-hidden="true" />{assignedText}</span>
          <span><CalendarDays size={15} aria-hidden="true" />{formatDate(assignment.date)}</span>
          <span><Clock3 size={15} aria-hidden="true" />{assignment.startTime || "Sin hora"} - {assignment.endTime || "Sin hora"}</span>
        </div>
      </div>
      <div className="volunteer-assignment-card__actions">
        {onView && <button type="button" className="volunteer-assignment-card__action volunteer-assignment-card__action--view" onClick={() => onView(assignment)} aria-label={`Ver ${title}`} title="Ver detalles"><Eye size={17} /></button>}
        {onEdit && <button type="button" className="volunteer-assignment-card__action volunteer-assignment-card__action--edit" onClick={() => onEdit(assignment)} aria-label={`Editar ${title}`} title="Editar servicio"><Pencil size={17} /></button>}
        {onManage && <button type="button" className="volunteer-assignment-card__manage" onClick={() => onManage(assignment)} aria-label={`Gestionar voluntarios de ${title}`} title="Gestionar voluntarios"><UserRoundPlus size={16} /><span>Gestionar voluntarios</span></button>}
        {onDelete && <button type="button" className="volunteer-assignment-card__action volunteer-assignment-card__action--delete" onClick={() => onDelete(assignment)} aria-label={`Eliminar ${title}`} title="Eliminar servicio"><Trash2 size={17} /></button>}
      </div>
    </article>
  );
}
export default VolunteerAssignmentCard;
