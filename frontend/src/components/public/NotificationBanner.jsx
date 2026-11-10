
import { Link } from "react-router-dom";

// Importamos el icono institucional de notificaciones.
import mensajeIcon from "../../assets/icons/notificaciones.png";

// Importamos los estilos exclusivos del banner.
import "../../styles/components/public/NotificationBanner.css";

// Componente informativo de notificaciones de la página pública.
function NotificationBanner() {

  return (
    <section
      className="notification-banner"
      aria-labelledby="notification-banner-title"
    >

      {/* Contenedor principal del banner. */}
      <div className="notification-banner__container">

        {/* Elementos visuales decorativos. */}
        <div
          className="notification-banner__visual"
          aria-hidden="true"
        >

          {/* Círculo situado detrás del icono. */}
          <div className="notification-banner__icon-circle">

            {/* Icono de notificaciones. */}
            <img
              className="notification-banner__icon"
              src={mensajeIcon}
              alt=""
            />

          </div>

          {/* Ondas decorativas. */}
          <span className="notification-banner__wave notification-banner__wave--one" />
          <span className="notification-banner__wave notification-banner__wave--two" />

        </div>

        {/* Información de notificaciones. */}
        <div className="notification-banner__content">

          {/* Texto introductorio. */}
          <p className="notification-banner__eyebrow">
            Mantente informado
          </p>

          {/* Título principal. */}
          <h2
            className="notification-banner__title"
            id="notification-banner-title"
          >
            Recibe recordatorios de El Ancla
          </h2>

          {/* Descripción de la funcionalidad. */}
          <p className="notification-banner__description">
            Con nuestra aplicación podrás activar
            notificaciones en tu teléfono para recibir
            avisos de reuniones, actividades y novedades
            importantes de nuestra comunidad.
          </p>

          {/* Ejemplos de los avisos previstos. */}
          <ul className="notification-banner__features">

            <li className="notification-banner__feature">
              <span
                className="notification-banner__feature-marker"
                aria-hidden="true"
              />
              Recordatorios de reuniones y actividades.
            </li>

            <li className="notification-banner__feature">
              <span
                className="notification-banner__feature-marker"
                aria-hidden="true"
              />
              Avisos de cambios de horario o modalidad.
            </li>

            <li className="notification-banner__feature">
              <span
                className="notification-banner__feature-marker"
                aria-hidden="true"
              />
              Información relevante para la comunidad.
            </li>

          </ul>

          {/* Acceso al inicio de sesión para miembros. */}
          <Link
            to="/login"
            className="notification-banner__status"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            Inicia sesión para configurar tus avisos
          </Link>

        </div>
      </div>
    </section>
  );
}

// Exportamos el banner público.
export default NotificationBanner;
