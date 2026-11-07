// Importamos useState para controlar los filtros.
import { useEffect, useState } from "react";
import { getPublishedResourceContent } from "../../services/resourcesContentApi";

// Importamos Link para navegar dentro de la aplicación.
import { Link } from "react-router-dom";


// Importamos el icono principal de Recursos.
import recursosIcon from "../../assets/icons/recursos.png";

// Importamos imágenes temporales para cada recurso.
import estudiosImage from "../../assets/images/resources/estudios-biblicos.png";
import descargablesImage from "../../assets/images/resources/material-descargable.png";
import onlineImage from "../../assets/images/resources/guia-devocional.png";
import oracionImage from "../../assets/images/resources/guia-oracion.png";
import discipuladoImage from "../../assets/images/resources/discipulado.png";
import preguntasImage from "../../assets/images/resources/preguntas-frecuentes.png";
import bibliaImage from "../../assets/images/resources/biblia-estudio.png";
// Reutilizamos la fotografía existente de estudios para el cancionero.
import cancioneroImage from "../../assets/images/resources/estudios-biblicos.png";

// Importamos los estilos exclusivos de la página.
import "../../styles/pages/member/Resources.css";

// Creamos la página de Recursos para usuarios autenticados: member, admin y super_admin.
// Rutas estables: Biblioteca y Cancionero conservan sus propios módulos.
const SECTION_BY_ROUTE = {
        "/member/recursos/estudios": "studies",
        "/member/recursos/devocional": "devotionals",
        "/member/recursos/biblia": "bible",
        "/member/recursos/discipulado": "discipleship",
        "/member/recursos/guias-oracion": "prayer_guides",
        "/member/recursos/material-descargable": "downloads",
        "/member/recursos/preguntas-frecuentes": "faq",
};

function Resources() {
    // Creamos las categorías disponibles para filtrar.
    const categories = [
        "Todos",
        "Estudios bíblicos",
        "Descargables",
        "Biblioteca Solidaria",
        "Cancionero",
        "Devocional",
        "Oración",
        "Discipulado",
        "Ayuda",
        "Biblia",
    ];

    // Guardamos la categoría seleccionada.
    const [selectedCategory, setSelectedCategory] = useState("Todos");

    // Conservamos las tarjetas originales, incluido el acceso a Biblioteca y Cancionero.
    const originalResources = [
        {
            // Identificador temporal.
            id: 1,

            // Categoría del recurso.
            category: "Estudios bíblicos",

            // Título del recurso.
            title: "Estudios bíblicos",

            // Descripción general.
            description:
                "Materiales preparados para ayudarte a comprender mejor la Biblia y profundizar en sus enseñanzas.",

            // Texto adicional.
            detail:
                "Aquí encontrarás estudios organizados por temas, libros bíblicos y enseñanzas compartidas por la iglesia.",

            // Tipo de recurso.
            type: "Material de estudio",

            // Imagen asociada.
            image: estudiosImage,

            // Texto del botón.
            buttonText: "Ver estudios",

            // Ruta protegida compartida por member, admin y super_admin.
            link: "/member/recursos/estudios",

            // Indicamos que corresponde a una ruta interna.
            linkType: "internal",

            // Recurso destacado.
            featured: true,
        },
        {
            id: 2,
            category: "Descargables",
            title: "Material descargable",
            description:
                "Documentos, guías y recursos que podrás guardar para estudiar o utilizar cuando los necesites.",
            detail:
                "Muy pronto podrás descargar archivos PDF, guías de trabajo y materiales complementarios.",
            type: "Documentos y guías",
            image: descargablesImage,
            buttonText: "Ver materiales",
            link: "/member/recursos/material-descargable",
            linkType: "internal",
            featured: false,
        },
        {
            // Identificador temporal.
            id: 3,

            // Categoría del recurso.
            category: "Devocional",

            // Título del recurso.
            title: "Guía para tu devocional personal",

            // Descripción general.
            description:
                "Una guía sencilla para ayudarte a dedicar un tiempo diario a la lectura de la Biblia, la reflexión y la oración.",

            // Texto adicional.
            detail:
                "Incluye pasos prácticos para preparar tu momento devocional, escoger un pasaje, reflexionar en su enseñanza y aplicarlo a tu vida.",

            // Tipo de recurso.
            type: "Guía práctica",

            // Imagen asociada.
            image: onlineImage,

            // Texto del botón.
            buttonText: "Ver guía",

            // Ruta protegida compartida por member, admin y super_admin.
            link: "/member/recursos/devocional",

            // Indicamos que corresponde a una ruta interna.
            linkType: "internal",

            // Recurso destacado.
            featured: true,
        },
        {
            id: 4,
            category: "Oración",
            title: "Guías de oración",
            description:
                "Orientaciones prácticas para ayudarte a desarrollar una vida de oración constante y cercana a Dios.",
            detail:
                "Incluye temas de oración, reflexiones bíblicas y sugerencias para momentos personales o familiares.",
            type: "Guía espiritual",
            image: oracionImage,
            buttonText: "Ver guías",
            link: "/member/recursos/guias-oracion",
            linkType: "internal",
            featured: false,
        },
        {
            id: 5,
            category: "Discipulado",
            title: "Material de discipulado",
            description:
                "Contenidos destinados a acompañar el crecimiento espiritual y fortalecer los fundamentos de la fe.",
            detail:
                "Material organizado para personas que desean conocer más de Cristo y avanzar en su caminar cristiano.",
            type: "Formación cristiana",
            image: discipuladoImage,
            buttonText: "Conocer material",
            link: "/member/recursos/discipulado",
            linkType: "internal",
            featured: false,
        },
        {
            id: 6,
            category: "Ayuda",
            title: "Preguntas frecuentes",
            description:
                "Respuestas sencillas a preguntas comunes sobre la iglesia, sus reuniones y la participación en la comunidad.",
            detail:
                "Encuentra información sobre horarios, ubicación, reuniones online, talleres y primeras visitas.",
            type: "Información general",
            image: preguntasImage,
            buttonText: "Ver preguntas",
            link: "/member/recursos/preguntas-frecuentes",
            linkType: "internal",
            featured: false,
        },
        {
            id: 7,
            category: "Biblia",
            title: "Biblia y herramientas de estudio",
            description:
                "Accede a recursos para leer, buscar y comprender mejor la Palabra de Dios.",
            detail:
                "Esta sección reunirá la Biblia, buscadores, planes de lectura y herramientas útiles para el estudio bíblico.",
            type: "Herramienta bíblica",
            image: bibliaImage,
            buttonText: "Explorar herramientas",
            link: "/member/recursos/biblia",
            linkType: "internal",
            featured: true,
        },
        {
            // Identificador de la Biblioteca Solidaria.
            id: 8,

            // Categoría utilizada en los filtros.
            category: "Biblioteca Solidaria",

            // Nombre de la sección.
            title: "Biblioteca Solidaria",

            // Descripción visible en la tarjeta.
            description:
                "Explora nuestra colección de libros cristianos disponibles para acompañarte en tu crecimiento espiritual.",

            // Información adicional del recurso.
            detail:
                "Encuentra libros organizados por autor y temática, con acceso gratuito a su descarga en formato PDF.",

            // Tipo de contenido.
            type: "Biblioteca digital",

            // Imagen provisional reutilizada.
            image: descargablesImage,

            // Texto del botón de acceso.
            buttonText: "Explorar biblioteca",

            // Ruta privada compartida por los tres roles autorizados.
            link: "/member/recursos/biblioteca-solidaria",

            // Navegación interna mediante React Router.
            linkType: "internal",

            // Se mostrará en el catálogo general.
            featured: false,
        },
        {
            // Acceso al repertorio de alabanzas de la iglesia.
            id: 9,
            category: "Cancionero",
            title: "Cancionero de alabanzas",
            description: "Encuentra las letras de las canciones que compartimos como comunidad.",
            detail: "Busca por título o autor y consulta o descarga su letra en PDF.",
            type: "Repertorio musical",
            image: cancioneroImage,
            buttonText: "Explorar canciones",
            link: "/member/recursos/cancionero",
            linkType: "internal",
            featured: false,
        },
    ];

    // Cada tarjeta mantiene su ruta actual; únicamente se actualizan sus textos.


    const [publishedHeadings, setPublishedHeadings] = useState({});
    useEffect(() => {
        let active = true;
        // La biblioteca y el cancionero ya utilizan sus propias consultas.
        Promise.all(Object.values(SECTION_BY_ROUTE).map((section) =>
            getPublishedResourceContent(section)
                .then((result) => [section, result.page])
                .catch(() => [section, null])
        )).then((rows) => {
            if (active) setPublishedHeadings(Object.fromEntries(rows));
        });
        return () => { active = false; };
    // El mapa está definido fuera del componente y no cambia entre renders.
    }, []);

    const resources = originalResources.map((resource) => {
        const section = SECTION_BY_ROUTE[resource.link];
        const heading = section ? publishedHeadings[section] : null;
        return heading ? {
            ...resource,
            title: [heading.title, heading.highlight].filter(Boolean).join(" "),
            description: heading.description || resource.description,
        } : resource;
    });

    // Filtramos los recursos según la categoría seleccionada.
    const filteredResources =
        selectedCategory === "Todos"
            ? resources
            : resources.filter(
                (resource) => resource.category === selectedCategory
            );

    // Obtenemos los recursos destacados.
    const featuredResources = resources.filter(
        (resource) => resource.featured
    );

    // Creamos una función para mostrar enlaces internos o externos.
    const renderResourceLink = (
        resource,
        className,
        text = resource.buttonText
    ) => {
        // Verificamos si el enlace es externo.
        if (resource.linkType === "external") {
            return (
                <a
                    className={className}
                    href={resource.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${text}: ${resource.title}`}
                >
                    {text}
                    <span aria-hidden="true">→</span>
                </a>
            );
        }

        // Retornamos un enlace interno de React Router.
        return (
            <Link
                className={className}
                to={resource.link}
                aria-label={`${text}: ${resource.title}`}
            >
                {text}
                <span aria-hidden="true">→</span>
            </Link>
        );
    };

    // Retornamos la estructura visual.
    return (
        // Contenedor general de Recursos.
        <div className="resources">

            {/* Contenido principal de la página. */}
            <main>
                {/* Hero principal. */}
                <section className="resources-hero">
                    {/* Capa decorativa. */}
                    <div className="resources-hero__overlay"></div>

                    {/* Contenedor central. */}
                    <div className="resources-hero__container">
                        {/* Contenido textual. */}
                        <div className="resources-hero__content">
                            {/* Texto pequeño introductorio. */}
                            <p className="resources-hero__eyebrow">
                                Herramientas para tu crecimiento
                            </p>

                            {/* Título principal. */}
                            <h1 className="resources-hero__title">
                                Recursos para
                                <span className="resources-hero__highlight">
                                    aprender y crecer
                                </span>
                            </h1>

                            {/* Descripción del Hero. */}
                            <p className="resources-hero__description">
                                Encuentra estudios bíblicos, materiales,
                                herramientas y enlaces que pueden ayudarte a
                                fortalecer tu fe y participar en nuestra
                                comunidad.
                            </p>
                        </div>

                        {/* Icono decorativo principal. */}
                        <div
                            className="resources-hero__visual"
                            aria-hidden="true"
                        >
                            <div className="resources-hero__icon-circle">
                                <img
                                    className="resources-hero__icon"
                                    src={recursosIcon}
                                    alt=""
                                />
                            </div>
                        </div>
                    </div>

                    {/* Curva inferior decorativa. */}
                    <div className="resources-hero__curve"></div>
                </section>

                {/* Sección de recursos destacados. */}
                <section
                    className="resources-featured"
                    aria-labelledby="resources-featured-title"
                >
                    {/* Contenedor central. */}
                    <div className="resources-featured__container">
                        {/* Encabezado de sección. */}
                        <div className="resources-section__header">
                            {/* Texto pequeño. */}
                            <p className="resources-section__eyebrow">
                                Accesos principales
                            </p>

                            {/* Título de sección. */}
                            <h2
                                className="resources-section__title"
                                id="resources-featured-title"
                            >
                                Recursos destacados
                            </h2>

                            {/* Descripción. */}
                            <p className="resources-section__description">
                                Accede rápidamente a algunas de las
                                herramientas más importantes de nuestra
                                comunidad.
                            </p>
                        </div>

                        {/* Cuadrícula de destacados. */}
                        <div className="resources-featured__grid">
                            {/* Recorremos los recursos destacados. */}
                            {featuredResources.map((resource) => (
                                <article
                                    className="resource-featured-card"
                                    key={resource.id}
                                >
                                    {/* Contenedor de la imagen. */}
                                    <div className="resource-featured-card__image-wrapper">
                                        <img
                                            className="resource-featured-card__image"
                                            src={resource.image}
                                            alt={`Imagen representativa de ${resource.title}`}
                                        />

                                        {/* Categoría sobre la imagen. */}
                                        <span className="resource-featured-card__category">
                                            {resource.category}
                                        </span>
                                    </div>

                                    {/* Contenido textual. */}
                                    <div className="resource-featured-card__content">
                                        {/* Tipo de recurso. */}
                                        <p className="resource-featured-card__type">
                                            {resource.type}
                                        </p>

                                        {/* Título. */}
                                        <h3 className="resource-featured-card__title">
                                            {resource.title}
                                        </h3>

                                        {/* Descripción. */}
                                        <p className="resource-featured-card__description">
                                            {resource.description}
                                        </p>

                                        {/* Detalle adicional. */}
                                        <p className="resource-featured-card__detail">
                                            {resource.detail}
                                        </p>

                                        {/* Botón del recurso. */}
                                        {renderResourceLink(
                                            resource,
                                            "resource-featured-card__button"
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Catálogo completo de recursos. */}
                <section
                    className="resources-catalog"
                    aria-labelledby="resources-catalog-title"
                >
                    {/* Contenedor principal. */}
                    <div className="resources-catalog__container">
                        {/* Encabezado del catálogo. */}
                        <div className="resources-catalog__header">
                            {/* Contenedor del título. */}
                            <div>
                                <p className="resources-section__eyebrow">
                                    Explora nuestros materiales
                                </p>

                                <h2
                                    className="resources-section__title"
                                    id="resources-catalog-title"
                                >
                                    Todos los recursos
                                </h2>
                            </div>

                            {/* Texto introductorio. */}
                            <p className="resources-catalog__intro">
                                Selecciona una categoría para encontrar el
                                material que necesitas.
                            </p>
                        </div>

                        {/* Filtros de categorías. */}
                        <div
                            className="resources-filters"
                            role="group"
                            aria-label="Filtrar recursos por categoría"
                        >
                            {/* Recorremos las categorías. */}
                            {categories.map((category) => (
                                <button
                                    className={`resources-filters__button ${selectedCategory === category
                                        ? "resources-filters__button--active"
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

                        {/* Número de resultados. */}
                        <p
                            className="resources-catalog__results"
                            aria-live="polite"
                        >
                            Mostrando {filteredResources.length}{" "}
                            {filteredResources.length === 1
                                ? "recurso"
                                : "recursos"}
                        </p>

                        {/* Cuadrícula principal. */}
                        <div className="resources-grid">
                            {/* Recorremos los recursos filtrados. */}
                            {filteredResources.map((resource) => (
                                <article
                                    className="resource-card"
                                    key={resource.id}
                                >
                                    {/* Imagen del recurso. */}
                                    <div className="resource-card__image-wrapper">
                                        <img
                                            className="resource-card__image"
                                            src={resource.image}
                                            alt={`Imagen representativa de ${resource.title}`}
                                        />

                                        {/* Categoría. */}
                                        <span className="resource-card__category">
                                            {resource.category}
                                        </span>
                                    </div>

                                    {/* Contenido de la tarjeta. */}
                                    <div className="resource-card__content">
                                        {/* Tipo. */}
                                        <p className="resource-card__type">
                                            {resource.type}
                                        </p>

                                        {/* Título. */}
                                        <h3 className="resource-card__title">
                                            {resource.title}
                                        </h3>

                                        {/* Descripción. */}
                                        <p className="resource-card__description">
                                            {resource.description}
                                        </p>

                                        {/* Detalle. */}
                                        <div className="resource-card__detail">
                                            <span className="resource-card__detail-label">
                                                ¿Qué encontrarás?
                                            </span>

                                            <p>{resource.detail}</p>
                                        </div>

                                        {/* Botón. */}
                                        {renderResourceLink(
                                            resource,
                                            "resource-card__link"
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Sección informativa final. */}
                <section className="resources-help">
                    {/* Contenedor central. */}
                    <div className="resources-help__container">
                        {/* Contenido textual. */}
                        <div className="resources-help__content">
                            {/* Texto pequeño. */}
                            <p className="resources-help__eyebrow">
                                Estamos para ayudarte
                            </p>

                            {/* Título. */}
                            <h2 className="resources-help__title">
                                ¿No encuentras el recurso que necesitas?
                            </h2>

                            {/* Descripción. */}
                            <p className="resources-help__description">
                                Escríbenos y cuéntanos qué material o
                                información estás buscando. Con gusto te
                                orientaremos.
                            </p>
                        </div>

                        {/* Botón hacia Contacto. */}
                        <Link
                            className="resources-help__button"
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
export default Resources;
