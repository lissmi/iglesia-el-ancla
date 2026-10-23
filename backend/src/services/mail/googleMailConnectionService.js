// =========================================================
// ALMACENAMIENTO SEGURO DE LA CONEXIÓN GMAIL INSTITUCIONAL
// =========================================================
// Este servicio es de uso exclusivo del backend.
// No expone tokens ni información de cifrado en respuestas HTTP.
// No realiza el flujo OAuth ni envía correos todavía.

import GoogleMailConnection from "../../models/GoogleMailConnection.js";
import {
  encryptGoogleRefreshToken,
  decryptGoogleRefreshToken,
} from "./googleTokenEncryption.js";

const CONNECTION_KEY = "institutional-gmail";
const REQUIRED_SCOPE = "https://www.googleapis.com/auth/gmail.send";

// =========================================================
// GUARDAR O RENOVAR LA AUTORIZACIÓN INSTITUCIONAL
// =========================================================
// Llamar únicamente después de verificar el callback OAuth,
// identidad de la cuenta emisora y permisos concedidos.
// Nunca devolver el refreshToken a React o a los registros.

async function saveGoogleMailConnection({
  senderEmail,
  refreshToken,
  scopes,
}) {
  const expectedSender = process.env.GMAIL_SENDER_EMAIL?.trim().toLowerCase();
  const normalizedSender = senderEmail?.trim().toLowerCase();

  if (!expectedSender || !normalizedSender || normalizedSender !== expectedSender) {
    throw new Error("La cuenta autorizada no coincide con el correo institucional configurado");
  }

  if (!Array.isArray(scopes) || !scopes.includes(REQUIRED_SCOPE)) {
    throw new Error("La autorización no incluye el permiso para enviar correos");
  }

  // El servicio de cifrado comprueba el token y la clave privada.
  const encrypted = encryptGoogleRefreshToken(refreshToken);

  await GoogleMailConnection.findOneAndUpdate(
    { connectionKey: CONNECTION_KEY },
    {
      $set: {
        senderEmail: normalizedSender,
        ...encrypted,
        scopes: [REQUIRED_SCOPE],
        authorizedAt: new Date(),
        isActive: true,
      },
      $setOnInsert: { connectionKey: CONNECTION_KEY },
    },
    {
      upsert: true,
      new: false,
      runValidators: true,
    }
  );

  // Solo información no sensible.
  return { connected: true, senderEmail: normalizedSender };
}

// =========================================================
// LEER EL TOKEN SOLO PARA USO INTERNO DEL BACKEND
// =========================================================
// Los campos secretos tienen select:false en el modelo,
// por lo que deben seleccionarse de manera explícita aquí.

async function getGoogleMailRefreshToken() {
  const connection = await GoogleMailConnection.findOne({
    connectionKey: CONNECTION_KEY,
    isActive: true,
  }).select("+encryptedRefreshToken +encryptionIv +encryptionAuthTag senderEmail scopes");

  if (!connection) {
    throw new Error("El correo institucional aún no está conectado o está desactivado");
  }

  const expectedSender = process.env.GMAIL_SENDER_EMAIL?.trim().toLowerCase();
  if (!expectedSender || connection.senderEmail !== expectedSender) {
    throw new Error("La cuenta conectada no corresponde al correo institucional configurado");
  }

  if (!connection.scopes?.includes(REQUIRED_SCOPE)) {
    throw new Error("La conexión no tiene permiso para enviar correos");
  }

  return decryptGoogleRefreshToken(connection);
}

export {
  saveGoogleMailConnection,
  getGoogleMailRefreshToken,
};
