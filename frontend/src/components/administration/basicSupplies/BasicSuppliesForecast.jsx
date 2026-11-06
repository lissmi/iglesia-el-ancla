// =========================================================
// MOVIMIENTOS RECIENTES DE INSUMOS BÁSICOS
// Solo se muestran registros guardados en MongoDB.
// =========================================================
import { Clock3, Package, ArrowUpRight, ArrowDownRight } from "lucide-react";
import "../../../styles/components/administration/basicSupplies/BasicSuppliesForecast.css";

// Fecha y hora comprensibles según la zona horaria de Chile.
function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha no disponible";
  return new Intl.DateTimeFormat("es-CL", {
    timeZone: "America/Santiago", day: "2-digit", month: "short",
    year: "numeric", hour: "2-digit", minute: "2-digit",
  }).format(date);
}

function BasicSuppliesForecast({ movementHistory = [] }) {
  return (
    <section className="basic-supplies__panel" aria-labelledby="basic-supply-movements-title">
      <div className="basic-supplies__panel-header">
        <div>
          <h2 id="basic-supply-movements-title">Movimientos recientes</h2>
          <p>Revisa las últimas entradas, consumos y colaboraciones recibidas por la iglesia.</p>
        </div>
        <span className="basic-supplies__count">{movementHistory.length} movimientos</span>
      </div>
      {movementHistory.length === 0 ? (
        <div className="basic-supplies__empty">
          <Clock3 size={30} aria-hidden="true" />
          <strong>Aún no hay movimientos registrados</strong>
          <p>Cuando se registren entradas o consumos, podrás revisarlos aquí.</p>
        </div>
      ) : (
        <div className="basic-supplies__history">
          <h3>Últimos movimientos del inventario</h3>
          {movementHistory.map((movement) => {
            const isOutput = movement.type === "expense";
            const ActionIcon = isOutput ? ArrowDownRight : ArrowUpRight;
            const action = movement.type === "delivered" ? "Colaboración recibida" : isOutput ? "Consumo" : "Entrada";
            return (
              <div key={movement.id} className="basic-supplies__history-item">
                <div>
                  <strong><Package size={14} aria-hidden="true" /> {movement.supplyName} · {action}</strong>
                  <span>{formatDate(movement.date)}</span>
                </div>
                <span><ActionIcon size={15} aria-hidden="true" /> {isOutput ? "−" : "+"}{movement.quantity} unidades</span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
export default BasicSuppliesForecast;
