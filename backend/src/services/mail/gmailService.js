// =========================================================
// GMAIL API — ENVÍO DE CORREOS INSTITUCIONALES
// =========================================================
// Solo para uso interno del backend. No exponer directamente
// como endpoint público ni registrar tokens en consola.

import { google } from "googleapis";
import MailComposer from "nodemailer/lib/mail-composer/index.js";

import { getGoogleOAuthClient } from "./googleOAuthClient.js";
import { getGoogleMailRefreshToken } from "./googleMailConnectionService.js";

const MAX_SUBJECT_LENGTH = 180;
const MAX_BODY_LENGTH = 100_000;

function requireText(value, field, maxLength) {
  if (typeof value !== "string" || !value.trim() || value.length > maxLength) {
    throw new Error(`El campo ${field} no es válido`);
  }
  return value.trim();
}

function getInstitutionalSender() {
  const sender = requireText(
    process.env.GMAIL_SENDER_EMAIL,
    "GMAIL_SENDER_EMAIL",
    254
  ).toLowerCase();

  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(sender)) {
    throw new Error("El correo institucional configurado no es válido");
  }
  return sender;
}

function validateRecipient(value) {
  const recipient = requireText(value, "to", 254);
  // Un solo destinatario por llamada: evita listas o cabeceras inyectadas.
  if (!/^[^\s@<>,;\r\n]+@[^\s@<>,;\r\n]+\.[^\s@<>,;\r\n]+$/.test(recipient)) {
    throw new Error("El destinatario no es válido");
  }
  return recipient;
}

function buildRawMessage({ from, to, subject, text, html }) {
  const composer = new MailComposer({
    from,
    to,
    subject,
    text,
    ...(html ? { html } : {}),
  });

  return new Promise((resolve, reject) => {
    composer.compile().build((error, buffer) => {
      if (error) return reject(error);
      resolve(buffer.toString("base64url"));
    });
  });
}

/**
 * Envía un correo institucional a un único destinatario.
 * El caller debe ser un proceso de backend autorizado,
 * con controles de frecuencia adecuados para su caso de uso.
 * @returns {Promise<{ messageId: string }>} Nunca devuelve tokens.
 */
export async function sendInstitutionalEmail({ to, subject, text, html }) {
  const sender = getInstitutionalSender();
  const recipient = validateRecipient(to);
  const safeSubject = requireText(subject, "subject", MAX_SUBJECT_LENGTH);
  const safeText = requireText(text, "text", MAX_BODY_LENGTH);

  if (html !== undefined && (typeof html !== "string" || html.length > MAX_BODY_LENGTH)) {
    throw new Error("El contenido HTML no es válido");
  }

  // Solo se lee del almacenamiento cifrado del backend.
  const refreshToken = await getGoogleMailRefreshToken();
  const oauthClient = getGoogleOAuthClient();
  oauthClient.setCredentials({ refresh_token: refreshToken });

  const raw = await buildRawMessage({
    from: sender,
    to: recipient,
    subject: safeSubject,
    text: safeText,
    html,
  });

  const gmail = google.gmail({ version: "v1", auth: oauthClient });
  const response = await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw },
  });

  if (!response.data.id) {
    throw new Error("Gmail no devolvió un identificador de mensaje");
  }

  return { messageId: response.data.id };
}
