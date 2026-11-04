// =========================================================
// CONFIRMACIONES DE ACTIVIDADES PUNTUALES - IGLESIA EL ANCLA
// Este router se monta dentro de activitiesRoutes.js.
// =========================================================

// Router de Express para endpoints de participación.
import { Router } from "express";

// Mongoose permite validar IDs y serializar cupos mediante transacciones.
import mongoose from "mongoose";
// Generadores de reportes instalados en backend con: npm install pdfkit exceljs
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";

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
// GET /api/activities/:id/attendance/contributions
// Disponibilidad agregada y selección propia, sin nombres ajenos.
// =========================================================
router.get("/:id/attendance/contributions", authorizeRoles(...participantRoles), async (req, res, next) => {
  try {
    if (!mongoose.isObjectIdOrHexString(req.params.id)) {
      throw httpError(400, "Identificador inválido");
    }
    const activity = await Activity.findById(req.params.id)
      .select("publicationStatus cooperation date time").lean();
    if (!activity || activity.publicationStatus !== "published") {
      throw httpError(404, "Actividad no disponible");
    }
    const mine = await ActivityConfirmation.findOne({
      activity: activity._id, member: req.user._id,
    }).select("contributions").lean();
    const totals = await ActivityConfirmation.aggregate([
      { $match: { activity: activity._id } },
      { $unwind: "$contributions" },
      { $group: { _id: "$contributions.itemId", reserved: { $sum: "$contributions.quantity" } } },
    ]);
    const countById = new Map(totals.map((row) => [String(row._id), row.reserved]));
    res.set("Cache-Control", "private, no-store");
    return res.json({
      success: true,
      enabled: Boolean(activity.cooperation?.enabled),
      confirmed: Boolean(mine),
      items: (activity.cooperation?.items || []).map((item) => ({
        id: String(item._id), name: item.name, maxQuantity: item.maxQuantity,
        reserved: countById.get(String(item._id)) || 0,
      })),
      mine: (mine?.contributions || []).map((entry) => ({
        itemId: String(entry.itemId), quantity: entry.quantity,
      })),
    });
  } catch (error) { return forwardError(error, next); }
});

// =========================================================
// PATCH /api/activities/:id/attendance/contributions
// Reserva hasta 5 tipos de aporte para miembros CONFIRMADOS.
// El bloqueo de la actividad serializa cambios simultáneos en los cupos.
// =========================================================
router.patch("/:id/attendance/contributions", authorizeRoles(...participantRoles),
  validateRequestOrigin, async (req, res, next) => {
    try {
      if (!mongoose.isObjectIdOrHexString(req.params.id)) {
        throw httpError(400, "Identificador inválido");
      }
      const submitted = req.body?.contributions;
      if (!Array.isArray(submitted) || submitted.length > 5) {
        throw httpError(400, "Selecciona hasta cinco tipos de aporte");
      }
      const ids = new Set();
      for (const entry of submitted) {
        if (!entry || !mongoose.isObjectIdOrHexString(entry.itemId) ||
            !Number.isInteger(entry.quantity) || entry.quantity < 1 || entry.quantity > 20 ||
            ids.has(entry.itemId)) {
          throw httpError(400, "La selección de aportes no es válida");
        }
        ids.add(entry.itemId);
      }
      await mongoose.connection.transaction(async (session) => {
        const activity = await Activity.findById(req.params.id).session(session);
        if (!activity || activity.publicationStatus !== "published" || !activity.cooperation?.enabled) {
          throw httpError(404, "La cooperación no está disponible");
        }
        ensureActivityIsUpcoming(activity);
        const confirmation = await ActivityConfirmation.findOne({
          activity: activity._id, member: req.user._id,
        }).session(session);
        if (!confirmation) throw httpError(409, "Confirma tu asistencia antes de reservar aportes");
        const options = new Map((activity.cooperation.items || []).map((item) => [String(item._id), item]));
        for (const entry of submitted) {
          if (!options.has(entry.itemId)) throw httpError(409, "Un aporte dejó de estar disponible");
        }
        // La escritura obliga a que dos miembros no ocupen el último cupo a la vez.
        const locked = await Activity.updateOne(
          { _id: activity._id, publicationStatus: "published" },
          { $inc: { __v: 1 } },
          { session, timestamps: false }
        );
        if (locked.matchedCount !== 1) throw httpError(409, "La actividad cambió");
        // Contamos reservas de los OTROS miembros; las propias serán reemplazadas.
        const rows = await ActivityConfirmation.aggregate([
          { $match: { activity: activity._id, member: { $ne: new mongoose.Types.ObjectId(String(req.user._id)) } } },
          { $unwind: "$contributions" },
          { $group: { _id: "$contributions.itemId", reserved: { $sum: "$contributions.quantity" } } },
        ]).session(session);
        const reserved = new Map(rows.map((row) => [String(row._id), row.reserved]));
        for (const entry of submitted) {
          const option = options.get(entry.itemId);
          if ((reserved.get(entry.itemId) || 0) + entry.quantity > option.maxQuantity) {
            throw httpError(409, `No quedan suficientes cupos para ${option.name}. Actualiza la disponibilidad.`);
          }
        }
        confirmation.contributions = submitted.map((entry) => ({
          itemId: new mongoose.Types.ObjectId(entry.itemId), quantity: entry.quantity,
        }));
        await confirmation.save({ session });
      });
      res.set("Cache-Control", "private, no-store");
      return res.json({ success: true, message: "Tu cooperación quedó registrada" });
    } catch (error) { return forwardError(error, next); }
  }
);

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
    const activity = await Activity.findById(req.params.id).select("title date capacity cooperation").lean();
    if (!activity) throw httpError(404, "Actividad no encontrada");

    // Conservamos el límite operativo de 200 filas del módulo existente.
    const total = await ActivityConfirmation.countDocuments({ activity: activity._id });
    const rows = await ActivityConfirmation.find({ activity: activity._id })
      .select("member confirmedAt contributions")
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
      contributions: (row.contributions || []).map((entry) => ({
        itemId: String(entry.itemId), quantity: entry.quantity,
        name: (activity.cooperation?.items || []).find((item) =>
          String(item._id) === String(entry.itemId))?.name || "Aporte retirado",
      })),
    }));

    res.set("Cache-Control", "private, no-store");
    // La suma debe incluir TODAS las confirmaciones, no solo las primeras 200.
    const summaryRows = await ActivityConfirmation.aggregate([
      { $match: { activity: activity._id } },
      { $unwind: "$contributions" },
      { $group: { _id: "$contributions.itemId", reserved: { $sum: "$contributions.quantity" } } },
    ]);
    const byId = new Map(summaryRows.map((row) => [String(row._id), row.reserved]));
    const cooperationSummary = (activity.cooperation?.items || []).map((item) => ({
      id: String(item._id), name: item.name, maxQuantity: item.maxQuantity,
      reserved: byId.get(String(item._id)) || 0,
    }));
    return res.json({ success: true, confirmations, total, cooperationSummary });
  } catch (error) {
    return forwardError(error, next);
  }
});

// =========================================================
// GET /api/activities/:id/attendance/report?format=pdf|xlsx
// Exporta participantes y sus aportes exclusivamente para administradores.
// =========================================================
router.get("/:id/attendance/report", authorizeRoles(...adminRoles), async (req, res, next) => {
  try {
    if (!mongoose.isObjectIdOrHexString(req.params.id)) throw httpError(400, "ID inválido");
    const format = req.query.format;
    if (!["pdf", "xlsx"].includes(format)) throw httpError(400, "Formato no permitido");
    const activity = await Activity.findById(req.params.id).select("title date time location cooperation").lean();
    if (!activity) throw httpError(404, "Actividad no encontrada");
    const count = await ActivityConfirmation.countDocuments({ activity: activity._id });
    if (count > 2000) throw httpError(413, "El reporte supera 2000 participantes; solicita exportación por lotes");
    const confirmations = await ActivityConfirmation.find({ activity: activity._id })
      .select("member confirmedAt contributions")
      .sort({ confirmedAt: 1 })
      .populate("member", "firstName lastName email")
      .lean();
    const labels = new Map((activity.cooperation?.items || []).map((item) => [String(item._id), item.name]));
    const details = confirmations.map((row) => ({
      name: [row.member?.firstName, row.member?.lastName].filter(Boolean).join(" ") || "Cuenta no disponible",
      email: row.member?.email || "",
      contributions: (row.contributions || []).map((entry) => ({
        name: labels.get(String(entry.itemId)) || "Aporte retirado",
        quantity: entry.quantity,
      })),
    }));
    const totalByItem = new Map();
    for (const row of details) for (const item of row.contributions) {
      totalByItem.set(item.name, (totalByItem.get(item.name) || 0) + item.quantity);
    }
    const filename = `actividad_${activity.date}_${String(activity._id).slice(-6)}`;
    res.set("Cache-Control", "private, no-store");
    res.set("X-Content-Type-Options", "nosniff");
    if (format === "xlsx") {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = "Iglesia El Ancla";
      const summary = workbook.addWorksheet("Resumen");
      summary.columns = [{ width: 28 }, { width: 32 }, { width: 18 }];
      summary.addRow(["REPORTE DE ACTIVIDAD", activity.title]);
      summary.addRow(["Fecha", activity.date]);
      summary.addRow(["Hora", activity.time]);
      summary.addRow(["Lugar", activity.location || "No aplica"]);
      summary.addRow(["Confirmaciones", details.length]);
      summary.addRow([]);
      const hdr = summary.addRow(["Cooperación", "Comprometido", "Máximo"]);
      hdr.font = { bold: true, color: { argb: "FFFFFFFF" } };
      hdr.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF243E54" } };
      for (const item of (activity.cooperation?.items || [])) {
        summary.addRow([item.name, totalByItem.get(item.name) || 0, item.maxQuantity]);
      }
      const people = workbook.addWorksheet("Participantes");
      people.columns = [
        { header: "Miembro", key: "name", width: 34 },
        { header: "Correo", key: "email", width: 37 },
        { header: "Aportes comprometidos", key: "contributions", width: 67 },
      ];
      people.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      people.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF243E54" } };
      // Neutralizamos texto que Excel podría interpretar como fórmula.
      const safe = (value) => /^[=+\-@\t\r]/.test(String(value)) ? `'${value}` : value;
      for (const person of details) people.addRow({
        name: safe(person.name), email: safe(person.email),
        contributions: safe(person.contributions.map((c) => `${c.name} x${c.quantity}`).join("; ") || "Sin aporte"),
      });
      people.autoFilter = { from: "A1", to: `C${Math.max(1, details.length + 1)}` };
      res.type("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.set("Content-Disposition", `attachment; filename="${filename}.xlsx"`);
      await workbook.xlsx.write(res);
      return res.end();
    }
    res.type("application/pdf");
    res.set("Content-Disposition", `attachment; filename="${filename}.pdf"`);
    const pdf = new PDFDocument({ size: "A4", margin: 46, bufferPages: true });
    pdf.pipe(res);
    const navy = "#243E54";
    pdf.font("Helvetica-Bold").fontSize(19).fillColor(navy).text("Iglesia El Ancla - Actividad");
    pdf.moveDown(0.4).fontSize(15).text(activity.title);
    pdf.font("Helvetica").fontSize(10).fillColor("#526878")
      .text(`Fecha: ${activity.date} | Hora: ${activity.time} | Confirmados: ${details.length}`);
    if (activity.location) pdf.text(`Lugar: ${activity.location}`);
    pdf.moveDown().font("Helvetica-Bold").fontSize(13).fillColor(navy).text("Cooperaciones");
    pdf.moveDown(0.3).font("Helvetica").fontSize(10);
    if (!activity.cooperation?.enabled) pdf.text("Esta actividad no solicita cooperaciones.");
    else for (const item of activity.cooperation.items || []) {
      pdf.text(`${item.name}: ${totalByItem.get(item.name) || 0} de ${item.maxQuantity}`);
    }
    pdf.moveDown().font("Helvetica-Bold").fontSize(13).fillColor(navy).text("Participantes y aportes");
    pdf.moveDown(0.3);
    for (const [index, person] of details.entries()) {
      // Respetamos margen inferior antes de dibujar la siguiente persona.
      if (pdf.y > 705) pdf.addPage();
      pdf.font("Helvetica-Bold").fontSize(10).fillColor(navy).text(`${index + 1}. ${person.name}`);
      pdf.font("Helvetica").fontSize(9).fillColor("#526878")
        .text(person.email || "Sin correo")
        .text(person.contributions.map((c) => `${c.name}: ${c.quantity}`).join(" | ") || "Sin aporte reservado");
      pdf.moveDown(0.6);
    }
    pdf.end();
  } catch (error) {
    // Si una respuesta ya comenzó, Express no puede cambiar los encabezados.
    if (res.headersSent) return next(error);
    return forwardError(error, next);
  }
});

// Exportamos las rutas para integrarlas con activitiesRoutes.js.
export default router;
