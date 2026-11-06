import {
    ShoppingCart,
    HandHeart,
    Plus,
    CheckCircle2,
} from "lucide-react";

import {
    getBasicSupplyStatus,
    getBasicSupplySuggestedQuantity,
} from "../../../data/basicSupplies/basicSuppliesDemoData";

import "../../../styles/components/administration/basicSupplies/BasicSuppliesNeeds.css";

// =========================================================
// CONFIGURACIÓN DE ESTADOS
// =========================================================

const STATUS_CONFIG = {
    available: "Disponible",
    low: "Stock bajo",
    out: "Agotado",
};

// =========================================================
// COMPONENTE DE NECESIDADES
// =========================================================

function BasicSuppliesNeeds({
    needsSupplies,
    shoppingSelection,
    onToggleShoppingSupply,
    onGenerateShoppingList,
}) {

    return (

        <section className="basic-supplies__panel">

            {/* =========================================== */}
            {/* ENCABEZADO */}
            {/* =========================================== */}

            <div className="basic-supplies__panel-header">

                <div>

                    <h2>
                        Necesidades de reposición
                    </h2>

                    <p>
                        Insumos que requieren colaboración
                        o abastecimiento para la iglesia.
                    </p>

                </div>

                <button
                    type="button"
                    className="basic-supplies__secondary-button"
                    onClick={onGenerateShoppingList}
                >
                    <ShoppingCart size={17} />
                    Preparar compras
                </button>

            </div>

            {/* =========================================== */}
            {/* INSUMOS QUE NECESITAN REPOSICIÓN */}
            {/* =========================================== */}

            {needsSupplies.length > 0 ? (

                <div className="basic-supplies__needs-grid">

                    {needsSupplies.map((supply) => {

                        const status =
                            getBasicSupplyStatus(supply);

                        const quantity =
                            getBasicSupplySuggestedQuantity(supply);

                        const isSelected =
                            shoppingSelection.includes(supply.id);

                        return (

                            <article
                                key={supply.id}
                                className="basic-supplies__need-card"
                            >

                                <div className="basic-supplies__need-top">

                                    <span
                                        className={`basic-supplies__status basic-supplies__status--${status}`}
                                    >
                                        {STATUS_CONFIG[status]}
                                    </span>

                                    <span className="basic-supplies__need-category">
                                        {supply.category}
                                    </span>

                                </div>

                                <h3>{supply.name}</h3>

                                <p>
                                    {supply.notes ||
                                        "Insumo necesario para las actividades de la iglesia."}
                                </p>

                                <div className="basic-supplies__need-quantity">

                                    <span>
                                        Cantidad sugerida
                                    </span>

                                    <strong>
                                        {quantity} unidades
                                    </strong>

                                </div>

                                <button
                                    type="button"
                                    className="basic-supplies__outline-button"
                                    onClick={() =>
                                        onToggleShoppingSupply(supply.id)
                                    }
                                >

                                    {isSelected ? (
                                        <CheckCircle2 size={16} />
                                    ) : (
                                        <Plus size={16} />
                                    )}

                                    {isSelected
                                        ? "En lista de compras"
                                        : "Agregar a compras"}

                                </button>

                            </article>

                        );

                    })}

                </div>

            ) : (

                <div className="basic-supplies__empty">

                    <CheckCircle2 size={30} />

                    <strong>
                        Inventario abastecido
                    </strong>

                    <p>
                        Actualmente no existen insumos
                        agotados ni con stock bajo.
                    </p>

                </div>

            )}

            {/* =========================================== */}
            {/* COLABORACIÓN DE MIEMBROS */}
            {/* =========================================== */}

            <div className="basic-supplies__info-box">

                <HandHeart
                    size={20}
                    aria-hidden="true"
                />

                <div>

                    <strong>
                        Colaboración de miembros
                    </strong>

                    <p>
                        Las necesidades visibles se comparten con los miembros
                        en su espacio personal. Allí pueden ofrecer una cantidad
                        y ustedes podrán confirmar la entrega cuando llegue a la iglesia.
                    </p>

                </div>

            </div>

        </section>

    );
}

export default BasicSuppliesNeeds;
