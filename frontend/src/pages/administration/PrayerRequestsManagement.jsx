/* =========================================================
   GESTIÓN DE PETICIONES DE ORACIÓN - IGLESIA EL ANCLA
   Archivo: frontend/src/pages/administration/PrayerRequestsManagement.jsx
   CRUD real conectado a una API protegida.
========================================================= */

// React controla los filtros y la consulta de MongoDB.
import { useCallback, useEffect, useMemo, useState } from "react";

// Conservamos iconos y diseño actuales.
import {
  AlertTriangle, CheckCircle2, Clock3, Eye, HandHeart, HeartHandshake,
  LockKeyhole, Plus, Search, ShieldCheck, Trash2, UsersRound, X,
} from "lucide-react";

// Único cliente Axios del proyecto.
import api from "../../services/api";

// Modal existente, ahora con creación y edición reales.
import PrayerRequestDetailsModal from "../../components/administration/prayers/PrayerRequestDetailsModal";

// CSS administrativo ya existente.
import "../../styles/pages/administration/PrayerRequestsManagement.css";

// Etiquetas que reciben los administradores y los miembros.
const STATUS_CONFIG = {
  pending: { label: "Pendiente", className: "pending" },
  praying: { label: "En oración", className: "praying" },
  answered: { label: "Respondida", className: "answered" },
  completed: { label: "Finalizada", className: "completed" },
};

// El backend devuelve fechas ISO con zona horaria; formateamos en Chile.
function formatDate(value) {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha no disponible";
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit", month: "short", year: "numeric", timeZone: "America/Santiago",
  }).format(date);
}

// Preferimos mensajes legibles, conservando los errores del servidor.
function getMessage(error) {
  return error?.response?.data?.message || error?.message || "No se pudo realizar la operación.";
}

function PrayerRequestsManagement() {
  // Registros reales; nunca iniciamos con peticiones ficticias.
  const [requests, setRequests] = useState([]);

  // Estados de carga y mensajes.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  // Control del formulario administrativo y de la petición seleccionada.
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  // Control del diálogo de confirmación de eliminación.
  const [deletingRequest, setDeletingRequest] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Filtros del catálogo actual.
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [privacyFilter, setPrivacyFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Recuperamos la petición más reciente del estado, evitando datos obsoletos.
  const selectedRequest = selectedRequestId
    ? requests.find((item) => item.id === selectedRequestId) || null
    : null;

  // =====================================================
  // CONSULTAR PETICIONES EN MONGODB
  // =====================================================
  const loadRequests = useCallback(async (signal) => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/prayer-requests/admin", { signal });
      if (!Array.isArray(response.data?.requests)) {
        throw new Error("El servidor no devolvió una lista válida de peticiones.");
      }
      if (!signal?.aborted) setRequests(response.data.requests);
    } catch (loadError) {
      if (!signal?.aborted && loadError?.code !== "ERR_CANCELED") {
        setError(getMessage(loadError));
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  // Cargamos registros al ingresar y cancelamos la petición al salir.
  useEffect(() => {
    const controller = new AbortController();
    loadRequests(controller.signal);
    return () => controller.abort();
  }, [loadRequests]);

  // =====================================================
  // CREAR Y EDITAR PETICIÓN
  // =====================================================
  function openCreate() {
    setSelectedRequestId(null);
    setFeedback("");
    setModalOpen(true);
  }

  function openDetails(request) {
    setSelectedRequestId(request.id);
    setFeedback("");
    setModalOpen(true);
  }

  function closeDetails() {
    setModalOpen(false);
    setSelectedRequestId(null);
  }

  // Esperamos el resultado HTTP antes de cerrar el modal.
  async function handleSaveDetails(requestId, changes) {
    const response = requestId
      ? await api.patch(`/prayer-requests/admin/${encodeURIComponent(requestId)}`, changes)
      : await api.post("/prayer-requests/admin", changes);

    const saved = response.data?.request;
    if (!saved?.id) throw new Error("No se pudo confirmar el guardado de la petición.");

    // Actualizamos inmediatamente la tabla y sus estadísticas.
    setRequests((old) => requestId
      ? old.map((item) => item.id === saved.id ? saved : item)
      : [saved, ...old]);

    setFeedback(response.data?.message || "Petición guardada correctamente.");
    closeDetails();
  }

  // =====================================================
  // ELIMINACIÓN REAL CON CONFIRMACIÓN
  // =====================================================
  async function confirmDelete() {
    if (!deletingRequest || deleting) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await api.delete(`/prayer-requests/admin/${encodeURIComponent(deletingRequest.id)}`);
      // Solo retiramos la fila si el backend confirmó la eliminación.
      setRequests((old) => old.filter((item) => item.id !== deletingRequest.id));
      setFeedback("Petición eliminada correctamente.");
      setDeletingRequest(null);
    } catch (deleteFailure) {
      setDeleteError(getMessage(deleteFailure));
    } finally {
      setDeleting(false);
    }
  }

  // =====================================================
  // ESTADÍSTICAS Y FILTROS LOCALES
  // =====================================================
  const summary = useMemo(() => ({
    total: requests.length,
    pending: requests.filter((item) => item.status === "pending").length,
    praying: requests.filter((item) => item.status === "praying").length,
    answered: requests.filter((item) => item.status === "answered").length,
    completed: requests.filter((item) => item.status === "completed").length,
  }), [requests]);

  const categories = useMemo(() =>
    [...new Set(requests.map((item) => item.category))].sort((a, b) => a.localeCompare(b, "es")),
    [requests]
  );

  const filteredRequests = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("es-CL");
    return requests.filter((item) => {
      // Nunca incluimos la descripción privada en el buscador de la tabla.
      const haystack = [item.title, item.category, item.requester, item.id]
        .filter(Boolean).join(" ").toLocaleLowerCase("es-CL");
      return (!term || haystack.includes(term)) &&
        (statusFilter === "all" || item.status === statusFilter) &&
        (privacyFilter === "all" || item.visibility === privacyFilter) &&
        (categoryFilter === "all" || item.category === categoryFilter);
    });
  }, [requests, search, statusFilter, privacyFilter, categoryFilter]);

  const hasFilters = Boolean(search.trim()) || statusFilter !== "all" || privacyFilter !== "all" || categoryFilter !== "all";

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setPrivacyFilter("all");
    setCategoryFilter("all");
  }

  // =====================================================
  // VISTA ADMINISTRATIVA
  // =====================================================
  return (
    <div className="prayer-management-page">
      <header className="prayer-management-page__header">
        <div className="prayer-management-page__heading">
          <span className="prayer-management-page__eyebrow">ADMINISTRACIÓN</span>
          <h1>Peticiones de oración</h1>
          <p>Consulta, organiza y acompaña las peticiones recibidas por la comunidad.</p>
        </div>
        {/* Acciones del encabezado administrativo. */}
        <div className="prayer-management-page__header-actions">

          {/* Botón para abrir el formulario de creación. */}
          <button
            type="button"
            className="prayer-management-page__new-button"
            onClick={openCreate}
          >
            <Plus size={17} aria-hidden="true" />
            Nueva petición
          </button>

          {/* Icono decorativo del encabezado. */}
          <div className="prayer-management-page__header-icon">
            <HandHeart size={28} aria-hidden="true" />
          </div>

        </div>
      </header>

      <div className="prayer-management-page__privacy-notice">
        <ShieldCheck size={21} aria-hidden="true" />
        <p><strong>Información confidencial.</strong> Las peticiones privadas solo las leen su autor y administradores autorizados. Las identidades anónimas no se muestran a otros miembros.</p>
      </div>

      {feedback && <div className="prayer-management-page__feedback" role="status">{feedback}</div>}
      {error && <div className="prayer-management-page__error" role="alert">{error} <button type="button" onClick={() => loadRequests()}>Reintentar</button></div>}

      <section className="prayer-management-page__summary" aria-label="Resumen de peticiones">
        {[
          { label: "Total de peticiones", value: summary.total, hint: "Registradas", Icon: UsersRound },
          { label: "Pendientes", value: summary.pending, hint: "Esperando atención", Icon: Clock3 },
          { label: "En oración", value: summary.praying, hint: "En acompañamiento", Icon: HeartHandshake },
          { label: "Respondidas", value: summary.answered, hint: "Con respuesta registrada", Icon: CheckCircle2 },
          { label: "Finalizadas", value: summary.completed, hint: "Seguimiento concluido", Icon: ShieldCheck },
        ].map(({ label, value, hint, Icon }) => (
          <article key={label} className="prayer-management-page__summary-card">
            <div className="prayer-management-page__summary-icon"><Icon size={21} aria-hidden="true" /></div>
            <span>{label}</span><strong>{value}</strong><small>{hint}</small>
          </article>
        ))}
      </section>

      <section className="prayer-management-page__content">
        <div className="prayer-management-page__section-header">
          <div><h2>Solicitudes recibidas</h2><p>Administra el contenido, privacidad y estado de las peticiones.</p></div>
          <span className="prayer-management-page__result-count">{filteredRequests.length} resultados</span>
        </div>

        <div className="prayer-management-page__filters">
          <label className="prayer-management-page__search">
            <Search size={19} aria-hidden="true" />
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)}
              maxLength={80} placeholder="Buscar por título, nombre o código..." aria-label="Buscar peticiones" />
          </label>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filtrar por estado">
            <option value="all">Todos los estados</option>
            {Object.entries(STATUS_CONFIG).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}
          </select>
          <select value={privacyFilter} onChange={(event) => setPrivacyFilter(event.target.value)} aria-label="Filtrar por privacidad">
            <option value="all">Toda la privacidad</option>
            <option value="community">Comunitaria</option>
            <option value="private">Privada</option>
          </select>
          <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} aria-label="Filtrar por categoría">
            <option value="all">Todas las categorías</option>
            {categories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
        </div>
        {hasFilters && <button type="button" className="prayer-management-page__clear-filters" onClick={clearFilters}>Limpiar filtros</button>}

        <div className="prayer-management-page__table-wrapper">
          <table className="prayer-management-page__table">
            <thead><tr>
              <th>Petición</th><th>Solicitante</th><th>Fecha</th><th>Privacidad</th><th>Estado</th><th>Acciones</th>
            </tr></thead>
            <tbody>
              {!loading && !error && filteredRequests.map((request) => {
                const status = STATUS_CONFIG[request.status] || STATUS_CONFIG.pending;
                return <tr key={request.id}>
                  <td><div className="prayer-management-page__request"><strong>{request.title}</strong><small>{request.category}</small></div></td>
                  <td><div className="prayer-management-page__requester"><strong>{request.requester}</strong>
                    {request.anonymous && <span className="prayer-management-page__anonymous-label"><LockKeyhole size={12} /> Anónimo para miembros</span>}
                  </div></td>
                  <td>{formatDate(request.date)}</td>
                  <td><span className={`prayer-management-page__privacy-badge prayer-management-page__privacy-badge--${request.visibility}`}>
                    {request.visibility === "private" ? <><LockKeyhole size={13} /> Privada</> : "Comunitaria"}
                  </span></td>
                  <td><span className={`prayer-management-page__status prayer-management-page__status--${status.className}`}>{status.label}</span></td>
                  <td><div className="prayer-management-page__row-actions">
                    <button type="button" className="prayer-management-page__details-button" onClick={() => openDetails(request)}>
                      <Eye size={16} /> Ver / editar
                    </button>
                    <button type="button" className="prayer-management-page__delete-button" onClick={() => { setDeleteError(""); setDeletingRequest(request); }}
                      aria-label={`Eliminar petición ${request.title}`}><Trash2 size={16} /> Eliminar</button>
                  </div></td>
                </tr>;
              })}
              {loading && <tr><td colSpan={6} className="prayer-management-page__empty">Cargando peticiones...</td></tr>}
              {!loading && !error && filteredRequests.length === 0 && <tr><td colSpan={6} className="prayer-management-page__empty">No hay peticiones que coincidan con los filtros.</td></tr>}
            </tbody>
          </table>
        </div>
        <footer className="prayer-management-page__footer">
          <LockKeyhole size={16} /> <span>El acceso a esta información está restringido a administradores autorizados.</span>
        </footer>
      </section>

      {/* Reutilizamos el modal para crear, editar, consultar y cambiar estado. */}
      <PrayerRequestDetailsModal isOpen={modalOpen} request={selectedRequest} onClose={closeDetails} onSave={handleSaveDetails} />

      {/* ===================================================== */}
      {/* CONFIRMACIÓN DE ELIMINACIÓN - PETICIONES DE ORACIÓN */}
      {/* ===================================================== */}
      {deletingRequest && (
        <div
          className="prayer-management-page__delete-overlay"
          onMouseDown={(event) => {
            // Solo cerramos al pulsar el fondo y si no se está eliminando.
            if (event.target === event.currentTarget && !deleting) {
              setDeletingRequest(null);
            }
          }}
        >
          <section
            className="prayer-management-page__delete-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-prayer-title"
            aria-describedby="delete-prayer-description"
          >
            {/* Icono de advertencia y cierre seguro. */}
            <div className="prayer-management-page__delete-header">
              <span className="prayer-management-page__delete-icon" aria-hidden="true">
                <AlertTriangle size={27} strokeWidth={1.8} />
              </span>
              <button
                type="button"
                className="prayer-management-page__delete-close"
                onClick={() => setDeletingRequest(null)}
                disabled={deleting}
                aria-label="Cerrar confirmación de eliminación"
              >
                <X size={19} aria-hidden="true" />
              </button>
            </div>

            {/* Identificamos claramente el recurso que se eliminará. */}
            <span className="prayer-management-page__delete-eyebrow">
              ELIMINAR PETICIÓN
            </span>
            <h2 id="delete-prayer-title">¿Eliminar esta petición?</h2>
            <p id="delete-prayer-description" className="prayer-management-page__delete-description">
              Estás a punto de eliminar la siguiente petición de oración:
            </p>
            <div className="prayer-management-page__delete-request">
              <HandHeart size={18} aria-hidden="true" />
              <strong>{deletingRequest.title}</strong>
            </div>
            <p className="prayer-management-page__delete-warning">
              Esta acción es permanente y no se puede deshacer.
            </p>

            {/* Los fallos del servidor se muestran sin cerrar el modal. */}
            {deleteError && (
              <p className="prayer-management-page__delete-error" role="alert">
                {deleteError}
              </p>
            )}

            {/* Conservamos confirmDelete y su conexión con la API. */}
            <div className="prayer-management-page__delete-actions">
              <button
                type="button"
                className="prayer-management-page__delete-cancel"
                onClick={() => setDeletingRequest(null)}
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="prayer-management-page__delete-confirm"
                onClick={confirmDelete}
                disabled={deleting}
              >
                <Trash2 size={16} aria-hidden="true" />
                {deleting ? "Eliminando..." : "Sí, eliminar petición"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default PrayerRequestsManagement;
