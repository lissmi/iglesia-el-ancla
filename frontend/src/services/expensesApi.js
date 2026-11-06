// =========================================================
// GASTOS - SOLICITUDES HTTP MEDIANTE API GLOBAL
// Nunca se crea otra instancia Axios.
// =========================================================

import api from "./api";

// GET privado: lista de movimientos financieros de la iglesia.
export async function listExpenses(signal) {
  const response = await api.get("/expenses", { signal });
  if (!Array.isArray(response.data?.expenses)) {
    throw new Error("El servidor no devolvió un listado válido de gastos");
  }
  return response.data.expenses;
}

// Los archivos nuevos se transmiten como multipart; sin imagen enviamos JSON.
function prepareRequest(payload, receiptFile = null) {
  if (!receiptFile) return { data: payload, config: undefined };
  const form = new FormData();
  form.append("payload", JSON.stringify(payload));
  form.append("receiptFile", receiptFile, receiptFile.name || "boleta.jpg");
  return {
    data: form,
    config: {
      headers: { "Content-Type": undefined },
      timeout: 60000,
    },
  };
}

// POST: crea un gasto con boleta opcional.
export async function createExpense(payload, receiptFile) {
  const { data, config } = prepareRequest(payload, receiptFile);
  const response = await api.post("/expenses", data, config);
  return response.data.expense;
}

// PATCH: exige versión para no sobrescribir el trabajo de otro administrador.
export async function updateExpense(id, payload, expectedVersion, receiptFile) {
  const { data, config } = prepareRequest({ ...payload, expectedVersion }, receiptFile);
  const response = await api.patch(`/expenses/${encodeURIComponent(id)}`, data, config);
  return response.data.expense;
}

// DELETE: eliminación física más registro mínimo de auditoría.
export async function deleteGasto(id, expectedVersion) {
  const response = await api.delete(`/expenses/${encodeURIComponent(id)}`, {
    data: { expectedVersion },
  });
  return response.data;
}

// Descarga autorizada de una boleta: Blob efímero, sin URL de Cloudinary.
export async function fetchExpenseReceipt(id, signal) {
  const response = await api.get(`/expenses/${encodeURIComponent(id)}/receipt`, {
    responseType: "blob",
    signal,
    timeout: 30000,
  });
  return response.data;
}

// Mensajes que devuelve Express o errores de conexión.
export function expenseApiError(error) {
  return error?.response?.data?.message ||
    error?.message ||
    "No se pudo completar la operación financiera";
}
