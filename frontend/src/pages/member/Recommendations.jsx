// =========================================================
// RECOMENDADOS PARA MIEMBROS - IGLESIA EL ANCLA
// Fuente de datos: publicaciones reales del backend.
// =========================================================

// Link permite navegar a Contacto sin recargar la PWA.
import { Link } from "react-router-dom";

// useEffect consulta la API; useMemo calcula filtros; useState guarda estados.
import { useEffect, useMemo, useState } from "react";

// Reutilizamos el servicio existente y su instancia global de Axios.
import { listPublishedRecommendations } from "../../services/recommendationsApi";

// Icono propio de la página: también sirve si falta una portada externa.
import recomendadosIcon from "../../assets/icons/recomendados.png";

// Conservamos exactamente los estilos existentes de la página de miembros.
import "../../styles/pages/member/Recommendations.css";

// =========================================================
// CATEGORÍAS COMPATIBLES CON EL MODELO DE MONGODB
// =========================================================

// Los identificadores corresponden a Recommendation.js del backend.
const CATEGORY_LABELS = Object.freeze({
    books: "Libros",
    music: "Música",
    movies: "Películas",
    series: "Series",
    documentaries: "Documentales",
    podcasts: "Pódcast",
});

// "Niños y jóvenes" es una AUDIENCIA, no una categoría de MongoDB.
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

// Traduce un identificador técnico al nombre visible para los miembros.
function getCategoryLabel(categoryId) {
    return CATEGORY_LABELS[categoryId] || "Sin categoría";
}

// Solo aceptamos enlaces HTTPS antes de abrir sitios de terceros.
function getSafeExternalUrl(value) {
    if (typeof value !== "string") return "";

    try {
        const url = new URL(value);
        return url.protocol === "https:" && !url.username && !url.password
            ? url.href
            : "";
    } catch {
        return "";
    }
}

// Si la portada externa deja de funcionar, mostramos el icono del proyecto.
function handleCoverError(event) {
    const image = event.currentTarget;
    if (image.dataset.fallbackApplied === "true") return;
    image.dataset.fallbackApplied = "true";
    image.src = recomendadosIcon;
}

// =========================================================
// PÁGINA PRINCIPAL - CONTENIDO REAL PARA MIEMBROS
// =========================================================

function Recommendations() {
    // Categoría activa en los botones del catálogo.
    const [selectedCategory, setSelectedCategory] = useState("Todos");

    // Recomendaciones efectivamente publicadas por los administradores.
    const [recommendations, setRecommendations] = useState([]);

    // Estados separados para mostrar carga y fallos de red correctamente.
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    // Cambiar esta clave permite reintentar la consulta después de un fallo.
    const [reloadKey, setReloadKey] = useState(0);

    // =====================================================
    // CONSULTAR LAS RECOMENDACIONES PUBLICADAS
    // =====================================================

    useEffect(() => {
        // Evitamos modificar el estado si el componente se desmontó.
        let isMounted = true;

        async function loadRecommendations() {
            // Mostramos la carga y limpiamos el error anterior.
            setIsLoading(true);
            setLoadError("");

            try {
                // El servicio consulta GET /api/recommendations.
                const result = await listPublishedRecommendations();

                // Comprobamos que la API entregue una lista válida.
                if (!Array.isArray(result)) {
                    throw new Error("La API devolvió un formato inesperado.");
                }

                // Defensa adicional: nunca mostramos borradores.
                // El backend también aplica este filtro obligatoriamente.
                const published = result
                    .filter((item) => item && item.status === "published")
                    .map((item) => ({
                        ...item,
                        // Los enlaces publicados deben ser HTTPS.
                        link: getSafeExternalUrl(item.link),
                        // Las portadas externas se usan por referencia.
                        image: getSafeExternalUrl(item.image),
                    }));

                // Actualizamos la interfaz solo si sigue montada.
                if (isMounted) setRecommendations(published);
            } catch (error) {
                if (isMounted) {
                    // Un fallo de API no debe confundirse con catálogo vacío.
                    setRecommendations([]);
                    setLoadError(
                        error?.response?.data?.message ||
                        "No fue posible cargar los recomendados. Inténtalo nuevamente."
                    );
                }
            } finally {
                // Ocultamos el mensaje de carga al terminar la consulta.
                if (isMounted) setIsLoading(false);
            }
        }

        // Iniciamos la consulta al abrir la página o al reintentar.
        loadRecommendations();

        // Ignoramos respuestas que lleguen después de salir de la página.
        return () => {
            isMounted = false;
        };
    }, [reloadKey]);

    // =====================================================
    // FILTRAR POR CATEGORÍA O PÚBLICO OBJETIVO
    // =====================================================

    const filteredRecommendations = useMemo(() => {
        if (selectedCategory === "Todos") return recommendations;

        return recommendations.filter((recommendation) => {
            // Niños y jóvenes se almacena como audiencia: ["kids_youth"].
            if (selectedCategory === "Niños y jóvenes") {
                return Array.isArray(recommendation.audience) &&
                    recommendation.audience.includes("kids_youth");
            }

            // Las otras opciones corresponden a categorías del modelo.
            return getCategoryLabel(recommendation.category) === selectedCategory;
        });
    }, [recommendations, selectedCategory]);

    // Los destacados son publicaciones marcadas por un administrador.
    const featuredRecommendations = useMemo(
        () => recommendations.filter((item) => item.featured === true),
        [recommendations]
    );

    // El botón Reintentar vuelve a consultar MongoDB mediante la API.
    const retryLoading = () => setReloadKey((previous) => previous + 1);

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

                {/* Mostramos esta sección solo si existen destacados publicados. */}
                {!isLoading && !loadError && featuredRecommendations.length > 0 && (
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
                                            src={recommendation.image || recomendadosIcon}
                                            alt={`Portada de ${recommendation.title}`}
                                            onError={handleCoverError}
                                        />

                                        <span className="recommendation-featured-card__category">
                                            {getCategoryLabel(recommendation.category)}
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

                                        {recommendation.link ? (
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
                                        ) : (
                                            <span className="recommendation-featured-card__button" aria-disabled="true">
                                                Enlace no disponible
                                            </span>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
                )}

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
                            {isLoading
                                ? "Cargando recomendaciones..."
                                : loadError
                                    ? "No se pudieron cargar las recomendaciones"
                                    : `Mostrando ${filteredRecommendations.length} ${
                                        filteredRecommendations.length === 1
                                            ? "recomendación"
                                            : "recomendaciones"
                                    }`}
                        </p>

                        {/* Distinguimos carga, error, resultados y catálogo vacío. */}
                        {isLoading ? (
                            <div className="recommendations-empty" role="status">
                                <h3 className="recommendations-empty__title">
                                    Cargando recomendaciones...
                                </h3>
                                <p className="recommendations-empty__description">
                                    Estamos consultando el contenido publicado.
                                </p>
                            </div>
                        ) : loadError ? (
                            <div className="recommendations-empty" role="alert">
                                <h3 className="recommendations-empty__title">
                                    No pudimos cargar las recomendaciones
                                </h3>
                                <p className="recommendations-empty__description">
                                    {loadError}
                                </p>
                                <button
                                    className="recommendations-empty__button"
                                    type="button"
                                    onClick={retryLoading}
                                >
                                    Volver a intentar
                                </button>
                            </div>
                        ) : filteredRecommendations.length > 0 ? (
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
                                                    src={recommendation.image || recomendadosIcon}
                                                    alt={`Portada de ${recommendation.title}`}
                                                    loading="lazy"
                                                    onError={handleCoverError}
                                                />

                                                <span className="recommendation-card__category">
                                                    {getCategoryLabel(recommendation.category)}
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

                                                {recommendation.link ? (
                                                <a
                                                    className="recommendation-card__link"
                                                    href={recommendation.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    aria-label={`Ver más información sobre ${recommendation.title}`}
                                                >
                                                    Ver más
                                                    <span aria-hidden="true">
                                                        →
                                                    </span>
                                                </a>
                                                ) : (
                                                    <span className="recommendation-card__link" aria-disabled="true">
                                                        Enlace no disponible
                                                    </span>
                                                )}
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
                                    {recommendations.length === 0
                                        ? "Todavía no hay recomendaciones publicadas."
                                        : "Todavía no hay contenidos publicados en esta categoría."}
                                </p>

                                {selectedCategory !== "Todos" && (
                                    <button
                                        className="recommendations-empty__button"
                                        type="button"
                                        onClick={() => setSelectedCategory("Todos")}
                                    >
                                        Ver todas las recomendaciones
                                    </button>
                                )}
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