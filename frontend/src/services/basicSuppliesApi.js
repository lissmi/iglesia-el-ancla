// =========================================================
// INSUMOS BÁSICOS: REUTILIZAMOS EL API GLOBAL
// =========================================================
import api from "./api";

// Normaliza respuestas; nunca crea otro cliente HTTP.
async function result(request) {
  const response = await request;
  if (!response.data?.success) throw new Error(response.data?.message || "No pudimos completar la operación");
  return response.data;
}

// Inventario completo para las cuentas administrativas.
export const listBasicSuppliesAdmin = () => result(api.get("/basic-supplies/admin"));

// Necesidades visibles para personas con sesión, sin datos de otros miembros.
export const listBasicSuppliesNeeds = () => result(api.get("/basic-supplies/needs"));

// Registra un nuevo producto del inventario.
export const createBasicSupply = (data) => result(api.post("/basic-supplies/admin", data));

// Modifica solo los datos descriptivos, nunca las existencias directamente.
export const updateBasicSupply = (id, data, expectedVersion) =>
  result(api.put(`/basic-supplies/admin/${encodeURIComponent(id)}`, { ...data, expectedVersion }));

// Registra entrada o consumo físico de manera atómica.
export const registerBasicSupplyMovement = (id, type, quantity) =>
  result(api.post(`/basic-supplies/admin/${encodeURIComponent(id)}/movements`, { type, quantity }));

// Elimina definitivamente un insumo que ya no tenga compromisos abiertos.
export const deleteBasicSupply = (id) => result(api.delete(`/basic-supplies/admin/${encodeURIComponent(id)}`));

// Un miembro se anota con una cantidad concreta.
export const pledgeBasicSupply = (id, quantity) =>
  result(api.post(`/basic-supplies/${encodeURIComponent(id)}/commitment`, { quantity }));

// El miembro puede retirar su compromiso mientras no se haya entregado.
export const cancelBasicSupplyPledge = (id) =>
  result(api.delete(`/basic-supplies/${encodeURIComponent(id)}/commitment`));

// Un administrador confirma la entrega y recién entonces aumenta el stock.
export const deliverBasicSupplyPledge = (id, memberId) =>
  result(api.post(`/basic-supplies/admin/${encodeURIComponent(id)}/commitments/${encodeURIComponent(memberId)}/deliver`, {}));

// Los mensajes del backend son comprensibles; si no hay uno, damos uno general.
export const basicSupplyApiError = (error) =>
  error?.response?.data?.message || error?.message || "No pudimos completar la operación. Inténtalo nuevamente.";
