import { useMemo, useState } from "react";
import { useBelongings } from "../../../context/belongings/BelongingsContext";

import { ChevronLeft, ChevronRight, ClipboardList, PackagePlus, RefreshCw, SearchX, Trash2, X, AlertTriangle } from "lucide-react";
import BelongingsFilters from "../../../components/administration/belongings/BelongingsFilters";
import BelongingsTable from "../../../components/administration/belongings/BelongingsTable";
import BelongingFormModal from "../../../components/administration/belongings/BelongingFormModal";
import BelongingDetailModal from "../../../components/administration/belongings/BelongingDetailModal";

import {
    belongingsCategories,
    belongingsConditions,
} from "../../../data/belongings/belongingsDemoData";

import "../../../styles/pages/administration/belongings/BelongingsInventory.css";

// =========================================================
// INVENTARIO DE BIENES - LISTADO GENERAL
// IGLESIA EL ANCLA
// =========================================================

const ITEMS_PER_PAGE = 5;

function BelongingsInventory() {

    // =====================================================
    // ESTADOS DE FILTROS
    // =====================================================

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [condition, setCondition] = useState("");

    // =====================================================
    // ORDENAMIENTO Y PAGINACIÓN
    // =====================================================

    const [sortBy, setSortBy] = useState("name");
    const [sortDirection, setSortDirection] = useState("asc");
    const [currentPage, setCurrentPage] = useState(1);

    // =====================================================
    // FORMULARIOS Y MODALES
    // =====================================================

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingBelonging, setEditingBelonging] = useState(null);
    const [viewingBelonging, setViewingBelonging] = useState(null);

    // Bien seleccionado para eliminar.
    const [deletingBelonging, setDeletingBelonging] = useState(null);

    // Mensaje de error de eliminación.
    const [deleteError, setDeleteError] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    // =====================================================
    // CONTEXTO COMPARTIDO
    // =====================================================

    const {
        belongings,
        movements,
        loading, busy, error, reload,
        createBelonging,
        updateBelonging,
        deleteBelonging,
    } = useBelongings();

    // =====================================================
    // ACTUALIZACIÓN DE FILTROS
    // =====================================================

    const handleSearchChange = (value) => {
        setSearch(value);
        setCurrentPage(1);
    };

    const handleCategoryChange = (value) => {
        setCategory(value);
        setCurrentPage(1);
    };

    const handleConditionChange = (value) => {
        setCondition(value);
        setCurrentPage(1);
    };


    const handleResetFilters = () => {
        setSearch("");
        setCategory("");
        setCondition("");
        setCurrentPage(1);
    };

    // =====================================================
    // REGISTRAR BIEN
    // =====================================================

    const handleCreateBelonging = () => {
        setEditingBelonging(null);
        setIsFormOpen(true);
    };

    // =====================================================
    // EDITAR BIEN
    // =====================================================

    const handleEditBelonging = (belonging) => {
        setEditingBelonging(belonging);
        setIsFormOpen(true);
    };

    // =====================================================
    // VISUALIZAR BIEN
    // =====================================================

    const handleViewBelonging = (belonging) => {
        setViewingBelonging(belonging);
    };

    const handleCloseDetail = () => {
        setViewingBelonging(null);
    };

    const handleEditFromDetail = (belonging) => {
        setViewingBelonging(null);
        handleEditBelonging(belonging);
    };

    // =====================================================
    // CERRAR FORMULARIO
    // =====================================================

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingBelonging(null);
    };

    // =====================================================
    // GUARDAR BIEN
    // =====================================================

    // Guardamos en MongoDB antes de cerrar el formulario.
    // Si falla, el modal conserva la información para corregirla.
    const handleSaveBelonging = async (formData) => {
        if (editingBelonging) {
            await updateBelonging(editingBelonging.id, formData, editingBelonging.__v);
        } else {
            await createBelonging(formData);
            handleResetFilters();
            setSortBy("name");
            setSortDirection("asc");
        }
        handleCloseForm();
    };

    // =====================================================
    // ABRIR CONFIRMACIÓN DE ELIMINACIÓN
    // =====================================================

    const handleDeleteBelonging = (belonging) => {
        setDeletingBelonging(belonging);
        setDeleteError("");
    };

    // =====================================================
    // CERRAR CONFIRMACIÓN
    // =====================================================

    const handleCloseDelete = () => {
        if (isDeleting) return;
        setDeletingBelonging(null);
        setDeleteError("");
    };

    // =====================================================
    // COMPROBAR MOVIMIENTOS ASOCIADOS
    // =====================================================

    const hasAssociatedMovements = deletingBelonging
        ? movements.some(
            (movement) =>
                movement.belongingId === deletingBelonging.id
        )
        : false;


    // =====================================================
    // CONFIRMAR ELIMINACIÓN EN CASCADA
    // =====================================================

    const handleConfirmDelete = async () => {
        if (!deletingBelonging || isDeleting) return;
        setIsDeleting(true);
        setDeleteError("");
        try {
            await deleteBelonging(deletingBelonging.id);
            setCurrentPage(1);
            setDeletingBelonging(null);
        } catch (cause) {
            setDeleteError(cause?.message || "No fue posible eliminar el bien.");
        } finally {
            setIsDeleting(false);
        }
    };

    // =====================================================
    // ORDENAMIENTO
    // =====================================================

    const handleSort = (field) => {

        if (sortBy === field) {
            setSortDirection((previous) =>
                previous === "asc" ? "desc" : "asc"
            );
        } else {
            setSortBy(field);
            setSortDirection("asc");
        }

        setCurrentPage(1);
    };

    // =====================================================
    // FILTRADO Y ORDENAMIENTO
    // =====================================================

    const filteredBelongings = useMemo(() => {

        const normalizedSearch = search
            .trim()
            .toLocaleLowerCase("es");

        const results = belongings.filter((belonging) => {

            const matchesSearch =
                !normalizedSearch ||
                belonging.name
                    .toLocaleLowerCase("es")
                    .includes(normalizedSearch) ||
                belonging.code
                    .toLocaleLowerCase("es")
                    .includes(normalizedSearch);

            const matchesCategory =
                !category ||
                belonging.categoryId === category;

            const matchesCondition =
                !condition ||
                belonging.condition === condition;

            return (
                matchesSearch &&
                matchesCategory &&
                matchesCondition
            );
        });

        return results.sort((first, second) => {

            let comparison = 0;

            if (sortBy === "quantity") {
                comparison = first.quantity - second.quantity;
            } else {
                comparison = first.name.localeCompare(
                    second.name,
                    "es",
                    { sensitivity: "base" }
                );
            }

            return sortDirection === "asc"
                ? comparison
                : -comparison;
        });

    }, [
        belongings,
        search,
        category,
        condition,
        sortBy,
        sortDirection,
    ]);

    // =====================================================
    // PAGINACIÓN
    // =====================================================

    const totalResults = filteredBelongings.length;

    const totalPages = Math.max(
        1,
        Math.ceil(totalResults / ITEMS_PER_PAGE)
    );

    const safeCurrentPage = Math.min(
        currentPage,
        totalPages
    );

    const startIndex =
        (safeCurrentPage - 1) * ITEMS_PER_PAGE;

    const paginatedBelongings = filteredBelongings.slice(
        startIndex,
        startIndex + ITEMS_PER_PAGE
    );

    const firstVisible = totalResults === 0
        ? 0
        : startIndex + 1;

    const lastVisible = Math.min(
        startIndex + ITEMS_PER_PAGE,
        totalResults
    );

    const hasActiveFilters = Boolean(
        search || category || condition
    );

    // =====================================================
    // RENDERIZADO
    // =====================================================

    return (
        <div className="belongings-inventory">

            {/* ========================================= */}
            {/* ENCABEZADO */}
            {/* ========================================= */}

            <header className="belongings-inventory__header">

                <div className="belongings-inventory__heading">

                    

                    <span className="belongings-inventory__eyebrow">
                        Administración de bienes
                    </span>

                    <h1>Bienes registrados</h1>

                    <p>
                        Consulta el mobiliario, equipamiento,
                        instrumentos y materiales reutilizables
                        de Iglesia El Ancla.
                    </p>

                </div>

                {/* Acciones agrupadas dentro del encabezado. */}
                <div className="belongings-inventory__header-actions">
                    {/* Recargamos únicamente los datos, sin modificar el inventario. */}
                    <button
                        type="button"
                        className="belongings-inventory__refresh"
                        onClick={() => reload().catch(() => {})}
                        disabled={loading || busy}
                        aria-label={loading ? "Actualizando inventario" : "Actualizar inventario"}
                    >
                        <RefreshCw size={17} aria-hidden="true" className={loading ? "belongings-inventory__refresh-icon--loading" : ""} />
                        <span>{loading ? "Actualizando..." : "Actualizar inventario"}</span>
                    </button>

                    {/* Conservamos el botón original para registrar un bien. */}
                    <button
                        type="button"
                        className="belongings-inventory__add"
                        onClick={handleCreateBelonging}
                        disabled={loading || busy}
                    >
                        <PackagePlus size={18} aria-hidden="true" />
                        <span>Registrar bien</span>
                    </button>
                </div>

            </header>

            {/* ========================================= */}
            {/* FILTROS */}
            {/* ========================================= */}

            {error && <p role="alert" style={{ color: "#9d3c36", padding: "12px" }}>{error}</p>}
            <BelongingsFilters
                search={search}
                category={category}
                condition={condition}
                categories={belongingsCategories}
                conditions={belongingsConditions}
                onSearchChange={handleSearchChange}
                onCategoryChange={handleCategoryChange}
                onConditionChange={handleConditionChange}
                onReset={handleResetFilters}
            />

            {/* ========================================= */}
            {/* LISTADO */}
            {/* ========================================= */}

            <section
                className="belongings-inventory__results"
                aria-labelledby="belongings-results-title"
            >

                <div className="belongings-inventory__results-header">

                    <div className="belongings-inventory__results-title">

                        <span className="belongings-inventory__results-icon">
                            <ClipboardList size={19} />
                        </span>

                        <div>
                            <h2 id="belongings-results-title">
                                Inventario registrado
                            </h2>

                            <p>
                                {totalResults} {totalResults === 1
                                    ? "bien encontrado"
                                    : "bienes encontrados"}
                            </p>
                        </div>

                    </div>

                    <span className="belongings-inventory__total">
                        {belongings.length} registros totales
                    </span>

                </div>

                {/* ===================================== */}
                {/* TABLA O ESTADO VACÍO */}
                {/* ===================================== */}

                {loading ? (
                    <p role="status" style={{ padding: "20px" }}>Cargando bienes...</p>
                ) : error && belongings.length === 0 ? (
                    <p>No pudimos cargar el inventario. Utiliza Actualizar para intentarlo nuevamente.</p>
                ) : totalResults > 0 ? (

                    <BelongingsTable
                        belongings={paginatedBelongings}
                        categories={belongingsCategories}
                        conditions={belongingsConditions}
                        sortBy={sortBy}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                        onView={handleViewBelonging}
                        onEdit={handleEditBelonging}
                        onDelete={handleDeleteBelonging}
                    />

                ) : (

                    <div className="belongings-inventory__empty">

                        <SearchX size={34} strokeWidth={1.5} />

                        <h3>No se encontraron bienes</h3>

                        <p>
                            {hasActiveFilters
                                ? "Prueba con otros términos de búsqueda o modifica los filtros seleccionados."
                                : "Todavía no existen bienes registrados en el inventario."}
                        </p>

                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={handleResetFilters}
                            >
                                Limpiar filtros
                            </button>
                        )}

                    </div>

                )}

                {/* ===================================== */}
                {/* PAGINACIÓN */}
                {/* ===================================== */}

                {totalResults > 0 && (

                    <div className="belongings-inventory__pagination">

                        <p>
                            Mostrando{" "}
                            <strong>{firstVisible}</strong>
                            {" - "}
                            <strong>{lastVisible}</strong>
                            {" de "}
                            <strong>{totalResults}</strong>
                            {" registros"}
                        </p>

                        <div className="belongings-inventory__pagination-controls">

                            <button
                                type="button"
                                onClick={() =>
                                    setCurrentPage((previous) =>
                                        Math.max(1, previous - 1)
                                    )
                                }
                                disabled={safeCurrentPage === 1}
                                aria-label="Página anterior"
                            >
                                <ChevronLeft size={18} />
                            </button>

                            <span>
                                Página {safeCurrentPage} de {totalPages}
                            </span>

                            <button
                                type="button"
                                onClick={() =>
                                    setCurrentPage((previous) =>
                                        Math.min(totalPages, previous + 1)
                                    )
                                }
                                disabled={safeCurrentPage === totalPages}
                                aria-label="Página siguiente"
                            >
                                <ChevronRight size={18} />
                            </button>

                        </div>

                    </div>

                )}

            </section>

            {/* ========================================= */}
            {/* FORMULARIO */}
            {/* ========================================= */}

            <BelongingFormModal
                isOpen={isFormOpen}
                belonging={editingBelonging}
                onClose={handleCloseForm}
                onSave={handleSaveBelonging}
            />

            {/* ========================================= */}
            {/* DETALLE */}
            {/* ========================================= */}

            <BelongingDetailModal
                isOpen={Boolean(viewingBelonging)}
                belonging={viewingBelonging}
                onClose={handleCloseDetail}
                onEdit={handleEditFromDetail}
            />

            {/* ========================================= */}
            {/* CONFIRMACIÓN DE ELIMINACIÓN */}
            {/* ========================================= */}

            {deletingBelonging && (

                <div
                    className="belongings-inventory__delete-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            handleCloseDelete();
                        }
                    }}
                >

                    <div
                        className="belongings-inventory__delete-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-belonging-title"
                    >

                        <div className="belongings-inventory__delete-header">

                            <span className="belongings-inventory__delete-icon">
                                <Trash2 size={22} />
                            </span>

                            <button
                                type="button"
                                onClick={handleCloseDelete}
                                disabled={isDeleting}
                                aria-label="Cerrar confirmación"
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <h2 id="delete-belonging-title">
                            ¿Eliminar bien del inventario?
                        </h2>

                        <p>
                            Estás a punto de eliminar el siguiente bien:
                        </p>

                        <p>Esta acción es definitiva y no se puede deshacer.</p>
                        <div className="belongings-inventory__delete-item">
                            <strong>{deletingBelonging.name}</strong>
                            <span>{deletingBelonging.code}</span>
                        </div>


                        {hasAssociatedMovements && (

                            <div className="belongings-inventory__delete-warning">

                                <AlertTriangle size={19} />

                                <p>
                                    Este bien tiene movimientos registrados.
                                    Al eliminarlo, también se eliminará
                                    su historial de movimientos. No podrás deshacerlo.
                                </p>

                            </div>

                        )}


                        {deleteError && (
                            <p
                                className="belongings-inventory__delete-error"
                                role="alert"
                            >
                                {deleteError}
                            </p>
                        )}

                        <div className="belongings-inventory__delete-actions">

                            <button
                                type="button"
                                className="belongings-inventory__delete-cancel"
                                onClick={handleCloseDelete}
                                disabled={isDeleting}
                            >
                                Cancelar
                            </button>


                            <button
                                type="button"
                                className="belongings-inventory__delete-confirm"
                                onClick={handleConfirmDelete}
                            >
                                <Trash2 size={17} />
                                {isDeleting ? "Eliminando..." : "Eliminar bien definitivamente"}
                            </button>
                            


                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

export default BelongingsInventory;




