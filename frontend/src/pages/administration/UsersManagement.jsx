// Pantalla de usuarios reales: solo datos entregados por la API.
import { useCallback, useEffect, useState } from "react";
import { LockKeyhole, RefreshCw, AlertTriangle } from "lucide-react";
import UsersHeader from "../../components/administration/users/UsersHeader";
import UsersSummary from "../../components/administration/users/UsersSummary";
import UsersFilters from "../../components/administration/users/UsersFilters";
import UsersTable from "../../components/administration/users/UsersTable";
import UserDetailsModal from "../../components/administration/users/UserDetailsModal";
import UserEditModal from "../../components/administration/users/UserEditModal";
import UserStatusConfirmModal from "../../components/administration/users/UserStatusConfirmModal";
import { getUsers, getUsersStats, updateUser, updateUserStatus } from "../../services/usersApi";
import "../../styles/pages/administration/UsersManagement.css";
import "../../styles/pages/administration/UsersManagementConnected.css";

// Extraemos solamente un mensaje útil de los errores del backend.
const errorMessage = (error) => error?.response?.data?.message ||
  "No se pudo completar la operación. Comprueba tu sesión y la conexión.";

function UsersManagement() {
  // Estados de búsqueda y selección existentes en la interfaz.
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  // Cuenta cuya activación o desactivación debe confirmarse.
  const [statusUser, setStatusUser] = useState(null);
  // Datos reales y estado de carga de la API.
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Consultamos lista y resumen en paralelo; no fabricamos datos de ejemplo.
  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [userList, summary] = await Promise.all([getUsers(), getUsersStats()]);
      setUsers(userList);
      setStats(summary);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargamos las cuentas al abrir la página.
  useEffect(() => { refresh(); }, [refresh]);

  // Abrimos un diálogo propio al pulsar el candado; aquí NO modificamos datos.
  const toggleStatus = (user) => {
    if (busy || user.role === "super_admin") return;
    setStatusUser(user);
  };

  // Solo el botón explícito del modal puede ejecutar la operación real.
  const confirmStatusChange = async () => {
    if (busy || !statusUser || statusUser.role === "super_admin") return;
    const user = statusUser;
    const next = user.isActive === false;
    setBusy(true);
    setNotice("");
    setError("");
    try {
      // El backend comprueba la sesión, el rol y la protección de la cuenta.
      await updateUserStatus(user._id, next);
      setStatusUser(null);
      setNotice(next ? "Cuenta habilitada correctamente." : "Cuenta desactivada y sesiones revocadas.");
      await refresh();
    } catch (err) {
      // Conservamos el diálogo abierto si ocurre un error y mostramos el aviso.
      setError(errorMessage(err));
      setStatusUser(null);
    } finally {
      setBusy(false);
    }
  };

  // Guardamos solo campos admitidos por la API de edición.
  const saveUser = async (user, values) => {
    await updateUser(user._id, values);
    setNotice("Usuario actualizado; sus sesiones anteriores fueron revocadas.");
    await refresh();
  };

  return (
    <div className="users-management">
      <UsersHeader />
      <div className="users-management__content">
        <div className="users-connected__toolbar">
          <span>Información sincronizada con MongoDB Atlas</span>
          <button type="button" onClick={refresh} disabled={loading || busy}>
            <RefreshCw size={16} aria-hidden="true" /> Actualizar listado
          </button>
        </div>
        {error && <div role="alert" className="users-connected__error"><AlertTriangle size={18} />{error}</div>}
        {notice && <div role="status" className="users-connected__success">{notice}</div>}
        <UsersSummary stats={stats} />
        <section className="users-management__section" aria-labelledby="users-list-title">
          <div className="users-management__section-heading">
            <div><h2 id="users-list-title">Usuarios registrados</h2>
              <p>Consulta las cuentas, aplica filtros y administra sus permisos.</p></div>
          </div>
          <UsersFilters search={search} role={role} status={status}
            onSearchChange={setSearch} onRoleChange={setRole} onStatusChange={setStatus}
            onClear={() => { setSearch(""); setRole("all"); setStatus("all"); }} />
          <UsersTable users={users} loading={loading || busy} search={search} role={role}
            status={status} onViewUser={setSelectedUser} onEditUser={setEditingUser}
            onToggleBlock={toggleStatus} />
          {!loading && users.length === 100 &&
            <p className="users-connected__hint">Se muestran las 100 cuentas más recientes. El endpoint actual limita el listado a 100 registros.</p>}
        </section>
        <aside className="users-management__security">
          <div className="users-management__security-icon"><LockKeyhole size={21} /></div>
          <div className="users-management__security-content"><strong>Administración protegida</strong>
            <p>Solo el superadministrador puede modificar estas cuentas. Los cambios invalidan las sesiones anteriores.</p></div>
        </aside>
      </div>
      {statusUser && <UserStatusConfirmModal
        user={statusUser}
        processing={busy}
        onConfirm={confirmStatusChange}
        onClose={() => { if (!busy) setStatusUser(null); }}
      />}
      {selectedUser && <UserDetailsModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
      {editingUser && <UserEditModal key={editingUser._id} user={editingUser}
        onClose={() => setEditingUser(null)} onSave={saveUser} />}
    </div>
  );
}
export default UsersManagement;
