// =========================================================
// SEGUNDO FACTOR PARA CAMBIOS DE CONTRASEÑA
// =========================================================
// Reutiliza EmailVerificationCode (purpose: password_change).
// No utiliza una colección de autorizaciones adicional.

import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import mongoose from "mongoose";

import User from "../../models/User.js";
import EmailVerificationCode from "../../models/EmailVerificationCode.js";
import { sendInstitutionalEmail } from "./gmailService.js";

const PURPOSE = "password_change";
const CODE_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;
const ALLOWED_ROLES = ["super_admin", "admin", "member"];

function securityError(code, message) {
  return Object.assign(new Error(message), { code });
}

function signingKey() {
  const encoded = process.env.EMAIL_VERIFICATION_HMAC_KEY;
  if (typeof encoded !== "string" || !/^[A-Za-z0-9+/]{43}=$/.test(encoded)) {
    throw new Error("EMAIL_VERIFICATION_HMAC_KEY debe ser base64 de 32 bytes");
  }
  const key = Buffer.from(encoded, "base64");
  if (key.length !== 32) throw new Error("La clave HMAC no es válida");
  return key;
}

function validateSessionToken(sessionToken) {
  // Recibir siempre desde req.cookies[AUTH_COOKIE_NAME], nunca desde React.
  if (typeof sessionToken !== "string" || !sessionToken) {
    throw securityError("PASSWORD_SESSION_INVALID", "La sesión no es válida");
  }
}

function validateUserId(userId) {
  if (!mongoose.isValidObjectId(userId)) {
    throw securityError("PASSWORD_SESSION_INVALID", "La sesión no es válida");
  }
}

function normalizeEmail(value) {
  if (typeof value !== "string" || !value.trim()) {
    throw securityError("PASSWORD_EMAIL_UNAVAILABLE", "La cuenta no tiene un correo disponible");
  }
  return value.trim().toLowerCase();
}

function hashCode({ userId, email, sessionToken, code }) {
  return createHmac("sha256", signingKey())
    .update(JSON.stringify([PURPOSE, String(userId), email, sessionToken, code]))
    .digest("hex");
}

function hashesMatch(first, second) {
  if (
    typeof first !== "string" || typeof second !== "string" ||
    !/^[a-f0-9]{64}$/.test(first) || !/^[a-f0-9]{64}$/.test(second)
  ) return false;
  return timingSafeEqual(Buffer.from(first, "hex"), Buffer.from(second, "hex"));
}

function validateCodeFormat(code) {
  if (typeof code !== "string" || !/^\d{6}$/.test(code)) {
    throw securityError("PASSWORD_CODE_INVALID", "Código de seguridad inválido o vencido");
  }
}

// =========================================================
// PASO 1: SOLICITAR CÓDIGO PARA LA SESIÓN AUTENTICADA
// =========================================================
export async function sendPasswordChangeCode({ userId, sessionToken }) {
  validateUserId(userId);
  validateSessionToken(sessionToken);

  const user = await User.findOne({ _id: userId, isActive: true })
    .select("email emailVerifiedAt role");

  if (!user || !ALLOWED_ROLES.includes(user.role)) {
    throw securityError("PASSWORD_ROLE_DENIED", "Operación no autorizada");
  }
  if (!user.email || !user.emailVerifiedAt) {
    throw securityError(
      "PASSWORD_EMAIL_UNVERIFIED",
      "La cuenta debe tener un correo verificado para utilizar esta función"
    );
  }

  const email = normalizeEmail(user.email);
  const now = new Date();
  const cutoff = new Date(now.getTime() - RESEND_COOLDOWN_MS);
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const codeHash = hashCode({ userId: user._id, email, sessionToken, code });
  const expiresAt = new Date(now.getTime() + CODE_TTL_MS);

  const replacement = {
    email,
    codeHash,
    expiresAt,
    attempts: 0,
    maxAttempts: MAX_ATTEMPTS,
    lastSentAt: now,
    consumedAt: null,
  };

  // La actualización es condicional: dos solicitudes simultáneas
  // no pueden eludir la espera entre envíos.
  const replaced = await EmailVerificationCode.findOneAndUpdate(
    { user: user._id, purpose: PURPOSE, lastSentAt: { $lte: cutoff } },
    { $set: replacement },
    { new: true, runValidators: true }
  );

  if (!replaced) {
    const exists = await EmailVerificationCode.exists({ user: user._id, purpose: PURPOSE });
    if (exists) {
      throw securityError("PASSWORD_CODE_COOLDOWN", "Espera 60 segundos para solicitar otro código");
    }
    try {
      await EmailVerificationCode.create({ user: user._id, purpose: PURPOSE, ...replacement });
    } catch (error) {
      if (error.code === 11000) {
        throw securityError("PASSWORD_CODE_COOLDOWN", "Ya existe una solicitud reciente");
      }
      throw error;
    }
  }

  try {
    await sendInstitutionalEmail({
      to: email,
      subject: "Código para cambiar tu contraseña - Iglesia El Ancla",
      text: [
        "Iglesia El Ancla", "",
        "Se solicitó un cambio de contraseña para tu cuenta.", "",
        `Tu código de seguridad es: ${code}`, "",
        "Vence en 10 minutos y solo puede utilizarse una vez.",
        "Si no solicitaste este cambio, no compartas el código.", "",
        "Iglesia El Ancla",
      ].join("\n"),
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:28px;color:#243746;line-height:1.6">
          <h2 style="color:#193c50">Iglesia El Ancla ⚓</h2>
          <p>Se solicitó un cambio de contraseña para tu cuenta.</p>
          <p>Tu código de seguridad es:</p>
          <div style="padding:22px;margin:24px 0;text-align:center;background:#eef5f7;border-radius:12px">
            <strong style="font-size:32px;letter-spacing:8px;color:#193c50">${code}</strong>
          </div>
          <p>Vence en <strong>10 minutos</strong> y solo puede utilizarse una vez.</p>
          <p>Si no solicitaste este cambio, no compartas el código.</p>
          <hr style="border:0;border-top:1px solid #dbe8eb;margin:24px 0">
          <p style="font-size:12px;color:#748996">Mensaje automático de Iglesia El Ancla.</p>
        </div>
      `,
    });
  } catch {
    // Si Gmail falla, el desafío generado deja de ser utilizable.
    // El filtro por hash evita invalidar uno más reciente.
    await EmailVerificationCode.updateOne(
      { user: user._id, purpose: PURPOSE, codeHash, consumedAt: null },
      { $set: { consumedAt: new Date(), expiresAt: new Date() } }
    ).catch(() => {});
    throw securityError("PASSWORD_EMAIL_SEND_FAILED", "No se pudo enviar el código. Intenta más tarde");
  }

  // Nunca se devuelve el código ni su hash al cliente.
  return { sent: true, expiresAt, resendAfterSeconds: 60 };
}

// =========================================================
// PASO 2: COMPROBAR EL CÓDIGO (ANTES DE LA TRANSACCIÓN)
// =========================================================
// Los intentos incorrectos se registran fuera de la transacción
// del cambio de contraseña para no perder el contador al abortar.
export async function checkPasswordChangeCode({ userId, email, sessionToken, code }) {
  validateUserId(userId);
  validateSessionToken(sessionToken);
  validateCodeFormat(code);

  const normalizedEmail = normalizeEmail(email);
  const expectedHash = hashCode({ userId, email: normalizedEmail, sessionToken, code });
  const filter = {
    user: userId,
    purpose: PURPOSE,
    email: normalizedEmail,
    consumedAt: null,
    expiresAt: { $gt: new Date() },
    attempts: { $lt: MAX_ATTEMPTS },
  };

  const challenge = await EmailVerificationCode.findOne(filter).select("+codeHash");
  if (!challenge) {
    throw securityError("PASSWORD_CODE_INVALID", "Código de seguridad inválido o vencido");
  }

  if (!hashesMatch(challenge.codeHash, expectedHash)) {
    // Incremento atómico y condicionado. No modifica un código
    // válido si alguien solicita otro entre la lectura y el update.
    await EmailVerificationCode.updateOne(
      { ...filter, codeHash: { $ne: expectedHash } },
      { $inc: { attempts: 1 } }
    );
    throw securityError("PASSWORD_CODE_INVALID", "Código de seguridad inválido o vencido");
  }

  return expectedHash;
}

// =========================================================
// PASO 3: CONSUMIR EN LA MISMA TRANSACCIÓN QUE CAMBIA LA CLAVE
// =========================================================
export async function consumePasswordChangeCode({
  userId, email, sessionToken, code, mongoSession,
}) {
  if (!mongoSession) throw new Error("Se requiere una transacción MongoDB");
  validateCodeFormat(code);
  validateSessionToken(sessionToken);
  const normalizedEmail = normalizeEmail(email);
  const expectedHash = hashCode({ userId, email: normalizedEmail, sessionToken, code });

  const result = await EmailVerificationCode.updateOne(
    {
      user: userId,
      purpose: PURPOSE,
      email: normalizedEmail,
      codeHash: expectedHash,
      consumedAt: null,
      expiresAt: { $gt: new Date() },
      attempts: { $lt: MAX_ATTEMPTS },
    },
    { $set: { consumedAt: new Date() } },
    { session: mongoSession }
  );

  if (result.modifiedCount !== 1) {
    throw securityError("PASSWORD_CODE_INVALID", "Código de seguridad inválido o vencido");
  }
}
