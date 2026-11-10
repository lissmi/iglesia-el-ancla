// =========================================================
// RECUPERACIÓN PÚBLICA DE CONTRASEÑAS — EL ANCLA
// =========================================================
// No requiere sesión, pero sí limita solicitudes y comprueba el origen.

import { Router } from "express";
import rateLimit from "express-rate-limit";
import { validatePassword } from "../utils/passwordUtils.js";
import { AUTH_COOKIE_NAME, getAuthCookieClearOptions } from "../utils/tokenUtils.js";
import { requestPasswordRecovery, completePasswordRecovery } from "../services/mail/passwordRecoveryService.js";
import {
  REQUEST_MESSAGE,
  isValidRecoveryEmail,
  isValidRecoveryCode,
  normalizeRecoveryEmail,
} from "../services/mail/passwordRecoveryPolicy.js";

// Creamos el router independiente del cambio de contraseña autenticado.
const router = Router();

// Reducimos la posibilidad de envío masivo desde una sola dirección IP.
const requestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, message: "Se realizaron demasiadas solicitudes. Intenta más tarde." },
});

// Limitamos igualmente los intentos de canje de códigos por IP.
const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, message: "Se realizaron demasiados intentos. Intenta más tarde." },
});

// No aceptamos operaciones mutables desde un origen ajeno al frontend.
function requireTrustedOrigin(req, res, next) {
  try {
    const trusted = new URL(process.env.FRONTEND_URL || "http://localhost:3000").origin;
    if (req.get("Origin") !== trusted) {
      return res.status(403).json({ success: false, message: "Origen no autorizado." });
    }
    return next();
  } catch {
    return res.status(403).json({ success: false, message: "Origen no autorizado." });
  }
}

// Validamos JSON estricto: solo campos previstos, sin roles ni identificadores.
function hasExactFields(req, names) {
  if (!req.is("application/json") || !req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return false;
  }
  const keys = Object.keys(req.body);
  return keys.length === names.length && names.every((name) => Object.hasOwn(req.body, name));
}

// Aplicamos seguridad transversal a las dos rutas.
router.use(requireTrustedOrigin);
router.use((_req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

// =========================================================
// 1. PEDIR CÓDIGO SIN REVELAR SI EL CORREO EXISTE
// POST /api/auth/recovery/request
// =========================================================
router.post("/request", requestLimiter, async (req, res, next) => {
  try {
    if (!hasExactFields(req, ["email"])) {
      return res.status(400).json({ success: false, message: "Ingresa un correo electrónico válido." });
    }
    const email = normalizeRecoveryEmail(req.body.email);
    if (!isValidRecoveryEmail(email)) {
      return res.status(400).json({ success: false, message: "Ingresa un correo electrónico válido." });
    }

    // La duración mínima reduce diferencias medibles entre cuentas.
    // Gmail puede tardar más en algunos casos; hay que monitorear esa latencia.
    const startedAt = Date.now();

    // Nunca indicamos si la cuenta existe ni si tenía correo verificado.
    await requestPasswordRecovery(email);

    // Evitamos una respuesta casi instantánea para un correo desconocido.
    const remainingMs = Math.max(0, 1800 - (Date.now() - startedAt));
    if (remainingMs) await new Promise((resolve) => setTimeout(resolve, remainingMs));

    return res.status(200).json({ success: true, message: REQUEST_MESSAGE });
  } catch (error) {
    // Los fallos de infraestructura tienen una respuesta genérica.
    console.error("La solicitud de recuperación no pudo procesarse.");
    return res.status(503).json({ success: false, message: "No pudimos procesar tu solicitud. Intenta más tarde." });
  }
});

// =========================================================
// 2. CANJEAR CÓDIGO + CREAR CONTRASEÑA SEGURA
// POST /api/auth/recovery/reset
// =========================================================
router.post("/reset", resetLimiter, async (req, res, next) => {
  try {
    if (!hasExactFields(req, ["email", "code", "newPassword"])) {
      return res.status(400).json({ success: false, message: "Completa los campos solicitados." });
    }
    const { code, newPassword } = req.body;
    const email = normalizeRecoveryEmail(req.body.email);

    if (!isValidRecoveryEmail(email) || !isValidRecoveryCode(code) ||
        typeof newPassword !== "string" || newPassword.length > 128) {
      return res.status(400).json({ success: false, message: "Revisa el correo, el código y la contraseña." });
    }

    // La política es la misma de activación y cambio de contraseña.
    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      return res.status(400).json({ success: false, message: validation.errors.join(". ") });
    }

    // Solo Gmail puede proporcionar el código que permite el cambio.
    await completePasswordRecovery({ rawEmail: email, code, newPassword });

    // Se cierran las sesiones anteriores; no iniciamos sesión automáticamente.
    res.clearCookie(AUTH_COOKIE_NAME, getAuthCookieClearOptions());
    return res.status(200).json({
      success: true,
      message: "¡Tu contraseña está lista! Ya puedes volver a iniciar sesión en El Ancla 💙",
    });
  } catch (error) {
    // Código incorrecto, agotado o ya usado: misma respuesta.
    if (error?.code === "RECOVERY_CODE_INVALID") {
      return res.status(400).json({ success: false, message: "El código es incorrecto, venció o ya fue utilizado." });
    }
    // No permitimos volver a establecer la clave anterior.
    if (error?.code === "RECOVERY_PASSWORD_REUSED") {
      return res.status(400).json({ success: false, message: error.message });
    }
    return next(error);
  }
});

// Exportamos únicamente las rutas protegidas.
export default router;
