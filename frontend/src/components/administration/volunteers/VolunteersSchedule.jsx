// =========================================================
// IMPORTACIONES
// =========================================================

import { useState } from "react";

import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Clock3,
    CheckCircle2,
    AlertCircle,
    CircleHelp,
    UsersRound,
} from "lucide-react";

import { VOLUNTEER_TEAMS } from "./VolunteersTeams";

import "../../../styles/components/administration/volunteers/VolunteersSchedule.css";


// =========================================================
// CONFIGURACIÓN
// =========================================================

const WEEKDAYS = [
    "Lun",
    "Mar",
    "Mié",
    "Jue",
    "Vie",
    "Sáb",
    "Dom",
];

const STATUS_CONFIG = {
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
// FUNCIONES AUXILIARES DE FECHA
// =========================================================



function formatDateKey(date) {
    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function addDays(date, amount) {
    const result = new Date(date);

    result.setDate(result.getDate() + amount);

    return result;
}

function getStartOfWeek(date) {
    const result = new Date(date);

    const day = (result.getDay() + 6) % 7;

    result.setDate(result.getDate() - day);

    return result;
}

function getMonthDays(date) {
    const firstDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        1
    );

    const lastDay = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0
    );

    const start = getStartOfWeek(firstDay);

    const end = addDays(
        lastDay,
        (7 - lastDay.getDay()) % 7
    );

    const days = [];

    for (
        let current = new Date(start);
        current <= end;
        current = addDays(current, 1)
    ) {
        days.push(current);
    }

    return days;
}

function formatPeriod(date, viewMode) {
    if (viewMode === "month") {
        return new Intl.DateTimeFormat("es-CL", {
            month: "long",
            year: "numeric",
        }).format(date);
    }

    const start = getStartOfWeek(date);

    const end = addDays(start, 6);

    const formatter = new Intl.DateTimeFormat(
        "es-CL",
        {
            day: "numeric",
            month: "short",
        }
    );

    return `${formatter.format(start)} - ${formatter.format(end)}`;
}


// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function VolunteersSchedule({
    assignments = [],
    volunteers = [],
    selectedTeam = "all",
    onViewAssignment,
}) {

    // =====================================================
    // ESTADOS
    // =====================================================

    const [viewMode, setViewMode] = useState("week");

    const [currentDate, setCurrentDate] = useState(
        () => new Date()
    );


    // =====================================================
    // NAVEGACIÓN DEL CALENDARIO
    // =====================================================

    const changePeriod = (direction) => {
        setCurrentDate((previous) => {

            if (viewMode === "week") {
                return addDays(previous, direction * 7);
            }

            return new Date(
                previous.getFullYear(),
                previous.getMonth() + direction,
                1
            );
        });
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };


    // =====================================================
    // DÍAS VISIBLES
    // =====================================================

    const visibleDays =
        viewMode === "week"
            ? Array.from(
                { length: 7 },
                (_, index) =>
                    addDays(
                        getStartOfWeek(currentDate),
                        index
                    )
            )
            : getMonthDays(currentDate);


    // =====================================================
    // FILTRAR ASIGNACIONES
    // =====================================================

    const filteredAssignments = assignments.filter(
        (assignment) =>
            selectedTeam === "all" ||
            assignment.teamId === selectedTeam
    );


    // =====================================================
    // OBTENER ASIGNACIONES POR FECHA
    // =====================================================

    const getAssignmentsForDay = (date) => {

        const dateKey = formatDateKey(date);

        return filteredAssignments
            .filter(
                (assignment) =>
                    assignment.date === dateKey
            )
            .sort((a, b) =>
                (a.startTime || "").localeCompare(
                    b.startTime || ""
                )
            );
    };


    // =====================================================
    // OBTENER NOMBRE DEL VOLUNTARIO
    // =====================================================

    const getVolunteerName = (volunteerId) => {

        if (volunteerId == null) {
            return "Sin voluntario";
        }

        const volunteer = volunteers.find(
            (item) => item.id === volunteerId
        );

        if (!volunteer) {
            return "Voluntario no encontrado";
        }

        return (
            volunteer.name ||
            [volunteer.firstName, volunteer.lastName]
                .filter(Boolean)
                .join(" ") ||
            "Voluntario"
        );
    };


    // =====================================================
    // OBTENER NOMBRE DEL EQUIPO
    // =====================================================

    const getTeamName = (teamId) => {

        const team = VOLUNTEER_TEAMS.find(
            (item) => item.id === teamId
        );

        return team?.name || "Equipo de servicio";
    };


    // =====================================================
    // FECHA ACTUAL
    // =====================================================

    const todayKey = formatDateKey(new Date());


    // =====================================================
    // INTERFAZ
    // =====================================================

    return (
        <section
            className="volunteers-schedule"
            aria-labelledby="volunteers-schedule-title"
        >

            {/* =========================================== */}
            {/* ENCABEZADO */}
            {/* =========================================== */}

            <div className="volunteers-schedule__header">

                <div className="volunteers-schedule__heading">

                    <div className="volunteers-schedule__heading-icon">
                        <CalendarDays
                            size={21}
                            strokeWidth={1.8}
                            aria-hidden="true"
                        />
                    </div>

                    <div>
                        <h2 id="volunteers-schedule-title">
                            Calendario de turnos
                        </h2>

                        <p>
                            Consulta las responsabilidades
                            y confirmaciones programadas.
                        </p>
                    </div>

                </div>


                {/* SELECTOR DE VISTA */}

                <div className="volunteers-schedule__view-switch">

                    <button
                        type="button"
                        className={
                            viewMode === "week"
                                ? "volunteers-schedule__view-button volunteers-schedule__view-button--active"
                                : "volunteers-schedule__view-button"
                        }
                        onClick={() => setViewMode("week")}
                        aria-pressed={viewMode === "week"}
                    >
                        Semana
                    </button>

                    <button
                        type="button"
                        className={
                            viewMode === "month"
                                ? "volunteers-schedule__view-button volunteers-schedule__view-button--active"
                                : "volunteers-schedule__view-button"
                        }
                        onClick={() => setViewMode("month")}
                        aria-pressed={viewMode === "month"}
                    >
                        Mes
                    </button>

                </div>

            </div>


            {/* =========================================== */}
            {/* NAVEGACIÓN */}
            {/* =========================================== */}

            <div className="volunteers-schedule__navigation">

                <div className="volunteers-schedule__period">

                    <h3>
                        {formatPeriod(currentDate, viewMode)}
                    </h3>

                </div>

                <div className="volunteers-schedule__navigation-actions">

                    <button
                        type="button"
                        className="volunteers-schedule__today"
                        onClick={goToToday}
                    >
                        Hoy
                    </button>

                    <button
                        type="button"
                        className="volunteers-schedule__nav-button"
                        onClick={() => changePeriod(-1)}
                        aria-label="Período anterior"
                    >
                        <ChevronLeft size={19} />
                    </button>

                    <button
                        type="button"
                        className="volunteers-schedule__nav-button"
                        onClick={() => changePeriod(1)}
                        aria-label="Período siguiente"
                    >
                        <ChevronRight size={19} />
                    </button>

                </div>

            </div>


            {/* =========================================== */}
            {/* CALENDARIO */}
            {/* =========================================== */}

            <div className="volunteers-schedule__calendar-scroll">

                <div
                    className={
                        `volunteers-schedule__calendar ` +
                        `volunteers-schedule__calendar--${viewMode}`
                    }
                >

                    {/* DÍAS DE LA SEMANA */}

                    {WEEKDAYS.map((day) => (
                        <div
                            key={day}
                            className="volunteers-schedule__weekday"
                        >
                            {day}
                        </div>
                    ))}


                    {/* CELDAS */}

                    {visibleDays.map((date) => {

                        const dateKey = formatDateKey(date);

                        const dayAssignments =
                            getAssignmentsForDay(date);

                        const isToday =
                            dateKey === todayKey;

                        const isOutsideMonth =
                            viewMode === "month" &&
                            date.getMonth() !==
                            currentDate.getMonth();

                        return (
                            <div
                                key={dateKey}
                                className={
                                    "volunteers-schedule__day" +
                                    (isToday
                                        ? " volunteers-schedule__day--today"
                                        : "") +
                                    (isOutsideMonth
                                        ? " volunteers-schedule__day--outside"
                                        : "")
                                }
                            >

                                {/* NÚMERO DEL DÍA */}

                                <div className="volunteers-schedule__day-header">

                                    <span className="volunteers-schedule__day-number">
                                        {date.getDate()}
                                    </span>

                                    {dayAssignments.length > 0 && (
                                        <span className="volunteers-schedule__day-count">
                                            {dayAssignments.length}
                                        </span>
                                    )}

                                </div>


                                {/* ASIGNACIONES */}

                                <div className="volunteers-schedule__day-assignments">

                                    {dayAssignments.map((assignment) => {

                                        const effectiveStatus =
                                            assignment.volunteerId == null &&
                                            assignment.status !== "cancelled"
                                                ? "unassigned"
                                                : assignment.status;

                                        const status =
                                            STATUS_CONFIG[effectiveStatus] ||
                                            STATUS_CONFIG.pending;

                                        const StatusIcon = status.icon;

                                        return (
                                            <button
                                                key={assignment.id}
                                                type="button"
                                                className={
                                                    `volunteers-schedule__assignment ` +
                                                    `volunteers-schedule__assignment--${effectiveStatus}`
                                                }
                                                onClick={() =>
                                                    onViewAssignment?.(assignment)
                                                }
                                                disabled={!onViewAssignment}
                                                title={`${assignment.title} - ${status.label}`}
                                            >

                                                <span className="volunteers-schedule__assignment-time">
                                                    <Clock3 size={11} />

                                                    {assignment.startTime || "Sin hora"}
                                                </span>

                                                <strong className="volunteers-schedule__assignment-title">
                                                    {assignment.title}
                                                </strong>

                                                <span className="volunteers-schedule__assignment-volunteer">
                                                    <UsersRound size={11} />

                                                    {getVolunteerName(
                                                        assignment.volunteerId
                                                    )}
                                                </span>

                                                <span className="volunteers-schedule__assignment-status">
                                                    <StatusIcon size={11} />

                                                    {status.label}
                                                </span>

                                                <span className="volunteers-schedule__assignment-team">
                                                    {getTeamName(assignment.teamId)}
                                                </span>

                                            </button>
                                        );
                                    })}

                                </div>

                            </div>
                        );
                    })}

                </div>

            </div>


            {/* =========================================== */}
            {/* LEYENDA */}
            {/* =========================================== */}

            <div className="volunteers-schedule__legend">

                <span className="volunteers-schedule__legend-item volunteers-schedule__legend-item--confirmed">
                    <span />
                    Confirmado
                </span>

                <span className="volunteers-schedule__legend-item volunteers-schedule__legend-item--pending">
                    <span />
                    Pendiente
                </span>

                <span className="volunteers-schedule__legend-item volunteers-schedule__legend-item--declined">
                    <span />
                    No disponible
                </span>

                <span className="volunteers-schedule__legend-item volunteers-schedule__legend-item--unassigned">
                    <span />
                    Sin voluntario
                </span>

                <span className="volunteers-schedule__legend-item volunteers-schedule__legend-item--cancelled">
                    <span />
                    Cancelado
                </span>

            </div>

        </section>
    );
}

export default VolunteersSchedule;