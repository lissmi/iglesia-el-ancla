// =========================================================
// TABLA DEL HISTORIAL GLOBAL - IGLESIA EL ANCLA
// Archivo: frontend/src/components/administration/activity/ActivityTable.jsx
// =========================================================

// Mantenemos los iconos del diseño anterior y diferenciamos eliminaciones.
import { ClipboardList, History, Trash2 } from "lucide-react";

// Reutilizamos el CSS de la tabla que ya tiene el proyecto.
import "../../../styles/components/administration/activity/ActivityTable.css";

// Mostramos todos los instantes en la zona horaria de Chile continental.
const DATE_FORMATTER = new Intl.DateTimeFormat("es-CL", {
  timeZone: "America/Santiago",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

// El horario contempla los cambios estacionales de Chile.
const TIME_FORMATTER = new Intl.DateTimeFormat("es-CL", {
  timeZone: "America/Santiago",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================
function ActivityTable({ activities, total = activities.length }) {
  return (
    <section className="activity-table">
      {/* Encabezado con los mismos estilos originales. */}
      <div className="activity-table__header">
        <div>
          <h2>Registro de actividad</h2>
          <p>Actividad ordenada desde la acción más reciente.</p>
        </div>

        <div className="activity-table__count">
          <History size={16} aria-hidden="true" />
          {total} registros
        </div>
      </div>

      {/* Conservamos las cinco columnas originales. */}
      {activities.length > 0 ? (
        <div className="activity-table__scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">Administrador</th>
                <th scope="col">Correo electrónico</th>
                <th scope="col">Fecha</th>
                <th scope="col">Hora</th>
                <th scope="col">Actividad realizada</th>
              </tr>
            </thead>

            <tbody>
              {activities.map((activity) => {
                // Convertimos el timestamp UTC a una fecha válida de JavaScript.
                const timestamp = new Date(activity.createdAt);

                // Las eliminaciones se identifican con un icono diferente.
                const isDeletion = activity.action === "deleted";

                return (
                  <tr key={activity.id}>
                    <td>
                      <strong>{activity.actorName}</strong>
                    </td>

                    <td>
                      <span className="activity-table__email">
                        {activity.actorEmail}
                      </span>
                    </td>

                    <td>{DATE_FORMATTER.format(timestamp)}</td>

                    <td>
                      <span className="activity-table__time">
                        {TIME_FORMATTER.format(timestamp)}
                      </span>
                    </td>

                    <td>
                      <div className="activity-table__change">
                        {isDeletion ? (
                          <Trash2 size={17} aria-hidden="true" />
                        ) : (
                          <ClipboardList size={17} aria-hidden="true" />
                        )}

                        <span>{activity.description}</span>
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
          <History size={34} strokeWidth={1.5} aria-hidden="true" />
          <h3>No se encontraron registros</h3>
          <p>No existen actividades que coincidan con los filtros seleccionados.</p>
        </div>
      )}
    </section>
  );
}

// Exportamos el componente utilizado por ActivityHistory.jsx.
export default ActivityTable;
