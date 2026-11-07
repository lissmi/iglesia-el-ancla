import defaultBibleStudies from "../../../data/resources/bibleStudies";
import { useResourceCatalog } from "../../../services/resourcesContentApi";
import { RESOURCE_CONTENT_DEFAULTS } from "../../../data/resources/resourceCatalogDefaults";
// Importamos useState para controlar el filtro seleccionado
// y el estudio que la persona desea revisar.
import { useState } from "react";

// Importamos Link para navegar dentro de la aplicación.
import { Link } from "react-router-dom";

// Importamos el encabezado público.
import Header from "../../../components/public/Header";

// Importamos el icono principal de Recursos.
import recursosIcon from "../../../assets/icons/recursos.png";

// Importamos la imagen principal de estudios bíblicos.
import estudiosImage from "../../../assets/images/resources/estudios-biblicos.png";

// Importamos los estilos exclusivos de esta página.
import "../../../styles/pages/member/resources/BibleStudies.css";

// Creamos la página pública de Estudios Bíblicos.
function BibleStudies() {
    // Fusionamos el material inicial con los cambios publicados por Administración.
    const { items: studies, heading } = useResourceCatalog("studies", defaultBibleStudies, RESOURCE_CONTENT_DEFAULTS.studies.heading);

    // Definimos las categorías disponibles.
    const categories = ["Todos", ...new Set(studies.map((study) => study.category))];

    // Guardamos la categoría seleccionada.
    const [selectedCategory, setSelectedCategory] = useState("Todos");

    // Guardamos el identificador del estudio abierto.
    const [selectedStudyId, setSelectedStudyId] = useState(null);

    // Consultamos los estudios originales y las ediciones publicadas.


    // Filtramos los estudios según la categoría seleccionada.
    const filteredStudies =
        selectedCategory === "Todos"
            ? studies
            : studies.filter(
                  (study) => study.category === selectedCategory
              );

    // Buscamos el estudio seleccionado.
    const selectedStudy = studies.find(
        (study) => study.id === selectedStudyId
    );

    // Abrimos el contenido de un estudio.
    const handleOpenStudy = (studyId) => {
        // Guardamos el identificador seleccionado.
        setSelectedStudyId(studyId);

        // Esperamos a que React muestre el contenido.
        setTimeout(() => {
            // Buscamos la sección del estudio abierto.
            const studyContent = document.getElementById(
                "selected-bible-study"
            );

            // Verificamos que el elemento exista.
            if (studyContent) {
                // Desplazamos suavemente la página.
                studyContent.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }
        }, 50);
    };

    // Cerramos el estudio seleccionado.
    const handleCloseStudy = () => {
        setSelectedStudyId(null);
    };

    // Retornamos la estructura visual.
    return (
        // Contenedor general de la página.
        <div className="bible-studies">
            {/* Mostramos el encabezado público. */}
            <Header />

            {/* Contenido principal. */}
            <main>
                {/* Hero de Estudios Bíblicos. */}
                <section className="bible-studies-hero">
                    {/* Capa decorativa. */}
                    <div className="bible-studies-hero__overlay"></div>

                    {/* Contenedor central. */}
                    <div className="bible-studies-hero__container">
                        {/* Contenido textual. */}
                        <div className="bible-studies-hero__content">
                            {/* Ruta visual de navegación. */}
                            <nav
                                className="bible-studies-breadcrumb"
                                aria-label="Ruta de navegación"
                            >
                                <Link to="/recursos">
                                    Recursos
                                </Link>

                                <span aria-hidden="true">/</span>

                                <span>Estudios bíblicos</span>
                            </nav>

                            {/* Texto pequeño. */}
                            <p className="bible-studies-hero__eyebrow">{heading.eyebrow}</p>

                            {/* Título principal. */}
                            <h1 className="bible-studies-hero__title">{heading.title}{" "}
<span className="bible-studies-hero__highlight">{heading.highlight}</span></h1>

                            {/* Descripción principal. */}
                            <p className="bible-studies-hero__description">{heading.description}</p>
                        </div>

                        {/* Imagen decorativa. */}
                        <div className="bible-studies-hero__visual">
                            <div className="bible-studies-hero__image-wrapper">
                                <img
                                    className="bible-studies-hero__image"
                                    src={estudiosImage}
                                    alt="Biblia abierta preparada para un estudio bíblico"
                                />

                                <img
                                    className="bible-studies-hero__icon"
                                    src={recursosIcon}
                                    alt=""
                                    aria-hidden="true"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Curva decorativa inferior. */}
                    <div className="bible-studies-hero__curve"></div>
                </section>

                {/* Sección introductoria. */}
                <section className="bible-studies-intro">
                    <div className="bible-studies-intro__container">
                        {/* Título de introducción. */}
                        <div className="bible-studies-intro__heading">
                            <p className="bible-studies-section__eyebrow">
                                Antes de comenzar
                            </p>

                            <h2 className="bible-studies-section__title">
                                Acércate a la Biblia con disposición para
                                aprender
                            </h2>
                        </div>

                        {/* Consejos iniciales. */}
                        <div className="bible-studies-intro__steps">
                            <article className="bible-study-step">
                                <span className="bible-study-step__number">
                                    01
                                </span>

                                <h3 className="bible-study-step__title">
                                    Busca un momento tranquilo
                                </h3>

                                <p className="bible-study-step__description">
                                    Escoge un lugar donde puedas leer y
                                    reflexionar sin demasiadas distracciones.
                                </p>
                            </article>

                            <article className="bible-study-step">
                                <span className="bible-study-step__number">
                                    02
                                </span>

                                <h3 className="bible-study-step__title">
                                    Comienza con oración
                                </h3>

                                <p className="bible-study-step__description">
                                    Pídele a Dios sabiduría y disposición para
                                    comprender lo que Su Palabra enseña.
                                </p>
                            </article>

                            <article className="bible-study-step">
                                <span className="bible-study-step__number">
                                    03
                                </span>

                                <h3 className="bible-study-step__title">
                                    Lee y toma notas
                                </h3>

                                <p className="bible-study-step__description">
                                    Registra las ideas principales, tus
                                    preguntas y aquello que deseas aplicar.
                                </p>
                            </article>
                        </div>
                    </div>
                </section>

                {/* Catálogo de estudios. */}
                <section
                    className="bible-studies-catalog"
                    aria-labelledby="bible-studies-catalog-title"
                >
                    <div className="bible-studies-catalog__container">
                        {/* Encabezado del catálogo. */}
                        <div className="bible-studies-catalog__header">
                            <div>
                                <p className="bible-studies-section__eyebrow">
                                    Material disponible
                                </p>

                                <h2
                                    className="bible-studies-section__title"
                                    id="bible-studies-catalog-title"
                                >
                                    Elige un estudio
                                </h2>
                            </div>

                            <p className="bible-studies-catalog__intro">
                                Puedes comenzar por cualquier tema y avanzar a
                                tu propio ritmo.
                            </p>
                        </div>

                        {/* Filtros. */}
                        <div
                            className="bible-studies-filters"
                            role="group"
                            aria-label="Filtrar estudios bíblicos"
                        >
                            {categories.map((category) => (
                                <button
                                    className={`bible-studies-filters__button ${
                                        selectedCategory === category
                                            ? "bible-studies-filters__button--active"
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
                            className="bible-studies-catalog__results"
                            aria-live="polite"
                        >
                            Mostrando {filteredStudies.length}{" "}
                            {filteredStudies.length === 1
                                ? "estudio"
                                : "estudios"}
                        </p>

                        {/* Cuadrícula de estudios. */}
                        <div className="bible-studies-grid">
                            {filteredStudies.map((study) => (
                                <article
                                    className="bible-study-card"
                                    key={study.id}
                                >
                                    {/* Cabecera visual. */}
                                    <div className="bible-study-card__header">
                                        <span className="bible-study-card__category">
                                            {study.category}
                                        </span>

                                        {study.featured && (
                                            <span className="bible-study-card__featured">
                                                Recomendado para comenzar
                                            </span>
                                        )}
                                    </div>

                                    {/* Contenido principal. */}
                                    <div className="bible-study-card__content">
                                        <p className="bible-study-card__passage">
                                            {study.passage}
                                        </p>

                                        <h3 className="bible-study-card__title">
                                            {study.title}
                                        </h3>

                                        <p className="bible-study-card__description">
                                            {study.description}
                                        </p>

                                        {/* Datos prácticos. */}
                                        <div className="bible-study-card__information">
                                            <div style={{ gridColumn: "1 / -1" }}>
                                                <span>Nivel</span>
                                                <strong>{study.level}</strong>
                                            </div>

                                        </div>

                                        {/* Propósito. */}
                                        <div className="bible-study-card__purpose">
                                            <span>Propósito del estudio</span>

                                            <p>{study.purpose}</p>
                                        </div>

                                        {/* Botón para abrir el estudio. */}
                                        <button
                                            className="bible-study-card__button"
                                            type="button"
                                            onClick={() =>
                                                handleOpenStudy(study.id)
                                            }
                                        >
                                            Comenzar estudio
                                            <span aria-hidden="true">→</span>
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Mostramos el estudio seleccionado. */}
                {selectedStudy && (
                    <section
                        className="selected-bible-study"
                        id="selected-bible-study"
                        aria-labelledby="selected-bible-study-title"
                    >
                        <div className="selected-bible-study__container">
                            {/* Cabecera del estudio abierto. */}
                            <div className="selected-bible-study__header">
                                <div>
                                    <p className="selected-bible-study__eyebrow">
                                        {selectedStudy.category}
                                    </p>

                                    <h2
                                        className="selected-bible-study__title"
                                        id="selected-bible-study-title"
                                    >
                                        {selectedStudy.title}
                                    </h2>

                                    <p className="selected-bible-study__passage">
                                        Pasaje principal:{" "}
                                        <strong>
                                            {selectedStudy.passage}
                                        </strong>
                                    </p>
                                </div>

                                {/* Botón para cerrar el contenido. */}
                                <button
                                    className="selected-bible-study__close"
                                    type="button"
                                    onClick={handleCloseStudy}
                                    aria-label="Cerrar estudio bíblico"
                                >
                                    Cerrar
                                    <span aria-hidden="true">×</span>
                                </button>
                            </div>

                            {/* Introducción. */}
                            <div className="selected-bible-study__block">
                                <p className="selected-bible-study__block-label">
                                    Introducción
                                </p>

                                <p className="selected-bible-study__paragraph">
                                    {selectedStudy.introduction}
                                </p>
                            </div>

                            {/* Preguntas de reflexión. */}
                            <div className="selected-bible-study__block">
                                <p className="selected-bible-study__block-label">
                                    Preguntas para reflexionar
                                </p>

                                <ol className="selected-bible-study__questions">
                                    {selectedStudy.questions.map(
                                        (question, index) => (
                                            <li key={index}>
                                                {question}
                                            </li>
                                        )
                                    )}
                                </ol>
                            </div>

                            {/* Aplicación final. */}
                            <div className="selected-bible-study__application">
                                <p className="selected-bible-study__block-label">
                                    Aplicación práctica
                                </p>

                                <p>{selectedStudy.application}</p>
                            </div>
                        </div>
                    </section>
                )}

                {/* Invitación final. */}
                <section className="bible-studies-help">
                    <div className="bible-studies-help__container">
                        <div>
                            <p className="bible-studies-help__eyebrow">
                                Aprende acompañado
                            </p>

                            <h2 className="bible-studies-help__title">
                                ¿Tienes preguntas sobre algún estudio?
                            </h2>

                            <p className="bible-studies-help__description">
                                Puedes escribirnos para recibir orientación o
                                conocer nuestros espacios de estudio bíblico.
                            </p>
                        </div>

                        <div className="bible-studies-help__actions">
                            <Link
                                className="bible-studies-help__button bible-studies-help__button--primary"
                                to="/contacto"
                            >
                                Enviar una consulta
                            </Link>

                            <Link
                                className="bible-studies-help__button bible-studies-help__button--secondary"
                                to="/recursos"
                            >
                                Volver a Recursos
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

// Exportamos la página para utilizarla desde App.js.
export default BibleStudies;
