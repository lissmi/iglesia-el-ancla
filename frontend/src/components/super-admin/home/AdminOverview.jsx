// Importamos Link para navegar
// hacia los módulos administrativos disponibles.
import {
  Link,
} from "react-router-dom";


// Importamos los iconos utilizados
// dentro del resumen administrativo.
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  HandHeart,
  ReceiptText,
  Users,
} from "lucide-react";


// Importamos los estilos
// exclusivos del componente.
import "../../../styles/components/super-admin/home/AdminOverview.css";


// =========================================================
// MÓDULOS ADMINISTRATIVOS
// =========================================================

// Definimos los principales módulos
// que pueden utilizar tanto:
//
// - admin
// - super_admin
//
// Las rutas que todavía no existen
// permanecerán temporalmente deshabilitadas.
const administrativeModules = [

  {
    id: "events",

    title:
      "Eventos",

    description:
      "Crea, modifica y organiza las actividades publicadas para la comunidad.",

    icon:
      CalendarDays,

    path:
      "/super-admin/eventos",

    available:
      false,
  },


  {
    id: "prayer-requests",

    title:
      "Peticiones de oración",

    description:
      "Revisa y administra las solicitudes de oración recibidas.",

    icon:
      HandHeart,

    path:
      "/super-admin/peticiones-oracion",

    available:
      false,
  },


  {
    id: "members",

    title:
      "Miembros",

    description:
      "Consulta la información de los miembros registrados de la iglesia.",

    icon:
      Users,

    path:
      "/super-admin/miembros",

    available:
      false,
  },


  {
    id: "resources",

    title:
      "Recursos",

    description:
      "Administra los estudios, guías y materiales disponibles para la comunidad.",

    icon:
      BookOpen,

    path:
      "/super-admin/recursos",

    available:
      false,
  },


  {
    id: "expenses",

    title:
      "Finanzas",

    description:
      "Consulta y registra los gastos asociados a la gestión de la iglesia.",

    icon:
      ReceiptText,

    // Este módulo ya existe actualmente.
    path:
      "/super-admin/finanzas/gastos",

    available:
      true,
  },

];


// =========================================================
// COMPONENTE
// =========================================================

// Creamos el resumen de las funciones
// administrativas generales.
//
// Estas herramientas serán compartidas
// posteriormente por admin y super_admin.
function AdminOverview() {

  return (
    <section className="super-admin-management">


      {/* ================================================= */}
      {/* ENCABEZADO */}
      {/* ================================================= */}

      <div className="super-admin-management__header">

        <div>

          <span className="super-admin-management__eyebrow">
            Administración
          </span>


          <h2>
            Gestión de la iglesia
          </h2>


          <p>
            Accede a las principales herramientas para
            organizar la información y los servicios
            de la comunidad.
          </p>

        </div>

      </div>


      {/* ================================================= */}
      {/* MÓDULOS */}
      {/* ================================================= */}

      <div className="super-admin-management__grid">

        {administrativeModules.map(
          (module) => {

            // Guardamos el componente
            // correspondiente al icono.
            const ModuleIcon =
              module.icon;


            // =================================================
            // MÓDULO DISPONIBLE
            // =================================================

            // Cuando la página correspondiente
            // ya existe utilizamos Link.
            if (module.available) {

              return (
                <Link
                  className="super-admin-management-card"
                  to={module.path}
                  key={module.id}
                >

                  {/* Icono del módulo. */}
                  <div className="super-admin-management-card__icon">

                    <ModuleIcon
                      size={23}
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />

                  </div>


                  {/* Información del módulo. */}
                  <div className="super-admin-management-card__content">

                    <strong>
                      {module.title}
                    </strong>

                    <span>
                      {module.description}
                    </span>

                  </div>


                  {/* Flecha indicadora de navegación. */}
                  <ArrowRight
                    className="super-admin-management-card__arrow"
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

            // Los módulos que todavía no hemos
            // construido se muestran deshabilitados.
            return (
              <button
                className="
                  super-admin-management-card
                  super-admin-management-card--disabled
                "
                type="button"
                disabled
                key={module.id}
              >

                {/* Icono del módulo. */}
                <div className="super-admin-management-card__icon">

                  <ModuleIcon
                    size={23}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />

                </div>


                {/* Información del módulo. */}
                <div className="super-admin-management-card__content">

                  <strong>
                    {module.title}
                  </strong>

                  <span>
                    Disponible próximamente
                  </span>

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
export default AdminOverview;