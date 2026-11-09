// Historial temporal de Martín, exclusivo de la pestaña actual.
// No enviamos mensajes a MongoDB ni los guardamos en localStorage.
const STORAGE_KEY = "el-ancla:martin:chat:v1";
const MAX_AGE_MS = 4 * 60 * 60 * 1000;
export const MARTIN_CHAT_CLEARED_EVENT = "el-ancla:martin:chat-cleared";

// Leemos únicamente mensajes de la estructura que utiliza el widget.
export function readMartinChat() {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const saved = JSON.parse(raw);
    if (!Number.isFinite(saved?.createdAt) || Date.now() - saved.createdAt >= MAX_AGE_MS || Date.now() < saved.createdAt) {
      window.sessionStorage.removeItem(STORAGE_KEY);
      return [];
    }
    if (!Array.isArray(saved.messages)) return [];
    return saved.messages.slice(-60).filter((item) =>
      item && typeof item.id === "string" && ["martin", "user"].includes(item.from) &&
      typeof item.text === "string" && item.text.length <= 5000
    );
  } catch {
    return [];
  }
}

// Mantenemos el mismo plazo original aunque la persona siga conversando.
export function saveMartinChat(messages) {
  try {
    if (!Array.isArray(messages) || messages.length === 0) return;
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    let createdAt = Date.now();
    if (raw) {
      const previous = JSON.parse(raw);
      if (Number.isFinite(previous?.createdAt) && previous.createdAt <= Date.now() && Date.now() - previous.createdAt < MAX_AGE_MS) {
        createdAt = previous.createdAt;
      } else {
        window.sessionStorage.removeItem(STORAGE_KEY);
        return; // El historial vencido no se renueva automáticamente.
      }
    }
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      createdAt,
      messages: messages.slice(-60).map(({ id, from, text, link, linkText, free }) => ({ id, from, text, link, linkText, free: free === true })),
    }));
  } catch {
    // Si el navegador bloquea el almacenamiento, el chat sigue en memoria.
  }
}

// Borramos el historial y avisamos a los componentes que estén abiertos.
// El aviso de sesión cerrada se emite únicamente para cierres de sesión reales
// o expiración de autenticación, no al limpiar manualmente los mensajes.
export function clearMartinChat({ notifySessionClosed = true } = {}) {
  try { window.sessionStorage.removeItem(STORAGE_KEY); } catch { /* Almacenamiento no disponible. */ }
  // Los otros componentes solo deben cambiar a invitado cuando terminó la sesión.
  if (notifySessionClosed && typeof window !== "undefined") {
    window.dispatchEvent(new Event(MARTIN_CHAT_CLEARED_EVENT));
  }
}
