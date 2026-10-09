
import { Link, useLocation } from "react-router-dom";

import {
  ArrowRight,
  History,
  ShieldCheck,
} from "lucide-react";

import "../../../styles/components/administration/activity/ActivityHistoryShortcut.css";

// =========================================================
// ACCESO DIRECTO AL HISTORIAL
// =========================================================

function ActivityHistoryShortcut() {
  const location = useLocation();

  const isSuperAdmin =
    location.pathname === "/super-admin" ||
    location.pathname.startsWith("/super-admin/");

  const historyPath = isSuperAdmin
    ? "/super-admin/historial"
    : "/admin/historial";

  return (
    <section className="activity-shortcut">

      <div className="activity-shortcut__information">
        <div className="activity-shortcut__icon">
          <History
            size={25}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </div>

        <div>
          <span className="activity-shortcut__eyebrow">
            AUDITORÍA DEL SISTEMA
          </span>

          <h2>Historial de actividad</h2>

          <p>
            Consulta quién realizó modificaciones,
            la cuenta administrativa utilizada,
            la fecha, la hora y los cambios efectuados.
          </p>

          <span className="activity-shortcut__readonly">
            <ShieldCheck
              size={15}
              aria-hidden="true"
            />

            Consulta de solo lectura
          </span>
        </div>
      </div>

      <Link
        to={historyPath}
        className="activity-shortcut__link"
      >
        Ver historial

        <ArrowRight
          size={18}
          aria-hidden="true"
        />
      </Link>

    </section>
  );
}

export default ActivityHistoryShortcut;
