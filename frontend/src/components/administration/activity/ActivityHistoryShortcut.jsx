// =========================================================
// ACCESO AL HISTORIAL DE ACTIVIDAD - IGLESIA EL ANCLA
// Archivo: frontend/src/components/administration/activity/ActivityHistoryShortcut.jsx
// =========================================================

// Conservamos las rutas originales del panel administrativo.
import { Link, useLocation } from "react-router-dom";

// Reutilizamos la iconografía de la tarjeta original.
import { ArrowRight, History, ShieldCheck } from "lucide-react";

// No se modifican las reglas visuales de la tarjeta.
import "../../../styles/components/administration/activity/ActivityHistoryShortcut.css";

// =========================================================
// ACCESO RÁPIDO AL HISTORIAL
// =========================================================
function ActivityHistoryShortcut() {
  // Averiguamos qué panel administrativo se está utilizando.
  const location = useLocation();

  // Distinguimos las rutas de superadministración de las de administración.
  const isSuperAdmin =
    location.pathname === "/super-admin" ||
    location.pathname.startsWith("/super-admin/");

  // Conservamos los enlaces existentes sin modificar React Router.
  const historyPath = isSuperAdmin
    ? "/super-admin/historial"
    : "/admin/historial";

  return (
    <section className="activity-shortcut">
      {/* Restablecemos el contenido original de la tarjeta. */}
      <div className="activity-shortcut__information">
        <div className="activity-shortcut__icon">
          <History size={25} strokeWidth={1.8} aria-hidden="true" />
        </div>

        <div>
          <span className="activity-shortcut__eyebrow">
            AUDITORÍA DEL SISTEMA
          </span>

          <h2>Historial de actividad</h2>

          <p>
            Consulta quién creó, modificó por última vez o eliminó contenido,
            la cuenta administrativa utilizada y la fecha y hora de la acción.
          </p>

          <span className="activity-shortcut__readonly">
            <ShieldCheck size={15} aria-hidden="true" />
            Consulta de solo lectura
          </span>
        </div>
      </div>

      {/* Enlace existente para abrir la página del historial global. */}
      <Link to={historyPath} className="activity-shortcut__link">
        Ver historial
        <ArrowRight size={18} aria-hidden="true" />
      </Link>
    </section>
  );
}

// Exportamos el acceso rápido para ambos paneles de administración.
export default ActivityHistoryShortcut;
