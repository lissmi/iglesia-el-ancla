
import {
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import "../../../styles/components/administration/members/MembersPagination.css";

// =========================================================
// COMPONENTE DE PAGINACIÓN
// =========================================================

function MembersPagination({
    currentPage,
    totalItems,
    pageSize,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [10, 20, 50],
    itemLabel = "miembros",
}) {

    // =====================================================
    // CÁLCULOS
    // =====================================================

    const totalPages = Math.max(
        1,
        Math.ceil(totalItems / pageSize)
    );

    const startItem =
        totalItems === 0
            ? 0
            : (currentPage - 1) * pageSize + 1;

    const endItem = Math.min(
        currentPage * pageSize,
        totalItems
    );

    const canGoPrevious = currentPage > 1;
    const canGoNext = currentPage < totalPages;

    // =====================================================
    // GENERAR NÚMEROS DE PÁGINA
    // =====================================================

    function getVisiblePages() {

        const pages = [];

        for (let page = 1; page <= totalPages; page++) {

            const isFirst = page === 1;
            const isLast = page === totalPages;

            const isNearCurrent =
                Math.abs(page - currentPage) <= 1;

            if (isFirst || isLast || isNearCurrent) {
                pages.push(page);
            }
        }

        // Insertamos separadores cuando hay saltos.
        const result = [];

        pages.forEach((page, index) => {

            if (index > 0) {

                const previous = pages[index - 1];

                if (page - previous > 1) {
                    result.push(`ellipsis-${previous}`);
                }
            }

            result.push(page);
        });

        return result;
    }

    const visiblePages = getVisiblePages();

    // =====================================================
    // INTERFAZ
    // =====================================================

    return (
        <nav
            className="members-pagination"
            aria-label="Paginación del directorio"
        >

            {/* =========================================== */}
            {/* INFORMACIÓN DE RESULTADOS */}
            {/* =========================================== */}

            <div className="members-pagination__information">

                <span>
                    Mostrando{" "}
                    <strong>{startItem}–{endItem}</strong>
                    {" "}de{" "}
                    <strong>{totalItems}</strong>
                    {" "}{itemLabel}
                </span>

            </div>

            {/* =========================================== */}
            {/* CONTROLES */}
            {/* =========================================== */}

            <div className="members-pagination__controls">

                {/* CANTIDAD POR PÁGINA */}

                <label className="members-pagination__page-size">

                    <span>Mostrar</span>

                    <select
                        value={pageSize}
                        onChange={(event) =>
                            onPageSizeChange(
                                Number(event.target.value)
                            )
                        }
                        aria-label="Miembros por página"
                    >
                        {pageSizeOptions.map((size) => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>

                </label>

                {/* BOTONES DE NAVEGACIÓN */}

                <div className="members-pagination__buttons">

                    <button
                        type="button"
                        onClick={() =>
                            onPageChange(currentPage - 1)
                        }
                        disabled={!canGoPrevious}
                        aria-label="Página anterior"
                    >
                        <ChevronLeft
                            size={17}
                            aria-hidden="true"
                        />
                    </button>

                    {visiblePages.map((page) => {

                        if (typeof page === "string") {
                            return (
                                <span
                                    className="members-pagination__ellipsis"
                                    key={page}
                                >
                                    …
                                </span>
                            );
                        }

                        return (
                            <button
                                type="button"
                                key={page}
                                className={
                                    currentPage === page
                                        ? "members-pagination__button--active"
                                        : ""
                                }
                                onClick={() => onPageChange(page)}
                                aria-label={`Página ${page}`}
                                aria-current={
                                    currentPage === page
                                        ? "page"
                                        : undefined
                                }
                            >
                                {page}
                            </button>
                        );
                    })}

                    <button
                        type="button"
                        onClick={() =>
                            onPageChange(currentPage + 1)
                        }
                        disabled={!canGoNext}
                        aria-label="Página siguiente"
                    >
                        <ChevronRight
                            size={17}
                            aria-hidden="true"
                        />
                    </button>

                </div>

            </div>

        </nav>
    );
}

export default MembersPagination;
