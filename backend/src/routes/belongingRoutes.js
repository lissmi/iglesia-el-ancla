// =========================================================
// API DEL INVENTARIO DE BIENES - EL ANCLA
// Un router. No usamos controllers ni servicios redundantes.
// Solo administradores pueden leer o modificar este inventario.
// =========================================================
import { Router } from "express";
import mongoose from "mongoose";
import Belonging, { BelongingMovement, BELONGING_CATEGORIES, BELONGING_CONDITIONS } from "../models/Belonging.js";
import authenticateUser from "../middleware/authenticateUser.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import validateRequestOrigin from "../middleware/validateRequestOrigin.js";
import { deleteResourceWithAudit } from "../services/audit/deletionService.js";

const router = Router();
router.use(authenticateUser, authorizeRoles("admin", "super_admin"));
const invalidId = (id) => !mongoose.isObjectIdOrHexString(id);
const fail = (status, message) => Object.assign(new Error(message), { status });
const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
const validQuantity = (value) => Number.isSafeInteger(value) && value >= 1 && value <= 100000;
const getToday = () => {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Santiago", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const part = (type) => parts.find((value) => value.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
};
const validDate = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() + 1 === month && date.getUTCDate() === day;
};
const shapeBelonging = (doc) => {
  const item = doc.toObject ? doc.toObject() : doc;
  return { ...item, id: String(item._id), code: `BIEN-${String(item._id).slice(-8).toUpperCase()}` };
};
const shapeMovement = (doc) => {
  const item = doc.toObject ? doc.toObject() : doc;
  const by = item.by;
  const performer = by && typeof by === "object" && by.firstName
    ? [by.firstName, by.lastName].filter(Boolean).join(" ")
    : "Administrador";
  return {
    ...item, id: String(item._id), belongingId: String(item.belongingId),
    performedBy: performer,
  };
};

// Validamos la lista exacta de campos: no admitimos ubicación/adquisición/responsable.
function readBelonging(body, editing = false) {
  const allowed = ["name", "categoryId", "quantity", "condition", "description", ...(editing ? ["expectedVersion"] : [])];
  if (!body || typeof body !== "object" || Array.isArray(body) || Object.keys(body).some((key) => !allowed.includes(key))) {
    throw fail(400, "El formulario contiene datos no permitidos");
  }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  if (name.length < 2 || name.length > 120) throw fail(400, "El nombre debe tener entre 2 y 120 caracteres");
  if (!BELONGING_CATEGORIES.includes(body.categoryId)) throw fail(400, "Selecciona una categoría válida");
  if (!BELONGING_CONDITIONS.includes(body.condition)) throw fail(400, "Selecciona un estado válido");
  // Todos los bienes se gestionan por unidades, sin tipos de control.
  if (!validQuantity(body.quantity)) {
    throw fail(400, "Indica una cantidad válida de unidades");
  }
  if (description.length > 1000) throw fail(400, "Las observaciones superan 1000 caracteres");
  if (editing && (!Number.isSafeInteger(body.expectedVersion) || body.expectedVersion < 0)) {
    throw fail(400, "Actualiza la página y vuelve a intentar guardar");
  }
  return { name, categoryId: body.categoryId, quantity: body.quantity, condition: body.condition, description };
}

// Un GET entrega el inventario y sus movimientos a las tres pantallas existentes.
router.get("/", async (_req, res, next) => {
  try {
    const [belongings, movements] = await Promise.all([
      Belonging.find().sort({ name: 1 }).lean(),
      BelongingMovement.find().sort({ date: -1, createdAt: -1 }).limit(1000)
        .populate("by", "firstName lastName").lean(),
    ]);
    return res.json({ success: true, belongings: belongings.map(shapeBelonging), movements: movements.map(shapeMovement) });
  } catch (error) { return next(error); }
});

// Crear el bien y su registro inicial juntos; si uno falla, no guardamos ninguno.
router.post("/", validateRequestOrigin, async (req, res, next) => {
  try {
    const data = readBelonging(req.body);
    const created = await mongoose.connection.transaction(async (session) => {
      const [item] = await Belonging.create([{ ...data, createdBy: req.user._id }], { session });
      await BelongingMovement.create([{
        belongingId: item._id, type: "registration", quantity: item.quantity,
        date: getToday(), description: "Registro inicial del bien", by: req.user._id,
      }], { session });
      return item;
    });
    return res.status(201).json({ success: true, belonging: shapeBelonging(created) });
  } catch (error) { return next(error); }
});

// Editar también registra un ajuste/inspección cuando cambian cantidad o estado.
router.put("/:id", validateRequestOrigin, async (req, res, next) => {
  try {
    if (invalidId(req.params.id)) throw fail(400, "Identificador inválido");
    const data = readBelonging(req.body, true);
    const modified = await mongoose.connection.transaction(async (session) => {
      const previous = await Belonging.findOneAndUpdate(
        { _id: req.params.id, __v: req.body.expectedVersion },
        { $set: { ...data, updatedBy: req.user._id }, $inc: { __v: 1 } },
        { new: false, session, runValidators: true }
      );
      if (!previous) throw fail(409, "El bien cambió o ya no existe. Actualiza e inténtalo nuevamente");
      const now = getToday();
      if (previous.quantity !== data.quantity) {
        await BelongingMovement.create([{
          belongingId: previous._id, type: "adjustment", quantity: Math.abs(data.quantity - previous.quantity),
          delta: data.quantity - previous.quantity, date: now,
          description: "Cantidad corregida desde el formulario", by: req.user._id,
        }], { session });
      }
      if (previous.condition !== data.condition) {
        await BelongingMovement.create([{
          belongingId: previous._id, type: "inspection", quantity: data.quantity,
          previousCondition: previous.condition, newCondition: data.condition,
          date: now, description: "Estado actualizado desde el formulario", by: req.user._id,
        }], { session });
      }
      return Belonging.findById(previous._id).session(session);
    });
    return res.json({ success: true, belonging: shapeBelonging(modified) });
  } catch (error) { return next(error); }
});

// El servicio de auditoría existente registra quién eliminó el bien.
// Los movimientos relacionados se eliminan en la misma transacción.
router.delete("/:id", validateRequestOrigin, async (req, res, next) => {
  try {
    if (invalidId(req.params.id)) throw fail(400, "Identificador inválido");
    await deleteResourceWithAudit({
      model: Belonging, resourceId: req.params.id, resourceType: "belonging",
      deletedBy: req.user._id,
      onDelete: ({ session, deleted }) => BelongingMovement.deleteMany({ belongingId: deleted._id }, { session }),
    });
    return res.json({ success: true, message: "Bien eliminado definitivamente" });
  } catch (error) { return next(error); }
});

// Registrar inspecciones y ajustes del inventario.
router.post("/movements", validateRequestOrigin, async (req, res, next) => {
  try {
    const { belongingId, type, description = "", newCondition, delta } = req.body ?? {};
    if (invalidId(belongingId)) throw fail(400, "Selecciona un bien válido");
    if (!["inspection", "adjustment"].includes(type)) throw fail(400, "Selecciona un movimiento válido");
    if (typeof description !== "string" || description.trim().length > 1000) throw fail(400, "Las observaciones son inválidas");
    if (type === "inspection" && !BELONGING_CONDITIONS.includes(newCondition)) throw fail(400, "Selecciona un estado válido");
    if (type === "adjustment" && (!Number.isSafeInteger(delta) || delta === 0 || Math.abs(delta) > 100000)) throw fail(400, "Indica una cantidad entera distinta de cero");
    const newMovement = await mongoose.connection.transaction(async (session) => {
      const belonging = await Belonging.findById(belongingId).session(session);
      if (!belonging) throw fail(404, "El bien ya no existe");
      const previousCondition = belonging.condition;
      if (type === "adjustment") {
        if (belonging.quantity + delta < 1 || belonging.quantity + delta > 100000) throw fail(409, "El ajuste dejaría una cantidad inválida");
        belonging.quantity += delta;
      } else {
        belonging.condition = newCondition;
      }
      belonging.updatedBy = req.user._id;
      await belonging.save({ session });
      const [movement] = await BelongingMovement.create([{
        belongingId: belonging._id, type, quantity: type === "adjustment" ? Math.abs(delta) : belonging.quantity,
        delta: type === "adjustment" ? delta : 0,
        ...(type === "inspection" ? { previousCondition } : {}),
        ...(type === "inspection" ? { newCondition } : {}),
        date: getToday(), description: description.trim(), by: req.user._id,
      }], { session });
      return movement;
    });
    return res.status(201).json({ success: true, movement: shapeMovement(newMovement) });
  } catch (error) { return next(error); }
});

// El historial puede corregir fecha y observación, pero no alterar stock de forma retroactiva.
router.put("/movements/:id", validateRequestOrigin, async (req, res, next) => {
  try {
    if (invalidId(req.params.id)) throw fail(400, "Identificador inválido");
    const { date, description } = req.body ?? {};
    if (!validDate(date) || typeof description !== "string" || description.trim().length > 1000) throw fail(400, "Fecha u observación inválida");
    const doc = await BelongingMovement.findByIdAndUpdate(req.params.id,
      { $set: { date, description: description.trim(), updatedBy: req.user._id } }, { new: true, runValidators: true });
    if (!doc) throw fail(404, "El movimiento ya no existe");
    return res.json({ success: true, movement: shapeMovement(doc) });
  } catch (error) { return next(error); }
});

// Quitar una entrada del historial NO revierte cambios de cantidad o estado ya registrados.
router.delete("/movements/:id", validateRequestOrigin, async (req, res, next) => {
  try {
    if (invalidId(req.params.id)) throw fail(400, "Identificador inválido");
    const doc = await BelongingMovement.findOneAndDelete({ _id: req.params.id });
    if (!doc) throw fail(404, "El movimiento ya no existe");
    return res.json({ success: true });
  } catch (error) { return next(error); }
});

export default router;
