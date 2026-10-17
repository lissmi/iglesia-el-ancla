
import { useEffect, useState } from "react";

import {
    PackagePlus,
    Pencil,
    X,
} from "lucide-react";

import {
    belongingsCategories,
    belongingsLocations,
    belongingsConditions,
    belongingsTrackingTypes,
} from "../../../data/belongings/belongingsDemoData";

import "../../../styles/components/administration/belongings/BelongingFormModal.css";

// =========================================================
// FORMULARIO DE REGISTRO Y EDICIÓN DE BIENES
// IGLESIA EL ANCLA
// =========================================================

const initialForm = {
    name: "",
    categoryId: "",
    locationId: "",
    trackingType: "individual",
    quantity: 1,
    condition: "good",
    acquisitionType: "",
    acquisitionDate: "",
    responsible: "",
    description: "",
};

function BelongingFormModal({
    isOpen,
    belonging = null,
    onClose,
    onSave,
}) {

    // =====================================================
    // IDENTIFICAR MODO DEL FORMULARIO
    // =====================================================

    const isEditing = Boolean(belonging);

    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});

    // =====================================================
    // CARGAR DATOS PARA REGISTRO O EDICIÓN
    // =====================================================

    useEffect(() => {

        if (!isOpen) return;

        if (belonging) {

            setForm({
                name: belonging.name || "",
                categoryId: belonging.categoryId || "",
                locationId: belonging.locationId || "",
                trackingType: belonging.trackingType || "individual",
                quantity: belonging.quantity ?? 1,
                condition: belonging.condition || "good",
                acquisitionType: belonging.acquisitionType || "",
                acquisitionDate: belonging.acquisitionDate || "",
                responsible: belonging.responsible || "",
                description: belonging.description || "",
            });

        } else {

            setForm({ ...initialForm });

        }

        setErrors({});

    }, [belonging, isOpen]);

    // =====================================================
    // CERRAR CON ESCAPE Y BLOQUEAR SCROLL
    // =====================================================

    useEffect(() => {

        if (!isOpen) return;

        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = "hidden";

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                onClose?.();
            }
        };

        document.addEventListener("keydown", handleEscape);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleEscape);
        };

    }, [isOpen, onClose]);

    // =====================================================
    // ACTUALIZAR CAMPOS DEL FORMULARIO
    // =====================================================

    const handleChange = (event) => {

        const { name, value } = event.target;

        setForm((previous) => {

            const updated = {
                ...previous,
                [name]: value,
            };

            if (
                name === "trackingType" &&
                value === "individual"
            ) {
                updated.quantity = 1;
            }

            return updated;
        });

        setErrors((previous) => ({
            ...previous,
            [name]: "",
        }));
    };

    // =====================================================
    // VALIDACIONES
    // =====================================================

    const validateForm = () => {

        const newErrors = {};

        if (!form.name.trim()) {
            newErrors.name =
                "Ingresa el nombre del bien.";
        }

        if (!form.categoryId) {
            newErrors.categoryId =
                "Selecciona una categoría.";
        }

        if (!form.locationId) {
            newErrors.locationId =
                "Selecciona una ubicación.";
        }

        const quantity = Number(form.quantity);

        if (
            !Number.isInteger(quantity) ||
            quantity < 1
        ) {
            newErrors.quantity =
                "La cantidad debe ser un número entero mayor que cero.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    // =====================================================
    // GUARDAR REGISTRO O EDICIÓN
    // =====================================================

    const handleSubmit = (event) => {

        event.preventDefault();

        if (!validateForm()) return;

        const payload = {
            ...form,
            name: form.name.trim(),
            responsible: form.responsible.trim(),
            description: form.description.trim(),
            quantity:
                form.trackingType === "individual"
                    ? 1
                    : Number(form.quantity),
        };

        onSave?.(payload);
    };

    if (!isOpen) return null;

    // =====================================================
    // RENDERIZADO
    // =====================================================

    return (
        <div
            className="belonging-form-modal__overlay"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose?.();
                }
            }}
        >

            <div
                className="belonging-form-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="belonging-form-title"
            >

                {/* ===================================== */}
                {/* ENCABEZADO */}
                {/* ===================================== */}

                <div className="belonging-form-modal__header">

                    <div className="belonging-form-modal__heading">

                        <div className="belonging-form-modal__icon">

                            {isEditing
                                ? <Pencil size={21} />
                                : <PackagePlus size={21} />}

                        </div>

                        <div>

                            <h2 id="belonging-form-title">
                                {isEditing
                                    ? "Editar bien"
                                    : "Registrar nuevo bien"}
                            </h2>

                            <p>
                                {isEditing
                                    ? "Actualiza la información del bien seleccionado."
                                    : "Completa los datos para incorporar un bien al inventario."}
                            </p>

                        </div>

                    </div>

                    <button
                        type="button"
                        className="belonging-form-modal__close"
                        onClick={onClose}
                        aria-label="Cerrar formulario"
                    >
                        <X size={21} />
                    </button>

                </div>

                {/* ===================================== */}
                {/* FORMULARIO */}
                {/* ===================================== */}

                <form
                    className="belonging-form-modal__form"
                    onSubmit={handleSubmit}
                    noValidate
                >

                    <div className="belonging-form-modal__body">

                        {/* ================================= */}
                        {/* NOMBRE */}
                        {/* ================================= */}

                        <div className="belonging-form-modal__field">

                            <label htmlFor="belonging-name">
                                Nombre del bien *
                            </label>

                            <input
                                id="belonging-name"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Ej. Mesa plegable"
                                maxLength={120}
                                aria-invalid={Boolean(errors.name)}
                            />

                            {errors.name && (
                                <span className="belonging-form-modal__error">
                                    {errors.name}
                                </span>
                            )}

                        </div>

                        <div className="belonging-form-modal__grid">

                            {/* ================================= */}
                            {/* CATEGORÍA */}
                            {/* ================================= */}

                            <div className="belonging-form-modal__field">

                                <label htmlFor="belonging-category">
                                    Categoría *
                                </label>

                                <select
                                    id="belonging-category"
                                    name="categoryId"
                                    value={form.categoryId}
                                    onChange={handleChange}
                                    aria-invalid={Boolean(errors.categoryId)}
                                >

                                    <option value="">
                                        Seleccionar categoría
                                    </option>

                                    {belongingsCategories.map((item) => (
                                        <option
                                            key={item.id}
                                            value={item.id}
                                        >
                                            {item.name}
                                        </option>
                                    ))}

                                </select>

                                {errors.categoryId && (
                                    <span className="belonging-form-modal__error">
                                        {errors.categoryId}
                                    </span>
                                )}

                            </div>

                            {/* ================================= */}
                            {/* UBICACIÓN */}
                            {/* ================================= */}

                            <div className="belonging-form-modal__field">

                                <label htmlFor="belonging-location">
                                    Ubicación *
                                </label>

                                <select
                                    id="belonging-location"
                                    name="locationId"
                                    value={form.locationId}
                                    onChange={handleChange}
                                    aria-invalid={Boolean(errors.locationId)}
                                >

                                    <option value="">
                                        Seleccionar ubicación
                                    </option>

                                    {belongingsLocations.map((item) => (
                                        <option
                                            key={item.id}
                                            value={item.id}
                                        >
                                            {item.name}
                                        </option>
                                    ))}

                                </select>

                                {errors.locationId && (
                                    <span className="belonging-form-modal__error">
                                        {errors.locationId}
                                    </span>
                                )}

                            </div>

                            {/* ================================= */}
                            {/* TIPO DE CONTROL */}
                            {/* ================================= */}

                            <div className="belonging-form-modal__field">

                                <label htmlFor="belonging-tracking">
                                    Tipo de control *
                                </label>

                                <select
                                    id="belonging-tracking"
                                    name="trackingType"
                                    value={form.trackingType}
                                    onChange={handleChange}
                                >

                                    {belongingsTrackingTypes.map((item) => (
                                        <option
                                            key={item.value}
                                            value={item.value}
                                        >
                                            {item.label}
                                        </option>
                                    ))}

                                </select>

                            </div>

                            {/* ================================= */}
                            {/* CANTIDAD */}
                            {/* ================================= */}

                            <div className="belonging-form-modal__field">

                                <label htmlFor="belonging-quantity">
                                    Cantidad *
                                </label>

                                <input
                                    id="belonging-quantity"
                                    type="number"
                                    name="quantity"
                                    min="1"
                                    step="1"
                                    value={form.quantity}
                                    onChange={handleChange}
                                    disabled={
                                        form.trackingType === "individual"
                                    }
                                    aria-invalid={Boolean(errors.quantity)}
                                />

                                {errors.quantity && (
                                    <span className="belonging-form-modal__error">
                                        {errors.quantity}
                                    </span>
                                )}

                            </div>

                            {/* ================================= */}
                            {/* ESTADO DE CONSERVACIÓN */}
                            {/* ================================= */}

                            <div className="belonging-form-modal__field">

                                <label htmlFor="belonging-condition">
                                    Estado de conservación *
                                </label>

                                <select
                                    id="belonging-condition"
                                    name="condition"
                                    value={form.condition}
                                    onChange={handleChange}
                                >

                                    {belongingsConditions.map((item) => (
                                        <option
                                            key={item.value}
                                            value={item.value}
                                        >
                                            {item.label}
                                        </option>
                                    ))}

                                </select>

                            </div>

                            {/* ================================= */}
                            {/* TIPO DE ADQUISICIÓN */}
                            {/* ================================= */}

                            <div className="belonging-form-modal__field">

                                <label htmlFor="belonging-acquisition">
                                    Tipo de adquisición
                                </label>

                                <select
                                    id="belonging-acquisition"
                                    name="acquisitionType"
                                    value={form.acquisitionType}
                                    onChange={handleChange}
                                >

                                    <option value="">
                                        No especificado
                                    </option>

                                    <option value="purchase">
                                        Compra
                                    </option>

                                    <option value="donation">
                                        Donación
                                    </option>

                                    <option value="other">
                                        Otro
                                    </option>

                                </select>

                            </div>

                            {/* ================================= */}
                            {/* FECHA DE ADQUISICIÓN */}
                            {/* ================================= */}

                            <div className="belonging-form-modal__field">

                                <label htmlFor="belonging-date">
                                    Fecha de adquisición
                                </label>

                                <input
                                    id="belonging-date"
                                    type="date"
                                    name="acquisitionDate"
                                    value={form.acquisitionDate}
                                    onChange={handleChange}
                                />

                            </div>

                            {/* ================================= */}
                            {/* RESPONSABLE */}
                            {/* ================================= */}

                            <div className="belonging-form-modal__field">

                                <label htmlFor="belonging-responsible">
                                    Responsable
                                </label>

                                <input
                                    id="belonging-responsible"
                                    name="responsible"
                                    value={form.responsible}
                                    onChange={handleChange}
                                    placeholder="Ej. Equipo audiovisual"
                                    maxLength={100}
                                />

                            </div>

                        </div>

                        {/* ================================= */}
                        {/* DESCRIPCIÓN */}
                        {/* ================================= */}

                        <div className="belonging-form-modal__field">

                            <label htmlFor="belonging-description">
                                Descripción u observaciones
                            </label>

                            <textarea
                                id="belonging-description"
                                name="description"
                                rows={4}
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Información adicional del bien..."
                                maxLength={1000}
                            />

                        </div>

                    </div>

                    {/* ================================= */}
                    {/* ACCIONES */}
                    {/* ================================= */}

                    <div className="belonging-form-modal__footer">

                        <button
                            type="button"
                            className="belonging-form-modal__cancel"
                            onClick={onClose}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="belonging-form-modal__save"
                        >
                            {isEditing
                                ? "Guardar cambios"
                                : "Registrar bien"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default BelongingFormModal;
