// Importamos los iconos utilizados en el encabezado.
import {
  Bell,
  Menu,
  UserRound,
} from "lucide-react";

// Importamos los estilos exclusivos del encabezado.
import "../../../styles/components/admin/layout/AdminHeader.css";


// Creamos el encabezado del panel administrativo.
//
// onOpenSidebar será la función encargada
// de abrir el menú lateral en celulares.
function AdminHeader({
  onOpenSidebar,
}) {

  // Creamos un formateador para mostrar
  // la fecha actual en español.
  const formattedDate = new Intl.DateTimeFormat(
    "es-CL",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  ).format(new Date());


  // Retornamos el encabezado.
  return (
    <header className="admin-header">

      {/* ================================================= */}
      {/* PARTE IZQUIERDA */}
      {/* ================================================= */}

      <div className="admin-header__left">

        {/* Este botón solamente aparecerá en móviles. */}
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


        {/* Agrupamos el nombre del panel y la fecha. */}
        <div className="admin-header__information">

          {/* Identificamos el área actual. */}
          <span className="admin-header__section">
            Panel administrativo
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

        {/* Este botón se conectará posteriormente
            con el sistema de notificaciones. */}
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

          {/* Indicador visual temporal de notificaciones. */}
          <span
            className="admin-header__notification-indicator"
            aria-hidden="true"
          />
        </button>


        {/* Mostramos la información del administrador. */}
        <div className="admin-header__profile">

          {/* Utilizamos un avatar temporal. */}
          <div
            className="admin-header__avatar"
            aria-hidden="true"
          >
            <UserRound
              size={20}
              strokeWidth={1.8}
            />
          </div>


          {/* Agrupamos el nombre y el rol. */}
          <div className="admin-header__profile-text">

            {/* Este nombre será reemplazado posteriormente
                por la información obtenida desde la sesión. */}
            <strong>
              Administrador
            </strong>

            {/* Mostramos el rol actual. */}
            <span>
              Acceso administrativo
            </span>

          </div>

        </div>

      </div>

    </header>
  );
}


// Exportamos el componente.
export default AdminHeader;