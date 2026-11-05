// =========================================================
// IMPORTACIONES
// =========================================================

import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    X,
    Trash2,
    AlertTriangle,
    CalendarDays,
    Clock3,
    UsersRound,
    ClipboardList,
    LoaderCircle,
} from "lucide-react";

import { VOLUNTEER_TEAMS } from "./VolunteersTeams";

import "../../../styles/components/administration/volunteers/VolunteerDeleteModal.css";


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
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date);
}


// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function VolunteerDeleteModal({
    isOpen = false,
    assignment = null,
    volunteers = [],
    onClose,
    onConfirm,
}) {

    // =====================================================
    // ESTADOS
    // =====================================================

    const [isDeleting, setIsDeleting] = useState(false);

    const [error, setError] = useState("");


    // =====================================================
    // REFERENCIAS
    // =====================================================

    const dialogRef = useRef(null);

    const cancelButtonRef = useRef(null);

    const isDeletingRef = useRef(false);


    // =====================================================
    // REINICIAR ESTADO
    // =====================================================

    useEffect(() => {

        if (isOpen && assignment) {

            setError("");
            setIsDeleting(false);
            isDeletingRef.current = false;

        }

    }, [isOpen, assignment]);


    // =====================================================
    // CONTROL DEL MODAL
    // =====================================================

    useEffect(() => {

        if (!isOpen || !assignment) {
            return;
        }

        const previousOverflow = document.body.style.overflow;

        const previousActiveElement = document.activeElement;

        document.body.style.overflow = "hidden";

        cancelButtonRef.current?.focus();


        // ================================================
        // NAVEGACIÓN POR TECLADO
        // ================================================

        const handleKeyDown = (event) => {

            if (event.key === "Escape") {

                if (!isDeletingRef.current) {
                    onClose?.();
                }

                return;
            }

            if (event.key !== "Tab") {
                return;
            }

            const focusableElements =
                dialogRef.current?.querySelectorAll(
                    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
                );

            if (!focusableElements?.length) {

                event.preventDefault();

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

        };

        document.addEventListener("keydown", handleKeyDown);


        // ================================================
        // LIMPIEZA
        // ================================================

        return () => {

            document.body.style.overflow = previousOverflow;

            document.removeEventListener("keydown", handleKeyDown);

            if (previousActiveElement?.isConnected) {
                previousActiveElement.focus();
            }

        };

    }, [isOpen, assignment, onClose]);


    // =====================================================
    // CERRAR MODAL
    // =====================================================

    const handleClose = () => {

        if (isDeletingRef.current) {
            return;
        }

        onClose?.();

    };


    // =====================================================
    // CONFIRMAR ELIMINACIÓN
    // =====================================================

    const handleConfirm = async () => {

        if (
            isDeletingRef.current ||
            !assignment ||
            !onConfirm
        ) {
            return;
        }

        isDeletingRef.current = true;

        setIsDeleting(true);
        setError("");

        try {

            // El componente padre se encarga de eliminar
            // el registro y cerrar el modal al finalizar.

            await onConfirm(assignment);

        } catch (deleteError) {

            setError(
                deleteError?.message ||
                "No fue posible eliminar la asignación. Inténtalo nuevamente."
            );

        } finally {

            isDeletingRef.current = false;

            setIsDeleting(false);

        }

    };


    // =====================================================
    // VALIDAR VISIBILIDAD
    // =====================================================

    if (!isOpen || !assignment) {
        return null;
    }


    // =====================================================
    // INFORMACIÓN DE LA ASIGNACIÓN
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
    // IDENTIFICAR EQUIPO
    // =====================================================

    const team = VOLUNTEER_TEAMS.find(
        (item) => item.id === assignment.teamId
    );

    const teamName =
        team?.name || "Equipo de servicio";


    // =====================================================
    // IDENTIFICAR VOLUNTARIO
    // =====================================================

    const volunteer = volunteers.find(
        (item) =>
            String(item.id) === String(assignment.volunteerId)
    );

    const volunteerName = (assignment.participants || []).length > 1
        ? `${assignment.participants.length} voluntarios asignados`
        : assignment.volunteerId == null
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
    // INTERFAZ
    // =====================================================

    return (
        <div
            className="volunteer-delete-modal__overlay"
            onMouseDown={(event) => {

                if (event.target === event.currentTarget) {
                    handleClose();
                }

            }}
        >

            <div
                ref={dialogRef}
                className="volunteer-delete-modal"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="volunteer-delete-modal-title"
                aria-describedby="volunteer-delete-modal-description"
                aria-busy={isDeleting}
            >

                {/* ======================================= */}
                {/* ENCABEZADO */}
                {/* ======================================= */}

                <div className="volunteer-delete-modal__header">

                    <div className="volunteer-delete-modal__heading">

                        <div className="volunteer-delete-modal__heading-icon">

                            <Trash2
                                size={22}
                                strokeWidth={1.8}
                                aria-hidden="true"
                            />

                        </div>

                        <div>

                            <h2 id="volunteer-delete-modal-title">
                                Eliminar asignación
                            </h2>

                            <p>
                                Confirmación de eliminación
                            </p>

                        </div>

                    </div>


                    {/* BOTÓN CERRAR */}

                    <button
                        type="button"
                        className="volunteer-delete-modal__close"
                        onClick={handleClose}
                        disabled={isDeleting}
                        aria-label="Cerrar confirmación"
                    >
                        <X
                            size={21}
                            aria-hidden="true"
                        />
                    </button>

                </div>


                {/* ======================================= */}
                {/* CUERPO */}
                {/* ======================================= */}

                <div className="volunteer-delete-modal__body">

                    {/* =================================== */}
                    {/* ADVERTENCIA */}
                    {/* =================================== */}

                    <div className="volunteer-delete-modal__warning">

                        <div className="volunteer-delete-modal__warning-icon">

                            <AlertTriangle
                                size={23}
                                aria-hidden="true"
                            />

                        </div>

                        <div>

                            <h3>
                                ¿Deseas eliminar esta asignación?
                            </h3>

                            <p id="volunteer-delete-modal-description">
                                Esta acción quitará este servicio del
                                calendario y de los turnos de todos
                                sus voluntarios asignados.
                            </p>

                        </div>

                    </div>


                    {/* =================================== */}
                    {/* RESUMEN DE LA ASIGNACIÓN */}
                    {/* =================================== */}

                    <div className="volunteer-delete-modal__summary">

                        <div className="volunteer-delete-modal__summary-heading">

                            <ClipboardList
                                size={18}
                                aria-hidden="true"
                            />

                            <h3>
                                Asignación seleccionada
                            </h3>

                        </div>


                        {/* EQUIPO */}

                        <span className="volunteer-delete-modal__team">
                            {teamName}
                        </span>


                        {/* RESPONSABILIDAD */}

                        <h4>
                            {assignmentTitle}
                        </h4>


                        {/* DATOS */}

                        <div className="volunteer-delete-modal__metadata">

                            <div>

                                <UsersRound
                                    size={17}
                                    aria-hidden="true"
                                />

                                <span>
                                    {volunteerName}
                                </span>

                            </div>


                            <div>

                                <CalendarDays
                                    size={17}
                                    aria-hidden="true"
                                />

                                <span>
                                    {assignmentDate}
                                </span>

                            </div>


                            <div>

                                <Clock3
                                    size={17}
                                    aria-hidden="true"
                                />

                                <span>
                                    {assignmentTime}
                                </span>

                            </div>

                        </div>

                    </div>


                    {/* =================================== */}
                    {/* INFORMACIÓN ADICIONAL */}
                    {/* =================================== */}

                    <p className="volunteer-delete-modal__notice">
                        Se eliminarán las asignaciones de todos los participantes de este servicio.
                        Ninguna cuenta de miembro ni equipo de servicio será eliminado.
                    </p>


                    {/* =================================== */}
                    {/* ERROR DE ELIMINACIÓN */}
                    {/* =================================== */}

                    {error && (

                        <div
                            className="volunteer-delete-modal__error"
                            role="alert"
                        >

                            <AlertTriangle
                                size={17}
                                aria-hidden="true"
                            />

                            <span>
                                {error}
                            </span>

                        </div>

                    )}

                </div>


                {/* ======================================= */}
                {/* PIE DEL MODAL */}
                {/* ======================================= */}

                <div className="volunteer-delete-modal__footer">

                    <button
                        ref={cancelButtonRef}
                        type="button"
                        className="volunteer-delete-modal__cancel"
                        onClick={handleClose}
                        disabled={isDeleting}
                    >
                        Cancelar
                    </button>


                    <button
                        type="button"
                        className="volunteer-delete-modal__confirm"
                        onClick={handleConfirm}
                        disabled={isDeleting || !onConfirm}
                    >

                        {isDeleting ? (

                            <LoaderCircle
                                size={17}
                                className="volunteer-delete-modal__spinner"
                                aria-hidden="true"
                            />

                        ) : (

                            <Trash2
                                size={17}
                                aria-hidden="true"
                            />

                        )}

                        {isDeleting
                            ? "Eliminando..."
                            : "Eliminar asignación"}

                    </button>

                </div>

            </div>

        </div>
    );
}

export default VolunteerDeleteModal;