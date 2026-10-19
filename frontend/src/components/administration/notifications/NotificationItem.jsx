// =========================================================
// FILA INDIVIDUAL DE NOTIFICACIÓN
// =========================================================
import { BellRing, Check, CircleAlert, CalendarDays, ReceiptText } from "lucide-react";
import "../../../styles/components/administration/notifications/NotificationItem.css";

const ICONS = { finance: ReceiptText, events: CalendarDays, alert: CircleAlert };

function NotificationItem({ notification, onRead, onOpen }) {
  const Icon = ICONS[notification.category] || BellRing;
  const displayDate = notification.dateLabel || (notification.createdAt && !Number.isNaN(new Date(notification.createdAt).getTime())
    ? new Intl.DateTimeFormat("es-CL", { dateStyle: "medium", timeStyle: "short" }).format(new Date(notification.createdAt))
    : "Fecha no disponible");

  return (
    <article className={`notification-item ${!notification.read ? "notification-item--unread" : ""}`}>
      <div className="notification-item__icon"><Icon size={18} aria-hidden="true" /></div>
      <div className="notification-item__content">
        <div className="notification-item__heading">
          <strong>{notification.title}</strong>
          {!notification.read && <span className="notification-item__dot" aria-label="No leída" />}
        </div>
        <p>{notification.message}</p>
        <small>{displayDate}</small>
        <div className="notification-item__actions">
          {!notification.read && (
            <button type="button" onClick={() => onRead(notification.id)}>
              <Check size={14} aria-hidden="true" /> Marcar como leída
            </button>
          )}
          {notification.path && (
            <button type="button" onClick={() => onOpen(notification)}>
              Ver información
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default NotificationItem;
