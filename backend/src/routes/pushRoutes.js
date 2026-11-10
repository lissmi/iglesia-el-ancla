
// Rutas personales y protegidas: activar y desactivar Web Push.
import { Router } from "express";
import { createHash, timingSafeEqual } from "node:crypto";
import authenticateUser from "../middleware/authenticateUser.js";
import PushSubscription from "../models/PushSubscription.js";
import { configureWebPush } from "../services/push/pushService.js";
import { runDailyCommunityReminders } from "../services/push/automaticPushService.js";

const router = Router();

// =========================================================
// CRON PRIVADO: INVOCADO POR VERCEL CADA DÍA (UTC).
// Sin contraseña, ni siquiera en desarrollo, este endpoint responde 503.
// NO depende de cookies ni de que el usuario abra la PWA.
// =========================================================
router.get("/cron", async (req, res, next) => {
  const secret = process.env.CRON_SECRET || "";
  if (secret.length < 32) {
    return res.status(503).json({ success: false, message: "Programador no configurado" });
  }
  // Comparamos resúmenes de longitud constante para no filtrar el secreto.
  const received = req.get("authorization") || "";
  const expected = createHash("sha256").update(`Bearer ${secret}`).digest();
  const actual = createHash("sha256").update(received).digest();
  if (!timingSafeEqual(expected, actual)) {
    return res.status(401).json({ success: false, message: "No autorizado" });
  }
  try {
    const summary = await runDailyCommunityReminders();
    res.set("Cache-Control", "no-store");
    // Solo devolvemos contadores técnicos, nunca datos de destinatarios.
    return res.json({ success: true, summary });
  } catch (error) { return next(error); }
});

// Todas las rutas de dispositivos siguen necesitando una sesión válida.
router.use(authenticateUser);

// No revelar trazas de las suscripciones ni de las claves en respuestas públicas.
function isValidSubscription(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const { endpoint, keys } = value;
  if (typeof endpoint !== "string" || endpoint.length > 2048) return false;
  let u;
  try { u = new URL(endpoint); } catch { return false; }
  // Evitar SSRF: solo endpoints de proveedores push conocidos, por HTTPS y 443.
  if (u.protocol !== "https:" || u.username || u.password || (u.port && u.port !== "443")) return false;
  const h = u.hostname.toLowerCase();
  const approved = [
    "fcm.googleapis.com", "updates.push.services.mozilla.com",
    "web.push.apple.com", "push.services.mozilla.com",
    "wns2-*.notify.windows.com",
  ];
  const known = approved.slice(0, 4).includes(h) ||
    (h.endsWith(".push.apple.com") && h !== "push.apple.com") ||
    (h.endsWith(".notify.windows.com") && h !== "notify.windows.com");
  if (!known || typeof keys?.p256dh !== "string" || typeof keys?.auth !== "string") return false;
  return /^[A-Za-z0-9_-]{40,256}$/.test(keys.p256dh) &&
    /^[A-Za-z0-9_-]{16,256}$/.test(keys.auth);
}

// Aceptamos únicamente peticiones originadas en el frontend configurado.
// Importante: actualizar FRONTEND_URL a la URL real en producción.
function requireTrustedOrigin(req, res, next) {
  const origin = req.get("origin");
  const allowed = (process.env.FRONTEND_URL || "http://localhost:3000")
    .split(",").map(s => s.trim()).filter(Boolean);
  if (!origin || !allowed.includes(origin)) {
    return res.status(403).json({ success: false, message: "Origen no autorizado" });
  }
  next();
}

// La clave pública sí puede compartirse con el navegador.
router.get("/public-key", (req, res) => {
  try {
    const publicKey = configureWebPush();
    return res.json({ success: true, data: { publicKey } });
  } catch {
    return res.status(503).json({ success: false, message: "Avisos todavía no configurados" });
  }
});

// Comprueba si la suscripción del dispositivo está vinculada a la cuenta actual.
// No basta con que el navegador diga que la suscripción existe.
router.post("/status", requireTrustedOrigin, async (req, res, next) => {
  try {
    const endpoint = req.body?.endpoint;
    if (typeof endpoint !== "string" || endpoint.length > 2048) {
      return res.status(400).json({ success: false, message: "Solicitud no válida" });
    }
    const active = await PushSubscription.exists({ endpoint, user: req.user._id });
    return res.json({ success: true, active: Boolean(active) });
  } catch (error) { return next(error); }
});

// El cliente solo puede inscribir su propia cuenta autenticada.
router.post("/subscribe", requireTrustedOrigin, async (req, res) => {
  try {
    if (!isValidSubscription(req.body?.subscription)) {
      return res.status(400).json({ success: false, message: "Suscripción no válida" });
    }
    const { endpoint, keys } = req.body.subscription;
    // Idempotente: actualiza la suscripción del mismo dispositivo si ya existe.
    // Si otra cuenta utilizó antes este navegador, reiniciamos sus marcas
    // para que los avisos nuevos correspondan únicamente a la cuenta actual.
    const existing = await PushSubscription.findOne({ endpoint }).select("user").lean();
    const switchedAccount = existing && String(existing.user) !== String(req.user._id);
    await PushSubscription.findOneAndUpdate(
      { endpoint },
      { $set: { user: req.user._id, keys, updatedAt: new Date(),
        ...(switchedAccount ? { deliveryKeys: [], lastDailyReminderDay: "" } : {}) },
        $setOnInsert: { createdAt: new Date() } },
      { upsert: true, new: true, runValidators: true }
    );
    return res.json({ success: true, message: "Avisos activados" });
  } catch {
    return res.status(500).json({ success: false, message: "No se pudo activar los avisos" });
  }
});

router.post("/unsubscribe", requireTrustedOrigin, async (req, res) => {
  try {
    const endpoint = req.body?.endpoint;
    if (typeof endpoint !== "string" || endpoint.length > 2048) {
      return res.status(400).json({ success: false, message: "Solicitud no válida" });
    }
    // No permite retirar suscripciones de otros usuarios.
    await PushSubscription.deleteOne({ endpoint, user: req.user._id });
    return res.json({ success: true });
  } catch {
    return res.status(500).json({ success: false, message: "No se pudo desactivar los avisos" });
  }
});

export default router;
