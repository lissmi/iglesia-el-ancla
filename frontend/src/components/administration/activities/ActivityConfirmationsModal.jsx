// =========================================================
// CONFIRMACIONES ADMINISTRATIVAS - IGLESIA EL ANCLA
// Consulta participantes reales desde MongoDB.
// =========================================================

// Importamos hooks para sincronizar los datos con el modal.
import { useEffect, useMemo, useState } from "react";

// Reutilizamos la iconografía y el CSS ya existente.
import { X, UsersRound, Search, FileDown, FileSpreadsheet, Gift } from "lucide-react";
import "../../../styles/components/administration/activities/ActivityConfirmationsModal.css";

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
  const [cooperationSummary, setCooperationSummary] = useState([]);
  const [exporting, setExporting] = useState("");

  // Consultamos únicamente al abrir el modal y cambiar de evento.
  useEffect(() => {
    if (!isOpen || !activity?.id) return undefined;
    const controller = new AbortController();
    setSearch("");
    setConfirmations([]);
    setTotal(0);
    setCooperationSummary([]);
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
      setCooperationSummary(response.data.cooperationSummary || []);
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

  // Filtramos por nombre, correo o fecha del evento.
  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("es-CL");
    return confirmations.filter((item) =>
      `${item.memberName} ${item.memberEmail} ${item.occurrenceDate}`
        .toLocaleLowerCase("es-CL").includes(query)
    );
  }, [confirmations, search]);

  // Descargamos un reporte real del backend; los nombres son solo para administradores.
  async function exportReport(format) {
    if (!activity?.id || exporting) return;
    setExporting(format);
    setError("");
    try {
      const response = await api.get(`/activities/${encodeURIComponent(activity.id)}/attendance/report`, {
        params: { format }, responseType: "blob", timeout: 60000,
      });
      // Blob permite conservar el formato PDF o Excel sin codificarlo como texto.
      const file = new Blob([response.data], {
        type: format === "pdf" ? "application/pdf" :
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = `actividad_${activity.date || "reporte"}.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (requestError) {
      setError("No se pudo generar el reporte. Comprueba la conexión e intenta nuevamente.");
    } finally { setExporting(""); }
  }

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


          {/* ===================================================== */}
          {/* RESUMEN DE COOPERACIONES */}
          {/* ===================================================== */}

          {Boolean(activity.cooperation?.enabled) && (

            <section className="event-confirmations__cooperation">

              {/* Encabezado de cooperación. */}
              <div className="event-confirmations__cooperation-heading">

                <div className="event-confirmations__cooperation-title">
                  <Gift size={20} aria-hidden="true" />
                  <h3>Aportes para la actividad</h3>
                </div>

                <p>
                  Consulta los aportes comprometidos y las
                  cantidades que todavía se necesitan.
                </p>

              </div>

              {/* Tarjetas con los aportes configurados. */}
              <div className="event-confirmations__contribution-summary">

                {cooperationSummary.map((item) => {

                  // Cantidad máxima solicitada por la iglesia.
                  const maximum = Number(item.maxQuantity) || 0;

                  // Cantidad comprometida por los participantes.
                  const reserved = Number(item.reserved) || 0;

                  // Cantidad disponible para nuevos aportes.
                  const remaining = Math.max(0, maximum - reserved);

                  // Porcentaje utilizado para mostrar el progreso.
                  const percentage = maximum > 0
                    ? Math.min(100, (reserved / maximum) * 100)
                    : 0;

                  // Comprobamos si ya se completó el aporte.
                  const isComplete = maximum > 0 && remaining === 0;

                  return (

                    <article
                      className={
                        "event-confirmations__contribution-card " +
                        (isComplete
                          ? "event-confirmations__contribution-card--complete"
                          : "")
                      }
                      key={item.id}
                    >

                      {/* Nombre del aporte y su situación. */}
                      <div className="event-confirmations__contribution-top">

                        <strong>{item.name}</strong>

                        <span
                          className="event-confirmations__contribution-status"
                        >
                          {isComplete ? "Completo" : "Disponible"}
                        </span>

                      </div>

                      {/* Cantidades comprometidas. */}
                      <div className="event-confirmations__contribution-count">

                        <strong>{reserved}</strong>

                        <span>de {maximum} unidades</span>

                      </div>

                      {/* Barra de avance del aporte. */}
                      <div
                        className="event-confirmations__contribution-progress"
                        role="progressbar"
                        aria-label={`Progreso de ${item.name}`}
                        aria-valuenow={reserved}
                        aria-valuemin={0}
                        aria-valuemax={maximum}
                      >
                        <span style={{ width: `${percentage}%` }} />
                      </div>

                      {/* Cantidades que todavía se necesitan. */}
                      <small>
                        {isComplete
                          ? "Ya se completó este aporte."
                          : `${remaining} unidades disponibles`}
                      </small>

                    </article>
                  );
                })}

              </div>

            </section>
          )}



          {/* ===================================================== */}
          {/* DESCARGAR REPORTES */}
          {/* ===================================================== */}

          <div className="event-confirmations__exports">

            {/* Información de la descarga. */}
            <div className="event-confirmations__exports-info">

              <strong>Descargar reporte de la actividad</strong>

              <p>
                Incluye participantes, confirmaciones
                y aportes comprometidos.
              </p>

            </div>

            {/* Botones de descarga. */}
            <div className="event-confirmations__exports-actions">

              <button
                type="button"
                className="event-confirmations__export-pdf"
                onClick={() => exportReport("pdf")}
                disabled={Boolean(exporting) || loading}
              >
                <FileDown size={17} aria-hidden="true" />

                {exporting === "pdf"
                  ? "Generando..."
                  : "Descargar PDF"}
              </button>

              <button
                type="button"
                className="event-confirmations__export-excel"
                onClick={() => exportReport("xlsx")}
                disabled={Boolean(exporting) || loading}
              >
                <FileSpreadsheet size={17} aria-hidden="true" />

                {exporting === "xlsx"
                  ? "Generando..."
                  : "Descargar Excel"}
              </button>

            </div>

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

                <thead>
                  <tr>
                    <th>Participante</th>
                    <th>Fecha</th>
                    <th>Estado</th>

                    {/* Solo mostramos la columna si se solicita cooperación. */}
                    {activity.cooperation?.enabled && (
                      <th>¿Qué llevará?</th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.memberName}</strong>
                        {item.memberEmail && <small style={{ display: "block" }}>{item.memberEmail}</small>}
                      </td>
                      <td>{formatDate(item.occurrenceDate)}</td>

                      {/* ===================================================== */}
                      {/* ESTADO DE LA CONFIRMACIÓN */}
                      {/* ===================================================== */}

                      <td>
                        <span
                          className={
                            "event-confirmations__status " +
                            "event-confirmations__status--confirmed"
                          }
                        >
                          Confirmada
                        </span>
                      </td>

                      {/* ===================================================== */}
                      {/* COOPERACIÓN DEL PARTICIPANTE */}
                      {/* ===================================================== */}

                      {Boolean(activity.cooperation?.enabled) && (

                        <td>

                          {item.contributions?.length > 0 ? (

                            <div className="event-confirmations__contributions-detail">

                              {item.contributions.map((entry, index) => (

                                <span
                                  className="event-confirmations__contribution-tag"
                                  key={`${entry.id || entry.name}-${index}`}
                                >
                                  <Gift size={13} aria-hidden="true" />

                                  {entry.name}

                                  <strong>× {entry.quantity}</strong>
                                </span>

                              ))}

                            </div>

                          ) : (

                            <span className="event-confirmations__no-contribution">
                              Sin aporte asignado
                            </span>

                          )}

                        </td>

                      )}

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

// Exportamos el modal para su uso en Gestión de eventos.
export default ActivityConfirmationsModal;
