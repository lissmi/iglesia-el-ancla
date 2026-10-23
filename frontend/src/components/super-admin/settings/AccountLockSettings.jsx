// =========================================================
// BLOQUEO DE CUENTAS — CONSULTA DE POLÍTICAS
// =========================================================
// Componente informativo exclusivo del superadministrador.
// Los parámetros vienen del backend; aquí no se modifican.

import { useEffect, useState } from "react";
import { AlertCircle, Clock3, LockKeyhole, RefreshCw, ShieldCheck } from "lucide-react";

import api from "../../../services/api";
import "../../../styles/components/super-admin/settings/AccountLockSettings.css";

// Convertimos milisegundos a un texto comprensible.
function formatDuration(milliseconds) {
  if (!Number.isSafeInteger(milliseconds) || milliseconds <= 0) return "No disponible";
  const minutes = milliseconds / 60000;
  if (Number.isInteger(minutes)) return `${minutes} ${minutes === 1 ? "minuto" : "minutos"}`;
  return `${milliseconds.toLocaleString("es-CL")} ms`;
}

function AccountLockSettings() {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPolicy() {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/system/login-security-policy", {
          signal: controller.signal,
        });
        const result = response.data;
        const nextPolicy = result?.policy;
        const account = nextPolicy?.accountLock;
        const ip = nextPolicy?.ipRateLimit;

        // Evitamos mostrar cifras inexistentes o respuestas incompletas.
        const valid = result?.success === true &&
          Number.isSafeInteger(account?.maxFailedAttempts) && account.maxFailedAttempts > 0 &&
          Number.isSafeInteger(account?.lockDurationMs) && account.lockDurationMs > 0 &&
          Number.isSafeInteger(ip?.windowMs) && ip.windowMs > 0 &&
          Number.isSafeInteger(ip?.maxRequests) && ip.maxRequests > 0 &&
          typeof ip?.successfulRequestsExcluded === "boolean";

        if (!valid) throw new Error("El servidor devolvió una política de bloqueo no válida.");
        if (!controller.signal.aborted) setPolicy(nextPolicy);
      } catch (requestError) {
        if (controller.signal.aborted || requestError.code === "ERR_CANCELED") return;
        setPolicy(null);
        setError(requestError.response?.data?.message || requestError.message || "No fue posible consultar la política.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadPolicy();
    return () => controller.abort();
  }, [revision]);

  return (
    <section className="account-lock" aria-labelledby="account-lock-title">
      <header className="account-lock__header">
        <div className="account-lock__heading">
          <span className="account-lock__heading-icon"><LockKeyhole size={22} aria-hidden="true" /></span>
          <div>
            <h3 id="account-lock-title">Bloqueo de cuentas</h3>
            <p>Políticas vigentes para los intentos de inicio de sesión.</p>
          </div>
        </div>
        <button type="button" className="account-lock__refresh" onClick={() => setRevision((value) => value + 1)} disabled={loading}>
          <RefreshCw size={16} aria-hidden="true" /> Actualizar
        </button>
      </header>

      {loading && <p className="account-lock__feedback" role="status">Consultando las políticas del servidor…</p>}

      {!loading && error && (
        <div className="account-lock__error" role="alert">
          <AlertCircle size={19} aria-hidden="true" /><p>{error}</p>
        </div>
      )}

      {!loading && policy && (
        <>
          <div className="account-lock__grid">
            <div className="account-lock__item">
              <LockKeyhole size={19} aria-hidden="true" />
              <div><span>Intentos fallidos por cuenta</span><strong>{policy.accountLock.maxFailedAttempts}</strong><small>Máximo antes del bloqueo temporal.</small></div>
            </div>
            <div className="account-lock__item">
              <Clock3 size={19} aria-hidden="true" />
              <div><span>Duración del bloqueo</span><strong>{formatDuration(policy.accountLock.lockDurationMs)}</strong><small>La cuenta queda temporalmente restringida.</small></div>
            </div>
            <div className="account-lock__item">
              <Clock3 size={19} aria-hidden="true" />
              <div><span>Ventana del límite por IP</span><strong>{formatDuration(policy.ipRateLimit.windowMs)}</strong><small>Período utilizado por el limitador del login.</small></div>
            </div>
            <div className="account-lock__item">
              <ShieldCheck size={19} aria-hidden="true" />
              <div><span>Solicitudes máximas por IP</span><strong>{policy.ipRateLimit.maxRequests}</strong><small>Dentro de la ventana configurada.</small></div>
            </div>
          </div>

          <div className="account-lock__property">
            <span>Excluir solicitudes exitosas del límite</span>
            <strong className={policy.ipRateLimit.successfulRequestsExcluded ? "account-lock__pill account-lock__pill--on" : "account-lock__pill account-lock__pill--off"}>
              {policy.ipRateLimit.successfulRequestsExcluded ? "Activado" : "Desactivado"}
            </strong>
          </div>

          <div className="account-lock__notice">
            <ShieldCheck size={17} aria-hidden="true" />
            <p>Consulta de solo lectura. Los límites se aplican en el backend y no pueden modificarse desde esta pantalla.</p>
          </div>
        </>
      )}
    </section>
  );
}

export default AccountLockSettings;
