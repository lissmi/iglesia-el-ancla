// =========================================================
// CATEGORÍAS Y REGLAS COMPARTIDAS - INSUMOS BÁSICOS
// Archivo existente: ya no contiene registros de demostración.
// =========================================================

export const basicSupplyCategories = [
  "Alimentos", "Aseo e higiene", "Materiales educativos", "Otros",
];

// Al llegar al mínimo o bajar de él, se considera que falta reponer.
export function getBasicSupplyStatus(supply) {
  if (Number(supply.stock) <= 0) return "out";
  if (Number(supply.stock) <= Number(supply.minimumStock)) return "low";
  return "available";
}

// La cantidad sugerida permite quedar UNA unidad sobre el stock mínimo.
// Es la misma regla que usa el backend para aceptar compromisos.
export function getBasicSupplySuggestedQuantity(supply) {
  return Math.max(0, Number(supply.minimumStock) + 1 - Number(supply.stock));
}
