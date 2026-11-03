
/* =========================================================
   GESTIÓN DE EVENTOS PÚBLICOS - IGLESIA EL ANCLA
   Archivo: frontend/src/pages/administration/PublicEventsManagement.jsx

   Administra reuniones habituales de la iglesia.
   No gestiona confirmaciones ni actividades puntuales.
========================================================= */

// =========================================================
// HOOKS DE REACT
// =========================================================

// Importamos exclusivamente hooks desde React.
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

// =========================================================
// NAVEGACIÓN
// =========================================================

// Permite acceder a la página pública sin recargar.
import { Link } from "react-router-dom";

// =========================================================
// ICONOS DE LUCIDE REACT
// =========================================================

// Todos los iconos, incluido ImagePlus,
// deben importarse desde lucide-react.
import {
  ArrowUpRight,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  Clock3,
  Eye,
  FilePenLine,
  Image as ImageIcon,
  ImagePlus,
  MapPin,
  Pencil,
  Repeat2,
  Search,
  Trash2,
  X,
} from "lucide-react";

// =========================================================
// SERVICIOS
// =========================================================

// Instancia Axios compartida del proyecto.
// Mantiene la configuración de autenticación existente.
import api from "../../services/api";

// =========================================================
// ESTILOS
// =========================================================

// Estilos de la administración de eventos públicos.
import "../../styles/pages/administration/PublicEventsManagement.css";


// =========================================================
// CATEGORÍAS PERMITIDAS
// =========================================================

// Deben coincidir con el modelo Event.js.
const EVENT_CATEGORIES = [
  "Culto",
  "Oración",
  "Estudio bíblico",
  "Jóvenes",
  "Niños",
  "Taller",
  "Otro",
];

// =========================================================
// DÍAS DE LA SEMANA
// =========================================================

// JavaScript utiliza 0 para domingo y 6 para sábado.
const WEEK_DAYS = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
];

// =========================================================
// FORMULARIO INICIAL
// =========================================================

// Generamos un formulario independiente para cada evento.
function emptyForm() {
  return {
    title: "",
    category: "Culto",
    description: "",
    date: "",
    time: "",
    endTime: "",
    daysOfWeek: [],
    endDate: "",
    modality: "Presencial",
    location: "",
    meetingUrl: "",
    publicationStatus: "draft",
    imageFile: null,
    imageUrl: "",
    removeImage: false,
  };
}

// =========================================================
// FUNCIONES AUXILIARES
// =========================================================

// Convertimos una fecha civil a un formato legible.
function formatDate(value) {
  if (!value) return "Sin fecha";

  // Utilizamos mediodía UTC para evitar cambios de día.
  const date = new Date(`${value}T12:00:00Z`);

  // Conservamos el texto original cuando no es válido.
  if (Number.isNaN(date.getTime())) return value;

  // Presentamos la fecha en español.
  return new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

// Transformamos los días numéricos en nombres legibles.
function formatDays(values = []) {
  // Recuperamos los días seleccionados.
  const selected = WEEK_DAYS.filter((day) =>
    values.includes(day.value)
  );

  // Unimos sus nombres.
  return selected.length
    ? selected.map((day) => day.label).join(", ")
    : "Sin días asignados";
}

// Recuperamos un mensaje útil de los errores del servidor.
function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "No se pudo completar la operación."
  );
}

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function PublicEventsManagement() {
  // =====================================================
  // EVENTOS GUARDADOS
  // =====================================================

  // Listado obtenido desde el backend.
  const [events, setEvents] = useState([]);

  // Estado de carga del listado.
  const [loading, setLoading] = useState(true);

  // Mensajes de éxito, advertencia o error.
  const [feedback, setFeedback] = useState(null);

  // =====================================================
  // FILTROS
  // =====================================================

  // Texto del buscador.
  const [search, setSearch] = useState("");

  // Estado de publicación seleccionado.
  const [statusFilter, setStatusFilter] = useState("all");

  // =====================================================
  // FORMULARIO
  // =====================================================

  // Controla si el formulario está abierto.
  const [formOpen, setFormOpen] = useState(false);

  // null indica creación; un ID indica edición.
  const [editingId, setEditingId] = useState(null);

  // Datos que introduce el administrador.
  const [form, setForm] = useState(emptyForm);

  // Error exclusivo del formulario.
  const [formError, setFormError] = useState("");

  // Evita guardar dos veces simultáneamente.
  const [saving, setSaving] = useState(false);

  // URL temporal para previsualizar la imagen seleccionada.
  const [imagePreview, setImagePreview] = useState("");

  // Creamos una vista previa sin subir todavía la imagen.
  useEffect(() => {

    // Si no hay archivo seleccionado, retiramos la vista previa.
    if (!formOpen || !form.imageFile) {
      setImagePreview("");
      return undefined;
    }

    // Creamos una URL temporal para mostrar la imagen.
    const previewUrl = URL.createObjectURL(form.imageFile);

    // Guardamos la URL para utilizarla en el formulario.
    setImagePreview(previewUrl);

    // Liberamos la memoria cuando cambia la imagen o se cierra.
    return () => {
      URL.revokeObjectURL(previewUrl);
    };

  }, [formOpen, form.imageFile]);

  // =====================================================
  // ELIMINACIÓN Y PUBLICACIÓN
  // =====================================================

  // Evento seleccionado para eliminar.
  const [deletingEvent, setDeletingEvent] = useState(null);

  // Estado de eliminación.
  const [deleting, setDeleting] = useState(false);

  // ID del evento cuyo estado está cambiando.
  const [changingId, setChangingId] = useState(null);

  // =====================================================
  // CONSULTAR EVENTOS ADMINISTRATIVOS
  // =====================================================

  const loadEvents = useCallback(async (signal) => {
    // Activamos la carga.
    setLoading(true);

    try {
      // Consultamos borradores y eventos publicados.
      const response = await api.get("/events/admin", {
        signal,
      });

      // Comprobamos que la respuesta sea un listado.
      if (!Array.isArray(response.data?.events)) {
        throw new Error(
          "No fue posible cargar la lista de eventos."
        );
      }

      // Evitamos actualizar React tras cancelar la consulta.
      if (!signal?.aborted) {
        setEvents(response.data.events);
      }
    } catch (error) {
      // Ignoramos solicitudes canceladas.
      if (
        signal?.aborted ||
        error?.code === "ERR_CANCELED"
      ) {
        return;
      }

      // Informamos el error recibido.
      setFeedback({
        type: "error",
        message: getErrorMessage(error),
      });
    } finally {
      // Finalizamos la carga cuando corresponda.
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  // Consultamos los eventos al abrir la página.
  useEffect(() => {
    // Permite cancelar peticiones al desmontar.
    const controller = new AbortController();

    // Ejecutamos la consulta.
    loadEvents(controller.signal);

    // Limpiamos la petición anterior.
    return () => controller.abort();
  }, [loadEvents]);

  // Bloqueamos el desplazamiento del fondo con diálogos.
  useEffect(() => {
    if (!formOpen && !deletingEvent) {
      return undefined;
    }

    // Conservamos el valor anterior.
    const previous = document.body.style.overflow;

    // Bloqueamos el fondo temporalmente.
    document.body.style.overflow = "hidden";

    // Restauramos el comportamiento original.
    return () => {
      document.body.style.overflow = previous;
    };
  }, [formOpen, deletingEvent]);

  // =====================================================
  // ESTADÍSTICAS
  // =====================================================

  // Los contadores se calculan desde los registros reales.
  const summary = useMemo(
    () => ({
      total: events.length,

      published: events.filter(
        (event) =>
          event.publicationStatus === "published"
      ).length,

      drafts: events.filter(
        (event) =>
          event.publicationStatus === "draft"
      ).length,
    }),
    [events]
  );

  // =====================================================
  // BÚSQUEDA Y FILTROS
  // =====================================================

  const filteredEvents = useMemo(() => {
    // Normalizamos el término de búsqueda.
    const term = search
      .trim()
      .toLocaleLowerCase("es-CL");

    // Filtramos los eventos disponibles.
    return events.filter((event) => {
      // Construimos el contenido que puede buscarse.
      const text = [
        event.title,
        event.category,
        event.description,
        event.location,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("es-CL");

      // Comprobamos coincidencia de texto.
      const matchesText =
        !term || text.includes(term);

      // Comprobamos el estado seleccionado.
      const matchesStatus =
        statusFilter === "all" ||
        event.publicationStatus === statusFilter;

      // Solo conservamos las coincidencias.
      return matchesText && matchesStatus;
    });
  }, [events, search, statusFilter]);

  // =====================================================
  // ACTUALIZAR EL FORMULARIO
  // =====================================================

  function updateField(field, value) {
    // Actualizamos únicamente el campo indicado.
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    // Limpiamos el error después de corregir un campo.
    setFormError("");
  }

  // =====================================================
  // SELECCIONAR DÍAS DE LA SEMANA
  // =====================================================

  function toggleDay(dayValue) {
    // Agregamos o retiramos el día seleccionado.
    setForm((previous) => ({
      ...previous,

      daysOfWeek: previous.daysOfWeek.includes(dayValue)
        ? previous.daysOfWeek.filter(
          (day) => day !== dayValue
        )
        : [
          ...previous.daysOfWeek,
          dayValue,
        ].sort((a, b) => a - b),
    }));

    // Limpiamos los errores de validación.
    setFormError("");
  }

  // =====================================================
  // CREAR EVENTO
  // =====================================================

  function openCreate() {
    // Limpiamos el identificador de edición.
    setEditingId(null);

    // Preparamos un formulario vacío.
    setForm(emptyForm());

    // Limpiamos los errores anteriores.
    setFormError("");

    // Abrimos el formulario.
    setFormOpen(true);
  }

  // =====================================================
  // EDITAR EVENTO
  // =====================================================

  function openEdit(event) {
    // Identificamos el evento que modificaremos.
    setEditingId(event.id);

    // Cargamos los datos existentes.
    setForm({
      title: event.title || "",
      category: event.category || "Culto",
      description: event.description || "",
      date: event.date || "",
      time: event.time || "",
      endTime: event.endTime || "",

      // Recuperamos los días de recurrencia.
      daysOfWeek: [
        ...(event.recurrence?.daysOfWeek || []),
      ],

      // La programación puede no tener fecha final.
      endDate: event.recurrence?.endDate || "",

      modality: event.modality || "Presencial",
      location: event.location || "",
      meetingUrl: event.meetingUrl || "",
      publicationStatus:
        event.publicationStatus || "draft",

      // La imagen anterior no es un archivo del navegador.
      imageFile: null,
      imageUrl: event.image?.url || "",
      removeImage: false,
    });

    // Abrimos el formulario sin errores anteriores.
    setFormError("");
    setFormOpen(true);
  }

  // =====================================================
  // CERRAR FORMULARIO
  // =====================================================

  function closeForm() {
    // No cerramos mientras se está guardando.
    if (saving) return;

    // Restablecemos el estado de edición.
    setFormOpen(false);
    setEditingId(null);
    setFormError("");
  }

  // =========================================================
  // SELECCIÓN DE IMAGEN PARA EL EVENTO
  // =========================================================

  function handleImageChange(event) {

    // Obtenemos el archivo seleccionado.
    const file = event.target.files?.[0];

    // No hacemos cambios si el usuario cancela.
    if (!file) return;

    // Formatos aceptados por el backend.
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    // Validamos el formato.
    if (!validTypes.includes(file.type)) {
      setFormError(
        "La imagen debe estar en formato JPG, PNG o WebP."
      );

      event.target.value = "";
      return;
    }

    // Comprobamos el máximo de 5 MB.
    if (file.size > 5 * 1024 * 1024) {
      setFormError(
        "La imagen no puede superar los 5 MB."
      );

      event.target.value = "";
      return;
    }

    // Guardamos el archivo para enviarlo cuando se publique.
    setForm((previous) => ({
      ...previous,
      imageFile: file,
      removeImage: false,
    }));

    // Eliminamos posibles errores anteriores.
    setFormError("");

    // Permitimos volver a seleccionar el mismo archivo.
    event.target.value = "";
  }

  // =========================================================
  // DESCARTAR UNA IMAGEN RECIÉN SELECCIONADA
  // =========================================================

  function discardSelectedImage() {

    // Retiramos solamente el archivo nuevo.
    // No modificamos una portada anterior ya guardada.
    setForm((previous) => ({
      ...previous,
      imageFile: null,
    }));

    // Limpiamos los mensajes de validación.
    setFormError("");
  }

  // =====================================================
  // VALIDAR EL FORMULARIO
  // =====================================================

  function validateForm() {
    // Exigimos la información principal.
    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.date ||
      !form.time
    ) {
      return "Completa el nombre, la descripción, la fecha de inicio y la hora.";
    }

    // Toda reunión de este módulo es semanal.
    if (!form.daysOfWeek.length) {
      return "Selecciona al menos un día de la semana.";
    }

    // La hora final debe ser posterior a la inicial.
    if (
      form.endTime &&
      form.endTime <= form.time
    ) {
      return "La hora de término debe ser posterior a la de inicio.";
    }

    // La fecha final no puede ser anterior al comienzo.
    if (
      form.endDate &&
      form.endDate < form.date
    ) {
      return "La fecha final no puede ser anterior al inicio.";
    }

    // Las reuniones presenciales necesitan una dirección.
    if (
      form.modality !== "Online" &&
      !form.location.trim()
    ) {
      return "Indica el lugar de la reunión.";
    }

    // Las reuniones en línea necesitan un enlace válido.
    if (form.modality !== "Presencial") {
      try {
        const url = new URL(form.meetingUrl);

        if (
          !["http:", "https:"].includes(url.protocol)
        ) {
          throw new Error("Enlace inválido");
        }
      } catch {
        return "Ingresa un enlace válido para la reunión en línea.";
      }
    }

    // No encontramos errores.
    return "";
  }

  // =====================================================
  // GUARDAR EVENTO
  // =====================================================

  async function handleSave(event) {
    // Impedimos recargar la página.
    event.preventDefault();

    // Evitamos solicitudes duplicadas.
    if (saving) return;

    // Validamos antes de enviar al servidor.
    const error = validateForm();

    if (error) {
      setFormError(error);
      return;
    }

    // Activamos el guardado.
    setSaving(true);
    setFormError("");
    setFeedback(null);

    try {
      // Construimos los campos permitidos por Event.js.
      const data = {
        title: form.title.trim(),
        category: form.category,
        description: form.description.trim(),

        // Fecha de inicio de la programación.
        date: form.date,

        // Horario habitual.
        time: form.time,
        endTime: form.endTime || "",

        // Modalidad de la reunión.
        modality: form.modality,

        // Guardamos la dirección si corresponde.
        location:
          form.modality === "Online"
            ? ""
            : form.location.trim(),

        // Guardamos el enlace si corresponde.
        meetingUrl:
          form.modality === "Presencial"
            ? ""
            : form.meetingUrl.trim(),

        // Programación de los días semanales.
        recurrence: {
          type: "weekly",
          daysOfWeek: form.daysOfWeek,

          // La fecha final es opcional.
          ...(form.endDate
            ? { endDate: form.endDate }
            : {}),
        },

        // Borrador o publicado.
        publicationStatus: form.publicationStatus,

        // Solo enviamos removeImage cuando editamos.
        ...(editingId && form.removeImage
          ? { removeImage: true }
          : {}),
      };

      // Preparamos un formulario compatible con imágenes.
      const formData = new FormData();

      // El backend recibe el contenido en data.
      formData.append(
        "data",
        JSON.stringify(data)
      );

      // Adjuntamos la portada únicamente cuando existe.
      if (form.imageFile) {
        formData.append(
          "image",
          form.imageFile
        );
      }

      // api.js utiliza JSON por defecto.
      // Para este formulario necesitamos multipart.
      const options = {
        headers: {
          "Content-Type": "multipart/form-data",
        },

        // Las imágenes pueden tardar más en subirse.
        timeout: 30000,
      };

      // Editamos cuando existe un identificador.
      const response = editingId
        ? await api.patch(
          `/events/${encodeURIComponent(editingId)}`,
          formData,
          options
        )
        : await api.post(
          "/events",
          formData,
          options
        );

      // Recuperamos los datos confirmados por el servidor.
      const savedEvent = response.data?.event;

      // Evitamos mostrar operaciones no confirmadas.
      if (!savedEvent?.id) {
        throw new Error(
          "No fue posible confirmar que el evento se guardó."
        );
      }

      // Actualizamos el listado sin registros duplicados.
      setEvents((previous) =>
        editingId
          ? previous.map((item) =>
            item.id === savedEvent.id
              ? savedEvent
              : item
          )
          : [savedEvent, ...previous]
      );

      // Cerramos el formulario tras guardar correctamente.
      setFormOpen(false);
      setEditingId(null);

      // Informamos el resultado.
      setFeedback({
        type: response.data.warning
          ? "warning"
          : "success",

        message:
          response.data.warning ||
          response.data.message ||
          "Evento guardado correctamente.",
      });
    } catch (saveError) {
      // Conservamos los campos para poder corregir errores.
      setFormError(getErrorMessage(saveError));
    } finally {
      // React permite nuevas operaciones.
      setSaving(false);
    }
  }

  // =====================================================
  // CAMBIAR ESTADO DE PUBLICACIÓN
  // =====================================================

  async function changePublication(event) {
    // Evitamos dos cambios simultáneos.
    if (changingId) return;

    // Alternamos entre publicado y borrador.
    const nextStatus =
      event.publicationStatus === "published"
        ? "draft"
        : "published";

    setChangingId(event.id);
    setFeedback(null);

    try {
      // Enviamos solamente el estado actualizado.
      const response = await api.patch(
        `/events/${encodeURIComponent(event.id)}/publication`,
        {
          publicationStatus: nextStatus,
        }
      );

      // Comprobamos la respuesta.
      if (!response.data?.event?.id) {
        throw new Error(
          "No se pudo actualizar la publicación."
        );
      }

      // Actualizamos el evento que cambió.
      setEvents((previous) =>
        previous.map((item) =>
          item.id === event.id
            ? response.data.event
            : item
        )
      );

      // Informamos el estado final.
      setFeedback({
        type: "success",

        message:
          nextStatus === "published"
            ? "Evento publicado correctamente."
            : "Evento guardado como borrador.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error),
      });
    } finally {
      setChangingId(null);
    }
  }

  // =====================================================
  // ELIMINAR EVENTO
  // =====================================================

  async function confirmDelete() {
    // Debe existir un evento seleccionado.
    if (!deletingEvent || deleting) return;

    setDeleting(true);
    setFeedback(null);

    try {
      // Solicitamos la eliminación al backend.
      const response = await api.delete(
        `/events/${encodeURIComponent(deletingEvent.id)}`
      );

      // Retiramos el evento del listado.
      setEvents((previous) =>
        previous.filter(
          (item) => item.id !== deletingEvent.id
        )
      );

      // Informamos el resultado.
      setFeedback({
        type: response.data?.warning
          ? "warning"
          : "success",

        message:
          response.data?.warning ||
          response.data?.message ||
          "Evento eliminado correctamente.",
      });

      // Cerramos la confirmación.
      setDeletingEvent(null);
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error),
      });
    } finally {
      setDeleting(false);
    }
  }

  // =====================================================
  // INTERFAZ PRINCIPAL
  // =====================================================

  return (
    <main className="public-events-management-page">

      {/* =============================================== */}
      {/* ENCABEZADO */}
      {/* =============================================== */}

      <header className="public-events-management-page__header">

        <div>
          <span className="public-events-management-page__eyebrow">
            CONTENIDOS DEL SITIO
          </span>

          <h1>
            <CalendarDays
              size={28}
              aria-hidden="true"
            />
            Gestión de eventos
          </h1>

          <p>
            Publica los cultos y encuentros que se
            realizan habitualmente, con sus días,
            horarios y lugares.
          </p>
        </div>

        {/* Acciones principales. */}

        <div className="public-events-management-page__header-actions">

          <Link
            to="/eventos"
            className="public-events-management-page__public-link"
          >
            <Eye size={17} aria-hidden="true" />
            Ver página pública
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>

          <button
            className="public-events-management-page__primary"
            type="button"
            onClick={openCreate}
          >
            <CalendarPlus size={18} aria-hidden="true" />
            Nuevo evento
          </button>

        </div>
      </header>

      {/* =============================================== */}
      {/* MENSAJES DE OPERACIONES */}
      {/* =============================================== */}

      {feedback && (
        <div
          className={
            `public-events-management-page__feedback ` +
            `public-events-management-page__feedback--${feedback.type}`
          }
          role={
            feedback.type === "error"
              ? "alert"
              : "status"
          }
        >
          <span>{feedback.message}</span>

          {feedback.type === "error" && (
            <button
              type="button"
              onClick={() => {
                setFeedback(null);
                loadEvents();
              }}
            >
              Reintentar
            </button>
          )}
        </div>
      )}

      {/* =============================================== */}
      {/* TARJETAS DE RESUMEN */}
      {/* =============================================== */}

      <section
        className="public-events-management-page__summary"
        aria-label="Resumen de eventos"
      >
        <article>
          <CalendarDays size={22} aria-hidden="true" />
          <span>Total de eventos</span>
          <strong>{summary.total}</strong>
        </article>

        <article>
          <CheckCircle2 size={22} aria-hidden="true" />
          <span>Publicados</span>
          <strong>{summary.published}</strong>
        </article>

        <article>
          <FilePenLine size={22} aria-hidden="true" />
          <span>Borradores</span>
          <strong>{summary.drafts}</strong>
        </article>
      </section>

      {/* =============================================== */}
      {/* LISTADO DE EVENTOS */}
      {/* =============================================== */}

      <section className="public-events-management-page__panel">

        <div className="public-events-management-page__panel-heading">
          <div>
            <span className="public-events-management-page__eyebrow">
              PROGRAMACIÓN SEMANAL
            </span>

            <h2>Eventos registrados</h2>

            <p>
              Consulta y actualiza las reuniones
              habituales de la iglesia.
            </p>
          </div>

          <span className="public-events-management-page__count">
            {filteredEvents.length} resultados
          </span>
        </div>

        {/* Buscador y filtro de publicación. */}

        <div className="public-events-management-page__toolbar">

          <label className="public-events-management-page__search">

            <Search
              size={18}
              aria-hidden="true"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Buscar por nombre, categoría o lugar..."
              aria-label="Buscar eventos"
            />
          </label>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            aria-label="Filtrar eventos por estado"
          >
            <option value="all">
              Todos los estados
            </option>

            <option value="published">
              Publicados
            </option>

            <option value="draft">
              Borradores
            </option>
          </select>
        </div>

        {/* Estado de carga. */}

        {loading ? (
          <p
            className="public-events-management-page__empty"
            role="status"
          >
            Cargando eventos...
          </p>
        ) : filteredEvents.length === 0 ? (

          /* No hay eventos o los filtros no encontraron resultados. */
          <div className="public-events-management-page__empty">

            <CalendarDays
              size={36}
              strokeWidth={1.5}
              aria-hidden="true"
            />

            <h3>
              {events.length
                ? "No se encontraron eventos"
                : "Todavía no hay eventos registrados"}
            </h3>

            <p>
              {events.length
                ? "Prueba con otros filtros de búsqueda."
                : "Selecciona «Nuevo evento» para comenzar a publicar la programación semanal."}
            </p>

          </div>
        ) : (

          /* Tarjetas de eventos reales. */
          <div className="public-events-management-page__event-grid">

            {filteredEvents.map((event) => (
              <article
                className="public-events-management-page__event"
                key={event.id}
              >

                {/* Portada opcional. */}

                <div className="public-events-management-page__event-media">
                  {event.image?.url ? (
                    <img
                      src={event.image.url}
                      alt=""
                      loading="lazy"
                    />
                  ) : (
                    <ImageIcon
                      size={30}
                      aria-hidden="true"
                    />
                  )}
                </div>

                {/* Información del evento. */}

                <div className="public-events-management-page__event-body">

                  <div className="public-events-management-page__event-top">

                    <span className="public-events-management-page__category">
                      {event.category}
                    </span>

                    <span
                      className={
                        `public-events-management-page__status ` +
                        `public-events-management-page__status--${event.publicationStatus}`
                      }
                    >
                      {event.publicationStatus === "published"
                        ? "Publicado"
                        : "Borrador"}
                    </span>
                  </div>

                  <h3>{event.title}</h3>
                  <p>{event.description}</p>

                  {/* Días, horas y lugar. */}

                  <div className="public-events-management-page__event-meta">

                    <span>
                      <Repeat2 size={16} aria-hidden="true" />

                      {formatDays(
                        event.recurrence?.daysOfWeek
                      )}
                    </span>

                    <span>
                      <Clock3 size={16} aria-hidden="true" />

                      {event.time}

                      {event.endTime
                        ? ` a ${event.endTime}`
                        : ""} hrs
                    </span>

                    <span>
                      <MapPin size={16} aria-hidden="true" />

                      {event.modality === "Online"
                        ? "En línea"
                        : event.location || event.modality}
                    </span>

                    <span>
                      <CalendarDays size={16} aria-hidden="true" />

                      Desde {formatDate(event.date)}

                      {event.recurrence?.endDate
                        ? ` hasta ${formatDate(event.recurrence.endDate)}`
                        : ""}
                    </span>

                  </div>
                </div>

                {/* Acciones administrativas. */}

                <div className="public-events-management-page__event-actions">

                  <button
                    type="button"
                    onClick={() => openEdit(event)}
                    disabled={Boolean(changingId) || deleting}
                  >
                    <Pencil size={16} aria-hidden="true" />
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => changePublication(event)}
                    disabled={Boolean(changingId) || deleting}
                  >
                    {event.publicationStatus === "published"
                      ? "Pasar a borrador"
                      : "Publicar"}
                  </button>

                  <button
                    className="public-events-management-page__danger"
                    type="button"
                    onClick={() => setDeletingEvent(event)}
                    disabled={Boolean(changingId) || deleting}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                    Eliminar
                  </button>

                </div>

              </article>
            ))}

          </div>
        )}

      </section>

      {/* =============================================== */}
      {/* FORMULARIO PARA CREAR Y EDITAR */}
      {/* =============================================== */}

      {formOpen && (
        <div
          className="public-events-management-page__overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeForm();
            }
          }}
        >
          <section
            className="public-events-management-page__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="public-event-form-title"
          >

            {/* Encabezado del formulario. */}

            <header className="public-events-management-page__dialog-header">

              <div>
                <span className="public-events-management-page__eyebrow">
                  PROGRAMACIÓN DE EVENTOS
                </span>

                <h2 id="public-event-form-title">
                  {editingId
                    ? "Editar evento"
                    : "Nuevo evento"}
                </h2>

                <p>
                  Completa los detalles que las personas
                  necesitan para asistir.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                aria-label="Cerrar formulario"
              >
                <X size={21} />
              </button>
            </header>

            {/* Formulario principal. */}

            <form
              className="public-events-management-page__form"
              onSubmit={handleSave}
            >

              {formError && (
                <p
                  className="public-events-management-page__form-error"
                  role="alert"
                >
                  {formError}
                </p>
              )}

              <div className="public-events-management-page__form-grid">

                {/* Nombre del evento. */}

                <label>
                  Nombre del evento *

                  <input
                    value={form.title}
                    onChange={(event) =>
                      updateField(
                        "title",
                        event.target.value
                      )
                    }
                    required
                    maxLength={120}
                    placeholder="Ej.: Culto general"
                  />
                </label>

                {/* Categoría. */}

                <label>
                  Categoría *

                  <select
                    value={form.category}
                    onChange={(event) =>
                      updateField(
                        "category",
                        event.target.value
                      )
                    }
                  >
                    {EVENT_CATEGORIES.map((item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Descripción pública. */}

                <label className="public-events-management-page__full">
                  Descripción *

                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(event) =>
                      updateField(
                        "description",
                        event.target.value
                      )
                    }
                    required
                    maxLength={2000}
                    placeholder="Cuenta brevemente de qué trata este encuentro."
                  />
                </label>

                {/* Fecha inicial de la programación. */}

                <label>
                  Fecha desde la que comienza *

                  <input
                    type="date"
                    value={form.date}
                    onChange={(event) =>
                      updateField(
                        "date",
                        event.target.value
                      )
                    }
                    required
                  />
                </label>

                {/* Fecha final opcional. */}

                <label>
                  Fecha de término (opcional)

                  <input
                    type="date"
                    min={form.date || undefined}
                    value={form.endDate}
                    onChange={(event) =>
                      updateField(
                        "endDate",
                        event.target.value
                      )
                    }
                  />
                </label>

                {/* Selección de días semanales. */}

                <fieldset className="public-events-management-page__days public-events-management-page__full">

                  <legend>
                    ¿Qué días de la semana se realiza? *
                  </legend>

                  <div>
                    {WEEK_DAYS.map((day) => (
                      <label
                        key={day.value}
                        className={
                          form.daysOfWeek.includes(day.value)
                            ? "selected"
                            : ""
                        }
                      >
                        <input
                          type="checkbox"
                          checked={
                            form.daysOfWeek.includes(day.value)
                          }
                          onChange={() =>
                            toggleDay(day.value)
                          }
                        />

                        {day.label}
                      </label>
                    ))}
                  </div>

                  <small>
                    El evento se repetirá semanalmente
                    en los días seleccionados.
                  </small>

                </fieldset>

                {/* Horario habitual. */}

                <label>
                  Hora de inicio *

                  <input
                    type="time"
                    value={form.time}
                    onChange={(event) =>
                      updateField(
                        "time",
                        event.target.value
                      )
                    }
                    required
                  />
                </label>

                <label>
                  Hora de término (opcional)

                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(event) =>
                      updateField(
                        "endTime",
                        event.target.value
                      )
                    }
                  />
                </label>

                {/* Modalidad de reunión. */}

                <label>
                  Modalidad *

                  <select
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
                      En línea
                    </option>

                    <option value="Híbrida">
                      Presencial y en línea
                    </option>
                  </select>
                </label>

                {/* Estado de publicación. */}

                <label>
                  Estado de publicación

                  <select
                    value={form.publicationStatus}
                    onChange={(event) =>
                      updateField(
                        "publicationStatus",
                        event.target.value
                      )
                    }
                  >
                    <option value="draft">
                      Guardar como borrador
                    </option>

                    <option value="published">
                      Publicar evento
                    </option>
                  </select>
                </label>

                {/* Ubicación para eventos presenciales. */}

                {form.modality !== "Online" && (
                  <label className="public-events-management-page__full">
                    Lugar de reunión *

                    <input
                      value={form.location}
                      onChange={(event) =>
                        updateField(
                          "location",
                          event.target.value
                        )
                      }
                      required
                      maxLength={300}
                      placeholder="Ej.: Dirección o lugar donde se realiza"
                    />
                  </label>
                )}

                {/* Enlace para reuniones en línea. */}

                {form.modality !== "Presencial" && (
                  <label className="public-events-management-page__full">
                    Enlace para participar en línea *

                    <input
                      type="url"
                      value={form.meetingUrl}
                      onChange={(event) =>
                        updateField(
                          "meetingUrl",
                          event.target.value
                        )
                      }
                      required
                      maxLength={2000}
                      placeholder="https://..."
                    />
                  </label>
                )}


                {/* ===================================================== */}
                {/* CARGA PERSONALIZADA DE IMAGEN DEL EVENTO */}
                {/* ===================================================== */}

                <div className="public-events-management-page__upload-section public-events-management-page__full">

                  {/* Encabezado del apartado. */}

                  <div className="public-events-management-page__upload-heading">

                    <span>Imagen del evento (opcional)</span>

                    <small>JPG, PNG o WebP · Máximo 5 MB</small>

                  </div>

                  {/* Área seleccionable para subir o cambiar una imagen. */}

                  <label className="public-events-management-page__upload-area">

                    {/* Input real accesible para teclado y mouse. */}

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                      aria-label="Seleccionar imagen del evento"
                    />

                    {/* Icono decorativo. */}

                    <span className="public-events-management-page__upload-icon">
                      <ImagePlus
                        size={27}
                        strokeWidth={1.7}
                        aria-hidden="true"
                      />
                    </span>

                    {/* Texto principal. */}

                    <strong>
                      {form.imageFile
                        ? "Imagen seleccionada"
                        : form.imageUrl && !form.removeImage
                          ? "Cambiar imagen del evento"
                          : "Agrega una imagen para tu evento"}
                    </strong>

                    {/* Mensaje de ayuda. */}

                    <span className="public-events-management-page__upload-description">
                      {form.imageFile
                        ? form.imageFile.name
                        : "Selecciona una imagen desde tu dispositivo."}
                    </span>

                    {/* Botón visual, sin un segundo input. */}

                    <span className="public-events-management-page__upload-button">
                      {form.imageFile || (form.imageUrl && !form.removeImage)
                        ? "Seleccionar otra imagen"
                        : "Seleccionar imagen"}
                    </span>

                  </label>

                  {/* ===================================================== */}
                  {/* VISTA PREVIA */}
                  {/* ===================================================== */}

                  {(imagePreview || (form.imageUrl && !form.removeImage)) && (

                    <div className="public-events-management-page__preview">

                      {/* Imagen nueva o portada previamente guardada. */}

                      <img
                        src={imagePreview || form.imageUrl}
                        alt="Vista previa de la portada del evento"
                      />

                      {/* Información de la imagen. */}

                      <div className="public-events-management-page__preview-info">

                        <strong>
                          {form.imageFile
                            ? "Nueva imagen lista para guardar"
                            : "Imagen actual del evento"}
                        </strong>

                        <small>
                          {form.imageFile
                            ? form.imageFile.name
                            : "Esta imagen ya está guardada."}
                        </small>

                        {/* Descartamos solamente una selección nueva. */}

                        {form.imageFile && (
                          <button
                            type="button"
                            onClick={discardSelectedImage}
                            className="public-events-management-page__preview-remove"
                          >
                            <X size={15} aria-hidden="true" />
                            Descartar selección
                          </button>
                        )}

                      </div>

                    </div>
                  )}

                  {/* ===================================================== */}
                  {/* QUITAR PORTADA EXISTENTE */}
                  {/* ===================================================== */}

                  {editingId && form.imageUrl && !form.imageFile && (

                    <label className="public-events-management-page__remove-image">

                      <input
                        type="checkbox"
                        checked={form.removeImage}
                        onChange={(event) =>
                          updateField("removeImage", event.target.checked)
                        }
                      />

                      Quitar la imagen actual al guardar los cambios

                    </label>
                  )}

                </div>


              </div>

              {/* Acciones del formulario. */}

              <footer className="public-events-management-page__dialog-actions">

                <button
                  type="button"
                  className="public-events-management-page__secondary"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="public-events-management-page__primary"
                  disabled={saving}
                >
                  {saving
                    ? "Guardando..."
                    : editingId
                      ? "Guardar cambios"
                      : "Guardar evento"}
                </button>

              </footer>
            </form>

          </section>
        </div>
      )}

      {/* =============================================== */}
      {/* CONFIRMACIÓN DE ELIMINACIÓN */}
      {/* =============================================== */}

      {deletingEvent && (
        <div
          className="public-events-management-page__overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !deleting
            ) {
              setDeletingEvent(null);
            }
          }}
        >
          <section
            className="public-events-management-page__confirm"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="public-event-delete-title"
          >

            <h2 id="public-event-delete-title">
              ¿Eliminar este evento?
            </h2>

            <p>
              Se eliminará «{deletingEvent.title}»
              de la programación. Esta acción no
              se puede deshacer.
            </p>

            <div className="public-events-management-page__dialog-actions">

              <button
                type="button"
                className="public-events-management-page__secondary"
                onClick={() => setDeletingEvent(null)}
                disabled={deleting}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="public-events-management-page__danger-button"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting
                  ? "Eliminando..."
                  : "Sí, eliminar evento"}
              </button>

            </div>

          </section>
        </div>
      )}

    </main>
  );
}

// Página compartida por administradores y superadministradores.
export default PublicEventsManagement;
