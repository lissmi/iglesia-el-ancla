/* =========================================================
   PETICIONES DE ORACIÓN PARA MIEMBROS - IGLESIA EL ANCLA
   Archivo: frontend/src/pages/member/MemberPrayerRequests.jsx
   Comunidad, peticiones propias y confirmación «Estoy orando».
========================================================= */

// Hooks para cargar datos reales y controlar formularios.
import { useCallback, useEffect, useMemo, useState } from "react";

// Conservamos los iconos del diseño original del proyecto.
import {
  CalendarDays, CheckCircle2, Clock3, Eye, EyeOff, HandHeart,
  Heart, LockKeyhole, Plus, Search, Send, ShieldCheck,
  Users, X, Pencil, Trash2,
} from "lucide-react";

// Un único cliente Axios y las mismas cookies de sesión.
import api from "../../services/api";

// Conservamos las clases y estilos propios de la página.
import "../../styles/pages/member/MemberPrayerRequests.css";

// Categorías reconocidas por el modelo del backend.
const CATEGORIES = ["Salud", "Familia", "Trabajo", "Estudios", "Espiritual", "Personal", "Agradecimiento", "Otro"];

// Estados que administra la iglesia.
const STATUS_CONFIG = {
  pending: { label: "Pendiente", className: "pending" },
  praying: { label: "En oración", className: "praying" },
  answered: { label: "Respondida", className: "answered" },
  completed: { label: "Finalizada", className: "completed" },
};

// Formulario limpio de una petición nueva.
function emptyForm() {
  return { title: "", description: "", category: "", visibility: "community", anonymous: false };
}

// Mostramos las fechas con la zona horaria de Chile.
function formatDate(value) {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha no disponible";
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit", month: "short", year: "numeric", timeZone: "America/Santiago",
  }).format(date);
}

// Normalizamos el error sin exponer detalles técnicos internos.
function getErrorMessage(error) {
  return error?.response?.data?.message || error?.message || "No fue posible realizar la operación.";
}

// =========================================================
// TARJETA DE UNA PETICIÓN COMUNITARIA O PERSONAL
// =========================================================
function PrayerCard({ request, onView, onTogglePraying, changingPrayerId }) {
  const status = STATUS_CONFIG[request.status] || STATUS_CONFIG.pending;
  const canPray = request.visibility === "community" && request.status !== "completed";
  const savingPrayer = changingPrayerId === request.id;

  return (
    <article className="member-prayer__card">
      <div className="member-prayer__card-top">
        <span className="member-prayer__category">{request.category}</span>
        <span className={`member-prayer__status member-prayer__status--${status.className}`}>{status.label}</span>
      </div>

      <h3>{request.title}</h3>
      <p className="member-prayer__card-description">{request.description}</p>

      <div className="member-prayer__card-meta">
        <span><Users size={15} aria-hidden="true" /> {request.requester}</span>
        <span><CalendarDays size={15} aria-hidden="true" /> {formatDate(request.date)}</span>
      </div>

      {/* El contador no revela la identidad de quienes están orando. */}
      {request.visibility === "community" && (
        <p className="member-prayer__prayer-count">
          <Heart size={15} aria-hidden="true" />
          {request.prayerCount || 0} {request.prayerCount === 1 ? "persona está" : "personas están"} orando
        </p>
      )}

      <div className="member-prayer__card-bottom">
        <span className="member-prayer__visibility-label">
          {request.visibility === "private"
            ? <><LockKeyhole size={14} aria-hidden="true" /> Privada</>
            : <><Eye size={14} aria-hidden="true" /> Comunitaria</>}
        </span>
        <div className="member-prayer__card-actions">
          {/* Solo las peticiones comunitarias activas reciben apoyo visible. */}
          {canPray && (
            <button type="button"
              className={`member-prayer__pray-button ${request.prayingByMe ? "member-prayer__pray-button--active" : ""}`}
              onClick={() => onTogglePraying(request)} disabled={savingPrayer} aria-pressed={Boolean(request.prayingByMe)}>
              <HandHeart size={16} aria-hidden="true" />
              {savingPrayer ? "Guardando..." : request.prayingByMe ? "Estoy orando ✓" : "Estoy orando"}
            </button>
          )}
          <button type="button" className="member-prayer__view-button" onClick={() => onView(request.id)}>
            Ver petición <Eye size={15} aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}

// =========================================================
// PÁGINA PRINCIPAL
// =========================================================
function MemberPrayerRequests() {
  // El backend filtra comunitarias y privadas según la sesión.
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  // Navegación del catálogo comunitario y las peticiones propias.
  const [activeTab, setActiveTab] = useState("community");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Un formulario sirve para crear y editar las peticiones propias.
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Abrimos detalles por ID para mostrar su última versión.
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const selectedRequest = requests.find((item) => item.id === selectedRequestId) || null;

  // Estados para el botón «Estoy orando» y eliminar petición propia.
  const [changingPrayerId, setChangingPrayerId] = useState(null);
  const [deletingRequest, setDeletingRequest] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // =====================================================
  // CONSULTA PROTEGIDA AL BACKEND
  // =====================================================
  const loadRequests = useCallback(async (signal) => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/prayer-requests/member", { signal });
      if (!Array.isArray(response.data?.requests)) throw new Error("No pudimos cargar las peticiones.");
      if (!signal?.aborted) setRequests(response.data.requests);
    } catch (loadError) {
      if (!signal?.aborted && loadError?.code !== "ERR_CANCELED") setError(getErrorMessage(loadError));
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  // Cargamos al entrar y refrescamos cuando el usuario vuelve a la pestaña.
  useEffect(() => {
    const controller = new AbortController();
    loadRequests(controller.signal);
    const refresh = () => {
      if (document.visibilityState === "visible") loadRequests();
    };
    document.addEventListener("visibilitychange", refresh);
    return () => {
      controller.abort();
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [loadRequests]);

  // =====================================================
  // CONTADORES Y FILTROS
  // =====================================================
  const myRequests = useMemo(() => requests.filter((item) => item.isOwner), [requests]);
  const communityRequests = useMemo(() => requests.filter((item) => item.visibility === "community"), [requests]);
  const summary = useMemo(() => ({
    total: myRequests.length,
    active: myRequests.filter((item) => ["pending", "praying"].includes(item.status)).length,
    answered: myRequests.filter((item) => item.status === "answered").length,
  }), [myRequests]);

  const filteredRequests = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("es-CL");
    return (activeTab === "mine" ? myRequests : communityRequests).filter((item) =>
      (!term || [item.title, item.description].join(" ").toLocaleLowerCase("es-CL").includes(term)) &&
      (categoryFilter === "all" || item.category === categoryFilter)
    );
  }, [activeTab, myRequests, communityRequests, search, categoryFilter]);

  // =====================================================
  // FORMULARIO DE CREACIÓN Y EDICIÓN
  // =====================================================
  function openCreate() {
    setEditingId(null);
    setForm(emptyForm());
    setFormError("");
    setFeedback("");
    setShowForm(true);
  }

  function openEdit(request) {
    if (!request?.isOwner) return;
    setForm({ title: request.title, description: request.description, category: request.category,
      visibility: request.visibility, anonymous: Boolean(request.anonymous) });
    setEditingId(request.id);
    setFormError("");
    setSelectedRequestId(null);
    setShowForm(true);
  }

  function updateForm(event) {
    const { name, type, value, checked } = event.target;
    setForm((old) => ({ ...old, [name]: type === "checkbox" ? checked : value }));
    setFormError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setFormError("");
    try {
      const payload = { ...form, title: form.title.trim(), description: form.description.trim() };
      const response = editingId
        ? await api.patch(`/prayer-requests/member/${encodeURIComponent(editingId)}`, payload)
        : await api.post("/prayer-requests/member", payload);
      const saved = response.data?.request;
      if (!saved?.id) throw new Error("No se pudo confirmar el guardado.");
      setRequests((old) => editingId
        ? old.map((item) => item.id === saved.id ? saved : item)
        : [saved, ...old]);
      setFeedback(response.data?.message || "Tu petición fue registrada.");
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm());
      setActiveTab("mine");
      setSearch("");
      setCategoryFilter("all");
    } catch (saveError) {
      setFormError(getErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  }

  // =====================================================
  // «ESTOY ORANDO»: OPERACIÓN ATÓMICA EN MONGODB
  // =====================================================
  async function togglePraying(request) {
    if (changingPrayerId) return;
    setChangingPrayerId(request.id);
    setError("");
    try {
      const url = `/prayer-requests/member/${encodeURIComponent(request.id)}/praying`;
      const response = request.prayingByMe ? await api.delete(url) : await api.put(url);
      const updated = response.data?.request;
      if (!updated?.id) throw new Error("No se pudo registrar tu apoyo.");
      setRequests((old) => old.map((item) => item.id === updated.id ? updated : item));
      setFeedback(response.data?.message || "Tu respuesta fue registrada.");
    } catch (prayerError) {
      setError(getErrorMessage(prayerError));
    } finally {
      setChangingPrayerId(null);
    }
  }

  // =====================================================
  // ELIMINACIÓN DE UNA PETICIÓN PROPIA
  // =====================================================
  async function confirmDelete() {
    if (!deletingRequest || deleting) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await api.delete(`/prayer-requests/member/${encodeURIComponent(deletingRequest.id)}`);
      setRequests((old) => old.filter((item) => item.id !== deletingRequest.id));
      setSelectedRequestId(null);
      setDeletingRequest(null);
      setFeedback("Tu petición fue eliminada correctamente.");
    } catch (deleteFailure) {
      setDeleteError(getErrorMessage(deleteFailure));
    } finally {
      setDeleting(false);
    }
  }

  // =====================================================
  // PRESENTACIÓN PARA MIEMBROS
  // =====================================================
  return (
    <main className="member-prayer">
      <div className="member-prayer__container">
        <header className="member-prayer__header">
          <div className="member-prayer__header-content">
            <span className="member-prayer__eyebrow">COMUNIDAD EL ANCLA</span>
            <h1>Peticiones de <span>oración</span></h1>
            <p>Un espacio para compartir nuestras cargas, acompañarnos en oración y fortalecer nuestra comunidad de fe.</p>
            <button type="button" className="member-prayer__primary-button" onClick={openCreate}>
              <Plus size={19} aria-hidden="true" /> Nueva petición
            </button>
          </div>
          <div className="member-prayer__header-decoration"><HandHeart size={65} strokeWidth={1.3} aria-hidden="true" /></div>
        </header>

        {feedback && <div className="member-prayer__success" role="status"><CheckCircle2 size={20} /> {feedback}</div>}
        {error && <div className="member-prayer__error" role="alert">{error} <button type="button" onClick={() => loadRequests()}>Reintentar</button></div>}

        <section className="member-prayer__summary" aria-label="Resumen de mis peticiones">
          {[
            { label: "Mis peticiones", value: summary.total, hint: "Solicitudes realizadas", Icon: HandHeart },
            { label: "En seguimiento", value: summary.active, hint: "Pendientes o en oración", Icon: Clock3 },
            { label: "Respondidas", value: summary.answered, hint: "Con respuesta registrada", Icon: CheckCircle2 },
          ].map(({ label, value, hint, Icon }) => <article key={label} className="member-prayer__summary-card">
            <div className="member-prayer__summary-icon"><Icon size={22} /></div>
            <span>{label}</span><strong>{value}</strong><small>{hint}</small>
          </article>)}
        </section>

        <section className="member-prayer__content">
          <div className="member-prayer__section-heading">
            <div>
              <span className="member-prayer__section-eyebrow">ACOMPAÑAMIENTO ESPIRITUAL</span>
              <h2>Unidos en oración</h2>
              <p>Explora las peticiones compartidas por la comunidad o consulta tus solicitudes.</p>
            </div>
            <Heart size={28} className="member-prayer__section-heart" aria-hidden="true" />
          </div>

          <div className="member-prayer__tabs">
            <button type="button" className={`member-prayer__tab ${activeTab === "community" ? "member-prayer__tab--active" : ""}`}
              onClick={() => setActiveTab("community")}><Users size={18} /> Comunidad <span>{communityRequests.length}</span></button>
            <button type="button" className={`member-prayer__tab ${activeTab === "mine" ? "member-prayer__tab--active" : ""}`}
              onClick={() => setActiveTab("mine")}><HandHeart size={18} /> Mis peticiones <span>{myRequests.length}</span></button>
          </div>

          <div className="member-prayer__filters">
            <label className="member-prayer__search"><Search size={19} aria-hidden="true" />
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar peticiones..." aria-label="Buscar peticiones" maxLength={80} />
            </label>
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} aria-label="Filtrar por categoría">
              <option value="all">Todas las categorías</option>
              {CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>

          <div className="member-prayer__grid">
            {!loading && filteredRequests.map((request) => <PrayerCard key={request.id} request={request}
              onView={setSelectedRequestId} onTogglePraying={togglePraying} changingPrayerId={changingPrayerId} />)}
          </div>
          {loading && <div className="member-prayer__empty" role="status">Cargando peticiones...</div>}
          {!loading && !error && filteredRequests.length === 0 && <div className="member-prayer__empty">
            <HandHeart size={37} strokeWidth={1.4} /><h3>No encontramos peticiones</h3>
            <p>{activeTab === "mine" ? "Todavía no has enviado peticiones." : "No hay peticiones comunitarias con esos filtros."}</p>
          </div>}
        </section>

        <div className="member-prayer__privacy-note">
          <ShieldCheck size={20} aria-hidden="true" />
          <p>Las peticiones privadas solo son visibles para ti y los administradores autorizados. Si eliges compartir una petición anónima, otros miembros no verán tu nombre.</p>
        </div>
      </div>

      {/* ===================================================== */}
      {/* MODAL DE CREACIÓN Y EDICIÓN PERSONAL */}
      {/* ===================================================== */}
      {showForm && <div className="member-prayer__overlay" onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) setShowForm(false);
      }}>
        <section className="member-prayer__modal" role="dialog" aria-modal="true" aria-labelledby="member-prayer-form-title">
          <header className="member-prayer__modal-header">
            <div><span className="member-prayer__eyebrow">COMPARTIR UNA PETICIÓN</span>
              <h2 id="member-prayer-form-title">{editingId ? "Editar mi petición" : "Nueva petición de oración"}</h2>
              <p>Comparte lo que deseas que acompañemos en oración.</p></div>
            <button type="button" className="member-prayer__close" disabled={saving} onClick={() => setShowForm(false)} aria-label="Cerrar formulario"><X size={21} /></button>
          </header>
          <form id="member-prayer-create-form" className="member-prayer__form" onSubmit={handleSubmit}>
            {formError && <p className="member-prayer__form-error" role="alert">{formError}</p>}
            <div className="member-prayer__field"><label htmlFor="prayer-title">Título de la petición *</label>
              <input id="prayer-title" name="title" value={form.title} onChange={updateForm} required minLength={3} maxLength={120} placeholder="Ej.: Oración por mi familia" /></div>
            <div className="member-prayer__field"><label htmlFor="prayer-category">Categoría *</label>
              <select id="prayer-category" name="category" value={form.category} onChange={updateForm} required>
                <option value="">Selecciona una categoría</option>
                {CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
              </select></div>
            <div className="member-prayer__field"><label htmlFor="prayer-description">Cuéntanos tu petición *</label>
              <textarea id="prayer-description" name="description" value={form.description} onChange={updateForm}
                required minLength={5} maxLength={2000} rows={5} placeholder="Escribe aquello por lo que deseas que oremos..." />
              <small>{form.description.length}/2000 caracteres.</small></div>
            <fieldset className="member-prayer__fieldset"><legend>¿Quién podrá leer tu petición?</legend>
              <label className={`member-prayer__choice ${form.visibility === "community" ? "member-prayer__choice--selected" : ""}`}>
                <input type="radio" name="visibility" value="community" checked={form.visibility === "community"} onChange={updateForm} />
                <Users size={20} aria-hidden="true" /><span><strong>Comunitaria</strong><small>Los miembros registrados podrán leerte y acompañarte en oración.</small></span>
              </label>
              <label className={`member-prayer__choice ${form.visibility === "private" ? "member-prayer__choice--selected" : ""}`}>
                <input type="radio" name="visibility" value="private" checked={form.visibility === "private"} onChange={updateForm} />
                <LockKeyhole size={20} aria-hidden="true" /><span><strong>Privada</strong><small>Solo tú y los administradores autorizados podrán leerla.</small></span>
              </label>
            </fieldset>
            <label className="member-prayer__anonymous-option">
              <input type="checkbox" name="anonymous" checked={form.anonymous} onChange={updateForm} />
              <EyeOff size={20} aria-hidden="true" /><span><strong>Ocultar mi nombre a otros miembros</strong>
                <small>Los administradores siempre podrán identificarte para brindarte acompañamiento.</small></span>
            </label>
            <div className="member-prayer__form-notice"><ShieldCheck size={18} />
              <p>Tu petición estará vinculada a tu cuenta, incluso si eliges la opción anónima.</p></div>
          </form>
          <footer className="member-prayer__modal-footer">
            <button type="button" className="member-prayer__secondary-button" onClick={() => setShowForm(false)} disabled={saving}>Cancelar</button>
            <button type="submit" form="member-prayer-create-form" className="member-prayer__primary-button" disabled={saving}>
              <Send size={17} /> {saving ? "Guardando..." : editingId ? "Guardar cambios" : "Enviar petición"}
            </button>
          </footer>
        </section>
      </div>}

      {/* ===================================================== */}
      {/* MODAL DE DETALLES Y ACCIONES SOBRE PETICIONES PROPIAS */}
      {/* ===================================================== */}
      {selectedRequest && <div className="member-prayer__overlay" onMouseDown={(event) => {
        if (event.target === event.currentTarget) setSelectedRequestId(null);
      }}>
        <section className="member-prayer__modal member-prayer__modal--details" role="dialog" aria-modal="true" aria-labelledby="member-prayer-detail-title">
          <header className="member-prayer__modal-header">
            <div><span className="member-prayer__eyebrow">{selectedRequest.category}</span>
              <h2 id="member-prayer-detail-title">{selectedRequest.title}</h2></div>
            <button type="button" className="member-prayer__close" onClick={() => setSelectedRequestId(null)} aria-label="Cerrar detalles"><X size={21} /></button>
          </header>
          <div className="member-prayer__details-content">
            <div className="member-prayer__details-meta">
              <span><Users size={16} /> {selectedRequest.requester}</span>
              <span><CalendarDays size={16} /> {formatDate(selectedRequest.date)}</span>
            </div>
            <p className="member-prayer__details-description">{selectedRequest.description}</p>
            <div className="member-prayer__details-status"><HandHeart size={18} />
              <span>Estado: <strong>{(STATUS_CONFIG[selectedRequest.status] || STATUS_CONFIG.pending).label}</strong></span>
            </div>
            {selectedRequest.visibility === "community" && <p className="member-prayer__details-prayers">
              <Heart size={16} /> {selectedRequest.prayerCount || 0} persona(s) acompañando en oración.
            </p>}
            {selectedRequest.visibility === "community" && selectedRequest.status !== "completed" && (
              <button type="button" className="member-prayer__pray-button" disabled={Boolean(changingPrayerId)}
                onClick={() => togglePraying(selectedRequest)} aria-pressed={Boolean(selectedRequest.prayingByMe)}>
                <HandHeart size={16} /> {selectedRequest.prayingByMe ? "Estoy orando ✓" : "Estoy orando"}
              </button>
            )}
          </div>
          <footer className="member-prayer__modal-footer member-prayer__details-footer">
            {selectedRequest.isOwner && <>
              <button type="button" className="member-prayer__edit-button" onClick={() => openEdit(selectedRequest)}>
                <Pencil size={16} /> Editar
              </button>
              <button type="button" className="member-prayer__delete-button" onClick={() => {
                setDeleteError(""); setDeletingRequest(selectedRequest); setSelectedRequestId(null);
              }}><Trash2 size={16} /> Eliminar</button>
            </>}
            <button type="button" className="member-prayer__secondary-button" onClick={() => setSelectedRequestId(null)}>Cerrar</button>
          </footer>
        </section>
      </div>}

      {/* ===================================================== */}
      {/* CONFIRMACIÓN DE ELIMINACIÓN DE PETICIÓN PROPIA */}
      {/* ===================================================== */}
      {deletingRequest && <div className="member-prayer__overlay" onMouseDown={(event) => {
        if (event.target === event.currentTarget && !deleting) setDeletingRequest(null);
      }}>
        <section className="member-prayer__modal member-prayer__delete-modal" role="alertdialog" aria-modal="true" aria-labelledby="member-prayer-delete-title">
          <header className="member-prayer__modal-header">
            <div><h2 id="member-prayer-delete-title">¿Eliminar tu petición?</h2>
              <p>Se eliminará «{deletingRequest.title}». Esta acción no se puede deshacer.</p></div>
          </header>
          {deleteError && <p className="member-prayer__form-error" role="alert">{deleteError}</p>}
          <footer className="member-prayer__modal-footer">
            <button type="button" className="member-prayer__secondary-button" disabled={deleting} onClick={() => setDeletingRequest(null)}>Cancelar</button>
            <button type="button" className="member-prayer__delete-button" disabled={deleting} onClick={confirmDelete}>
              <Trash2 size={16} /> {deleting ? "Eliminando..." : "Sí, eliminar"}
            </button>
          </footer>
        </section>
      </div>}
    </main>
  );
}

// Página única para la ruta de peticiones del miembro.
export default MemberPrayerRequests;
