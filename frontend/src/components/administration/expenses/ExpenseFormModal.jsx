
import { useEffect, useId, useRef, useState } from "react";

import {
    X,
    Save,
    CalendarDays,
    Info,
    ImagePlus,
    Trash2,
    ReceiptText,
} from "lucide-react";

import {
    expenseCategories,
} from "../../../data/admin/expensesData";

import {
    getExpenseLocalDate,
    isValidExpenseAmount,
} from "../../../utils/expenseUtils";

import "../../../styles/components/administration/expenses/ExpenseFormModal.css";
import { fetchExpenseReceipt } from "../../../services/expensesApi";


// =========================================================
// CONFIGURACIÓN
// =========================================================

const PAYMENT_METHODS = [
    "Transferencia",
    "Efectivo",
    "Débito",
    "Crédito",
    "Otro",
];

// Permitimos imágenes pequeñas; el backend también valida el contenido real.
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 3 * 1024 * 1024;

const createEmptyForm = () => ({
    description: "",
    amount: "",
    category: "",
    date: getExpenseLocalDate(),
    status: "Pagado",
    paymentMethod: "Transferencia",
    dueDate: "",
    paidAt: getExpenseLocalDate(),
    notes: "",
});


// =========================================================
// VALIDACIÓN DE FECHAS
// =========================================================

const isValidDate = (value) => {

    if (
        typeof value !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
        return false;
    }

    const date = new Date(`${value}T12:00:00`);

    return (
        !Number.isNaN(date.getTime()) &&
        getExpenseLocalDate(date) === value
    );

};


// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function ExpenseFormModal({
    isOpen,
    onClose,
    onSave,
    expense = null,
}) {

    const formId = useId();

    const [formData, setFormData] = useState(
        createEmptyForm
    );

    const [errors, setErrors] = useState({});

    const [isSaving, setIsSaving] = useState(false);

    // Archivo seleccionado: se enviará por separado a Cloudinary mediante el backend.
    const [receiptFile, setReceiptFile] = useState(null);

    // Imagen nueva: vista previa temporal. Imagen existente: Blob privado del backend.
    const [receiptImage, setReceiptImage] = useState(null);
    const [receiptRemoved, setReceiptRemoved] = useState(false);
    const [receiptLoading, setReceiptLoading] = useState(false);
    const [isReadingImage, setIsReadingImage] = useState(false);
    const imageInputRef = useRef(null);
    const imageReaderRef = useRef(null);
    const previousReceiptUrlRef = useRef(null);

    const isEditing = expense !== null;


    // =====================================================
    // CARGAR DATOS AL ABRIR
    // =====================================================

    useEffect(() => {

        if (!isOpen) {
            return;
        }

        if (expense) {

            setFormData({
                description: expense.description ?? "",
                amount: String(expense.amount ?? ""),
                category: expense.category ?? "",
                date: expense.date ?? "",
                status: expense.status ?? "Pagado",
                paymentMethod:
                    expense.paymentMethod ?? "Transferencia",
                dueDate: expense.dueDate ?? "",
                paidAt: expense.paidAt ??
                    (
                        expense.status === "Pagado"
                            ? expense.date ?? ""
                            : ""
                    ),
                notes: expense.notes ?? "",
            });

        } else {

            setFormData(createEmptyForm());

        }

        // Recuperamos la fotografía anterior al editar.
        setReceiptImage(expense?.receiptImage ?? null);
        setReceiptRemoved(false);
        setReceiptLoading(false);
        setReceiptFile(null);
        setIsReadingImage(false);
        if (imageReaderRef.current) imageReaderRef.current.abort();
        if (imageInputRef.current) imageInputRef.current.value = "";

        setErrors({});
        setIsSaving(false);

    }, [isOpen, expense]);

    // =====================================================
    // CARGAR PREVISUALIZACIÓN DE UNA BOLETA PRIVADA
    // =====================================================

    useEffect(() => {
        if (!isOpen || !expense?.id || !expense.hasReceipt || receiptRemoved || receiptFile) return;

        let active = true;
        const controller = new AbortController();
        let temporaryUrl = null;
        setReceiptLoading(true);

        fetchExpenseReceipt(expense.id, controller.signal)
            .then((blob) => {
                if (!active) return;
                temporaryUrl = URL.createObjectURL(blob);
                previousReceiptUrlRef.current = temporaryUrl;
                setReceiptImage((current) => current || {
                    url: temporaryUrl,
                    fileName: "Boleta almacenada de forma privada",
                });
            })
            .catch((error) => {
                if (!active || error?.code === "ERR_CANCELED") return;
                setErrors((previous) => ({
                    ...previous,
                    receiptImage: "No fue posible cargar la vista previa del comprobante.",
                }));
            })
            .finally(() => { if (active) setReceiptLoading(false); });

        return () => {
            active = false;
            controller.abort();
            if (temporaryUrl) URL.revokeObjectURL(temporaryUrl);
            if (previousReceiptUrlRef.current === temporaryUrl) {
                previousReceiptUrlRef.current = null;
            }
        };
    }, [isOpen, expense?.id, expense?.hasReceipt, receiptRemoved, receiptFile]);

    // =====================================================
    // CONTROLAR CAMBIOS
    // =====================================================

    const handleChange = (event) => {

        const { name, value } = event.target;

        setFormData((previous) => {

            const updated = {
                ...previous,
                [name]: value,
            };

            // Cuando el gasto cambia a pendiente,
            // ya no tiene fecha efectiva de pago.

            if (
                name === "status" &&
                value !== "Pagado"
            ) {
                updated.paidAt = "";
            }

            // Cuando se marca como pagado,
            // sugerimos la fecha actual si está vacía.

            if (
                name === "status" &&
                value === "Pagado" &&
                !updated.paidAt
            ) {
                updated.paidAt = getExpenseLocalDate();
            }

            return updated;

        });

        setErrors((previous) => ({
            ...previous,
            [name]: "",
        }));

    };


    // =====================================================
    // SELECCIONAR FOTO DE BOLETA O COMPROBANTE
    // =====================================================

    const handleReceiptImageChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Nunca borrar una fotografía válida si la nueva no es aceptada.
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            setErrors((previous) => ({
                ...previous,
                receiptImage: "Selecciona una imagen JPG, PNG o WEBP.",
            }));
            event.target.value = "";
            return;
        }

        if (file.size > MAX_IMAGE_SIZE) {
            setErrors((previous) => ({
                ...previous,
                receiptImage: "El comprobante no puede superar los 3 MB.",
            }));
            event.target.value = "";
            return;
        }

        // Esperamos a que termine la lectura antes de permitir guardar.
        imageReaderRef.current?.abort();
        const reader = new FileReader();
        imageReaderRef.current = reader;
        setIsReadingImage(true);

        reader.onload = () => {
            setReceiptFile(file);
            setReceiptRemoved(false);
            setReceiptImage({
                url: reader.result,
                fileName: file.name,
                mimeType: file.type,
                size: file.size,
                publicId: null,
            });
            setIsReadingImage(false);
            setErrors((previous) => ({ ...previous, receiptImage: "" }));
        };

        reader.onerror = () => {
            setIsReadingImage(false);
            setErrors((previous) => ({
                ...previous,
                receiptImage: "No se pudo leer el comprobante.",
            }));
        };

        reader.onabort = () => setIsReadingImage(false);
        reader.readAsDataURL(file);
    };

    const handleRemoveReceiptImage = () => {
        imageReaderRef.current?.abort();
        setReceiptImage(null);
        setReceiptFile(null);
        setReceiptRemoved(Boolean(expense?.hasReceipt));
        setIsReadingImage(false);
        if (imageInputRef.current) imageInputRef.current.value = "";
        setErrors((previous) => ({ ...previous, receiptImage: "" }));
    };

    // =====================================================
    // VALIDAR FORMULARIO
    // =====================================================

    const validateForm = () => {

        const nextErrors = {};

        if (!formData.description.trim()) {

            nextErrors.description =
                "Ingresa una descripción del gasto.";

        } else if (formData.description.trim().length > 150) {

            nextErrors.description =
                "La descripción no puede superar 150 caracteres.";

        }

        if (!isValidExpenseAmount(formData.amount)) {

            nextErrors.amount =
                "Ingresa un monto entero mayor que cero.";

        }

        if (!expenseCategories.includes(formData.category)) {

            nextErrors.category =
                "Selecciona una categoría válida.";

        }

        if (!isValidDate(formData.date)) {

            nextErrors.date =
                "Selecciona una fecha válida.";

        }

        if (
            formData.status !== "Pagado" &&
            formData.status !== "Pendiente" &&
            formData.status !== "Anulado"
        ) {

            nextErrors.status =
                "Selecciona un estado válido.";

        }

        if (!PAYMENT_METHODS.includes(formData.paymentMethod)) {

            nextErrors.paymentMethod =
                "Selecciona un medio de pago válido.";

        }

        if (
            formData.dueDate &&
            !isValidDate(formData.dueDate)
        ) {

            nextErrors.dueDate =
                "Selecciona una fecha de vencimiento válida.";

        }

        if (
            formData.status === "Pendiente" &&
            !formData.dueDate
        ) {

            nextErrors.dueDate =
                "Indica cuándo está previsto pagar este gasto.";

        }

        if (formData.status === "Pagado") {

            if (!isValidDate(formData.paidAt)) {

                nextErrors.paidAt =
                    "Indica una fecha de pago válida.";

            } else if (
                isValidDate(formData.date) &&
                formData.paidAt < formData.date
            ) {

                nextErrors.paidAt =
                    "La fecha de pago no puede ser anterior a la fecha del gasto.";

            } else if (formData.paidAt > getExpenseLocalDate()) {
                nextErrors.paidAt = "La fecha de pago no puede ser futura.";

            }

        }

        if (formData.notes.length > 1000) {

            nextErrors.notes =
                "Las observaciones no pueden superar 1000 caracteres.";

        }

        return nextErrors;

    };


    // =====================================================
    // GUARDAR
    // =====================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        if (isSaving || isReadingImage) {
            return;
        }

        const validationErrors = validateForm();

        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        if (typeof onSave !== "function") {

            setErrors({
                submit:
                    "La función de guardado todavía no está conectada.",
            });

            return;

        }

        const payload = {
            description: formData.description.trim(),
            amount: Number(formData.amount),
            category: formData.category,
            date: formData.date,
            status: formData.status,
            paymentMethod: formData.paymentMethod,
            dueDate: formData.dueDate || null,
            paidAt:
                formData.status === "Pagado"
                    ? formData.paidAt
                    : null,
            notes: formData.notes.trim(),

            // La vista previa NO viaja a MongoDB. Solo indicamos si se quitó.
            removeReceipt: receiptRemoved,
        };

        setIsSaving(true);

        try {

            // El componente padre se encarga de guardar
            // o actualizar el registro.

            // El backend guardará en MongoDB solo la referencia de Cloudinary.
            await onSave(payload, expense, receiptFile);

            onClose?.();

        } catch (error) {

            setErrors({
                submit:
                    error?.message ||
                    "No fue posible guardar el gasto.",
            });

        } finally {

            setIsSaving(false);

        }

    };


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

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };

    }, [isOpen, isSaving, onClose]);


    // =====================================================
    // INTERFAZ
    // =====================================================

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="expense-modal__overlay"
            onMouseDown={(event) => {

                if (
                    event.target === event.currentTarget &&
                    !isSaving
                ) {
                    onClose?.();
                }

            }}
        >

            <section
                className="expense-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby={`${formId}-title`}
                aria-describedby={`${formId}-description`}
            >

                {/* ======================================= */}
                {/* ENCABEZADO */}
                {/* ======================================= */}

                <div className="expense-modal__header">

                    <div>

                        <span className="expense-modal__eyebrow">
                            Administración financiera
                        </span>

                        <h2 id={`${formId}-title`}>
                            {isEditing
                                ? "Editar gasto"
                                : "Registrar nuevo gasto"}
                        </h2>

                        <p id={`${formId}-description`}>
                            {isEditing
                                ? "Actualiza la información del movimiento financiero."
                                : "Completa los datos del egreso que deseas registrar."}
                        </p>

                    </div>

                    <button
                        type="button"
                        className="expense-modal__close"
                        onClick={onClose}
                        disabled={isSaving}
                        aria-label="Cerrar formulario"
                    >
                        <X size={21} aria-hidden="true" />
                    </button>

                </div>


                {/* ======================================= */}
                {/* FORMULARIO */}
                {/* ======================================= */}

                <form
                    className="expense-form"
                    onSubmit={handleSubmit}
                    noValidate
                >

                    {/* DESCRIPCIÓN */}

                    <div className="expense-form__field expense-form__field--full">

                        <label htmlFor={`${formId}-description-input`}>
                            Descripción *
                        </label>

                        <input
                            id={`${formId}-description-input`}
                            name="description"
                            type="text"
                            value={formData.description}
                            onChange={handleChange}
                            maxLength={151}
                            placeholder="Ej: Compra de útiles de aseo"
                            aria-invalid={Boolean(errors.description)}
                        />

                        {errors.description && (
                            <span className="expense-form__error" role="alert">
                                {errors.description}
                            </span>
                        )}

                    </div>


                    {/* MONTO */}

                    <div className="expense-form__field">

                        <label htmlFor={`${formId}-amount`}>
                            Monto (CLP) *
                        </label>

                        <div className="expense-form__amount">

                            <span>$</span>

                            <input
                                id={`${formId}-amount`}
                                name="amount"
                                type="number"
                                min="1"
                                step="1"
                                value={formData.amount}
                                onChange={handleChange}
                                placeholder="45000"
                                aria-invalid={Boolean(errors.amount)}
                            />

                        </div>

                        {errors.amount && (
                            <span className="expense-form__error" role="alert">
                                {errors.amount}
                            </span>
                        )}

                    </div>


                    {/* CATEGORÍA */}

                    <div className="expense-form__field">

                        <label htmlFor={`${formId}-category`}>
                            Categoría *
                        </label>

                        <select
                            id={`${formId}-category`}
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            aria-invalid={Boolean(errors.category)}
                        >

                            <option value="">
                                Selecciona una categoría
                            </option>

                            {expenseCategories.map((category) => (
                                <option
                                    key={category}
                                    value={category}
                                >
                                    {category}
                                </option>
                            ))}

                        </select>

                        {errors.category && (
                            <span className="expense-form__error" role="alert">
                                {errors.category}
                            </span>
                        )}

                    </div>


                    {/* FECHA DEL GASTO */}

                    <div className="expense-form__field">

                        <label htmlFor={`${formId}-date`}>
                            Fecha del gasto *
                        </label>

                        <input
                            id={`${formId}-date`}
                            name="date"
                            type="date"
                            value={formData.date}
                            onChange={handleChange}
                            aria-invalid={Boolean(errors.date)}
                        />

                        {errors.date && (
                            <span className="expense-form__error" role="alert">
                                {errors.date}
                            </span>
                        )}

                    </div>


                    {/* ESTADO */}

                    <div className="expense-form__field">

                        <label htmlFor={`${formId}-status`}>
                            Estado *
                        </label>

                        <select
                            id={`${formId}-status`}
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                        >
                            <option value="Pagado">
                                Pagado
                            </option>

                            <option value="Pendiente">
                                Pendiente
                            </option>

                            <option value="Anulado">
                                Anulado
                            </option>
                        </select>

                    </div>


                    {/* MEDIO DE PAGO */}

                    <div className="expense-form__field expense-form__field--full">

                        <label htmlFor={`${formId}-payment-method`}>
                            Medio de pago *
                        </label>

                        <select
                            id={`${formId}-payment-method`}
                            name="paymentMethod"
                            value={formData.paymentMethod}
                            onChange={handleChange}
                        >

                            {PAYMENT_METHODS.map((method) => (
                                <option
                                    key={method}
                                    value={method}
                                >
                                    {method}
                                </option>
                            ))}

                        </select>

                    </div>


                    {/* =================================== */}
                    {/* CONTROL DE FECHAS */}
                    {/* =================================== */}

                    <div className="expense-form__section-heading expense-form__field--full">

                        <CalendarDays
                            size={17}
                            aria-hidden="true"
                        />

                        <span>
                            Control de pagos
                        </span>

                    </div>


                    {/* FECHA DE VENCIMIENTO */}

                    <div className="expense-form__field">

                        <label htmlFor={`${formId}-due-date`}>
                            Fecha de vencimiento
                            {formData.status === "Pendiente" && " *"}
                        </label>

                        <input
                            id={`${formId}-due-date`}
                            name="dueDate"
                            type="date"
                            value={formData.dueDate}
                            onChange={handleChange}
                            aria-invalid={Boolean(errors.dueDate)}
                        />

                        {errors.dueDate && (
                            <span className="expense-form__error" role="alert">
                                {errors.dueDate}
                            </span>
                        )}

                    </div>


                    {/* FECHA EFECTIVA DE PAGO */}

                    {formData.status === "Pagado" ? (

                        <div className="expense-form__field">

                            <label htmlFor={`${formId}-paid-at`}>
                                Fecha efectiva de pago *
                            </label>

                            <input
                                id={`${formId}-paid-at`}
                                name="paidAt"
                                type="date"
                                value={formData.paidAt}
                                onChange={handleChange}
                                aria-invalid={Boolean(errors.paidAt)}
                            />

                            {errors.paidAt && (
                                <span className="expense-form__error" role="alert">
                                    {errors.paidAt}
                                </span>
                            )}

                        </div>

                    ) : (

                        <div className="expense-form__payment-notice">

                            <Info
                                size={17}
                                aria-hidden="true"
                            />

                            <span>
                                Este gasto se registrará como pendiente.
                                No se contabilizará como pago realizado
                                hasta que cambie su estado.
                            </span>

                        </div>

                    )}


                    {/* OBSERVACIONES */}

                    <div className="expense-form__field expense-form__field--full">

                        <label htmlFor={`${formId}-notes`}>
                            Observaciones
                        </label>

                        <textarea
                            id={`${formId}-notes`}
                            name="notes"
                            rows="4"
                            value={formData.notes}
                            onChange={handleChange}
                            maxLength={1001}
                            placeholder="Agrega información adicional sobre este gasto..."
                            aria-invalid={Boolean(errors.notes)}
                        />

                        {errors.notes && (
                            <span className="expense-form__error" role="alert">
                                {errors.notes}
                            </span>
                        )}

                    </div>


                    {/* =================================== */}
                    {/* BOLETA O COMPROBANTE (OPCIONAL) */}
                    {/* =================================== */}

                    <div className="expense-form__field expense-form__field--full">
                        <label htmlFor={`${formId}-receipt-image`}>
                            Boleta o comprobante (opcional)
                        </label>

                        <input
                            ref={imageInputRef}
                            id={`${formId}-receipt-image`}
                            className="expense-form__receipt-input"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleReceiptImageChange}
                            disabled={isSaving || isReadingImage}
                            aria-invalid={Boolean(errors.receiptImage)}
                            aria-describedby={`${formId}-receipt-help`}
                        />

                        {receiptImage?.url ? (
                            <div className="expense-form__receipt-preview">
                                <img
                                    src={receiptImage.url}
                                    alt="Vista previa de la boleta o comprobante"
                                />
                                <div className="expense-form__receipt-info">
                                    <strong>Comprobante adjunto</strong>
                                    <span>{receiptImage.fileName || "Imagen del comprobante"}</span>
                                    <div className="expense-form__receipt-actions">
                                        <button
                                            type="button"
                                            onClick={() => imageInputRef.current?.click()}
                                            disabled={isSaving || isReadingImage}
                                        >
                                            <ImagePlus size={16} aria-hidden="true" />
                                            Cambiar
                                        </button>
                                        <button
                                            type="button"
                                            className="expense-form__receipt-remove"
                                            onClick={handleRemoveReceiptImage}
                                            disabled={isSaving || isReadingImage}
                                        >
                                            <Trash2 size={16} aria-hidden="true" />
                                            Quitar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <button
                                type="button"
                                className="expense-form__receipt-select"
                                onClick={() => imageInputRef.current?.click()}
                                disabled={isSaving || isReadingImage}
                            >
                                <ReceiptText size={24} aria-hidden="true" />
                                <span>
                                    <strong>Adjuntar boleta o tomar fotografía</strong>
                                    <small>JPG, PNG o WEBP · Máximo 3 MB</small>
                                </span>
                            </button>
                        )}

                        <small id={`${formId}-receipt-help`} className="expense-form__receipt-help">
                            La imagen será visible solamente en el módulo financiero.
                            Evita incluir datos personales que no sean necesarios.
                        </small>

                        {isReadingImage && <small role="status">Preparando imagen...</small>}
                        {receiptLoading && <small role="status">Cargando boleta privada...</small>}
                        {errors.receiptImage && (
                            <span className="expense-form__error" role="alert">
                                {errors.receiptImage}
                            </span>
                        )}
                    </div>

                    {/* ERROR GENERAL */}

                    {errors.submit && (

                        <div
                            className="expense-form__submit-error"
                            role="alert"
                        >
                            {errors.submit}
                        </div>

                    )}


                    {/* =================================== */}
                    {/* ACCIONES */}
                    {/* =================================== */}

                    <div className="expense-form__actions">

                        <button
                            type="button"
                            className="expense-form__cancel"
                            onClick={onClose}
                            disabled={isSaving}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="expense-form__submit"
                            disabled={isSaving || isReadingImage}
                        >

                            <Save
                                size={16}
                                aria-hidden="true"
                            />

                            {isSaving
                                ? "Guardando..."
                                : isEditing
                                    ? "Guardar cambios"
                                    : "Registrar gasto"}

                        </button>

                    </div>

                </form>

            </section>

        </div>
    );
}

export default ExpenseFormModal;
