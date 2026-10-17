
import { useMemo, useState } from "react";
import {
    useLocation,
    useNavigate,
    Link,
} from "react-router-dom";

import {
    FileText,
    Users,
    Mail,
    ShieldCheck,
    Search,
    Pencil,
    ExternalLink,
    Files,
    FilePenLine,
    Info,
    ChevronRight,
    ArrowLeft,
} from "lucide-react";


import {
    initialInformationalPages,
} from "../../data/informationalPages/informationalPagesDemoData";


import "../../styles/pages/administration/InformationalPages.css";

// =========================================================
// ICONOS DISPONIBLES
// =========================================================

const ICONS = {
    users: Users,
    mail: Mail,
    "file-text": FileText,
    "shield-check": ShieldCheck,
};

// =========================================================
// PÁGINAS INFORMATIVAS
// =========================================================

function InformationalPages() {

    const navigate = useNavigate();
    const location = useLocation();

    // =====================================================
    // CONTEXTO ADMINISTRATIVO
    // =====================================================

    const adminBasePath = location.pathname.startsWith(
        "/super-admin"
    )
        ? "/super-admin"
        : "/admin";

    // =====================================================
    // ESTADOS
    // =====================================================

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("Todas");

    // =====================================================
    // FILTRAR PÁGINAS
    // =====================================================

    const filteredPages = useMemo(() => {

        const normalizedSearch = search
            .trim()
            .toLocaleLowerCase("es");

        return initialInformationalPages.filter((page) => {

            const matchesSearch =
                page.title
                    .toLocaleLowerCase("es")
                    .includes(normalizedSearch) ||
                page.description
                    .toLocaleLowerCase("es")
                    .includes(normalizedSearch);

            const matchesCategory =
                category === "Todas" ||
                page.category === category;

            return matchesSearch && matchesCategory;
        });

    }, [search, category]);

    // =====================================================
    // ESTADÍSTICAS
    // =====================================================

    const totalPages = initialInformationalPages.length;

    const availableEditors = initialInformationalPages.filter(
        (page) =>
            [
                "nosotros",
                "contacto",
                "terminos-y-condiciones",
                "politica-de-privacidad",
            ].includes(page.slug) &&
            page.editable === true
    ).length;

    // =====================================================
    // NAVEGAR AL EDITOR
    // =====================================================

    const handleEdit = (slug) => {

        navigate(
            `${adminBasePath}/paginas-informativas/editar/${slug}`
        );
    };

    // =====================================================
    // RENDERIZADO
    // =====================================================

    return (
        <main className="informational-pages">

            {/* ======================================= */}
            {/* ENCABEZADO */}
            {/* ======================================= */}

            <header className="informational-pages__header">

                <div className="informational-pages__header-content">
                    {/* BOTÓN VOLVER AL PANEL ADMINISTRATIVO */}
                    <button
                        type="button"
                        className="informational-pages__back-button"
                        onClick={() => navigate(adminBasePath)}
                    >
                        <ArrowLeft size={17} />
                        <span>Volver al panel</span>
                    </button>

                    <span className="informational-pages__eyebrow">
                        Administración / Contenido
                    </span>

                    <h1 className="informational-pages__title">
                        Páginas informativas
                    </h1>

                    <p className="informational-pages__subtitle">
                        Administra la información institucional
                        y el contenido de las páginas públicas
                        de Iglesia El Ancla.
                    </p>

                </div>



                <div
                    className="informational-pages__header-icon"
                    aria-hidden="true"
                >
                    <Files size={30} strokeWidth={1.7} />
                </div>

            </header>

            {/* ======================================= */}
            {/* TARJETAS DE RESUMEN */}
            {/* ======================================= */}

            <section
                className="informational-pages__stats"
                aria-label="Resumen de páginas informativas"
            >

                <article className="informational-pages__stat">

                    <div className="informational-pages__stat-icon">
                        <Files size={22} />
                    </div>

                    <div>
                        <span className="informational-pages__stat-label">
                            Total de páginas
                        </span>

                        <strong className="informational-pages__stat-value">
                            {totalPages}
                        </strong>
                    </div>

                </article>

                <article className="informational-pages__stat">

                    <div className="informational-pages__stat-icon">
                        <FilePenLine size={22} />
                    </div>

                    <div>
                        <span className="informational-pages__stat-label">
                            Editores disponibles
                        </span>

                        <strong className="informational-pages__stat-value">
                            {availableEditors}
                        </strong>
                    </div>

                </article>

            </section>

            {/* ======================================= */}
            {/* INFORMACIÓN DEL MÓDULO */}
            {/* ======================================= */}

            <div
                className="informational-pages__notice"
                role="note"
            >
                <Info size={19} />

                <p>
                    Los editores de páginas informativas permiten
                    modificar y visualizar contenido de demostración.
                    Actualmente, los cambios se mantienen de forma
                    temporal y no se publican automáticamente.
                    La persistencia y publicación de contenidos
                    se implementarán mediante la integración
                    con el backend.
                </p>
            </div>

            {/* ======================================= */}
            {/* FILTROS Y BÚSQUEDA */}
            {/* ======================================= */}

            <section
                className="informational-pages__content"
                aria-label="Listado de páginas"
            >

                <div className="informational-pages__toolbar">

                    <div className="informational-pages__toolbar-heading">

                        <h2>
                            Listado de páginas
                        </h2>

                        <span>
                            {filteredPages.length} resultados
                        </span>

                    </div>

                    <div className="informational-pages__filters">

                        <label className="informational-pages__search">

                            <Search size={18} />

                            <span className="informational-pages__sr-only">
                                Buscar páginas
                            </span>

                            <input
                                type="search"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Buscar página..."
                            />

                        </label>

                        <label className="informational-pages__category">

                            <span className="informational-pages__sr-only">
                                Filtrar por categoría
                            </span>

                            <select
                                value={category}
                                onChange={(event) =>
                                    setCategory(event.target.value)
                                }
                            >
                                <option value="Todas">
                                    Todas las categorías
                                </option>

                                <option value="Institucional">
                                    Institucional
                                </option>

                                <option value="Comunicación">
                                    Comunicación
                                </option>

                                <option value="Legal">
                                    Legal
                                </option>
                            </select>

                        </label>

                    </div>

                </div>

                {/* =================================== */}
                {/* TARJETAS */}
                {/* =================================== */}

                <div className="informational-pages__list">

                    {filteredPages.map((page) => {

                        const PageIcon =
                            ICONS[page.icon] || FileText;

                        const canEdit =
                            [
                                "nosotros",
                                "contacto",
                                "terminos-y-condiciones",
                                "politica-de-privacidad",
                            ].includes(page.slug) &&
                            page.editable === true;

                        return (
                            <article
                                key={page.id}
                                className="informational-pages__item"
                            >

                                <div className="informational-pages__item-icon">
                                    <PageIcon
                                        size={25}
                                        strokeWidth={1.8}
                                    />
                                </div>

                                <div className="informational-pages__item-content">

                                    <div className="informational-pages__item-heading">

                                        <h3>
                                            {page.title}
                                        </h3>


                                        <span
                                            className={
                                                canEdit
                                                    ? "informational-pages__status informational-pages__status--available"
                                                    : "informational-pages__status informational-pages__status--pending"
                                            }
                                        >
                                            {canEdit
                                                ? "Editor disponible"
                                                : "Próximamente"}
                                        </span>


                                    </div>

                                    <p>
                                        {page.description}
                                    </p>

                                    <span className="informational-pages__item-category">
                                        {page.category}
                                    </span>

                                </div>

                                <div className="informational-pages__item-actions">

                                    {canEdit ? (

                                        <button
                                            type="button"
                                            className="informational-pages__edit-button"
                                            onClick={() =>
                                                handleEdit(page.slug)
                                            }
                                        >
                                            <Pencil size={16} />
                                            Editar
                                            <ChevronRight size={15} />
                                        </button>

                                    ) : (

                                        <button
                                            type="button"
                                            className="informational-pages__edit-button informational-pages__edit-button--disabled"
                                            disabled
                                            title="Editor aún no implementado"
                                        >
                                            <Pencil size={16} />
                                            Editar
                                        </button>

                                    )}

                                    {/* =================================== */}
                                    {/* ENLACES PARA VISUALIZAR PÁGINAS */}
                                    {/* =================================== */}

                                    {[
                                        "nosotros",
                                        "contacto",
                                        "terminos-y-condiciones",
                                        "politica-de-privacidad",
                                    ].includes(page.slug) && (

                                            <Link
                                                to={page.publicPath}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="informational-pages__view-link"
                                                aria-label={`Ver página ${page.title}`}
                                            >
                                                <ExternalLink size={16} />
                                                Ver página
                                            </Link>

                                        )}

                                </div>

                            </article>
                        );
                    })}

                    {/* =================================== */}
                    {/* SIN RESULTADOS */}
                    {/* =================================== */}

                    {filteredPages.length === 0 && (

                        <div className="informational-pages__empty">

                            <Search size={32} />

                            <h3>
                                No se encontraron páginas
                            </h3>

                            <p>
                                Prueba con otro término de búsqueda
                                o selecciona una categoría diferente.
                            </p>

                            <button
                                type="button"
                                onClick={() => {
                                    setSearch("");
                                    setCategory("Todas");
                                }}
                            >
                                Limpiar filtros
                            </button>

                        </div>

                    )}

                </div>

            </section>

        </main>
    );
}

export default InformationalPages;
