
// =========================================================
// API DE PETICIONES DE ORACIÓN - IGLESIA EL ANCLA
// Archivo: backend/src/routes/prayerRequestRoutes.js
// Una sola API protegida para miembros y administradores.
// =========================================================

// Express crea las rutas REST.
import { Router } from "express";

// Mongoose verifica los identificadores de documentos.
import mongoose from "mongoose";

// Limitamos el número de publicaciones para evitar abuso.
import rateLimit from "express-rate-limit";

// Reutilizamos autenticación, roles y protección de origen del proyecto.
import authenticateUser from "../middleware/authenticateUser.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import validateRequestOrigin from "../middleware/validateRequestOrigin.js";

// Colección única para peticiones de oración.
import PrayerRequest, { PRAYER_CATEGORIES, PRAYER_STATUSES } from "../models/PrayerRequest.js";
import { announceCommunityChange } from "../services/push/automaticPushService.js";

// Usamos el servicio existente de eliminaciones auditadas.
import { deleteResourceWithAudit } from "../services/audit/deletionService.js";

// Definimos el router único.
const router = Router();

// Los tres roles pueden leer el área de miembros.
const memberRoles = ["member", "admin", "super_admin"];

// Solo administración puede ver peticiones privadas de otras personas y gestionar estados.
const adminRoles = ["admin", "super_admin"];

// Todas las rutas exigen una sesión válida.
router.use(authenticateUser);

// Protegemos los métodos de escritura contra solicitudes de otros sitios.
router.use((req, res, next) =>
  ["POST", "PATCH", "PUT", "DELETE"].includes(req.method)
    ? validateRequestOrigin(req, res, next)
    : next()
);

// Límite por IP de peticiones nuevas; funciona con la dependencia existente.
const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Has enviado varias peticiones. Intenta nuevamente más tarde." },
});

// Crea un error con respuesta HTTP concreta.
function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

// La API trabaja solo con identificadores ObjectId legítimos.
function requireId(value) {
  if (!mongoose.isObjectIdOrHexString(value)) {
    throw httpError(400, "Identificador de petición inválido");
  }
  return value;
}

// Rechazamos propiedades inesperadas para prevenir cambios de roles, propietarios y estados.
function assertFields(body, fields) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw httpError(400, "Datos de petición inválidos");
  }
  if (Object.keys(body).some((key) => !fields.includes(key))) {
    throw httpError(400, "El formulario contiene campos no permitidos");
  }
}

// Normalizamos los campos que pueden completar miembros y administradores.
function parseContent(body, { partial = false } = {}) {
  const allowed = ["title", "description", "category", "visibility", "anonymous"];
  assertFields(body, allowed);
  const result = {};
  for (const key of allowed) {
    if (!Object.hasOwn(body, key)) {
      if (!partial && key !== "anonymous" && key !== "visibility") {
        throw httpError(400, `Falta completar ${key}`);
      }
      continue;
    }
    const value = body[key];
    if (key === "anonymous") {
      if (typeof value !== "boolean") throw httpError(400, "Anonimato inválido");
      result.anonymous = value;
      continue;
    }
    if (typeof value !== "string") throw httpError(400, `El campo ${key} no es válido`);
    const normalized = value.trim();
    if (key === "title" && (normalized.length < 3 || normalized.length > 120)) {
      throw httpError(400, "El título debe tener entre 3 y 120 caracteres");
    }
    if (key === "description" && (normalized.length < 5 || normalized.length > 2000)) {
      throw httpError(400, "La descripción debe tener entre 5 y 2000 caracteres");
    }
    if (key === "category" && !PRAYER_CATEGORIES.includes(normalized)) {
      throw httpError(400, "Categoría de petición no válida");
    }
    if (key === "visibility" && !["private", "community"].includes(normalized)) {
      throw httpError(400, "Visibilidad no válida");
    }
    result[key] = normalized;
  }
  if (partial && !Object.keys(result).length) throw httpError(400, "No se recibieron cambios");
  return result;
}

// Nombre visible, derivado de la cuenta existente.
function fullName(user) {
  if (!user) return "Usuario no disponible";
  return [user.firstName, user.lastName].filter(Boolean).join(" ") || "Sin nombre";
}

// Convertimos fechas a ISO; el frontend las muestra en la zona de Chile.
function serializePrayer(doc, viewerId, { administrative = false } = {}) {
  const owner = doc.createdBy;
  const ownerId = String(owner?._id || owner || "");
  const isOwner = ownerId === String(viewerId);
  const isAnonymousToViewer = !administrative && !isOwner && doc.anonymous;
  const members = Array.isArray(doc.prayingMembers) ? doc.prayingMembers : [];
  return {
    id: String(doc._id),
    title: doc.title,
    description: doc.description,
    category: doc.category,
    visibility: doc.visibility,
    privacy: doc.visibility,
    anonymous: Boolean(doc.anonymous),
    requester: isAnonymousToViewer ? "Miembro anónimo" : fullName(owner),
    isOwner,
    status: doc.status,
    date: doc.createdAt?.toISOString?.() || doc.createdAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    prayerCount: members.length,
    prayingByMe: members.some((id) => String(id) === String(viewerId)),
    // Seguimiento interno: jamás lo enviamos a miembros.
    ...(administrative ? { followUpNote: doc.followUpNote || "" } : {}),
  };
}

// Recuperamos una petición con los campos excluidos por defecto y el nombre del autor.
function findFullPrayer(filter) {
  return PrayerRequest.findOne(filter)
    .select("+prayingMembers +followUpNote")
    .populate({ path: "createdBy", select: "firstName lastName" });
}

// Construimos las respuestas sin permitir almacenamiento compartido.
function respond(res, body, status = 200) {
  res.set("Cache-Control", "private, no-store");
  return res.status(status).json({ success: true, ...body });
}

// =========================================================
// MIEMBROS: LEER COMUNITARIAS Y PROPIAS (INCLUYE PRIVADAS)
// GET /api/prayer-requests/member
// =========================================================
router.get("/member", authorizeRoles(...memberRoles), async (req, res, next) => {
  try {
    const ownerId = req.user._id;
    // El filtro de privacidad se ejecuta en MongoDB, nunca en React.
    const documents = await PrayerRequest.find({
      $or: [{ visibility: "community" }, { createdBy: ownerId }],
    })
      .select("+prayingMembers")
      .populate({ path: "createdBy", select: "firstName lastName" })
      .sort({ createdAt: -1, _id: -1 })
      .limit(300);
    return respond(res, { requests: documents.map((doc) => serializePrayer(doc, ownerId)) });
  } catch (error) { next(error); }
});

// =========================================================
// MIEMBROS: ENVIAR UNA PETICIÓN
// POST /api/prayer-requests/member
// =========================================================
router.post("/member", authorizeRoles(...memberRoles), createLimiter, async (req, res, next) => {
  try {
    const data = parseContent(req.body);
    const created = await PrayerRequest.create({ ...data, createdBy: req.user._id });
    // Mensajes genéricos: privadas solo a administradores, públicas a la comunidad.
    try {
      if (created.visibility === "community") {
        await announceCommunityChange("prayer", { exceptUserId: req.user._id });
      } else {
        await announceCommunityChange("privatePrayer", {
          exceptUserId: req.user._id, allowedRoles: ["admin", "super_admin"],
        });
      }
    } catch (error) { console.error("Aviso de oración no enviado:", error.message); }
    const doc = await findFullPrayer({ _id: created._id });
    return respond(res, { message: "Tu petición fue enviada correctamente", request: serializePrayer(doc, req.user._id) }, 201);
  } catch (error) { next(error); }
});

// =========================================================
// MIEMBROS: EDITAR SOLO SU PETICIÓN (NUNCA ESTADO O NOTAS)
// PATCH /api/prayer-requests/member/:id
// =========================================================
router.patch("/member/:id", authorizeRoles(...memberRoles), async (req, res, next) => {
  try {
    const id = requireId(req.params.id);
    const changes = parseContent(req.body, { partial: true });
    const doc = await PrayerRequest.findOne({ _id: id, createdBy: req.user._id }).select("+prayingMembers");
    if (!doc) throw httpError(404, "Petición no encontrada");
    const previouslyPrivate = doc.visibility === "private";
    doc.set({ ...changes, updatedBy: req.user._id });
    // Una petición que pasa a privada deja de aceptar apoyos comunitarios.
    if (changes.visibility === "private") doc.prayingMembers = [];
    await doc.save();
    // Si el propio autor la convirtió en comunitaria, anunciamos el cambio.
    if (previouslyPrivate && doc.visibility === "community" && ["pending", "praying"].includes(doc.status)) {
      try { await announceCommunityChange("prayer", { exceptUserId: req.user._id }); }
      catch (error) { console.error("Aviso comunitario no enviado:", error.message); }
    }
    const updated = await findFullPrayer({ _id: id });
    return respond(res, { message: "Tu petición fue actualizada", request: serializePrayer(updated, req.user._id) });
  } catch (error) { next(error); }
});

// =========================================================
// MIEMBROS: ELIMINAR SOLO SU PETICIÓN, CON AUDITORÍA
// DELETE /api/prayer-requests/member/:id
// =========================================================
router.delete("/member/:id", authorizeRoles(...memberRoles), async (req, res, next) => {
  try {
    const id = requireId(req.params.id);
    const owned = await PrayerRequest.exists({ _id: id, createdBy: req.user._id });
    if (!owned) throw httpError(404, "Petición no encontrada");
    // Se registra también la eliminación solicitada por el propio miembro.
    await deleteResourceWithAudit({
      model: PrayerRequest, resourceId: id,
      resourceType: "prayer_request", deletedBy: req.user._id,
      // Revalidamos la propiedad dentro de la transacción para evitar carreras.
      onDelete: async ({ deleted }) => {
        if (String(deleted.createdBy) !== String(req.user._id)) {
          throw httpError(403, "No puedes eliminar esta petición");
        }
      },
    });
    return respond(res, { message: "Petición eliminada correctamente" });
  } catch (error) { next(error); }
});

// =========================================================
// MIEMBROS: MARCAR / RETIRAR «ESTOY ORANDO»
// PUT /api/prayer-requests/member/:id/praying
// DELETE /api/prayer-requests/member/:id/praying
// =========================================================
async function updatePraying(req, res, next, shouldPray) {
  try {
    const id = requireId(req.params.id);
    // $addToSet y $pull son atómicos; no crean una colección extra.
    const change = shouldPray
      ? { $addToSet: { prayingMembers: req.user._id } }
      : { $pull: { prayingMembers: req.user._id } };
    const result = await PrayerRequest.updateOne(
      { _id: id, visibility: "community", status: { $ne: "completed" } },
      change
    );
    if (result.matchedCount === 0) {
      throw httpError(404, "Esta petición no está disponible para acompañamiento comunitario");
    }
    const doc = await findFullPrayer({ _id: id, visibility: "community" });
    return respond(res, { request: serializePrayer(doc, req.user._id), message: shouldPray
      ? "Gracias por acompañar a tu hermano en oración"
      : "Has retirado tu confirmación de oración" });
  } catch (error) { next(error); }
}
router.put("/member/:id/praying", authorizeRoles(...memberRoles), (req, res, next) => updatePraying(req, res, next, true));
router.delete("/member/:id/praying", authorizeRoles(...memberRoles), (req, res, next) => updatePraying(req, res, next, false));

// =========================================================
// ADMINISTRACIÓN: LISTAR TODAS (INCLUIDAS PRIVADAS)
// GET /api/prayer-requests/admin
// =========================================================
router.get("/admin", authorizeRoles(...adminRoles), async (req, res, next) => {
  try {
    const documents = await PrayerRequest.find({})
      .select("+prayingMembers +followUpNote")
      .populate({ path: "createdBy", select: "firstName lastName" })
      .sort({ createdAt: -1, _id: -1 })
      .limit(500);
    return respond(res, { requests: documents.map((doc) => serializePrayer(doc, req.user._id, { administrative: true })) });
  } catch (error) { next(error); }
});

// =========================================================
// ADMINISTRACIÓN: CREAR PETICIÓN DESDE CUENTA ADMINISTRATIVA
// POST /api/prayer-requests/admin
// =========================================================
router.post("/admin", authorizeRoles(...adminRoles), createLimiter, async (req, res, next) => {
  try {
    const data = parseContent(req.body);
    const created = await PrayerRequest.create({ ...data, createdBy: req.user._id });
    // Mensajes genéricos: privadas solo a administradores, públicas a la comunidad.
    try {
      if (created.visibility === "community") {
        await announceCommunityChange("prayer", { exceptUserId: req.user._id });
      } else {
        await announceCommunityChange("privatePrayer", {
          exceptUserId: req.user._id, allowedRoles: ["admin", "super_admin"],
        });
      }
    } catch (error) { console.error("Aviso de oración no enviado:", error.message); }
    const doc = await findFullPrayer({ _id: created._id });
    return respond(res, { message: "Petición registrada correctamente", request: serializePrayer(doc, req.user._id, { administrative: true }) }, 201);
  } catch (error) { next(error); }
});

// =========================================================
// ADMINISTRACIÓN: EDITAR CONTENIDO, PRIVACIDAD Y ESTADO
// PATCH /api/prayer-requests/admin/:id
// =========================================================
router.patch("/admin/:id", authorizeRoles(...adminRoles), async (req, res, next) => {
  try {
    const id = requireId(req.params.id);
    const permitted = ["title", "description", "category", "visibility", "anonymous", "status", "followUpNote"];
    assertFields(req.body, permitted);
    const content = {};
    for (const key of ["title", "description", "category", "visibility", "anonymous"]) {
      if (Object.hasOwn(req.body, key)) content[key] = req.body[key];
    }
    const data = Object.keys(content).length ? parseContent(content, { partial: true }) : {};
    if (Object.hasOwn(req.body, "status")) {
      if (!PRAYER_STATUSES.includes(req.body.status)) throw httpError(400, "Estado inválido");
      data.status = req.body.status;
    }
    if (Object.hasOwn(req.body, "followUpNote")) {
      if (typeof req.body.followUpNote !== "string" || req.body.followUpNote.length > 1000) {
        throw httpError(400, "La observación no puede superar 1000 caracteres");
      }
      data.followUpNote = req.body.followUpNote.trim();
    }
    if (!Object.keys(data).length) throw httpError(400, "No se recibieron cambios");
    const doc = await PrayerRequest.findById(id).select("+followUpNote +prayingMembers");
    if (!doc) throw httpError(404, "Petición no encontrada");
    const previouslyPrivate = doc.visibility === "private";
    doc.set({ ...data, updatedBy: req.user._id });
    // Si administración cambia la petición a privada, retiramos apoyos antiguos.
    if (data.visibility === "private") doc.prayingMembers = [];
    await doc.save();
    // La administración puede cambiar una petición privada a comunitaria.
    if (previouslyPrivate && doc.visibility === "community" && ["pending", "praying"].includes(doc.status)) {
      try { await announceCommunityChange("prayer", { exceptUserId: doc.createdBy }); }
      catch (error) { console.error("Aviso comunitario no enviado:", error.message); }
    }
    const updated = await findFullPrayer({ _id: id });
    return respond(res, { message: "Petición actualizada correctamente", request: serializePrayer(updated, req.user._id, { administrative: true }) });
  } catch (error) { next(error); }
});

// =========================================================
// ADMINISTRACIÓN: ELIMINAR CON HISTORIAL DE AUDITORÍA
// DELETE /api/prayer-requests/admin/:id
// =========================================================
router.delete("/admin/:id", authorizeRoles(...adminRoles), async (req, res, next) => {
  try {
    const id = requireId(req.params.id);
    await deleteResourceWithAudit({
      model: PrayerRequest, resourceId: id,
      resourceType: "prayer_request", deletedBy: req.user._id,
    });
    return respond(res, { message: "Petición eliminada correctamente" });
  } catch (error) { next(error); }
});

// Exportamos el único router del módulo.
export default router;
