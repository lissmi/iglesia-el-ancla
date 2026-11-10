// =========================================================
// ENTREGA WEB PUSH — UNA SOLA FUENTE PARA TODAS LAS CUENTAS
// Reutiliza PushSubscription: NO crea colecciones nuevas.
// =========================================================
import { createHash } from "node:crypto";
import PushSubscription from "../../models/PushSubscription.js";
import User from "../../models/User.js";
import Activity from "../../models/Activity.js";
import ActivityConfirmation from "../../models/ActivityConfirmation.js";
import Event from "../../models/Event.js";
import { sendWebPush } from "./pushService.js";
import { chileClock, addCivilDays, needsActivityConfirmation, occursToday, makeSafePayload } from "./pushPolicy.js";

// Activación explícita para evitar notificaciones durante pruebas o despliegues incompletos.
export const automaticPushEnabled = () => process.env.PUSH_AUTOMATIC_ENABLED === "true";

// Limitamos el volumen por ejecución. La cantidad de usuarios deberá revisarse si la iglesia crece.
const MAX_SUBSCRIPTIONS = 500;
const CONCURRENCY = 8;
const MAX_MARKERS = 120;

// Guardamos solamente una huella compacta: no guardamos textos ni nombres en MongoDB.
function marker(value) {
  return createHash("sha256").update(value).digest("hex").slice(0, 32);
}

// Filtramos suscripciones de cuentas aún activas antes de programar el envío.
async function getActiveSubscriptions({ exceptUserId } = {}) {
  const query = exceptUserId ? { user: { $ne: exceptUserId } } : {};
  const subscriptions = await PushSubscription.find(query)
    .select("_id user endpoint keys").sort({ _id: 1 }).limit(MAX_SUBSCRIPTIONS).lean();
  if (!subscriptions.length) return [];
  const userIds = [...new Set(subscriptions.map((s) => String(s.user)))];
  const users = await User.find({ _id: { $in: userIds }, isActive: true }).select("_id role").lean();
  const authorized = new Map(users.map((u) => [String(u._id), u]));
  return subscriptions.filter((s) => authorized.has(String(s.user)))
    .map((s) => ({ ...s, role: authorized.get(String(s.user)).role }));
}

// Una reclamación atómica impide enviar el mismo aviso dos veces al mismo dispositivo.
async function deliverOnce(subscription, dedupeKey, payload) {
  const isDaily = dedupeKey.startsWith("daily:");
  const day = isDaily ? dedupeKey.split(":").at(-1) : null;
  const key = marker(dedupeKey);

  // Los recordatorios diarios se guardan en un campo individual, no sujeto al
  // límite del historial: ni 200 publicaciones adicionales permitirán duplicarlo.
  const filter = isDaily
    ? { _id: subscription._id, lastDailyReminderDay: { $ne: day } }
    : { _id: subscription._id, deliveryKeys: { $ne: key } };
  const update = isDaily
    ? { $set: { lastDailyReminderDay: day } }
    : { $push: { deliveryKeys: { $each: [key], $slice: -MAX_MARKERS } } };
  const result = await PushSubscription.updateOne(filter, update);
  if (result.modifiedCount !== 1) return "already-sent";

  try {
    // Web Push solo confirma aceptación por el proveedor, no lectura del usuario.
    await sendWebPush(subscription, payload);
    return "sent";
  } catch (error) {
    // Retiramos suscripciones que el proveedor ya considera inválidas.
    if ([404, 410].includes(error?.statusCode)) {
      await PushSubscription.deleteOne({ _id: subscription._id });
      return "expired";
    }
    // Otros errores permiten reintentar. Solo retiramos la marca reclamada.
    if (isDaily) {
      await PushSubscription.updateOne({ _id: subscription._id, lastDailyReminderDay: day },
        { $unset: { lastDailyReminderDay: 1 } });
    } else {
      await PushSubscription.updateOne({ _id: subscription._id }, { $pull: { deliveryKeys: key } });
    }
    return "failed";
  }
}

// Procesamos pocos dispositivos simultáneamente para proteger la API y los proveedores.
async function deliverBatch(entries, select) {
  const summary = { sent: 0, alreadySent: 0, expired: 0, failed: 0, devices: entries.length };
  for (let index = 0; index < entries.length; index += CONCURRENCY) {
    const batch = entries.slice(index, index + CONCURRENCY);
    const results = await Promise.all(batch.map(async (sub) => {
      try { return await select(sub); } catch { return "failed"; }
    }));
    for (const result of results) {
      const field = ({ "sent": "sent", "already-sent": "alreadySent", "expired": "expired", "failed": "failed" })[result];
      if (field) summary[field]++;
    }
  }
  return summary;
}

// Publicaciones/insumos/oración: solo un aviso por categoría y día, por dispositivo.
export async function announceCommunityChange(kind, { exceptUserId, allowedRoles } = {}) {
  if (!automaticPushEnabled()) return { disabled: true };
  const payload = makeSafePayload(kind);
  const today = chileClock().date;
  const all = await getActiveSubscriptions({ exceptUserId });
  // Para peticiones privadas, limitar estrictamente a los roles autorizados.
  const subscriptions = Array.isArray(allowedRoles)
    ? all.filter((sub) => allowedRoles.includes(sub.role)) : all;
  return deliverBatch(subscriptions, (sub) => deliverOnce(sub, `announcement:${kind}:${today}`, {
    ...payload,
    // El mismo enlace de administración funciona en ambos paneles según el rol.
    ...(kind === "privatePrayer" && sub.role === "super_admin"
      ? { url: "/super-admin/peticiones-oracion" } : {}),
  }));
}

// Recordatorios: una notificación al día como máximo por usuario y dispositivo.
// Si hay múltiples actividades sin respuesta, el aviso agrupa todas sin exponer títulos.
export async function runDailyCommunityReminders(nowDate = new Date()) {
  if (!automaticPushEnabled()) return { disabled: true };

  const now = chileClock(nowDate);
  const subscriptions = await getActiveSubscriptions();
  if (!subscriptions.length) return { date: now.date, devices: 0, sent: 0 };

  // Solo consideramos actividades próximas, publicadas y que exigen confirmación.
  const activities = await Activity.find({
    publicationStatus: "published", requiresConfirmation: true,
    date: { $gte: now.date, $lte: addCivilDays(now.date, 14) },
  }).select("_id date time requiresConfirmation publicationStatus capacity").limit(200).lean();

  // La inscripción ya confirmada excluye al usuario inmediatamente del recordatorio.
  const confirmations = activities.length ? await ActivityConfirmation.find({
    activity: { $in: activities.map((a) => a._id) },
  }).select("activity member").lean() : [];
  const confirmedPairs = new Set(confirmations.map((c) => `${String(c.member)}:${String(c.activity)}`));
  const counts = new Map();
  for (const c of confirmations) counts.set(String(c.activity), (counts.get(String(c.activity)) || 0) + 1);

  const upcoming = activities.filter((a) =>
    needsActivityConfirmation(a, false, now) &&
    (!a.capacity || (counts.get(String(a._id)) || 0) < a.capacity)
  );

  // Solo recordamos reuniones regulares con día exacto calculable para hoy.
  const events = await Event.find({ publicationStatus: "published", date: { $lte: now.date } })
    .select("_id date time recurrence publicationStatus").limit(100).lean();
  const gatheringToday = events.some((e) => occursToday(e, now.date) && e.time > now.time);

  const result = await deliverBatch(subscriptions, async (sub) => {
    const userId = String(sub.user);
    const needsConfirmation = upcoming.some((a) => !confirmedPairs.has(`${userId}:${String(a._id)}`));
    // Los recordatorios de confirmación tienen prioridad sobre las reuniones generales.
    if (needsConfirmation) {
      return deliverOnce(sub, `daily:one-per-user:${now.date}`, makeSafePayload("confirmation"));
    }
    if (gatheringToday) {
      return deliverOnce(sub, `daily:one-per-user:${now.date}`, makeSafePayload("gathering"));
    }
    return "skipped";
  });
  return { date: now.date, ...result };
}
