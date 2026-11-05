// =========================================================
// ENDPOINT PRIVADO PARA EL PROGRAMADOR DE RECORDATORIOS
// NO depende de una sesión de miembro ni acepta IDs desde el navegador.
// =========================================================
import { Router } from "express";
import { timingSafeEqual } from "node:crypto";
import { sendVolunteerReminders } from "../services/mail/volunteerReminderService.js";

const router = Router();

function validSecret(value) {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 32 || typeof value !== "string") return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const provided = Buffer.from(value);
  return expected.length === provided.length && timingSafeEqual(expected, provided);
}

router.get("/volunteer-reminders", async (req, res, next) => {
  // Deshabilitamos la caché: cada ejecución debe consultar MongoDB.
  res.set("Cache-Control", "no-store");
  if (!validSecret(req.get("Authorization"))) {
    return res.status(401).json({ success: false, message: "No autorizado" });
  }
  try {
    const summary = await sendVolunteerReminders();
    return res.json({ success: true, ...summary });
  } catch (error) { return next(error); }
});

export default router;
