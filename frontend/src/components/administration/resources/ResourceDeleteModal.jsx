import { useEffect, useId, useRef, useState } from "react";

import {
    AlertTriangle,
    Trash2,
    EyeOff,
    X,
} from "lucide-react";

import "../../../styles/components/administration/resources/ResourceDeleteModal.css";

function ResourceDeleteModal({
    resource,
    onClose,
    onHide,
    onDeletePermanently,
}) {

    const titleId = useId();
    const modalRef = useRef(null);
    const cancelRef = useRef(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [confirmedPermanent, setConfirmedPermanent] = useState(false);

    useEffect(() => {
        setBusy(false);
        setError("");
        setConfirmedPermanent(false);
    }, [resource]);

    // Ocultar no destruye información; eliminar sí requiere confirmación.
    async function confirm(action) {
        if (!resource || busy) return;
        if (action === "permanent" && !confirmedPermanent) return;
        const handler = action === "permanent" ? onDeletePermanently : onHide;
        if (!handler) return;
        setBusy(true);
        setError("");
        try {
            await handler(resource);
        } catch (failure) {
            setError(failure?.response?.data?.message || failure?.message ||
                "No pudimos completar la operación. Intenta nuevamente.");
        } finally {
            setBusy(false);
        }
    }

    // =====================================================
    // ACCESIBILIDAD
    // =====================================================

    useEffect(() => {
        if (!resource) return undefined;

        const previousFocus = document.activeElement;
        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = "hidden";
        cancelRef.current?.focus();

        function handleKeyDown(event) {
            if (event.key === "Escape" && !busy) {
                event.preventDefault();
                onClose?.();
                return;
            }

            if (event.key !== "Tab") return;

            const focusable = Array.from(
                modalRef.current?.querySelectorAll(
                    "button:not(:disabled)"
                ) || []
            );

            if (!focusable.length) return;

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
    }, [resource, onClose, busy]);

    if (!resource) return null;

    return (
        <div
            className="resource-delete-modal__overlay"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !busy) {
                    onClose?.();
                }
            }}
        >
            <section
                ref={modalRef}
                className="resource-delete-modal"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby={titleId}
            >

                <button
                    type="button"
                    className="resource-delete-modal__close"
                    onClick={onClose}
                    disabled={busy}
                    aria-label="Cerrar confirmación"
                >
                    <X size={19} />
                </button>

                <div className="resource-delete-modal__icon">
                    <AlertTriangle
                        size={29}
                        strokeWidth={1.7}
                        aria-hidden="true"
                    />
                </div>

                <h2 id={titleId}>
                    ¿Qué deseas hacer con este material?
                </h2>

                <p>Selecciona una acción para el recurso:</p>
                <div className="resource-delete-modal__resource">
                    {resource.title}
                </div>

                <p className="resource-delete-modal__warning">
                    <strong>Ocultar:</strong> el contenido y su archivo permanecen guardados;
                    podrás volver a mostrarlo cuando quieras.
                </p>


                {/* Mensaje para materiales que venían con la plataforma. */}
                {resource.isBuiltin ? (
                    <p className="resource-delete-modal__warning">
                        <strong>Restaurar versión original:</strong>{" "}
                        se eliminarán los cambios realizados a este material
                        y los archivos que se hayan agregado.
                        El material volverá a mostrarse como estaba originalmente.
                        Esta acción no se puede deshacer.
                    </p>
                ) : (
                    /* Mensaje para materiales creados por administradores. */
                    <p className="resource-delete-modal__warning">
                        <strong>Eliminar definitivamente:</strong>{" "}
                        este material y sus archivos adjuntos se eliminarán
                        permanentemente. Ya no estará disponible para los
                        miembros. Esta acción no se puede deshacer.
                    </p>
                )}

                {/* Solicitamos confirmación antes de realizar la acción. */}
                {resource.hasDbRecord && (
                    <label className="resource-delete-modal__permanent-check">
                        <input
                            type="checkbox"
                            checked={confirmedPermanent}
                            disabled={busy}
                            onChange={(event) =>
                                setConfirmedPermanent(event.target.checked)
                            }
                        />

                        <span>
                            {resource.isBuiltin
                                ? "Confirmo que deseo restaurar la versión original."
                                : "Confirmo que deseo eliminar este material definitivamente."}
                        </span>
                    </label>
                )}


                {error && <p role="alert" style={{ color: "#a34b38", marginTop: "12px" }}>{error}</p>}

                <div className="resource-delete-modal__actions resource-delete-modal__actions--choices">
                    <button
                        ref={cancelRef}
                        type="button"
                        className="resource-delete-modal__cancel"
                        onClick={onClose}
                        disabled={busy}
                    >
                        Cancelar
                    </button>

                    {!resource.hidden && (
                        <button
                            type="button"
                            className="resource-delete-modal__confirm resource-delete-modal__hide"
                            onClick={() => confirm("hide")}
                            disabled={busy}
                        >
                            <EyeOff size={17} />
                            {busy ? "Procesando..." : "Ocultar material"}
                        </button>
                    )}

                    {resource.hasDbRecord && (
                        <button
                            type="button"
                            className="resource-delete-modal__confirm"
                            onClick={() => confirm("permanent")}
                            disabled={busy || !confirmedPermanent}
                        >
                            <Trash2 size={17} />
                            {busy ? "Procesando..." : resource.isBuiltin
                                ? "Eliminar cambios guardados"
                                : "Eliminar definitivamente"}
                        </button>
                    )}
                </div>

            </section>
        </div>
    );
}

export default ResourceDeleteModal;
