// =========================================================
// ENCABEZADO COMPARTIDO DEL ESPACIO DE MIEMBROS
// =========================================================
// Se utiliza con los roles member, admin y super_admin.
// El rol se recibe desde la sesión comprobada por ProtectedRoute.

import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeftToLine,
  Bell,
  LogOut,
  Menu,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

// Servicio HTTP centralizado, configurado para enviar cookies HttpOnly.
import api from "../../../services/api";

// Logo oficial compartido con el sitio público.
import logoElAncla from "../../../assets/images/logo-el-ancla.png";

// CSS exclusivo, sin interferir con Header.css del sitio público.
import "../../../styles/components/member/layout/MemberHeader.css";

// Definimos los enlaces en un solo lugar para reutilizarlos en móvil.
const memberNavigation = [
  { label: "Inicio", to: "/", end: true },
  { label: "Nosotros", to: "/nosotros" },
  { label: "Eventos", to: "/eventos" },
  { label: "Recursos", to: "/member/recursos" },
  { label: "Recomendados", to: "/member/recomendados" },
  { label: "Peticiones de oración", to: "/member/peticiones-oracion" },
  { label: "Resumen financiero", to: "/member/finanzas" },
  { label: "Contacto", to: "/contacto" },
  { label: "Mi cuenta", to: "/member/mi-cuenta" },
];

function MemberHeader({ user }) {
  // Estado del menú de navegación en pantallas pequeñas.
  const [menuOpen, setMenuOpen] = useState(false);

  // Estado del panel informativo de notificaciones.
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Evita varios cierres de sesión simultáneos.
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Permite mostrar un error si el servidor no confirma el cierre.
  const [logoutError, setLogoutError] = useState("");

  // Navegamos sin recargar toda la PWA.
  const navigate = useNavigate();

  // Identificamos cuándo cambia la ruta seleccionada.
  const location = useLocation();

  // Referencia para situar el foco de regreso en la campana.
  const notificationsButtonRef = useRef(null);

  // Extraemos el rol desde la sesión validada, nunca desde localStorage.
  const role = user?.role;

  // Definimos un único destino de panel por rol autorizado.
  const adminPanelPath = role === "super_admin"
    ? "/super-admin"
    : role === "admin"
      ? "/admin"
      : null;

  // Construimos el nombre a partir de los datos reales de la cuenta.
  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    user?.fullName?.trim() ||
    "Mi cuenta";

  // Cerramos los menús cuando la persona cambia de página.
  useEffect(() => {
    setMenuOpen(false);
    setNotificationsOpen(false);
    setLogoutError("");
  }, [location.pathname]);

  // Permitimos cerrar los paneles al presionar Escape.
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setNotificationsOpen(false);
        notificationsButtonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Cerramos las opciones móviles al pulsar uno de sus enlaces.
  const closeMenu = () => setMenuOpen(false);

  // Cerramos la sesión utilizando el endpoint existente del backend.
  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    setLogoutError("");

    try {
      // El backend elimina la cookie de autenticación.
      const response = await api.post("/auth/logout");

      // No suponemos éxito si el backend no lo ha confirmado.
      if (response.data?.success !== true) {
        throw new Error("El servidor no confirmó el cierre de sesión.");
      }

      // Cerramos la navegación y volvemos a la pantalla pública de login.
      setMenuOpen(false);
      navigate("/login", { replace: true });
    } catch (error) {
      // Conservamos la sesión y avisamos que el cierre falló.
      setLogoutError("No fue posible cerrar sesión. Inténtalo nuevamente.");
      console.error("Error al cerrar sesión:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Comparte el indicador activo con los enlaces públicos y privados.
  const getLinkClass = ({ isActive }) =>
    isActive
      ? "member-header__link member-header__link--active"
      : "member-header__link";

  return (
    <header className="member-header">
      {/* Franja principal: logo y acciones de la cuenta. */}
      <div className="member-header__top">
        <div className="member-header__container member-header__top-inner">
          {/* Acceso rápido al inicio privado de la comunidad. */}
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

          {/* Herramientas disponibles para todo miembro autenticado. */}
          <div className="member-header__actions">
            {/* La campana tendrá avisos reales cuando exista su API de miembros. */}
            <div className="member-header__notifications">
              <button
                ref={notificationsButtonRef}
                className="member-header__icon-button"
                type="button"
                onClick={() => setNotificationsOpen((open) => !open)}
                aria-label="Notificaciones de la comunidad"
                aria-expanded={notificationsOpen}
                aria-controls="member-notifications-panel"
                title="Notificaciones"
              >
                <Bell size={21} strokeWidth={1.8} aria-hidden="true" />
              </button>

              {notificationsOpen && (
                <div
                  id="member-notifications-panel"
                  className="member-header__notifications-panel"
                  role="region"
                  aria-label="Notificaciones de la comunidad"
                >
                  <strong>Notificaciones</strong>
                  <p>
                    Próximamente verás aquí avisos, recordatorios de eventos
                    y noticias de la comunidad.
                  </p>
                  <small>Esta sección todavía no está conectada a notificaciones reales.</small>
                </div>
              )}
            </div>

            {/* Solo los administradores tienen un panel al que regresar. */}
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

            {/* La identidad procede del endpoint /auth/me. */}
            <Link
              className="member-header__account"
              to="/member/mi-cuenta"
              onClick={closeMenu}
              title={displayName}
            >
              <UserRound size={19} aria-hidden="true" />
              <span className="member-header__account-name">{displayName}</span>
              {adminPanelPath && (
                <ShieldCheck size={15} aria-label="Cuenta administrativa" />
              )}
            </Link>

            {/* El botón de cierre de sesión también funciona en escritorio. */}
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

            {/* Alterna el menú completo en dispositivos móviles. */}
            <button
              className="member-header__menu-toggle"
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="member-header-navigation"
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {menuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* Segunda franja: navegación pública y privada en un único menú. */}
      <div
        id="member-header-navigation"
        className={`member-header__navigation-wrap ${menuOpen ? "member-header__navigation-wrap--open" : ""}`}
      >
        <nav className="member-header__navigation" aria-label="Navegación de miembros">
          {/* Mi espacio es el inicio privado, distinto del inicio público. */}
          <NavLink
            className={getLinkClass}
            to="/member"
            end
            onClick={closeMenu}
          >
            Mi espacio
          </NavLink>

          {/* Los demás enlaces se generan desde la configuración compartida. */}
          {memberNavigation.map((item) => (
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

          {/* En móvil recuperamos acciones ocultas de la franja superior. */}
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

      {/* No ocultamos fallos del backend durante el cierre de sesión. */}
      {logoutError && (
        <p className="member-header__error" role="alert">{logoutError}</p>
      )}
    </header>
  );
}

export default MemberHeader;
