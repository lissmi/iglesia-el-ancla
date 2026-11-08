// =========================================================
// CLIENTE DEL LECTOR BÍBLICO — NUESTRA API EXPRESS
// =========================================================

// Reutilizamos la configuración de axios, CORS y cookies de sesión existente.
import api from "./api";

// Consultamos un capítulo, siempre mediante el backend de El Ancla.
export async function fetchBibleChapter(slug, chapter) {
  const { data } = await api.get(
    `/bible-reader/books/${encodeURIComponent(slug)}/chapters/${encodeURIComponent(chapter)}`
  );
  return data.data;
}

// Obtenemos el nombre de la versión y sus capacidades para mostrarlo en pantalla.
export async function fetchBibleVersion() {
  const { data } = await api.get("/bible-reader/version");
  return data.data;
}

// Obtenemos el catálogo local si lo necesitamos en otros módulos de la PWA.
export async function fetchBibleBooks() {
  const { data } = await api.get("/bible-reader/books");
  return data.data;
}
