// =========================================================
// API DE RECOMENDADOS - IGLESIA EL ANCLA
// Reutiliza src/services/api.js (Axios + cookies HttpOnly).
// =========================================================

// No creamos otra conexión ni almacenamos tokens en React.
import api from "./api";

// Convierte una recomendación y su imagen opcional a FormData.
function createFormData(payload, imageFile) {
  const form = new FormData();
  // El servidor valida todos los campos antes de guardarlos.
  form.append("payload", JSON.stringify(payload));
  // Solo enviamos el archivo cuando se eligió una portada nueva.
  if (imageFile) form.append("imageFile", imageFile, imageFile.name);
  return form;
}

// Obtiene únicamente las recomendaciones publicadas.
export async function listPublishedRecommendations() {
  const response = await api.get("/recommendations");
  return response.data.recommendations;
}

// Lista todo el catálogo, incluidos los borradores (requiere administrador).
export async function listAdminRecommendations() {
  const response = await api.get("/recommendations/admin");
  return response.data.recommendations;
}

// Envía una recomendación nueva sin almacenar archivos en MongoDB.
export async function createRecommendation(payload, imageFile = null) {
  const response = await api.post(
    "/recommendations/admin",
    createFormData(payload, imageFile),
    // Dejar que Axios / navegador gestione el boundary del multipart.
    { headers: { "Content-Type": undefined }, timeout: 60000 }
  );
  return response.data.recommendation;
}

// Actualiza el documento y reemplaza su portada solo si se seleccionó otra.
export async function updateRecommendation(id, payload, imageFile = null) {
  const response = await api.put(
    `/recommendations/admin/${encodeURIComponent(id)}`,
    createFormData(payload, imageFile),
    { headers: { "Content-Type": undefined }, timeout: 60000 }
  );
  return response.data.recommendation;
}

// Elimina el registro de MongoDB por su identificador seguro.
export async function deleteRecommendation(id) {
  await api.delete(`/recommendations/admin/${encodeURIComponent(id)}`);
}
