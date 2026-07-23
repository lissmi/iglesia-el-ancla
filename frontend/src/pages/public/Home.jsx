// Importamos el Header público.
import Header from "../../components/public/Header";
// Importamos la sección de valores de la comunidad.
import CommunityValues from "../../components/public/CommunityValues";
// Importamos la sección de próximas actividades.
import UpcomingActivities from "../../components/public/UpcomingActivities";
// Importamos la sección informativa para personas nuevas.
import FirstVisitSection from "../../components/public/FirstVisitSection";
// Importamos el banner informativo sobre notificaciones.
import NotificationBanner from "../../components/public/NotificationBanner";
// Importamos el pie de página público.
import Footer from "../../components/public/Footer";

// Importamos el video del atardecer.
import videoAtardecer from "../../assets/images/atardecer-el-ancla.mp4";

// Importamos los estilos exclusivos de Home.
import "../../styles/pages/public/Home.css";

// Creamos la página principal.
function Home() {
    // Retornamos la estructura completa del Home.
    return (
        // Contenedor principal de la página.
        <div className="home">
            {/* Mostramos el encabezado sobre el video. */}
            <Header />

            {/* Sección principal de presentación. */}
            <main>
                {/* Hero principal del Home. */}
                <section className="home-hero">
                    {/* Video decorativo utilizado como fondo. */}
                    <video
                        className="home-hero__video"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        aria-hidden="true"
                    >
                        {/* Indicamos el archivo y su formato. */}
                        <source src={videoAtardecer} type="video/mp4" />
                    </video>

                    {/* Capa que mejora el contraste entre el video y el texto. */}
                    <div className="home-hero__overlay"></div>

                    {/* Contenedor del contenido principal. */}
                    <div className="home-hero__container">
                        {/* Bloque textual del Hero. */}
                        <div className="home-hero__content">
                            {/* Texto introductorio. */}
                            <p className="home-hero__eyebrow">
                                El Ancla Comunidad Cristiana
                            </p>

                            {/* Título principal. */}
                            <h1 className="home-hero__title">
                                Dios es nuestro ancla
                                <span className="home-hero__title-highlight">
                                    en toda tormenta.
                                </span>
                            </h1>

                            {/* Referencia bíblica. */}
                            <p className="home-hero__verse">
                                “Tenemos como firme y segura ancla del alma la esperanza.”
                                <span>Hebreos 6:19</span>
                            </p>

                            {/* Descripción breve de la iglesia. */}
                            <p className="home-hero__description">
                                Somos una iglesia cristiana no denominacional que cree en
                                el poder transformador de Dios y en la comunión que nos
                                une como familia.
                            </p>

                            {/* Contenedor de acciones principales. */}
                            <div className="home-hero__actions">
                                {/* Botón principal. */}
                                <a
                                    className="home-hero__button home-hero__button--primary"
                                    href="/nosotros"
                                >
                                    Conócenos
                                </a>

                                {/* Botón secundario. */}
                                <a
                                    className="home-hero__button home-hero__button--secondary"
                                    href="/actividades"
                                >
                                    Ver actividades
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Forma inferior decorativa. */}
                    <div className="home-hero__curve"></div>
                </section>
                {/* Mostramos los valores principales de la comunidad. */}
                <CommunityValues />
                {/* Mostramos las próximas actividades de la iglesia. */}
                <UpcomingActivities />
                {/* Mostramos información para personas que visitan la iglesia por primera vez. */}
                <FirstVisitSection />
                {/* Presentamos la futura función de notificaciones de la PWA. */}
                <NotificationBanner />
                {/* Pie de página principal. */}
                <Footer />
            </main>
        </div>
    );
}

// Exportamos Home para utilizarlo desde App.js.
export default Home;