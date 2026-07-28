// Importamos Link para navegar entre páginas sin recargar el sitio.
import { Link } from "react-router-dom";

// Importamos el encabezado público.
import Header from "../../components/public/Header";

// Importamos el icono principal de eventos.
import eventosIcon from "../../assets/icons/eventos.png";

// Importamos el icono de ubicación.
import ubicacionIcon from "../../assets/icons/ubicacion.png";

// Importamos el icono relacionado con actividades.
import actividadesIcon from "../../assets/icons/actividades.png";

// Importamos la fotografía temporal del evento principal.
import featuredEventImage from "../../assets/images/evento-principal.png";

// Importamos la fotografía temporal del evento principal online.
import onlineEventImage from "../../assets/images/online-principal.png";

// Importamos la fotografía temporal del estudio biblico online.
import estudioEventImage from "../../assets/images/estudio-online.png";

// Importamos la fotografía temporal del evento de oración online.
import prayerEventImage from "../../assets/images/evento-oracion.png";

// Importamos la fotografía temporal del evento de oración.
import oracionEventImage from "../../assets/images/oracion-online.png";

// Importamos la fotografía temporal del evento de jóvenes.
import youthEventImage from "../../assets/images/evento-jovenes.png";

// Importamos la fotografía temporal del evento de niños.
import ninosEventImage from "../../assets/images/evento-ninos.png";

// Importamos la fotografía temporal del evento de taller de biblia.
import tallerEventImage from "../../assets/images/taller-biblia.png";

// Importamos la fotografía temporal del evento familiar.
import familyEventImage from "../../assets/images/evento-familias.png";

// Importamos los estilos exclusivos de la página Eventos.
import "../../styles/pages/public/Events.css";

// Creamos la página pública de eventos.
function Events() {
    // Creamos un objeto temporal para destacar la reunión principal.
    const featuredEvent = {
        // Guardamos el identificador temporal.
        id: 1,

        // Guardamos la categoría de la reunión.
        category: "Reunión principal",

        // Guardamos el nombre de la reunión.
        title: "Culto general",

        // Guardamos una descripción introductoria.
        description:
            "Cada domingo nos reunimos como comunidad para adorar a Dios, aprender de Su Palabra y compartir juntos como hermanos.",

        // Guardamos el día de la reunión.
        date: "Todos los domingos",

        // Guardamos el horario.
        time: "11:00 hrs",

        // Guardamos la ubicación.
        location: "Artillería 199, Playa Ancha",

        // Guardamos la modalidad.
        modality: "Presencial",

        // Guardamos la fotografía asociada.
        image: featuredEventImage,

        // Guardamos el estado de la reunión.
        status: "Actividad permanente",
    };


    // Creamos un arreglo temporal con las reuniones y talleres de la iglesia.
    const upcomingEvents = [
        {
            // Identificador temporal.
            id: 2,

            // Categoría de la actividad.
            category: "Oración",

            // Nombre de la actividad.
            title: "Reunión de oración dominical",

            // Descripción breve.
            description:
                "Comenzamos el domingo reuniéndonos para orar juntos y presentar nuestras necesidades delante de Dios.",

            // Día de realización.
            date: "Todos los domingos",

            // Horario.
            time: "09:30 hrs",

            // Ubicación.
            location: "El Ancla Comunidad Cristiana",

            // Modalidad.
            modality: "Presencial",

            // Imagen asociada.
            image: prayerEventImage,

            // Estado.
            status: "Actividad permanente",
        },
        {
            // Identificador temporal.
            id: 3,

            // Categoría de la actividad.
            category: "Comunidad",

            // Nombre de la actividad.
            title: "Desayuno comunitario",

            // Descripción breve.
            description:
                "Un momento para compartir el desayuno, conversar y fortalecer nuestros vínculos como hermanos antes del culto general.",

            // Día de realización.
            date: "Todos los domingos",

            // Horario.
            time: "10:00 hrs",

            // Ubicación.
            location: "El Ancla Comunidad Cristiana",

            // Modalidad.
            modality: "Presencial",

            // Imagen asociada.
            image: familyEventImage,

            // Estado.
            status: "Actividad permanente",
        },
        {
            // Identificador temporal.
            id: 4,

            // Categoría de la actividad.
            category: "Transmisión online",

            // Nombre de la actividad.
            title: "Culto general online",

            // Descripción breve.
            description:
                "Cada domingo transmitimos nuestra reunión principal para que también puedas acompañarnos desde tu hogar y compartir junto a la comunidad.",

            // Día de realización.
            date: "Todos los domingos",

            // Horario.
            time: "11:00 hrs",

            // Plataforma de transmisión.
            location: "Facebook de El Ancla",

            // Modalidad.
            modality: "Online",

            // Imagen asociada.
            image: onlineEventImage,

            // Estado.
            status: "Actividad permanente",

            // Enlace directo a la transmisión.
            link: "https://www.facebook.com/elanclacomunidad",

            // Indicamos que esta tarjeta abre un enlace externo.
            linkType: "external",
        },
        {
            // Identificador temporal.
            id: 5,

            // Categoría de la actividad.
            category: "Formación bíblica",

            // Nombre de la actividad.
            title: "Taller Descubriendo la Biblia",

            // Descripción breve.
            description:
                "Un taller online para conocer mejor la Biblia, comprender su mensaje y aprender a estudiarla de manera ordenada.",

            // Día de realización.
            date: "Todos los martes",

            // Horario.
            time: "20:00 hrs",

            // Ubicación o plataforma.
            location: "Plataforma online",

            // Modalidad.
            modality: "Online",

            // Imagen asociada.
            image: tallerEventImage,

            // Estado.
            status: "Actividad permanente",
        },
        {
            // Identificador temporal.
            id: 6,

            // Categoría de la actividad.
            category: "Oración",

            // Nombre de la actividad.
            title: "Reunión de oración online",

            // Descripción breve.
            description:
                "Nos encontramos durante la semana para orar como comunidad y acompañarnos en nuestras necesidades.",

            // Día de realización.
            date: "Todos los miércoles",

            // Horario.
            time: "21:00 hrs",

            // Ubicación o plataforma.
            location: "Plataforma online",

            // Modalidad.
            modality: "Online",

            // Imagen asociada.
            image: oracionEventImage,

            // Estado.
            status: "Actividad permanente",
        },
        {
            // Identificador temporal.
            id: 7,

            // Categoría de la actividad.
            category: "Estudio bíblico",

            // Nombre de la actividad.
            title: "Estudio bíblico online",

            // Descripción breve.
            description:
                "Un espacio semanal para profundizar en la Palabra de Dios, aprender juntos y resolver preguntas bíblicas.",

            // Día de realización.
            date: "Todos los jueves",

            // Horario.
            time: "20:00 hrs",

            // Ubicación o plataforma.
            location: "Plataforma online",

            // Modalidad.
            modality: "Online",

            // Imagen asociada.
            image: estudioEventImage,

            // Estado.
            status: "Actividad permanente",
        },
        {
            // Identificador temporal.
            id: 8,

            // Categoría de la actividad.
            category: "Niños",

            // Nombre de la actividad.
            title: "Taller para niños",

            // Descripción breve.
            description:
                "Un espacio especialmente preparado para que los niños conozcan la Palabra de Dios mediante enseñanzas y actividades apropiadas para su edad.",

            // Frecuencia de realización.
            date: "Dos domingos de cada mes",

            // Horario.
            time: "11:00 hrs",

            // Ubicación.
            location: "El Ancla Comunidad Cristiana",

            // Modalidad.
            modality: "Presencial",

            // Imagen asociada.
            image: ninosEventImage,

            // Estado.
            status: "Fechas por confirmar",
        },
        {
            // Identificador temporal.
            id: 9,

            // Categoría de la actividad.
            category: "Jóvenes",

            // Nombre de la actividad.
            title: "Taller de jóvenes",

            // Descripción breve.
            description:
                "Un espacio para que los jóvenes compartan, estudien la Biblia y fortalezcan su relación con Dios y con otros jóvenes.",

            // Todavía no contamos con un día confirmado.
            date: "Dos domingos de cada mes",

            // Todavía no contamos con un horario confirmado.
            time: "11:00 hrs",

            // Ubicación.
            location: "El Ancla Comunidad Cristiana",

            // Modalidad.
            modality: "Presencial",

            // Imagen asociada.
            image: youthEventImage,

            // Estado.
            status: "Fechas por confirmar",
        },
    ];

    // Creamos una función para obtener una clase según el estado.
    const getStatusClass = (status) => {
        // Verificamos si quedan pocos cupos.
        if (status === "Últimos cupos") {
            // Retornamos la clase de advertencia.
            return "events-card__status--warning";
        }

        // Verificamos si el evento todavía no está disponible.
        if (status === "Próximamente") {
            // Retornamos la clase de estado pendiente.
            return "events-card__status--pending";
        }

        // Retornamos la clase normal para eventos disponibles.
        return "events-card__status--available";
    };

    // Retornamos la estructura visual de la página.
    return (
        // Contenedor principal de la página Eventos.
        <div className="events">
            {/* Mostramos el encabezado público. */}
            <Header />

            {/* Contenido principal de la página. */}
            <main>
                {/* Hero principal de Eventos. */}
                <section className="events-hero">
                    {/* Capa decorativa del Hero. */}
                    <div className="events-hero__overlay"></div>

                    {/* Contenedor central del Hero. */}
                    <div className="events-hero__container">
                        {/* Bloque textual del Hero. */}
                        <div className="events-hero__content">
                            {/* Texto introductorio pequeño. */}
                            <p className="events-hero__eyebrow">
                                Encuentros y fechas especiales
                            </p>

                            {/* Título principal. */}
                            <h1 className="events-hero__title">
                                Vive nuestros
                                <span className="events-hero__title-highlight">
                                    próximos eventos
                                </span>
                            </h1>

                            {/* Descripción principal. */}
                            <p className="events-hero__description">
                                Conoce los encuentros especiales de El Ancla y encuentra
                                nuevas oportunidades para compartir, aprender y crecer junto
                                a nuestra comunidad.
                            </p>
                        </div>

                        {/* Icono decorativo principal. */}
                        <div
                            className="events-hero__visual"
                            aria-hidden="true"
                        >
                            {/* Círculo que contiene el icono. */}
                            <div className="events-hero__icon-circle">
                                {/* Mostramos el icono de eventos. */}
                                <img
                                    className="events-hero__icon"
                                    src={eventosIcon}
                                    alt=""
                                />
                            </div>
                        </div>
                    </div>

                    {/* Curva decorativa inferior. */}
                    <div className="events-hero__curve"></div>
                </section>

                {/* Sección del evento destacado. */}
                <section
                    className="events-featured"
                    aria-labelledby="featured-event-title"
                >
                    {/* Contenedor principal. */}
                    <div className="events-featured__container">
                        {/* Encabezado de la sección. */}
                        <div className="events-featured__header">
                            {/* Texto introductorio. */}
                            <p className="events-section__eyebrow">
                                Evento destacado
                            </p>

                            {/* Título de la sección. */}
                            <h2
                                className="events-section__title"
                                id="featured-event-title"
                            >
                                Una fecha para encontrarnos
                            </h2>
                        </div>

                        {/* Tarjeta principal del evento destacado. */}
                        <article className="featured-event">
                            {/* Contenedor de la fotografía. */}
                            <div className="featured-event__image-wrapper">
                                {/* Fotografía del evento. */}
                                <img
                                    className="featured-event__image"
                                    src={featuredEvent.image}
                                    alt={`Imagen de ${featuredEvent.title}`}
                                />

                                {/* Categoría superpuesta sobre la imagen. */}
                                <span className="featured-event__category">
                                    {featuredEvent.category}
                                </span>
                            </div>

                            {/* Contenido del evento destacado. */}
                            <div className="featured-event__content">
                                {/* Estado actual del evento. */}
                                <span
                                    className={`featured-event__status ${getStatusClass(
                                        featuredEvent.status
                                    )}`}
                                >
                                    {featuredEvent.status}
                                </span>

                                {/* Título del evento. */}
                                <h3 className="featured-event__title">
                                    {featuredEvent.title}
                                </h3>

                                {/* Descripción del evento. */}
                                <p className="featured-event__description">
                                    {featuredEvent.description}
                                </p>

                                {/* Lista de información práctica. */}
                                <div className="featured-event__details">
                                    {/* Información de fecha y hora. */}
                                    <div className="featured-event__detail">
                                        {/* Icono de actividades. */}
                                        <img
                                            className="featured-event__detail-icon"
                                            src={actividadesIcon}
                                            alt=""
                                            aria-hidden="true"
                                        />

                                        {/* Bloque de texto. */}
                                        <div className="featured-event__detail-text">
                                            {/* Etiqueta del dato. */}
                                            <span className="featured-event__detail-label">
                                                Fecha y horario
                                            </span>

                                            {/* Valor del dato. */}
                                            <strong className="featured-event__detail-value">
                                                {featuredEvent.date} — {featuredEvent.time}
                                            </strong>
                                        </div>
                                    </div>

                                    {/* Información de ubicación. */}
                                    <div className="featured-event__detail">
                                        {/* Icono de ubicación. */}
                                        <img
                                            className="featured-event__detail-icon"
                                            src={ubicacionIcon}
                                            alt=""
                                            aria-hidden="true"
                                        />

                                        {/* Bloque de texto. */}
                                        <div className="featured-event__detail-text">
                                            {/* Etiqueta del dato. */}
                                            <span className="featured-event__detail-label">
                                                Lugar
                                            </span>

                                            {/* Valor del dato. */}
                                            <strong className="featured-event__detail-value">
                                                {featuredEvent.location}
                                            </strong>
                                        </div>
                                    </div>
                                </div>

                                {/* Contenedor de acciones. */}
                                <div className="featured-event__actions">
                                    {/* Botón hacia Contacto. */}
                                    <Link
                                        className="featured-event__button featured-event__button--primary"
                                        to="/contacto"
                                    >
                                        Consultar información
                                    </Link>

                                    {/* Botón secundario hacia la página Nosotros. */}
                                    <Link
                                        className="featured-event__button featured-event__button--secondary"
                                        to="/nosotros"
                                    >
                                        Conócenos
                                    </Link>
                                </div>
                            </div>
                        </article>
                    </div>
                </section>

                {/* Sección de próximos eventos. */}
                <section
                    className="events-upcoming"
                    aria-labelledby="upcoming-events-title"
                >
                    {/* Contenedor principal. */}
                    <div className="events-upcoming__container">
                        {/* Encabezado de la sección. */}
                        <div className="events-upcoming__header">
                            {/* Bloque de títulos. */}
                            <div>
                                {/* Texto pequeño. */}
                                <p className="events-section__eyebrow">
                                    Próximas fechas
                                </p>

                                {/* Título principal. */}
                                <h2
                                    className="events-section__title"
                                    id="upcoming-events-title"
                                >
                                    Eventos & Actividades
                                </h2>
                            </div>

                            {/* Descripción breve. */}
                            <p className="events-upcoming__intro">
                                Revisa las próximas fechas y encuentra un encuentro en el que
                                puedas participar.
                            </p>
                        </div>

                        {/* Cuadrícula de eventos. */}
                        <div className="events-upcoming__grid">
                            {/* Recorremos cada evento temporal. */}
                            {upcomingEvents.map((event) => (
                                // Creamos una tarjeta por evento.
                                <article
                                    className="events-card"
                                    key={event.id}
                                >
                                    {/* Contenedor de la fotografía. */}
                                    <div className="events-card__image-wrapper">
                                        {/* Fotografía del evento. */}
                                        <img
                                            className="events-card__image"
                                            src={event.image}
                                            alt={`Imagen de ${event.title}`}
                                        />

                                        {/* Categoría del evento. */}
                                        <span className="events-card__category">
                                            {event.category}
                                        </span>
                                    </div>

                                    {/* Contenido de la tarjeta. */}
                                    <div className="events-card__content">
                                        {/* Estado del evento. */}
                                        <span
                                            className={`events-card__status ${getStatusClass(
                                                event.status
                                            )}`}
                                        >
                                            {event.status}
                                        </span>

                                        {/* Nombre del evento. */}
                                        <h3 className="events-card__title">
                                            {event.title}
                                        </h3>

                                        {/* Descripción breve. */}
                                        <p className="events-card__description">
                                            {event.description}
                                        </p>

                                        {/* Datos del evento. */}
                                        <div className="events-card__details">
                                            {/* Fecha. */}
                                            <p className="events-card__detail">
                                                <strong>Fecha:</strong> {event.date}
                                            </p>

                                            {/* Horario. */}
                                            <p className="events-card__detail">
                                                <strong>Horario:</strong> {event.time}
                                            </p>

                                            {/* Ubicación. */}
                                            <p className="events-card__detail">
                                                <strong>Lugar:</strong> {event.location}
                                            </p>

                                            {/* Modalidad. */}
                                            <p className="events-card__detail">
                                                <strong>Modalidad:</strong> {event.modality}
                                            </p>
                                        </div>

                                        {/* Verificamos si la actividad contiene un enlace externo. */}
                                        {event.linkType === "external" ? (
                                            // Creamos un enlace tradicional para abrir Facebook.
                                            <a
                                                className="events-card__link"
                                                href={event.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label={`Ver ${event.title} en Facebook`}
                                            >
                                                Ver transmisión en Facebook
                                                <span aria-hidden="true">→</span>
                                            </a>
                                        ) : (
                                            // Las demás tarjetas continúan llevando a Contacto.
                                            <Link
                                                className="events-card__link"
                                                to="/contacto"
                                                aria-label={`Consultar por ${event.title}`}
                                            >
                                                Consultar por esta actividad
                                                <span aria-hidden="true">→</span>
                                            </Link>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Sección final de invitación. */}
                <section className="events-invitation">
                    {/* Contenedor principal. */}
                    <div className="events-invitation__container">
                        {/* Contenido textual. */}
                        <div className="events-invitation__content">
                            {/* Texto pequeño. */}
                            <p className="events-invitation__eyebrow">
                                Participa con nosotros
                            </p>

                            {/* Título principal. */}
                            <h2 className="events-invitation__title">
                                ¿Tienes dudas sobre algún evento?
                            </h2>

                            {/* Descripción. */}
                            <p className="events-invitation__description">
                                Escríbenos y te ayudaremos con horarios, ubicación,
                                inscripción o cualquier información necesaria para participar.
                            </p>
                        </div>

                        {/* Botón hacia Contacto. */}
                        <Link
                            className="events-invitation__button"
                            to="/contacto"
                        >
                            Contactarnos
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    );
}

// Exportamos la página para utilizarla desde App.js.
export default Events;