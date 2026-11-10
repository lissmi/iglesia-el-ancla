// =========================================================
// REGISTRO DE PWA — IGLESIA EL ANCLA
// =========================================================
// Todo el sitio (visitantes, miembros y administradores) comparte
// el mismo icono y la misma instalación.
// No altera las cookies de sesión ni guarda información privada.

// Obtiene la ruta base, útil si cambia PUBLIC_URL en el build.
const publicBase = (process.env.PUBLIC_URL || "").replace(/\/$/, "");

// Evita duplicar etiquetas si React monta la interfaz otra vez.
function addHeadLink(relation, href, extraAttributes = {}) {
  const exists = Array.from(document.head.querySelectorAll('link[rel="' + relation + '"]'))
    .some((link) => link.getAttribute("href") === href);

  if (exists) return;

  const link = document.createElement("link");
  link.rel = relation;
  link.href = href;

  Object.entries(extraAttributes).forEach(([name, value]) => {
    link.setAttribute(name, value);
  });

  document.head.appendChild(link);
}

// Configura los metadatos visuales de la web instalada en iOS.
function addHeadMeta(name, content) {
  let element = document.head.querySelector('meta[name="' + name + '"]');
  if (!element) {
    element = document.createElement("meta");
    element.name = name;
    document.head.appendChild(element);
  }
  element.content = content;
}

export function registerElAnclaPwa() {
  // El manifest indica nombre, colores, iconos y presentación standalone.
  addHeadLink("manifest", `${publicBase}/manifest.webmanifest`);

  // iOS utiliza este icono al agregar el sitio a la pantalla de inicio.
  addHeadLink("apple-touch-icon", `${publicBase}/icons/apple-touch-icon.png`);

  addHeadMeta("theme-color", "#20374B");
  addHeadMeta("apple-mobile-web-app-capable", "yes");
  addHeadMeta("apple-mobile-web-app-status-bar-style", "default");
  addHeadMeta("apple-mobile-web-app-title", "El Ancla");

  // Evita instalar service workers durante npm start (desarrollo),
  // donde podrían interferir con la actualización instantánea del código.
  if (process.env.NODE_ENV !== "production") return;

  // Los service workers requieren HTTPS, salvo localhost.
  if (!("serviceWorker" in navigator)) return;

  // Espera hasta que termine de cargar el documento.
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(`${publicBase}/service-worker.js`, {
      scope: `${publicBase || ""}/`,
    }).catch((error) => {
      // No exponemos detalles internos ni interrumpimos la aplicación.
      console.warn("La lectura sin conexión no está disponible:", error);
    });
  }, { once: true });
}
