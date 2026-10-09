
import { Link } from "react-router-dom";

// =========================================================
// IMPORTACIÓN DE ICONOS
// =========================================================

// Importamos los iconos utilizados dentro
// del control avanzado del sistema.
import {
  ArrowRight,
  Settings,
  ShieldCheck,
  UserCog,
  UserPlus,
  UsersRound,
} from "lucide-react";


// Importamos los estilos exclusivos del componente.
import "../../../styles/components/super-admin/home/SuperAdminOverview.css";


// =========================================================
// MÓDULOS DEL SUPERADMINISTRADOR
// =========================================================

// Estas tarjetas representan las herramientas
// disponibles desde el panel super_admin.
//
// Algunas funcionalidades serán exclusivas,
// mientras que otras reutilizarán componentes
// compartidos con el administrador normal.
//
// Cada módulo contiene:
//
// id: identificador único.
// title: título de la tarjeta.
// description: descripción de la funcionalidad.
// icon: icono correspondiente.
// path: ruta de navegación.
// available: indica si la página ya está implementada.

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

    // Página pendiente de implementación.
    available: true,
  },


  // -------------------------------------------------------
  // REGISTRAR USUARIO
  // -------------------------------------------------------

  {
    id: "register-user",

    title: "Registrar usuario",

    description:
      "Crea nuevas cuentas para miembros y administradores de la iglesia.",

    icon: UserPlus,

    path: "/super-admin/usuarios/registrar",

    // Esta funcionalidad utilizará un componente
    // compartido con el administrador normal.
    //
    // super_admin podrá registrar miembros y admins.
    // admin podrá registrar únicamente miembros.
    available: false,
  },


  // -------------------------------------------------------
  // ADMINISTRADORES
  // -------------------------------------------------------

  {
    id: "administrators",

    title: "Administradores",

    description:
      "Revisa y administra las cuentas que poseen permisos administrativos.",

    icon: ShieldCheck,

    path: "/super-admin/administradores",

    available: false,
  },


  // -------------------------------------------------------
  // ROLES Y PERMISOS
  // -------------------------------------------------------

  {
    id: "roles",

    title: "Roles y permisos",

    description:
      "Modifica los niveles de acceso asignados a las cuentas registradas.",

    icon: UserCog,

    path: "/super-admin/sistema/roles",

    available: false,
  },


  // -------------------------------------------------------
  // CONFIGURACIÓN DEL SISTEMA
  // -------------------------------------------------------

  {
    id: "settings",

    title: "Configuración",

    description:
      "Administra opciones sensibles relacionadas con el funcionamiento general del sistema.",

    icon: Settings,

    path: "/super-admin/configuracion",

    available: false,
  },

];


// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

// Creamos el resumen de herramientas avanzadas
// que se muestra en SuperAdminHome.
//
// Este componente presenta las tarjetas
// correspondientes al panel super_admin.
function SuperAdminOverview() {

  // =========================================================
  // INTERFAZ
  // =========================================================

  return (
    <section className="super-admin-control">


      {/* ================================================= */}
      {/* ENCABEZADO */}
      {/* ================================================= */}

      <div className="super-admin-control__header">

        <div>

          {/* Identificador de la sección. */}
          <span className="super-admin-control__eyebrow">
            Control del sistema
          </span>


          {/* Título principal. */}
          <h2>
            Administración avanzada
          </h2>


          {/* Descripción de las funcionalidades. */}
          <p>
            Gestiona cuentas, administradores,
            roles y configuraciones sensibles
            de Iglesia El Ancla.
          </p>

        </div>


        {/* Indicador de acceso exclusivo
            al panel del superadministrador. */}
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

        {/* Recorremos todos los módulos configurados. */}
        {superAdminModules.map((module) => {

          // Obtenemos el componente del icono
          // correspondiente a cada módulo.
          const ModuleIcon = module.icon;


          // =================================================
          // MÓDULO DISPONIBLE
          // =================================================

          // Cuando la página esté construida,
          // utilizaremos Link para navegar.
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


                {/* Flecha indicadora de navegación. */}
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

          // Si la página todavía no está construida,
          // mostramos la tarjeta deshabilitada.
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


// Exportamos el componente para utilizarlo
// dentro de SuperAdminHome.
export default SuperAdminOverview;
