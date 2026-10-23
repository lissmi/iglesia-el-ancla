import { Router } from "express";
import mongoose from "mongoose";

import User from "../models/User.js";
import Sucursal from "../models/Sucursal.js";
import authenticateUser from "../middleware/authenticateUser.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import authorizeSucursal from "../middleware/authorizeSucursal.js";

// =========================================================
// ROUTER DE GESTIÓN DE USUARIOS
// =========================================================

const router = Router();

// Todas las rutas requieren una sesión auténtica.
// La autorización por rol se aplica después según la operación.
router.use(authenticateUser);

// Nunca se incluyen contraseñas, tokens ni campos internos.
const USER_PUBLIC_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "birthDate",
  "role",
  "sucursales",
  "sucursalPrincipal",
  "isActive",
  "deactivatedAt",
  "lastLoginAt",
  "createdAt",
  "updatedAt",
].join(" ");

const BRANCH_PUBLIC_FIELDS = "code name slug isActive";

// =========================================================
// VALIDACIÓN DE ORIGEN PARA ESCRITURAS CON COOKIES
// =========================================================
// Defensa complementaria contra CSRF. Debe complementarse
// con tokens CSRF en la integración de producción.
const requireTrustedOrigin = (req, res, next) => {
  const origin = req.get("Origin");
  const trustedOrigin = process.env.FRONTEND_URL || "http://localhost:3000";

  if (origin !== trustedOrigin) {
    return res.status(403).json({
      success: false,
      message: "Origen de la solicitud no autorizado",
    });
  }

  return next();
};

// =========================================================
// CONSULTAS LIMITADAS A LA SUCURSAL (ADMIN / SUPER_ADMIN)
// =========================================================
// Estas rutas son independientes del listado institucional.
// Solo exponen miembros de la sede verificada por el servidor.
// No incluyen cuentas admin ni super_admin.
// IMPORTANTE: deben ir antes de la restricción global super_admin.

const MEMBER_BRANCH_FIELDS = [
  "firstName", "lastName", "email", "phone",
  "role", "isActive", "sucursalPrincipal", "sucursales",
].join(" ");

// GET /api/users/branch/:sucursalId/stats
router.get(
  "/branch/:sucursalId/stats",
  authorizeRoles("admin", "super_admin"),
  authorizeSucursal(),
  async (req, res, next) => {
    try {
      const scope = { role: "member", sucursales: req.sucursal._id };
      const [totalUsers, activeUsers, inactiveUsers] = await Promise.all([
        User.countDocuments(scope),
        User.countDocuments({ ...scope, isActive: true }),
        User.countDocuments({ ...scope, isActive: false }),
      ]);

      return res.status(200).json({
        success: true,
        sucursal: {
          id: req.sucursal._id,
          code: req.sucursal.code,
          name: req.sucursal.name,
        },
        stats: { totalUsers, activeUsers, inactiveUsers },
      });
    } catch (error) {
      return next(error);
    }
  }
);

// GET /api/users/branch/:sucursalId?page=1&limit=20
router.get(
  "/branch/:sucursalId",
  authorizeRoles("admin", "super_admin"),
  authorizeSucursal(),
  async (req, res, next) => {
    try {
      const parsePositiveInteger = (value, fallback) => {
        if (value === undefined) return fallback;
        if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) return null;
        const parsed = Number(value);
        return Number.isSafeInteger(parsed) ? parsed : null;
      };

      const page = parsePositiveInteger(req.query.page, 1);
      const limit = parsePositiveInteger(req.query.limit, 20);
      if (page === null || limit === null || limit > 50 || page > 10000) {
        return res.status(400).json({
          success: false,
          message: "Parámetros de paginación no válidos",
        });
      }

      // El filtro se construye con req.sucursal, previamente autorizada.
      // Nunca se confía en un id de sucursal dentro del cuerpo o query.
      const scope = { role: "member", sucursales: req.sucursal._id };
      const [users, total] = await Promise.all([
        User.find(scope)
          .select(MEMBER_BRANCH_FIELDS)
          .sort({ createdAt: -1, _id: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        User.countDocuments(scope),
      ]);

      // Evitamos exponer el listado de otras sedes asignadas
      // al miembro: solo mostramos la sede desde la cual se consulta.
      const safeUsers = users.map(({ sucursales, sucursalPrincipal, ...user }) => ({
        ...user,
        sucursal: req.sucursal._id,
        isPrincipalHere: String(sucursalPrincipal) === String(req.sucursal._id),
      }));

      return res.status(200).json({
        success: true,
        sucursal: {
          id: req.sucursal._id,
          code: req.sucursal.code,
          name: req.sucursal.name,
        },
        users: safeUsers,
        count: safeUsers.length,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    } catch (error) {
      return next(error);
    }
  }
);

// Las operaciones institucionales existentes siguen siendo
// exclusivas del superadministrador.
router.use(authorizeRoles("super_admin"));

// =========================================================
// ESTADÍSTICAS DE USUARIOS
// GET /api/users/stats
// =========================================================
router.get("/stats", async (req, res, next) => {
  try {
    const [totalUsers, activeUsers, inactiveUsers, administrators] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isActive: true }),
        User.countDocuments({ isActive: false }),
        User.countDocuments({ role: "admin" }),
      ]);

    return res.status(200).json({
      success: true,
      stats: { totalUsers, activeUsers, inactiveUsers, administrators },
    });
  } catch (error) {
    return next(error);
  }
});

// =========================================================
// LISTADO DE USUARIOS
// GET /api/users
// =========================================================
router.get("/", async (req, res, next) => {
  try {
    const users = await User.find({})
      .select(USER_PUBLIC_FIELDS)
      .populate({ path: "sucursales", select: BRANCH_PUBLIC_FIELDS })
      .populate({ path: "sucursalPrincipal", select: BRANCH_PUBLIC_FIELDS })
      .sort({ createdAt: -1 })
      .limit(100);

    return res.status(200).json({
      success: true,
      users,
      count: users.length,
    });
  } catch (error) {
    return next(error);
  }
});

// =========================================================
// ACTUALIZAR ASIGNACIONES DE SUCURSALES
// PATCH /api/users/:id/sucursales
// =========================================================
// El cuerpo permitido es exclusivamente:
// {
//   "sucursales": ["<ObjectId sucursal>", ...],
//   "sucursalPrincipal": "<ObjectId sucursal>"
// }
// No actualiza roles, contraseñas ni otras propiedades.
router.patch("/:id/sucursales", requireTrustedOrigin, async (req, res, next) => {
  try {
    // Validamos identificador del usuario.
    if (!mongoose.isObjectIdOrHexString(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "El identificador del usuario no es válido",
      });
    }

    // Solo aceptamos los dos campos expresamente permitidos.
    const body = req.body;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return res.status(400).json({ success: false, message: "Datos inválidos" });
    }

    const fields = Object.keys(body);
    if (
      fields.length !== 2 ||
      !fields.includes("sucursales") ||
      !fields.includes("sucursalPrincipal")
    ) {
      return res.status(400).json({
        success: false,
        message: "Solo se permiten sucursales y sucursalPrincipal",
      });
    }

    const { sucursales, sucursalPrincipal } = body;

    if (
      !Array.isArray(sucursales) ||
      sucursales.length < 1 ||
      sucursales.length > 50 ||
      !sucursales.every((id) => typeof id === "string" && mongoose.isObjectIdOrHexString(id)) ||
      typeof sucursalPrincipal !== "string" ||
      !mongoose.isObjectIdOrHexString(sucursalPrincipal)
    ) {
      return res.status(400).json({
        success: false,
        message: "Debes indicar sucursales y una sede principal válidas",
      });
    }

    const ids = sucursales.map((id) => id.toLowerCase());
    const uniqueIds = [...new Set(ids)];

    if (uniqueIds.length !== ids.length) {
      return res.status(400).json({
        success: false,
        message: "No puedes repetir una sucursal en las asignaciones",
      });
    }

    if (!uniqueIds.includes(sucursalPrincipal.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "La sucursal principal debe estar entre las sucursales asignadas",
      });
    }

    // Buscamos el usuario, incluyendo tokenVersion para invalidar
    // sus sesiones anteriores cuando cambian las asignaciones.
    const user = await User.findById(req.params.id).select("+tokenVersion");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No se encontró el usuario",
      });
    }

    // Esta operación general no administra las cuentas privilegiadas.
    // Así evitamos modificar accidentalmente las sedes del super_admin.
    if (user.role === "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Las asignaciones del superadministrador requieren un procedimiento especial",
      });
    }

    // Todas las sucursales asignadas deben existir y estar activas.
    const activeBranches = await Sucursal.find({
      _id: { $in: uniqueIds },
      isActive: true,
    }).select("_id");

    if (activeBranches.length !== uniqueIds.length) {
      return res.status(400).json({
        success: false,
        message: "Una o más sucursales no existen o están inactivas",
      });
    }

    const previousIds = user.sucursales.map((id) => String(id)).sort();
    const nextIds = [...uniqueIds].sort();
    const principalChanged =
      String(user.sucursalPrincipal) !== sucursalPrincipal.toLowerCase();
    const assignmentsChanged =
      principalChanged || previousIds.join(",") !== nextIds.join(",");

    if (assignmentsChanged) {
      user.sucursales = uniqueIds;
      user.sucursalPrincipal = sucursalPrincipal;

      // Retiramos el acceso de sesiones anteriores, para que el usuario
      // deba iniciar sesión de nuevo con sus nuevas asignaciones.
      user.tokenVersion = (user.tokenVersion ?? 0) + 1;

      // save() ejecuta las validaciones propias de User.js.
      await user.save();
    }

    await user.populate([
      { path: "sucursales", select: BRANCH_PUBLIC_FIELDS },
      { path: "sucursalPrincipal", select: BRANCH_PUBLIC_FIELDS },
    ]);

    // No enviamos tokenVersion ni otros datos sensibles en la respuesta.
    const safeUser = await User.findById(user._id)
      .select(USER_PUBLIC_FIELDS)
      .populate({ path: "sucursales", select: BRANCH_PUBLIC_FIELDS })
      .populate({ path: "sucursalPrincipal", select: BRANCH_PUBLIC_FIELDS });

    return res.status(200).json({
      success: true,
      message: assignmentsChanged
        ? "Asignaciones actualizadas. Las sesiones anteriores del usuario fueron invalidadas."
        : "Las asignaciones no presentaban cambios",
      user: safeUser,
    });
  } catch (error) {
    if (error?.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Los datos de asignación no superaron las validaciones",
      });
    }
    return next(error);
  }
});

export default router;
