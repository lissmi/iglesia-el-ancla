
import { useState } from "react";

import {
  Eye,
  LockKeyhole,
  ChevronLeft,
  ChevronRight,
  SearchX,
} from "lucide-react";

import "../../../styles/components/super-admin/administrators/AdministratorsTable.css";

const PAGE_SIZE = 6;


// =========================================================
// FUNCIONES AUXILIARES
// =========================================================

const formatDate = (value) => {

  if (!value) return "Sin registro";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Sin registro";
  }

  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
};


const getInitials = (user) => {

  return [user.firstName, user.lastName]
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};


// =========================================================
// TABLA
// =========================================================

function AdministratorsTable({
  administrators = [],
  onView,
}) {

  const [page, setPage] = useState(1);

  const totalPages = Math.max(
    1,
    Math.ceil(administrators.length / PAGE_SIZE)
  );

  // Si cambian los filtros, ajustamos la página
  // visible sin modificar el estado durante el render.
  const currentPage = Math.min(page, totalPages);

  const visibleAdministrators = administrators.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="administrators-table">

      <div className="administrators-table__scroll">

        <table>

          <thead>
            <tr>
              <th>Administrador</th>
              <th>Rol</th>
              <th>Sucursal principal</th>
              <th>Estado</th>
              <th>Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>

            {visibleAdministrators.map((user) => {

              const isSuperAdmin =
                user.role === "super_admin";

              const mainBranch =
                user.sucursalPrincipal?.name ||
                "Sin asignar";

              return (
                <tr key={user._id || user.id}>

                  <td>
                    <div className="administrators-table__identity">

                      <div
                        className={`administrators-table__avatar ${
                          isSuperAdmin
                            ? "administrators-table__avatar--super"
                            : ""
                        }`}
                      >
                        {getInitials(user)}
                      </div>

                      <div>
                        <strong>
                          {user.firstName} {user.lastName}
                        </strong>

                        <span>{user.email}</span>
                      </div>

                    </div>
                  </td>

                  <td>
                    <span
                      className={`administrators-table__role ${
                        isSuperAdmin
                          ? "administrators-table__role--super"
                          : ""
                      }`}
                    >
                      {isSuperAdmin && (
                        <LockKeyhole size={12} />
                      )}

                      {isSuperAdmin
                        ? "Superadministrador"
                        : "Administrador"}
                    </span>
                  </td>

                  <td>
                    <span className="administrators-table__branch">
                      {mainBranch}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`administrators-table__status ${
                        user.isActive
                          ? "administrators-table__status--active"
                          : "administrators-table__status--inactive"
                      }`}
                    >
                      {user.isActive
                        ? "Activo"
                        : "Desactivado"}
                    </span>
                  </td>

                  <td>
                    <span className="administrators-table__date">
                      {formatDate(user.createdAt)}
                    </span>
                  </td>

                  <td>
                    <button
                      type="button"
                      className="administrators-table__view"
                      onClick={() => onView?.(user)}
                      aria-label={`Ver detalles de ${user.firstName} ${user.lastName}`}
                      title="Ver detalles"
                    >
                      <Eye size={17} />
                    </button>
                  </td>

                </tr>
              );
            })}

          </tbody>

        </table>

      </div>


      {/* ================================================= */}
      {/* ESTADO VACÍO */}
      {/* ================================================= */}

      {administrators.length === 0 && (

        <div className="administrators-table__empty">
          <SearchX size={29} />
          <strong>No se encontraron administradores</strong>
          <p>
            Prueba modificando los filtros de búsqueda.
          </p>
        </div>

      )}


      {/* ================================================= */}
      {/* PAGINACIÓN */}
      {/* ================================================= */}

      {administrators.length > 0 && (

        <footer className="administrators-table__footer">

          <span>
            Mostrando{" "}
            {((currentPage - 1) * PAGE_SIZE) + 1}–
            {Math.min(
              currentPage * PAGE_SIZE,
              administrators.length
            )}{" "}
            de {administrators.length} cuentas
          </span>

          <div className="administrators-table__pagination">

            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() =>
                setPage(currentPage - 1)
              }
              aria-label="Página anterior"
            >
              <ChevronLeft size={17} />
            </button>

            <span>
              {currentPage} / {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() =>
                setPage(currentPage + 1)
              }
              aria-label="Página siguiente"
            >
              <ChevronRight size={17} />
            </button>

          </div>

        </footer>

      )}

    </div>
  );
}

export default AdministratorsTable;
