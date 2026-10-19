
import {
  useEffect,
  useState,
} from "react";

// =========================================================
// REACT ROUTER
// =========================================================

// Permite identificar el panel administrativo
// según la ruta actual.
import { useLocation } from "react-router-dom";

// =========================================================
// ICONOS
// =========================================================

import {
  LoaderCircle,
  Menu,
  ShieldCheck,
  UserRound,
} from "lucide-react";

// =========================================================
// SERVICIOS
// =========================================================

// Instancia centralizada de Axios.
//
// Incluye:
// - URL base del backend.
// - withCredentials: true.
// - Configuración JSON.
// - Timeout.
import api from "../../../services/api";

// Centro de notificaciones aislado del encabezado.
import NotificationCenter from "../notifications/NotificationCenter";

// =========================================================
// ESTILOS
// =========================================================

import "../../../styles/components/administration/layout/AdminHeader.css";

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

// Encabezado compartido por los paneles:
//
// - admin
// - super_admin
//
// onOpenSidebar:
// abre el menú lateral en dispositivos móviles.

function AdminHeader({ onOpenSidebar }) {

  // =========================================================
  // IDENTIFICACIÓN DEL PANEL
  // =========================================================

  // Obtenemos la ubicación actual de React Router.
  const location = useLocation();

  // Determinamos si estamos dentro del panel
  // correspondiente al superadministrador.
  const isSuperAdminPanel =
    location.pathname === "/super-admin" ||
    location.pathname.startsWith("/super-admin/");

  // Definimos el título según el panel actual.
  //
  // Este valor se utiliza únicamente para
  // identificar visualmente el espacio.
  // No determina los permisos del usuario.
  const panelTitle = isSuperAdminPanel
    ? "Panel de super administración"
    : "Panel de administración";

  // =========================================================
  // ESTADO DEL USUARIO
  // =========================================================

  // Almacenamos la información obtenida
  // desde la sesión autenticada.
  const [
    currentUser,
    setCurrentUser,
  ] = useState(null);

  // Controlamos la carga inicial
  // de los datos del usuario.
  const [
    isLoadingUser,
    setIsLoadingUser,
  ] = useState(true);

  // =========================================================
  // FECHA ACTUAL
  // =========================================================

  // Formateamos la fecha utilizando
  // la configuración regional de Chile.
  const formattedDate =
    new Intl.DateTimeFormat(
      "es-CL",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    ).format(new Date());

  // =========================================================
  // OBTENER SESIÓN ACTUAL
  // =========================================================

  useEffect(() => {

    // Evita actualizar el estado si el
    // componente se desmonta antes de
    // finalizar la solicitud.
    let isMounted = true;

    // Consultamos la sesión actual.
    const loadCurrentUser = async () => {

      try {

        // El backend valida la cookie HttpOnly.
        // No enviamos identificadores de usuario
        // manualmente desde el frontend.
        const response = await api.get("/auth/me");

        // Evitamos modificar el estado
        // si el componente ya fue desmontado.
        if (!isMounted) {
          return;
        }

        // Verificamos que la sesión
        // haya sido confirmada.
        if (
          response.data?.success &&
          response.data?.user
        ) {

          // Guardamos la identidad real
          // devuelta por el servidor.
          setCurrentUser(response.data.user);

        } else {

          // No conservamos datos anteriores
          // si la respuesta no confirma la sesión.
          setCurrentUser(null);

        }

      } catch (error) {

        if (!isMounted) {
          return;
        }

        // Ante un error, no mostramos
        // información de una sesión anterior.
        setCurrentUser(null);

        // ProtectedRoute es responsable
        // de controlar el acceso a las rutas.
        console.error(
          "No fue posible obtener la sesión actual:",
          error
        );

      } finally {

        if (isMounted) {
          setIsLoadingUser(false);
        }

      }
    };

    loadCurrentUser();

    // Limpieza del efecto.
    return () => {
      isMounted = false;
    };

  }, []);

  // =========================================================
  // NOMBRE DEL USUARIO
  // =========================================================

  // Utilizamos el nombre completo cuando
  // el backend lo proporciona.
  const fullName =
    typeof currentUser?.fullName === "string"
      ? currentUser.fullName.trim()
      : "";

  // Alternativamente, construimos el nombre
  // con firstName y lastName si existen.
  const composedName = [
    currentUser?.firstName,
    currentUser?.lastName,
  ]
    .filter(
      (value) =>
        typeof value === "string" &&
        value.trim().length > 0
    )
    .map((value) => value.trim())
    .join(" ");

  // Evitamos asumir que el usuario
  // siempre tiene el rol super_admin.
  const displayName =
    fullName ||
    composedName ||
    "Usuario";

  // =========================================================
  // NOMBRE DEL ROL
  // =========================================================

  // Etiquetas legibles de los roles.
  const roleLabels = {
    member: "Miembro",
    admin: "Administrador",
    super_admin: "Super administrador",
  };

  // El rol se obtiene de la sesión verificada,
  // no de la ruta del navegador.
  const displayRole =
    roleLabels[currentUser?.role] ||
    "Rol no disponible";

  // =========================================================
  // INTERFAZ
  // =========================================================

  return (
    <header className="admin-header">

      {/* ================================================= */}
      {/* PARTE IZQUIERDA */}
      {/* ================================================= */}

      <div className="admin-header__left">

        {/* Botón para abrir el sidebar móvil. */}
        <button
          className="admin-header__menu-button"
          type="button"
          onClick={onOpenSidebar}
          aria-label="Abrir menú administrativo"
        >
          <Menu
            size={23}
            strokeWidth={2}
            aria-hidden="true"
          />
        </button>

        {/* Nombre del panel y fecha actual. */}
        <div className="admin-header__information">

          {/* El título se adapta a la ruta actual. */}
          <span className="admin-header__section">
            {panelTitle}
          </span>

          {/* Fecha con formato chileno. */}
          <span className="admin-header__date">
            {formattedDate}
          </span>

        </div>

      </div>

      {/* ================================================= */}
      {/* PARTE DERECHA */}
      {/* ================================================= */}

      <div className="admin-header__right">

        {/* =============================================== */}
        {/* NOTIFICACIONES */}
        {/* =============================================== */}

        {/* La campana abre el centro de notificaciones. */}
        <NotificationCenter />

        {/* =============================================== */}
        {/* PERFIL DEL USUARIO */}
        {/* =============================================== */}

        <div className="admin-header__profile">

          {/* Avatar temporal. */}
          <div
            className="admin-header__avatar"
            aria-hidden="true"
          >

            {isLoadingUser ? (

              <LoaderCircle
                className="admin-header__loading-icon"
                size={20}
                strokeWidth={1.8}
              />

            ) : (

              <UserRound
                size={20}
                strokeWidth={1.8}
              />

            )}

          </div>

          {/* Nombre y rol del usuario autenticado. */}
          <div className="admin-header__profile-text">

            {/* Nombre obtenido desde el backend. */}
            <strong>
              {isLoadingUser
                ? "Cargando..."
                : displayName}
            </strong>

            {/* Rol obtenido desde la sesión. */}
            <span>

              <ShieldCheck
                size={13}
                strokeWidth={1.8}
                aria-hidden="true"
              />

              {isLoadingUser
                ? "Verificando sesión..."
                : displayRole}

            </span>

          </div>

        </div>

      </div>

    </header>
  );
}

// =========================================================
// EXPORTACIÓN
// =========================================================

export default AdminHeader;
