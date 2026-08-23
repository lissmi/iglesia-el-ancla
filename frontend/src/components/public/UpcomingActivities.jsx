// Importamos Link para navegar entre páginas sin recargar completamente la aplicación.
import { Link } from "react-router-dom";

// Importamos el icono principal de la sección.
import actividadesIcon from "../../assets/icons/actividades.png";

// Importamos los estilos exclusivos del componente.
import "../../styles/components/public/UpcomingActivities.css";

// Creamos el componente de próximas actividades.
function UpcomingActivities() {

  // Creamos datos temporales mientras todavía no usamos MongoDB.
  // Las actividades están ordenadas según el día de la semana:
  // domingo, martes, miércoles y jueves.
  const activities = [
    {
      // Identificador temporal de la actividad.
      id: 1,

      // Categoría que aparecerá sobre el título.
      category: "Reunión principal",

      // Nombre de la actividad.
      title: "Culto general",

      // Día en que se realiza.
      day: "Todos los domingos",

      // Hora de inicio.
      time: "11:00 hrs",

      // Modalidad de participación.
      modality: "Presencial y online",

      // Texto descriptivo breve.
      description:
        "Nos reunimos para adorar a Dios, aprender de Su Palabra y compartir como comunidad. También puedes acompañarnos por Facebook.",
    },
    {
      // Identificador temporal de la actividad.
      id: 2,

      // Categoría de la actividad.
      category: "Oración",

      // Nombre de la actividad.
      title: "Reunión de oración dominical",

      // Día en que se realiza.
      day: "Todos los domingos",

      // Hora de inicio.
      time: "09:30 hrs",

      // Modalidad de participación.
      modality: "Presencial",

      // Texto descriptivo breve.
      description:
        "Comenzamos el domingo reuniéndonos para orar juntos y presentar nuestras necesidades delante de Dios.",
    },
    {
      // Identificador temporal de la actividad.
      id: 3,

      // Categoría de la actividad.
      category: "Formación bíblica",

      // Nombre de la actividad.
      title: "Taller Descubrir la Biblia",

      // Día en que se realiza.
      day: "Todos los martes",

      // Hora de inicio.
      time: "20:00 hrs",

      // Modalidad de participación.
      modality: "Online",

      // Texto descriptivo breve.
      description:
        "Un taller para conocer mejor la Biblia, comprender su mensaje y aprender a estudiarla de manera ordenada.",
    },
    {
      // Identificador temporal de la actividad.
      id: 4,

      // Categoría de la actividad.
      category: "Oración",

      // Nombre de la actividad.
      title: "Reunión de oración",

      // Día en que se realiza.
      day: "Todos los miércoles",

      // Hora de inicio.
      time: "21:00 hrs",

      // Modalidad de participación.
      modality: "Online",

      // Texto descriptivo breve.
      description:
        "Un espacio semanal de oración online para reunirnos como comunidad, agradecer a Dios y presentar juntos nuestras peticiones.",
    },
    {
      // Identificador temporal de la actividad.
      id: 5,

      // Categoría de la actividad.
      category: "Estudio bíblico",

      // Nombre de la actividad.
      title: "Crecimiento espiritual",

      // Día en que se realiza.
      day: "Todos los jueves",

      // Hora de inicio.
      time: "20:00 hrs",

      // Modalidad de participación.
      modality: "Online",

      // Texto descriptivo breve.
      description:
        "Un espacio semanal para profundizar en la Palabra de Dios, aprender juntos y resolver preguntas bíblicas.",
    },
  ];

  // Retornamos la estructura visual de la sección.
  return (
    // Sección principal de próximas actividades.
    <section
      className="upcoming-activities"
      aria-labelledby="upcoming-activities-title"
    >
      {/* Contenedor central de la sección. */}
      <div className="upcoming-activities__container">

        {/* Encabezado de la sección. */}
        <div className="upcoming-activities__header">

          {/* Contenedor del título y del icono. */}
          <div className="upcoming-activities__heading">

            {/* Icono de actividades. */}
            <img
              className="upcoming-activities__heading-icon"
              src={actividadesIcon}
              alt=""
              aria-hidden="true"
            />

            {/* Contenedor de los textos del encabezado. */}
            <div>

              {/* Texto introductorio pequeño. */}
              <p className="upcoming-activities__eyebrow">
                Participa con nosotros
              </p>

              {/* Título principal de la sección. */}
              <h2
                className="upcoming-activities__title"
                id="upcoming-activities-title"
              >
                Eventos y actividades
              </h2>
            </div>
          </div>

          {/* Enlace para ver todas las actividades. */}
          <Link
            className="upcoming-activities__view-all"
            to="/eventos"
          >
            Ver todas
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Cuadrícula de actividades. */}
        <div className="upcoming-activities__grid">

          {/* Recorremos cada actividad del arreglo. */}
          {activities.map((activity) => (

            // Creamos una tarjeta por cada actividad.
            <article
              className="activity-card"
              key={activity.id}
            >

              {/* Parte superior decorativa de la tarjeta. */}
              <div className="activity-card__top">

                {/* Categoría de la actividad. */}
                <span className="activity-card__category">
                  {activity.category}
                </span>

                {/* Modalidad de la actividad. */}
                <span
                  className={`activity-card__modality ${
                    activity.modality.toLowerCase().includes("online")
                      ? "activity-card__modality--online"
                      : ""
                  }`}
                >
                  {activity.modality}
                </span>
              </div>

              {/* Contenido principal de la tarjeta. */}
              <div className="activity-card__content">

                {/* Nombre de la actividad. */}
                <h3 className="activity-card__title">
                  {activity.title}
                </h3>

                {/* Descripción breve de la actividad. */}
                <p className="activity-card__description">
                  {activity.description}
                </p>

                {/* Información correspondiente al día y horario. */}
                <div className="activity-card__schedule">

                  {/* Día de realización. */}
                  <div className="activity-card__schedule-item">

                    {/* Etiqueta del dato. */}
                    <span className="activity-card__schedule-label">
                      Día
                    </span>

                    {/* Día correspondiente a la actividad. */}
                    <span className="activity-card__schedule-value">
                      {activity.day}
                    </span>
                  </div>

                  {/* Hora de realización. */}
                  <div className="activity-card__schedule-item">

                    {/* Etiqueta del dato. */}
                    <span className="activity-card__schedule-label">
                      Horario
                    </span>

                    {/* Hora correspondiente a la actividad. */}
                    <span className="activity-card__schedule-value">
                      {activity.time}
                    </span>
                  </div>
                </div>

                {/* Enlace hacia la página completa de eventos. */}
                <Link
                  className="activity-card__link"
                  to="/eventos"
                  aria-label={`Ver más información sobre ${activity.title}`}
                >
                  Ver detalles
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// Exportamos el componente para poder utilizarlo en Home.
export default UpcomingActivities;