import { useEffect, useRef } from "react";

import {
    CalendarDays,
    Cake,
    Clock3,
    Mail,
    MapPin,
    Phone,
    ShieldCheck,
    UserRound,
    X,
} from "lucide-react";

import "../../../styles/components/administration/members/MemberDetailsModal.css";

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

    const parts = value.split("-").map(Number);

    if (
        parts.length !== 3 ||
        parts.some((part) => !Number.isInteger(part))
    ) {
        return "Fecha no disponible";
    }

    const [year, month, day] = parts;
    const date = new Date(Date.UTC(year, month - 1, day));

    if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day
    ) {
        return "Fecha no disponible";
    }

    return new Intl.DateTimeFormat("es-CL", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
    }).format(date);
}

function getBirthdayInfo(birthDate) {
    if (!birthDate) return null;

    const parts = birthDate.split("-").map(Number);

    if (parts.length !== 3) return null;

    const [year, month, day] = parts;
    const original = new Date(Date.UTC(year, month - 1, day));

    if (
        !Number.isInteger(year) ||
        !Number.isInteger(month) ||
        !Number.isInteger(day) ||
        original.getUTCFullYear() !== year ||
        original.getUTCMonth() !== month - 1 ||
        original.getUTCDate() !== day
    ) {
        return null;
    }

    const today = new Date();
    const currentYear = today.getFullYear();

    // Para el 29 de febrero en años no bisiestos,
    // usamos el 1 de marzo como siguiente aniversario.
    function anniversaryForYear(targetYear) {
        return new Date(
            targetYear,
            month - 1,
            day
        );
    }

    const todayDate = new Date(
        currentYear,
        today.getMonth(),
        today.getDate()
    );

    let nextBirthday = anniversaryForYear(currentYear);

    if (nextBirthday < todayDate) {
        nextBirthday = anniversaryForYear(currentYear + 1);
    }

    const daysUntil = Math.round(
        (Date.UTC(
            nextBirthday.getFullYear(),
            nextBirthday.getMonth(),
            nextBirthday.getDate()
        ) - Date.UTC(
            todayDate.getFullYear(),
            todayDate.getMonth(),
            todayDate.getDate()
        )) / 86400000
    );

    return {
        daysUntil,
        label:
            daysUntil === 0
                ? "¡Hoy es su cumpleaños!"
                : daysUntil === 1
                    ? "Cumpleaños mañana"
                    : `Próximo cumpleaños en ${daysUntil} días`,
    };
}

// =========================================================
// FILA DE INFORMACIÓN
// =========================================================

function MemberInfoItem({
    icon: Icon,
    label,
    children,
}) {
    return (
        <div className="member-details-modal__info-item">

            <div className="member-details-modal__info-icon">
                <Icon size={18} aria-hidden="true" />
            </div>

            <div className="member-details-modal__info-text">
                <span>{label}</span>
                <strong>{children}</strong>
            </div>

        </div>
    );
}

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function MemberDetailsModal({ member, onClose }) {

    const modalRef = useRef(null);
    const closeButtonRef = useRef(null);

    // =====================================================
    // ACCESIBILIDAD Y CONTROL DEL MODAL
    // =====================================================

    useEffect(() => {
        if (!member) return undefined;

        const previousFocus = document.activeElement;
        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = "hidden";

        closeButtonRef.current?.focus();

        function handleKeyDown(event) {

            if (event.key === "Escape") {
                event.preventDefault();
                onClose?.();
                return;
            }

            if (event.key !== "Tab") return;

            const focusable = Array.from(
                modalRef.current?.querySelectorAll(
                    'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
                ) || []
            );

            if (focusable.length === 0) {
                event.preventDefault();
                return;
            }

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (
                event.shiftKey &&
                document.activeElement === first
            ) {
                event.preventDefault();
                last.focus();
            } else if (
                !event.shiftKey &&
                document.activeElement === last
            ) {
                event.preventDefault();
                first.focus();
            }
        }

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = previousOverflow;
            previousFocus?.focus?.();
        };

    }, [member, onClose]);

    if (!member) return null;

    // =====================================================
    // INFORMACIÓN DEL MIEMBRO
    // =====================================================

    const isActive = member.status === "active";

    const birthdayInfo = getBirthdayInfo(member.birthDate);

    // =====================================================
    // INTERFAZ
    // =====================================================

    return (
        <div
            className="member-details-modal__overlay"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose?.();
                }
            }}
        >

            <section
                ref={modalRef}
                className="member-details-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="member-details-modal-title"
                aria-describedby="member-details-modal-description"
            >

                {/* ======================================= */}
                {/* ENCABEZADO */}
                {/* ======================================= */}

                <header className="member-details-modal__header">

                    <div className="member-details-modal__header-content">

                        <span className="member-details-modal__eyebrow">
                            PERFIL DE MIEMBRO
                        </span>

                        <h2 id="member-details-modal-title">
                            Información del miembro
                        </h2>

                        <p id="member-details-modal-description">
                            Datos registrados en la comunidad
                            Iglesia El Ancla.
                        </p>

                    </div>

                    <button
                        ref={closeButtonRef}
                        type="button"
                        className="member-details-modal__close"
                        onClick={onClose}
                        aria-label="Cerrar perfil"
                    >
                        <X size={20} aria-hidden="true" />
                    </button>

                </header>

                {/* ======================================= */}
                {/* IDENTIDAD */}
                {/* ======================================= */}

                <div className="member-details-modal__identity">

                    <div className="member-details-modal__avatar">
                        {getInitials(member.name)}
                    </div>

                    <div className="member-details-modal__identity-info">

                        <h3>{member.name}</h3>

                        <span className="member-details-modal__member-type">
                            <UserRound
                                size={14}
                                aria-hidden="true"
                            />

                            Miembro registrado
                        </span>

                    </div>

                    <span
                        className={
                            `member-details-modal__status ` +
                            (isActive
                                ? "member-details-modal__status--active"
                                : "member-details-modal__status--blocked")
                        }
                    >
                        {isActive ? "Activo" : "Inactivo"}
                    </span>

                </div>

                {/* ======================================= */}
                {/* CONTENIDO */}
                {/* ======================================= */}

                <div className="member-details-modal__body">

                    {/* INFORMACIÓN PERSONAL */}

                    <section className="member-details-modal__section">

                        <h4>
                            <UserRound size={18} aria-hidden="true" />
                            Información personal
                        </h4>

                        <div className="member-details-modal__info-grid">

                            <MemberInfoItem
                                icon={Cake}
                                label="Fecha de nacimiento"
                            >
                                {formatDate(member.birthDate)}
                            </MemberInfoItem>

                            <MemberInfoItem
                                icon={CalendarDays}
                                label="Próximo cumpleaños"
                            >
                                {birthdayInfo?.label || "No informado"}
                            </MemberInfoItem>

                        </div>

                    </section>

                    {/* CONTACTO */}

                    <section className="member-details-modal__section">

                        <h4>
                            <Phone size={18} aria-hidden="true" />
                            Datos de contacto
                        </h4>

                        <div className="member-details-modal__info-grid">

                            <MemberInfoItem
                                icon={Mail}
                                label="Correo electrónico"
                            >
                                {member.email || "No informado"}
                            </MemberInfoItem>

                            <MemberInfoItem
                                icon={Phone}
                                label="Teléfono"
                            >
                                {member.phone || "No informado"}
                            </MemberInfoItem>

                        </div>

                    </section>

                    {/* INFORMACIÓN DE REGISTRO */}

                    <section className="member-details-modal__section">

                        <h4>
                            <ShieldCheck size={18} aria-hidden="true" />
                            Información de registro
                        </h4>

                        <div className="member-details-modal__info-grid">

                            <MemberInfoItem
                                icon={MapPin}
                                label="Sucursal"
                            >
                                {member.branch || "No informada"}
                            </MemberInfoItem>

                            <MemberInfoItem
                                icon={Clock3}
                                label="Fecha de registro"
                            >
                                {formatDate(member.registeredAt)}
                            </MemberInfoItem>

                        </div>

                    </section>

                    {/* AVISO */}

                    <div className="member-details-modal__notice">

                        <ShieldCheck
                            size={18}
                            aria-hidden="true"
                        />

                        <p>
                            La información de este perfil es
                            de consulta administrativa. Los
                            cambios de acceso, estado o permisos
                            se realizan desde Gestión de usuarios.
                        </p>

                    </div>

                </div>

                {/* ======================================= */}
                {/* PIE DEL MODAL */}
                {/* ======================================= */}

                <footer className="member-details-modal__footer">

                    <button
                        type="button"
                        onClick={onClose}
                    >
                        Cerrar perfil
                    </button>

                </footer>

            </section>

        </div>
    );
}

export default MemberDetailsModal;
