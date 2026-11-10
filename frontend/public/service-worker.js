
/* =========================================================
   SERVICE WORKER — IGLESIA EL ANCLA ⚓
   Caché exclusiva de recursos públicos estáticos.
   No almacena API, sesiones, videos ni datos privados.
   ========================================================= */

// Cambiamos la versión para retirar la caché anterior.
const CACHE_NAME = "el-ancla-static-v2";

// Página informativa para cuando no existe conexión.
const OFFLINE_URL = "/offline.html";

// Identificador de las cachés administradas por este módulo.
const CACHE_PREFIX = "el-ancla-static-";

// Extensiones de archivos públicos que podemos almacenar.
const STATIC_FILE_PATTERN =
  /\.(?:js|css|png|jpg|jpeg|webp|svg|gif|ico|woff|woff2)$/i;


// =========================================================
// INSTALACIÓN
// =========================================================

self.addEventListener("install", (event) => {

  // Guardamos solamente nuestra página informativa offline.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.add(OFFLINE_URL))
      .then(() => self.skipWaiting())
  );

});


// =========================================================
// ACTIVACIÓN
// =========================================================

self.addEventListener("activate", (event) => {

  event.waitUntil(
    (async () => {

      // Consultamos las cachés existentes.
      const cacheNames = await caches.keys();

      // Eliminamos versiones anteriores de nuestra caché.
      await Promise.all(
        cacheNames
          .filter(
            (name) =>
              name.startsWith(CACHE_PREFIX) &&
              name !== CACHE_NAME
          )
          .map((name) => caches.delete(name))
      );

      // Permitimos controlar las páginas abiertas.
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

  // No intervenimos en POST, PUT, PATCH ni DELETE.
  if (request.method !== "GET") {
    return;
  }

  // Identificamos la URL solicitada.
  const url = new URL(request.url);

  // No interceptamos servicios externos.
  if (url.origin !== self.location.origin) {
    return;
  }

  // No interceptamos solicitudes a la API.
  if (
    url.pathname === "/api" ||
    url.pathname.startsWith("/api/")
  ) {
    return;
  }

  // =======================================================
  // VIDEOS, AUDIOS Y RESPUESTAS PARCIALES
  // =======================================================

  // Los videos y audios se solicitan directamente a la red.
  // Esto evita intentar almacenar respuestas HTTP 206.
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

          // Siempre buscamos la página actual en la red.
          // Nunca almacenamos HTML de sesiones privadas.
          return await fetch(request);

        } catch {

          // Si falla la conexión, mostramos un aviso público.
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

  // Solo procesamos archivos estáticos permitidos.
  if (!STATIC_FILE_PATTERN.test(url.pathname)) {
    return;
  }

  // Interceptamos únicamente estos recursos públicos.
  event.respondWith(
    (async () => {

      // Buscamos una copia por si falla Internet.
      const cachedResponse =
        await caches.match(request);

      try {

        // Priorizamos la versión actual del servidor.
        const networkResponse = await fetch(request);

        // Solamente almacenamos respuestas completas.
        if (
          networkResponse.status === 200 &&
          networkResponse.type === "basic"
        ) {

          // Los errores de caché no deben impedir
          // que el navegador reciba el archivo.
          try {

            const cache = await caches.open(CACHE_NAME);

            // Guardamos una copia de la respuesta.
            await cache.put(
              request,
              networkResponse.clone()
            );

          } catch (cacheError) {

            // Registramos el error solamente
            // para facilitar las pruebas.
            console.warn(
              "No se pudo guardar el recurso estático:",
              cacheError
            );

          }

        }

        // Devolvemos la respuesta original al navegador.
        return networkResponse;

      } catch {

        // Si no hay Internet, usamos el archivo guardado.
        return cachedResponse || Response.error();

      }

    })()
  );

});
