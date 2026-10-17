
/* ========================================================= */
/* DATOS DE DEMOSTRACIÓN - INSUMOS BÁSICOS */
/* IGLESIA EL ANCLA */
/* ========================================================= */

// Este archivo contiene exclusivamente los datos
// ficticios del módulo de Insumos Básicos.
//
// No tiene relación con los recursos digitales
// o materiales de estudio de la iglesia.

export const basicSupplyCategories = [
    "Alimentos",
    "Aseo e higiene",
    "Materiales educativos",
    "Otros",
];

// =========================================================
// CATÁLOGO INICIAL
// =========================================================

export const initialBasicSupplies = [
    {
        id: "INS-001",
        name: "Papel higiénico",
        category: "Aseo e higiene",
        stock: 2,
        minimumStock: 6,
        targetStock: 12,
        unit: "paquetes",
        location: "Bodega de aseo",
        frequent: true,
        notes: "Uso habitual de los baños.",
    },
    {
        id: "INS-002",
        name: "Cloro",
        category: "Aseo e higiene",
        stock: 0,
        minimumStock: 3,
        targetStock: 6,
        unit: "botellas",
        location: "Bodega de aseo",
        frequent: true,
        notes: "Limpieza de instalaciones.",
    },
    {
        id: "INS-003",
        name: "Café",
        category: "Alimentos",
        stock: 1,
        minimumStock: 3,
        targetStock: 6,
        unit: "frascos",
        location: "Cocina",
        frequent: true,
        notes: "Desayunos y reuniones.",
    },
    {
        id: "INS-004",
        name: "Té",
        category: "Alimentos",
        stock: 8,
        minimumStock: 4,
        targetStock: 10,
        unit: "cajas",
        location: "Cocina",
        frequent: true,
        notes: "Desayunos y reuniones.",
    },
    {
        id: "INS-005",
        name: "Mantequilla",
        category: "Alimentos",
        stock: 0,
        minimumStock: 2,
        targetStock: 5,
        unit: "unidades",
        location: "Cocina",
        frequent: true,
        notes: "Refrigeración necesaria.",
    },
    {
        id: "INS-006",
        name: "Toalla de papel",
        category: "Aseo e higiene",
        stock: 2,
        minimumStock: 4,
        targetStock: 8,
        unit: "rollos",
        location: "Bodega de aseo",
        frequent: true,
        notes: "Uso general.",
    },
    {
        id: "INS-007",
        name: "Traperos húmedos",
        category: "Aseo e higiene",
        stock: 1,
        minimumStock: 2,
        targetStock: 4,
        unit: "unidades",
        location: "Bodega de aseo",
        frequent: false,
        notes: "Limpieza de pisos.",
    },
    {
        id: "INS-008",
        name: "Toallitas de cloro",
        category: "Aseo e higiene",
        stock: 0,
        minimumStock: 2,
        targetStock: 4,
        unit: "paquetes",
        location: "Bodega de aseo",
        frequent: false,
        notes: "Desinfección de superficies.",
    },
    {
        id: "INS-009",
        name: "Hojas de colores",
        category: "Materiales educativos",
        stock: 5,
        minimumStock: 3,
        targetStock: 8,
        unit: "paquetes",
        location: "Sala de niños",
        frequent: true,
        notes: "Actividades infantiles.",
    },
    {
        id: "INS-010",
        name: "Lápices de colores",
        category: "Materiales educativos",
        stock: 2,
        minimumStock: 4,
        targetStock: 8,
        unit: "cajas",
        location: "Sala de niños",
        frequent: true,
        notes: "Clases y talleres.",
    },
    {
        id: "INS-011",
        name: "Pegamento en barra",
        category: "Materiales educativos",
        stock: 6,
        minimumStock: 3,
        targetStock: 10,
        unit: "unidades",
        location: "Sala de niños",
        frequent: false,
        notes: "Manualidades.",
    },
    {
        id: "INS-012",
        name: "Cuadernos",
        category: "Materiales educativos",
        stock: 4,
        minimumStock: 4,
        targetStock: 10,
        unit: "unidades",
        location: "Sala de jóvenes",
        frequent: false,
        notes: "Talleres y estudios.",
    },
];

// =========================================================
// ESTADO DE UN INSUMO
// =========================================================

// El estado se calcula automáticamente según
// la cantidad disponible y el stock mínimo.

export function getBasicSupplyStatus(supply) {

    if (supply.stock <= 0) {
        return "out";
    }

    if (supply.stock <= supply.minimumStock) {
        return "low";
    }

    return "available";
}

// =========================================================
// CANTIDAD SUGERIDA PARA REPOSICIÓN
// =========================================================

// Se calcula cuánto falta para alcanzar
// el stock objetivo definido por el administrador.

export function getBasicSupplySuggestedQuantity(supply) {

    return Math.max(
        0,
        supply.targetStock - supply.stock
    );
}
