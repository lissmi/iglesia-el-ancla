// =========================================================
// CIFRADO DEL TOKEN DE AUTORIZACIÓN DE GMAIL
// =========================================================
// Uso exclusivo del backend. Nunca enviar a React los valores
// cifrados ni la clave utilizada para protegerlos.
//
// Compatible con los campos del modelo GoogleMailConnection:
// encryptedRefreshToken, encryptionIv, encryptionAuthTag.

import { randomBytes, createCipheriv, createDecipheriv } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH_BYTES = 12;
const AUTH_TAG_LENGTH_BYTES = 16;

// Vincula el contenido cifrado al propósito previsto.
const ADDITIONAL_AUTHENTICATED_DATA = Buffer.from(
  "iglesia-el-ancla:institutional-gmail:refresh-token:v1",
  "utf8"
);

// =========================================================
// CLAVE DE CIFRADO (SOLO VARIABLES DE ENTORNO)
// =========================================================
function getEncryptionKey() {
  const encodedKey = process.env.GOOGLE_TOKEN_ENCRYPTION_KEY;

  if (typeof encodedKey !== "string" || !encodedKey) {
    throw new Error("Falta configurar GOOGLE_TOKEN_ENCRYPTION_KEY");
  }

  // Exigimos exactamente 32 bytes representados en Base64.
  // No aceptamos claves cortas ni usamos claves predeterminadas.
  const key = Buffer.from(encodedKey, "base64");
  if (
    key.length !== 32 ||
    key.toString("base64") !== encodedKey
  ) {
    throw new Error(
      "GOOGLE_TOKEN_ENCRYPTION_KEY debe contener 32 bytes codificados en Base64"
    );
  }

  return key;
}

// Valida representaciones Base64 antes de descifrarlas.
function decodeBase64(value, fieldName) {
  if (typeof value !== "string" || !value) {
    throw new Error(`El campo ${fieldName} no es válido`);
  }
  const decoded = Buffer.from(value, "base64");
  if (decoded.toString("base64") !== value) {
    throw new Error(`El campo ${fieldName} no contiene Base64 válido`);
  }
  return decoded;
}

// =========================================================
// CIFRAR TOKEN
// =========================================================
function encryptGoogleRefreshToken(refreshToken) {
  if (typeof refreshToken !== "string" || !refreshToken.trim()) {
    throw new Error("El token de actualización de Google no es válido");
  }

  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH_BYTES,
  });

  cipher.setAAD(ADDITIONAL_AUTHENTICATED_DATA);
  const encrypted = Buffer.concat([
    cipher.update(refreshToken, "utf8"),
    cipher.final(),
  ]);

  return {
    encryptedRefreshToken: encrypted.toString("base64"),
    encryptionIv: iv.toString("base64"),
    encryptionAuthTag: cipher.getAuthTag().toString("base64"),
  };
}

// =========================================================
// DESCIFRAR TOKEN (USAR SOLO EN SERVICIOS DEL BACKEND)
// =========================================================
function decryptGoogleRefreshToken(connection) {
  if (!connection || typeof connection !== "object") {
    throw new Error("No se recibió una conexión de Gmail válida");
  }

  const encrypted = decodeBase64(
    connection.encryptedRefreshToken,
    "encryptedRefreshToken"
  );
  const iv = decodeBase64(connection.encryptionIv, "encryptionIv");
  const tag = decodeBase64(
    connection.encryptionAuthTag,
    "encryptionAuthTag"
  );

  if (iv.length !== IV_LENGTH_BYTES || tag.length !== AUTH_TAG_LENGTH_BYTES) {
    throw new Error("Los parámetros del cifrado de Gmail no son válidos");
  }

  const decipher = createDecipheriv(ALGORITHM, getEncryptionKey(), iv, {
    authTagLength: AUTH_TAG_LENGTH_BYTES,
  });
  decipher.setAAD(ADDITIONAL_AUTHENTICATED_DATA);
  decipher.setAuthTag(tag);

  // Si cambian el texto cifrado, IV, etiqueta o clave,
  // AES-GCM rechazará la operación en decipher.final().
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

export { encryptGoogleRefreshToken, decryptGoogleRefreshToken };
