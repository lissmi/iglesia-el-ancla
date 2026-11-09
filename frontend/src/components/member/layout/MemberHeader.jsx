
// =========================================================
// HEADER DEL ÁREA DE MIEMBROS - IGLESIA EL ANCLA
// Archivo: frontend/src/components/member/layout/MemberHeader.jsx
// =========================================================

// React administra la apertura de los menús y el cierre de sesión.
import { useEffect, useRef, useState } from "react";

// React Router permite navegar sin recargar toda la aplicación.
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

// Iconos del encabezado, el menú personal y sus accesos.
import {
  ArrowLeftToLine,
  Bell,
  BookOpen,
  CalendarDays,
  ChevronDown,
  HeartHandshake,
  HandHeart,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ShieldCheck,
  Sparkles,
  UserRound,
  Wallet,
  X,
} from "lucide-react";

// Única instancia Axios del proyecto (incluye cookies HttpOnly).
import api from "../../../services/api";

// Limpiamos la conversación temporal solo después de cerrar sesión correctamente.
import { clearMartinChat } from "../../../utils/martinChatSession";

// Imagen institucional reutilizada en el sitio y área de miembros.
import logoElAncla from "../../../assets/images/logo-el-ancla.png";

// Se conserva el CSS original para no afectar la identidad del proyecto.
import "../../../styles/components/member/layout/MemberHeader.css";
import "../../../styles/components/member/volunteers/MemberVolunteerNotice.css";

// =========================================================
// ENLACES VISIBLES EN LA NAVEGACIÓN PRINCIPAL
// =========================================================

// La barra visible contiene solo los accesos generales de la iglesia.
const mainNavigation = [
  { label: "Inicio", to: "/", end: true },
  { label: "Nosotros", to: "/nosotros" },
  { label: "Eventos", to: "/eventos" },
  { label: "Donaciones", to: "/donaciones" },
  { label: "Contacto", to: "/contacto" },
];

// =========================================================
// ENLACES PERSONALES AGRUPADOS EN «MI ESPACIO»
// =========================================================

// Estas rutas privadas ya existen en App.js y funcionan según el rol.
const personalNavigation = [
  { label: "Panel personal", to: "/member", icon: LayoutDashboard, end: true },
  { label: "Mis actividades", to: "/member/actividades", icon: CalendarDays },
  { label: "Mis turnos de servicio", to: "/member/voluntariado", icon: CalendarDays },
  { label: "Mis recursos", to: "/member/recursos", icon: BookOpen },
  { label: "Mis recomendados", to: "/member/recomendados", icon: Sparkles },
  { label: "Insumos básicos", to: "/member/insumos-basicos", icon: Package },
  { label: "Mis peticiones de oración", to: "/member/peticiones-oracion", icon: HeartHandshake },
  { label: "Mis donaciones", to: "/member/mis-donaciones", icon: HandHeart },
  { label: "Resumen financiero", to: "/member/finanzas", icon: Wallet },
  { label: "Mi cuenta", to: "/member/mi-cuenta", icon: UserRound },
];

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function MemberHeader({ user, volunteerAlerts = [], assignmentsLoading = false, supplyNeeds = [], supplyNeedsLoading = false }) {
  // Muestra u oculta la navegación completa cuando se usa el menú móvil.
  const [menuOpen, setMenuOpen] = useState(false);

  // Controla la apertura del submenú de información personal.
  const [personalOpen, setPersonalOpen] = useState(false);

  // Controla el panel de notificaciones reales del voluntariado.
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Evita ejecutar dos cierres de sesión simultáneamente.
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Guarda errores cuando el backend no confirma la salida.
  const [logoutError, setLogoutError] = useState("");

  // Permite navegar a otra ruta sin recargar React.
  const navigate = useNavigate();

  // Detecta los cambios de ruta para cerrar los menús abiertos.
  const location = useLocation();

  // Referencia del bloque completo del menú personal para detectar clics externos.
  const personalMenuRef = useRef(null);

  // Referencia al botón personal para devolverle el foco con Escape.
  const personalButtonRef = useRef(null);

  // Referencia a la campana para controlar el foco de notificaciones.
  const notificationsButtonRef = useRef(null);

  // Referencia al desplegable para poder cerrar al hacer clic fuera.
  const notificationsPanelRef = useRef(null);

  // Obtenemos el rol validado desde la sesión, no desde localStorage.
  const role = user?.role;

  // Solo admin y super_admin tienen un panel administrativo al cual regresar.
  const adminPanelPath = role === "super_admin"
    ? "/super-admin"
    : role === "admin"
      ? "/admin"
      : null;

  // Mostramos la identidad real recibida por la sesión del backend.
  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    user?.fullName?.trim() ||
    "Mi cuenta";

  // Marcamos el botón personal cuando se visita cualquier ruta de miembro.
  const isPersonalRoute =
    location.pathname === "/member" || location.pathname.startsWith("/member/");

  // Cerramos los paneles desplegados al cambiar la dirección de React Router.
  useEffect(() => {
    setMenuOpen(false);
    setPersonalOpen(false);
    setNotificationsOpen(false);
    setLogoutError("");
  }, [location.pathname]);

  // Escape cierra los menús y devuelve el foco al control correspondiente.
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key !== "Escape") return;

      // Si estaba abierto el desplegable personal, regresamos a su botón.
      if (personalOpen) personalButtonRef.current?.focus();

      // Si estaba abierto el panel de avisos, regresamos a la campana.
      if (notificationsOpen) notificationsButtonRef.current?.focus();

      // También cerramos el menú principal en dispositivos móviles.
      setPersonalOpen(false);
      setNotificationsOpen(false);
      setMenuOpen(false);
    };

    // Registramos la tecla de cierre mientras el encabezado esté montado.
    document.addEventListener("keydown", handleEscape);

    // Liberamos el evento para evitar escuchas duplicadas.
    return () => document.removeEventListener("keydown", handleEscape);
  }, [personalOpen, notificationsOpen]);

  // Un clic fuera del bloque «Mi espacio» cierra su menú personal.
  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!personalMenuRef.current?.contains(event.target)) {
        setPersonalOpen(false);
      }
    };

    // Escuchamos clics o toques sin afectar los enlaces de React Router.
    document.addEventListener("pointerdown", handlePointerDown);

    // Retiramos la escucha cuando se desmonta el componente.
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  // Cerramos avisos al hacer clic fuera de la campana y del propio panel.
  useEffect(() => {
    // El evento incluye tanto clics de mouse como toques en pantallas móviles.
    const handleOutsideNotificationClick = (event) => {
      // Si se interactúa con la campana no debemos cerrar antes de su onClick.
      if (notificationsButtonRef.current?.contains(event.target)) return;

      // Si se interactúa dentro del panel, conservamos el desplegable visible.
      if (notificationsPanelRef.current?.contains(event.target)) return;

      // Un clic fuera de ambos elementos oculta las notificaciones.
      setNotificationsOpen(false);
    };

    // Escuchamos clics y toques de toda la aplicación.
    document.addEventListener("pointerdown", handleOutsideNotificationClick);

    // Liberamos el evento para evitar escuchas duplicadas.
    return () => document.removeEventListener("pointerdown", handleOutsideNotificationClick);
  }, []);

  // Cierra la navegación móvil y su submenú cuando se selecciona un enlace.
  const closeMenu = () => {
    setMenuOpen(false);
    setPersonalOpen(false);
  };

  // El cierre de sesión conserva el endpoint y las cookies existentes.
  const handleLogout = async () => {
    // Evitamos solicitudes duplicadas al pulsar varias veces.
    if (isLoggingOut) return;

    // Bloqueamos el botón mientras espera al servidor.
    setIsLoggingOut(true);
    setLogoutError("");

    try {
      // Pedimos al backend eliminar la cookie de autenticación.
      const response = await api.post("/auth/logout");

      // Solo continuamos si la API confirmó el cierre.
      if (response.data?.success !== true) {
        throw new Error("El servidor no confirmó el cierre de sesión.");
      }

      // Eliminamos la conversación de Martín al cerrar la sesión.
      clearMartinChat();

      // Cerramos todos los menús y redirigimos al inicio de sesión.
      closeMenu();
      setNotificationsOpen(false);
      navigate("/login", { replace: true });
    } catch (error) {
      // Conservamos la sesión actual si el backend no pudo cerrar la sesión.
      setLogoutError("No fue posible cerrar sesión. Inténtalo nuevamente.");
      console.error("Error al cerrar sesión:", error);
    } finally {
      // React vuelve a habilitar el botón independientemente del resultado.
      setIsLoggingOut(false);
    }
  };

  // Mantenemos el estilo activo original de la navegación principal.
  const getLinkClass = ({ isActive }) =>
    isActive
      ? "member-header__link member-header__link--active"
      : "member-header__link";

  return (
    <header className="member-header">
      {/* =================================================== */}
      {/* FRANJA SUPERIOR: LOGO Y ACCIONES DE LA CUENTA */}
      {/* =================================================== */}
      <div className="member-header__top">
        <div className="member-header__container member-header__top-inner">
          {/* El logo conduce al panel personal del miembro autenticado. */}
          <Link
            className="member-header__brand"
            to="/member"
            onClick={closeMenu}
            aria-label="Ir a mi espacio en El Ancla"
          >
            <img className="member-header__logo" src={logoElAncla} alt="" />
            <span className="member-header__brand-text">
              <strong>El Ancla</strong>
              <small>Comunidad Cristiana · Mi espacio</small>
            </span>
          </Link>

          {/* Acciones de la cuenta disponibles en todas las páginas privadas. */}
          <div className="member-header__actions">
            {/* Campana de avisos; los turnos vienen desde la API autenticada. */}
            <div className="member-header__notifications">
              <button
                ref={notificationsButtonRef}
                className="member-header__icon-button"
                type="button"
                onClick={() => {
                  setNotificationsOpen((open) => !open);
                  setPersonalOpen(false);
                  setMenuOpen(false);
                }}
                aria-label="Notificaciones de la comunidad"
                aria-expanded={notificationsOpen}
                aria-controls="member-notifications-panel"
                title="Notificaciones"
              >
                <Bell size={21} strokeWidth={1.8} aria-hidden="true" />
                {(volunteerAlerts.length + supplyNeeds.length) > 0 && (
                  <span className="member-volunteer-alert-count" aria-hidden="true">
                    {volunteerAlerts.length + supplyNeeds.length > 9 ? "9+" : volunteerAlerts.length + supplyNeeds.length}
                  </span>
                )}
              </button>

            </div>

            {/* Volver al panel solamente para administradores autenticados. */}
            {adminPanelPath && (
              <Link
                className="member-header__admin-button"
                to={adminPanelPath}
                onClick={closeMenu}
              >
                <ArrowLeftToLine size={17} aria-hidden="true" />
                <span>Volver al panel</span>
              </Link>
            )}

            {/* Nombre visible como identidad; Mi cuenta está en el desplegable. */}
            <div className="member-header__account" title={displayName}>
              <UserRound size={19} aria-hidden="true" />
              <span className="member-header__account-name">{displayName}</span>
              {adminPanelPath && (
                <ShieldCheck size={15} aria-label="Cuenta administrativa" />
              )}
            </div>

            {/* El cierre de sesión funciona en escritorio y tablet. */}
            <button
              className="member-header__logout"
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              title="Cerrar sesión"
              aria-label={isLoggingOut ? "Cerrando sesión" : "Cerrar sesión"}
            >
              <LogOut size={20} strokeWidth={1.8} aria-hidden="true" />
            </button>

            {/* En móvil mostramos el icono que abre toda la navegación. */}
            <button
              className="member-header__menu-toggle"
              type="button"
              onClick={() => {
                setMenuOpen((open) => !open);
                setPersonalOpen(false);
              }}
              aria-expanded={menuOpen}
              aria-controls="member-header-navigation"
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {menuOpen
                ? <X size={24} aria-hidden="true" />
                : <Menu size={24} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* =================================================== */}
      {/* NAVEGACIÓN PRINCIPAL MÁS COMPACTA */}
      {/* =================================================== */}
      <div
        id="member-header-navigation"
        className={`member-header__navigation-wrap ${menuOpen ? "member-header__navigation-wrap--open" : ""}`}
      >
        <nav className="member-header__navigation" aria-label="Navegación de miembros">
          {/* Solo mostramos en la barra las páginas generales de la iglesia. */}
          {mainNavigation.map((item) => (
            <NavLink
              key={item.to}
              className={getLinkClass}
              to={item.to}
              end={item.end}
              onClick={closeMenu}
            >
              {item.label}
            </NavLink>
          ))}

          {/* Menú personal desplegable sin duplicar enlaces en la barra. */}
          <div className="member-header__personal" ref={personalMenuRef}>
            {/* Botón accesible: se abre con clic, Enter o Espacio. */}
            <button
              ref={personalButtonRef}
              type="button"
              className={`member-header__link member-header__personal-trigger ${isPersonalRoute ? "member-header__personal-trigger--active" : ""}`}
              aria-expanded={personalOpen}
              aria-controls="member-personal-navigation"
              onClick={() => {
                setPersonalOpen((open) => !open);
                setNotificationsOpen(false);
              }}
            >
              <UserRound size={17} aria-hidden="true" />
              Mi espacio
              <ChevronDown
                size={16}
                aria-hidden="true"
                className={`member-header__personal-chevron ${personalOpen ? "member-header__personal-chevron--open" : ""}`}
              />
            </button>

            {/* La lista solo existe visualmente cuando el usuario la abre. */}
            {personalOpen && (
              <div
                id="member-personal-navigation"
                className="member-header__personal-panel"
                aria-label="Opciones de mi espacio"
              >
                <span className="member-header__personal-heading">MI ESPACIO PERSONAL</span>

                {/* Cada opción apunta a la página privada que ya existe. */}
                {personalNavigation.map(({ label, to, icon: Icon, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      `member-header__personal-option${isActive ? " member-header__personal-option--active" : ""}`
                    }
                  >
                    <Icon size={17} aria-hidden="true" />
                    <span>{label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {/* Acciones secundarias que ya existían dentro del menú móvil. */}
          <div className="member-header__mobile-actions">
            {adminPanelPath && (
              <Link
                className="member-header__admin-button"
                to={adminPanelPath}
                onClick={closeMenu}
              >
                <ArrowLeftToLine size={17} aria-hidden="true" />
                Volver al panel
              </Link>
            )}
            <button
              className="member-header__mobile-logout"
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut size={18} aria-hidden="true" />
              {isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
            </button>
          </div>
        </nav>
      </div>

      {/* El panel vive al final del header, debajo de la navegación. */}
      {notificationsOpen && (
                <div
                  id="member-notifications-panel"
                  className="member-header__notifications-panel"
                  ref={notificationsPanelRef}
                  role="region"
                  aria-label="Notificaciones de la comunidad"
                >
                  <strong>Mis avisos de servicio</strong>
                  {assignmentsLoading ? (
                    <p role="status">Consultando tus avisos...</p>
                  ) : volunteerAlerts.length === 0 ? (
                    <p>No tienes avisos de voluntariado pendientes.</p>
                  ) : (
                    <div className="member-volunteer-alert-list">
                      {volunteerAlerts.slice(0, 5).map((alert) => (
                        <Link key={alert.id} to={alert.to} className="member-volunteer-alert">
                          <strong>{alert.title}</strong>
                          <span>{alert.message}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                  <Link className="member-volunteer-alert-more" to="/member/voluntariado" onClick={() => setNotificationsOpen(false)}>
                    Ver todos mis turnos
                  </Link>
                  <strong style={{display:"block", marginTop: "14px"}}>Insumos que necesitamos</strong>
                  {supplyNeedsLoading ? <p>Consultando necesidades...</p> : supplyNeeds.length === 0 ?
                    <p>Por ahora estamos bien abastecidos.</p> :
                    <div className="member-volunteer-alert-list">
                      {supplyNeeds.slice(0, 5).map((supply) =>
                        <Link key={supply.id} to="/member/insumos-basicos" className="member-volunteer-alert" onClick={() => setNotificationsOpen(false)}>
                          <strong>{supply.name}</strong>
                          <span>{supply.status === "out" ? "Agotado" : "Quedan pocas unidades"} · Puedes colaborar si lo deseas.</span>
                        </Link>
                      )}
                    </div>
                  }
                  <Link className="member-volunteer-alert-more" to="/member/insumos-basicos" onClick={() => setNotificationsOpen(false)}>
                    Ver necesidades de la iglesia
                  </Link>
                </div>
              )}

      {/* Notificamos fallos reales de la API durante el cierre de sesión. */}
      {logoutError && (
        <p className="member-header__error" role="alert">{logoutError}</p>
      )}
    </header>
  );
}

// Compartimos el header entre los roles member, admin y super_admin.
export default MemberHeader;


