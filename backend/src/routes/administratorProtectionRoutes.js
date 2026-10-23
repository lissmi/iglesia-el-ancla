// =========================================================
// CONSULTA DE PROTECCIÓN DE ADMINISTRADORES
// GET /api/system/administrator-protection
// =========================================================
// Esta ruta presenta información no sensible sobre
// los controles que hemos implementado o planificado.
// No permite crear, editar ni desactivar cuentas.

import { Router } from "express";

import authenticateUser from "../middleware/authenticateUser.js";
import authorizeRoles from "../middleware/authorizeRoles.js";

const router = Router();

// Exigimos una sesión válida y el rol super_admin
// para todas las rutas de este módulo.
router.use(authenticateUser, authorizeRoles("super_admin"));

router.get("/", (req, res) => {
  // Evitamos que navegadores y proxies almacenen
  // información de configuración administrativa.
  res.set("Cache-Control", "no-store");

  return res.status(200).json({
    success: true,
    protection: {
      // Roles que admite el modelo User.
      allowedRoles: ["member", "admin", "super_admin"],

      // El esquema exige una de estas posiciones para
      // super_admin y define un índice único parcial.
      superAdminSlots: {
        permitted: [1, 2],
        modelConstraintDefined: true,
        databaseIndexVerified: false,
      },

      // Las rutas globales de usuarios y la modificación
      // de sucursales están limitadas a super_admin.
      globalUsersRestrictedToSuperAdmin: true,
      branchAssignmentRestrictedToSuperAdmin: true,
      superAdminBranchAssignmentBlocked: true,

      // tokenVersion se utiliza para invalidar sesiones
      // tras modificar asignaciones de sucursales.
      sessionVersioning: {
        available: true,
        appliedOnBranchAssignmentChange: true,
        appliedOnRoleChange: false,
        appliedOnDeactivation: false,
      },

      // Estas operaciones todavía no están implementadas
      // como flujos administrativos seguros y auditables.
      operations: {
        createAdministrator: "pending",
        changeRole: "pending",
        deactivateAdministrator: "pending",
        privilegedAccountChanges: "pending",
        auditTrail: "pending",
      },
    },
  });
});

export default router;
