// =========================================================
// GMAIL API — ENVÍO DE CORREOS INSTITUCIONALES
// =========================================================
// Solo para uso interno del backend. No exponer directamente
// como endpoint público ni registrar tokens en consola.

import { google } from "googleapis";


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


/**
 * Construye el mensaje MIME que enviaremos
 * posteriormente mediante Gmail API.
 */
async function buildRawMessage({
  from,
  to,
  subject,
  text,
  html,
}) {

  // Importamos Nodemailer solamente cuando
  // realmente necesitamos construir un correo.
  // Así no bloqueamos el arranque de Express.
  const { default: MailComposer } = await import(
    "nodemailer/lib/mail-composer/index.js"
  );

  // Construimos el mensaje utilizando el
  // mismo MailComposer que ya usábamos.
  const composer = new MailComposer({
    from,
    to,
    subject,
    text,
    ...(html ? { html } : {}),
  });

  // Convertimos el contenido del correo
  // al formato requerido por Gmail API.
  return new Promise((resolve, reject) => {

    // Generamos el mensaje MIME.
    composer.compile().build((error, buffer) => {

      // Propagamos los errores de composición.
      if (error) {
        return reject(error);
      }

      // Gmail API necesita el mensaje codificado
      // como Base64URL.
      resolve(buffer.toString("base64url"));

    });

  });

}

// Atribuimos cada fallo a una etapa concreta del servicio de correo.
// Este marcador es interno: no contiene destinatarios ni secretos OAuth.
async function executeMailStage(stage, operation) {
  try {
    return await operation();
  } catch (error) {
    // Conservamos el error original, incluido su estado HTTP o código de red.
    // Únicamente añadimos el identificador fijo de la operación que falló.
    if (error && typeof error === "object") {
      try {
        if (!error.mailStage) {
          Object.defineProperty(error, "mailStage", {
            value: stage,
            configurable: true,
          });
        }
      } catch {
        // El diagnóstico nunca debe sustituir el error original.
      }
    }
    throw error;
  }
}

/**
 * Envía un correo institucional a un único destinatario.
 * El caller debe ser un proceso de backend autorizado,
 * con controles de frecuencia adecuados para su caso de uso.
 * @returns {Promise<{ messageId: string }>} Nunca devuelve tokens.
 */
export async function sendInstitutionalEmail({ to, subject, text, html }) {
  // Comprobamos los campos antes de consultar credenciales de Google.
  const { sender, recipient, safeSubject, safeText } = await executeMailStage(
    "input_validation",
    () => {
      const sender = getInstitutionalSender();
      const recipient = validateRecipient(to);
      const safeSubject = requireText(subject, "subject", MAX_SUBJECT_LENGTH);
      const safeText = requireText(text, "text", MAX_BODY_LENGTH);

      if (html !== undefined &&
        (typeof html !== "string" || html.length > MAX_BODY_LENGTH)) {
        throw new Error("El contenido HTML no es válido");
      }
      return { sender, recipient, safeSubject, safeText };
    }
  );

  // Recuperamos el token cifrado y verificamos la conexión institucional.
  const refreshToken = await executeMailStage(
    "connection_read",
    () => getGoogleMailRefreshToken()
  );

  // Creamos un cliente independiente para este envío.
  const oauthClient = await executeMailStage("oauth_client", () => {
    const client = getGoogleOAuthClient();
    client.setCredentials({ refresh_token: refreshToken });
    return client;
  });

  // Construimos el correo MIME sin acceder todavía a Gmail API.
  const raw = await executeMailStage("mime_build", () => buildRawMessage({
    from: sender,
    to: recipient,
    subject: safeSubject,
    text: safeText,
    html,
  }));

  // Aquí se realiza la solicitud saliente a Google. Si falla,
  // conservamos el error real para que userRoutes.js lo clasifique.
  const response = await executeMailStage("gmail_send", async () => {
    const gmail = google.gmail({ version: "v1", auth: oauthClient });
    return gmail.users.messages.send({
      userId: "me",
      requestBody: { raw },
    });
  });

  // Gmail debe confirmar el envío con un ID de mensaje.
  return executeMailStage("gmail_response", () => {
    if (!response?.data?.id) {
      throw new Error("Gmail no devolvió un identificador de mensaje");
    }
    return { messageId: response.data.id };
  });
}
