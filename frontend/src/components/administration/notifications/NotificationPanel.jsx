// =========================================================
// PANEL ADMINISTRATIVO — MISMA BANDEJA QUE EN /MEMBER
// =========================================================
import { useEffect, useId, useRef, useState } from "react";
import { BellOff, CheckCheck, RotateCw, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../../context/notifications/NotificationsContext";
import NotificationItem from "./NotificationItem";
import "../../../styles/components/administration/notifications/NotificationPanel.css";

function NotificationPanel({ onClose }) {
  const titleId = useId();
  const panelRef = useRef(null);
  const closeRef = useRef(null);
  const [filter, setFilter] = useState("all");
  const [actionError, setActionError] = useState("");
  const navigate = useNavigate();
  const { notifications, unreadCount, loading, error, refreshNotifications, markAsRead, markAllAsRead } = useNotifications();

  // Conservamos el enfoque por teclado del panel original.
  useEffect(() => {
    const previousFocus = document.activeElement;
    closeRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;
      const focusables = Array.from(panelRef.current?.querySelectorAll('button:not([disabled])') || []);
      if (!focusables.length) return;
      if (event.shiftKey && document.activeElement === focusables[0]) {
        event.preventDefault(); focusables.at(-1).focus();
      } else if (!event.shiftKey && document.activeElement === focusables.at(-1)) {
        event.preventDefault(); focusables[0].focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => { document.removeEventListener("keydown", onKeyDown); previousFocus?.focus?.(); };
  }, [onClose]);

  const visibleNotifications = filter === "unread"
    ? notifications.filter((notification) => !notification.read)
    : notifications;

  // Solo navegamos a rutas internas permitidas; backend ya filtró por permisos.
  async function handleOpen(notification) {
    if (!notification || typeof notification.path !== "string") return;
    const path = notification.path;
    if (!/^\/(member|admin|super-admin)(\/|\?|$)/.test(path) || path.startsWith("//") || path.includes("\\")) return;
    try {
      await markAsRead(notification.id);
      onClose();
      navigate(path);
    } catch {
      setActionError("No se pudo guardar la lectura. Vuelve a intentarlo.");
    }
  }

  async function handleReadAll() {
    try {
      await markAllAsRead();
      setActionError("");
    } catch {
      setActionError("No pudimos marcar los avisos como leídos.");
    }
  }

  return (
    <div className="notification-panel__backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section ref={panelRef} className="notification-panel" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <header className="notification-panel__header">
          <div>
            <span>COMUNIDAD Y ADMINISTRACIÓN</span>
            <h2 id={titleId}>Notificaciones</h2>
            <p>Tus avisos pendientes, en una sola bandeja.</p>
          </div>
          <button ref={closeRef} type="button" className="notification-panel__close" onClick={onClose} aria-label="Cerrar notificaciones"><X size={19} /></button>
        </header>
        <div className="notification-panel__tools">
          <div className="notification-panel__filters" aria-label="Filtrar notificaciones">
            <button type="button" className={filter === "all" ? "is-active" : ""} aria-pressed={filter === "all"} onClick={() => setFilter("all")}>Todas</button>
            <button type="button" className={filter === "unread" ? "is-active" : ""} aria-pressed={filter === "unread"} onClick={() => setFilter("unread")}>No leídas ({unreadCount})</button>
          </div>
          <button type="button" className="notification-panel__read-all" onClick={handleReadAll} disabled={unreadCount === 0}><CheckCheck size={15} /> Marcar todas</button>
        </div>
        <div className="notification-panel__list" aria-live="polite">
          {loading && <p role="status">Actualizando avisos...</p>}
          {(error || actionError) && (
            <div role="alert">
              <p>{error || actionError}</p>
              <button type="button" onClick={() => refreshNotifications({ force: true })}><RotateCw size={14} /> Reintentar</button>
            </div>
          )}
          {!loading && !error && visibleNotifications.length === 0 ? (
            <div className="notification-panel__empty">
              <BellOff size={34} strokeWidth={1.5} />
              <strong>{filter === "unread" ? "No tienes avisos sin leer" : "Sin avisos que requieran atención"}</strong>
            </div>
          ) : visibleNotifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification}
              onRead={(id) => markAsRead(id).catch(() => setActionError("No se pudo guardar la lectura."))}
              onOpen={handleOpen} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default NotificationPanel;
