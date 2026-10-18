// =========================================================
// IMPORTACIONES
// =========================================================

import { useMemo, useState } from "react";

import {
    Search,
    Filter,
    ArrowUpDown,
    Eye,
    Pencil,
    Trash2,
    ChevronLeft,
    ChevronRight,
    ReceiptText,
    RotateCcw,
    Paperclip,
} from "lucide-react";

import {
    formatExpenseCurrency,
    formatExpenseDate,
} from "../../../utils/expenseUtils";

import "../../../styles/components/administration/expenses/ExpenseTable.css";


// =========================================================
// CONFIGURACIÓN
// =========================================================

const PAGE_SIZE = 8;

const SORT_OPTIONS = [
    { value: "date-desc", label: "Más recientes" },
    { value: "date-asc", label: "Más antiguos" },
    { value: "amount-desc", label: "Mayor monto" },
    { value: "amount-asc", label: "Menor monto" },
];


// =========================================================
// FUNCIONES AUXILIARES
// =========================================================

// Normalizamos textos para permitir búsquedas
// sin diferencias entre mayúsculas y acentos.

const normalizeText = (value) => {

    return String(value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

};


// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function ExpenseTable({
    expenses = [],
    onViewExpense,
    onEditExpense,
    onDeleteExpense,
}) {

    // =====================================================
    // ESTADOS DE FILTROS
    // =====================================================

    const [searchTerm, setSearchTerm] = useState("");

    const [selectedCategory, setSelectedCategory] =
        useState("all");

    const [selectedStatus, setSelectedStatus] =
        useState("all");

    const [selectedPaymentMethod, setSelectedPaymentMethod] =
        useState("all");

    const [sortBy, setSortBy] =
        useState("date-desc");

    const [currentPage, setCurrentPage] =
        useState(1);


    // =====================================================
    // OPCIONES DE CATEGORÍA
    // =====================================================

    const categories = useMemo(() => {

        return [...new Set(
            expenses.map((expense) =>
                expense.category?.trim() || "Sin categoría"
            )
        )].sort((a, b) =>
            a.localeCompare(b, "es")
        );

    }, [expenses]);


    // =====================================================
    // OPCIONES DE MEDIO DE PAGO
    // =====================================================

    const paymentMethods = useMemo(() => {

        return [...new Set(
            expenses.map((expense) =>
                expense.paymentMethod?.trim() ||
                "No especificado"
            )
        )].sort((a, b) =>
            a.localeCompare(b, "es")
        );

    }, [expenses]);


    // =====================================================
    // FILTRAR Y ORDENAR
    // =====================================================

    const filteredExpenses = useMemo(() => {

        const search = normalizeText(searchTerm);

        const result = expenses.filter((expense) => {

            // --------------------------------------------
            // BÚSQUEDA
            // --------------------------------------------

            const searchableText = normalizeText([
                expense.description,
                expense.category,
                expense.paymentMethod,
                expense.notes,
            ].join(" "));

            const matchesSearch =
                !search || searchableText.includes(search);


            // --------------------------------------------
            // CATEGORÍA
            // --------------------------------------------

            const category =
                expense.category?.trim() || "Sin categoría";

            const matchesCategory =
                selectedCategory === "all" ||
                category === selectedCategory;


            // --------------------------------------------
            // ESTADO
            // --------------------------------------------

            const matchesStatus =
                selectedStatus === "all" ||
                expense.status === selectedStatus;


            // --------------------------------------------
            // MEDIO DE PAGO
            // --------------------------------------------

            const paymentMethod =
                expense.paymentMethod?.trim() ||
                "No especificado";

            const matchesPayment =
                selectedPaymentMethod === "all" ||
                paymentMethod === selectedPaymentMethod;


            return (
                matchesSearch &&
                matchesCategory &&
                matchesStatus &&
                matchesPayment
            );

        });


        // --------------------------------------------
        // ORDENACIÓN
        // --------------------------------------------

        result.sort((a, b) => {

            if (sortBy === "amount-desc") {

                return (
                    Number(b.amount || 0) -
                    Number(a.amount || 0)
                );

            }

            if (sortBy === "amount-asc") {

                return (
                    Number(a.amount || 0) -
                    Number(b.amount || 0)
                );

            }

            const firstDate = String(a.date || "");
            const secondDate = String(b.date || "");

            if (sortBy === "date-asc") {
                return firstDate.localeCompare(secondDate);
            }

            return secondDate.localeCompare(firstDate);

        });

        return result;

    }, [
        expenses,
        searchTerm,
        selectedCategory,
        selectedStatus,
        selectedPaymentMethod,
        sortBy,
    ]);


    // =====================================================
    // PAGINACIÓN
    // =====================================================

    const totalPages = Math.max(
        1,
        Math.ceil(filteredExpenses.length / PAGE_SIZE)
    );

    // Evitamos que una página antigua deje la tabla vacía
    // si el número de resultados disminuye.

    const safePage = Math.min(
        currentPage,
        totalPages
    );

    const startIndex = (safePage - 1) * PAGE_SIZE;

    const visibleExpenses = filteredExpenses.slice(
        startIndex,
        startIndex + PAGE_SIZE
    );

    const firstResult = filteredExpenses.length === 0
        ? 0
        : startIndex + 1;

    const lastResult = Math.min(
        startIndex + PAGE_SIZE,
        filteredExpenses.length
    );


    // =====================================================
    // REINICIAR FILTROS
    // =====================================================

    const resetFilters = () => {

        setSearchTerm("");
        setSelectedCategory("all");
        setSelectedStatus("all");
        setSelectedPaymentMethod("all");
        setSortBy("date-desc");
        setCurrentPage(1);

    };


    // =====================================================
    // ESTADO VISUAL
    // =====================================================

    const getStatusClass = (status) => {

        if (status === "Pagado") {
            return "expense-table__status--paid";
        }

        if (status === "Pendiente") {
            return "expense-table__status--pending";
        }

        return "expense-table__status--other";

    };


    // =====================================================
    // ACCIONES REUTILIZABLES
    // =====================================================

    const renderActions = (expense) => {

        if (
            !onViewExpense &&
            !onEditExpense &&
            !onDeleteExpense
        ) {
            return (
                <span className="expense-table__no-actions">
                    Sin acciones disponibles
                </span>
            );
        }

        return (
            <div className="expense-table__actions">

                {onViewExpense && (

                    <button
                        type="button"
                        className="expense-table__action"
                        onClick={() => onViewExpense(expense)}
                        title="Ver detalles"
                        aria-label={`Ver detalles de ${expense.description}`}
                    >
                        <Eye size={17} aria-hidden="true" />
                    </button>

                )}

                {onEditExpense && (

                    <button
                        type="button"
                        className="expense-table__action"
                        onClick={() => onEditExpense(expense)}
                        title="Editar gasto"
                        aria-label={`Editar ${expense.description}`}
                    >
                        <Pencil size={16} aria-hidden="true" />
                    </button>

                )}

                {onDeleteExpense && (

                    <button
                        type="button"
                        className="expense-table__action expense-table__action--danger"
                        onClick={() => onDeleteExpense(expense)}
                        title="Eliminar gasto"
                        aria-label={`Eliminar ${expense.description}`}
                    >
                        <Trash2 size={16} aria-hidden="true" />
                    </button>

                )}

            </div>
        );

    };


    // =====================================================
    // INTERFAZ
    // =====================================================

    return (
        <section className="expense-table">

            {/* =========================================== */}
            {/* ENCABEZADO */}
            {/* =========================================== */}

            <div className="expense-table__header">

                <div>

                    <span className="expense-table__eyebrow">
                        Control administrativo
                    </span>

                    <h2 className="expense-table__title">
                        Historial de gastos
                    </h2>

                    <p className="expense-table__description">
                        Consulta y organiza todos los
                        movimientos financieros registrados.
                    </p>

                </div>

                <span className="expense-table__total-badge">
                    {expenses.length.toLocaleString("es-CL")} registros
                </span>

            </div>


            {/* =========================================== */}
            {/* BARRA DE FILTROS */}
            {/* =========================================== */}

            <div className="expense-table__toolbar">

                {/* BÚSQUEDA */}

                <div className="expense-table__search">

                    <Search
                        size={18}
                        aria-hidden="true"
                    />

                    <input
                        type="search"
                        value={searchTerm}
                        placeholder="Buscar gasto..."
                        aria-label="Buscar gastos"
                        onChange={(event) => {
                            setSearchTerm(event.target.value);
                            setCurrentPage(1);
                        }}
                    />

                </div>


                {/* CATEGORÍA */}

                <div className="expense-table__select-wrapper">

                    <Filter size={15} aria-hidden="true" />

                    <select
                        aria-label="Filtrar por categoría"
                        value={selectedCategory}
                        onChange={(event) => {
                            setSelectedCategory(event.target.value);
                            setCurrentPage(1);
                        }}
                    >

                        <option value="all">
                            Todas las categorías
                        </option>

                        {categories.map((category) => (

                            <option
                                key={category}
                                value={category}
                            >
                                {category}
                            </option>

                        ))}

                    </select>

                </div>


                {/* ESTADO */}

                <div className="expense-table__select-wrapper">

                    <select
                        aria-label="Filtrar por estado"
                        value={selectedStatus}
                        onChange={(event) => {
                            setSelectedStatus(event.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="all">
                            Todos los estados
                        </option>

                        <option value="Pagado">
                            Pagado
                        </option>

                        <option value="Pendiente">
                            Pendiente
                        </option>
                    </select>

                </div>


                {/* MEDIO DE PAGO */}

                <div className="expense-table__select-wrapper">

                    <select
                        aria-label="Filtrar por medio de pago"
                        value={selectedPaymentMethod}
                        onChange={(event) => {
                            setSelectedPaymentMethod(event.target.value);
                            setCurrentPage(1);
                        }}
                    >

                        <option value="all">
                            Todos los medios
                        </option>

                        {paymentMethods.map((method) => (

                            <option
                                key={method}
                                value={method}
                            >
                                {method}
                            </option>

                        ))}

                    </select>

                </div>


                {/* ORDENACIÓN */}

                <div className="expense-table__select-wrapper">

                    <ArrowUpDown
                        size={15}
                        aria-hidden="true"
                    />

                    <select
                        aria-label="Ordenar gastos"
                        value={sortBy}
                        onChange={(event) => {
                            setSortBy(event.target.value);
                            setCurrentPage(1);
                        }}
                    >

                        {SORT_OPTIONS.map((option) => (

                            <option
                                key={option.value}
                                value={option.value}
                            >
                                {option.label}
                            </option>

                        ))}

                    </select>

                </div>


                {/* LIMPIAR */}

                <button
                    type="button"
                    className="expense-table__reset"
                    onClick={resetFilters}
                >
                    <RotateCcw
                        size={15}
                        aria-hidden="true"
                    />

                    Limpiar
                </button>

            </div>


            {/* =========================================== */}
            {/* PANEL DE RESULTADOS */}
            {/* =========================================== */}

            <div className="expense-table__panel">

                <div className="expense-table__panel-header">

                    <div>

                        <h3>
                            Movimientos registrados
                        </h3>

                        <p>
                            Mostrando {firstResult}–{lastResult} de{" "}
                            {filteredExpenses.length} resultados
                        </p>

                    </div>

                </div>


                {/* ======================================= */}
                {/* RESULTADOS */}
                {/* ======================================= */}

                {visibleExpenses.length > 0 ? (

                    <>

                        {/* =============================== */}
                        {/* TABLA PARA ESCRITORIO */}
                        {/* =============================== */}

                        <div className="expense-table__desktop">

                            <table>

                                <thead>
                                    <tr>
                                        <th>Gasto</th>
                                        <th>Categoría</th>
                                        <th>Fecha</th>
                                        <th>Medio de pago</th>
                                        <th>Estado</th>
                                        <th>Monto</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {visibleExpenses.map((expense) => (

                                        <tr key={expense.id}>

                                            <td>
                                                <strong className="expense-table__expense-name">
                                                    {expense.description}
                                                </strong>
                                                {expense.receiptImage?.url && (
                                                    <span className="expense-table__receipt-tag" title="Comprobante adjunto">
                                                        <Paperclip size={12} aria-hidden="true" />
                                                        Con boleta
                                                    </span>
                                                )}
                                            </td>

                                            <td>
                                                {expense.category || "Sin categoría"}
                                            </td>

                                            <td>
                                                {formatExpenseDate(expense.date)}
                                            </td>

                                            <td>
                                                {expense.paymentMethod || "No especificado"}
                                            </td>

                                            <td>
                                                <span
                                                    className={
                                                        "expense-table__status " +
                                                        getStatusClass(expense.status)
                                                    }
                                                >
                                                    {expense.status || "Sin estado"}
                                                </span>
                                            </td>

                                            <td>
                                                <strong className="expense-table__amount">
                                                    {formatExpenseCurrency(expense.amount)}
                                                </strong>
                                            </td>

                                            <td>
                                                {renderActions(expense)}
                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>


                        {/* =============================== */}
                        {/* TARJETAS PARA MÓVILES */}
                        {/* =============================== */}

                        <div className="expense-table__mobile">

                            {visibleExpenses.map((expense) => (

                                <article
                                    key={expense.id}
                                    className="expense-table__mobile-card"
                                >

                                    <div className="expense-table__mobile-top">

                                        <strong className="expense-table__expense-name">
                                            {expense.description}
                                        </strong>
                                        {expense.receiptImage?.url && (
                                            <span className="expense-table__receipt-tag" title="Comprobante adjunto">
                                                <Paperclip size={12} aria-hidden="true" />
                                                Con boleta
                                            </span>
                                        )}

                                        <span
                                            className={
                                                "expense-table__status " +
                                                getStatusClass(expense.status)
                                            }
                                        >
                                            {expense.status || "Sin estado"}
                                        </span>

                                    </div>

                                    <dl className="expense-table__mobile-details">

                                        <div>
                                            <dt>Categoría</dt>
                                            <dd>{expense.category || "Sin categoría"}</dd>
                                        </div>

                                        <div>
                                            <dt>Fecha</dt>
                                            <dd>{formatExpenseDate(expense.date)}</dd>
                                        </div>

                                        <div>
                                            <dt>Medio de pago</dt>
                                            <dd>{expense.paymentMethod || "No especificado"}</dd>
                                        </div>

                                        <div>
                                            <dt>Monto</dt>
                                            <dd className="expense-table__amount">
                                                {formatExpenseCurrency(expense.amount)}
                                            </dd>
                                        </div>

                                    </dl>

                                    <div className="expense-table__mobile-actions">
                                        {renderActions(expense)}
                                    </div>

                                </article>

                            ))}

                        </div>

                    </>

                ) : (

                    <div className="expense-table__empty">

                        <ReceiptText
                            size={38}
                            strokeWidth={1.5}
                            aria-hidden="true"
                        />

                        <strong>
                            No se encontraron gastos
                        </strong>

                        <p>
                            Prueba modificando los filtros
                            o registra un nuevo gasto.
                        </p>

                        <button
                            type="button"
                            onClick={resetFilters}
                        >
                            Restablecer filtros
                        </button>

                    </div>

                )}


                {/* ======================================= */}
                {/* PAGINACIÓN */}
                {/* ======================================= */}

                {totalPages > 1 && (

                    <div className="expense-table__pagination">

                        <span>
                            Página {safePage} de {totalPages}
                        </span>

                        <div className="expense-table__pagination-buttons">

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

                )}

            </div>

        </section>
    );
}

export default ExpenseTable;