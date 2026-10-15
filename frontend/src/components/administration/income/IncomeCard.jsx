// =========================================================
// IMPORTACIONES
// =========================================================

import {
    HandCoins,
    HeartHandshake,
    Gift,
    CalendarDays,
    CircleDollarSign,
    Banknote,
    Landmark,
    CreditCard,
    Wallet,
    Eye,
    Pencil,
    Trash2,
    CheckCircle2,
    Clock3,
    Ban,
    ReceiptText,
} from "lucide-react";

import "../../../styles/components/administration/income/IncomeCard.css";


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
        label: "Transferencia",
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
        icon: CheckCircle2,
        variant: "received",
    },
    pending: {
        label: "Pendiente",
        icon: Clock3,
        variant: "pending",
    },
    cancelled: {
        label: "Anulado",
        icon: Ban,
        variant: "cancelled",
    },
    void: {
        label: "Anulado",
        icon: Ban,
        variant: "cancelled",
    },
};


// =========================================================
// FORMATEAR MONTO
// =========================================================

const formatCurrency = (amount) => {

    return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0,
    }).format(amount);

};


// =========================================================
// FORMATEAR FECHA
// =========================================================

const formatDate = (dateString) => {

    if (
        typeof dateString !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(dateString)
    ) {
        return "Sin fecha";
    }

    const [year, month, day] = dateString
        .split("-")
        .map(Number);

    const date = new Date(
        year,
        month - 1,
        day
    );

    // Verificamos que la fecha sea válida.
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

function IncomeCard({

    income,

    onView,
    onEdit,
    onDelete,

}) {

    // =====================================================
    // VALIDACIÓN DEL REGISTRO
    // =====================================================

    if (!income) {
        return null;
    }


    // =====================================================
    // INFORMACIÓN DE CATEGORÍA
    // =====================================================

    const category =
        CATEGORY_CONFIG[income.category] ||
        CATEGORY_CONFIG.other;

    const CategoryIcon = category.icon;


    // =====================================================
    // INFORMACIÓN DEL MEDIO DE RECEPCIÓN
    // =====================================================

    const payment =
        PAYMENT_CONFIG[income.paymentMethod] ||
        PAYMENT_CONFIG.other;

    const PaymentIcon = payment.icon;


    // =====================================================
    // INFORMACIÓN DEL ESTADO
    // =====================================================

    const status =
        STATUS_CONFIG[income.status || "received"] ||
        STATUS_CONFIG.pending;

    const StatusIcon = status.icon;


    // =====================================================
    // INFORMACIÓN DEL INGRESO
    // =====================================================

    const concept =
        income.concept?.trim() ||
        "Ingreso sin concepto";

    const incomeId =
        income.id ||
        income._id ||
        "Sin identificador";

    const amount = Number(income.amount);

    const validAmount =
        Number.isFinite(amount)
            ? amount
            : 0;


    // =====================================================
    // INTERFAZ
    // =====================================================

    return (
        <article className="income-card">

            {/* =========================================== */}
            {/* ENCABEZADO */}
            {/* =========================================== */}

            <div className="income-card__header">

                {/* ======================================= */}
                {/* INFORMACIÓN PRINCIPAL */}
                {/* ======================================= */}

                <div className="income-card__identity">

                    <div className="income-card__category-icon">

                        <CategoryIcon
                            size={22}
                            strokeWidth={1.8}
                            aria-hidden="true"
                        />

                    </div>

                    <div className="income-card__identity-text">

                        <h3 title={concept}>
                            {concept}
                        </h3>

                        <div className="income-card__metadata">

                            <span className="income-card__id">
                                {incomeId}
                            </span>

                            <span
                                className="income-card__metadata-separator"
                                aria-hidden="true"
                            >
                                •
                            </span>

                            <span className="income-card__category">
                                {category.label}
                            </span>

                        </div>

                    </div>

                </div>


                {/* ======================================= */}
                {/* MONTO Y ESTADO */}
                {/* ======================================= */}

                <div className="income-card__financial">

                    <strong className="income-card__amount">

                        {formatCurrency(validAmount)}

                    </strong>

                    <span
                        className={
                            "income-card__status " +
                            `income-card__status--${status.variant}`
                        }
                    >

                        <StatusIcon
                            size={13}
                            aria-hidden="true"
                        />

                        {status.label}

                    </span>

                </div>

            </div>


            {/* =========================================== */}
            {/* INFORMACIÓN ADICIONAL */}
            {/* =========================================== */}

            <div className="income-card__details">

                {/* ======================================= */}
                {/* FECHA */}
                {/* ======================================= */}

                <div className="income-card__detail">

                    <div className="income-card__detail-icon">

                        <CalendarDays
                            size={17}
                            aria-hidden="true"
                        />

                    </div>

                    <div>

                        <span className="income-card__detail-label">
                            Fecha del ingreso
                        </span>

                        <strong className="income-card__detail-value">
                            {formatDate(income.date)}
                        </strong>

                    </div>

                </div>


                {/* ======================================= */}
                {/* MEDIO DE RECEPCIÓN */}
                {/* ======================================= */}

                <div className="income-card__detail">

                    <div className="income-card__detail-icon">

                        <PaymentIcon
                            size={17}
                            aria-hidden="true"
                        />

                    </div>

                    <div>

                        <span className="income-card__detail-label">
                            Medio de recepción
                        </span>

                        <strong className="income-card__detail-value">
                            {payment.label}
                        </strong>

                    </div>

                </div>


                {/* ======================================= */}
                {/* REFERENCIA OPCIONAL */}
                {/* ======================================= */}

                {income.reference && (

                    <div className="income-card__detail">

                        <div className="income-card__detail-icon">

                            <ReceiptText
                                size={17}
                                aria-hidden="true"
                            />

                        </div>

                        <div>

                            <span className="income-card__detail-label">
                                Referencia
                            </span>

                            <strong className="income-card__detail-value">
                                {income.reference}
                            </strong>

                        </div>

                    </div>

                )}

            </div>


            {/* =========================================== */}
            {/* ACCIONES */}
            {/* =========================================== */}

            <div className="income-card__footer">

                <span className="income-card__footer-label">
                    Acciones del registro
                </span>

                <div className="income-card__actions">

                    {/* =================================== */}
                    {/* VER DETALLES */}
                    {/* =================================== */}

                    <button
                        type="button"
                        className="income-card__action income-card__action--view"
                        onClick={() => onView?.(income)}
                        disabled={!onView}
                        aria-label={
                            `Ver detalles de ${concept}`
                        }
                    >

                        <Eye
                            size={16}
                            aria-hidden="true"
                        />

                        <span>Ver</span>

                    </button>


                    {/* =================================== */}
                    {/* EDITAR */}
                    {/* =================================== */}

                    <button
                        type="button"
                        className="income-card__action income-card__action--edit"
                        onClick={() => onEdit?.(income)}
                        disabled={!onEdit}
                        aria-label={
                            `Editar ${concept}`
                        }
                    >

                        <Pencil
                            size={15}
                            aria-hidden="true"
                        />

                        <span>Editar</span>

                    </button>


                    {/* =================================== */}
                    {/* ELIMINAR */}
                    {/* =================================== */}

                    <button
                        type="button"
                        className="income-card__action income-card__action--delete"
                        onClick={() => onDelete?.(income)}
                        disabled={!onDelete}
                        aria-label={
                            `Eliminar ${concept}`
                        }
                    >

                        <Trash2
                            size={15}
                            aria-hidden="true"
                        />

                        <span>Eliminar</span>

                    </button>

                </div>

            </div>

        </article>
    );
}

export default IncomeCard;