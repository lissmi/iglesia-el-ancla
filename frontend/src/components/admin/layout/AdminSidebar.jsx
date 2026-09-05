// Importamos NavLink para navegar entre las páginas
// y detectar automáticamente cuál ruta está activa.
import { NavLink } from "react-router-dom";

// Importamos los iconos utilizados dentro del menú.
import {
  LayoutDashboard,
  CalendarDays,
  HandHeart,
  Users,
  BookOpen,
  BadgeDollarSign,
  ReceiptText,
  UserRoundCog,
  Settings,
  LogOut,
  ExternalLink,
  X,
} from "lucide-react";

// Importamos los estilos exclusivos del sidebar.
import "../../../styles/components/admin/layout/AdminSidebar.css";


// Creamos el componente del menú lateral.
//
// isOpen indica si el menú está abierto en celulares.
// onClose permite cerrar el menú desde AdminLayout.
function AdminSidebar({
  isOpen,
  onClose,
}) {

  // Creamos los grupos que organizan
  // las diferentes opciones administrativas.
  const navigationGroups = [
    {
      // Título del grupo principal.
      title: "Principal",

      // Opciones pertenecientes a este grupo.
      items: [
        {
          // Texto visible de la opción.
          label: "Inicio",

          // Ruta a la que dirigirá.
          path: "/admin",

          // Icono correspondiente.
          icon: LayoutDashboard,

          // Indicamos que la página está disponible.
          available: true,

          // Evitamos que Inicio permanezca activo
          // al navegar por otras rutas de /admin.
          end: true,
        },
      ],
    },
    {
      // Título del grupo comunitario.
      title: "Comunidad",

      // Opciones relacionadas con la comunidad.
      items: [
        {
          label: "Eventos",
          path: "/admin/eventos",
          icon: CalendarDays,
          available: false,
        },
        {
          label: "Peticiones de oración",
          path: "/admin/peticiones-oracion",
          icon: HandHeart,
          available: false,
        },
        {
          label: "Miembros",
          path: "/admin/miembros",
          icon: Users,
          available: false,
        },
      ],
    },
    {
      // Título del grupo de contenidos.
      title: "Contenidos",

      // Opciones para gestionar materiales.
      items: [
        {
          label: "Recursos",
          path: "/admin/recursos",
          icon: BookOpen,
          available: false,
        },
      ],
    },
    {
      // Título del grupo financiero.
      title: "Finanzas",

      // Opciones relacionadas con ingresos y gastos.
      items: [
        {
          label: "Ingresos",
          path: "/admin/finanzas/ingresos",
          icon: BadgeDollarSign,
          available: false,
        },
        {
          label: "Gastos",
          path: "/admin/finanzas/gastos",
          icon: ReceiptText,
          available: true,
        },
      ],
    },
    {
      // Título del grupo de configuración.
      title: "Sistema",

      // Opciones relacionadas con la administración.
      items: [
        {
          label: "Administradores",
          path: "/admin/administradores",
          icon: UserRoundCog,
          available: false,
        },
        {
          label: "Configuración",
          path: "/admin/configuracion",
          icon: Settings,
          available: false,
        },
      ],
    },
  ];


  // Retornamos el contenido completo del sidebar.
  return (
    <aside
      className={`admin-sidebar ${
        isOpen
          ? "admin-sidebar--open"
          : ""
      }`}
    >

      {/* ================================================= */}
      {/* IDENTIDAD DEL PANEL */}
      {/* ================================================= */}

      <div className="admin-sidebar__brand">

        {/* Mostramos un símbolo visual de El Ancla. */}
        <div
          className="admin-sidebar__brand-icon"
          aria-hidden="true"
        >
          ⚓
        </div>


        {/* Agrupamos el nombre y la descripción. */}
        <div className="admin-sidebar__brand-text">

          {/* Nombre abreviado de la iglesia. */}
          <strong>
            El Ancla
          </strong>

          {/* Nombre del área privada. */}
          <span>
            Panel administrativo
          </span>

        </div>


        {/* Este botón permite cerrar el menú
            cuando se utiliza un dispositivo móvil. */}
        <button
          className="admin-sidebar__close"
          type="button"
          onClick={onClose}
          aria-label="Cerrar menú administrativo"
        >
          <X
            size={22}
            strokeWidth={2}
            aria-hidden="true"
          />
        </button>

      </div>


      {/* ================================================= */}
      {/* NAVEGACIÓN ADMINISTRATIVA */}
      {/* ================================================= */}

      <nav
        className="admin-sidebar__navigation"
        aria-label="Navegación administrativa"
      >

        {/* Recorremos todos los grupos del menú. */}
        {navigationGroups.map((group) => (

          // Creamos una sección por cada grupo.
          <section
            className="admin-sidebar__group"
            key={group.title}
          >

            {/* Mostramos el título del grupo. */}
            <h2 className="admin-sidebar__group-title">
              {group.title}
            </h2>


            {/* Creamos la lista de opciones. */}
            <ul className="admin-sidebar__list">

              {/* Recorremos las opciones del grupo actual. */}
              {group.items.map((item) => {

                // Guardamos el componente del icono.
                const Icon = item.icon;


                // Comprobamos si el módulo todavía
                // no se encuentra disponible.
                if (!item.available) {
                  return (
                    <li key={item.path}>

                      {/* Mostramos una opción deshabilitada
                          para impedir la navegación. */}
                      <button
                        className="
                          admin-sidebar__link
                          admin-sidebar__link--disabled
                        "
                        type="button"
                        disabled
                        title="Módulo disponible próximamente"
                      >

                        {/* Mostramos el icono correspondiente. */}
                        <Icon
                          size={19}
                          strokeWidth={1.8}
                          aria-hidden="true"
                        />

                        {/* Mostramos el nombre del módulo. */}
                        <span>
                          {item.label}
                        </span>

                        {/* Informamos que la página
                            todavía se encuentra pendiente. */}
                        <small>
                          Próximamente
                        </small>

                      </button>

                    </li>
                  );
                }


                // Si la ruta está disponible,
                // retornamos un enlace de navegación.
                return (
                  <li key={item.path}>

                    <NavLink
                      to={item.path}
                      end={item.end}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `admin-sidebar__link ${
                          isActive
                            ? "admin-sidebar__link--active"
                            : ""
                        }`
                      }
                    >

                      {/* Mostramos el icono de la opción. */}
                      <Icon
                        size={19}
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />

                      {/* Mostramos el nombre de la opción. */}
                      <span>
                        {item.label}
                      </span>

                    </NavLink>

                  </li>
                );

              })}

            </ul>

          </section>

        ))}

      </nav>


      {/* ================================================= */}
      {/* ACCIONES INFERIORES */}
      {/* ================================================= */}

      <div className="admin-sidebar__footer">

        {/* Abrimos el sitio público en otra pestaña
            para no cerrar el panel administrativo. */}
        <a
          className="admin-sidebar__public-link"
          href="/"
          target="_blank"
          rel="noopener noreferrer"
        >
          {/* Mostramos el icono de enlace externo. */}
          <ExternalLink
            size={18}
            strokeWidth={1.8}
            aria-hidden="true"
          />

          {/* Texto visible del enlace. */}
          <span>
            Ver sitio público
          </span>

        </a>


        {/* Este botón se conectará posteriormente
            con la función real de cierre de sesión. */}
        <button
          className="admin-sidebar__logout"
          type="button"
        >
          {/* Mostramos el icono de salida. */}
          <LogOut
            size={18}
            strokeWidth={1.8}
            aria-hidden="true"
          />

          {/* Texto visible del botón. */}
          <span>
            Cerrar sesión
          </span>

        </button>

      </div>

    </aside>
  );
}


// Exportamos el componente para utilizarlo
// dentro de AdminLayout.
export default AdminSidebar;