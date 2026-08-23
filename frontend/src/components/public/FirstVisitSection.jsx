// Importamos el icono de ubicación desde la carpeta de recursos.
import ubicacionIcon from "../../assets/icons/ubicacion.png";

// Importamos los estilos exclusivos del componente.
import "../../styles/components/public/FirstVisitSection.css";

// Creamos el componente para orientar a las personas nuevas.
function FirstVisitSection() {
  // Retornamos la estructura visual de la sección.
  return (
    // Esta sección presenta información inicial para nuevos visitantes.
    <section
      className="first-visit"
      aria-labelledby="first-visit-title"
    >
      {/* Contenedor que limita el ancho y centra el contenido. */}
      <div className="first-visit__container">
        {/* Bloque principal de información. */}
        <div className="first-visit__content">
          {/* Texto introductorio pequeño. */}
          <p className="first-visit__eyebrow">
            Queremos conocerte
          </p>

          {/* Título principal de la sección. */}
          <h2
            className="first-visit__title"
            id="first-visit-title"
          >
            ¿Es tu primera vez en El Ancla?
          </h2>

          {/* Descripción para orientar al visitante. */}
          <p className="first-visit__description">
            Nos alegrará recibirte. Conoce nuestros horarios, ubicación,
            actividades y todo lo necesario para participar por primera vez.
          </p>

          {/* Lista con información rápida. */}
          <ul className="first-visit__list">
            {/* Primer beneficio informativo. */}
            <li className="first-visit__list-item">
              {/* Elemento decorativo de la lista. */}
              <span
                className="first-visit__list-marker"
                aria-hidden="true"
              ></span>

              {/* Texto del beneficio. */}
              Encuentra fácilmente nuestros horarios y ubicación.
            </li>

            {/* Segundo beneficio informativo. */}
            <li className="first-visit__list-item">
              {/* Elemento decorativo de la lista. */}
              <span
                className="first-visit__list-marker"
                aria-hidden="true"
              ></span>

              {/* Texto del beneficio. */}
              Conoce las actividades abiertas a toda la comunidad.
            </li>

            {/* Tercer beneficio informativo. */}
            <li className="first-visit__list-item">
              {/* Elemento decorativo de la lista. */}
              <span
                className="first-visit__list-marker"
                aria-hidden="true"
              ></span>

              {/* Texto del beneficio. */}
              Resuelve tus dudas antes de acompañarnos.
            </li>
          </ul>

          {/* Contenedor de los botones principales. */}
          <div className="first-visit__actions">
           

            {/* Botón secundario hacia la página de contacto. */}
            <a
              className="first-visit__button first-visit__button--secondary"
              href="/contacto"
            >
              Contactarnos
            </a>
          </div>
        </div>

        {/* Bloque visual ubicado al costado derecho. */}
        <div
          className="first-visit__visual"
          aria-hidden="true"
        >
          {/* Círculo decorativo externo. */}
          <div className="first-visit__visual-circle">
            {/* Icono de ubicación. */}
            <img
              className="first-visit__icon"
              src={ubicacionIcon}
              alt=""
            />
          </div>

          {/* Tarjeta flotante con información resumida. */}
          <div className="first-visit__info-card">
            {/* Etiqueta de la información. */}
            <span className="first-visit__info-label">
              Nos encontramos en
            </span>

            {/* Dirección de la iglesia. */}
            <strong className="first-visit__info-address">
              Artillería 199, Playa Ancha
            </strong>

            {/* Ciudad y región. */}
            <span className="first-visit__info-city">
              Valparaíso, Chile
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

// Exportamos el componente para utilizarlo en Home.
export default FirstVisitSection;