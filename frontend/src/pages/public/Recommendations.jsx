// Importamos useMemo y useState para controlar los filtros.
import { Link } from "react-router-dom";
import { useState } from "react";


// Importamos el icono principal de recomendados.
import recomendadosIcon from "../../assets/icons/recomendados.png";

// Importamos imágenes temporales de las recomendaciones.
import bookImage from "../../assets/images/recommendations/libro-ansiosos-por-nada.jpg";
import musicImage from "../../assets/images/recommendations/musica-alabanza.jpg";
import movieImage from "../../assets/images/recommendations/principe-egipto.jpg";
import seriesImage from "../../assets/images/recommendations/serie-elegidos.jpg";
import documentaryImage from "../../assets/images/recommendations/documental-creacion.jpg";
import podcastImage from "../../assets/images/recommendations/proyecto-biblia.jpg";
import childrenImage from "../../assets/images/recommendations/material-ninos.jpg";

// Importamos los estilos exclusivos de esta página.
import "../../styles/pages/public/Recommendations.css";

// Creamos la página pública de recomendaciones.
function Recommendations() {
    // Definimos las categorías disponibles.
    const categories = [
        "Todos",
        "Libros",
        "Música",
        "Películas",
        "Series",
        "Documentales",
        "Pódcast",
        "Niños y jóvenes",
    ];

    // Guardamos el filtro seleccionado.
    const [selectedCategory, setSelectedCategory] = useState("Todos");

    // Creamos información temporal para las tarjetas.
    const recommendations = [
        {
            id: 1,
            title: "Ansiosos por nada",
            category: "Libros",
            creator: "Max Lucado",
            description:
                "Una lectura cercana y esperanzadora sobre cómo enfrentar la ansiedad desde la confianza en Dios.",
            reason:
                "Lo recomendamos porque entrega enseñanzas bíblicas prácticas para vivir con mayor paz y descansar en las promesas de Dios.",
            image: bookImage,
            link: "https://www.google.com/search?q=Ansiosos+por+nada+Max+Lucado",
            featured: true,
        },
        {
            id: 2,
            title: "Música para adorar",
            category: "Música",
            creator: "Selección de alabanza cristiana",
            description:
                "Una selección musical para acompañar momentos de oración, reflexión y adoración personal.",
            reason:
                "Puede ayudarte a crear un espacio tranquilo para acercarte a Dios y meditar en Su Palabra.",
            image: musicImage,
            link: "https://www.youtube.com/results?search_query=musica+cristiana+de+adoracion",
            featured: false,
        },
        {
            id: 3,
            title: "El príncipe de Egipto",
            category: "Películas",
            creator: "Brenda Chapman, Steve Hickner y Simon Wells",
            description:
                "Película animada que narra la historia bíblica de Moisés, desde su adopción en la realeza egipcia hasta su llamado para liberar al pueblo hebreo de la esclavitud.",
            reason:
                "La recomendamos por su excelente calidad de animación, su fidelidad al relato bíblico y su destacada banda sonora ganadora del Óscar.",
            image: movieImage,
            link: "https://www.netflix.com/cl/title/18171022",
            featured: true,
        },
        {
            id: 4,
            title: "The Chosen",
            category: "Series",
            creator: "Dallas Jenkins",
            description:
                "Una serie inspirada en los Evangelios que presenta la vida de Jesús y de quienes lo acompañaron.",
            reason:
                "Puede motivar a conocer mejor los relatos bíblicos y profundizar posteriormente en los Evangelios.",
            image: seriesImage,
            link: "https://www.google.com/search?q=The+Chosen+serie",
            featured: false,
        },
        {
            id: 5,
            title: "La creación y su propósito",
            category: "Documentales",
            creator: "Contenido educativo cristiano",
            description:
                "Un material audiovisual para reflexionar sobre la creación, la naturaleza y el propósito de Dios.",
            reason:
                "Lo recomendamos como complemento para conversar sobre la fe y observar la creación con una mirada bíblica.",
            image: documentaryImage,
            link: "https://www.youtube.com/results?search_query=documental+cristiano+la+creacion",
            featured: false,
        },

        {
            id: 6,
            title: "El Proyecto Biblia Pódcast",
            category: "Pódcast",
            creator: "Tim Mackie y Jon Collins (BibleProject)",
            description:
                "Conversaciones a profundidad sobre teología, diseño literario e historia de las Escrituras, explorando series como el Espíritu de Dios, los 10 Mandamientos y cómo leer la Biblia.",
            reason:
                "Es un excelente material complementario para profundizar en la teología y la estructura bíblica de forma clara y accesible.",
            image: podcastImage,
            link: "https://open.spotify.com/search/El%20Proyecto%20Biblia",
            featured: false,
        },
        {
            id: 7,
            title: "Historias bíblicas para compartir",
            category: "Niños y jóvenes",
            creator: "Material cristiano familiar",
            description:
                "Recursos visuales y actividades para conversar sobre la Biblia con niños y jóvenes.",
            reason:
                "Lo recomendamos porque permite aprender de la Palabra mediante contenidos adecuados para diferentes edades.",
            image: childrenImage,
            link: "https://www.youtube.com/results?search_query=historias+biblicas+para+niños",
            featured: false,
        },
    ];

    // Filtramos las recomendaciones según la categoría seleccionada.
    // Filtramos las recomendaciones según la categoría seleccionada.
    const filteredRecommendations =
        selectedCategory === "Todos"
            ? recommendations
            : recommendations.filter(
                (recommendation) =>
                    recommendation.category === selectedCategory
            );

    // Obtenemos las recomendaciones destacadas.
    const featuredRecommendations = recommendations.filter(
        (recommendation) => recommendation.featured
    );

    // Retornamos la estructura visual.
    return (
        <div className="recommendations">

            <main>
                {/* Hero principal. */}
                <section className="recommendations-hero">
                    {/* Capa decorativa. */}
                    <div className="recommendations-hero__overlay"></div>

                    {/* Contenedor central. */}
                    <div className="recommendations-hero__container">
                        {/* Contenido textual. */}
                        <div className="recommendations-hero__content">
                            <p className="recommendations-hero__eyebrow">
                                Contenido para aprender y disfrutar
                            </p>

                            <h1 className="recommendations-hero__title">
                                Recomendaciones
                                <span className="recommendations-hero__highlight">
                                    para crecer juntos
                                </span>
                            </h1>

                            <p className="recommendations-hero__description">
                                Descubre libros, música, películas y otros
                                contenidos que pueden ayudarte a fortalecer tu
                                fe, aprender y compartir en familia.
                            </p>
                        </div>

                        {/* Icono decorativo. */}
                        <div
                            className="recommendations-hero__visual"
                            aria-hidden="true"
                        >
                            <div className="recommendations-hero__icon-circle">
                                <img
                                    className="recommendations-hero__icon"
                                    src={recomendadosIcon}
                                    alt=""
                                />
                            </div>
                        </div>
                    </div>

                    {/* Curva decorativa inferior. */}
                    <div className="recommendations-hero__curve"></div>
                </section>

                {/* Sección de contenidos destacados. */}
                <section
                    className="recommendations-featured"
                    aria-labelledby="recommendations-featured-title"
                >
                    <div className="recommendations-featured__container">
                        <div className="recommendations-section__header">
                            <p className="recommendations-section__eyebrow">
                                Selección especial
                            </p>

                            <h2
                                className="recommendations-section__title"
                                id="recommendations-featured-title"
                            >
                                Recomendados destacados
                            </h2>

                            <p className="recommendations-section__description">
                                Una selección de contenidos que queremos
                                compartir especialmente con nuestra comunidad.
                            </p>
                        </div>

                        <div className="recommendations-featured__grid">
                            {featuredRecommendations.map((recommendation) => (
                                <article
                                    className="recommendation-featured-card"
                                    key={recommendation.id}
                                >
                                    <div className="recommendation-featured-card__image-wrapper">
                                        <img
                                            className="recommendation-featured-card__image"
                                            src={recommendation.image}
                                            alt={`Portada de ${recommendation.title}`}
                                        />

                                        <span className="recommendation-featured-card__category">
                                            {recommendation.category}
                                        </span>
                                    </div>

                                    <div className="recommendation-featured-card__content">
                                        <p className="recommendation-featured-card__creator">
                                            {recommendation.creator}
                                        </p>

                                        <h3 className="recommendation-featured-card__title">
                                            {recommendation.title}
                                        </h3>

                                        <p className="recommendation-featured-card__description">
                                            {recommendation.description}
                                        </p>

                                        <div className="recommendation-featured-card__reason">
                                            <span className="recommendation-featured-card__reason-label">
                                                ¿Por qué lo recomendamos?
                                            </span>

                                            <p>
                                                {recommendation.reason}
                                            </p>
                                        </div>

                                        <a
                                            className="recommendation-featured-card__button"
                                            href={recommendation.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={`Conocer más sobre ${recommendation.title}`}
                                        >
                                            Conocer recomendación
                                            <span aria-hidden="true">→</span>
                                        </a>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Sección con filtros y todas las recomendaciones. */}
                <section
                    className="recommendations-catalog"
                    aria-labelledby="recommendations-catalog-title"
                >
                    <div className="recommendations-catalog__container">
                        <div className="recommendations-catalog__header">
                            <div>
                                <p className="recommendations-section__eyebrow">
                                    Explora el contenido
                                </p>

                                <h2
                                    className="recommendations-section__title"
                                    id="recommendations-catalog-title"
                                >
                                    Todos los recomendados
                                </h2>
                            </div>

                            <p className="recommendations-catalog__intro">
                                Selecciona una categoría para encontrar
                                contenidos según tus intereses.
                            </p>
                        </div>

                        {/* Filtros superiores. */}
                        <div
                            className="recommendations-filters"
                            role="group"
                            aria-label="Filtrar recomendaciones por categoría"
                        >
                            {categories.map((category) => (
                                <button
                                    className={`recommendations-filters__button ${selectedCategory === category
                                        ? "recommendations-filters__button--active"
                                        : ""
                                        }`}
                                    key={category}
                                    type="button"
                                    onClick={() =>
                                        setSelectedCategory(category)
                                    }
                                    aria-pressed={
                                        selectedCategory === category
                                    }
                                >
                                    {category}
                                </button>
                            ))}
                        </div>

                        {/* Cantidad de resultados. */}
                        <p
                            className="recommendations-catalog__results"
                            aria-live="polite"
                        >
                            Mostrando {filteredRecommendations.length}{" "}
                            {filteredRecommendations.length === 1
                                ? "recomendación"
                                : "recomendaciones"}
                        </p>

                        {/* Verificamos si existen resultados. */}
                        {filteredRecommendations.length > 0 ? (
                            <div className="recommendations-grid">
                                {filteredRecommendations.map(
                                    (recommendation) => (
                                        <article
                                            className="recommendation-card"
                                            key={recommendation.id}
                                        >
                                            {/* Imagen de la recomendación. */}
                                            <div className="recommendation-card__image-wrapper">
                                                <img
                                                    className="recommendation-card__image"
                                                    src={
                                                        recommendation.image
                                                    }
                                                    alt={`Portada de ${recommendation.title}`}
                                                />

                                                <span className="recommendation-card__category">
                                                    {
                                                        recommendation.category
                                                    }
                                                </span>
                                            </div>

                                            {/* Contenido de la tarjeta. */}
                                            <div className="recommendation-card__content">
                                                <p className="recommendation-card__creator">
                                                    {
                                                        recommendation.creator
                                                    }
                                                </p>

                                                <h3 className="recommendation-card__title">
                                                    {recommendation.title}
                                                </h3>

                                                <p className="recommendation-card__description">
                                                    {
                                                        recommendation.description
                                                    }
                                                </p>

                                                <div className="recommendation-card__reason">
                                                    <span className="recommendation-card__reason-label">
                                                        ¿Por qué lo
                                                        recomendamos?
                                                    </span>

                                                    <p>
                                                        {
                                                            recommendation.reason
                                                        }
                                                    </p>
                                                </div>

                                                <a
                                                    className="recommendation-card__link"
                                                    href={
                                                        recommendation.link
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    aria-label={`Ver más información sobre ${recommendation.title}`}
                                                >
                                                    Ver más
                                                    <span aria-hidden="true">
                                                        →
                                                    </span>
                                                </a>
                                            </div>
                                        </article>
                                    )
                                )}
                            </div>
                        ) : (
                            // Mensaje para categorías sin contenido.
                            <div className="recommendations-empty">
                                <img
                                    className="recommendations-empty__icon"
                                    src={recomendadosIcon}
                                    alt=""
                                    aria-hidden="true"
                                />

                                <h3 className="recommendations-empty__title">
                                    Aún no tenemos recomendaciones
                                </h3>

                                <p className="recommendations-empty__description">
                                    Muy pronto agregaremos nuevos contenidos en
                                    esta categoría.
                                </p>

                                <button
                                    className="recommendations-empty__button"
                                    type="button"
                                    onClick={() =>
                                        setSelectedCategory("Todos")
                                    }
                                >
                                    Ver todas las recomendaciones
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                {/* Invitación final. */}
                <section className="recommendations-invitation">
                    <div className="recommendations-invitation__container">
                        <div className="recommendations-invitation__content">
                            <p className="recommendations-invitation__eyebrow">
                                Una recomendación responsable
                            </p>

                            <h2 className="recommendations-invitation__title">
                                Examina todo a la luz de la Palabra
                            </h2>

                            <p className="recommendations-invitation__description">
                                Estos contenidos son sugerencias para aprender,
                                reflexionar y compartir. Te animamos a revisar
                                cada enseñanza a la luz de la Biblia.
                            </p>
                        </div>

                        <Link
                            className="recommendations-invitation__button"
                            to="/contacto"
                        >
                            Enviar una consulta
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    );
}

// Exportamos la página para utilizarla desde App.js.
export default Recommendations;