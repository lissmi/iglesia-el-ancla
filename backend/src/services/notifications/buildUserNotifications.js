
// =========================================================
// BANDEJA UNIFICADA — DATOS REALES DE IGLESIA EL ANCLA
// No creamos documentos de notificaciones por cada aviso.
// La autorización de categorías se determina con el rol del servidor.
// =========================================================
import BasicSupply from "../../models/BasicSupply.js";
import VolunteerAssignment from "../../models/VolunteerAssignment.js";
import Activity from "../../models/Activity.js";
import Event from "../../models/Event.js";
import ActivityConfirmation from "../../models/ActivityConfirmation.js";
import PrayerRequest from "../../models/PrayerRequest.js";
import Expense from "../../models/Expense.js";

// Convertimos una fecha al día civil vigente en Chile continental.
function todayChile() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
}

// Sumamos días mediante UTC al mediodía, sin ambigüedad por horario de verano.
function plusDays(dateOnly, days) {
  const date = new Date(`${dateOnly}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

// Permitimos únicamente rutas internas fijadas por el propio servidor.
function entry({ id, category, title, message, path, dateLabel, source, expenseId }) {
  return { id, category, title, message, path, dateLabel: dateLabel || "", source, expenseId };
}

// Los gastos son privados: jamás consultarlos para un miembro normal.
function isAdministrator(user) {
  return user?.role === "admin" || user?.role === "super_admin";
}

// Derivamos avisos desde colecciones existentes, sin guardar copias de ellas.
export async function buildUserNotifications(user) {
  const today = todayChile();
  const inTwoDays = plusDays(today, 2);
  const inSevenDays = plusDays(today, 7);
  const inThirtyDays = plusDays(today, 30);
  const userId = String(user._id);
  const adminBase = user.role === "super_admin" ? "/super-admin" : "/admin";

  // Ejecutamos en paralelo solo consultas autorizadas por el rol actual.
  const [supplies, shifts, activities, recurringEvents, prayers, privatePrayers, expenses] = await Promise.all([
    BasicSupply.find({ $expr: { $lte: ["$stock", "$minimumStock"] } })
      .select("name stock minimumStock updatedAt").sort({ name: 1 }).limit(60).lean(),
    VolunteerAssignment.find({
      date: { $gte: today, $lte: inSevenDays },
      $or: [{ volunteerId: user._id }, { "participants.userId": user._id }],
    }).select("title date startTime status volunteerId participants updatedAt").limit(60).lean(),
    Activity.find({ publicationStatus: "published", date: { $gte: today, $lte: inThirtyDays } })
      .select("title date time requiresConfirmation updatedAt").sort({ date: 1 }).limit(80).lean(),
    // Solo eventos habituales publicados; nunca inventamos fechas mensuales imprecisas.
    Event.find({ publicationStatus: "published", date: { $lte: inTwoDays } })
      .select("title date time recurrence").limit(60).lean(),
    PrayerRequest.find({
      visibility: "community",
      // No avisamos al autor sobre su propia petición recién creada.
      createdBy: { $ne: user._id },
      status: { $in: ["pending", "praying"] },
      createdAt: { $gte: new Date(Date.now() - 7 * 86400000) },
    }).select("createdAt").sort({ createdAt: -1 }).limit(12).lean(),
    // Solo administración conoce la existencia de solicitudes privadas ajenas.
    // No se expone contenido ni autor en esta bandeja, incluso a los administradores.
    isAdministrator(user)
      ? PrayerRequest.find({
          visibility: "private", createdBy: { $ne: user._id },
          status: { $in: ["pending", "praying"] },
          createdAt: { $gte: new Date(Date.now() - 7 * 86400000) },
        }).select("createdAt").sort({ createdAt: -1 }).limit(12).lean()
      : Promise.resolve([]),
    isAdministrator(user)
      ? Expense.find({ deletedAt: null, status: "Pendiente", dueDate: { $lt: today, $regex: /^\d{4}-\d{2}-\d{2}$/ } })
          .select("description amount dueDate").sort({ dueDate: 1 }).limit(60).lean()
      : Promise.resolve([]),
  ]);

  // Solo buscamos confirmaciones de las actividades con inscripción habilitada.
  const confirming = activities.filter((a) => a.requiresConfirmation);
  const confirmations = confirming.length
    ? await ActivityConfirmation.find({ member: user._id, activity: { $in: confirming.map((a) => a._id) } })
      .select("activity").lean()
    : [];
  const confirmedIds = new Set(confirmations.map((c) => String(c.activity)));

  // Construimos los avisos comunitarios en una lista limitada.
  const items = [];

  for (const s of supplies) {
    items.push(entry({
      id: `supply:${s._id}:${s.stock}:${s.minimumStock}`,
      category: "supplies", source: "supply",
      title: s.stock <= 0 ? `${s.name}: agotado` : `${s.name}: pocas unidades`,
      message: `Existencias: ${s.stock}. Mínimo: ${s.minimumStock}. Puedes colaborar si lo deseas.`,
      path: "/member/insumos-basicos",
    }));
  }

  for (const shift of shifts) {
    // Encontramos el estado individual, nunca el de otro participante.
    const participant = (shift.participants || []).find((p) => String(p.userId) === userId);
    const legacy = !Array.isArray(shift.participants) && String(shift.volunteerId) === userId;
    const status = shift.status === "cancelled" ? "cancelled" :
      (participant?.status || (legacy ? shift.status : null));
    if (!status || status === "declined") continue;
    if (!["pending", "confirmed", "cancelled"].includes(status)) continue;
    items.push(entry({
      id: `volunteer:${shift._id}:${shift.date}:${shift.startTime}:${status}`,
      category: "volunteers", source: "volunteer",
      title: status === "pending" ? "Turno por confirmar" :
        status === "cancelled" ? "Turno de servicio cancelado" : "Se acerca tu turno de servicio",
      message: `${shift.title} · ${shift.date} · ${shift.startTime} hrs`,
      path: "/member/voluntariado", dateLabel: shift.date,
    }));
  }

  for (const a of activities) {
    // Antes del evento notificamos a quienes necesitan confirmar asistencia.
    const needsAnswer = a.requiresConfirmation && !confirmedIds.has(String(a._id));
    const nearEvent = a.date <= inTwoDays;
    if (!needsAnswer && !nearEvent) continue;
    items.push(entry({
      id: `activity:${a._id}:${a.date}:${a.time}:${needsAnswer ? "confirm" : "reminder"}`,
      category: "events", source: "activity",
      title: needsAnswer ? "Confirma tu asistencia" : "Actividad próxima",
      message: `${a.title} · ${a.date} · ${a.time} hrs`,
      path: "/member/actividades", dateLabel: a.date,
    }));
  }

  // Avisamos de reuniones habituales cuando existe una fecha exacta verificable.
  const nextDates = [today, plusDays(today, 1), inTwoDays];
  for (const event of recurringEvents) {
    for (const day of nextDates) {
      if (day < event.date || (event.recurrence?.endDate && day > event.recurrence.endDate)) continue;
      const utcDate = new Date(`${day}T12:00:00.000Z`);
      const weekday = utcDate.getUTCDay();
      const days = event.recurrence?.daysOfWeek || [];
      if (!days.includes(weekday)) continue;
      if (event.recurrence?.type === "monthly") {
        // Reuniones sin semanas concretas siguen en la web, sin recordatorio inventado.
        const weeks = event.recurrence?.weeksOfMonth || [];
        if (!weeks.length) continue;
        const weekOfMonth = Math.floor((utcDate.getUTCDate() - 1) / 7) + 1;
        const future = new Date(utcDate.getTime() + 7 * 86400000);
        const isLastWeek = future.getUTCMonth() !== utcDate.getUTCMonth();
        if (!weeks.includes(weekOfMonth) && !(weeks.includes(-1) && isLastWeek)) continue;
      } else if (event.recurrence?.type !== "weekly") {
        continue;
      }
      items.push(entry({
        id: `event:${event._id}:${day}:${event.time}`,
        category: "events", source: "event",
        title: "Próxima reunión de la iglesia",
        message: `${event.title} · ${day} · ${event.time} hrs`,
        path: "/eventos", dateLabel: day,
      }));
    }
  }

  for (const prayer of prayers) {
    // Omitimos título y descripción: las peticiones pueden ser sensibles.
    items.push(entry({
      id: `prayer:${prayer._id}`,
      category: "prayer", source: "prayer",
      title: "Petición de oración en la comunidad",
      message: "Hay una petición reciente que puedes acompañar en oración.",
      path: "/member/peticiones-oracion",
    }));
  }

  for (const prayer of privatePrayers) {
    // La identidad del autor y el contenido privado no aparecen en la campana.
    items.push(entry({
      id: `prayer:${prayer._id}`, category: "prayer", source: "prayer",
      title: "Solicitud privada para el equipo de oración",
      message: "Hay una petición privada reciente pendiente de seguimiento.",
      path: `${adminBase}/peticiones-oracion`,
    }));
  }

  for (const e of expenses) {
    items.push(entry({
      id: `expense-overdue:${e._id}:${e.dueDate}`,
      category: "finance", source: "expense", expenseId: String(e._id),
      title: "Pago vencido",
      message: `${e.description || "Gasto sin descripción"} · ${new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(e.amount)} · Vencimiento: ${e.dueDate}.`,
      path: `${adminBase}/finanzas/gastos?gasto=${encodeURIComponent(String(e._id))}`,
      dateLabel: e.dueDate,
    }));
  }

  // Controlamos el tamaño máximo de la respuesta privada.
  return items.slice(0, 160);
}
