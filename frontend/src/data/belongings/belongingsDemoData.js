// =========================================================
// CATÁLOGOS DEL INVENTARIO DE BIENES
// Conservamos el archivo y sus importaciones para evitar crear otro.
// Ya NO contiene registros de demostración.
// =========================================================
export const belongingsCategories = [
  { id: "CAT-001", name: "Mobiliario" },
  { id: "CAT-002", name: "Equipamiento audiovisual" },
  { id: "CAT-003", name: "Material bibliográfico" },
  { id: "CAT-004", name: "Material de alabanza" },
  { id: "CAT-005", name: "Instrumentos musicales" },
  { id: "CAT-006", name: "Otros bienes" },
];

export const belongingsConditions = [
  { value: "excellent", label: "Excelente" },
  { value: "good", label: "Bueno" },
  { value: "fair", label: "Regular" },
  { value: "damaged", label: "Dañado" },
  { value: "out_of_service", label: "Fuera de servicio" },
];

export const belongingsMovementTypes = {
  registration: "Registro inicial",
  inspection: "Revisión de estado",
  adjustment: "Ajuste de cantidad",
};
