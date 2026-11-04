
import mongoose from "mongoose";

import {
  sendInstitutionalEmail,
} from "../../services/mail/gmailService.js";

// =========================================================
// PRUEBA CONTROLADA DE ENVÍO POR GMAIL API
// =========================================================

// El destinatario se recibe por consola.
// Nunca permitiremos envíos sin indicarlo explícitamente.

const recipient = process.argv[2];

async function testInstitutionalEmail() {
  if (!recipient) {
    console.error(
      "Debes indicar un correo destinatario."
    );
    process.exitCode = 1;
    return;
  }

  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI no configurada");
    }

    console.log("Conectando con MongoDB...");

    await mongoose.connect(
      process.env.MONGODB_URI
    );

    console.log("MongoDB conectado.");
    console.log("Enviando correo de prueba...");

    const result = await sendInstitutionalEmail({
      to: recipient,

      subject: "Prueba de correo - Iglesia El Ancla",

      text: `
Hola:

Este es un correo de prueba enviado desde
la plataforma de Iglesia El Ancla.

La integración con Gmail API está funcionando.

No necesitas responder a este mensaje.

Iglesia El Ancla ⚓
      `.trim(),

      html: `
        <div style="font-family:Arial,sans-serif;
                    max-width:560px;margin:auto;
                    padding:24px;color:#243746;">

          <h2>Iglesia El Ancla ⚓</h2>

          <p>Hola:</p>

          <p>
            Este es un correo de prueba enviado
            desde nuestra plataforma.
          </p>

          <p>
            La integración con Gmail API
            está funcionando.
          </p>

          <hr style="border:0;
                     border-top:1px solid #ddd;">

          <p style="font-size:12px;color:#64748b;">
            No necesitas responder a este mensaje.
          </p>

        </div>
      `,
    });

    console.log("Correo aceptado por Gmail API.");
    console.log(
      "Identificador recibido:",
      Boolean(result.messageId)
    );


  } catch (error) {

    // Informamos que la prueba no pudo completarse.
    console.error("No se pudo completar el envío.");

    // Recuperamos el código HTTP de Google.
    const httpCode =
      error.response?.status ||
      error.code ||
      error.status ||
      "sin código";

    // Recuperamos solamente la información del error de Google.
    const googleError = error.response?.data?.error;

    // Consultamos el motivo específico devuelto por la API.
    const reason =
      googleError?.errors?.[0]?.reason ||
      googleError?.details?.find((detail) => detail.reason)?.reason ||
      (typeof googleError === "string" ? googleError : null) ||
      "No identificado";

    // Consultamos el estado general del proveedor.
    const googleStatus =
      typeof googleError === "object"
        ? googleError?.status
        : null;

    // Mostramos el diagnóstico sin imprimir tokens ni credenciales.
    console.error("Código HTTP:", httpCode);
    console.error("Motivo de Google:", reason);
    console.error("Estado de Google:", googleStatus || "No disponible");

    // Mostramos el mensaje descriptivo solo en la terminal local.
    // Antes de compartirlo, revisa que no contenga datos privados.
    if (typeof googleError?.message === "string") {
      console.error(
        "Descripción:",
        googleError.message.slice(0, 350)
      );
    }

    // Marcamos la ejecución como fallida.
    process.exitCode = 1;

  } finally {

    await mongoose.disconnect();
  }
}

await testInstitutionalEmail();
