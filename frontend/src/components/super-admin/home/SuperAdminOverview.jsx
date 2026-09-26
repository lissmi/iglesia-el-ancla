// Importamos los iconos utilizados
// dentro del control avanzado del sistema.
import {
  Settings,
  ShieldCheck,
  UserCog,
  UserPlus,
  UsersRound,
} from "lucide-react";


// Importamos los estilos
// exclusivos del componente.
import "../../../styles/components/super-admin/home/SuperAdminOverview.css";


// =========================================================
// FUNCIONES EXCLUSIVAS DEL SUPER ADMINISTRADOR
// =========================================================

// Estas acciones estarán disponibles únicamente
// para usuarios con rol "super_admin".
//
// Por ahora se mostrarán como módulos
// pendientes hasta crear sus páginas correspondientes.
const superAdminModules = [
  {
    id: "users",

    title:
      "Gestión de usuarios",

    description:
      "Consulta las cuentas registradas y administra su estado dentro del sistema.",

    icon:
      UsersRound,
  },


  {
    id: "register-user",

    title:
      "Registrar usuario",

    description:
      "Crea nuevas cuentas para miembros y administradores de la iglesia.",

    icon:
      UserPlus,
  },


  {
    id: "administrators",

    title:
      "Administradores",

    description:
      "Revisa y administra las cuentas que poseen permisos administrativos.",

    icon:
      ShieldCheck,
  },


  {
    id: "roles",

    title:
      "Roles y permisos",

    description:
      "Modifica los niveles de acceso asignados a las cuentas registradas.",

    icon:
      UserCog,
  },


  {
    id: "settings",

    title:
      "Configuración",

    description:
      "Administra opciones sensibles relacionadas con el funcionamiento general del sistema.",

    icon:
      Settings,
  },
];


// =========================================================
// COMPONENTE
// =========================================================

// Creamos el resumen correspondiente
// a las herramientas exclusivas del super administrador.
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


        {/* Indicamos visualmente que se trata
            de una sección exclusiva. */}
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
      {/* MÓDULOS */}
      {/* ================================================= */}

      <div className="super-admin-control__grid">

        {superAdminModules.map(
          (module) => {

            // Guardamos el componente
            // correspondiente al icono.
            const ModuleIcon =
              module.icon;


            // Por ahora todos estos módulos
            // se encuentran pendientes.
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


                  {/* Mostramos que el módulo
                      todavía no está disponible. */}
                  <small>
                    Disponible próximamente
                  </small>

                </div>

              </button>
            );
          }
        )}

      </div>

    </section>
  );
}


// Exportamos el componente
// para utilizarlo dentro de SuperAdminHome.
export default SuperAdminOverview;