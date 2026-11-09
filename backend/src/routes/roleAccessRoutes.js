// Consulta protegida del inventario de autorización de El Ancla.
// Esta ruta es de SOLO LECTURA: no concede ni modifica privilegios.
import { Router } from "express";
import User from "../models/User.js";
import authenticateUser from "../middleware/authenticateUser.js";
import authorizeRoles from "../middleware/authorizeRoles.js";

const router = Router();
router.use(authenticateUser, authorizeRoles("super_admin"));

// Roles definidos en User.js y utilizados por authorizeRoles.js.
const roles = [
  { id: "member", name: "Miembro", description: "Accede a su cuenta y a los servicios habilitados para miembros.", scope: "Cuenta personal", level: 1, protected: false },
  { id: "admin", name: "Administrador", description: "Puede organizar contenidos y apoyar a los miembros de las sedes que tenga asignadas.", scope: "Administración autorizada", level: 2, protected: false },
  { id: "super_admin", name: "Superadministrador", description: "Puede administrar la configuración general de la plataforma y las cuentas autorizadas.", scope: "Administración global", level: 3, protected: true },
];

// Inventario contrastado con rutas del proyecto a 08-11-2026.
// Cada fila representa una operación concreta, NO una autorización dinámica
// por documento: pueden existir restricciones adicionales por propietario,
// sucursal, estado y validaciones de negocio dentro del controlador.
const permissions = [
  { id: "own-profile", category: "Cuenta personal", name: "Consultar perfil propio", description: "Ver sus propios datos de cuenta.", roles: { member: true, admin: true, super_admin: true } },
  { id: "own-profile-edit", category: "Cuenta personal", name: "Editar perfil propio", description: "Actualizar la información de su propia cuenta.", roles: { member: true, admin: true, super_admin: true } },
  { id: "events-public", category: "Comunidad", name: "Consultar eventos públicos", description: "Revisar las actividades abiertas a toda la comunidad, incluso sin iniciar sesión.", roles: { member: true, admin: true, super_admin: true } },
  { id: "events-manage", category: "Comunidad", name: "Gestionar eventos", description: "Crear, actualizar y organizar actividades, según las responsabilidades asignadas.", roles: { member: false, admin: true, super_admin: true } },
  { id: "prayers-own", category: "Comunidad", name: "Gestionar peticiones propias", description: "Consultar y administrar sus propias peticiones de oración.", roles: { member: true, admin: true, super_admin: true } },
  { id: "prayers-admin", category: "Comunidad", name: "Administrar peticiones de oración", description: "Revisar y gestionar las peticiones que estén a cargo del equipo autorizado.", roles: { member: false, admin: true, super_admin: true } },
  { id: "resources-view", category: "Contenidos", name: "Consultar recursos", description: "Consultar los materiales y contenidos disponibles para su cuenta.", roles: { member: true, admin: true, super_admin: true } },
  { id: "resources-manage", category: "Contenidos", name: "Administrar recursos", description: "Publicar y actualizar los contenidos asignados a la administración.", roles: { member: false, admin: true, super_admin: true } },
  { id: "members-view", category: "Usuarios", name: "Consultar miembros de sucursal", description: "Consultar los miembros de las sedes para las que tenga autorización.", roles: { member: false, admin: true, super_admin: true } },
  { id: "members-register", category: "Usuarios", name: "Registrar miembros por invitación", description: "Invitar a nuevos miembros. Cada administrador solo puede invitarlos a las sedes que administra.", roles: { member: false, admin: true, super_admin: true } },
  { id: "users-global", category: "Usuarios", name: "Listar y editar cuentas globalmente", description: "Consultar y actualizar cuentas de la plataforma. La cuenta de superadministrador está protegida.", roles: { member: false, admin: false, super_admin: true } },
  { id: "expenses-view", category: "Finanzas", name: "Consultar gastos", description: "Consultar los gastos registrados por la iglesia.", roles: { member: false, admin: true, super_admin: true } },
  { id: "expenses-manage", category: "Finanzas", name: "Gestionar gastos", description: "Registrar, corregir o eliminar gastos según las autorizaciones vigentes.", roles: { member: false, admin: true, super_admin: true } },
  { id: "incomes-manage", category: "Finanzas", name: "Gestionar ingresos", description: "Registrar y actualizar los ingresos de la iglesia.", roles: { member: false, admin: true, super_admin: true } },
  { id: "system-settings", category: "Sistema", name: "Configurar información institucional", description: "Consultar y actualizar la información general de la iglesia.", roles: { member: false, admin: false, super_admin: true } },
  { id: "role-audit", category: "Sistema", name: "Consultar este inventario de accesos", description: "Revisar los tipos de cuenta y las funciones disponibles para cada uno.", roles: { member: false, admin: false, super_admin: true } },
];

router.get("/", async (_req, res, next) => {
  try {
    // Evitamos almacenar en caché información sobre roles y cuentas.
    res.set("Cache-Control", "no-store");

    // Los recuentos proceden de MongoDB, sin paginar ni inventar datos.
    const result = await User.aggregate([
      { $group: { _id: "$role", total: { $sum: 1 }, active: { $sum: { $cond: [{ $eq: ["$isActive", false] }, 0, 1] } } } },
    ]);
    const roleCounts = Object.fromEntries(roles.map((role) => [role.id, { total: 0, active: 0 }]));
    result.forEach((item) => {
      if (Object.hasOwn(roleCounts, item._id)) roleCounts[item._id] = { total: item.total, active: item.active };
    });

    return res.status(200).json({
      success: true,
      data: {
        roles,
        permissions,
        counts: roleCounts,
        summary: {
          totalRoles: roles.length,
          totalPermissions: permissions.length,
          protectedRoles: roles.filter((role) => role.protected).length,
          totalAccounts: Object.values(roleCounts).reduce((sum, value) => sum + value.total, 0),
        },
        scopeNote: "Esta tabla muestra los accesos generales. Algunas funciones pueden requerir autorizaciones adicionales para proteger información privada.",
      },
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
