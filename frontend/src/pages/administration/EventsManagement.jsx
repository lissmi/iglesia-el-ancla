import { useMemo, useState } from "react";

import { CalendarDays, CalendarPlus, CheckCircle2, Clock3, Eye, Trash2, FilePenLine, Image as ImageIcon, Info, MapPin, MonitorPlay, Pencil, Repeat2, Search, UsersRound } from "lucide-react";
// =========================================================
// ESTILOS
// =========================================================

import "../../styles/pages/administration/EventsManagement.css";

import EventFormModal from "../../components/administration/events/EventFormModal";

import EventDetailsModal from "../../components/administration/events/EventDetailsModal";

import EventConfirmationsModal from "../../components/administration/events/EventConfirmationsModal";

import EventDeleteModal from "../../components/administration/events/EventDeleteModal";

// =========================================================
// DATOS TEMPORALES DE DEMOSTRACIÓN
// =========================================================

// Estos eventos son ficticios y se utilizan
// exclusivamente para visualizar el módulo.
//
// Más adelante se reemplazarán por datos
// obtenidos desde MongoDB.
//
// recurrence.type:
// - none: evento individual.
// - weekly: evento recurrente semanal.
//
// publicationStatus:
// - published: publicado.
// - draft: borrador.

const DEMO_EVENTS = [
  {
    id: "EVT-001",
    title: "Culto general",
    category: "Culto",
    date: "2026-10-11",
    time: "11:00",
    modality: "Presencial",
    location: "Iglesia El Ancla",
    recurrence: {
      type: "weekly",
      dayOfWeek: 0,
    },
    publicationStatus: "published",
    confirmations: 0,
  },
  {
    id: "EVT-002",
    title: "Descubriendo la Biblia",
    category: "Estudio bíblico",
    date: "2026-10-13",
    time: "20:00",
    modality: "Online",
    location: "Reunión online",
    recurrence: {
      type: "weekly",
      dayOfWeek: 2,
    },
    publicationStatus: "published",
    confirmations: 0,
  },
  {
    id: "EVT-003",
    title: "Reunión de oración",
    category: "Oración",
    date: "2026-10-14",
    time: "21:00",
    modality: "Online",
    location: "Reunión online",
    recurrence: {
      type: "weekly",
      dayOfWeek: 3,
    },
    publicationStatus: "published",
    confirmations: 0,
  },
  {
    id: "EVT-004",
    title: "Encuentro de jóvenes",
    category: "Jóvenes",
    date: "2026-10-17",
    time: "18:00",
    modality: "Presencial",
    location: "Iglesia El Ancla",
    recurrence: {
      type: "none",
    },
    publicationStatus: "draft",
    confirmations: 0,
  },
  {
    id: "EVT-005",
    title: "Taller para niños",
    category: "Taller",
    date: "2026-10-24",
    time: "16:00",
    modality: "Presencial",
    location: "Iglesia El Ancla",
    recurrence: {
      type: "none",
    },
    publicationStatus: "published",
    confirmations: 0,
  },
];

// =========================================================
// UTILIDADES DE FORMATO
// =========================================================

function formatEventDate(dateString) {
  if (!dateString) {
    return "Sin fecha";
  }

  // Usamos mediodía UTC para evitar que
  // una fecha YYYY-MM-DD cambie de día
  // al representarse en Chile.

  const date = new Date(`${dateString}T12:00:00Z`);

  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function EventsManagement() {
  // =========================================================
  // ESTADO DE EVENTOS
  // =========================================================

  // Iniciamos con los eventos de demostración.
  // Los cambios permanecerán en memoria mientras
  // la aplicación siga abierta.

  const [events, setEvents] = useState(DEMO_EVENTS);

  // =========================================================
  // ESTADO DEL FORMULARIO
  // =========================================================

  // Controla si el modal está abierto.
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Almacena el evento seleccionado para edición.
  // null significa que estamos creando uno nuevo.
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Evento cuyo borrado se está confirmando.
  // Mantenerlo separado evita eliminar accidentalmente el evento en edición.
  const [eventToDelete, setEventToDelete] = useState(null);

  // =========================================================
  // ESTADO DE LA VISTA DE DETALLES
  // =========================================================

  // Guarda el identificador del evento que queremos consultar.
  const [detailsEventId, setDetailsEventId] = useState(null);

  // Obtiene siempre la versión actualizada del evento.
  const detailsEvent =
    events.find((event) => event.id === detailsEventId) ?? null;

  // =========================================================
  // ESTADO DE CONFIRMACIONES
  // =========================================================

  const [confirmationsEventId, setConfirmationsEventId] =
    useState(null);

  const confirmationsEvent =
    events.find(
      (event) => event.id === confirmationsEventId
    ) ?? null;

  function handleViewConfirmations(event) {
    setConfirmationsEventId(event.id);
  }

  function handleCloseConfirmations() {
    setConfirmationsEventId(null);
  }

  // =========================================================
  // ESTADO DEL BUSCADOR
  // =========================================================

  const [search, setSearch] = useState("");

  // =========================================================
  // FILTROS AVANZADOS
  // =========================================================

  const [statusFilter, setStatusFilter] = useState("all");
  const [frequencyFilter, setFrequencyFilter] = useState("all");
  const [modalityFilter, setModalityFilter] = useState("all");

  // Restablecer todos los filtros.
  function handleClearFilters() {
    setSearch("");
    setStatusFilter("all");
    setFrequencyFilter("all");
    setModalityFilter("all");
  }

  // =========================================================
  // ABRIR FORMULARIO PARA CREAR
  // =========================================================

  function handleCreateEvent() {
    setSelectedEvent(null);
    setIsFormOpen(true);
  }

  // =========================================================
  // ABRIR FORMULARIO PARA EDITAR
  // =========================================================

  function handleEditEvent(event) {
    setSelectedEvent(event);
    setIsFormOpen(true);
  }

  // =========================================================
  // ABRIR DETALLES DEL EVENTO
  // =========================================================

  function handleViewDetails(event) {
    setDetailsEventId(event.id);
  }

  // =========================================================
  // CERRAR DETALLES DEL EVENTO
  // =========================================================

  function handleCloseDetails() {
    setDetailsEventId(null);
  }

  // =========================================================
  // EDITAR DESDE LA VISTA DE DETALLES
  // =========================================================

  function handleEditFromDetails(event) {
    handleCloseDetails();
    handleEditEvent(event);
  }

  // =========================================================
  // CERRAR FORMULARIO
  // =========================================================

  function handleCloseForm() {
    setIsFormOpen(false);
    setSelectedEvent(null);
  }

  // =========================================================
  // GUARDAR EVENTO
  // =========================================================

  function handleSaveEvent(eventData) {
    // Los datos transitorios de carga no se guardan como campos del evento.
    const { imageFile, imagePreview, removeImage, ...cleanEventData } = eventData;

    // Mantiene la imagen original si el usuario no la modificó.
    let eventImage = selectedEvent?.image ?? null;

    // Quitar imagen tiene prioridad sobre conservarla.
    if (removeImage) {
      eventImage = null;
    } else if (imageFile && imagePreview) {
      // En esta vista DEMO solo guardamos una data URL temporal.
      // En producción el backend subirá imageFile a Cloudinary y guardará URL/publicId.
      eventImage = {
        url: imagePreview,
        fileName: imageFile.name,
        mimeType: imageFile.type,
        size: imageFile.size,
        publicId: null,
        alt: `Imagen de ${cleanEventData.title}`,
      };
    }

    if (selectedEvent) {
      // Edición: reemplazar los datos del registro sin modificar su ID.
      setEvents((previousEvents) =>
        previousEvents.map((event) =>
          event.id === selectedEvent.id
            ? { ...event, ...cleanEventData, id: event.id, image: eventImage }
            : event
        )
      );
    } else {
      // Creación: construir un evento temporal con cero confirmaciones.
      const newEvent = {
        ...cleanEventData,
        id: `EVT-${crypto.randomUUID()}`,
        image: eventImage,
        confirmations: 0,
      };

      setEvents((previousEvents) => [...previousEvents, newEvent]);
    }

    // Liberar la selección y cerrar la ventana de edición.
    handleCloseForm();
  }

  // =========================================================
  // ELIMINACIÓN DE EVENTOS
  // =========================================================

  // Solicita la confirmación: todavía no elimina nada.
  function handleRequestDelete(event) {
    setEventToDelete(event);
  }

  // Cierra la confirmación sin modificar los eventos.
  function handleCancelDelete() {
    setEventToDelete(null);
  }

  // Elimina únicamente el evento identificado en la confirmación.
  function handleConfirmDelete() {
    if (!eventToDelete) return;

    const eventId = eventToDelete.id;

    // Actualizamos React; el listado, filtros y resumen se recalculan solos.
    setEvents((previousEvents) =>
      previousEvents.filter((event) => event.id !== eventId)
    );

    // Evitamos dejar modales secundarios asociados al registro eliminado.
    if (detailsEventId === eventId) setDetailsEventId(null);
    if (confirmationsEventId === eventId) setConfirmationsEventId(null);
    if (selectedEvent?.id === eventId) handleCloseForm();

    // Quitamos la selección que activó el modal de confirmación.
    setEventToDelete(null);
  }

  // =========================================================
  // GESTIÓN DEL ESTADO DE PUBLICACIÓN
  // =========================================================

  // Cambia el estado de publicación de un evento.
  function handleChangePublicationStatus(eventId, newStatus) {
    setEvents((previousEvents) =>
      previousEvents.map((event) =>
        event.id === eventId
          ? {
            ...event,
            publicationStatus: newStatus,
          }
          : event
      )
    );
  }

  // =========================================================
  // RESUMEN DE EVENTOS
  // =========================================================

  // =========================================================
  // RESUMEN DE EVENTOS
  // =========================================================

  const summary = useMemo(() => {
    return {
      total: events.length,

      published: events.filter(
        (event) =>
          event.publicationStatus === "published"
      ).length,

      drafts: events.filter(
        (event) =>
          event.publicationStatus === "draft"
      ).length,

      recurring: events.filter(
        (event) =>
          event.recurrence?.type === "weekly"
      ).length,
    };
  }, [events]);

  // =========================================================
  // BÚSQUEDA Y FILTROS COMBINADOS
  // =========================================================

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("es-CL");

    return events.filter((event) => {
      // Búsqueda textual.
      const searchableText = [
        event.title,
        event.category,
        event.description,
        event.modality,
        event.location,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("es-CL");

      const matchesSearch = searchableText.includes(query);

      // Estado de publicación.
      const matchesStatus =
        statusFilter === "all" ||
        event.publicationStatus === statusFilter;

      // Frecuencia.
      const matchesFrequency =
        frequencyFilter === "all" ||
        event.recurrence?.type === frequencyFilter;

      // Modalidad.
      const matchesModality =
        modalityFilter === "all" ||
        event.modality === modalityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesFrequency &&
        matchesModality
      );
    });
  }, [
    events,
    search,
    statusFilter,
    frequencyFilter,
    modalityFilter,
  ]);

  // =========================================================
  // INTERFAZ
  // =========================================================

  return (
    <div className="events-management-page">

      

      {/* ============================================= */}
      {/* ENCABEZADO */}
      {/* ============================================= */}

      <header className="events-management-page__header">
        <div className="events-management-page__heading">
          <span className="events-management-page__eyebrow">
            COMUNIDAD / ACTIVIDADES
          </span>

          <h1>Gestión de eventos</h1>

          <p>
            Organiza las actividades de la iglesia,
            consulta su publicación y administra
            eventos individuales o recurrentes.
          </p>
        </div>

        {/* El formulario se construirá después. */}

        <button
          className="events-management-page__create"
          type="button"
          onClick={handleCreateEvent}
        >
          <CalendarPlus
            size={19}
            aria-hidden="true"
          />

          Nuevo evento
        </button>
      </header>

      {/* ============================================= */}
      {/* AVISO DE DEMOSTRACIÓN */}
      {/* ============================================= */}

      <div
        className="events-management-page__notice"
        role="note"
      >
        <Info
          size={19}
          aria-hidden="true"
        />

        <div>
          <strong>Vista de demostración</strong>

          <p>
            Los eventos y las estadísticas de esta
            página son ilustrativos. Todavía no
            están conectados con MongoDB.
            La creación, edición y vista previa de imágenes
            funcionan temporalmente en memoria.
          </p>
        </div>
      </div>

      {/* ============================================= */}
      {/* TARJETAS DE RESUMEN */}
      {/* ============================================= */}

      <section
        className="events-management-page__summary"
        aria-label="Resumen de eventos"
      >
        <article className="events-management-summary-card">
          <div className="events-management-summary-card__icon">
            <CalendarDays size={23} aria-hidden="true" />
          </div>

          <div>
            <span>Total de eventos</span>
            <strong>{summary.total}</strong>
            <small>Actividades registradas</small>
          </div>
        </article>

        <article className="events-management-summary-card">
          <div className="events-management-summary-card__icon">
            <CheckCircle2 size={23} aria-hidden="true" />
          </div>

          <div>
            <span>Publicados</span>
            <strong>{summary.published}</strong>
            <small>Visibles para la comunidad</small>
          </div>
        </article>

        <article className="events-management-summary-card">
          <div className="events-management-summary-card__icon">
            <FilePenLine size={23} aria-hidden="true" />
          </div>

          <div>
            <span>Borradores</span>
            <strong>{summary.drafts}</strong>
            <small>Pendientes de publicación</small>
          </div>
        </article>

        <article className="events-management-summary-card">
          <div className="events-management-summary-card__icon">
            <Repeat2 size={23} aria-hidden="true" />
          </div>

          <div>
            <span>Recurrentes</span>
            <strong>{summary.recurring}</strong>
            <small>Actividades periódicas</small>
          </div>
        </article>
      </section>

      {/* ============================================= */}
      {/* LISTADO DE EVENTOS */}
      {/* ============================================= */}

      <section className="events-management-page__listing">

        <div className="events-management-page__listing-header">
          <div>
            <h2>Eventos registrados</h2>

            <p>
              Consulta las actividades y su estado
              de publicación.
            </p>
          </div>

          <span className="events-management-page__count">
            {filteredEvents.length} resultados
          </span>
        </div>

        {/* ============================================= */}
        {/* BUSCADOR */}
        {/* ============================================= */}

        <div className="events-management-page__toolbar">
          <div className="events-management-page__search">
            <Search
              size={19}
              aria-hidden="true"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Buscar por nombre, categoría o modalidad..."
              aria-label="Buscar eventos"
            />
          </div>
        </div>


        {/* FILTROS AVANZADOS */}

        <div className="events-management-page__filters">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filtrar por publicación"
          >
            <option value="all">Todas las publicaciones</option>
            <option value="published">Publicados</option>
            <option value="draft">Borradores</option>
          </select>

          <select
            value={frequencyFilter}
            onChange={(event) => setFrequencyFilter(event.target.value)}
            aria-label="Filtrar por frecuencia"
          >
            <option value="all">Todas las frecuencias</option>
            <option value="weekly">Recurrentes</option>
            <option value="none">Eventos únicos</option>
          </select>

          <select
            value={modalityFilter}
            onChange={(event) => setModalityFilter(event.target.value)}
            aria-label="Filtrar por modalidad"
          >
            <option value="all">Todas las modalidades</option>
            <option value="Presencial">Presenciales</option>
            <option value="Online">Online</option>
            <option value="Híbrida">Híbridas</option>
          </select>

          <button
            type="button"
            className="events-management-page__clear-filters"
            onClick={handleClearFilters}
          >
            Limpiar
          </button>
        </div>

        {/* ============================================= */}
        {/* TABLA */}
        {/* ============================================= */}

        {filteredEvents.length > 0 ? (
          <div className="events-management-page__table-scroll">
            <table className="events-management-page__table">
              <thead>
                <tr>
                  <th scope="col">Evento</th>
                  <th scope="col">Fecha y hora</th>
                  <th scope="col">Modalidad</th>
                  <th scope="col">Frecuencia</th>
                  <th scope="col">Publicación</th>
                  <th scope="col">Asistencia</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filteredEvents.map((event) => {
                  const isRecurring =
                    event.recurrence.type !== "none";

                  const isPublished =
                    event.publicationStatus === "published";

                  return (
                    <tr key={event.id}>

                      {/* EVENTO */}

                      <td>
                        <div className="events-management-page__event">
                          {/* Miniatura de portada o marcador si no se cargó imagen. */}
                          <div className="events-management-page__thumbnail">
                            {event.image?.url ? (
                              <img src={event.image.url} alt="" loading="lazy" />
                            ) : (
                              <div className="events-management-page__thumbnail-placeholder">
                                <ImageIcon size={19} aria-hidden="true" />
                              </div>
                            )}
                          </div>

                          {/* Nombre y categoría visibles para cualquier evento. */}
                          <div className="events-management-page__event-copy">
                            <strong>{event.title}</strong>
                            <span>{event.category}</span>
                          </div>
                        </div>
                      </td>

                      {/* FECHA Y HORA */}

                      <td>
                        <div className="events-management-page__datetime">
                          <span>
                            <CalendarDays
                              size={15}
                              aria-hidden="true"
                            />

                            {formatEventDate(event.date)}
                          </span>

                          <span>
                            <Clock3
                              size={15}
                              aria-hidden="true"
                            />

                            {event.time} hrs
                          </span>
                        </div>
                      </td>

                      {/* MODALIDAD */}

                      <td>
                        <div className="events-management-page__modality">
                          {event.modality === "Online" ? (
                            <MonitorPlay
                              size={16}
                              aria-hidden="true"
                            />
                          ) : (
                            <MapPin
                              size={16}
                              aria-hidden="true"
                            />
                          )}

                          <span>{event.modality}</span>
                        </div>
                      </td>

                      {/* RECURRENCIA */}

                      <td>
                        <span
                          className={
                            isRecurring
                              ? "events-management-page__frequency events-management-page__frequency--recurring"
                              : "events-management-page__frequency"
                          }
                        >
                          {isRecurring ? (
                            <>
                              <Repeat2
                                size={14}
                                aria-hidden="true"
                              />

                              Semanal
                            </>
                          ) : (
                            "Único"
                          )}
                        </span>
                      </td>

                      {/* PUBLICACIÓN */}

                      <td>
                        <span
                          className={
                            isPublished
                              ? "events-management-page__status events-management-page__status--published"
                              : "events-management-page__status events-management-page__status--draft"
                          }
                        >
                          {isPublished
                            ? "Publicado"
                            : "Borrador"}
                        </span>
                      </td>

                      {/* CONFIRMACIONES */}

                      <td>
                        <span className="events-management-page__attendance">
                          <UsersRound
                            size={16}
                            aria-hidden="true"
                          />

                          {event.confirmations}
                        </span>
                      </td>

                      {/* ============================================= */}
                      {/* ACCIONES DEL EVENTO */}
                      {/* ============================================= */}

                      <td>
                        <div className="events-management-page__actions">

                          {/* VER DETALLES */}

                          <button
                            className="events-management-page__details-button"
                            type="button"
                            onClick={() => handleViewDetails(event)}
                            aria-label={`Ver detalles de ${event.title}`}
                            title="Ver detalles del evento"
                          >
                            <Eye
                              size={16}
                              aria-hidden="true"
                            />

                            Ver detalles
                          </button>

                          <button
                            className="events-management-page__details-button"
                            type="button"
                            onClick={() => handleViewConfirmations(event)}
                            aria-label={`Ver confirmaciones de ${event.title}`}
                          >
                            <UsersRound size={16} aria-hidden="true" />
                            Confirmaciones
                          </button>

                          {/* EDITAR EVENTO */}

                          <button
                            className="events-management-page__edit-button"
                            type="button"
                            onClick={() => handleEditEvent(event)}
                            aria-label={`Editar evento ${event.title}`}
                            title="Editar evento"
                          >
                            <Pencil
                              size={16}
                              aria-hidden="true"
                            />

                            Editar
                          </button>

                          {/* PUBLICAR O PASAR A BORRADOR */}

                          <button
                            className={`events-management-page__publication-button ${isPublished
                              ? "events-management-page__publication-button--draft"
                              : "events-management-page__publication-button--publish"
                              }`}
                            type="button"
                            onClick={() =>
                              handleChangePublicationStatus(
                                event.id,
                                isPublished ? "draft" : "published"
                              )
                            }
                            aria-label={
                              isPublished
                                ? `Pasar a borrador ${event.title}`
                                : `Publicar ${event.title}`
                            }
                          >
                            {isPublished ? "Pasar a borrador" : "Publicar"}
                          </button>

                          {/* ELIMINAR EVENTO CON CONFIRMACIÓN */}
                          <button
                            className="events-management-page__delete-button"
                            type="button"
                            onClick={() => handleRequestDelete(event)}
                            aria-label={`Eliminar evento ${event.title}`}
                            title="Eliminar evento"
                          >
                            <Trash2 size={16} aria-hidden="true" />
                            Eliminar
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="events-management-page__empty">
            <CalendarDays
              size={36}
              strokeWidth={1.5}
              aria-hidden="true"
            />

            <h3>No se encontraron eventos</h3>

            <p>
              Prueba con otro término de búsqueda.
            </p>
          </div>
        )}

      </section>

      {/* ============================================= */}
      {/* NOTA DE PRÓXIMAS FUNCIONALIDADES */}
      {/* ============================================= */}

      <footer className="events-management-page__footer">
        <Repeat2
          size={19}
          aria-hidden="true"
        />

        <div>
          <strong>
            Eventos individuales y recurrentes
          </strong>

          <p>
            El módulo permitirá registrar actividades
            para una fecha específica o configurar
            recurrencias semanales. También incorporará
            formularios de edición, publicación y
            gestión de confirmaciones.
          </p>
        </div>
      </footer>

      {/* ============================================= */}
      {/* FORMULARIO DE CREACIÓN Y EDICIÓN */}
      {/* ============================================= */}

      <EventFormModal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSave={handleSaveEvent}
        eventToEdit={selectedEvent}
      />

      {/* ============================================= */}
      {/* VISTA DE DETALLES DEL EVENTO */}
      {/* ============================================= */}

      <EventDetailsModal
        isOpen={Boolean(detailsEvent)}
        event={detailsEvent}
        onClose={handleCloseDetails}
        onEdit={handleEditFromDetails}
      />

      {/* ============================================= */}
      {/* GESTIÓN DE CONFIRMACIONES */}
      {/* ============================================= */}

      <EventConfirmationsModal
        isOpen={Boolean(confirmationsEvent)}
        event={confirmationsEvent}
        onClose={handleCloseConfirmations}
      />

      {/* Confirmación destructiva; no borra sin autorización explícita. */}
      <EventDeleteModal
        event={eventToDelete}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />

    </div>
  );
}

export default EventsManagement;




