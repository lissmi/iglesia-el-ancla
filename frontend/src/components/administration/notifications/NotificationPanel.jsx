// =========================================================
// PANEL DESPLEGABLE DE NOTIFICACIONES
// =========================================================
import { useEffect, useId, useRef, useState } from "react";
import { BellOff, CheckCheck, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useNotifications } from "../../../context/notifications/NotificationsContext";
import NotificationItem from "./NotificationItem";
import "../../../styles/components/administration/notifications/NotificationPanel.css";

function NotificationPanel({ onClose }) {
  const titleId = useId();
  const panelRef = useRef(null);
  const closeRef = useRef(null);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();
  const location = useLocation();
  const adminBasePath = location.pathname.startsWith("/super-admin") ? "/super-admin" : "/admin";
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  // Restituimos el foco al elemento desde el que se abrió el panel.
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

  // Usamos un enlace profundo que conserva el ID del gasto en la URL.
  // No dependemos del estado transitorio de React Router.

  // =========================================================
  // ABRIR INFORMACIÓN DE UNA NOTIFICACIÓN
  // =========================================================

  const handleOpen = (notification) => {

    // Verificamos que exista una notificación válida.
    if (!notification) {
      console.error("Notificación no válida.");
      return;
    }

    // =======================================================
    // NOTIFICACIONES DE GASTOS
    // =======================================================

    if (notification.source === "expense") {

      // Obtenemos el identificador del gasto.
      const expenseId = notification.expenseId;

      // No navegamos si falta el identificador.
      if (expenseId == null || String(expenseId).trim() === "") {
        console.error(
          "La notificación no contiene un expenseId válido:",
          notification
        );

        return;
      }

      // Construimos la ruta utilizando el panel actual.
      // Así funciona tanto para admin como super_admin.
      const expensePath =
        `${adminBasePath}/finanzas/gastos`;

      // Agregamos el identificador como parámetro.
      const searchParams = new URLSearchParams();

      searchParams.set(
        "gasto",
        String(expenseId)
      );

      // Marcamos la notificación como leída.
      markAsRead(notification.id);

      // Cerramos el panel de notificaciones.
      onClose();

      // Navegamos directamente al gasto.
      navigate({
        pathname: expensePath,
        search: `?${searchParams.toString()}`,
      });

      return;
    }

    // =======================================================
    // OTRAS NOTIFICACIONES
    // =======================================================

    const path = notification.path;

    // Comprobamos que exista una ruta.
    if (typeof path !== "string") {
      console.error(
        "La notificación no tiene una ruta válida:",
        notification
      );

      return;
    }

    // Permitimos solamente rutas internas relativas
    // al panel administrativo activo.
    const destination = path.startsWith(`${adminBasePath}/`)
      ? path
      : null;

    if (!destination) {
      console.error(
        "La notificación apunta fuera del panel actual:",
        path
      );

      return;
    }

    // Registramos la lectura.
    markAsRead(notification.id);

    // Cerramos las notificaciones.
    onClose();

    // Navegamos al módulo correspondiente.
    navigate(destination);
  };


  return (
    <div className="notification-panel__backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section ref={panelRef} className="notification-panel" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <header className="notification-panel__header">
          <div><span>ACTIVIDAD ADMINISTRATIVA</span><h2 id={titleId}>Notificaciones</h2><p>Información que requiere tu atención.</p></div>
          <button ref={closeRef} type="button" className="notification-panel__close" onClick={onClose} aria-label="Cerrar notificaciones"><X size={19} /></button>
        </header>
        <div className="notification-panel__tools">
          <div className="notification-panel__filters" aria-label="Filtrar notificaciones">
            <button type="button" className={filter === "all" ? "is-active" : ""} aria-pressed={filter === "all"} onClick={() => setFilter("all")}>Todas</button>
            <button type="button" className={filter === "unread" ? "is-active" : ""} aria-pressed={filter === "unread"} onClick={() => setFilter("unread")}>No leídas ({unreadCount})</button>
          </div>
          <button type="button" className="notification-panel__read-all" onClick={markAllAsRead} disabled={unreadCount === 0}><CheckCheck size={15} /> Marcar todas</button>
        </div>
        <div className="notification-panel__list" aria-live="polite">
          {visibleNotifications.length === 0 ? (
            <div className="notification-panel__empty"><BellOff size={34} strokeWidth={1.5} /><strong>{filter === "unread" ? "No tienes notificaciones sin leer" : "Sin notificaciones por ahora"}</strong><p>{filter === "unread" ? "Todas las notificaciones están al día." : "No hay pagos vencidos ni otros avisos administrativos activos."}</p></div>
          ) : visibleNotifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} onRead={markAsRead} onOpen={handleOpen} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default NotificationPanel;
