
import { useMemo, useState } from "react";

import {
  Check,
  Search,
  X,
} from "lucide-react";

import {
  PERMISSION_CATEGORIES,
  SYSTEM_PERMISSIONS,
  SYSTEM_ROLES,
} from "../../../data/admin/rolesPermissions";

import "../../../styles/components/super-admin/roles/PermissionsMatrix.css";

function PermissionsMatrix({ selectedRole }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todas");

  // =========================================================
  // FILTRADO DE PERMISOS
  // =========================================================

  const filteredPermissions = useMemo(() => {
    const normalizedSearch =
      search.trim().toLocaleLowerCase("es");

    return SYSTEM_PERMISSIONS.filter((permission) => {
      const matchesCategory =
        category === "Todas" ||
        permission.category === category;

      const searchableText = [
        permission.name,
        permission.description,
        permission.category,
      ]
        .join(" ")
        .toLocaleLowerCase("es");

      const matchesSearch =
        searchableText.includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  // =========================================================
  // AGRUPACIÓN POR CATEGORÍA
  // =========================================================

  const groupedPermissions = useMemo(() => {
    return filteredPermissions.reduce(
      (groups, permission) => {
        if (!groups[permission.category]) {
          groups[permission.category] = [];
        }

        groups[permission.category].push(permission);

        return groups;
      },
      {}
    );
  }, [filteredPermissions]);

  return (
    <section className="permissions-matrix">
      <div className="permissions-matrix__heading">
        <div>
          <h2>Matriz de permisos</h2>

          <p>
            Consulta los accesos propuestos para
            cada rol y módulo del sistema.
          </p>
        </div>

        <span className="permissions-matrix__counter">
          {filteredPermissions.length} permisos
        </span>
      </div>

      {/* ================================================= */}
      {/* FILTROS */}
      {/* ================================================= */}

      <div className="permissions-matrix__filters">
        <label className="permissions-matrix__search">
          <Search
            size={18}
            aria-hidden="true"
          />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Buscar un permiso..."
            aria-label="Buscar permisos"
          />
        </label>

        <select
          className="permissions-matrix__select"
          value={category}
          onChange={(event) =>
            setCategory(event.target.value)
          }
          aria-label="Filtrar por categoría"
        >
          {PERMISSION_CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {/* ================================================= */}
      {/* TABLA DE PERMISOS */}
      {/* ================================================= */}

      <div className="permissions-matrix__table-wrapper">
        <table className="permissions-matrix__table">
          <thead>
            <tr>
              <th scope="col">
                Módulo / Permiso
              </th>

              {SYSTEM_ROLES.map((role) => (
                <th
                  scope="col"
                  key={role.id}
                  className={
                    selectedRole === role.id
                      ? "permissions-matrix__selected"
                      : ""
                  }
                >
                  {role.name}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {Object.entries(groupedPermissions).map(
              ([groupName, permissions]) => (
                <FragmentRows
                  key={groupName}
                  groupName={groupName}
                  permissions={permissions}
                  selectedRole={selectedRole}
                />
              )
            )}

            {filteredPermissions.length === 0 && (
              <tr>
                <td
                  colSpan={SYSTEM_ROLES.length + 1}
                  className="permissions-matrix__empty"
                >
                  No se encontraron permisos con
                  los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="permissions-matrix__note">
        Esta matriz es una propuesta funcional.
        No modifica ni representa una verificación
        de los permisos efectivos del servidor.
      </p>
    </section>
  );
}

// =========================================================
// FILAS AGRUPADAS POR CATEGORÍA
// =========================================================

function FragmentRows({
  groupName,
  permissions,
  selectedRole,
}) {
  return (
    <>
      <tr className="permissions-matrix__group">
        <th
          scope="rowgroup"
          colSpan={SYSTEM_ROLES.length + 1}
        >
          {groupName}
        </th>
      </tr>

      {permissions.map((permission) => (
        <tr key={permission.id}>
          <td>
            <strong>{permission.name}</strong>

            <span>{permission.description}</span>
          </td>

          {SYSTEM_ROLES.map((role) => {
            const isAllowed =
              permission.roles[role.id] === true;

            return (
              <td
                key={role.id}
                className={
                  selectedRole === role.id
                    ? "permissions-matrix__selected"
                    : ""
                }
              >
                <span
                  className={[
                    "permissions-matrix__status",
                    isAllowed
                      ? "permissions-matrix__status--allowed"
                      : "permissions-matrix__status--denied",
                  ].join(" ")}
                  aria-label={
                    isAllowed
                      ? "Permiso propuesto"
                      : "Permiso no contemplado"
                  }
                  title={
                    isAllowed
                      ? "Permiso propuesto"
                      : "Permiso no contemplado"
                  }
                >
                  {isAllowed ? (
                    <Check size={16} aria-hidden="true" />
                  ) : (
                    <X size={16} aria-hidden="true" />
                  )}
                </span>
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
}

export default PermissionsMatrix;
