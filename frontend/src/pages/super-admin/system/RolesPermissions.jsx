import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Info, LockKeyhole, RefreshCw, ShieldCheck } from "lucide-react";
import RolesSummary from "../../../components/super-admin/roles/RolesSummary";
import RolesCards from "../../../components/super-admin/roles/RolesCards";
import PermissionsMatrix from "../../../components/super-admin/roles/PermissionsMatrix";
import { getRoleAccessOverview } from "../../../services/roleAccessApi";
import "../../../styles/pages/super-admin/system/RolesPermissions.css";

function RolesPermissions() {
  // La selección del rol sirve solo para destacar su columna.
  const [selectedRole, setSelectedRole] = useState("super_admin");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Consultamos la base de datos y el inventario de permisos del backend.
  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getRoleAccessOverview();
      setData(result);
    } catch (err) {
      setError(err?.response?.data?.message || "No pudimos mostrar esta información. Comprueba que hayas iniciado sesión e inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="roles-permissions-page">
      <header className="roles-permissions-page__header">
        <div>
          <span className="roles-permissions-page__eyebrow">SISTEMA / CONTROL DE ACCESO</span>
          <h1>Roles y permisos</h1>
          <p>Consulta los niveles de acceso del sistema y cuántas cuentas reales tiene cada rol.</p>
        </div>
        <div className="roles-permissions-page__badge">
          <ShieldCheck size={17} aria-hidden="true" />
          <span>Superadministrador</span>
        </div>
      </header>

      <div className="roles-permissions-page__notice" role="note">
        <Info size={20} aria-hidden="true" />
        <div>
          <strong>Consulta del control de acceso</strong>
          <p>Esta información se actualiza con las cuentas registradas en la plataforma. Aquí puedes conocer qué acciones están disponibles para cada tipo de usuario. Para cambiar el rol de una persona, utiliza Gestión de usuarios.</p>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 18 }}>
        <button type="button" disabled={loading} onClick={loadData} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 14px", border: "1px solid #45545e", borderRadius: 10, background: "#1b2329", color: "#d1e3ee", cursor: loading ? "wait" : "pointer" }}>
          <RefreshCw size={16} aria-hidden="true" /> Actualizar información
        </button>
      </div>

      {loading && !data && <p role="status">Cargando los roles y permisos...</p>}
      {error && <div role="alert" className="roles-permissions-page__notice"><AlertCircle size={20} /><p>{error}</p></div>}

      {data && (
        <>
          <RolesSummary data={data} />
          <section className="roles-permissions-page__section">
            <div className="roles-permissions-page__section-heading">
              <h2>Roles del sistema</h2>
              <p>Selecciona un rol para ver sus funciones. También puedes consultar cuántas cuentas de ese tipo hay registradas y activas.</p>
            </div>
            <RolesCards selectedRole={selectedRole} onSelectRole={setSelectedRole} roles={data.roles} counts={data.counts} />
          </section>

          <PermissionsMatrix selectedRole={selectedRole} roles={data.roles} permissions={data.permissions} />
        </>
      )}

      <section className="roles-permissions-page__security">
        <div className="roles-permissions-page__security-icon"><LockKeyhole size={23} aria-hidden="true" /></div>
        <div>
          <h2>Protección de cuentas y accesos</h2>
          <p>Cada persona solo puede realizar las acciones permitidas para su cuenta. Antes de mostrar o cambiar información privada, la plataforma comprueba que tenga autorización.</p>
          <p>Las cuentas de superadministrador cuentan con protección especial para evitar modificaciones accidentales y accesos no autorizados.</p>
        </div>
      </section>
    </div>
  );
}

export default RolesPermissions;
