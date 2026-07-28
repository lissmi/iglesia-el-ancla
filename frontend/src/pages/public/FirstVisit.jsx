import { Link } from "react-router-dom";

import Header from "../../components/public/Header";
import locationIcon from "../../assets/icons/ubicacion.png";
import firstvisitIcon from "../../assets/icons/primera-visita.png";

import "../../styles/pages/public/FirstVisit.css";

function FirstVisit() {
    return (
        <>
            <Header />

            <main className="first-visit-page">
                {/* ================================================= */}
                {/* HERO PRINCIPAL */}
                {/* ================================================= */}

                <section className="first-visit-hero">
                    <div className="first-visit-hero__overlay" />

                    <div
                        className="first-visit-hero__decoration"
                        aria-hidden="true"
                    >
                        <img
                            src={firstvisitIcon}
                            alt=""
                        />
                    </div>

                    <div className="first-visit-hero__container">
                        <nav
                            className="first-visit-breadcrumb"
                            aria-label="Ruta de navegación"
                        >
                            <Link to="/">
                                Inicio
                            </Link>

                            <span aria-hidden="true">
                                /
                            </span>

                            <span aria-current="page">
                                Primera visita
                            </span>
                        </nav>

                        <p className="first-visit-hero__eyebrow">
                            Queremos conocerte
                        </p>

                        <h1>
                            ¿Es tu primera vez en El Ancla?
                        </h1>

                        <p className="first-visit-hero__description">
                            Nos alegrará recibirte. Aquí
                            encontrarás nuestros horarios,
                            ubicación y toda la información
                            necesaria para acompañarnos por
                            primera vez.
                        </p>

                        <div className="first-visit-hero__actions">
                            <Link to="/nosotros">
                                Conócenos
                            </Link>

                            <Link to="/contacto">
                                Contáctanos
                            </Link>
                        </div>
                    </div>

                    <div className="first-visit-hero__curve" />
                </section>

                {/* ================================================= */}
                {/* INTRODUCCIÓN */}
                {/* ================================================= */}

                <section
                    id="informacion-visita"
                    className="first-visit-welcome"
                >
                    <div className="first-visit-welcome__container">
                        <div className="first-visit-welcome__content">
                            <p className="first-visit-section__eyebrow">
                                Tu primera visita
                            </p>

                            <h2>
                                Queremos que puedas llegar con
                                tranquilidad
                            </h2>

                            <p>
                                Sabemos que visitar una iglesia
                                por primera vez puede generar
                                algunas dudas. Por eso reunimos
                                aquí la información principal
                                para que sepas dónde estamos,
                                cuáles son nuestros horarios y
                                qué puedes esperar cuando nos
                                visites.
                            </p>

                            <p>
                                No necesitas inscribirte ni
                                conocer previamente el desarrollo
                                de la reunión. Puedes llegar,
                                acompañarnos y participar a tu
                                propio ritmo.
                            </p>
                        </div>

                        <aside className="first-visit-location-card">
                            <div className="first-visit-location-card__icon">
                                <img
                                    src={locationIcon}
                                    alt=""
                                    aria-hidden="true"
                                />
                            </div>

                            <p>
                                Nos encontramos en
                            </p>

                            <h3>
                                Artillería 199, Playa Ancha
                            </h3>

                            <span>
                                Valparaíso, Chile
                            </span>

                            <Link to="/contacto">
                                Ver ubicación y contacto

                                <strong aria-hidden="true">
                                    →
                                </strong>
                            </Link>
                        </aside>
                    </div>
                </section>

                {/* ================================================= */}
                {/* HORARIOS PRINCIPALES */}
                {/* ================================================= */}

                <section className="first-visit-schedule">
                    <div className="first-visit-schedule__container">
                        <div className="first-visit-schedule__heading">
                            <div>
                                <p className="first-visit-section__eyebrow">
                                    Cada domingo
                                </p>

                                <h2>
                                    Nuestros horarios
                                    principales
                                </h2>
                            </div>

                            <p>
                                Puedes acompañarnos durante toda
                                la jornada o llegar directamente
                                a la reunión en la que deseas
                                participar.
                            </p>
                        </div>

                        <div className="first-visit-schedule__grid">
                            <article className="first-visit-schedule-card">
                                <span className="first-visit-schedule-card__number">
                                    01
                                </span>

                                <p className="first-visit-schedule-card__time">
                                    09:30 hrs
                                </p>

                                <h3>
                                    Reunión de oración
                                    dominical
                                </h3>

                                <p>
                                    Comenzamos el domingo
                                    reuniéndonos para orar juntos
                                    y presentar nuestras
                                    necesidades delante de Dios.
                                </p>

                                <span className="first-visit-schedule-card__mode">
                                    Presencial
                                </span>
                            </article>

                            <article className="first-visit-schedule-card">
                                <span className="first-visit-schedule-card__number">
                                    02
                                </span>

                                <p className="first-visit-schedule-card__time">
                                    10:00 hrs
                                </p>

                                <h3>
                                    Desayuno comunitario
                                </h3>

                                <p>
                                    Compartimos un momento para
                                    desayunar, conversar y
                                    fortalecer nuestros vínculos
                                    como hermanos antes del culto
                                    general.
                                </p>

                                <span className="first-visit-schedule-card__mode">
                                    Presencial
                                </span>
                            </article>

                            <article className="first-visit-schedule-card">
                                <span className="first-visit-schedule-card__number">
                                    03
                                </span>

                                <p className="first-visit-schedule-card__time">
                                    11:00 hrs
                                </p>

                                <h3>
                                    Culto general
                                </h3>

                                <p>
                                    Nos reunimos como comunidad
                                    para adorar a Dios, aprender
                                    de Su Palabra y compartir
                                    juntos como hermanos.
                                </p>

                                <span className="first-visit-schedule-card__mode">
                                    Presencial
                                </span>
                            </article>
                        </div>

                        <div className="first-visit-schedule__footer">
                            <p>
                                Todas estas reuniones se realizan
                                en Artillería 199, Playa Ancha.
                            </p>

                            <Link to="/eventos">
                                Ver actividades y eventos

                                <span aria-hidden="true">
                                    →
                                </span>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ================================================= */}
                {/* QUÉ PUEDES ESPERAR */}
                {/* ================================================= */}

                <section className="first-visit-expect">
                    <div className="first-visit-expect__container">
                        <div className="first-visit-expect__heading">
                            <p className="first-visit-section__eyebrow">
                                Cuando nos visites
                            </p>

                            <h2>
                                ¿Qué puedes esperar?
                            </h2>

                            <p>
                                Queremos que encuentres un
                                espacio donde puedas sentirte
                                recibido, respetado y acompañado.
                            </p>
                        </div>

                        <div className="first-visit-expect__list">
                            <article>
                                <span aria-hidden="true">
                                    01
                                </span>

                                <div>
                                    <h3>
                                        Una bienvenida cercana
                                    </h3>

                                    <p>
                                        Podrás llegar con
                                        tranquilidad. Siempre
                                        habrá personas dispuestas
                                        a recibirte y orientarte
                                        si tienes alguna duda.
                                    </p>
                                </div>
                            </article>

                            <article>
                                <span aria-hidden="true">
                                    02
                                </span>

                                <div>
                                    <h3>
                                        Adoración y oración
                                    </h3>

                                    <p>
                                        Compartimos momentos de
                                        alabanza y oración como
                                        comunidad, presentando
                                        nuestra gratitud y
                                        necesidades delante de
                                        Dios.
                                    </p>
                                </div>
                            </article>

                            <article>
                                <span aria-hidden="true">
                                    03
                                </span>

                                <div>
                                    <h3>
                                        Enseñanza bíblica
                                    </h3>

                                    <p>
                                        Durante el culto
                                        escuchamos un mensaje
                                        basado en la Biblia y
                                        reflexionamos sobre cómo
                                        aplicarlo a nuestra vida.
                                    </p>
                                </div>
                            </article>

                            <article>
                                <span aria-hidden="true">
                                    04
                                </span>

                                <div>
                                    <h3>
                                        Comunidad y conversación
                                    </h3>

                                    <p>
                                        También encontrarás
                                        espacios para conversar,
                                        compartir y conocer a
                                        otras personas de la
                                        comunidad.
                                    </p>
                                </div>
                            </article>
                        </div>
                    </div>
                </section>

                {/* ================================================= */}
                {/* INFORMACIÓN PRÁCTICA */}
                {/* ================================================= */}

                <section className="first-visit-practical">
                    <div className="first-visit-practical__container">
                        <div className="first-visit-practical__heading">
                            <p className="first-visit-section__eyebrow">
                                Antes de acompañarnos
                            </p>

                            <h2>
                                Información práctica
                            </h2>
                        </div>

                        <div className="first-visit-practical__grid">
                            <article>
                                <span className="first-visit-practical__label">
                                    Inscripción
                                </span>

                                <h3>
                                    No necesitas registrarte
                                </h3>

                                <p>
                                    Para asistir a las reuniones
                                    generales no necesitas
                                    completar una inscripción
                                    previa.
                                </p>
                            </article>

                            <article>
                                <span className="first-visit-practical__label">
                                    Participación
                                </span>

                                <h3>
                                    Puedes avanzar a tu ritmo
                                </h3>

                                <p>
                                    Puedes observar, escuchar y
                                    participar libremente. Nadie
                                    va a presionarte a realizar
                                    algo con lo que no te sientas
                                    cómodo.
                                </p>
                            </article>

                            <article>
                                <span className="first-visit-practical__label">
                                    Familia
                                </span>

                                <h3>
                                    Puedes venir acompañado
                                </h3>

                                <p>
                                    Puedes asistir con tu familia,
                                    amistades o de manera
                                    individual. Todos serán
                                    recibidos con cariño.
                                </p>
                            </article>

                            <article>
                                <span className="first-visit-practical__label">
                                    Aportes
                                </span>

                                <h3>
                                    Nada tiene un costo obligatorio
                                </h3>

                                <p>
                                    Las reuniones y actividades no
                                    tienen un costo obligatorio.
                                    Cualquier cooperación es
                                    completamente voluntaria.
                                </p>
                            </article>
                        </div>
                    </div>
                </section>

                {/* ================================================= */}
                {/* ENLACES DE AYUDA */}
                {/* ================================================= */}

                <section className="first-visit-help">
                    <div className="first-visit-help__container">
                        <div className="first-visit-help__heading">
                            <p className="first-visit-section__eyebrow">
                                Estamos para ayudarte
                            </p>

                            <h2>
                                ¿Todavía tienes alguna duda?
                            </h2>

                            <p>
                                Puedes revisar las preguntas
                                frecuentes o comunicarte
                                directamente con la iglesia antes
                                de tu visita.
                            </p>
                        </div>

                        <div className="first-visit-help__cards">
                            <article>
                                <span>
                                    Preguntas frecuentes
                                </span>

                                <h3>
                                    Encuentra respuestas rápidas
                                </h3>

                                <p>
                                    Revisa información sobre
                                    horarios, reuniones,
                                    actividades, participación y
                                    primeras visitas.
                                </p>

                                <Link to="/recursos/preguntas-frecuentes">
                                    Ver preguntas

                                    <strong aria-hidden="true">
                                        →
                                    </strong>
                                </Link>
                            </article>

                            <article>
                                <span>
                                    Contacto
                                </span>

                                <h3>
                                    Conversemos antes de tu visita
                                </h3>

                                <p>
                                    Escríbenos si necesitas ayuda
                                    para encontrar la iglesia o
                                    deseas realizar una consulta.
                                </p>

                                <Link to="/contacto">
                                    Ir a Contacto

                                    <strong aria-hidden="true">
                                        →
                                    </strong>
                                </Link>
                            </article>
                        </div>
                    </div>
                </section>

                {/* ================================================= */}
                {/* CIERRE */}
                {/* ================================================= */}

                <section className="first-visit-closing">
                    <div className="first-visit-closing__container">
                        <div>
                            <p className="first-visit-closing__eyebrow">
                                Te esperamos
                            </p>

                            <h2>
                                Será una alegría recibirte
                            </h2>

                            <p>
                                Puedes acompañarnos este domingo
                                en Artillería 199, Playa Ancha.
                                Ven tal como estás y comparte con
                                nosotros.
                            </p>
                        </div>

                        <Link to="/eventos">
                            Ver próximas actividades
                        </Link>
                    </div>
                </section>
            </main>
        </>
    );
}

export default FirstVisit;