// =========================================================
// INGRESOS - ÚNICO CLIENTE AXIOS GLOBAL DE EL ANCLA
// No crea otra instancia HTTP: reutiliza ./api.
// =========================================================

import api from "./api";

// Consulta únicamente los movimientos visibles para administradores.
export async function listIncomes(signal) {
  const response = await api.get("/incomes", { signal });
  if (!Array.isArray(response.data?.incomes)) {
    throw new Error("El servidor no devolvió un listado válido de ingresos");
  }
  return response.data.incomes;
}

// Enviamos FormData solo cuando el administrador seleccionó un archivo.
// Sin comprobante seguimos utilizando JSON como antes.
function prepareIncomeRequest(payload) {
  const { receiptFile, ...fields } = payload;
  if (!receiptFile) return { data: fields, config: undefined };

  const form = new FormData();
  form.append("payload", JSON.stringify(fields));
  form.append("receiptFile", receiptFile, receiptFile.name || "comprobante.jpg");
  return {
    data: form,
    config: {
      headers: { "Content-Type": undefined },
      timeout: 60000,
    },
  };
}

// Registra un nuevo movimiento financiero con comprobante opcional.
export async function createIncome(payload) {
  const { data, config } = prepareIncomeRequest(payload);
  const response = await api.post("/incomes", data, config);
  return response.data.income;
}

// Actualiza con control de versión para evitar sobrescribir cambios ajenos.
export async function updateIncome(id, payload, expectedVersion) {
  const { data, config } = prepareIncomeRequest({
    ...payload,
    expectedVersion,
  });
  const response = await api.patch(
    `/incomes/${encodeURIComponent(id)}`,
    data,
    config
  );
  return response.data.income;
}

// Retira lógicamente un pendiente o anulado; no borra su auditoría.
export async function archiveIncome(id, expectedVersion) {
  const response = await api.delete(`/incomes/${encodeURIComponent(id)}`, {
    data: { expectedVersion },
  });
  return response.data;
}

// Mensajes coherentes con los demás servicios de la PWA.
export function incomeApiError(error) {
  return error?.response?.data?.message ||
    error?.message ||
    "No se pudo completar la operación financiera";
}

// URL de consulta de un comprobante; el backend comprueba JWT y rol.
// Es una URL interna de Express, no una URL pública de Cloudinary.
export function incomeReceiptUrl(id) {
  const base = String(api.defaults.baseURL || "/api").replace(/\/$/, "");
  return `${base}/incomes/${encodeURIComponent(id)}/receipt`;
}
