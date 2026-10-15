// =========================================================
// IMPORTACIONES
// =========================================================

import {
    useMemo,
    useState,
} from "react";

import {
    AlertCircle,
    CheckCircle2,
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

import "../../styles/pages/administration/IncomeManagement.css";


// =========================================================
// FECHA LOCAL
// =========================================================

const getLocalDate = (date = new Date()) => {

    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;

};


// =========================================================
// RESTAR DÍAS A UNA FECHA
// =========================================================

const subtractDays = (days) => {

    const date = new Date();

    date.setHours(12, 0, 0, 0);

    date.setDate(
        date.getDate() - days
    );

    return getLocalDate(date);

};


// =========================================================
// DATOS TEMPORALES
// =========================================================

// Estos datos permiten probar el módulo mientras
// todavía no se conecta con MongoDB.
//
// No representan movimientos financieros reales
// de Iglesia El Ancla.

const INITIAL_INCOMES = [

    {
        id: "INC-001",
        concept: "Ofrenda general",
        category: "offerings",
        amount: 185000,
        date: subtractDays(1),
        paymentMethod: "cash",
        status: "received",
        reference: "",
        responsible: "Administración",
        notes: "Registro de prueba.",
    },

    {
        id: "INC-002",
        concept: "Diezmos de miembros",
        category: "tithes",
        amount: 320000,
        date: subtractDays(2),
        paymentMethod: "transfer",
        status: "received",
        reference: "TRX-002",
        responsible: "Tesorería",
        notes: "",
    },

    {
        id: "INC-003",
        concept: "Donación especial",
        category: "donations",
        amount: 95000,
        date: subtractDays(4),
        paymentMethod: "transfer",
        status: "received",
        reference: "TRX-003",
        responsible: "Tesorería",
        notes: "Aporte voluntario.",
    },

    {
        id: "INC-004",
        concept: "Actividad comunitaria",
        category: "activities",
        amount: 78000,
        date: subtractDays(6),
        paymentMethod: "cash",
        status: "received",
        reference: "",
        responsible: "Administración",
        notes: "",
    },

    {
        id: "INC-005",
        concept: "Ofrenda de reunión",
        category: "offerings",
        amount: 112000,
        date: subtractDays(8),
        paymentMethod: "cash",
        status: "received",
        reference: "",
        responsible: "Tesorería",
        notes: "",
    },

    {
        id: "INC-006",
        concept: "Diezmo mensual",
        category: "tithes",
        amount: 145000,
        date: subtractDays(11),
        paymentMethod: "transfer",
        status: "received",
        reference: "TRX-006",
        responsible: "Administración",
        notes: "",
    },

    {
        id: "INC-007",
        concept: "Donación para materiales",
        category: "donations",
        amount: 65000,
        date: subtractDays(14),
        paymentMethod: "card",
        status: "received",
        reference: "TRX-007",
        responsible: "Tesorería",
        notes: "",
    },

    {
        id: "INC-008",
        concept: "Aporte para actividad",
        category: "activities",
        amount: 45000,
        date: subtractDays(17),
        paymentMethod: "cash",
        status: "pending",
        reference: "",
        responsible: "Administración",
        notes: "Pendiente de confirmación.",
    },

    {
        id: "INC-009",
        concept: "Ofrenda especial",
        category: "offerings",
        amount: 210000,
        date: subtractDays(21),
        paymentMethod: "transfer",
        status: "received",
        reference: "TRX-009",
        responsible: "Tesorería",
        notes: "",
    },

    {
        id: "INC-010",
        concept: "Otros aportes",
        category: "other",
        amount: 25000,
        date: subtractDays(26),
        paymentMethod: "other",
        status: "received",
        reference: "",
        responsible: "Administración",
        notes: "",
    },

];


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
// GENERAR IDENTIFICADOR
// =========================================================

const generateIncomeId = (incomes) => {

    const numericIds = incomes
        .map((income) => {

            const match = String(
                income.id ?? ""
            ).match(/^INC-(\d+)$/);

            return match
                ? Number(match[1])
                : 0;

        });

    const nextNumber =
        Math.max(0, ...numericIds) + 1;

    return `INC-${String(nextNumber).padStart(3, "0")}`;

};


// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function IncomeManagement() {

    // =====================================================
    // ESTADO DE INGRESOS
    // =====================================================

    const [incomes, setIncomes] = useState(
        INITIAL_INCOMES
    );


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
    // GUARDAR INGRESO
    // =====================================================

    const handleSaveIncome = async (
        formData,
        editingIncome
    ) => {

        if (isSavingIncome) {
            return false;
        }

        setIsSavingIncome(true);

        try {

            // ---------------------------------------------
            // EDITAR INGRESO EXISTENTE
            // ---------------------------------------------

            if (editingIncome) {

                const editingId =
                    editingIncome.id ||
                    editingIncome._id;

                setIncomes((previous) =>
                    previous.map((income) => {

                        const currentId =
                            income.id ||
                            income._id;

                        if (currentId !== editingId) {
                            return income;
                        }

                        return {
                            ...income,
                            ...formData,
                        };

                    })
                );

                showNotification(
                    "success",
                    "El ingreso se actualizó correctamente."
                );

            } else {

                // -----------------------------------------
                // CREAR NUEVO INGRESO
                // -----------------------------------------

                const newIncome = {
                    id: generateIncomeId(incomes),
                    ...formData,
                };

                setIncomes((previous) => [
                    newIncome,
                    ...previous,
                ]);

                showNotification(
                    "success",
                    "El ingreso se registró correctamente."
                );

            }

            setIsFormModalOpen(false);

            setSelectedIncome(null);

            return true;

        } catch (error) {

            showNotification(
                "error",
                "No se pudo guardar el ingreso."
            );

            return false;

        } finally {

            setIsSavingIncome(false);

        }

    };


    // =====================================================
    // CONFIRMAR ELIMINACIÓN
    // =====================================================

    const handleConfirmDelete = async (income) => {

        if (isDeletingIncome) {
            return false;
        }

        setIsDeletingIncome(true);

        try {

            const deletingId =
                income.id ||
                income._id;

            setIncomes((previous) =>
                previous.filter((item) => {

                    const currentId =
                        item.id ||
                        item._id;

                    return currentId !== deletingId;

                })
            );

            setIsDeleteModalOpen(false);

            setSelectedIncome(null);

            showNotification(
                "success",
                "El ingreso se eliminó correctamente."
            );

            return true;

        } catch (error) {

            showNotification(
                "error",
                "No se pudo eliminar el ingreso."
            );

            return false;

        } finally {

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
                    onCreateIncome={handleCreateIncome}
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