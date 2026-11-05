// =========================================================
// MODAL COMPACTO: CREAR / EDITAR LOS DATOS DEL SERVICIO
// Los participantes se gestionan en otro modal, sin duplicar
// ni perder las confirmaciones guardadas en MongoDB.
// =========================================================
import { useEffect, useRef, useState } from "react";
import { X, ClipboardList, CalendarDays, Clock3, Save, ChevronDown, Info } from "lucide-react";
import { VOLUNTEER_TEAMS } from "./VolunteersTeams";
import "../../../styles/components/administration/volunteers/VolunteerAssignmentFormModal.css";
import "../../../styles/components/administration/volunteers/VolunteerServiceFormCompact.css";

// La edición solo contiene información del SERVICIO.
const EMPTY_SERVICE = {
  title: "", description: "", teamId: "", date: "", startTime: "", endTime: "",
  location: "", activityId: "", notes: "", status: "pending",
};

function VolunteerAssignmentFormModal({
  isOpen = false,
  assignment = null,
  activities = [],
  onClose,
  onSave,
}) {
  const [form, setForm] = useState(EMPTY_SERVICE);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const closeRef = useRef(null);
  const dialogRef = useRef(null);
  const editing = Boolean(assignment);

  // Al abrir, recuperamos los detalles actuales o inicializamos el servicio.
  useEffect(() => {
    if (!isOpen) return;
    setForm(assignment ? {
      title: assignment.title || "",
      description: assignment.description || "",
      teamId: assignment.teamId || "",
      date: assignment.date || "",
      startTime: assignment.startTime || "",
      endTime: assignment.endTime || "",
      location: assignment.location || "",
      activityId: assignment.activityId || "",
      notes: assignment.notes || "",
      status: assignment.serviceStatus || (assignment.status === "cancelled" ? "cancelled" : "pending"),
    } : { ...EMPTY_SERVICE });
    setSaving(false);
    setErrors({});
  }, [isOpen, assignment]);

  // Evitamos desplazamientos del fondo y conservamos la navegación por teclado.
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !saving) onClose?.();
      if (event.key !== "Tab" || !dialogRef.current) return;
      const items = [...dialogRef.current.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary')]
        .filter((item) => item.getClientRects().length > 0);
      if (!items.length) return;
      if (event.shiftKey && document.activeElement === items[0]) {
        event.preventDefault(); items[items.length - 1].focus();
      } else if (!event.shiftKey && document.activeElement === items[items.length - 1]) {
        event.preventDefault(); items[0].focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [isOpen, saving, onClose]);

  // Conservamos los otros campos; cambiar la fecha invalida solo el evento asociado.
  const update = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
      ...(name === "date" ? { activityId: "" } : {}),
    }));
    setErrors((previous) => ({ ...previous, [name]: "", submit: "" }));
  };

  async function submit(event) {
    event.preventDefault();
    if (saving || !onSave) return;
    const next = {};
    if (!form.teamId) next.teamId = "Selecciona un equipo.";
    if (form.title.trim().length < 3 || form.title.trim().length > 120) next.title = "Escribe entre 3 y 120 caracteres.";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date)) next.date = "Selecciona una fecha válida.";
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(form.startTime)) next.startTime = "Indica una hora de inicio.";
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(form.endTime) || form.endTime <= form.startTime) {
      next.endTime = "El término debe ser posterior al inicio.";
    }
    if (Object.keys(next).length) { setErrors(next); return; }

    setSaving(true);
    try {
      // La API de servicios nunca recibe IDs ni cupos de los participantes.
      await onSave({
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        notes: form.notes.trim(),
        activityId: form.activityId || null,
      }, assignment);
    } catch (error) {
      setErrors({ submit: error?.message || "No se pudo guardar el servicio." });
    } finally { setSaving(false); }
  }

  if (!isOpen) return null;

  return (
    <div className="volunteer-assignment-form__overlay" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !saving) onClose?.();
    }}>
      <section ref={dialogRef} className="volunteer-assignment-form volunteer-service-modal"
        role="dialog" aria-modal="true" aria-labelledby="volunteer-assignment-form-title" aria-busy={saving}>
        <div className="volunteer-assignment-form__header">
          <div className="volunteer-assignment-form__heading">
            <div className="volunteer-assignment-form__heading-icon"><ClipboardList size={23} /></div>
            <div>
              <h2 id="volunteer-assignment-form-title">{editing ? "Editar servicio" : "Nuevo servicio"}</h2>
              <p>{editing ? "Modifica los datos del turno, sin alterar sus participantes." : "Programa el servicio; después podrás asignar voluntarios."}</p>
            </div>
          </div>
          <button ref={closeRef} type="button" className="volunteer-assignment-form__close"
            disabled={saving} onClick={() => onClose?.()} aria-label="Cerrar formulario"><X size={21} /></button>
        </div>

        <form className="volunteer-service-modal__form" onSubmit={submit} noValidate>
          <div className="volunteer-service-modal__body">
            <div className="volunteer-service-modal__field">
              <label htmlFor="service-title">Responsabilidad de servicio *</label>
              <input id="service-title" name="title" type="text" maxLength={120} value={form.title}
                onChange={update} placeholder="Ej. Alabanza del domingo" aria-invalid={Boolean(errors.title)} />
              {errors.title && <small className="volunteer-service-modal__error">{errors.title}</small>}
            </div>

            <div className="volunteer-service-modal__field">
              <label htmlFor="service-team">Equipo de servicio *</label>
              <select id="service-team" name="teamId" value={form.teamId} onChange={update}
                aria-invalid={Boolean(errors.teamId)}>
                <option value="">Selecciona un equipo</option>
                {VOLUNTEER_TEAMS.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
              </select>
              {errors.teamId && <small className="volunteer-service-modal__error">{errors.teamId}</small>}
              {editing && (assignment.participants || []).length > 0 &&
                form.teamId && form.teamId !== assignment.teamId && (
                  <small className="volunteer-service-modal__error">
                    Antes de cambiar el equipo, retira o reasigna los participantes desde «Gestionar voluntarios».
                  </small>
                )}
            </div>

            <div className="volunteer-service-modal__section-title"><CalendarDays size={16} /> Fecha y horario</div>
            <div className="volunteer-service-modal__grid volunteer-service-modal__grid--three">
              <div className="volunteer-service-modal__field">
                <label htmlFor="service-date">Fecha *</label>
                <input id="service-date" name="date" type="date" value={form.date} onChange={update}
                  aria-invalid={Boolean(errors.date)} />
                {errors.date && <small className="volunteer-service-modal__error">{errors.date}</small>}
              </div>
              <div className="volunteer-service-modal__field">
                <label htmlFor="service-start">Desde *</label>
                <input id="service-start" name="startTime" type="time" value={form.startTime} onChange={update}
                  aria-invalid={Boolean(errors.startTime)} />
                {errors.startTime && <small className="volunteer-service-modal__error">{errors.startTime}</small>}
              </div>
              <div className="volunteer-service-modal__field">
                <label htmlFor="service-end">Hasta *</label>
                <input id="service-end" name="endTime" type="time" value={form.endTime} onChange={update}
                  aria-invalid={Boolean(errors.endTime)} />
                {errors.endTime && <small className="volunteer-service-modal__error">{errors.endTime}</small>}
              </div>
            </div>

            <details className="volunteer-service-modal__details">
              <summary><span><ClipboardList size={16} /> Detalles opcionales</span><ChevronDown size={16} /></summary>
              <div className="volunteer-service-modal__extra">
                <div className="volunteer-service-modal__field">
                  <label htmlFor="service-description">Descripción</label>
                  <textarea id="service-description" name="description" rows={2} maxLength={500}
                    value={form.description} onChange={update} placeholder="¿En qué consiste este servicio?" />
                </div>
                <div className="volunteer-service-modal__field">
                  <label htmlFor="service-location">Lugar o modalidad</label>
                  <input id="service-location" name="location" maxLength={150} value={form.location}
                    onChange={update} placeholder="Ej. Templo / Online" />
                </div>
                <div className="volunteer-service-modal__field">
                  <label htmlFor="service-activity">Actividad interna relacionada</label>
                  <select id="service-activity" name="activityId" value={form.activityId} onChange={update}>
                    <option value="">Sin actividad asociada</option>
                    {activities.filter((activity) => activity.date === form.date || activity.id === form.activityId)
                      .map((activity) => <option key={activity.id} value={activity.id}>{activity.title}</option>)}
                  </select>
                </div>
                <div className="volunteer-service-modal__field">
                  <label htmlFor="service-notes">Indicaciones para los voluntarios</label>
                  <textarea id="service-notes" name="notes" rows={2} maxLength={1000}
                    value={form.notes} onChange={update} placeholder="Ej. Llegar 20 minutos antes..." />
                </div>
              </div>
            </details>

            <div className="volunteer-service-modal__footer-field">
              <div className="volunteer-service-modal__field">
                <label htmlFor="service-status">Estado del servicio</label>
                <select id="service-status" name="status" value={form.status} onChange={update}>
                  <option value="pending">Programado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
              <p><Info size={16} /> Los cupos y los participantes se gestionan por separado.</p>
            </div>
            {errors.submit && <p className="volunteer-service-modal__submit-error" role="alert">{errors.submit}</p>}
          </div>

          <div className="volunteer-service-modal__footer">
            <button type="button" className="volunteer-service-modal__secondary" disabled={saving} onClick={() => onClose?.()}>Cancelar</button>
            <button type="submit" className="volunteer-service-modal__primary" disabled={saving || !onSave}>
              {saving ? <Clock3 size={17} /> : <Save size={17} />}
              {saving ? "Guardando..." : editing ? "Guardar servicio" : "Crear servicio"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default VolunteerAssignmentFormModal;
