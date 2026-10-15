// =========================================================
// IMPORTACIONES
// =========================================================

import {
    useEffect,
    useState,
} from "react";

import {
    X,
    ClipboardList,
    UsersRound,
    CalendarDays,
    MapPin,
    FileText,
    Save,
    Info,
    Link2,
} from "lucide-react";

import { VOLUNTEER_TEAMS } from "./VolunteersTeams";

import "../../../styles/components/administration/volunteers/VolunteerAssignmentFormModal.css";


// =========================================================
// CONFIGURACIÓN INICIAL
// =========================================================

const INITIAL_FORM = {
    teamId: "",
    volunteerId: "",
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    eventId: "",
    notes: "",
    status: "pending",
};


// =========================================================
// OPCIONES DE ESTADO
// =========================================================

const STATUS_OPTIONS = [
    {
        value: "pending",
        label: "Pendiente de confirmación",
    },
    {
        value: "confirmed",
        label: "Confirmado",
    },
    {
        value: "declined",
        label: "No disponible",
    },
    {
        value: "cancelled",
        label: "Cancelado",
    },
];


// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function VolunteerAssignmentFormModal({
    isOpen = false,
    assignment = null,
    volunteers = [],
    events = [],
    assignments = [],
    onClose,
    onSave,
}) {

    // =====================================================
    // ESTADOS
    // =====================================================

    const [formData, setFormData] = useState(INITIAL_FORM);

    const [errors, setErrors] = useState({});

    const [isSubmitting, setIsSubmitting] = useState(false);


    // =====================================================
    // IDENTIFICAR MODO DEL FORMULARIO
    // =====================================================

    const isEditing = Boolean(assignment);


    // =====================================================
    // CARGAR DATOS AL ABRIR
    // =====================================================

    useEffect(() => {

        if (!isOpen) {
            return;
        }

        if (assignment) {

            setFormData({
                teamId: assignment.teamId || "",
                volunteerId: assignment.volunteerId || "",
                title: assignment.title || "",
                description: assignment.description || "",
                date: assignment.date || "",
                startTime: assignment.startTime || "",
                endTime: assignment.endTime || "",
                location: assignment.location || "",
                eventId: assignment.eventId || "",
                notes: assignment.notes || "",
                status: assignment.status || "pending",
            });

        } else {

            setFormData({
                ...INITIAL_FORM,
            });

        }

        setErrors({});
        setIsSubmitting(false);

    }, [isOpen, assignment]);


    // =====================================================
    // BLOQUEAR SCROLL Y CERRAR CON ESCAPE
    // =====================================================

    useEffect(() => {

        if (!isOpen) {
            return;
        }

        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = "hidden";

        const handleKeyDown = (event) => {

            if (event.key === "Escape" && !isSubmitting) {
                onClose?.();
            }

        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleKeyDown);
        };

    }, [isOpen, isSubmitting, onClose]);


    // =====================================================
    // FILTRAR VOLUNTARIOS POR EQUIPO
    // =====================================================

    const availableVolunteers = volunteers.filter(
        (volunteer) => {

            if (volunteer.status !== "active") {
                return false;
            }

            if (!formData.teamId) {
                return false;
            }

            return (
                Array.isArray(volunteer.teams) &&
                volunteer.teams.includes(formData.teamId)
            );

        }
    );


    // =====================================================
    // CAMBIOS DEL FORMULARIO
    // =====================================================

    const handleChange = (event) => {

        const { name, value } = event.target;

        setFormData((previous) => {

            const updated = {
                ...previous,
                [name]: value,
            };

            // Al cambiar de equipo, limpiamos el voluntario
            // para evitar asignaciones incompatibles.

            if (name === "teamId") {
                updated.volunteerId = "";
            }

            // Una asignación sin voluntario no puede estar
            // confirmada ni rechazada por una persona.

            if (
                name === "volunteerId" &&
                value === ""
            ) {
                updated.status = "pending";
            }

            return updated;

        });

        setErrors((previous) => ({
            ...previous,
            [name]: "",
        }));

    };


    // =====================================================
    // VALIDACIONES
    // =====================================================

    const validateForm = () => {

        const newErrors = {};

        if (!formData.teamId) {
            newErrors.teamId = "Selecciona un equipo de servicio.";
        }

        if (!formData.title.trim()) {
            newErrors.title = "Ingresa el nombre de la responsabilidad.";
        }

        if (!formData.date) {
            newErrors.date = "Selecciona una fecha.";
        }

        if (!formData.startTime) {
            newErrors.startTime = "Indica la hora de inicio.";
        }

        if (!formData.endTime) {
            newErrors.endTime = "Indica la hora de término.";
        }

        if (
            formData.startTime &&
            formData.endTime &&
            formData.endTime <= formData.startTime
        ) {
            newErrors.endTime =
                "La hora de término debe ser posterior al inicio.";
        }

        if (
            formData.volunteerId &&
            !availableVolunteers.some(
                (volunteer) =>
                    String(volunteer.id) ===
                    String(formData.volunteerId)
            )
        ) {
            newErrors.volunteerId =
                "Selecciona un voluntario activo del equipo.";
        }

        if (
            !formData.volunteerId &&
            ["confirmed", "declined"].includes(formData.status)
        ) {
            newErrors.status =
                "Debes seleccionar un voluntario para este estado.";
        }

        // Evitar que una persona tenga dos responsabilidades
        // con horarios superpuestos el mismo día.

        if (
            formData.volunteerId &&
            formData.date &&
            formData.startTime &&
            formData.endTime &&
            formData.endTime > formData.startTime &&
            formData.status !== "cancelled"
        ) {

            const hasConflict = assignments.some((item) => {

                if (
                    String(item.id) === String(assignment?.id)
                ) {
                    return false;
                }

                if (item.status === "cancelled") {
                    return false;
                }

                if (
                    String(item.volunteerId) !==
                    String(formData.volunteerId)
                ) {
                    return false;
                }

                if (item.date !== formData.date) {
                    return false;
                }

                if (!item.startTime || !item.endTime) {
                    return false;
                }

                return (
                    formData.startTime < item.endTime &&
                    formData.endTime > item.startTime
                );

            });

            if (hasConflict) {
                newErrors.volunteerId =
                    "Este voluntario ya tiene una asignación en ese horario.";
            }

        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;

    };


    // =====================================================
    // GUARDAR ASIGNACIÓN
    // =====================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        if (isSubmitting || !onSave) {
            return;
        }

        if (!validateForm()) {
            return;
        }

        const payload = {
            ...formData,

            volunteerId: formData.volunteerId || null,
            eventId: formData.eventId || null,

            title: formData.title.trim(),
            description: formData.description.trim(),
            location: formData.location.trim(),
            notes: formData.notes.trim(),
        };

        setIsSubmitting(true);

        try {

            // El componente padre realizará la creación
            // o actualización del registro.

            await onSave(payload, assignment);

            // El cierre lo controla el componente padre,
            // una vez confirmada la operación.

        } catch (error) {

            setErrors((previous) => ({
                ...previous,
                submit:
                    error?.message ||
                    "No fue posible guardar la asignación.",
            }));

        } finally {

            setIsSubmitting(false);

        }

    };


    // =====================================================
    // CERRAR MODAL
    // =====================================================

    const handleClose = () => {

        if (isSubmitting) {
            return;
        }

        onClose?.();

    };


    // =====================================================
    // NO MOSTRAR SI ESTÁ CERRADO
    // =====================================================

    if (!isOpen) {
        return null;
    }


    // =====================================================
    // INTERFAZ
    // =====================================================

    return (
        <div
            className="volunteer-assignment-form__overlay"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    handleClose();
                }
            }}
        >

            <div
                className="volunteer-assignment-form"
                role="dialog"
                aria-modal="true"
                aria-labelledby="volunteer-assignment-form-title"
            >

                {/* ======================================= */}
                {/* ENCABEZADO */}
                {/* ======================================= */}

                <div className="volunteer-assignment-form__header">

                    <div className="volunteer-assignment-form__heading">

                        <div className="volunteer-assignment-form__heading-icon">

                            <ClipboardList
                                size={23}
                                strokeWidth={1.8}
                                aria-hidden="true"
                            />

                        </div>

                        <div>

                            <h2 id="volunteer-assignment-form-title">
                                {isEditing
                                    ? "Editar asignación"
                                    : "Nueva asignación"}
                            </h2>

                            <p>
                                {isEditing
                                    ? "Actualiza los datos del turno de servicio."
                                    : "Organiza una nueva responsabilidad para el equipo."}
                            </p>

                        </div>

                    </div>

                    <button
                        type="button"
                        className="volunteer-assignment-form__close"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        aria-label="Cerrar formulario"
                    >
                        <X size={21} />
                    </button>

                </div>


                {/* ======================================= */}
                {/* FORMULARIO */}
                {/* ======================================= */}

                <form
                    className="volunteer-assignment-form__body"
                    onSubmit={handleSubmit}
                    noValidate
                >

                    {/* =================================== */}
                    {/* SECCIÓN: RESPONSABILIDAD */}
                    {/* =================================== */}

                    <div className="volunteer-assignment-form__section">

                        <div className="volunteer-assignment-form__section-title">

                            <ClipboardList size={18} />

                            <h3>Responsabilidad de servicio</h3>

                        </div>


                        {/* NOMBRE */}

                        <div className="volunteer-assignment-form__field">

                            <label htmlFor="volunteer-assignment-title">
                                Nombre de la responsabilidad
                                <span> *</span>
                            </label>

                            <input
                                id="volunteer-assignment-title"
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Ej. Alabanza - Culto general"
                                maxLength={120}
                                aria-invalid={Boolean(errors.title)}
                                required
                            />

                            {errors.title && (
                                <span className="volunteer-assignment-form__error">
                                    {errors.title}
                                </span>
                            )}

                        </div>


                        {/* DESCRIPCIÓN */}

                        <div className="volunteer-assignment-form__field">

                            <label htmlFor="volunteer-assignment-description">
                                Descripción
                            </label>

                            <textarea
                                id="volunteer-assignment-description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe brevemente la responsabilidad..."
                                rows={3}
                                maxLength={500}
                            />

                        </div>

                    </div>


                    {/* =================================== */}
                    {/* SECCIÓN: EQUIPO Y VOLUNTARIO */}
                    {/* =================================== */}

                    <div className="volunteer-assignment-form__section">

                        <div className="volunteer-assignment-form__section-title">

                            <UsersRound size={18} />

                            <h3>Equipo y voluntario</h3>

                        </div>


                        <div className="volunteer-assignment-form__grid">

                            {/* EQUIPO */}

                            <div className="volunteer-assignment-form__field">

                                <label htmlFor="volunteer-assignment-team">
                                    Equipo de servicio
                                    <span> *</span>
                                </label>

                                <select
                                    id="volunteer-assignment-team"
                                    name="teamId"
                                    value={formData.teamId}
                                    onChange={handleChange}
                                    aria-invalid={Boolean(errors.teamId)}
                                    required
                                >

                                    <option value="">
                                        Seleccionar equipo
                                    </option>

                                    {VOLUNTEER_TEAMS.map((team) => (

                                        <option
                                            key={team.id}
                                            value={team.id}
                                        >
                                            {team.name}
                                        </option>

                                    ))}

                                </select>

                                {errors.teamId && (
                                    <span className="volunteer-assignment-form__error">
                                        {errors.teamId}
                                    </span>
                                )}

                            </div>


                            {/* VOLUNTARIO */}

                            <div className="volunteer-assignment-form__field">

                                <label htmlFor="volunteer-assignment-volunteer">
                                    Voluntario responsable
                                </label>

                                <select
                                    id="volunteer-assignment-volunteer"
                                    name="volunteerId"
                                    value={formData.volunteerId}
                                    onChange={handleChange}
                                    disabled={!formData.teamId}
                                    aria-invalid={Boolean(errors.volunteerId)}
                                >

                                    <option value="">
                                        Sin voluntario asignado
                                    </option>

                                    {availableVolunteers.map((volunteer) => (

                                        <option
                                            key={volunteer.id}
                                            value={volunteer.id}
                                        >

                                            {volunteer.name ||
                                                [
                                                    volunteer.firstName,
                                                    volunteer.lastName,
                                                ]
                                                    .filter(Boolean)
                                                    .join(" ")}

                                        </option>

                                    ))}

                                </select>

                                {errors.volunteerId && (
                                    <span className="volunteer-assignment-form__error">
                                        {errors.volunteerId}
                                    </span>
                                )}

                            </div>

                        </div>


                        <div className="volunteer-assignment-form__hint">

                            <Info size={15} />

                            <p>
                                Solo se muestran los voluntarios activos
                                que pertenecen al equipo seleccionado.
                                Puedes dejar un turno sin asignar y
                                completarlo posteriormente.
                            </p>

                        </div>

                    </div>


                    {/* =================================== */}
                    {/* SECCIÓN: FECHA Y HORARIO */}
                    {/* =================================== */}

                    <div className="volunteer-assignment-form__section">

                        <div className="volunteer-assignment-form__section-title">

                            <CalendarDays size={18} />

                            <h3>Fecha y horario</h3>

                        </div>

                        <div className="volunteer-assignment-form__grid">

                            {/* FECHA */}

                            <div className="volunteer-assignment-form__field">

                                <label htmlFor="volunteer-assignment-date">
                                    Fecha del servicio
                                    <span> *</span>
                                </label>

                                <input
                                    id="volunteer-assignment-date"
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    aria-invalid={Boolean(errors.date)}
                                    required
                                />

                                {errors.date && (
                                    <span className="volunteer-assignment-form__error">
                                        {errors.date}
                                    </span>
                                )}

                            </div>


                            {/* LUGAR */}

                            <div className="volunteer-assignment-form__field">

                                <label htmlFor="volunteer-assignment-location">
                                    Lugar o modalidad
                                </label>

                                <div className="volunteer-assignment-form__input-icon">

                                    <MapPin size={17} />

                                    <input
                                        id="volunteer-assignment-location"
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        placeholder="Ej. Iglesia / Online"
                                        maxLength={150}
                                    />

                                </div>

                            </div>


                            {/* HORA INICIO */}

                            <div className="volunteer-assignment-form__field">

                                <label htmlFor="volunteer-assignment-start">
                                    Hora de inicio
                                    <span> *</span>
                                </label>

                                <input
                                    id="volunteer-assignment-start"
                                    type="time"
                                    name="startTime"
                                    value={formData.startTime}
                                    onChange={handleChange}
                                    aria-invalid={Boolean(errors.startTime)}
                                    required
                                />

                                {errors.startTime && (
                                    <span className="volunteer-assignment-form__error">
                                        {errors.startTime}
                                    </span>
                                )}

                            </div>


                            {/* HORA TÉRMINO */}

                            <div className="volunteer-assignment-form__field">

                                <label htmlFor="volunteer-assignment-end">
                                    Hora de término
                                    <span> *</span>
                                </label>

                                <input
                                    id="volunteer-assignment-end"
                                    type="time"
                                    name="endTime"
                                    value={formData.endTime}
                                    onChange={handleChange}
                                    aria-invalid={Boolean(errors.endTime)}
                                    required
                                />

                                {errors.endTime && (
                                    <span className="volunteer-assignment-form__error">
                                        {errors.endTime}
                                    </span>
                                )}

                            </div>

                        </div>

                    </div>


                    {/* =================================== */}
                    {/* SECCIÓN: EVENTO ASOCIADO */}
                    {/* =================================== */}

                    <div className="volunteer-assignment-form__section">

                        <div className="volunteer-assignment-form__section-title">

                            <Link2 size={18} />

                            <h3>Actividad o evento asociado</h3>

                        </div>

                        <div className="volunteer-assignment-form__field">

                            <label htmlFor="volunteer-assignment-event">
                                Vincular con un evento
                            </label>

                            <select
                                id="volunteer-assignment-event"
                                name="eventId"
                                value={formData.eventId}
                                onChange={handleChange}
                            >

                                <option value="">
                                    Sin evento asociado
                                </option>

                                {events.map((event) => (

                                    <option
                                        key={event.id}
                                        value={event.id}
                                    >

                                        {event.title || event.name}

                                    </option>

                                ))}

                            </select>

                        </div>

                        <div className="volunteer-assignment-form__hint">

                            <Info size={15} />

                            <p>
                                Esta vinculación es opcional.
                                Posteriormente permitirá relacionar
                                los turnos con las actividades
                                registradas en Gestión de Eventos.
                            </p>

                        </div>

                    </div>


                    {/* =================================== */}
                    {/* SECCIÓN: INSTRUCCIONES */}
                    {/* =================================== */}

                    <div className="volunteer-assignment-form__section">

                        <div className="volunteer-assignment-form__section-title">

                            <FileText size={18} />

                            <h3>Instrucciones y confirmación</h3>

                        </div>


                        {/* INSTRUCCIONES */}

                        <div className="volunteer-assignment-form__field">

                            <label htmlFor="volunteer-assignment-notes">
                                Indicaciones para el voluntario
                            </label>

                            <textarea
                                id="volunteer-assignment-notes"
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder="Ej. Llegar 30 minutos antes para preparar los materiales..."
                                rows={4}
                                maxLength={1000}
                            />

                        </div>


                        {/* ESTADO */}

                        <div className="volunteer-assignment-form__field">

                            <label htmlFor="volunteer-assignment-status">
                                Estado de la asignación
                            </label>

                            <select
                                id="volunteer-assignment-status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                aria-invalid={Boolean(errors.status)}
                            >

                                {STATUS_OPTIONS.map((option) => (

                                    <option
                                        key={option.value}
                                        value={option.value}
                                        disabled={
                                            !formData.volunteerId &&
                                            ["confirmed", "declined"].includes(
                                                option.value
                                            )
                                        }
                                    >
                                        {option.label}
                                    </option>

                                ))}

                            </select>

                            {errors.status && (
                                <span className="volunteer-assignment-form__error">
                                    {errors.status}
                                </span>
                            )}

                        </div>

                    </div>


                    {/* =================================== */}
                    {/* ERROR GENERAL */}
                    {/* =================================== */}

                    {errors.submit && (

                        <div
                            className="volunteer-assignment-form__submit-error"
                            role="alert"
                        >
                            <AlertIcon />

                            {errors.submit}
                        </div>

                    )}


                    {/* =================================== */}
                    {/* ACCIONES */}
                    {/* =================================== */}

                    <div className="volunteer-assignment-form__footer">

                        <button
                            type="button"
                            className="volunteer-assignment-form__cancel"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="volunteer-assignment-form__save"
                            disabled={isSubmitting || !onSave}
                        >

                            <Save
                                size={17}
                                aria-hidden="true"
                            />

                            {isSubmitting
                                ? "Guardando..."
                                : isEditing
                                    ? "Guardar cambios"
                                    : "Crear asignación"}

                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}


// =========================================================
// ICONO DE ERROR
// =========================================================

function AlertIcon() {
    return (
        <Info
            size={17}
            aria-hidden="true"
        />
    );
}

export default VolunteerAssignmentFormModal;