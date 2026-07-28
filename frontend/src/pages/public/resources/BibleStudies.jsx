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
import "../../../styles/pages/public/resources/BibleStudies.css";

// Creamos la página pública de Estudios Bíblicos.
function BibleStudies() {
    // Definimos las categorías disponibles.
    const categories = [
        "Todos",
        "Vida cristiana",
        "Oración",
        "Identidad",
        "Crecimiento espiritual",
        "Estudio bíblico",
    ];

    // Guardamos la categoría seleccionada.
    const [selectedCategory, setSelectedCategory] = useState("Todos");

    // Guardamos el identificador del estudio abierto.
    const [selectedStudyId, setSelectedStudyId] = useState(null);

    // Creamos contenido temporal mientras todavía no utilizamos MongoDB.
    const studies = [
        {
            // Identificador temporal.
            id: 1,

            // Categoría del estudio.
            category: "Estudio bíblico",

            // Título del estudio.
            title: "Cómo comenzar a estudiar la Biblia",

            // Descripción breve.
            description:
                "Una introducción sencilla para aprender a leer, observar y comprender un pasaje bíblico.",

            // Propósito del estudio.
            purpose:
                "Ayudarte a desarrollar una forma ordenada y constante de acercarte a la Palabra de Dios.",

            // Nivel recomendado.
            level: "Inicial",

            // Duración aproximada.
            duration: "20 a 30 minutos",

            // Pasaje principal.
            passage: "2 Timoteo 3:16-17",

            // Texto introductorio del estudio.
            introduction:
                "La Biblia es la Palabra de Dios y constituye la base de nuestra fe. Estudiarla no significa solamente leer rápidamente un capítulo, sino observar con atención lo que el texto dice, comprender su enseñanza y reflexionar sobre cómo aplicarla.",

            // Preguntas de reflexión.
            questions: [
                "¿Qué enseña este pasaje acerca de Dios?",
                "¿Qué verdad importante aparece en el texto?",
                "¿Existe una instrucción, promesa o advertencia?",
                "¿Cómo puedo aplicar esta enseñanza durante la semana?",
            ],

            // Aplicación final.
            application:
                "Escoge un pasaje breve, léelo más de una vez y escribe con tus propias palabras qué aprendiste. Termina orando para pedirle a Dios que te ayude a vivir de acuerdo con Su Palabra.",

            // Indicamos si aparecerá como estudio destacado.
            featured: true,
        },
        {
            id: 2,
            category: "Oración",
            title: "Aprendiendo a orar",

            description:
                "Un estudio para comprender qué es la oración y cómo podemos desarrollar una relación más cercana con Dios.",

            purpose:
                "Reconocer la oración como una conversación sincera con Dios basada en la confianza y Su Palabra.",

            level: "Inicial",

            duration: "25 minutos",

            passage: "Mateo 6:5-13",

            introduction:
                "Jesús enseñó a sus discípulos a orar con sinceridad, evitando las apariencias y confiando en que el Padre conoce nuestras necesidades. La oración incluye adoración, gratitud, confesión y petición.",

            questions: [
                "¿Qué enseña Jesús sobre la actitud al orar?",
                "¿Qué elementos aparecen en la oración enseñada por Jesús?",
                "¿Qué preocupaciones necesitas presentar delante de Dios?",
                "¿Cómo puedes incorporar la oración a tu rutina diaria?",
            ],

            application:
                "Dedica algunos minutos a agradecer, reconocer tus necesidades y presentar a otras personas delante de Dios.",

            featured: true,
        },
        {
            id: 3,
            category: "Identidad",
            title: "Nuestra identidad en Cristo",

            description:
                "Una reflexión sobre la nueva identidad que recibe toda persona que ha puesto su fe en Jesucristo.",

            purpose:
                "Comprender que nuestra identidad principal no depende de los logros, errores o circunstancias, sino de nuestra relación con Cristo.",

            level: "Intermedio",

            duration: "30 minutos",

            passage: "2 Corintios 5:17",

            introduction:
                "La fe en Cristo produce una transformación profunda. El creyente recibe una nueva vida y aprende a mirar su historia, sus decisiones y su futuro desde la gracia de Dios.",

            questions: [
                "¿Qué significa ser una nueva creación?",
                "¿Qué aspectos de la antigua vida deben quedar atrás?",
                "¿Cómo cambia nuestra manera de vernos a nosotros mismos?",
                "¿Qué verdad de este pasaje necesitas recordar?",
            ],

            application:
                "Escribe tres verdades bíblicas acerca de tu identidad en Cristo y revísalas durante la semana.",

            featured: false,
        },
        {
            id: 4,
            category: "Crecimiento espiritual",
            title: "El fruto del Espíritu",

            description:
                "Un estudio para conocer las características que Dios desea desarrollar en la vida de cada creyente.",

            purpose:
                "Reflexionar sobre la obra del Espíritu Santo y reconocer áreas en las que necesitamos seguir creciendo.",

            level: "Intermedio",

            duration: "30 a 40 minutos",

            passage: "Gálatas 5:22-23",

            introduction:
                "El fruto del Espíritu describe el carácter que comienza a manifestarse en una vida guiada por Dios. No se trata solamente de esfuerzo humano, sino de permanecer cerca de Cristo y permitir que Él transforme nuestras actitudes.",

            questions: [
                "¿Qué características conforman el fruto del Espíritu?",
                "¿Cuál de estas características ves desarrollándose en tu vida?",
                "¿En cuál necesitas crecer especialmente?",
                "¿Cómo puede reflejarse este fruto en tus relaciones?",
            ],

            application:
                "Escoge una característica del fruto del Espíritu y busca una forma concreta de practicarla durante esta semana.",

            featured: false,
        },
        {
            id: 5,
            category: "Vida cristiana",
            title: "Vivir con esperanza",

            description:
                "Un estudio sobre la esperanza firme que encontramos en Jesucristo en medio de las dificultades.",

            purpose:
                "Recordar que la esperanza cristiana está fundamentada en Dios y no depende únicamente de nuestras circunstancias.",

            level: "Todos los niveles",

            duration: "25 minutos",

            passage: "Hebreos 6:19",

            introduction:
                "La esperanza bíblica no es solamente un deseo de que las cosas mejoren. Es una confianza firme en el carácter, las promesas y la fidelidad de Dios.",

            questions: [
                "¿Por qué la esperanza es comparada con un ancla?",
                "¿Qué situaciones pueden debilitar nuestra esperanza?",
                "¿En qué promesa de Dios puedes descansar?",
                "¿Cómo puedes transmitir esperanza a otra persona?",
            ],

            application:
                "Identifica una preocupación que estés enfrentando y entrégala a Dios en oración, recordando una promesa bíblica relacionada.",

            featured: false,
        },
    ];

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
                            <p className="bible-studies-hero__eyebrow">
                                Crecer en la Palabra
                            </p>

                            {/* Título principal. */}
                            <h1 className="bible-studies-hero__title">
                                Estudios bíblicos
                                <span className="bible-studies-hero__highlight">
                                    para aprender y reflexionar
                                </span>
                            </h1>

                            {/* Descripción principal. */}
                            <p className="bible-studies-hero__description">
                                Encuentra estudios sencillos para conocer mejor
                                la Biblia, reflexionar en sus enseñanzas y
                                aplicarlas a tu vida diaria.
                            </p>
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
                                            <div>
                                                <span>Nivel</span>
                                                <strong>{study.level}</strong>
                                            </div>

                                            <div>
                                                <span>Duración</span>
                                                <strong>
                                                    {study.duration}
                                                </strong>
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