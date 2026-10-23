import { Router } from "express";
import SystemSettings from "../models/SystemSettings.js";
import authenticateUser from "../middleware/authenticateUser.js";
import authorizeRoles from "../middleware/authorizeRoles.js";

const router = Router();

const DEFAULT_GENERAL = Object.freeze({
  institutionalName: "Iglesia El Ancla Comunidad Cristiana",
  publicName: "Iglesia El Ancla",
  description: "",
  contactEmail: "",
  contactPhone: "",
});

const ALLOWED_FIELDS = Object.keys(DEFAULT_GENERAL);

// Impide que un navegador de otro origen realice cambios usando la cookie.
// Es una defensa adicional; una implementación CSRF por token puede añadirse globalmente.
function validateWriteOrigin(req, res, next) {
  const configuredOrigin = process.env.FRONTEND_URL || "http://localhost:3000";
  const origin = req.get("Origin");
  const referer = req.get("Referer");

  // Para operaciones con cookies exigimos evidencia de origen del navegador.
  let requesterOrigin;
  try {
    requesterOrigin = origin || (referer ? new URL(referer).origin : null);
    if (requesterOrigin !== new URL(configuredOrigin).origin) {
      return res.status(403).json({ success: false, message: "Origen de solicitud no autorizado" });
    }
  } catch {
    return res.status(403).json({ success: false, message: "Origen de solicitud no válido" });
  }
  return next();
}

function publicData(doc) {
  return {
    institutionalName: doc.institutionalName,
    publicName: doc.publicName,
    description: doc.description,
    contactEmail: doc.contactEmail,
    contactPhone: doc.contactPhone,
    updatedAt: doc.updatedAt || null,
  };
}

// La autenticación siempre precede a la autorización de rol.
router.use(authenticateUser, authorizeRoles("super_admin"));

// GET /api/system/settings/general
router.get("/general", async (_req, res, next) => {
  try {
    const current = await SystemSettings.findOne({ key: "general" }).lean();
    return res.status(200).json({
      success: true,
      configured: Boolean(current),
      settings: current ? publicData(current) : { ...DEFAULT_GENERAL, updatedAt: null },
    });
  } catch (error) {
    return next(error);
  }
});

// PATCH /api/system/settings/general
router.patch("/general", validateWriteOrigin, async (req, res, next) => {
  try {
    if (!req.is("application/json") || !req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      return res.status(400).json({ success: false, message: "Se requiere un objeto JSON" });
    }

    const incomingKeys = Object.keys(req.body);
    if (!incomingKeys.length || incomingKeys.some((key) => !ALLOWED_FIELDS.includes(key))) {
      return res.status(400).json({ success: false, message: "La solicitud contiene campos vacíos o no permitidos" });
    }

    const updates = {};
    for (const key of incomingKeys) {
      if (typeof req.body[key] !== "string") {
        return res.status(400).json({ success: false, message: `El campo ${key} debe ser texto` });
      }
      updates[key] = req.body[key].trim();
    }

    if (updates.institutionalName !== undefined && (updates.institutionalName.length < 3 || updates.institutionalName.length > 150)) {
      return res.status(400).json({ success: false, message: "El nombre institucional debe contener entre 3 y 150 caracteres" });
    }
    if (updates.publicName !== undefined && (updates.publicName.length < 2 || updates.publicName.length > 100)) {
      return res.status(400).json({ success: false, message: "El nombre público debe contener entre 2 y 100 caracteres" });
    }
    if (updates.description !== undefined && updates.description.length > 600) {
      return res.status(400).json({ success: false, message: "La descripción no puede superar 600 caracteres" });
    }
    if (updates.contactEmail !== undefined) {
      updates.contactEmail = updates.contactEmail.toLowerCase();
      if (updates.contactEmail.length > 150 || (updates.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.contactEmail))) {
        return res.status(400).json({ success: false, message: "El correo institucional no es válido" });
      }
    }
    if (updates.contactPhone !== undefined && (updates.contactPhone.length > 30 || (updates.contactPhone && !/^\+?[0-9\s()-]{7,30}$/.test(updates.contactPhone)))) {
      return res.status(400).json({ success: false, message: "El teléfono institucional no es válido" });
    }

    const saved = await SystemSettings.findOneAndUpdate(
      { key: "general" },
      {
        $set: { ...updates, updatedBy: req.user._id },
        $setOnInsert: { key: "general" },
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({ success: true, message: "Configuración institucional actualizada", settings: publicData(saved) });
  } catch (error) {
    return next(error);
  }
});

export default router;
