// =========================================================
// IMPORTACIONES
// =========================================================

import {
    useEffect,
    useState,
} from "react";

import {
    Clapperboard,
    ChevronLeft,
    ChevronRight,
    Plus,
} from "lucide-react";

// Importamos la tarjeta individual.
import RecommendationCard from "./RecommendationCard";

// Importamos los estilos exclusivos del componente.
import "../../../styles/components/administration/recommendations/RecommendationsList.css";


// =========================================================
// CONFIGURACIÓN DE PAGINACIÓN
// =========================================================

const PAGE_SIZE_OPTIONS = [6, 12, 24];


// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function RecommendationsList({
    recommendations = [],
    onView,
    onEdit,
    onDelete,
    onCreate,
}) {

    // =====================================================
    // ESTADOS
    // =====================================================

    const [currentPage, setCurrentPage] = useState(1);

    const [pageSize, setPageSize] = useState(6);


    // =====================================================
    // CÁLCULOS DE PAGINACIÓN
    // =====================================================

    const totalRecommendations = recommendations.length;

    const totalPages = Math.max(
        1,
        Math.ceil(totalRecommendations / pageSize)
    );

    const safeCurrentPage = Math.min(
        currentPage,
        totalPages
    );

    const startIndex = (safeCurrentPage - 1) * pageSize;

    const endIndex = Math.min(
        startIndex + pageSize,
        totalRecommendations
    );

    const paginatedRecommendations = recommendations.slice(
        startIndex,
        endIndex
    );


    // =====================================================
    // REINICIO DE PAGINACIÓN
    // =====================================================

    // Cuando cambia el conjunto de resultados, volvemos
    // a la primera página para evitar páginas vacías.
    useEffect(() => {
        setCurrentPage(1);
    }, [recommendations]);

    // Cuando cambia la cantidad por página,
    // también reiniciamos la navegación.
    function handlePageSizeChange(event) {
        setPageSize(Number(event.target.value));
        setCurrentPage(1);
    }


    // =====================================================
    // NAVEGACIÓN ENTRE PÁGINAS
    // =====================================================

    function handlePreviousPage() {
        setCurrentPage((previousPage) =>
            Math.max(1, previousPage - 1)
        );
    }

    function handleNextPage() {
        setCurrentPage((previousPage) =>
            Math.min(totalPages, previousPage + 1)
        );
    }


    // =====================================================
    // INTERFAZ
    // =====================================================

    return (
        <section
            className="recommendations-list"
            aria-labelledby="recommendations-list-title"
        >

            {/* =========================================== */}
            {/* ENCABEZADO */}
            {/* =========================================== */}

            <div className="recommendations-list__heading">

                <div>

                    <h2 id="recommendations-list-title">
                        Listado de recomendaciones
                    </h2>

                    <p>
                        Consulta y administra los contenidos
                        registrados para la comunidad.
                    </p>

                </div>

                <span className="recommendations-list__total">
                    {totalRecommendations}{" "}
                    {totalRecommendations === 1
                        ? "resultado"
                        : "resultados"}
                </span>

            </div>


            {/* =========================================== */}
            {/* RESULTADOS */}
            {/* =========================================== */}

            {totalRecommendations > 0 ? (
                <>

                    {/* Cuadrícula de tarjetas. */}
                    <div className="recommendations-list__grid">

                        {paginatedRecommendations.map(
                            (recommendation) => (
                                <RecommendationCard
                                    key={recommendation.id}
                                    recommendation={recommendation}
                                    onView={onView}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                />
                            )
                        )}

                    </div>


                    {/* =================================== */}
                    {/* PAGINACIÓN */}
                    {/* =================================== */}

                    <div className="recommendations-list__pagination">

                        {/* Cantidad de elementos por página. */}
                        <div className="recommendations-list__page-size">

                            <label htmlFor="recommendations-page-size">
                                Mostrar
                            </label>

                            <select
                                id="recommendations-page-size"
                                value={pageSize}
                                onChange={handlePageSizeChange}
                            >

                                {PAGE_SIZE_OPTIONS.map((option) => (
                                    <option
                                        key={option}
                                        value={option}
                                    >
                                        {option}
                                    </option>
                                ))}

                            </select>

                            <span>
                                por página
                            </span>

                        </div>


                        {/* Información de resultados. */}
                        <p className="recommendations-list__range">

                            Mostrando {startIndex + 1}–{endIndex} de{" "}
                            {totalRecommendations}

                        </p>


                        {/* Controles de navegación. */}
                        <div className="recommendations-list__navigation">

                            <button
                                className="recommendations-list__page-button"
                                type="button"
                                onClick={handlePreviousPage}
                                disabled={safeCurrentPage === 1}
                                aria-label="Página anterior"
                            >

                                <ChevronLeft
                                    size={18}
                                    aria-hidden="true"
                                />

                            </button>


                            <span className="recommendations-list__page-indicator">

                                Página {safeCurrentPage} de {totalPages}

                            </span>


                            <button
                                className="recommendations-list__page-button"
                                type="button"
                                onClick={handleNextPage}
                                disabled={safeCurrentPage === totalPages}
                                aria-label="Página siguiente"
                            >

                                <ChevronRight
                                    size={18}
                                    aria-hidden="true"
                                />

                            </button>

                        </div>

                    </div>

                </>
            ) : (

                // =========================================
                // ESTADO VACÍO
                // =========================================

                <div className="recommendations-list__empty">

                    <div className="recommendations-list__empty-icon">

                        <Clapperboard
                            size={31}
                            strokeWidth={1.5}
                            aria-hidden="true"
                        />

                    </div>

                    <h3>
                        No se encontraron recomendaciones
                    </h3>

                    <p>
                        Todavía no hay recomendaciones disponibles
                        con los criterios seleccionados.
                        Puedes modificar los filtros o registrar
                        un nuevo contenido.
                    </p>

                    <button
                        className="recommendations-list__create-button"
                        type="button"
                        onClick={() => onCreate?.()}
                        disabled={!onCreate}
                    >

                        <Plus
                            size={17}
                            aria-hidden="true"
                        />

                        Nueva recomendación

                    </button>

                </div>

            )}

        </section>
    );
}

export default RecommendationsList;