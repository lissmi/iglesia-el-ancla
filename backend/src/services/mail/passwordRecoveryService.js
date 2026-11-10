// =========================================================
// RECUPERACIÓN DE ACCESO SIN SESIÓN — IGLESIA EL ANCLA
// =========================================================
// Reutiliza EmailVerificationCode y Gmail API; no crea colecciones.

import mongoose from "mongoose";
import { randomInt } from "node:crypto";

import User from "../../models/User.js";
import EmailVerificationCode from "../../models/EmailVerificationCode.js";
import PushSubscription from "../../models/PushSubscription.js";
import { comparePassword, hashPassword } from "../../utils/passwordUtils.js";
import { sendInstitutionalEmail } from "./gmailService.js";
import { buildPasswordRecoveryEmail } from "./passwordRecoveryEmail.js";
import {
  RESET_PURPOSE,
  RESET_CODE_TTL_MS,
  RESET_RESEND_MS,
  RESET_MAX_ATTEMPTS,
  normalizeRecoveryEmail,
  hashRecoveryCode,
  recoveryHashesMatch,
} from "./passwordRecoveryPolicy.js";

// Los tres roles utilizan una misma recuperación segura.
const VALID_ROLES = ["member", "admin", "super_admin"];

// Evitamos que los detalles internos aparezcan en las respuestas públicas.
function invalidCode() {
  return Object.assign(new Error("El código es incorrecto, venció o ya fue utilizado."), {
    code: "RECOVERY_CODE_INVALID",
  });
}

// Devuelve una cuenta activa con correo verificado, sin campos innecesarios.
async function findEligibleUser(email, includeSecrets = false) {
  const query = User.findOne({
    email,
    isActive: true,
    emailVerifiedAt: { $type: "date" },
    role: { $in: VALID_ROLES },
  });
  return includeSecrets
    ? query.select("+passwordHash +tokenVersion +passwordChangedAt +lockUntil +loginAttempts")
    : query.select("email role emailVerifiedAt");
}

// =========================================================
// PASO 1: EMITIR UN CÓDIGO POR GMAIL
// =========================================================
export async function requestPasswordRecovery(rawEmail) {
  // No buscamos por cadenas vacías o sin normalizar.
  const email = normalizeRecoveryEmail(rawEmail);

  // Una dirección inexistente recibe exactamente la misma respuesta pública.
  const user = await findEligibleUser(email);
  if (!user) return;

  // Evitamos solicitar repetidamente un código para la misma cuenta.
  const now = new Date();
  const before = new Date(now.getTime() - RESET_RESEND_MS);
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const codeHash = hashRecoveryCode({ userId: user._id, email, code });
  const replacement = {
    email,
    codeHash,
    expiresAt: new Date(now.getTime() + RESET_CODE_TTL_MS),
    lastSentAt: now,
    attempts: 0,
    maxAttempts: RESET_MAX_ATTEMPTS,
    consumedAt: null,
  };

  // La condición sobre lastSentAt impide dos reenvíos simultáneos.
  const updated = await EmailVerificationCode.findOneAndUpdate(
    { user: user._id, purpose: RESET_PURPOSE, lastSentAt: { $lte: before } },
    { $set: replacement },
    { new: true, runValidators: true }
  );

  // Si no existía un desafío, intentamos crearlo con índice único.
  if (!updated) {
    const exists = await EmailVerificationCode.exists({ user: user._id, purpose: RESET_PURPOSE });
    if (exists) return;
    try {
      await EmailVerificationCode.create({ user: user._id, purpose: RESET_PURPOSE, ...replacement });
    } catch (error) {
      // Otro envío simultáneo ganó la inserción: no enviamos duplicados.
      if (error?.code === 11000) return;
      throw error;
    }
  }

  // Gmail puede fallar; el estado del desafío no debe quedar utilizable.
  try {
    await sendInstitutionalEmail({ to: email, ...buildPasswordRecoveryEmail(code) });
  } catch {
    // Solo invalidamos exactamente el desafío que tratábamos de enviar.
    await EmailVerificationCode.updateOne(
      { user: user._id, purpose: RESET_PURPOSE, codeHash, consumedAt: null },
      { $set: { consumedAt: new Date(), expiresAt: new Date() } }
    ).catch(() => {});
    // No revelamos desde el endpoint si el correo existe o falló su envío.
    console.error("No se pudo completar el envío de recuperación con Gmail.");
  }
}

// =========================================================
// PASO 2: VERIFICAR OTP Y CAMBIAR LA CONTRASEÑA
// =========================================================
export async function completePasswordRecovery({ rawEmail, code, newPassword }) {
  // Buscamos al propietario solo por correo y con estado autorizado.
  const email = normalizeRecoveryEmail(rawEmail);
  const user = await findEligibleUser(email, true);
  if (!user) throw invalidCode();

  // Solo aceptamos un desafío que no esté vencido ni consumido.
  const now = new Date();
  const conditions = {
    user: user._id,
    purpose: RESET_PURPOSE,
    email,
    consumedAt: null,
    expiresAt: { $gt: now },
    attempts: { $lt: RESET_MAX_ATTEMPTS },
  };
  const challenge = await EmailVerificationCode.findOne(conditions).select("+codeHash");
  if (!challenge) throw invalidCode();

  // Calculamos el HMAC usando un propósito diferente de password_change.
  const expectedHash = hashRecoveryCode({ userId: user._id, email, code });
  if (!recoveryHashesMatch(challenge.codeHash, expectedHash)) {
    // Contabilizamos cada error de forma atómica, incluso ante concurrencia.
    await EmailVerificationCode.updateOne(
      { ...conditions, _id: challenge._id, codeHash: challenge.codeHash },
      { $inc: { attempts: 1 } }
    );
    throw invalidCode();
  }

  // La contraseña nueva debe ser diferente de la anterior.
  if (await comparePassword(newPassword, user.passwordHash)) {
    throw Object.assign(new Error("Elige una contraseña distinta de la anterior."), {
      code: "RECOVERY_PASSWORD_REUSED",
    });
  }

  // Calculamos bcrypt fuera de la transacción para acortarla.
  const newHash = await hashPassword(newPassword);
  const mongoSession = await mongoose.startSession();
  try {
    await mongoSession.withTransaction(async () => {
      // Consumimos el código exactamente una vez, dentro de la transacción.
      const consumed = await EmailVerificationCode.updateOne(
        {
          ...conditions,
          _id: challenge._id,
          codeHash: expectedHash,
          expiresAt: { $gt: new Date() },
        },
        { $set: { consumedAt: new Date() } },
        { session: mongoSession }
      );
      if (consumed.modifiedCount !== 1) throw invalidCode();

      // Invalidamos todas las cookies JWT existentes mediante tokenVersion.
      const changed = await User.updateOne(
        {
          _id: user._id,
          email,
          isActive: true,
          role: { $in: VALID_ROLES },
          tokenVersion: user.tokenVersion ?? 0,
        },
        {
          $set: {
            passwordHash: newHash,
            passwordChangedAt: new Date(),
            mustChangePassword: false,
            loginAttempts: 0,
            lockUntil: null,
          },
          $inc: { tokenVersion: 1 },
        },
        { session: mongoSession }
      );
      if (changed.modifiedCount !== 1) throw invalidCode();

      // Revocamos las suscripciones de los equipos asociados a la sesión vieja.
      // El usuario puede volver a activarlas tras entrar con su nueva contraseña.
      await PushSubscription.deleteMany({ user: user._id }, { session: mongoSession });

      // Cancelamos códigos de cambio de contraseña de sesiones previas.
      await EmailVerificationCode.deleteMany(
        { user: user._id, purpose: "password_change" },
        { session: mongoSession }
      );
    });
  } finally {
    await mongoSession.endSession();
  }

  // OWASP recomienda informar que la contraseña fue restablecida.
  // Este correo no contiene ni la contraseña ni códigos temporales.
  try {
    await sendInstitutionalEmail({
      to: email,
      subject: "Tu contraseña de El Ancla fue actualizada ⚓",
      text: "Hola 💙\n\nTu contraseña de Iglesia El Ancla fue actualizada correctamente.\nSi realizaste este cambio, ya puedes iniciar sesión con tu nueva contraseña.\nSi no reconoces esta acción, comunícate con la administración de El Ancla cuanto antes.\n\nCon cariño,\nEl equipo de Iglesia El Ancla",
      html: `<div style="background:#f6f2ed;padding:32px 12px;font-family:Arial,sans-serif;color:#24394c"><div style="max-width:520px;margin:auto;background:#ffffff;padding:32px;border-radius:17px;border:1px solid #e4d9cb"><div style="font-size:27px;color:#20364a;font-weight:bold">⚓ El Ancla</div><h2 style="color:#20364a;margin-top:25px">Tu contraseña fue actualizada 💙</h2><p style="font-size:15px;line-height:1.7">Tu acceso ya está protegido con una nueva contraseña. Puedes volver a iniciar sesión cuando quieras.</p><p style="font-size:14px;line-height:1.7;color:#536575">Si no reconoces este cambio, contacta con la administración de El Ancla cuanto antes.</p><p style="font-size:13px;color:#798997;margin-top:27px">Con cariño, el equipo de Iglesia El Ancla</p></div></div>`,
    });
  } catch {
    // El cambio ya se confirmó; un fallo de Gmail no lo revierte.
    console.error("No fue posible enviar la confirmación de recuperación.");
  }
}
