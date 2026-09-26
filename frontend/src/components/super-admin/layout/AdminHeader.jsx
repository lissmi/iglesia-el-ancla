//frontend/src/components/super-admin/layout/AdminHeader.jsx

// Importamos las herramientas necesarias
// para manejar el estado y cargar
// la información de la sesión.
import {
  useEffect,
  useState,
} from "react";


// Importamos los iconos utilizados
// dentro del encabezado.
import {
  Bell,
  LoaderCircle,
  Menu,
  ShieldCheck,
  UserRound,
} from "lucide-react";


// Importamos la instancia centralizada de Axios.
//
// Esta instancia ya incluye:
//
// - La URL base del backend.
// - withCredentials: true.
// - Configuración JSON.
// - Timeout.
import api from "../../../services/api";


// Importamos los estilos
// exclusivos del encabezado.
import "../../../styles/components/super-admin/layout/AdminHeader.css";


// =========================================================
// COMPONENTE
// =========================================================

// Creamos el encabezado principal
// del panel del super administrador.
//
// onOpenSidebar:
// permite abrir el menú lateral
// cuando la aplicación se utiliza
// desde dispositivos móviles.
function AdminHeader({
  onOpenSidebar,
}) {

  // =========================================================
  // ESTADO DEL USUARIO
  // =========================================================

  // Guardamos la información
  // del usuario autenticado.
  const [
    currentUser,
    setCurrentUser,
  ] = useState(null);


  // Guardamos si todavía estamos
  // consultando la sesión.
  const [
    isLoadingUser,
    setIsLoadingUser,
  ] = useState(true);


  // =========================================================
  // FECHA ACTUAL
  // =========================================================

  // Creamos un formateador
  // para mostrar la fecha actual
  // utilizando formato chileno.
  const formattedDate =
    new Intl.DateTimeFormat(
      "es-CL",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    ).format(
      new Date()
    );


  // =========================================================
  // OBTENER SESIÓN ACTUAL
  // =========================================================

  useEffect(() => {

    // Creamos una función asíncrona
    // para consultar al backend.
    const loadCurrentUser = async () => {

      try {

        // Consultamos el endpoint protegido.
        //
        // Como api.js ya tiene
        // withCredentials: true,
        // la cookie HttpOnly será enviada
        // automáticamente.
        const response =
          await api.get(
            "/auth/me"
          );


        // Comprobamos que el backend
        // haya confirmado la sesión.
        if (
          response.data?.success &&
          response.data?.user
        ) {

          // Guardamos los datos
          // reales del usuario.
          setCurrentUser(
            response.data.user
          );
        }

      } catch (error) {

        // Si la sesión no es válida,
        // por ahora solamente registramos
        // el problema en consola.
        //
        // Más adelante ProtectedRoute
        // se encargará de redirigir
        // automáticamente al login.
        console.error(
          "No fue posible obtener la sesión actual:",
          error
        );

      } finally {

        // Indicamos que la consulta terminó,
        // independientemente de si fue
        // exitosa o produjo un error.
        setIsLoadingUser(false);
      }
    };


    // Ejecutamos la consulta
    // una vez al montar el componente.
    loadCurrentUser();

  }, []);


  // =========================================================
  // NOMBRE DEL USUARIO
  // =========================================================

  // Si todavía estamos cargando,
  // mostramos un texto temporal.
  //
  // Cuando la información llegue,
  // utilizaremos el nombre real.
  const displayName =
    currentUser?.fullName ||
    "Super administrador";


  // =========================================================
  // NOMBRE DEL ROL
  // =========================================================

  // Traducimos el valor interno
  // utilizado por MongoDB
  // a un texto legible.
  const roleLabels = {
    member:
      "Miembro",

    admin:
      "Administrador",

    super_admin:
      "Super administrador",
  };


  // Obtenemos el texto correspondiente
  // al rol actual.
  const displayRole =
    roleLabels[currentUser?.role] ||
    "Super administrador";


  // =========================================================
  // INTERFAZ
  // =========================================================

  return (
    <header className="admin-header">


      {/* ================================================= */}
      {/* PARTE IZQUIERDA */}
      {/* ================================================= */}

      <div className="admin-header__left">


        {/* Este botón aparece solamente
            cuando el sidebar debe abrirse
            desde una pantalla pequeña. */}
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


        {/* Agrupamos el nombre
            del panel y la fecha actual. */}
        <div className="admin-header__information">


          {/* Identificamos claramente
              el área actual del sistema. */}
          <span className="admin-header__section">
            Panel de super administración
          </span>


          {/* Mostramos la fecha actual. */}
          <span className="admin-header__date">
            {formattedDate}
          </span>


        </div>

      </div>


      {/* ================================================= */}
      {/* PARTE DERECHA */}
      {/* ================================================= */}

      <div className="admin-header__right">


        {/* ================================================= */}
        {/* NOTIFICACIONES */}
        {/* ================================================= */}

        <button
          className="admin-header__notification"
          type="button"
          aria-label="Ver notificaciones"
          title="Notificaciones"
        >

          <Bell
            size={21}
            strokeWidth={1.8}
            aria-hidden="true"
          />


          {/* Indicador visual temporal. */}
          <span
            className="admin-header__notification-indicator"
            aria-hidden="true"
          />

        </button>


        {/* ================================================= */}
        {/* PERFIL */}
        {/* ================================================= */}

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


          {/* Agrupamos el nombre
              y el rol del usuario. */}
          <div className="admin-header__profile-text">


            {/* Mostramos el nombre real
                obtenido desde MongoDB. */}
            <strong>
              {isLoadingUser
                ? "Cargando..."
                : displayName}
            </strong>


            {/* Mostramos el rol real
                de la cuenta autenticada. */}
            <span>

              <ShieldCheck
                size={13}
                strokeWidth={1.8}
                aria-hidden="true"
              />

              {displayRole}

            </span>


          </div>

        </div>

      </div>

    </header>
  );
}


// Exportamos el componente
// para utilizarlo dentro de AdminLayout.
export default AdminHeader;