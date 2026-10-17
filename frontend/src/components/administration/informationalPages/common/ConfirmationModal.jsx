
import { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

import "../../../../styles/components/administration/informationalPages/common/ConfirmationModal.css";

function ConfirmationModal({
    isOpen,
    title,
    description,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    onConfirm,
    onCancel,
}) {
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                onCancel?.();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    return (
        <div
            className="confirmation-modal__overlay"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onCancel?.();
                }
            }}
        >
            <section
                className="confirmation-modal"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirmation-modal-title"
                aria-describedby="confirmation-modal-description"
            >
                <button
                    type="button"
                    className="confirmation-modal__close"
                    onClick={onCancel}
                    aria-label="Cerrar ventana"
                >
                    <X size={19} />
                </button>

                <div className="confirmation-modal__icon">
                    <AlertTriangle size={27} />
                </div>

                <h2
                    id="confirmation-modal-title"
                    className="confirmation-modal__title"
                >
                    {title}
                </h2>

                <p
                    id="confirmation-modal-description"
                    className="confirmation-modal__description"
                >
                    {description}
                </p>

                <div className="confirmation-modal__actions">
                    <button
                        type="button"
                        className="confirmation-modal__button confirmation-modal__button--cancel"
                        onClick={onCancel}
                    >
                        {cancelText}
                    </button>

                    <button
                        type="button"
                        className="confirmation-modal__button confirmation-modal__button--confirm"
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </section>
        </div>
    );
}

export default ConfirmationModal;
