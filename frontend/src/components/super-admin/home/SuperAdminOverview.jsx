
import { Link } from "react-router-dom";

// =========================================================
// IMPORTACIÓN DE ICONOS
// =========================================================

import {
  ArrowRight,
  Settings,
  ShieldCheck,
  UserCog,
  UsersRound,
} from "lucide-react";

// =========================================================
// ESTILOS
// =========================================================

import "../../../styles/components/super-admin/home/SuperAdminOverview.css";

// =========================================================
// MÓDULOS DEL SUPERADMINISTRADOR
// =========================================================

// Estas tarjetas representan las herramientas
// disponibles desde el panel super_admin.
//
// Algunas funcionalidades son exclusivas,
// mientras que otras reutilizan componentes
// compartidos con el administrador normal.
//
// Cada módulo contiene:
//
// id: identificador único.
// title: título de la tarjeta.
// description: descripción de la funcionalidad.
// icon: icono correspondiente.
// path: ruta de navegación.
// available: indica si la página está implementada.

const superAdminModules = [

  // -------------------------------------------------------
  // GESTIÓN DE USUARIOS
  // -------------------------------------------------------

  {
    id: "users",

    title: "Gestión de usuarios",

    description:
      "Consulta las cuentas registradas, modifica su información y administra su estado dentro del sistema.",

    icon: UsersRound,

    path: "/super-admin/sistema/usuarios",

    available: true,
  },

  // -------------------------------------------------------
  // ADMINISTRADORES
  // -------------------------------------------------------

  {
    id: "administrators",

    title: "Administradores",

    description:
      "Consulta las cuentas administrativas, revisa sus roles, sucursales y estados dentro del sistema.",

    icon: ShieldCheck,

    // Ruta exclusiva del superadministrador.
    path: "/super-admin/sistema/administradores",

    available: true,
  },

  // -------------------------------------------------------
  // ROLES Y PERMISOS
  // -------------------------------------------------------

  {
    id: "roles",

    title: "Roles y permisos",

    description:
      "Consulta los niveles de acceso, responsabilidades y permisos asociados a cada rol del sistema.",

    icon: UserCog,

    // Ruta exclusiva del superadministrador.
    path: "/super-admin/sistema/roles-permisos",

    available: true,
  },

  // -------------------------------------------------------
  // CONFIGURACIÓN DEL SISTEMA
  // -------------------------------------------------------

  {
    id: "settings",

    title: "Configuración",

    description:
      "Consulta la información institucional, las sucursales, las políticas de seguridad y las preferencias generales del sistema.",

    icon: Settings,

    // Ruta exclusiva del superadministrador.
    path: "/super-admin/sistema/configuracion",

    // Página construida y disponible.
    available: true,
  },

];

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function SuperAdminOverview() {

  return (
    <section className="super-admin-control">

      {/* ================================================= */}
      {/* ENCABEZADO */}
      {/* ================================================= */}

      <div className="super-admin-control__header">

        <div>

          <span className="super-admin-control__eyebrow">
            Control del sistema
          </span>

          <h2>
            Administración avanzada
          </h2>

          <p>
            Gestiona cuentas, administradores,
            roles y configuraciones sensibles
            de Iglesia El Ancla.
          </p>

        </div>

        {/* Indicador de acceso exclusivo al panel. */}

        <div className="super-admin-control__badge">

          <ShieldCheck
            size={16}
            strokeWidth={2}
            aria-hidden="true"
          />

          <span>
            Solo super administrador
          </span>

        </div>

      </div>

      {/* ================================================= */}
      {/* TARJETAS DE MÓDULOS */}
      {/* ================================================= */}

      <div className="super-admin-control__grid">

        {superAdminModules.map((module) => {

          // Obtenemos el icono correspondiente.
          const ModuleIcon = module.icon;

          // =================================================
          // MÓDULO DISPONIBLE
          // =================================================

          if (module.available) {

            return (
              <Link
                className="super-admin-control-card"
                to={module.path}
                key={module.id}
              >

                {/* Icono del módulo. */}

                <div className="super-admin-control-card__icon">

                  <ModuleIcon
                    size={23}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />

                </div>

                {/* Información del módulo. */}

                <div className="super-admin-control-card__content">

                  <strong>
                    {module.title}
                  </strong>

                  <span>
                    {module.description}
                  </span>

                </div>

                {/* Indicador de navegación. */}

                <ArrowRight
                  className="super-admin-control-card__arrow"
                  size={18}
                  strokeWidth={2}
                  aria-hidden="true"
                />

              </Link>
            );
          }

          // =================================================
          // MÓDULO PENDIENTE
          // =================================================

          return (
            <button
              className="
                super-admin-control-card
                super-admin-control-card--disabled
              "
              type="button"
              disabled
              key={module.id}
            >

              {/* Icono del módulo. */}

              <div className="super-admin-control-card__icon">

                <ModuleIcon
                  size={23}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />

              </div>

              {/* Información del módulo. */}

              <div className="super-admin-control-card__content">

                <strong>
                  {module.title}
                </strong>

                <span>
                  {module.description}
                </span>

                {/* Indicador de módulo pendiente. */}

                <small>
                  Disponible próximamente
                </small>

              </div>

            </button>
          );

        })}

      </div>

    </section>
  );
}

// =========================================================
// EXPORTACIÓN
// =========================================================

export default SuperAdminOverview;
