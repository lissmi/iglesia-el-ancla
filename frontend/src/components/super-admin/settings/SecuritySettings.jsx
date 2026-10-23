// =========================================================
// SEGURIDAD Y ACCESO — VISTA PARA ADMINISTRACIÓN DE LA IGLESIA
// =========================================================
// Muestra información clara, sin exponer detalles internos de
// autenticación. Las políticas siguen aplicándose en el servidor.

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  KeyRound,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import api from "../../../services/api";
import "../../../styles/components/super-admin/settings/SecuritySettings.css";

// Convierte una duración legible de JWT ('4h', '30m', '1d')
// a una descripción apropiada para el panel.
const formatSessionTime = (value) => {
  if (typeof value !== "string") return null;
  const match = value.trim().match(/^(\d+)\s*(h|m|d)$/i);
  if (!match) return null;
  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  if (unit === "h") return `${amount} ${amount === 1 ? "hora" : "horas"}`;
  if (unit === "m") return `${amount} ${amount === 1 ? "minuto" : "minutos"}`;
  return `${amount} ${amount === 1 ? "día" : "días"}`;
};

const formatMinutes = (milliseconds) => {
  if (!Number.isFinite(milliseconds) || milliseconds <= 0) return null;
  const minutes = Math.round(milliseconds / 60000);
  return `${minutes} ${minutes === 1 ? "minuto" : "minutos"}`;
};

function SecuritySettings() {
  const [policies, setPolicies] = useState({ session: null, login: null, admin: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function loadPolicies() {
      setLoading(true);
      setError("");

      try {
        const responses = await Promise.all([
          api.get("/system/session-policy", { signal: controller.signal }),
          api.get("/system/login-security-policy", { signal: controller.signal }),
          api.get("/system/administrator-protection", { signal: controller.signal }),
        ]);

        if (!active) return;
        const [session, login, admin] = responses.map((response) => response.data);
        if (!session?.success || !login?.success || !admin?.success) {
          throw new Error("No se pudieron consultar todas las políticas de seguridad.");
        }
        setPolicies({ session: session.policy, login: login.policy, admin: admin.protection });
      } catch (requestError) {
        if (!active) return;
        setError("No fue posible obtener la información actual. Intenta actualizar nuevamente.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadPolicies();
    return () => {
      active = false;
      controller.abort();
    };
  }, [refresh]);

  const sessionText = formatSessionTime(policies.session?.jwtExpiresIn);
  const attempts = policies.login?.accountLock?.maxFailedAttempts;
  const lockTime = formatMinutes(policies.login?.accountLock?.lockDurationMs);
  const adminProtected = policies.admin?.globalUsersRestrictedToSuperAdmin === true;
  const branchProtected = policies.admin?.branchAssignmentRestrictedToSuperAdmin === true;

  return (
    <div className="security-settings">
      <header className="security-settings__header">
        <div className="security-settings__heading">
          <span className="security-settings__heading-icon"><ShieldCheck size={23} aria-hidden="true" /></span>
          <div>
            <h2>Seguridad y acceso</h2>
            <p>Revisa cómo se protegen las cuentas y los accesos a la plataforma.</p>
          </div>
        </div>
        <button
          type="button"
          className="security-settings__refresh"
          onClick={() => setRefresh((current) => current + 1)}
          disabled={loading}
        >
          <RefreshCw size={15} aria-hidden="true" />
          {loading ? "Consultando..." : "Actualizar"}
        </button>
      </header>

      {error && (
        <div className="security-settings__error" role="alert">
          <AlertCircle size={18} aria-hidden="true" />
          <p>{error}</p>
        </div>
      )}

      <div className="security-settings__grid">
        <article className="security-settings__card">
          <div className="security-settings__card-heading">
            <span className="security-settings__icon"><Clock3 size={21} aria-hidden="true" /></span>
            <div><h3>Tiempo de sesión</h3><p>¿Cuánto tiempo puede permanecer una persona conectada?</p></div>
          </div>
          <div className="security-settings__value">{loading ? "Consultando..." : sessionText ?? "No disponible"}</div>
          <p className="security-settings__explanation">
            Después de este tiempo será necesario iniciar sesión nuevamente. En algunos casos el acceso puede finalizar antes.
          </p>
        </article>

        <article className="security-settings__card">
          <div className="security-settings__card-heading">
            <span className="security-settings__icon"><LockKeyhole size={21} aria-hidden="true" /></span>
            <div><h3>Intentos de acceso</h3><p>Medidas para evitar que otras personas adivinen contraseñas.</p></div>
          </div>
          <div className="security-settings__value">
            {loading ? "Consultando..." : Number.isInteger(attempts) ? `${attempts} intentos` : "No disponible"}
          </div>
          <p className="security-settings__explanation">
            {loading ? "Consultando las medidas de protección." : lockTime
              ? `Si una cuenta supera los intentos permitidos, se bloquea temporalmente durante ${lockTime}.`
              : "El sistema limita los intentos fallidos de inicio de sesión."}
          </p>
        </article>

        <article className="security-settings__card">
          <div className="security-settings__card-heading">
            <span className="security-settings__icon"><UsersRound size={21} aria-hidden="true" /></span>
            <div><h3>Administradores y permisos</h3><p>Control de acceso a las funciones de administración.</p></div>
          </div>
          <div className="security-settings__permission">
            <CheckCircle2 size={17} aria-hidden="true" />
            <span>{!loading && adminProtected && branchProtected
              ? "Accesos administrativos restringidos"
              : loading ? "Consultando permisos..." : "Estado de permisos no disponible"}</span>
          </div>
          <p className="security-settings__explanation">
            La gestión general de usuarios y la asignación de sedes están reservadas al superadministrador.
            La creación y modificación de administradores todavía requieren funciones adicionales.
          </p>
        </article>

        <article className="security-settings__card">
          <div className="security-settings__card-heading">
            <span className="security-settings__icon"><KeyRound size={21} aria-hidden="true" /></span>
            <div><h3>Contraseñas y verificación</h3><p>Protección de los datos de acceso de cada persona.</p></div>
          </div>
          <div className="security-settings__password-status">
            <CheckCircle2 size={17} aria-hidden="true" />
            <span>Cambio de contraseña disponible</span>
          </div>
          <p className="security-settings__explanation">
            Puedes cambiar la contraseña de tu propia cuenta. Después del cambio,
            deberás iniciar sesión nuevamente y esperar 24 horas para volver a modificarla.
          </p>
          <Link className="security-settings__password-link" to="/cambiar-contrasena">
            Cambiar mi contraseña
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
          <p className="security-settings__password-note">
            Para cambiar tu contraseña se solicitará un código enviado a tu correo. La recuperación de acceso aún está en preparación.
          </p>
        </article>
      </div>

      <footer className="security-settings__footer">
        <ShieldCheck size={17} aria-hidden="true" />
        <span>Estas medidas se aplican automáticamente. Por seguridad, sus cambios todavía no están disponibles desde esta pantalla.</span>
      </footer>
    </div>
  );
}

export default SecuritySettings;
