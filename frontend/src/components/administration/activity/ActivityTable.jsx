
import {
  ClipboardList,
  History,
} from "lucide-react";

import "../../../styles/components/administration/activity/ActivityTable.css";

// =========================================================
// FORMATO DE FECHA Y HORA
// =========================================================

// El backend deberá entregar un timestamp real.
// Se muestra en horario de Chile continental.

const DATE_FORMATTER = new Intl.DateTimeFormat(
  "es-CL",
  {
    timeZone: "America/Santiago",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }
);

const TIME_FORMATTER = new Intl.DateTimeFormat(
  "es-CL",
  {
    timeZone: "America/Santiago",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }
);

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function ActivityTable({ activities }) {
  return (
    <section className="activity-table">

      {/* ============================================= */}
      {/* ENCABEZADO */}
      {/* ============================================= */}

      <div className="activity-table__header">
        <div>
          <h2>Registro de modificaciones</h2>

          <p>
            Historial ordenado desde la
            modificación más reciente.
          </p>
        </div>

        <div className="activity-table__count">
          <History
            size={16}
            aria-hidden="true"
          />

          {activities.length} registros
        </div>
      </div>

      {/* ============================================= */}
      {/* TABLA */}
      {/* ============================================= */}

      {activities.length > 0 ? (
        <div className="activity-table__scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">Administrador</th>
                <th scope="col">Correo electrónico</th>
                <th scope="col">Fecha</th>
                <th scope="col">Hora</th>
                <th scope="col">Modificación realizada</th>
              </tr>
            </thead>

            <tbody>
              {activities.map((activity) => {
                const timestamp =
                  new Date(activity.createdAt);

                return (
                  <tr key={activity.id}>
                    <td>
                      <strong>
                        {activity.actorName}
                      </strong>
                    </td>

                    <td>
                      <span className="activity-table__email">
                        {activity.actorEmail}
                      </span>
                    </td>

                    <td>
                      {DATE_FORMATTER.format(timestamp)}
                    </td>

                    <td>
                      <span className="activity-table__time">
                        {TIME_FORMATTER.format(timestamp)}
                      </span>
                    </td>

                    <td>
                      <div className="activity-table__change">
                        <ClipboardList
                          size={17}
                          aria-hidden="true"
                        />

                        <span>
                          {activity.description}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="activity-table__empty">
          <History
            size={34}
            strokeWidth={1.5}
            aria-hidden="true"
          />

          <h3>No se encontraron registros</h3>

          <p>
            No existen modificaciones que
            coincidan con los filtros seleccionados.
          </p>
        </div>
      )}

    </section>
  );
}

export default ActivityTable;
