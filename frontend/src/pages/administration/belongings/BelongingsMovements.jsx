
import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import {
    ArrowLeft,
    ArrowLeftRight,
    ClipboardCheck,
    ClipboardList,
    FilePlus2,
    Search,
    Eye,
    Pencil,
    Trash2,
    X,
    AlertTriangle,
} from "lucide-react";

import BelongingMovementModal from "../../../components/administration/belongings/BelongingMovementModal";

import { useBelongings } from "../../../context/belongings/BelongingsContext";

import {
    belongingsMovementTypes,
    belongingsLocations,
    belongingsConditions,
} from "../../../data/belongings/belongingsDemoData";

import "../../../styles/pages/administration/belongings/BelongingsMovements.css";

// =========================================================
// MOVIMIENTOS DEL INVENTARIO - IGLESIA EL ANCLA
// =========================================================

function BelongingsMovements() {
    const location = useLocation();

    const adminBasePath = location.pathname.startsWith("/super-admin")
        ? "/super-admin"
        : "/admin";

    const dashboardPath = `${adminBasePath}/inventario-bienes`;

    // =====================================================
    // CONTEXTO COMPARTIDO
    // =====================================================

    const {
        movements,
        belongings,
        registerMovement,
        updateMovement,
        deleteMovement,
    } = useBelongings();

    // =====================================================
    // ESTADOS
    // =====================================================

    const [search, setSearch] = useState("");
    const [movementType, setMovementType] = useState("");

    const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);

    const [viewingMovement, setViewingMovement] = useState(null);
    const [editingMovement, setEditingMovement] = useState(null);
    const [deletingMovement, setDeletingMovement] = useState(null);

    const [editForm, setEditForm] = useState({
        date: "",
        performedBy: "",
        description: "",
        destinationLocationId: "",
        condition: "",
    });

    const [actionError, setActionError] = useState("");

    // =====================================================
    // FUNCIONES AUXILIARES
    // =====================================================

    const getBelonging = (belongingId) =>
        belongings.find((item) => item.id === belongingId);

    const getLocationName = (id) =>
        belongingsLocations.find((item) => item.id === id)?.name ||
        "Sin ubicación";

    const getConditionName = (value) =>
        belongingsConditions.find((item) => item.value === value)?.label ||
        "Sin estado";

    const formatDate = (value) => {
        if (!value) return "Sin fecha";

        const [year, month, day] = value.split("-");

        return year && month && day
            ? `${day}/${month}/${year}`
            : value;
    };

    const getMovementTypeName = (type) =>
        belongingsMovementTypes[type] || type;

    // =====================================================
    // CREAR MOVIMIENTO
    // =====================================================

    const handleOpenMovementModal = () => {
        setIsMovementModalOpen(true);
    };

    const handleCloseMovementModal = () => {
        setIsMovementModalOpen(false);
    };

    const handleSaveMovement = (movementData) => {
        return registerMovement(movementData);
    };

    // =====================================================
    // VER DETALLE
    // =====================================================

    const handleViewMovement = (movement) => {
        setViewingMovement(movement);
        setActionError("");
    };

    // =====================================================
    // EDITAR MOVIMIENTO
    // =====================================================

    const handleEditMovement = (movement) => {
        setViewingMovement(null);
        setEditingMovement(movement);

        setEditForm({
            date: movement.date || "",
            performedBy: movement.performedBy || "",
            description: movement.description || "",
            destinationLocationId: movement.destinationLocationId || "",
            condition: movement.newCondition || "",
        });

        setActionError("");
    };

    const handleEditFormChange = (event) => {
        const { name, value } = event.target;

        setEditForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSaveEdit = (event) => {
        event.preventDefault();

        if (!editingMovement) return;

        try {
            updateMovement(editingMovement.id, editForm);
            setEditingMovement(null);
            setActionError("");
        } catch (error) {
            setActionError(
                error.message || "No fue posible editar el movimiento."
            );
        }
    };

    // =====================================================
    // ELIMINAR MOVIMIENTO
    // =====================================================

    const handleDeleteMovement = (movement) => {
        setViewingMovement(null);
        setDeletingMovement(movement);
        setActionError("");
    };

    const handleConfirmDelete = () => {
        if (!deletingMovement) return;

        try {
            deleteMovement(deletingMovement.id);
            setDeletingMovement(null);
            setActionError("");
        } catch (error) {
            setActionError(
                error.message || "No fue posible eliminar el movimiento."
            );
        }
    };

    const handleCloseActionModal = () => {
        setViewingMovement(null);
        setEditingMovement(null);
        setDeletingMovement(null);
        setActionError("");
    };

    // =====================================================
    // FILTRADO Y ORDENAMIENTO
    // =====================================================

    const filteredMovements = useMemo(() => {
        const normalizedSearch = search.trim().toLocaleLowerCase("es");

        return movements
            .filter((movement) => {
                const belonging = belongings.find(
                    (item) => item.id === movement.belongingId
                );

                const searchableText = [
                    belonging?.name,
                    belonging?.code,
                    movement.id,
                    movement.performedBy,
                    movement.description,
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLocaleLowerCase("es");

                const matchesSearch =
                    !normalizedSearch ||
                    searchableText.includes(normalizedSearch);

                const matchesType =
                    !movementType ||
                    movement.type === movementType;

                return matchesSearch && matchesType;
            })
            .sort((first, second) =>
                (second.date || "").localeCompare(first.date || "") ||
                second.id.localeCompare(first.id)
            );
    }, [search, movementType, movements, belongings]);

    // =====================================================
    // INDICADORES
    // =====================================================

    const totalMovements = movements.length;

    const totalInspections = movements.filter(
        (item) => item.type === "inspection"
    ).length;

    const totalRegistrations = movements.filter(
        (item) => item.type === "registration"
    ).length;

    // =====================================================
    // DETALLE ADICIONAL SEGÚN EL TIPO
    // =====================================================

    const renderMovementDetails = (movement) => {
        if (movement.type === "transfer") {
            return (
                <>
                    <div>
                        <span>Ubicación de origen</span>
                        <strong>
                            {getLocationName(movement.originLocationId)}
                        </strong>
                    </div>

                    <div>
                        <span>Ubicación de destino</span>
                        <strong>
                            {getLocationName(movement.destinationLocationId)}
                        </strong>
                    </div>
                </>
            );
        }

        if (movement.type === "inspection") {
            return (
                <>
                    <div>
                        <span>Estado anterior</span>
                        <strong>
                            {getConditionName(movement.previousCondition)}
                        </strong>
                    </div>

                    <div>
                        <span>Estado registrado</span>
                        <strong>
                            {getConditionName(movement.newCondition)}
                        </strong>
                    </div>
                </>
            );
        }

        return null;
    };

    // =====================================================
    // RENDERIZADO
    // =====================================================

    return (
        <div className="belongings-movements">

            {/* ENCABEZADO */}

            <header className="belongings-movements__header">
                <div>
                    <Link
                        to={dashboardPath}
                        className="belongings-movements__back"
                    >
                        <ArrowLeft size={16} />
                        Volver al inventario de bienes
                    </Link>

                    <span className="belongings-movements__eyebrow">
                        Administración de bienes
                    </span>

                    <h1>Movimientos del inventario</h1>

                    <p>
                        Consulta y administra el historial de operaciones
                        realizadas sobre los bienes de la iglesia.
                    </p>
                </div>

                <button
                    type="button"
                    className="belongings-movements__add"
                    onClick={handleOpenMovementModal}
                >
                    <FilePlus2 size={18} />
                    Registrar movimiento
                </button>
            </header>

            {/* INDICADORES */}

            <section className="belongings-movements__stats">
                <article className="belongings-movements__stat">
                    <ArrowLeftRight size={22} />
                    <strong>{totalMovements}</strong>
                    <span>Movimientos registrados</span>
                </article>

                <article className="belongings-movements__stat">
                    <ClipboardCheck size={22} />
                    <strong>{totalInspections}</strong>
                    <span>Inspecciones</span>
                </article>

                <article className="belongings-movements__stat">
                    <ClipboardList size={22} />
                    <strong>{totalRegistrations}</strong>
                    <span>Registros iniciales</span>
                </article>
            </section>

            {/* FILTROS */}

            <section
                className="belongings-movements__filters"
                aria-label="Filtros de movimientos"
            >
                <div className="belongings-movements__search">
                    <Search size={18} />

                    <input
                        type="search"
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                        placeholder="Buscar por bien, código o responsable..."
                        aria-label="Buscar movimientos"
                    />
                </div>

                <select
                    value={movementType}
                    onChange={(event) =>
                        setMovementType(event.target.value)
                    }
                    aria-label="Filtrar por tipo de movimiento"
                >
                    <option value="">Todos los movimientos</option>

                    {Object.entries(belongingsMovementTypes).map(
                        ([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        )
                    )}
                </select>
            </section>

            {/* HISTORIAL */}

            <section className="belongings-movements__history">

                <div className="belongings-movements__history-header">
                    <h2>Historial de movimientos</h2>

                    <span>
                        {filteredMovements.length} resultados
                    </span>
                </div>

                {filteredMovements.length > 0 ? (
                    <div className="belongings-movements__table-scroll">
                        <table>
                            <thead>
                                <tr>
                                    <th scope="col">Fecha</th>
                                    <th scope="col">Movimiento</th>
                                    <th scope="col">Bien</th>
                                    <th scope="col">Cantidad</th>
                                    <th scope="col">Responsable</th>
                                    <th scope="col">Observación</th>
                                    <th scope="col">Acciones</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredMovements.map((movement) => {
                                    const belonging = getBelonging(
                                        movement.belongingId
                                    );

                                    return (
                                        <tr key={movement.id}>
                                            <td>
                                                {formatDate(movement.date)}
                                            </td>

                                            <td>
                                                <span className="belongings-movements__type">
                                                    {getMovementTypeName(
                                                        movement.type
                                                    )}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="belongings-movements__item">
                                                    <strong>
                                                        {belonging?.name ||
                                                            "Bien no encontrado"}
                                                    </strong>

                                                    <span>
                                                        {belonging?.code || "—"}
                                                    </span>
                                                </div>
                                            </td>

                                            <td>{movement.quantity}</td>

                                            <td>
                                                {movement.performedBy || "—"}
                                            </td>

                                            <td>
                                                {movement.description || "—"}
                                            </td>

                                            <td>
                                                <div className="belongings-movements__actions">

                                                    <button
                                                        type="button"
                                                        className="belongings-movements__action"
                                                        onClick={() =>
                                                            handleViewMovement(movement)
                                                        }
                                                        aria-label={`Ver movimiento ${movement.id}`}
                                                        title="Ver detalles"
                                                    >
                                                        <Eye size={17} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="belongings-movements__action"
                                                        onClick={() =>
                                                            handleEditMovement(movement)
                                                        }
                                                        aria-label={`Editar movimiento ${movement.id}`}
                                                        title="Editar movimiento"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="belongings-movements__action belongings-movements__action--delete"
                                                        onClick={() =>
                                                            handleDeleteMovement(movement)
                                                        }
                                                        aria-label={`Eliminar movimiento ${movement.id}`}
                                                        title="Eliminar movimiento"
                                                    >
                                                        <Trash2 size={17} />
                                                    </button>

                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="belongings-movements__empty">
                        <ArrowLeftRight size={32} />

                        <h3>No se encontraron movimientos</h3>

                        <p>
                            Modifica los filtros para consultar
                            otros registros del historial.
                        </p>
                    </div>
                )}

            </section>

            {/* AVISO */}

            <div className="belongings-movements__notice">
                Los movimientos mostrados corresponden a datos
                temporales de demostración.
            </div>

            {/* FORMULARIO DE REGISTRO EXISTENTE */}

            <BelongingMovementModal
                isOpen={isMovementModalOpen}
                belongings={belongings}
                onClose={handleCloseMovementModal}
                onSave={handleSaveMovement}
            />

            {/* MODAL: VER DETALLES */}

            {viewingMovement && (
                <div
                    className="belongings-movements__modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            handleCloseActionModal();
                        }
                    }}
                >
                    <div
                        className="belongings-movements__modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="movement-detail-title"
                    >
                        <div className="belongings-movements__modal-header">
                            <div>
                                <span className="belongings-movements__modal-eyebrow">
                                    {viewingMovement.id}
                                </span>
                                <h2 id="movement-detail-title">
                                    Detalle del movimiento
                                </h2>
                            </div>

                            <button
                                type="button"
                                className="belongings-movements__modal-close"
                                onClick={handleCloseActionModal}
                                aria-label="Cerrar"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="belongings-movements__detail-grid">
                            <div>
                                <span>Tipo de movimiento</span>
                                <strong>
                                    {getMovementTypeName(viewingMovement.type)}
                                </strong>
                            </div>

                            <div>
                                <span>Fecha</span>
                                <strong>
                                    {formatDate(viewingMovement.date)}
                                </strong>
                            </div>

                            <div>
                                <span>Bien</span>
                                <strong>
                                    {getBelonging(viewingMovement.belongingId)?.name ||
                                        "Bien no encontrado"}
                                </strong>
                            </div>

                            <div>
                                <span>Código del bien</span>
                                <strong>
                                    {getBelonging(viewingMovement.belongingId)?.code ||
                                        "—"}
                                </strong>
                            </div>

                            <div>
                                <span>Cantidad</span>
                                <strong>{viewingMovement.quantity}</strong>
                            </div>

                            <div>
                                <span>Responsable</span>
                                <strong>
                                    {viewingMovement.performedBy || "—"}
                                </strong>
                            </div>

                            {renderMovementDetails(viewingMovement)}
                        </div>

                        <div className="belongings-movements__detail-description">
                            <span>Observación</span>
                            <p>{viewingMovement.description || "Sin observación"}</p>
                        </div>

                        <div className="belongings-movements__modal-actions">
                            <button
                                type="button"
                                className="belongings-movements__button-secondary"
                                onClick={handleCloseActionModal}
                            >
                                Cerrar
                            </button>

                            <button
                                type="button"
                                className="belongings-movements__button-primary"
                                onClick={() =>
                                    handleEditMovement(viewingMovement)
                                }
                            >
                                <Pencil size={16} />
                                Editar movimiento
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: EDITAR MOVIMIENTO */}

            {editingMovement && (
                <div
                    className="belongings-movements__modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            handleCloseActionModal();
                        }
                    }}
                >
                    <div
                        className="belongings-movements__modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="movement-edit-title"
                    >
                        <div className="belongings-movements__modal-header">
                            <div>
                                <span className="belongings-movements__modal-eyebrow">
                                    {editingMovement.id}
                                </span>

                                <h2 id="movement-edit-title">
                                    Editar movimiento
                                </h2>
                            </div>

                            <button
                                type="button"
                                className="belongings-movements__modal-close"
                                onClick={handleCloseActionModal}
                                aria-label="Cerrar"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <p className="belongings-movements__modal-help">
                            Puedes corregir los datos del movimiento y, en traslados
                            e inspecciones, su destino o estado. Si el bien cambió
                            posteriormente, se actualizará solo el historial,
                            sin sobrescribir su ubicación o estado actual.
                        </p>

                        <form onSubmit={handleSaveEdit}>
                            <div className="belongings-movements__form-grid">

                                <label>
                                    Fecha del movimiento
                                    <input
                                        type="date"
                                        name="date"
                                        value={editForm.date}
                                        onChange={handleEditFormChange}
                                        required
                                    />
                                </label>

                                <label>
                                    Responsable
                                    <input
                                        type="text"
                                        name="performedBy"
                                        value={editForm.performedBy}
                                        onChange={handleEditFormChange}
                                        maxLength={120}
                                        required
                                    />
                                </label>

                                {editingMovement.type === "transfer" && (
                                    <label className="belongings-movements__form-full">
                                        Ubicación de destino
                                        <select
                                            name="destinationLocationId"
                                            value={editForm.destinationLocationId}
                                            onChange={handleEditFormChange}
                                            required
                                        >
                                            <option value="">Selecciona una ubicación</option>
                                            {belongingsLocations
                                                .filter((item) => item.id !== editingMovement.originLocationId)
                                                .map((item) => (
                                                    <option key={item.id} value={item.id}>
                                                        {item.name}
                                                    </option>
                                                ))}
                                        </select>
                                    </label>
                                )}

                                {editingMovement.type === "inspection" && (
                                    <label className="belongings-movements__form-full">
                                        Estado registrado
                                        <select
                                            name="condition"
                                            value={editForm.condition}
                                            onChange={handleEditFormChange}
                                            required
                                        >
                                            <option value="">Selecciona un estado</option>
                                            {belongingsConditions.map((item) => (
                                                <option key={item.value} value={item.value}>
                                                    {item.label}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                )}

                                <label className="belongings-movements__form-full">
                                    Observación
                                    <textarea
                                        name="description"
                                        value={editForm.description}
                                        onChange={handleEditFormChange}
                                        rows={4}
                                        maxLength={1000}
                                        required
                                    />
                                </label>
                            </div>

                            {actionError && (
                                <p
                                    className="belongings-movements__error"
                                    role="alert"
                                >
                                    {actionError}
                                </p>
                            )}

                            <div className="belongings-movements__modal-actions">
                                <button
                                    type="button"
                                    className="belongings-movements__button-secondary"
                                    onClick={handleCloseActionModal}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className="belongings-movements__button-primary"
                                >
                                    Guardar cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: ELIMINAR MOVIMIENTO */}

            {deletingMovement && (
                <div
                    className="belongings-movements__modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            handleCloseActionModal();
                        }
                    }}
                >
                    <div
                        className="belongings-movements__modal belongings-movements__modal--delete"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="movement-delete-title"
                    >
                        <div className="belongings-movements__modal-header">
                            <span className="belongings-movements__danger-icon">
                                <Trash2 size={22} />
                            </span>

                            <button
                                type="button"
                                className="belongings-movements__modal-close"
                                onClick={handleCloseActionModal}
                                aria-label="Cerrar"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <h2 id="movement-delete-title">
                            ¿Eliminar movimiento?
                        </h2>

                        <p>
                            Se eliminará permanentemente el registro
                            <strong> {deletingMovement.id}</strong> del historial.
                        </p>

                        <div className="belongings-movements__delete-summary">
                            <strong>
                                {getMovementTypeName(deletingMovement.type)}
                            </strong>

                            <span>
                                {getBelonging(deletingMovement.belongingId)?.name ||
                                    "Bien no encontrado"}
                            </span>

                            <span>
                                {formatDate(deletingMovement.date)}
                            </span>
                        </div>

                        {["transfer", "inspection"].includes(
                            deletingMovement.type
                        ) && (
                            <div className="belongings-movements__warning">
                                <AlertTriangle size={19} />
                                <p>
                                    Se eliminará el registro histórico.
                                    Esta acción no revertirá automáticamente
                                    la ubicación ni el estado actual del bien.
                                </p>
                            </div>
                        )}

                        {actionError && (
                            <p
                                className="belongings-movements__error"
                                role="alert"
                            >
                                {actionError}
                            </p>
                        )}

                        <div className="belongings-movements__modal-actions">
                            <button
                                type="button"
                                className="belongings-movements__button-secondary"
                                onClick={handleCloseActionModal}
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                className="belongings-movements__button-danger"
                                onClick={handleConfirmDelete}
                            >
                                <Trash2 size={17} />
                                Eliminar movimiento
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default BelongingsMovements;
