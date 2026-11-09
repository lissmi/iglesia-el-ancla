// Importamos el lector de archivos para cargar exclusivamente el menú aprobado.
import { readFileSync } from "node:fs";

// Construimos una ruta fija: el usuario nunca puede elegir archivos arbitrarios.
const faqPath = new URL("../../data/martin/preguntasFrecuentes.json", import.meta.url);

// Cargamos los contenidos una sola vez; no necesitamos MongoDB ni Gemini.
const faq = JSON.parse(readFileSync(faqPath, "utf8"));

// Enviamos al menú solamente el identificador y el título de cada opción.
const options = faq.opciones.map(({ id, titulo }) => ({ id, titulo }));

// Preparamos una tabla de respuestas aprobadas para búsquedas exactas por ID.
const replies = new Map(faq.opciones.map((option) => [option.id, option]));

// Devolvemos el saludo y las opciones sin consultar servicios externos.
export function getMartinGuidedMenu() {
  return { message: faq.saludo, options };
}

// Entregamos respuestas estáticas y enlaces a rutas conocidas de la PWA.
// Los enlaces para miembros se envían separados; el frontend los muestra
// solamente cuando confirmó una sesión válida, y React Router protege la ruta.
export function getMartinGuidedReply(option) {
  // Rechazamos opciones que no estén en la lista autorizada.
  const item = replies.get(option);
  if (!item) return null;

  // Construimos un objeto nuevo para no exponer datos adicionales del archivo.
  return {
    id: item.id,
    titulo: item.titulo,
    respuesta: item.respuesta,
    ...(item.enlace ? { enlace: item.enlace, enlaceTexto: item.enlaceTexto } : {}),
    ...(item.respuestaAutenticado ? { respuestaAutenticado: item.respuestaAutenticado } : {}),
    ...(item.enlaceAutenticado ? {
      enlaceAutenticado: item.enlaceAutenticado,
      enlaceTextoAutenticado: item.enlaceTextoAutenticado,
    } : {}),
  };
}
