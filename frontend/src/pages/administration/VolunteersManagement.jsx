// =========================================================
// IMPORTACIONES
// =========================================================

import {
    useCallback,
    useMemo,
    useState,
} from "react";



import VolunteersHeader from "../../components/administration/volunteers/VolunteersHeader";
import VolunteersSummary from "../../components/administration/volunteers/VolunteersSummary";
import VolunteersTeams from "../../components/administration/volunteers/VolunteersTeams";
import VolunteersToolbar from "../../components/administration/volunteers/VolunteersToolbar";
import VolunteersSchedule from "../../components/administration/volunteers/VolunteersSchedule";
import VolunteersAssignments from "../../components/administration/volunteers/VolunteersAssignments";

import VolunteerAssignmentFormModal from "../../components/administration/volunteers/VolunteerAssignmentFormModal";
import VolunteerDetailsModal from "../../components/administration/volunteers/VolunteerDetailsModal";
import VolunteerDeleteModal from "../../components/administration/volunteers/VolunteerDeleteModal";

import "../../styles/pages/administration/VolunteersManagement.css";


// =========================================================
// DATOS TEMPORALES: VOLUNTARIOS
// =========================================================

const INITIAL_VOLUNTEERS = [
    {
        id: "VOL-001",
        name: "María González",
        status: "active",
        teams: ["worship", "events"],
    },
    {
        id: "VOL-002",
        name: "Daniel Rojas",
        status: "active",
        teams: ["worship", "youth"],
    },
    {
        id: "VOL-003",
        name: "Camila Torres",
        status: "active",
        teams: ["children", "events"],
    },
    {
        id: "VOL-004",
        name: "Felipe Muñoz",
        status: "active",
        teams: ["bible_studies", "youth"],
    },
    {
        id: "VOL-005",
        name: "Valentina Pérez",
        status: "active",
        teams: ["communications", "events"],
    },
    {
        id: "VOL-006",
        name: "Jorge Silva",
        status: "active",
        teams: ["cleaning", "events"],
    },
    {
        id: "VOL-007",
        name: "Andrea Morales",
        status: "active",
        teams: ["children", "cleaning"],
    },
    {
        id: "VOL-008",
        name: "Cristóbal Herrera",
        status: "inactive",
        teams: ["worship"],
    },
];


// =========================================================
// FUNCIONES AUXILIARES DE FECHAS
// =========================================================

function getLocalDateKey(date) {

    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function getRelativeDate(daysFromToday) {

    const date = new Date();

    date.setHours(12, 0, 0, 0);

    date.setDate(
        date.getDate() + daysFromToday
    );

    return getLocalDateKey(date);
}


function parseLocalDate(value) {

    if (
        typeof value !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
        return null;
    }

    const [year, month, day] = value
        .split("-")
        .map(Number);

    const date = new Date(
        year,
        month - 1,
        day,
        12
    );

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return null;
    }

    return date;
}


// =========================================================
// DATOS TEMPORALES: ASIGNACIONES
// =========================================================

function createInitialAssignments() {

    return [
        {
            id: "ASG-001",
            teamId: "worship",
            volunteerId: "VOL-001",
            title: "Alabanza - Culto general",
            description: "Participación en el equipo de alabanza.",
            date: getRelativeDate(4),
            startTime: "10:30",
            endTime: "13:00",
            location: "Templo principal",
            eventId: null,
            notes: "Llegar con anticipación para el ensayo.",
            status: "confirmed",
        },
        {
            id: "ASG-002",
            teamId: "worship",
            volunteerId: "VOL-002",
            title: "Apoyo musical - Culto general",
            description: "Apoyo instrumental durante el culto.",
            date: getRelativeDate(4),
            startTime: "10:30",
            endTime: "13:00",
            location: "Templo principal",
            eventId: null,
            notes: "Revisar previamente el repertorio.",
            status: "pending",
        },
        {
            id: "ASG-003",
            teamId: "children",
            volunteerId: "VOL-003",
            title: "Clase bíblica infantil",
            description: "Preparación y enseñanza para niños.",
            date: getRelativeDate(4),
            startTime: "11:00",
            endTime: "12:30",
            location: "Sala infantil",
            eventId: null,
            notes: "Preparar materiales didácticos.",
            status: "confirmed",
        },
        {
            id: "ASG-004",
            teamId: "bible_studies",
            volunteerId: "VOL-004",
            title: "Descubriendo la Biblia",
            description: "Dirección del estudio bíblico online.",
            date: getRelativeDate(6),
            startTime: "20:00",
            endTime: "21:30",
            location: "Online",
            eventId: null,
            notes: "Comprobar conexión y material de estudio.",
            status: "pending",
        },
        {
            id: "ASG-005",
            teamId: "communications",
            volunteerId: "VOL-005",
            title: "Difusión de actividades",
            description: "Preparación de anuncios de la semana.",
            date: getRelativeDate(2),
            startTime: "17:00",
            endTime: "19:00",
            location: "Online",
            eventId: null,
            notes: "Revisar la información antes de publicar.",
            status: "confirmed",
        },
        {
            id: "ASG-006",
            teamId: "cleaning",
            volunteerId: "VOL-006",
            title: "Preparación del templo",
            description: "Aseo y organización de espacios.",
            date: getRelativeDate(3),
            startTime: "16:00",
            endTime: "18:00",
            location: "Templo principal",
            eventId: null,
            notes: "Revisar salón principal y áreas comunes.",
            status: "confirmed",
        },
        {
            id: "ASG-007",
            teamId: "events",
            volunteerId: null,
            title: "Recepción de participantes",
            description: "Apoyo en la bienvenida a visitantes.",
            date: getRelativeDate(9),
            startTime: "10:00",
            endTime: "12:00",
            location: "Entrada principal",
            eventId: null,
            notes: "Se necesita una persona responsable.",
            status: "pending",
        },
        {
            id: "ASG-008",
            teamId: "youth",
            volunteerId: "VOL-002",
            title: "Encuentro juvenil",
            description: "Apoyo en actividades para jóvenes.",
            date: getRelativeDate(11),
            startTime: "17:00",
            endTime: "19:00",
            location: "Salón de reuniones",
            eventId: null,
            notes: "Coordinar actividades con el equipo.",
            status: "declined",
        },
        {
            id: "ASG-009",
            teamId: "children",
            volunteerId: "VOL-007",
            title: "Apoyo en enseñanza infantil",
            description: "Preparación de materiales y acompañamiento.",
            date: getRelativeDate(11),
            startTime: "11:00",
            endTime: "12:30",
            location: "Sala infantil",
            eventId: null,
            notes: "",
            status: "pending",
        },
        {
            id: "ASG-010",
            teamId: "events",
            volunteerId: "VOL-001",
            title: "Organización de actividad comunitaria",
            description: "Coordinación de materiales y participantes.",
            date: getRelativeDate(-5),
            startTime: "15:00",
            endTime: "18:00",
            location: "Templo principal",
            eventId: null,
            notes: "",
            status: "confirmed",
        },
    ];

}


// =========================================================
// CONFIGURACIÓN DE ESTADOS
// =========================================================

function getEffectiveStatus(assignment) {

    if (assignment.status === "cancelled") {
        return "cancelled";
    }

    if (assignment.volunteerId == null) {
        return "unassigned";
    }

    return assignment.status || "pending";
}


// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function VolunteersManagement() {

    // =====================================================
    // DATOS PRINCIPALES
    // =====================================================

    const [volunteers] = useState(INITIAL_VOLUNTEERS);

    const [assignments, setAssignments] = useState(
        createInitialAssignments
    );

    // Se conectará con Gestión de Eventos posteriormente.
    const [events] = useState([]);


    // =====================================================
    // FILTROS
    // =====================================================

    const [selectedTeam, setSelectedTeam] = useState("all");

    const [searchTerm, setSearchTerm] = useState("");

    const [statusFilter, setStatusFilter] = useState("all");

    const [dateFilter, setDateFilter] = useState("all");

    const [sortBy, setSortBy] = useState("date_asc");


    // =====================================================
    // VISTA DE CALENDARIO
    // =====================================================

    const [showCalendar, setShowCalendar] = useState(true);


    // =====================================================
    // MODALES
    // =====================================================

    const [activeModal, setActiveModal] = useState(null);

    const [selectedAssignment, setSelectedAssignment] = useState(null);


    // =====================================================
    // FECHA ACTUAL
    // =====================================================

    const todayKey = getLocalDateKey(new Date());


    // =====================================================
    // OBTENER NOMBRE DEL VOLUNTARIO
    // =====================================================

    // useCallback mantiene estable la referencia
    // de esta función mientras no cambien los voluntarios.

    const getVolunteerName = useCallback((volunteerId) => {

        if (volunteerId == null) {
            return "";
        }

        const volunteer = volunteers.find(
            (item) =>
                String(item.id) === String(volunteerId)
        );

        if (!volunteer) {
            return "";
        }

        return (
            volunteer.name ||
            [
                volunteer.firstName,
                volunteer.lastName,
            ]
                .filter(Boolean)
                .join(" ")
        );

    }, [volunteers]);

    // =====================================================
    // FILTRAR Y ORDENAR ASIGNACIONES
    // =====================================================

    const filteredAssignments = useMemo(() => {

        const normalizedSearch = searchTerm
            .trim()
            .toLocaleLowerCase("es-CL");

        const today = parseLocalDate(todayKey);

        const weekStart = new Date(today);

        const weekday = (weekStart.getDay() + 6) % 7;

        weekStart.setDate(
            weekStart.getDate() - weekday
        );

        const weekEnd = new Date(weekStart);

        weekEnd.setDate(weekEnd.getDate() + 6);


        // ================================================
        // FILTROS
        // ================================================

        const result = assignments.filter((assignment) => {

            // EQUIPO

            if (
                selectedTeam !== "all" &&
                assignment.teamId !== selectedTeam
            ) {
                return false;
            }


            // ESTADO

            if (
                statusFilter !== "all" &&
                getEffectiveStatus(assignment) !== statusFilter
            ) {
                return false;
            }


            // BÚSQUEDA

            if (normalizedSearch) {

                const volunteerName =
                    getVolunteerName(assignment.volunteerId);

                const searchableText = [
                    assignment.title,
                    assignment.description,
                    assignment.location,
                    volunteerName,
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLocaleLowerCase("es-CL");

                if (!searchableText.includes(normalizedSearch)) {
                    return false;
                }

            }


            // FECHA

            if (dateFilter !== "all") {

                const assignmentDate =
                    parseLocalDate(assignment.date);

                if (!assignmentDate) {
                    return false;
                }

                if (
                    dateFilter === "today" &&
                    assignment.date !== todayKey
                ) {
                    return false;
                }

                if (
                    dateFilter === "week" &&
                    (
                        assignmentDate < weekStart ||
                        assignmentDate > weekEnd
                    )
                ) {
                    return false;
                }

                if (
                    dateFilter === "month" &&
                    (
                        assignmentDate.getMonth() !== today.getMonth() ||
                        assignmentDate.getFullYear() !== today.getFullYear()
                    )
                ) {
                    return false;
                }

                if (
                    dateFilter === "upcoming" &&
                    assignment.date < todayKey
                ) {
                    return false;
                }

                if (
                    dateFilter === "past" &&
                    assignment.date >= todayKey
                ) {
                    return false;
                }

            }

            return true;

        });


        // ================================================
        // ORDENAMIENTO
        // ================================================

        result.sort((first, second) => {

            const firstDate =
                `${first.date || ""} ${first.startTime || ""}`;

            const secondDate =
                `${second.date || ""} ${second.startTime || ""}`;

            if (sortBy === "date_desc") {
                return secondDate.localeCompare(firstDate);
            }

            if (sortBy === "volunteer_asc") {

                return getVolunteerName(first.volunteerId)
                    .localeCompare(
                        getVolunteerName(second.volunteerId),
                        "es"
                    );

            }

            if (sortBy === "volunteer_desc") {

                return getVolunteerName(second.volunteerId)
                    .localeCompare(
                        getVolunteerName(first.volunteerId),
                        "es"
                    );

            }

            if (sortBy === "team_asc") {

                return (first.teamId || "")
                    .localeCompare(second.teamId || "", "es");

            }

            return firstDate.localeCompare(secondDate);

        });

        return result;

    }, [
        assignments,
        selectedTeam,
        searchTerm,
        statusFilter,
        dateFilter,
        sortBy,
        todayKey,
        getVolunteerName,
    ]);


    // =====================================================
    // LIMPIAR FILTROS
    // =====================================================

    const handleClearFilters = () => {

        setSelectedTeam("all");

        setSearchTerm("");

        setStatusFilter("all");

        setDateFilter("all");

        setSortBy("date_asc");

    };


    // =====================================================
    // CAMBIAR VISTA DE CALENDARIO
    // =====================================================

    const handleViewCalendar = () => {

        setShowCalendar((previous) => !previous);

    };


    // =====================================================
    // CREAR ASIGNACIÓN
    // =====================================================

    const handleCreateAssignment = () => {

        setSelectedAssignment(null);

        setActiveModal("form");

    };


    // =====================================================
    // EDITAR ASIGNACIÓN
    // =====================================================

    const handleEditAssignment = (assignment) => {

        setSelectedAssignment(assignment);

        setActiveModal("form");

    };


    // =====================================================
    // VER DETALLES
    // =====================================================

    const handleViewAssignment = (assignment) => {

        setSelectedAssignment(assignment);

        setActiveModal("details");

    };


    // =====================================================
    // ELIMINAR ASIGNACIÓN
    // =====================================================

    const handleDeleteAssignment = (assignment) => {

        setSelectedAssignment(assignment);

        setActiveModal("delete");

    };


    // =====================================================
    // CERRAR MODALES
    // =====================================================

    const handleCloseModal = () => {

        setActiveModal(null);

        setSelectedAssignment(null);

    };


    // =====================================================
    // GENERAR IDENTIFICADOR
    // =====================================================

    const generateAssignmentId = () => {

        const numericIds = assignments
            .map((item) => {

                const match = String(item.id || "")
                    .match(/^ASG-(\d+)$/);

                return match ? Number(match[1]) : 0;

            });

        const nextNumber =
            Math.max(0, ...numericIds) + 1;

        return `ASG-${String(nextNumber).padStart(3, "0")}`;

    };


    // =====================================================
    // GUARDAR ASIGNACIÓN
    // =====================================================

    const handleSaveAssignment = async (
        formData,
        originalAssignment
    ) => {

        if (originalAssignment) {

            // ============================================
            // ACTUALIZAR ASIGNACIÓN EXISTENTE
            // ============================================

            setAssignments((previous) =>
                previous.map((item) => {

                    if (item.id !== originalAssignment.id) {
                        return item;
                    }

                    return {
                        ...item,
                        ...formData,
                        id: item.id,
                    };

                })
            );

        } else {

            // ============================================
            // CREAR NUEVA ASIGNACIÓN
            // ============================================

            const newAssignment = {
                ...formData,
                id: generateAssignmentId(),
            };

            setAssignments((previous) => [
                ...previous,
                newAssignment,
            ]);

        }

        handleCloseModal();

    };


    // =====================================================
    // CONFIRMAR ELIMINACIÓN
    // =====================================================

    const handleConfirmDelete = async (assignment) => {

        setAssignments((previous) =>
            previous.filter(
                (item) => item.id !== assignment.id
            )
        );

        handleCloseModal();

    };


    // =====================================================
    // INTERFAZ PRINCIPAL
    // =====================================================

    return (
        <main className="volunteers-management">

            <div className="volunteers-management__container">

                

                {/* ======================================= */}
                {/* ENCABEZADO */}
                {/* ======================================= */}

                <VolunteersHeader
                    onCreateAssignment={handleCreateAssignment}
                    onViewCalendar={handleViewCalendar}
                />


                {/* ======================================= */}
                {/* RESUMEN */}
                {/* ======================================= */}

                <VolunteersSummary
                    volunteers={volunteers}
                    assignments={assignments}
                />


                {/* ======================================= */}
                {/* EQUIPOS DE SERVICIO */}
                {/* ======================================= */}

                <VolunteersTeams
                    volunteers={volunteers}
                    assignments={assignments}
                    selectedTeam={selectedTeam}
                    onSelectTeam={setSelectedTeam}
                />


                {/* ======================================= */}
                {/* FILTROS */}
                {/* ======================================= */}

                <VolunteersToolbar
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    statusFilter={statusFilter}
                    onStatusChange={setStatusFilter}
                    dateFilter={dateFilter}
                    onDateChange={setDateFilter}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    onClearFilters={handleClearFilters}
                />


                {/* ======================================= */}
                {/* CALENDARIO */}
                {/* ======================================= */}

                {showCalendar && (

                    <div className="volunteers-management__calendar">

                        <VolunteersSchedule
                            assignments={assignments}
                            volunteers={volunteers}
                            selectedTeam={selectedTeam}
                            onViewAssignment={handleViewAssignment}
                        />

                    </div>

                )}


                {/* ======================================= */}
                {/* LISTADO DE ASIGNACIONES */}
                {/* ======================================= */}

                <VolunteersAssignments
                    assignments={filteredAssignments}
                    volunteers={volunteers}
                    onView={handleViewAssignment}
                    onEdit={handleEditAssignment}
                    onDelete={handleDeleteAssignment}
                    onCreate={handleCreateAssignment}
                />


                {/* ======================================= */}
                {/* FORMULARIO CREAR / EDITAR */}
                {/* ======================================= */}

                <VolunteerAssignmentFormModal
                    isOpen={activeModal === "form"}
                    assignment={selectedAssignment}
                    volunteers={volunteers}
                    events={events}
                    assignments={assignments}
                    onClose={handleCloseModal}
                    onSave={handleSaveAssignment}
                />


                {/* ======================================= */}
                {/* DETALLES */}
                {/* ======================================= */}

                <VolunteerDetailsModal
                    isOpen={activeModal === "details"}
                    assignment={selectedAssignment}
                    volunteers={volunteers}
                    events={events}
                    onClose={handleCloseModal}
                    onEdit={handleEditAssignment}
                />


                {/* ======================================= */}
                {/* ELIMINACIÓN */}
                {/* ======================================= */}

                <VolunteerDeleteModal
                    isOpen={activeModal === "delete"}
                    assignment={selectedAssignment}
                    volunteers={volunteers}
                    onClose={handleCloseModal}
                    onConfirm={handleConfirmDelete}
                />

            </div>

        </main>
    );
}

export default VolunteersManagement;



