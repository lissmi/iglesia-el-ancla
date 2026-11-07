import { useEffect, useState } from "react";
import { downloadPrayerGuidePdf, getPublishedPrayerGuideContent, useResourceCatalog } from "../../../services/resourcesContentApi";
import { RESOURCE_CONTENT_DEFAULTS } from "../../../data/resources/resourceCatalogDefaults";
import { Link, useParams } from "react-router-dom";

import Header from "../../../components/public/Header";

import defaultPrayerGuides from "../../../data/resources/prayerGuides";

import "../../../styles/pages/member/resources/PrayerGuideDetails.css";

function PrayerGuideDetails() {
    const { items: prayerGuides, loading } = useResourceCatalog("prayer_guides", defaultPrayerGuides, RESOURCE_CONTENT_DEFAULTS.prayer_guides.heading);

    // Obtenemos el slug desde una URL como:
    // /member/recursos/guias-oracion/comenzar-el-dia
    const { slug } = useParams();

    // Buscamos la guía que corresponde al slug recibido.
    const listedGuide = prayerGuides.find(
        (currentGuide) => currentGuide.slug === slug
    );

    // El identificador y el indicador son valores estables para el efecto.
    const guideId = listedGuide?.id;
    const needsDrive = Boolean(listedGuide?.driveStored);
    const [fullContent, setFullContent] = useState(null);
    const [contentLoading, setContentLoading] = useState(false);
    const [contentError, setContentError] = useState("");
    const [pdfDownloading, setPdfDownloading] = useState(false);
    const [pdfError, setPdfError] = useState("");

    // Las versiones guardadas recuperan el TXT publicado al abrir la ficha.
    useEffect(() => {
        let active = true;
        setFullContent(null);
        setContentError("");
        if (!needsDrive || !guideId) {
            setContentLoading(false);
            return undefined;
        }
        setContentLoading(true);
        getPublishedPrayerGuideContent(guideId)
            .then((content) => { if (active) setFullContent(content); })
            .catch(() => {
                if (active) setContentError("No pudimos abrir esta guía. Intenta nuevamente más tarde.");
            })
            .finally(() => { if (active) setContentLoading(false); });
        return () => { active = false; };
    }, [guideId, needsDrive]);

    // El contenido original permanece en React hasta que exista una publicación.
    const guide = needsDrive
        ? (fullContent ? { ...listedGuide, ...fullContent } : null)
        : listedGuide;

    async function handlePdfDownload() {
        if (!guide || pdfDownloading) return;
        setPdfError("");
        setPdfDownloading(true);
        try { await downloadPrayerGuidePdf(guide); }
        catch (error) { setPdfError(error.message || "No pudimos descargar la guía. Intenta nuevamente."); }
        finally { setPdfDownloading(false); }
    }

    // Buscamos la posición actual para permitir
    // navegar hacia la guía anterior o siguiente.
    const currentGuideIndex = prayerGuides.findIndex(
        (currentGuide) => currentGuide.slug === slug
    );

    const previousGuide =
        currentGuideIndex > 0
            ? prayerGuides[currentGuideIndex - 1]
            : null;

    const nextGuide =
        currentGuideIndex < prayerGuides.length - 1
            ? prayerGuides[currentGuideIndex + 1]
            : null;

    // Si no encontramos la guía, mostramos un mensaje de error.
    if (loading || contentLoading || (needsDrive && !fullContent && !contentError)) {
        return <><Header /><main style={{ padding: "3rem", textAlign: "center" }}>Cargando guía...</main></>;
    }
    if (contentError) {
        return <><Header /><main style={{ padding: "3rem", textAlign: "center" }} role="alert">{contentError}</main></>;
    }
    if (!guide) {
        return (
            <>
                <Header />

                <main className="prayer-guide-not-found">
                    <section className="prayer-guide-not-found__container">
                        <p className="prayer-guide-not-found__eyebrow">
                            Guía no encontrada
                        </p>

                        <h1>
                            No pudimos encontrar esta guía
                        </h1>

                        <p>
                            Es posible que el enlace sea incorrecto o que la
                            guía todavía no esté disponible.
                        </p>

                        <Link to="/member/recursos/guias-oracion">
                            Volver a Guías de oración
                        </Link>
                    </section>
                </main>
            </>
        );
    }

    return (
        <>
            <Header />

            <main className="prayer-guide-details-page">
                {/* Hero principal de la guía. */}
                <section className="prayer-guide-details-hero">
                    <div className="prayer-guide-details-hero__overlay" />

                    <div className="prayer-guide-details-hero__container">
                        <nav
                            className="prayer-guide-details-breadcrumb"
                            aria-label="Ruta de navegación"
                        >
                            <Link to="/">
                                Inicio
                            </Link>

                            <span aria-hidden="true">
                                /
                            </span>

                            <Link to="/member/recursos">
                                Recursos
                            </Link>

                            <span aria-hidden="true">
                                /
                            </span>

                            <Link to="/member/recursos/guias-oracion">
                                Guías de oración
                            </Link>

                            <span aria-hidden="true">
                                /
                            </span>

                            <span aria-current="page">
                                {guide.title}
                            </span>
                        </nav>

                        <div className="prayer-guide-details-hero__meta">
                            <span>
                                {guide.category}
                            </span>

                        </div>

                        <p className="prayer-guide-details-hero__eyebrow">
                            Guía de oración
                        </p>

                        <h1>
                            {guide.title}
                        </h1>

                        <p className="prayer-guide-details-hero__summary">
                            {guide.summary}
                        </p>

                        {/* PDF generado al descargar: no agregamos copias en Drive. */}
                        <div className="prayer-guide-details-hero__download-area">
                            <button type="button"
                                className="prayer-guide-details-hero__download"
                                onClick={handlePdfDownload}
                                disabled={pdfDownloading}
                                aria-busy={pdfDownloading}>
                                <span aria-hidden="true">↓</span>
                                {pdfDownloading ? "Preparando PDF..." : "Descargar guía en PDF"}
                            </button>
                            {pdfError && (
                                <p className="prayer-guide-details-hero__download-error" role="alert">
                                    {pdfError}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="prayer-guide-details-hero__curve" />
                </section>

                {/* Introducción de la guía. */}
                <section className="prayer-guide-details-intro">
                    <div className="prayer-guide-details-intro__container">
                        <article>
                            <p className="prayer-guide-details-section__eyebrow">
                                Antes de comenzar
                            </p>

                            <h2>
                                Prepara este momento de oración
                            </h2>

                            <div className="prayer-guide-details-intro__description">
                                {guide.description.map(
                                    (paragraph, index) => (
                                        <p
                                            key={`${guide.slug}-description-${index}`}
                                        >
                                            {paragraph}
                                        </p>
                                    )
                                )}
                            </div>
                        </article>

                        <aside className="prayer-guide-details-intro__card">
                            <p>
                                Sugerencia
                            </p>

                            <h3>
                                Busca un lugar tranquilo
                            </h3>

                            <p>
                                Respira con calma, deja a un lado las
                                distracciones y toma unos minutos para
                                presentar tu corazón delante de Dios.
                            </p>
                        </aside>
                    </div>
                </section>

                {/* Versículo principal. */}
                <section className="prayer-guide-details-verse">
                    <div className="prayer-guide-details-verse__container">
                        <p className="prayer-guide-details-verse__eyebrow">
                            Palabra para acompañarte
                        </p>

                        <blockquote>
                            <p>
                                “{guide.keyVerse.text}”
                            </p>

                            <footer>
                                {guide.keyVerse.reference}
                            </footer>
                        </blockquote>
                    </div>
                </section>

                {/* Puntos para orientar la oración. */}
                <section className="prayer-guide-details-points">
                    <div className="prayer-guide-details-points__container">
                        <div className="prayer-guide-details-points__heading">
                            <p className="prayer-guide-details-section__eyebrow">
                                Paso a paso
                            </p>

                            <h2>
                                Puntos para orientar tu oración
                            </h2>

                            <p>
                                Puedes seguirlos en orden o detenerte más
                                tiempo en aquel que represente mejor lo que
                                necesitas expresar.
                            </p>
                        </div>

                        <ol className="prayer-guide-details-points__list">
                            {guide.prayerPoints.map((point, index) => (
                                <li key={point}>
                                    <span>
                                        {String(index + 1).padStart(2, "0")}
                                    </span>

                                    <p>
                                        {point}
                                    </p>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>

                {/* Oración de ejemplo. */}
                <section className="prayer-guide-details-example">
                    <div className="prayer-guide-details-example__container">
                        <div className="prayer-guide-details-example__heading">
                            <p className="prayer-guide-details-example__eyebrow">
                                Oración de ejemplo
                            </p>

                            <h2>
                                Puedes comenzar con estas palabras
                            </h2>

                            <p>
                                No es necesario repetirla exactamente.
                                Úsala como una ayuda y exprésate con
                                sinceridad.
                            </p>
                        </div>

                        <blockquote>
                            <p>
                                “{guide.samplePrayer}”
                            </p>
                        </blockquote>
                    </div>
                </section>

                {/* Mensaje final. */}
                <section className="prayer-guide-details-closing">
                    <div className="prayer-guide-details-closing__container">
                        <div>
                            <p className="prayer-guide-details-closing__eyebrow">
                                Tómate tu tiempo
                            </p>

                            <h2>
                                Dios también escucha tus silencios
                            </h2>

                            <p>
                                Puedes permanecer unos minutos en calma,
                                recordar lo que has expresado y descansar en
                                la presencia de Dios.
                            </p>
                        </div>

                        <Link to="/member/recursos/guias-oracion">
                            Ver todas las guías
                        </Link>
                    </div>
                </section>

                {/* Navegación entre guías. */}
                <nav
                    className="prayer-guide-details-navigation"
                    aria-label="Navegación entre guías de oración"
                >
                    <div className="prayer-guide-details-navigation__container">
                        {previousGuide ? (
                            <Link
                                className="prayer-guide-details-navigation__link prayer-guide-details-navigation__link--previous"
                                to={`/member/recursos/guias-oracion/${previousGuide.slug}`}
                            >
                                <span aria-hidden="true">
                                    ←
                                </span>

                                <div>
                                    <small>
                                        Guía anterior
                                    </small>

                                    <strong>
                                        {previousGuide.title}
                                    </strong>
                                </div>
                            </Link>
                        ) : (
                            <div className="prayer-guide-details-navigation__placeholder" />
                        )}

                        <Link
                            className="prayer-guide-details-navigation__all"
                            to="/member/recursos/guias-oracion"
                        >
                            Ver todas las guías
                        </Link>

                        {nextGuide ? (
                            <Link
                                className="prayer-guide-details-navigation__link prayer-guide-details-navigation__link--next"
                                to={`/member/recursos/guias-oracion/${nextGuide.slug}`}
                            >
                                <div>
                                    <small>
                                        Guía siguiente
                                    </small>

                                    <strong>
                                        {nextGuide.title}
                                    </strong>
                                </div>

                                <span aria-hidden="true">
                                    →
                                </span>
                            </Link>
                        ) : (
                            <div className="prayer-guide-details-navigation__placeholder" />
                        )}
                    </div>
                </nav>
            </main>
        </>
    );
}

export default PrayerGuideDetails;
