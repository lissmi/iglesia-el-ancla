// =========================================================
// CAMBIO DE CONTRASEÑA CON VERIFICACIÓN POR CORREO
// =========================================================
// POST /api/auth/change-password/request-code
// POST /api/auth/change-password
// Para super_admin y admin; no permite cambiar otras cuentas.

import { Router } from "express";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";

import User from "../models/User.js";
import authenticateUser from "../middleware/authenticateUser.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import { comparePassword, hashPassword, validatePassword } from "../utils/passwordUtils.js";
import {
  AUTH_COOKIE_NAME,
  getAuthCookieClearOptions,
} from "../utils/tokenUtils.js";
import {
  sendPasswordChangeCode,
  checkPasswordChangeCode,
  consumePasswordChangeCode,
} from "../services/mail/passwordChangeVerificationService.js";

const router = Router();
const PASSWORD_CHANGE_COOLDOWN_MS = 24 * 60 * 60 * 1000;

const requestCodeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, message: "Demasiadas solicitudes de código. Intenta más tarde" },
});

const passwordChangeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  message: {
    success: false,
    message: "Se realizaron demasiados intentos de cambio. Inténtalo más tarde",
  },
});

function requireTrustedOrigin(req, res, next) {
  const expected = process.env.FRONTEND_URL || "http://localhost:3000";
  if (req.get("Origin") !== expected) {
    return res.status(403).json({ success: false, message: "Origen de la solicitud no autorizado" });
  }
  return next();
}

function respondWithError(res, error, next) {
  res.set("Cache-Control", "no-store");
  if (error.code === "PASSWORD_CODE_COOLDOWN") {
    return res.status(429).json({ success: false, code: error.code, message: "Espera 60 segundos antes de solicitar otro código" });
  }
  if (error.code === "PASSWORD_CODE_INVALID") {
    return res.status(400).json({ success: false, code: error.code, message: "Código de seguridad incorrecto, vencido o agotado" });
  }
  if (error.code === "PASSWORD_EMAIL_UNVERIFIED" || error.code === "PASSWORD_EMAIL_UNAVAILABLE") {
    return res.status(409).json({ success: false, code: error.code, message: error.message });
  }
  if (error.code === "PASSWORD_ROLE_DENIED") {
    return res.status(403).json({ success: false, message: "Operación no autorizada" });
  }
  if (error.code === "PASSWORD_SESSION_INVALID") {
    return res.status(401).json({ success: false, message: "Sesión no válida" });
  }
  if (error.code === "PASSWORD_EMAIL_SEND_FAILED") {
    return res.status(503).json({ success: false, message: "No fue posible enviar el código. Intenta más tarde" });
  }
  if (error.code === "PASSWORD_CONCURRENT_CHANGE") {
    return res.status(409).json({ success: false, message: "La cuenta cambió durante la operación. Inicia sesión nuevamente" });
  }
  return next(error);
}

// Protecciones comunes a las dos operaciones.
// authenticateUser identifica la cuenta desde la cookie HttpOnly.
router.use(
  authenticateUser,
  authorizeRoles("super_admin", "admin", "member"),
  requireTrustedOrigin
);

// =========================================================
// 1. ENVIAR CÓDIGO AL CORREO DE LA CUENTA ACTUAL
// =========================================================
router.post("/change-password/request-code", requestCodeLimiter, async (req, res, next) => {
  try {
    if (!req.is("application/json") || !req.body ||
        typeof req.body !== "object" || Array.isArray(req.body) ||
        Object.keys(req.body).length !== 0) {
      return res.status(400).json({ success: false, message: "La solicitud no debe incluir datos personales" });
    }

    const result = await sendPasswordChangeCode({
      userId: req.user._id,
      sessionToken: req.cookies?.[AUTH_COOKIE_NAME],
    });

    res.set("Cache-Control", "no-store");
    return res.status(200).json({
      success: true,
      message: "Enviamos un código al correo registrado de tu cuenta",
      expiresAt: result.expiresAt,
      resendAfterSeconds: result.resendAfterSeconds,
    });
  } catch (error) {
    return respondWithError(res, error, next);
  }
});

// =========================================================
// 2. CONTRASEÑA ACTUAL + CÓDIGO + CONTRASEÑA NUEVA
// =========================================================
router.post("/change-password", passwordChangeLimiter, async (req, res, next) => {
  try {
    const body = req.body;
    if (!req.is("application/json") || !body || typeof body !== "object" || Array.isArray(body)) {
      return res.status(400).json({ success: false, message: "Datos inválidos" });
    }

    const keys = Object.keys(body);
    const expected = ["currentPassword", "newPassword", "code"];
    if (keys.length !== expected.length || expected.some((key) => !Object.hasOwn(body, key))) {
      return res.status(400).json({
        success: false,
        message: "Debes indicar la contraseña actual, la nueva contraseña y el código de seguridad",
      });
    }

    const { currentPassword, newPassword, code } = body;
    if (typeof currentPassword !== "string" || typeof newPassword !== "string" ||
        typeof code !== "string" || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ success: false, message: "Contraseñas o código no válidos" });
    }
    if (!currentPassword || Buffer.byteLength(currentPassword, "utf8") > 72) {
      return res.status(400).json({ success: false, message: "La contraseña actual no es válida" });
    }
    if (newPassword.length < 12 || newPassword.length > 128 ||
        Buffer.byteLength(newPassword, "utf8") > 72) {
      return res.status(400).json({
        success: false,
        message: "La contraseña nueva debe tener al menos 12 caracteres y no superar 72 bytes",
      });
    }

    // Respetamos exactamente la política compartida en passwordUtils.js.
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.errors.join(". "),
      });
    }

    const user = await User.findById(req.user._id).select(
      "+passwordHash +tokenVersion +passwordChangedAt"
    );
    if (!user || !user.isActive || !["super_admin", "admin", "member"].includes(user.role)) {
      return res.status(401).json({ success: false, message: "La sesión ya no es válida" });
    }
    if (!user.emailVerifiedAt) {
      return res.status(409).json({
        success: false,
        message: "La cuenta debe tener su correo verificado para cambiar la contraseña",
      });
    }

    // Nunca permitimos cambiar la contraseña solo por conocer el OTP.
    const currentIsCorrect = await comparePassword(currentPassword, user.passwordHash);
    if (!currentIsCorrect) {
      return res.status(401).json({ success: false, message: "La contraseña actual es incorrecta" });
    }

    const now = new Date();
    const nextAllowedAt = user.passwordChangedAt
      ? new Date(user.passwordChangedAt.getTime() + PASSWORD_CHANGE_COOLDOWN_MS)
      : null;
    if (!user.mustChangePassword && nextAllowedAt && nextAllowedAt > now) {
      const retryAfterSeconds = Math.ceil((nextAllowedAt - now) / 1000);
      res.set("Retry-After", String(retryAfterSeconds));
      res.set("Cache-Control", "no-store");
      return res.status(429).json({
        success: false,
        code: "PASSWORD_CHANGE_COOLDOWN",
        message: "Por seguridad, debes esperar 24 horas entre cambios de contraseña",
        nextAllowedAt: nextAllowedAt.toISOString(),
      });
    }

    if (await comparePassword(newPassword, user.passwordHash)) {
      return res.status(400).json({
        success: false,
        message: "La contraseña nueva debe ser distinta de la anterior",
      });
    }

    const sessionToken = req.cookies?.[AUTH_COOKIE_NAME];

    // Primero comprobamos el código. Si es incorrecto, aumentamos
    // el contador sin iniciar una transacción que luego se abortaría.
    await checkPasswordChangeCode({
      userId: user._id,
      email: user.email,
      sessionToken,
      code,
    });

    // bcrypt se ejecuta fuera de la transacción para reducir su duración.
    const newPasswordHash = await hashPassword(newPassword);
    const mongoSession = await mongoose.startSession();
    try {
      await mongoSession.withTransaction(async () => {
        // El código se consume junto con el cambio de contraseña:
        // o ambos se confirman, o ninguno queda confirmado.
        await consumePasswordChangeCode({
          userId: user._id,
          email: user.email,
          sessionToken,
          code,
          mongoSession,
        });

        // La versión del JWT impide modificar una cuenta que cambió
        // concurrentemente desde otra sesión.
        const priorVersion = user.tokenVersion ?? 0;
        const result = await User.updateOne(
          {
            _id: user._id,
            tokenVersion: priorVersion,
            isActive: true,
            role: { $in: ["admin", "super_admin", "member"] },
            email: user.email,
          },
          {
            $set: {
              passwordHash: newPasswordHash,
              passwordChangedAt: now,
              mustChangePassword: false,
            },
            $inc: { tokenVersion: 1 },
          },
          { session: mongoSession }
        );
        if (result.modifiedCount !== 1) {
          throw Object.assign(new Error("Cambio concurrente de cuenta"), {
            code: "PASSWORD_CONCURRENT_CHANGE",
          });
        }
      });
    } finally {
      await mongoSession.endSession();
    }

    // Todas las cookies JWT anteriores quedan revocadas mediante tokenVersion.
    res.clearCookie(AUTH_COOKIE_NAME, getAuthCookieClearOptions());
    res.set("Cache-Control", "no-store");
    return res.status(200).json({
      success: true,
      message: "Contraseña actualizada. Inicia sesión nuevamente",
      requiresLogin: true,
      nextAllowedAt: new Date(now.getTime() + PASSWORD_CHANGE_COOLDOWN_MS).toISOString(),
    });
  } catch (error) {
    return respondWithError(res, error, next);
  }
});

export default router;
