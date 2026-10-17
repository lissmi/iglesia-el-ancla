
import {
    ShoppingCart,
    ClipboardList,
    Trash2,
} from "lucide-react";

import {
    getBasicSupplySuggestedQuantity,
} from "../../../data/basicSupplies/basicSuppliesDemoData";

import "../../../styles/components/administration/basicSupplies/BasicSuppliesShopping.css";

// =========================================================
// COMPONENTE LISTA DE COMPRAS
// =========================================================

function BasicSuppliesShopping({
    shoppingSupplies,
    onGenerateShoppingList,
    onToggleShoppingSupply,
    onCopyShoppingList,
}) {

    return (

        <section className="basic-supplies__panel">

            {/* =========================================== */}
            {/* ENCABEZADO */}
            {/* =========================================== */}

            <div className="basic-supplies__panel-header">

                <div>

                    <h2>
                        Lista de compras
                    </h2>

                    <p>
                        Organiza los insumos que
                        necesitan ser adquiridos.
                    </p>

                </div>

                <button
                    type="button"
                    className="basic-supplies__secondary-button"
                    onClick={onGenerateShoppingList}
                >
                    <ClipboardList size={17} />

                    Generar desde faltantes
                </button>

            </div>

            {/* =========================================== */}
            {/* PRODUCTOS SELECCIONADOS */}
            {/* =========================================== */}

            {shoppingSupplies.length > 0 ? (

                <>
                    <div className="basic-supplies__shopping-list">

                        {shoppingSupplies.map((supply) => {

                            const quantity =
                                getBasicSupplySuggestedQuantity(supply);

                            return (

                                <div
                                    key={supply.id}
                                    className="basic-supplies__shopping-item"
                                >

                                    <div>

                                        <strong>
                                            {supply.name}
                                        </strong>

                                        <span>
                                            {quantity} {supply.unit}
                                        </span>

                                    </div>

                                    <button
                                        type="button"
                                        title="Quitar de la lista"
                                        aria-label={`Quitar ${supply.name} de la lista`}
                                        onClick={() =>
                                            onToggleShoppingSupply(supply.id)
                                        }
                                    >
                                        <Trash2 size={17} />
                                    </button>

                                </div>

                            );

                        })}

                    </div>

                    {/* =================================== */}
                    {/* ACCIONES DE LA LISTA */}
                    {/* =================================== */}

                    <div className="basic-supplies__shopping-footer">

                        <span>
                            {shoppingSupplies.length}
                            {" "}
                            productos seleccionados
                        </span>

                        <button
                            type="button"
                            className="basic-supplies__primary-button"
                            onClick={onCopyShoppingList}
                        >
                            <ClipboardList size={17} />

                            Copiar lista
                        </button>

                    </div>

                </>

            ) : (

                <div className="basic-supplies__empty">

                    <ShoppingCart size={30} />

                    <strong>
                        Tu lista está vacía
                    </strong>

                    <p>
                        Agrega insumos desde Necesidades
                        o genera una lista automáticamente.
                    </p>

                </div>

            )}

        </section>

    );
}

export default BasicSuppliesShopping;
