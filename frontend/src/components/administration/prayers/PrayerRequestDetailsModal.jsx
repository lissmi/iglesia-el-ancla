
import { useEffect, useId, useState } from "react";

import {
    CalendarDays,
    CheckCircle2,
    Clock3,
    HandHeart,
    LockKeyhole,
    MessageSquareText,
    Save,
    ShieldCheck,
    UserRound,
    X,
} from "lucide-react";

import "../../../styles/components/administration/prayers/PrayerRequestDetailsModal.css";

// =========================================================
// CONFIGURACIÓN DE ESTADOS
// =========================================================

const STATUS_OPTIONS = [
    {
        value: "pending",
        label: "Pendiente",
    },
    {
        value: "praying",
        label: "En oración",
    },
    {
        value: "answered",
        label: "Respondida",
    },
    {
        value: "completed",
        label: "Finalizada",
    },
];

// =========================================================
// FORMATO DE FECHA
// =========================================================

function formatPrayerDate(value) {
    if (!value) return "Sin fecha";

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
// COMPONENTE
// =========================================================

function PrayerRequestDetailsModal({
    isOpen,
    request,
    onClose,
    onSave,
}) {
    const titleId = useId();

    const [status, setStatus] = useState("pending");
    const [followUpNote, setFollowUpNote] = useState("");

    const [isSaving, setIsSaving] = useState(false);

    // -------------------------------------------------------
    // CARGAR DATOS DE LA PETICIÓN SELECCIONADA
    // -------------------------------------------------------

    useEffect(() => {
        if (!isOpen || !request) return;

        setStatus(request.status || "pending");
        setFollowUpNote(request.followUpNote || "");
        setIsSaving(false);
    }, [isOpen, request]);

    // -------------------------------------------------------
    // CERRAR CON ESCAPE
    // -------------------------------------------------------

    useEffect(() => {
        if (!isOpen) return;

        function handleKeyDown(event) {
            if (event.key === "Escape") {
                onClose();
            }
        }

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose]);

    // =========================================================
    // GUARDAR CAMBIOS
    // =========================================================

    async function handleSubmit(event) {
        event.preventDefault();

        // Evitamos solicitudes duplicadas.
        if (!request || isSaving) {
            return;
        }

        setIsSaving(true);

        try {

            // Entregamos los cambios a la página principal.
            //
            // Actualmente se actualizan datos demostrativos.
            // Posteriormente onSave podrá ejecutar
            // una solicitud HTTP al backend.
            await onSave(request.id, {
                status,
                followUpNote: followUpNote.trim(),
            });

        } catch (error) {

            // Si ocurre un error, lo registramos.
            // Más adelante mostraremos un mensaje
            // visual de error dentro del modal.
            console.error(
                "No fue posible guardar el seguimiento:",
                error
            );

        } finally {

            setIsSaving(false);

        }
    }

    if (!isOpen || !request) {
        return null;
    }

    const isPrivate = request.privacy === "private";

    // Los administradores siempre pueden identificar
    // al miembro que realizó la petición.
    //
    // El anonimato solamente oculta su identidad
    // en las vistas destinadas a otros miembros.

    const requesterName =
        request.requester || "No informado";

    const hasChanges =
        status !== request.status ||
        followUpNote.trim() !== (request.followUpNote || "");

    return (
        <div
            className="prayer-details__overlay"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <section
                className="prayer-details"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
            >
                {/* =========================================== */}
                {/* ENCABEZADO */}
                {/* =========================================== */}

                <header className="prayer-details__header">
                    <div>
                        <span className="prayer-details__eyebrow">
                            {request.id} · PETICIÓN DE ORACIÓN
                        </span>

                        <h2 id={titleId}>
                            Detalle de petición
                        </h2>

                        <p>
                            Consulta la solicitud y registra su seguimiento.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="prayer-details__close"
                        onClick={onClose}
                        aria-label="Cerrar detalles"
                    >
                        <X size={20} aria-hidden="true" />
                    </button>
                </header>

                {/* =========================================== */}
                {/* CONTENIDO */}
                {/* =========================================== */}

                <div className="prayer-details__content">

                    <div className="prayer-details__badges">
                        <span
                            className={`prayer-details__privacy ${isPrivate
                                ? "prayer-details__privacy--private"
                                : "prayer-details__privacy--community"
                                }`}
                        >
                            {isPrivate ? (
                                <LockKeyhole size={15} aria-hidden="true" />
                            ) : (
                                <HandHeart size={15} aria-hidden="true" />
                            )}

                            {isPrivate ? "Privada" : "Comunitaria"}
                        </span>

                        {request.anonymous && (
                            <span className="prayer-details__anonymous">
                                <ShieldCheck size={15} aria-hidden="true" />
                                Anónima para miembros
                            </span>
                        )}
                    </div>

                    {/* ========================================= */}
                    {/* INFORMACIÓN GENERAL */}
                    {/* ========================================= */}

                    <div className="prayer-details__information">

                        <div className="prayer-details__field prayer-details__field--wide">
                            <span>Título de la petición</span>
                            <strong>{request.title}</strong>
                        </div>

                        {/* IDENTIDAD DEL SOLICITANTE */}

                        <div className="prayer-details__field">
                            <span>
                                <UserRound size={15} aria-hidden="true" />
                                Solicitante registrado
                            </span>

                            <strong>{requesterName}</strong>

                            {request.anonymous && (
                                <small>
                                    Identidad visible únicamente para
                                    administradores autorizados.
                                </small>
                            )}
                        </div>

                        <div className="prayer-details__field">
                            <span>
                                <CalendarDays size={15} aria-hidden="true" />
                                Fecha de recepción
                            </span>
                            <strong>{formatPrayerDate(request.date)}</strong>
                        </div>

                        <div className="prayer-details__field">
                            <span>Categoría</span>
                            <strong>{request.category}</strong>
                        </div>

                        <div className="prayer-details__field">
                            <span>
                                <Clock3 size={15} aria-hidden="true" />
                                Estado actual
                            </span>

                            <strong>
                                {STATUS_OPTIONS.find(
                                    (option) => option.value === request.status
                                )?.label || "Pendiente"}
                            </strong>
                        </div>

                    </div>

                    {/* ========================================= */}
                    {/* CONTENIDO DE LA PETICIÓN */}
                    {/* ========================================= */}

                    <div className="prayer-details__message">

                        <h3>
                            <MessageSquareText
                                size={19}
                                aria-hidden="true"
                            />
                            Contenido de la petición
                        </h3>

                        <p>
                            {request.description ||
                                "Esta petición no contiene una descripción."}
                        </p>

                    </div>

                    {/* ========================================= */}
                    {/* FORMULARIO DE SEGUIMIENTO */}
                    {/* ========================================= */}

                    <form
                        id="prayer-details-form"
                        onSubmit={handleSubmit}
                        className="prayer-details__form"
                    >
                        <h3>
                            <CheckCircle2 size={19} aria-hidden="true" />
                            Seguimiento de la petición
                        </h3>

                        <div className="prayer-details__form-field">

                            <label htmlFor="prayer-details-status">
                                Estado de seguimiento
                            </label>

                            <select
                                id="prayer-details-status"
                                value={status}
                                onChange={(event) =>
                                    setStatus(event.target.value)
                                }
                            >
                                {STATUS_OPTIONS.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                        </div>

                        <div className="prayer-details__form-field">

                            <label htmlFor="prayer-details-note">
                                Observación de seguimiento
                            </label>

                            <textarea
                                id="prayer-details-note"
                                rows={4}
                                maxLength={1000}
                                value={followUpNote}
                                onChange={(event) =>
                                    setFollowUpNote(event.target.value)
                                }
                                placeholder="Registra una observación breve sobre el seguimiento realizado..."
                            />

                            <small>
                                Esta observación será de uso interno y no
                                deberá mostrarse públicamente.
                            </small>

                        </div>

                    </form>

                    {/* ========================================= */}
                    {/* AVISO DE CONFIDENCIALIDAD */}
                    {/* ========================================= */}

                    <div className="prayer-details__notice">
                        <ShieldCheck size={18} aria-hidden="true" />

                        <p>
                            Esta información es confidencial y debe utilizarse
                            exclusivamente para el acompañamiento espiritual
                            y seguimiento autorizado. Las peticiones privadas
                            no deben compartirse con otros miembros y la
                            identidad de quienes soliciten anonimato debe
                            permanecer protegida fuera del equipo administrativo.
                        </p>
                    </div>

                </div>

                {/* =========================================== */}
                {/* PIE DEL MODAL */}
                {/* =========================================== */}

                <footer className="prayer-details__footer">

                    <button
                        type="button"
                        className="prayer-details__cancel"
                        onClick={onClose}
                    >
                        Cerrar
                    </button>

                    <button
                        type="submit"
                        form="prayer-details-form"
                        className="prayer-details__save"
                        disabled={!hasChanges || isSaving}
                    >
                        <Save size={17} aria-hidden="true" />
                        Guardar cambios
                    </button>

                </footer>

            </section>
        </div>
    );
}

export default PrayerRequestDetailsModal;
