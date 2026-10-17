
/* ========================================================= */
/* INVENTARIO DE BIENES - IGLESIA EL ANCLA                   */
/* DATOS TEMPORALES PARA DESARROLLO DEL FRONTEND             */
/* ========================================================= */

// Los registros son ficticios.
// Posteriormente se reemplazarán por datos de MongoDB.

// =========================================================
// CATEGORÍAS DE BIENES
// =========================================================

export const belongingsCategories = [
    { id: "CAT-001", name: "Mobiliario" },
    { id: "CAT-002", name: "Equipamiento audiovisual" },
    { id: "CAT-003", name: "Material bibliográfico" },
    { id: "CAT-004", name: "Material de alabanza" },
    { id: "CAT-005", name: "Instrumentos musicales" },
    { id: "CAT-006", name: "Otros bienes" },
];

// =========================================================
// UBICACIONES
// =========================================================

export const belongingsLocations = [
    { id: "LOC-001", name: "Salón principal" },
    { id: "LOC-002", name: "Sala de reuniones" },
    { id: "LOC-003", name: "Bodega" },
    { id: "LOC-004", name: "Área de alabanza" },
    { id: "LOC-005", name: "Oficina administrativa" },
];

// =========================================================
// ESTADOS DE CONSERVACIÓN
// =========================================================

export const belongingsConditions = [
    { value: "excellent", label: "Excelente" },
    { value: "good", label: "Bueno" },
    { value: "fair", label: "Regular" },
    { value: "damaged", label: "Dañado" },
    { value: "out_of_service", label: "Fuera de servicio" },
];

// =========================================================
// TIPOS DE REGISTRO
// =========================================================

export const belongingsTrackingTypes = [
    { value: "individual", label: "Individual" },
    { value: "quantity", label: "Por cantidad" },
];

// =========================================================
// BIENES REGISTRADOS
// =========================================================

export const initialBelongings = [
    {
        id: "BEL-001",
        code: "BIEN-0001",
        name: "Sillas plásticas blancas",
        categoryId: "CAT-001",
        locationId: "LOC-001",
        trackingType: "quantity",
        quantity: 80,
        condition: "good",
        acquisitionType: "donation",
        acquisitionDate: "2026-08-10",
        responsible: "Encargado de mobiliario",
        description: "Sillas destinadas al salón principal.",
        image: null,
    },
    {
        id: "BEL-002",
        code: "BIEN-0002",
        name: "Biblias de uso comunitario",
        categoryId: "CAT-003",
        locationId: "LOC-002",
        trackingType: "quantity",
        quantity: 25,
        condition: "good",
        acquisitionType: "donation",
        acquisitionDate: "2026-08-15",
        responsible: "Encargado de recursos",
        description: "Biblias disponibles para reuniones y estudios.",
        image: null,
    },
    {
        id: "BEL-003",
        code: "BIEN-0003",
        name: "Carpetas de alabanzas",
        categoryId: "CAT-004",
        locationId: "LOC-004",
        trackingType: "quantity",
        quantity: 15,
        condition: "fair",
        acquisitionType: "purchase",
        acquisitionDate: "2026-09-02",
        responsible: "Ministerio de alabanza",
        description: "Carpetas con repertorio de canciones.",
        image: null,
    },
    {
        id: "BEL-004",
        code: "BIEN-0004",
        name: "Proyector multimedia",
        categoryId: "CAT-002",
        locationId: "LOC-001",
        trackingType: "individual",
        quantity: 1,
        condition: "excellent",
        acquisitionType: "purchase",
        acquisitionDate: "2026-09-12",
        responsible: "Equipo audiovisual",
        description: "Proyector para presentaciones y reuniones.",
        image: null,
    },
    {
        id: "BEL-005",
        code: "BIEN-0005",
        name: "Micrófonos inalámbricos",
        categoryId: "CAT-002",
        locationId: "LOC-004",
        trackingType: "quantity",
        quantity: 3,
        condition: "good",
        acquisitionType: "purchase",
        acquisitionDate: "2026-09-18",
        responsible: "Equipo audiovisual",
        description: "Micrófonos utilizados en reuniones.",
        image: null,
    },
    {
        id: "BEL-006",
        code: "BIEN-0006",
        name: "Guitarra acústica",
        categoryId: "CAT-005",
        locationId: "LOC-004",
        trackingType: "individual",
        quantity: 1,
        condition: "fair",
        acquisitionType: "donation",
        acquisitionDate: "2026-09-20",
        responsible: "Ministerio de alabanza",
        description: "Instrumento utilizado en actividades musicales.",
        image: null,
    },
];

// =========================================================
// TIPOS DE MOVIMIENTO
// =========================================================

export const belongingsMovementTypes = {
    registration: "Registro inicial",
    transfer: "Traslado",
    loan: "Préstamo",
    return: "Devolución",
    inspection: "Inspección",
    adjustment: "Ajuste de inventario",
    disposal: "Baja",
};

// =========================================================
// HISTORIAL DE MOVIMIENTOS
// =========================================================

export const initialBelongingsMovements = [
    {
        id: "MOV-001",
        belongingId: "BEL-003",
        type: "inspection",
        quantity: 15,
        date: "2026-10-10",
        description: "Revisión del estado de las carpetas.",
        performedBy: "Administrador",
    },
    {
        id: "MOV-002",
        belongingId: "BEL-004",
        type: "registration",
        quantity: 1,
        date: "2026-09-12",
        description: "Ingreso inicial del proyector.",
        performedBy: "Administrador",
    },
];
