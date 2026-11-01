import { useMemo, useState } from "react";

import {
    Package,
    HandHeart,
    ShoppingCart,
    TrendingUp,
    Info,
} from "lucide-react";

import {
    initialBasicSupplies,
    getBasicSupplyStatus,
    getBasicSupplySuggestedQuantity,
} from "../../data/basicSupplies/basicSuppliesDemoData";

import "../../styles/pages/administration/BasicSupplies.css";

// =========================================================
// COMPONENTES DE INSUMOS BÁSICOS
// =========================================================

import BasicSuppliesHeader from "../../components/administration/basicSupplies/BasicSuppliesHeader";

import BasicSuppliesSummary from "../../components/administration/basicSupplies/BasicSuppliesSummary";

import BasicSuppliesInventory from "../../components/administration/basicSupplies/BasicSuppliesInventory";

import BasicSuppliesNeeds from "../../components/administration/basicSupplies/BasicSuppliesNeeds";

import BasicSuppliesShopping from "../../components/administration/basicSupplies/BasicSuppliesShopping";

import BasicSuppliesForecast from "../../components/administration/basicSupplies/BasicSuppliesForecast";

import BasicSupplyFormModal from "../../components/administration/basicSupplies/modals/BasicSupplyFormModal";

import BasicSupplyMovementModal from "../../components/administration/basicSupplies/modals/BasicSupplyMovementModal";



// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function BasicSupplies() {

    // =====================================================
    // ESTADOS DEL INVENTARIO
    // =====================================================

    const [supplies, setSupplies] =
        useState(initialBasicSupplies);

    const [search, setSearch] = useState("");

    const [categoryFilter, setCategoryFilter] =
        useState("all");

    const [statusFilter, setStatusFilter] =
        useState("all");

    const [activeTab, setActiveTab] =
        useState("inventory");

    // =====================================================
    // MODAL PARA AGREGAR INSUMOS
    // =====================================================

    const [showSupplyModal, setShowSupplyModal] =
        useState(false);

    const [supplyForm, setSupplyForm] =
        useState({
            name: "",
            category: "Alimentos",
            unit: "unidades",
            stock: "0",
            minimumStock: "2",
            targetStock: "5",
            location: "",
            notes: "",
            frequent: true,
        });

    // =====================================================
    // MOVIMIENTOS DE INVENTARIO
    // =====================================================

    const [movementSupply, setMovementSupply] =
        useState(null);

    const [movementType, setMovementType] =
        useState("income");

    const [movementQuantity, setMovementQuantity] =
        useState("1");

    const [movementHistory, setMovementHistory] =
        useState([]);

    // =====================================================
    // LISTA DE COMPRAS
    // =====================================================

    const [shoppingSelection, setShoppingSelection] =
        useState([]);

    // =====================================================
    // INDICADORES CALCULADOS
    // =====================================================

    const summary = useMemo(() => {

        const low = supplies.filter(
            (supply) =>
                getBasicSupplyStatus(supply) === "low"
        ).length;

        const out = supplies.filter(
            (supply) =>
                getBasicSupplyStatus(supply) === "out"
        ).length;

        const frequent = supplies.filter(
            (supply) => supply.frequent
        ).length;

        return {
            total: supplies.length,
            low,
            out,
            frequent,
            needsAttention: low + out,
        };

    }, [supplies]);

    // =====================================================
    // FILTRADO DE INVENTARIO
    // =====================================================

    const filteredSupplies = useMemo(() => {

        return supplies.filter((supply) => {

            const matchesSearch =
                supply.name
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                supply.id
                    .toLowerCase()
                    .includes(search.toLowerCase());

            const matchesCategory =
                categoryFilter === "all" ||
                supply.category === categoryFilter;

            const matchesStatus =
                statusFilter === "all" ||
                getBasicSupplyStatus(supply) === statusFilter;

            return (
                matchesSearch &&
                matchesCategory &&
                matchesStatus
            );

        });

    }, [
        supplies,
        search,
        categoryFilter,
        statusFilter,
    ]);

    // =====================================================
    // INSUMOS QUE NECESITAN REPOSICIÓN
    // =====================================================

    const needsSupplies = useMemo(() => {

        return supplies.filter(
            (supply) =>
                getBasicSupplyStatus(supply) !== "available"
        );

    }, [supplies]);

    // =====================================================
    // INSUMOS SELECCIONADOS PARA COMPRAS
    // =====================================================

    const shoppingSupplies = supplies.filter(
        (supply) =>
            shoppingSelection.includes(supply.id)
    );

    // =====================================================
    // AGREGAR UN NUEVO INSUMO
    // =====================================================

    const handleAddSupply = (event) => {

        event.preventDefault();

        const name = supplyForm.name.trim();

        if (!name) {
            return;
        }

        const stock = Number(supplyForm.stock);
        const minimumStock =
            Number(supplyForm.minimumStock);
        const targetStock =
            Number(supplyForm.targetStock);

        if (
            !Number.isInteger(stock) ||
            !Number.isInteger(minimumStock) ||
            !Number.isInteger(targetStock) ||
            stock < 0 ||
            minimumStock < 0 ||
            targetStock < minimumStock
        ) {
            return;
        }

        const newSupply = {
            id: `INS-${Date.now()}`,
            name,
            category: supplyForm.category,
            unit: supplyForm.unit.trim() || "unidades",
            stock,
            minimumStock,
            targetStock,
            location: supplyForm.location.trim(),
            notes: supplyForm.notes.trim(),
            frequent: supplyForm.frequent,
        };

        setSupplies((previous) => [
            ...previous,
            newSupply,
        ]);

        setShowSupplyModal(false);

        setSupplyForm({
            name: "",
            category: "Alimentos",
            unit: "unidades",
            stock: "0",
            minimumStock: "2",
            targetStock: "5",
            location: "",
            notes: "",
            frequent: true,
        });

    };

    // =====================================================
    // REGISTRAR ENTRADA O CONSUMO
    // =====================================================

    const handleMovement = (event) => {

        event.preventDefault();

        if (!movementSupply) {
            return;
        }

        const quantity = Number(movementQuantity);

        if (
            !Number.isInteger(quantity) ||
            quantity <= 0
        ) {
            return;
        }

        const currentSupply = supplies.find(
            (supply) =>
                supply.id === movementSupply.id
        );

        if (!currentSupply) {
            return;
        }

        if (
            movementType === "expense" &&
            quantity > currentSupply.stock
        ) {
            return;
        }

        setSupplies((previous) =>
            previous.map((supply) => {

                if (supply.id !== movementSupply.id) {
                    return supply;
                }

                return {
                    ...supply,
                    stock:
                        movementType === "income"
                            ? supply.stock + quantity
                            : supply.stock - quantity,
                };

            })
        );

        setMovementHistory((previous) => [
            {
                id: `MOV-${Date.now()}`,
                supplyId: movementSupply.id,
                supplyName: movementSupply.name,
                type: movementType,
                quantity,
                unit: movementSupply.unit,
                date: new Date(),
            },
            ...previous,
        ]);

        setMovementSupply(null);
        setMovementQuantity("1");

    };

    // =====================================================
    // ABRIR MODAL DE MOVIMIENTO
    // =====================================================

    const openMovement = (supply, type) => {

        setMovementSupply(supply);
        setMovementType(type);
        setMovementQuantity("1");

    };

    // =====================================================
    // SELECCIONAR INSUMOS PARA COMPRAS
    // =====================================================

    const toggleShoppingSupply = (supplyId) => {

        setShoppingSelection((previous) => {

            if (previous.includes(supplyId)) {
                return previous.filter(
                    (id) => id !== supplyId
                );
            }

            return [...previous, supplyId];

        });

    };

    // =====================================================
    // GENERAR LISTA DE COMPRAS
    // =====================================================

    const generateShoppingList = () => {

        setShoppingSelection(
            needsSupplies.map((supply) => supply.id)
        );

        setActiveTab("shopping");

    };

    // =====================================================
    // TEXTO PARA COPIAR LISTA DE COMPRAS
    // =====================================================

    const shoppingListText = shoppingSupplies.map(
        (supply) => {

            const quantity =
                getBasicSupplySuggestedQuantity(supply);

            return `• ${supply.name}: ${quantity} ${supply.unit}`;

        }
    ).join("\n");

    // =====================================================
    // COPIAR LISTA DE COMPRAS
    // =====================================================

    const handleCopyShoppingList = async () => {

        const text =
            `Lista de compras - Iglesia El Ancla\n\n${shoppingListText}`;

        if (!navigator.clipboard?.writeText) {
            window.alert(
                "El navegador no permite copiar automáticamente."
            );
            return;
        }

        try {

            await navigator.clipboard.writeText(text);

            window.alert(
                "Lista copiada al portapapeles."
            );

        } catch (error) {

            window.alert(
                "No se pudo copiar la lista."
            );

        }

    };

    // =====================================================
    // INTERFAZ PRINCIPAL
    // =====================================================

    return (

        <main className="basic-supplies">

            <div className="basic-supplies__container">

                {/* ======================================= */}
                {/* ENCABEZADO */}
                {/* ======================================= */}

                <BasicSuppliesHeader
                    onAddSupply={() => setShowSupplyModal(true)}
                />

                {/* ======================================= */}
                {/* AVISO DE DEMOSTRACIÓN */}
                {/* ======================================= */}

                <div className="basic-supplies__demo">

                    <Info size={17} />

                    <span>
                        Módulo en desarrollo.
                        Los insumos y movimientos
                        son datos de demostración y
                        no se guardan permanentemente.
                    </span>

                </div>

                {/* ======================================= */}
                {/* RESUMEN DEL INVENTARIO */}
                {/* ======================================= */}

                <BasicSuppliesSummary
                    summary={summary}
                />

                {/* ======================================= */}
                {/* NAVEGACIÓN INTERNA */}
                {/* ======================================= */}

                <nav
                    className="basic-supplies__tabs"
                    aria-label="Secciones de insumos básicos"
                >

                    {[
                        {
                            id: "inventory",
                            label: "Inventario",
                            icon: Package,
                        },
                        {
                            id: "needs",
                            label: "Necesidades",
                            icon: HandHeart,
                        },
                        {
                            id: "shopping",
                            label: "Lista de compras",
                            icon: ShoppingCart,
                        },
                        {
                            id: "forecast",
                            label: "Predicciones",
                            icon: TrendingUp,
                        },
                    ].map((tab) => {

                        const Icon = tab.icon;

                        return (

                            <button
                                key={tab.id}
                                type="button"
                                className={
                                    activeTab === tab.id
                                        ? "basic-supplies__tab basic-supplies__tab--active"
                                        : "basic-supplies__tab"
                                }
                                onClick={() =>
                                    setActiveTab(tab.id)
                                }
                            >

                                <Icon size={17} />
                                {tab.label}

                            </button>

                        );

                    })}

                </nav>


                {/* ======================================= */}
                {/* INVENTARIO DE INSUMOS */}
                {/* ======================================= */}

                {activeTab === "inventory" && (

                    <BasicSuppliesInventory
                        filteredSupplies={filteredSupplies}

                        search={search}
                        setSearch={setSearch}

                        categoryFilter={categoryFilter}
                        setCategoryFilter={setCategoryFilter}

                        statusFilter={statusFilter}
                        setStatusFilter={setStatusFilter}

                        onOpenMovement={openMovement}
                    />

                )}

                {/* ======================================= */}
                {/* NECESIDADES DE REPOSICIÓN */}
                {/* ======================================= */}

                {activeTab === "needs" && (

                    <BasicSuppliesNeeds
                        needsSupplies={needsSupplies}
                        shoppingSelection={shoppingSelection}
                        onToggleShoppingSupply={toggleShoppingSupply}
                        onGenerateShoppingList={generateShoppingList}
                    />

                )}

                {/* ======================================= */}
                {/* LISTA DE COMPRAS */}
                {/* ======================================= */}

                {activeTab === "shopping" && (

                    <BasicSuppliesShopping
                        shoppingSupplies={shoppingSupplies}
                        onGenerateShoppingList={generateShoppingList}
                        onToggleShoppingSupply={toggleShoppingSupply}
                        onCopyShoppingList={handleCopyShoppingList}
                    />

                )}

                {/* ======================================= */}
                {/* PREDICCIONES DE ABASTECIMIENTO */}
                {/* ======================================= */}

                {activeTab === "forecast" && (

                    <BasicSuppliesForecast
                        movementHistory={movementHistory}
                    />

                )}

            </div>

            {/* =========================================== */}
            {/* MODAL PARA REGISTRAR INSUMOS */}
            {/* =========================================== */}

            <BasicSupplyFormModal
                isOpen={showSupplyModal}
                supplyForm={supplyForm}
                setSupplyForm={setSupplyForm}
                onSubmit={handleAddSupply}
                onClose={() => setShowSupplyModal(false)}
            />

            {/* =========================================== */}
            {/* MODAL DE MOVIMIENTOS */}
            {/* =========================================== */}

            <BasicSupplyMovementModal
                supply={movementSupply}
                movementType={movementType}
                movementQuantity={movementQuantity}
                setMovementQuantity={setMovementQuantity}
                currentStock={
                    supplies.find(
                        (supply) =>
                            supply.id === movementSupply?.id
                    )?.stock ?? 0
                }
                onSubmit={handleMovement}
                onClose={() => setMovementSupply(null)}
            />

        </main>

    );
}

export default BasicSupplies;




