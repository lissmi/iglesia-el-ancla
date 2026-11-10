// =========================================================
// API DE NOTIFICACIONES UNIFICADAS — CUENTA AUTENTICADA
// Se reusan los documentos de inventario, actividades y finanzas.
// Solo persistimos identificadores leídos dentro de User.
// =========================================================
import { Router } from "express";
import User from "../models/User.js";
import authenticateUser from "../middleware/authenticateUser.js";
import validateRequestOrigin from "../middleware/validateRequestOrigin.js";
import { buildUserNotifications } from "../services/notifications/buildUserNotifications.js";

const router = Router();
const MAX_READ_IDS = 250;

// Ningún endpoint acepta visitantes sin cookie y sesión validada.
router.use(authenticateUser);

// Evitamos que navegadores o CDN guarden respuestas por usuario.
router.use((_req, res, next) => {
  res.set("Cache-Control", "private, no-store, max-age=0");
  next();
});

// Validamos IDs con formato cerrado y tamaño limitado.
function validNotificationId(value) {
  return typeof value === "string" && value.length <= 180 &&
    /^(supply|volunteer|activity|event|prayer|expense-overdue):[A-Za-z0-9:_-]+$/.test(value);
}

// Añadimos IDs leídos de modo atómico, sin que crezca ilimitadamente el usuario.
async function storeReadIds(userId, ids) {
  if (!ids.length) return;
  await User.updateOne({ _id: userId }, [{
    $set: {
      notificationReadIds: {
        $slice: [
          { $concatArrays: [
            { $filter: {
              input: { $ifNull: ["$notificationReadIds", []] },
              as: "existing",
              cond: { $not: [{ $in: ["$$existing", ids] }] },
            } },
            ids,
          ] },
          -MAX_READ_IDS,
        ],
      },
    },
  }]);
}

// Devuelve la misma bandeja en Inicio, /member y panel administrativo.
router.get("/", async (req, res, next) => {
  try {
    const items = await buildUserNotifications(req.user);
    const record = await User.findById(req.user._id).select("+notificationReadIds").lean();
    if (!record) return res.status(401).json({ success: false, message: "Sesión no válida" });
    const read = new Set(record.notificationReadIds || []);
    const notifications = items.map((item) => ({ ...item, read: read.has(item.id) }));
    return res.json({
      success: true,
      notifications,
      unreadCount: notifications.filter((item) => !item.read).length,
    });
  } catch (error) { return next(error); }
});

// La lectura de un aviso es personal, nunca se elige el usuario desde React.
router.post("/read", validateRequestOrigin, async (req, res, next) => {
  try {
    const id = req.body?.id;
    if (!validNotificationId(id) || Object.keys(req.body || {}).some((key) => key !== "id")) {
      return res.status(400).json({ success: false, message: "Aviso inválido" });
    }
    // Solo aceptamos avisos que el servidor acaba de autorizar para esta cuenta.
    const entries = await buildUserNotifications(req.user);
    if (!entries.some((item) => item.id === id)) {
      return res.status(404).json({ success: false, message: "Aviso no disponible" });
    }
    await storeReadIds(req.user._id, [id]);
    return res.json({ success: true });
  } catch (error) { return next(error); }
});

// Marca únicamente los avisos autorizados que siguen vigentes para esta cuenta.
router.post("/read-all", validateRequestOrigin, async (req, res, next) => {
  try {
    if (req.body && Object.keys(req.body).length) {
      return res.status(400).json({ success: false, message: "Solicitud inválida" });
    }
    const entries = await buildUserNotifications(req.user);
    await storeReadIds(req.user._id, entries.map((item) => item.id));
    return res.json({ success: true });
  } catch (error) { return next(error); }
});

export default router;
