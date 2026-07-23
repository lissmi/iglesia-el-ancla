// Importamos el icono de Comunidad.
import comunidadIcon from "../../assets/icons/comunidad.png";

// Importamos el icono de Fe.
import feIcon from "../../assets/icons/fe.png";

// Importamos el icono de Propósito.
import propositoIcon from "../../assets/icons/proposito.png";

// Importamos el icono de Esperanza.
import esperanzaIcon from "../../assets/icons/esperanza.png";

// Importamos los estilos exclusivos de este componente.
import "../../styles/components/public/CommunityValues.css";

// Creamos el componente CommunityValues.
function CommunityValues() {
  // Creamos un arreglo con la información de cada valor.
  const communityValues = [
    {
      // Título del valor.
      title: "Comunidad",

      // Descripción del valor.
      description: "Somos una familia que te acompaña.",

      // Icono asociado al valor.
      icon: comunidadIcon,

      // Texto alternativo para accesibilidad.
      alt: "Icono que representa la comunidad",
    },
    {
      // Título del valor.
      title: "Fe",

      // Descripción del valor.
      description: "Creemos en un Dios que transforma.",

      // Icono asociado al valor.
      icon: feIcon,

      // Texto alternativo para accesibilidad.
      alt: "Icono que representa la fe",
    },
    {
      // Título del valor.
      title: "Propósito",

      // Descripción del valor.
      description: "Vivimos para amar y servir.",

      // Icono asociado al valor.
      icon: propositoIcon,

      // Texto alternativo para accesibilidad.
      alt: "Icono que representa el propósito",
    },
    {
      // Título del valor.
      title: "Esperanza",

      // Descripción del valor.
      description: "Jesús es nuestra esperanza.",

      // Icono asociado al valor.
      icon: esperanzaIcon,

      // Texto alternativo para accesibilidad.
      alt: "Icono que representa la esperanza",
    },
  ];

  // Retornamos la estructura visual del componente.
  return (
    // Sección que presenta los valores principales de la comunidad.
    <section
      className="community-values"
      aria-labelledby="community-values-title"
    >
      {/* Contenedor principal de la sección. */}
      <div className="community-values__container">
        {/* Encabezado introductorio de la sección. */}
        <div className="community-values__header">
          {/* Texto pequeño sobre el título. */}
          <p className="community-values__eyebrow">
            Nuestra identidad
          </p>

          {/* Título principal de la sección. */}
          <h2
            className="community-values__title"
            id="community-values-title"
          >
            Lo que nos une como comunidad
          </h2>

          {/* Texto descriptivo de la sección. */}
          <p className="community-values__description">
            Queremos vivir nuestra fe de manera cercana, servir con
            propósito y acompañarnos con esperanza.
          </p>
        </div>

        {/* Contenedor de las tarjetas. */}
        <div className="community-values__grid">
          {/* Recorremos cada valor del arreglo. */}
          {communityValues.map((value) => (
            // Creamos una tarjeta por cada valor.
            <article
              className="community-values__card"
              key={value.title}
            >
              {/* Contenedor visual del icono. */}
              <div className="community-values__icon-wrapper">
                {/* Mostramos el icono correspondiente. */}
                <img
                  className="community-values__icon"
                  src={value.icon}
                  alt={value.alt}
                />
              </div>

              {/* Título de la tarjeta. */}
              <h3 className="community-values__card-title">
                {value.title}
              </h3>

              {/* Descripción de la tarjeta. */}
              <p className="community-values__card-description">
                {value.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// Exportamos el componente para usarlo en Home.
export default CommunityValues;