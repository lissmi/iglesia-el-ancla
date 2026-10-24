import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Header from "../../../components/public/Header";

import discipleshipMaterials from "../../../data/resources/discipleshipMaterials";

import "../../../styles/pages/public/resources/DiscipleshipMaterials.css";

function DiscipleshipMaterials() {
    // Texto ingresado en el buscador.
    const [searchTerm, setSearchTerm] = useState("");

    // Categoría seleccionada.
    const [selectedCategory, setSelectedCategory] =
        useState("Todos");

    // Nivel seleccionado.
    const [selectedLevel, setSelectedLevel] =
        useState("Todos");

    // Categorías creadas automáticamente desde los datos.
    const categories = useMemo(() => {
        const materialCategories =
            discipleshipMaterials.map(
                (material) => material.category
            );

        return [
            "Todos",
            ...new Set(materialCategories),
        ];
    }, []);

    // Niveles creados automáticamente desde los datos.
    const levels = useMemo(() => {
        const materialLevels =
            discipleshipMaterials.map(
                (material) => material.level
            );

        return [
            "Todos",
            ...new Set(materialLevels),
        ];
    }, []);

    // Materiales filtrados.
    const filteredMaterials = useMemo(() => {
        const normalizedSearch = searchTerm
            .trim()
            .toLowerCase();

        return discipleshipMaterials.filter(
            (material) => {
                const matchesCategory =
                    selectedCategory === "Todos" ||
                    material.category ===
                        selectedCategory;

                const matchesLevel =
                    selectedLevel === "Todos" ||
                    material.level === selectedLevel;

                const searchableContent = [
                    material.title,
                    material.category,
                    material.level,
                    material.duration,
                    material.summary,
                    ...(material.description || []),
                    ...(material.objectives || []),
                    ...(material.topics || []),
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
                    matchesLevel &&
                    matchesSearch
                );
            }
        );
    }, [
        searchTerm,
        selectedCategory,
        selectedLevel,
    ]);

    // Limpia todos los filtros.
    const clearFilters = () => {
        setSearchTerm("");
        setSelectedCategory("Todos");
        setSelectedLevel("Todos");
    };

    return (
        <>
            <Header />

            <main className="discipleship-materials-page">
                {/* Hero principal. */}
                <section className="discipleship-materials-hero">
                    <div className="discipleship-materials-hero__overlay" />

                    <div className="discipleship-materials-hero__container">
                        <nav
                            className="discipleship-materials-breadcrumb"
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
                                Material de discipulado
                            </span>
                        </nav>

                        <p className="discipleship-materials-hero__eyebrow">
                            Formación cristiana
                        </p>

                        <h1>
                            Material de discipulado
                        </h1>

                        <p className="discipleship-materials-hero__description">
                            Encuentra contenidos preparados
                            para fortalecer tu fe, comprender
                            la Biblia y avanzar en tu caminar
                            cristiano.
                        </p>
                    </div>

                    <div className="discipleship-materials-hero__curve" />
                </section>

                {/* Buscador y filtros. */}
                <section className="discipleship-materials-tools">
                    <div className="discipleship-materials-tools__container">
                        <div className="discipleship-materials-tools__heading">
                            <div>
                                <p className="discipleship-materials-section__eyebrow">
                                    Continúa creciendo
                                </p>

                                <h2>
                                    Encuentra un material
                                </h2>
                            </div>

                            <p>
                                Busca por un tema específico
                                o utiliza los filtros para
                                encontrar un contenido adecuado
                                para tu etapa de crecimiento.
                            </p>
                        </div>

                        {/* Campo de búsqueda. */}
                        <div className="discipleship-materials-search">
                            <span
                                className="discipleship-materials-search__icon"
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
                                placeholder="Buscar un material de discipulado..."
                                aria-label="Buscar un material de discipulado"
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
                        <div className="discipleship-materials-filter-group">
                            <p>
                                Categorías
                            </p>

                            <div
                                className="discipleship-materials-filters"
                                aria-label="Filtrar por categoría"
                            >
                                {categories.map(
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
                                                        ? "discipleship-materials-filter discipleship-materials-filter--active"
                                                        : "discipleship-materials-filter"
                                                }
                                                onClick={() =>
                                                    setSelectedCategory(
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

                        {/* Filtros por nivel. */}
                        <div className="discipleship-materials-filter-group">
                            <p>
                                Nivel
                            </p>

                            <div
                                className="discipleship-materials-filters"
                                aria-label="Filtrar por nivel"
                            >
                                {levels.map((level) => {
                                    const isActive =
                                        selectedLevel === level;

                                    return (
                                        <button
                                            key={level}
                                            type="button"
                                            className={
                                                isActive
                                                    ? "discipleship-materials-filter discipleship-materials-filter--active"
                                                    : "discipleship-materials-filter"
                                            }
                                            onClick={() =>
                                                setSelectedLevel(
                                                    level
                                                )
                                            }
                                            aria-pressed={
                                                isActive
                                            }
                                        >
                                            {level}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Listado de materiales. */}
                <section className="discipleship-materials-list">
                    <div className="discipleship-materials-list__container">
                        <div className="discipleship-materials-list__heading">
                            <div>
                                <p className="discipleship-materials-section__eyebrow">
                                    Formación disponible
                                </p>

                                <h2>
                                    Materiales para crecer
                                </h2>
                            </div>

                            <p className="discipleship-materials-list__count">
                                {filteredMaterials.length}{" "}
                                {filteredMaterials.length === 1
                                    ? "material encontrado"
                                    : "materiales encontrados"}
                            </p>
                        </div>

                        {filteredMaterials.length > 0 ? (
                            <div className="discipleship-materials-grid">
                                {filteredMaterials.map(
                                    (material) => (
                                        <article
                                            key={material.id}
                                            className="discipleship-material-card"
                                        >
                                            <div className="discipleship-material-card__top">
                                                <span className="discipleship-material-card__category">
                                                    {
                                                        material.category
                                                    }
                                                </span>

                                                <span className="discipleship-material-card__level">
                                                    Nivel{" "}
                                                    {
                                                        material.level
                                                    }
                                                </span>
                                            </div>

                                            <div className="discipleship-material-card__content">
                                                <p className="discipleship-material-card__eyebrow">
                                                    Material de
                                                    discipulado
                                                </p>

                                                <h3>
                                                    {
                                                        material.title
                                                    }
                                                </h3>

                                                <p className="discipleship-material-card__summary">
                                                    {
                                                        material.summary
                                                    }
                                                </p>
                                            </div>

                                            <div className="discipleship-material-card__details">
                                                <span>
                                                    {
                                                        material.lessons
                                                    }{" "}
                                                    {material.lessons ===
                                                    1
                                                        ? "lección"
                                                        : "lecciones"}
                                                </span>

                                                <span
                                                    aria-hidden="true"
                                                >
                                                    ·
                                                </span>

                                                <span>
                                                    {
                                                        material.duration
                                                    }
                                                </span>
                                            </div>

                                            <div className="discipleship-material-card__footer">
                                                <span>
                                                    {
                                                        material.topics
                                                            .length
                                                    }{" "}
                                                    temas principales
                                                </span>

                                                <Link
                                                    to={`/recursos/discipulado/${material.slug}`}
                                                >
                                                    Comenzar material

                                                    <span
                                                        aria-hidden="true"
                                                    >
                                                        →
                                                    </span>
                                                </Link>
                                            </div>
                                        </article>
                                    )
                                )}
                            </div>
                        ) : (
                            <div className="discipleship-materials-empty">
                                <p className="discipleship-materials-empty__eyebrow">
                                    Sin resultados
                                </p>

                                <h3>
                                    No encontramos un material
                                    con esos filtros
                                </h3>

                                <p>
                                    Prueba con otra palabra,
                                    categoría o nivel para
                                    encontrar un contenido
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

                {/* Sección final. */}
                <section className="discipleship-materials-closing">
                    <div className="discipleship-materials-closing__container">
                        <div>
                            <p className="discipleship-materials-closing__eyebrow">
                                Un camino de crecimiento
                            </p>

                            <h2>
                                El discipulado se construye
                                paso a paso
                            </h2>

                            <p>
                                Puedes avanzar a tu propio ritmo,
                                conversar lo aprendido con otras
                                personas y volver a cada material
                                cuando necesites reforzar un tema.
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

export default DiscipleshipMaterials;