
// Suscripciones Web Push asociadas a una cuenta y un dispositivo.
import mongoose from "mongoose";

const pushSubscriptionSchema = new mongoose.Schema({
  // El usuario se obtiene siempre del JWT verificado por el servidor.
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  // Una misma suscripción no debe duplicarse.
  endpoint: { type: String, required: true, unique: true, maxlength: 2048 },
  // Claves técnicas proporcionadas por PushManager; no son credenciales del usuario.
  keys: {
    p256dh: { type: String, required: true, maxlength: 256 },
    auth: { type: String, required: true, maxlength: 256 },
  },
  // Huellas de envíos recientes: evita repetir un aviso al reiniciarse Vercel.
  // Nunca contiene títulos, fechas de nacimiento ni información personal.
  // La escritura atómica en automaticPushService limita este arreglo a 120 claves.
  deliveryKeys: { type: [String], default: undefined, select: false },
  // Control independiente: un recordatorio diario por dispositivo y día chileno.
  lastDailyReminderDay: { type: String, default: undefined, select: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { versionKey: false });

export default mongoose.models.PushSubscription ||
  mongoose.model("PushSubscription", pushSubscriptionSchema);
