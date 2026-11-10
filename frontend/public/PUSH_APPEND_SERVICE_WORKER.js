/* =========================================================
   COPIAR ESTE BLOQUE AL FINAL DE public/service-worker.js
   NO sustituir la lógica de caché existente.
   ========================================================= */

// Recibe un mensaje enviado por el proveedor push aunque la PWA esté cerrada.
self.addEventListener("push", (event) => {
  event.waitUntil((async () => {
    let payload = {};
    try { payload = event.data ? event.data.json() : {}; } catch { payload = {}; }
    const title = String(payload.title || "Iglesia El Ancla ⚓").slice(0, 80);
    const body = String(payload.body || "Tienes un nuevo aviso de la comunidad.").slice(0, 180);
    // No permitimos abrir enlaces externos desde un mensaje push.
    const url = typeof payload.url === "string" && payload.url.startsWith("/") &&
      !payload.url.startsWith("//") ? payload.url : "/member";
    await self.registration.showNotification(title, {
      body, icon: "/icons/icon-192.png", badge: "/icons/icon-96.png",
      tag: String(payload.tag || "el-ancla-aviso").slice(0, 70),
      data: { url },
    });
  })());
});

// Al pulsar el aviso, abre la página adecuada de la PWA.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil((async () => {
    const path = event.notification.data?.url || "/member";
    const target = new URL(path, self.location.origin);
    if (target.origin !== self.location.origin) return;
    const clientsList = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    const existing = clientsList.find(client => new URL(client.url).origin === target.origin);
    if (existing) {
      await existing.navigate(target.href);
      await existing.focus();
    } else {
      await self.clients.openWindow(target.href);
    }
  })());
});
