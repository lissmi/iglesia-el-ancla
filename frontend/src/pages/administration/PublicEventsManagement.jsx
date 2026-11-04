/* =========================================================
   ADMINISTRACIÓN VISUAL DE EVENTOS - IGLESIA EL ANCLA
   Archivo: frontend/src/pages/administration/PublicEventsManagement.jsx
   Utiliza la misma página Events.jsx que ve el público.
========================================================= */

// Hooks de React para datos, efectos y bloqueo de solicitudes.
import { useCallback, useEffect, useRef, useState } from "react";

// Navegación y acceso a la página pública.
import { Link, useLocation, useNavigate } from "react-router-dom";

// Reutilizamos el diseño público sin duplicar su JSX.
import Events from "../public/Events";

// Reutilizamos la barra y el diálogo del editor informativo.
import EditorToolbar from "../../components/administration/informationalPages/common/EditorToolbar";
import ConfirmationModal from "../../components/administration/informationalPages/common/ConfirmationModal";

// Iconos utilizados en la administración.
import { ArrowUpRight, CalendarPlus, Eye, ImagePlus, Pencil, Trash2, X } from "lucide-react";

// Cliente HTTP configurado por el proyecto y CSS existente.
import api from "../../services/api";
import "../../styles/pages/administration/PublicEventsManagement.css";

// Las categorías deben coincidir con el enum de Event.js.
const EVENT_CATEGORIES = ["Culto", "Oración", "Estudio bíblico", "Jóvenes", "Niños", "Taller", "Otro"];

// Posiciones disponibles para una recurrencia mensual con semanas fijas.
// -1 significa el último día semanal de cada mes.
const MONTH_WEEKS = [
  { value: 1, label: "Primer" },
  { value: 2, label: "Segundo" },
  { value: 3, label: "Tercer" },
  { value: 4, label: "Cuarto" },
  { value: -1, label: "Último" },
];

// En JavaScript, domingo es 0 y sábado es 6.
const WEEK_DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

// Siempre obtenemos un formulario nuevo, sin compartir referencias.
function emptyForm() {
  return {
    title: "", category: "Culto", description: "", date: "",
    time: "", endTime: "", daysOfWeek: [], endDate: "",
    recurrenceType: "weekly", monthlyCount: 1,
    monthlySchedule: "to_confirm", weeksOfMonth: [],
    modality: "Presencial", location: "", meetingUrl: "",
    publicationStatus: "draft", imageFile: null, imageUrl: "", removeImage: false,
  };
}

// Extraemos mensajes del backend sin mostrar errores técnicos innecesarios.
function getErrorMessage(error) {
  return error?.response?.data?.message || error?.message || "No se pudo completar la operación.";
}

function PublicEventsManagement() {
  // Datos reales de los eventos guardados en MongoDB.
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  // Formulario de creación y edición de eventos.
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  // Borrador de los textos y configuración visual de la página.
  const [pageDraft, setPageDraft] = useState(null);
  const [savedPage, setSavedPage] = useState(null);
  // La versión pública es independiente del borrador administrativo.
  const [publishedPage, setPublishedPage] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageSaving, setPageSaving] = useState(false);
  const [pagePublishing, setPagePublishing] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [confirmationAction, setConfirmationAction] = useState(null);

  // Impide guardar dos veces antes de que React actualice el estado.
  const pageSaveInProgress = useRef(false);

  // Operaciones para eliminar o publicar eventos individuales.
  const [deletingEvent, setDeletingEvent] = useState(null);
  const [deleting, setDeleting] = useState(false);
  // Mostramos los errores dentro del modal, no detrás del fondo oscuro.
  const [deleteError, setDeleteError] = useState("");
  const [changingId, setChangingId] = useState(null);

  // Volvemos al panel correspondiente al rol autenticado.
  const navigate = useNavigate();
  const location = useLocation();
  const adminBasePath = location.pathname.startsWith("/super-admin/") ? "/super-admin" : "/admin";

  // Indica si el contenido visual tiene cambios sin guardar.
  const pageHasChanges = Boolean(
    pageDraft && savedPage && JSON.stringify(pageDraft) !== JSON.stringify(savedPage)
  );

  // El lienzo visual conserva los textos en edición, pero utiliza siempre
  // el destacado público como referencia. Así ambos muestran la misma tarjeta.
  const visualPage = pageDraft && publishedPage
    ? { ...pageDraft, featuredEventId: publishedPage.featuredEventId || "" }
    : pageDraft;

  // Previsualizamos el archivo seleccionado sin subirlo todavía.
  useEffect(() => {
    if (!formOpen || !form.imageFile) {
      setImagePreview("");
      return undefined;
    }
    const url = URL.createObjectURL(form.imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [formOpen, form.imageFile]);

  // Recuperamos de MongoDB el último borrador visual guardado.
  useEffect(() => {
    const controller = new AbortController();
    async function loadPage() {
      setPageLoading(true);
      try {
        const response = await api.get("/events/page/admin", { signal: controller.signal });
        if (!response.data?.draft) throw new Error("No se pudo abrir el editor de eventos.");
        if (!controller.signal.aborted) {
          setPageDraft(response.data.draft);
          setSavedPage(response.data.draft);
          setPublishedPage(response.data.published || null);
        }
      } catch (error) {
        if (!controller.signal.aborted && error?.code !== "ERR_CANCELED") {
          setFeedback({ type: "error", message: getErrorMessage(error) });
        }
      } finally {
        if (!controller.signal.aborted) setPageLoading(false);
      }
    }
    loadPage();
    return () => controller.abort();
  }, []);

  // Recuperamos los eventos, incluidos los que están en borrador.
  const loadEvents = useCallback(async (signal) => {
    setLoading(true);
    try {
      const response = await api.get("/events/admin", { signal });
      if (!Array.isArray(response.data?.events)) throw new Error("No se pudieron cargar los eventos.");
      if (!signal?.aborted) setEvents(response.data.events);
    } catch (error) {
      if (!signal?.aborted && error?.code !== "ERR_CANCELED") {
        setFeedback({ type: "error", message: getErrorMessage(error) });
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadEvents(controller.signal);
    return () => controller.abort();
  }, [loadEvents]);

  // Evitamos el desplazamiento del fondo cuando hay diálogos abiertos.
  useEffect(() => {
    if (!formOpen && !deletingEvent) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [formOpen, deletingEvent]);

  // Los lápices modifican solo el borrador, no la página pública.
  function updatePageField(key, value) {
    setPageDraft((current) => current ? { ...current, [key]: value } : current);
    setFeedback(null);
  }

  // Guarda en la BD una configuración concreta (o el borrador actual).
  async function savePageDraft(draftToSave = pageDraft) {
    if (!draftToSave || pageSaveInProgress.current || pagePublishing) return false;
    pageSaveInProgress.current = true;
    // Reflejamos de inmediato en el editor la selección que vamos a guardar.
    // Si la API falla, el cambio queda pendiente y se puede reintentar.
    setPageDraft(draftToSave);
    setPageSaving(true);
    setFeedback(null);
    try {
      const response = await api.patch("/events/page/draft", draftToSave);
      const savedDraft = response.data?.draft;
      if (!savedDraft) throw new Error("No se pudo confirmar el guardado del borrador.");
      setSavedPage(savedDraft);
      // No sobrescribimos un texto modificado mientras se guardaba.
      setPageDraft((current) =>
        JSON.stringify(current) === JSON.stringify(draftToSave) ? savedDraft : current
      );
      setLastSaved(new Date());
      setFeedback({
        type: "success",
        message: "Borrador guardado. Presiona «Publicar» para mostrar los cambios a los visitantes.",
      });
      return true;
    } catch (error) {
      setFeedback({ type: "error", message: getErrorMessage(error) });
      return false;
    } finally {
      pageSaveInProgress.current = false;
      setPageSaving(false);
    }
  }

  // Cambiar el destacado actualiza inmediatamente ambas vistas de React.
  // El backend persiste el ID en borrador y versión publicada, sin publicar
  // otros textos que todavía se estén editando.
  async function handleChooseFeatured(eventId) {
    // Impedimos iniciar una operación antes de cargar las dos versiones.
    if (!pageDraft || !publishedPage || pageSaveInProgress.current || pagePublishing) return;

    // Solo permitimos destacar eventos que ya estén publicados.
    const selected = events.find((event) => event.id === eventId);
    if (!selected || selected.publicationStatus !== "published") {
      setFeedback({ type: "error", message: "Primero publica este evento para poder destacarlo." });
      return;
    }

    // No volvemos a guardar una selección que ya coincide en ambas versiones.
    if (publishedPage.featuredEventId === eventId && pageDraft.featuredEventId === eventId) {
      setFeedback({ type: "success", message: "Este evento ya está destacado en la página pública." });
      return;
    }

    // Conservamos ambas versiones por si el servidor rechaza el cambio.
    const previousDraftId = pageDraft.featuredEventId || "";
    const previousPublished = publishedPage;

    // Mostramos el evento elegido sin esperar a la respuesta del servidor.
    // El lienzo visual utiliza publishedPage para seleccionar la tarjeta.
    setPageDraft((current) => current ? { ...current, featuredEventId: eventId } : current);
    setPublishedPage((current) => current ? { ...current, featuredEventId: eventId } : current);

    // Bloqueamos solicitudes duplicadas hasta confirmar la persistencia.
    pageSaveInProgress.current = true;
    setPageSaving(true);
    setFeedback(null);

    try {
      // El endpoint solo modifica la selección del destacado, no los textos.
      const response = await api.patch("/events/page/featured", { featuredEventId: eventId });
      const nextDraft = response.data?.draft;
      const nextPublished = response.data?.published;

      // Exigimos una respuesta que confirme el ID realmente publicado.
      if (
        !nextDraft ||
        !nextPublished ||
        nextDraft.featuredEventId !== eventId ||
        nextPublished.featuredEventId !== eventId
      ) {
        throw new Error("No se pudo confirmar el cambio del evento destacado.");
      }

      // Registramos las versiones oficiales entregadas por el backend.
      setSavedPage(nextDraft);
      setPublishedPage(nextPublished);

      // Preservamos textos que el administrador haya editado en paralelo.
      setPageDraft((current) => current
        ? { ...current, featuredEventId: nextDraft.featuredEventId }
        : nextDraft
      );
      setLastSaved(new Date());
      setFeedback({
        type: "success",
        message: "Evento destacado actualizado en el editor y en la página pública.",
      });
    } catch (error) {
      // Si falla la petición, restauramos la selección anterior.
      setPageDraft((current) => current
        ? { ...current, featuredEventId: previousDraftId }
        : current
      );
      setPublishedPage(previousPublished);
      setFeedback({ type: "error", message: getErrorMessage(error) });
    } finally {
      // React puede aceptar otra selección después de finalizar la petición.
      pageSaveInProgress.current = false;
      setPageSaving(false);
    }
  }

  // Publicamos los textos e icono, además de la elección del destacado.
  async function publishPage() {
    if (!pageDraft || pageSaveInProgress.current || pagePublishing) return;
    setPagePublishing(true);
    setFeedback(null);
    try {
      const response = await api.post("/events/page/publish", pageDraft);
      if (!response.data?.page) throw new Error("No se pudo confirmar la publicación.");
      setPageDraft(response.data.page);
      setSavedPage(response.data.page);
      // Ahora esta misma versión es la visible para los visitantes.
      setPublishedPage(response.data.page);
      setLastSaved(new Date());
      setFeedback({ type: "success", message: "La página pública ya muestra los cambios." });
    } catch (error) {
      setFeedback({ type: "error", message: getErrorMessage(error) });
    } finally {
      setPagePublishing(false);
    }
  }

  // Descarta únicamente los cambios visuales que aún no se guardaron.
  function discardPageChanges() {
    if (!savedPage || !pageHasChanges) return;
    setPageDraft({ ...savedPage });
    setFeedback({ type: "success", message: "Se restauró el último borrador guardado." });
  }

  // Acciones solicitadas desde la barra compartida.
  function backToPanel() {
    if (pageHasChanges) setConfirmationAction("back");
    else navigate(adminBasePath);
  }
  function confirmPageAction() {
    const action = confirmationAction;
    setConfirmationAction(null);
    if (action === "publish") publishPage();
    if (action === "discard") discardPageChanges();
    if (action === "back") navigate(adminBasePath);
  }

  // Mantenemos todos los cambios del formulario en un mismo estado.
  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setFormError("");
  }
  // Cambiar la frecuencia mantiene el horario, pero evita días incompatibles.
  function changeFrequency(type) {
    setForm((current) => ({
      ...current,
      recurrenceType: type,
      daysOfWeek: type === "monthly" ? current.daysOfWeek.slice(0, 1) : current.daysOfWeek,
    }));
    setFormError("");
  }

  // Semanal admite varios días; mensual admite exactamente uno.
  function toggleDay(day) {
    setForm((current) => ({
      ...current,
      daysOfWeek: current.recurrenceType === "monthly"
        ? [day]
        : current.daysOfWeek.includes(day)
          ? current.daysOfWeek.filter((value) => value !== day)
          : [...current.daysOfWeek, day].sort((a, b) => a - b),
    }));
    setFormError("");
  }

  // Las semanas concretas son opcionales y no deben superar el número elegido.
  function toggleMonthWeek(week) {
    setForm((current) => {
      const selected = current.weeksOfMonth.includes(week);
      const next = selected
        ? current.weeksOfMonth.filter((value) => value !== week)
        : [...current.weeksOfMonth, week];
      // Cuarto y último podrían coincidir en meses con cuatro domingos.
      if (next.includes(4) && next.includes(-1)) return current;
      if (next.length > current.monthlyCount) return current;
      return { ...current, weeksOfMonth: next };
    });
    setFormError("");
  }

  // Abrimos el mismo formulario para crear y editar.
  function openCreate() {
    setEditingId(null);
    setForm(emptyForm());
    setFormError("");
    setFormOpen(true);
  }
  function openEdit(event) {
    setEditingId(event.id);
    setForm({
      title: event.title || "",
      category: event.category || "Culto",
      description: event.description || "",
      date: event.date || "",
      time: event.time || "",
      endTime: event.endTime || "",
      daysOfWeek: [...(event.recurrence?.daysOfWeek || [])],
      recurrenceType: event.recurrence?.type === "monthly" ? "monthly" : "weekly",
      monthlyCount: event.recurrence?.monthlyCount || 1,
      monthlySchedule: event.recurrence?.weeksOfMonth?.length ? "fixed" : "to_confirm",
      weeksOfMonth: [...(event.recurrence?.weeksOfMonth || [])],
      endDate: event.recurrence?.endDate || "",
      modality: event.modality || "Presencial",
      location: event.location || "",
      meetingUrl: event.meetingUrl || "",
      publicationStatus: event.publicationStatus || "draft",
      imageFile: null,
      imageUrl: event.image?.url || "",
      removeImage: false,
    });
    setFormError("");
    setFormOpen(true);
  }
  function closeForm() {
    if (saving) return;
    setFormOpen(false);
    setEditingId(null);
    setFormError("");
  }

  // La imagen es opcional, pero sí se comprueba formato y tamaño.
  function handleImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type) || file.size > 5 * 1024 * 1024) {
      setFormError("Selecciona una imagen JPG, PNG o WebP de hasta 5 MB.");
      event.target.value = "";
      return;
    }
    setForm((current) => ({ ...current, imageFile: file, removeImage: false }));
    setFormError("");
    event.target.value = "";
  }
  function discardSelectedImage() {
    setForm((current) => ({ ...current, imageFile: null }));
    setFormError("");
  }

  // El enlace online solo se comprueba si se proporcionó uno.
  function validateForm() {
    if (!form.title.trim() || !form.description.trim() || !form.date || !form.time) {
      return "Completa el nombre, la descripción, la fecha de inicio y la hora.";
    }
    // Semanal acepta varios días; mensual necesita exactamente uno.
    if (form.recurrenceType === "weekly" && !form.daysOfWeek.length) {
      return "Selecciona al menos un día para la reunión semanal.";
    }
    if (form.recurrenceType === "monthly") {
      if (form.daysOfWeek.length > 1) return "Elige como máximo un día para la reunión mensual.";
      if (form.monthlySchedule === "fixed" && form.daysOfWeek.length !== 1) {
        return "Si eliges semanas fijas, indica el día de la semana.";
      }
      if (![1, 2, 3, 4].includes(form.monthlyCount)) {
        return "Indica cuántas veces al mes se realiza el encuentro.";
      }
      if (form.monthlySchedule === "fixed" && form.weeksOfMonth.length !== form.monthlyCount) {
        return `Selecciona ${form.monthlyCount} semana(s) del mes o marca «Fechas por confirmar».`;
      }
    }
    if (form.endTime && form.endTime <= form.time) {
      return "La hora de término debe ser posterior a la de inicio.";
    }
    if (form.endDate && form.endDate < form.date) {
      return "La fecha final no puede ser anterior a la fecha de inicio.";
    }
    if (form.modality !== "Online" && !form.location.trim()) {
      return "Indica el lugar de la reunión.";
    }
    if (form.modality !== "Presencial" && form.meetingUrl.trim()) {
      try {
        const url = new URL(form.meetingUrl.trim());
        if (!["http:", "https:"].includes(url.protocol)) throw new Error("Protocolo no permitido");
      } catch {
        return "Ingresa una URL válida o deja el enlace vacío si se compartirá por privado.";
      }
    }
    return "";
  }

  // El CRUD de eventos conserva las rutas y el formato de la API actual.
  async function handleSave(event) {
    event.preventDefault();
    if (saving) return;
    const validationError = validateForm();
    if (validationError) { setFormError(validationError); return; }
    setSaving(true);
    setFormError("");
    setFeedback(null);
    try {
      const payload = {
        title: form.title.trim(), category: form.category,
        description: form.description.trim(),
        date: form.date, time: form.time, endTime: form.endTime || "",
        modality: form.modality,
        location: form.modality === "Online" ? "" : form.location.trim(),
        meetingUrl: form.modality === "Presencial" ? "" : form.meetingUrl.trim(),
        // Recurrencia semanal o mensual, validada también por el backend.
        recurrence: {
          type: form.recurrenceType,
          daysOfWeek: form.daysOfWeek,
          ...(form.recurrenceType === "monthly" ? {
            monthlyCount: form.monthlyCount,
            ...(form.monthlySchedule === "fixed"
              ? { weeksOfMonth: [...form.weeksOfMonth] }
              : {}),
          } : {}),
          ...(form.endDate ? { endDate: form.endDate } : {}),
        },
        publicationStatus: form.publicationStatus,
        ...(editingId && form.removeImage ? { removeImage: true } : {}),
      };
      const formData = new FormData();
      formData.append("data", JSON.stringify(payload));
      if (form.imageFile) formData.append("image", form.imageFile);
      const options = { headers: { "Content-Type": "multipart/form-data" }, timeout: 30000 };
      const response = editingId
        ? await api.patch(`/events/${encodeURIComponent(editingId)}`, formData, options)
        : await api.post("/events", formData, options);
      const savedEvent = response.data?.event;
      if (!savedEvent?.id) throw new Error("No se pudo confirmar el guardado del evento.");
      setEvents((current) => editingId
        ? current.map((item) => item.id === savedEvent.id ? savedEvent : item)
        : [savedEvent, ...current]);
      setFormOpen(false);
      setEditingId(null);
      setFeedback({
        type: response.data?.warning ? "warning" : "success",
        message: response.data?.warning || response.data?.message || "Evento guardado correctamente.",
      });
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  // Publicar o volver a borrador afecta solo el evento seleccionado.
  async function changePublication(event) {
    if (changingId) return;
    const status = event.publicationStatus === "published" ? "draft" : "published";
    setChangingId(event.id);
    setFeedback(null);
    try {
      const response = await api.patch(
        `/events/${encodeURIComponent(event.id)}/publication`,
        { publicationStatus: status }
      );
      if (!response.data?.event?.id) throw new Error("No se confirmó el cambio de estado.");
      setEvents((current) => current.map((item) => item.id === event.id ? response.data.event : item));
      // El backend limpia el destacado público si el evento pasa a borrador.
      // Actualizamos la vista local sin tocar los demás campos de la página.
      if (status === "draft") {
        setPageDraft((current) => current?.featuredEventId === event.id
          ? { ...current, featuredEventId: "" } : current);
        setSavedPage((current) => current?.featuredEventId === event.id
          ? { ...current, featuredEventId: "" } : current);
        setPublishedPage((current) => current?.featuredEventId === event.id
          ? { ...current, featuredEventId: "" } : current);
      }
      setFeedback({
        type: response.data?.warning ? "warning" : "success",
        message: response.data?.warning || (status === "published"
          ? "Evento publicado correctamente."
          : "Evento guardado como borrador."),
      });
    } catch (error) {
      setFeedback({ type: "error", message: getErrorMessage(error) });
    } finally {
      setChangingId(null);
    }
  }

  // Abrimos una única confirmación desde cualquier tarjeta de evento.
  function requestDelete(event) {
    if (deleting || saving) return;
    setDeleteError("");
    setDeletingEvent(event);
  }

  // El administrador puede cancelar mientras no se haya enviado el borrado.
  function closeDeleteModal() {
    if (deleting) return;
    setDeletingEvent(null);
    setDeleteError("");
  }

  // Eliminación real del evento, reutilizada por las tarjetas y el organizador.
  async function confirmDelete() {
    // La confirmación del usuario es obligatoria.
    if (!deletingEvent || deleting) return;

    // Guardamos el ID antes de modificar el estado.
    const deletedId = deletingEvent.id;
    setDeleting(true);
    setDeleteError("");
    setFeedback(null);

    try {
      // DELETE borra el registro, audita y limpia referencias al destacado.
      const response = await api.delete(`/events/${encodeURIComponent(deletedId)}`);
      if (response.data?.success !== true) {
        throw new Error("El servidor no confirmó la eliminación del evento.");
      }

      // El evento deja de aparecer inmediatamente en ambas vistas.
      setEvents((current) => current.filter((event) => event.id !== deletedId));

      // Retiramos referencias a un evento que ya no existe.
      // Las demás modificaciones del borrador se mantienen.
      const removeFeatured = (page) => page?.featuredEventId === deletedId
        ? { ...page, featuredEventId: "" }
        : page;
      setPageDraft(removeFeatured);
      setSavedPage(removeFeatured);
      setPublishedPage(removeFeatured);

      // Cerramos el diálogo y mostramos el resultado real.
      setDeletingEvent(null);
      setDeleteError("");
      setFeedback({
        type: response.data.warning ? "warning" : "success",
        message: response.data.warning || "Evento eliminado correctamente de la programación.",
      });
    } catch (error) {
      // Conservamos el diálogo abierto y explicamos el error en el modal.
      setDeleteError(getErrorMessage(error));
      setFeedback({ type: "error", message: getErrorMessage(error) });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="public-events-management-page">
      {/* Barra de herramientas del mismo editor informativo. */}
      <EditorToolbar
        pageTitle="Nuestros eventos"
        pageDescription="Pasa el cursor sobre los textos y las imágenes para editarlos."
        hasChanges={pageHasChanges}
        isSaving={pageSaving}
        isPublishing={pagePublishing}
        isPreview={isPreview}
        lastSaved={lastSaved}
        message={feedback?.message || ""}
        messageType={feedback?.type === "error" ? "error" : "success"}
        onBack={backToPanel}
        onSave={() => savePageDraft()}
        onPublish={() => setConfirmationAction("publish")}
        onDiscard={() => setConfirmationAction("discard")}
        onTogglePreview={() => setIsPreview((current) => !current)}
      />

      {/* Acceso a la página pública y creación de una reunión. */}
      <div className="public-events-management-page__visual-tools">
        <div>
          <strong>Editor visual de eventos</strong>
          <p>
            {isPreview
              ? "Vista previa: así verán la página los visitantes."
              : "Pasa el cursor sobre los textos o las tarjetas y selecciona el lápiz para editarlos."}
          </p>
        </div>
        <div className="public-events-management-page__header-actions">
          <Link to="/eventos" target="_blank" rel="noopener noreferrer" className="public-events-management-page__public-link">
            <Eye size={17} /> Ver página pública <ArrowUpRight size={16} />
          </Link>
          {!isPreview && (
            <button type="button" className="public-events-management-page__primary" onClick={openCreate}>
              <CalendarPlus size={18} /> Nuevo evento
            </button>
          )}
        </div>
      </div>

      {/* Mensajes de las operaciones realizadas. */}
      {feedback && (
        <div className={`public-events-management-page__feedback public-events-management-page__feedback--${feedback.type}`}
          role={feedback.type === "error" ? "alert" : "status"}>
          {feedback.message}
        </div>
      )}

      {/* Utilizamos la misma página Events.jsx, sin copiar su diseño. */}
      <section className="public-events-management-page__visual-workspace" aria-label="Editor visual de la página Eventos">
        {loading || pageLoading || !pageDraft ? (
          <div className="public-events-management-page__empty" role="status">Cargando la página de eventos...</div>
        ) : (
          <Events
            editorMode
            isPreview={isPreview}
            pageData={visualPage}
            eventData={events}
            onPageChange={updatePageField}
            onEditEvent={openEdit}
            onCreateEvent={openCreate}
            onChooseFeatured={handleChooseFeatured}
            onDeleteEvent={requestDelete}
          />
        )}
      </section>

      {/* Controles compactos que solo aparecen en administración. */}
      {!isPreview && !loading && !pageLoading && pageDraft && (
        <section className="public-events-management-page__panel public-events-management-page__event-organizer">
          <div className="public-events-management-page__panel-heading">
            <div>
              <span className="public-events-management-page__eyebrow">ADMINISTRAR PUBLICACIONES</span>
              <h2>Estado de los eventos</h2>
              <p>Publica, guarda como borrador o elimina cada reunión desde aquí.</p>
            </div>
            <span className="public-events-management-page__count">{events.length} eventos</span>
          </div>
          {events.length === 0 ? (
            <p className="public-events-management-page__empty">Todavía no hay eventos registrados.</p>
          ) : (
            <div className="public-events-management-page__organizer-list">
              {events.map((event) => (
                <div className="public-events-management-page__organizer-item" key={event.id}>
                  <div className="public-events-management-page__organizer-info">
                    <strong>{event.title}</strong>
                    <small>{event.publicationStatus === "published"
                      ? "Publicado · visible para todos"
                      : "Borrador · solo administración"}</small>
                    {pageDraft.featuredEventId === event.id && (
                      <small>Destacado seleccionado en edición</small>
                    )}
                    {publishedPage?.featuredEventId === event.id && (
                      <small>Destacado visible actualmente en la página pública</small>
                    )}
                  </div>
                  <div className="public-events-management-page__organizer-actions">
                    <button
                      type="button"
                      disabled={pageSaving || pagePublishing || Boolean(changingId) || deleting || (pageDraft.featuredEventId === event.id && publishedPage?.featuredEventId === event.id)}
                      onClick={() => handleChooseFeatured(event.id)}
                      aria-pressed={pageDraft.featuredEventId === event.id}
                      title={pageDraft.featuredEventId === event.id && publishedPage?.featuredEventId === event.id
                        ? "Este evento ya está destacado públicamente"
                        : "Destacar ahora en la página pública"}
                    >
                      {publishedPage?.featuredEventId === event.id ? "Destacado" : "Destacar y publicar"}
                    </button>
                    <button type="button" onClick={() => openEdit(event)} disabled={saving || deleting}>
                      <Pencil size={16} /> Editar
                    </button>
                    <button type="button" disabled={Boolean(changingId) || deleting}
                      onClick={() => changePublication(event)}>
                      {event.publicationStatus === "published" ? "Pasar a borrador" : "Publicar"}
                    </button>
                    <button type="button" className="public-events-management-page__danger"
                      disabled={Boolean(changingId) || deleting} onClick={() => requestDelete(event)}>
                      <Trash2 size={16} /> Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Formulario que reutiliza el CRUD existente de eventos. */}
      {formOpen && (
        <div className="public-events-management-page__overlay" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeForm();
        }}>
          <section className="public-events-management-page__dialog" role="dialog" aria-modal="true"
            aria-labelledby="public-event-form-title">
            <header className="public-events-management-page__dialog-header">
              <div>
                <span className="public-events-management-page__eyebrow">PROGRAMACIÓN DE EVENTOS</span>
                <h2 id="public-event-form-title">{editingId ? "Editar evento" : "Nuevo evento"}</h2>
                <p>Completa los detalles que las personas necesitan para asistir.</p>
              </div>
              <button type="button" onClick={closeForm} disabled={saving} aria-label="Cerrar formulario"><X size={21} /></button>
            </header>
            <form className="public-events-management-page__form" onSubmit={handleSave}>
              {formError && <p className="public-events-management-page__form-error" role="alert">{formError}</p>}
              <div className="public-events-management-page__form-grid">
                <label>Nombre del evento *
                  <input value={form.title} onChange={(e) => updateField("title", e.target.value)} required
                    maxLength={120} placeholder="Ej.: Culto general" />
                </label>
                <label>Categoría *
                  <select value={form.category} onChange={(e) => updateField("category", e.target.value)}>
                    {EVENT_CATEGORIES.map((value) => <option key={value} value={value}>{value}</option>)}
                  </select>
                </label>
                <label className="public-events-management-page__full">Descripción *
                  <textarea rows={3} value={form.description} onChange={(e) => updateField("description", e.target.value)}
                    maxLength={2000} required placeholder="Cuenta brevemente de qué trata este encuentro." />
                </label>
                <label>Fecha desde la que comienza *
                  <input type="date" value={form.date} onChange={(e) => updateField("date", e.target.value)} required />
                </label>
                <label>Fecha de término (opcional)
                  <input type="date" min={form.date || undefined} value={form.endDate}
                    onChange={(e) => updateField("endDate", e.target.value)} />
                </label>

                {/* El admin elige si la reunión es semanal o mensual. */}
                <label className="public-events-management-page__full">
                  ¿Con qué frecuencia se realiza? *
                  <select value={form.recurrenceType} onChange={(e) => changeFrequency(e.target.value)}>
                    <option value="weekly">Todas las semanas</option>
                    <option value="monthly">Una o varias veces al mes</option>
                  </select>
                </label>

                {/* Para un evento mensual se elige un solo día; semanal admite varios. */}
                <fieldset className="public-events-management-page__days public-events-management-page__full">
                  <legend>
                    {form.recurrenceType === "monthly"
                      ? "¿Qué día de la semana se realiza? (opcional)"
                      : "¿Qué días de la semana se realiza? *"}
                  </legend>
                  <div>
                    {form.recurrenceType === "monthly" && (
                      <label className={form.daysOfWeek.length === 0 ? "selected" : ""}>
                        <input type="radio" name="monthly-weekday" checked={form.daysOfWeek.length === 0}
                          onChange={() => updateField("daysOfWeek", [])} />
                        Día por confirmar
                      </label>
                    )}
                    {WEEK_DAYS.map((label, day) => (
                      <label key={label} className={form.daysOfWeek.includes(day) ? "selected" : ""}>
                        <input type={form.recurrenceType === "monthly" ? "radio" : "checkbox"}
                          name={form.recurrenceType === "monthly" ? "monthly-weekday" : undefined}
                          checked={form.daysOfWeek.includes(day)} onChange={() => toggleDay(day)} />
                        {label}
                      </label>
                    ))}
                  </div>
                  <small>
                    {form.recurrenceType === "monthly"
                      ? "Selecciona el día habitual si lo conoces; de lo contrario, deja «Día por confirmar»."
                      : "El evento se realizará cada semana en los días seleccionados."}
                  </small>
                </fieldset>

                {/* La cantidad mensual y las semanas son campos independientes. */}
                {form.recurrenceType === "monthly" && (
                  <>
                    <label className="public-events-management-page__full">
                      ¿Cuántas veces al mes se realiza? *
                      <select value={form.monthlyCount} onChange={(e) => {
                        const count = Number(e.target.value);
                        setForm((current) => ({ ...current,
                          monthlyCount: count,
                          weeksOfMonth: current.weeksOfMonth.slice(0, count),
                        }));
                        setFormError("");
                      }}>
                        <option value={1}>Una vez al mes</option>
                        <option value={2}>Dos veces al mes</option>
                        <option value={3}>Tres veces al mes</option>
                        <option value={4}>Cuatro veces al mes</option>
                      </select>
                    </label>

                    <label className="public-events-management-page__full">
                      ¿Están definidos cuáles son los encuentros del mes?
                      <select value={form.monthlySchedule} onChange={(e) =>
                        updateField("monthlySchedule", e.target.value)}>
                        <option value="to_confirm">No, fechas por confirmar</option>
                        <option value="fixed">Sí, semanas fijas del mes</option>
                      </select>
                      <small>Si aún no hay fechas acordadas, los visitantes verán «Fechas por confirmar».</small>
                    </label>

                    {form.monthlySchedule === "fixed" && (
                      <fieldset className="public-events-management-page__days public-events-management-page__full">
                        <legend>Selecciona {form.monthlyCount} semana(s) del mes *</legend>
                        <div>
                          {MONTH_WEEKS.map((week) => (
                            <label key={week.value}
                              className={form.weeksOfMonth.includes(week.value) ? "selected" : ""}>
                              <input type="checkbox"
                                checked={form.weeksOfMonth.includes(week.value)}
                                onChange={() => toggleMonthWeek(week.value)} />
                              {week.label}
                            </label>
                          ))}
                        </div>
                        <small>«Último» significa el último {WEEK_DAYS[form.daysOfWeek[0]] || "día"} del mes. No se combina con «Cuarto» para evitar fechas repetidas.</small>
                      </fieldset>
                    )}
                  </>
                )}

                <label>Hora de inicio *
                  <input type="time" value={form.time} onChange={(e) => updateField("time", e.target.value)} required />
                </label>
                <label>Hora de término (opcional)
                  <input type="time" value={form.endTime} onChange={(e) => updateField("endTime", e.target.value)} />
                </label>
                <label>Modalidad *
                  <select value={form.modality} onChange={(e) => updateField("modality", e.target.value)}>
                    <option value="Presencial">Presencial</option>
                    <option value="Online">En línea</option>
                    <option value="Híbrida">Presencial y en línea</option>
                  </select>
                </label>
                <label>Estado de publicación
                  <select value={form.publicationStatus} onChange={(e) => updateField("publicationStatus", e.target.value)}>
                    <option value="draft">Guardar como borrador</option>
                    <option value="published">Publicar evento</option>
                  </select>
                </label>
                {form.modality !== "Online" && (
                  <label className="public-events-management-page__full">Lugar de reunión *
                    <input value={form.location} onChange={(e) => updateField("location", e.target.value)} required
                      maxLength={300} placeholder="Ej.: Dirección o lugar donde se realiza" />
                  </label>
                )}
                {form.modality !== "Presencial" && (
                  <label className="public-events-management-page__full">Enlace para participar en línea (opcional)
                    <input type="url" value={form.meetingUrl} onChange={(e) => updateField("meetingUrl", e.target.value)}
                      maxLength={2000} placeholder="https://..." />
                    <small>Si el enlace se comparte por privado, deja este campo vacío. Las personas podrán solicitarlo a la iglesia.</small>
                  </label>
                )}

                {/* Selector personalizado y vista previa de la imagen. */}
                <div className="public-events-management-page__upload-section public-events-management-page__full">
                  <div className="public-events-management-page__upload-heading">
                    <span>Imagen del evento (opcional)</span>
                    <small>JPG, PNG o WebP · Máximo 5 MB</small>
                  </div>
                  <label className="public-events-management-page__upload-area">
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange}
                      aria-label="Seleccionar imagen del evento" />
                    <span className="public-events-management-page__upload-icon">
                      <ImagePlus size={27} strokeWidth={1.7} aria-hidden="true" />
                    </span>
                    <strong>{form.imageFile ? "Imagen seleccionada" : form.imageUrl && !form.removeImage
                      ? "Cambiar imagen del evento" : "Agrega una imagen para tu evento"}</strong>
                    <span className="public-events-management-page__upload-description">
                      {form.imageFile ? form.imageFile.name : "Selecciona una imagen desde tu dispositivo."}
                    </span>
                    <span className="public-events-management-page__upload-button">
                      {form.imageFile || (form.imageUrl && !form.removeImage) ? "Seleccionar otra imagen" : "Seleccionar imagen"}
                    </span>
                  </label>
                  {(imagePreview || (form.imageUrl && !form.removeImage)) && (
                    <div className="public-events-management-page__preview">
                      <img src={imagePreview || form.imageUrl} alt="Vista previa de la portada del evento" />
                      <div className="public-events-management-page__preview-info">
                        <strong>{form.imageFile ? "Nueva imagen lista para guardar" : "Imagen actual del evento"}</strong>
                        <small>{form.imageFile ? form.imageFile.name : "Esta imagen ya está guardada."}</small>
                        {form.imageFile && (
                          <button type="button" onClick={discardSelectedImage} className="public-events-management-page__preview-remove">
                            <X size={15} aria-hidden="true" /> Descartar selección
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  {editingId && form.imageUrl && !form.imageFile && (
                    <label className="public-events-management-page__remove-image">
                      <input type="checkbox" checked={form.removeImage}
                        onChange={(e) => updateField("removeImage", e.target.checked)} />
                      Quitar la imagen actual al guardar los cambios
                    </label>
                  )}
                </div>
              </div>
              <footer className="public-events-management-page__dialog-actions">
                <button type="button" className="public-events-management-page__secondary"
                  onClick={closeForm} disabled={saving}>Cancelar</button>
                <button type="submit" className="public-events-management-page__primary" disabled={saving}>
                  {saving ? "Guardando..." : editingId ? "Guardar cambios" : "Guardar evento"}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}

      {/* Confirmación antes de eliminar el evento y su portada. */}
      {deletingEvent && (
        <div className="public-events-management-page__overlay" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !deleting) closeDeleteModal();
        }}>
          <section className="public-events-management-page__confirm" role="alertdialog" aria-modal="true"
            aria-labelledby="public-event-delete-title">
            <h2 id="public-event-delete-title">¿Eliminar este evento?</h2>
            <p>Se eliminará «{deletingEvent.title}» de la programación. Esta acción no se puede deshacer.</p>
            {/* Mostramos errores reales de la API junto a la confirmación. */}
            {deleteError && (
              <p className="public-events-management-page__form-error" role="alert">
                {deleteError}
              </p>
            )}
            <div className="public-events-management-page__dialog-actions">
              <button type="button" className="public-events-management-page__secondary"
                onClick={closeDeleteModal} disabled={deleting}>Cancelar</button>
              <button type="button" className="public-events-management-page__danger-button"
                onClick={confirmDelete} disabled={deleting}>
                {deleting ? "Eliminando..." : "Sí, eliminar evento"}
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Usamos la misma confirmación de las páginas informativas. */}
      <ConfirmationModal
        isOpen={confirmationAction !== null}
        title={confirmationAction === "publish" ? "¿Publicar los cambios de la página?"
          : confirmationAction === "discard" ? "¿Descartar los cambios?" : "¿Salir sin guardar?"}
        description={confirmationAction === "publish"
          ? "Los textos y el evento destacado se mostrarán a todas las personas que visiten la página."
          : confirmationAction === "discard"
            ? "Se restaurará el último borrador guardado de la página."
            : "Se perderán los cambios realizados después del último guardado."}
        confirmText={confirmationAction === "publish" ? "Publicar cambios"
          : confirmationAction === "discard" ? "Descartar" : "Salir sin guardar"}
        cancelText="Cancelar"
        onConfirm={confirmPageAction}
        onCancel={() => setConfirmationAction(null)}
      />
    </div>
  );
}

// El mismo editor se utiliza desde Admin y Superadmin.
export default PublicEventsManagement;
