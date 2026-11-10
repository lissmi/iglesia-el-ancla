// =========================================================
// RECUPERAR CONTRASEÑA — IGLESIA EL ANCLA
// =========================================================
// Pantalla pública: no requiere sesión ni expone datos de cuentas.

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, LockKeyhole,
  Mail, ShieldCheck, Anchor, RefreshCw,
} from "lucide-react";

// Centralizamos las peticiones HTTP con cookies y URL ya configuradas.
import api from "../../services/api";

// Los estilos mantienen la paleta azul y arena de El Ancla.
import "../../styles/pages/auth/ForgotPassword.css";

// Comprobamos los requisitos visibles; el backend valida otra vez.
function passwordRequirements(password) {
  // TextEncoder permite medir bytes reales utilizados por bcrypt.
  const byteLength = new TextEncoder().encode(password).length;
  return [
    { label: "12 caracteres como mínimo", valid: password.length >= 12 },
    { label: "Mayúscula y minúscula", valid: /[A-ZÁÉÍÓÚÑ]/u.test(password) && /[a-záéíóúñ]/u.test(password) },
    { label: "Número y símbolo especial", valid: /\d/u.test(password) && /[!@#$%^&*(),.?":{}|<>_\-+=/\\[\];'`~]/u.test(password) },
    { label: "Máximo 72 bytes", valid: byteLength <= 72 },
  ];
}

// Normalizamos mensajes de API sin mostrar detalles internos.
function friendlyApiError(error, fallback) {
  return error?.response?.data?.message || fallback;
}

// Usamos un único formulario de tres estados para mantener simple el flujo.
export default function ForgotPassword() {
  // Paso: solicitar código, ingresarlo, o mostrar éxito.
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resendSeconds, setResendSeconds] = useState(0);

  // Restamos un segundo cada vez hasta permitir otro envío.
  useEffect(() => {
    if (resendSeconds === 0) return;
    const timer = window.setTimeout(() => setResendSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [resendSeconds]);

  // Validaciones visuales dinámicas de la contraseña nueva.
  const checks = passwordRequirements(password);
  const canSave = checks.every((item) => item.valid) && password === confirmation && /^\d{6}$/.test(code);

  // Solicitamos el código sin preguntar si la cuenta existe.
  async function handleRequest(event) {
    event.preventDefault();
    if (busy) return;
    setError("");
    setMessage("");
    const safeEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(safeEmail)) {
      setError("Escribe una dirección de correo válida para continuar.");
      return;
    }
    setBusy(true);
    try {
      const response = await api.post("/auth/recovery/request", { email: safeEmail }, { timeout: 30000 });
      setEmail(safeEmail);
      setStep("code");
      setMessage(response.data?.message || "Si la cuenta existe, recibirás un código por correo.");
      setResendSeconds(60);
    } catch (requestError) {
      setError(friendlyApiError(requestError, "No pudimos enviar tu solicitud. Intenta más tarde."));
    } finally {
      setBusy(false);
    }
  }

  // Reutilizamos el endpoint de solicitud para el reenvío.
  async function handleResend() {
    if (busy || resendSeconds > 0) return;
    setError("");
    setBusy(true);
    try {
      const response = await api.post("/auth/recovery/request", { email }, { timeout: 30000 });
      setMessage(response.data?.message || "Si la cuenta existe, recibirás un código por correo.");
      setResendSeconds(60);
      setCode("");
    } catch (requestError) {
      setError(friendlyApiError(requestError, "No fue posible solicitar otro código."));
    } finally {
      setBusy(false);
    }
  }

  // Solo enviamos correo, código y nueva contraseña al backend.
  async function handleReset(event) {
    event.preventDefault();
    setError("");
    if (busy) return;
    if (!canSave) {
      setError("Revisa el código, los requisitos de seguridad y que ambas contraseñas coincidan.");
      return;
    }
    setBusy(true);
    try {
      await api.post("/auth/recovery/reset", { email, code, newPassword: password }, { timeout: 30000 });
      // Borramos el secreto y las contraseñas del estado de React.
      setCode("");
      setPassword("");
      setConfirmation("");
      setStep("complete");
      setMessage("");
    } catch (requestError) {
      setError(friendlyApiError(requestError, "No pudimos recuperar tu contraseña. Revisa el código e intenta nuevamente."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="forgot-password-page">
      <div className="forgot-password-page__wrapper">
        <Link to="/login" className="forgot-password-page__back">
          <ArrowLeft size={17} aria-hidden="true" /> Volver al inicio de sesión
        </Link>
        <section className="forgot-password-card" aria-labelledby="forgot-password-title">
          <div className="forgot-password-card__icon" aria-hidden="true">
            {step === "complete" ? <CheckCircle2 size={26} /> : <Anchor size={28} />}
          </div>
          <span className="forgot-password-card__eyebrow">IGLESIA EL ANCLA · TU ESPACIO SEGURO</span>
          <h1 id="forgot-password-title">
            {step === "email" ? "¿Olvidaste tu contraseña?" :
              step === "code" ? "Recuperemos tu acceso" : "¡Tu acceso está listo!"}
          </h1>
          <p className="forgot-password-card__intro">
            {step === "email" ? "No te preocupes. Te acompañamos para volver a entrar a tu espacio en comunidad. 💙" :
              step === "code" ? "Revisa tu correo e ingresa el código de seis dígitos. Luego elige una nueva contraseña." :
                "Tu contraseña se actualizó correctamente. Ya puedes volver a tu espacio en El Ancla."}
          </p>

          {step === "email" && (
            <form onSubmit={handleRequest} noValidate>
              <label htmlFor="recovery-email">Correo electrónico de tu cuenta</label>
              <div className="forgot-password-card__field">
                <Mail size={18} aria-hidden="true" />
                <input id="recovery-email" type="email" autoComplete="email" inputMode="email"
                  required maxLength={254} placeholder="tu.correo@ejemplo.com"
                  value={email} onChange={(event) => setEmail(event.target.value)} />
              </div>
              <p className="forgot-password-card__hint">Si tu correo está registrado y verificado, recibirás un código temporal.</p>
              {error && <p className="forgot-password-card__error" role="alert">{error}</p>}
              <button className="forgot-password-card__primary" type="submit" disabled={busy}>
                <Mail size={18} aria-hidden="true" /> {busy ? "Enviando solicitud..." : "Enviar código a mi correo"}
              </button>
            </form>
          )}

          {step === "code" && (
            <form onSubmit={handleReset} noValidate>
              {message && <p className="forgot-password-card__info" role="status">{message}</p>}
              <label htmlFor="recovery-code">Código de verificación</label>
              <div className="forgot-password-card__field">
                <KeyRound size={18} aria-hidden="true" />
                <input id="recovery-code" className="forgot-password-card__code" type="text"
                  inputMode="numeric" pattern="[0-9]{6}" autoComplete="one-time-code" maxLength={6}
                  placeholder="000000" value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} required />
              </div>
              <p className="forgot-password-card__hint">El código dura 10 minutos. Nunca lo compartas.</p>
              <label htmlFor="recovery-new-password">Nueva contraseña</label>
              <div className="forgot-password-card__field">
                <LockKeyhole size={18} aria-hidden="true" />
                <input id="recovery-new-password" type={showPassword ? "text" : "password"}
                  autoComplete="new-password" placeholder="Crea una contraseña segura" maxLength={128}
                  value={password} onChange={(event) => setPassword(event.target.value)} required />
                <button type="button" className="forgot-password-card__eye"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  onClick={() => setShowPassword((value) => !value)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="forgot-password-card__checks" aria-label="Requisitos de contraseña">
                {checks.map((item) => (
                  <span key={item.label} className={item.valid ? "is-valid" : ""}>
                    <CheckCircle2 size={13} aria-hidden="true" /> {item.label}
                  </span>
                ))}
              </div>
              <label htmlFor="recovery-confirm-password">Confirmar nueva contraseña</label>
              <div className="forgot-password-card__field">
                <ShieldCheck size={18} aria-hidden="true" />
                <input id="recovery-confirm-password" type={showPassword ? "text" : "password"}
                  autoComplete="new-password" placeholder="Repítela para confirmar" maxLength={128}
                  value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required />
              </div>
              {confirmation && confirmation !== password && (
                <p className="forgot-password-card__error" role="status">Las contraseñas todavía no coinciden.</p>
              )}
              {error && <p className="forgot-password-card__error" role="alert">{error}</p>}
              <button className="forgot-password-card__primary" type="submit" disabled={busy || !canSave}>
                <ShieldCheck size={18} aria-hidden="true" /> {busy ? "Guardando..." : "Crear nueva contraseña"}
              </button>
              <button className="forgot-password-card__secondary" type="button"
                disabled={busy || resendSeconds > 0} onClick={handleResend}>
                <RefreshCw size={16} aria-hidden="true" /> {resendSeconds > 0 ? `Solicitar otro código en ${resendSeconds}s` : "Solicitar otro código"}
              </button>
              <button className="forgot-password-card__text-button" type="button" onClick={() => {
                setStep("email"); setError(""); setMessage(""); setCode("");
                setPassword(""); setConfirmation("");
              }}>Usar otro correo electrónico</button>
            </form>
          )}

          {step === "complete" && (
            <div className="forgot-password-card__complete" role="status">
              <CheckCircle2 size={34} aria-hidden="true" />
              <p>Por tu seguridad, las sesiones anteriores se cerraron. Inicia sesión con tu nueva contraseña.</p>
              <Link to="/login" className="forgot-password-card__primary">Ir a iniciar sesión</Link>
            </div>
          )}
          <p className="forgot-password-card__footer">Estamos felices de tenerte en nuestra comunidad ⚓</p>
        </section>
      </div>
    </main>
  );
}
