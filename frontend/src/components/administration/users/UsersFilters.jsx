
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";


// =========================================================
// ESTILOS DEL COMPONENTE
// =========================================================

import "../../../styles/components/administration/users/UsersFilters.css";


// =========================================================
// OPCIONES DE FILTRADO
// =========================================================

// Los valores de los roles corresponden
// a los roles definidos en nuestro sistema.

const roleOptions = [
  {
    value: "all",
    label: "Todos los roles",
  },
  {
    value: "member",
    label: "Miembro",
  },
  {
    value: "admin",
    label: "Administrador",
  },
  {
    value: "super_admin",
    label: "Superadministrador",
  },
];


// Estos estados representan la disponibilidad
// de acceso de las cuentas.
//
// Cuando conectemos el backend, verificaremos
// su correspondencia con el modelo de Usuario.

const statusOptions = [
  {
    value: "all",
    label: "Todos los estados",
  },
  {
    value: "active",
    label: "Activo",
  },
  {
    value: "blocked",
    label: "Bloqueado",
  },
];


// =========================================================
// COMPONENTE USERS FILTERS
// =========================================================

// Este componente recibe:
//
// search: texto ingresado en el buscador.
// role: rol seleccionado.
// status: estado seleccionado.
//
// onSearchChange: actualiza la búsqueda.
// onRoleChange: actualiza el rol.
// onStatusChange: actualiza el estado.
// onClear: restablece todos los filtros.
//
// Los valores se administran desde
// UsersManagement.jsx.

function UsersFilters({
  search = "",
  role = "all",
  status = "all",
  onSearchChange,
  onRoleChange,
  onStatusChange,
  onClear,
}) {

  // =========================================================
  // IDENTIFICAR FILTROS ACTIVOS
  // =========================================================

  const hasActiveFilters =
    search.trim() !== "" ||
    role !== "all" ||
    status !== "all";


  // =========================================================
  // INTERFAZ
  // =========================================================

  return (

    <div className="users-filters">


      {/* ================================================= */}
      {/* ENCABEZADO DE FILTROS */}
      {/* ================================================= */}

      <div className="users-filters__header">

        <div className="users-filters__heading">

          <SlidersHorizontal
            size={17}
            strokeWidth={1.9}
            aria-hidden="true"
          />

          <span>
            Buscar y filtrar
          </span>

        </div>


        {/* Botón para restablecer los filtros. */}
        <button
          className="users-filters__clear"
          type="button"
          onClick={onClear}
          disabled={!hasActiveFilters}
        >

          <RotateCcw
            size={14}
            strokeWidth={2}
            aria-hidden="true"
          />

          <span>
            Limpiar filtros
          </span>

        </button>

      </div>


      {/* ================================================= */}
      {/* CONTROLES DE FILTRADO */}
      {/* ================================================= */}

      <div className="users-filters__grid">


        {/* ============================================= */}
        {/* BUSCADOR */}
        {/* ============================================= */}

        <div className="users-filters__field users-filters__field--search">

          <label htmlFor="users-search">
            Buscar usuario
          </label>

          <div className="users-filters__search">

            <Search
              size={18}
              strokeWidth={1.9}
              aria-hidden="true"
            />

            <input
              id="users-search"
              type="search"
              value={search}
              onChange={(event) => {
                onSearchChange?.(event.target.value);
              }}
              placeholder="Nombre o correo electrónico..."
              autoComplete="off"
            />

          </div>

        </div>


        {/* ============================================= */}
        {/* FILTRO POR ROL */}
        {/* ============================================= */}

        <div className="users-filters__field">

          <label htmlFor="users-role">
            Rol
          </label>

          <select
            id="users-role"
            value={role}
            onChange={(event) => {
              onRoleChange?.(event.target.value);
            }}
          >

            {roleOptions.map((option) => (

              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>

            ))}

          </select>

        </div>


        {/* ============================================= */}
        {/* FILTRO POR ESTADO */}
        {/* ============================================= */}

        <div className="users-filters__field">

          <label htmlFor="users-status">
            Estado
          </label>

          <select
            id="users-status"
            value={status}
            onChange={(event) => {
              onStatusChange?.(event.target.value);
            }}
          >

            {statusOptions.map((option) => (

              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>

            ))}

          </select>

        </div>

      </div>

    </div>
  );
}


// =========================================================
// EXPORTACIÓN
// =========================================================

export default UsersFilters;
