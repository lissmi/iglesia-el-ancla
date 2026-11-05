// =========================================================
// MIS TURNOS DE SERVICIO - MIEMBROS DE EL ANCLA
// =========================================================
import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { CalendarCheck2, Clock3, MapPin, UsersRound, CheckCircle2, XCircle, ArrowLeft, RefreshCw } from "lucide-react";
import api from "../../services/api";
import { VOLUNTEER_TEAMS } from "../../components/administration/volunteers/VolunteersTeams";
import "../../styles/pages/member/MemberVolunteerAssignments.css";

function formatDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return "Fecha por confirmar";
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("es-CL", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    .format(new Date(year, month - 1, day, 12));
}

function todayInChile() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

const STATUS = {
  pending: { label: "Esperando tu confirmación", type: "pending" },
  confirmed: { label: "Confirmado", type: "confirmed" },
  declined: { label: "No disponible", type: "declined" },
  cancelled: { label: "Turno cancelado", type: "cancelled" },
};

function MemberVolunteerAssignments() {
  // Solicita al layout compartido actualizar también la campana y el dashboard.
  const { refreshMemberAssignments } = useOutletContext() || {};
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [savingId, setSavingId] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError("");
    async function load() {
      try {
        const response = await api.get("/volunteers/me/assignments", { signal: controller.signal });
        if (!response.data?.success || !Array.isArray(response.data.assignments)) throw new Error("No se pudieron leer tus asignaciones");
        if (!controller.signal.aborted) setAssignments(response.data.assignments);
      } catch (cause) {
        if (controller.signal.aborted || cause?.code === "ERR_CANCELED") return;
        setError(cause?.response?.data?.message || cause?.message || "Error al consultar turnos");
        setAssignments([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [refreshKey]);

  async function respond(assignment, status) {
    if (savingId) return;
    setSavingId(assignment.id); setActionError("");
    try {
      const response = await api.patch(`/volunteers/me/assignments/${assignment.id}/respond`, { status });
      if (!response.data?.success) throw new Error("No se pudo guardar la respuesta");
      // Actualizamos de inmediato la tarjeta sin esperar a recargar.
      setAssignments((previous) => previous.map((item) =>
        item.id === assignment.id ? response.data.assignment : item));
      refreshMemberAssignments?.();
    } catch (cause) {
      setActionError(cause?.response?.data?.message || cause?.message || "No se pudo guardar tu respuesta");
    } finally { setSavingId(""); }
  }

  const today = todayInChile();
  const ordered = [...assignments].sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));
  const upcoming = ordered.filter((assignment) => assignment.date >= today);
  const previous = ordered.filter((assignment) => assignment.date < today);

  function renderCard(assignment) {
    const team = VOLUNTEER_TEAMS.find((item) => item.id === assignment.teamId);
    const state = STATUS[assignment.status] || STATUS.pending;
    const canRespond = assignment.date >= today && assignment.status !== "cancelled";
    const busy = savingId === assignment.id;
    return (
      <article key={assignment.id} className="member-volunteer__card">
        <div className="member-volunteer__card-top">
          <span className="member-volunteer__team"><UsersRound size={15} /> {team?.name || "Equipo de servicio"}</span>
          <span className={`member-volunteer__state member-volunteer__state--${state.type}`}>{state.label}</span>
        </div>
        <h2>{assignment.title}</h2>
        {assignment.description && <p className="member-volunteer__description">{assignment.description}</p>}
        <div className="member-volunteer__facts">
          <div><CalendarCheck2 size={17} /><span>{formatDate(assignment.date)}</span></div>
          <div><Clock3 size={17} /><span>{assignment.startTime} – {assignment.endTime} hrs</span></div>
          {assignment.location && <div><MapPin size={17} /><span>{assignment.location}</span></div>}
        </div>
        {assignment.notes && <div className="member-volunteer__notes"><strong>Indicaciones para tu servicio</strong><p>{assignment.notes}</p></div>}
        {canRespond && <div className="member-volunteer__actions">
          <p>¿Podrás acompañarnos en esta responsabilidad?</p>
          <div className="member-volunteer__buttons">
            <button type="button" className={assignment.status === "confirmed" ? "member-volunteer__yes member-volunteer__yes--selected" : "member-volunteer__yes"}
              onClick={() => respond(assignment, "confirmed")} disabled={Boolean(savingId)} aria-pressed={assignment.status === "confirmed"}>
              <CheckCircle2 size={17} /> {busy ? "Guardando..." : "Confirmar participación"}
            </button>
            <button type="button" className={assignment.status === "declined" ? "member-volunteer__no member-volunteer__no--selected" : "member-volunteer__no"}
              onClick={() => respond(assignment, "declined")} disabled={Boolean(savingId)} aria-pressed={assignment.status === "declined"}>
              <XCircle size={17} /> No podré asistir
            </button>
          </div>
        </div>}
      </article>
    );
  }

  return (
    <main className="member-volunteer">
      <Link to="/member" className="member-volunteer__back"><ArrowLeft size={16} /> Volver a Mi espacio</Link>
      <header className="member-volunteer__header">
        <span>MI COMUNIDAD / SERVICIO</span>
        <h1>Mis turnos de voluntariado</h1>
        <p>Consulta tus responsabilidades y confirma si podrás acompañarnos en cada servicio.</p>
      </header>
      {actionError && <p className="member-volunteer__error" role="alert">{actionError}</p>}
      {loading && <p role="status">Consultando tus turnos...</p>}
      {error && <div className="member-volunteer__error" role="alert">{error}<button type="button" onClick={() => setRefreshKey((n) => n + 1)}><RefreshCw size={15} /> Reintentar</button></div>}
      {!loading && !error && (
        <>
          {ordered.length === 0 ? <div className="member-volunteer__empty"><CalendarCheck2 size={32} /><h2>Aún no tienes turnos asignados</h2><p>Cuando el equipo administrativo te asigne una responsabilidad, aparecerá aquí.</p></div> : (
            <>
              <section className="member-volunteer__section"><h2>Próximos turnos <small>{upcoming.length}</small></h2>
                {upcoming.length ? <div className="member-volunteer__grid">{upcoming.map(renderCard)}</div> : <p>No tienes turnos próximos.</p>}</section>
              {previous.length > 0 && <section className="member-volunteer__section member-volunteer__section--past"><h2>Turnos anteriores</h2><div className="member-volunteer__grid">{previous.map(renderCard)}</div></section>}
            </>
          )}
        </>
      )}
    </main>
  );
}

export default MemberVolunteerAssignments;
