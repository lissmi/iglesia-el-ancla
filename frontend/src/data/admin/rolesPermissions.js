
/* =========================================================
   ROLES Y PERMISOS - CONFIGURACIÓN VISUAL
   ========================================================= */

// Roles existentes en el modelo User de MongoDB.

export const SYSTEM_ROLES = [
  {
    id: "member",
    name: "Miembro",
    description:
      "Participa en las actividades de la iglesia y accede a los servicios habilitados para miembros registrados.",
    scope: "Personal",
    level: 1,
    protected: false,
  },
  {
    id: "admin",
    name: "Administrador",
    description:
      "Gestiona las actividades y la información administrativa de las sucursales que tenga autorizadas.",
    scope: "Sucursales autorizadas",
    level: 2,
    protected: false,
  },
  {
    id: "super_admin",
    name: "Superadministrador",
    description:
      "Supervisa la administración general y controla las funciones sensibles del sistema.",
    scope: "Administración global",
    level: 3,
    protected: true,
  },
];

/*
 * Matriz de referencia para diseñar la autorización.
 *
 * true  = permiso propuesto.
 * false = permiso no contemplado para ese rol.
 *
 * IMPORTANTE:
 * Esta configuración NO concede permisos reales.
 * El backend deberá implementar y verificar
 * cada operación antes de habilitarla.
 */

export const SYSTEM_PERMISSIONS = [
  {
    id: "profile",
    category: "Cuenta personal",
    name: "Consultar perfil propio",
    description: "Visualizar los datos de la propia cuenta.",
    roles: {
      member: true,
      admin: true,
      super_admin: true,
    },
  },
  {
    id: "events-view",
    category: "Comunidad",
    name: "Consultar eventos",
    description: "Consultar actividades y eventos disponibles.",
    roles: {
      member: true,
      admin: true,
      super_admin: true,
    },
  },
  {
    id: "events-manage",
    category: "Comunidad",
    name: "Administrar eventos",
    description: "Crear, editar y administrar actividades.",
    roles: {
      member: false,
      admin: true,
      super_admin: true,
    },
  },
  {
    id: "prayers-manage",
    category: "Comunidad",
    name: "Gestionar peticiones de oración",
    description: "Administrar solicitudes recibidas.",
    roles: {
      member: false,
      admin: true,
      super_admin: true,
    },
  },
  {
    id: "resources-view",
    category: "Contenidos",
    name: "Consultar recursos",
    description: "Acceder a los materiales disponibles.",
    roles: {
      member: true,
      admin: true,
      super_admin: true,
    },
  },
  {
    id: "resources-manage",
    category: "Contenidos",
    name: "Gestionar recursos",
    description: "Publicar y actualizar materiales.",
    roles: {
      member: false,
      admin: true,
      super_admin: true,
    },
  },
  {
    id: "users-view",
    category: "Usuarios",
    name: "Consultar usuarios",
    description: "Consultar las cuentas autorizadas.",
    roles: {
      member: false,
      admin: true,
      super_admin: true,
    },
  },
  {
    id: "members-create",
    category: "Usuarios",
    name: "Registrar miembros",
    description: "Registrar nuevas cuentas de miembros.",
    roles: {
      member: false,
      admin: true,
      super_admin: true,
    },
  },
  {
    id: "administrators-manage",
    category: "Usuarios",
    name: "Administrar cuentas privilegiadas",
    description: "Gestionar cuentas administrativas.",
    roles: {
      member: false,
      admin: false,
      super_admin: true,
    },
  },
  {
    id: "expenses-view",
    category: "Finanzas",
    name: "Consultar gastos",
    description: "Consultar información financiera autorizada.",
    roles: {
      member: false,
      admin: false,
      super_admin: true,
    },
  },
  {
    id: "expenses-manage",
    category: "Finanzas",
    name: "Gestionar gastos",
    description: "Registrar y modificar gastos.",
    roles: {
      member: false,
      admin: false,
      super_admin: true,
    },
  },
  {
    id: "roles-view",
    category: "Sistema",
    name: "Consultar roles y permisos",
    description: "Revisar la matriz de autorización.",
    roles: {
      member: false,
      admin: false,
      super_admin: true,
    },
  },
  {
    id: "system-config",
    category: "Sistema",
    name: "Configurar el sistema",
    description: "Administrar parámetros sensibles.",
    roles: {
      member: false,
      admin: false,
      super_admin: true,
    },
  },
];

export const PERMISSION_CATEGORIES = [
  "Todas",
  ...new Set(
    SYSTEM_PERMISSIONS.map(
      (permission) => permission.category
    )
  ),
];
