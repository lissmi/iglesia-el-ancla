// Envío desde Node.js; las claves VAPID privadas nunca llegan al frontend.
import webpush from "web-push";

export function configureWebPush() {
  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !VAPID_SUBJECT) {
    throw new Error("Faltan las variables VAPID del servidor");
  }
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  return VAPID_PUBLIC_KEY;
}

export async function sendWebPush(subscription, payload) {
  configureWebPush();
  return webpush.sendNotification(
    { endpoint: subscription.endpoint, keys: subscription.keys },
    JSON.stringify(payload),
    { TTL: 60, urgency: "normal" }
  );
}
