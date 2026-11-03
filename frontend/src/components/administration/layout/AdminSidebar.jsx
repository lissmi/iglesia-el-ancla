//frontend/src/components/administration/layout/AdminSidebar.jsx
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
  UserRound,
  HeartHandshake,
  CalendarCheck,
  Boxes,
  PackageSearch,
  ArrowLeftRight,
  PackagePlus,
  Wallet,
  Sparkles,
  Bot,
} from "lucide-react";

// Importamos los estilos exclusivos del sidebar.
import "../../../styles/components/administration/layout/AdminSidebar.css";

import logoElAncla from "../../../assets/images/logo-el-ancla2.jpg";


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

  // adminBasePath identifica el panel actual:
  //
  // admin       -> /admin
  // super_admin -> /super-admin
  //
  // Los módulos compartidos utilizan la misma
  // estructura de rutas para ambos paneles.
  //
  // Los módulos exclusivos del superadministrador
  // se agrupan dentro de Sistema.
  //
  // IMPORTANTE:
  // La disponibilidad controla únicamente la interfaz.
  // ProtectedRoute y el backend deben validar el acceso.

  const navigationGroups = [
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
    {
      title: "Mi espacio personal",
      items: [
        {
          label: "Mi espacio",
          path: "/member",
          icon: UserRound,
          available: true,
          end: true,
        },
        // Cuenta privada del usuario autenticado, no de terceros.
        {
          label: "Mi cuenta",
          path: `${adminBasePath}/mi-cuenta`,
          icon: UserRoundCog,
          available: true,
        },
        {
          label: "Mis actividades",
          path: "/member/actividades",
          icon: CalendarCheck,
          available: true,
        },
        {
          label: "Mis peticiones de oración",
          path: "/member/peticiones-oracion",
          icon: HeartHandshake,
          available: true,
        },
      ],
    },
    {
      title: "Comunidad",
      items: [
        // Actividades internas disponibles para los miembros registrados.
        {
          label: "Gestión de actividades",
          path: `${adminBasePath}/actividades`,
          icon: CalendarCheck,
          available: true,
        },
        {
          label: "Peticiones de oración",
          path: `${adminBasePath}/peticiones-oracion`,
          icon: HandHeart,
          available: true,
        },
        {
          label: "Miembros",
          path: `${adminBasePath}/miembros`,
          icon: Users,
          available: true,
        },
        {
          label: "Voluntarios",
          path: `${adminBasePath}/voluntarios`,
          icon: UsersRound,
          available: true,
        },
      ],
    },
    {
      title: "Contenidos",
      items: [
        // Editor de los contenidos de la página pública «Nuestros eventos».
        {
          label: "Gestión de eventos",
          path: `${adminBasePath}/eventos`,
          icon: CalendarDays,
          available: true,
        },
        {
          label: "Recursos",
          path: `${adminBasePath}/recursos`,
          icon: BookOpen,
          available: true,
        },
        {
          label: "Recomendados",
          path: `${adminBasePath}/recomendados`,
          icon: Sparkles,
          available: true,
        },
        {
          label: "Páginas informativas",
          path: `${adminBasePath}/paginas-informativas`,
          icon: FilePenLine,
          available: true,
        },
      ],
    },
    {
      title: "Finanzas",
      items: [
        {
          label: "Resumen financiero",
          path: `${adminBasePath}/finanzas`,
          icon: Wallet,
          available: true,
          end: true,
        },
        {
          label: "Ingresos",
          path: `${adminBasePath}/finanzas/ingresos`,
          icon: BadgeDollarSign,
          available: true,
        },
        {
          label: "Gastos",
          path: `${adminBasePath}/finanzas/gastos`,
          icon: ReceiptText,
          available: true,
        },
      ],
    },
    {
      title: "Inventario y suministros",
      items: [
        {
          label: "Insumos básicos",
          path: `${adminBasePath}/insumos-basicos`,
          icon: PackagePlus,
          available: true,
        },
        {
          label: "Inventario de Bienes",
          path: `${adminBasePath}/inventario-bienes`,
          icon: Boxes,
          available: true,
          end: true,
        },
        {
          label: "Ver inventario",
          path: `${adminBasePath}/inventario-bienes/inventario`,
          icon: PackageSearch,
          available: true,
        },
        {
          label: "Movimientos de bienes",
          path: `${adminBasePath}/inventario-bienes/movimientos`,
          icon: ArrowLeftRight,
          available: true,
        },
      ],
    },
    {
      title: "Administración",
      items: [
        {
          label: "Gestión de usuarios",
          path: `${adminBasePath}/sistema/usuarios`,
          icon: UsersRound,
          available: true,
        },
        {
          label: "Registrar usuario",
          path: `${adminBasePath}/sistema/registrar-usuario`,
          icon: UserPlus,
          available: true,
        },
        {
          label: "Historial de actividad",
          path: `${adminBasePath}/historial`,
          icon: History,
          available: true,
        },
        // Administración del asistente virtual Martín.
        {
          label: "Gestión de Martín",
          path: `${adminBasePath}/asistente-martin`,
          icon: Bot,
          available: true,
          end: true,
        },
      ],
    },
    {
      title: "Sistema",
      superAdminOnly: true,
      items: [
        {
          label: "Administradores",
          path: `${adminBasePath}/sistema/administradores`,
          icon: ShieldCheck,
          available: true,
        },
        {
          label: "Roles y permisos",
          path: `${adminBasePath}/sistema/roles-permisos`,
          icon: UserRoundCog,
          available: true,
        },
        {
          label: "Configuración",
          path: `${adminBasePath}/sistema/configuracion`,
          icon: Settings,
          available: true,
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
      className={`admin-sidebar ${isOpen ? "admin-sidebar--open" : ""
        }`}
    >

      {/* ================================================= */}
      {/* IDENTIDAD DEL PANEL */}


      <div className="admin-sidebar__brand">

        {/* Logo oficial de Iglesia El Ancla. */}
        <div className="admin-sidebar__brand-icon">
          <img
            src={logoElAncla}
            alt="Logo Iglesia El Ancla"
            className="admin-sidebar__brand-logo"
          />
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
      {/* NAVEGACIÓN ADMINISTRATIVA Y ACCIONES */}
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
                        `admin-sidebar__link ${isActive
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


        {/* ================================================= */}
        {/* ACCIONES DE SESIÓN Y SITIO PÚBLICO (JUNTO A LOS BOTONES) */}
        {/* ================================================= */}

        <section className="admin-sidebar__group">
          <ul className="admin-sidebar__list">

            {/* Enlace al sitio público. */}
            <li>
              <a
                className="admin-sidebar__link admin-sidebar__public-link"
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
              >
                <ExternalLink
                  size={19}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                <span>
                  Ver sitio público
                </span>
              </a>
            </li>

            {/* Botón de cierre de sesión. */}
            <li>
              <button
                className="admin-sidebar__link admin-sidebar__logout"
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <LogOut
                  size={19}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                <span>
                  {isLoggingOut
                    ? "Cerrando sesión..."
                    : "Cerrar sesión"}
                </span>
              </button>
            </li>

          </ul>
        </section>

      </nav>

    </aside>
  );
}


// Exportamos el componente para ambos paneles.
export default AdminSidebar;
