// =========================================================
// CLIENTE DE INVENTARIO DE BIENES
// Reutiliza api.js (cookies HttpOnly + URL global).
// =========================================================
import api from "./api";

async function unwrap(request) {
  const response = await request;
  if (response.data?.success !== true) throw new Error(response.data?.message || "No pudimos completar la operación");
  return response.data;
}

export const listBelongings = () => unwrap(api.get("/belongings"));
export const createBelongingRequest = (data) => unwrap(api.post("/belongings", data));
export const updateBelongingRequest = (id, data, expectedVersion) =>
  unwrap(api.put(`/belongings/${encodeURIComponent(id)}`, { ...data, expectedVersion }));
export const deleteBelongingRequest = (id) => unwrap(api.delete(`/belongings/${encodeURIComponent(id)}`));
export const createBelongingMovementRequest = (data) => unwrap(api.post("/belongings/movements", data));
export const updateBelongingMovementRequest = (id, data) =>
  unwrap(api.put(`/belongings/movements/${encodeURIComponent(id)}`, data));
export const deleteBelongingMovementRequest = (id) =>
  unwrap(api.delete(`/belongings/movements/${encodeURIComponent(id)}`));
export const belongingsApiError = (error) =>
  error?.response?.data?.message || error?.message || "No pudimos completar la operación. Inténtalo nuevamente.";
