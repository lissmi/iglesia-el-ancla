
import {
  Search,
  Filter,
  RotateCcw,
} from "lucide-react";

import "../../../styles/components/super-admin/administrators/AdministratorsFilters.css";

function AdministratorsFilters({
  search,
  role,
  status,
  onSearchChange,
  onRoleChange,
  onStatusChange,
  onClear,
}) {

  const hasFilters =
    search.trim() !== "" ||
    role !== "all" ||
    status !== "all";

  return (
    <div className="administrators-filters">

      <div className="administrators-filters__search">
        <Search size={17} aria-hidden="true" />

        <input
          type="search"
          value={search}
          onChange={(event) =>
            onSearchChange(event.target.value)
          }
          placeholder="Buscar por nombre, correo o sucursal..."
          aria-label="Buscar administradores"
        />
      </div>

      <div className="administrators-filters__select">
        <Filter size={16} aria-hidden="true" />

        <select
          value={role}
          onChange={(event) =>
            onRoleChange(event.target.value)
          }
          aria-label="Filtrar por rol"
        >
          <option value="all">Todos los roles</option>
          <option value="admin">Administradores</option>
          <option value="super_admin">Superadministradores</option>
        </select>
      </div>

      <div className="administrators-filters__select">
        <select
          value={status}
          onChange={(event) =>
            onStatusChange(event.target.value)
          }
          aria-label="Filtrar por estado"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Desactivados</option>
        </select>
      </div>

      <button
        type="button"
        className="administrators-filters__clear"
        onClick={onClear}
        disabled={!hasFilters}
      >
        <RotateCcw size={15} aria-hidden="true" />
        Limpiar
      </button>

    </div>
  );
}

export default AdministratorsFilters;
