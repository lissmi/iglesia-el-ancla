
import { useEffect, useState } from "react";

import {
    LibraryBig,
    SearchX,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import ResourceCard from "./ResourceCard";

import "../../../styles/components/administration/resources/ResourcesList.css";

// =========================================================
// CONFIGURACIÓN
// =========================================================

const PAGE_SIZE_OPTIONS = [6, 12, 24];

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function ResourcesList({
    resources = [],
    totalResources = 0,
    categoryName = "Todos los recursos",
    categoryLabels = {},
    onView,
    onEdit,
    onDelete,
}) {

    // =====================================================
    // PAGINACIÓN
    // =====================================================

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(6);

    const totalPages = Math.max(
        1,
        Math.ceil(resources.length / pageSize)
    );

    const safePage = Math.min(currentPage, totalPages);

    const startIndex = (safePage - 1) * pageSize;

    const paginatedResources = resources.slice(
        startIndex,
        startIndex + pageSize
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [resources, pageSize]);

    // =====================================================
    // INTERFAZ
    // =====================================================

    return (
        <section className="resources-list">

            {/* =========================================== */}
            {/* ENCABEZADO */}
            {/* =========================================== */}

            <div className="resources-list__heading">

                <div>
                    <h2>{categoryName}</h2>

                    <p>
                        Consulta y administra los recursos
                        registrados en esta sección.
                    </p>
                </div>

                <span className="resources-list__count">
                    {resources.length} resultados
                </span>

            </div>

            {/* =========================================== */}
            {/* LISTADO O ESTADO VACÍO */}
            {/* =========================================== */}

            {resources.length === 0 ? (

                <div className="resources-list__empty">

                    {totalResources === 0 ? (
                        <LibraryBig
                            size={35}
                            strokeWidth={1.5}
                            aria-hidden="true"
                        />
                    ) : (
                        <SearchX
                            size={35}
                            strokeWidth={1.5}
                            aria-hidden="true"
                        />
                    )}

                    <h3>
                        {totalResources === 0
                            ? "Todavía no hay recursos registrados"
                            : "No se encontraron recursos"}
                    </h3>

                    <p>
                        {totalResources === 0
                            ? "Utiliza el botón Nuevo recurso para comenzar a organizar los contenidos de la comunidad."
                            : "Prueba con otra categoría, búsqueda o estado para encontrar el contenido que necesitas."}
                    </p>

                </div>

            ) : (

                <>
                    <div className="resources-list__grid">

                        {paginatedResources.map((resource) => (
                            <ResourceCard
                                key={resource.id}
                                resource={resource}
                                categoryName={
                                    categoryLabels[resource.category]
                                }
                                onView={onView}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        ))}

                    </div>

                    {/* PAGINACIÓN */}

                    <div className="resources-list__pagination">

                        <div className="resources-list__page-info">

                            <span>
                                Mostrando {startIndex + 1}-
                                {Math.min(
                                    startIndex + pageSize,
                                    resources.length
                                )} de {resources.length}
                            </span>

                            <select
                                value={pageSize}
                                onChange={(event) =>
                                    setPageSize(Number(event.target.value))
                                }
                                aria-label="Recursos por página"
                            >
                                {PAGE_SIZE_OPTIONS.map((size) => (
                                    <option key={size} value={size}>
                                        {size} por página
                                    </option>
                                ))}
                            </select>

                        </div>

                        <div className="resources-list__page-controls">

                            <button
                                type="button"
                                disabled={safePage === 1}
                                onClick={() =>
                                    setCurrentPage(safePage - 1)
                                }
                                aria-label="Página anterior"
                            >
                                <ChevronLeft size={18} />
                            </button>

                            <span>
                                Página {safePage} de {totalPages}
                            </span>

                            <button
                                type="button"
                                disabled={safePage === totalPages}
                                onClick={() =>
                                    setCurrentPage(safePage + 1)
                                }
                                aria-label="Página siguiente"
                            >
                                <ChevronRight size={18} />
                            </button>

                        </div>

                    </div>
                </>

            )}

        </section>
    );
}

export default ResourcesList;
