
import { useMemo, useState } from "react";

import {
    Cake,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Eye,
    Gift,
} from "lucide-react";

import "../../../styles/components/administration/members/MembersBirthdays.css";
import MembersPagination from "./MembersPagination";

// =========================================================
// CONFIGURACIÓN
// =========================================================

const MONTHS = [
    "enero", "febrero", "marzo", "abril",
    "mayo", "junio", "julio", "agosto",
    "septiembre", "octubre", "noviembre",
    "diciembre",
];

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

function getBirthdayParts(birthDate) {
    if (!birthDate) return null;

    const parts = birthDate.split("-").map(Number);

    if (
        parts.length !== 3 ||
        parts.some((part) => !Number.isInteger(part))
    ) {
        return null;
    }

    const [year, month, day] = parts;
    const date = new Date(Date.UTC(year, month - 1, day));

    if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day
    ) {
        return null;
    }

    return { month: month - 1, day };
}

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function MembersBirthdays({ members = [], onViewMember }) {

    // Mes actual como valor inicial.
    const today = new Date();

    const [selectedMonth, setSelectedMonth] =
        useState(today.getMonth());

    // =====================================================
    // PAGINACIÓN DE CUMPLEAÑOS
    // =====================================================

    const [currentPage, setCurrentPage] = useState(1);

    const [pageSize, setPageSize] = useState(6);

    const currentMonth = today.getMonth();
    const currentDay = today.getDate();

    // =====================================================
    // CUMPLEAÑOS DEL MES
    // =====================================================

    const birthdays = useMemo(() => {
        return members
            .filter((member) => {
                const birthday = getBirthdayParts(member.birthDate);

                return birthday?.month === selectedMonth;
            })
            .sort((a, b) => {
                const dayA = getBirthdayParts(a.birthDate).day;
                const dayB = getBirthdayParts(b.birthDate).day;

                return dayA - dayB ||
                    a.name.localeCompare(b.name, "es");
            });
    }, [members, selectedMonth]);

    // =====================================================
    // CUMPLEAÑOS DE LA PÁGINA ACTUAL
    // =====================================================

    const paginatedBirthdays = useMemo(() => {

        const startIndex = (currentPage - 1) * pageSize;

        return birthdays.slice(
            startIndex,
            startIndex + pageSize
        );

    }, [birthdays, currentPage, pageSize]);

    // =====================================================
    // CAMBIAR MES
    // =====================================================

    function handlePreviousMonth() {
        setSelectedMonth((previous) => (previous + 11) % 12);
        setCurrentPage(1);
    }

    function handleNextMonth() {
        setSelectedMonth((previous) => (previous + 1) % 12);
        setCurrentPage(1);
    }

    // =====================================================
    // CONTROL DE PAGINACIÓN
    // =====================================================

    function handlePageChange(page) {

        const totalPages = Math.max(
            1,
            Math.ceil(birthdays.length / pageSize)
        );

        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    }

    function handlePageSizeChange(size) {
        setPageSize(size);
        setCurrentPage(1);
    }

    // =====================================================
    // ETIQUETA DE CUMPLEAÑOS
    // =====================================================

    function getBirthdayStatus(day) {

        if (selectedMonth !== currentMonth) {
            return null;
        }

        if (day === currentDay) {
            return {
                label: "¡Hoy!",
                className: "today",
            };
        }

        if (day > currentDay) {
            return {
                label: "Próximo",
                className: "upcoming",
            };
        }

        return {
            label: "Ya pasó",
            className: "past",
        };
    }

    // =====================================================
    // INTERFAZ
    // =====================================================

    return (
        <section className="members-birthdays">

            {/* =========================================== */}
            {/* ENCABEZADO */}
            {/* =========================================== */}

            <div className="members-birthdays__header">

                <div className="members-birthdays__heading">
                    <div className="members-birthdays__icon">
                        <Cake size={22} aria-hidden="true" />
                    </div>

                    <div>
                        <h2>Cumpleaños de la comunidad</h2>

                        <p>
                            Conoce las fechas especiales
                            de nuestros miembros.
                        </p>
                    </div>
                </div>

                <span className="members-birthdays__count">
                    {birthdays.length} cumpleaños
                </span>

            </div>

            {/* =========================================== */}
            {/* SELECTOR DE MES */}
            {/* =========================================== */}

            <div className="members-birthdays__month-navigation">

                <button
                    type="button"
                    onClick={handlePreviousMonth}
                    aria-label="Mes anterior"
                >
                    <ChevronLeft size={19} />
                </button>

                <div className="members-birthdays__month-title">
                    <CalendarDays size={17} aria-hidden="true" />

                    <span>
                        {MONTHS[selectedMonth]}
                    </span>
                </div>

                <button
                    type="button"
                    onClick={handleNextMonth}
                    aria-label="Mes siguiente"
                >
                    <ChevronRight size={19} />
                </button>

            </div>

            {/* =========================================== */}
            {/* LISTADO DE CUMPLEAÑOS */}
            {/* =========================================== */}

            {birthdays.length > 0 ? (

                <div className="members-birthdays__list">

                    {paginatedBirthdays.map((member) => {

                        const birthday =
                            getBirthdayParts(member.birthDate);

                        const status =
                            getBirthdayStatus(birthday.day);

                        return (
                            <article
                                className="members-birthdays__member"
                                key={member.id}
                            >

                                <div className="members-birthdays__avatar">
                                    {getInitials(member.name)}
                                </div>

                                <div className="members-birthdays__member-info">

                                    <strong>{member.name}</strong>

                                    <span>
                                        <Gift
                                            size={14}
                                            aria-hidden="true"
                                        />

                                        {birthday.day} de{" "}
                                        {MONTHS[selectedMonth]}
                                    </span>

                                </div>

                                {status && (
                                    <span
                                        className={`members-birthdays__status members-birthdays__status--${status.className}`}
                                    >
                                        {status.label}
                                    </span>
                                )}

                                <button
                                    type="button"
                                    className="members-birthdays__view"
                                    onClick={() =>
                                        onViewMember?.(member)
                                    }
                                    aria-label={`Ver perfil de ${member.name}`}
                                >
                                    <Eye
                                        size={17}
                                        aria-hidden="true"
                                    />
                                </button>

                            </article>
                        );
                    })}

                </div>

            ) : (

                <div className="members-birthdays__empty">

                    <Cake
                        size={33}
                        strokeWidth={1.5}
                        aria-hidden="true"
                    />

                    <p>
                        No hay cumpleaños registrados
                        durante este mes.
                    </p>

                </div>

            )}

            {/* =========================================== */}
            {/* PAGINACIÓN DE CUMPLEAÑOS */}
            {/* =========================================== */}

            {birthdays.length > 0 && (
                <MembersPagination
                    currentPage={currentPage}
                    totalItems={birthdays.length}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    pageSizeOptions={[6, 12, 24]}
                    itemLabel="cumpleaños"
                />
            )}

        </section>
    );
}

export default MembersBirthdays;
