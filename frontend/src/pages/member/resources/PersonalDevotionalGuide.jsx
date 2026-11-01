// Importamos useState para controlar el paso seleccionado
// y los campos temporales de reflexión.
import { useState } from "react";

// Importamos Link para navegar dentro de la aplicación.
import { Link } from "react-router-dom";

// Importamos el encabezado público.
import Header from "../../../components/public/Header";

// Importamos el icono principal de Recursos.
import recursosIcon from "../../../assets/icons/recursos.png";

// Importamos la imagen principal de la guía devocional.
import devotionalImage from "../../../assets/images/resources/guia-devocional.png";

// Importamos los estilos exclusivos de esta página.
import "../../../styles/pages/member/resources/PersonalDevotionalGuide.css";

// Creamos la página pública de la Guía Devocional.
function PersonalDevotionalGuide() {
    // Guardamos el paso actualmente seleccionado.
    const [selectedStep, setSelectedStep] = useState(1);

    // Guardamos las notas temporales del usuario.
    const [devotionalNotes, setDevotionalNotes] = useState({
        passage: "",
        observation: "",
        teaching: "",
        application: "",
        prayer: "",
    });

    // Creamos los pasos principales del devocional.
    const devotionalSteps = [
        {
            // Identificador del paso.
            id: 1,

            // Número visual.
            number: "01",

            // Título del paso.
            title: "Prepara tu momento",

            // Descripción breve.
            summary:
                "Busca un espacio tranquilo y dispón tu corazón para estar con Dios.",

            // Explicación completa.
            description:
                "No necesitas un lugar perfecto ni demasiado tiempo. Lo importante es apartar unos minutos con intención, evitando distracciones y preparando todo lo que puedas necesitar.",

            // Recomendaciones prácticas.
            tips: [
                "Escoge un horario que puedas mantener con regularidad.",
                "Busca un lugar cómodo y con pocas distracciones.",
                "Ten cerca tu Biblia, un cuaderno y algo para escribir.",
                "Silencia las notificaciones del teléfono durante ese momento.",
            ],

            // Frase de ayuda.
            reminder:
                "La constancia es más importante que comenzar con sesiones demasiado largas.",
        },
        {
            id: 2,
            number: "02",
            title: "Comienza con oración",
            summary:
                "Habla con Dios con sinceridad y pídele ayuda para comprender Su Palabra.",
            description:
                "Antes de leer, reconoce que necesitas la dirección de Dios. No es necesario utilizar palabras complicadas. Puedes hablar con Él de manera sencilla, agradeciendo y pidiendo sabiduría.",
            tips: [
                "Agradece a Dios por un nuevo día.",
                "Reconoce aquello que está ocupando tu mente.",
                "Pide sabiduría para comprender el pasaje.",
                "Pídele disposición para obedecer lo aprendido.",
            ],
            reminder:
                "La oración prepara el corazón para escuchar y responder a la Palabra.",
        },
        {
            id: 3,
            number: "03",
            title: "Escoge un pasaje breve",
            summary:
                "Selecciona una porción de la Biblia que puedas leer con atención.",
            description:
                "Para comenzar, es mejor estudiar pocos versículos con calma que leer muchos capítulos sin detenerse. Puedes avanzar ordenadamente por un Evangelio, una carta o un plan de lectura.",
            tips: [
                "Comienza con uno de los Evangelios.",
                "Lee entre cinco y quince versículos.",
                "Evita escoger textos al azar todos los días.",
                "Mantén una secuencia para comprender mejor el contexto.",
            ],
            reminder:
                "Leer poco con atención puede ser más provechoso que leer mucho apresuradamente.",
        },
        {
            id: 4,
            number: "04",
            title: "Lee y observa",
            summary:
                "Lee el pasaje varias veces y presta atención a lo que realmente dice.",
            description:
                "La observación consiste en identificar palabras, personajes, acciones, ideas repetidas y conexiones dentro del texto antes de intentar aplicarlo inmediatamente.",
            tips: [
                "Lee el pasaje lentamente al menos dos veces.",
                "Identifica quién habla y a quién se dirige.",
                "Observa palabras o ideas que se repitan.",
                "Revisa qué ocurre antes y después del pasaje.",
            ],
            reminder:
                "Antes de preguntarte qué significa para ti, observa qué comunica realmente el texto.",
        },
        {
            id: 5,
            number: "05",
            title: "Comprende la enseñanza",
            summary:
                "Reflexiona sobre lo que el pasaje enseña acerca de Dios y de la vida cristiana.",
            description:
                "Después de observar, intenta resumir la enseñanza central con tus propias palabras. Considera el contexto y evita construir conclusiones únicamente a partir de una frase aislada.",
            tips: [
                "Pregunta qué revela el pasaje acerca de Dios.",
                "Identifica una verdad, promesa, mandato o advertencia.",
                "Resume la idea principal en una sola frase.",
                "Compara tu conclusión con el resto de la Biblia.",
            ],
            reminder:
                "Una buena aplicación comienza con una comprensión responsable del texto.",
        },
        {
            id: 6,
            number: "06",
            title: "Llévalo a tu vida",
            summary:
                "Piensa en una manera concreta de responder a lo aprendido.",
            description:
                "La aplicación no consiste solamente en sentir inspiración. Busca una decisión, actitud o acción específica que refleje la enseñanza del pasaje en tu vida diaria.",
            tips: [
                "Identifica una actitud que necesites cambiar.",
                "Piensa en una acción concreta para esta semana.",
                "Relaciona la enseñanza con tus decisiones actuales.",
                "Evita aplicaciones demasiado generales.",
            ],
            reminder:
                "Una aplicación sencilla y concreta puede producir cambios reales.",
        },
        {
            id: 7,
            number: "07",
            title: "Termina orando",
            summary:
                "Responde a Dios con gratitud, confesión y una decisión personal.",
            description:
                "La oración final permite convertir lo aprendido en una respuesta sincera. Agradece por la enseñanza, reconoce aquello que necesitas cambiar y pide ayuda para vivirla.",
            tips: [
                "Agradece por la verdad aprendida.",
                "Confiesa aquello que el pasaje haya mostrado.",
                "Pide fuerzas para ponerlo en práctica.",
                "Ora por alguien que también necesite esa enseñanza.",
            ],
            reminder:
                "El devocional termina cuando lo aprendido comienza a convertirse en una respuesta.",
        },
    ];

    // Buscamos la información del paso seleccionado.
    const currentStep =
        devotionalSteps.find((step) => step.id === selectedStep) ||
        devotionalSteps[0];

    // Actualizamos los campos de notas.
    const handleNotesChange = (event) => {
        // Obtenemos el nombre y el valor del campo.
        const { name, value } = event.target;

        // Actualizamos únicamente el campo correspondiente.
        setDevotionalNotes((previousNotes) => ({
            ...previousNotes,
            [name]: value,
        }));
    };

    // Limpiamos todas las notas temporales.
    const handleClearNotes = () => {
        // Pedimos confirmación antes de borrar.
        const shouldClear = window.confirm(
            "¿Deseas borrar todas las notas escritas en esta guía?"
        );

        // Detenemos la función si la persona cancela.
        if (!shouldClear) {
            return;
        }

        // Restablecemos los campos.
        setDevotionalNotes({
            passage: "",
            observation: "",
            teaching: "",
            application: "",
            prayer: "",
        });
    };

    // Avanzamos al siguiente paso.
    const handleNextStep = () => {
        // Verificamos que todavía exista un paso siguiente.
        if (selectedStep < devotionalSteps.length) {
            setSelectedStep((previousStep) => previousStep + 1);
        }
    };

    // Retrocedemos al paso anterior.
    const handlePreviousStep = () => {
        // Verificamos que no estemos en el primer paso.
        if (selectedStep > 1) {
            setSelectedStep((previousStep) => previousStep - 1);
        }
    };

    // Retornamos la estructura de la página.
    return (
        // Contenedor general.
        <div className="personal-devotional">
            {/* Mostramos el encabezado público. */}
            <Header />

            {/* Contenido principal. */}
            <main>
                {/* Hero principal. */}
                <section className="personal-devotional-hero">
                    {/* Capa decorativa. */}
                    <div className="personal-devotional-hero__overlay"></div>

                    {/* Contenedor central. */}
                    <div className="personal-devotional-hero__container">
                        {/* Contenido textual. */}
                        <div className="personal-devotional-hero__content">
                            {/* Ruta visual de navegación. */}
                            <nav
                                className="personal-devotional-breadcrumb"
                                aria-label="Ruta de navegación"
                            >
                                <Link to="/recursos">
                                    Recursos
                                </Link>

                                <span aria-hidden="true">/</span>

                                <span>Guía devocional</span>
                            </nav>

                            {/* Texto introductorio. */}
                            <p className="personal-devotional-hero__eyebrow">
                                Un momento diario con Dios
                            </p>

                            {/* Título principal. */}
                            <h1 className="personal-devotional-hero__title">
                                Guía para tu
                                <span className="personal-devotional-hero__highlight">
                                    devocional personal
                                </span>
                            </h1>

                            {/* Descripción. */}
                            <p className="personal-devotional-hero__description">
                                Aprende a preparar un tiempo sencillo de
                                lectura bíblica, reflexión y oración que puedas
                                incorporar a tu vida cotidiana.
                            </p>
                        </div>

                        {/* Imagen representativa. */}
                        <div className="personal-devotional-hero__visual">
                            <div className="personal-devotional-hero__image-wrapper">
                                <img
                                    className="personal-devotional-hero__image"
                                    src={devotionalImage}
                                    alt="Biblia abierta preparada para realizar un devocional personal"
                                />

                                <img
                                    className="personal-devotional-hero__icon"
                                    src={recursosIcon}
                                    alt=""
                                    aria-hidden="true"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Curva inferior decorativa. */}
                    <div className="personal-devotional-hero__curve"></div>
                </section>

                {/* Introducción al devocional. */}
                <section className="personal-devotional-intro">
                    <div className="personal-devotional-intro__container">
                        {/* Contenido principal. */}
                        <div className="personal-devotional-intro__content">
                            <p className="personal-devotional-section__eyebrow">
                                Antes de comenzar
                            </p>

                            <h2 className="personal-devotional-section__title">
                                ¿Qué es un devocional personal?
                            </h2>

                            <p className="personal-devotional-intro__paragraph">
                                Es un tiempo apartado intencionalmente para leer
                                la Biblia, reflexionar en lo que Dios enseña y
                                responder mediante la oración.
                            </p>

                            <p className="personal-devotional-intro__paragraph">
                                No se trata de cumplir una obligación ni de
                                alcanzar una cantidad determinada de capítulos.
                                Su propósito es conocer mejor a Dios y aprender
                                a vivir de acuerdo con Su Palabra.
                            </p>
                        </div>

                        {/* Tarjeta de recordatorio. */}
                        <aside className="personal-devotional-intro__reminder">
                            <span className="personal-devotional-intro__reminder-label">
                                Recuerda
                            </span>

                            <blockquote>
                                No necesitas hacerlo perfecto. Comienza con
                                algunos minutos, sé constante y permite que la
                                Palabra transforme poco a poco tu vida.
                            </blockquote>
                        </aside>
                    </div>
                </section>

                {/* Guía interactiva. */}
                <section
                    className="personal-devotional-guide"
                    aria-labelledby="personal-devotional-guide-title"
                >
                    <div className="personal-devotional-guide__container">
                        {/* Encabezado. */}
                        <div className="personal-devotional-guide__header">
                            <div>
                                <p className="personal-devotional-section__eyebrow">
                                    Paso a paso
                                </p>

                                <h2
                                    className="personal-devotional-section__title"
                                    id="personal-devotional-guide-title"
                                >
                                    Prepara tu tiempo devocional
                                </h2>
                            </div>

                            <p className="personal-devotional-guide__intro">
                                Selecciona cada paso para conocer su explicación
                                y algunas recomendaciones prácticas.
                            </p>
                        </div>

                        {/* Navegación de pasos. */}
                        <div
                            className="personal-devotional-steps"
                            role="tablist"
                            aria-label="Pasos para realizar el devocional"
                        >
                            {devotionalSteps.map((step) => (
                                <button
                                    className={`personal-devotional-steps__button ${
                                        selectedStep === step.id
                                            ? "personal-devotional-steps__button--active"
                                            : ""
                                    }`}
                                    key={step.id}
                                    type="button"
                                    role="tab"
                                    aria-selected={selectedStep === step.id}
                                    onClick={() =>
                                        setSelectedStep(step.id)
                                    }
                                >
                                    <span className="personal-devotional-steps__number">
                                        {step.number}
                                    </span>

                                    <span className="personal-devotional-steps__name">
                                        {step.title}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Contenido del paso seleccionado. */}
                        <article className="personal-devotional-step-content">
                            {/* Número grande. */}
                            <div
                                className="personal-devotional-step-content__number"
                                aria-hidden="true"
                            >
                                {currentStep.number}
                            </div>

                            {/* Contenido textual. */}
                            <div className="personal-devotional-step-content__main">
                                <p className="personal-devotional-step-content__eyebrow">
                                    Paso {currentStep.id} de{" "}
                                    {devotionalSteps.length}
                                </p>

                                <h3 className="personal-devotional-step-content__title">
                                    {currentStep.title}
                                </h3>

                                <p className="personal-devotional-step-content__summary">
                                    {currentStep.summary}
                                </p>

                                <p className="personal-devotional-step-content__description">
                                    {currentStep.description}
                                </p>

                                {/* Recomendaciones. */}
                                <div className="personal-devotional-step-content__tips">
                                    <h4>Recomendaciones prácticas</h4>

                                    <ul>
                                        {currentStep.tips.map((tip) => (
                                            <li key={tip}>{tip}</li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Recordatorio. */}
                                <div className="personal-devotional-step-content__reminder">
                                    <span>Para recordar</span>

                                    <p>{currentStep.reminder}</p>
                                </div>

                                {/* Navegación inferior. */}
                                <div className="personal-devotional-step-content__navigation">
                                    <button
                                        className="personal-devotional-step-content__button personal-devotional-step-content__button--secondary"
                                        type="button"
                                        onClick={handlePreviousStep}
                                        disabled={selectedStep === 1}
                                    >
                                        <span aria-hidden="true">←</span>
                                        Paso anterior
                                    </button>

                                    <button
                                        className="personal-devotional-step-content__button personal-devotional-step-content__button--primary"
                                        type="button"
                                        onClick={handleNextStep}
                                        disabled={
                                            selectedStep ===
                                            devotionalSteps.length
                                        }
                                    >
                                        Siguiente paso
                                        <span aria-hidden="true">→</span>
                                    </button>
                                </div>
                            </div>
                        </article>
                    </div>
                </section>

                {/* Método práctico de reflexión. */}
                <section className="personal-devotional-method">
                    <div className="personal-devotional-method__container">
                        {/* Encabezado del método. */}
                        <div className="personal-devotional-method__header">
                            <p className="personal-devotional-section__eyebrow">
                                Un método sencillo
                            </p>

                            <h2 className="personal-devotional-section__title">
                                Lee, observa, comprende y aplica
                            </h2>

                            <p className="personal-devotional-method__description">
                                Estas cuatro preguntas pueden ayudarte a
                                organizar lo aprendido durante tu lectura.
                            </p>
                        </div>

                        {/* Tarjetas del método. */}
                        <div className="personal-devotional-method__grid">
                            <article className="personal-devotional-method-card">
                                <span className="personal-devotional-method-card__letter">
                                    L
                                </span>

                                <h3>Lee</h3>

                                <p>
                                    ¿Qué dice el pasaje? Léelo con calma y más
                                    de una vez.
                                </p>
                            </article>

                            <article className="personal-devotional-method-card">
                                <span className="personal-devotional-method-card__letter">
                                    O
                                </span>

                                <h3>Observa</h3>

                                <p>
                                    ¿Qué palabras, ideas, personas o acciones
                                    aparecen?
                                </p>
                            </article>

                            <article className="personal-devotional-method-card">
                                <span className="personal-devotional-method-card__letter">
                                    C
                                </span>

                                <h3>Comprende</h3>

                                <p>
                                    ¿Qué enseña acerca de Dios y de la vida
                                    cristiana?
                                </p>
                            </article>

                            <article className="personal-devotional-method-card">
                                <span className="personal-devotional-method-card__letter">
                                    A
                                </span>

                                <h3>Aplica</h3>

                                <p>
                                    ¿Qué decisión o cambio concreto puedes
                                    realizar?
                                </p>
                            </article>
                        </div>
                    </div>
                </section>

                {/* Cuaderno temporal del devocional. */}
                <section
                    className="personal-devotional-journal"
                    aria-labelledby="personal-devotional-journal-title"
                >
                    <div className="personal-devotional-journal__container">
                        {/* Encabezado. */}
                        <div className="personal-devotional-journal__header">
                            <div>
                                <p className="personal-devotional-section__eyebrow">
                                    Ponlo en práctica
                                </p>

                                <h2
                                    className="personal-devotional-section__title"
                                    id="personal-devotional-journal-title"
                                >
                                    Escribe tu reflexión
                                </h2>
                            </div>

                            <p className="personal-devotional-journal__intro">
                                Puedes utilizar este espacio mientras realizas
                                tu devocional. Estas notas todavía no se guardan
                                al cerrar o recargar la página.
                            </p>
                        </div>

                        {/* Formulario de reflexión. */}
                        <div className="personal-devotional-journal__form">
                            {/* Pasaje. */}
                            <div className="personal-devotional-journal__field">
                                <label htmlFor="devotional-passage">
                                    Pasaje leído
                                </label>

                                <input
                                    id="devotional-passage"
                                    name="passage"
                                    type="text"
                                    value={devotionalNotes.passage}
                                    onChange={handleNotesChange}
                                    placeholder="Ejemplo: Juan 15:1-8"
                                    maxLength="100"
                                />
                            </div>

                            {/* Observación. */}
                            <div className="personal-devotional-journal__field">
                                <label htmlFor="devotional-observation">
                                    ¿Qué observaste?
                                </label>

                                <textarea
                                    id="devotional-observation"
                                    name="observation"
                                    value={devotionalNotes.observation}
                                    onChange={handleNotesChange}
                                    placeholder="Anota palabras, ideas, personajes o acciones importantes."
                                    rows="5"
                                    maxLength="1000"
                                ></textarea>
                            </div>

                            {/* Enseñanza. */}
                            <div className="personal-devotional-journal__field">
                                <label htmlFor="devotional-teaching">
                                    ¿Qué enseñanza encontraste?
                                </label>

                                <textarea
                                    id="devotional-teaching"
                                    name="teaching"
                                    value={devotionalNotes.teaching}
                                    onChange={handleNotesChange}
                                    placeholder="Resume con tus palabras la enseñanza principal."
                                    rows="5"
                                    maxLength="1000"
                                ></textarea>
                            </div>

                            {/* Aplicación. */}
                            <div className="personal-devotional-journal__field">
                                <label htmlFor="devotional-application">
                                    ¿Cómo puedes aplicarlo?
                                </label>

                                <textarea
                                    id="devotional-application"
                                    name="application"
                                    value={devotionalNotes.application}
                                    onChange={handleNotesChange}
                                    placeholder="Escribe una acción, decisión o cambio concreto."
                                    rows="5"
                                    maxLength="1000"
                                ></textarea>
                            </div>

                            {/* Oración. */}
                            <div className="personal-devotional-journal__field personal-devotional-journal__field--full">
                                <label htmlFor="devotional-prayer">
                                    Mi oración
                                </label>

                                <textarea
                                    id="devotional-prayer"
                                    name="prayer"
                                    value={devotionalNotes.prayer}
                                    onChange={handleNotesChange}
                                    placeholder="Escribe una oración como respuesta a lo aprendido."
                                    rows="6"
                                    maxLength="1500"
                                ></textarea>
                            </div>

                            {/* Acción para limpiar. */}
                            <div className="personal-devotional-journal__actions">
                                <button
                                    className="personal-devotional-journal__clear"
                                    type="button"
                                    onClick={handleClearNotes}
                                >
                                    Limpiar notas
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Modelo de oración. */}
                <section className="personal-devotional-prayer">
                    <div className="personal-devotional-prayer__container">
                        {/* Contenido principal. */}
                        <div className="personal-devotional-prayer__content">
                            <p className="personal-devotional-prayer__eyebrow">
                                Una oración para comenzar
                            </p>

                            <h2 className="personal-devotional-prayer__title">
                                Puedes hablar con Dios con palabras sencillas
                            </h2>

                            <blockquote className="personal-devotional-prayer__quote">
                                Señor, gracias por permitirme acercarme a Tu
                                Palabra. Ayúdame a comprender lo que deseas
                                enseñarme, a reconocer aquello que debo cambiar
                                y a vivir de acuerdo con Tu voluntad. Guía mis
                                pensamientos y transforma mi corazón. Amén.
                            </blockquote>
                        </div>

                        {/* Consejos de constancia. */}
                        <aside className="personal-devotional-prayer__habits">
                            <h3>Para crear constancia</h3>

                            <ul>
                                <li>
                                    Comienza con diez o quince minutos.
                                </li>

                                <li>
                                    Mantén un horario realista.
                                </li>

                                <li>
                                    Avanza ordenadamente por un libro bíblico.
                                </li>

                                <li>
                                    No abandones por haber perdido un día.
                                </li>

                                <li>
                                    Comparte lo aprendido con otra persona.
                                </li>
                            </ul>
                        </aside>
                    </div>
                </section>

                {/* Invitación final. */}
                <section className="personal-devotional-help">
                    <div className="personal-devotional-help__container">
                        {/* Contenido textual. */}
                        <div>
                            <p className="personal-devotional-help__eyebrow">
                                Sigue creciendo
                            </p>

                            <h2 className="personal-devotional-help__title">
                                Continúa aprendiendo de la Palabra
                            </h2>

                            <p className="personal-devotional-help__description">
                                Puedes complementar tu devocional con nuestros
                                estudios bíblicos o escribirnos si necesitas
                                orientación.
                            </p>
                        </div>

                        {/* Botones finales. */}
                        <div className="personal-devotional-help__actions">
                            <Link
                                className="personal-devotional-help__button personal-devotional-help__button--primary"
                                to="/recursos/estudios"
                            >
                                Ver estudios bíblicos
                            </Link>

                            <Link
                                className="personal-devotional-help__button personal-devotional-help__button--secondary"
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
export default PersonalDevotionalGuide;