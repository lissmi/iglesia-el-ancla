// =========================================================
// IMPORTACIONES
// =========================================================
import { useEffect, useId, useState } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import "../../../styles/components/administration/recommendations/RecommendationDeleteModal.css";

// =========================================================
// MODAL DE CONFIRMACIÓN DE ELIMINACIÓN
// =========================================================
function RecommendationDeleteModal({
    isOpen = false,
    recommendation = null,
    onClose,
    onConfirm,
}) {
    const titleId = useId();
    const descriptionId = useId();
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isOpen) return;
        setIsDeleting(false);
        setError("");
    }, [isOpen, recommendation]);

    useEffect(() => {
        if (!isOpen) return undefined;

        function handleKeyDown(event) {
            if (event.key === "Escape" && !isDeleting) onClose?.();
        }

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, isDeleting, onClose]);

    if (!isOpen || !recommendation) return null;

    async function handleConfirm() {
        if (isDeleting || typeof onConfirm !== "function") return;

        setIsDeleting(true);
        setError("");

        try {
            // El componente padre elimina el registro y cierra el modal.
            await onConfirm(recommendation);
        } catch (deleteError) {
            setError(deleteError?.message || "No se pudo eliminar la recomendación. Inténtalo nuevamente.");
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <div
            className="recommendation-delete-modal__overlay"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !isDeleting) onClose?.();
            }}
        >
            <section
                className="recommendation-delete-modal"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={descriptionId}
            >
                {/* ENCABEZADO */}
                <header className="recommendation-delete-modal__header">
                    <div className="recommendation-delete-modal__warning-icon">
                        <AlertTriangle size={25} strokeWidth={1.8} aria-hidden="true" />
                    </div>
                    <button
                        type="button"
                        className="recommendation-delete-modal__close"
                        onClick={() => onClose?.()}
                        disabled={isDeleting}
                        aria-label="Cerrar confirmación"
                    >
                        <X size={19} aria-hidden="true" />
                    </button>
                </header>

                {/* MENSAJE */}
                <div className="recommendation-delete-modal__body">
                    <h2 id={titleId}>¿Eliminar recomendación?</h2>
                    <p id={descriptionId}>
                        Estás a punto de eliminar el siguiente contenido del catálogo:
                    </p>
                    <div className="recommendation-delete-modal__item">
                        <span className="recommendation-delete-modal__item-label">Recomendación seleccionada</span>
                        <strong>{recommendation.title || "Sin título"}</strong>
                    </div>
                    <p className="recommendation-delete-modal__notice">
                        Esta acción eliminará el registro y no se podrá deshacer.
                    </p>
                    {error && (
                        <p className="recommendation-delete-modal__error" role="alert">
                            {error}
                        </p>
                    )}
                </div>

                {/* ACCIONES */}
                <footer className="recommendation-delete-modal__footer">
                    <button
                        type="button"
                        className="recommendation-delete-modal__cancel"
                        onClick={() => onClose?.()}
                        disabled={isDeleting}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        className="recommendation-delete-modal__confirm"
                        onClick={handleConfirm}
                        disabled={isDeleting || typeof onConfirm !== "function"}
                    >
                        <Trash2 size={17} aria-hidden="true" />
                        {isDeleting ? "Eliminando..." : "Eliminar recomendación"}
                    </button>
                </footer>
            </section>
        </div>
    );
}

export default RecommendationDeleteModal;
