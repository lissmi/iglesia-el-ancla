// =========================================================
// DURACIÓN DE SESIONES — CONSULTA DE SEGURIDAD
// =========================================================
// Vista informativa: consulta la política efectiva del backend.
// No obtiene JWT, secretos ni cookies, y no permite editar valores.

import { useEffect, useState } from "react";
import {
  AlertCircle,
  Clock3,
  Cookie,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import api from "../../../services/api";
import "../../../styles/components/super-admin/settings/SessionDurationSettings.css";

// Mostramos la duración de la cookie sin asumir que coincide con el JWT.
function formatCookieDuration(value) {
  if (!Number.isSafeInteger(value) || value <= 0) return "No disponible";

  const minutes = Math.floor(value / 60000);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0 && remainingMinutes > 0) {
    return `${hours} h ${remainingMinutes} min`;
  }
  if (hours > 0) return `${hours} h`;
  if (minutes > 0) return `${minutes} min`;
  return `${Math.floor(value / 1000)} s`;
}

function SecurityValue({ enabled, enabledText = "Activado", disabledText = "Desactivado" }) {
  return (
    <span className={`session-duration__status ${enabled ? "session-duration__status--on" : "session-duration__status--off"}`}>
      {enabled ? enabledText : disabledText}
    </span>
  );
}

function SessionDurationSettings() {
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
        const response = await api.get("/system/session-policy", {
          signal: controller.signal,
        });

        const receivedPolicy = response.data?.policy;
        if (
          response.data?.success !== true ||
          !receivedPolicy ||
          typeof receivedPolicy !== "object" ||
          typeof receivedPolicy.jwtExpiresIn !== "string" ||
          typeof receivedPolicy.cookieMaxAgeMs !== "number"
        ) {
          throw new Error("El servidor devolvió una política de sesiones no válida.");
        }

        if (!controller.signal.aborted) setPolicy(receivedPolicy);
      } catch (requestError) {
        if (controller.signal.aborted || requestError.code === "ERR_CANCELED") return;
        setPolicy(null);
        setError(
          requestError.response?.data?.message ||
          requestError.message ||
          "No fue posible obtener la política de sesiones."
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadPolicy();
    return () => controller.abort();
  }, [revision]);

  return (
    <section className="session-duration" aria-labelledby="session-duration-title">
      <header className="session-duration__header">
        <div className="session-duration__heading">
          <span className="session-duration__heading-icon"><Clock3 size={22} aria-hidden="true" /></span>
          <div>
            <h3 id="session-duration-title">Duración de las sesiones</h3>
            <p>Valores vigentes en el servidor de autenticación.</p>
          </div>
        </div>
        <button
          type="button"
          className="session-duration__refresh"
          onClick={() => setRevision((value) => value + 1)}
          disabled={loading}
          aria-label="Actualizar política de sesiones"
        >
          <RefreshCw size={16} aria-hidden="true" />
          Actualizar
        </button>
      </header>

      {loading ? (
        <p className="session-duration__message" role="status">Consultando configuración de sesiones…</p>
      ) : error ? (
        <div className="session-duration__error" role="alert">
          <AlertCircle size={19} aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : policy ? (
        <>
          <div className="session-duration__grid">
            <div className="session-duration__item">
              <Clock3 size={20} aria-hidden="true" />
              <div>
                <span className="session-duration__label">Expiración JWT</span>
                <strong>{policy.jwtExpiresIn}</strong>
                <small>Duración configurada al emitir un token nuevo.</small>
              </div>
            </div>
            <div className="session-duration__item">
              <Cookie size={20} aria-hidden="true" />
              <div>
                <span className="session-duration__label">Duración de cookie</span>
                <strong>{formatCookieDuration(policy.cookieMaxAgeMs)}</strong>
                <small>{policy.cookieMaxAgeMs.toLocaleString("es-CL")} milisegundos.</small>
              </div>
            </div>
          </div>

          <div className="session-duration__properties">
            <div><span>Cookie HttpOnly</span><SecurityValue enabled={policy.httpOnly === true} /></div>
            <div><span>Cookie Secure</span><SecurityValue enabled={policy.secure === true} /></div>
            <div><span>Política SameSite</span><strong>{policy.sameSite || "No disponible"}</strong></div>
            <div><span>Invalidación por versión de sesión</span><SecurityValue enabled={policy.sessionVersioning === true} /></div>
          </div>

          <div className="session-duration__notice">
            <ShieldCheck size={18} aria-hidden="true" />
            <p>Esta sección es de solo lectura. La duración JWT y la cookie se configuran por separado en el backend; su coincidencia no está garantizada.</p>
          </div>
        </>
      ) : null}

      <p className="session-duration__footnote">
        <LockKeyhole size={14} aria-hidden="true" />
        Los secretos JWT y los tokens de sesión nunca se muestran aquí.
      </p>
    </section>
  );
}

export default SessionDurationSettings;
