// =========================================================
// IMPORTACIONES
// =========================================================

import {
    UsersRound,
    CalendarDays,
    Clock3,
    Eye,
    Pencil,
    Trash2,
    CheckCircle2,
    AlertCircle,
    CircleHelp,
} from "lucide-react";

import { VOLUNTEER_TEAMS } from "./VolunteersTeams";

import "../../../styles/components/administration/volunteers/VolunteerAssignmentCard.css";


// =========================================================
// CONFIGURACIÓN DE ESTADOS
// =========================================================

const ASSIGNMENT_STATUSES = {
    pending: {
        label: "Pendiente",
        icon: Clock3,
    },
    confirmed: {
        label: "Confirmado",
        icon: CheckCircle2,
    },
    declined: {
        label: "No disponible",
        icon: AlertCircle,
    },
    unassigned: {
        label: "Sin voluntario",
        icon: CircleHelp,
    },
    cancelled: {
        label: "Cancelado",
        icon: AlertCircle,
    },
};


// =========================================================
// FORMATEAR FECHA
// =========================================================

function formatAssignmentDate(value) {

    if (
        typeof value !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
        return "Fecha no definida";
    }

    const [year, month, day] = value
        .split("-")
        .map(Number);

    const date = new Date(year, month - 1, day);

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return "Fecha no válida";
    }

    return new Intl.DateTimeFormat("es-CL", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(date);
}


// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function VolunteerAssignmentCard({
    assignment,
    volunteers = [],
    onView,
    onEdit,
    onDelete,
}) {

    // =====================================================
    // VALIDACIÓN
    // =====================================================

    if (!assignment) {
        return null;
    }


    // =====================================================
    // VOLUNTARIO ASIGNADO
    // =====================================================

    const volunteer = volunteers.find(
        (item) => item.id === assignment.volunteerId
    );

    const volunteerName =
        assignment.volunteerId == null
            ? "Sin voluntario asignado"
            : volunteer
                ? (
                    volunteer.name ||
                    [
                        volunteer.firstName,
                        volunteer.lastName,
                    ]
                        .filter(Boolean)
                        .join(" ") ||
                    "Voluntario"
                )
                : "Voluntario no encontrado";


    // =====================================================
    // EQUIPO DE SERVICIO
    // =====================================================

    const team = VOLUNTEER_TEAMS.find(
        (item) => item.id === assignment.teamId
    );

    const teamName =
        team?.name || "Equipo de servicio";


    // =====================================================
    // ESTADO EFECTIVO
    // =====================================================

    let effectiveStatus = assignment.status || "pending";

    if (effectiveStatus !== "cancelled") {

        if (assignment.volunteerId == null) {
            effectiveStatus = "unassigned";
        }

    }

    const status =
        ASSIGNMENT_STATUSES[effectiveStatus] ||
        ASSIGNMENT_STATUSES.pending;

    const StatusIcon = status.icon;


    // =====================================================
    // INFORMACIÓN
    // =====================================================

    const assignmentTitle =
        assignment.title || "Responsabilidad sin título";

    const assignmentDate =
        formatAssignmentDate(assignment.date);

    const assignmentTime =
        assignment.startTime
            ? (
                assignment.endTime
                    ? `${assignment.startTime} - ${assignment.endTime}`
                    : assignment.startTime
            )
            : "Sin hora";


    // =====================================================
    // INTERFAZ
    // =====================================================

    return (
        <article className="volunteer-assignment-card">

            {/* =========================================== */}
            {/* INFORMACIÓN PRINCIPAL */}
            {/* =========================================== */}

            <div className="volunteer-assignment-card__main">

                {/* EQUIPO Y ESTADO */}

                <div className="volunteer-assignment-card__top">

                    <span className="volunteer-assignment-card__team">
                        {teamName}
                    </span>

                    <span
                        className={
                            "volunteer-assignment-card__status " +
                            `volunteer-assignment-card__status--${effectiveStatus}`
                        }
                    >
                        <StatusIcon
                            size={13}
                            aria-hidden="true"
                        />

                        {status.label}
                    </span>

                </div>


                {/* TÍTULO */}

                <h3 className="volunteer-assignment-card__title">
                    {assignmentTitle}
                </h3>


                {/* DESCRIPCIÓN OPCIONAL */}

                {assignment.description && (

                    <p className="volunteer-assignment-card__description">
                        {assignment.description}
                    </p>

                )}


                {/* INFORMACIÓN DEL TURNO */}

                <div className="volunteer-assignment-card__metadata">

                    <span>
                        <UsersRound
                            size={15}
                            aria-hidden="true"
                        />

                        {volunteerName}
                    </span>

                    <span>
                        <CalendarDays
                            size={15}
                            aria-hidden="true"
                        />

                        {assignmentDate}
                    </span>

                    <span>
                        <Clock3
                            size={15}
                            aria-hidden="true"
                        />

                        {assignmentTime}
                    </span>

                </div>

            </div>


            {/* =========================================== */}
            {/* ACCIONES ADMINISTRATIVAS */}
            {/* =========================================== */}

            <div className="volunteer-assignment-card__actions">

                {onView && (

                    <button
                        type="button"
                        className="volunteer-assignment-card__action volunteer-assignment-card__action--view"
                        onClick={() => onView(assignment)}
                        aria-label={`Ver asignación: ${assignmentTitle}`}
                        title="Ver detalles"
                    >
                        <Eye
                            size={17}
                            aria-hidden="true"
                        />
                    </button>

                )}


                {onEdit && (

                    <button
                        type="button"
                        className="volunteer-assignment-card__action volunteer-assignment-card__action--edit"
                        onClick={() => onEdit(assignment)}
                        aria-label={`Editar asignación: ${assignmentTitle}`}
                        title="Editar asignación"
                    >
                        <Pencil
                            size={17}
                            aria-hidden="true"
                        />
                    </button>

                )}


                {onDelete && (

                    <button
                        type="button"
                        className="volunteer-assignment-card__action volunteer-assignment-card__action--delete"
                        onClick={() => onDelete(assignment)}
                        aria-label={`Eliminar asignación: ${assignmentTitle}`}
                        title="Eliminar asignación"
                    >
                        <Trash2
                            size={17}
                            aria-hidden="true"
                        />
                    </button>

                )}

            </div>

        </article>
    );
}

export default VolunteerAssignmentCard;