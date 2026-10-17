
import { useEffect, useState } from "react";

import {
    ArrowLeftRight,
    ClipboardCheck,
    MapPin,
    Save,
    X,
} from "lucide-react";

import {
    belongingsConditions,
    belongingsLocations,
} from "../../../data/belongings/belongingsDemoData";

import "../../../styles/components/administration/belongings/BelongingMovementModal.css";

// =========================================================
// FORMULARIO DE MOVIMIENTOS
// IGLESIA EL ANCLA
// =========================================================

const initialForm = {
    belongingId: "",
    type: "transfer",
    destinationLocationId: "",
    condition: "",
    description: "",
    performedBy: "",
};

function BelongingMovementModal({
    isOpen,
    belongings = [],
    onClose,
    onSave,
}) {

    const [formData, setFormData] = useState(initialForm);
    const [error, setError] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // =====================================================
    // REINICIAR FORMULARIO
    // =====================================================

    useEffect(() => {

        if (!isOpen) return;

        setFormData({ ...initialForm });
        setError("");
        setIsSaving(false);

    }, [isOpen]);

    // =====================================================
    // CONTROLAR ESCAPE Y SCROLL
    // =====================================================

    useEffect(() => {

        if (!isOpen) return;

        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = "hidden";

        const handleKeyDown = (event) => {
            if (event.key === "Escape" && !isSaving) {
                onClose?.();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleKeyDown);
        };

    }, [isOpen, isSaving, onClose]);

    if (!isOpen) return null;

    // =====================================================
    // BIEN SELECCIONADO
    // =====================================================

    const selectedBelonging = belongings.find(
        (item) => item.id === formData.belongingId
    );

    const currentLocation = belongingsLocations.find(
        (item) => item.id === selectedBelonging?.locationId
    );

    const currentCondition = belongingsConditions.find(
        (item) => item.value === selectedBelonging?.condition
    );

    // =====================================================
    // ACTUALIZAR CAMPOS
    // =====================================================

    const handleChange = (event) => {

        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setError("");
    };

    const handleTypeChange = (type) => {

        setFormData((previous) => ({
            ...previous,
            type,
            destinationLocationId: "",
            condition: "",
        }));

        setError("");
    };

    // =====================================================
    // GUARDAR MOVIMIENTO
    // =====================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        if (isSaving) return;

        if (!selectedBelonging) {
            setError("Debes seleccionar un bien.");
            return;
        }

        if (
            formData.type === "transfer" &&
            !formData.destinationLocationId
        ) {
            setError("Selecciona una ubicación de destino.");
            return;
        }

        if (
            formData.type === "transfer" &&
            formData.destinationLocationId ===
                selectedBelonging.locationId
        ) {
            setError(
                "La ubicación de destino debe ser diferente de la actual."
            );
            return;
        }

        if (
            formData.type === "inspection" &&
            !formData.condition
        ) {
            setError("Selecciona el estado del bien.");
            return;
        }

        if (!formData.description.trim()) {
            setError("Debes ingresar una observación.");
            return;
        }

        if (!formData.performedBy.trim()) {
            setError("Debes indicar quién realizó el movimiento.");
            return;
        }

        setIsSaving(true);

        try {

            await onSave({
                ...formData,
                description: formData.description.trim(),
                performedBy: formData.performedBy.trim(),
            });

            onClose?.();

        } catch (saveError) {

            setError(
                saveError.message ||
                "No fue posible registrar el movimiento."
            );

        } finally {
            setIsSaving(false);
        }
    };

    // =====================================================
    // RENDERIZADO
    // =====================================================

    return (
        <div
            className="belonging-movement-modal__overlay"
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
                className="belonging-movement-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="movement-modal-title"
            >

                {/* ===================================== */}
                {/* ENCABEZADO */}
                {/* ===================================== */}

                <header className="belonging-movement-modal__header">

                    <div className="belonging-movement-modal__heading">

                        <span className="belonging-movement-modal__icon">
                            <ArrowLeftRight size={23} />
                        </span>

                        <div>
                            <h2 id="movement-modal-title">
                                Registrar movimiento
                            </h2>

                            <p>
                                Actualiza la información de un bien
                                y registra la operación.
                            </p>
                        </div>

                    </div>

                    <button
                        type="button"
                        className="belonging-movement-modal__close"
                        onClick={onClose}
                        disabled={isSaving}
                        aria-label="Cerrar formulario"
                    >
                        <X size={20} />
                    </button>

                </header>

                {/* ===================================== */}
                {/* FORMULARIO */}
                {/* ===================================== */}

                <form
                    className="belonging-movement-modal__form"
                    onSubmit={handleSubmit}
                >

                    <div className="belonging-movement-modal__body">

                        {/* SELECCIÓN DEL BIEN */}

                        <div className="belonging-movement-modal__field">

                            <label htmlFor="movement-belonging">
                                Bien del inventario
                                <span> *</span>
                            </label>

                            <select
                                id="movement-belonging"
                                name="belongingId"
                                value={formData.belongingId}
                                onChange={handleChange}
                                required
                                disabled={isSaving}
                            >
                                <option value="">
                                    Seleccionar bien...
                                </option>

                                {belongings.map((belonging) => (
                                    <option
                                        key={belonging.id}
                                        value={belonging.id}
                                    >
                                        {belonging.code} - {belonging.name}
                                    </option>
                                ))}

                            </select>

                        </div>

                        {/* INFORMACIÓN ACTUAL */}

                        {selectedBelonging && (

                            <div className="belonging-movement-modal__current">

                                <div>
                                    <span>Ubicación actual</span>
                                    <strong>
                                        {currentLocation?.name ||
                                            "Sin ubicación"}
                                    </strong>
                                </div>

                                <div>
                                    <span>Estado actual</span>
                                    <strong>
                                        {currentCondition?.label ||
                                            "Sin estado"}
                                    </strong>
                                </div>

                                <div>
                                    <span>Unidades registradas</span>
                                    <strong>
                                        {selectedBelonging.quantity}
                                    </strong>
                                </div>

                            </div>

                        )}

                        {/* TIPO DE MOVIMIENTO */}

                        <div className="belonging-movement-modal__field">

                            <label>Tipo de movimiento *</label>

                            <div className="belonging-movement-modal__types">

                                <button
                                    type="button"
                                    className={
                                        formData.type === "transfer"
                                            ? "belonging-movement-modal__type belonging-movement-modal__type--active"
                                            : "belonging-movement-modal__type"
                                    }
                                    onClick={() =>
                                        handleTypeChange("transfer")
                                    }
                                    disabled={isSaving}
                                    aria-pressed={formData.type === "transfer"}
                                >
                                    <MapPin size={20} />
                                    <strong>Traslado</strong>
                                    <span>Cambiar ubicación</span>
                                </button>

                                <button
                                    type="button"
                                    className={
                                        formData.type === "inspection"
                                            ? "belonging-movement-modal__type belonging-movement-modal__type--active"
                                            : "belonging-movement-modal__type"
                                    }
                                    onClick={() =>
                                        handleTypeChange("inspection")
                                    }
                                    disabled={isSaving}
                                    aria-pressed={formData.type === "inspection"}
                                >
                                    <ClipboardCheck size={20} />
                                    <strong>Inspección</strong>
                                    <span>Revisar estado</span>
                                </button>

                            </div>

                        </div>

                        {/* DESTINO DEL TRASLADO */}

                        {formData.type === "transfer" && (

                            <div className="belonging-movement-modal__field">

                                <label htmlFor="movement-destination">
                                    Ubicación de destino
                                    <span> *</span>
                                </label>

                                <select
                                    id="movement-destination"
                                    name="destinationLocationId"
                                    value={formData.destinationLocationId}
                                    onChange={handleChange}
                                    required
                                    disabled={isSaving}
                                >
                                    <option value="">
                                        Seleccionar destino...
                                    </option>

                                    {belongingsLocations
                                        .filter(
                                            (location) =>
                                                location.id !==
                                                selectedBelonging?.locationId
                                        )
                                        .map((location) => (
                                            <option
                                                key={location.id}
                                                value={location.id}
                                            >
                                                {location.name}
                                            </option>
                                        ))}

                                </select>

                            </div>

                        )}

                        {/* ESTADO DE INSPECCIÓN */}

                        {formData.type === "inspection" && (

                            <div className="belonging-movement-modal__field">

                                <label htmlFor="movement-condition">
                                    Estado observado
                                    <span> *</span>
                                </label>

                                <select
                                    id="movement-condition"
                                    name="condition"
                                    value={formData.condition}
                                    onChange={handleChange}
                                    required
                                    disabled={isSaving}
                                >
                                    <option value="">
                                        Seleccionar estado...
                                    </option>

                                    {belongingsConditions.map(
                                        (condition) => (
                                            <option
                                                key={condition.value}
                                                value={condition.value}
                                            >
                                                {condition.label}
                                            </option>
                                        )
                                    )}

                                </select>

                            </div>

                        )}

                        {/* OBSERVACIONES */}

                        <div className="belonging-movement-modal__field">

                            <label htmlFor="movement-description">
                                Observaciones
                                <span> *</span>
                            </label>

                            <textarea
                                id="movement-description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe el motivo y los detalles del movimiento..."
                                rows={4}
                                required
                                disabled={isSaving}
                            />

                        </div>

                        {/* RESPONSABLE */}

                        <div className="belonging-movement-modal__field">

                            <label htmlFor="movement-performed-by">
                                Realizado por
                                <span> *</span>
                            </label>

                            <input
                                id="movement-performed-by"
                                name="performedBy"
                                type="text"
                                value={formData.performedBy}
                                onChange={handleChange}
                                placeholder="Nombre del responsable"
                                required
                                disabled={isSaving}
                            />

                        </div>

                        {/* MENSAJE DE ERROR */}

                        {error && (
                            <div
                                className="belonging-movement-modal__error"
                                role="alert"
                            >
                                {error}
                            </div>
                        )}

                    </div>

                    {/* ================================= */}
                    {/* ACCIONES */}
                    {/* ================================= */}

                    <footer className="belonging-movement-modal__footer">

                        <button
                            type="button"
                            className="belonging-movement-modal__cancel"
                            onClick={onClose}
                            disabled={isSaving}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="belonging-movement-modal__submit"
                            disabled={isSaving}
                        >
                            <Save size={17} />

                            {isSaving
                                ? "Registrando..."
                                : "Registrar movimiento"}
                        </button>

                    </footer>

                </form>

            </section>

        </div>
    );
}

export default BelongingMovementModal;
