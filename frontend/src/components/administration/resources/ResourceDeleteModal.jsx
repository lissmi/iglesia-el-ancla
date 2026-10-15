
import { useEffect, useId, useRef } from "react";

import {
    AlertTriangle,
    Trash2,
    X,
} from "lucide-react";

import "../../../styles/components/administration/resources/ResourceDeleteModal.css";

function ResourceDeleteModal({
    resource,
    onClose,
    onConfirm,
}) {

    const titleId = useId();
    const modalRef = useRef(null);
    const cancelRef = useRef(null);

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
            if (event.key === "Escape") {
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
    }, [resource, onClose]);

    if (!resource) return null;

    return (
        <div
            className="resource-delete-modal__overlay"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
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
                    ¿Eliminar este recurso?
                </h2>

                <p>
                    Estás a punto de eliminar el siguiente
                    contenido del catálogo:
                </p>

                <div className="resource-delete-modal__resource">
                    {resource.title}
                </div>

                <p className="resource-delete-modal__warning">
                    Esta acción quitará el recurso de la
                    lista actual y no podrá deshacerse
                    durante esta sesión.
                </p>

                <div className="resource-delete-modal__actions">

                    <button
                        ref={cancelRef}
                        type="button"
                        className="resource-delete-modal__cancel"
                        onClick={onClose}
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        className="resource-delete-modal__confirm"
                        onClick={() => onConfirm?.(resource)}
                    >
                        <Trash2 size={17} />
                        Eliminar recurso
                    </button>

                </div>

            </section>
        </div>
    );
}

export default ResourceDeleteModal;
