import { Link, useParams } from "react-router-dom";

import Header from "../../../components/public/Header";

import discipleshipMaterials from "../../../data/resources/discipleshipMaterials";

import "../../../styles/pages/public/resources/DiscipleshipMaterialDetails.css";

function DiscipleshipMaterialDetails() {
    // Obtenemos el slug desde la URL.
    // Ejemplo:
    // /recursos/discipulado/primeros-pasos-en-la-fe
    const { slug } = useParams();

    // Buscamos el material que coincide con el slug.
    const material = discipleshipMaterials.find(
        (currentMaterial) =>
            currentMaterial.slug === slug
    );

    // Buscamos la posición del material actual.
    const currentMaterialIndex =
        discipleshipMaterials.findIndex(
            (currentMaterial) =>
                currentMaterial.slug === slug
        );

    // Material anterior.
    const previousMaterial =
        currentMaterialIndex > 0
            ? discipleshipMaterials[
                  currentMaterialIndex - 1
              ]
            : null;

    // Material siguiente.
    const nextMaterial =
        currentMaterialIndex <
        discipleshipMaterials.length - 1
            ? discipleshipMaterials[
                  currentMaterialIndex + 1
              ]
            : null;

    // Si no existe un material con ese slug.
    if (!material) {
        return (
            <>
                <Header />

                <main className="discipleship-material-not-found">
                    <section className="discipleship-material-not-found__container">
                        <p className="discipleship-material-not-found__eyebrow">
                            Material no encontrado
                        </p>

                        <h1>
                            No pudimos encontrar este material
                        </h1>

                        <p>
                            Es posible que el enlace sea
                            incorrecto o que el contenido
                            todavía no esté disponible.
                        </p>

                        <Link to="/recursos/discipulado">
                            Volver a Material de discipulado
                        </Link>
                    </section>
                </main>
            </>
        );
    }

    return (
        <>
            <Header />

            <main className="discipleship-material-details-page">
                {/* Hero principal. */}
                <section className="discipleship-material-details-hero">
                    <div className="discipleship-material-details-hero__overlay" />

                    <div className="discipleship-material-details-hero__container">
                        <nav
                            className="discipleship-material-details-breadcrumb"
                            aria-label="Ruta de navegación"
                        >
                            <Link to="/">
                                Inicio
                            </Link>

                            <span aria-hidden="true">
                                /
                            </span>

                            <Link to="/recursos">
                                Recursos
                            </Link>

                            <span aria-hidden="true">
                                /
                            </span>

                            <Link to="/recursos/discipulado">
                                Material de discipulado
                            </Link>

                            <span aria-hidden="true">
                                /
                            </span>

                            <span aria-current="page">
                                {material.title}
                            </span>
                        </nav>

                        <div className="discipleship-material-details-hero__meta">
                            <span>
                                {material.category}
                            </span>

                            <span>
                                Nivel {material.level}
                            </span>

                            <span>
                                {material.lessons}{" "}
                                {material.lessons === 1
                                    ? "lección"
                                    : "lecciones"}
                            </span>

                            <span>
                                {material.duration}
                            </span>
                        </div>

                        <p className="discipleship-material-details-hero__eyebrow">
                            Material de discipulado
                        </p>

                        <h1>
                            {material.title}
                        </h1>

                        <p className="discipleship-material-details-hero__summary">
                            {material.summary}
                        </p>
                    </div>

                    <div className="discipleship-material-details-hero__curve" />
                </section>

                {/* Presentación y objetivos. */}
                <section className="discipleship-material-details-intro">
                    <div className="discipleship-material-details-intro__container">
                        <article className="discipleship-material-details-intro__content">
                            <p className="discipleship-material-details-section__eyebrow">
                                Antes de comenzar
                            </p>

                            <h2>
                                ¿Qué aprenderás en este material?
                            </h2>

                            <div className="discipleship-material-details-intro__description">
                                {material.description.map(
                                    (paragraph, index) => (
                                        <p
                                            key={`${material.slug}-description-${index}`}
                                        >
                                            {paragraph}
                                        </p>
                                    )
                                )}
                            </div>
                        </article>

                        <aside className="discipleship-material-details-objectives">
                            <p className="discipleship-material-details-objectives__eyebrow">
                                Objetivos
                            </p>

                            <h3>
                                Al finalizar podrás
                            </h3>

                            <ul>
                                {material.objectives.map(
                                    (objective) => (
                                        <li key={objective}>
                                            <span
                                                aria-hidden="true"
                                            >
                                                ✓
                                            </span>

                                            <p>
                                                {objective}
                                            </p>
                                        </li>
                                    )
                                )}
                            </ul>
                        </aside>
                    </div>
                </section>

                {/* Temas principales. */}
                <section className="discipleship-material-details-topics">
                    <div className="discipleship-material-details-topics__container">
                        <div className="discipleship-material-details-topics__heading">
                            <p className="discipleship-material-details-section__eyebrow">
                                Contenido general
                            </p>

                            <h2>
                                Temas que estudiaremos
                            </h2>
                        </div>

                        <div className="discipleship-material-details-topics__list">
                            {material.topics.map(
                                (topic, index) => (
                                    <article key={topic}>
                                        <span>
                                            {String(
                                                index + 1
                                            ).padStart(
                                                2,
                                                "0"
                                            )}
                                        </span>

                                        <h3>
                                            {topic}
                                        </h3>
                                    </article>
                                )
                            )}
                        </div>
                    </div>
                </section>

                {/* Versículo principal. */}
                <section className="discipleship-material-details-verse">
                    <div className="discipleship-material-details-verse__container">
                        <p className="discipleship-material-details-verse__eyebrow">
                            Texto bíblico principal
                        </p>

                        <blockquote>
                            <p>
                                “{material.keyVerse.text}”
                            </p>

                            <footer>
                                {
                                    material.keyVerse
                                        .reference
                                }
                            </footer>
                        </blockquote>
                    </div>
                </section>

                {/* Lecciones del material. */}
                <section className="discipleship-material-details-lessons">
                    <div className="discipleship-material-details-lessons__container">
                        <div className="discipleship-material-details-lessons__heading">
                            <p className="discipleship-material-details-section__eyebrow">
                                Desarrollo del material
                            </p>

                            <h2>
                                Lecciones
                            </h2>

                            <p>
                                Avanza a tu propio ritmo,
                                tomando el tiempo necesario
                                para leer y reflexionar sobre
                                cada enseñanza.
                            </p>
                        </div>

                        <div className="discipleship-material-details-lessons__list">
                            {material.content.map(
                                (lesson, index) => (
                                    <article
                                        key={lesson.id}
                                        className="discipleship-material-lesson"
                                    >
                                        <div className="discipleship-material-lesson__number">
                                            <span>
                                                Lección
                                            </span>

                                            <strong>
                                                {String(
                                                    index + 1
                                                ).padStart(
                                                    2,
                                                    "0"
                                                )}
                                            </strong>
                                        </div>

                                        <div className="discipleship-material-lesson__content">
                                            <h3>
                                                {lesson.title}
                                            </h3>

                                            <div className="discipleship-material-lesson__paragraphs">
                                                {lesson.paragraphs.map(
                                                    (
                                                        paragraph,
                                                        paragraphIndex
                                                    ) => (
                                                        <p
                                                            key={`${lesson.id}-paragraph-${paragraphIndex}`}
                                                        >
                                                            {
                                                                paragraph
                                                            }
                                                        </p>
                                                    )
                                                )}
                                            </div>

                                            <div className="discipleship-material-lesson__reflection">
                                                <p>
                                                    Para reflexionar
                                                </p>

                                                <blockquote>
                                                    {
                                                        lesson.reflection
                                                    }
                                                </blockquote>
                                            </div>
                                        </div>
                                    </article>
                                )
                            )}
                        </div>
                    </div>
                </section>

                {/* Preguntas de reflexión. */}
                <section className="discipleship-material-details-questions">
                    <div className="discipleship-material-details-questions__container">
                        <div className="discipleship-material-details-questions__heading">
                            <p className="discipleship-material-details-section__eyebrow">
                                Reflexión personal
                            </p>

                            <h2>
                                Preguntas para profundizar
                            </h2>

                            <p>
                                Puedes responderlas en un
                                cuaderno, conversarlas con
                                alguien o utilizarlas en un
                                grupo pequeño.
                            </p>
                        </div>

                        <ol className="discipleship-material-details-questions__list">
                            {material.reflectionQuestions.map(
                                (question, index) => (
                                    <li key={question}>
                                        <span>
                                            {String(
                                                index + 1
                                            ).padStart(
                                                2,
                                                "0"
                                            )}
                                        </span>

                                        <p>
                                            {question}
                                        </p>
                                    </li>
                                )
                            )}
                        </ol>
                    </div>
                </section>

                {/* Actividad práctica. */}
                <section className="discipleship-material-details-activity">
                    <div className="discipleship-material-details-activity__container">
                        <div className="discipleship-material-details-activity__heading">
                            <p className="discipleship-material-details-activity__eyebrow">
                                Llévalo a la práctica
                            </p>

                            <h2>
                                {
                                    material
                                        .practicalActivity
                                        .title
                                }
                            </h2>

                            <p>
                                {
                                    material
                                        .practicalActivity
                                        .description
                                }
                            </p>
                        </div>

                        <ol className="discipleship-material-details-activity__steps">
                            {material.practicalActivity.steps.map(
                                (step, index) => (
                                    <li key={step}>
                                        <span>
                                            {String(
                                                index + 1
                                            ).padStart(
                                                2,
                                                "0"
                                            )}
                                        </span>

                                        <p>
                                            {step}
                                        </p>
                                    </li>
                                )
                            )}
                        </ol>
                    </div>
                </section>

                {/* Mensaje final. */}
                <section className="discipleship-material-details-closing">
                    <div className="discipleship-material-details-closing__container">
                        <div>
                            <p className="discipleship-material-details-closing__eyebrow">
                                Continúa creciendo
                            </p>

                            <h2>
                                El aprendizaje se fortalece
                                cuando lo ponemos en práctica
                            </h2>

                            <p>
                                Regresa a este material cuando
                                lo necesites, conversa lo
                                aprendido y busca oportunidades
                                para aplicarlo en tu vida diaria.
                            </p>
                        </div>

                        <Link to="/recursos/discipulado">
                            Ver todos los materiales
                        </Link>
                    </div>
                </section>

                {/* Navegación entre materiales. */}
                <nav
                    className="discipleship-material-details-navigation"
                    aria-label="Navegación entre materiales de discipulado"
                >
                    <div className="discipleship-material-details-navigation__container">
                        {previousMaterial ? (
                            <Link
                                className="discipleship-material-details-navigation__link discipleship-material-details-navigation__link--previous"
                                to={`/recursos/discipulado/${previousMaterial.slug}`}
                            >
                                <span aria-hidden="true">
                                    ←
                                </span>

                                <div>
                                    <small>
                                        Material anterior
                                    </small>

                                    <strong>
                                        {
                                            previousMaterial.title
                                        }
                                    </strong>
                                </div>
                            </Link>
                        ) : (
                            <div className="discipleship-material-details-navigation__placeholder" />
                        )}

                        <Link
                            className="discipleship-material-details-navigation__all"
                            to="/recursos/discipulado"
                        >
                            Ver todos
                        </Link>

                        {nextMaterial ? (
                            <Link
                                className="discipleship-material-details-navigation__link discipleship-material-details-navigation__link--next"
                                to={`/recursos/discipulado/${nextMaterial.slug}`}
                            >
                                <div>
                                    <small>
                                        Material siguiente
                                    </small>

                                    <strong>
                                        {
                                            nextMaterial.title
                                        }
                                    </strong>
                                </div>

                                <span aria-hidden="true">
                                    →
                                </span>
                            </Link>
                        ) : (
                            <div className="discipleship-material-details-navigation__placeholder" />
                        )}
                    </div>
                </nav>
            </main>
        </>
    );
}

export default DiscipleshipMaterialDetails;