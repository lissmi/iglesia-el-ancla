// =========================================================
// IMPORTACIONES
// =========================================================

import { useEffect, useRef } from "react";

import {
    X,
    ClipboardList,
    UsersRound,
    UserRound,
    CalendarDays,
    Clock3,
    MapPin,
    FileText,
    Link2,
    Pencil,
    CheckCircle2,
    AlertCircle,
    CircleHelp,
    Info,
} from "lucide-react";

import { VOLUNTEER_TEAMS } from "./VolunteersTeams";

import "../../../styles/components/administration/volunteers/VolunteerDetailsModal.css";


// =========================================================
// CONFIGURACIÓN DE ESTADOS
// =========================================================

const ASSIGNMENT_STATUSES = {
    pending: {
        label: "Pendiente de confirmación",
        description: "El voluntario todavía no confirma su participación.",
        icon: Clock3,
    },
    confirmed: {
        label: "Confirmado",
        description: "La participación del voluntario está confirmada.",
        icon: CheckCircle2,
    },
    declined: {
        label: "No disponible",
        description: "El voluntario indicó que no podrá participar.",
        icon: AlertCircle,
    },
    unassigned: {
        label: "Sin voluntario",
        description: "Esta responsabilidad todavía necesita una persona asignada.",
        icon: CircleHelp,
    },
    cancelled: {
        label: "Cancelado",
        description: "Esta asignación fue cancelada.",
        icon: AlertCircle,
    },
};


// =========================================================
// FUNCIONES AUXILIARES
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
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date);
}


// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function VolunteerDetailsModal({
    isOpen = false,
    assignment = null,
    volunteers = [],
    events = [],
    onClose,
    onEdit,
}) {

    // =====================================================
    // REFERENCIAS
    // =====================================================

    const closeButtonRef = useRef(null);
    const dialogRef = useRef(null);


    // =====================================================
    // EFECTOS DEL MODAL
    // =====================================================

    useEffect(() => {

        if (!isOpen || !assignment) {
            return;
        }

        const previousOverflow = document.body.style.overflow;

        const previousActiveElement = document.activeElement;

        document.body.style.overflow = "hidden";

        closeButtonRef.current?.focus();

        const handleKeyDown = (event) => {

            if (event.key === "Escape") {
                onClose?.();
            }

            if (event.key === "Tab") {

                const focusableElements =
                    dialogRef.current?.querySelectorAll(
                        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
                    );

                if (!focusableElements?.length) {
                    return;
                }

                const firstElement = focusableElements[0];

                const lastElement =
                    focusableElements[focusableElements.length - 1];

                if (
                    event.shiftKey &&
                    document.activeElement === firstElement
                ) {
                    event.preventDefault();
                    lastElement.focus();
                } else if (
                    !event.shiftKey &&
                    document.activeElement === lastElement
                ) {
                    event.preventDefault();
                    firstElement.focus();
                }

            }

        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {

            document.body.style.overflow = previousOverflow;

            document.removeEventListener("keydown", handleKeyDown);

            previousActiveElement?.focus?.();

        };

    }, [isOpen, assignment, onClose]);


    // =====================================================
    // VALIDACIÓN DE VISIBILIDAD
    // =====================================================

    if (!isOpen || !assignment) {
        return null;
    }


    // =====================================================
    // IDENTIFICAR VOLUNTARIO
    // =====================================================

    const volunteer = volunteers.find(
        (item) =>
            String(item.id) === String(assignment.volunteerId)
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
    // IDENTIFICAR EQUIPO
    // =====================================================

    const team = VOLUNTEER_TEAMS.find(
        (item) => item.id === assignment.teamId
    );

    const teamName =
        team?.name || "Equipo de servicio";


    // =====================================================
    // IDENTIFICAR EVENTO ASOCIADO
    // =====================================================

    const associatedEvent = events.find(
        (item) =>
            String(item.id) === String(assignment.eventId)
    );

    const eventName =
        !assignment.eventId
            ? "Sin evento asociado"
            : associatedEvent
                ? associatedEvent.title ||
                  associatedEvent.name ||
                  "Evento"
                : "Evento no encontrado";


    // =====================================================
    // ESTADO EFECTIVO
    // =====================================================

    const effectiveStatus =
        assignment.status === "cancelled"
            ? "cancelled"
            : assignment.volunteerId == null
                ? "unassigned"
                : assignment.status || "pending";

    const status =
        ASSIGNMENT_STATUSES[effectiveStatus] ||
        ASSIGNMENT_STATUSES.pending;

    const StatusIcon = status.icon;


    // =====================================================
    // INFORMACIÓN GENERAL
    // =====================================================

    const assignmentTitle =
        assignment.title || "Responsabilidad sin título";

    const assignmentDate =
        formatAssignmentDate(assignment.date);

    const assignmentTime =
        assignment.startTime
            ? assignment.endTime
                ? `${assignment.startTime} - ${assignment.endTime} hrs`
                : `${assignment.startTime} hrs`
            : "Horario no definido";


    // =====================================================
    // ACCIONES
    // =====================================================

    const handleClose = () => {
        onClose?.();
    };

    const handleEdit = () => {
        onEdit?.(assignment);
    };


    // =====================================================
    // INTERFAZ
    // =====================================================

    return (
        <div
            className="volunteer-details-modal__overlay"
            onMouseDown={(event) => {

                if (event.target === event.currentTarget) {
                    handleClose();
                }

            }}
        >

            <div
                ref={dialogRef}
                className="volunteer-details-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="volunteer-details-modal-title"
                aria-describedby="volunteer-details-modal-description"
            >

                {/* ======================================= */}
                {/* ENCABEZADO */}
                {/* ======================================= */}

                <div className="volunteer-details-modal__header">

                    <div className="volunteer-details-modal__heading">

                        <div className="volunteer-details-modal__heading-icon">

                            <ClipboardList
                                size={23}
                                strokeWidth={1.8}
                                aria-hidden="true"
                            />

                        </div>

                        <div>

                            <h2 id="volunteer-details-modal-title">
                                Detalles de asignación
                            </h2>

                            <p id="volunteer-details-modal-description">
                                Información de la responsabilidad de servicio.
                            </p>

                        </div>

                    </div>

                    <button
                        ref={closeButtonRef}
                        type="button"
                        className="volunteer-details-modal__close"
                        onClick={handleClose}
                        aria-label="Cerrar detalles"
                    >
                        <X size={21} aria-hidden="true" />
                    </button>

                </div>


                {/* ======================================= */}
                {/* CUERPO */}
                {/* ======================================= */}

                <div className="volunteer-details-modal__body">

                    {/* =================================== */}
                    {/* RESPONSABILIDAD */}
                    {/* =================================== */}

                    <div className="volunteer-details-modal__intro">

                        <span className="volunteer-details-modal__team">
                            {teamName}
                        </span>

                        <h3>
                            {assignmentTitle}
                        </h3>

                        {assignment.description && (

                            <p>
                                {assignment.description}
                            </p>

                        )}

                    </div>


                    {/* =================================== */}
                    {/* ESTADO DE CONFIRMACIÓN */}
                    {/* =================================== */}

                    <div
                        className={
                            "volunteer-details-modal__status " +
                            `volunteer-details-modal__status--${effectiveStatus}`
                        }
                    >

                        <div className="volunteer-details-modal__status-icon">

                            <StatusIcon
                                size={20}
                                aria-hidden="true"
                            />

                        </div>

                        <div>

                            <strong>
                                {status.label}
                            </strong>

                            <p>
                                {status.description}
                            </p>

                        </div>

                    </div>


                    {/* =================================== */}
                    {/* DATOS DEL TURNO */}
                    {/* =================================== */}

                    <div className="volunteer-details-modal__section">

                        <div className="volunteer-details-modal__section-title">

                            <CalendarDays size={18} />

                            <h4>Información del servicio</h4>

                        </div>

                        <div className="volunteer-details-modal__grid">

                            {/* VOLUNTARIO */}

                            <div className="volunteer-details-modal__info">

                                <div className="volunteer-details-modal__info-icon">
                                    <UserRound size={18} />
                                </div>

                                <div>

                                    <span>Voluntario responsable</span>

                                    <strong>
                                        {volunteerName}
                                    </strong>

                                </div>

                            </div>


                            {/* EQUIPO */}

                            <div className="volunteer-details-modal__info">

                                <div className="volunteer-details-modal__info-icon">
                                    <UsersRound size={18} />
                                </div>

                                <div>

                                    <span>Equipo de servicio</span>

                                    <strong>
                                        {teamName}
                                    </strong>

                                </div>

                            </div>


                            {/* FECHA */}

                            <div className="volunteer-details-modal__info">

                                <div className="volunteer-details-modal__info-icon">
                                    <CalendarDays size={18} />
                                </div>

                                <div>

                                    <span>Fecha</span>

                                    <strong>
                                        {assignmentDate}
                                    </strong>

                                </div>

                            </div>


                            {/* HORARIO */}

                            <div className="volunteer-details-modal__info">

                                <div className="volunteer-details-modal__info-icon">
                                    <Clock3 size={18} />
                                </div>

                                <div>

                                    <span>Horario</span>

                                    <strong>
                                        {assignmentTime}
                                    </strong>

                                </div>

                            </div>


                            {/* LUGAR */}

                            <div className="volunteer-details-modal__info">

                                <div className="volunteer-details-modal__info-icon">
                                    <MapPin size={18} />
                                </div>

                                <div>

                                    <span>Lugar o modalidad</span>

                                    <strong>
                                        {assignment.location ||
                                            "No especificado"}
                                    </strong>

                                </div>

                            </div>


                            {/* EVENTO */}

                            <div className="volunteer-details-modal__info">

                                <div className="volunteer-details-modal__info-icon">
                                    <Link2 size={18} />
                                </div>

                                <div>

                                    <span>Evento asociado</span>

                                    <strong>
                                        {eventName}
                                    </strong>

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* =================================== */}
                    {/* INSTRUCCIONES */}
                    {/* =================================== */}

                    <div className="volunteer-details-modal__section">

                        <div className="volunteer-details-modal__section-title">

                            <FileText size={18} />

                            <h4>Indicaciones para el voluntario</h4>

                        </div>

                        {assignment.notes ? (

                            <div className="volunteer-details-modal__notes">
                                {assignment.notes}
                            </div>

                        ) : (

                            <div className="volunteer-details-modal__no-notes">

                                <Info size={17} />

                                No se registraron indicaciones adicionales.

                            </div>

                        )}

                    </div>

                </div>


                {/* ======================================= */}
                {/* PIE DEL MODAL */}
                {/* ======================================= */}

                <div className="volunteer-details-modal__footer">

                    <button
                        type="button"
                        className="volunteer-details-modal__cancel"
                        onClick={handleClose}
                    >
                        Cerrar
                    </button>

                    {onEdit && (

                        <button
                            type="button"
                            className="volunteer-details-modal__edit"
                            onClick={handleEdit}
                        >

                            <Pencil
                                size={17}
                                aria-hidden="true"
                            />

                            Editar asignación

                        </button>

                    )}

                </div>

            </div>

        </div>
    );
}

export default VolunteerDetailsModal;