
import { useState } from "react";

// Importamos las herramientas de navegación.
import {
  NavLink,
  useNavigate,
  useLocation,
} from "react-router-dom";

// Importamos la conexión existente con el backend.
import api from "../../../services/api";

// Importamos los iconos del menú.
import {
  LayoutDashboard,
  CalendarDays,
  HandHeart,
  Users,
  BookOpen,
  BadgeDollarSign,
  ReceiptText,
  UserRoundCog,
  UserPlus,
  UsersRound,
  ShieldCheck,
  Settings,
  History,
  FilePenLine,
  LogOut,
  ExternalLink,
  X,
} from "lucide-react";

// Importamos los estilos exclusivos del sidebar.
import "../../../styles/components/administration/layout/AdminSidebar.css";


// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function AdminSidebar({ isOpen, onClose }) {

  // Permite redirigir al usuario mediante React Router.
  const navigate = useNavigate();

  // Obtiene la ruta actual del navegador.
  const location = useLocation();

  // Controla el estado del cierre de sesión.
  const [isLoggingOut, setIsLoggingOut] = useState(false);


  // =========================================================
  // IDENTIFICACIÓN DEL PANEL
  // =========================================================

  // Determinamos qué panel se está visualizando.
  // Esto sirve exclusivamente para construir la interfaz.
  const isSuperAdminPanel =
    location.pathname === "/super-admin" ||
    location.pathname.startsWith("/super-admin/");

  // Definimos la ruta base de navegación.
  const adminBasePath = isSuperAdminPanel
    ? "/super-admin"
    : "/admin";


  // =========================================================
  // CIERRE DE SESIÓN
  // =========================================================

  const handleLogout = async () => {

    // Evitamos solicitudes duplicadas.
    if (isLoggingOut) {
      return;
    }

    // Indicamos que comenzó el cierre de sesión.
    setIsLoggingOut(true);

    try {

      // Solicitamos al backend eliminar la sesión.
      // La instancia api ya utiliza withCredentials.
      const response = await api.post("/auth/logout");

      // Verificamos que el servidor confirme el cierre.
      if (response.data?.success) {

        // Cerramos el menú móvil.
        onClose?.();

        // Redirigimos al login sin conservar
        // la página privada en el historial.
        navigate("/login", {
          replace: true,
        });

        return;
      }

      // Registramos una respuesta inesperada.
      console.error(
        "El servidor no confirmó el cierre de sesión."
      );

    } catch (error) {

      // No asumimos que la sesión fue cerrada
      // cuando existe un error de comunicación.
      console.error(
        "No fue posible cerrar la sesión:",
        error
      );

    } finally {

      // Habilitamos nuevamente el botón.
      setIsLoggingOut(false);
    }
  };


  // =========================================================
  // GRUPOS DE NAVEGACIÓN
  // =========================================================

  // Todos los módulos utilizan la ruta base
  // correspondiente al panel actual.
  //
  // available indica si la página ya está construida.
  // superAdminOnly identifica las opciones exclusivas.
  //
  // IMPORTANTE:
  // Estas propiedades controlan únicamente la interfaz.
  // El backend deberá validar los permisos reales.

  const navigationGroups = [

    // -------------------------------------------------------
    // PRINCIPAL
    // -------------------------------------------------------

    {
      title: "Principal",

      items: [
        {
          label: "Inicio",
          path: adminBasePath,
          icon: LayoutDashboard,
          available: true,
          end: true,
        },
      ],
    },


    // -------------------------------------------------------
    // COMUNIDAD
    // -------------------------------------------------------

    {
      title: "Comunidad",

      items: [
        {
          label: "Eventos",
          path: `${adminBasePath}/eventos`,
          icon: CalendarDays,
          available: false,
        },
        {
          label: "Peticiones de oración",
          path: `${adminBasePath}/peticiones-oracion`,
          icon: HandHeart,
          available: false,
        },
        {
          label: "Miembros",
          path: `${adminBasePath}/miembros`,
          icon: Users,
          available: false,
        },
      ],
    },


    // -------------------------------------------------------
    // CONTENIDOS
    // -------------------------------------------------------

    {
      title: "Contenidos",

      items: [
        {
          label: "Recursos",
          path: `${adminBasePath}/recursos`,
          icon: BookOpen,
          available: false,
        },
        {
          label: "Gestión de páginas",
          path: `${adminBasePath}/contenidos/paginas`,
          icon: FilePenLine,
          available: false,
        },
      ],
    },


    // -------------------------------------------------------
    // FINANZAS
    // -------------------------------------------------------

    {
      title: "Finanzas",

      items: [
        {
          label: "Ingresos",
          path: `${adminBasePath}/finanzas/ingresos`,
          icon: BadgeDollarSign,
          available: false,
        },
        {
          label: "Gastos",
          path: `${adminBasePath}/finanzas/gastos`,
          icon: ReceiptText,

          // Actualmente está implementado
          // en el panel del superadministrador.
          available: isSuperAdminPanel,
        },
      ],
    },


    // -------------------------------------------------------
    // ADMINISTRACIÓN
    // -------------------------------------------------------

    {
      title: "Administración",

      items: [
        {
          label: "Registrar usuario",
          path: `${adminBasePath}/usuarios/registrar`,
          icon: UserPlus,
          available: false,
        },
        {
          label: "Historial de actividad",
          path: `${adminBasePath}/historial`,
          icon: History,
          available: false,
        },
      ],
    },


    // -------------------------------------------------------
    // SISTEMA - SOLO SUPER ADMIN
    // -------------------------------------------------------

    {
      title: "Sistema",

      superAdminOnly: true,

      items: [
        {
          label: "Gestión de usuarios",
          path: `${adminBasePath}/sistema/usuarios`,
          icon: UsersRound,
          available: false,
        },
        {
          label: "Administradores",
          path: `${adminBasePath}/administradores`,
          icon: ShieldCheck,
          available: false,
        },
        {
          label: "Roles y permisos",
          path: `${adminBasePath}/sistema/roles`,
          icon: UserRoundCog,
          available: false,
        },
        {
          label: "Configuración",
          path: `${adminBasePath}/configuracion`,
          icon: Settings,
          available: false,
        },
      ],
    },
  ];


  // =========================================================
  // FILTRADO DE NAVEGACIÓN
  // =========================================================

  // Ocultamos los grupos exclusivos cuando
  // estamos visualizando el panel del admin normal.
  const visibleNavigationGroups = navigationGroups.filter(
    (group) => {

      // Los grupos comunes siempre son visibles.
      if (!group.superAdminOnly) {
        return true;
      }

      // Los grupos exclusivos solamente se muestran
      // dentro del panel del superadministrador.
      return isSuperAdminPanel;
    }
  );


  // =========================================================
  // INTERFAZ
  // =========================================================

  return (
    <aside
      className={`admin-sidebar ${
        isOpen ? "admin-sidebar--open" : ""
      }`}
    >

      {/* ================================================= */}
      {/* IDENTIDAD DEL PANEL */}
      {/* ================================================= */}

      <div className="admin-sidebar__brand">

        {/* Icono institucional. */}
        <div
          className="admin-sidebar__brand-icon"
          aria-hidden="true"
        >
          ⚓
        </div>

        {/* Nombre de la iglesia. */}
        <div className="admin-sidebar__brand-text">

          <strong>
            El Ancla
          </strong>

          <span>
            Panel administrativo
          </span>

        </div>

        {/* Botón para cerrar el menú móvil. */}
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

        {/* Recorremos los grupos visibles. */}
        {visibleNavigationGroups.map((group) => (

          <section
            className="admin-sidebar__group"
            key={group.title}
          >

            {/* Nombre del grupo. */}
            <h2 className="admin-sidebar__group-title">
              {group.title}
            </h2>

            {/* Opciones de navegación. */}
            <ul className="admin-sidebar__list">

              {group.items.map((item) => {

                // Obtenemos el icono correspondiente.
                const Icon = item.icon;


                // -----------------------------------------
                // MÓDULO PENDIENTE
                // -----------------------------------------

                if (!item.available) {

                  return (
                    <li key={item.path}>

                      <button
                        className="
                          admin-sidebar__link
                          admin-sidebar__link--disabled
                        "
                        type="button"
                        disabled
                        title="Módulo disponible próximamente"
                      >

                        {/* Icono del módulo. */}
                        <Icon
                          size={19}
                          strokeWidth={1.8}
                          aria-hidden="true"
                        />

                        {/* Nombre del módulo. */}
                        <span>
                          {item.label}
                        </span>

                        {/* Estado del módulo. */}
                        <small>
                          Próximamente
                        </small>

                      </button>

                    </li>
                  );
                }


                // -----------------------------------------
                // MÓDULO DISPONIBLE
                // -----------------------------------------

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

                      {/* Icono del módulo. */}
                      <Icon
                        size={19}
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />

                      {/* Nombre del módulo. */}
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

        {/* Enlace al sitio público. */}
        <a
          className="admin-sidebar__public-link"
          href="/"
          target="_blank"
          rel="noopener noreferrer"
        >

          <ExternalLink
            size={18}
            strokeWidth={1.8}
            aria-hidden="true"
          />

          <span>
            Ver sitio público
          </span>

        </a>


        {/* Botón de cierre de sesión. */}
        <button
          className="admin-sidebar__logout"
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >

          <LogOut
            size={18}
            strokeWidth={1.8}
            aria-hidden="true"
          />

          <span>
            {isLoggingOut
              ? "Cerrando sesión..."
              : "Cerrar sesión"}
          </span>

        </button>

      </div>

    </aside>
  );
}


// Exportamos el componente para ambos paneles.
export default AdminSidebar;
