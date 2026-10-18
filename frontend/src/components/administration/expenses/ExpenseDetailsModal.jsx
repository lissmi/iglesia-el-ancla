
import { useEffect, useId, useRef } from "react";

import {
    X,
    ReceiptText,
    Wallet,
    CalendarDays,
    Clock3,
    CheckCircle2,
    AlertCircle,
    CreditCard,
    Tag,
    FileText,
    Info,
    Image as ImageIcon,
} from "lucide-react";

import {
    formatExpenseCurrency,
    formatExpenseDate,
} from "../../../utils/expenseUtils";

import "../../../styles/components/administration/expenses/ExpenseDetailsModal.css";


// =========================================================
// FUNCIONES AUXILIARES
// =========================================================

// Formateamos las fechas únicamente cuando existen.
// Evitamos mostrar fechas inventadas.

const displayDate = (value) => {

    if (!value) {
        return "No registrada";
    }

    return formatExpenseDate(value);

};


// =========================================================
// COMPONENTE DE INFORMACIÓN
// =========================================================

function ExpenseDetailItem({
    icon: Icon,
    label,
    value,
}) {

    return (

        <div className="expense-details__item">

            <div className="expense-details__item-icon">
                <Icon size={17} aria-hidden="true" />
            </div>

            <div className="expense-details__item-content">

                <span className="expense-details__item-label">
                    {label}
                </span>

                <strong className="expense-details__item-value">
                    {value}
                </strong>

            </div>

        </div>

    );

}


// =========================================================
// MODAL DE DETALLES
// =========================================================

function ExpenseDetailsModal({
    isOpen,
    expense,
    onClose,
}) {

    const titleId = useId();

    const closeButtonRef = useRef(null);

    const isPaid = expense?.status === "Pagado";


    // =====================================================
    // ACCESIBILIDAD Y TECLADO
    // =====================================================

    useEffect(() => {

        if (!isOpen) {
            return;
        }

        const previousFocus = document.activeElement;

        // Enfocamos el botón cerrar al abrir el modal.

        closeButtonRef.current?.focus();

        const handleKeyDown = (event) => {

            if (event.key === "Escape") {
                onClose?.();
            }

        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {

            window.removeEventListener("keydown", handleKeyDown);

            // Restauramos el foco al control anterior.

            previousFocus?.focus?.();

        };

    }, [isOpen, onClose]);


    // =====================================================
    // NO RENDERIZAR CUANDO ESTÁ CERRADO
    // =====================================================

    if (!isOpen || !expense) {
        return null;
    }


    // =====================================================
    // COMPATIBILIDAD CON REGISTROS ANTERIORES
    // =====================================================

    // Los registros antiguos pueden no tener
    // dueDate o paidAt.
    //
    // No interpretamos automáticamente date como
    // vencimiento, porque representa otra información.

    const dueDate = expense.dueDate || null;

    const paidAt = expense.paidAt || null;


    // =====================================================
    // INTERFAZ
    // =====================================================

    return (

        <div
            className="expense-details__overlay"
            onMouseDown={(event) => {

                if (event.target === event.currentTarget) {
                    onClose?.();
                }

            }}
        >

            <section
                className="expense-details"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
            >

                {/* ======================================= */}
                {/* ENCABEZADO */}
                {/* ======================================= */}

                <div className="expense-details__header">

                    <div className="expense-details__heading">

                        <div className="expense-details__heading-icon">
                            <ReceiptText
                                size={23}
                                aria-hidden="true"
                            />
                        </div>

                        <div>

                            <span className="expense-details__eyebrow">
                                Administración financiera
                            </span>

                            <h2 id={titleId}>
                                Detalle del gasto
                            </h2>

                            <p>
                                Información del movimiento registrado.
                            </p>

                        </div>

                    </div>

                    <button
                        ref={closeButtonRef}
                        type="button"
                        className="expense-details__close"
                        onClick={onClose}
                        aria-label="Cerrar detalles"
                    >
                        <X size={20} aria-hidden="true" />
                    </button>

                </div>


                {/* ======================================= */}
                {/* RESUMEN PRINCIPAL */}
                {/* ======================================= */}

                <div className="expense-details__summary">

                    <span className="expense-details__summary-label">
                        Monto del gasto
                    </span>

                    <strong className="expense-details__amount">
                        {formatExpenseCurrency(expense.amount)}
                    </strong>

                    <h3 className="expense-details__description">
                        {expense.description || "Sin descripción"}
                    </h3>

                    <span
                        className={
                            `expense-details__status ${
                                isPaid
                                    ? "expense-details__status--paid"
                                    : "expense-details__status--pending"
                            }`
                        }
                    >

                        {isPaid ? (
                            <CheckCircle2
                                size={15}
                                aria-hidden="true"
                            />
                        ) : (
                            <Clock3
                                size={15}
                                aria-hidden="true"
                            />
                        )}

                        {expense.status || "Sin estado"}

                    </span>

                </div>


                {/* ======================================= */}
                {/* INFORMACIÓN GENERAL */}
                {/* ======================================= */}

                <div className="expense-details__section">

                    <h3 className="expense-details__section-title">
                        Información general
                    </h3>

                    <div className="expense-details__grid">

                        <ExpenseDetailItem
                            icon={Tag}
                            label="Categoría"
                            value={expense.category || "Sin categoría"}
                        />

                        <ExpenseDetailItem
                            icon={CreditCard}
                            label="Medio de pago"
                            value={
                                expense.paymentMethod ||
                                "No registrado"
                            }
                        />

                        <ExpenseDetailItem
                            icon={CalendarDays}
                            label="Fecha del gasto"
                            value={displayDate(expense.date)}
                        />

                        <ExpenseDetailItem
                            icon={Wallet}
                            label="Monto registrado"
                            value={formatExpenseCurrency(expense.amount)}
                        />

                    </div>

                </div>


                {/* ======================================= */}
                {/* CONTROL DE PAGOS */}
                {/* ======================================= */}

                <div className="expense-details__section">

                    <h3 className="expense-details__section-title">
                        Control de pagos
                    </h3>

                    <div className="expense-details__grid">

                        <ExpenseDetailItem
                            icon={CalendarDays}
                            label="Fecha de vencimiento"
                            value={displayDate(dueDate)}
                        />

                        <ExpenseDetailItem
                            icon={CheckCircle2}
                            label="Fecha efectiva de pago"
                            value={
                                isPaid
                                    ? displayDate(paidAt)
                                    : "Pendiente de pago"
                            }
                        />

                    </div>


                    {!isPaid && (

                        <div className="expense-details__notice">

                            <AlertCircle
                                size={18}
                                aria-hidden="true"
                            />

                            <p>
                                Este gasto todavía se encuentra
                                pendiente de pago. Su monto no
                                debe contabilizarse como egreso
                                efectivamente realizado.
                            </p>

                        </div>

                    )}


                    {isPaid && !paidAt && (

                        <div className="expense-details__notice">

                            <Info
                                size={18}
                                aria-hidden="true"
                            />

                            <p>
                                Este registro está marcado como
                                pagado, pero no tiene una fecha
                                efectiva de pago registrada.
                            </p>

                        </div>

                    )}

                </div>


                {/* ======================================= */}
                {/* OBSERVACIONES */}
                {/* ======================================= */}

                <div className="expense-details__section">

                    <h3 className="expense-details__section-title">
                        <FileText
                            size={17}
                            aria-hidden="true"
                        />
                        Observaciones
                    </h3>

                    <div className="expense-details__notes">

                        {expense.notes?.trim() ||
                            "No se registraron observaciones para este gasto."}

                    </div>

                </div>


                {/* ======================================= */}
                {/* BOLETA O COMPROBANTE */}
                {/* ======================================= */}

                <div className="expense-details__section">
                    <h3 className="expense-details__section-title">
                        <ImageIcon size={17} aria-hidden="true" />
                        Boleta o comprobante
                    </h3>
                    {expense.receiptImage?.url ? (
                        <div className="expense-details__receipt">
                            <a
                                href={expense.receiptImage.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Ver comprobante en tamaño completo"
                            >
                                <img
                                    src={expense.receiptImage.url}
                                    alt={`Comprobante del gasto ${expense.description || "registrado"}`}
                                />
                            </a>
                            <span>Selecciona la imagen para verla en tamaño completo.</span>
                        </div>
                    ) : (
                        <div className="expense-details__receipt-empty">
                            No se adjuntó un comprobante a este gasto.
                        </div>
                    )}
                </div>

                {/* ======================================= */}
                {/* PIE DEL MODAL */}
                {/* ======================================= */}

                <div className="expense-details__footer">

                    <button
                        type="button"
                        className="expense-details__button"
                        onClick={onClose}
                    >
                        Cerrar detalles
                    </button>

                </div>

            </section>

        </div>

    );

}

export default ExpenseDetailsModal;
