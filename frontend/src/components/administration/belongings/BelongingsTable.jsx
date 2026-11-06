// =========================================================
// TABLA DEL INVENTARIO: SIN COLUMNA DE UBICACIÓN
// =========================================================
import { ArrowUpDown, Eye, Package, Pencil, Trash2 } from "lucide-react";
import "../../../styles/components/administration/belongings/BelongingsTable.css";

function BelongingsTable({ belongings = [], categories = [], conditions = [], sortBy = "name", sortDirection = "asc", onSort, onView, onEdit, onDelete }) {
  const categoryName = (id) => categories.find((x) => x.id === id)?.name || "Sin categoría";
  const conditionName = (id) => conditions.find((x) => x.value === id)?.label || "Sin estado";
  const sortButton = (field, label) => (
    <button type="button" className={`belongings-table__sort ${sortBy === field ? "belongings-table__sort--active" : ""}`}
      onClick={() => onSort?.(field)} aria-label={`Ordenar por ${label}`}>
      <span>{label}</span><ArrowUpDown size={14} aria-hidden="true" />
      {sortBy === field && <span className="belongings-table__sort-direction">{sortDirection === "asc" ? "↑" : "↓"}</span>}
    </button>
  );
  return (
    <div className="belongings-table">
      <div className="belongings-table__scroll">
        <table>
          <thead><tr>
            <th scope="col">{sortButton("name", "Bien")}</th>
            <th scope="col">Categoría</th>
            <th scope="col">{sortButton("quantity", "Cantidad")}</th>
            <th scope="col">Estado</th>
            <th scope="col">Acciones</th>
          </tr></thead>
          <tbody>
            {belongings.map((belonging) => (
              <tr key={belonging.id}>
                <td><div className="belongings-table__item">
                  <div className="belongings-table__item-icon"><Package size={19} aria-hidden="true" /></div>
                  <div className="belongings-table__item-info"><strong>{belonging.name}</strong><span>{belonging.code}</span></div>
                </div></td>
                <td><span className="belongings-table__secondary">{categoryName(belonging.categoryId)}</span></td>
                <td><span className="belongings-table__quantity">{Number(belonging.quantity || 0).toLocaleString("es-CL")}</span></td>
                <td><span className={`belongings-table__condition belongings-table__condition--${String(belonging.condition || "").replaceAll("_", "-")}`}>
                  {conditionName(belonging.condition)}
                </span></td>
                <td><div className="belongings-table__actions">
                  <button type="button" className="belongings-table__action" onClick={() => onView?.(belonging)} disabled={!onView} aria-label={`Ver ${belonging.name}`} title="Ver detalles"><Eye size={17} /></button>
                  <button type="button" className="belongings-table__action" onClick={() => onEdit?.(belonging)} disabled={!onEdit} aria-label={`Editar ${belonging.name}`} title="Editar bien"><Pencil size={16} /></button>
                  <button type="button" className="belongings-table__action belongings-table__action--delete" onClick={() => onDelete?.(belonging)} disabled={!onDelete} aria-label={`Eliminar ${belonging.name}`} title="Eliminar bien"><Trash2 size={17} /></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default BelongingsTable;
