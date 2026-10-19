// =========================================================
// CAMPANA Y PANEL: INTEGRACIÓN EN EL ENCABEZADO
// =========================================================
import { useCallback, useState } from "react";
import { Bell } from "lucide-react";
import { NotificationsProvider, useNotifications } from "../../../context/notifications/NotificationsContext";
import NotificationPanel from "./NotificationPanel";

function NotificationTrigger() {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount } = useNotifications();
  const closePanel = useCallback(() => setIsOpen(false), []);

  return (
    <>
      <button className="admin-header__notification" type="button"
        aria-label={unreadCount ? `Ver notificaciones, ${unreadCount} sin leer` : "Ver notificaciones"}
        aria-expanded={isOpen} aria-haspopup="dialog" title="Notificaciones"
        onClick={() => setIsOpen((previous) => !previous)}>
        <Bell size={21} strokeWidth={1.8} aria-hidden="true" />
        {unreadCount > 0 && <span className="admin-header__notification-indicator" aria-hidden="true" />}
      </button>
      {isOpen && <NotificationPanel onClose={closePanel} />}
    </>
  );
}

function NotificationCenter() {
  // Cuando integremos el backend, el Provider podrá moverse al layout administrativo.
  return <NotificationsProvider><NotificationTrigger /></NotificationsProvider>;
}

export default NotificationCenter;
