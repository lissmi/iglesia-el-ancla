// =========================================================
// REGLAS AISLADAS DE RECUPERACIÓN DE CONTRASEÑA
// =========================================================
// No dependen de Express, MongoDB ni Gmail: pueden probarse
// sin iniciar servicios externos.

import { createHmac, timingSafeEqual } from "node:crypto";

// Separamos el propósito de los códigos de cambio con sesión.
export const RESET_PURPOSE = "password_reset";

// El código vence diez minutos después de su emisión.
export const RESET_CODE_TTL_MS = 10 * 60 * 1000;

// Un mismo usuario no recibirá otro correo durante sesenta segundos.
export const RESET_RESEND_MS = 60 * 1000;

// Bloqueamos el desafío después de cinco intentos incorrectos.
export const RESET_MAX_ATTEMPTS = 5;

// Normalizamos las direcciones para que la comparación sea consistente.
export function normalizeRecoveryEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

// Restringimos el formato y la longitud antes de consultar MongoDB.
export function isValidRecoveryEmail(value) {
  return /^[^\s@<>,;\r\n]{1,64}@[^\s@<>,;\r\n]{1,189}\.[^\s@<>,;\r\n]{2,}$/.test(value) && value.length <= 254;
}

// Aceptamos exactamente seis dígitos, incluidos los ceros iniciales.
export function isValidRecoveryCode(value) {
  return typeof value === "string" && /^\d{6}$/.test(value);
}

// La misma respuesta se muestra aunque el correo no esté registrado.
export const REQUEST_MESSAGE = "Si el correo corresponde a una cuenta activa y verificada, recibirás un código para recuperar tu acceso. Revisa también la carpeta de spam 💙";

// Solo aceptamos una clave HMAC privada de 32 bytes en Base64.
function getHmacKey() {
  const encoded = process.env.EMAIL_VERIFICATION_HMAC_KEY;
  if (typeof encoded !== "string" || !/^[A-Za-z0-9+/]{43}=$/.test(encoded)) {
    throw new Error("EMAIL_VERIFICATION_HMAC_KEY debe contener 32 bytes en Base64");
  }
  const key = Buffer.from(encoded, "base64");
  if (key.length !== 32) throw new Error("La clave HMAC no es válida");
  return key;
}

// Firmamos propósito, usuario, correo y código; nunca almacenamos el OTP.
export function hashRecoveryCode({ userId, email, code }) {
  return createHmac("sha256", getHmacKey())
    .update(JSON.stringify([RESET_PURPOSE, String(userId), normalizeRecoveryEmail(email), code]))
    .digest("hex");
}

// Comparación de hash en tiempo constante para hashes bien formados.
export function recoveryHashesMatch(actual, expected) {
  if (typeof actual !== "string" || typeof expected !== "string" ||
      !/^[a-f\d]{64}$/.test(actual) || !/^[a-f\d]{64}$/.test(expected)) return false;
  return timingSafeEqual(Buffer.from(actual, "hex"), Buffer.from(expected, "hex"));
}

// Escapamos cualquier texto dinámico antes de incluirlo en HTML.
export function escapeRecoveryHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}
