
// =========================================================
// API DE INSUMOS BÁSICOS - IGLESIA EL ANCLA
// CRUD administrativo, stock y compromisos de miembros.
// =========================================================
import { Router } from "express";
import mongoose from "mongoose";
import BasicSupply, { BASIC_SUPPLY_CATEGORIES } from "../models/BasicSupply.js";
import { announceCommunityChange } from "../services/push/automaticPushService.js";
import authenticateUser from "../middleware/authenticateUser.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import validateRequestOrigin from "../middleware/validateRequestOrigin.js";
import { deleteResourceWithAudit } from "../services/audit/deletionService.js";

const router = Router();
const ADMIN = authorizeRoles("admin", "super_admin");
const MAX_PLEDGES = 200; // Límite de compromisos activos por producto.
const MAX_MOVEMENTS = 100; // Historial reciente, no un registro de contabilidad.

router.use(authenticateUser);

const fail = (status, message) => { const e = new Error(message); e.status = status; return e; };
const validId = (id) => typeof id === "string" && mongoose.isObjectIdOrHexString(id);
const integer = (v, min = 0, max = 1000000) => Number.isSafeInteger(v) && v >= min && v <= max;
const status = (supply) => supply.stock <= 0 ? "out" : supply.stock <= supply.minimumStock ? "low" : "available";
const totalPledged = (supply) => (supply.pledges || []).reduce((sum, item) => sum + item.quantity, 0);
// Al llegar al mínimo se avisa. Para salir de la alerta basta quedar
// una unidad por encima del mínimo, descontando las ayudas prometidas.
const suggestedQuantity = (supply) => Math.max(0, supply.minimumStock + 1 - supply.stock);
const remainingToPromise = (supply) => Math.max(0, suggestedQuantity(supply) - totalPledged(supply));

function shapeAdmin(supply) {
  const result = supply.toObject ? supply.toObject() : supply;
  // No enviamos campos antiguos que pudieran permanecer en documentos históricos.
  const clean = { ...result };
  for (const field of ["unit", "targetStock", "location", "frequent", "visibleToMembers"]) {
    delete clean[field];
  }
  return {
    ...clean, id: String(result._id),
    status: status(result),
    committedQuantity: totalPledged(result),
    remainingToPromise: remainingToPromise(result),
  };
}

function shapeMember(supply, userId) {
  const mine = (supply.pledges || []).find((p) => String(p.member) === String(userId));
  return {
    id: String(supply._id), name: supply.name,
    category: supply.category,
    // Las observaciones se muestran a los miembros, nunca la ubicación interna.
    notes: supply.notes || "",
    stock: supply.stock, minimumStock: supply.minimumStock,
    status: status(supply),
    committedQuantity: totalPledged(supply),
    remainingToPromise: remainingToPromise(supply),
    myCommitment: mine ? mine.quantity : 0,
  };
}

// Solo aceptamos los campos que realmente aparecen en el formulario.
function payload(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) throw fail(400, "Datos del insumo inválidos");
  const allowed = ["name", "category", "stock", "minimumStock", "notes"];
  if (Object.keys(body).some((key) => !allowed.includes(key))) throw fail(400, "El formulario contiene campos no permitidos");
  const data = {};
  for (const key of allowed) if (Object.prototype.hasOwnProperty.call(body, key)) data[key] = body[key];
  for (const key of ["name", "notes"]) {
    if (data[key] !== undefined) {
      if (typeof data[key] !== "string") throw fail(400, `Campo ${key} inválido`);
      data[key] = data[key].trim();
    }
  }
  for (const key of ["stock", "minimumStock"]) {
    if (data[key] !== undefined && !integer(data[key])) throw fail(400, `Cantidad de ${key} inválida`);
  }
  if (data.category !== undefined && !BASIC_SUPPLY_CATEGORIES.includes(data.category)) throw fail(400, "Categoría no permitida");
  if (data.name !== undefined && (data.name.length < 2 || data.name.length > 120)) throw fail(400, "El nombre debe tener entre 2 y 120 caracteres");
  if ((data.notes?.length ?? 0) > 500) throw fail(400, "Las observaciones son demasiado extensas");
  return data;
}

// Respondemos solo con errores controlados; no exponemos datos internos.
function handleError(error, next) {
  if (error?.code === 11000) return next(fail(409, "Ya existe un registro con esos datos"));
  if (error?.name === "ValidationError") return next(fail(400, Object.values(error.errors)[0]?.message || "Datos inválidos"));
  return next(error);
}

// ---------------------------------------------------------
// MIEMBROS: solo necesidades visibles, sin nombres ajenos.
// ---------------------------------------------------------
router.get("/needs", authorizeRoles("member", "admin", "super_admin"), async (req, res, next) => {
  try {
    const supplies = await BasicSupply.find({ $or: [
      { $expr: { $lte: ["$stock", "$minimumStock"] } },
      { "pledges.member": req.user._id }, // También mostrar mis compromisos vigentes.
    ] })
      .select("name category notes stock minimumStock pledges")
      .sort({ category: 1, name: 1 }).lean();
    return res.json({ success: true, supplies: supplies.map((s) => shapeMember(s, req.user._id)) });
  } catch (error) { return next(error); }
});

// ---------------------------------------------------------
// ADMIN: todos los insumos y sus compromisos, no archivos.
// ---------------------------------------------------------
router.get("/admin", ADMIN, async (req, res, next) => {
  try {
    const supplies = await BasicSupply.find().sort({ name: 1 })
      .populate("pledges.member", "firstName lastName");
    const movements = supplies.flatMap((s) => (s.movements || []).map((m) => ({
      id: `${s.id}:${m.at.toISOString()}:${m.type}`, supplyId: s.id,
      supplyName: s.name, type: m.type,
      quantity: m.quantity, date: m.at,
    }))).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 50);
    return res.json({ success: true, supplies: supplies.map(shapeAdmin), movements });
  } catch (error) { return next(error); }
});

router.post("/admin", ADMIN, validateRequestOrigin, async (req, res, next) => {
  try {
    const data = payload(req.body);
    if (["name", "category", "stock", "minimumStock"].some((k) => data[k] === undefined)) {
      throw fail(400, "Completa los datos obligatorios del insumo");
    }
    const supply = await BasicSupply.create({ ...data, createdBy: req.user._id });
    // Si nace con stock bajo, se anuncia una sola vez en el día.
    if (supply.stock <= supply.minimumStock) {
      try { await announceCommunityChange("supply"); }
      catch (error) { console.error("Aviso de insumos no enviado:", error.message); }
    }
    return res.status(201).json({ success: true, supply: shapeAdmin(supply) });
  } catch (error) { return handleError(error, next); }
});

router.put("/admin/:id", ADMIN, validateRequestOrigin, async (req, res, next) => {
  try {
    if (!validId(req.params.id)) throw fail(400, "Identificador inválido");
    const { expectedVersion } = req.body || {};
    if (!integer(expectedVersion, 0)) throw fail(400, "La versión del registro no es válida");
    const raw = { ...req.body };
    delete raw.expectedVersion; // No se permite modificar el control de versión.
    const data = payload(raw);
    if ("stock" in data) throw fail(400, "Las existencias se modifican registrando entradas o consumos");
    const supply = await BasicSupply.findOne({ _id: req.params.id, __v: expectedVersion });
    if (!supply) throw fail(409, "El insumo cambió o ya no existe. Actualiza la página");
    const updated = await BasicSupply.findOneAndUpdate(
      { _id: req.params.id, __v: expectedVersion },
      { $set: { ...data, updatedBy: req.user._id }, $inc: { __v: 1 } },
      { new: true, runValidators: true }
    );
    if (!updated) throw fail(409, "Otro administrador actualizó el insumo. Vuelve a cargar");
    // Avisar cuando aumentar el stock mínimo crea una necesidad nueva.
    if (supply.stock > supply.minimumStock && updated.stock <= updated.minimumStock) {
      try { await announceCommunityChange("supply"); }
      catch (error) { console.error("Aviso de insumos no enviado:", error.message); }
    }
    return res.json({ success: true, supply: shapeAdmin(updated) });
  } catch (error) { return handleError(error, next); }
});

// Cantidad actualizada de forma ATÓMICA: dos admins no pueden descontar de más.
router.post("/admin/:id/movements", ADMIN, validateRequestOrigin, async (req, res, next) => {
  try {
    if (!validId(req.params.id)) throw fail(400, "Identificador inválido");
    const { type, quantity } = req.body || {};
    if (!["income", "expense"].includes(type) || !integer(quantity, 1, 10000)) throw fail(400, "Movimiento o cantidad inválidos");
    const entry = { type, quantity, by: req.user._id, at: new Date() };
    const filter = { _id: req.params.id };
    if (type === "expense") filter.stock = { $gte: quantity };
    else filter.stock = { $lte: 1000000 - quantity };
    const update = {
      $inc: { stock: type === "income" ? quantity : -quantity, __v: 1 },
      $set: { updatedBy: req.user._id },
      $push: { movements: { $each: [entry], $slice: -MAX_MOVEMENTS } },
    };
    const supply = await BasicSupply.findOneAndUpdate(filter, update, { new: true });
    if (!supply) throw fail(409, "No se pudo registrar el movimiento: revisa las existencias disponibles");
    // Solo notificamos el tránsito de stock suficiente a insuficiente.
    const previousStock = type === "expense" ? supply.stock + quantity : supply.stock - quantity;
    if (previousStock > supply.minimumStock && supply.stock <= supply.minimumStock) {
      try { await announceCommunityChange("supply"); }
      catch (error) { console.error("Aviso de stock bajo no enviado:", error.message); }
    }
    return res.json({ success: true, supply: shapeAdmin(supply) });
  } catch (error) { return next(error); }
});

// El borrado es definitivo: el registro solo se elimina si no quedan promesas.
router.delete("/admin/:id", ADMIN, validateRequestOrigin, async (req, res, next) => {
  try {
    if (!validId(req.params.id)) throw fail(400, "Identificador inválido");
    const current = await BasicSupply.findById(req.params.id).select("pledges __v").lean();
    if (!current) throw fail(404, "El insumo ya no existe");
    if ((current.pledges || []).length) throw fail(409, "Primero debes resolver los compromisos de los miembros");
    await deleteResourceWithAudit({
      model: BasicSupply, resourceId: req.params.id,
      resourceType: "basic_supply", deletedBy: req.user._id,
      onDelete: async ({ deleted }) => {
        // La comprobación dentro de la transacción evita eliminar promesas nuevas.
        if ((deleted.pledges || []).length) throw fail(409, "Hay colaboraciones pendientes. No se eliminó el insumo");
      },
    });
    return res.json({ success: true, message: "Insumo eliminado y registrado en el historial" });
  } catch (error) { return next(error); }
});

// ---------------------------------------------------------
// MIEMBROS: reservar o retirar UNA promesa por insumo.
// ---------------------------------------------------------
router.post("/:id/commitment", authorizeRoles("member", "admin", "super_admin"), validateRequestOrigin, async (req, res, next) => {
  try {
    if (!validId(req.params.id)) throw fail(400, "Insumo inválido");
    const quantity = req.body?.quantity;
    if (!integer(quantity, 1, 500)) throw fail(400, "Ingresa una cantidad válida");
    const member = req.user._id;
    // Comparamos en una sola escritura el mínimo, stock y cantidades prometidas.
    // No necesitamos un tercer campo de stock objetivo.
    const pledged = { $sum: { $map: { input: { $ifNull: ["$pledges", []] }, as: "p", in: "$$p.quantity" } } };
    const remaining = { $subtract: [{ $add: ["$minimumStock", 1] }, { $add: ["$stock", pledged] }] };
    const supply = await BasicSupply.findOneAndUpdate({
      _id: req.params.id,
      "pledges.member": { $ne: member },
      $expr: { $and: [
        { $lte: ["$stock", "$minimumStock"] },
        { $gte: [remaining, quantity] },
        { $lt: [{ $size: { $ifNull: ["$pledges", []] } }, MAX_PLEDGES] },
      ] },
    }, {
      $push: { pledges: { member, quantity, createdAt: new Date() } }, $inc: { __v: 1 },
    }, { new: true });
    if (!supply) throw fail(409, "No quedan unidades disponibles para comprometer o ya estás anotado. Actualiza la página");
    return res.json({ success: true, supply: shapeMember(supply, member) });
  } catch (error) { return next(error); }
});

router.delete("/:id/commitment", authorizeRoles("member", "admin", "super_admin"), validateRequestOrigin, async (req, res, next) => {
  try {
    if (!validId(req.params.id)) throw fail(400, "Insumo inválido");
    const member = req.user._id;
    const supply = await BasicSupply.findOneAndUpdate(
      { _id: req.params.id, "pledges.member": member },
      { $pull: { pledges: { member } }, $inc: { __v: 1 } }, { new: true }
    );
    if (!supply) throw fail(409, "No encontramos un compromiso activo para cancelar");
    return res.json({ success: true, supply: shapeMember(supply, member) });
  } catch (error) { return next(error); }
});

// El administrador confirma una ENTREGA, recién entonces aumenta el stock.
router.post("/admin/:id/commitments/:memberId/deliver", ADMIN, validateRequestOrigin, async (req, res, next) => {
  try {
    if (!validId(req.params.id) || !validId(req.params.memberId)) throw fail(400, "Identificador inválido");
    const member = new mongoose.Types.ObjectId(req.params.memberId);
    const current = await BasicSupply.findOne({ _id: req.params.id, "pledges.member": member }).lean();
    const pledge = current?.pledges?.find((p) => String(p.member) === req.params.memberId);
    if (!pledge) throw fail(409, "La colaboración ya no está pendiente");
    const supply = await BasicSupply.findOneAndUpdate({
      _id: req.params.id, __v: current.__v, "pledges.member": member,
      stock: { $lte: 1000000 - pledge.quantity },
    }, {
      $pull: { pledges: { member } },
      $inc: { stock: pledge.quantity, __v: 1 },
      $set: { updatedBy: req.user._id },
      $push: { movements: { $each: [{ type: "delivered", quantity: pledge.quantity, by: req.user._id, at: new Date() }], $slice: -MAX_MOVEMENTS } },
    }, { new: true });
    if (!supply) throw fail(409, "El insumo cambió. Actualiza la página antes de confirmar la entrega");
    return res.json({ success: true, supply: shapeAdmin(supply) });
  } catch (error) { return next(error); }
});

export default router;
