/* =========================================================
   MODAL DE PETICIONES DE ORACIÓN - IGLESIA EL ANCLA
   Archivo: frontend/src/components/administration/prayers/PrayerRequestDetailsModal.jsx
   Un solo modal permite crear, consultar, editar y dar seguimiento.
========================================================= */

// Hooks de React para formularios y foco.
import { useEffect, useId, useRef, useState } from "react";

// Iconos del diseño actual del panel.
import { CalendarDays, HandHeart, LockKeyhole, Save, ShieldCheck, UserRound, X } from "lucide-react";

// Conservamos el CSS del modal original.
import "../../../styles/components/administration/prayers/PrayerRequestDetailsModal.css";

// Categorías que admite el backend.
const CATEGORIES = ["Salud", "Familia", "Trabajo", "Estudios", "Espiritual", "Personal", "Agradecimiento", "Otro"];

// Estados administrables por la iglesia.
const STATUS_OPTIONS = [
  { value: "pending", label: "Pendiente" },
  { value: "praying", label: "En oración" },
  { value: "answered", label: "Respondida" },
  { value: "completed", label: "Finalizada" },
];

// Formulario nuevo, sin reutilizar un objeto de otra petición.
function emptyForm() {
  return { title: "", description: "", category: "Salud", visibility: "community", anonymous: false, status: "pending", followUpNote: "" };
}

// El servidor envía fechas ISO. Las mostramos en la hora de Chile.
function formatDate(value) {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Fecha no disponible" :
    new Intl.DateTimeFormat("es-CL", { day: "2-digit", month: "long", year: "numeric", timeZone: "America/Santiago" }).format(date);
}

function PrayerRequestDetailsModal({ isOpen, request, onClose, onSave }) {
  // ID único para asociar encabezado y ventana.
  const titleId = useId();

  // Referencia para devolver el foco al cerrar.
  const firstFieldRef = useRef(null);

  // Estado de todos los campos editables.
  const [form, setForm] = useState(emptyForm);

  // Protegemos el guardado contra dobles clics.
  const [isSaving, setIsSaving] = useState(false);

  // Mostramos los errores en el modal, no solo en la consola.
  const [error, setError] = useState("");

  // Un request nulo significa "Crear petición".
  const creating = !request;

  // Actualizamos el formulario cuando cambia la petición seleccionada.
  useEffect(() => {
    if (!isOpen) return;
    setForm(request ? {
      title: request.title || "",
      description: request.description || "",
      category: request.category || "Salud",
      visibility: request.visibility || request.privacy || "community",
      anonymous: Boolean(request.anonymous),
      status: request.status || "pending",
      followUpNote: request.followUpNote || "",
    } : emptyForm());
    setError("");
    setIsSaving(false);
  }, [isOpen, request]);

  // Control del teclado y desplazamiento mientras está abierto.
  useEffect(() => {
    if (!isOpen) return undefined;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstFieldRef.current?.focus();
    const handleEscape = (event) => {
      if (event.key === "Escape" && !isSaving) onClose?.();
    };
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, [isOpen, isSaving, onClose]);

  // Cambiamos solo el campo editado.
  function updateField(key, value) {
    setForm((old) => ({ ...old, [key]: value }));
    setError("");
  }

  // Creamos o actualizamos mediante la función proporcionada por el padre.
  async function handleSubmit(event) {
    event.preventDefault();
    if (isSaving) return;
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      visibility: form.visibility,
      anonymous: form.anonymous,
      // Los estados y notas internas se cambian solo en edición administrativa.
      ...(!creating ? { status: form.status, followUpNote: form.followUpNote.trim() } : {}),
    };
    if (payload.title.length < 3 || payload.description.length < 5) {
      setError("Completa el título y la descripción de la petición.");
      return;
    }
    setIsSaving(true);
    try {
      await onSave?.(request?.id || null, payload);
    } catch (saveError) {
      setError(saveError?.response?.data?.message || saveError?.message || "No se pudieron guardar los cambios.");
    } finally {
      setIsSaving(false);
    }
  }

  // No renderizamos el diálogo mientras está cerrado.
  if (!isOpen) return null;

  return (
    <div className="prayer-details__overlay" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !isSaving) onClose?.();
    }}>
      <section className="prayer-details" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <header className="prayer-details__header">
          <div>
            <span className="prayer-details__eyebrow">ADMINISTRACIÓN / PETICIONES DE ORACIÓN</span>
            <h2 id={titleId}>{creating ? "Nueva petición" : "Detalles y seguimiento"}</h2>
            <p>{creating ? "Registra una petición desde tu cuenta de administrador." : "Consulta la petición y actualiza su estado o contenido."}</p>
          </div>
          <button type="button" className="prayer-details__close" onClick={onClose} disabled={isSaving} aria-label="Cerrar formulario"><X size={20} /></button>
        </header>

        <div className="prayer-details__content">
          {!creating && (
            <div className="prayer-details__information">
              <div className="prayer-details__field">
                <span><UserRound size={15} /> Solicitante</span>
                <strong>{request.requester || "Sin información"}</strong>
                {request.anonymous && <small>Su identidad se oculta a otros miembros.</small>}
              </div>
              <div className="prayer-details__field">
                <span><CalendarDays size={15} /> Fecha de recepción</span>
                <strong>{formatDate(request.date)}</strong>
              </div>
              <div className="prayer-details__field">
                <span><HandHeart size={15} /> Acompañamiento</span>
                <strong>{request.prayerCount || 0} persona(s) orando</strong>
              </div>
              <div className="prayer-details__field">
                <span><LockKeyhole size={15} /> Privacidad</span>
                <strong>{request.visibility === "private" ? "Privada" : "Comunitaria"}</strong>
              </div>
            </div>
          )}

          {error && <p className="prayer-details__error" role="alert">{error}</p>}

          <form className="prayer-details__form" id="prayer-details-form" onSubmit={handleSubmit}>
            <h3><HandHeart size={19} /> Información de la petición</h3>
            <div className="prayer-details__form-field">
              <label htmlFor="admin-prayer-title">Título *</label>
              <input ref={firstFieldRef} id="admin-prayer-title" value={form.title} maxLength={120} required minLength={3}
                onChange={(event) => updateField("title", event.target.value)} placeholder="Ej.: Oración por mi familia" />
            </div>
            <div className="prayer-details__form-field">
              <label htmlFor="admin-prayer-category">Categoría *</label>
              <select id="admin-prayer-category" value={form.category} onChange={(event) => updateField("category", event.target.value)}>
                {CATEGORIES.map((item) => <option value={item} key={item}>{item}</option>)}
              </select>
            </div>
            <div className="prayer-details__form-field">
              <label htmlFor="admin-prayer-description">Descripción *</label>
              <textarea id="admin-prayer-description" value={form.description} rows={5} minLength={5} maxLength={2000} required
                onChange={(event) => updateField("description", event.target.value)} />
            </div>
            <div className="prayer-details__form-field">
              <label htmlFor="admin-prayer-visibility">Visibilidad</label>
              <select id="admin-prayer-visibility" value={form.visibility} onChange={(event) => updateField("visibility", event.target.value)}>
                <option value="community">Comunitaria — visible para miembros</option>
                <option value="private">Privada — solo autor y administración</option>
              </select>
            </div>
            <label className="prayer-details__checkbox">
              <input type="checkbox" checked={form.anonymous} onChange={(event) => updateField("anonymous", event.target.checked)} />
              Ocultar el nombre del solicitante frente a otros miembros
            </label>

            {!creating && (
              <>
                <h3><HandHeart size={19} /> Seguimiento de la petición</h3>
                <div className="prayer-details__form-field">
                  <label htmlFor="prayer-details-status">Estado</label>
                  <select id="prayer-details-status" value={form.status} onChange={(event) => updateField("status", event.target.value)}>
                    {STATUS_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </div>
                <div className="prayer-details__form-field">
                  <label htmlFor="prayer-details-note">Observación interna</label>
                  <textarea id="prayer-details-note" value={form.followUpNote} rows={4} maxLength={1000}
                    onChange={(event) => updateField("followUpNote", event.target.value)}
                    placeholder="Notas de seguimiento, solo para administradores." />
                  <small>Esta observación nunca se muestra a los miembros.</small>
                </div>
              </>
            )}
          </form>

          <div className="prayer-details__notice">
            <ShieldCheck size={18} aria-hidden="true" />
            <p>Trata las peticiones con confidencialidad. Las privadas no se comparten con la comunidad y las notas de seguimiento son internas.</p>
          </div>
        </div>

        <footer className="prayer-details__footer">
          <button type="button" className="prayer-details__cancel" onClick={onClose} disabled={isSaving}>Cancelar</button>
          <button type="submit" form="prayer-details-form" className="prayer-details__save" disabled={isSaving}>
            <Save size={17} /> {isSaving ? "Guardando..." : creating ? "Registrar petición" : "Guardar cambios"}
          </button>
        </footer>
      </section>
    </div>
  );
}

// Reutilizamos el mismo diálogo para alta y edición de administración.
export default PrayerRequestDetailsModal;
