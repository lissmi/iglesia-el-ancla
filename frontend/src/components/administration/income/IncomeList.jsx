// =========================================================
// IMPORTACIONES
// =========================================================

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    ListOrdered,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    ReceiptText,
    SearchX,
    Plus,
} from "lucide-react";

import IncomeCard from "./IncomeCard";

import "../../../styles/components/administration/income/IncomeList.css";


// =========================================================
// CONFIGURACIÓN
// =========================================================

const PAGE_SIZE_OPTIONS = [6, 12, 24];


// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function IncomeList({

    incomes = [],

    totalCount,

    onView,
    onEdit,
    onDelete,
    onCreate,

}) {

    // =====================================================
    // ESTADOS DE PAGINACIÓN
    // =====================================================

    const [currentPage, setCurrentPage] = useState(1);

    const [pageSize, setPageSize] = useState(6);


    // =====================================================
    // INFORMACIÓN GENERAL
    // =====================================================

    const filteredCount = incomes.length;

    const allRecordsCount =
        typeof totalCount === "number"
            ? totalCount
            : filteredCount;

    const hasRecords = filteredCount > 0;

    const hasAnyRecords = allRecordsCount > 0;

    const isFilteredEmpty =
        !hasRecords && hasAnyRecords;


    // =====================================================
    // CALCULAR TOTAL DE PÁGINAS
    // =====================================================

    const totalPages = Math.max(
        1,
        Math.ceil(filteredCount / pageSize)
    );


    // =====================================================
    // AJUSTAR PÁGINA CUANDO CAMBIAN LOS RESULTADOS
    // =====================================================

    useEffect(() => {

        setCurrentPage((previousPage) =>
            Math.min(
                Math.max(1, previousPage),
                totalPages
            )
        );

    }, [totalPages]);


    // =====================================================
    // OBTENER REGISTROS DE LA PÁGINA ACTUAL
    // =====================================================

    const paginatedIncomes = useMemo(() => {

        const startIndex =
            (currentPage - 1) * pageSize;

        return incomes.slice(
            startIndex,
            startIndex + pageSize
        );

    }, [
        incomes,
        currentPage,
        pageSize,
    ]);


    // =====================================================
    // RANGO DE REGISTROS MOSTRADOS
    // =====================================================

    const firstRecord = hasRecords
        ? (currentPage - 1) * pageSize + 1
        : 0;

    const lastRecord = hasRecords
        ? Math.min(
            currentPage * pageSize,
            filteredCount
        )
        : 0;


    // =====================================================
    // CAMBIAR CANTIDAD POR PÁGINA
    // =====================================================

    const handlePageSizeChange = (event) => {

        const nextPageSize = Number(
            event.target.value
        );

        if (!PAGE_SIZE_OPTIONS.includes(nextPageSize)) {
            return;
        }

        setPageSize(nextPageSize);

        setCurrentPage(1);

    };


    // =====================================================
    // CAMBIAR DE PÁGINA
    // =====================================================

    const handlePageChange = (page) => {

        if (
            page < 1 ||
            page > totalPages ||
            page === currentPage
        ) {
            return;
        }

        setCurrentPage(page);

    };


    // =====================================================
    // NÚMEROS DE PÁGINA VISIBLES
    // =====================================================

    const visiblePages = useMemo(() => {

        const maxVisiblePages = 5;

        const halfWindow = Math.floor(
            maxVisiblePages / 2
        );

        let startPage = Math.max(
            1,
            currentPage - halfWindow
        );

        let endPage = Math.min(
            totalPages,
            startPage + maxVisiblePages - 1
        );

        startPage = Math.max(
            1,
            endPage - maxVisiblePages + 1
        );

        const pages = [];

        for (
            let page = startPage;
            page <= endPage;
            page += 1
        ) {

            pages.push(page);

        }

        return pages;

    }, [
        currentPage,
        totalPages,
    ]);


    // =====================================================
    // INTERFAZ
    // =====================================================

    return (
        <section
            className="income-list"
            aria-labelledby="income-list-title"
        >

            {/* =========================================== */}
            {/* ENCABEZADO */}
            {/* =========================================== */}

            <div className="income-list__header">

                <div className="income-list__heading">

                    <div className="income-list__heading-icon">

                        <ListOrdered
                            size={20}
                            aria-hidden="true"
                        />

                    </div>

                    <div>

                        <h2 id="income-list-title">
                            Listado de ingresos
                        </h2>

                        <p>
                            Consulta y administra los
                            movimientos financieros registrados.
                        </p>

                    </div>

                </div>

                <div className="income-list__count">

                    <ReceiptText
                        size={16}
                        aria-hidden="true"
                    />

                    <strong>
                        {filteredCount.toLocaleString("es-CL")}
                    </strong>

                    <span>
                        {filteredCount === 1
                            ? "registro"
                            : "registros"}
                    </span>

                </div>

            </div>


            {/* =========================================== */}
            {/* LISTADO CON REGISTROS */}
            {/* =========================================== */}

            {hasRecords ? (

                <>

                    {/* =================================== */}
                    {/* CONTROLES SUPERIORES */}
                    {/* =================================== */}

                    <div className="income-list__controls">

                        <p className="income-list__range">

                            Mostrando{" "}

                            <strong>
                                {firstRecord}
                            </strong>

                            {" – "}

                            <strong>
                                {lastRecord}
                            </strong>

                            {" de "}

                            <strong>
                                {filteredCount}
                            </strong>

                            {" ingresos"}

                        </p>


                        {/* =============================== */}
                        {/* CANTIDAD POR PÁGINA */}
                        {/* =============================== */}

                        <div className="income-list__page-size">

                            <label htmlFor="income-list-page-size">
                                Por página
                            </label>

                            <select
                                id="income-list-page-size"
                                value={pageSize}
                                onChange={handlePageSizeChange}
                            >

                                {PAGE_SIZE_OPTIONS.map((size) => (

                                    <option
                                        key={size}
                                        value={size}
                                    >
                                        {size}
                                    </option>

                                ))}

                            </select>

                        </div>

                    </div>


                    {/* =================================== */}
                    {/* TARJETAS DE INGRESOS */}
                    {/* =================================== */}

                    <div className="income-list__grid">

                        {paginatedIncomes.map((income) => (

                            <IncomeCard
                                key={
                                    income.id ||
                                    income._id
                                }
                                income={income}
                                onView={onView}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />

                        ))}

                    </div>


                    {/* =================================== */}
                    {/* PAGINACIÓN */}
                    {/* =================================== */}

                    {totalPages > 1 && (

                        <div className="income-list__pagination">

                            <div className="income-list__pagination-info">

                                Página{" "}

                                <strong>
                                    {currentPage}
                                </strong>

                                {" de "}

                                <strong>
                                    {totalPages}
                                </strong>

                            </div>


                            <nav
                                className="income-list__pagination-nav"
                                aria-label="Paginación de ingresos"
                            >

                                {/* ======================= */}
                                {/* PRIMERA PÁGINA */}
                                {/* ======================= */}

                                <button
                                    type="button"
                                    className="income-list__page-button"
                                    onClick={() =>
                                        handlePageChange(1)
                                    }
                                    disabled={currentPage === 1}
                                    aria-label="Ir a la primera página"
                                >

                                    <ChevronsLeft
                                        size={17}
                                        aria-hidden="true"
                                    />

                                </button>


                                {/* ======================= */}
                                {/* PÁGINA ANTERIOR */}
                                {/* ======================= */}

                                <button
                                    type="button"
                                    className="income-list__page-button"
                                    onClick={() =>
                                        handlePageChange(
                                            currentPage - 1
                                        )
                                    }
                                    disabled={currentPage === 1}
                                    aria-label="Ir a la página anterior"
                                >

                                    <ChevronLeft
                                        size={17}
                                        aria-hidden="true"
                                    />

                                </button>


                                {/* ======================= */}
                                {/* NÚMEROS DE PÁGINA */}
                                {/* ======================= */}

                                {visiblePages.map((page) => (

                                    <button
                                        key={page}
                                        type="button"
                                        className={
                                            "income-list__page-button " +
                                            (
                                                currentPage === page
                                                    ? "income-list__page-button--active"
                                                    : ""
                                            )
                                        }
                                        onClick={() =>
                                            handlePageChange(page)
                                        }
                                        aria-label={
                                            `Ir a la página ${page}`
                                        }
                                        aria-current={
                                            currentPage === page
                                                ? "page"
                                                : undefined
                                        }
                                    >
                                        {page}
                                    </button>

                                ))}


                                {/* ======================= */}
                                {/* PÁGINA SIGUIENTE */}
                                {/* ======================= */}

                                <button
                                    type="button"
                                    className="income-list__page-button"
                                    onClick={() =>
                                        handlePageChange(
                                            currentPage + 1
                                        )
                                    }
                                    disabled={
                                        currentPage === totalPages
                                    }
                                    aria-label="Ir a la página siguiente"
                                >

                                    <ChevronRight
                                        size={17}
                                        aria-hidden="true"
                                    />

                                </button>


                                {/* ======================= */}
                                {/* ÚLTIMA PÁGINA */}
                                {/* ======================= */}

                                <button
                                    type="button"
                                    className="income-list__page-button"
                                    onClick={() =>
                                        handlePageChange(totalPages)
                                    }
                                    disabled={
                                        currentPage === totalPages
                                    }
                                    aria-label="Ir a la última página"
                                >

                                    <ChevronsRight
                                        size={17}
                                        aria-hidden="true"
                                    />

                                </button>

                            </nav>

                        </div>

                    )}

                </>

            ) : (

                /* ======================================= */
                /* ESTADO VACÍO */
                /* ======================================= */

                <div className="income-list__empty">

                    <div className="income-list__empty-icon">

                        {isFilteredEmpty ? (

                            <SearchX
                                size={31}
                                strokeWidth={1.5}
                                aria-hidden="true"
                            />

                        ) : (

                            <ReceiptText
                                size={31}
                                strokeWidth={1.5}
                                aria-hidden="true"
                            />

                        )}

                    </div>


                    <h3>

                        {isFilteredEmpty
                            ? "No se encontraron ingresos"
                            : "Aún no hay ingresos registrados"}

                    </h3>


                    <p>

                        {isFilteredEmpty
                            ? "No existen movimientos que coincidan con los filtros seleccionados. Prueba modificando los criterios de búsqueda."
                            : "Comienza registrando los ingresos recibidos por la iglesia para visualizar los movimientos y sus indicadores financieros."}

                    </p>


                    {!isFilteredEmpty && onCreate && (

                        <button
                            type="button"
                            className="income-list__create"
                            onClick={onCreate}
                        >

                            <Plus
                                size={17}
                                aria-hidden="true"
                            />

                            Registrar primer ingreso

                        </button>

                    )}

                </div>

            )}

        </section>
    );
}

export default IncomeList;