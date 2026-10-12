
import { useMemo, useState } from "react";
import { X, UsersRound, Search } from "lucide-react";

import "../../../styles/components/administration/events/EventConfirmationsModal.css";

// =========================================================
// DATOS FICTICIOS DE DEMOSTRACIÓN
// =========================================================

// Cada registro pertenece a un evento y representa
// la respuesta de un miembro a su invitación.

const DEMO_CONFIRMATIONS = [
  {
    id: "CONF-001",
    eventId: "EVT-004",
    memberName: "María González",
    status: "confirmed",
  },
  {
    id: "CONF-002",
    eventId: "EVT-004",
    memberName: "Daniel Pérez",
    status: "pending",
  },
  {
    id: "CONF-003",
    eventId: "EVT-004",
    memberName: "Camila Torres",
    status: "cancelled",
  },
];

function EventConfirmationsModal({
  isOpen,
  event,
  onClose,
}) {
  const [search, setSearch] = useState("");

  // Las confirmaciones se filtran por el ID del evento.
  const confirmations = useMemo(() => {
    if (!event) return [];

    return DEMO_CONFIRMATIONS.filter(
      (confirmation) => confirmation.eventId === event.id
    );
  }, [event]);

  const summary = useMemo(() => {
    return {
      confirmed: confirmations.filter(
        (item) => item.status === "confirmed"
      ).length,

      pending: confirmations.filter(
        (item) => item.status === "pending"
      ).length,

      cancelled: confirmations.filter(
        (item) => item.status === "cancelled"
      ).length,
    };
  }, [confirmations]);

  const filteredConfirmations = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("es-CL");

    return confirmations.filter((item) =>
      item.memberName.toLocaleLowerCase("es-CL").includes(query)
    );
  }, [confirmations, search]);

  if (!isOpen || !event) return null;

  // El formulario puede definir la capacidad con
  // distintos nombres. En esta integración usamos
  // "capacity"; si no existe, no inventamos cupos.
  const capacity =
    Number.isInteger(Number(event.capacity)) &&
    Number(event.capacity) > 0
      ? Number(event.capacity)
      : null;

  const available =
    capacity === null
      ? null
      : Math.max(capacity - summary.confirmed, 0);

  const percentage =
    capacity === null
      ? 0
      : Math.min((summary.confirmed / capacity) * 100, 100);

  function getStatusLabel(status) {
    if (status === "confirmed") return "Confirmada";
    if (status === "pending") return "Pendiente";
    return "Cancelada";
  }

  return (
    <div
      className="event-confirmations__overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        className="event-confirmations"
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-confirmations-title"
      >
        <header className="event-confirmations__header">
          <div>
            <span className="event-confirmations__eyebrow">
              GESTIÓN DE ASISTENCIA
            </span>

            <h2 id="event-confirmations-title">
              Confirmaciones
            </h2>

            <p>{event.title}</p>
          </div>

          <button
            type="button"
            className="event-confirmations__close"
            onClick={onClose}
            aria-label="Cerrar confirmaciones"
          >
            <X size={20} />
          </button>
        </header>

        <div className="event-confirmations__content">
          <div className="event-confirmations__summary">
            <article>
              <span>Confirmados</span>
              <strong>{summary.confirmed}</strong>
            </article>

            <article>
              <span>Pendientes</span>
              <strong>{summary.pending}</strong>
            </article>

            <article>
              <span>Cancelados</span>
              <strong>{summary.cancelled}</strong>
            </article>
          </div>

          <div className="event-confirmations__capacity">
            <div className="event-confirmations__capacity-header">
              <strong>Capacidad del evento</strong>

              <span>
                {capacity === null
                  ? "Sin límite definido"
                  : `${summary.confirmed} / ${capacity}`}
              </span>
            </div>

            {capacity !== null && (
              <>
                <progress
                  value={summary.confirmed}
                  max={capacity}
                  aria-label="Ocupación del evento"
                />

                <small>
                  {available} cupos disponibles ·{" "}
                  {Math.round(percentage)}% ocupado
                </small>
              </>
            )}
          </div>

          <div className="event-confirmations__list-header">
            <h3>
              <UsersRound size={19} />
              Participantes
            </h3>

            <span>{confirmations.length} registros</span>
          </div>

          <div className="event-confirmations__search">
            <Search size={18} aria-hidden="true" />

            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar participante..."
              aria-label="Buscar participante"
            />
          </div>

          {filteredConfirmations.length > 0 ? (
            <div className="event-confirmations__table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Participante</th>
                    <th>Estado</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredConfirmations.map((item) => (
                    <tr key={item.id}>
                      <td>{item.memberName}</td>

                      <td>
                        <span
                          className={`event-confirmations__status event-confirmations__status--${item.status}`}
                        >
                          {getStatusLabel(item.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="event-confirmations__empty">
              {confirmations.length === 0
                ? "Este evento no tiene confirmaciones de demostración."
                : "No se encontraron participantes."}
            </div>
          )}

          <p className="event-confirmations__notice">
            Datos de demostración. Las confirmaciones
            todavía no están conectadas a MongoDB.
          </p>
        </div>
      </section>
    </div>
  );
}

export default EventConfirmationsModal;
