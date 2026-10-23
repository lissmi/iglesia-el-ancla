// =========================================================
// USUARIOS POR SUCURSAL — ETAPA 1: CONSULTA
// =========================================================
// Esta etapa solo consulta los usuarios; no modifica MongoDB.

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, RefreshCw, Search, ShieldCheck, UsersRound, Pencil } from "lucide-react";
import api from "../../../services/api";
import BranchAssignmentModal from "./BranchAssignmentModal";
import "../../../styles/components/super-admin/settings/BranchUsersAssignments.css";

// Convierte identificadores de Mongoose o cadenas a texto.
const getId = (value) => String(value?._id ?? value?.id ?? value ?? "");

// Construye el nombre visible del usuario.
const getName = (user) => [user.firstName, user.lastName].filter(Boolean).join(" ") || "Usuario";

// Etiquetas legibles de los roles.
const roleLabels = {
  member: "Miembro",
  admin: "Administrador",
  super_admin: "Superadministrador",
};

function BranchUsersAssignments({ branches = [] }) {
  // Usuarios recuperados del backend.
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Controlamos búsqueda, sucursal seleccionada y recarga.
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [revision, setRevision] = useState(0);
  // Usuario seleccionado para modificar sus sucursales.
  const [selectedUser, setSelectedUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [feedback, setFeedback] = useState("");

  // El endpoint acepta los IDs de las sucursales y la sede principal.
  const handleSaveAssignment = async ({ sucursales, sucursalPrincipal }) => {
    if (!selectedUser || selectedUser.role === "super_admin" || saving) return;

    setSaving(true);
    setSaveError("");
    try {
      const userId = getId(selectedUser);
      await api.patch(`/users/${encodeURIComponent(userId)}/sucursales`, {
        sucursales,
        sucursalPrincipal,
      });

      // Volvemos a consultar los usuarios para mostrar el estado de MongoDB.
      setSelectedUser(null);
      setFeedback("Las sucursales del usuario se actualizaron correctamente.");
      setRevision((value) => value + 1);
    } catch (requestError) {
      setSaveError(requestError.response?.data?.message || "No se pudieron guardar las asignaciones.");
    } finally {
      setSaving(false);
    }
  };

  // GET /api/users. El servicio api ya envía la cookie de sesión.
  useEffect(() => {
    const controller = new AbortController();

    const loadUsers = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/users", { signal: controller.signal });

        if (!response.data?.success || !Array.isArray(response.data.users)) {
          throw new Error("El servidor devolvió una respuesta inesperada.");
        }

        if (!controller.signal.aborted) {
          setUsers(response.data.users);
        }
      } catch (requestError) {
        if (controller.signal.aborted || requestError.code === "ERR_CANCELED") return;
        setError(requestError.response?.data?.message || requestError.message || "No fue posible consultar los usuarios.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadUsers();
    return () => controller.abort();
  }, [revision]);

  // Filtros locales sobre los usuarios recuperados.
  const filteredUsers = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("es-CL");

    return users.filter((user) => {
      const matchesSearch = !term || [getName(user), user.email || ""]
        .some((value) => value.toLocaleLowerCase("es-CL").includes(term));

      const matchesBranch = branchFilter === "all" ||
        (user.sucursales || []).some((branch) => getId(branch) === branchFilter);

      return matchesSearch && matchesBranch;
    });
  }, [users, search, branchFilter]);

  return (
    <section className="branch-users" aria-labelledby="branch-users-title">
      <header className="branch-users__header">
        <div className="branch-users__heading">
          <UsersRound size={22} aria-hidden="true" />
          <div>
            <h3 id="branch-users-title">Usuarios por sucursal</h3>
            <p>Consulta las sedes asignadas a miembros y administradores.</p>
          </div>
        </div>
        <button type="button" disabled={loading} onClick={() => setRevision((value) => value + 1)}>
          <RefreshCw size={16} aria-hidden="true" /> Actualizar usuarios
        </button>
      </header>

      <div className="branch-users__notice">
        <ShieldCheck size={18} aria-hidden="true" />
        <span>Las asignaciones pueden modificarse para miembros y administradores. Las cuentas superadministradoras están protegidas.</span>
      </div>

      {feedback && <p className="branch-users__success" role="status">{feedback}</p>}

      <div className="branch-users__filters">
        <label>
          <span>Buscar usuario</span>
          <div className="branch-users__search">
            <Search size={16} aria-hidden="true" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nombre o correo" />
          </div>
        </label>
        <label>
          <span>Filtrar por sucursal</span>
          <select value={branchFilter} onChange={(event) => setBranchFilter(event.target.value)}>
            <option value="all">Todas las sucursales</option>
            {branches.map((branch) => (
              <option key={getId(branch)} value={getId(branch)}>
                {branch.code} — {branch.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading ? (
        <p className="branch-users__feedback" role="status">Cargando usuarios...</p>
      ) : error ? (
        <div className="branch-users__feedback" role="alert">
          <AlertCircle size={18} aria-hidden="true" />
          <span>{error}</span>
          <button type="button" onClick={() => setRevision((value) => value + 1)}>Reintentar</button>
        </div>
      ) : (
        <>
          <p className="branch-users__count">
            {filteredUsers.length} usuario(s) en esta vista. La consulta actual devuelve hasta 100 registros.
          </p>
          {filteredUsers.length > 0 ? (
            <div className="branch-users__list">
              {filteredUsers.map((user) => (
                <article className="branch-users__user" key={getId(user)}>
                  <div className="branch-users__identity">
                    <strong>{getName(user)}</strong>
                    <span>{user.email}</span>
                    <small>{roleLabels[user.role] || user.role} · {user.isActive ? "Cuenta activa" : "Cuenta inactiva"}</small>
                  </div>
                  <div className="branch-users__assigned">
                    <strong>Sucursales asignadas</strong>
                    <span>{(user.sucursales || []).map((branch) => branch.code || getId(branch)).join(", ") || "Sin sucursales"}</span>
                    <small>Principal: {user.sucursalPrincipal?.code || "No disponible"}</small>
                  </div>
                  <button
                    type="button"
                    disabled={user.role === "super_admin" || saving}
                    title={user.role === "super_admin" ? "Cuenta protegida" : "Modificar sucursales asignadas"}
                    onClick={() => {
                      setSaveError("");
                      setFeedback("");
                      setSelectedUser(user);
                    }}
                  >
                    <Pencil size={15} aria-hidden="true" /> {user.role === "super_admin" ? "Protegido" : "Asignar sucursales"}
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <p className="branch-users__feedback">No hay usuarios que coincidan con los filtros.</p>
          )}
        </>
      )}
      {selectedUser && (
        <BranchAssignmentModal
          key={getId(selectedUser)}
          user={selectedUser}
          branches={branches}
          saving={saving}
          serverError={saveError}
          onSave={handleSaveAssignment}
          onClose={() => {
            if (!saving) {
              setSelectedUser(null);
              setSaveError("");
            }
          }}
        />
      )}
    </section>
  );
}

export default BranchUsersAssignments;
