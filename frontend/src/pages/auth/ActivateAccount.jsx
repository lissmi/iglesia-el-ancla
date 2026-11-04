// =========================================================
// ACTIVACIÓN DE CUENTA - IGLESIA EL ANCLA
// Archivo: frontend/src/pages/auth/ActivateAccount.jsx
// =========================================================

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  MailCheck,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

import api from "../../services/api";
import "../../styles/pages/auth/ActivateAccount.css";

// El token aparece solamente en el fragmento (#) del enlace del correo.
// Nunca se envía automáticamente al servidor al abrir la página.
function getTokenFromFragment() {
  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : "";
  return new URLSearchParams(hash).get("token") || "";
}

function ActivateAccount() {
  // Conservamos el token solo en memoria, sin localStorage ni cookies.
  const [token, setToken] = useState(getTokenFromFragment);
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState("");

  // Eliminamos el token de la barra de direcciones después de leerlo.
  useEffect(() => {
    if (window.location.hash) {
      window.history.replaceState(window.history.state, "", window.location.pathname);
    }
  }, []);

  // Misma política mínima de contraseñas que valida el backend.
  const passwordChecks = [
    { label: "Al menos 12 caracteres", valid: password.length >= 12 },
    { label: "Una letra mayúscula y una minúscula", valid: /[A-ZÁÉÍÓÚÑ]/u.test(password) && /[a-záéíóúñ]/u.test(password) },
    { label: "Un número y un símbolo especial", valid: /\d/u.test(password) && /[!@#$%^&*(),.?":{}|<>_\-+=/\\[\];'`~]/u.test(password) },
    { label: "Máximo de 72 bytes", valid: new TextEncoder().encode(password).length <= 72 },
  ];
  const isPasswordValid = passwordChecks.every((check) => check.valid);

  async function handleActivate(event) {
    event.preventDefault();
    setError("");
    if (busy || completed) return;
    if (!/^[A-Za-z0-9_-]{43}$/.test(token)) {
      setError("El enlace de invitación es inválido. Solicita uno nuevo al administrador.");
      return;
    }
    if (!isPasswordValid) {
      setError("Revisa los requisitos de seguridad de la contraseña.");
      return;
    }
    if (password !== repeatPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setBusy(true);
    try {
      const { data } = await api.post(
        "/auth/account-activation/complete",
        { token, newPassword: password },
        { timeout: 30000 }
      );
      if (!data?.success) throw new Error("No se pudo completar la activación.");

      // Borramos el token y ambas contraseñas de la memoria de React.
      setToken("");
      setPassword("");
      setRepeatPassword("");
      setCompleted(true);
    } catch (requestError) {
      setError(requestError.response?.data?.message ||
        requestError.message || "No se pudo activar la cuenta.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="activate-account-page">
      <section className="activate-account-card" aria-labelledby="activate-account-heading">
        <div className="activate-account-card__symbol">
          {completed ? <CheckCircle2 size={28} /> : <MailCheck size={28} />}
        </div>
        <span className="activate-account-card__eyebrow">IGLESIA EL ANCLA</span>
        <h1 id="activate-account-heading">
          {completed ? "¡Tu cuenta está lista!" : "Activa tu cuenta"}
        </h1>
        <p className="activate-account-card__intro">
          {completed
            ? "Tu correo está confirmado y tu contraseña se guardó de forma segura."
            : "Confirma tu invitación creando una contraseña que solo tú conozcas."}
        </p>

        {completed ? (
          <div className="activate-account-card__success" role="status">
            <CheckCircle2 size={21} />
            <div>
              <strong>Activación completada</strong>
              <p>Ya puedes iniciar sesión en tu espacio personal.</p>
              <Link to="/login" className="activate-account-card__submit">Ir a iniciar sesión</Link>
            </div>
          </div>
        ) : !/^[A-Za-z0-9_-]{43}$/.test(token) ? (
          <div className="activate-account-card__error" role="alert">
            <AlertCircle size={20} />
            <p>No encontramos una invitación válida en este enlace. Pídele al administrador que te envíe una nueva.</p>
          </div>
        ) : (
          <form onSubmit={handleActivate} noValidate>
            <label htmlFor="activate-password">Contraseña nueva</label>
            <div className="activate-account-card__password-field">
              <LockKeyhole size={17} aria-hidden="true" />
              <input
                id="activate-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                placeholder="Escribe tu contraseña segura"
                maxLength={128}
                required
              />
              <button type="button" onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            <div className="activate-account-card__requirements">
              {passwordChecks.map((check) => (
                <span key={check.label} className={check.valid ? "is-valid" : ""}>
                  <CheckCircle2 size={13} aria-hidden="true" /> {check.label}
                </span>
              ))}
            </div>

            <label htmlFor="activate-password-repeat">Repetir contraseña</label>
            <div className="activate-account-card__password-field">
              <KeyRound size={17} aria-hidden="true" />
              <input
                id="activate-password-repeat"
                type={showPassword ? "text" : "password"}
                value={repeatPassword}
                onChange={(event) => setRepeatPassword(event.target.value)}
                autoComplete="new-password"
                placeholder="Escríbela nuevamente"
                maxLength={128}
                required
              />
            </div>

            {error && (
              <div className="activate-account-card__error" role="alert">
                <AlertCircle size={18} aria-hidden="true" />
                <p>{error}</p>
              </div>
            )}

            <button type="submit" className="activate-account-card__submit"
              disabled={busy || !isPasswordValid || password !== repeatPassword || !repeatPassword}>
              <ShieldCheck size={18} aria-hidden="true" />
              {busy ? "Activando cuenta..." : "Confirmar y activar mi cuenta"}
            </button>
            <p className="activate-account-card__privacy">
              <LockKeyhole size={14} aria-hidden="true" />
              Nunca compartiremos tu contraseña con los administradores.
            </p>
          </form>
        )}
      </section>
    </main>
  );
}

export default ActivateAccount;
