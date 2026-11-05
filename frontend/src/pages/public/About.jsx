// =========================================================
// PÁGINA PÚBLICA NOSOTROS - IGLESIA EL ANCLA
// Conserva el diseño original y muestra solo el TXT PUBLICADO.
// =========================================================

// Enlaces internos de React Router, sin recargar toda la aplicación.
import { Link } from "react-router-dom";

// El hook consulta la API existente y resuelve recursos builtin: / Cloudinary.
import usePublicInformationalPage from "../../hooks/usePublicInformationalPage";

// Los datos originales se utilizan solo si aún no existe publicación disponible.
import aboutDemoData from "../../data/informationalPages/aboutDemoData";

// Conservamos todas las clases originales de la página pública.
import "../../styles/pages/public/About.css";

// Dibuja los párrafos de una sección sin fijar su cantidad en el componente.
function PublicParagraphs({ paragraphs = [], className }) {
  // React muestra cada párrafo como texto, sin interpretar HTML inyectado.
  return paragraphs.map((paragraph, index) => (
    <p className={className} key={index}>{paragraph}</p>
  ));
}

// Página principal de presentación institucional.
function About() {
  // Lee únicamente GET /api/informational-pages/nosotros.
  const { content } = usePublicInformationalPage("nosotros", aboutDemoData);

  // Mientras responde la API utilizamos el contenido público inicial.
  const page = content || aboutDemoData;

  return (
    <div className="about">
      <main>
        {/* ===================================================== */}
        {/* 1. HERO: título, descripción y versículo publicados. */}
        {/* ===================================================== */}
        <section className="about-hero">
          <div className="about-hero__overlay" aria-hidden="true" />
          <div className="about-hero__container">
            <p className="about-hero__eyebrow">{page.hero.eyebrow}</p>
            <h1 className="about-hero__title">
              {page.hero.title}{" "}
              <span className="about-hero__title-highlight">
                {page.hero.highlightedTitle}
              </span>
            </h1>
            <p className="about-hero__description">{page.hero.description}</p>
            <p className="about-hero__verse">
              {page.hero.verse}
              <span>{page.hero.verseReference}</span>
            </p>
          </div>
          <div className="about-hero__curve" aria-hidden="true" />
        </section>

        {/* ===================================================== */}
        {/* 2. QUIÉNES SOMOS: párrafos e imagen publicada. */}
        {/* ===================================================== */}
        <section className="about-intro">
          <div className="about-intro__container">
            <div className="about-intro__content">
              <p className="about-section__eyebrow">{page.intro.eyebrow}</p>
              <h2 className="about-section__title">{page.intro.title}</h2>
              <PublicParagraphs
                paragraphs={page.intro.paragraphs}
                className="about-intro__paragraph"
              />
            </div>
            <div className="about-intro__visual">
              <figure className="about-intro__image-card">
                <img
                  className="about-intro__image"
                  src={page.intro.image}
                  alt={page.intro.imageAlt}
                />
                <figcaption className="about-intro__image-caption">
                  {page.intro.imageCaption}
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* ===================================================== */}
        {/* 3. MISIÓN Y VISIÓN: datos actualizables desde el editor. */}
        {/* ===================================================== */}
        <section className="about-purpose">
          <div className="about-purpose__container">
            {[
              { key: "mission", data: page.purpose.mission },
              { key: "vision", data: page.purpose.vision },
            ].map(({ key, data }) => (
              <article className="about-purpose__card" key={key}>
                <div className="about-purpose__icon-wrapper">
                  <img
                    className="about-purpose__icon"
                    src={data.icon}
                    alt=""
                    aria-hidden="true"
                  />
                </div>
                <p className="about-purpose__eyebrow">{data.eyebrow}</p>
                <h2 className="about-purpose__title">{data.title}</h2>
                <p className="about-purpose__description">{data.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ===================================================== */}
        {/* 4. CONVICCIÓN: icono y contenido del documento publicado. */}
        {/* ===================================================== */}
        <section className="about-conviction">
          <div className="about-conviction__container">
            <div className="about-conviction__icon-wrapper">
              <img
                className="about-conviction__icon"
                src={page.conviction.icon}
                alt=""
                aria-hidden="true"
              />
            </div>
            <div className="about-conviction__content">
              <p className="about-section__eyebrow">{page.conviction.eyebrow}</p>
              <h2 className="about-section__title">{page.conviction.title}</h2>
              <PublicParagraphs
                paragraphs={page.conviction.paragraphs}
                className="about-conviction__description"
              />
            </div>
          </div>
        </section>

        {/* ===================================================== */}
        {/* 5. VALORES: tarjetas con imágenes y descripciones reales. */}
        {/* ===================================================== */}
        <section className="about-values" aria-labelledby="about-values-title">
          <div className="about-values__container">
            <div className="about-values__header">
              <p className="about-section__eyebrow">{page.values.eyebrow}</p>
              <h2 className="about-section__title" id="about-values-title">
                {page.values.title}
              </h2>
              <p className="about-values__description">{page.values.description}</p>
            </div>
            <div className="about-values__grid">
              {page.values.items.map((value) => (
                <article className="about-value-card" key={value.id}>
                  <div className="about-value-card__icon-wrapper">
                    <img
                      className="about-value-card__icon"
                      src={value.icon}
                      alt={value.alt}
                    />
                  </div>
                  <h3 className="about-value-card__title">{value.title}</h3>
                  <p className="about-value-card__description">{value.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ===================================================== */}
        {/* 6. PASTOR: foto y párrafos del TXT publicado. */}
        {/* ===================================================== */}
        <section className="about-pastor">
          <div className="about-pastor__container">
            <div className="about-pastor__image-wrapper">
              <img
                className="about-pastor__image"
                src={page.pastor.image}
                alt={page.pastor.imageAlt}
              />
              <div className="about-pastor__image-decoration" aria-hidden="true" />
            </div>
            <div className="about-pastor__content">
              <p className="about-section__eyebrow">{page.pastor.eyebrow}</p>
              <h2 className="about-pastor__name">{page.pastor.name}</h2>
              <p className="about-pastor__role">{page.pastor.role}</p>
              <blockquote className="about-pastor__message">
                <PublicParagraphs paragraphs={page.pastor.paragraphs} />
              </blockquote>
            </div>
          </div>
        </section>

        {/* ===================================================== */}
        {/* 7. INVITACIÓN: textos y rutas controladas por el backend. */}
        {/* ===================================================== */}
        <section className="about-invitation">
          <div className="about-invitation__container">
            <div className="about-invitation__content">
              <p className="about-invitation__eyebrow">{page.invitation.eyebrow}</p>
              <h2 className="about-invitation__title">{page.invitation.title}</h2>
              <p className="about-invitation__description">
                {page.invitation.description}
              </p>
            </div>
            <div className="about-invitation__actions">
              <Link
                className="about-invitation__button about-invitation__button--primary"
                to={page.invitation.primaryButton.path}
              >
                {page.invitation.primaryButton.text}
              </Link>
              <Link
                className="about-invitation__button about-invitation__button--secondary"
                to={page.invitation.secondaryButton.path}
              >
                {page.invitation.secondaryButton.text}
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

// React Router continúa utilizando este mismo componente y ruta.
export default About;
