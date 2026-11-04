// =========================================================
// ACTIVACIÓN SEGURA DE CUENTAS - IGLESIA EL ANCLA
// Archivo: backend/src/routes/accountActivationRoutes.js
// =========================================================

// Router público: el nuevo miembro todavía no tiene sesión.
import { Router } from "express";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import { createHash } from "node:crypto";

import User from "../models/User.js";
import EmailVerificationCode from "../models/EmailVerificationCode.js";
import { hashPassword, validatePassword } from "../utils/passwordUtils.js";

const router = Router();

// Limitamos intentos por dirección IP para proteger el endpoint público.
const activationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Demasiados intentos de activación. Intenta más tarde.",
  },
});

// La activación requiere una petición de la web institucional autorizada.
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

// Mensaje idéntico para tokens desconocidos, vencidos y ya utilizados.
const INVALID_LINK = "El enlace es inválido, ha vencido o ya fue utilizado. Solicita una nueva invitación al administrador.";

// POST /api/auth/account-activation/complete
router.post("/complete", requireTrustedOrigin, activationLimiter, async (req, res, next) => {
  try {
    res.set("Cache-Control", "no-store");

    // Nunca aceptamos campos de autorización ni identificadores de usuario.
    if (!req.is("application/json") || !req.body ||
        typeof req.body !== "object" || Array.isArray(req.body) ||
        Object.keys(req.body).length !== 2 ||
        !Object.hasOwn(req.body, "token") ||
        !Object.hasOwn(req.body, "newPassword")) {
      return res.status(400).json({ success: false, message: "Solicitud de activación no válida." });
    }

    const { token, newPassword } = req.body;
    if (typeof token !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(token) ||
        typeof newPassword !== "string") {
      return res.status(400).json({ success: false, message: "Datos de activación no válidos." });
    }

    // Respetamos la misma política usada por el cambio de contraseña.
    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      return res.status(400).json({ success: false, message: validation.errors.join(". ") });
    }

    // No se almacena ni registra el token de activación en texto claro.
    const codeHash = createHash("sha256").update(token).digest("hex");
    const now = new Date();

    // Comprobamos primero que el enlace todavía es utilizable.
    const challenge = await EmailVerificationCode.findOne({
      purpose: "verify_email",
      codeHash,
      consumedAt: null,
      expiresAt: { $gt: now },
    }).lean();

    if (!challenge) {
      return res.status(400).json({ success: false, message: INVALID_LINK });
    }

    // Comprobamos que corresponda a una cuenta realmente pendiente.
    const user = await User.findById(challenge.user)
      .select("email role isActive emailVerifiedAt deactivatedAt mustChangePassword")
      .lean();

    if (!user || user.email !== challenge.email || user.isActive ||
        user.emailVerifiedAt || user.deactivatedAt || !user.mustChangePassword ||
        !["member", "admin"].includes(user.role)) {
      return res.status(400).json({ success: false, message: INVALID_LINK });
    }

    // Calculamos el hash bcrypt fuera de la transacción.
    const passwordHash = await hashPassword(newPassword);

    const session = await mongoose.startSession();
    try {
      // Consumimos el enlace y habilitamos la cuenta de forma atómica.
      await session.withTransaction(async () => {
        const consumed = await EmailVerificationCode.findOneAndDelete(
          {
            _id: challenge._id,
            purpose: "verify_email",
            codeHash,
            consumedAt: null,
            expiresAt: { $gt: new Date() },
          },
          { session }
        );

        if (!consumed) {
          const conflict = new Error(INVALID_LINK);
          conflict.status = 409;
          throw conflict;
        }

        const result = await User.updateOne(
          {
            _id: challenge.user,
            email: challenge.email,
            role: { $in: ["member", "admin"] },
            isActive: false,
            emailVerifiedAt: null,
            deactivatedAt: null,
            mustChangePassword: true,
          },
          {
            $set: {
              passwordHash,
              emailVerifiedAt: new Date(),
              isActive: true,
              mustChangePassword: false,
              passwordChangedAt: new Date(),
            },
            $inc: { tokenVersion: 1 },
          },
          { session }
        );

        if (result.modifiedCount !== 1) {
          const conflict = new Error(INVALID_LINK);
          conflict.status = 409;
          throw conflict;
        }
      });
    } finally {
      await session.endSession();
    }

    // No iniciamos sesión automáticamente después de activar la cuenta.
    return res.status(200).json({
      success: true,
      message: "Tu correo fue confirmado y tu contraseña quedó creada. Ahora puedes iniciar sesión.",
    });
  } catch (error) {
    if (error?.status === 409) {
      return res.status(409).json({ success: false, message: INVALID_LINK });
    }
    return next(error);
  }
});

export default router;
