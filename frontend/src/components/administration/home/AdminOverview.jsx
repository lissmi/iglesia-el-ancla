// src/components/administration/home/AdminOverview.jsx


// =========================================================
// IMPORTACIONES
// =========================================================

// Importamos Link para navegar entre módulos.
// Importamos useLocation para identificar el panel actual.
import {
  Link,
  useLocation,
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


// Importamos los estilos exclusivos del componente.
import "../../../styles/components/administration/home/AdminOverview.css";


// =========================================================
// MÓDULOS ADMINISTRATIVOS COMPARTIDOS
// =========================================================

// Definimos los módulos disponibles para:
//
// - admin
// - super_admin
//
// Las rutas son relativas al panel administrativo.
// De esta manera no necesitamos escribir
// /admin o /super-admin en cada módulo.
//
// available indica si el módulo ya está implementado.

const administrativeModules = [

  // -------------------------------------------------------
  // EVENTOS
  // -------------------------------------------------------

  {
    id: "events",

    title: "Eventos",

    description:
      "Crea, modifica y organiza las actividades publicadas para la comunidad.",

    icon: CalendarDays,

    path: "/eventos",

    available: true,
  },


  // -------------------------------------------------------
  // PETICIONES DE ORACIÓN
  // -------------------------------------------------------

  {
    id: "prayer-requests",

    title: "Peticiones de oración",

    description:
      "Consulta, organiza y realiza seguimiento de las peticiones de oración recibidas por la comunidad.",

    icon: HandHeart,

    path: "/peticiones-oracion",

    // El módulo ya cuenta con su página de gestión,
    // filtros y modal de seguimiento.
    available: true,
  },


  // -------------------------------------------------------
  // MIEMBROS
  // -------------------------------------------------------

  {
    id: "members",

    title: "Miembros",

    description:
      "Consulta la información de los miembros registrados de la iglesia.",

    icon: Users,

    path: "/miembros",

    available: true,
  },


  // -------------------------------------------------------
  // RECURSOS
  // -------------------------------------------------------

  {
    id: "resources",

    title: "Recursos",

    description:
      "Administra los estudios, guías y materiales disponibles para la comunidad.",

    icon: BookOpen,

    path: "/recursos",

    available: false,
  },


  // -------------------------------------------------------
  // FINANZAS
  // -------------------------------------------------------

  {
    id: "expenses",

    title: "Finanzas",

    description:
      "Consulta y registra los gastos asociados a la gestión de la iglesia.",

    icon: ReceiptText,

    path: "/finanzas/gastos",

    // El módulo de gastos ya está implementado.
    available: true,
  },

];


// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

// Este componente será reutilizado por ambos paneles.
function AdminOverview() {

  // -------------------------------------------------------
  // IDENTIFICACIÓN DEL PANEL
  // -------------------------------------------------------

  // Obtenemos la ubicación actual de React Router.
  const location = useLocation();


  // Comprobamos si estamos dentro del panel
  // correspondiente al superadministrador.
  const isSuperAdminPanel =
    location.pathname === "/super-admin" ||
    location.pathname.startsWith("/super-admin/");


  // Definimos la ruta base correspondiente.
  const adminBasePath = isSuperAdminPanel
    ? "/super-admin"
    : "/admin";


  // =========================================================
  // INTERFAZ
  // =========================================================

  return (
    <section className="super-admin-management">


      {/* ================================================= */}
      {/* ENCABEZADO */}
      {/* ================================================= */}

      <div className="super-admin-management__header">

        <div>

          {/* Identificador de la sección. */}
          <span className="super-admin-management__eyebrow">
            Administración
          </span>


          {/* Título principal. */}
          <h2>
            Gestión de la iglesia
          </h2>


          {/* Descripción de las herramientas. */}
          <p>
            Accede a las principales herramientas para
            organizar la información y los servicios
            de la comunidad.
          </p>

        </div>

      </div>


      {/* ================================================= */}
      {/* TARJETAS DE MÓDULOS */}
      {/* ================================================= */}

      <div className="super-admin-management__grid">

        {/* Recorremos los módulos administrativos. */}
        {administrativeModules.map((module) => {

          // Obtenemos el componente del icono.
          const ModuleIcon = module.icon;


          // Construimos la ruta completa.
          // Ejemplo:
          // /super-admin/finanzas/gastos
          // /admin/finanzas/gastos
          const modulePath =
            `${adminBasePath}${module.path}`;


          // Por ahora, Finanzas está implementado
          // únicamente en las rutas del super_admin.
          // Cuando agreguemos la ruta del admin,
          // podremos habilitarla también allí.
          const isAvailable =
            module.available &&
            (
              module.id !== "expenses" ||
              isSuperAdminPanel
            );


          // =================================================
          // MÓDULO DISPONIBLE
          // =================================================

          // Si la página existe, mostramos un enlace.
          if (isAvailable) {

            return (
              <Link
                className="super-admin-management-card"
                to={modulePath}
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

          // Si todavía no existe la ruta correspondiente,
          // mostramos una tarjeta deshabilitada.
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

        })}

      </div>

    </section>
  );
}


// Exportamos el componente para reutilizarlo
// en los paneles admin y super_admin.
export default AdminOverview;
