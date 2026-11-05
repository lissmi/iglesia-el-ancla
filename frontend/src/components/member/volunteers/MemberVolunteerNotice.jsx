// =========================================================
// TARJETA DE PRÓXIMO COMPROMISO PARA /member
// =========================================================
import { Link } from "react-router-dom";
import { BellRing, CalendarCheck2, Clock3, ArrowRight } from "lucide-react";
import { formatVolunteerDate, getTodayChile } from "../../../utils/memberVolunteerAlerts";
import "../../../styles/components/member/volunteers/MemberVolunteerNotice.css";

export default function MemberVolunteerNotice({ assignments = [], loading = false, error = "" }) {
  // Solo mostramos turnos propios que aún pueden requerir nuestra participación.
  const today = getTodayChile();
  const upcoming = [...assignments]
    .filter((item) => item.date >= today && ["pending", "confirmed"].includes(item.status))
    .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));
  const next = upcoming[0];

  // La sección aparece aunque todavía no exista un compromiso, con acceso al historial.
  return (
    <section className="member-volunteer-notice" aria-labelledby="member-next-service-title">
      <div className="member-volunteer-notice__heading">
        <span className="member-volunteer-notice__icon"><BellRing size={21} aria-hidden="true" /></span>
        <div>
          <span className="member-volunteer-notice__kicker">Participación y servicio</span>
          <h2 id="member-next-service-title">Mi próximo compromiso</h2>
        </div>
      </div>
      {loading ? <p role="status">Consultando tus próximos servicios...</p> :
        error ? <p role="alert">{error}</p> :
        next ? <>
          <p className="member-volunteer-notice__title">{next.title}</p>
          <div className="member-volunteer-notice__details">
            <span><CalendarCheck2 size={16} aria-hidden="true" /> {formatVolunteerDate(next.date)}</span>
            <span><Clock3 size={16} aria-hidden="true" /> {next.startTime} – {next.endTime} hrs</span>
          </div>
          <p className="member-volunteer-notice__status">
            {next.status === "pending" ? "Tu confirmación está pendiente." : "Tu participación está confirmada. ¡Te esperamos!"}
          </p>
        </> : <p>Por ahora no tienes turnos próximos asignados.</p>}
      <Link to="/member/voluntariado" className="member-volunteer-notice__link">
        Ver mis turnos <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </section>
  );
}
