// Importamos Link para navegar sin recargar completamente la aplicación.
import { Link } from "react-router-dom";

// Importamos el encabezado público.
import Header from "../../components/public/Header";

// Importamos el pie de página público.
import Footer from "../../components/public/Footer";

// Importamos el icono que representa la comunidad.
import comunidadIcon from "../../assets/icons/comunidad.png";

// Importamos el icono que representa la fe.
import feIcon from "../../assets/icons/fe.png";

// Importamos el icono que representa el propósito.
import propositoIcon from "../../assets/icons/proposito.png";

// Importamos el icono que representa la esperanza.
import esperanzaIcon from "../../assets/icons/esperanza.png";

// Importamos el icono que representa el servicio.
import servimosIcon from "../../assets/icons/servimos.png";

// Importamos el icono que representa el crecimiento espiritual.
import crecemosIcon from "../../assets/icons/crecemos.png";

// Importamos los estilos exclusivos de la página Nosotros.
import "../../styles/pages/public/About.css";

// Creamos la página Nosotros.
function About() {
  // Creamos un arreglo con los valores principales de la iglesia.
  const values = [
    {
      // Título del valor.
      title: "Comunidad",

      // Descripción del valor.
      description:
        "Queremos ser una familia espiritual donde cada persona pueda sentirse acompañada.",

      // Icono asociado al valor.
      icon: comunidadIcon,

      // Texto alternativo del icono.
      alt: "Icono que representa la comunidad",
    },
    {
      // Título del valor.
      title: "Fe",

      // Descripción del valor.
      description:
        "Creemos en Dios, en su Palabra y en el poder transformador de Jesucristo.",

      // Icono asociado al valor.
      icon: feIcon,

      // Texto alternativo del icono.
      alt: "Icono que representa la fe",
    },
    {
      // Título del valor.
      title: "Propósito",

      // Descripción del valor.
      description:
        "Buscamos vivir con sentido, amar a Dios y servir a quienes nos rodean.",

      // Icono asociado al valor.
      icon: propositoIcon,

      // Texto alternativo del icono.
      alt: "Icono que representa el propósito",
    },
    {
      // Título del valor.
      title: "Esperanza",

      // Descripción del valor.
      description:
        "Confiamos en que Jesús es nuestra esperanza firme en cada etapa de la vida.",

      // Icono asociado al valor.
      icon: esperanzaIcon,

      // Texto alternativo del icono.
      alt: "Icono que representa la esperanza",
    },
    {
      // Título del valor.
      title: "Servicio",

      // Descripción del valor.
      description:
        "Deseamos servir con humildad, generosidad y amor dentro y fuera de la iglesia.",

      // Icono asociado al valor.
      icon: servimosIcon,

      // Texto alternativo del icono.
      alt: "Icono que representa el servicio",
    },
    {
      // Título del valor.
      title: "Crecimiento",

      // Descripción del valor.
      description:
        "Anhelamos crecer juntos en la fe, la Palabra y nuestra relación con Dios.",

      // Icono asociado al valor.
      icon: crecemosIcon,

      // Texto alternativo del icono.
      alt: "Icono que representa el crecimiento espiritual",
    },
  ];

  // Retornamos toda la estructura de la página.
  return (
    // Contenedor principal de la página Nosotros.
    <div className="about">
      {/* Mostramos el encabezado público. */}
      <Header />

      {/* Contenido principal de la página. */}
      <main>
        {/* Hero principal de la página Nosotros. */}
        <section className="about-hero">
          {/* Capa decorativa para mejorar el contraste. */}
          <div className="about-hero__overlay"></div>

          {/* Contenedor central del Hero. */}
          <div className="about-hero__container">
            {/* Texto introductorio pequeño. */}
            <p className="about-hero__eyebrow">
              El Ancla Comunidad Cristiana
            </p>

            {/* Título principal. */}
            <h1 className="about-hero__title">
              Una comunidad firme
              <span className="about-hero__title-highlight">
                en Cristo
              </span>
            </h1>

            {/* Descripción principal. */}
            <p className="about-hero__description">
              Somos una iglesia cristiana no denominacional que desea
              acompañar a las personas en su crecimiento espiritual y
              compartir el amor de Dios de una manera cercana y genuina.
            </p>

            {/* Referencia bíblica representativa. */}
            <p className="about-hero__verse">
              “Tenemos como firme y segura ancla del alma la esperanza.”
              <span>Hebreos 6:19</span>
            </p>
          </div>

          {/* Curva decorativa inferior. */}
          <div className="about-hero__curve"></div>
        </section>

        {/* Sección que explica quiénes somos. */}
        <section className="about-intro">
          {/* Contenedor principal de la sección. */}
          <div className="about-intro__container">
            {/* Bloque de texto principal. */}
            <div className="about-intro__content">
              {/* Texto introductorio pequeño. */}
              <p className="about-section__eyebrow">
                Quiénes somos
              </p>

              {/* Título de la sección. */}
              <h2 className="about-section__title">
                Una iglesia para crecer, compartir y servir
              </h2>

              {/* Primer párrafo explicativo. */}
              <p className="about-intro__paragraph">
                El Ancla Comunidad Cristiana es una iglesia que busca
                mantener a Jesucristo como centro de su fe, su servicio y su
                vida comunitaria.
              </p>

              {/* Segundo párrafo explicativo. */}
              <p className="about-intro__paragraph">
                Queremos ser un lugar donde cada persona pueda conocer más de
                Dios, encontrar apoyo, desarrollar sus dones y construir
                relaciones basadas en el amor, el respeto y la esperanza.
              </p>

              {/* Tercer párrafo explicativo. */}
              <p className="about-intro__paragraph">
                Nuestra comunidad está abierta a quienes desean acercarse a
                Dios, aprender de la Biblia y compartir junto a otras personas
                en un ambiente sencillo, familiar y acogedor.
              </p>
            </div>

            {/* Bloque visual de la sección. */}
            <div className="about-intro__visual">
              {/* Marco decorativo exterior. */}
              <div className="about-intro__visual-frame">
                {/* Mostramos el icono de comunidad. */}
                <img
                  className="about-intro__visual-icon"
                  src={comunidadIcon}
                  alt="Representación de la comunidad cristiana"
                />

                {/* Frase destacada. */}
                <p className="about-intro__visual-text">
                  Crecemos juntos, servimos juntos y permanecemos firmes en la
                  Palabra.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Sección de misión y visión. */}
        <section className="about-purpose">
          {/* Contenedor principal. */}
          <div className="about-purpose__container">
            {/* Tarjeta de misión. */}
            <article className="about-purpose__card">
              {/* Contenedor del icono. */}
              <div className="about-purpose__icon-wrapper">
                {/* Icono de propósito. */}
                <img
                  className="about-purpose__icon"
                  src={propositoIcon}
                  alt=""
                  aria-hidden="true"
                />
              </div>

              {/* Texto introductorio. */}
              <p className="about-purpose__eyebrow">
                Nuestra misión
              </p>

              {/* Título de la tarjeta. */}
              <h2 className="about-purpose__title">
                Compartir el amor de Dios
              </h2>

              {/* Descripción de la misión. */}
              <p className="about-purpose__description">
                Acompañar a las personas para que conozcan a Jesucristo,
                crezcan en su Palabra y vivan su fe sirviendo con amor a la
                comunidad.
              </p>
            </article>

            {/* Tarjeta de visión. */}
            <article className="about-purpose__card">
              {/* Contenedor del icono. */}
              <div className="about-purpose__icon-wrapper">
                {/* Icono de esperanza. */}
                <img
                  className="about-purpose__icon"
                  src={esperanzaIcon}
                  alt=""
                  aria-hidden="true"
                />
              </div>

              {/* Texto introductorio. */}
              <p className="about-purpose__eyebrow">
                Nuestra visión
              </p>

              {/* Título de la tarjeta. */}
              <h2 className="about-purpose__title">
                Ser una comunidad firme y cercana
              </h2>

              {/* Descripción de la visión. */}
              <p className="about-purpose__description">
                Ser una iglesia que permanezca firme en Cristo, fortalezca a
                las familias y genere un impacto positivo en Playa Ancha,
                Valparaíso y sus alrededores.
              </p>
            </article>
          </div>
        </section>

        {/* Sección de valores de la iglesia. */}
        <section
          className="about-values"
          aria-labelledby="about-values-title"
        >
          {/* Contenedor principal. */}
          <div className="about-values__container">
            {/* Encabezado de la sección. */}
            <div className="about-values__header">
              {/* Texto introductorio pequeño. */}
              <p className="about-section__eyebrow">
                Lo que guía nuestro caminar
              </p>

              {/* Título de la sección. */}
              <h2
                className="about-section__title"
                id="about-values-title"
              >
                Nuestros valores
              </h2>

              {/* Descripción introductoria. */}
              <p className="about-values__description">
                Estos principios representan la forma en que deseamos vivir
                nuestra fe y relacionarnos como comunidad.
              </p>
            </div>

            {/* Cuadrícula de valores. */}
            <div className="about-values__grid">
              {/* Recorremos los valores almacenados en el arreglo. */}
              {values.map((value) => (
                // Creamos una tarjeta por cada valor.
                <article
                  className="about-value-card"
                  key={value.title}
                >
                  {/* Contenedor del icono. */}
                  <div className="about-value-card__icon-wrapper">
                    {/* Icono del valor. */}
                    <img
                      className="about-value-card__icon"
                      src={value.icon}
                      alt={value.alt}
                    />
                  </div>

                  {/* Título del valor. */}
                  <h3 className="about-value-card__title">
                    {value.title}
                  </h3>

                  {/* Descripción del valor. */}
                  <p className="about-value-card__description">
                    {value.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Sección final de invitación. */}
        <section className="about-invitation">
          {/* Contenedor principal. */}
          <div className="about-invitation__container">
            {/* Contenido textual. */}
            <div className="about-invitation__content">
              {/* Texto introductorio. */}
              <p className="about-invitation__eyebrow">
                Queremos conocerte
              </p>

              {/* Título principal. */}
              <h2 className="about-invitation__title">
                Hay un lugar para ti en nuestra comunidad
              </h2>

              {/* Descripción final. */}
              <p className="about-invitation__description">
                Puedes visitarnos, participar en nuestras actividades o
                escribirnos para resolver cualquier duda antes de acompañarnos.
              </p>
            </div>

            {/* Contenedor de botones. */}
            <div className="about-invitation__actions">
              {/* Enlace hacia la sección de actividades. */}
              <Link
                className="about-invitation__button about-invitation__button--primary"
                to="/actividades"
              >
                Ver actividades
              </Link>

              {/* Enlace hacia la sección de contacto. */}
              <Link
                className="about-invitation__button about-invitation__button--secondary"
                to="/contacto"
              >
                Contactarnos
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Mostramos el pie de página público. */}
      <Footer />
    </div>
  );
}

// Exportamos la página para utilizarla desde App.js.
export default About;