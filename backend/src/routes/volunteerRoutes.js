// =========================================================
// VOLUNTARIADO: EQUIPOS, SERVICIOS Y CONFIRMACIÓN INDIVIDUAL
// Archivo: backend/src/routes/volunteerRoutes.js
// =========================================================
import { Router } from "express";
import mongoose from "mongoose";
import authenticateUser from "../middleware/authenticateUser.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import User from "../models/User.js";
import Volunteer, { VOLUNTEER_TEAM_IDS } from "../models/Volunteer.js";
import VolunteerAssignment from "../models/VolunteerAssignment.js";
import Activity from "../models/Activity.js";

const router = Router();
const ADMIN_ROLES = ["admin", "super_admin"];
const ID = (value) => String(value?._id ?? value ?? "");
const validObjectId = (value) => typeof value === "string" && mongoose.isObjectIdOrHexString(value);

function fail(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}
function sendError(error, next) {
  if (error?.name === "ValidationError") {
    return next(fail(400, Object.values(error.errors).map((item) => item.message).join(". ")));
  }
  if (error?.code === 11000) return next(fail(409, "El miembro ya pertenece al voluntariado"));
  return next(error);
}

// Protegemos escrituras basadas en cookies HttpOnly mediante Origin.
function trustedOrigin(req, res, next) {
  try {
    const allowed = new URL(process.env.FRONTEND_URL || "http://localhost:3000").origin;
    if (req.get("Origin") !== allowed) {
      return res.status(403).json({ success: false, message: "Origen no autorizado" });
    }
    if (!req.is("application/json") || !req.body ||
      typeof req.body !== "object" || Array.isArray(req.body)) {
      return res.status(400).json({ success: false, message: "Envía un objeto JSON válido" });
    }
    return next();
  } catch {
    return res.status(500).json({ success: false, message: "Origen web no configurado" });
  }
}
function trustedDeleteOrigin(req) {
  const allowed = new URL(process.env.FRONTEND_URL || "http://localhost:3000").origin;
  if (req.get("Origin") !== allowed) throw fail(403, "Origen no autorizado");
}
function todayChile() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
}
function userName(user) {
  return [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();
}
function accessibleBranchIds(actor) {
  return (actor.sucursales || []).filter((branch) => branch?.isActive).map(ID);
}
function scopeByBranch(actor) {
  return actor.role === "super_admin" ? {} : { branchId: { $in: accessibleBranchIds(actor) } };
}
function belongsToBranch(user, branchId) {
  return (user?.sucursales || []).some((value) => ID(value) === String(branchId));
}
function canManageBranch(actor, branchId) {
  return actor.role === "super_admin" || accessibleBranchIds(actor).includes(String(branchId));
}

// Lee datos antiguos (volunteerId/status) sin migración destructiva.
function participantsOf(service) {
  if (Array.isArray(service.participants)) {
    return service.participants.map((person) => ({
      userId: ID(person.userId), status: person.status, respondedAt: person.respondedAt ?? null,
      // Necesario para no reenviar un correo cuando solo se edita una nota.
      reminderEmail: person.reminderEmail ?? undefined,
    }));
  }
  return service.volunteerId ? [{
    userId: ID(service.volunteerId),
    status: service.status === "cancelled" ? "pending" : service.status,
    respondedAt: service.respondedAt ?? null,
  }] : [];
}
function effectiveServiceStatus(service, participants) {
  if (service.status === "cancelled") return "cancelled";
  if (participants.length === 0) return "unassigned";
  const states = [...new Set(participants.map((item) => item.status))];
  return states.length === 1 ? states[0] : "mixed";
}
function serializeVolunteer(profile) {
  const user = profile.userId;
  return {
    id: ID(user), profileId: ID(profile), name: userName(user),
    firstName: user?.firstName || "", lastName: user?.lastName || "",
    email: user?.email || "",
    status: profile.status === "active" && user?.isActive ? "active" : "inactive",
    teams: profile.teams || [], branchIds: (user?.sucursales || []).map(ID),
  };
}
function serializeAssignment(service) {
  const participants = participantsOf(service);
  return {
    id: ID(service), teamId: service.teamId, branchId: ID(service.branchId),
    title: service.title, description: service.description,
    date: service.date, startTime: service.startTime, endTime: service.endTime,
    location: service.location, activityId: service.activityId ? ID(service.activityId) : null,
    notes: service.notes,
    requiredVolunteers: service.requiredVolunteers || 1,
    volunteerIds: participants.map((item) => item.userId),
    participants: participants.map(({ userId, status, respondedAt }) => ({ volunteerId: userId, status, respondedAt })),
    // Para componentes históricos que consulten volunteerId/status.
    volunteerId: participants[0]?.userId || null,
    status: effectiveServiceStatus(service, participants),
    serviceStatus: service.status === "cancelled" ? "cancelled" : "pending",
    createdAt: service.createdAt, updatedAt: service.updatedAt,
  };
}
function serializeMemberAssignment(service, userId) {
  const participant = participantsOf(service).find((person) => person.userId === String(userId));
  return {
    id: ID(service), teamId: service.teamId, volunteerId: String(userId),
    branchId: ID(service.branchId), title: service.title,
    description: service.description, date: service.date,
    startTime: service.startTime, endTime: service.endTime,
    location: service.location, activityId: service.activityId ? ID(service.activityId) : null,
    notes: service.notes,
    status: service.status === "cancelled" ? "cancelled" : (participant?.status || "pending"),
    respondedAt: participant?.respondedAt ?? null,
    createdAt: service.createdAt, updatedAt: service.updatedAt,
  };
}
function checkExactObject(body, allowed, required = []) {
  const keys = Object.keys(body);
  if (keys.some((key) => !allowed.includes(key)) || required.some((key) => !Object.hasOwn(body, key))) {
    throw fail(400, "El formulario contiene campos no admitidos o incompletos");
  }
}
function checkTeamSet(teams) {
  if (!Array.isArray(teams) || teams.length < 1 || teams.length > VOLUNTEER_TEAM_IDS.length ||
    teams.some((team) => !VOLUNTEER_TEAM_IDS.includes(team)) || new Set(teams).size !== teams.length) {
    throw fail(400, "Selecciona al menos un equipo válido, sin repetirlo");
  }
}

// Otros turnos del mismo miembro: solo rechazamos horarios realmente solapados.
// Dos turnos 09:00–11:00 y 11:00–13:00 son compatibles.
async function checkVolunteerConflicts(userIds, date, startTime, endTime, excludeId = null) {
  if (!userIds.length) return;
  const candidates = await VolunteerAssignment.find({
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    date,
    status: { $ne: "cancelled" },
    startTime: { $lt: endTime }, endTime: { $gt: startTime },
    $or: [
      { volunteerId: { $in: userIds } },
      { "participants.userId": { $in: userIds } },
    ],
  }).select("volunteerId participants status title startTime endTime").lean();

  for (const service of candidates) {
    for (const person of participantsOf(service)) {
      if (userIds.includes(person.userId) && person.status !== "declined") {
        throw fail(409, `El voluntario seleccionado ya tiene un turno de ${service.startTime} a ${service.endTime} (${service.title}).`);
      }
    }
  }
}

router.use(authenticateUser);

// =========================================================
// MIEMBROS: SOLO SUS PROPIOS TURNOS
// =========================================================
router.get("/me/assignments", authorizeRoles("member", "admin", "super_admin"), async (req, res, next) => {
  try {
    res.set("Cache-Control", "no-store");
    const records = await VolunteerAssignment.find({
      $or: [{ volunteerId: req.user._id }, { "participants.userId": req.user._id }],
    }).sort({ date: 1, startTime: 1 }).lean();
    return res.json({ success: true, assignments: records.map((service) => serializeMemberAssignment(service, ID(req.user))) });
  } catch (error) { return next(error); }
});

router.patch("/me/assignments/:id/respond", authorizeRoles("member", "admin", "super_admin"), trustedOrigin, async (req, res, next) => {
  try {
    checkExactObject(req.body, ["status"], ["status"]);
    if (!["confirmed", "declined"].includes(req.body.status)) throw fail(400, "Respuesta inválida");
    if (!validObjectId(req.params.id)) throw fail(400, "Asignación inválida");

    const current = await VolunteerAssignment.findOne({
      _id: req.params.id,
      $or: [{ volunteerId: req.user._id }, { "participants.userId": req.user._id }],
    });
    if (!current) throw fail(404, "El turno no existe o no te pertenece");
    if (current.status === "cancelled" || current.date < todayChile()) {
      throw fail(409, "Este turno ya no admite respuestas");
    }
    const profile = await Volunteer.findOne({ userId: req.user._id, status: "active", teams: current.teamId });
    if (!profile) throw fail(409, "Tu participación en este equipo no está activa");

    // Para confirmar revisamos otros servicios; rechazarlos no crea conflictos.
    if (req.body.status === "confirmed") {
      await checkVolunteerConflicts([ID(req.user)], current.date, current.startTime, current.endTime, ID(current));
    }

    // Migramos el esquema heredado únicamente al guardar por primera vez.
    if (!Array.isArray(current.participants)) {
      current.participants = participantsOf(current).map((item) => ({
        userId: item.userId, status: item.status, respondedAt: item.respondedAt,
      }));
      current.volunteerId = null;
      current.respondedAt = null;
      current.status = "pending";
    }
    const person = current.participants.find((item) => ID(item.userId) === ID(req.user));
    if (!person) throw fail(404, "No estás asignado a este servicio");
    person.status = req.body.status;
    person.respondedAt = new Date();
    await current.save();
    return res.json({
      success: true,
      assignment: serializeMemberAssignment(current, ID(req.user)),
      message: "Respuesta guardada",
    });
  } catch (error) { return sendError(error, next); }
});

router.use(authorizeRoles(...ADMIN_ROLES));

// =========================================================
// ADMINISTRACIÓN: MIEMBROS Y EQUIPOS
// =========================================================
router.get("/eligible-members", async (req, res, next) => {
  try {
    const query = { role: "member", isActive: true, emailVerifiedAt: { $ne: null } };
    if (req.user.role === "admin") query.sucursales = { $in: accessibleBranchIds(req.user) };
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 100);
    if (!Number.isInteger(page) || page < 1 || page > 10000 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw fail(400, "Paginación inválida");
    }
    const [users, total] = await Promise.all([
      User.find(query).select("firstName lastName email sucursales isActive")
        .sort({ firstName: 1, lastName: 1, _id: 1 }).skip((page - 1) * limit).limit(limit).lean(),
      User.countDocuments(query),
    ]);
    return res.json({ success: true, members: users.map((user) => ({
      id: ID(user), name: userName(user), email: user.email,
      branchIds: (user.sucursales || []).map(ID),
    })), pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) { return next(error); }
});

router.get("/roster", async (req, res, next) => {
  try {
    res.set("Cache-Control", "no-store");
    const usersFilter = req.user.role === "super_admin" ? {} : { sucursales: { $in: accessibleBranchIds(req.user) } };
    const eligibleUsers = await User.find({ ...usersFilter, role: "member" }).select("_id").lean();
    const profiles = await Volunteer.find({ userId: { $in: eligibleUsers.map((user) => user._id) } })
      .populate({ path: "userId", select: "firstName lastName email sucursales role isActive" })
      .sort({ createdAt: 1 }).lean();
    return res.json({ success: true, volunteers: profiles.filter((p) => p.userId?.role === "member").map(serializeVolunteer) });
  } catch (error) { return next(error); }
});

router.get("/activities", async (req, res, next) => {
  try {
    // Consultamos solo actividades internas, no eventos públicos.
    const activities = await Activity.find({ date: { $gte: todayChile() } })
      .select("title date").sort({ date: 1 }).limit(250).lean();
    return res.json({ success: true, activities: activities.map((item) => ({
      id: ID(item), title: item.title, date: item.date,
    })) });
  } catch (error) { return next(error); }
});

router.post("/roster", trustedOrigin, async (req, res, next) => {
  try {
    checkExactObject(req.body, ["userId", "teams", "status"], ["userId", "teams"]);
    if (!validObjectId(req.body.userId)) throw fail(400, "Miembro inválido");
    checkTeamSet(req.body.teams);
    const status = req.body.status ?? "active";
    if (!["active", "inactive"].includes(status)) throw fail(400, "Estado inválido");
    const member = await User.findOne({ _id: req.body.userId, role: "member", isActive: true, emailVerifiedAt: { $ne: null } });
    if (!member) throw fail(404, "El miembro no está activo o no confirmó su cuenta");
    if (req.user.role === "admin" && !accessibleBranchIds(req.user).some((id) => belongsToBranch(member, id))) {
      throw fail(403, "Este miembro no pertenece a tus sucursales autorizadas");
    }
    const created = await Volunteer.create({ userId: member._id, teams: req.body.teams, status, createdBy: req.user._id });
    return res.status(201).json({ success: true, volunteerId: ID(created), message: "Voluntario incorporado correctamente" });
  } catch (error) { return sendError(error, next); }
});

router.patch("/roster/:id", trustedOrigin, async (req, res, next) => {
  try {
    if (!validObjectId(req.params.id)) throw fail(400, "Miembro inválido");
    checkExactObject(req.body, ["teams", "status"], ["teams", "status"]);
    checkTeamSet(req.body.teams);
    if (!["active", "inactive"].includes(req.body.status)) throw fail(400, "Estado inválido");
    const profile = await Volunteer.findOne({ userId: req.params.id }).populate("userId", "sucursales role");
    if (!profile || profile.userId?.role !== "member") throw fail(404, "Voluntario no encontrado");
    if (req.user.role === "admin" && !accessibleBranchIds(req.user).some((id) => belongsToBranch(profile.userId, id))) {
      throw fail(403, "No puedes modificar este voluntario");
    }
    // Comprobamos los equipos de los turnos futuros sin realizar dos consultas.
    const services = await VolunteerAssignment.find({
      date: { $gte: todayChile() }, status: { $ne: "cancelled" },
      $or: [{ volunteerId: req.params.id }, { "participants.userId": req.params.id }],
    }).select("teamId status volunteerId participants").lean();
    if (services.some((service) => !req.body.teams.includes(service.teamId) &&
      participantsOf(service).some((person) => person.userId === req.params.id && person.status !== "declined"))) {
      throw fail(409, "El voluntario tiene turnos vigentes en un equipo que intentas quitar");
    }
    profile.teams = req.body.teams;
    profile.status = req.body.status;
    profile.updatedBy = req.user._id;
    await profile.save();
    return res.json({ success: true, message: "Equipos del voluntario actualizados" });
  } catch (error) { return sendError(error, next); }
});

router.delete("/roster/:id", async (req, res, next) => {
  try {
    trustedDeleteOrigin(req);
    if (!validObjectId(req.params.id)) throw fail(400, "Miembro inválido");
    const profile = await Volunteer.findOne({ userId: req.params.id }).populate("userId", "sucursales role");
    if (!profile || profile.userId?.role !== "member") throw fail(404, "Voluntario no encontrado");
    if (req.user.role === "admin" && !accessibleBranchIds(req.user).some((id) => belongsToBranch(profile.userId, id))) {
      throw fail(403, "No puedes retirar este voluntario");
    }
    const services = await VolunteerAssignment.find({
      date: { $gte: todayChile() }, status: { $ne: "cancelled" },
      $or: [{ volunteerId: req.params.id }, { "participants.userId": req.params.id }],
    }).select("status volunteerId participants").lean();
    if (services.some((service) => participantsOf(service).some((person) =>
      person.userId === req.params.id && person.status !== "declined"))) {
      throw fail(409, "Reasigna o cancela los turnos futuros antes de retirar al voluntario");
    }
    await profile.deleteOne();
    return res.json({ success: true, message: "Voluntario retirado; su cuenta permanece intacta" });
  } catch (error) { return next(error); }
});

// =========================================================
// ADMINISTRACIÓN: UN DOCUMENTO POR SERVICIO
// =========================================================
router.get("/assignments", async (req, res, next) => {
  try {
    res.set("Cache-Control", "no-store");
    const records = await VolunteerAssignment.find(scopeByBranch(req.user))
      .sort({ date: 1, startTime: 1 }).lean();
    return res.json({ success: true, assignments: records.map(serializeAssignment) });
  } catch (error) { return next(error); }
});

async function normalizeAssignment(body, actor, current = null) {
  const allowed = ["teamId", "volunteerIds", "requiredVolunteers", "title", "description", "date",
    "startTime", "endTime", "location", "activityId", "notes", "status"];
  checkExactObject(body, allowed, ["teamId", "volunteerIds", "requiredVolunteers", "title", "date", "startTime", "endTime"]);

  const teamId = body.teamId;
  if (!VOLUNTEER_TEAM_IDS.includes(teamId)) throw fail(400, "Equipo inválido");
  const readText = (key, max) => {
    if (body[key] != null && typeof body[key] !== "string") throw fail(400, `${key}: texto inválido`);
    const value = String(body[key] ?? "").trim();
    if (value.length > max) throw fail(400, `${key}: demasiado largo`);
    return value;
  };
  const title = readText("title", 120);
  if (title.length < 3) throw fail(400, "El título debe tener entre 3 y 120 caracteres");
  const description = readText("description", 500);
  const location = readText("location", 150);
  const notes = readText("notes", 1000);
  const date = readText("date", 10);
  const startTime = readText("startTime", 5);
  const endTime = readText("endTime", 5);
  const actualDate = /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(`${date}T12:00:00Z`) : null;
  const validDate = actualDate && !Number.isNaN(actualDate.getTime()) && actualDate.toISOString().slice(0, 10) === date;
  const validTime = (value) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
  if (!validDate || !validTime(startTime) || !validTime(endTime) || endTime <= startTime) {
    throw fail(400, "Verifica la fecha y el horario del turno");
  }
  if (!Number.isInteger(body.requiredVolunteers) || body.requiredVolunteers < 1 || body.requiredVolunteers > 20) {
    throw fail(400, "Indica entre 1 y 20 personas necesarias para el servicio");
  }
  const requiredVolunteers = body.requiredVolunteers;
  if (!Array.isArray(body.volunteerIds) || body.volunteerIds.length > requiredVolunteers ||
    new Set(body.volunteerIds).size !== body.volunteerIds.length ||
    body.volunteerIds.some((id) => !validObjectId(id))) {
    throw fail(400, "Selecciona voluntarios distintos y no superes los cupos del servicio");
  }
  const volunteerIds = body.volunteerIds;
  const status = body.status ?? "pending";
  if (!["pending", "cancelled"].includes(status)) throw fail(400, "Estado de servicio inválido");

  // Seleccionamos una sede común a todos los participantes y al administrador.
  let branchId = current ? ID(current.branchId) : ID(actor.sucursalPrincipal);
  let candidateBranches = actor.role === "super_admin" ? null : accessibleBranchIds(actor);
  // Cuando un administrador no tiene sede principal, usamos una autorizada.
  if (actor.role === "admin" && !canManageBranch(actor, branchId)) {
    branchId = candidateBranches[0] || "";
  }
  const participantUsers = volunteerIds.length ? await User.find({
    _id: { $in: volunteerIds }, role: "member", isActive: true, emailVerifiedAt: { $ne: null },
  }).select("_id sucursales").lean() : [];
  if (participantUsers.length !== volunteerIds.length) throw fail(400, "Hay miembros inactivos o no confirmados");

  // Una única consulta comprueba que todos sean voluntarios activos del equipo.
  const profiles = volunteerIds.length ? await Volunteer.find({
    userId: { $in: volunteerIds }, status: "active", teams: teamId,
  }).select("userId").lean() : [];
  if (profiles.length !== volunteerIds.length) {
    throw fail(400, "Seleccionaste un miembro que no está activo en ese equipo");
  }
  if (participantUsers.length) {
    const common = participantUsers.reduce((acc, user) => {
      const branches = (user.sucursales || []).map(ID);
      return acc === null ? branches : acc.filter((id) => branches.includes(id));
    }, null) || [];
    candidateBranches = candidateBranches ? common.filter((id) => candidateBranches.includes(id)) : common;
    if (candidateBranches.length === 0) throw fail(403, "Los voluntarios deben compartir una sede autorizada");
    // Un servicio existente no puede cambiar de sucursal indirectamente
    // al editar sus detalles o participantes.
    if (current && !candidateBranches.includes(branchId)) {
      throw fail(403, "Los voluntarios deben pertenecer a la sucursal de este servicio");
    }
    if (!candidateBranches.includes(branchId)) branchId = candidateBranches[0];
  }
  if (!branchId || !canManageBranch(actor, branchId)) throw fail(403, "No tienes una sucursal autorizada");

  // Prohibimos superposiciones reales, pero admitimos varios turnos en otras horas.
  if (status !== "cancelled") {
    await checkVolunteerConflicts(volunteerIds, date, startTime, endTime, current ? ID(current) : null);
  }

  let activityId = body.activityId || null;
  if (activityId) {
    if (!validObjectId(activityId)) throw fail(400, "Actividad asociada inválida");
    if (!await Activity.exists({ _id: activityId, date })) {
      throw fail(400, "La actividad seleccionada no corresponde a esta fecha");
    }
  }
  return { teamId, branchId, title, description, date, startTime, endTime,
    location, notes, activityId, requiredVolunteers, volunteerIds, status };
}

router.post("/assignments", trustedOrigin, async (req, res, next) => {
  try {
    const { volunteerIds, ...values } = await normalizeAssignment(req.body, req.user);
    const created = await VolunteerAssignment.create({
      ...values,
      // Cada voluntario conserva su propia respuesta en el mismo documento.
      participants: volunteerIds.map((userId) => ({ userId, status: "pending", respondedAt: null })),
      createdBy: req.user._id,
    });
    return res.status(201).json({ success: true, assignment: serializeAssignment(created) });
  } catch (error) { return sendError(error, next); }
});

router.patch("/assignments/:id", trustedOrigin, async (req, res, next) => {
  try {
    if (!validObjectId(req.params.id)) throw fail(400, "Asignación inválida");
    const current = await VolunteerAssignment.findOne({ _id: req.params.id, ...scopeByBranch(req.user) });
    if (!current) throw fail(404, "Asignación no encontrada");
    const previous = participantsOf(current);
    const normalized = await normalizeAssignment(req.body, req.user, current);
    const { volunteerIds, ...values } = normalized;

    // Conservar confirmaciones cuando solo se añaden participantes o se cambia una nota.
    // Cambios de equipo, fecha u hora necesitan una nueva confirmación de todos.
    const changedSchedule = current.teamId !== values.teamId || current.title !== values.title ||
      current.date !== values.date || current.startTime !== values.startTime || current.endTime !== values.endTime;
    const reopening = current.status === "cancelled" && values.status !== "cancelled";
    const nextParticipants = volunteerIds.map((userId) => {
      const old = previous.find((person) => person.userId === userId);
      return {
        userId,
        status: old && !changedSchedule && !reopening ? old.status : "pending",
        respondedAt: old && !changedSchedule && !reopening ? old.respondedAt : null,
        reminderEmail: old && !changedSchedule && !reopening ? old.reminderEmail : undefined,
      };
    });

    Object.assign(current, values, {
      participants: nextParticipants,
      volunteerId: null, respondedAt: null,
      updatedBy: req.user._id,
    });
    await current.save();
    return res.json({ success: true, assignment: serializeAssignment(current) });
  } catch (error) { return sendError(error, next); }
});

// =========================================================
// ACTUALIZAR SOLO EL SERVICIO (SIN EDITAR PARTICIPANTES)
// =========================================================
// Esta ruta protege a los voluntarios de modificaciones accidentales
// cuando el administrador únicamente quiere cambiar el horario o notas.
router.patch("/assignments/:id/service", trustedOrigin, async (req, res, next) => {
  try {
    if (!validObjectId(req.params.id)) throw fail(400, "Asignación inválida");
    const fields = ["teamId", "title", "description", "date", "startTime", "endTime",
      "location", "activityId", "notes", "status"];
    checkExactObject(req.body, fields, ["teamId", "title", "date", "startTime", "endTime"]);

    const current = await VolunteerAssignment.findOne({ _id: req.params.id, ...scopeByBranch(req.user) });
    if (!current) throw fail(404, "Servicio no encontrado");

    // Los ID existentes se obtienen de MongoDB, NUNCA de este formulario.
    const oldParticipants = participantsOf(current);
    const values = await normalizeAssignment({
      ...req.body,
      volunteerIds: oldParticipants.map((person) => person.userId),
      requiredVolunteers: Math.max(current.requiredVolunteers || 1, oldParticipants.length),
    }, req.user, current);
    const { volunteerIds: unusedIds, ...serviceValues } = values;

    // Solo se pide reconfirmación si realmente se modificó el turno.
    const scheduleChanged = current.teamId !== serviceValues.teamId ||
      current.date !== serviceValues.date ||
      current.startTime !== serviceValues.startTime || current.endTime !== serviceValues.endTime;
    const reopened = current.status === "cancelled" && serviceValues.status !== "cancelled";
    const participants = oldParticipants.map((person) => ({
      userId: person.userId,
      status: (scheduleChanged || reopened) ? "pending" : person.status,
      respondedAt: (scheduleChanged || reopened) ? null : person.respondedAt,
      reminderEmail: (scheduleChanged || reopened) ? undefined : person.reminderEmail,
    }));

    Object.assign(current, serviceValues, {
      participants, volunteerId: null, respondedAt: null, updatedBy: req.user._id,
    });
    await current.save();
    return res.json({ success: true, assignment: serializeAssignment(current) });
  } catch (error) { return sendError(error, next); }
});

// =========================================================
// GESTIONAR SOLO LOS VOLUNTARIOS DE UN SERVICIO
// =========================================================
// Permite modificar cupos y participantes, sin recibir ni alterar fecha,
// título, sede o instrucciones desde el navegador.
router.patch("/assignments/:id/participants", trustedOrigin, async (req, res, next) => {
  try {
    if (!validObjectId(req.params.id)) throw fail(400, "Asignación inválida");
    checkExactObject(req.body, ["requiredVolunteers", "volunteerIds"],
      ["requiredVolunteers", "volunteerIds"]);
    const current = await VolunteerAssignment.findOne({ _id: req.params.id, ...scopeByBranch(req.user) });
    if (!current) throw fail(404, "Servicio no encontrado");
    if (current.status === "cancelled") throw fail(409, "Reactiva primero el servicio cancelado");

    const previous = participantsOf(current);
    // Reconstruimos los datos del servicio desde MongoDB: el cliente no
    // puede reemplazarlos al usar este endpoint.
    const values = await normalizeAssignment({
      teamId: current.teamId,
      title: current.title,
      description: current.description,
      date: current.date,
      startTime: current.startTime,
      endTime: current.endTime,
      location: current.location,
      activityId: current.activityId ? ID(current.activityId) : null,
      notes: current.notes,
      status: "pending",
      requiredVolunteers: req.body.requiredVolunteers,
      volunteerIds: req.body.volunteerIds,
    }, req.user, current);

    const { volunteerIds, ...serviceValues } = values;
    const participants = volunteerIds.map((userId) => {
      const existing = previous.find((person) => person.userId === userId);
      return {
        userId,
        // Conservamos las respuestas anteriores; solo los nuevos quedan pendientes.
        status: existing?.status || "pending",
        respondedAt: existing?.respondedAt || null,
        reminderEmail: existing?.reminderEmail,
      };
    });
    Object.assign(current, serviceValues, {
      participants, volunteerId: null, respondedAt: null, updatedBy: req.user._id,
    });
    await current.save();
    return res.json({ success: true, assignment: serializeAssignment(current) });
  } catch (error) { return sendError(error, next); }
});

router.delete("/assignments/:id", async (req, res, next) => {
  try {
    trustedDeleteOrigin(req);
    if (!validObjectId(req.params.id)) throw fail(400, "Asignación inválida");
    const deleted = await VolunteerAssignment.findOneAndDelete({ _id: req.params.id, ...scopeByBranch(req.user) });
    if (!deleted) throw fail(404, "Asignación no encontrada");
    return res.json({ success: true, message: "Servicio eliminado" });
  } catch (error) { return next(error); }
});

export default router;
