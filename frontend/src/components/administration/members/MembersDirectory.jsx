import { useMemo, useState } from "react";

import {
    ArrowRight,
    CalendarDays,
    Eye,
    Mail,
    Search,
    UsersRound,
} from "lucide-react";

import MembersPagination from "./MembersPagination";
import "../../../styles/components/administration/members/MembersDirectory.css";

// =========================================================
// CONFIGURACIÓN DE ESTADOS
// =========================================================

const STATUS_CONFIG = {
    active: {
        label: "Activo",
        className: "active",
    },
    inactive: {
        // El modelo User almacena isActive=false (cuenta inactiva).
        label: "Inactivo",
        // Conservamos el CSS existente de estado deshabilitado.
        className: "blocked",
    },
};

// =========================================================
// FUNCIONES AUXILIARES
// =========================================================

function getInitials(name = "") {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");
}

function formatDate(value) {
    if (!value) return "No informado";

    const date = new Date(`${value}T12:00:00Z`);

    if (Number.isNaN(date.getTime())) {
        return "Fecha no disponible";
    }

    return new Intl.DateTimeFormat("es-CL", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
    }).format(date);
}

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function MembersDirectory({
    members = [],
    onViewMember,
}) {

    // =====================================================
    // FILTROS
    // =====================================================

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // =====================================================
    // PAGINACIÓN
    // =====================================================

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // =====================================================
    // FILTRAR MIEMBROS
    // =====================================================

    const filteredMembers = useMemo(() => {

        const normalizedSearch = search.trim().toLowerCase();

        return members.filter((member) => {

            const matchesSearch =
                !normalizedSearch ||
                (member.name || "")
                    .toLowerCase()
                    .includes(normalizedSearch) ||
                (member.email || "")
                    .toLowerCase()
                    .includes(normalizedSearch);

            const matchesStatus =
                statusFilter === "all" ||
                member.status === statusFilter;

            return matchesSearch && matchesStatus;
        });

    }, [members, search, statusFilter]);

    // =====================================================
    // PAGINAR RESULTADOS
    // =====================================================

    const totalPages = Math.max(
        1,
        Math.ceil(filteredMembers.length / pageSize)
    );

    // Si la lista cambia, evitamos utilizar una página
    // superior a la cantidad de páginas disponibles.
    const safeCurrentPage = Math.min(
        currentPage,
        totalPages
    );

    const paginatedMembers = useMemo(() => {

        const startIndex =
            (safeCurrentPage - 1) * pageSize;

        return filteredMembers.slice(
            startIndex,
            startIndex + pageSize
        );

    }, [filteredMembers, safeCurrentPage, pageSize]);

    // =====================================================
    // CONTROL DE FILTROS
    // =====================================================

    function handleSearchChange(event) {
        setSearch(event.target.value);
        setCurrentPage(1);
    }

    function handleStatusChange(event) {
        setStatusFilter(event.target.value);
        setCurrentPage(1);
    }

    function handleClearFilters() {
        setSearch("");
        setStatusFilter("all");
        setCurrentPage(1);
    }

    const hasActiveFilters =
        search.trim() !== "" ||
        statusFilter !== "all";

    // =====================================================
    // CONTROL DE PAGINACIÓN
    // =====================================================

    function handlePageChange(page) {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    }

    function handlePageSizeChange(size) {
        setPageSize(size);
        setCurrentPage(1);
    }

    // =====================================================
    // INTERFAZ
    // =====================================================

    return (
        <section className="members-management__content">

            {/* =========================================== */}
            {/* ENCABEZADO DEL DIRECTORIO */}
            {/* =========================================== */}

            <div className="members-management__section-heading">

                <div>
                    <h2>Directorio de miembros</h2>

                    <p>
                        Consulta los perfiles de los miembros
                        registrados en Iglesia El Ancla.
                    </p>
                </div>

                <span className="members-management__count">
                    {filteredMembers.length} resultados
                </span>

            </div>

            {/* =========================================== */}
            {/* FILTROS */}
            {/* =========================================== */}

            <div className="members-management__filters">

                <label className="members-management__search">

                    <Search
                        size={18}
                        aria-hidden="true"
                    />

                    <input
                        type="search"
                        value={search}
                        onChange={handleSearchChange}
                        placeholder="Buscar por nombre o correo..."
                        aria-label="Buscar miembros"
                    />

                </label>

                <select
                    aria-label="Filtrar miembros por estado"
                    value={statusFilter}
                    onChange={handleStatusChange}
                >
                    <option value="all">
                        Todos los estados
                    </option>

                    <option value="active">
                        Activos
                    </option>

                    <option value="inactive">
                        Inactivos
                    </option>
                </select>

                {hasActiveFilters && (
                    <button
                        type="button"
                        className="members-management__clear"
                        onClick={handleClearFilters}
                    >
                        Limpiar filtros
                    </button>
                )}

            </div>

            {/* =========================================== */}
            {/* LISTADO */}
            {/* =========================================== */}

            <div className="members-management__list">

                {paginatedMembers.map((member) => {

                    const status =
                        STATUS_CONFIG[member.status] || {
                            label: "Sin estado",
                            className: "unknown",
                        };

                    return (
                        <article
                            className="members-management__member"
                            key={member.id}
                        >

                            <div className="members-management__avatar">
                                {getInitials(member.name)}
                            </div>

                            <div className="members-management__member-info">

                                <strong>{member.name}</strong>

                                <span>
                                    <Mail
                                        size={14}
                                        aria-hidden="true"
                                    />

                                    {member.email}
                                </span>

                                <small>
                                    <CalendarDays
                                        size={13}
                                        aria-hidden="true"
                                    />

                                    Registrado:{" "}
                                    {formatDate(member.registeredAt)}
                                </small>

                            </div>

                            <div className="members-management__member-status">

                                <span
                                    className={
                                        `members-management__status ` +
                                        `members-management__status--${status.className}`
                                    }
                                >
                                    {status.label}
                                </span>

                            </div>

                            <button
                                type="button"
                                className="members-management__details-button"
                                onClick={() =>
                                    onViewMember?.(member)
                                }
                            >
                                <Eye
                                    size={16}
                                    aria-hidden="true"
                                />

                                Ver perfil

                                <ArrowRight
                                    size={15}
                                    aria-hidden="true"
                                />
                            </button>

                        </article>
                    );
                })}

                {/* ======================================= */}
                {/* ESTADO VACÍO */}
                {/* ======================================= */}

                {filteredMembers.length === 0 && (

                    <div className="members-management__empty">

                        <UsersRound
                            size={35}
                            strokeWidth={1.5}
                            aria-hidden="true"
                        />

                        <h3>No encontramos miembros</h3>

                        <p>
                            {hasActiveFilters
                                ? "Prueba con otro nombre o modifica los filtros seleccionados."
                                : "Todavía no hay miembros registrados en el sistema."}
                        </p>

                    </div>
                )}

            </div>

            {/* =========================================== */}
            {/* PAGINACIÓN */}
            {/* =========================================== */}

            {filteredMembers.length > 0 && (

                <MembersPagination
                    currentPage={safeCurrentPage}
                    totalItems={filteredMembers.length}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />

            )}

        </section>
    );
}

export default MembersDirectory;
