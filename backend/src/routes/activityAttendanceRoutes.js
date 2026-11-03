// =========================================================
// CONFIRMACIONES DE ACTIVIDADES PUNTUALES - IGLESIA EL ANCLA
// Este router se monta dentro de activitiesRoutes.js.
// =========================================================

// Router de Express para endpoints de participación.
import { Router } from "express";

// Mongoose permite validar IDs y serializar cupos mediante transacciones.
import mongoose from "mongoose";

// Modelo exclusivo de actividades (NO eventos públicos).
import Activity, { ACTIVITY_TIME_ZONE } from "../models/Activity.js";

// Una confirmación por miembro y actividad.
import ActivityConfirmation from "../models/ActivityConfirmation.js";

// Reutilizamos autorización y defensa contra CSRF existentes.
import authorizeRoles from "../middleware/authorizeRoles.js";
import validateRequestOrigin from "../middleware/validateRequestOrigin.js";

// Construimos el router que comparte la autenticación de activitiesRoutes.
const router = Router();

// Roles autorizados a confirmar una actividad.
const participantRoles = ["member", "admin", "super_admin"];

// Roles autorizados a consultar el listado nominal.
const adminRoles = ["admin", "super_admin"];

// Genera errores HTTP compatibles con app.js.
function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

// Extrae la fecha y hora actuales según Chile continental.
function nowInChile() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: ACTIVITY_TIME_ZONE,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date());
  const value = (key) => parts.find((part) => part.type === key)?.value;
  return {
    date: `${value("year")}-${value("month")}-${value("day")}`,
    time: `${value("hour")}:${value("minute")}`,
  };
}

// Solo admitimos confirmaciones antes del inicio de la actividad puntual.
function ensureActivityIsUpcoming(activity) {
  const now = nowInChile();
  if (activity.date < now.date ||
      (activity.date === now.date && activity.time <= now.time)) {
    throw httpError(409, "Esta actividad ya comenzó y no admite cambios de confirmación");
  }
}

// Valida que React confirme exactamente la fecha de esta actividad.
function ensureRequestedDate(activity, requestedDate) {
  if (requestedDate !== activity.date) {
    throw httpError(400, "La fecha indicada no corresponde a esta actividad");
  }
}

// Convierte errores de MongoDB en respuestas controladas.
function forwardError(error, next) {
  if (error?.code === 11000) error.status = 409;
  if (["CastError", "ValidationError"].includes(error?.name)) error.status = 400;
  return next(error);
}

// =========================================================
// GET /api/activities/attendance/state
// Devuelve solo confirmaciones propias y cantidades agregadas.
// =========================================================
router.get("/attendance/state", authorizeRoles(...participantRoles), async (req, res, next) => {
  try {
    // Solo son elegibles las actividades efectivamente publicadas.
    const now = nowInChile();
    const published = await Activity.find({
      publicationStatus: "published",
      date: { $gte: now.date },
    }).select("_id date time").lean();

    // Excluimos actividades que ya comenzaron hoy.
    const upcoming = published.filter((item) =>
      item.date > now.date || item.time > now.time
    );
    const allowedIds = upcoming.map((item) => item._id);
    const dates = new Map(upcoming.map((item) => [String(item._id), item.date]));

    // Recuperamos solamente las confirmaciones del usuario autenticado.
    const mineRows = await ActivityConfirmation.find({
      member: req.user._id,
      activity: { $in: allowedIds },
    }).select("activity -_id").lean();

    // Contamos las confirmaciones de cada actividad sin exponer nombres.
    const countRows = await ActivityConfirmation.aggregate([
      { $match: { activity: { $in: allowedIds } } },
      { $group: { _id: "$activity", confirmed: { $sum: 1 } } },
    ]);

    // Conservamos las claves del frontend para una migración controlada.
    const mine = mineRows.map((item) => ({
      activityId: String(item.activity),
      occurrenceDate: dates.get(String(item.activity)),
    }));
    const counts = countRows.map((item) => ({
      activityId: String(item._id),
      occurrenceDate: dates.get(String(item._id)),
      confirmed: item.confirmed,
    }));

    // Evitamos cachés compartidas de información privada.
    res.set("Cache-Control", "private, no-store");
    return res.json({ success: true, mine, counts });
  } catch (error) {
    return forwardError(error, next);
  }
});

// =========================================================
// GET /api/activities/attendance/admin-summary
// Resumen de confirmaciones por actividad, solo administradores.
// =========================================================
router.get("/attendance/admin-summary", authorizeRoles(...adminRoles), async (req, res, next) => {
  try {
    const rows = await ActivityConfirmation.aggregate([
      { $group: { _id: "$activity", confirmed: { $sum: 1 } } },
    ]);
    res.set("Cache-Control", "private, no-store");
    return res.json({
      success: true,
      counts: rows.map((row) => ({ activityId: String(row._id), confirmed: row.confirmed })),
    });
  } catch (error) {
    return forwardError(error, next);
  }
});

// =========================================================
// POST /api/activities/:id/attendance
// Confirma una sola vez la actividad indicada.
// =========================================================
router.post("/:id/attendance", authorizeRoles(...participantRoles), validateRequestOrigin, async (req, res, next) => {
  try {
    if (!mongoose.isObjectIdOrHexString(req.params.id)) {
      throw httpError(400, "Identificador de actividad inválido");
    }

    // La sesión determina la identidad del participante.
    await mongoose.connection.transaction(async (session) => {
      const activity = await Activity.findById(req.params.id).session(session);
      if (!activity || activity.publicationStatus !== "published") {
        throw httpError(404, "Actividad no disponible");
      }
      if (!activity.requiresConfirmation) {
        throw httpError(409, "Esta actividad no requiere confirmación");
      }
      ensureRequestedDate(activity, req.body?.occurrenceDate);
      ensureActivityIsUpcoming(activity);

      // Una confirmación existente no debe consumir un cupo adicional.
      const existing = await ActivityConfirmation.exists({
        activity: activity._id, member: req.user._id,
      }).session(session);
      if (existing) return;

      // Una escritura sobre Activity serializa confirmaciones simultáneas.
      // timestamps:false evita presentar cada reserva como una edición del admin.
      const locked = await Activity.updateOne(
        { _id: activity._id, publicationStatus: "published" },
        { $inc: { __v: 1 } },
        { session, timestamps: false }
      );
      if (locked.matchedCount !== 1) {
        throw httpError(409, "La actividad cambió durante la confirmación");
      }

      // Control de cupos obligatorio cuando se definió capacity.
      const confirmed = await ActivityConfirmation.countDocuments({
        activity: activity._id,
      }).session(session);
      if (activity.capacity && confirmed >= activity.capacity) {
        throw httpError(409, "No quedan cupos para esta actividad");
      }

      // Guardamos un documento mínimo sin fecha duplicada.
      await ActivityConfirmation.create([{
        activity: activity._id,
        member: req.user._id,
      }], { session });
    });

    res.set("Cache-Control", "private, no-store");
    return res.json({ success: true, message: "Tu asistencia quedó confirmada" });
  } catch (error) {
    return forwardError(error, next);
  }
});

// =========================================================
// DELETE /api/activities/:id/attendance
// Cancela una confirmación aún vigente.
// =========================================================
router.delete("/:id/attendance", authorizeRoles(...participantRoles), validateRequestOrigin, async (req, res, next) => {
  try {
    if (!mongoose.isObjectIdOrHexString(req.params.id)) {
      throw httpError(400, "Identificador de actividad inválido");
    }

    // Eliminamos la confirmación dentro de una transacción.
    await mongoose.connection.transaction(async (session) => {
      const activity = await Activity.findById(req.params.id).session(session);
      if (!activity) throw httpError(404, "Actividad no encontrada");
      ensureRequestedDate(activity, req.query?.occurrenceDate);
      ensureActivityIsUpcoming(activity);

      // Coordinamos las cancelaciones con reservas simultáneas.
      await Activity.updateOne(
        { _id: activity._id }, { $inc: { __v: 1 } },
        { session, timestamps: false }
      );
      await ActivityConfirmation.deleteOne({
        activity: activity._id, member: req.user._id,
      }).session(session);
    });

    res.set("Cache-Control", "private, no-store");
    return res.json({ success: true, message: "Tu confirmación fue cancelada" });
  } catch (error) {
    return forwardError(error, next);
  }
});

// =========================================================
// GET /api/activities/:id/attendance/confirmations
// Lista nominal privada para administración.
// =========================================================
router.get("/:id/attendance/confirmations", authorizeRoles(...adminRoles), async (req, res, next) => {
  try {
    if (!mongoose.isObjectIdOrHexString(req.params.id)) {
      throw httpError(400, "Identificador de actividad inválido");
    }

    // La fecha se obtiene de la actividad, no se repite en cada confirmación.
    const activity = await Activity.findById(req.params.id).select("title date capacity").lean();
    if (!activity) throw httpError(404, "Actividad no encontrada");

    // Conservamos el límite operativo de 200 filas del módulo existente.
    const total = await ActivityConfirmation.countDocuments({ activity: activity._id });
    const rows = await ActivityConfirmation.find({ activity: activity._id })
      .select("member confirmedAt")
      .sort({ confirmedAt: 1 })
      .limit(200)
      .populate("member", "firstName lastName email")
      .lean();

    const confirmations = rows.map((row) => ({
      id: String(row._id),
      occurrenceDate: activity.date,
      memberName: [row.member?.firstName, row.member?.lastName].filter(Boolean).join(" ") || "Cuenta no disponible",
      memberEmail: row.member?.email || "",
      status: "confirmed",
    }));

    res.set("Cache-Control", "private, no-store");
    return res.json({ success: true, confirmations, total });
  } catch (error) {
    return forwardError(error, next);
  }
});

// Exportamos las rutas para integrarlas con activitiesRoutes.js.
export default router;
