
import { useEffect, useId, useState } from "react";

import {
  CalendarDays,
  Check,
  Clock3,
  Info,
  Repeat2,
  Save,
  X,
} from "lucide-react";

import "../../../styles/components/administration/events/EventFormModal.css";

// =========================================================
// CONFIGURACIONES DEL FORMULARIO
// =========================================================

const CATEGORIES = [
  "Culto",
  "Oración",
  "Estudio bíblico",
  "Jóvenes",
  "Niños",
  "Taller",
  "Actividad especial",
  "Otro",
];

const WEEK_DAYS = [
  { value: 1, label: "Lunes", short: "L" },
  { value: 2, label: "Martes", short: "M" },
  { value: 3, label: "Miércoles", short: "X" },
  { value: 4, label: "Jueves", short: "J" },
  { value: 5, label: "Viernes", short: "V" },
  { value: 6, label: "Sábado", short: "S" },
  { value: 0, label: "Domingo", short: "D" },
];

// =========================================================
// ESTADO INICIAL
// =========================================================

function createInitialForm() {
  return {
    title: "",
    description: "",
    category: "Culto",

    date: "",
    time: "",
    endTime: "",

    modality: "Presencial",
    location: "",
    meetingUrl: "",

    recurrence: {
      type: "none",
      daysOfWeek: [],
      endDate: "",
    },

    requiresConfirmation: false,
    capacity: "",

    publicationStatus: "draft",
  };
}

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function EventFormModal({
  isOpen,
  onClose,
  onSave,
  eventToEdit = null,
}) {
  const formId = useId();

  const [form, setForm] = useState(createInitialForm);
  const [errors, setErrors] = useState({});

  const isEditing = Boolean(eventToEdit);

  // =========================================================
  // CARGAR DATOS PARA CREACIÓN O EDICIÓN
  // =========================================================

  useEffect(() => {
    if (!isOpen) return;

    if (eventToEdit) {
      setForm({
        ...createInitialForm(),
        ...eventToEdit,

        recurrence: {
          ...createInitialForm().recurrence,
          ...eventToEdit.recurrence,

          daysOfWeek:
            eventToEdit.recurrence?.daysOfWeek ??
            (
              eventToEdit.recurrence?.type === "weekly" &&
              eventToEdit.recurrence?.dayOfWeek !== undefined
                ? [eventToEdit.recurrence.dayOfWeek]
                : []
            ),
        },

        capacity: eventToEdit.capacity ?? "",
      });
    } else {
      setForm(createInitialForm());
    }

    setErrors({});
  }, [isOpen, eventToEdit]);

  // =========================================================
  // ACTUALIZACIÓN DE CAMPOS
  // =========================================================

  function updateField(name, value) {
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: undefined,
    }));
  }

  function updateRecurrence(name, value) {
    setForm((previous) => ({
      ...previous,

      recurrence: {
        ...previous.recurrence,
        [name]: value,
      },
    }));

    setErrors((previous) => ({
      ...previous,
      recurrence: undefined,
    }));
  }

  // =========================================================
  // SELECCIÓN DE DÍAS SEMANALES
  // =========================================================

  function toggleWeekDay(day) {
    setForm((previous) => {
      const currentDays =
        previous.recurrence.daysOfWeek;

      const updatedDays = currentDays.includes(day)
        ? currentDays.filter((item) => item !== day)
        : [...currentDays, day];

      return {
        ...previous,

        recurrence: {
          ...previous.recurrence,
          daysOfWeek: updatedDays,
        },
      };
    });

    setErrors((previous) => ({
      ...previous,
      recurrence: undefined,
    }));
  }

  // =========================================================
  // VALIDACIONES
  // =========================================================

  function validateForm() {
    const nextErrors = {};

    if (!form.title.trim()) {
      nextErrors.title =
        "Debes ingresar el nombre del evento.";
    }

    if (!form.description.trim()) {
      nextErrors.description =
        "Debes ingresar una descripción.";
    }

    if (!form.date) {
      nextErrors.date =
        "Selecciona la fecha de inicio.";
    }

    if (!form.time) {
      nextErrors.time =
        "Selecciona la hora de inicio.";
    }

    if (
      form.endTime &&
      form.time &&
      form.endTime <= form.time
    ) {
      nextErrors.endTime =
        "La hora de término debe ser posterior al inicio.";
    }

    if (
      form.recurrence.type === "weekly" &&
      form.recurrence.daysOfWeek.length === 0
    ) {
      nextErrors.recurrence =
        "Selecciona al menos un día de repetición.";
    }

    if (
      form.recurrence.type === "weekly" &&
      form.recurrence.endDate &&
      form.date &&
      form.recurrence.endDate < form.date
    ) {
      nextErrors.recurrence =
        "La fecha de término no puede ser anterior al inicio.";
    }

    if (
      form.modality !== "Online" &&
      !form.location.trim()
    ) {
      nextErrors.location =
        "Indica dónde se realizará el evento.";
    }

    if (
      form.modality !== "Presencial" &&
      !form.meetingUrl.trim()
    ) {
      nextErrors.meetingUrl =
        "Ingresa el enlace de acceso.";
    }

    if (
      form.meetingUrl.trim() &&
      form.modality !== "Presencial"
    ) {
      try {
        const url = new URL(form.meetingUrl.trim());

        if (!["https:", "http:"].includes(url.protocol)) {
          nextErrors.meetingUrl =
            "Utiliza un enlace HTTP o HTTPS válido.";
        }
      } catch {
        nextErrors.meetingUrl =
          "Ingresa una URL válida, incluyendo https://.";
      }
    }

    if (
      form.capacity !== "" &&
      (
        !Number.isInteger(Number(form.capacity)) ||
        Number(form.capacity) <= 0
      )
    ) {
      nextErrors.capacity =
        "Los cupos deben ser un número entero positivo.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  // =========================================================
  // GUARDAR
  // =========================================================

  function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) return;

    const isRecurring =
      form.recurrence.type === "weekly";

    const normalizedEvent = {
      ...form,

      title: form.title.trim(),
      description: form.description.trim(),
      location: form.location.trim(),
      meetingUrl: form.meetingUrl.trim(),

      capacity:
        form.capacity === ""
          ? null
          : Number(form.capacity),

      recurrence: isRecurring
        ? {
            type: "weekly",
            daysOfWeek: [
              ...form.recurrence.daysOfWeek,
            ].sort((a, b) => a - b),
            endDate:
              form.recurrence.endDate || null,
          }
        : {
            type: "none",
            daysOfWeek: [],
            endDate: null,
          },
    };

    // La página principal decidirá cómo
    // guardar el evento en su estado local.

    onSave(normalizedEvent);
  }

  // =========================================================
  // CONTROL DE VISIBILIDAD
  // =========================================================

  if (!isOpen) return null;

  // =========================================================
  // INTERFAZ
  // =========================================================

  return (
    <div
      className="event-form-modal__overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="event-form-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${formId}-title`}
      >

        {/* ============================================= */}
        {/* ENCABEZADO */}
        {/* ============================================= */}

        <header className="event-form-modal__header">
          <div className="event-form-modal__header-icon">
            <CalendarDays
              size={24}
              aria-hidden="true"
            />
          </div>

          <div className="event-form-modal__header-content">
            <span>GESTIÓN DE ACTIVIDADES</span>

            <h2 id={`${formId}-title`}>
              {isEditing
                ? "Editar evento"
                : "Nuevo evento"}
            </h2>

            <p>
              {isEditing
                ? "Actualiza la información de esta actividad."
                : "Completa los datos para registrar una nueva actividad."}
            </p>
          </div>

          <button
            className="event-form-modal__close"
            type="button"
            onClick={onClose}
            aria-label="Cerrar formulario"
          >
            <X size={21} />
          </button>
        </header>

        {/* ============================================= */}
        {/* FORMULARIO */}
        {/* ============================================= */}

        <form
          className="event-form-modal__form"
          onSubmit={handleSubmit}
          noValidate
        >

          {/* =========================================== */}
          {/* INFORMACIÓN GENERAL */}
          {/* =========================================== */}

          <section className="event-form-modal__section">
            <div className="event-form-modal__section-heading">
              <Info size={19} aria-hidden="true" />

              <h3>Información general</h3>
            </div>

            <div className="event-form-modal__grid">

              <div className="event-form-modal__field event-form-modal__field--full">
                <label htmlFor={`${formId}-title-input`}>
                  Nombre del evento *
                </label>

                <input
                  id={`${formId}-title-input`}
                  type="text"
                  value={form.title}
                  maxLength={120}
                  onChange={(event) =>
                    updateField("title", event.target.value)
                  }
                  placeholder="Ej. Encuentro de jóvenes"
                  aria-invalid={Boolean(errors.title)}
                />

                {errors.title && (
                  <small className="event-form-modal__error">
                    {errors.title}
                  </small>
                )}
              </div>

              <div className="event-form-modal__field">
                <label htmlFor={`${formId}-category`}>
                  Categoría *
                </label>

                <select
                  id={`${formId}-category`}
                  value={form.category}
                  onChange={(event) =>
                    updateField("category", event.target.value)
                  }
                >
                  {CATEGORIES.map((category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="event-form-modal__field">
                <label htmlFor={`${formId}-status`}>
                  Estado de publicación
                </label>

                <select
                  id={`${formId}-status`}
                  value={form.publicationStatus}
                  onChange={(event) =>
                    updateField(
                      "publicationStatus",
                      event.target.value
                    )
                  }
                >
                  <option value="draft">
                    Borrador
                  </option>

                  <option value="published">
                    Publicado
                  </option>
                </select>
              </div>

              <div className="event-form-modal__field event-form-modal__field--full">
                <label htmlFor={`${formId}-description`}>
                  Descripción *
                </label>

                <textarea
                  id={`${formId}-description`}
                  rows={4}
                  maxLength={2000}
                  value={form.description}
                  onChange={(event) =>
                    updateField(
                      "description",
                      event.target.value
                    )
                  }
                  placeholder="Describe brevemente la actividad..."
                  aria-invalid={Boolean(errors.description)}
                />

                {errors.description && (
                  <small className="event-form-modal__error">
                    {errors.description}
                  </small>
                )}
              </div>

            </div>
          </section>

          {/* =========================================== */}
          {/* FECHA Y RECURRENCIA */}
          {/* =========================================== */}

          <section className="event-form-modal__section">
            <div className="event-form-modal__section-heading">
              <Repeat2 size={19} aria-hidden="true" />

              <h3>Programación del evento</h3>
            </div>

            <div className="event-form-modal__grid">

              <div className="event-form-modal__field event-form-modal__field--full">
                <label htmlFor={`${formId}-recurrence`}>
                  Tipo de evento
                </label>

                <select
                  id={`${formId}-recurrence`}
                  value={form.recurrence.type}
                  onChange={(event) =>
                    updateRecurrence(
                      "type",
                      event.target.value
                    )
                  }
                >
                  <option value="none">
                    Evento único
                  </option>

                  <option value="weekly">
                    Evento recurrente semanal
                  </option>
                </select>
              </div>

              <div className="event-form-modal__field">
                <label htmlFor={`${formId}-date`}>
                  {form.recurrence.type === "weekly"
                    ? "Fecha de inicio *"
                    : "Fecha del evento *"}
                </label>

                <input
                  id={`${formId}-date`}
                  type="date"
                  value={form.date}
                  onChange={(event) =>
                    updateField("date", event.target.value)
                  }
                  aria-invalid={Boolean(errors.date)}
                />

                {errors.date && (
                  <small className="event-form-modal__error">
                    {errors.date}
                  </small>
                )}
              </div>

              <div className="event-form-modal__field">
                <label htmlFor={`${formId}-time`}>
                  Hora de inicio *
                </label>

                <input
                  id={`${formId}-time`}
                  type="time"
                  value={form.time}
                  onChange={(event) =>
                    updateField("time", event.target.value)
                  }
                  aria-invalid={Boolean(errors.time)}
                />

                {errors.time && (
                  <small className="event-form-modal__error">
                    {errors.time}
                  </small>
                )}
              </div>

              <div className="event-form-modal__field">
                <label htmlFor={`${formId}-end-time`}>
                  Hora de término
                </label>

                <input
                  id={`${formId}-end-time`}
                  type="time"
                  value={form.endTime}
                  onChange={(event) =>
                    updateField(
                      "endTime",
                      event.target.value
                    )
                  }
                  aria-invalid={Boolean(errors.endTime)}
                />

                {errors.endTime && (
                  <small className="event-form-modal__error">
                    {errors.endTime}
                  </small>
                )}
              </div>

              {/* RECURRENCIA SEMANAL */}

              {form.recurrence.type === "weekly" && (
                <>
                  <div className="event-form-modal__field event-form-modal__field--full">
                    <label>
                      Días de repetición *
                    </label>

                    <div className="event-form-modal__weekdays">
                      {WEEK_DAYS.map((day) => {
                        const selected =
                          form.recurrence.daysOfWeek.includes(
                            day.value
                          );

                        return (
                          <button
                            key={day.value}
                            type="button"
                            className={
                              selected
                                ? "event-form-modal__weekday event-form-modal__weekday--selected"
                                : "event-form-modal__weekday"
                            }
                            onClick={() =>
                              toggleWeekDay(day.value)
                            }
                            aria-pressed={selected}
                            title={day.label}
                          >
                            {selected ? (
                              <Check
                                size={15}
                                aria-hidden="true"
                              />
                            ) : (
                              day.short
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {errors.recurrence && (
                      <small className="event-form-modal__error">
                        {errors.recurrence}
                      </small>
                    )}
                  </div>

                  <div className="event-form-modal__field event-form-modal__field--full">
                    <label htmlFor={`${formId}-end-date`}>
                      Repetir hasta (opcional)
                    </label>

                    <input
                      id={`${formId}-end-date`}
                      type="date"
                      min={form.date || undefined}
                      value={form.recurrence.endDate}
                      onChange={(event) =>
                        updateRecurrence(
                          "endDate",
                          event.target.value
                        )
                      }
                    />

                    <small className="event-form-modal__hint">
                      Si no indicas una fecha de término,
                      la actividad continuará programada
                      semanalmente.
                    </small>
                  </div>
                </>
              )}

            </div>
          </section>

          {/* =========================================== */}
          {/* MODALIDAD Y UBICACIÓN */}
          {/* =========================================== */}

          <section className="event-form-modal__section">
            <div className="event-form-modal__section-heading">
              <Clock3 size={19} aria-hidden="true" />

              <h3>Modalidad y ubicación</h3>
            </div>

            <div className="event-form-modal__grid">

              <div className="event-form-modal__field event-form-modal__field--full">
                <label htmlFor={`${formId}-modality`}>
                  Modalidad *
                </label>

                <select
                  id={`${formId}-modality`}
                  value={form.modality}
                  onChange={(event) =>
                    updateField(
                      "modality",
                      event.target.value
                    )
                  }
                >
                  <option value="Presencial">
                    Presencial
                  </option>

                  <option value="Online">
                    Online
                  </option>

                  <option value="Híbrida">
                    Híbrida
                  </option>
                </select>
              </div>

              {form.modality !== "Online" && (
                <div className="event-form-modal__field event-form-modal__field--full">
                  <label htmlFor={`${formId}-location`}>
                    Lugar *
                  </label>

                  <input
                    id={`${formId}-location`}
                    type="text"
                    value={form.location}
                    onChange={(event) =>
                      updateField(
                        "location",
                        event.target.value
                      )
                    }
                    placeholder="Ej. Iglesia El Ancla"
                  />

                  {errors.location && (
                    <small className="event-form-modal__error">
                      {errors.location}
                    </small>
                  )}
                </div>
              )}

              {form.modality !== "Presencial" && (
                <div className="event-form-modal__field event-form-modal__field--full">
                  <label htmlFor={`${formId}-url`}>
                    Enlace de reunión *
                  </label>

                  <input
                    id={`${formId}-url`}
                    type="url"
                    value={form.meetingUrl}
                    onChange={(event) =>
                      updateField(
                        "meetingUrl",
                        event.target.value
                      )
                    }
                    placeholder="https://..."
                  />

                  {errors.meetingUrl && (
                    <small className="event-form-modal__error">
                      {errors.meetingUrl}
                    </small>
                  )}
                </div>
              )}

            </div>
          </section>

          {/* =========================================== */}
          {/* ASISTENCIA */}
          {/* =========================================== */}

          <section className="event-form-modal__section">
            <div className="event-form-modal__section-heading">
              <Check size={19} aria-hidden="true" />

              <h3>Confirmación de asistencia</h3>
            </div>

            <label className="event-form-modal__checkbox">
              <input
                type="checkbox"
                checked={form.requiresConfirmation}
                onChange={(event) =>
                  updateField(
                    "requiresConfirmation",
                    event.target.checked
                  )
                }
              />

              <span>
                Permitir que los miembros confirmen
                su asistencia a esta actividad.
              </span>
            </label>

            {form.requiresConfirmation && (
              <div className="event-form-modal__field event-form-modal__capacity">
                <label htmlFor={`${formId}-capacity`}>
                  Cupos disponibles (opcional)
                </label>

                <input
                  id={`${formId}-capacity`}
                  type="number"
                  min="1"
                  step="1"
                  value={form.capacity}
                  onChange={(event) =>
                    updateField(
                      "capacity",
                      event.target.value
                    )
                  }
                  placeholder="Sin límite"
                />

                {errors.capacity && (
                  <small className="event-form-modal__error">
                    {errors.capacity}
                  </small>
                )}
              </div>
            )}
          </section>

          {/* =========================================== */}
          {/* ACCIONES */}
          {/* =========================================== */}

          <footer className="event-form-modal__actions">
            <button
              className="event-form-modal__cancel"
              type="button"
              onClick={onClose}
            >
              Cancelar
            </button>

            <button
              className="event-form-modal__submit"
              type="submit"
            >
              <Save size={18} aria-hidden="true" />

              {isEditing
                ? "Guardar cambios"
                : "Crear evento"}
            </button>
          </footer>

        </form>
      </div>
    </div>
  );
}

export default EventFormModal;
