// =========================================================
// CORREOS PROGRAMADOS DE VOLUNTARIADO - IGLESIA EL ANCLA
// Reutiliza VolunteerAssignment, User, Volunteer y Gmail API.
// =========================================================
import User from "../../models/User.js";
import Volunteer from "../../models/Volunteer.js";
import VolunteerAssignment from "../../models/VolunteerAssignment.js";
import { sendInstitutionalEmail } from "./gmailService.js";

const MAX_EMAILS_PER_EXECUTION = 40;
const CLAIM_TTL_MS = 30 * 60 * 1000;
const TIME_ZONE = "America/Santiago";

const TEAM_NAMES = {
  worship: "Alabanza y música", bible_studies: "Estudios bíblicos online",
  children: "Enseñanza infantil", youth: "Enseñanza juvenil",
  communications: "Comunicaciones", cleaning: "Aseo y mantenimiento",
  events: "Eventos y actividades",
};

// El reloj del servidor puede estar en UTC; calculamos la fecha chilena.
function chileClock() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (type) => parts.find((part) => part.type === type)?.value;
  return {
    today: `${get("year")}-${get("month")}-${get("day")}`,
    time: `${get("hour")}:${get("minute")}`,
  };
}

// Sumamos días civiles sin depender de UTC-3/UTC-4.
function addDays(dateOnly, days) {
  const date = new Date(`${dateOnly}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

function formatChileDate(dateOnly) {
  const [year, month, day] = dateOnly.split("-").map(Number);
  return new Intl.DateTimeFormat("es-CL", {
    timeZone: "UTC", weekday: "long", day: "numeric", month: "long", year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, day, 12)));
}

// El identificador cambia si se reprograma el turno.
function scheduleKey(service) {
  return `${service.date}|${service.startTime}|${service.endTime}`;
}

// Reclamo atómico: dos ejecuciones simultáneas no reclaman el mismo recordatorio.
async function claimEmail(service, participant, key) {
  const now = new Date();
  const expired = new Date(now.getTime() - CLAIM_TTL_MS);
  const updated = await VolunteerAssignment.findOneAndUpdate({
    _id: service._id,
    date: service.date,
    status: { $ne: "cancelled" },
    participants: {
      $elemMatch: {
        userId: participant.userId,
        status: { $in: ["pending", "confirmed"] },
        $or: [
          { "reminderEmail.scheduleKey": { $ne: key } },
          {
            "reminderEmail.scheduleKey": key,
            "reminderEmail.sentAt": null,
            $or: [
              { "reminderEmail.claimedAt": null },
              { "reminderEmail.claimedAt": { $lt: expired } },
            ],
          },
        ],
      },
    },
  }, {
    $set: {
      "participants.$.reminderEmail.scheduleKey": key,
      "participants.$.reminderEmail.claimedAt": now,
      "participants.$.reminderEmail.sentAt": null,
    },
  }, { new: false });
  return updated ? now : null;
}

// Comparamos el claim exacto para no sobrescribir otro procesamiento.
function claimFilter(service, participant, key, claimedAt) {
  return {
    _id: service._id,
    participants: { $elemMatch: {
      userId: participant.userId,
      "reminderEmail.scheduleKey": key,
      "reminderEmail.claimedAt": claimedAt,
    } },
  };
}

function buildEmail(service, user, participant) {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || "hermano/a";
  const team = TEAM_NAMES[service.teamId] || "Voluntariado";
  const date = formatChileDate(service.date);
  const isPending = participant.status === "pending";
  const instruction = isPending
    ? "Tu participación está pendiente de confirmación. Entra a Mi espacio para indicar si podrás asistir."
    : "Tu participación ya está confirmada. Te recordamos este compromiso para que puedas prepararte.";
  const detail = [
    `Hola ${name}:`, "",
    `Te recordamos tu servicio en Iglesia El Ancla: ${service.title}`,
    `Equipo: ${team}`,
    `Fecha: ${date}`,
    `Horario: ${service.startTime} a ${service.endTime} hrs (Chile)`,
    ...(service.location ? [`Lugar: ${service.location}`] : []),
    ...(service.notes ? [`Indicaciones: ${service.notes}`] : []),
    "", instruction, "", "Revisa tus turnos en Mi espacio de El Ancla.",
  ];
  const link = new URL("/member/voluntariado", process.env.FRONTEND_URL).toString();
  const text = [...detail, link].join("\n");
  const html = `
    <div style="max-width:600px;margin:auto;font:16px/1.6 Arial,sans-serif;color:#203647">
      <div style="padding:20px;border-top:6px solid #b7a28b;border-radius:12px;background:#f7f6f4">
        <h2 style="color:#1b3445">Recordatorio de servicio · El Ancla ⚓</h2>
        <p>Hola, ${escapeHtml(name)}:</p>
        <p>Te recordamos tu próximo compromiso en nuestra comunidad.</p>
        <h3>${escapeHtml(service.title)}</h3>
        <p><b>Equipo:</b> ${escapeHtml(team)}<br>
        <b>Fecha:</b> ${escapeHtml(date)}<br>
        <b>Horario:</b> ${escapeHtml(service.startTime)}–${escapeHtml(service.endTime)} hrs (Chile)</p>
        ${service.location ? `<p><b>Lugar:</b> ${escapeHtml(service.location)}</p>` : ""}
        ${service.notes ? `<p><b>Indicaciones:</b> ${escapeHtml(service.notes)}</p>` : ""}
        <p>${escapeHtml(instruction)}</p>
        <a style="display:inline-block;padding:12px 16px;color:#fff;background:#1b3445;border-radius:8px;text-decoration:none"
           href="${escapeHtml(link)}">Revisar mis turnos</a>
      </div>
    </div>`;
  return { to: user.email, subject: `Recordatorio de servicio · ${service.title}`, text, html };
}

// Este método solo es invocado desde una ruta protegida mediante CRON_SECRET.
export async function sendVolunteerReminders() {
  const { today, time } = chileClock();
  const tomorrow = addDays(today, 1);

  // El día anterior es la regla principal; el mismo día permite recuperar fallos.
  const services = await VolunteerAssignment.find({
    date: { $in: [today, tomorrow] },
    status: { $ne: "cancelled" },
    "participants.status": { $in: ["pending", "confirmed"] },
  }).sort({ date: 1, startTime: 1 }).limit(100).lean();

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const service of services) {
    // No mandamos un aviso cuando el servicio ya comenzó.
    if (service.date === today && service.startTime <= time) continue;
    const participants = service.participants?.filter((person) =>
      ["pending", "confirmed"].includes(person.status)) || [];
    if (!participants.length) continue;

    // Solo reciben correos miembros activos, con correo confirmado, y voluntariado vigente.
    const ids = participants.map((person) => person.userId);
    const [users, profiles] = await Promise.all([
      User.find({ _id: { $in: ids }, role: "member", isActive: true, emailVerifiedAt: { $ne: null } })
        .select("_id firstName lastName email").lean(),
      Volunteer.find({ userId: { $in: ids }, status: "active", teams: service.teamId })
        .select("userId").lean(),
    ]);
    const userMap = new Map(users.map((user) => [String(user._id), user]));
    const activeIds = new Set(profiles.map((profile) => String(profile.userId)));

    for (const participant of participants) {
      if (sent + failed >= MAX_EMAILS_PER_EXECUTION) {
        return { sent, failed, skipped, limited: true };
      }
      const id = String(participant.userId);
      const user = userMap.get(id);
      if (!user?.email || !activeIds.has(id)) { skipped++; continue; }

      const key = scheduleKey(service);
      const claimedAt = await claimEmail(service, participant, key);
      if (!claimedAt) { skipped++; continue; }

      try {
        // Gmail API envía desde la cuenta institucional; no usamos credenciales del miembro.
        await sendInstitutionalEmail(buildEmail(service, user, participant));
        const result = await VolunteerAssignment.updateOne(
          claimFilter(service, participant, key, claimedAt),
          { $set: { "participants.$.reminderEmail.sentAt": new Date() } },
        );
        if (result.modifiedCount !== 1) {
          // El correo salió pero se editó el turno mientras se enviaba.
          // Es una incidencia que requiere revisión del administrador.
          throw new Error("El correo se envió, pero cambió su asignación durante el registro");
        }
        sent++;
      } catch (error) {
        failed++;
        // Dejamos disponible el turno para reintento controlado.
        await VolunteerAssignment.updateOne(
          claimFilter(service, participant, key, claimedAt),
          { $set: { "participants.$.reminderEmail.claimedAt": null } },
        );
        // No mostramos direcciones ni detalles sensibles en los logs.
        console.error("No se pudo completar un recordatorio de voluntariado:", error.message);
      }
    }
  }
  return { sent, failed, skipped, limited: false };
}
