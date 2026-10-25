
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
    // Evitamos imprimir respuestas completas de Google,
    // porque podrían contener información sensible.
    console.error("No se pudo completar el envío.");

    if (error.message === "MONGODB_URI no configurada") {
      console.error(error.message);
    } else {
      console.error(
        "Tipo de error:",
        error.code || error.status || "sin código"
      );
    }

    process.exitCode = 1;

  } finally {
    await mongoose.disconnect();
  }
}

await testInstitutionalEmail();
