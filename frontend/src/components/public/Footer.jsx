// Importamos el logo oficial de la iglesia.
import logoElAncla from "../../assets/images/logo-el-ancla.png";

// Importamos el icono de ubicación.
import ubicacionIcon from "../../assets/icons/ubicacion.png";

// Importamos el icono de Facebook.
import facebookIcon from "../../assets/icons/fb.png";

// Importamos el icono de Instagram.
import instagramIcon from "../../assets/icons/insta.png";

// Importamos el icono de escribenos.
import escribenosIcon from "../../assets/icons/escribenos.png";


// Importamos los estilos exclusivos del Footer.
import "../../styles/components/public/Footer.css";

// Creamos el componente Footer.
function Footer() {
  // Obtenemos automáticamente el año actual.
  const currentYear = new Date().getFullYear();

  // Retornamos la estructura visual del pie de página.
  return (
    // Footer representa el cierre principal del sitio.
    <footer className="footer">
      {/* Contenedor superior del Footer. */}
      <div className="footer__main">
        {/* Contenedor que limita y centra el contenido. */}
        <div className="footer__container">
          {/* Primera columna: identidad de la iglesia. */}
          <div className="footer__brand-column">
            {/* Enlace que lleva al inicio del sitio. */}
            <a
              className="footer__brand"
              href="/"
              aria-label="Ir al inicio de El Ancla Comunidad Cristiana"
            >
              {/* Mostramos el logo oficial. */}
              <img
                className="footer__logo"
                src={logoElAncla}
                alt="Logo de El Ancla Comunidad Cristiana"
              />
            </a>

            {/* Breve descripción de la comunidad. */}
            <p className="footer__description">
              Una comunidad cristiana que busca crecer en la Palabra,
              servir con amor y permanecer firme en Cristo.
            </p>

            {/* Versículo representativo de la iglesia. */}
            <p className="footer__verse">
              “Tenemos como firme y segura ancla del alma la esperanza.”
              <span>Hebreos 6:19</span>
            </p>
          </div>

          {/* Segunda columna: enlaces de navegación. */}
          <div className="footer__column">
            {/* Título de la columna. */}
            <h2 className="footer__column-title">
              Navegación
            </h2>

            {/* Lista de enlaces principales. */}
            <nav
              className="footer__navigation"
              aria-label="Navegación del pie de página"
            >
              {/* Enlace de inicio. */}
              <a className="footer__link" href="/">
                Inicio
              </a>

              {/* Enlace institucional. */}
              <a className="footer__link" href="/nosotros">
                Nosotros
              </a>

              {/* Enlace de actividades. */}
              <a className="footer__link" href="/actividades">
                Actividades
              </a>

              {/* Enlace de eventos. */}
              <a className="footer__link" href="/eventos">
                Eventos
              </a>

              {/* Enlace de recursos. */}
              <a className="footer__link" href="/recursos">
                Recursos
              </a>

              {/* Enlace de galería. */}
              <a className="footer__link" href="/galeria">
                Galería
              </a>
            </nav>
          </div>

          {/* Tercera columna: información de contacto. */}
          <div className="footer__column">
            {/* Título de la columna. */}
            <h2 className="footer__column-title">
              Encuéntranos
            </h2>

            {/* Lista con información de contacto. */}
            <div className="footer__contact-list">
              {/* Dirección de la iglesia. */}
              <div className="footer__contact-item">
                {/* Icono de ubicación. */}
                <img
                  className="footer__contact-icon"
                  src={ubicacionIcon}
                  alt=""
                  aria-hidden="true"
                />

                {/* Bloque textual de la dirección. */}
                <div className="footer__contact-text">
                  {/* Etiqueta del dato. */}
                  <span className="footer__contact-label">
                    Dirección
                  </span>

                  {/* Valor del dato. */}
                  <span className="footer__contact-value">
                    Artillería 199, Playa Ancha
                    <br />
                    Valparaíso, Chile
                  </span>
                </div>
              </div>

              {/* Acceso a la página de contacto. */}
              <a
                className="footer__contact-item footer__contact-item--link"
                href="/contacto"
              >
                {/* Icono de mensaje. */}
                <img
                  className="footer__contact-icon"
                  src={escribenosIcon}
                  alt=""
                  aria-hidden="true"
                />

                {/* Bloque textual de contacto. */}
                <div className="footer__contact-text">
                  {/* Etiqueta del enlace. */}
                  <span className="footer__contact-label">
                    ¿Necesitas ayuda?
                  </span>

                  {/* Texto principal del enlace. */}
                  <span className="footer__contact-value">
                    Escríbenos desde la sección de contacto
                  </span>
                </div>
              </a>
            </div>
          </div>

          {/* Cuarta columna: redes sociales. */}
          <div className="footer__column">
            {/* Título de la columna. */}
            <h2 className="footer__column-title">
              Síguenos
            </h2>

            {/* Texto introductorio de redes sociales. */}
            <p className="footer__social-description">
              Conoce nuestras novedades, reuniones y actividades en redes
              sociales.
            </p>

            {/* Contenedor de los enlaces sociales. */}
            <div className="footer__social-links">
              {/* Enlace de Facebook. */}
              <a
                className="footer__social-link"
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visitar Facebook de El Ancla"
              >
                {/* Icono de Facebook. */}
                <img
                  className="footer__social-icon"
                  src={facebookIcon}
                  alt=""
                  aria-hidden="true"
                />
              </a>

              {/* Enlace de Instagram. */}
              <a
                className="footer__social-link"
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visitar Instagram de El Ancla"
              >
                {/* Icono de Instagram. */}
                <img
                  className="footer__social-icon"
                  src={instagramIcon}
                  alt=""
                  aria-hidden="true"
                />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Franja inferior del Footer. */}
      <div className="footer__bottom">
        {/* Contenedor de la información inferior. */}
        <div className="footer__bottom-container">
          {/* Información de derechos del sitio. */}
          <p className="footer__copyright">
            © {currentYear} El Ancla Comunidad Cristiana. Todos los
            derechos reservados.
          </p>

          {/* Frase final representativa. */}
          <p className="footer__blessing">
            Firmes en la Palabra, anclados en Cristo.
          </p>
        </div>
      </div>
    </footer>
  );
}

// Exportamos el Footer para utilizarlo en las páginas públicas.
export default Footer;