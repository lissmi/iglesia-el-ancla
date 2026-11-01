import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Header from "../../../components/public/Header";

import downloadableMaterials, {
    downloadableMaterialCategories,
} from "../../../data/resources/downloadableMaterials";

import "../../../styles/pages/member/resources/DownloadableMaterials.css";

function DownloadableMaterials() {
    // Texto escrito por el usuario en el buscador.
    const [searchTerm, setSearchTerm] = useState("");

    // Categoría seleccionada.
    const [selectedCategory, setSelectedCategory] =
        useState("Todos");

    // Materiales filtrados por búsqueda y categoría.
    const filteredMaterials = useMemo(() => {
        const normalizedSearch = searchTerm
            .trim()
            .toLowerCase();

        return downloadableMaterials.filter(
            (material) => {
                const matchesCategory =
                    selectedCategory === "Todos" ||
                    material.category ===
                    selectedCategory;

                const searchableContent = [
                    material.title,
                    material.category,
                    material.format,
                    material.summary,
                    ...(material.description || []),
                    ...(material.includedContent || []),
                    ...(material.recommendedFor || []),
                ]
                    .join(" ")
                    .toLowerCase();

                const matchesSearch =
                    normalizedSearch === "" ||
                    searchableContent.includes(
                        normalizedSearch
                    );

                return (
                    matchesCategory &&
                    matchesSearch
                );
            }
        );
    }, [searchTerm, selectedCategory]);

 

    // Cambia la categoría activa.
    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
    };

    // Limpia la búsqueda y los filtros.
    const clearFilters = () => {
        setSearchTerm("");
        setSelectedCategory("Todos");
    };

    return (
        <>
            <Header />

            <main className="downloadable-materials-page">
                {/* ================================================= */}
                {/* HERO */}
                {/* ================================================= */}

                <section className="downloadable-materials-hero">
                    <div className="downloadable-materials-hero__overlay" />

                    <div className="downloadable-materials-hero__container">
                        <nav
                            className="downloadable-materials-breadcrumb"
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

                            <span aria-current="page">
                                Material descargable
                            </span>
                        </nav>

                        <p className="downloadable-materials-hero__eyebrow">
                            Documentos y guías
                        </p>

                        <h1>
                            Material descargable
                        </h1>

                        <p className="downloadable-materials-hero__description">
                            Descarga documentos, guías,
                            planes de lectura y recursos
                            prácticos para estudiar, imprimir
                            o utilizar cuando los necesites.
                        </p>
                    </div>

                    <div className="downloadable-materials-hero__curve" />
                </section>

                {/* ================================================= */}
                {/* INTRODUCCIÓN */}
                {/* ================================================= */}

                <section className="downloadable-materials-intro">
                    <div className="downloadable-materials-intro__container">
                        <div className="downloadable-materials-intro__content">
                            <p className="downloadable-materials-section__eyebrow">
                                Recursos para acompañarte
                            </p>

                            <h2>
                                Materiales para guardar,
                                imprimir y compartir
                            </h2>

                            <p>
                                Aquí encontrarás recursos
                                preparados para apoyar tu
                                crecimiento espiritual, tus
                                tiempos de oración, el estudio
                                de la Biblia y la vida en
                                comunidad.
                            </p>
                        </div>

                        <div className="downloadable-materials-intro__summary">
                            <div className="downloadable-materials-intro__stat">
                                <strong>
                                    {
                                        downloadableMaterials.length
                                    }
                                </strong>

                                <span>
                                    Materiales publicados
                                </span>
                            </div>

                            <div className="downloadable-materials-intro__stat">
                                <strong>
                                    {downloadableMaterialCategories.length - 1}
                                </strong>

                                <span>
                                    Categorías de recursos
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ================================================= */}
                {/* BUSCADOR Y FILTROS */}
                {/* ================================================= */}

                <section className="downloadable-materials-tools">
                    <div className="downloadable-materials-tools__container">
                        <div className="downloadable-materials-tools__heading">
                            <div>
                                <p className="downloadable-materials-section__eyebrow">
                                    Explora los recursos
                                </p>

                                <h2>
                                    Encuentra un material
                                </h2>
                            </div>

                            <p>
                                Busca por nombre, tema o
                                contenido, o selecciona una
                                categoría para encontrar el
                                recurso que necesitas.
                            </p>
                        </div>

                        {/* Buscador. */}
                        <div className="downloadable-materials-search">
                            <span
                                className="downloadable-materials-search__icon"
                                aria-hidden="true"
                            >
                                ⌕
                            </span>

                            <input
                                type="search"
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(
                                        event.target.value
                                    )
                                }
                                placeholder="Buscar un material..."
                                aria-label="Buscar material descargable"
                            />

                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setSearchTerm("")
                                    }
                                    aria-label="Limpiar búsqueda"
                                >
                                    ×
                                </button>
                            )}
                        </div>

                        {/* Filtros por categoría. */}
                        <div className="downloadable-materials-filter-group">
                            <p>
                                Categorías
                            </p>

                            <div
                                className="downloadable-materials-filters"
                                aria-label="Filtrar materiales por categoría"
                            >
                                {downloadableMaterialCategories.map(
                                    (category) => {
                                        const isActive =
                                            selectedCategory ===
                                            category;

                                        return (
                                            <button
                                                key={category}
                                                type="button"
                                                className={
                                                    isActive
                                                        ? "downloadable-materials-filter downloadable-materials-filter--active"
                                                        : "downloadable-materials-filter"
                                                }
                                                onClick={() =>
                                                    handleCategoryChange(
                                                        category
                                                    )
                                                }
                                                aria-pressed={
                                                    isActive
                                                }
                                            >
                                                {category}
                                            </button>
                                        );
                                    }
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ================================================= */}
                {/* LISTADO DE MATERIALES */}
                {/* ================================================= */}

                <section className="downloadable-materials-list">
                    <div className="downloadable-materials-list__container">
                        <div className="downloadable-materials-list__heading">
                            <div>
                                <p className="downloadable-materials-section__eyebrow">
                                    Biblioteca descargable
                                </p>

                                <h2>
                                    Documentos y guías
                                </h2>
                            </div>

                            <p className="downloadable-materials-list__count">
                                {filteredMaterials.length}{" "}
                                {filteredMaterials.length ===
                                    1
                                    ? "material encontrado"
                                    : "materiales encontrados"}
                            </p>
                        </div>

                        {filteredMaterials.length > 0 ? (
                            <div className="downloadable-materials-grid">
                                {filteredMaterials.map(
                                    (material) => (
                                        <article
                                            key={material.id}
                                            className="downloadable-material-card"
                                        >
                                            {/* Parte superior de la tarjeta. */}
                                            <div className="downloadable-material-card__top">
                                                <div className="downloadable-material-card__badges">
                                                    <span className="downloadable-material-card__category">
                                                        {
                                                            material.category
                                                        }
                                                    </span>

                                                    <span
                                                        className={
                                                            material.available
                                                                ? "downloadable-material-card__status downloadable-material-card__status--available"
                                                                : "downloadable-material-card__status downloadable-material-card__status--soon"
                                                        }
                                                    >
                                                        {material.available
                                                            ? "Disponible"
                                                            : "Próximamente"}
                                                    </span>
                                                </div>

                                                <div
                                                    className="downloadable-material-card__document-icon"
                                                    aria-hidden="true"
                                                >
                                                    <span>
                                                        PDF
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Contenido principal. */}
                                            <div className="downloadable-material-card__content">
                                                <h3>
                                                    {
                                                        material.title
                                                    }
                                                </h3>

                                                <p>
                                                    {
                                                        material.summary
                                                    }
                                                </p>

                                                <div className="downloadable-material-card__meta">
                                                    <div>
                                                        <span>
                                                            Formato
                                                        </span>

                                                        <strong>
                                                            {
                                                                material.format
                                                            }
                                                        </strong>
                                                    </div>

                                                    <div>
                                                        <span>
                                                            Extensión
                                                        </span>

                                                        <strong>
                                                            {
                                                                material.pages
                                                            }{" "}
                                                            {material.pages ===
                                                                1
                                                                ? "página"
                                                                : "páginas"}
                                                        </strong>
                                                    </div>
                                                </div>

                                                {material.includedContent
                                                    ?.length >
                                                    0 && (
                                                        <div className="downloadable-material-card__included">
                                                            <p>
                                                                Este
                                                                material
                                                                incluye
                                                            </p>

                                                            <ul>
                                                                {material.includedContent
                                                                    .slice(
                                                                        0,
                                                                        3
                                                                    )
                                                                    .map(
                                                                        (
                                                                            item,
                                                                            index
                                                                        ) => (
                                                                            <li
                                                                                key={`${material.id}-included-${index}`}
                                                                            >
                                                                                {
                                                                                    item
                                                                                }
                                                                            </li>
                                                                        )
                                                                    )}
                                                            </ul>
                                                        </div>
                                                    )}
                                            </div>

                                            {/* Parte inferior. */}
                                            <div className="downloadable-material-card__footer">
                                                <Link
                                                    to={`/recursos/material-descargable/${material.slug}`}
                                                    aria-label={`Ver detalles de ${material.title}`}
                                                >
                                                    Ver material

                                                    <span
                                                        aria-hidden="true"
                                                    >
                                                        →
                                                    </span>
                                                </Link>

                                                <span className="downloadable-material-card__file-size">
                                                    {material.available
                                                        ? material.fileSize
                                                        : "En preparación"}
                                                </span>
                                            </div>
                                        </article>
                                    )
                                )}
                            </div>
                        ) : (
                            <div className="downloadable-materials-empty">
                                <p className="downloadable-materials-empty__eyebrow">
                                    Sin resultados
                                </p>

                                <h3>
                                    No encontramos materiales
                                    relacionados
                                </h3>

                                <p>
                                    Prueba con otra palabra o
                                    selecciona una categoría
                                    diferente.
                                </p>

                                <button
                                    type="button"
                                    onClick={clearFilters}
                                >
                                    Limpiar filtros
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                {/* ================================================= */}
                {/* INFORMACIÓN SOBRE LAS DESCARGAS */}
                {/* ================================================= */}

                <section className="downloadable-materials-info">
                    <div className="downloadable-materials-info__container">
                        <div className="downloadable-materials-info__content">
                            <p className="downloadable-materials-info__eyebrow">
                                ¿Cómo funcionan?
                            </p>

                            <h2>
                                Recursos disponibles cuando
                                los necesites
                            </h2>

                            <p>
                                Los materiales podrán
                                descargarse en formato PDF para
                                leerlos desde tu dispositivo,
                                guardarlos o imprimirlos para
                                uso personal y comunitario.
                            </p>
                        </div>

                        <div className="downloadable-materials-info__steps">
                            <article>
                                <span>
                                    01
                                </span>

                                <div>
                                    <h3>
                                        Elige un material
                                    </h3>

                                    <p>
                                        Busca el recurso que
                                        mejor se adapte a tu
                                        necesidad.
                                    </p>
                                </div>
                            </article>

                            <article>
                                <span>
                                    02
                                </span>

                                <div>
                                    <h3>
                                        Revisa su contenido
                                    </h3>

                                    <p>
                                        Consulta su descripción,
                                        temas y público
                                        recomendado.
                                    </p>
                                </div>
                            </article>

                            <article>
                                <span>
                                    03
                                </span>

                                <div>
                                    <h3>
                                        Descarga y utiliza
                                    </h3>

                                    <p>
                                        Guarda el documento o
                                        imprímelo para trabajar
                                        con él.
                                    </p>
                                </div>
                            </article>
                        </div>
                    </div>
                </section>

                {/* ================================================= */}
                {/* CIERRE */}
                {/* ================================================= */}

                <section className="downloadable-materials-closing">
                    <div className="downloadable-materials-closing__container">
                        <div>
                            <p className="downloadable-materials-closing__eyebrow">
                                Continúa aprendiendo
                            </p>

                            <h2>
                                Descubre más recursos para tu
                                crecimiento
                            </h2>

                            <p>
                                También puedes explorar las
                                guías de oración, los materiales
                                de discipulado y las herramientas
                                de estudio bíblico disponibles
                                en nuestra comunidad.
                            </p>
                        </div>

                        <Link to="/recursos">
                            Explorar Recursos
                        </Link>
                    </div>
                </section>
            </main>
        </>
    );
}

export default DownloadableMaterials;