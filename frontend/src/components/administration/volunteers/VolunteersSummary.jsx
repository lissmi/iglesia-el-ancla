// =========================================================
// RESUMEN DEL VOLUNTARIADO - DATOS REALES
// =========================================================
import { UsersRound, CalendarCheck2, Clock3, AlertCircle } from "lucide-react";
import "../../../styles/components/administration/volunteers/VolunteersSummary.css";

function todayChile() {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Santiago", year: "numeric", month: "2-digit", day: "2-digit",
    }).format(new Date());
}

function VolunteersSummary({ volunteers = [], assignments = [] }) {
    // Cada documento es ahora un servicio que puede tener varios voluntarios.
    const activeVolunteers = volunteers.filter((person) => person.status === "active").length;
    const upcoming = assignments.filter((service) => service.date >= todayChile() && service.status !== "cancelled");
    const pendingConfirmations = upcoming.reduce((count, service) =>
        count + (service.participants || []).filter((person) => person.status === "pending").length, 0);
    // Cupos vacantes, incluidas las personas que rechazaron su participación.
    const uncoveredSlots = upcoming.reduce((count, service) => {
        const available = (service.participants || []).filter((person) => person.status !== "declined").length;
        return count + Math.max(0, (service.requiredVolunteers || 1) - available);
    }, 0);
    const cards = [
        { id: "active", title: "Voluntarios activos", value: activeVolunteers, description: "Miembros disponibles para servir", icon: UsersRound },
        { id: "upcoming", title: "Servicios programados", value: upcoming.length, description: "Servicios desde hoy", icon: CalendarCheck2 },
        { id: "pending", title: "Confirmaciones pendientes", value: pendingConfirmations, description: "Respuestas individuales por recibir", icon: Clock3 },
        { id: "uncovered", title: "Cupos por cubrir", value: uncoveredSlots, description: "Personas que faltan asignar", icon: AlertCircle },
    ];
    return (
        <section className="volunteers-summary" aria-label="Resumen de gestión de voluntarios">
            <div className="volunteers-summary__grid">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <article key={card.id} className={`volunteers-summary__card volunteers-summary__card--${card.id === "upcoming" ? "upcoming" : card.id}`}>
                            <div className="volunteers-summary__content">
                                <span className="volunteers-summary__label">{card.title}</span>
                                <strong className="volunteers-summary__value">{card.value}</strong>
                                <span className="volunteers-summary__description">{card.description}</span>
                            </div>
                            <div className="volunteers-summary__icon"><Icon size={23} strokeWidth={1.8} aria-hidden="true" /></div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
export default VolunteersSummary;
