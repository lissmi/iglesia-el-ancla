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
  ArrowLeft,
} from "lucide-react";

// Se conserva el cliente HTTP existente del proyecto.
import api from "../../services/api";

// El aviso completo vive en un componente separado y reutilizable.
import ActivationLegalNotice from "../../components/auth/ActivationLegalNotice";

// Mantenemos los estilos originales de la página de activación.
import "../../styles/pages/auth/ActivateAccount.css";

// El token aparece en el fragmento (#) del enlace del correo.
// Nunca se envía automáticamente al servidor al abrir la página.
function getTokenFromFragment() {
  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : "";
  return new URLSearchParams(hash).get("token") || "";
}

function ActivateAccount() {
  // Guardamos el token temporal en memoria, nunca en localStorage.
  const [token, setToken] = useState(getTokenFromFragment);
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState("");

  // Primero se revisan las condiciones; después aparece la contraseña.
  const [step, setStep] = useState("legal");
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [legal, setLegal] = useState(null);
  const [legalLoading, setLegalLoading] = useState(true);
  const [legalError, setLegalError] = useState("");

  const isTokenValid = /^[A-Za-z0-9_-]{43}$/.test(token);

  // Quitamos el token de la barra del navegador tras obtenerlo.
  useEffect(() => {
    if (window.location.hash) {
      window.history.replaceState(
        window.history.state, "", window.location.pathname
      );
    }
  }, []);

  // El texto y su versión proceden del servidor, no de un checkbox local.
  useEffect(() => {
    let active = true;
    if (!isTokenValid) {
      setLegalLoading(false);
      return undefined;
    }

    api.get("/auth/account-activation/legal", { timeout: 15000 })
      .then(({ data }) => {
        if (!active) return;
        if (!data?.success || typeof data.version !== "string" ||
            !Array.isArray(data.dataNotice) ||
            !Array.isArray(data.securityParagraphs) ||
            data.securityParagraphs.length < 6 ||
            typeof data.acknowledgement !== "string") {
          throw new Error("El aviso de privacidad no está disponible.");
        }
        setLegal(data);
      })
      .catch(() => {
        if (active) {
          setLegalError("No fue posible consultar los términos y el aviso de privacidad. Vuelve a intentarlo más tarde.");
        }
      })
      .finally(() => {
        if (active) setLegalLoading(false);
      });

    // Evitamos cambios de estado si la página se desmontó.
    return () => { active = false; };
  }, [isTokenValid]);

  // Reproducimos los mismos criterios visuales del formulario anterior.
  const passwordChecks = [
    { label: "Al menos 12 caracteres", valid: password.length >= 12 },
    { label: "Una letra mayúscula y una minúscula", valid: /[A-ZÁÉÍÓÚÑ]/u.test(password) && /[a-záéíóúñ]/u.test(password) },
    { label: "Un número y un símbolo especial", valid: /\d/u.test(password) && /[!@#$%^&*(),.?":{}|<>_\-+=/\\[\];'`~]/u.test(password) },
    { label: "Máximo de 72 bytes", valid: new TextEncoder().encode(password).length <= 72 },
  ];
  const isPasswordValid = passwordChecks.every((check) => check.valid);

  // El primer botón solo habilita el paso de contraseña en React.
  // El backend volverá a verificar la aceptación al activar la cuenta.
  function handleLegalContinue() {
    if (!legal || !legalAccepted || busy) return;
    setError("");
    setStep("password");
  }

  async function handleActivate(event) {
    event.preventDefault();
    setError("");
    if (busy || completed) return;
    if (!isTokenValid) {
      setError("El enlace de invitación es inválido. Solicita uno nuevo al administrador.");
      return;
    }
    if (step !== "password" || !legalAccepted || !legal?.version) {
      setError("Debes revisar y aceptar los Términos y Condiciones antes de continuar.");
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
      // Además del token, enviamos la confirmación y versión visible.
      // El servidor es quien decide si esa versión aún es válida.
      const { data } = await api.post(
        "/auth/account-activation/complete",
        {
          token,
          newPassword: password,
          acceptedLegalTerms: true,
          documentVersion: legal.version,
        },
        { timeout: 30000 }
      );
      if (!data?.success) throw new Error("No se pudo completar la activación.");

      // Eliminamos las contraseñas y el token del estado de React.
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
      <section
        className={`activate-account-card${step === "legal" && !completed ? " activate-account-card--legal" : ""}`}
        aria-labelledby="activate-account-heading"
      >
        <div className="activate-account-card__symbol">
          {completed ? <CheckCircle2 size={28} /> : <MailCheck size={28} />}
        </div>
        <span className="activate-account-card__eyebrow">IGLESIA EL ANCLA</span>
        <h1 id="activate-account-heading">
          {completed ? "¡Tu cuenta está lista!" : step === "legal" ? "Antes de activar tu cuenta" : "Crea tu contraseña"}
        </h1>
        <p className="activate-account-card__intro">
          {completed
            ? "Tu correo está confirmado y tu contraseña se guardó de forma segura."
            : step === "legal"
              ? "Conoce cómo utilizaremos tus datos y revisa las condiciones antes de decidir."
              : "Ya revisaste las condiciones. Confirma tu invitación creando una contraseña que solo tú conozcas."}
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
        ) : !isTokenValid ? (
          <div className="activate-account-card__error" role="alert">
            <AlertCircle size={20} />
            <p>No encontramos una invitación válida en este enlace. Pídele al administrador que te envíe una nueva.</p>
          </div>
        ) : step === "legal" ? (
          legalLoading ? (
            <p role="status">Consultando las condiciones de activación...</p>
          ) : legalError || !legal ? (
            <div className="activate-account-card__error" role="alert">
              <AlertCircle size={19} aria-hidden="true" />
              <p>{legalError || "No fue posible obtener las condiciones de activación."}</p>
            </div>
          ) : (
            <ActivationLegalNotice
              legal={legal}
              accepted={legalAccepted}
              onAcceptedChange={setLegalAccepted}
              onContinue={handleLegalContinue}
            />
          )
        ) : (
          <form onSubmit={handleActivate} noValidate>
            <button
              type="button"
              className="activate-account-card__back"
              onClick={() => setStep("legal")}
              disabled={busy}
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Volver a revisar las condiciones
            </button>

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
              disabled={busy || !legalAccepted || !isPasswordValid || password !== repeatPassword || !repeatPassword}>
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
