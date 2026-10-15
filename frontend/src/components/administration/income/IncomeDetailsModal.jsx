// =========================================================
// IMPORTACIONES
// =========================================================

import {
    useEffect,
    useId,
    useRef,
} from "react";

import {
    X,
    Wallet,
    ReceiptText,
    CalendarDays,
    CreditCard,
    Banknote,
    Landmark,
    HandCoins,
    HeartHandshake,
    Gift,
    CircleDollarSign,
    CheckCircle2,
    Clock3,
    Ban,
    Hash,
    UserRound,
    AlignLeft,
    Pencil,
    ArrowDownLeft,
} from "lucide-react";

import "../../../styles/components/administration/income/IncomeDetailsModal.css";


// =========================================================
// CONFIGURACIÓN DE CATEGORÍAS
// =========================================================

const CATEGORY_CONFIG = {
    tithes: {
        label: "Diezmos",
        icon: HandCoins,
    },
    offerings: {
        label: "Ofrendas",
        icon: HeartHandshake,
    },
    donations: {
        label: "Donaciones",
        icon: Gift,
    },
    activities: {
        label: "Actividades",
        icon: CalendarDays,
    },
    other: {
        label: "Otros ingresos",
        icon: CircleDollarSign,
    },
};


// =========================================================
// CONFIGURACIÓN DE MEDIOS DE RECEPCIÓN
// =========================================================

const PAYMENT_CONFIG = {
    cash: {
        label: "Efectivo",
        icon: Banknote,
    },
    transfer: {
        label: "Transferencia bancaria",
        icon: Landmark,
    },
    card: {
        label: "Tarjeta",
        icon: CreditCard,
    },
    other: {
        label: "Otro medio",
        icon: Wallet,
    },
};


// =========================================================
// CONFIGURACIÓN DE ESTADOS
// =========================================================

const STATUS_CONFIG = {
    received: {
        label: "Recibido",
        description: "Ingreso confirmado y contabilizado.",
        icon: CheckCircle2,
        variant: "received",
    },
    pending: {
        label: "Pendiente",
        description: "Ingreso pendiente de confirmación.",
        icon: Clock3,
        variant: "pending",
    },
    cancelled: {
        label: "Anulado",
        description: "Ingreso anulado y no contabilizado.",
        icon: Ban,
        variant: "cancelled",
    },
    void: {
        label: "Anulado",
        description: "Ingreso anulado y no contabilizado.",
        icon: Ban,
        variant: "cancelled",
    },
};


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
        month: "long",
        year: "numeric",
    }).format(date);

};


// =========================================================
// COMPONENTE DE INFORMACIÓN
// =========================================================

function IncomeDetailItem({

    icon: Icon,
    label,
    value,

}) {

    return (
        <div className="income-details-modal__detail">

            <div className="income-details-modal__detail-icon">

                <Icon
                    size={18}
                    strokeWidth={1.8}
                    aria-hidden="true"
                />

            </div>

            <div className="income-details-modal__detail-content">

                <span>
                    {label}
                </span>

                <strong>
                    {value || "No registrado"}
                </strong>

            </div>

        </div>
    );
}


// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function IncomeDetailsModal({

    isOpen = false,
    income = null,

    onClose,
    onEdit,

}) {

    // =====================================================
    // IDENTIFICADOR ACCESIBLE
    // =====================================================

    const modalId = useId();


    // =====================================================
    // REFERENCIAS
    // =====================================================

    const modalRef = useRef(null);

    const closeButtonRef = useRef(null);


    // =====================================================
    // CONTROL DEL TECLADO Y DEL FOCO
    // =====================================================

    useEffect(() => {

        if (!isOpen || !income) {
            return;
        }

        const previousOverflow =
            document.body.style.overflow;

        const previousActiveElement =
            document.activeElement;

        document.body.style.overflow = "hidden";

        closeButtonRef.current?.focus();


        const handleKeyDown = (event) => {

            if (event.key === "Escape") {

                event.preventDefault();

                onClose?.();

                return;
            }

            if (event.key !== "Tab") {
                return;
            }

            const focusableElements =
                modalRef.current?.querySelectorAll(
                    'button:not([disabled]), ' +
                    'a[href], ' +
                    'input:not([disabled]), ' +
                    'select:not([disabled]), ' +
                    'textarea:not([disabled]), ' +
                    '[tabindex]:not([tabindex="-1"])'
                );

            if (
                !focusableElements ||
                focusableElements.length === 0
            ) {
                event.preventDefault();
                return;
            }

            const firstElement =
                focusableElements[0];

            const lastElement =
                focusableElements[
                    focusableElements.length - 1
                ];

            if (
                event.shiftKey &&
                document.activeElement === firstElement
            ) {

                event.preventDefault();

                lastElement.focus();

            } else if (
                !event.shiftKey &&
                document.activeElement === lastElement
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

            document.body.style.overflow =
                previousOverflow;

            document.removeEventListener(
                "keydown",
                handleKeyDown
            );

            if (
                previousActiveElement &&
                previousActiveElement.isConnected
            ) {
                previousActiveElement.focus();
            }

        };

    }, [isOpen, income, onClose]);


    // =====================================================
    // NO RENDERIZAR SI ESTÁ CERRADO
    // =====================================================

    if (!isOpen || !income) {
        return null;
    }


    // =====================================================
    // INFORMACIÓN DEL INGRESO
    // =====================================================

    const category =
        CATEGORY_CONFIG[income.category] ||
        CATEGORY_CONFIG.other;

    const payment =
        PAYMENT_CONFIG[income.paymentMethod] ||
        PAYMENT_CONFIG.other;

    const status =
        STATUS_CONFIG[income.status || "received"] ||
        STATUS_CONFIG.pending;

    const CategoryIcon = category.icon;

    const PaymentIcon = payment.icon;

    const StatusIcon = status.icon;


    const incomeId =
        income.id ||
        income._id ||
        "Sin identificador";

    const concept =
        income.concept?.trim() ||
        "Ingreso sin concepto";


    // =====================================================
    // EDITAR INGRESO
    // =====================================================

    const handleEdit = () => {

        if (!onEdit) {
            return;
        }

        onEdit(income);

    };


    // =====================================================
    // INTERFAZ
    // =====================================================

    return (
        <div
            className="income-details-modal__overlay"
            onMouseDown={(event) => {

                if (event.target === event.currentTarget) {
                    onClose?.();
                }

            }}
        >

            <div
                ref={modalRef}
                className="income-details-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby={`${modalId}-title`}
                aria-describedby={`${modalId}-description`}
            >

                {/* ======================================= */}
                {/* ENCABEZADO */}
                {/* ======================================= */}

                <div className="income-details-modal__header">

                    <div className="income-details-modal__heading">

                        <div className="income-details-modal__heading-icon">

                            <ReceiptText
                                size={23}
                                aria-hidden="true"
                            />

                        </div>

                        <div>

                            <span className="income-details-modal__eyebrow">
                                Gestión financiera
                            </span>

                            <h2 id={`${modalId}-title`}>
                                Detalles del ingreso
                            </h2>

                            <p id={`${modalId}-description`}>
                                Información completa del
                                movimiento financiero.
                            </p>

                        </div>

                    </div>


                    <button
                        ref={closeButtonRef}
                        type="button"
                        className="income-details-modal__close"
                        onClick={onClose}
                        aria-label="Cerrar detalles del ingreso"
                    >

                        <X
                            size={20}
                            aria-hidden="true"
                        />

                    </button>

                </div>


                {/* ======================================= */}
                {/* CONTENIDO */}
                {/* ======================================= */}

                <div className="income-details-modal__body">

                    {/* =================================== */}
                    {/* RESUMEN FINANCIERO */}
                    {/* =================================== */}

                    <div className="income-details-modal__summary">

                        <div className="income-details-modal__summary-top">

                            <div className="income-details-modal__summary-identity">

                                <div className="income-details-modal__summary-icon">

                                    <ArrowDownLeft
                                        size={24}
                                        aria-hidden="true"
                                    />

                                </div>

                                <div>

                                    <span>
                                        Movimiento de ingreso
                                    </span>

                                    <h3>
                                        {concept}
                                    </h3>

                                    <small>
                                        {incomeId}
                                    </small>

                                </div>

                            </div>


                            <span
                                className={
                                    "income-details-modal__status " +
                                    `income-details-modal__status--${status.variant}`
                                }
                            >

                                <StatusIcon
                                    size={15}
                                    aria-hidden="true"
                                />

                                {status.label}

                            </span>

                        </div>


                        <div className="income-details-modal__summary-amount">

                            <span>
                                Monto registrado
                            </span>

                            <strong>
                                {formatCurrency(income.amount)}
                            </strong>

                        </div>


                        <p className="income-details-modal__status-description">
                            {status.description}
                        </p>

                    </div>


                    {/* =================================== */}
                    {/* INFORMACIÓN GENERAL */}
                    {/* =================================== */}

                    <section className="income-details-modal__section">

                        <div className="income-details-modal__section-heading">

                            <Wallet
                                size={18}
                                aria-hidden="true"
                            />

                            <h3>
                                Información del ingreso
                            </h3>

                        </div>


                        <div className="income-details-modal__details-grid">

                            <IncomeDetailItem
                                icon={CategoryIcon}
                                label="Categoría"
                                value={category.label}
                            />

                            <IncomeDetailItem
                                icon={CalendarDays}
                                label="Fecha del ingreso"
                                value={formatDate(income.date)}
                            />

                            <IncomeDetailItem
                                icon={PaymentIcon}
                                label="Medio de recepción"
                                value={payment.label}
                            />

                            <IncomeDetailItem
                                icon={StatusIcon}
                                label="Estado"
                                value={status.label}
                            />

                        </div>

                    </section>


                    {/* =================================== */}
                    {/* INFORMACIÓN COMPLEMENTARIA */}
                    {/* =================================== */}

                    <section className="income-details-modal__section">

                        <div className="income-details-modal__section-heading">

                            <FileTextIcon />

                            <h3>
                                Información complementaria
                            </h3>

                        </div>


                        <div className="income-details-modal__details-grid">

                            <IncomeDetailItem
                                icon={Hash}
                                label="Referencia o comprobante"
                                value={income.reference}
                            />

                            <IncomeDetailItem
                                icon={UserRound}
                                label="Responsable del registro"
                                value={income.responsible}
                            />

                        </div>


                        {/* =============================== */}
                        {/* OBSERVACIONES */}
                        {/* =============================== */}

                        <div className="income-details-modal__notes">

                            <div className="income-details-modal__notes-heading">

                                <AlignLeft
                                    size={17}
                                    aria-hidden="true"
                                />

                                <span>
                                    Observaciones
                                </span>

                            </div>

                            <p>
                                {income.notes?.trim() ||
                                    "No se registraron observaciones para este ingreso."}
                            </p>

                        </div>

                    </section>

                </div>


                {/* ======================================= */}
                {/* ACCIONES */}
                {/* ======================================= */}

                <div className="income-details-modal__footer">

                    <button
                        type="button"
                        className="income-details-modal__cancel"
                        onClick={onClose}
                    >
                        Cerrar
                    </button>


                    {onEdit && (

                        <button
                            type="button"
                            className="income-details-modal__edit"
                            onClick={handleEdit}
                        >

                            <Pencil
                                size={17}
                                aria-hidden="true"
                            />

                            Editar ingreso

                        </button>

                    )}

                </div>

            </div>

        </div>
    );
}


// =========================================================
// ICONO DE SECCIÓN COMPLEMENTARIA
// =========================================================

function FileTextIcon() {

    return (
        <ReceiptText
            size={18}
            aria-hidden="true"
        />
    );

}

export default IncomeDetailsModal;