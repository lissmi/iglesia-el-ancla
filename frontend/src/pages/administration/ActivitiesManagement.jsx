import { useCallback, useEffect, useMemo, useState } from "react";

import { CalendarDays, CalendarPlus, CheckCircle2, Clock3, Eye, Trash2, FilePenLine, Image as ImageIcon, Info, MapPin, MonitorPlay, Pencil, Repeat2, Search, UsersRound } from "lucide-react";
// =========================================================
// ESTILOS
// =========================================================

import "../../styles/pages/administration/ActivitiesManagement.css";

import ActivityFormModal from "../../components/administration/activities/ActivityFormModal";

import ActivityDetailsModal from "../../components/administration/activities/ActivityDetailsModal";

import ActivityConfirmationsModal from "../../components/administration/activities/ActivityConfirmationsModal";

import ActivityDeleteModal from "../../components/administration/activities/ActivityDeleteModal";

// Reutilizamos la única instancia Axios del proyecto.
// api.js ya configura la URL del backend y las cookies HttpOnly.
import api from "../../services/api";

// =========================================================
// LAS ACTIVIDADES SE CONSULTAN DIRECTAMENTE EN MONGODB ATLAS
// =========================================================

// =========================================================
// UTILIDADES DE FORMATO
// =========================================================

function formatActivityDate(dateString) {
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
// PREPARAR ENVÍO DE ACTIVIDADES CON IMAGEN OPCIONAL
// =========================================================

// Este constructor se usa tanto al crear como al editar.
// La ruta de Express espera el JSON en «data» y el archivo en «image».
function buildActivityFormData(activityData, isEditing) {
  // Retiramos propiedades temporales que solo utiliza React.
  const { imageFile, imagePreview, removeImage, ...fields } = activityData;

  // FormData permite enviar información y un archivo en una misma solicitud.
  const formData = new FormData();

  // Solo solicitamos retirar la imagen cuando editamos una actividad existente.
  const payload = {
    ...fields,
    ...(isEditing && removeImage ? { removeImage: true } : {}),
  };

  // Serializamos los datos de la actividad, sin vista previa en Base64.
  formData.append("data", JSON.stringify(payload));

  // La imagen es opcional: si no hay archivo, solo enviamos «data».
  if (imageFile) formData.append("image", imageFile);

  // Devolvemos los datos preparados para Axios.
  return formData;
}

// Devolvemos mensajes manejables cuando una petición falla.
function getActivitiesErrorMessage(error) {
  // Priorizamos el mensaje de error que envió nuestro backend.
  if (error?.response?.data?.message) return error.response.data.message;

  // Diferenciamos los tiempos de espera de errores genéricos.
  if (error?.code === "ECONNABORTED") {
    return "La solicitud tardó demasiado. Comprueba si la actividad se guardó antes de reintentar.";
  }

  // Mensaje seguro si no hay respuesta disponible del servidor.
  return error?.message || "No se pudo completar la operación. Revisa tu conexión.";
}

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function ActivitiesManagement() {
  // =========================================================
  // ESTADO DE ACTIVIDADES REALES Y CONEXIÓN API
  // =========================================================

  // Iniciamos vacíos: no mostramos datos ficticios en producción.
  const [activities, setActivities] = useState([]);

  // Indicamos cuándo estamos consultando MongoDB Atlas.
  const [isLoading, setIsLoading] = useState(true);

  // Evitamos operaciones duplicadas durante peticiones al backend.
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [changingActivityId, setChangingActivityId] = useState(null);

  // Mensajes visibles de confirmación, advertencia o error.
  const [feedback, setFeedback] = useState(null);

  // Consultamos las actividades al cargar o al solicitar reintento.
  const loadActivities = useCallback(async (signal) => {
    setIsLoading(true);
    setFeedback(null);

    try {
      // El backend comprueba el rol desde la cookie HttpOnly.
      // Consultamos actividades con el mismo api.js utilizado por Biblioteca.
      // Combinamos registros administrativos con confirmaciones reales.
      // No almacenamos contadores redundantes en la colección activities.
      const [response, attendanceResponse] = await Promise.all([
        api.get("/activities/admin", { signal }),
        api.get("/activities/attendance/admin-summary", { signal }),
      ]);
      const counts = new Map(
        (attendanceResponse.data?.counts || []).map((item) => [item.activityId, item.confirmed])
      );
      const remoteActivities = (response.data?.activities || []).map((event) => ({
        ...event,
        confirmations: counts.get(event.id) || 0,
      }));

      // Verificamos el formato de la respuesta antes de mostrarlo.
      if (!Array.isArray(remoteActivities)) throw new Error("Formato de actividades inválido");

      // Evitamos actualizar el estado si se canceló la petición.
      if (!signal?.aborted) setActivities(remoteActivities);
    } catch (error) {
      if (signal?.aborted || error?.code === "ERR_CANCELED") return;
      setFeedback({ type: "error", message: getActivitiesErrorMessage(error) });
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, []);

  // Cargamos al abrir la página y cancelamos al desmontarla.
  useEffect(() => {
    const controller = new AbortController();
    loadActivities(controller.signal);
    return () => controller.abort();
  }, [loadActivities]);

  // =========================================================
  // ESTADO DEL FORMULARIO
  // =========================================================

  // Controla si el modal está abierto.
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Almacena la actividad seleccionada para edición.
  // null significa que estamos creando uno nuevo.
  const [selectedActivity, setSelectedActivity] = useState(null);

  // Actividad cuyo borrado se está confirmando.
  // Mantenerlo separado evita eliminar accidentalmente la actividad en edición.
  const [activityToDelete, setActivityToDelete] = useState(null);

  // =========================================================
  // ESTADO DE LA VISTA DE DETALLES
  // =========================================================

  // Guarda el identificador de la actividad que queremos consultar.
  const [detailsActivityId, setDetailsActivityId] = useState(null);

  // Obtiene siempre la versión actualizada de la actividad.
  const detailsActivity =
    activities.find((event) => event.id === detailsActivityId) ?? null;

  // =========================================================
  // ESTADO DE CONFIRMACIONES
  // =========================================================

  const [confirmationsActivityId, setConfirmationsActivityId] =
    useState(null);

  const confirmationsActivity =
    activities.find(
      (event) => event.id === confirmationsActivityId
    ) ?? null;

  function handleViewConfirmations(event) {
    setConfirmationsActivityId(event.id);
  }

  function handleCloseConfirmations() {
    setConfirmationsActivityId(null);
    // Actualizamos los totales al cerrar el modal de asistencia.
    loadActivities();
  }

  // =========================================================
  // ESTADO DEL BUSCADOR
  // =========================================================

  const [search, setSearch] = useState("");

  // =========================================================
  // FILTROS AVANZADOS
  // =========================================================

  const [statusFilter, setStatusFilter] = useState("all");
  const [modalityFilter, setModalityFilter] = useState("all");

  // Restablecer todos los filtros.
  function handleClearFilters() {
    setSearch("");
    setStatusFilter("all");
    setModalityFilter("all");
  }

  // =========================================================
  // ABRIR FORMULARIO PARA CREAR
  // =========================================================

  function handleCreateActivity() {
    setSelectedActivity(null);
    setIsFormOpen(true);
  }

  // =========================================================
  // ABRIR FORMULARIO PARA EDITAR
  // =========================================================

  function handleEditActivity(event) {
    setSelectedActivity(event);
    setIsFormOpen(true);
  }

  // =========================================================
  // ABRIR DETALLES DE LA ACTIVIDAD
  // =========================================================

  function handleViewDetails(event) {
    setDetailsActivityId(event.id);
  }

  // =========================================================
  // CERRAR DETALLES DE LA ACTIVIDAD
  // =========================================================

  function handleCloseDetails() {
    setDetailsActivityId(null);
  }

  // =========================================================
  // EDITAR DESDE LA VISTA DE DETALLES
  // =========================================================

  function handleEditFromDetails(event) {
    handleCloseDetails();
    handleEditActivity(event);
  }

  // =========================================================
  // CERRAR FORMULARIO
  // =========================================================

  function handleCloseForm() {
    setIsFormOpen(false);
    setSelectedActivity(null);
  }

  // =========================================================
  // GUARDAR ACTIVIDAD EN MONGODB Y PORTADA EN CLOUDINARY
  // =========================================================

  async function handleSaveActivity(activityData) {
    // No enviamos el mismo formulario dos veces mientras guarda.
    if (isSaving) return;

    setIsSaving(true);
    setFeedback(null);

    try {
      // Preparamos el JSON del formulario y, si existe, su imagen.
      const formData = buildActivityFormData(activityData, Boolean(selectedActivity));

      // Editamos mediante PATCH o creamos mediante POST.
      // Axios reutiliza las cookies HttpOnly desde api.js.
      const response = selectedActivity
        ? await api.patch(`/activities/${encodeURIComponent(selectedActivity.id)}`, formData, {
            // Igual que Biblioteca Solidaria: envío multipart para archivos.
            headers: { "Content-Type": "multipart/form-data" },
            // Cloudinary puede requerir más tiempo que una consulta JSON.
            timeout: 30000,
          })
        : await api.post("/activities", formData, {
            headers: { "Content-Type": "multipart/form-data" },
            timeout: 30000,
          });

      // Axios devuelve la respuesta del backend dentro de .data.
      const result = response.data;

      // Verificamos que el backend devuelva la actividad persistido.
      if (!result?.activity?.id) {
        throw new Error("El servidor no devolvió la actividad guardada");
      }

      // Actualizamos React usando el registro confirmado por MongoDB.
      setActivities((previous) => selectedActivity
        ? previous.map((item) =>
            item.id === result.activity.id
              ? { ...result.activity, confirmations: item.confirmations }
              : item
          )
        : [result.activity, ...previous]);

      // Informamos cualquier aviso sobre la limpieza de Cloudinary.
      setFeedback({
        type: result.warning ? "warning" : "success",
        message: result.warning || result.message || "Actividad guardada correctamente.",
      });

      // Cerramos el formulario solamente después de guardar con éxito.
      handleCloseForm();
    } catch (error) {
      // Conservamos los datos del modal para que se puedan corregir.
      const message = error?.response?.data?.message || getActivitiesErrorMessage(error);
      setFeedback({ type: "error", message });
      throw new Error(message);
    } finally {
      setIsSaving(false);
    }
  }

  // =========================================================
  // ELIMINACIÓN DE ACTIVIDADES
  // =========================================================

  // Solicita la confirmación: todavía no elimina nada.
  function handleRequestDelete(event) {
    setActivityToDelete(event);
  }

  // Cierra la confirmación sin modificar las actividades.
  function handleCancelDelete() {
    setActivityToDelete(null);
  }

  // Eliminamos el registro real después de la confirmación.
  async function handleConfirmDelete() {
    if (!activityToDelete || isDeleting) return;

    // Conservamos el identificador incluso mientras llega la respuesta.
    const activityId = activityToDelete.id;
    setIsDeleting(true);
    setFeedback(null);

    try {
      // El backend elimina el registro y su imagen opcional.
      const response = await api.delete(`/activities/${encodeURIComponent(activityId)}`);
      const result = response.data;

      // React refleja la eliminación confirmada por MongoDB.
      setActivities((previous) => previous.filter((event) => event.id !== activityId));

      // Cerramos otros diálogos asociados con ese registro.
      if (detailsActivityId === activityId) setDetailsActivityId(null);
      if (confirmationsActivityId === activityId) setConfirmationsActivityId(null);
      if (selectedActivity?.id === activityId) handleCloseForm();

      setFeedback({ type: "success", message: result?.message || "Actividad eliminada." });
    } catch (error) {
      // No eliminamos la actividad en pantalla cuando el backend falla.
      setFeedback({ type: "error", message: getActivitiesErrorMessage(error) });
    } finally {
      // Cerramos el diálogo y liberamos la operación.
      setActivityToDelete(null);
      setIsDeleting(false);
    }
  }

  // =========================================================
  // GESTIÓN DEL ESTADO DE PUBLICACIÓN EN MONGODB
  // =========================================================

  async function handleChangePublicationStatus(activityId, newStatus) {
    if (changingActivityId) return;

    setChangingActivityId(activityId);
    setFeedback(null);

    try {
      // Aplicamos el cambio con el endpoint PATCH protegido.
      const response = await api.patch(
        `/activities/${encodeURIComponent(activityId)}/publication`,
        { publicationStatus: newStatus }
      );
      const result = response.data;
      if (!result?.activity?.id) throw new Error("Respuesta de publicación inválida");

      // Reemplazamos los datos anteriores por los confirmados.
      setActivities((previous) => previous.map((event) =>
        event.id === activityId
          ? { ...result.activity, confirmations: event.confirmations }
          : event
      ));

      setFeedback({
        type: "success",
        message: newStatus === "published" ? "Actividad publicada." : "Actividad pasada a borrador.",
      });
    } catch (error) {
      setFeedback({ type: "error", message: getActivitiesErrorMessage(error) });
    } finally {
      setChangingActivityId(null);
    }
  }

  // =========================================================
  // RESUMEN DE ACTIVIDADES
  // =========================================================

  // =========================================================
  // RESUMEN DE ACTIVIDADES
  // =========================================================

  const summary = useMemo(() => {
    return {
      total: activities.length,

      published: activities.filter(
        (event) =>
          event.publicationStatus === "published"
      ).length,

      drafts: activities.filter(
        (event) =>
          event.publicationStatus === "draft"
      ).length,

      withConfirmation: activities.filter((event) => event.requiresConfirmation).length,
    };
  }, [activities]);

  // =========================================================
  // BÚSQUEDA Y FILTROS COMBINADOS
  // =========================================================

  const filteredActivities = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("es-CL");

    return activities.filter((event) => {
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

      // Modalidad.
      const matchesModality =
        modalityFilter === "all" ||
        event.modality === modalityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesModality
      );
    });
  }, [
    activities,
    search,
    statusFilter,
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

          <h1>Gestión de actividades</h1>

          <p>
            Organiza las actividades de la iglesia, administra
            su programación y consulta las confirmaciones
            de los miembros registrados.
          </p>
        </div>

        {/* El formulario se construirá después. */}

        <button
          className="events-management-page__create"
          type="button"
          onClick={handleCreateActivity}
        >
          <CalendarPlus
            size={19}
            aria-hidden="true"
          />

          Nueva actividad
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
          <strong>Actividades sincronizadas</strong>

          <p>
            Los miembros pueden ver las actividades publicadas, confirmar su
            participación y registrar lo que llevarán cuando se solicite cooperación.
          </p>
        </div>
      </div>

      {/* Estado de carga, avisos y errores devueltos por la API. */}
      {isLoading && (
        <p role="status">Cargando actividades desde el servidor...</p>
      )}

      {feedback && (
        <div
          className="events-management-page__notice"
          role={feedback.type === "error" ? "alert" : "status"}
        >
          <Info size={19} aria-hidden="true" />
          <div><strong>{feedback.type === "error" ? "No se pudo completar la operación" : "Información"}</strong><p>{feedback.message}</p></div>
          {feedback.type === "error" && (
            <button type="button" onClick={() => loadActivities()}>Reintentar consulta</button>
          )}
        </div>
      )}

      {/* ============================================= */}
      {/* TARJETAS DE RESUMEN */}
      {/* ============================================= */}

      <section
        className="events-management-page__summary"
        aria-label="Resumen de actividades"
      >
        <article className="events-management-summary-card">
          <div className="events-management-summary-card__icon">
            <CalendarDays size={23} aria-hidden="true" />
          </div>

          <div>
            <span>Total de actividades</span>
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
            <UsersRound size={23} aria-hidden="true" />
          </div>

          <div>
            <span>Con confirmación</span>
            <strong>{summary.withConfirmation}</strong>
            <small>Requieren inscripción</small>
          </div>
        </article>
      </section>

      {/* ============================================= */}
      {/* LISTADO DE ACTIVIDADES */}
      {/* ============================================= */}

      <section className="events-management-page__listing">

        <div className="events-management-page__listing-header">
          <div>
            <h2>Actividades registradas</h2>

            <p>
              Consulta las actividades y su estado
              de publicación.
            </p>
          </div>

          <span className="events-management-page__count">
            {filteredActivities.length} resultados
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
              aria-label="Buscar actividades"
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

        {!isLoading && filteredActivities.length > 0 ? (
          <div className="events-management-page__table-scroll">
            <table className="events-management-page__table">
              <thead>
                <tr>
                  <th scope="col">Actividad</th>
                  <th scope="col">Fecha y hora</th>
                  <th scope="col">Modalidad</th>
                  <th scope="col">Publicación</th>
                  <th scope="col">Asistencia</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filteredActivities.map((event) => {
                  const isPublished =
                    event.publicationStatus === "published";

                  return (
                    <tr key={event.id}>

                      {/* ACTIVIDAD */}

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

                          {/* Nombre y categoría visibles para cualquier actividad. */}
                          <div className="events-management-page__event-copy">
                            <strong>{event.title}</strong>
                            <span>{event.category}</span>
            {event.cooperation?.enabled && <span>Con cooperación</span>}
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

                            {formatActivityDate(event.date)}
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
                      {/* ACCIONES DE LA ACTIVIDAD */}
                      {/* ============================================= */}

                      <td>
                        <div className="events-management-page__actions">

                          {/* VER DETALLES */}

                          <button
                            className="events-management-page__details-button"
                            type="button"
                            onClick={() => handleViewDetails(event)}
                            aria-label={`Ver detalles de ${event.title}`}
                            title="Ver detalles de la actividad"
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

                          {/* EDITAR ACTIVIDAD */}

                          <button
                            className="events-management-page__edit-button"
                            type="button"
                            disabled={isSaving || isDeleting}
                            onClick={() => handleEditActivity(event)}
                            aria-label={`Editar actividad ${event.title}`}
                            title="Editar actividad"
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
                            disabled={Boolean(changingActivityId) || isSaving || isDeleting}
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

                          {/* ELIMINAR ACTIVIDAD CON CONFIRMACIÓN */}
                          <button
                            className="events-management-page__delete-button"
                            type="button"
                            disabled={isSaving || isDeleting}
                            onClick={() => handleRequestDelete(event)}
                            aria-label={`Eliminar actividad ${event.title}`}
                            title="Eliminar actividad"
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
        ) : !isLoading ? (
          <div className="events-management-page__empty">
            <CalendarDays
              size={36}
              strokeWidth={1.5}
              aria-hidden="true"
            />

            <h3>No se encontraron actividades</h3>

            <p>
              {activities.length === 0
                ? "Todavía no hay actividades registradas. Puedes crear la primera desde Nueva actividad."
                : "Prueba con otro término de búsqueda o cambia los filtros."}
            </p>
          </div>
        ) : null}

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
            Actividades puntuales para miembros
          </strong>

          <p>
            El módulo administra actividades con una fecha concreta,
            permite actualizar su estado de publicación
            y administrar imágenes opcionales. El registro
            de confirmaciones se encuentra conectado a la participación de miembros.
          </p>
        </div>
      </footer>

      {/* ============================================= */}
      {/* FORMULARIO DE CREACIÓN Y EDICIÓN */}
      {/* ============================================= */}

      <ActivityFormModal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSave={handleSaveActivity}
        activityToEdit={selectedActivity}
        isSaving={isSaving}
      />

      {/* ============================================= */}
      {/* VISTA DE DETALLES DE LA ACTIVIDAD */}
      {/* ============================================= */}

      <ActivityDetailsModal
        isOpen={Boolean(detailsActivity)}
        activity={detailsActivity}
        onClose={handleCloseDetails}
        onEdit={handleEditFromDetails}
      />

      {/* ============================================= */}
      {/* GESTIÓN DE CONFIRMACIONES */}
      {/* ============================================= */}

      <ActivityConfirmationsModal
        isOpen={Boolean(confirmationsActivity)}
        activity={confirmationsActivity}
        onClose={handleCloseConfirmations}
      />

      {/* Confirmación destructiva; no borra sin autorización explícita. */}
      <ActivityDeleteModal
        activity={activityToDelete}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

    </div>
  );
}

export default ActivitiesManagement;
