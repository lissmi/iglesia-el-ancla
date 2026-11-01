// Importamos useState para controlar la herramienta de estudio seleccionada.
import { useState } from "react";

// Importamos Link para navegar entre las páginas sin recargar la aplicación.
import { Link } from "react-router-dom";

// Importamos el encabezado público.
import Header from "../../../components/public/Header";

// Importamos el icono principal de la sección Recursos.
import recursosIcon from "../../../assets/icons/recursos.png";

// Importamos la imagen principal de Biblia y herramientas.
import bibleToolsImage from "../../../assets/images/resources/biblia-estudio.png";

// Importamos los datos de los 39 libros del Antiguo Testamento.
import oldTestamentBooks from "../../../data/bible/oldTestamentBooks";

// Importamos los datos de los 27 libros del Nuevo Testamento.
import newTestamentBooks from "../../../data/bible/newTestamentBooks";

// Importamos los estilos exclusivos de esta página.
import "../../../styles/pages/member/resources/BibleStudyTools.css";

// Guardamos fuera del componente las herramientas de estudio.
//
// De esta manera, el arreglo no vuelve a crearse cada vez que
// React actualiza la página.
const studyTools = [
    {
        id: 1,
        title: "Observa el contexto",
        category: "Comprensión bíblica",
        summary:
            "Aprende a revisar lo que ocurre antes y después de un pasaje.",
        description:
            "El contexto ayuda a comprender correctamente un texto bíblico. Antes de interpretar un versículo, es importante observar el capítulo, el libro, sus destinatarios y la situación en la que fue escrito.",
        questions: [
            "¿Quién escribió el libro?",
            "¿A quién estaba dirigido?",
            "¿Qué ocurre antes y después del pasaje?",
            "¿Cuál parece ser la idea principal del capítulo?",
        ],
        recommendation:
            "Lee al menos el capítulo completo antes de formular una conclusión sobre un versículo.",
    },
    {
        id: 2,
        title: "Usa una concordancia",
        category: "Búsqueda bíblica",
        summary:
            "Encuentra otros pasajes relacionados con una palabra o tema.",
        description:
            "Una concordancia permite buscar dónde aparece una palabra dentro de la Biblia. Puede ayudarte a comparar pasajes y estudiar temas como la gracia, la oración, la esperanza o la fe.",
        questions: [
            "¿Qué palabra principal deseas investigar?",
            "¿En qué otros libros aparece?",
            "¿Se utiliza siempre con el mismo sentido?",
            "¿Qué enseñanzas se repiten?",
        ],
        recommendation:
            "No construyas una enseñanza utilizando solamente una palabra aislada. Revisa siempre cada pasaje en su contexto.",
    },
    {
        id: 3,
        title: "Consulta un diccionario bíblico",
        category: "Herramienta de consulta",
        summary:
            "Conoce el significado de lugares, personas y conceptos bíblicos.",
        description:
            "Los diccionarios bíblicos contienen información sobre personajes, ciudades, costumbres, objetos y conceptos presentes en las Escrituras.",
        questions: [
            "¿Existe una palabra o costumbre que no comprendes?",
            "¿Qué información histórica aporta la herramienta?",
            "¿Cómo ayuda ese dato a comprender el pasaje?",
            "¿La explicación coincide con el texto bíblico?",
        ],
        recommendation:
            "Utiliza estas herramientas como apoyo. La Biblia debe continuar siendo la fuente principal del estudio.",
    },
    {
        id: 4,
        title: "Compara traducciones",
        category: "Lectura bíblica",
        summary:
            "Observa cómo diferentes traducciones expresan un mismo texto.",
        description:
            "Comparar traducciones puede ayudarte a identificar expresiones difíciles y comprender mejor una oración. Las diferencias no deben analizarse de manera aislada, sino considerando el sentido completo del pasaje.",
        questions: [
            "¿Qué palabras cambian entre las traducciones?",
            "¿La idea principal se mantiene?",
            "¿Alguna expresión resulta más clara?",
            "¿Qué dudas siguen necesitando estudio?",
        ],
        recommendation:
            "Escoge una traducción principal para tu lectura habitual y utiliza otras como apoyo.",
    },
    {
        id: 5,
        title: "Crea un plan de lectura",
        category: "Organización",
        summary:
            "Organiza una lectura bíblica constante y realista.",
        description:
            "Un buen plan de lectura debe adaptarse a tu tiempo disponible. Puedes avanzar por un libro completo, estudiar un tema o alternar entre el Antiguo y el Nuevo Testamento.",
        questions: [
            "¿Cuántos días por semana puedes leer?",
            "¿Cuánto tiempo puedes dedicar?",
            "¿Qué libro deseas comenzar?",
            "¿Dónde registrarás lo aprendido?",
        ],
        recommendation:
            "Comienza con una meta pequeña y sostenible. La constancia es más importante que avanzar rápidamente.",
    },
    {
        id: 6,
        title: "Registra tus observaciones",
        category: "Estudio personal",
        summary:
            "Escribe lo que observas, comprendes y deseas aplicar.",
        description:
            "Tomar notas ayuda a ordenar las ideas, recordar preguntas y reconocer enseñanzas que pueden pasar desapercibidas durante una lectura rápida.",
        questions: [
            "¿Qué observaste en el texto?",
            "¿Qué enseña acerca de Dios?",
            "¿Qué pregunta necesitas investigar?",
            "¿Cómo puedes responder a lo aprendido?",
        ],
        recommendation:
            "Utiliza un cuaderno exclusivo para registrar tus estudios y revisar periódicamente tu avance.",
    },
];

// Creamos un componente reutilizable para mostrar cada tarjeta bíblica.
//
// Por ahora permanece dentro del mismo archivo porque solamente será
// utilizado por BibleStudyTools.
//
// Más adelante también podemos moverlo a:
// components/public/bible/BibleBookCard.jsx
function BibleBookCard({ book }) {
    // Retornamos la tarjeta visual del libro recibido.
    return (
        <article className="bible-book-card">
            {/* Parte superior de la tarjeta. */}
            <div className="bible-book-card__top">
                {/* Mostramos el testamento al que pertenece el libro. */}
                <span className="bible-book-card__testament">
                    {book.testament}
                </span>

                {/* Mostramos la cantidad de capítulos. */}
                <span className="bible-book-card__chapters">
                    {book.chapters}{" "}
                    {book.chapters === 1
                        ? "capítulo"
                        : "capítulos"}
                </span>
            </div>

            {/* Contenido principal de la tarjeta. */}
            <div className="bible-book-card__content">
                {/* Mostramos el grupo bíblico. */}
                <p className="bible-book-card__group">
                    {book.group}
                </p>

                {/* Mostramos el nombre del libro. */}
                <h3 className="bible-book-card__title">
                    {book.name}
                </h3>

                {/* Mostramos el tema principal del libro. */}
                <p className="bible-book-card__theme">
                    {book.theme}
                </p>

                {/* Acciones disponibles para el libro. */}
                <div className="bible-book-card__actions">
                    {/* Enlace hacia la futura página informativa del libro. */}
                    <Link
                        className="bible-book-card__button"
                        to={`/recursos/biblia/libro/${book.slug}`}
                        aria-label={`Conocer el libro de ${book.name}`}
                    >
                        Conocer el libro

                        <span aria-hidden="true">
                            →
                        </span>
                    </Link>

                    {/* Enlace hacia el futuro lector bíblico. */}
                    <Link
                        className="bible-book-card__reader-link"
                        to={`/recursos/biblia/leer/${book.slug}`}
                        aria-label={`Leer el libro de ${book.name}`}
                    >
                        Leer libro
                    </Link>
                </div>
            </div>
        </article>
    );
}

// Creamos la página pública de Biblia y herramientas de estudio.
function BibleStudyTools() {
    // Guardamos el identificador de la herramienta seleccionada.
    const [selectedToolId, setSelectedToolId] = useState(1);

    // Obtenemos solamente los primeros cuatro libros
    // del Antiguo Testamento para mostrarlos como vista previa.
    const featuredOldTestamentBooks = oldTestamentBooks.slice(0, 4);

    // Obtenemos solamente los primeros cuatro libros
    // del Nuevo Testamento para mostrarlos como vista previa.
    const featuredNewTestamentBooks = newTestamentBooks.slice(0, 4);

    // Buscamos la herramienta seleccionada utilizando su identificador.
    const selectedTool =
        studyTools.find(
            (tool) => tool.id === selectedToolId
        ) || studyTools[0];

    // Retornamos la estructura visual de la página.
    return (
        // Contenedor general de la página.
        <div className="bible-tools">
            {/* Mostramos el encabezado público. */}
            <Header />

            {/* Contenido principal. */}
            <main>
                {/* Hero principal. */}
                <section className="bible-tools-hero">
                    {/* Capa decorativa sobre el fondo. */}
                    <div className="bible-tools-hero__overlay"></div>

                    {/* Contenedor central del hero. */}
                    <div className="bible-tools-hero__container">
                        {/* Contenido textual. */}
                        <div className="bible-tools-hero__content">
                            {/* Ruta visual de navegación. */}
                            <nav
                                className="bible-tools-breadcrumb"
                                aria-label="Ruta de navegación"
                            >
                                {/* Enlace para volver a Recursos. */}
                                <Link to="/recursos">
                                    Recursos
                                </Link>

                                {/* Separador visual. */}
                                <span aria-hidden="true">
                                    /
                                </span>

                                {/* Página actual. */}
                                <span>
                                    Biblia y herramientas de estudio
                                </span>
                            </nav>

                            {/* Texto pequeño sobre el título. */}
                            <p className="bible-tools-hero__eyebrow">
                                Conoce y comprende la Palabra
                            </p>

                            {/* Título principal. */}
                            <h1 className="bible-tools-hero__title">
                                Biblia y herramientas

                                <span className="bible-tools-hero__highlight">
                                    para tu estudio
                                </span>
                            </h1>

                            {/* Descripción principal. */}
                            <p className="bible-tools-hero__description">
                                Descubre recursos sencillos para conocer la
                                estructura de la Biblia, comprender mejor sus
                                libros y estudiar cada pasaje con mayor
                                atención.
                            </p>
                        </div>

                        {/* Imagen principal. */}
                        <div className="bible-tools-hero__visual">
                            {/* Contenedor visual de la imagen. */}
                            <div className="bible-tools-hero__image-wrapper">
                                {/* Imagen de Biblia y materiales de estudio. */}
                                <img
                                    className="bible-tools-hero__image"
                                    src={bibleToolsImage}
                                    alt="Biblia abierta con materiales de estudio"
                                />

                                {/* Icono decorativo de Recursos. */}
                                <img
                                    className="bible-tools-hero__icon"
                                    src={recursosIcon}
                                    alt=""
                                    aria-hidden="true"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Curva decorativa inferior. */}
                    <div className="bible-tools-hero__curve"></div>
                </section>

                {/* Sección introductoria. */}
                <section className="bible-tools-intro">
                    {/* Contenedor central. */}
                    <div className="bible-tools-intro__container">
                        {/* Encabezado introductorio. */}
                        <div className="bible-tools-intro__heading">
                            {/* Texto pequeño. */}
                            <p className="bible-tools-section__eyebrow">
                                Una gran historia
                            </p>

                            {/* Título de la sección. */}
                            <h2 className="bible-tools-section__title">
                                Una biblioteca formada por diferentes libros
                            </h2>

                            {/* Explicación introductoria. */}
                            <p className="bible-tools-intro__description">
                                La Biblia reúne textos históricos, poesía,
                                profecía, cartas, enseñanzas y relatos escritos
                                en distintos momentos. Sin embargo, todos forman
                                parte de una misma historia que muestra el plan
                                de Dios y dirige nuestra mirada hacia Cristo.
                            </p>
                        </div>

                        {/* Datos rápidos sobre la Biblia. */}
                        <div className="bible-tools-intro__facts">
                            {/* Total de libros. */}
                            <article className="bible-tools-fact">
                                <strong>66</strong>

                                <span>
                                    libros bíblicos
                                </span>
                            </article>

                            {/* Libros del Antiguo Testamento. */}
                            <article className="bible-tools-fact">
                                <strong>39</strong>

                                <span>
                                    en el Antiguo Testamento
                                </span>
                            </article>

                            {/* Libros del Nuevo Testamento. */}
                            <article className="bible-tools-fact">
                                <strong>27</strong>

                                <span>
                                    en el Nuevo Testamento
                                </span>
                            </article>
                        </div>
                    </div>
                </section>

                {/* Explorador resumido de libros bíblicos. */}
                <section
                    className="bible-books"
                    aria-labelledby="bible-books-title"
                >
                    {/* Contenedor central del explorador. */}
                    <div className="bible-books__container">
                        {/* Encabezado general del explorador. */}
                        <div className="bible-books__header">
                            {/* Título del explorador. */}
                            <div>
                                <p className="bible-tools-section__eyebrow">
                                    Explora la Biblia
                                </p>

                                <h2
                                    className="bible-tools-section__title"
                                    id="bible-books-title"
                                >
                                    Comienza a conocer sus libros
                                </h2>
                            </div>
                        </div>

                        {/* Sección del Antiguo Testamento. */}
                        <section
                            className="bible-testament-section"
                            aria-labelledby="old-testament-title"
                        >
                            {/* Encabezado del Antiguo Testamento. */}
                            <div className="bible-testament-section__header">
                                {/* Nombre y cantidad de libros. */}
                                <div>
                                    <p className="bible-tools-section__eyebrow">
                                        39 libros
                                    </p>

                                    <h3
                                        className="bible-testament-section__title"
                                        id="old-testament-title"
                                    >
                                        Antiguo Testamento
                                    </h3>
                                </div>

                                {/* Descripción del testamento. */}
                                <p className="bible-testament-section__description">
                                    Conoce la creación, la historia de Israel,
                                    los libros de sabiduría y el mensaje de los
                                    profetas.
                                </p>
                            </div>

                            {/* Cuadrícula con cuatro libros destacados. */}
                            <div className="bible-books__grid">
                                {/* Recorremos los cuatro libros seleccionados. */}
                                {featuredOldTestamentBooks.map((book) => (
                                    // Utilizamos la tarjeta reutilizable.
                                    <BibleBookCard
                                        key={book.id}
                                        book={book}
                                    />
                                ))}
                            </div>

                            {/* Acción para visitar todos los libros. */}
                            <div className="bible-testament-section__actions">
                                <Link
                                    className="bible-testament-section__button"
                                    to="/recursos/biblia/libros/antiguo-testamento"
                                >
                                    Ver los 39 libros

                                    <span aria-hidden="true">
                                        →
                                    </span>
                                </Link>
                            </div>
                        </section>

                        {/* Sección del Nuevo Testamento. */}
                        <section
                            className="bible-testament-section"
                            aria-labelledby="new-testament-title"
                        >
                            {/* Encabezado del Nuevo Testamento. */}
                            <div className="bible-testament-section__header">
                                {/* Nombre y cantidad de libros. */}
                                <div>
                                    <p className="bible-tools-section__eyebrow">
                                        27 libros
                                    </p>

                                    <h3
                                        className="bible-testament-section__title"
                                        id="new-testament-title"
                                    >
                                        Nuevo Testamento
                                    </h3>
                                </div>

                                {/* Descripción del testamento. */}
                                <p className="bible-testament-section__description">
                                    Conoce la vida de Jesús, el nacimiento de la
                                    iglesia, las cartas apostólicas y el libro
                                    de Apocalipsis.
                                </p>
                            </div>

                            {/* Cuadrícula con cuatro libros destacados. */}
                            <div className="bible-books__grid">
                                {/* Recorremos los cuatro libros seleccionados. */}
                                {featuredNewTestamentBooks.map((book) => (
                                    // Utilizamos la tarjeta reutilizable.
                                    <BibleBookCard
                                        key={book.id}
                                        book={book}
                                    />
                                ))}
                            </div>

                            {/* Acción para visitar todos los libros. */}
                            <div className="bible-testament-section__actions">
                                <Link
                                    className="bible-testament-section__button"
                                    to="/recursos/biblia/libros/nuevo-testamento"
                                >
                                    Ver los 27 libros

                                    <span aria-hidden="true">
                                        →
                                    </span>
                                </Link>
                            </div>
                        </section>
                    </div>
                </section>

                {/* Herramientas de estudio. */}
                <section
                    className="study-tools"
                    aria-labelledby="study-tools-title"
                >
                    {/* Contenedor central. */}
                    <div className="study-tools__container">
                        {/* Encabezado de la sección. */}
                        <div className="study-tools__header">
                            {/* Título principal. */}
                            <div>
                                <p className="bible-tools-section__eyebrow">
                                    Estudia con mayor profundidad
                                </p>

                                <h2
                                    className="bible-tools-section__title"
                                    id="study-tools-title"
                                >
                                    Herramientas que pueden ayudarte
                                </h2>
                            </div>

                            {/* Descripción de la sección. */}
                            <p className="study-tools__intro">
                                Selecciona una herramienta para aprender cómo
                                utilizarla de manera responsable durante tu
                                estudio bíblico.
                            </p>
                        </div>

                        {/* Navegación de herramientas. */}
                        <div
                            className="study-tools__navigation"
                            role="tablist"
                            aria-label="Herramientas para el estudio bíblico"
                        >
                            {/* Creamos un botón por cada herramienta. */}
                            {studyTools.map((tool) => (
                                <button
                                    className={`study-tools__navigation-button ${
                                        selectedToolId === tool.id
                                            ? "study-tools__navigation-button--active"
                                            : ""
                                    }`}
                                    key={tool.id}
                                    type="button"
                                    role="tab"
                                    aria-selected={
                                        selectedToolId === tool.id
                                    }
                                    onClick={() =>
                                        setSelectedToolId(tool.id)
                                    }
                                >
                                    {/* Categoría de la herramienta. */}
                                    <span>
                                        {tool.category}
                                    </span>

                                    {/* Nombre de la herramienta. */}
                                    <strong>
                                        {tool.title}
                                    </strong>
                                </button>
                            ))}
                        </div>

                        {/* Información de la herramienta seleccionada. */}
                        <article className="selected-study-tool">
                            {/* Columna principal. */}
                            <div className="selected-study-tool__content">
                                {/* Categoría. */}
                                <p className="selected-study-tool__eyebrow">
                                    {selectedTool.category}
                                </p>

                                {/* Título. */}
                                <h3 className="selected-study-tool__title">
                                    {selectedTool.title}
                                </h3>

                                {/* Resumen. */}
                                <p className="selected-study-tool__summary">
                                    {selectedTool.summary}
                                </p>

                                {/* Descripción completa. */}
                                <p className="selected-study-tool__description">
                                    {selectedTool.description}
                                </p>
                            </div>

                            {/* Preguntas prácticas. */}
                            <div className="selected-study-tool__questions">
                                {/* Título de las preguntas. */}
                                <h4>
                                    Preguntas que puedes realizar
                                </h4>

                                {/* Lista de preguntas. */}
                                <ul>
                                    {/* Recorremos las preguntas. */}
                                    {selectedTool.questions.map(
                                        (question) => (
                                            <li key={question}>
                                                {question}
                                            </li>
                                        )
                                    )}
                                </ul>

                                {/* Recomendación final. */}
                                <div className="selected-study-tool__recommendation">
                                    <span>
                                        Recomendación
                                    </span>

                                    <p>
                                        {selectedTool.recommendation}
                                    </p>
                                </div>
                            </div>
                        </article>
                    </div>
                </section>

                {/* Método de estudio. */}
                <section className="bible-study-method">
                    {/* Contenedor central. */}
                    <div className="bible-study-method__container">
                        {/* Encabezado del método. */}
                        <div className="bible-study-method__header">
                            {/* Texto pequeño. */}
                            <p className="bible-tools-section__eyebrow">
                                Un método sencillo
                            </p>

                            {/* Título. */}
                            <h2 className="bible-tools-section__title">
                                Observa, interpreta y aplica
                            </h2>

                            {/* Descripción. */}
                            <p className="bible-study-method__description">
                                Utiliza este orden para acercarte a un pasaje
                                con atención y responder de una manera práctica.
                            </p>
                        </div>

                        {/* Cuadrícula con los pasos. */}
                        <div className="bible-study-method__grid">
                            {/* Paso uno. */}
                            <article className="bible-study-method-card">
                                <span className="bible-study-method-card__number">
                                    01
                                </span>

                                <h3>
                                    Observa
                                </h3>

                                <p>
                                    Identifica personajes, palabras, acciones,
                                    ideas repetidas y la estructura del texto.
                                </p>
                            </article>

                            {/* Paso dos. */}
                            <article className="bible-study-method-card">
                                <span className="bible-study-method-card__number">
                                    02
                                </span>

                                <h3>
                                    Interpreta
                                </h3>

                                <p>
                                    Pregunta qué comunicaba el pasaje dentro de
                                    su contexto y cuál es su enseñanza central.
                                </p>
                            </article>

                            {/* Paso tres. */}
                            <article className="bible-study-method-card">
                                <span className="bible-study-method-card__number">
                                    03
                                </span>

                                <h3>
                                    Relaciona
                                </h3>

                                <p>
                                    Compara la enseñanza con otros pasajes y con
                                    el mensaje general de las Escrituras.
                                </p>
                            </article>

                            {/* Paso cuatro. */}
                            <article className="bible-study-method-card">
                                <span className="bible-study-method-card__number">
                                    04
                                </span>

                                <h3>
                                    Aplica
                                </h3>

                                <p>
                                    Define una respuesta concreta que refleje lo
                                    aprendido en tus decisiones y relaciones.
                                </p>
                            </article>
                        </div>
                    </div>
                </section>

                {/* Aviso sobre el uso responsable de herramientas. */}
                <section className="bible-tools-reminder">
                    {/* Contenedor central. */}
                    <div className="bible-tools-reminder__container">
                        {/* Contenido textual. */}
                        <div className="bible-tools-reminder__content">
                            {/* Texto pequeño. */}
                            <p className="bible-tools-reminder__eyebrow">
                                Una ayuda, no un reemplazo
                            </p>

                            {/* Título del aviso. */}
                            <h2 className="bible-tools-reminder__title">
                                Las herramientas deben conducirnos nuevamente
                                al texto bíblico
                            </h2>

                            {/* Descripción del aviso. */}
                            <p className="bible-tools-reminder__description">
                                Los diccionarios, concordancias, comentarios y
                                planes de lectura pueden aportar información
                                valiosa. Sin embargo, deben utilizarse como
                                apoyo y no como sustituto de una lectura atenta
                                de la Biblia.
                            </p>
                        </div>

                        {/* Frase destacada. */}
                        <blockquote className="bible-tools-reminder__quote">
                            Antes de consultar lo que otros dicen sobre un
                            pasaje, dedica tiempo a observar personalmente lo
                            que el texto comunica.
                        </blockquote>
                    </div>
                </section>

                {/* Invitación final. */}
                <section className="bible-tools-help">
                    {/* Contenedor central. */}
                    <div className="bible-tools-help__container">
                        {/* Contenido textual. */}
                        <div>
                            {/* Texto pequeño. */}
                            <p className="bible-tools-help__eyebrow">
                                Continúa aprendiendo
                            </p>

                            {/* Título. */}
                            <h2 className="bible-tools-help__title">
                                Pon estas herramientas en práctica
                            </h2>

                            {/* Descripción. */}
                            <p className="bible-tools-help__description">
                                Puedes comenzar con uno de nuestros estudios
                                bíblicos o utilizar la guía para preparar tu
                                devocional personal.
                            </p>
                        </div>

                        {/* Acciones finales. */}
                        <div className="bible-tools-help__actions">
                            {/* Enlace hacia los estudios bíblicos. */}
                            <Link
                                className="bible-tools-help__button bible-tools-help__button--primary"
                                to="/recursos/estudios"
                            >
                                Ver estudios bíblicos
                            </Link>

                            {/* Enlace hacia la guía devocional. */}
                            <Link
                                className="bible-tools-help__button bible-tools-help__button--secondary"
                                to="/recursos/devocional"
                            >
                                Ver guía devocional
                            </Link>

                            {/* Enlace para volver a Recursos. */}
                            <Link
                                className="bible-tools-help__back"
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
export default BibleStudyTools;