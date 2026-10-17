
import { useEffect, useRef } from "react";

import {
    X,
    Save,
    PackagePlus,
} from "lucide-react";

import {
    basicSupplyCategories,
} from "../../../../data/basicSupplies/basicSuppliesDemoData";

import "../../../../styles/components/administration/basicSupplies/modals/BasicSupplyFormModal.css";

// =========================================================
// MODAL PARA REGISTRAR UN NUEVO INSUMO
// =========================================================

function BasicSupplyFormModal({
    isOpen,
    supplyForm,
    setSupplyForm,
    onSubmit,
    onClose,
}) {

    // Referencia al primer campo del formulario.
    const firstInputRef = useRef(null);

    // =====================================================
    // ENFOQUE INICIAL
    // =====================================================

    useEffect(() => {

        if (isOpen) {
            firstInputRef.current?.focus();
        }

    }, [isOpen]);

    // =====================================================
    // CERRAR CON ESCAPE
    // =====================================================

    useEffect(() => {

        if (!isOpen) {
            return;
        }

        const handleKeyDown = (event) => {

            if (event.key === "Escape") {
                onClose();
            }

        };

        window.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {

            window.removeEventListener(
                "keydown",
                handleKeyDown
            );

        };

    }, [isOpen, onClose]);

    // =====================================================
    // ACTUALIZAR CAMPOS
    // =====================================================

    const updateField = (field, value) => {

        setSupplyForm((previous) => ({
            ...previous,
            [field]: value,
        }));

    };

    // =====================================================
    // NO MOSTRAR SI ESTÁ CERRADO
    // =====================================================

    if (!isOpen) {
        return null;
    }

    return (

        <div
            className="basic-supply-form__overlay"
            onMouseDown={(event) => {

                if (event.target === event.currentTarget) {
                    onClose();
                }

            }}
        >

            <div
                className="basic-supply-form"
                role="dialog"
                aria-modal="true"
                aria-labelledby="basic-supply-form-title"
            >

                {/* ======================================= */}
                {/* ENCABEZADO */}
                {/* ======================================= */}

                <div className="basic-supply-form__header">

                    <div className="basic-supply-form__heading">

                        <div className="basic-supply-form__icon">

                            <PackagePlus size={24} />

                        </div>

                        <div>

                            <h2 id="basic-supply-form-title">
                                Nuevo insumo
                            </h2>

                            <p>
                                Registra un producto en
                                el inventario de la iglesia.
                            </p>

                        </div>

                    </div>

                    <button
                        type="button"
                        className="basic-supply-form__close"
                        onClick={onClose}
                        aria-label="Cerrar formulario"
                    >
                        <X size={20} />
                    </button>

                </div>

                {/* ======================================= */}
                {/* FORMULARIO */}
                {/* ======================================= */}

                <form onSubmit={onSubmit}>

                    <div className="basic-supply-form__grid">

                        {/* NOMBRE */}

                        <label className="basic-supply-form__field basic-supply-form__field--full">

                            <span>
                                Nombre del insumo
                            </span>

                            <input
                                ref={firstInputRef}
                                type="text"
                                required
                                maxLength={120}
                                placeholder="Ej. Papel higiénico"
                                value={supplyForm.name}
                                onChange={(event) =>
                                    updateField(
                                        "name",
                                        event.target.value
                                    )
                                }
                            />

                        </label>

                        {/* CATEGORÍA */}

                        <label className="basic-supply-form__field">

                            <span>Categoría</span>

                            <select
                                value={supplyForm.category}
                                onChange={(event) =>
                                    updateField(
                                        "category",
                                        event.target.value
                                    )
                                }
                            >

                                {basicSupplyCategories.map(
                                    (category) => (

                                        <option
                                            key={category}
                                            value={category}
                                        >
                                            {category}
                                        </option>

                                    )
                                )}

                            </select>

                        </label>

                        {/* UNIDAD */}

                        <label className="basic-supply-form__field">

                            <span>Unidad de medida</span>

                            <input
                                type="text"
                                required
                                maxLength={40}
                                placeholder="Ej. paquetes"
                                value={supplyForm.unit}
                                onChange={(event) =>
                                    updateField(
                                        "unit",
                                        event.target.value
                                    )
                                }
                            />

                        </label>

                        {/* STOCK INICIAL */}

                        <label className="basic-supply-form__field">

                            <span>Stock inicial</span>

                            <input
                                type="number"
                                min="0"
                                step="1"
                                required
                                value={supplyForm.stock}
                                onChange={(event) =>
                                    updateField(
                                        "stock",
                                        event.target.value
                                    )
                                }
                            />

                        </label>

                        {/* STOCK MÍNIMO */}

                        <label className="basic-supply-form__field">

                            <span>Stock mínimo</span>

                            <input
                                type="number"
                                min="0"
                                step="1"
                                required
                                value={supplyForm.minimumStock}
                                onChange={(event) =>
                                    updateField(
                                        "minimumStock",
                                        event.target.value
                                    )
                                }
                            />

                        </label>

                        {/* STOCK OBJETIVO */}

                        <label className="basic-supply-form__field">

                            <span>Stock objetivo</span>

                            <input
                                type="number"
                                min={supplyForm.minimumStock || "0"}
                                step="1"
                                required
                                value={supplyForm.targetStock}
                                onChange={(event) =>
                                    updateField(
                                        "targetStock",
                                        event.target.value
                                    )
                                }
                            />

                        </label>

                        {/* UBICACIÓN */}

                        <label className="basic-supply-form__field">

                            <span>Ubicación</span>

                            <input
                                type="text"
                                maxLength={100}
                                placeholder="Ej. Cocina"
                                value={supplyForm.location}
                                onChange={(event) =>
                                    updateField(
                                        "location",
                                        event.target.value
                                    )
                                }
                            />

                        </label>

                        {/* OBSERVACIONES */}

                        <label className="basic-supply-form__field basic-supply-form__field--full">

                            <span>Observaciones</span>

                            <textarea
                                rows="3"
                                maxLength={500}
                                placeholder="Información adicional..."
                                value={supplyForm.notes}
                                onChange={(event) =>
                                    updateField(
                                        "notes",
                                        event.target.value
                                    )
                                }
                            />

                        </label>

                    </div>

                    {/* =================================== */}
                    {/* USO FRECUENTE */}
                    {/* =================================== */}

                    <label className="basic-supply-form__checkbox">

                        <input
                            type="checkbox"
                            checked={supplyForm.frequent}
                            onChange={(event) =>
                                updateField(
                                    "frequent",
                                    event.target.checked
                                )
                            }
                        />

                        <span>
                            Insumo de uso frecuente
                        </span>

                    </label>

                    {/* =================================== */}
                    {/* BOTONES */}
                    {/* =================================== */}

                    <div className="basic-supply-form__footer">

                        <button
                            type="button"
                            className="basic-supply-form__cancel"
                            onClick={onClose}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="basic-supply-form__submit"
                        >
                            <Save size={17} />

                            Guardar insumo
                        </button>

                    </div>

                </form>

            </div>

        </div>

    );
}

export default BasicSupplyFormModal;
