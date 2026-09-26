//frontend/src/components/super-admin/layout/AdminSidebar.jsx

// Importamos las herramientas necesarias
// para navegar entre las páginas
// y redirigir después de cerrar sesión.
import {
  NavLink,
  useNavigate,
} from "react-router-dom";

// Importamos useState para controlar
// el estado del cierre de sesión.
import {
  useState,
} from "react";

// Importamos la instancia de Axios
// configurada para comunicarse con el backend.
import api from "../../../services/api";


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
import "../../../styles/components/super-admin/layout/AdminSidebar.css";


// Creamos el componente del menú lateral.
//
// isOpen indica si el menú está abierto en celulares.
//
// onClose permite cerrar el menú desde AdminLayout.
function AdminSidebar({
  isOpen,
  onClose,
}) {


  // =========================================================
  // NAVEGACIÓN
  // =========================================================

  // Obtenemos la función utilizada
  // para navegar desde React.
  const navigate =
    useNavigate();


  // =========================================================
  // ESTADO DEL CIERRE DE SESIÓN
  // =========================================================

  // Guardamos si actualmente
  // estamos cerrando la sesión.
  //
  // Esto evita enviar varias solicitudes
  // si el usuario presiona el botón
  // repetidamente.
  const [
    isLoggingOut,
    setIsLoggingOut,
  ] = useState(false);


  // =========================================================
  // CERRAR SESIÓN
  // =========================================================

  // Esta función solicita al backend
  // eliminar la cookie HttpOnly
  // utilizada para autenticar al usuario.
  const handleLogout = async () => {

    // Evitamos ejecutar nuevamente
    // la función mientras ya existe
    // una solicitud en curso.
    if (isLoggingOut) {
      return;
    }


    // Indicamos que comenzó
    // el cierre de sesión.
    setIsLoggingOut(true);


    try {

      // Solicitamos al backend
      // eliminar la cookie de sesión.
      //
      // api.js ya contiene:
      //
      // withCredentials: true
      //
      // por lo que la cookie será enviada
      // automáticamente.
      const response =
        await api.post(
          "/auth/logout"
        );


      // Comprobamos que el backend
      // haya confirmado el cierre.
      if (response.data?.success) {

        // Cerramos el sidebar
        // si se encuentra abierto
        // en un dispositivo móvil.
        onClose();


        // Enviamos al usuario
        // nuevamente al login.
        //
        // replace evita conservar
        // la página privada anterior
        // dentro del historial.
        navigate(
          "/login",
          {
            replace: true,
          }
        );

        return;
      }


      // Si recibimos una respuesta inesperada,
      // dejamos registro para desarrollo.
      console.error(
        "El servidor no confirmó el cierre de sesión."
      );

    } catch (error) {

      // Si existe algún problema de conexión,
      // no fingimos que la sesión fue cerrada,
      // ya que la cookie podría continuar activa.
      console.error(
        "No fue posible cerrar la sesión:",
        error
      );

    } finally {

      // Permitimos volver a utilizar
      // el botón cuando termina
      // la solicitud.
      setIsLoggingOut(false);
    }
  };

  // =========================================================
  // GRUPOS DE NAVEGACIÓN
  // =========================================================

  // Creamos los grupos que organizan
  // las diferentes opciones disponibles
  // para el super administrador.
  const navigationGroups = [

    // =======================================================
    // PRINCIPAL
    // =======================================================

    {
      title: "Principal",

      items: [
        {
          label: "Inicio",

          // Página principal
          // del super administrador.
          path: "/super-admin",

          icon: LayoutDashboard,

          available: true,

          // Evitamos que Inicio permanezca activo
          // al navegar por rutas internas
          // de /super-admin.
          end: true,
        },
      ],
    },


    // =======================================================
    // COMUNIDAD
    // =======================================================

    {
      title: "Comunidad",

      items: [
        {
          label: "Eventos",

          path: "/super-admin/eventos",

          icon: CalendarDays,

          // Este módulo todavía
          // no ha sido construido.
          available: false,
        },

        {
          label: "Peticiones de oración",

          path:
            "/super-admin/peticiones-oracion",

          icon: HandHeart,

          available: false,
        },

        {
          label: "Miembros",

          path: "/super-admin/miembros",

          icon: Users,

          available: false,
        },
      ],
    },


    // =======================================================
    // CONTENIDOS
    // =======================================================

    {
      title: "Contenidos",

      items: [
        {
          label: "Recursos",

          path: "/super-admin/recursos",

          icon: BookOpen,

          available: false,
        },
      ],
    },


    // =======================================================
    // FINANZAS
    // =======================================================

    {
      title: "Finanzas",

      items: [
        {
          label: "Ingresos",

          path:
            "/super-admin/finanzas/ingresos",

          icon: BadgeDollarSign,

          available: false,
        },

        {
          label: "Gastos",

          // Este módulo ya existe.
          path:
            "/super-admin/finanzas/gastos",

          icon: ReceiptText,

          available: true,
        },
      ],
    },


    // =======================================================
    // SISTEMA
    // =======================================================

    {
      title: "Sistema",

      // Estas herramientas corresponden
      // específicamente al super administrador.
      items: [
        {
          label: "Administradores",

          path:
            "/super-admin/administradores",

          icon: UserRoundCog,

          available: false,
        },

        {
          label: "Configuración",

          path:
            "/super-admin/configuracion",

          icon: Settings,

          available: false,
        },
      ],
    },
  ];


  // =========================================================
  // INTERFAZ
  // =========================================================

  // Retornamos el contenido completo del sidebar.
  return (
    <aside
      className={`admin-sidebar ${isOpen
        ? "admin-sidebar--open"
        : ""
        }`}
    >

      {/* ================================================= */}
      {/* IDENTIDAD DEL PANEL */}
      {/* ================================================= */}

      <div className="admin-sidebar__brand">

        {/* Mostramos un símbolo visual
            de Iglesia El Ancla. */}
        <div
          className="admin-sidebar__brand-icon"
          aria-hidden="true"
        >
          ⚓
        </div>


        {/* Agrupamos el nombre
            y la descripción. */}
        <div className="admin-sidebar__brand-text">

          {/* Nombre abreviado
              de la iglesia. */}
          <strong>
            El Ancla
          </strong>


          {/* Identificamos el área privada. */}
          <span>
            Panel administrativo
          </span>

        </div>


        {/* Este botón permite cerrar
            el menú en dispositivos móviles. */}
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
        aria-label="Navegación del super administrador"
      >

        {/* Recorremos todos
            los grupos del menú. */}
        {navigationGroups.map(
          (group) => (

            // Creamos una sección
            // por cada grupo.
            <section
              className="admin-sidebar__group"
              key={group.title}
            >

              {/* Mostramos el título
                  del grupo. */}
              <h2 className="admin-sidebar__group-title">
                {group.title}
              </h2>


              {/* Creamos la lista
                  de opciones. */}
              <ul className="admin-sidebar__list">

                {/* Recorremos las opciones
                    del grupo actual. */}
                {group.items.map(
                  (item) => {

                    // Guardamos el componente
                    // correspondiente al icono.
                    const Icon =
                      item.icon;


                    // =================================================
                    // MÓDULO NO DISPONIBLE
                    // =================================================

                    // Si el módulo todavía
                    // no se encuentra construido,
                    // mostramos un botón deshabilitado.
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


                            {/* Indicamos que todavía
                                no está disponible. */}
                            <small>
                              Próximamente
                            </small>

                          </button>

                        </li>
                      );
                    }


                    // =================================================
                    // MÓDULO DISPONIBLE
                    // =================================================

                    // Si la ruta ya existe,
                    // mostramos un NavLink normal.
                    return (
                      <li key={item.path}>

                        <NavLink
                          to={item.path}
                          end={item.end}
                          onClick={onClose}
                          className={({
                            isActive,
                          }) =>
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
                  }
                )}

              </ul>

            </section>
          )
        )}

      </nav>


      {/* ================================================= */}
      {/* ACCIONES INFERIORES */}
      {/* ================================================= */}

      <div className="admin-sidebar__footer">

        {/* Abrimos el sitio público
            en una pestaña nueva para conservar
            abierta la sesión administrativa. */}
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


        {/* Permitimos cerrar la sesión
    actual del super administrador. */}
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


// Exportamos el componente
// para utilizarlo dentro de AdminLayout.
export default AdminSidebar;