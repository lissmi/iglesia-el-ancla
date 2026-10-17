
import { useEffect, useRef } from "react";

import {
    X,
    Save,
    ArrowUpRight,
    ArrowDownRight,
    Package,
    AlertTriangle,
} from "lucide-react";

import "../../../../styles/components/administration/basicSupplies/modals/BasicSupplyMovementModal.css";

// =========================================================
// MODAL DE MOVIMIENTOS DE INVENTARIO
// =========================================================

function BasicSupplyMovementModal({
    supply,
    movementType,
    movementQuantity,
    setMovementQuantity,
    currentStock,
    onSubmit,
    onClose,
}) {

    const quantityInputRef = useRef(null);

    const isIncome = movementType === "income";

    // =====================================================
    // ENFOQUE AUTOMÁTICO
    // =====================================================

    useEffect(() => {

        if (supply) {
            quantityInputRef.current?.focus();
        }

    }, [supply]);

    // =====================================================
    // CERRAR CON ESCAPE
    // =====================================================

    useEffect(() => {

        if (!supply) {
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

    }, [supply, onClose]);

    // =====================================================
    // VALIDACIÓN DE CANTIDAD
    // =====================================================

    const quantity = Number(movementQuantity);

    const isValidQuantity =
        movementQuantity !== "" &&
        Number.isInteger(quantity) &&
        quantity > 0 &&
        (
            isIncome ||
            quantity <= currentStock
        );

    // =====================================================
    // MODAL CERRADO
    // =====================================================

    if (!supply) {
        return null;
    }

    return (

        <div
            className="basic-supply-movement__overlay"
            onMouseDown={(event) => {

                if (event.target === event.currentTarget) {
                    onClose();
                }

            }}
        >

            <div
                className="basic-supply-movement"
                role="dialog"
                aria-modal="true"
                aria-labelledby="basic-supply-movement-title"
            >

                {/* ======================================= */}
                {/* ENCABEZADO */}
                {/* ======================================= */}

                <div className="basic-supply-movement__header">

                    <div
                        className={
                            isIncome
                                ? "basic-supply-movement__icon basic-supply-movement__icon--income"
                                : "basic-supply-movement__icon basic-supply-movement__icon--expense"
                        }
                    >

                        {isIncome ? (
                            <ArrowUpRight size={25} />
                        ) : (
                            <ArrowDownRight size={25} />
                        )}

                    </div>

                    <div className="basic-supply-movement__heading">

                        <h2 id="basic-supply-movement-title">

                            {isIncome
                                ? "Registrar entrada"
                                : "Registrar consumo"}

                        </h2>

                        <p>
                            {supply.name}
                        </p>

                    </div>

                    <button
                        type="button"
                        className="basic-supply-movement__close"
                        onClick={onClose}
                        aria-label="Cerrar movimiento"
                    >
                        <X size={20} />
                    </button>

                </div>

                {/* ======================================= */}
                {/* INFORMACIÓN DEL STOCK */}
                {/* ======================================= */}

                <div className="basic-supply-movement__stock">

                    <div className="basic-supply-movement__stock-icon">
                        <Package size={20} />
                    </div>

                    <div>

                        <span>
                            Existencias actuales
                        </span>

                        <strong>
                            {currentStock} {supply.unit}
                        </strong>

                    </div>

                </div>

                {/* ======================================= */}
                {/* FORMULARIO */}
                {/* ======================================= */}

                <form onSubmit={onSubmit}>

                    <label className="basic-supply-movement__field">

                        <span>
                            Cantidad ({supply.unit})
                        </span>

                        <input
                            ref={quantityInputRef}
                            type="number"
                            min="1"
                            max={
                                isIncome
                                    ? undefined
                                    : currentStock
                            }
                            step="1"
                            required
                            value={movementQuantity}
                            onChange={(event) =>
                                setMovementQuantity(event.target.value)
                            }
                        />

                    </label>

                    {/* =================================== */}
                    {/* ADVERTENCIA DE STOCK INSUFICIENTE */}
                    {/* =================================== */}

                    {!isIncome &&
                        quantity > currentStock && (

                        <div className="basic-supply-movement__warning">

                            <AlertTriangle size={17} />

                            <span>
                                No puedes registrar un
                                consumo mayor que las
                                existencias disponibles.
                            </span>

                        </div>

                    )}

                    {/* =================================== */}
                    {/* RESULTADO DEL MOVIMIENTO */}
                    {/* =================================== */}

                    {isValidQuantity && (

                        <div className="basic-supply-movement__result">

                            <span>
                                Stock después del movimiento
                            </span>

                            <strong>
                                {isIncome
                                    ? currentStock + quantity
                                    : currentStock - quantity}
                                {" "}
                                {supply.unit}
                            </strong>

                        </div>

                    )}

                    {/* =================================== */}
                    {/* BOTONES */}
                    {/* =================================== */}

                    <div className="basic-supply-movement__footer">

                        <button
                            type="button"
                            className="basic-supply-movement__cancel"
                            onClick={onClose}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="basic-supply-movement__submit"
                            disabled={!isValidQuantity}
                        >
                            <Save size={17} />

                            Registrar
                        </button>

                    </div>

                </form>

            </div>

        </div>

    );
}

export default BasicSupplyMovementModal;
