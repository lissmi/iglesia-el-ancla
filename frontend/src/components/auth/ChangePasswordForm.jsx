// =========================================================
// CAMBIO DE CONTRASEÑA CON CÓDIGO DE GMAIL
// =========================================================
// Página reutilizable para super_admin y admin.
// El backend identifica al usuario exclusivamente por cookie HttpOnly.

import { useEffect, useState } from "react";
import { Eye, EyeOff, Info, KeyRound, MailCheck, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import "../../styles/components/auth/ChangePasswordForm.css";

const MAX_PASSWORD_BYTES = 72;

function getUtf8ByteLength(value) {
  return new TextEncoder().encode(value).length;
}

function formatNextAllowedAt(value) {
  if (!value || Number.isNaN(Date.parse(value))) return null;
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Santiago",
  }).format(new Date(value));
}

function getErrorMessage(error, fallback) {
  const message = error?.response?.data?.message;
  return typeof message === "string" ? message : fallback;
}

function ChangePasswordForm() {
  // Etapa inicial: solicitar el código antes de habilitar el formulario.
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState("");
  const [expiresAt, setExpiresAt] = useState(null);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [sendingCode, setSendingCode] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [nextAllowedAt, setNextAllowedAt] = useState(null);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (resendSeconds <= 0) return undefined;
    const timer = setTimeout(() => {
      setResendSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => clearTimeout(timer);
  }, [resendSeconds]);

  useEffect(() => {
    if (!codeSent || !expiresAt) return undefined;
    const update = () => setRemainingSeconds(
      Math.max(0, Math.ceil((Date.parse(expiresAt) - Date.now()) / 1000))
    );
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [codeSent, expiresAt]);

  async function handleRequestCode() {
    if (sendingCode || saving || resendSeconds > 0) return;
    setSendingCode(true);
    setError("");
    setRequestMessage("");

    try {
      // El cuerpo va vacío: el usuario y el correo se obtienen de la sesión.
      const response = await api.post("/auth/change-password/request-code", {});
      setCodeSent(true);
      setCode("");
      setExpiresAt(response.data?.expiresAt || null);
      setResendSeconds(response.data?.resendAfterSeconds ?? 60);
      setRequestMessage("Código enviado al correo electrónico registrado de tu cuenta.");
    } catch (requestError) {
      setError(getErrorMessage(requestError, "No fue posible enviar el código de seguridad."));
    } finally {
      setSendingCode(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (saving || complete || !codeSent) return;
    setError("");
    setNextAllowedAt(null);

    if (!/^\d{6}$/.test(code)) {
      setError("Ingresa el código de seis dígitos que recibiste por correo.");
      return;
    }
    if (remainingSeconds <= 0) {
      setError("El código venció. Solicita uno nuevo.");
      return;
    }
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Completa todos los campos antes de continuar.");
      return;
    }
    if (newPassword.length < 12 || newPassword.length > 128 ||
        getUtf8ByteLength(newPassword) > MAX_PASSWORD_BYTES) {
      setError("La contraseña nueva debe tener al menos 12 caracteres y no superar 72 bytes.");
      return;
    }
    if (newPassword === currentPassword) {
      setError("La contraseña nueva debe ser diferente de la actual.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("La confirmación no coincide con la contraseña nueva.");
      return;
    }
    if (!acknowledged) {
      setError("Confirma que leíste la advertencia de seguridad.");
      return;
    }

    try {
      setSaving(true);
      // El cambio no puede completarse sin el código válido.
      await api.post("/auth/change-password", {
        code,
        currentPassword,
        newPassword,
      });
      setComplete(true);
      setCode("");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (requestError) {
      const data = requestError?.response?.data;
      if (data?.code === "PASSWORD_CHANGE_COOLDOWN") {
        setNextAllowedAt(formatNextAllowedAt(data.nextAllowedAt));
      }
      setError(getErrorMessage(requestError, "No fue posible cambiar la contraseña. Intenta nuevamente."));
    } finally {
      setSaving(false);
    }
  }

  if (complete) {
    return (
      <section className="change-password" aria-labelledby="change-password-title">
        <div className="change-password__result" role="status">
          <ShieldCheck size={35} aria-hidden="true" />
          <h2 id="change-password-title">Contraseña actualizada</h2>
          <p>Tu contraseña fue cambiada correctamente. Por seguridad, se cerraron tus sesiones anteriores.</p>
          <p>Podrás volver a cambiarla después de 24 horas.</p>
          <Link className="change-password__button" to="/login">Ir a iniciar sesión</Link>
        </div>
      </section>
    );
  }

  const inputType = showPasswords ? "text" : "password";

  return (
    <section className="change-password" aria-labelledby="change-password-title">
      <header className="change-password__header">
        <span className="change-password__icon"><KeyRound size={23} aria-hidden="true" /></span>
        <div>
          <h2 id="change-password-title">Cambiar contraseña</h2>
          <p>Confirma tu correo y tu contraseña actual antes de crear una nueva.</p>
        </div>
      </header>

      {/* ETAPA 1: código. Este paso se muestra antes del formulario. */}
      <div className="change-password__verify">
        <div className="change-password__verify-header">
          <MailCheck size={21} aria-hidden="true" />
          <div>
            <strong>1. Código de seguridad</strong>
            <p>Enviaremos seis dígitos al correo de tu cuenta. El código dura 10 minutos.</p>
          </div>
        </div>

        {!codeSent ? (
          <button
            type="button"
            className="change-password__button"
            onClick={handleRequestCode}
            disabled={sendingCode}
          >
            {sendingCode ? "Enviando código..." : "Enviar código de verificación"}
          </button>
        ) : (
          <>
            <div className="change-password__field">
              <label htmlFor="change-password-code">Código de seis dígitos</label>
              <input
                id="change-password-code"
                className="change-password__code-input"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                disabled={saving}
                required
              />
              <p className="change-password__hint">
                {remainingSeconds > 0
                  ? `Vence en ${Math.floor(remainingSeconds / 60)}:${String(remainingSeconds % 60).padStart(2, "0")}.`
                  : "El código ha vencido. Solicita uno nuevo."}
              </p>
            </div>
            <button
              type="button"
              className="change-password__resend"
              onClick={handleRequestCode}
              disabled={sendingCode || saving || resendSeconds > 0}
            >
              {sendingCode ? "Enviando..." : resendSeconds > 0
                ? `Reenviar código en ${resendSeconds} s`
                : "Reenviar código"}
            </button>
          </>
        )}
        {requestMessage && <p className="change-password__success" role="status">{requestMessage}</p>}
      </div>

      {error && (
        <div className="change-password__error" role="alert">
          <p>{error}</p>
          {nextAllowedAt && <p>Podrás intentarlo nuevamente a partir del {nextAllowedAt} (hora de Chile).</p>}
        </div>
      )}

      {/* ETAPA 2: nunca habilitar hasta haber solicitado el código. */}
      {codeSent && (
        <form onSubmit={handleSubmit} noValidate>
          <h3 className="change-password__step-heading">2. Establece tu nueva contraseña</h3>
          <div className="change-password__field">
            <label htmlFor="change-password-current">Contraseña actual</label>
            <input id="change-password-current" type={inputType} autoComplete="current-password"
              value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} disabled={saving} required />
          </div>
          <div className="change-password__field">
            <label htmlFor="change-password-new">Nueva contraseña</label>
            <input id="change-password-new" type={inputType} autoComplete="new-password"
              value={newPassword} onChange={(event) => setNewPassword(event.target.value)} disabled={saving} required />
            <p className="change-password__hint">Utiliza al menos 12 caracteres, con mayúscula, minúscula, número y símbolo. No repitas la contraseña actual.</p>
          </div>
          <div className="change-password__field">
            <label htmlFor="change-password-confirm">Confirmar nueva contraseña</label>
            <input id="change-password-confirm" type={inputType} autoComplete="new-password"
              value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} disabled={saving} required />
          </div>

          <label className="change-password__visibility">
            <input type="checkbox" checked={showPasswords}
              onChange={(event) => setShowPasswords(event.target.checked)} disabled={saving} />
            {showPasswords ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
            Mostrar contraseñas
          </label>

          <div className="change-password__notice">
            <Info size={21} aria-hidden="true" />
            <div>
              <strong>Antes de confirmar</strong>
              <p>Después del cambio, deberás esperar <strong>24 horas</strong> para volver a modificar la contraseña.</p>
              <p>También se cerrará tu sesión y deberás iniciar sesión con la nueva contraseña.</p>
            </div>
          </div>

          <label className="change-password__agreement">
            <input type="checkbox" checked={acknowledged}
              onChange={(event) => setAcknowledged(event.target.checked)} disabled={saving} />
            <span>He leído y comprendo la información anterior.</span>
          </label>

          <button type="submit" className="change-password__button"
            disabled={saving || !acknowledged || code.length !== 6 || remainingSeconds <= 0}>
            {saving ? "Verificando y guardando..." : "Confirmar cambio de contraseña"}
          </button>
        </form>
      )}
    </section>
  );
}

export default ChangePasswordForm;
