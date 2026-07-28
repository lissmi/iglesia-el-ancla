import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Header from "../../../components/public/Header";

import prayerGuides from "../../../data/resources/prayerGuides";

import "../../../styles/pages/public/resources/PrayerGuides.css";

function PrayerGuides() {
    // Guarda el texto escrito en el buscador.
    const [searchTerm, setSearchTerm] = useState("");

    // Guarda la categoría seleccionada.
    const [selectedCategory, setSelectedCategory] =
        useState("Todas");

    // Creamos automáticamente la lista de categorías
    // a partir de los datos disponibles.
    const categories = useMemo(() => {
        const guideCategories = prayerGuides.map(
            (guide) => guide.category
        );

        return [
            "Todas",
            ...new Set(guideCategories),
        ];
    }, []);

    // Filtramos las guías según la búsqueda y categoría.
    const filteredGuides = useMemo(() => {
        const normalizedSearch = searchTerm
            .trim()
            .toLowerCase();

        return prayerGuides.filter((guide) => {
            const matchesCategory =
                selectedCategory === "Todas" ||
                guide.category === selectedCategory;

            const searchableContent = [
                guide.title,
                guide.category,
                guide.summary,
                guide.duration,
                ...(guide.description || []),
                ...(guide.prayerPoints || []),
            ]
                .join(" ")
                .toLowerCase();

            const matchesSearch =
                normalizedSearch === "" ||
                searchableContent.includes(normalizedSearch);

            return matchesCategory && matchesSearch;
        });
    }, [searchTerm, selectedCategory]);

    // Limpia los filtros activos.
    const clearFilters = () => {
        setSearchTerm("");
        setSelectedCategory("Todas");
    };

    return (
        <>
            <Header />

            <main className="prayer-guides-page">
                {/* Hero principal. */}
                <section className="prayer-guides-hero">
                    <div className="prayer-guides-hero__overlay" />

                    <div className="prayer-guides-hero__container">
                        <nav
                            className="prayer-guides-breadcrumb"
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
                                Guías de oración
                            </span>
                        </nav>

                        <p className="prayer-guides-hero__eyebrow">
                            Guía espiritual
                        </p>

                        <h1>
                            Guías de oración
                        </h1>

                        <p className="prayer-guides-hero__description">
                            Encuentra orientaciones prácticas para
                            fortalecer tu vida de oración, acompañar
                            momentos difíciles y acercarte más a Dios.
                        </p>
                    </div>

                    <div className="prayer-guides-hero__curve" />
                </section>

                {/* Buscador y filtros. */}
                <section className="prayer-guides-tools">
                    <div className="prayer-guides-tools__container">
                        <div className="prayer-guides-tools__heading">
                            <div>
                                <p className="prayer-guides-section__eyebrow">
                                    Encuentra una guía
                                </p>

                                <h2>
                                    ¿Sobre qué deseas orar?
                                </h2>
                            </div>

                            <p>
                                Busca por una necesidad concreta o explora
                                las categorías disponibles.
                            </p>
                        </div>

                        {/* Campo de búsqueda. */}
                        <div className="prayer-guides-search">
                            <span
                                className="prayer-guides-search__icon"
                                aria-hidden="true"
                            >
                                ⌕
                            </span>

                            <input
                                type="search"
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(event.target.value)
                                }
                                placeholder="Buscar una guía de oración..."
                                aria-label="Buscar una guía de oración"
                            />

                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm("")}
                                    aria-label="Limpiar búsqueda"
                                >
                                    ×
                                </button>
                            )}
                        </div>

                        {/* Botones de categorías. */}
                        <div
                            className="prayer-guides-filters"
                            aria-label="Filtrar por categoría"
                        >
                            {categories.map((category) => {
                                const isActive =
                                    selectedCategory === category;

                                return (
                                    <button
                                        key={category}
                                        type="button"
                                        className={
                                            isActive
                                                ? "prayer-guides-filter prayer-guides-filter--active"
                                                : "prayer-guides-filter"
                                        }
                                        onClick={() =>
                                            setSelectedCategory(category)
                                        }
                                        aria-pressed={isActive}
                                    >
                                        {category}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Listado de guías. */}
                <section className="prayer-guides-list">
                    <div className="prayer-guides-list__container">
                        <div className="prayer-guides-list__heading">
                            <div>
                                <p className="prayer-guides-section__eyebrow">
                                    Recursos para orar
                                </p>

                                <h2>
                                    Guías disponibles
                                </h2>
                            </div>

                            <p className="prayer-guides-list__count">
                                {filteredGuides.length}{" "}
                                {filteredGuides.length === 1
                                    ? "guía encontrada"
                                    : "guías encontradas"}
                            </p>
                        </div>

                        {filteredGuides.length > 0 ? (
                            <div className="prayer-guides-grid">
                                {filteredGuides.map((guide) => (
                                    <article
                                        key={guide.id}
                                        className="prayer-guide-card"
                                    >
                                        <div className="prayer-guide-card__top">
                                            <span className="prayer-guide-card__category">
                                                {guide.category}
                                            </span>

                                            <span className="prayer-guide-card__duration">
                                                {guide.duration}
                                            </span>
                                        </div>

                                        <div className="prayer-guide-card__content">
                                            <p className="prayer-guide-card__eyebrow">
                                                Guía de oración
                                            </p>

                                            <h3>
                                                {guide.title}
                                            </h3>

                                            <p className="prayer-guide-card__summary">
                                                {guide.summary}
                                            </p>
                                        </div>

                                        <div className="prayer-guide-card__footer">
                                            <span>
                                                {guide.prayerPoints.length}{" "}
                                                puntos para orar
                                            </span>

                                            <Link
                                                to={`/recursos/guias-oracion/${guide.slug}`}
                                            >
                                                Ver guía

                                                <span aria-hidden="true">
                                                    →
                                                </span>
                                            </Link>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <div className="prayer-guides-empty">
                                <p className="prayer-guides-empty__eyebrow">
                                    Sin resultados
                                </p>

                                <h3>
                                    No encontramos una guía con esos filtros
                                </h3>

                                <p>
                                    Prueba con otra palabra o vuelve a mostrar
                                    todas las categorías disponibles.
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

                {/* Invitación final. */}
                <section className="prayer-guides-closing">
                    <div className="prayer-guides-closing__container">
                        <div>
                            <p className="prayer-guides-closing__eyebrow">
                                Un momento con Dios
                            </p>

                            <h2>
                                No necesitas palabras perfectas para orar
                            </h2>

                            <p>
                                Puedes acercarte a Dios con sinceridad y
                                comenzar expresando lo que hay en tu corazón.
                                Estas guías son solo una ayuda para acompañar
                                ese momento.
                            </p>
                        </div>

                        <Link to="/recursos">
                            Volver a Recursos
                        </Link>
                    </div>
                </section>
            </main>
        </>
    );
}

export default PrayerGuides;