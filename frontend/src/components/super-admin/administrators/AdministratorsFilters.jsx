// Filtros del directorio de cuentas administrativas.
import { Search, Filter, RotateCcw, CircleCheck } from "lucide-react";
import AdministratorFilterSelect from "./AdministratorFilterSelect";
import "../../../styles/components/super-admin/administrators/AdministratorsFilters.css";
import "../../../styles/components/super-admin/administrators/AdministratorsFilterSelect.css";

// Las etiquetas describen el filtro con palabras sencillas.
const ROLE_OPTIONS = [
  { value: "all", label: "Todos los roles" },
  { value: "admin", label: "Administradores" },
  { value: "super_admin", label: "Superadministradores" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "Todos los estados" },
  { value: "active", label: "Activos" },
  { value: "inactive", label: "Desactivados" },
];

function AdministratorsFilters({
  search,
  role,
  status,
  onSearchChange,
  onRoleChange,
  onStatusChange,
  onClear,
}) {
  // Evitamos ofrecer limpiar cuando los filtros ya están en su estado inicial.
  const hasFilters = search.trim() !== "" || role !== "all" || status !== "all";

  return (
    <div className="administrators-filters administrators-filters--custom">
      <div className="administrators-filters__search admin-filters-search">
        <Search size={17} aria-hidden="true" />
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar por nombre, correo o sucursal..."
          aria-label="Buscar administradores"
        />
      </div>

      <AdministratorFilterSelect
        label="Filtrar por rol"
        value={role}
        options={ROLE_OPTIONS}
        onChange={onRoleChange}
        icon={Filter}
      />

      <AdministratorFilterSelect
        label="Filtrar por estado"
        value={status}
        options={STATUS_OPTIONS}
        onChange={onStatusChange}
        icon={CircleCheck}
      />

      <button
        type="button"
        className="administrators-filters__clear admin-filters-clear"
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
