// =========================================================
// IMPORTACIONES
// =========================================================

import {
    LayoutGrid,
    Music2,
    BookOpen,
    Baby,
    GraduationCap,
    Megaphone,
    Sparkles,
    CalendarDays,
    ArrowRight,
    UsersRound,
} from "lucide-react";

// Importamos los estilos exclusivos del componente.
import "../../../styles/components/administration/volunteers/VolunteersTeams.css";


// =========================================================
// EQUIPOS DE SERVICIO
// =========================================================

// Estos identificadores serán compartidos por los
// formularios, turnos y asignaciones del módulo.

export const VOLUNTEER_TEAMS = [
    {
        id: "worship",
        name: "Alabanza y música",
        description: "Música y participación en los cultos",
        icon: Music2,
    },
    {
        id: "bible_studies",
        name: "Estudios bíblicos online",
        description: "Dirección de estudios y reuniones virtuales",
        icon: BookOpen,
    },
    {
        id: "children",
        name: "Enseñanza infantil",
        description: "Clases y actividades para niños",
        icon: Baby,
    },
    {
        id: "youth",
        name: "Enseñanza juvenil",
        description: "Clases y formación de jóvenes",
        icon: GraduationCap,
    },
    {
        id: "communications",
        name: "Comunicaciones",
        description: "Anuncios y difusión de información",
        icon: Megaphone,
    },
    {
        id: "cleaning",
        name: "Aseo y mantenimiento",
        description: "Limpieza y preparación de espacios",
        icon: Sparkles,
    },
    {
        id: "events",
        name: "Eventos y actividades",
        description: "Organización y apoyo en actividades",
        icon: CalendarDays,
    },
];


// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function VolunteersTeams({
    volunteers = [],
    assignments = [],
    selectedTeam = "all",
    onSelectTeam,
}) {

    // =====================================================
    // CONTAR VOLUNTARIOS ACTIVOS POR EQUIPO
    // =====================================================

    function getVolunteerCount(teamId) {

        const activeVolunteers = volunteers.filter(
            (volunteer) => volunteer.status === "active"
        );

        if (teamId === "all") {
            return activeVolunteers.length;
        }

        return activeVolunteers.filter(
            (volunteer) =>
                Array.isArray(volunteer.teams) &&
                volunteer.teams.includes(teamId)
        ).length;
    }


    // =====================================================
    // CONTAR ASIGNACIONES POR EQUIPO
    // =====================================================

    function getAssignmentCount(teamId) {

        const validAssignments = assignments.filter(
            (assignment) =>
                assignment.status !== "cancelled"
        );

        if (teamId === "all") {
            return validAssignments.length;
        }

        return validAssignments.filter(
            (assignment) =>
                assignment.teamId === teamId
        ).length;
    }


    // =====================================================
    // CONFIGURACIÓN DE CATEGORÍAS
    // =====================================================

    const teams = [
        {
            id: "all",
            name: "Todos los equipos",
            description: "Explorar todas las áreas de servicio",
            icon: LayoutGrid,
        },
        ...VOLUNTEER_TEAMS,
    ];


    // =====================================================
    // INTERFAZ
    // =====================================================

    return (
        <section
            className="volunteers-teams"
            aria-labelledby="volunteers-teams-title"
        >

            {/* =========================================== */}
            {/* ENCABEZADO */}
            {/* =========================================== */}

            <div className="volunteers-teams__heading">

                <div>

                    <h2 id="volunteers-teams-title">
                        Equipos de servicio
                    </h2>

                    <p>
                        Consulta los ministerios, sus voluntarios
                        y las responsabilidades asignadas.
                    </p>

                </div>

                <span className="volunteers-teams__total">
                    {VOLUNTEER_TEAMS.length} equipos
                </span>

            </div>


            {/* =========================================== */}
            {/* TARJETAS DE EQUIPOS */}
            {/* =========================================== */}

            <div className="volunteers-teams__grid">

                {teams.map((team) => {

                    const Icon = team.icon;

                    const isSelected =
                        selectedTeam === team.id;

                    const volunteerCount =
                        getVolunteerCount(team.id);

                    const assignmentCount =
                        getAssignmentCount(team.id);

                    return (
                        <button
                            key={team.id}
                            type="button"
                            className={
                                "volunteers-teams__card" +
                                (isSelected
                                    ? " volunteers-teams__card--active"
                                    : "")
                            }
                            onClick={() =>
                                onSelectTeam?.(team.id)
                            }
                            aria-pressed={isSelected}
                        >

                            {/* Icono del equipo. */}
                            <div className="volunteers-teams__icon">

                                <Icon
                                    size={21}
                                    strokeWidth={1.8}
                                    aria-hidden="true"
                                />

                            </div>


                            {/* Información del equipo. */}
                            <div className="volunteers-teams__info">

                                <strong>
                                    {team.name}
                                </strong>

                                <span className="volunteers-teams__description">
                                    {team.description}
                                </span>

                                {/* Estadísticas del equipo. */}
                                <div className="volunteers-teams__stats">

                                    <span>

                                        <UsersRound
                                            size={13}
                                            aria-hidden="true"
                                        />

                                        {volunteerCount}{" "}
                                        {volunteerCount === 1
                                            ? "voluntario"
                                            : "voluntarios"}

                                    </span>

                                    <span>

                                        <CalendarDays
                                            size={13}
                                            aria-hidden="true"
                                        />

                                        {assignmentCount}{" "}
                                        {assignmentCount === 1
                                            ? "asignación"
                                            : "asignaciones"}

                                    </span>

                                </div>

                            </div>


                            {/* Indicador de selección. */}
                            <div className="volunteers-teams__arrow">

                                <ArrowRight
                                    size={17}
                                    aria-hidden="true"
                                />

                            </div>

                        </button>
                    );
                })}

            </div>

        </section>
    );
}

export default VolunteersTeams;