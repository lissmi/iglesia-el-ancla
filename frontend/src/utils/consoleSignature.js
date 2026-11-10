// =========================================================
// FIRMA DE AUTORÍA EN CONSOLA — IGLESIA EL ANCLA ⚓
// =========================================================
// Se muestra una sola vez al cargar el punto de entrada React.
// No modifica la interfaz, no consulta APIs y no obtiene datos
// personales del visitante.
//
// ACCESIBILIDAD VISUAL:
// - Los textos largos heredan el color nativo de la consola.
// - El navegador adapta ese color al tema claro u oscuro.
// - Solo el encabezado y las etiquetas usan colores propios.
// - Sus colores tienen fondo sólido y alto contraste.
// =========================================================

// Exportamos la función que se invoca desde src/index.js.
export function showElAnclaConsoleSignature() {
  // Definimos un encabezado azul con letras claras: se distingue
  // tanto en consolas de fondo blanco como en consolas oscuras.
  const headerStyle =
    "background:#20364a;color:#ffffff;font-size:16px;font-weight:800;padding:9px 12px;border-radius:8px;";

  // Elegimos una etiqueta clara con tinta azul para destacar
  // el nombre de la comunidad de forma legible en ambos temas.
  const subtitleStyle =
    "background:#f4eee6;color:#20364a;font-size:11px;font-weight:800;padding:10px 12px;border-radius:8px;";

  // Cada categoría utiliza una cápsula azul de alto contraste.
  // No dependemos del color de fondo de DevTools para leerla.
  const categoryStyle =
    "background:#20364a;color:#ffffff;font-size:12px;font-weight:700;padding:3px 6px;border-radius:4px;";

  // Esta cadena vacía devuelve el texto al estilo nativo de la
  // consola, que cambia automáticamente según el tema elegido.
  const nativeStyle = "";

  // Mostramos la identidad institucional, con dos bloques legibles.
  console.log(
    "%c⚓ EL ANCLA%c COMUNIDAD CRISTIANA",
    headerStyle,
    subtitleStyle
  );

  // El saludo usa los colores predeterminados del navegador.
  console.log("👋💙 ¡Hola! Qué bueno encontrarte por aquí.");

  // La descripción también hereda el color automático de DevTools.
  console.log(
    "Si llegaste hasta la consola, seguramente te gusta descubrir cómo se construyen las cosas. Esta PWA fue creada con tecnología y dedicación para conectar a nuestra comunidad."
  );

  // Mostramos las tecnologías de interfaz sin forzar un color
  // que pueda resultar ilegible en modo claro u oscuro.
  console.log(
    "%c🎨 Frontend%c React · React Router · JavaScript · HTML5 · CSS3 · Axios · Lucide · Recharts",
    categoryStyle,
    nativeStyle
  );

  // Describimos el servidor y la persistencia del proyecto.
  console.log(
    "%c🛠 Backend%c Node.js · Express · MongoDB Atlas · Mongoose · JWT · bcrypt",
    categoryStyle,
    nativeStyle
  );

  // Nombramos las integraciones efectivamente presentes.
  // El asistente Martín utiliza Google Gemini en el backend.
  // Google Maps utiliza un mapa incrustado y enlaces de navegación,
  // sin afirmar que se consumen APIs de Maps con facturación.
  console.log(
    "%c🔗 Integraciones%c PWA · Service Worker · Web Push · Gmail API / OAuth 2.0 · Gemini API · Cloudinary · Google Drive API · Google Maps ",
    categoryStyle,
    nativeStyle
  );

  // Registramos la lectura asistida que usa la Web Speech API
  // directamente desde el navegador, sin servicio de voz externo.
  console.log(
    "%c♿ Accesibilidad%c Lectura asistida · Web Speech API (SpeechSynthesis) · texto a voz · navegación por teclado",
    categoryStyle,
    nativeStyle
  );

  // Registramos el alojamiento y las herramientas de trabajo.
  // Webpay se describe como integración para no sugerir cobros
  // comerciales activos cuando aún se prueba su implementación.
  console.log(
    "%c☁️ Plataforma%c Vercel · GitHub · Webpay Plus (integración)",
    categoryStyle,
    nativeStyle
  );

  // Presentamos la autoría con el nombre proporcionado.
  console.log(
    "%c👩‍💻 Gestión del proyecto y desarrollo%c Lisett Miranda",
    categoryStyle,
    nativeStyle
  );

  // Incluimos el correo como texto normal, legible en todo tema.
  console.log(
    "%c✉️ ¿Te gustaría conversar?%c lissette.mi.ar@gmail.com",
    categoryStyle,
    nativeStyle
  );

  // Cerramos la firma sin imponer colores a la descripción.
  console.log(
    "Gracias por explorar El Ancla. ¡La curiosidad también construye cosas bonitas! ⚓💙"
  );
}
