// =========================================================
// IMPORTACIONES
// =========================================================

import {
    UsersRound,
    CalendarCheck2,
    Clock3,
    AlertCircle,
} from "lucide-react";

// Importamos los estilos exclusivos del componente.
import "../../../styles/components/administration/volunteers/VolunteersSummary.css";


// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function VolunteersSummary({
    volunteers = [],
    assignments = [],
}) {

    // =====================================================
    // FECHA ACTUAL
    // =====================================================

    // Comparamos fechas locales para evitar problemas
    // de zona horaria con cadenas YYYY-MM-DD.

    const today = new Date();

    const todayString = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0"),
    ].join("-");


    // =====================================================
    // VOLUNTARIOS ACTIVOS
    // =====================================================

    const activeVolunteers = volunteers.filter(
        (volunteer) =>
            volunteer.status === "active"
    ).length;


    // =====================================================
    // ASIGNACIONES VIGENTES
    // =====================================================

    const upcomingAssignments = assignments.filter(
        (assignment) =>
            typeof assignment.date === "string" &&
            assignment.date >= todayString &&
            assignment.status !== "cancelled"
    );


    // =====================================================
    // CONFIRMACIONES PENDIENTES
    // =====================================================

    const pendingConfirmations = upcomingAssignments.filter(
        (assignment) =>
            assignment.volunteerId != null &&
            assignment.status === "pending"
    ).length;


    // =====================================================
    // TURNOS SIN CUBRIR
    // =====================================================

    const uncoveredAssignments = upcomingAssignments.filter(
        (assignment) =>
            assignment.volunteerId == null ||
            assignment.status === "declined"
    ).length;


    // =====================================================
    // CONFIGURACIÓN DE TARJETAS
    // =====================================================

    const summaryCards = [
        {
            id: "active",
            title: "Voluntarios activos",
            value: activeVolunteers,
            description: "Miembros disponibles para servir",
            icon: UsersRound,
            variant: "active",
        },
        {
            id: "upcoming",
            title: "Asignaciones próximas",
            value: upcomingAssignments.length,
            description: "Turnos programados desde hoy",
            icon: CalendarCheck2,
            variant: "upcoming",
        },
        {
            id: "pending",
            title: "Confirmaciones pendientes",
            value: pendingConfirmations,
            description: "Esperando respuesta del voluntario",
            icon: Clock3,
            variant: "pending",
        },
        {
            id: "uncovered",
            title: "Turnos sin cubrir",
            value: uncoveredAssignments,
            description: "Responsabilidades que requieren atención",
            icon: AlertCircle,
            variant: "uncovered",
        },
    ];


    // =====================================================
    // INTERFAZ
    // =====================================================

    return (
        <section
            className="volunteers-summary"
            aria-label="Resumen de gestión de voluntarios"
        >

            <div className="volunteers-summary__grid">

                {summaryCards.map((card) => {

                    const Icon = card.icon;

                    return (
                        <article
                            key={card.id}
                            className={
                                `volunteers-summary__card ` +
                                `volunteers-summary__card--${card.variant}`
                            }
                        >

                            {/* Información de la estadística. */}
                            <div className="volunteers-summary__content">

                                <span className="volunteers-summary__label">
                                    {card.title}
                                </span>

                                <strong className="volunteers-summary__value">
                                    {card.value}
                                </strong>

                                <span className="volunteers-summary__description">
                                    {card.description}
                                </span>

                            </div>


                            {/* Icono de la estadística. */}
                            <div className="volunteers-summary__icon">

                                <Icon
                                    size={23}
                                    strokeWidth={1.8}
                                    aria-hidden="true"
                                />

                            </div>

                        </article>
                    );
                })}

            </div>

        </section>
    );
}

export default VolunteersSummary;