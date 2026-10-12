
import { useMemo, useState } from "react";
import {
    ArrowLeft,
    CheckCircle2,
    Clock3,
    Eye,
    HandHeart,
    HeartHandshake,
    LockKeyhole,
    Search,
    ShieldCheck,
    UsersRound,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import "../../styles/pages/administration/PrayerRequestsManagement.css";

import PrayerRequestDetailsModal from "../../components/administration/prayers/PrayerRequestDetailsModal";

// =========================================================
// DATOS DE DEMOSTRACIÓN
// =========================================================

// Estos registros son temporales.
// Posteriormente serán obtenidos desde el backend.

const DEMO_PRAYER_REQUESTS = [
    {
        id: "PR-001",
        requester: "María González",
        anonymous: false,
        title: "Oración por recuperación de salud",
        category: "Salud",
        description:
            "Solicito oración por la recuperación de un familiar.",
        date: "2026-10-10",
        privacy: "private",
        status: "pending",
    },
    {
        id: "PR-002",
        requester: "Pedro Ramírez",
        anonymous: true,
        title: "Fortaleza espiritual",
        category: "Espiritual",
        description:
            "Necesito fortaleza y dirección en esta etapa.",
        date: "2026-10-09",
        privacy: "private",
        status: "praying",
    },
    {
        id: "PR-003",
        requester: "Carlos Muñoz",
        anonymous: false,
        title: "Oración por mi familia",
        category: "Familia",
        description:
            "Pido oración por la unidad de mi familia.",
        date: "2026-10-08",
        privacy: "community",
        status: "praying",
    },
    {
        id: "PR-004",
        requester: "Ana Pérez",
        anonymous: false,
        title: "Nueva oportunidad laboral",
        category: "Trabajo",
        description:
            "Agradezco las oraciones recibidas por mi trabajo.",
        date: "2026-10-06",
        privacy: "community",
        status: "answered",
    },
    {
        id: "PR-005",
        requester: "Daniela Rojas",
        anonymous: true,
        title: "Paz y tranquilidad",
        category: "Personal",
        description:
            "Solicito oración por tranquilidad y esperanza.",
        date: "2026-10-05",
        privacy: "private",
        status: "completed",
    },
];

// =========================================================
// CONFIGURACIÓN DE ESTADOS
// =========================================================

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
// FORMATO DE FECHAS
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

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function PrayerRequestsManagement() {
    const location = useLocation();

    const isSuperAdminPanel =
        location.pathname.startsWith("/super-admin");

    const adminBasePath = isSuperAdminPanel
        ? "/super-admin"
        : "/admin";

    // -------------------------------------------------------
    // ESTADOS
    // -------------------------------------------------------

    const [requests, setRequests] = useState(DEMO_PRAYER_REQUESTS);

    // =========================================================
    // MODAL DE DETALLES
    // =========================================================

    // Guardamos el identificador de la petición seleccionada.
    const [selectedRequestId, setSelectedRequestId] =
        useState(null);

    // Obtenemos siempre la versión actualizada de la petición.
    const selectedRequest =
        requests.find(
            (request) => request.id === selectedRequestId
        ) ?? null;

    // Abrir detalles.
    function handleViewDetails(request) {
        setSelectedRequestId(request.id);
    }

    // Cerrar detalles.
    function handleCloseDetails() {
        setSelectedRequestId(null);
    }

    // Guardar estado y observación de seguimiento.
    function handleSaveDetails(requestId, changes) {
        setRequests((previousRequests) =>
            previousRequests.map((request) =>
                request.id === requestId
                    ? {
                        ...request,
                        status: changes.status,
                        followUpNote: changes.followUpNote,
                    }
                    : request
            )
        );

        setSelectedRequestId(null);
    }

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [privacyFilter, setPrivacyFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");

    // -------------------------------------------------------
    // RESUMEN
    // -------------------------------------------------------

    const summary = useMemo(() => {
        return {
            total: requests.length,

            pending: requests.filter(
                (request) => request.status === "pending"
            ).length,

            praying: requests.filter(
                (request) => request.status === "praying"
            ).length,

            answered: requests.filter(
                (request) => request.status === "answered"
            ).length,

            completed: requests.filter(
                (request) => request.status === "completed"
            ).length,
        };
    }, [requests]);

    // -------------------------------------------------------
    // CATEGORÍAS DISPONIBLES
    // -------------------------------------------------------

    const categories = useMemo(() => {
        return [...new Set(requests.map((request) => request.category))]
            .sort((a, b) => a.localeCompare(b, "es"));
    }, [requests]);

    // -------------------------------------------------------
    // FILTRADO DE PETICIONES
    // -------------------------------------------------------

    const filteredRequests = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        return requests.filter((request) => {
            // No buscamos dentro de descripciones privadas
            // para evitar exponer su contenido en esta vista.
            const searchableText = [
                request.id,
                request.title,
                request.category,
                request.requester,
                request.anonymous ? "Anónimo" : "",
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            const matchesSearch =
                !normalizedSearch ||
                searchableText.includes(normalizedSearch);

            const matchesStatus =
                statusFilter === "all" ||
                request.status === statusFilter;

            const matchesPrivacy =
                privacyFilter === "all" ||
                request.privacy === privacyFilter;

            const matchesCategory =
                categoryFilter === "all" ||
                request.category === categoryFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesPrivacy &&
                matchesCategory
            );
        });
    }, [
        requests,
        search,
        statusFilter,
        privacyFilter,
        categoryFilter,
    ]);

    // -------------------------------------------------------
    // LIMPIAR FILTROS
    // -------------------------------------------------------

    function handleClearFilters() {
        setSearch("");
        setStatusFilter("all");
        setPrivacyFilter("all");
        setCategoryFilter("all");
    }

    const hasActiveFilters =
        search.trim() !== "" ||
        statusFilter !== "all" ||
        privacyFilter !== "all" ||
        categoryFilter !== "all";

    // -------------------------------------------------------
    // INTERFAZ
    // -------------------------------------------------------

    return (
        <div className="prayer-management-page">

            {/* ============================================= */}
            {/* ENCABEZADO */}
            {/* ============================================= */}

            <header className="prayer-management-page__header">

                <div className="prayer-management-page__heading">

                    <Link
                        to={adminBasePath}
                        className="prayer-management-page__back"
                    >
                        <ArrowLeft size={17} aria-hidden="true" />
                        Volver al panel
                    </Link>

                    <span className="prayer-management-page__eyebrow">
                        ADMINISTRACIÓN
                    </span>

                    <h1>Peticiones de oración</h1>

                    <p>
                        Consulta, organiza y realiza seguimiento de
                        las peticiones recibidas por la comunidad.
                    </p>

                </div>

                <div className="prayer-management-page__header-icon">
                    <HandHeart size={28} aria-hidden="true" />
                </div>

            </header>

            {/* ============================================= */}
            {/* AVISO DE PRIVACIDAD */}
            {/* ============================================= */}

            <div className="prayer-management-page__privacy-notice">

                <ShieldCheck size={21} aria-hidden="true" />

                <p>
                    <strong>Información confidencial.</strong>{" "}
                    Las peticiones privadas solo pueden ser consultadas
                    por su autor y los administradores autorizados.
                    Cuando una petición se marca como anónima,
                    la identidad del solicitante se oculta frente
                    a otros miembros, pero permanece visible
                    para los administradores autorizados.
                </p>

            </div>

            {/* ============================================= */}
            {/* TARJETAS DE RESUMEN */}
            {/* ============================================= */}

            <section
                className="prayer-management-page__summary"
                aria-label="Resumen de peticiones"
            >

                <article className="prayer-management-page__summary-card">

                    <div className="prayer-management-page__summary-icon">
                        <UsersRound size={21} aria-hidden="true" />
                    </div>

                    <span>Total de peticiones</span>
                    <strong>{summary.total}</strong>
                    <small>Solicitudes registradas</small>

                </article>

                <article className="prayer-management-page__summary-card">

                    <div className="prayer-management-page__summary-icon">
                        <Clock3 size={21} aria-hidden="true" />
                    </div>

                    <span>Pendientes</span>
                    <strong>{summary.pending}</strong>
                    <small>Esperando atención</small>

                </article>

                <article className="prayer-management-page__summary-card">

                    <div className="prayer-management-page__summary-icon">
                        <HeartHandshake size={21} aria-hidden="true" />
                    </div>

                    <span>En oración</span>
                    <strong>{summary.praying}</strong>
                    <small>Actualmente en seguimiento</small>

                </article>

                <article className="prayer-management-page__summary-card">

                    <div className="prayer-management-page__summary-icon">
                        <CheckCircle2 size={21} aria-hidden="true" />
                    </div>

                    <span>Respondidas</span>
                    <strong>{summary.answered}</strong>
                    <small>Con respuesta registrada</small>

                </article>

            </section>

            {/* ============================================= */}
            {/* LISTADO DE PETICIONES */}
            {/* ============================================= */}

            <section className="prayer-management-page__content">

                <div className="prayer-management-page__section-header">

                    <div>
                        <h2>Solicitudes recibidas</h2>

                        <p>
                            Administra las peticiones enviadas a la iglesia.
                        </p>
                    </div>

                    <span className="prayer-management-page__result-count">
                        {filteredRequests.length} resultados
                    </span>

                </div>

                {/* =========================================== */}
                {/* FILTROS */}
                {/* =========================================== */}

                <div className="prayer-management-page__filters">

                    <label className="prayer-management-page__search">

                        <Search size={19} aria-hidden="true" />

                        <input
                            type="search"
                            placeholder="Buscar por título, nombre o código..."
                            aria-label="Buscar peticiones"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />

                    </label>

                    <select
                        aria-label="Filtrar por estado"
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                    >
                        <option value="all">Todos los estados</option>
                        <option value="pending">Pendiente</option>
                        <option value="praying">En oración</option>
                        <option value="answered">Respondida</option>
                        <option value="completed">Finalizada</option>
                    </select>

                    <select
                        aria-label="Filtrar por privacidad"
                        value={privacyFilter}
                        onChange={(event) => setPrivacyFilter(event.target.value)}
                    >
                        <option value="all">Toda la privacidad</option>
                        <option value="community">Comunitaria</option>
                        <option value="private">Privada</option>
                    </select>

                    <select
                        aria-label="Filtrar por categoría"
                        value={categoryFilter}
                        onChange={(event) => setCategoryFilter(event.target.value)}
                    >
                        <option value="all">Todas las categorías</option>

                        {categories.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}

                    </select>

                </div>

                {hasActiveFilters && (
                    <button
                        type="button"
                        className="prayer-management-page__clear-filters"
                        onClick={handleClearFilters}
                    >
                        Limpiar filtros
                    </button>
                )}

                {/* =========================================== */}
                {/* TABLA */}
                {/* =========================================== */}

                <div className="prayer-management-page__table-wrapper">

                    <table className="prayer-management-page__table">

                        <thead>
                            <tr>
                                <th>Petición</th>
                                <th>Solicitante</th>
                                <th>Fecha</th>
                                <th>Privacidad</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>

                        <tbody>

                            {filteredRequests.map((request) => {

                                const status =
                                    STATUS_CONFIG[request.status] ||
                                    STATUS_CONFIG.pending;

                                return (
                                    <tr key={request.id}>

                                        <td>
                                            <div className="prayer-management-page__request">

                                                <span className="prayer-management-page__request-code">
                                                    {request.id}
                                                </span>

                                                <strong>{request.title}</strong>

                                                <small>{request.category}</small>

                                            </div>
                                        </td>

                                        <td>
                                            <div className="prayer-management-page__requester">
                                                <strong>{request.requester}</strong>

                                                {request.anonymous && (
                                                    <span className="prayer-management-page__anonymous-label">
                                                        <LockKeyhole size={12} aria-hidden="true" />
                                                        Anónimo para miembros
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        <td>{formatDate(request.date)}</td>

                                        <td>

                                            <span
                                                className={`prayer-management-page__privacy-badge prayer-management-page__privacy-badge--${request.privacy}`}
                                            >
                                                {request.privacy === "private" ? (
                                                    <>
                                                        <LockKeyhole
                                                            size={13}
                                                            aria-hidden="true"
                                                        />
                                                        Privada
                                                    </>
                                                ) : (
                                                    "Comunitaria"
                                                )}
                                            </span>

                                        </td>

                                        <td>

                                            <span
                                                className={`prayer-management-page__status prayer-management-page__status--${status.className}`}
                                            >
                                                {status.label}
                                            </span>

                                        </td>

                                        <td>

                                       

                                            <button
                                                type="button"
                                                className="prayer-management-page__details-button"
                                                onClick={() => handleViewDetails(request)}
                                                aria-label={`Ver detalles de la petición ${request.id}`}
                                                title="Ver detalles de la petición"
                                            >
                                                <Eye size={16} aria-hidden="true" />
                                                Ver detalles
                                            </button>

                                        </td>

                                    </tr>
                                );
                            })}

                            {filteredRequests.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="prayer-management-page__empty"
                                    >
                                        No se encontraron peticiones con los
                                        filtros seleccionados.
                                    </td>
                                </tr>
                            )}

                        </tbody>

                    </table>

                </div>

                <footer className="prayer-management-page__footer">

                    <LockKeyhole size={16} aria-hidden="true" />

                    <span>
                        Los datos mostrados son demostrativos.
                        El acceso real deberá estar protegido mediante
                        autenticación y autorización desde el servidor.
                    </span>

                </footer>

            </section>

            {/* ============================================= */}
            {/* MODAL DE DETALLES Y SEGUIMIENTO */}
            {/* ============================================= */}

            <PrayerRequestDetailsModal
                isOpen={Boolean(selectedRequest)}
                request={selectedRequest}
                onClose={handleCloseDetails}
                onSave={handleSaveDetails}
            />

        </div>
    );
}

export default PrayerRequestsManagement;
