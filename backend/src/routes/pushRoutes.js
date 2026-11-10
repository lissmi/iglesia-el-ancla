// Rutas personales y protegidas: activar, desactivar y probar Web Push.
import { Router } from "express";
import rateLimit from "express-rate-limit";
import authenticateUser from "../middleware/authenticateUser.js";
import PushSubscription from "../models/PushSubscription.js";
import { configureWebPush, sendWebPush } from "../services/push/pushService.js";

const router = Router();
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

const testLimiter = rateLimit({
  windowMs: 60 * 1000, limit: 3,
  standardHeaders: "draft-8", legacyHeaders: false,
  message: { success: false, message: "Espera un momento antes de volver a probar" },
  keyGenerator: (req) => String(req.user._id),
});

// La clave pública sí puede compartirse con el navegador.
router.get("/public-key", (req, res) => {
  try {
    const publicKey = configureWebPush();
    return res.json({ success: true, data: { publicKey } });
  } catch {
    return res.status(503).json({ success: false, message: "Avisos todavía no configurados" });
  }
});

// El cliente solo puede inscribir su propia cuenta autenticada.
router.post("/subscribe", requireTrustedOrigin, async (req, res) => {
  try {
    if (!isValidSubscription(req.body?.subscription)) {
      return res.status(400).json({ success: false, message: "Suscripción no válida" });
    }
    const { endpoint, keys } = req.body.subscription;
    // Idempotente: actualiza la suscripción del mismo dispositivo si ya existe.
    await PushSubscription.findOneAndUpdate(
      { endpoint },
      { $set: { user: req.user._id, keys, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
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

// Solo envía una prueba a una suscripción ya asociada con el usuario autenticado.
router.post("/test", requireTrustedOrigin, testLimiter, async (req, res) => {
  try {
    const endpoint = req.body?.endpoint;
    if (typeof endpoint !== "string" || endpoint.length > 2048) {
      return res.status(400).json({ success: false, message: "Solicitud no válida" });
    }
    const sub = await PushSubscription.findOne({ endpoint, user: req.user._id });
    if (!sub) return res.status(404).json({ success: false, message: "Activa primero los avisos en este dispositivo" });
    try {
      await sendWebPush(sub, {
        title: "Iglesia El Ancla ⚓", body: "¡La notificación de prueba llegó correctamente! 💙",
        url: "/member", tag: "el-ancla-prueba",
      });
      return res.json({ success: true, message: "Prueba enviada" });
    } catch (error) {
      // 404/410 indican que el proveedor invalidó la suscripción.
      if ([404, 410].includes(error.statusCode)) {
        await PushSubscription.deleteOne({ _id: sub._id });
      }
      return res.status(502).json({ success: false, message: "No se pudo entregar la prueba" });
    }
  } catch {
    return res.status(500).json({ success: false, message: "Error al enviar la prueba" });
  }
});

export default router;
