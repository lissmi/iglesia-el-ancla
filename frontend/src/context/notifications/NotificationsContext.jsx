// =========================================================
// BANDEJA ÚNICA DE EL ANCLA ⚓
// Una cuenta, el mismo contador y lectura en todas las secciones.
// La API valida sesión y roles; React solamente representa el resultado.
// =========================================================
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../../services/api";

const NotificationsContext = createContext(null);
const VALID_ROLES = new Set(["member", "admin", "super_admin"]);

export function NotificationsProvider({ children }) {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionError, setSessionError] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const lastLoaded = useRef(0);
  const lastSessionCheck = useRef(0);
  const requestSequence = useRef(0);
  const currentUserRef = useRef(null);

  // Eliminamos toda información privada en memoria al perder una sesión.
  const clearAccount = useCallback(() => {
    requestSequence.current += 1;
    currentUserRef.current = null;
    setCurrentUser(null);
    setNotifications([]);
    setLoading(false);
    setError("");
    lastLoaded.current = 0;
  }, []);

  // Comprobamos la identidad real del servidor; nunca localStorage.
  const refreshSession = useCallback(async () => {
    try {
      // IMPORTANTE: no enviamos Cache-Control como cabecera de solicitud.
      // El servidor permite una lista controlada de encabezados CORS;
      // añadir otro desde React provocaba un preflight bloqueado y
      // hacía que los avisos desaparecieran aunque existiera sesión.
      // El parámetro de consulta evita reutilizar una respuesta antigua
      // sin introducir cabeceras adicionales en la petición.
      const response = await api.get("/auth/me", {
        params: { _session_check: Date.now() },
      });
      const user = response.data?.success && response.data?.user;
      if (!user || !VALID_ROLES.has(user.role)) {
        clearAccount();
        return null;
      }
      const oldId = String(currentUserRef.current?._id || currentUserRef.current?.id || "");
      const newId = String(user._id || user.id || "");
      if (oldId && (oldId !== newId || currentUserRef.current?.role !== user.role)) {
        // Una cuenta distinta jamás hereda los avisos de otra persona.
        setNotifications([]);
        lastLoaded.current = 0;
        requestSequence.current += 1;
      }
      currentUserRef.current = user;
      setCurrentUser(user);
      setSessionError("");
      return user;
    } catch (cause) {
      // El servidor responde 401 cuando no hay sesión válida.
      // Si hay un error de red/CORS tampoco revelamos datos privados,
      // pero lo distinguimos de un invitado para facilitar diagnósticos.
      clearAccount();
      if (cause.response?.status !== 401 && cause.response?.status !== 403) {
        setSessionError("No fue posible comprobar la sesión. Revisa tu conexión e intenta nuevamente.");
        if (process.env.NODE_ENV === "development") {
          console.warn("No se pudo consultar /auth/me:", cause.message);
        }
      } else {
        setSessionError("");
      }
      return null;
    } finally {
      lastSessionCheck.current = Date.now();
      setCheckingSession(false);
    }
  }, [clearAccount]);

  // Recargamos la bandeja solo para una sesión previamente validada.
  const refreshNotifications = useCallback(async ({ force = false } = {}) => {
    if (!currentUserRef.current) return;
    if (!force && Date.now() - lastLoaded.current < 30000) return;
    const sequence = ++requestSequence.current;
    const accountId = String(currentUserRef.current?._id || currentUserRef.current?.id);
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/notifications", { params: { _refresh: Date.now() } });
      if (!response.data?.success || !Array.isArray(response.data?.notifications)) {
        throw new Error("El servidor devolvió una bandeja inválida");
      }
      // Descartamos respuestas antiguas o correspondientes a otra cuenta.
      if (sequence !== requestSequence.current ||
          String(currentUserRef.current?._id || currentUserRef.current?.id) !== accountId) return;
      setNotifications(response.data.notifications);
      lastLoaded.current = Date.now();
    } catch (cause) {
      if (sequence !== requestSequence.current) return;
      if (cause.response?.status === 401 || cause.response?.status === 403) {
        clearAccount();
      } else {
        // Conservamos los avisos conocidos sin afirmar que no hay pendientes.
        setError("No pudimos actualizar los avisos. Inténtalo nuevamente.");
      }
    } finally {
      if (sequence === requestSequence.current) setLoading(false);
    }
  }, [clearAccount]);

  // La sesión se verifica al iniciar y al cambiar entre entrada pública y privada.
  useEffect(() => {
    const pathname = location.pathname;
    // Verificamos como máximo cada 15 segundos al cambiar de sección.
    // También revalidamos de inmediato cuando alguien entra a /member sin usuario.
    const shouldVerify = !lastSessionCheck.current ||
      Date.now() - lastSessionCheck.current > 15000 ||
      (!currentUserRef.current && (pathname.startsWith("/member") ||
       pathname.startsWith("/admin") || pathname.startsWith("/super-admin")));
    if (shouldVerify) refreshSession();
  }, [location.pathname, refreshSession]);

  // Una cuenta verificada carga su bandeja al principio y ante cambio de usuario.
  const accountKey = currentUser
    ? `${String(currentUser._id || currentUser.id || "")}:${currentUser.role}`
    : "";
  useEffect(() => {
    if (accountKey) refreshNotifications({ force: true });
  }, [accountKey, refreshNotifications]);

  // Al volver a la PWA renovamos los avisos sin polling permanente.
  useEffect(() => {
    const onReturn = async () => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastSessionCheck.current > 60000) await refreshSession();
      if (currentUserRef.current) refreshNotifications();
    };
    window.addEventListener("focus", onReturn);
    document.addEventListener("visibilitychange", onReturn);
    return () => {
      window.removeEventListener("focus", onReturn);
      document.removeEventListener("visibilitychange", onReturn);
    };
  }, [refreshSession, refreshNotifications]);

  // Un aviso leído desaparece del contador en todas las campanas simultáneamente.
  const markAsRead = useCallback(async (id) => {
    if (!currentUserRef.current || !notifications.some((item) => item.id === id)) return;
    await api.post("/notifications/read", { id });
    setNotifications((old) => old.map((item) => item.id === id ? { ...item, read: true } : item));
  }, [notifications]);

  // Mismo estado compartido entre páginas públicas, miembros y administración.
  const markAllAsRead = useCallback(async () => {
    if (!currentUserRef.current) return;
    await api.post("/notifications/read-all", {});
    setNotifications((old) => old.map((item) => ({ ...item, read: true })));
  }, []);

  const unreadCount = notifications.filter((item) => !item.read).length;
  const value = useMemo(() => ({
    currentUser, checkingSession, sessionError, notifications, unreadCount, loading, error,
    refreshSession, refreshNotifications, markAsRead, markAllAsRead, clearAccount,
  }), [currentUser, checkingSession, sessionError, notifications, unreadCount, loading, error,
    refreshSession, refreshNotifications, markAsRead, markAllAsRead, clearAccount]);

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) throw new Error("useNotifications requiere NotificationsProvider.");
  return context;
}
