// Importamos el icono relacionado con mensajes y notificaciones.
import mensajeIcon from "../../assets/icons/notificaciones.png";

// Importamos el archivo CSS exclusivo del componente.
import "../../styles/components/public/NotificationBanner.css";

// Creamos el componente del banner de notificaciones.
function NotificationBanner() {
  // Retornamos la estructura visual del banner.
  return (
    // Sección que presenta la futura función de notificaciones.
    <section
      className="notification-banner"
      aria-labelledby="notification-banner-title"
    >
      {/* Contenedor principal que limita y centra el contenido. */}
      <div className="notification-banner__container">
        {/* Bloque visual que contiene el icono. */}
        <div
          className="notification-banner__visual"
          aria-hidden="true"
        >
          {/* Círculo decorativo ubicado detrás del icono. */}
          <div className="notification-banner__icon-circle">
            {/* Mostramos el icono de mensajes. */}
            <img
              className="notification-banner__icon"
              src={mensajeIcon}
              alt=""
            />
          </div>

          {/* Primera onda decorativa alrededor del icono. */}
          <span className="notification-banner__wave notification-banner__wave--one"></span>

          {/* Segunda onda decorativa alrededor del icono. */}
          <span className="notification-banner__wave notification-banner__wave--two"></span>
        </div>

        {/* Bloque de contenido textual. */}
        <div className="notification-banner__content">
          {/* Texto introductorio pequeño. */}
          <p className="notification-banner__eyebrow">
            Mantente informado
          </p>

          {/* Título principal del banner. */}
          <h2
            className="notification-banner__title"
            id="notification-banner-title"
          >
            Recibe recordatorios de El Ancla
          </h2>

          {/* Explicación de la función. */}
          <p className="notification-banner__description">
            Activa las notificaciones de nuestra PWA para recibir
            recordatorios de reuniones, actividades, novedades y cambios
            importantes de horario.
          </p>

          {/* Lista de ejemplos de notificaciones. */}
          <ul className="notification-banner__features">
            {/* Primer tipo de aviso. */}
            <li className="notification-banner__feature">
              {/* Indicador decorativo. */}
              <span
                className="notification-banner__feature-marker"
                aria-hidden="true"
              ></span>

              Recordatorios de reuniones y actividades.
            </li>

            {/* Segundo tipo de aviso. */}
            <li className="notification-banner__feature">
              {/* Indicador decorativo. */}
              <span
                className="notification-banner__feature-marker"
                aria-hidden="true"
              ></span>

              Avisos de cambios de horario o modalidad.
            </li>

            {/* Tercer tipo de aviso. */}
            <li className="notification-banner__feature">
              {/* Indicador decorativo. */}
              <span
                className="notification-banner__feature-marker"
                aria-hidden="true"
              ></span>

              Información relevante para la comunidad.
            </li>
          </ul>

          {/* Mensaje temporal mientras Firebase todavía no está conectado. */}
          <p className="notification-banner__status">
            Próximamente.
          </p>
        </div>
      </div>
    </section>
  );
}

// Exportamos el componente para utilizarlo en Home.
export default NotificationBanner;