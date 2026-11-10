// =========================================================
// CAMPANA ADMINISTRATIVA — BANDEJA ÚNICA POR USUARIO
// La misma cuenta ve el mismo contador en /member y /admin.
// =========================================================
import { useCallback, useState } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "../../../context/notifications/NotificationsContext";
import NotificationPanel from "./NotificationPanel";

function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, unreadCount, refreshNotifications } = useNotifications();
  const closePanel = useCallback(() => setIsOpen(false), []);

  // Sin sesión autenticada, no existe campana privada.
  if (!currentUser) return null;

  return (
    <>
      <button className="admin-header__notification" type="button"
        aria-label={unreadCount ? `Ver notificaciones, ${unreadCount} sin leer` : "Ver notificaciones"}
        aria-expanded={isOpen} aria-haspopup="dialog" title="Notificaciones"
        onClick={() => {
          if (!isOpen) refreshNotifications({ force: true });
          setIsOpen((previous) => !previous);
        }}>
        <Bell size={21} strokeWidth={1.8} aria-hidden="true" />
        {unreadCount > 0 && <span className="admin-header__notification-indicator" aria-hidden="true" />}
      </button>
      {isOpen && <NotificationPanel onClose={closePanel} />}
    </>
  );
}

export default NotificationCenter;
