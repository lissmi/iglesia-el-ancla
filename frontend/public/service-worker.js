
/* =========================================================
   SERVICE WORKER — IGLESIA EL ANCLA ⚓

   Funcionalidades:
   1. Caché de recursos públicos estáticos.
   2. Página informativa sin conexión.
   3. Exclusión de API, sesiones, videos y audios.
   4. Recepción de notificaciones Web Push.
   5. Navegación segura al tocar una notificación.

   No almacena respuestas privadas ni sesiones.
   ========================================================= */


// =========================================================
// CONFIGURACIÓN GENERAL
// =========================================================

// Nueva versión de caché para la actualización del Service Worker.
const CACHE_NAME = "el-ancla-static-v4";

// Página pública que se muestra cuando no existe conexión.
const OFFLINE_URL = "/offline.html";

// Prefijo que identifica las cachés de nuestra aplicación.
const CACHE_PREFIX = "el-ancla-static-";

// Tipos de archivos públicos que podemos almacenar.
const STATIC_FILE_PATTERN =
  /\.(?:js|css|png|jpg|jpeg|webp|svg|gif|ico|woff|woff2)$/i;


// =========================================================
// CONFIGURACIÓN DE NOTIFICACIONES PUSH
// =========================================================

// Título que utilizaremos si el servidor no envía uno.
const PUSH_DEFAULT_TITLE = "Iglesia El Ancla ⚓";

// Mensaje predeterminado para notificaciones sin contenido.
const PUSH_DEFAULT_BODY =
  "Tienes un nuevo aviso de Iglesia El Ancla.";

// Icono institucional para las notificaciones de Android.
const PUSH_ICON = "/icons/icon-192-v2.png";

// Icono pequeño para dispositivos compatibles.
const PUSH_BADGE = "/icons/notification-badge-96.png";

// Ruta predeterminada que abriremos al tocar un aviso.
const PUSH_DEFAULT_URL = "/member";


// =========================================================
// INSTALACIÓN DEL SERVICE WORKER
// =========================================================

self.addEventListener("install", (event) => {

  // Guardamos solamente la página informativa sin conexión.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.add(OFFLINE_URL))
      .then(() => self.skipWaiting())
  );

});


// =========================================================
// ACTIVACIÓN DEL SERVICE WORKER
// =========================================================

self.addEventListener("activate", (event) => {

  event.waitUntil(
    (async () => {

      // Consultamos todas las cachés disponibles.
      const cacheNames = await caches.keys();

      // Eliminamos únicamente versiones antiguas
      // de las cachés administradas por El Ancla.
      await Promise.all(
        cacheNames
          .filter(
            (name) =>
              name.startsWith(CACHE_PREFIX) &&
              name !== CACHE_NAME
          )
          .map((name) => caches.delete(name))
      );

      // Permitimos controlar inmediatamente
      // las páginas abiertas de nuestra aplicación.
      await self.clients.claim();

    })()
  );

});


// =========================================================
// INTERCEPTACIÓN CONTROLADA DE SOLICITUDES
// =========================================================

self.addEventListener("fetch", (event) => {

  // Obtenemos la solicitud original.
  const request = event.request;

  // No interceptamos métodos que modifican información.
  if (request.method !== "GET") {
    return;
  }

  // Identificamos la dirección solicitada.
  const url = new URL(request.url);

  // No interceptamos recursos de servidores externos.
  if (url.origin !== self.location.origin) {
    return;
  }

  // Nunca almacenamos respuestas de nuestra API.
  if (
    url.pathname === "/api" ||
    url.pathname.startsWith("/api/")
  ) {
    return;
  }


  // =======================================================
  // EXCLUSIÓN DE VIDEOS, AUDIOS Y RESPUESTAS PARCIALES
  // =======================================================

  // Dejamos que el navegador gestione estos archivos.
  // Esto evita almacenar respuestas HTTP 206.
  if (
    request.destination === "video" ||
    request.destination === "audio" ||
    request.headers.has("Range") ||
    /\.(?:mp4|webm|mov|mp3|wav|ogg|m4a)$/i.test(
      url.pathname
    )
  ) {
    return;
  }


  // =======================================================
  // NAVEGACIÓN ENTRE PÁGINAS
  // =======================================================

  if (request.mode === "navigate") {

    event.respondWith(
      (async () => {

        try {

          // Solicitamos siempre la página actual al servidor.
          // No almacenamos HTML de sesiones privadas.
          return await fetch(request);

        } catch {

          // Si no hay conexión, mostramos la página offline.
          const offlinePage =
            await caches.match(OFFLINE_URL);

          return offlinePage || Response.error();

        }

      })()
    );

    return;
  }


  // =======================================================
  // RECURSOS PÚBLICOS ESTÁTICOS
  // =======================================================

  // Solo procesamos archivos con extensiones permitidas.
  if (!STATIC_FILE_PATTERN.test(url.pathname)) {
    return;
  }

  event.respondWith(
    (async () => {

      // Buscamos una copia para utilizarla sin conexión.
      const cachedResponse =
        await caches.match(request);

      try {

        // Siempre priorizamos la versión del servidor.
        const networkResponse = await fetch(request);

        // Guardamos únicamente respuestas completas y válidas.
        if (
          networkResponse.status === 200 &&
          networkResponse.type === "basic"
        ) {

          try {

            // Abrimos nuestra caché estática.
            const cache = await caches.open(CACHE_NAME);

            // Guardamos una copia sin modificar la respuesta.
            await cache.put(
              request,
              networkResponse.clone()
            );

          } catch (cacheError) {

            // Un fallo de caché no debe impedir
            // que el archivo llegue al navegador.
            console.warn(
              "No se pudo guardar el recurso estático:",
              cacheError
            );

          }

        }

        // Entregamos la respuesta obtenida de Internet.
        return networkResponse;

      } catch {

        // Si Internet falla, utilizamos la copia disponible.
        return cachedResponse || Response.error();

      }

    })()
  );

});


// =========================================================
// VALIDACIÓN DE RUTAS DE NOTIFICACIONES
// =========================================================

// Comprueba que una notificación abra solamente
// direcciones pertenecientes a Iglesia El Ancla.
function getSafeNotificationUrl(value) {

  try {

    // Aceptamos únicamente rutas internas que comienzan
    // con una barra, pero no con dos barras.
    if (
      typeof value !== "string" ||
      !value.startsWith("/") ||
      value.startsWith("//") ||
      value.includes("\\")
    ) {
      return new URL(PUSH_DEFAULT_URL, self.location.origin);
    }

    // Construimos la dirección usando nuestro dominio.
    const destination =
      new URL(value, self.location.origin);

    // Evitamos abrir sitios externos desde una notificación.
    if (destination.origin !== self.location.origin) {
      return new URL(PUSH_DEFAULT_URL, self.location.origin);
    }

    // Devolvemos la dirección interna validada.
    return destination;

  } catch {

    // Si el formato no es válido, abrimos la ruta predeterminada.
    return new URL(PUSH_DEFAULT_URL, self.location.origin);

  }

}


// =========================================================
// RECEPCIÓN DE NOTIFICACIONES PUSH
// =========================================================

self.addEventListener("push", (event) => {

  // El Service Worker puede recibir eventos sin contenido.
  // Por eso preparamos valores seguros.
  let payload = {};

  try {

    // Interpretamos como JSON el mensaje del backend.
    if (event.data) {
      payload = event.data.json();
    }

  } catch {

    // Si el mensaje no es JSON, mostramos uno genérico.
    payload = {};

  }

  // Evitamos trabajar con arreglos o valores inesperados.
  if (
    !payload ||
    typeof payload !== "object" ||
    Array.isArray(payload)
  ) {
    payload = {};
  }

  // Utilizamos el título recibido o nuestro título oficial.
  const title =
    typeof payload.title === "string" &&
    payload.title.trim()
      ? payload.title.slice(0, 100)
      : PUSH_DEFAULT_TITLE;

  // Utilizamos el mensaje recibido o uno predeterminado.
  const body =
    typeof payload.body === "string" &&
    payload.body.trim()
      ? payload.body.slice(0, 300)
      : PUSH_DEFAULT_BODY;

  // Validamos la ruta que abrirá la notificación.
  const destination =
    getSafeNotificationUrl(payload.url);

  // Opciones visuales de la notificación.
  const options = {

    // Texto principal del aviso.
    body,

    // Icono institucional grande.
    icon: PUSH_ICON,

    // Icono pequeño para Android.
    badge: PUSH_BADGE,

    // Identificador que permite agrupar avisos equivalentes.
    tag:
      typeof payload.tag === "string" &&
      payload.tag.trim()
        ? payload.tag.slice(0, 100)
        : "el-ancla-general",

    // No obligamos a mantener la notificación visible.
    requireInteraction: false,

    // Guardamos únicamente la ruta interna de navegación.
    data: {
      url: destination.pathname +
        destination.search +
        destination.hash,
    },

  };

  // Mostramos la notificación usando la API del navegador.
  event.waitUntil(
    self.registration.showNotification(
      title,
      options
    )
  );

});


// =========================================================
// INTERACCIÓN AL TOCAR UNA NOTIFICACIÓN
// =========================================================

self.addEventListener("notificationclick", (event) => {

  // Cerramos la notificación seleccionada.
  event.notification.close();

  // Recuperamos la ruta enviada por el backend.
  const requestedUrl =
    event.notification.data?.url ||
    PUSH_DEFAULT_URL;

  // Verificamos nuevamente que pertenezca a nuestro sitio.
  const destination =
    getSafeNotificationUrl(requestedUrl);

  // Permitimos que el navegador mantenga vivo el proceso
  // mientras buscamos una ventana o abrimos la aplicación.
  event.waitUntil(
    (async () => {

      // Consultamos las ventanas de nuestra aplicación.
      const windowClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      // Buscamos una ventana existente de Iglesia El Ancla.
      const existingClient = windowClients.find((client) => {

        try {

          // Comprobamos que el cliente pertenece al mismo dominio.
          return new URL(client.url).origin ===
            self.location.origin;

        } catch {

          return false;

        }

      });

      // Si la aplicación ya está abierta, la reutilizamos.
      if (existingClient) {

        // Navegamos hasta la sección correspondiente.
        if ("navigate" in existingClient) {

          const navigatedClient =
            await existingClient.navigate(destination.href);

          // Traemos la ventana al primer plano.
          if (navigatedClient?.focus) {
            return navigatedClient.focus();
          }

        }

        // Si no fue necesario navegar, enfocamos la ventana.
        if ("focus" in existingClient) {
          return existingClient.focus();
        }

      }

      // Si la aplicación está cerrada, abrimos una ventana.
      if (self.clients.openWindow) {
        return self.clients.openWindow(destination.href);
      }

    })()
  );

});
