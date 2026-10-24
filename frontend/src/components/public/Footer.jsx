
// Importamos el logo oficial de la iglesia.
import logoElAncla from "../../assets/images/logo-el-ancla.png";

// Importamos los iconos utilizados en el Footer.
import ubicacionIcon from "../../assets/icons/ubicacion.png";
import facebookIcon from "../../assets/icons/fb.png";
import instagramIcon from "../../assets/icons/insta.png";
import escribenosIcon from "../../assets/icons/escribenos.png";

// Importamos los estilos exclusivos del Footer.
import "../../styles/components/public/Footer.css";

// Creamos el componente del pie de página público.
function Footer() {

    // Obtenemos automáticamente el año actual.
    const currentYear = new Date().getFullYear();

    // Retornamos la estructura visual del Footer.
    return (
        <footer className="footer">

            {/* Contenedor superior del Footer. */}
            <div className="footer__main">

                {/* Contenedor que limita y centra el contenido. */}
                <div className="footer__container">

                    {/* Primera columna: identidad institucional. */}
                    <div className="footer__brand-column">

                        {/* Logo con enlace a la página de inicio. */}
                        <a
                            className="footer__brand"
                            href="/"
                            aria-label="Ir al inicio de El Ancla Comunidad Cristiana"
                        >
                            <img
                                className="footer__logo"
                                src={logoElAncla}
                                alt="Logo de El Ancla Comunidad Cristiana"
                            />
                        </a>

                        {/* Descripción de la comunidad. */}
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

                    {/* Segunda columna: navegación pública. */}
                    <div className="footer__column">

                        {/* Título de la columna. */}
                        <h2 className="footer__column-title">
                            Navegación
                        </h2>

                        {/* Enlaces disponibles para visitantes. */}
                        <nav
                            className="footer__navigation"
                            aria-label="Navegación del pie de página"
                        >

                            {/* Página principal. */}
                            <a className="footer__link" href="/">
                                Inicio
                            </a>

                            {/* Información institucional. */}
                            <a className="footer__link" href="/nosotros">
                                Nosotros
                            </a>

                            {/* Eventos públicos. */}
                            <a className="footer__link" href="/eventos">
                                Eventos
                            </a>

                            {/*
                             * Recursos fue retirado de la navegación.
                             * Su acceso ahora corresponde al área
                             * privada de los miembros registrados.
                             */}

                            {/* Términos y condiciones. */}
                            <a
                                className="footer__link"
                                href="/terminos-y-condiciones"
                            >
                                Términos y Condiciones
                            </a>

                            {/* Política de privacidad. */}
                            <a
                                className="footer__link"
                                href="/politica-de-privacidad"
                            >
                                Política de privacidad
                            </a>

                        </nav>
                    </div>

                    {/* Tercera columna: información de contacto. */}
                    <div className="footer__column">

                        {/* Título de la columna. */}
                        <h2 className="footer__column-title">
                            Encuéntranos
                        </h2>

                        {/* Contenedor de los datos de contacto. */}
                        <div className="footer__contact-list">

                            {/* Dirección física de la iglesia. */}
                            <div className="footer__contact-item">

                                {/* Icono de ubicación. */}
                                <img
                                    className="footer__contact-icon"
                                    src={ubicacionIcon}
                                    alt=""
                                    aria-hidden="true"
                                />

                                {/* Texto de la dirección. */}
                                <div className="footer__contact-text">

                                    <span className="footer__contact-label">
                                        Dirección
                                    </span>

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

                                {/* Texto del acceso a contacto. */}
                                <div className="footer__contact-text">

                                    <span className="footer__contact-label">
                                        ¿Necesitas ayuda?
                                    </span>

                                    <span className="footer__contact-value">
                                        Escríbenos desde la sección de contacto
                                    </span>

                                </div>
                            </a>

                        </div>
                    </div>

                    {/* Cuarta columna: redes sociales. */}
                    <div className="footer__column">

                        {/* Título de redes sociales. */}
                        <h2 className="footer__column-title">
                            Síguenos
                        </h2>

                        {/* Descripción de redes sociales. */}
                        <p className="footer__social-description">
                            Conoce nuestras novedades, reuniones y actividades en redes
                            sociales.
                        </p>

                        {/* Contenedor de los enlaces sociales. */}
                        <div className="footer__social-links">

                            {/* Enlace oficial de Facebook. */}
                            <a
                                className="footer__social-link"
                                href="https://www.facebook.com/elanclacomunidad"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Visitar Facebook de El Ancla"
                            >
                                <img
                                    className="footer__social-icon"
                                    src={facebookIcon}
                                    alt=""
                                    aria-hidden="true"
                                />
                            </a>

                            {/* Enlace oficial de Instagram. */}
                            <a
                                className="footer__social-link"
                                href="https://www.instagram.com/el.ancla.comunidad.cristiana/"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Visitar Instagram de El Ancla"
                            >
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

                {/* Contenedor inferior. */}
                <div className="footer__bottom-container">

                    {/* Derechos del sitio. */}
                    <p className="footer__copyright">
                        © {currentYear} El Ancla Comunidad Cristiana. Todos los
                        derechos reservados.
                    </p>

                    {/* Frase representativa de la iglesia. */}
                    <p className="footer__blessing">
                        Firmes en la Palabra, anclados en Cristo.
                    </p>

                </div>
            </div>

        </footer>
    );
}

// Exportamos el componente para las páginas públicas.
export default Footer;
