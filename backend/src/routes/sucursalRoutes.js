
// =========================================================
// GESTIÓN DE SUCURSALES — RUTAS Y CONTROLADORES
// =========================================================
// Solo el superadministrador puede administrar sedes.
// La ruta no asigna usuarios a sucursales; esa lógica será
// un módulo posterior con validaciones propias.

import { Router } from "express";
import mongoose from "mongoose";
import Sucursal from "../models/Sucursal.js";
import User from "../models/User.js";
import { createRequire } from "node:module";
const requireJson = createRequire(import.meta.url);
const chileLocations = requireJson("../data/locations/chileLocations.json");
import authenticateUser from "../middleware/authenticateUser.js";
import authorizeRoles from "../middleware/authorizeRoles.js";

const router = Router();

// Nunca aceptamos isHeadquarters, isActive, _id ni campos
// de auditoría en las operaciones de edición general.
const EDITABLE_FIELDS = ["name", "address", "contactEmail", "contactPhone"];
const ADDRESS_FIELDS = ["street", "number", "sector", "city", "region"];

// Protegemos todas las rutas, incluso las de lectura.
router.use(authenticateUser, authorizeRoles("super_admin"));

// Evita cambios efectuados desde un origen web ajeno cuando
// el navegador utiliza la cookie de autenticación.
// Complementa, pero no sustituye una estrategia CSRF global.
function validateWriteOrigin(req, res, next) {
  try {
    const allowed = new URL(process.env.FRONTEND_URL || "http://localhost:3000").origin;
    const origin = req.get("Origin") || (req.get("Referer") ? new URL(req.get("Referer")).origin : null);
    if (origin !== allowed) {
      return res.status(403).json({ success: false, message: "No pudimos comprobar que la solicitud venga de la plataforma." });
    }
  } catch {
    return res.status(403).json({ success: false, message: "No pudimos comprobar el origen de esta solicitud." });
  }
  return next();
}

function badRequest(res, message) {
  return res.status(400).json({ success: false, message });
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value) &&
    (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
}

function validateBody(req, res, next) {
  if (!req.is("application/json") || !isPlainObject(req.body)) {
    return badRequest(res, "Envía un objeto JSON válido");
  }
  return next();
}

function validateString(value, field, min, max, required = true) {
  if (typeof value !== "string") throw new Error(`${field} debe ser texto`);
  const trimmed = value.trim();
  if ((required && trimmed.length < min) || trimmed.length > max) {
    throw new Error(`${field} debe contener ${required ? `entre ${min} y ${max}` : `hasta ${max}`} caracteres`);
  }
  return trimmed;
}

function sanitizeEditableFields(body, { create = false } = {}) {
  const fields = Object.keys(body);
  if (!fields.length || fields.some((field) => !EDITABLE_FIELDS.includes(field))) {
    throw new Error("La solicitud contiene campos vacíos o no permitidos");
  }
  if (create && ["name", "address"].some((field) => !Object.hasOwn(body, field))) {
    throw new Error("Completa el nombre y la dirección de la sucursal.");
  }

  const result = {};
  if (Object.hasOwn(body, "name")) result.name = validateString(body.name, "Nombre", 3, 150);
  if (Object.hasOwn(body, "contactEmail")) {
    const email = validateString(body.contactEmail, "Correo", 0, 150, false).toLowerCase();
    if (email && !/^[a-z0-9.!#$%&'*+\/=?^_`{|}~-]+@gmail\.com$/i.test(email)) throw new Error("Ingresa un correo que termine en @gmail.com.");
    result.contactEmail = email;
  }
  if (Object.hasOwn(body, "contactPhone")) {
    const phone = validateString(body.contactPhone, "Teléfono", 0, 30, false);
    if (phone && !/^\+569\d{8}$/.test(phone)) throw new Error("Ingresa un celular chileno con +56 9 y ocho números.");
    result.contactPhone = phone;
  }
  if (Object.hasOwn(body, "address")) {
    if (!isPlainObject(body.address) ||
        Object.keys(body.address).some((field) => !ADDRESS_FIELDS.includes(field))) {
      throw new Error("La dirección debe ser un objeto con campos autorizados");
    }
    // Para un PATCH parcial, conservamos por separado los subcampos
    // existentes usando notación de puntos al actualizar MongoDB.
    const address = {};
    for (const field of ADDRESS_FIELDS) {
      if (Object.hasOwn(body.address, field)) {
        const required = field !== "sector";
        address[field] = validateString(body.address[field], `Dirección: ${field}`, required ? 1 : 0,
          field === "number" ? 8 : 100, required);
        if (field === "number" && !/^\d{1,8}$/.test(address[field])) throw new Error("El número de calle debe contener solo dígitos (máximo 8).");
      }
    }
    if (!Object.keys(address).length) throw new Error("La dirección no puede estar vacía");
    if (create && ["street", "number", "city", "region"].some((field) => !Object.hasOwn(address, field))) {
      throw new Error("La nueva sucursal requiere calle, número, ciudad y región");
    }
    if (Object.hasOwn(address, "street") && !/^[\p{L}\p{M}0-9 .,#°ºª'\-/]{2,100}$/u.test(address.street)) throw new Error("Revisa el nombre de la calle: solo letras, números y signos habituales.");
    if (Object.hasOwn(address, "sector") && address.sector && !/^[\p{L}\p{M}0-9 .,#°ºª'\-/]{1,100}$/u.test(address.sector)) throw new Error("Revisa el sector o barrio.");
    if (Object.hasOwn(address, "region") && !Object.hasOwn(chileLocations, address.region)) throw new Error("Selecciona una región válida de Chile.");
    result.address = address;
  }
  return result;
}

function handleError(error, res, next) {
  if (error instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({ success: false, message: Object.values(error.errors).map((e) => e.message).join("; ") });
  }
  if (error?.code === 11000) {
    return res.status(409).json({ success: false, message: "Ya existe una sucursal con esos datos. Revisa el nombre e inténtalo nuevamente." });
  }
  return next(error);
}

function branchData(doc) {
  return {
    id: String(doc._id), code: doc.code, name: doc.name, slug: doc.slug,
    address: doc.address, contactEmail: doc.contactEmail, contactPhone: doc.contactPhone,
    timezone: doc.timezone, isHeadquarters: doc.isHeadquarters, isActive: doc.isActive,
    createdAt: doc.createdAt, updatedAt: doc.updatedAt,
  };
}

// Lista local de regiones y ciudades disponibles para seleccionar.
// La pantalla y el servidor usan exactamente los mismos nombres.
router.get("/locations", (_req, res) => {
  return res.status(200).json({ success: true, regions: chileLocations });
});

// Genera un nombre seguro para la URL interna, sin pedirle datos técnicos al usuario.
function toSlug(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 110) || "sucursal";
}

// Verifica que la ciudad elegida pertenezca a la región indicada.
function validateCityRegion(address) {
  if (!chileLocations[address?.region]?.includes(address?.city)) {
    throw new Error("Selecciona una ciudad de la región indicada.");
  }
}

// Calcula el siguiente código según el mayor número existente.
// El índice único de MongoDB evita duplicados al guardar en paralelo.
async function getNextBranchNumber() {
  const [result] = await Sucursal.aggregate([
    { $match: { code: /^SUC-\d+$/ } },
    { $project: { number: { $toInt: { $substrBytes: ["$code", 4, -1] } } } },
    { $group: { _id: null, max: { $max: "$number" } } },
  ]);
  return (result?.max ?? 0) + 1;
}

// =========================================================
// GET /api/system/branches — LISTAR SUCURSALES
// =========================================================
router.get("/", async (_req, res, next) => {
  try {
    const branches = await Sucursal.find().sort({ isHeadquarters: -1, code: 1 }).lean();
    return res.status(200).json({ success: true, branches: branches.map(branchData) });
  } catch (error) { return next(error); }
});

// =========================================================
// GET /api/system/branches/:id — VER DETALLE
// =========================================================
router.get("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isObjectIdOrHexString(req.params.id)) return badRequest(res, "Identificador de sucursal inválido");
    const branch = await Sucursal.findById(req.params.id).lean();
    if (!branch) return res.status(404).json({ success: false, message: "Sucursal no encontrada" });
    return res.status(200).json({ success: true, branch: branchData(branch) });
  } catch (error) { return next(error); }
});

// =========================================================
// POST /api/system/branches — CREAR SEDE
// =========================================================
// El sistema asigna un código único y crea la dirección interna automáticamente.
router.post("/", validateWriteOrigin, validateBody, async (req, res, next) => {
  try {
    const validated = sanitizeEditableFields(req.body, { create: true });
    validateCityRegion(validated.address);

    // Si dos solicitudes llegan juntas, el índice único decide cuál se guarda.
    // La que encuentre el código ocupado vuelve a calcular el siguiente.
    for (let attempt = 0; attempt < 12; attempt += 1) {
      const number = await getNextBranchNumber();
      const code = `SUC-${String(number).padStart(3, "0")}`;
      const slug = `${toSlug(validated.name)}-${code.toLowerCase()}`;
      try {
        const branch = await Sucursal.create({
          ...validated,
          code,
          slug,
          isHeadquarters: false,
          isActive: true,
          address: { country: "Chile", sector: "", ...validated.address },
          timezone: "America/Santiago",
        });
        return res.status(201).json({ success: true, message: "Sucursal registrada correctamente.", branch: branchData(branch) });
      } catch (error) {
        if (error?.code === 11000) continue;
        throw error;
      }
    }
    return res.status(409).json({ success: false, message: "No pudimos reservar un código. Intenta nuevamente." });
  } catch (error) {
    if (error instanceof Error && !(error instanceof mongoose.Error) && !error.code) return badRequest(res, error.message);
    return handleError(error, res, next);
  }
});

// =========================================================
// PATCH /api/system/branches/:id — EDITAR DATOS
// =========================================================
router.patch("/:id", validateWriteOrigin, validateBody, async (req, res, next) => {
  try {
    if (!mongoose.isObjectIdOrHexString(req.params.id)) return badRequest(res, "Identificador inválido");
    const validated = sanitizeEditableFields(req.body);
    if (validated.address) {
      const existing = await Sucursal.findById(req.params.id).lean();
      if (!existing) return res.status(404).json({ success: false, message: "Sucursal no encontrada." });
      validateCityRegion({ ...existing.address, ...validated.address });
    }
    const changes = { ...validated };
    if (validated.address) {
      delete changes.address;
      for (const [field, value] of Object.entries(validated.address)) {
        changes[`address.${field}`] = value;
      }
    }
    const branch = await Sucursal.findByIdAndUpdate(
      req.params.id, { $set: changes }, { new: true, runValidators: true }
    );
    if (!branch) return res.status(404).json({ success: false, message: "Sucursal no encontrada" });
    return res.status(200).json({ success: true, message: "Sucursal actualizada", branch: branchData(branch) });
  } catch (error) {
    if (error instanceof Error && !(error instanceof mongoose.Error) && !error.code) return badRequest(res, error.message);
    return handleError(error, res, next);
  }
});

// =========================================================
// PATCH /api/system/branches/:id/status — ACTIVAR / DESACTIVAR
// =========================================================
router.patch("/:id/status", validateWriteOrigin, validateBody, async (req, res, next) => {
  try {
    if (!mongoose.isObjectIdOrHexString(req.params.id)) return badRequest(res, "Identificador inválido");
    if (Object.keys(req.body).length !== 1 || typeof req.body.isActive !== "boolean") {
      return badRequest(res, "Envía exclusivamente isActive como booleano");
    }
    const branch = await Sucursal.findById(req.params.id);
    if (!branch) return res.status(404).json({ success: false, message: "Sucursal no encontrada" });
    if (!req.body.isActive) {
      if (branch.isHeadquarters) {
        return res.status(409).json({ success: false, message: "No se puede desactivar la sede principal" });
      }
      // Regla conservadora: nunca desactivamos una sede asignada
      // a usuarios, porque podría invalidar sesiones y relaciones.
      const assigned = await User.exists({
        $or: [{ sucursales: branch._id }, { sucursalPrincipal: branch._id }],
      });
      if (assigned) {
        return res.status(409).json({ success: false, message: "La sucursal tiene usuarios asignados. Reasígnalos antes de desactivarla" });
      }
    }
    branch.isActive = req.body.isActive;
    await branch.save();
    return res.status(200).json({ success: true, message: branch.isActive ? "Sucursal activada" : "Sucursal desactivada", branch: branchData(branch) });
  } catch (error) { return handleError(error, res, next); }
});

export default router;



