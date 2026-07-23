// Importamos el icono principal de la sección.
import actividadesIcon from "../../assets/icons/actividades.png";

// Importamos los estilos exclusivos del componente.
import "../../styles/components/public/UpcomingActivities.css";

// Creamos el componente de próximas actividades.
function UpcomingActivities() {
  // Creamos datos temporales mientras todavía no usamos MongoDB.
  const activities = [
    {
      // Identificador temporal de la actividad.
      id: 1,

      // Categoría que aparecerá sobre el título.
      category: "Estudio bíblico",

      // Nombre de la actividad.
      title: "Estudio Bíblico",

      // Día en que se realiza.
      day: "Domingo",

      // Hora de inicio.
      time: "11:00 hrs",

      // Modalidad de participación.
      modality: "Online",

      // Texto descriptivo breve.
      description:
        "Un espacio para aprender, compartir y crecer juntos en la Palabra.",
    },
    {
      // Identificador temporal de la actividad.
      id: 2,

      // Categoría de la actividad.
      category: "Oración",

      // Nombre de la actividad.
      title: "Reunión de Oración",

      // Día en que se realiza.
      day: "Martes",

      // Hora de inicio.
      time: "20:00 hrs",

      // Modalidad de participación.
      modality: "Presencial",

      // Texto descriptivo breve.
      description:
        "Nos reunimos como comunidad para orar y acompañarnos mutuamente.",
    },
    {
      // Identificador temporal de la actividad.
      id: 3,

      // Categoría de la actividad.
      category: "Discipulado",

      // Nombre de la actividad.
      title: "Discipulado",

      // Día en que se realiza.
      day: "Sábado",

      // Hora de inicio.
      time: "17:00 hrs",

      // Modalidad de participación.
      modality: "Presencial",

      // Texto descriptivo breve.
      description:
        "Un encuentro para profundizar en la fe y avanzar en nuestro crecimiento espiritual.",
    },
    {
      // Identificador temporal de la actividad.
      id: 4,

      // Categoría de la actividad.
      category: "Jóvenes",

      // Nombre de la actividad.
      title: "Reunión de Jóvenes",

      // Día en que se realiza.
      day: "Viernes",

      // Hora de inicio.
      time: "19:30 hrs",

      // Modalidad de participación.
      modality: "Presencial",

      // Texto descriptivo breve.
      description:
        "Un espacio para compartir, aprender y fortalecer la fe entre jóvenes.",
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
                Próximas actividades
              </h2>
            </div>
          </div>

          {/* Enlace para ver todas las actividades. */}
          <a
            className="upcoming-activities__view-all"
            href="/actividades"
          >
            Ver todas
            <span aria-hidden="true">→</span>
          </a>
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
                    activity.modality === "Online"
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

                {/* Descripción breve. */}
                <p className="activity-card__description">
                  {activity.description}
                </p>

                {/* Información de horario. */}
                <div className="activity-card__schedule">
                  {/* Día de realización. */}
                  <div className="activity-card__schedule-item">
                    {/* Etiqueta del dato. */}
                    <span className="activity-card__schedule-label">
                      Día
                    </span>

                    {/* Valor del dato. */}
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

                    {/* Valor del dato. */}
                    <span className="activity-card__schedule-value">
                      {activity.time}
                    </span>
                  </div>
                </div>

                {/* Enlace hacia el detalle de la actividad. */}
                <a
                  className="activity-card__link"
                  href={`/actividades/${activity.id}`}
                  aria-label={`Ver detalles de ${activity.title}`}
                >
                  Ver detalles
                  <span aria-hidden="true">→</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// Exportamos el componente para utilizarlo en Home.
export default UpcomingActivities;