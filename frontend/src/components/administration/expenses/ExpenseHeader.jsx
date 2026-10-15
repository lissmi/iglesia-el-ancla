// =========================================================
// IMPORTACIONES
// =========================================================

import {
    Link,
    useLocation,
} from "react-router-dom";

import {
    ArrowLeft,
    Plus,
    ReceiptText,
} from "lucide-react";

import "../../../styles/components/administration/expenses/ExpenseHeader.css";


// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function ExpenseHeader({
    onRegisterExpense,
}) {

    // =====================================================
    // IDENTIFICAR PANEL ADMINISTRATIVO
    // =====================================================

    const location = useLocation();

    const isSuperAdmin =
        location.pathname === "/super-admin" ||
        location.pathname.startsWith("/super-admin/");

    const backPath = isSuperAdmin
        ? "/super-admin"
        : "/admin";


    // =====================================================
    // INTERFAZ
    // =====================================================

    return (
        <header className="expense-header">

            {/* =========================================== */}
            {/* INFORMACIÓN PRINCIPAL */}
            {/* =========================================== */}

            <div className="expense-header__content">

                {/* BOTÓN VOLVER */}

                <Link
                    to={backPath}
                    className="expense-header__back"
                >
                    <ArrowLeft
                        size={17}
                        strokeWidth={2}
                        aria-hidden="true"
                    />

                    <span>
                        Volver al panel
                    </span>
                </Link>


                {/* IDENTIFICACIÓN DEL MÓDULO */}

                <span className="expense-header__eyebrow">

                    <ReceiptText
                        size={15}
                        aria-hidden="true"
                    />

                    Administración financiera

                </span>


                {/* TÍTULO */}

                <h1 className="expense-header__title">
                    Gestión de gastos
                </h1>


                {/* DESCRIPCIÓN */}

                <p className="expense-header__description">
                    Registra, organiza y supervisa los gastos
                    de la comunidad, manteniendo un control
                    claro y ordenado de los recursos financieros.
                </p>

            </div>


            {/* =========================================== */}
            {/* ACCIONES */}
            {/* =========================================== */}

            <div className="expense-header__actions">

                <button
                    className="expense-header__add-button"
                    type="button"
                    onClick={onRegisterExpense}
                >

                    <Plus
                        size={19}
                        strokeWidth={2}
                        aria-hidden="true"
                    />

                    <span>
                        Registrar gasto
                    </span>

                </button>

            </div>

        </header>
    );
}

export default ExpenseHeader;