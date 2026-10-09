
import { useState, useEffect } from "react";

import {
  UsersRound,
  Eye,
  Pencil,
  LockKeyhole,
  UnlockKeyhole,
  ChevronLeft,
  ChevronRight,
  SearchX,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";

import "../../../styles/components/administration/users/UsersTable.css";


// =========================================================
// CONFIGURACIÓN
// =========================================================

// Cantidad de usuarios mostrados por página.
const PAGE_SIZE = 8;


// =========================================================
// FORMATEAR NOMBRE
// =========================================================

const getUserName = (user) => {

  const fullName =
    user.name ||
    user.fullName ||
    [
      user.firstName,
      user.lastName,
    ].filter(Boolean).join(" ");

  return fullName?.trim() || "Sin nombre";
};


// =========================================================
// OBTENER INICIALES
// =========================================================

const getInitials = (name) => {

  const words = name.trim().split(/\s+/);

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
};


// =========================================================
// FORMATEAR ROL
// =========================================================

const getRoleLabel = (role) => {

  const roles = {
    member: "Miembro",
    admin: "Administrador",
    super_admin: "Superadministrador",
  };

  return roles[role] || "Sin asignar";
};


// =========================================================
// FORMATEAR FECHA
// =========================================================

const formatDate = (date) => {

  if (!date) {
    return "Sin información";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Sin información";
  }

  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
};


// =========================================================
// COMPONENTE USERS TABLE
// =========================================================

// Recibe:
//
// users: listado de cuentas.
// loading: indica si estamos cargando datos.
// search: búsqueda actual.
// role: filtro de rol.
// status: filtro de estado.
//
// onViewUser: acción para consultar una cuenta.
// onEditUser: acción para editar una cuenta.
// onToggleBlock: acción para bloquear/desbloquear.
//
// Las acciones administrativas permanecerán
// deshabilitadas hasta implementar sus funciones.

function UsersTable({
  users = [],
  loading = false,
  search = "",
  role = "all",
  status = "all",
  onViewUser,
  onEditUser,
  onToggleBlock,
}) {

  // =========================================================
  // ESTADO DE PAGINACIÓN
  // =========================================================

  const [currentPage, setCurrentPage] = useState(1);


  // =========================================================
  // FILTRAR USUARIOS
  // =========================================================

  // Filtramos los datos recibidos.
  // No alteramos el arreglo original.

  const filteredUsers = users.filter((user) => {

    const searchText = search.trim().toLocaleLowerCase("es-CL");

    const name = getUserName(user).toLocaleLowerCase("es-CL");

    const email = String(user.email || "")
      .toLocaleLowerCase("es-CL");

    const matchesSearch =
      searchText === "" ||
      name.includes(searchText) ||
      email.includes(searchText);

    const matchesRole =
      role === "all" ||
      user.role === role;

    // Esta primera versión utiliza isBlocked.
    // Ajustaremos el campo al integrar el modelo
    // real de Usuario del backend.
    const isBlocked = user.isBlocked === true;

    const matchesStatus =
      status === "all" ||
      (status === "active" && !isBlocked) ||
      (status === "blocked" && isBlocked);

    return (
      matchesSearch &&
      matchesRole &&
      matchesStatus
    );

  });


  // =========================================================
  // RESTABLECER PAGINACIÓN
  // =========================================================

  // Si cambian los filtros o el conjunto de usuarios,
  // regresamos a la primera página.

  useEffect(() => {
    setCurrentPage(1);
  }, [search, role, status, users]);


  // =========================================================
  // CALCULAR PÁGINAS
  // =========================================================

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / PAGE_SIZE)
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safeCurrentPage - 1) * PAGE_SIZE;

  const visibleUsers = filteredUsers.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );



  // =========================================================
  // DETERMINAR ESTADO VACÍO
  // =========================================================

  // Comprueba si todavía no tenemos usuarios cargados.
  const hasNoUsers = users.length === 0;

  // Comprueba si existen usuarios, pero ninguno
  // coincide con los filtros seleccionados.
  const hasNoResults =
    !hasNoUsers &&
    filteredUsers.length === 0;



  // =========================================================
  // INTERFAZ
  // =========================================================

  return (

    <div className="users-table">


      {/* ================================================= */}
      {/* ESTADO DE CARGA */}
      {/* ================================================= */}

      {loading ? (

        <div
          className="users-table__empty"
          role="status"
          aria-live="polite"
        >

          <LoaderCircle
            className="users-table__loading-icon"
            size={30}
            strokeWidth={1.8}
            aria-hidden="true"
          />

          <strong>
            Cargando usuarios
          </strong>

          <p>
            Estamos obteniendo la información
            de las cuentas registradas.
          </p>

        </div>

      ) : hasNoUsers ? (

        /* ============================================= */
        /* NO EXISTEN DATOS CARGADOS */
        /* ============================================= */

        <div className="users-table__empty">

          <div className="users-table__empty-icon">

            <UsersRound
              size={28}
              strokeWidth={1.6}
              aria-hidden="true"
            />

          </div>

          <strong>
            No hay usuarios para mostrar
          </strong>

          <p>
            El listado todavía no tiene cuentas
            cargadas. Cuando conectemos el backend,
            aquí aparecerán los usuarios registrados.
          </p>

        </div>

      ) : hasNoResults ? (

        /* ============================================= */
        /* SIN COINCIDENCIAS */
        /* ============================================= */

        <div className="users-table__empty">

          <div className="users-table__empty-icon">

            <SearchX
              size={28}
              strokeWidth={1.6}
              aria-hidden="true"
            />

          </div>

          <strong>
            No encontramos coincidencias
          </strong>

          <p>
            Prueba modificando el nombre,
            correo electrónico, rol o estado.
          </p>

        </div>

      ) : (

        <>

          {/* ============================================= */}
          {/* TABLA */}
          {/* ============================================= */}

          <div className="users-table__scroll">

            <table>

              <thead>

                <tr>

                  <th scope="col">
                    Usuario
                  </th>

                  <th scope="col">
                    Correo electrónico
                  </th>

                  <th scope="col">
                    Rol
                  </th>

                  <th scope="col">
                    Estado
                  </th>

                  <th scope="col">
                    Registro
                  </th>

                  <th scope="col">
                    Acciones
                  </th>

                </tr>

              </thead>


              <tbody>

                {visibleUsers.map((user) => {

                  const userName = getUserName(user);

                  const initials = getInitials(userName);

                  const isBlocked =
                    user.isBlocked === true;

                  const userId =
                    user._id || user.id;

                  const isSuperAdmin =
                    user.role === "super_admin";

                  return (

                    <tr key={userId}>


                      {/* ================================= */}
                      {/* USUARIO */}
                      {/* ================================= */}

                      <td>

                        <div className="users-table__user">

                          <div className="users-table__avatar">
                            {initials}
                          </div>

                          <div className="users-table__identity">

                            <strong>
                              {userName}
                            </strong>

                            {isSuperAdmin && (

                              <span className="users-table__protected">

                                <ShieldCheck
                                  size={12}
                                  aria-hidden="true"
                                />

                                Cuenta privilegiada

                              </span>

                            )}

                          </div>

                        </div>

                      </td>


                      {/* ================================= */}
                      {/* CORREO */}
                      {/* ================================= */}

                      <td>

                        <span className="users-table__email">
                          {user.email || "Sin correo"}
                        </span>

                      </td>


                      {/* ================================= */}
                      {/* ROL */}
                      {/* ================================= */}

                      <td>

                        <span
                          className={`
                            users-table__role
                            users-table__role--${user.role || "unknown"}
                          `}
                        >
                          {getRoleLabel(user.role)}
                        </span>

                      </td>


                      {/* ================================= */}
                      {/* ESTADO */}
                      {/* ================================= */}

                      <td>

                        <span
                          className={`
                            users-table__status
                            ${
                              isBlocked
                                ? "users-table__status--blocked"
                                : "users-table__status--active"
                            }
                          `}
                        >

                          <span className="users-table__status-dot" />

                          {isBlocked ? "Bloqueado" : "Activo"}

                        </span>

                      </td>


                      {/* ================================= */}
                      {/* FECHA */}
                      {/* ================================= */}

                      <td>

                        <span className="users-table__date">
                          {formatDate(user.createdAt)}
                        </span>

                      </td>


                      {/* ================================= */}
                      {/* ACCIONES */}
                      {/* ================================= */}

                      <td>

                        <div className="users-table__actions">


                          {/* CONSULTAR USUARIO */}

                          <button
                            type="button"
                            className="users-table__action"
                            title="Ver información del usuario"
                            aria-label={`Ver usuario ${userName}`}
                            onClick={() => onViewUser?.(user)}
                            disabled={!onViewUser}
                          >

                            <Eye size={17} />

                          </button>


                          {/* EDITAR USUARIO */}

                          <button
                            type="button"
                            className="users-table__action"
                            title="Editar usuario"
                            aria-label={`Editar usuario ${userName}`}
                            onClick={() => onEditUser?.(user)}
                            disabled={!onEditUser || isSuperAdmin}
                          >

                            <Pencil size={16} />

                          </button>


                          {/* BLOQUEAR / DESBLOQUEAR */}

                          <button
                            type="button"
                            className={`
                              users-table__action
                              ${
                                isBlocked
                                  ? "users-table__action--unlock"
                                  : "users-table__action--danger"
                              }
                            `}
                            title={
                              isBlocked
                                ? "Desbloquear usuario"
                                : "Bloquear usuario"
                            }
                            aria-label={
                              `${
                                isBlocked
                                  ? "Desbloquear"
                                  : "Bloquear"
                              } usuario ${userName}`
                            }
                            onClick={() => onToggleBlock?.(user)}
                            disabled={!onToggleBlock || isSuperAdmin}
                          >

                            {isBlocked ? (

                              <UnlockKeyhole size={16} />

                            ) : (

                              <LockKeyhole size={16} />

                            )}

                          </button>

                        </div>

                      </td>

                    </tr>
                  );

                })}

              </tbody>

            </table>

          </div>


          {/* ============================================= */}
          {/* PIE DE TABLA Y PAGINACIÓN */}
          {/* ============================================= */}

          <div className="users-table__footer">

            <span className="users-table__count">

              Mostrando{" "}

              <strong>
                {startIndex + 1}–{Math.min(
                  startIndex + PAGE_SIZE,
                  filteredUsers.length
                )}
              </strong>

              {" "}de{" "}

              <strong>
                {filteredUsers.length}
              </strong>

              {" "}usuarios

            </span>


            {totalPages > 1 && (

              <div className="users-table__pagination">

                <button
                  type="button"
                  aria-label="Página anterior"
                  disabled={safeCurrentPage === 1}
                  onClick={() => {
                    setCurrentPage((page) => Math.max(1, page - 1));
                  }}
                >

                  <ChevronLeft size={17} />

                </button>


                <span>
                  Página {safeCurrentPage} de {totalPages}
                </span>


                <button
                  type="button"
                  aria-label="Página siguiente"
                  disabled={safeCurrentPage === totalPages}
                  onClick={() => {
                    setCurrentPage((page) => Math.min(totalPages, page + 1));
                  }}
                >

                  <ChevronRight size={17} />

                </button>

              </div>

            )}

          </div>

        </>

      )}

    </div>
  );
}


// =========================================================
// EXPORTACIÓN
// =========================================================

export default UsersTable;
