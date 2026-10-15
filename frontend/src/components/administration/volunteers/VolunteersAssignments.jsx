// =========================================================
// IMPORTACIONES
// =========================================================

import {
    useEffect,
    useState,
} from "react";

import {
    ClipboardList,
    Plus,
    ChevronLeft,
    ChevronRight,
    CalendarX2,
} from "lucide-react";

// Importamos la tarjeta individual de asignación.
import VolunteerAssignmentCard from "./VolunteerAssignmentCard";

// Importamos los estilos exclusivos del componente.
import "../../../styles/components/administration/volunteers/VolunteersAssignments.css";


// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function VolunteersAssignments({
    assignments = [],
    volunteers = [],
    onView,
    onEdit,
    onDelete,
    onCreate,
}) {

    // =====================================================
    // ESTADOS
    // =====================================================

    const [currentPage, setCurrentPage] = useState(1);

    const [itemsPerPage, setItemsPerPage] = useState(6);


    // =====================================================
    // CONFIGURACIÓN DE PAGINACIÓN
    // =====================================================

    const totalAssignments = assignments.length;

    const totalPages = Math.max(
        1,
        Math.ceil(totalAssignments / itemsPerPage)
    );

    // Evita mostrar una página fuera del rango disponible.
    const safeCurrentPage = Math.min(
        currentPage,
        totalPages
    );

    const startIndex =
        (safeCurrentPage - 1) * itemsPerPage;

    const endIndex = startIndex + itemsPerPage;

    // Asignaciones correspondientes a la página actual.
    const paginatedAssignments = assignments.slice(
        startIndex,
        endIndex
    );


    // =====================================================
    // REINICIAR PAGINACIÓN
    // =====================================================

    // Al cambiar los filtros o la cantidad de elementos,
    // regresamos a la primera página.

    useEffect(() => {
        setCurrentPage(1);
    }, [assignments, itemsPerPage]);


    // =====================================================
    // NAVEGACIÓN ENTRE PÁGINAS
    // =====================================================

    const handlePreviousPage = () => {

        setCurrentPage((previousPage) =>
            Math.max(1, previousPage - 1)
        );

    };

    const handleNextPage = () => {

        setCurrentPage((previousPage) =>
            Math.min(totalPages, previousPage + 1)
        );

    };


    // =====================================================
    // CAMBIAR CANTIDAD DE ELEMENTOS
    // =====================================================

    const handleItemsPerPageChange = (event) => {

        const newValue = Number(event.target.value);

        setItemsPerPage(newValue);

        setCurrentPage(1);

    };


    // =====================================================
    // INTERFAZ PRINCIPAL
    // =====================================================

    return (
        <section
            className="volunteers-assignments"
            aria-labelledby="volunteers-assignments-title"
        >

            {/* =========================================== */}
            {/* ENCABEZADO */}
            {/* =========================================== */}

            <div className="volunteers-assignments__header">

                <div className="volunteers-assignments__heading">

                    <div className="volunteers-assignments__heading-icon">

                        <ClipboardList
                            size={21}
                            strokeWidth={1.8}
                            aria-hidden="true"
                        />

                    </div>

                    <div>

                        <h2 id="volunteers-assignments-title">
                            Asignaciones de servicio
                        </h2>

                        <p>
                            Administra los turnos, responsables
                            y confirmaciones de participación.
                        </p>

                    </div>

                </div>


                {/* TOTAL DE ASIGNACIONES */}

                <span className="volunteers-assignments__total">

                    {totalAssignments}{" "}

                    {totalAssignments === 1
                        ? "asignación"
                        : "asignaciones"}

                </span>

            </div>


            {/* =========================================== */}
            {/* CONTENIDO PRINCIPAL */}
            {/* =========================================== */}

            {totalAssignments === 0 ? (

                // =========================================
                // ESTADO VACÍO
                // =========================================

                <div className="volunteers-assignments__empty">

                    <div className="volunteers-assignments__empty-icon">

                        <CalendarX2
                            size={29}
                            strokeWidth={1.6}
                            aria-hidden="true"
                        />

                    </div>

                    <h3>
                        No se encontraron asignaciones
                    </h3>

                    <p>
                        Todavía no hay turnos registrados
                        o ninguna asignación coincide
                        con los filtros seleccionados.
                    </p>


                    {/* BOTÓN PARA CREAR ASIGNACIÓN */}

                    {onCreate && (

                        <button
                            type="button"
                            className="volunteers-assignments__create"
                            onClick={onCreate}
                        >

                            <Plus
                                size={17}
                                aria-hidden="true"
                            />

                            Nueva asignación

                        </button>

                    )}

                </div>

            ) : (

                <>

                    {/* =================================== */}
                    {/* LISTADO DE ASIGNACIONES */}
                    {/* =================================== */}

                    <div className="volunteers-assignments__list">

                        {paginatedAssignments.map((assignment) => (

                            <VolunteerAssignmentCard
                                key={assignment.id}
                                assignment={assignment}
                                volunteers={volunteers}
                                onView={onView}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />

                        ))}

                    </div>


                    {/* =================================== */}
                    {/* PAGINACIÓN */}
                    {/* =================================== */}

                    <div className="volunteers-assignments__pagination">

                        {/* INFORMACIÓN DE RESULTADOS */}

                        <div className="volunteers-assignments__pagination-info">

                            Mostrando{" "}

                            <strong>
                                {startIndex + 1}
                            </strong>

                            {" - "}

                            <strong>
                                {Math.min(
                                    endIndex,
                                    totalAssignments
                                )}
                            </strong>

                            {" de "}

                            <strong>
                                {totalAssignments}
                            </strong>

                        </div>


                        {/* CONTROLES DE PAGINACIÓN */}

                        <div className="volunteers-assignments__pagination-controls">

                            {/* CANTIDAD DE ELEMENTOS */}

                            <label htmlFor="volunteers-items-per-page">
                                Mostrar
                            </label>

                            <select
                                id="volunteers-items-per-page"
                                value={itemsPerPage}
                                onChange={handleItemsPerPageChange}
                            >

                                <option value={6}>
                                    6
                                </option>

                                <option value={12}>
                                    12
                                </option>

                                <option value={24}>
                                    24
                                </option>

                            </select>


                            {/* PÁGINA ANTERIOR */}

                            <button
                                type="button"
                                onClick={handlePreviousPage}
                                disabled={safeCurrentPage === 1}
                                aria-label="Página anterior"
                                title="Página anterior"
                            >

                                <ChevronLeft
                                    size={18}
                                    aria-hidden="true"
                                />

                            </button>


                            {/* INDICADOR DE PÁGINA */}

                            <span className="volunteers-assignments__page">

                                {safeCurrentPage}
                                {" / "}
                                {totalPages}

                            </span>


                            {/* PÁGINA SIGUIENTE */}

                            <button
                                type="button"
                                onClick={handleNextPage}
                                disabled={
                                    safeCurrentPage === totalPages
                                }
                                aria-label="Página siguiente"
                                title="Página siguiente"
                            >

                                <ChevronRight
                                    size={18}
                                    aria-hidden="true"
                                />

                            </button>

                        </div>

                    </div>

                </>

            )}

        </section>
    );
}

export default VolunteersAssignments;