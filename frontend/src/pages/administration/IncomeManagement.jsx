// =========================================================
// IMPORTACIONES
// =========================================================

import {
    useMemo,
    useState,
    useEffect,
    useCallback,
    useRef,
} from "react";

import {
    AlertCircle,
    CheckCircle2,
    RefreshCw,
    LoaderCircle,
    X,
} from "lucide-react";


// =========================================================
// COMPONENTES DE GESTIÓN DE INGRESOS
// =========================================================

import IncomeHeader from "../../components/administration/income/IncomeHeader";

import IncomeSummary from "../../components/administration/income/IncomeSummary";

import IncomeDashboard from "../../components/administration/income/IncomeDashboard";

import IncomeCategories from "../../components/administration/income/IncomeCategories";

import IncomeToolbar from "../../components/administration/income/IncomeToolbar";

import IncomeList from "../../components/administration/income/IncomeList";

import IncomeFormModal from "../../components/administration/income/IncomeFormModal";

import IncomeDetailsModal from "../../components/administration/income/IncomeDetailsModal";

import IncomeDeleteModal from "../../components/administration/income/IncomeDeleteModal";


// =========================================================
// ESTILOS
// =========================================================

// Compartimos una sola instancia Axios desde services/api.js.
import {
    listIncomes,
    createIncome,
    updateIncome,
    archiveIncome,
    incomeApiError,
} from "../../services/incomesApi";

import "../../styles/pages/administration/IncomeManagement.css";
import "../../styles/components/administration/income/IncomeDataState.css";


// =========================================================
// FECHA LOCAL (NECESARIA PARA FILTROS POR PERÍODO)
// =========================================================

// Conservamos esta utilidad original para «Hoy» y «Esta semana».
const getLocalDate = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};


// =========================================================
// VALORES INICIALES DE FILTROS
// =========================================================

const INITIAL_FILTERS = {
    searchTerm: "",
    categoryFilter: "all",
    periodFilter: "all",
    paymentFilter: "all",
    sortBy: "date_desc",
    startDate: "",
    endDate: "",
};


// =========================================================
// NORMALIZAR TEXTO PARA BÚSQUEDA
// =========================================================

const normalizeText = (value) => {

    return String(value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

};


// =========================================================
// OBTENER INICIO DE SEMANA
// =========================================================

// Se considera el lunes como primer día.

const getWeekStart = () => {

    const date = new Date();

    const day = date.getDay();

    const daysSinceMonday =
        (day + 6) % 7;

    date.setDate(
        date.getDate() - daysSinceMonday
    );

    return getLocalDate(date);

};


// =========================================================
// COMPROBAR PERÍODO
// =========================================================

const matchesPeriod = (date, filters) => {

    if (filters.periodFilter === "all") {
        return true;
    }

    const today = getLocalDate();

    if (filters.periodFilter === "today") {

        return date === today;

    }

    if (filters.periodFilter === "week") {

        return (
            date >= getWeekStart() &&
            date <= today
        );

    }

    if (filters.periodFilter === "month") {

        return (
            date.slice(0, 7) ===
            today.slice(0, 7)
        );

    }

    if (filters.periodFilter === "year") {

        return (
            date.slice(0, 4) ===
            today.slice(0, 4)
        );

    }

    if (filters.periodFilter === "custom") {

        if (
            filters.startDate &&
            date < filters.startDate
        ) {
            return false;
        }

        if (
            filters.endDate &&
            date > filters.endDate
        ) {
            return false;
        }

        return true;

    }

    return true;

};


// =========================================================
// ORDENAR INGRESOS
// =========================================================

const sortIncomes = (incomes, sortBy) => {

    const sorted = [...incomes];

    switch (sortBy) {

        case "date_asc":

            return sorted.sort(
                (a, b) =>
                    a.date.localeCompare(b.date)
            );


        case "amount_desc":

            return sorted.sort(
                (a, b) =>
                    Number(b.amount) -
                    Number(a.amount)
            );


        case "amount_asc":

            return sorted.sort(
                (a, b) =>
                    Number(a.amount) -
                    Number(b.amount)
            );


        case "concept_asc":

            return sorted.sort(
                (a, b) =>
                    a.concept.localeCompare(
                        b.concept,
                        "es"
                    )
            );


        case "concept_desc":

            return sorted.sort(
                (a, b) =>
                    b.concept.localeCompare(
                        a.concept,
                        "es"
                    )
            );


        case "date_desc":
        default:

            return sorted.sort(
                (a, b) =>
                    b.date.localeCompare(a.date)
            );

    }

};


// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function IncomeManagement() {

    // =====================================================
    // ESTADO DE INGRESOS
    // =====================================================

    // Nunca inicializamos montos financieros con datos ficticios.
    const [incomes, setIncomes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    // Leemos el listado REAL del backend. Soporta cancelación al desmontar.
    const loadIncomes = useCallback(async (signal) => {
        setIsLoading(true);
        setLoadError("");
        try {
            const actual = await listIncomes(signal);
            if (signal?.aborted) return;
            setIncomes(actual);
        } catch (error) {
            // Un fallo de red no puede confundirse con ingresos en cero.
            if (signal?.aborted || error?.code === "ERR_CANCELED") return;
            setLoadError(incomeApiError(error));
        } finally {
            if (!signal?.aborted) setIsLoading(false);
        }
    }, []);

    // La PWA consulta MongoDB a través de Express al montar la página.
    useEffect(() => {
        const controller = new AbortController();
        loadIncomes(controller.signal);
        return () => controller.abort();
    }, [loadIncomes]);


    // =====================================================
    // ESTADO DE FILTROS
    // =====================================================

    const [filters, setFilters] = useState(
        INITIAL_FILTERS
    );


    // =====================================================
    // ESTADO DE SELECCIÓN
    // =====================================================

    const [selectedIncome, setSelectedIncome] =
        useState(null);


    // =====================================================
    // ESTADOS DE MODALES
    // =====================================================

    const [isFormModalOpen, setIsFormModalOpen] =
        useState(false);

    const [isDetailsModalOpen, setIsDetailsModalOpen] =
        useState(false);

    const [isDeleteModalOpen, setIsDeleteModalOpen] =
        useState(false);


    // =====================================================
    // ESTADOS DE PROCESAMIENTO
    // =====================================================

    const [isSavingIncome, setIsSavingIncome] =
        useState(false);

    // Bloqueo síncrono: evita dos envíos antes de que React actualice la vista.
    const savingRef = useRef(false);
    const deletingRef = useRef(false);

    const [isDeletingIncome, setIsDeletingIncome] =
        useState(false);


    // =====================================================
    // NOTIFICACIONES
    // =====================================================

    const [notification, setNotification] =
        useState(null);


    // =====================================================
    // ACTUALIZAR UN FILTRO
    // =====================================================

    const updateFilter = (name, value) => {

        setFilters((previous) => ({
            ...previous,
            [name]: value,
        }));

    };


    // =====================================================
    // LIMPIAR FILTROS
    // =====================================================

    const handleClearFilters = () => {

        setFilters({
            ...INITIAL_FILTERS,
        });

    };


    // =====================================================
    // FILTRAR Y ORDENAR INGRESOS
    // =====================================================

    const filteredIncomes = useMemo(() => {

        const search =
            normalizeText(filters.searchTerm);

        const results = incomes.filter((income) => {

            // ---------------------------------------------
            // BÚSQUEDA
            // ---------------------------------------------

            const searchableText = normalizeText(
                [
                    income.id,
                    income.concept,
                    income.reference,
                    income.responsible,
                ].join(" ")
            );

            if (
                search &&
                !searchableText.includes(search)
            ) {
                return false;
            }


            // ---------------------------------------------
            // CATEGORÍA
            // ---------------------------------------------

            if (
                filters.categoryFilter !== "all" &&
                income.category !==
                    filters.categoryFilter
            ) {
                return false;
            }


            // ---------------------------------------------
            // MEDIO DE RECEPCIÓN
            // ---------------------------------------------

            if (
                filters.paymentFilter !== "all" &&
                income.paymentMethod !==
                    filters.paymentFilter
            ) {
                return false;
            }


            // ---------------------------------------------
            // PERÍODO
            // ---------------------------------------------

            if (
                !matchesPeriod(
                    income.date,
                    filters
                )
            ) {
                return false;
            }

            return true;

        });

        return sortIncomes(
            results,
            filters.sortBy
        );

    }, [
        incomes,
        filters,
    ]);


    // =====================================================
    // IDENTIFICADOR DE FILTROS PARA PAGINACIÓN
    // =====================================================

    // Al cambiar filtros u orden, IncomeList se vuelve
    // a montar y comienza desde la primera página.
    //
    // Los cambios de registros por sí solos no
    // reinician innecesariamente la paginación.

    const listKey = JSON.stringify(filters);


    // =====================================================
    // MOSTRAR NOTIFICACIÓN
    // =====================================================

    const showNotification = (
        type,
        message
    ) => {

        setNotification({
            type,
            message,
        });

    };


    // =====================================================
    // ABRIR FORMULARIO DE CREACIÓN
    // =====================================================

    const handleCreateIncome = () => {

        setSelectedIncome(null);

        setIsFormModalOpen(true);

    };


    // =====================================================
    // ABRIR DETALLES
    // =====================================================

    const handleViewIncome = (income) => {

        setSelectedIncome(income);

        setIsDetailsModalOpen(true);

    };


    // =====================================================
    // ABRIR FORMULARIO DE EDICIÓN
    // =====================================================

    const handleEditIncome = (income) => {

        setIsDetailsModalOpen(false);

        setSelectedIncome(income);

        setIsFormModalOpen(true);

    };


    // =====================================================
    // ABRIR CONFIRMACIÓN DE ELIMINACIÓN
    // =====================================================

    const handleDeleteIncome = (income) => {

        setSelectedIncome(income);

        setIsDeleteModalOpen(true);

    };


    // =====================================================
    // CERRAR FORMULARIO
    // =====================================================

    const handleCloseForm = () => {

        if (isSavingIncome) {
            return;
        }

        setIsFormModalOpen(false);

        setSelectedIncome(null);

    };


    // =====================================================
    // CERRAR DETALLES
    // =====================================================

    const handleCloseDetails = () => {

        setIsDetailsModalOpen(false);

        setSelectedIncome(null);

    };


    // =====================================================
    // CERRAR ELIMINACIÓN
    // =====================================================

    const handleCloseDelete = () => {

        if (isDeletingIncome) {
            return;
        }

        setIsDeleteModalOpen(false);

        setSelectedIncome(null);

    };


    // =====================================================
    // GUARDAR INGRESO REAL EN MONGODB
    // =====================================================

    const handleSaveIncome = async (formData, editingIncome) => {
        if (savingRef.current) return false;
        savingRef.current = true;
        setIsSavingIncome(true);
        try {
            if (editingIncome) {
                // El servidor verifica permisos, montos y versión del registro.
                const id = editingIncome._id || editingIncome.id;
                const saved = await updateIncome(id, formData, editingIncome.version);
                setIncomes((previous) => previous.map((item) =>
                    (item._id || item.id) === id ? saved : item
                ));
                showNotification("success", "El ingreso se actualizó en MongoDB.");
            } else {
                // MongoDB genera el identificador; React no genera IDs financieros.
                const saved = await createIncome(formData);
                setIncomes((previous) => [saved, ...previous]);
                showNotification("success", "El ingreso se registró en MongoDB.");
            }
            setIsFormModalOpen(false);
            setSelectedIncome(null);
            return true;
        } catch (error) {
            showNotification("error", incomeApiError(error));
            return false;
        } finally {
            savingRef.current = false;
            setIsSavingIncome(false);
        }
    };

    // =====================================================
    // ARCHIVADO LÓGICO (NO BORRADO FÍSICO)
    // =====================================================

    const handleConfirmDelete = async (income) => {
        if (deletingRef.current) return false;
        deletingRef.current = true;
        setIsDeletingIncome(true);
        try {
            const id = income._id || income.id;
            // Solo pendientes o anulados pueden archivarse.
            await archiveIncome(id, income.version);
            setIncomes((previous) => previous.filter(
                (item) => (item._id || item.id) !== id
            ));
            setIsDeleteModalOpen(false);
            setSelectedIncome(null);
            showNotification("success", "Ingreso retirado del listado. Su historial permanece en MongoDB.");
            return true;
        } catch (error) {
            const message = incomeApiError(error);
            showNotification("error", message);
            // Permite mostrar el motivo exacto dentro del modal.
            throw new Error(message);
        } finally {
            deletingRef.current = false;
            setIsDeletingIncome(false);
        }
    };


    // =====================================================
    // INTERFAZ
    // =====================================================

    return (
        <main className="income-management">

            <div className="income-management__container">

                {/* ======================================= */}
                {/* ENCABEZADO */}
                {/* ======================================= */}

                <IncomeHeader
                    onCreateIncome={isLoading || loadError ? undefined : handleCreateIncome}
                />


                {/* ======================================= */}
                {/* NOTIFICACIÓN */}
                {/* ======================================= */}

                {notification && (

                    <div
                        className={
                            "income-management__notification " +
                            `income-management__notification--${notification.type}`
                        }
                        role="status"
                    >

                        <div className="income-management__notification-content">

                            {notification.type === "success" ? (

                                <CheckCircle2
                                    size={19}
                                    aria-hidden="true"
                                />

                            ) : (

                                <AlertCircle
                                    size={19}
                                    aria-hidden="true"
                                />

                            )}

                            <span>
                                {notification.message}
                            </span>

                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                setNotification(null)
                            }
                            aria-label="Cerrar notificación"
                        >

                            <X
                                size={17}
                                aria-hidden="true"
                            />

                        </button>

                    </div>

                )}


                {/* No mostramos $0 como si fuera real si la API no respondió. */}
                {isLoading ? (
                    <section className="income-management__data-state" role="status">
                        <LoaderCircle size={28} className="income-management__data-spinner" aria-hidden="true" />
                        <h2>Cargando ingresos</h2>
                        <p>Consultando los movimientos registrados en MongoDB.</p>
                    </section>
                ) : loadError ? (
                    <section className="income-management__data-state income-management__data-state--error" role="alert">
                        <AlertCircle size={27} aria-hidden="true" />
                        <h2>No se pudieron cargar los ingresos</h2>
                        <p>{loadError}</p>
                        <button type="button" onClick={() => loadIncomes()}>
                            <RefreshCw size={17} aria-hidden="true" />
                            Reintentar consulta
                        </button>
                    </section>
                ) : (
                    <>
                {/* ======================================= */}
                {/* RESUMEN FINANCIERO */}
                {/* ======================================= */}

                <section className="income-management__section">

                    <IncomeSummary
                        incomes={incomes}
                    />

                </section>


                {/* ======================================= */}
                {/* GRÁFICOS Y ESTADÍSTICAS */}
                {/* ======================================= */}

                <section className="income-management__section">

                    <IncomeDashboard
                        incomes={incomes}
                    />

                </section>


                {/* ======================================= */}
                {/* CATEGORÍAS DE INGRESOS */}
                {/* ======================================= */}

                <section className="income-management__section">

                    <IncomeCategories
                        incomes={incomes}
                    />

                </section>


                {/* ======================================= */}
                {/* FILTROS */}
                {/* ======================================= */}

                <section className="income-management__section">

                    <IncomeToolbar

                        searchTerm={filters.searchTerm}
                        onSearchChange={(value) =>
                            updateFilter(
                                "searchTerm",
                                value
                            )
                        }

                        categoryFilter={filters.categoryFilter}
                        onCategoryChange={(value) =>
                            updateFilter(
                                "categoryFilter",
                                value
                            )
                        }

                        periodFilter={filters.periodFilter}
                        onPeriodChange={(value) =>
                            updateFilter(
                                "periodFilter",
                                value
                            )
                        }

                        paymentFilter={filters.paymentFilter}
                        onPaymentChange={(value) =>
                            updateFilter(
                                "paymentFilter",
                                value
                            )
                        }

                        sortBy={filters.sortBy}
                        onSortChange={(value) =>
                            updateFilter(
                                "sortBy",
                                value
                            )
                        }

                        startDate={filters.startDate}
                        onStartDateChange={(value) =>
                            updateFilter(
                                "startDate",
                                value
                            )
                        }

                        endDate={filters.endDate}
                        onEndDateChange={(value) =>
                            updateFilter(
                                "endDate",
                                value
                            )
                        }

                        resultsCount={filteredIncomes.length}
                        totalCount={incomes.length}

                        onClearFilters={handleClearFilters}

                    />

                </section>


                {/* ======================================= */}
                {/* LISTADO DE INGRESOS */}
                {/* ======================================= */}

                <section className="income-management__section">

                    <IncomeList

                        key={listKey}

                        incomes={filteredIncomes}

                        totalCount={incomes.length}

                        onView={handleViewIncome}

                        onEdit={handleEditIncome}

                        onDelete={handleDeleteIncome}

                        onCreate={handleCreateIncome}

                    />

                </section>
                    </>
                )}

            </div>


            {/* =========================================== */}
            {/* MODAL DE REGISTRO Y EDICIÓN */}
            {/* =========================================== */}

            <IncomeFormModal

                isOpen={isFormModalOpen}

                income={
                    isFormModalOpen
                        ? selectedIncome
                        : null
                }

                onClose={handleCloseForm}

                onSave={handleSaveIncome}

                isSaving={isSavingIncome}

            />


            {/* =========================================== */}
            {/* MODAL DE DETALLES */}
            {/* =========================================== */}

            <IncomeDetailsModal

                isOpen={isDetailsModalOpen}

                income={
                    isDetailsModalOpen
                        ? selectedIncome
                        : null
                }

                onClose={handleCloseDetails}

                onEdit={handleEditIncome}

            />


            {/* =========================================== */}
            {/* MODAL DE ELIMINACIÓN */}
            {/* =========================================== */}

            <IncomeDeleteModal

                isOpen={isDeleteModalOpen}

                income={
                    isDeleteModalOpen
                        ? selectedIncome
                        : null
                }

                onClose={handleCloseDelete}

                onConfirm={handleConfirmDelete}

                isDeleting={isDeletingIncome}

            />

        </main>
    );
}

export default IncomeManagement;