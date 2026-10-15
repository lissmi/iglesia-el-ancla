
import { useEffect, useId, useState } from "react";

import {
    X,
    Save,
    CalendarDays,
    Info,
} from "lucide-react";

import {
    expenseCategories,
} from "../../../data/admin/expensesData";

import {
    getExpenseLocalDate,
    isValidExpenseAmount,
} from "../../../utils/expenseUtils";

import "../../../styles/components/administration/expenses/ExpenseFormModal.css";


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

        setErrors({});
        setIsSaving(false);

    }, [isOpen, expense]);


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
                value === "Pendiente"
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
            formData.status !== "Pendiente"
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

        if (isSaving) {
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
        };

        setIsSaving(true);

        try {

            // El componente padre se encarga de guardar
            // o actualizar el registro.

            await onSave(payload, expense);

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
                            disabled={isSaving}
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
