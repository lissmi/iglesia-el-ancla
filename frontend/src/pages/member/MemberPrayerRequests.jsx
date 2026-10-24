import { useMemo, useState } from "react";
// Importamos Link para navegar sin recargar la aplicación.

import {
    CalendarDays,
    CheckCircle2,
    Clock3,
    Eye,
    EyeOff,
    HandHeart,
    Heart,
    LockKeyhole,
    Plus,
    Search,
    Send,
    ShieldCheck,
    Users,
    X,
} from "lucide-react";

import "../../styles/pages/member/MemberPrayerRequests.css";

// =========================================================
// CONFIGURACIÓN
// =========================================================

const DEMO_CURRENT_MEMBER = {
    id: "member-001",
    name: "María González",
};

const CATEGORIES = [
    "Salud",
    "Familia",
    "Trabajo",
    "Estudios",
    "Espiritual",
    "Personal",
    "Agradecimiento",
    "Otro",
];

const STATUS_CONFIG = {
    pending: {
        label: "Pendiente",
        className: "pending",
    },
    praying: {
        label: "En oración",
        className: "praying",
    },
    answered: {
        label: "Respondida",
        className: "answered",
    },
    completed: {
        label: "Finalizada",
        className: "completed",
    },
};

// =========================================================
// DATOS DE DEMOSTRACIÓN
// =========================================================

// Todas las peticiones pertenecen a miembros registrados.
// anonymous controla únicamente la visibilidad del nombre
// ante otros miembros, nunca ante administradores.

const DEMO_REQUESTS = [
    {
        id: "PR-001",
        memberId: "member-001",
        requester: "María González",
        title: "Oración por mi familia",
        description:
            "Pido oración por la unidad y el bienestar de mi familia.",
        category: "Familia",
        visibility: "community",
        anonymous: false,
        status: "praying",
        date: "2026-10-09",
    },
    {
        id: "PR-002",
        memberId: "member-001",
        requester: "María González",
        title: "Fortaleza en una situación personal",
        description:
            "Solicito oración y fortaleza para enfrentar una situación personal.",
        category: "Personal",
        visibility: "private",
        anonymous: true,
        status: "pending",
        date: "2026-10-10",
    },
    {
        id: "PR-003",
        memberId: "member-002",
        requester: "Daniela Rojas",
        title: "Oración por recuperación",
        description:
            "Les pido que me acompañen en oración por la recuperación de un familiar.",
        category: "Salud",
        visibility: "community",
        anonymous: true,
        status: "praying",
        date: "2026-10-08",
    },
    {
        id: "PR-004",
        memberId: "member-003",
        requester: "Carlos Muñoz",
        title: "Nueva oportunidad laboral",
        description:
            "Pido oración por una nueva oportunidad de trabajo.",
        category: "Trabajo",
        visibility: "community",
        anonymous: false,
        status: "answered",
        date: "2026-10-06",
    },
    {
        id: "PR-005",
        memberId: "member-004",
        requester: "Ana Pérez",
        title: "Agradecimiento",
        description:
            "Quiero agradecer a Dios por su cuidado y fidelidad.",
        category: "Agradecimiento",
        visibility: "community",
        anonymous: false,
        status: "completed",
        date: "2026-10-04",
    },
    {
        id: "PR-006",
        memberId: "member-002",
        requester: "Daniela Rojas",
        title: "Petición personal",
        description:
            "Esta petición solo debe ser visible para su autora y administradores.",
        category: "Personal",
        visibility: "private",
        anonymous: false,
        status: "pending",
        date: "2026-10-07",
    },
];

// =========================================================
// FUNCIONES AUXILIARES
// =========================================================

function formatDate(dateString) {
    if (!dateString) return "Sin fecha";

    const date = new Date(`${dateString}T12:00:00Z`);

    if (Number.isNaN(date.getTime())) {
        return "Fecha no disponible";
    }

    return new Intl.DateTimeFormat("es-CL", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
    }).format(date);
}

function getStatus(request) {
    return (
        STATUS_CONFIG[request.status] ||
        STATUS_CONFIG.pending
    );
}

// =========================================================
// TARJETA DE PETICIÓN
// =========================================================

function PrayerCard({ request, currentMemberId, onView }) {
    const isOwner = request.memberId === currentMemberId;

    const requesterName =
        request.anonymous && !isOwner
            ? "Miembro anónimo"
            : request.requester;

    const status = getStatus(request);

    return (
        <article className="member-prayer__card">

            <div className="member-prayer__card-top">

                <span className="member-prayer__category">
                    {request.category}
                </span>

                <span
                    className={`member-prayer__status member-prayer__status--${status.className}`}
                >
                    {status.label}
                </span>

            </div>

            <h3>{request.title}</h3>

            <p className="member-prayer__card-description">
                {request.description}
            </p>

            <div className="member-prayer__card-meta">

                <span>
                    <Users size={15} aria-hidden="true" />
                    {requesterName}
                </span>

                <span>
                    <CalendarDays size={15} aria-hidden="true" />
                    {formatDate(request.date)}
                </span>

            </div>

            <div className="member-prayer__card-bottom">

                <span className="member-prayer__visibility-label">
                    {request.visibility === "private" ? (
                        <>
                            <LockKeyhole size={14} aria-hidden="true" />
                            Privada
                        </>
                    ) : (
                        <>
                            <Eye size={14} aria-hidden="true" />
                            Comunitaria
                        </>
                    )}
                </span>

                <button
                    type="button"
                    className="member-prayer__view-button"
                    onClick={() => onView(request)}
                >
                    Ver petición
                    <Eye size={15} aria-hidden="true" />
                </button>

            </div>

        </article>
    );
}

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function MemberPrayerRequests() {
    const [requests, setRequests] = useState(DEMO_REQUESTS);

    const [activeTab, setActiveTab] = useState("community");
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");

    const [showForm, setShowForm] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    const [form, setForm] = useState({
        title: "",
        description: "",
        category: "",
        visibility: "community",
        anonymous: false,
    });

    const [successMessage, setSuccessMessage] = useState("");

    const currentMemberId = DEMO_CURRENT_MEMBER.id;

    // -------------------------------------------------------
    // PETICIONES PERSONALES
    // -------------------------------------------------------

    const myRequests = useMemo(() => {
        return requests.filter(
            (request) => request.memberId === currentMemberId
        );
    }, [requests, currentMemberId]);

    // -------------------------------------------------------
    // PETICIONES COMUNITARIAS
    // -------------------------------------------------------

    const communityRequests = useMemo(() => {
        return requests.filter(
            (request) => request.visibility === "community"
        );
    }, [requests]);

    // -------------------------------------------------------
    // ESTADÍSTICAS PERSONALES
    // -------------------------------------------------------

    const summary = useMemo(() => {
        return {
            total: myRequests.length,

            active: myRequests.filter(
                (request) =>
                    request.status === "pending" ||
                    request.status === "praying"
            ).length,

            answered: myRequests.filter(
                (request) => request.status === "answered"
            ).length,
        };
    }, [myRequests]);

    // -------------------------------------------------------
    // FILTROS
    // -------------------------------------------------------

    const filteredRequests = useMemo(() => {
        const source =
            activeTab === "mine"
                ? myRequests
                : communityRequests;

        const normalizedSearch = search.trim().toLowerCase();

        return source.filter((request) => {
            const matchesSearch =
                !normalizedSearch ||
                request.title.toLowerCase().includes(normalizedSearch) ||
                request.description.toLowerCase().includes(normalizedSearch);

            const matchesCategory =
                categoryFilter === "all" ||
                request.category === categoryFilter;

            return matchesSearch && matchesCategory;
        });
    }, [
        activeTab,
        myRequests,
        communityRequests,
        search,
        categoryFilter,
    ]);

    // -------------------------------------------------------
    // ACTUALIZAR FORMULARIO
    // -------------------------------------------------------

    function handleFormChange(event) {
        const { name, value, type, checked } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value,
        }));
    }

    // -------------------------------------------------------
    // CREAR PETICIÓN DEMOSTRATIVA
    // -------------------------------------------------------

    function handleSubmit(event) {
        event.preventDefault();

        const title = form.title.trim();
        const description = form.description.trim();

        if (!title || !description || !form.category) {
            return;
        }

        const newRequest = {
            id: `PR-DEMO-${Date.now()}`,

            // En producción este valor vendrá de la sesión
            // autenticada, validada por el backend.
            memberId: currentMemberId,
            requester: DEMO_CURRENT_MEMBER.name,

            title,
            description,
            category: form.category,
            visibility: form.visibility,
            anonymous: form.anonymous,

            status: "pending",
            date: new Date().toISOString().slice(0, 10),
        };

        setRequests((previous) => [
            newRequest,
            ...previous,
        ]);

        setForm({
            title: "",
            description: "",
            category: "",
            visibility: "community",
            anonymous: false,
        });

        setShowForm(false);
        setActiveTab("mine");
        setSearch("");
        setCategoryFilter("all");

        setSuccessMessage(
            "Tu petición fue registrada en esta demostración."
        );
    }

    // -------------------------------------------------------
    // ABRIR FORMULARIO
    // -------------------------------------------------------

    function handleOpenForm() {
        setSuccessMessage("");
        setShowForm(true);
    }

    // -------------------------------------------------------
    // INTERFAZ
    // -------------------------------------------------------

    return (
        <main className="member-prayer">

            <div className="member-prayer__container">

                {/* ============================================= */}
                {/* ENCABEZADO */}
                {/* ============================================= */}

                <header className="member-prayer__header">

                    <div className="member-prayer__header-content">

                        <span className="member-prayer__eyebrow">
                            COMUNIDAD EL ANCLA
                        </span>

                        <h1>
                            Peticiones de <span>oración</span>
                        </h1>

                        <p>
                            Un espacio para compartir nuestras cargas,
                            acompañarnos en oración y fortalecer
                            nuestra comunidad de fe.
                        </p>

                        <button
                            type="button"
                            className="member-prayer__primary-button"
                            onClick={handleOpenForm}
                        >
                            <Plus size={19} aria-hidden="true" />
                            Nueva petición
                        </button>

                    </div>

                    <div className="member-prayer__header-decoration">
                        <HandHeart size={65} strokeWidth={1.3} />
                    </div>

                </header>

                {/* ============================================= */}
                {/* MENSAJE DE CONFIRMACIÓN */}
                {/* ============================================= */}

                {successMessage && (
                    <div
                        className="member-prayer__success"
                        role="status"
                    >
                        <CheckCircle2 size={20} aria-hidden="true" />
                        {successMessage}
                    </div>
                )}

                {/* ============================================= */}
                {/* RESUMEN PERSONAL */}
                {/* ============================================= */}

                <section
                    className="member-prayer__summary"
                    aria-label="Resumen de mis peticiones"
                >

                    <article className="member-prayer__summary-card">
                        <div className="member-prayer__summary-icon">
                            <HandHeart size={22} />
                        </div>
                        <span>Mis peticiones</span>
                        <strong>{summary.total}</strong>
                        <small>Solicitudes realizadas</small>
                    </article>

                    <article className="member-prayer__summary-card">
                        <div className="member-prayer__summary-icon">
                            <Clock3 size={22} />
                        </div>
                        <span>En seguimiento</span>
                        <strong>{summary.active}</strong>
                        <small>Pendientes o en oración</small>
                    </article>

                    <article className="member-prayer__summary-card">
                        <div className="member-prayer__summary-icon">
                            <CheckCircle2 size={22} />
                        </div>
                        <span>Respondidas</span>
                        <strong>{summary.answered}</strong>
                        <small>Con respuesta registrada</small>
                    </article>

                </section>

                {/* ============================================= */}
                {/* CONTENIDO PRINCIPAL */}
                {/* ============================================= */}

                <section className="member-prayer__content">

                    <div className="member-prayer__section-heading">

                        <div>
                            <span className="member-prayer__section-eyebrow">
                                ACOMPAÑAMIENTO ESPIRITUAL
                            </span>

                            <h2>Unidos en oración</h2>

                            <p>
                                Explora las peticiones compartidas por
                                la comunidad o consulta tus solicitudes.
                            </p>
                        </div>

                        <Heart
                            size={28}
                            className="member-prayer__section-heart"
                            aria-hidden="true"
                        />

                    </div>

                    {/* =========================================== */}
                    {/* PESTAÑAS */}
                    {/* =========================================== */}

                    <div className="member-prayer__tabs">

                        <button
                            type="button"
                            className={`member-prayer__tab ${activeTab === "community"
                                ? "member-prayer__tab--active"
                                : ""
                                }`}
                            onClick={() => setActiveTab("community")}
                        >
                            <Users size={18} aria-hidden="true" />
                            Comunidad
                            <span>{communityRequests.length}</span>
                        </button>

                        <button
                            type="button"
                            className={`member-prayer__tab ${activeTab === "mine"
                                ? "member-prayer__tab--active"
                                : ""
                                }`}
                            onClick={() => setActiveTab("mine")}
                        >
                            <HandHeart size={18} aria-hidden="true" />
                            Mis peticiones
                            <span>{myRequests.length}</span>
                        </button>

                    </div>

                    {/* =========================================== */}
                    {/* FILTROS */}
                    {/* =========================================== */}

                    <div className="member-prayer__filters">

                        <label className="member-prayer__search">
                            <Search size={19} aria-hidden="true" />

                            <input
                                type="search"
                                placeholder="Buscar peticiones..."
                                aria-label="Buscar peticiones"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                            />
                        </label>

                        <select
                            aria-label="Filtrar por categoría"
                            value={categoryFilter}
                            onChange={(event) =>
                                setCategoryFilter(event.target.value)
                            }
                        >
                            <option value="all">
                                Todas las categorías
                            </option>

                            {CATEGORIES.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>

                    </div>

                    {/* =========================================== */}
                    {/* LISTADO */}
                    {/* =========================================== */}

                    <div className="member-prayer__grid">

                        {filteredRequests.map((request) => (
                            <PrayerCard
                                key={request.id}
                                request={request}
                                currentMemberId={currentMemberId}
                                onView={setSelectedRequest}
                            />
                        ))}

                    </div>

                    {filteredRequests.length === 0 && (
                        <div className="member-prayer__empty">
                            <HandHeart size={37} strokeWidth={1.4} />

                            <h3>No encontramos peticiones</h3>

                            <p>
                                Prueba con otros filtros o comparte
                                una nueva petición de oración.
                            </p>
                        </div>
                    )}

                </section>

                {/* ============================================= */}
                {/* NOTA DE PRIVACIDAD */}
                {/* ============================================= */}

                <div className="member-prayer__privacy-note">
                    <ShieldCheck size={20} aria-hidden="true" />

                    <p>
                        Tú decides si tu petición será comunitaria
                        o privada. También puedes ocultar tu nombre
                        a los demás miembros. Los administradores
                        autorizados siempre podrán identificar al
                        solicitante.
                    </p>
                </div>

            </div>

            {/* =============================================== */}
            {/* MODAL NUEVA PETICIÓN */}
            {/* =============================================== */}

            {showForm && (
                <div
                    className="member-prayer__overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setShowForm(false);
                        }
                    }}
                >
                    <section
                        className="member-prayer__modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="member-prayer-form-title"
                    >

                        <header className="member-prayer__modal-header">

                            <div>
                                <span className="member-prayer__eyebrow">
                                    COMPARTIR UNA PETICIÓN
                                </span>

                                <h2 id="member-prayer-form-title">
                                    Nueva petición de oración
                                </h2>

                                <p>
                                    Completa los siguientes campos
                                    para compartir tu solicitud.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="member-prayer__close"
                                onClick={() => setShowForm(false)}
                                aria-label="Cerrar formulario"
                            >
                                <X size={21} />
                            </button>

                        </header>

                        <form
                            id="member-prayer-create-form"
                            className="member-prayer__form"
                            onSubmit={handleSubmit}
                        >

                            <div className="member-prayer__field">
                                <label htmlFor="prayer-title">
                                    Título de la petición *
                                </label>

                                <input
                                    id="prayer-title"
                                    name="title"
                                    type="text"
                                    maxLength={120}
                                    required
                                    value={form.title}
                                    onChange={handleFormChange}
                                    placeholder="Ej.: Oración por mi familia"
                                />
                            </div>

                            <div className="member-prayer__field">
                                <label htmlFor="prayer-category">
                                    Categoría *
                                </label>

                                <select
                                    id="prayer-category"
                                    name="category"
                                    required
                                    value={form.category}
                                    onChange={handleFormChange}
                                >
                                    <option value="">
                                        Selecciona una categoría
                                    </option>

                                    {CATEGORIES.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="member-prayer__field">
                                <label htmlFor="prayer-description">
                                    Cuéntanos tu petición *
                                </label>

                                <textarea
                                    id="prayer-description"
                                    name="description"
                                    rows={5}
                                    maxLength={2000}
                                    required
                                    value={form.description}
                                    onChange={handleFormChange}
                                    placeholder="Escribe aquí aquello por lo que deseas que oremos..."
                                />

                                <small>
                                    Máximo 2000 caracteres.
                                </small>
                            </div>

                            {/* ======================================= */}
                            {/* VISIBILIDAD */}
                            {/* ======================================= */}

                            <fieldset className="member-prayer__fieldset">

                                <legend>
                                    ¿Quién podrá leer tu petición?
                                </legend>

                                <label
                                    className={`member-prayer__choice ${form.visibility === "community"
                                        ? "member-prayer__choice--selected"
                                        : ""
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="visibility"
                                        value="community"
                                        checked={form.visibility === "community"}
                                        onChange={handleFormChange}
                                    />

                                    <Users size={20} aria-hidden="true" />

                                    <span>
                                        <strong>Comunitaria</strong>
                                        <small>
                                            Los miembros registrados podrán
                                            leerla y acompañarte en oración.
                                        </small>
                                    </span>
                                </label>

                                <label
                                    className={`member-prayer__choice ${form.visibility === "private"
                                        ? "member-prayer__choice--selected"
                                        : ""
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="visibility"
                                        value="private"
                                        checked={form.visibility === "private"}
                                        onChange={handleFormChange}
                                    />

                                    <LockKeyhole
                                        size={20}
                                        aria-hidden="true"
                                    />

                                    <span>
                                        <strong>Privada</strong>
                                        <small>
                                            Solo tú y los administradores
                                            autorizados podrán leerla.
                                        </small>
                                    </span>
                                </label>

                            </fieldset>

                            {/* ======================================= */}
                            {/* ANONIMATO */}
                            {/* ======================================= */}

                            <label className="member-prayer__anonymous-option">

                                <input
                                    type="checkbox"
                                    name="anonymous"
                                    checked={form.anonymous}
                                    onChange={handleFormChange}
                                />

                                <EyeOff size={20} aria-hidden="true" />

                                <span>
                                    <strong>
                                        Ocultar mi nombre a otros miembros
                                    </strong>

                                    <small>
                                        Los administradores podrán
                                        identificarte para realizar
                                        el seguimiento de tu petición.
                                    </small>
                                </span>

                            </label>

                            <div className="member-prayer__form-notice">
                                <ShieldCheck size={18} aria-hidden="true" />

                                <p>
                                    Tu petición estará vinculada a tu cuenta
                                    de miembro registrado, aunque selecciones
                                    la opción de anonimato.
                                </p>
                            </div>

                        </form>

                        <footer className="member-prayer__modal-footer">

                            <button
                                type="button"
                                className="member-prayer__secondary-button"
                                onClick={() => setShowForm(false)}
                            >
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                form="member-prayer-create-form"
                                className="member-prayer__primary-button"
                            >
                                <Send size={17} aria-hidden="true" />
                                Enviar petición
                            </button>

                        </footer>

                    </section>
                </div>
            )}

            {/* =============================================== */}
            {/* MODAL VER PETICIÓN */}
            {/* =============================================== */}

            {selectedRequest && (
                <div
                    className="member-prayer__overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setSelectedRequest(null);
                        }
                    }}
                >
                    <section
                        className="member-prayer__modal member-prayer__modal--details"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="member-prayer-detail-title"
                    >

                        <header className="member-prayer__modal-header">

                            <div>
                                <span className="member-prayer__eyebrow">
                                    {selectedRequest.category}
                                </span>

                                <h2 id="member-prayer-detail-title">
                                    {selectedRequest.title}
                                </h2>
                            </div>

                            <button
                                type="button"
                                className="member-prayer__close"
                                onClick={() => setSelectedRequest(null)}
                                aria-label="Cerrar detalles"
                            >
                                <X size={21} />
                            </button>

                        </header>

                        <div className="member-prayer__details-content">

                            <div className="member-prayer__details-meta">

                                <span>
                                    <Users size={16} />
                                    {selectedRequest.anonymous &&
                                        selectedRequest.memberId !== currentMemberId
                                        ? "Miembro anónimo"
                                        : selectedRequest.requester}
                                </span>

                                <span>
                                    <CalendarDays size={16} />
                                    {formatDate(selectedRequest.date)}
                                </span>

                            </div>

                            <p className="member-prayer__details-description">
                                {selectedRequest.description}
                            </p>

                            <div className="member-prayer__details-status">
                                <HandHeart size={18} />

                                <span>
                                    Estado:{" "}
                                    <strong>
                                        {getStatus(selectedRequest).label}
                                    </strong>
                                </span>
                            </div>

                        </div>

                        <footer className="member-prayer__modal-footer">
                            <button
                                type="button"
                                className="member-prayer__secondary-button"
                                onClick={() => setSelectedRequest(null)}
                            >
                                Cerrar
                            </button>
                        </footer>

                    </section>
                </div>
            )}

        </main>
    );
}

export default MemberPrayerRequests;
