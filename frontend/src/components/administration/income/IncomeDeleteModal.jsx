// =========================================================
// IMPORTACIONES
// =========================================================

import {
    useEffect,
    useId,
    useRef,
    useState,
} from "react";

import {
    X,
    Trash2,
    AlertTriangle,
    ReceiptText,
    CalendarDays,
    Wallet,
    LoaderCircle,
} from "lucide-react";

import "../../../styles/components/administration/income/IncomeDeleteModal.css";


// =========================================================
// FORMATEAR MONEDA
// =========================================================

const formatCurrency = (amount) => {

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount)) {
        return "Monto no disponible";
    }

    return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0,
    }).format(numericAmount);

};


// =========================================================
// FORMATEAR FECHA
// =========================================================

const formatDate = (dateString) => {

    if (
        typeof dateString !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(dateString)
    ) {
        return "No registrada";
    }

    const [year, month, day] = dateString
        .split("-")
        .map(Number);

    const date = new Date(year, month - 1, day);

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return "Fecha inválida";
    }

    return new Intl.DateTimeFormat("es-CL", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);

};


// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function IncomeDeleteModal({

    isOpen = false,
    income = null,

    onClose,
    onConfirm,

    isDeleting = false,

}) {

    // =====================================================
    // IDENTIFICADOR ACCESIBLE
    // =====================================================

    const modalId = useId();


    // =====================================================
    // REFERENCIAS
    // =====================================================

    const modalRef = useRef(null);

    const cancelButtonRef = useRef(null);

    const previousFocusRef = useRef(null);


    // =====================================================
    // ESTADO DE ERROR
    // =====================================================

    const [deleteError, setDeleteError] = useState("");


    // =====================================================
    // LIMPIAR ERROR AL ABRIR
    // =====================================================

    useEffect(() => {

        if (isOpen) {
            setDeleteError("");
        }

    }, [isOpen, income]);


    // =====================================================
    // BLOQUEAR SCROLL Y RESTAURAR FOCO
    // =====================================================

    useEffect(() => {

        if (!isOpen || !income) {
            return;
        }

        const previousOverflow =
            document.body.style.overflow;

        previousFocusRef.current =
            document.activeElement;

        document.body.style.overflow = "hidden";

        cancelButtonRef.current?.focus();

        return () => {

            document.body.style.overflow =
                previousOverflow;

            const previousElement =
                previousFocusRef.current;

            if (
                previousElement &&
                previousElement.isConnected
            ) {
                previousElement.focus();
            }

        };

    }, [isOpen, income]);


    // =====================================================
    // CONTROL DEL TECLADO
    // =====================================================

    useEffect(() => {

        if (!isOpen || !income) {
            return;
        }

        const handleKeyDown = (event) => {

            // ---------------------------------------------
            // CERRAR CON ESCAPE
            // ---------------------------------------------

            if (event.key === "Escape") {

                event.preventDefault();

                if (!isDeleting) {
                    onClose?.();
                }

                return;
            }


            // ---------------------------------------------
            // MANTENER EL FOCO DENTRO DEL MODAL
            // ---------------------------------------------

            if (event.key !== "Tab") {
                return;
            }

            const focusableElements = Array.from(
                modalRef.current?.querySelectorAll(
                    'button:not([disabled]), ' +
                    'a[href], ' +
                    'input:not([disabled]), ' +
                    'select:not([disabled]), ' +
                    'textarea:not([disabled]), ' +
                    '[tabindex]:not([tabindex="-1"])'
                ) || []
            );

            if (focusableElements.length === 0) {

                event.preventDefault();

                modalRef.current?.focus();

                return;
            }

            const firstElement =
                focusableElements[0];

            const lastElement =
                focusableElements[
                    focusableElements.length - 1
                ];

            const activeElement =
                document.activeElement;

            if (
                event.shiftKey &&
                (
                    activeElement === firstElement ||
                    !modalRef.current?.contains(activeElement)
                )
            ) {

                event.preventDefault();

                lastElement.focus();

            } else if (
                !event.shiftKey &&
                (
                    activeElement === lastElement ||
                    !modalRef.current?.contains(activeElement)
                )
            ) {

                event.preventDefault();

                firstElement.focus();

            }

        };

        document.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {

            document.removeEventListener(
                "keydown",
                handleKeyDown
            );

        };

    }, [
        isOpen,
        income,
        isDeleting,
        onClose,
    ]);


    // =====================================================
    // CERRAR MODAL
    // =====================================================

    const handleClose = () => {

        if (isDeleting) {
            return;
        }

        onClose?.();

    };


    // =====================================================
    // CONFIRMAR ELIMINACIÓN
    // =====================================================

    const handleConfirm = async () => {

        if (
            !income ||
            income.status !== "cancelled" ||
            !onConfirm ||
            isDeleting
        ) {
            return;
        }

        setDeleteError("");

        try {

            const result = await onConfirm(income);

            // El padre debe cerrar el modal después
            // de eliminar correctamente el registro.
            if (result === false) {

                setDeleteError(
                    "No se pudo eliminar el ingreso. Inténtalo nuevamente."
                );

            }

        } catch (error) {

            setDeleteError(
                error?.message ||
                "Ocurrió un error al eliminar el ingreso."
            );

        }

    };


    // =====================================================
    // NO RENDERIZAR SI ESTÁ CERRADO
    // =====================================================

    if (!isOpen || !income) {
        return null;
    }


    // =====================================================
    // INFORMACIÓN DEL INGRESO
    // =====================================================

    const incomeId =
        income.id ||
        income._id ||
        "Sin identificador";

    const concept =
        income.concept?.trim() ||
        "Ingreso sin concepto";

    // El estado Anulado es obligatorio antes de habilitar la eliminación.
    const canDelete = income.status === "cancelled";


    // =====================================================
    // INTERFAZ
    // =====================================================

    return (
        <div
            className="income-delete-modal__overlay"
            onMouseDown={(event) => {

                if (event.target === event.currentTarget) {
                    handleClose();
                }

            }}
        >

            <div
                ref={modalRef}
                className="income-delete-modal"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby={`${modalId}-title`}
                aria-describedby={`${modalId}-description`}
                tabIndex={-1}
            >

                {/* ======================================= */}
                {/* ENCABEZADO */}
                {/* ======================================= */}

                <div className="income-delete-modal__header">

                    <div className="income-delete-modal__icon">

                        <Trash2
                            size={25}
                            strokeWidth={1.8}
                            aria-hidden="true"
                        />

                    </div>

                    <button
                        type="button"
                        className="income-delete-modal__close"
                        onClick={handleClose}
                        disabled={isDeleting}
                        aria-label="Cerrar confirmación"
                    >

                        <X
                            size={19}
                            aria-hidden="true"
                        />

                    </button>

                </div>


                {/* ======================================= */}
                {/* TÍTULO Y DESCRIPCIÓN */}
                {/* ======================================= */}

                <div className="income-delete-modal__intro">

                    <h2 id={`${modalId}-title`}>
                        ¿Eliminar definitivamente este ingreso?
                    </h2>

                    <p id={`${modalId}-description`}>
                        {canDelete
                            ? "Se eliminará definitivamente de MongoDB. Esta acción es irreversible."
                            : "Primero debes editar este ingreso y cambiar su estado a Anulado."}
                    </p>

                </div>


                {/* ======================================= */}
                {/* RESUMEN DEL INGRESO */}
                {/* ======================================= */}

                <div className="income-delete-modal__summary">

                    {/* =================================== */}
                    {/* CONCEPTO */}
                    {/* =================================== */}

                    <div className="income-delete-modal__summary-row">

                        <div className="income-delete-modal__summary-label">

                            <ReceiptText
                                size={16}
                                aria-hidden="true"
                            />

                            <span>
                                Concepto
                            </span>

                        </div>

                        <strong>
                            {concept}
                        </strong>

                    </div>


                    {/* =================================== */}
                    {/* IDENTIFICADOR */}
                    {/* =================================== */}

                    <div className="income-delete-modal__summary-row">

                        <div className="income-delete-modal__summary-label">

                            <Wallet
                                size={16}
                                aria-hidden="true"
                            />

                            <span>
                                Identificador
                            </span>

                        </div>

                        <strong>
                            {incomeId}
                        </strong>

                    </div>


                    {/* =================================== */}
                    {/* FECHA */}
                    {/* =================================== */}

                    <div className="income-delete-modal__summary-row">

                        <div className="income-delete-modal__summary-label">

                            <CalendarDays
                                size={16}
                                aria-hidden="true"
                            />

                            <span>
                                Fecha
                            </span>

                        </div>

                        <strong>
                            {formatDate(income.date)}
                        </strong>

                    </div>


                    {/* =================================== */}
                    {/* MONTO */}
                    {/* =================================== */}

                    <div className="income-delete-modal__summary-row income-delete-modal__summary-row--amount">

                        <span>
                            Monto registrado
                        </span>

                        <strong>
                            {formatCurrency(income.amount)}
                        </strong>

                    </div>

                </div>


                {/* ======================================= */}
                {/* ADVERTENCIA */}
                {/* ======================================= */}

                <div className="income-delete-modal__warning">

                    <AlertTriangle
                        size={19}
                        aria-hidden="true"
                    />

                    <div>

                        <strong>
                            {canDelete ? "Eliminación irreversible" : "Anulación obligatoria"}
                        </strong>

                        <p>

                            {canDelete
                                ? "Se eliminará el registro y se solicitará retirar sus comprobantes privados de Cloudinary. Solo quedará una constancia mínima de auditoría."
                                : "El ingreso debe encontrarse Anulado antes de eliminarse. Cierra esta ventana y cambia su estado desde Editar."}

                        </p>

                    </div>

                </div>


                {/* ======================================= */}
                {/* ERROR DE ELIMINACIÓN */}
                {/* ======================================= */}

                {deleteError && (

                    <div
                        className="income-delete-modal__error"
                        role="alert"
                    >
                        <AlertTriangle
                            size={17}
                            aria-hidden="true"
                        />

                        {deleteError}

                    </div>

                )}


                {/* ======================================= */}
                {/* ACCIONES */}
                {/* ======================================= */}

                <div className="income-delete-modal__footer">

                    <button
                        ref={cancelButtonRef}
                        type="button"
                        className="income-delete-modal__cancel"
                        onClick={handleClose}
                        disabled={isDeleting}
                    >
                        Cancelar
                    </button>


                    <button
                        type="button"
                        className="income-delete-modal__confirm"
                        onClick={handleConfirm}
                        disabled={
                            isDeleting ||
                            !onConfirm ||
                            !canDelete
                        }
                    >

                        {isDeleting ? (

                            <LoaderCircle
                                size={17}
                                className="income-delete-modal__spinner"
                                aria-hidden="true"
                            />

                        ) : (

                            <Trash2
                                size={17}
                                aria-hidden="true"
                            />

                        )}

                        {isDeleting
                            ? "Eliminando..."
                            : "Sí, eliminar definitivamente"}

                    </button>

                </div>

            </div>

        </div>
    );
}

export default IncomeDeleteModal;
