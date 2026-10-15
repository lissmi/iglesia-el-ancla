
import { useEffect, useId, useRef, useState } from "react";

import {
    AlertTriangle,
    Trash2,
    X,
} from "lucide-react";

import {
    formatExpenseCurrency,
} from "../../../utils/expenseUtils";

import "../../../styles/components/administration/expenses/ExpenseDeleteModal.css";


// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function ExpenseDeleteModal({
    isOpen,
    expense,
    onClose,
    onConfirm,
}) {

    const titleId = useId();
    const descriptionId = useId();

    const cancelButtonRef = useRef(null);

    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState("");


    // =====================================================
    // ACCESIBILIDAD Y TECLADO
    // =====================================================

    useEffect(() => {

        if (!isOpen || !expense) {
            return;
        }

        const previousFocus = document.activeElement;

        cancelButtonRef.current?.focus();

        const handleKeyDown = (event) => {

            if (event.key === "Escape" && !isDeleting) {
                onClose?.();
            }

            // Mantenemos el foco dentro de la ventana
            // mientras se encuentra abierta.

            if (event.key === "Tab") {

                const modal = cancelButtonRef.current?.closest(
                    '[role="alertdialog"]'
                );

                if (!modal) {
                    return;
                }

                const focusableElements = Array.from(
                    modal.querySelectorAll(
                        'button:not([disabled])'
                    )
                );

                if (!focusableElements.length) {
                    return;
                }

                const first = focusableElements[0];
                const last =
                    focusableElements[focusableElements.length - 1];

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

        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {

            document.removeEventListener(
                "keydown",
                handleKeyDown
            );

            previousFocus?.focus?.();

        };

    }, [isOpen, expense, isDeleting, onClose]);


    // =====================================================
    // CONFIRMAR ELIMINACIÓN
    // =====================================================

    const handleConfirm = async () => {

        if (isDeleting || !expense) {
            return;
        }

        if (typeof onConfirm !== "function") {

            setError(
                "La función de eliminación no está conectada."
            );

            return;

        }

        setIsDeleting(true);
        setError("");

        try {

            // El componente principal realiza
            // la eliminación del registro.

            await onConfirm(expense);

            onClose?.();

        } catch (deleteError) {

            setError(
                deleteError?.message ||
                "No fue posible eliminar el gasto."
            );

        } finally {

            setIsDeleting(false);

        }

    };


    // =====================================================
    // NO MOSTRAR CUANDO ESTÁ CERRADO
    // =====================================================

    if (!isOpen || !expense) {
        return null;
    }


    // =====================================================
    // INTERFAZ
    // =====================================================

    return (

        <div
            className="expense-delete__overlay"
            onMouseDown={(event) => {

                if (
                    event.target === event.currentTarget &&
                    !isDeleting
                ) {
                    onClose?.();
                }

            }}
        >

            <section
                className="expense-delete"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={descriptionId}
            >

                {/* ======================================= */}
                {/* BOTÓN SUPERIOR */}
                {/* ======================================= */}

                <button
                    type="button"
                    className="expense-delete__close"
                    onClick={onClose}
                    disabled={isDeleting}
                    aria-label="Cerrar confirmación"
                >
                    <X size={20} aria-hidden="true" />
                </button>


                {/* ======================================= */}
                {/* ÍCONO DE ADVERTENCIA */}
                {/* ======================================= */}

                <div className="expense-delete__icon">

                    <AlertTriangle
                        size={29}
                        aria-hidden="true"
                    />

                </div>


                {/* ======================================= */}
                {/* ENCABEZADO */}
                {/* ======================================= */}

                <h2 id={titleId}>
                    ¿Eliminar este gasto?
                </h2>

                <p
                    id={descriptionId}
                    className="expense-delete__description"
                >
                    Estás a punto de eliminar un movimiento
                    del registro financiero. Esta acción
                    no se puede deshacer en la sesión actual.
                </p>


                {/* ======================================= */}
                {/* INFORMACIÓN DEL GASTO */}
                {/* ======================================= */}

                <div className="expense-delete__expense">

                    <span className="expense-delete__expense-label">
                        Movimiento seleccionado
                    </span>

                    <strong className="expense-delete__expense-name">
                        {expense.description || "Sin descripción"}
                    </strong>

                    <span className="expense-delete__expense-amount">
                        {formatExpenseCurrency(expense.amount)}
                    </span>

                    <span
                        className={
                            `expense-delete__status ${
                                expense.status === "Pagado"
                                    ? "expense-delete__status--paid"
                                    : "expense-delete__status--pending"
                            }`
                        }
                    >
                        {expense.status || "Sin estado"}
                    </span>

                </div>


                {/* ======================================= */}
                {/* MENSAJE DE ADVERTENCIA */}
                {/* ======================================= */}

                <div className="expense-delete__warning">

                    <AlertTriangle
                        size={17}
                        aria-hidden="true"
                    />

                    <span>
                        Al eliminarlo, también dejará de aparecer
                        en el historial, los resúmenes y los
                        gráficos financieros.
                    </span>

                </div>


                {/* ERROR */}
                {error && (

                    <p
                        className="expense-delete__error"
                        role="alert"
                    >
                        {error}
                    </p>

                )}


                {/* ======================================= */}
                {/* ACCIONES */}
                {/* ======================================= */}

                <div className="expense-delete__actions">

                    <button
                        ref={cancelButtonRef}
                        type="button"
                        className="expense-delete__cancel"
                        onClick={onClose}
                        disabled={isDeleting}
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        className="expense-delete__confirm"
                        onClick={handleConfirm}
                        disabled={isDeleting}
                    >

                        <Trash2
                            size={16}
                            aria-hidden="true"
                        />

                        {isDeleting
                            ? "Eliminando..."
                            : "Sí, eliminar gasto"}

                    </button>

                </div>

            </section>

        </div>

    );

}

export default ExpenseDeleteModal;
