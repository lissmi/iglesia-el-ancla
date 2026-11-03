// =========================================================
// CONFIRMACIONES ADMINISTRATIVAS - IGLESIA EL ANCLA
// Consulta participantes reales desde MongoDB.
// =========================================================

// Importamos hooks para sincronizar los datos con el modal.
import { useEffect, useMemo, useState } from "react";

// Reutilizamos la iconografía y el CSS ya existente.
import { X, UsersRound, Search } from "lucide-react";
import "../../../styles/components/administration/events/EventConfirmationsModal.css";

// Importamos la instancia centralizada de Axios.
import api from "../../../services/api";

// Mostramos fechas en Chile sin alterar el día civil registrado.
function formatDate(date) {
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit", month: "short", year: "numeric", timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================
function ActivityConfirmationsModal({ isOpen, activity, onClose }) {
  // Buscador local de participantes obtenidos del servidor.
  const [search, setSearch] = useState("");

  // Registros reales, total y estados de carga.
  const [confirmations, setConfirmations] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Consultamos únicamente al abrir el modal y cambiar de actividad.
  useEffect(() => {
    if (!isOpen || !activity?.id) return undefined;
    const controller = new AbortController();
    setSearch("");
    setConfirmations([]);
    setTotal(0);
    setLoading(true);
    setError("");

    // El backend exige roles administrativos para devolver nombres y correos.
    api.get(`/activities/${activity.id}/attendance/confirmations`, {
      signal: controller.signal,
    }).then((response) => {
      if (controller.signal.aborted) return;
      if (!response.data?.success || !Array.isArray(response.data.confirmations)) {
        throw new Error("Formato de confirmaciones inválido");
      }
      setConfirmations(response.data.confirmations);
      setTotal(response.data.total || 0);
    }).catch((requestError) => {
      if (!controller.signal.aborted) {
        setError(requestError.response?.data?.message || requestError.message || "No se pudieron consultar los participantes");
      }
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });

    // Evitamos actualizar la interfaz si el administrador cierra el modal.
    return () => controller.abort();
  }, [isOpen, activity?.id]);

  // Filtramos por nombre, correo o fecha de la actividad.
  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("es-CL");
    return confirmations.filter((item) =>
      `${item.memberName} ${item.memberEmail} ${item.occurrenceDate}`
        .toLocaleLowerCase("es-CL").includes(query)
    );
  }, [confirmations, search]);

  const capacity = Number(activity?.capacity) > 0 ? Number(activity.capacity) : null;

  // Evitamos renderizar un modal invisible.
  if (!isOpen || !activity) return null;

  return (
    <div className="event-confirmations__overlay" onMouseDown={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <section className="event-confirmations" role="dialog" aria-modal="true" aria-labelledby="event-confirmations-title">
        {/* Encabezado y cierre mantienen el diseño original. */}
        <header className="event-confirmations__header">
          <div>
            <span className="event-confirmations__eyebrow">GESTIÓN DE ASISTENCIA</span>
            <h2 id="event-confirmations-title">Confirmaciones</h2>
            <p>{activity.title}</p>
          </div>
          <button type="button" className="event-confirmations__close" onClick={onClose} aria-label="Cerrar confirmaciones">
            <X size={20} />
          </button>
        </header>

        <div className="event-confirmations__content">
          {/* No inventamos inscripciones pendientes de personas no invitadas. */}
          <div className="event-confirmations__summary">
            <article><span>Confirmaciones registradas</span><strong>{total}</strong></article>
            <article><span>Participantes mostrados</span><strong>{confirmations.length}</strong></article>
          </div>

          <div className="event-confirmations__capacity">
            <div className="event-confirmations__capacity-header">
              <strong>Capacidad de la actividad</strong>
              <span>{capacity === null ? "Sin límite definido" : `${capacity} cupos`}</span>
            </div>
            <small>
              Las confirmaciones corresponden a la fecha de esta actividad.
            </small>
          </div>

          <div className="event-confirmations__list-header">
            <h3><UsersRound size={19} aria-hidden="true" />Participantes</h3>
            <span>{total} registros</span>
          </div>

          <div className="event-confirmations__search">
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar participante o fecha..."
              aria-label="Buscar participante"
            />
          </div>

          {/* Mostramos estado real de carga, error o confirmaciones. */}
          {loading ? (
            <div className="event-confirmations__empty" role="status">Consultando confirmaciones...</div>
          ) : error ? (
            <div className="event-confirmations__empty" role="alert">{error}</div>
          ) : filtered.length > 0 ? (
            <div className="event-confirmations__table-wrap">
              <table>
                <thead><tr><th>Participante</th><th>Fecha</th><th>Estado</th></tr></thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.memberName}</strong>
                        {item.memberEmail && <small style={{ display: "block" }}>{item.memberEmail}</small>}
                      </td>
                      <td>{formatDate(item.occurrenceDate)}</td>
                      <td><span className="event-confirmations__status event-confirmations__status--confirmed">Confirmada</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="event-confirmations__empty">
              {total === 0 ? "Aún no hay miembros confirmados." : "No se encontraron participantes con ese filtro."}
            </div>
          )}

          {/* Advertimos expresamente el límite de registros de la vista. */}
          {total > confirmations.length && (
            <p className="event-confirmations__notice">
              Se muestran las primeras {confirmations.length} confirmaciones de {total} registros.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

// Exportamos el modal para su uso en Gestión de actividades.
export default ActivityConfirmationsModal;
