
import { GoogleGenAI } from "@google/genai";

// Comprobamos que exista la clave privada de Gemini.
if (!process.env.GEMINI_API_KEY) {
  throw new Error(
    "No se encontró GEMINI_API_KEY en las variables de entorno."
  );
}

// Creamos el cliente oficial de Gemini.
// La clave permanece únicamente en nuestro backend.
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Elegimos un modelo que dispone de nivel gratuito.
// No habilitamos búsquedas web ni otras herramientas.
// Modelo actualizado de Gemini, compatible con el nivel gratuito.
const MODEL = "gemini-3.5-flash-lite";

// Creamos una función para comprobar la conexión.
async function probarMartin() {
  try {
    // Enviamos una pregunta sencilla sin información privada.
    const respuesta = await ai.models.generateContent({
      model: MODEL,

      // Esta es la pregunta que recibirá Gemini.
      contents:
        "Saluda brevemente en español como Martín, " +
        "el asistente virtual de Iglesia El Ancla.",

      // Definimos la personalidad inicial de Martín.
      config: {
        systemInstruction:
          "Te llamas Martín. Eres el asistente virtual " +
          "de Iglesia El Ancla, inspirado en Martín Lutero. " +
          "Responde de forma cercana, respetuosa y sencilla. " +
          "No afirmes ser pastor ni autoridad espiritual.",

        // Limitamos la extensión de la respuesta.
        maxOutputTokens: 150,

        // Evitamos solicitudes que demoren demasiado.
        abortSignal: AbortSignal.timeout(15000),
      },
    });

    // Mostramos el mensaje generado.
    console.log("\n⚓ Respuesta de Martín:\n");
    console.log(respuesta.text || "Gemini no devolvió texto.");
  } catch (error) {
    // Mostramos solamente información útil del error.
    // Nunca imprimimos la clave privada.
    console.error("\nNo se pudo conectar con Gemini.");
    console.error("Estado:", error.status || "No disponible");
    console.error("Motivo:", error.message?.slice(0, 300));
  }
}

// Ejecutamos una única prueba.
await probarMartin();
