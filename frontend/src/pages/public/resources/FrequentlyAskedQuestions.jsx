import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Header from "../../../components/public/Header";

import frequentlyAskedQuestions from "../../../data/resources/frequentlyAskedQuestions";

import "../../../styles/pages/public/resources/FrequentlyAskedQuestions.css";

function FrequentlyAskedQuestions() {
    // Texto ingresado en el buscador.
    const [searchTerm, setSearchTerm] = useState("");

    // Categoría seleccionada.
    const [selectedCategory, setSelectedCategory] =
        useState("Todos");

    // Pregunta abierta actualmente.
    const [openQuestionId, setOpenQuestionId] =
        useState(null);

    // Categorías generadas automáticamente desde los datos.
    const categories = useMemo(() => {
        const faqCategories =
            frequentlyAskedQuestions.map(
                (question) => question.category
            );

        return [
            "Todos",
            ...new Set(faqCategories),
        ];
    }, []);

    // Preguntas filtradas.
    const filteredQuestions = useMemo(() => {
        const normalizedSearch = searchTerm
            .trim()
            .toLowerCase();

        return frequentlyAskedQuestions.filter(
            (question) => {
                const matchesCategory =
                    selectedCategory === "Todos" ||
                    question.category ===
                        selectedCategory;

                const searchableContent = [
                    question.question,
                    question.category,
                    ...(question.answer || []),
                    question.highlightedInfo || "",
                    ...(question.links || []).map(
                        (link) => link.label
                    ),
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

    // Abre o cierra una pregunta.
    const toggleQuestion = (questionId) => {
        setOpenQuestionId((currentId) =>
            currentId === questionId
                ? null
                : questionId
        );
    };

    // Cambia la categoría y cierra cualquier pregunta abierta.
    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        setOpenQuestionId(null);
    };

    // Limpia todos los filtros.
    const clearFilters = () => {
        setSearchTerm("");
        setSelectedCategory("Todos");
        setOpenQuestionId(null);
    };

    return (
        <>
            <Header />

            <main className="faq-page">
                {/* Hero principal. */}
                <section className="faq-hero">
                    <div className="faq-hero__overlay" />

                    <div className="faq-hero__container">
                        <nav
                            className="faq-breadcrumb"
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
                                Preguntas frecuentes
                            </span>
                        </nav>

                        <p className="faq-hero__eyebrow">
                            Información general
                        </p>

                        <h1>
                            Preguntas frecuentes
                        </h1>

                        <p className="faq-hero__description">
                            Encuentra respuestas sencillas
                            sobre reuniones, actividades,
                            primeras visitas, participación
                            y otros aspectos de nuestra
                            comunidad.
                        </p>
                    </div>

                    <div className="faq-hero__curve" />
                </section>

                {/* Buscador y filtros. */}
                <section className="faq-tools">
                    <div className="faq-tools__container">
                        <div className="faq-tools__heading">
                            <div>
                                <p className="faq-section__eyebrow">
                                    Resuelve tus dudas
                                </p>

                                <h2>
                                    ¿Qué deseas saber?
                                </h2>
                            </div>

                            <p>
                                Busca una palabra o selecciona
                                una categoría para encontrar
                                rápidamente la información
                                que necesitas.
                            </p>
                        </div>

                        {/* Campo de búsqueda. */}
                        <div className="faq-search">
                            <span
                                className="faq-search__icon"
                                aria-hidden="true"
                            >
                                ⌕
                            </span>

                            <input
                                type="search"
                                value={searchTerm}
                                onChange={(event) => {
                                    setSearchTerm(
                                        event.target.value
                                    );
                                    setOpenQuestionId(null);
                                }}
                                placeholder="Buscar una pregunta..."
                                aria-label="Buscar una pregunta frecuente"
                            />

                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchTerm("");
                                        setOpenQuestionId(
                                            null
                                        );
                                    }}
                                    aria-label="Limpiar búsqueda"
                                >
                                    ×
                                </button>
                            )}
                        </div>

                        {/* Filtros por categoría. */}
                        <div className="faq-filter-group">
                            <p>
                                Categorías
                            </p>

                            <div
                                className="faq-filters"
                                aria-label="Filtrar preguntas por categoría"
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
                                                        ? "faq-filter faq-filter--active"
                                                        : "faq-filter"
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

                {/* Listado de preguntas. */}
                <section className="faq-list">
                    <div className="faq-list__container">
                        <div className="faq-list__heading">
                            <div>
                                <p className="faq-section__eyebrow">
                                    Información disponible
                                </p>

                                <h2>
                                    Preguntas y respuestas
                                </h2>
                            </div>

                            <p className="faq-list__count">
                                {filteredQuestions.length}{" "}
                                {filteredQuestions.length === 1
                                    ? "pregunta encontrada"
                                    : "preguntas encontradas"}
                            </p>
                        </div>

                        {filteredQuestions.length > 0 ? (
                            <div className="faq-accordion">
                                {filteredQuestions.map(
                                    (item, index) => {
                                        const isOpen =
                                            openQuestionId ===
                                            item.id;

                                        const answerId =
                                            `${item.id}-answer`;

                                        const buttonId =
                                            `${item.id}-button`;

                                        return (
                                            <article
                                                key={item.id}
                                                className={
                                                    isOpen
                                                        ? "faq-item faq-item--open"
                                                        : "faq-item"
                                                }
                                            >
                                                <h3 className="faq-item__heading">
                                                    <button
                                                        id={
                                                            buttonId
                                                        }
                                                        type="button"
                                                        className="faq-item__button"
                                                        onClick={() =>
                                                            toggleQuestion(
                                                                item.id
                                                            )
                                                        }
                                                        aria-expanded={
                                                            isOpen
                                                        }
                                                        aria-controls={
                                                            answerId
                                                        }
                                                    >
                                                        <span className="faq-item__number">
                                                            {String(
                                                                index +
                                                                    1
                                                            ).padStart(
                                                                2,
                                                                "0"
                                                            )}
                                                        </span>

                                                        <span className="faq-item__question">
                                                            {
                                                                item.question
                                                            }
                                                        </span>

                                                        <span
                                                            className="faq-item__icon"
                                                            aria-hidden="true"
                                                        >
                                                            +
                                                        </span>
                                                    </button>
                                                </h3>

                                                <div
                                                    id={answerId}
                                                    className="faq-item__answer"
                                                    role="region"
                                                    aria-labelledby={
                                                        buttonId
                                                    }
                                                    hidden={!isOpen}
                                                >
                                                    <div className="faq-item__answer-inner">
                                                        <span className="faq-item__category">
                                                            {
                                                                item.category
                                                            }
                                                        </span>

                                                        <div className="faq-item__paragraphs">
                                                            {item.answer.map(
                                                                (
                                                                    paragraph,
                                                                    paragraphIndex
                                                                ) => (
                                                                    <p
                                                                        key={`${item.id}-paragraph-${paragraphIndex}`}
                                                                    >
                                                                        {
                                                                            paragraph
                                                                        }
                                                                    </p>
                                                                )
                                                            )}
                                                        </div>

                                                        {item.highlightedInfo && (
                                                            <aside className="faq-item__highlight">
                                                                <p>
                                                                    Información
                                                                    importante
                                                                </p>

                                                                <span>
                                                                    {
                                                                        item.highlightedInfo
                                                                    }
                                                                </span>
                                                            </aside>
                                                        )}

                                                        {item.links.length >
                                                            0 && (
                                                            <div className="faq-item__links">
                                                                {item.links.map(
                                                                    (
                                                                        link
                                                                    ) => (
                                                                        <Link
                                                                            key={`${item.id}-${link.path}-${link.label}`}
                                                                            to={
                                                                                link.path
                                                                            }
                                                                        >
                                                                            {
                                                                                link.label
                                                                            }

                                                                            <span
                                                                                aria-hidden="true"
                                                                            >
                                                                                →
                                                                            </span>
                                                                        </Link>
                                                                    )
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </article>
                                        );
                                    }
                                )}
                            </div>
                        ) : (
                            <div className="faq-empty">
                                <p className="faq-empty__eyebrow">
                                    Sin resultados
                                </p>

                                <h3>
                                    No encontramos una respuesta
                                    relacionada
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

                {/* Sección final de contacto. */}
                <section className="faq-closing">
                    <div className="faq-closing__container">
                        <div>
                            <p className="faq-closing__eyebrow">
                                ¿No encontraste tu respuesta?
                            </p>

                            <h2>
                                Estamos disponibles para
                                orientarte
                            </h2>

                            <p>
                                Puedes comunicarte con la
                                iglesia para realizar una
                                consulta, solicitar información
                                o recibir orientación sobre una
                                reunión o actividad.
                            </p>
                        </div>

                        <Link to="/contacto">
                            Ir a Contacto
                        </Link>
                    </div>
                </section>
            </main>
        </>
    );
}

export default FrequentlyAskedQuestions;