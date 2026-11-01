import { Link, useParams } from "react-router-dom";

import Header from "../../../components/public/Header";

import downloadableMaterials, {
    getDownloadableMaterialBySlug,
    getRelatedDownloadableMaterials,
} from "../../../data/resources/downloadableMaterials";

import "../../../styles/pages/member/resources/DownloadableMaterialDetails.css";

function DownloadableMaterialDetails() {
    // Obtenemos el slug desde la URL.
    const { slug } = useParams();

    // Buscamos el material correspondiente.
    const material =
        getDownloadableMaterialBySlug(slug);

    // Estado cuando el material no existe.
    if (!material) {
        return (
            <>
                <Header />

                <main className="downloadable-material-details-page">
                    <section className="downloadable-material-not-found">
                        <div className="downloadable-material-not-found__container">
                            <p className="downloadable-material-not-found__eyebrow">
                                Material no encontrado
                            </p>

                            <h1>
                                No pudimos encontrar este
                                recurso
                            </h1>

                            <p>
                                Es posible que el enlace sea
                                incorrecto o que el material ya
                                no se encuentre disponible.
                            </p>

                            <Link to="/recursos/material-descargable">
                                Volver a los materiales
                            </Link>
                        </div>
                    </section>
                </main>
            </>
        );
    }

    // Posición actual para navegación anterior y siguiente.
    const currentIndex =
        downloadableMaterials.findIndex(
            (item) => item.slug === slug
        );

    const previousMaterial =
        currentIndex > 0
            ? downloadableMaterials[
                  currentIndex - 1
              ]
            : null;

    const nextMaterial =
        currentIndex <
        downloadableMaterials.length - 1
            ? downloadableMaterials[
                  currentIndex + 1
              ]
            : null;

    // Materiales relacionados.
    const relatedMaterials =
        getRelatedDownloadableMaterials(
            material.relatedMaterials
        );

    return (
        <>
            <Header />

            <main className="downloadable-material-details-page">
                {/* ================================================= */}
                {/* HERO */}
                {/* ================================================= */}

                <section className="downloadable-material-details-hero">
                    <div className="downloadable-material-details-hero__overlay" />

                    <div className="downloadable-material-details-hero__container">
                        <nav
                            className="downloadable-material-details-breadcrumb"
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

                            <Link to="/recursos/material-descargable">
                                Material descargable
                            </Link>

                            <span aria-hidden="true">
                                /
                            </span>

                            <span aria-current="page">
                                {material.title}
                            </span>
                        </nav>

                        <div className="downloadable-material-details-hero__badges">
                            <span>
                                {material.category}
                            </span>

                            <span>
                                {material.available
                                    ? "Disponible"
                                    : "Próximamente"}
                            </span>
                        </div>

                        <h1>
                            {material.title}
                        </h1>

                        <p className="downloadable-material-details-hero__summary">
                            {material.summary}
                        </p>
                    </div>

                    <div className="downloadable-material-details-hero__curve" />
                </section>

                {/* ================================================= */}
                {/* INTRODUCCIÓN Y FICHA DEL ARCHIVO */}
                {/* ================================================= */}

                <section className="downloadable-material-details-intro">
                    <div className="downloadable-material-details-intro__container">
                        <div className="downloadable-material-details-intro__content">
                            <p className="downloadable-material-details-section__eyebrow">
                                Acerca de este recurso
                            </p>

                            <h2>
                                Un material preparado para
                                acompañar tu crecimiento
                            </h2>

                            <div className="downloadable-material-details-intro__description">
                                {material.description.map(
                                    (
                                        paragraph,
                                        index
                                    ) => (
                                        <p
                                            key={`${material.id}-description-${index}`}
                                        >
                                            {paragraph}
                                        </p>
                                    )
                                )}
                            </div>
                        </div>

                        <aside className="downloadable-material-details-file">
                            <div
                                className="downloadable-material-details-file__icon"
                                aria-hidden="true"
                            >
                                <span>
                                    PDF
                                </span>
                            </div>

                            <p className="downloadable-material-details-file__eyebrow">
                                Información del archivo
                            </p>

                            <h2>
                                {material.title}
                            </h2>

                            <dl>
                                <div>
                                    <dt>
                                        Formato
                                    </dt>

                                    <dd>
                                        {material.format}
                                    </dd>
                                </div>

                                <div>
                                    <dt>
                                        Extensión
                                    </dt>

                                    <dd>
                                        {material.pages}{" "}
                                        {material.pages === 1
                                            ? "página"
                                            : "páginas"}
                                    </dd>
                                </div>

                                <div>
                                    <dt>
                                        Tamaño
                                    </dt>

                                    <dd>
                                        {material.available
                                            ? material.fileSize
                                            : "Por confirmar"}
                                    </dd>
                                </div>

                                <div>
                                    <dt>
                                        Estado
                                    </dt>

                                    <dd>
                                        {material.available
                                            ? "Disponible"
                                            : "En preparación"}
                                    </dd>
                                </div>
                            </dl>

                            {material.available ? (
                                <a
                                    href={material.filePath}
                                    download
                                    className="downloadable-material-details-file__download"
                                >
                                    Descargar material

                                    <span
                                        aria-hidden="true"
                                    >
                                        ↓
                                    </span>
                                </a>
                            ) : (
                                <div className="downloadable-material-details-file__soon">
                                    <strong>
                                        Próximamente
                                    </strong>

                                    <p>
                                        Este archivo todavía se
                                        encuentra en preparación.
                                        Podrás descargarlo cuando
                                        esté disponible.
                                    </p>
                                </div>
                            )}

                            <p className="downloadable-material-details-file__note">
                                Los materiales son gratuitos y
                                están pensados para uso personal,
                                familiar y comunitario.
                            </p>
                        </aside>
                    </div>
                </section>

                {/* ================================================= */}
                {/* CONTENIDO INCLUIDO */}
                {/* ================================================= */}

                <section className="downloadable-material-details-content">
                    <div className="downloadable-material-details-content__container">
                        <div className="downloadable-material-details-content__heading">
                            <p className="downloadable-material-details-section__eyebrow">
                                Contenido del documento
                            </p>

                            <h2>
                                ¿Qué encontrarás en este
                                material?
                            </h2>

                            <p>
                                Estos son algunos de los temas y
                                recursos incluidos dentro del
                                documento.
                            </p>
                        </div>

                        <div className="downloadable-material-details-content__grid">
                            {material.includedContent.map(
                                (item, index) => (
                                    <article
                                        key={`${material.id}-content-${index}`}
                                    >
                                        <span>
                                            {String(
                                                index + 1
                                            ).padStart(
                                                2,
                                                "0"
                                            )}
                                        </span>

                                        <p>
                                            {item}
                                        </p>
                                    </article>
                                )
                            )}
                        </div>
                    </div>
                </section>

                {/* ================================================= */}
                {/* RECOMENDADO PARA */}
                {/* ================================================= */}

                <section className="downloadable-material-details-recommended">
                    <div className="downloadable-material-details-recommended__container">
                        <div className="downloadable-material-details-recommended__heading">
                            <p className="downloadable-material-details-section__eyebrow">
                                Uso recomendado
                            </p>

                            <h2>
                                ¿Para quién puede ser útil?
                            </h2>
                        </div>

                        <div className="downloadable-material-details-recommended__list">
                            {material.recommendedFor.map(
                                (item, index) => (
                                    <article
                                        key={`${material.id}-recommended-${index}`}
                                    >
                                        <span
                                            aria-hidden="true"
                                        >
                                            ✓
                                        </span>

                                        <p>
                                            {item}
                                        </p>
                                    </article>
                                )
                            )}
                        </div>
                    </div>
                </section>

                {/* ================================================= */}
                {/* MENSAJE DE USO */}
                {/* ================================================= */}

                <section className="downloadable-material-details-use">
                    <div className="downloadable-material-details-use__container">
                        <div>
                            <p className="downloadable-material-details-use__eyebrow">
                                Comparte y acompaña
                            </p>

                            <h2>
                                Utiliza este material con
                                libertad y responsabilidad
                            </h2>

                            <p>
                                Puedes guardar, imprimir y
                                compartir este recurso para
                                apoyar el estudio personal, las
                                reuniones familiares, los grupos
                                pequeños o el acompañamiento de
                                otras personas.
                            </p>
                        </div>

                        <div className="downloadable-material-details-use__notice">
                            <strong>
                                Importante
                            </strong>

                            <p>
                                Los materiales se ofrecen de
                                manera gratuita. No deben
                                venderse ni utilizarse con fines
                                comerciales.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ================================================= */}
                {/* MATERIALES RELACIONADOS */}
                {/* ================================================= */}

                {relatedMaterials.length > 0 && (
                    <section className="downloadable-material-details-related">
                        <div className="downloadable-material-details-related__container">
                            <div className="downloadable-material-details-related__heading">
                                <div>
                                    <p className="downloadable-material-details-section__eyebrow">
                                        Continúa explorando
                                    </p>

                                    <h2>
                                        Materiales relacionados
                                    </h2>
                                </div>

                                <Link to="/recursos/material-descargable">
                                    Ver todos
                                </Link>
                            </div>

                            <div className="downloadable-material-details-related__grid">
                                {relatedMaterials.map(
                                    (relatedMaterial) => (
                                        <article
                                            key={
                                                relatedMaterial.id
                                            }
                                        >
                                            <div className="downloadable-material-details-related__top">
                                                <span>
                                                    {
                                                        relatedMaterial.category
                                                    }
                                                </span>

                                                <strong>
                                                    {
                                                        relatedMaterial.format
                                                    }
                                                </strong>
                                            </div>

                                            <h3>
                                                {
                                                    relatedMaterial.title
                                                }
                                            </h3>

                                            <p>
                                                {
                                                    relatedMaterial.summary
                                                }
                                            </p>

                                            <Link
                                                to={`/recursos/material-descargable/${relatedMaterial.slug}`}
                                            >
                                                Ver material

                                                <span
                                                    aria-hidden="true"
                                                >
                                                    →
                                                </span>
                                            </Link>
                                        </article>
                                    )
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {/* ================================================= */}
                {/* NAVEGACIÓN ENTRE MATERIALES */}
                {/* ================================================= */}

                <section className="downloadable-material-details-navigation">
                    <div className="downloadable-material-details-navigation__container">
                        {previousMaterial ? (
                            <Link
                                to={`/recursos/material-descargable/${previousMaterial.slug}`}
                                className="downloadable-material-details-navigation__previous"
                            >
                                <span
                                    aria-hidden="true"
                                >
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
                            <div className="downloadable-material-details-navigation__placeholder" />
                        )}

                        {nextMaterial ? (
                            <Link
                                to={`/recursos/material-descargable/${nextMaterial.slug}`}
                                className="downloadable-material-details-navigation__next"
                            >
                                <div>
                                    <small>
                                        Siguiente material
                                    </small>

                                    <strong>
                                        {nextMaterial.title}
                                    </strong>
                                </div>

                                <span
                                    aria-hidden="true"
                                >
                                    →
                                </span>
                            </Link>
                        ) : (
                            <div className="downloadable-material-details-navigation__placeholder" />
                        )}
                    </div>
                </section>

                {/* ================================================= */}
                {/* CIERRE */}
                {/* ================================================= */}

                <section className="downloadable-material-details-closing">
                    <div className="downloadable-material-details-closing__container">
                        <div>
                            <p className="downloadable-material-details-closing__eyebrow">
                                Biblioteca de recursos
                            </p>

                            <h2>
                                Encuentra más documentos y
                                guías
                            </h2>

                            <p>
                                Explora todos los materiales
                                preparados para apoyar la
                                oración, el estudio bíblico, el
                                discipulado y la vida en
                                comunidad.
                            </p>
                        </div>

                        <Link to="/recursos/material-descargable">
                            Ver todos los materiales
                        </Link>
                    </div>
                </section>
            </main>
        </>
    );
}

export default DownloadableMaterialDetails;