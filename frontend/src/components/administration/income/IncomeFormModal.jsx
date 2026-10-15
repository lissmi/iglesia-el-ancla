// =========================================================
// IMPORTACIONES
// =========================================================

import {
    useEffect,
    useId,
    useState,
} from "react";

import {
    X,
    Wallet,
    FileText,
    Layers3,
    DollarSign,
    CalendarDays,
    CreditCard,
    CheckCircle2,
    Hash,
    UserRound,
    AlignLeft,
    Save,
    Plus,
    AlertCircle,
} from "lucide-react";

import "../../../styles/components/administration/income/IncomeFormModal.css";


// =========================================================
// OPCIONES DE CATEGORÍAS
// =========================================================

const CATEGORY_OPTIONS = [
    { value: "tithes", label: "Diezmos" },
    { value: "offerings", label: "Ofrendas" },
    { value: "donations", label: "Donaciones" },
    { value: "activities", label: "Actividades" },
    { value: "other", label: "Otros ingresos" },
];


// =========================================================
// OPCIONES DE MEDIOS DE RECEPCIÓN
// =========================================================

const PAYMENT_OPTIONS = [
    { value: "cash", label: "Efectivo" },
    { value: "transfer", label: "Transferencia bancaria" },
    { value: "card", label: "Tarjeta" },
    { value: "other", label: "Otro medio" },
];


// =========================================================
// OPCIONES DE ESTADO
// =========================================================

const STATUS_OPTIONS = [
    { value: "received", label: "Recibido" },
    { value: "pending", label: "Pendiente" },
    { value: "cancelled", label: "Anulado" },
];


// =========================================================
// OBTENER FECHA LOCAL
// =========================================================

const getTodayDate = () => {

    const today = new Date();

    const year = today.getFullYear();

    const month = String(
        today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
};


// =========================================================
// CREAR FORMULARIO VACÍO
// =========================================================

const createInitialForm = () => ({
    concept: "",
    category: "",
    amount: "",
    date: getTodayDate(),
    paymentMethod: "",
    status: "received",
    reference: "",
    responsible: "",
    notes: "",
});


// =========================================================
// VALIDAR FECHA REAL
// =========================================================

const isValidDate = (value) => {

    if (
        typeof value !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
        return false;
    }

    const [year, month, day] = value
        .split("-")
        .map(Number);

    const date = new Date(year, month - 1, day);

    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );
};


// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function IncomeFormModal({

    isOpen = false,
    income = null,

    onClose,
    onSave,

    isSaving = false,

}) {

    // =====================================================
    // IDENTIFICADOR ACCESIBLE
    // =====================================================

    const formId = useId();


    // =====================================================
    // DETERMINAR MODO
    // =====================================================

    const isEditing = Boolean(income);


    // =====================================================
    // ESTADOS
    // =====================================================

    const [formData, setFormData] = useState(
        createInitialForm
    );

    const [errors, setErrors] = useState({});

    const [submitError, setSubmitError] = useState("");


    // =====================================================
    // CARGAR DATOS AL ABRIR EL MODAL
    // =====================================================

    useEffect(() => {

        if (!isOpen) {
            return;
        }

        if (income) {

            setFormData({
                concept: income.concept ?? "",
                category: income.category ?? "",
                amount: income.amount ?? "",
                date: income.date ?? getTodayDate(),
                paymentMethod: income.paymentMethod ?? "",
                status: income.status ?? "received",
                reference: income.reference ?? "",
                responsible: income.responsible ?? "",
                notes: income.notes ?? "",
            });

        } else {

            setFormData(createInitialForm());

        }

        setErrors({});
        setSubmitError("");

    }, [isOpen, income]);


    // =====================================================
    // BLOQUEAR SCROLL DEL DOCUMENTO
    // =====================================================

    useEffect(() => {

        if (!isOpen) {
            return;
        }

        const previousOverflow =
            document.body.style.overflow;

        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow =
                previousOverflow;
        };

    }, [isOpen]);


    // =====================================================
    // CERRAR CON ESCAPE
    // =====================================================

    useEffect(() => {

        if (!isOpen || isSaving) {
            return;
        }

        const handleKeyDown = (event) => {

            if (event.key === "Escape") {
                onClose?.();
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

    }, [isOpen, isSaving, onClose]);


    // =====================================================
    // ACTUALIZAR CAMPOS
    // =====================================================

    const handleChange = (event) => {

        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setErrors((previous) => ({
            ...previous,
            [name]: "",
        }));

        setSubmitError("");

    };


    // =====================================================
    // VALIDAR FORMULARIO
    // =====================================================

    const validateForm = () => {

        const nextErrors = {};

        const concept = formData.concept.trim();

        const amount = Number(formData.amount);

        if (!concept) {

            nextErrors.concept =
                "Ingresa el concepto del ingreso.";

        } else if (concept.length > 120) {

            nextErrors.concept =
                "El concepto no puede superar 120 caracteres.";

        }

        if (
            !CATEGORY_OPTIONS.some(
                (option) =>
                    option.value === formData.category
            )
        ) {

            nextErrors.category =
                "Selecciona una categoría válida.";

        }

        if (
            String(formData.amount).trim() === "" ||
            !Number.isSafeInteger(amount) ||
            amount <= 0
        ) {

            nextErrors.amount =
                "Ingresa un monto válido, mayor que cero y sin decimales.";

        }

        if (!isValidDate(formData.date)) {

            nextErrors.date =
                "Selecciona una fecha válida.";

        } else if (formData.date > getTodayDate()) {

            nextErrors.date =
                "La fecha no puede ser posterior a hoy.";

        }

        if (
            !PAYMENT_OPTIONS.some(
                (option) =>
                    option.value === formData.paymentMethod
            )
        ) {

            nextErrors.paymentMethod =
                "Selecciona un medio de recepción.";

        }

        if (
            !STATUS_OPTIONS.some(
                (option) =>
                    option.value === formData.status
            )
        ) {

            nextErrors.status =
                "Selecciona un estado válido.";

        }

        if (formData.reference.trim().length > 100) {

            nextErrors.reference =
                "La referencia no puede superar 100 caracteres.";

        }

        if (formData.responsible.trim().length > 100) {

            nextErrors.responsible =
                "El responsable no puede superar 100 caracteres.";

        }

        if (formData.notes.trim().length > 1000) {

            nextErrors.notes =
                "Las observaciones no pueden superar 1000 caracteres.";

        }

        setErrors(nextErrors);

        return Object.keys(nextErrors).length === 0;

    };


    // =====================================================
    // GUARDAR INGRESO
    // =====================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        if (isSaving || !onSave) {
            return;
        }

        if (!validateForm()) {
            return;
        }

        const payload = {
            concept: formData.concept.trim(),
            category: formData.category,
            amount: Number(formData.amount),
            date: formData.date,
            paymentMethod: formData.paymentMethod,
            status: formData.status,
            reference: formData.reference.trim(),
            responsible: formData.responsible.trim(),
            notes: formData.notes.trim(),
        };

        try {

            // El componente padre realizará el guardado.
            // Si devuelve false, el modal permanecerá abierto.
            const result = await onSave(
                payload,
                income
            );

            if (result === false) {
                setSubmitError(
                    "No se pudo guardar el ingreso. Inténtalo nuevamente."
                );
            }

        } catch (error) {

            setSubmitError(
                error?.message ||
                "Ocurrió un error al guardar el ingreso."
            );

        }

    };


    // =====================================================
    // CERRAR MODAL
    // =====================================================

    const handleClose = () => {

        if (isSaving) {
            return;
        }

        onClose?.();

    };


    // =====================================================
    // NO RENDERIZAR SI ESTÁ CERRADO
    // =====================================================

    if (!isOpen) {
        return null;
    }


    // =====================================================
    // INTERFAZ
    // =====================================================

    return (
        <div
            className="income-form-modal__overlay"
            onMouseDown={(event) => {

                if (event.target === event.currentTarget) {
                    handleClose();
                }

            }}
        >

            <div
                className="income-form-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby={`${formId}-title`}
            >

                {/* ======================================= */}
                {/* ENCABEZADO */}
                {/* ======================================= */}

                <div className="income-form-modal__header">

                    <div className="income-form-modal__heading">

                        <div className="income-form-modal__heading-icon">

                            <Wallet
                                size={23}
                                aria-hidden="true"
                            />

                        </div>

                        <div>

                            <span className="income-form-modal__eyebrow">
                                Gestión financiera
                            </span>

                            <h2 id={`${formId}-title`}>

                                {isEditing
                                    ? "Editar ingreso"
                                    : "Registrar ingreso"}

                            </h2>

                            <p>

                                {isEditing
                                    ? "Actualiza la información del movimiento financiero."
                                    : "Completa los datos del nuevo ingreso recibido por la iglesia."}

                            </p>

                        </div>

                    </div>


                    <button
                        type="button"
                        className="income-form-modal__close"
                        onClick={handleClose}
                        disabled={isSaving}
                        aria-label="Cerrar formulario"
                    >

                        <X
                            size={20}
                            aria-hidden="true"
                        />

                    </button>

                </div>


                {/* ======================================= */}
                {/* FORMULARIO */}
                {/* ======================================= */}

                <form
                    className="income-form-modal__form"
                    onSubmit={handleSubmit}
                    noValidate
                >

                    {/* =================================== */}
                    {/* INFORMACIÓN GENERAL */}
                    {/* =================================== */}

                    <div className="income-form-modal__section">

                        <div className="income-form-modal__section-heading">

                            <FileText
                                size={18}
                                aria-hidden="true"
                            />

                            <h3>
                                Información del ingreso
                            </h3>

                        </div>


                        <div className="income-form-modal__grid">

                            {/* =========================== */}
                            {/* CONCEPTO */}
                            {/* =========================== */}

                            <div className="income-form-modal__field income-form-modal__field--full">

                                <label htmlFor={`${formId}-concept`}>

                                    Concepto del ingreso

                                    <span aria-hidden="true">*</span>

                                </label>

                                <div className="income-form-modal__control">

                                    <FileText
                                        size={17}
                                        aria-hidden="true"
                                    />

                                    <input
                                        id={`${formId}-concept`}
                                        name="concept"
                                        type="text"
                                        value={formData.concept}
                                        onChange={handleChange}
                                        placeholder="Ej. Ofrenda general del domingo"
                                        maxLength={120}
                                        disabled={isSaving}
                                        aria-invalid={Boolean(errors.concept)}
                                        aria-describedby={
                                            errors.concept
                                                ? `${formId}-concept-error`
                                                : undefined
                                        }
                                    />

                                </div>

                                {errors.concept && (

                                    <span
                                        id={`${formId}-concept-error`}
                                        className="income-form-modal__error"
                                    >
                                        {errors.concept}
                                    </span>

                                )}

                            </div>


                            {/* =========================== */}
                            {/* CATEGORÍA */}
                            {/* =========================== */}

                            <div className="income-form-modal__field">

                                <label htmlFor={`${formId}-category`}>

                                    Categoría

                                    <span aria-hidden="true">*</span>

                                </label>

                                <div className="income-form-modal__control">

                                    <Layers3
                                        size={17}
                                        aria-hidden="true"
                                    />

                                    <select
                                        id={`${formId}-category`}
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        disabled={isSaving}
                                        aria-invalid={Boolean(errors.category)}
                                    >

                                        <option value="">
                                            Seleccionar categoría
                                        </option>

                                        {CATEGORY_OPTIONS.map((option) => (

                                            <option
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </option>

                                        ))}

                                    </select>

                                </div>

                                {errors.category && (

                                    <span className="income-form-modal__error">
                                        {errors.category}
                                    </span>

                                )}

                            </div>


                            {/* =========================== */}
                            {/* MONTO */}
                            {/* =========================== */}

                            <div className="income-form-modal__field">

                                <label htmlFor={`${formId}-amount`}>

                                    Monto (CLP)

                                    <span aria-hidden="true">*</span>

                                </label>

                                <div className="income-form-modal__control">

                                    <DollarSign
                                        size={17}
                                        aria-hidden="true"
                                    />

                                    <input
                                        id={`${formId}-amount`}
                                        name="amount"
                                        type="number"
                                        min="1"
                                        step="1"
                                        inputMode="numeric"
                                        value={formData.amount}
                                        onChange={handleChange}
                                        placeholder="Ej. 185000"
                                        disabled={isSaving}
                                        aria-invalid={Boolean(errors.amount)}
                                    />

                                </div>

                                {errors.amount && (

                                    <span className="income-form-modal__error">
                                        {errors.amount}
                                    </span>

                                )}

                            </div>


                            {/* =========================== */}
                            {/* FECHA */}
                            {/* =========================== */}

                            <div className="income-form-modal__field">

                                <label htmlFor={`${formId}-date`}>

                                    Fecha del ingreso

                                    <span aria-hidden="true">*</span>

                                </label>

                                <div className="income-form-modal__control">

                                    <CalendarDays
                                        size={17}
                                        aria-hidden="true"
                                    />

                                    <input
                                        id={`${formId}-date`}
                                        name="date"
                                        type="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        max={getTodayDate()}
                                        disabled={isSaving}
                                        aria-invalid={Boolean(errors.date)}
                                    />

                                </div>

                                {errors.date && (

                                    <span className="income-form-modal__error">
                                        {errors.date}
                                    </span>

                                )}

                            </div>


                            {/* =========================== */}
                            {/* MEDIO DE RECEPCIÓN */}
                            {/* =========================== */}

                            <div className="income-form-modal__field">

                                <label htmlFor={`${formId}-paymentMethod`}>

                                    Medio de recepción

                                    <span aria-hidden="true">*</span>

                                </label>

                                <div className="income-form-modal__control">

                                    <CreditCard
                                        size={17}
                                        aria-hidden="true"
                                    />

                                    <select
                                        id={`${formId}-paymentMethod`}
                                        name="paymentMethod"
                                        value={formData.paymentMethod}
                                        onChange={handleChange}
                                        disabled={isSaving}
                                        aria-invalid={Boolean(errors.paymentMethod)}
                                    >

                                        <option value="">
                                            Seleccionar medio
                                        </option>

                                        {PAYMENT_OPTIONS.map((option) => (

                                            <option
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </option>

                                        ))}

                                    </select>

                                </div>

                                {errors.paymentMethod && (

                                    <span className="income-form-modal__error">
                                        {errors.paymentMethod}
                                    </span>

                                )}

                            </div>


                            {/* =========================== */}
                            {/* ESTADO */}
                            {/* =========================== */}

                            <div className="income-form-modal__field">

                                <label htmlFor={`${formId}-status`}>

                                    Estado del ingreso

                                    <span aria-hidden="true">*</span>

                                </label>

                                <div className="income-form-modal__control">

                                    <CheckCircle2
                                        size={17}
                                        aria-hidden="true"
                                    />

                                    <select
                                        id={`${formId}-status`}
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        disabled={isSaving}
                                        aria-invalid={Boolean(errors.status)}
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

                                {errors.status && (

                                    <span className="income-form-modal__error">
                                        {errors.status}
                                    </span>

                                )}

                            </div>

                        </div>

                    </div>


                    {/* =================================== */}
                    {/* INFORMACIÓN COMPLEMENTARIA */}
                    {/* =================================== */}

                    <div className="income-form-modal__section">

                        <div className="income-form-modal__section-heading">

                            <AlignLeft
                                size={18}
                                aria-hidden="true"
                            />

                            <h3>
                                Información complementaria
                            </h3>

                        </div>


                        <div className="income-form-modal__grid">

                            {/* =========================== */}
                            {/* REFERENCIA */}
                            {/* =========================== */}

                            <div className="income-form-modal__field">

                                <label htmlFor={`${formId}-reference`}>
                                    Referencia o comprobante
                                </label>

                                <div className="income-form-modal__control">

                                    <Hash
                                        size={17}
                                        aria-hidden="true"
                                    />

                                    <input
                                        id={`${formId}-reference`}
                                        name="reference"
                                        type="text"
                                        value={formData.reference}
                                        onChange={handleChange}
                                        placeholder="Ej. TRX-2026-001"
                                        maxLength={100}
                                        disabled={isSaving}
                                    />

                                </div>

                            </div>


                            {/* =========================== */}
                            {/* RESPONSABLE */}
                            {/* =========================== */}

                            <div className="income-form-modal__field">

                                <label htmlFor={`${formId}-responsible`}>
                                    Responsable del registro
                                </label>

                                <div className="income-form-modal__control">

                                    <UserRound
                                        size={17}
                                        aria-hidden="true"
                                    />

                                    <input
                                        id={`${formId}-responsible`}
                                        name="responsible"
                                        type="text"
                                        value={formData.responsible}
                                        onChange={handleChange}
                                        placeholder="Nombre del responsable"
                                        maxLength={100}
                                        disabled={isSaving}
                                    />

                                </div>

                            </div>


                            {/* =========================== */}
                            {/* OBSERVACIONES */}
                            {/* =========================== */}

                            <div className="income-form-modal__field income-form-modal__field--full">

                                <label htmlFor={`${formId}-notes`}>
                                    Observaciones
                                </label>

                                <textarea
                                    id={`${formId}-notes`}
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    placeholder="Información adicional sobre el ingreso..."
                                    rows={4}
                                    maxLength={1000}
                                    disabled={isSaving}
                                />

                                <span className="income-form-modal__character-count">
                                    {formData.notes.length}/1000 caracteres
                                </span>

                            </div>

                        </div>

                    </div>


                    {/* =================================== */}
                    {/* AVISO INFORMATIVO */}
                    {/* =================================== */}

                    <div className="income-form-modal__notice">

                        <AlertCircle
                            size={18}
                            aria-hidden="true"
                        />

                        <p>
                            Los ingresos pendientes o anulados
                            no se contabilizarán en los
                            indicadores financieros hasta que
                            su estado sea recibido.
                        </p>

                    </div>


                    {/* =================================== */}
                    {/* ERROR DE GUARDADO */}
                    {/* =================================== */}

                    {submitError && (

                        <div
                            className="income-form-modal__submit-error"
                            role="alert"
                        >
                            <AlertCircle
                                size={17}
                                aria-hidden="true"
                            />

                            {submitError}

                        </div>

                    )}


                    {/* =================================== */}
                    {/* ACCIONES */}
                    {/* =================================== */}

                    <div className="income-form-modal__footer">

                        <button
                            type="button"
                            className="income-form-modal__cancel"
                            onClick={handleClose}
                            disabled={isSaving}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="income-form-modal__save"
                            disabled={isSaving || !onSave}
                        >

                            {isEditing ? (

                                <Save
                                    size={17}
                                    aria-hidden="true"
                                />

                            ) : (

                                <Plus
                                    size={17}
                                    aria-hidden="true"
                                />

                            )}

                            {isSaving
                                ? "Guardando..."
                                : isEditing
                                    ? "Guardar cambios"
                                    : "Registrar ingreso"}

                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default IncomeFormModal;