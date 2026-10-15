// =========================================================
// IMPORTACIONES
// =========================================================

import {
    ArrowLeft,
    Plus,
    Wallet,
} from "lucide-react";

import {
    useLocation,
    useNavigate,
} from "react-router-dom";

import "../../../styles/components/administration/income/IncomeHeader.css";


// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function IncomeHeader({
    onCreateIncome,
}) {

    // =====================================================
    // NAVEGACIÓN
    // =====================================================

    const navigate = useNavigate();

    const location = useLocation();

    const adminBasePath =
        location.pathname.startsWith("/super-admin")
            ? "/super-admin"
            : "/admin";


    // =====================================================
    // VOLVER AL PANEL
    // =====================================================

    const handleGoBack = () => {
        navigate(adminBasePath);
    };


    // =====================================================
    // INTERFAZ
    // =====================================================

    return (
        <div className="income-header">

            {/* =========================================== */}
            {/* NAVEGACIÓN */}
            {/* =========================================== */}

            <button
                type="button"
                className="income-header__back"
                onClick={handleGoBack}
            >
                <ArrowLeft
                    size={17}
                    strokeWidth={2}
                    aria-hidden="true"
                />

                Volver atrás
            </button>


            {/* =========================================== */}
            {/* CONTENIDO PRINCIPAL */}
            {/* =========================================== */}

            <div className="income-header__main">

                <div className="income-header__information">

                    <div className="income-header__eyebrow">

                        <Wallet
                            size={15}
                            aria-hidden="true"
                        />

                        Finanzas de la iglesia

                    </div>

                    <h1>
                        Gestión de Ingresos
                    </h1>

                    <p>
                        Registra, organiza y consulta los ingresos
                        recibidos por la iglesia. Supervisa los
                        movimientos financieros y su evolución
                        a través del tiempo.
                    </p>

                </div>


                {/* ======================================= */}
                {/* ACCIONES */}
                {/* ======================================= */}

                <div className="income-header__actions">

                    <button
                        type="button"
                        className="income-header__create"
                        onClick={onCreateIncome}
                        disabled={!onCreateIncome}
                    >

                        <Plus
                            size={19}
                            strokeWidth={2}
                            aria-hidden="true"
                        />

                        Registrar ingreso

                    </button>

                </div>

            </div>

        </div>
    );
}

export default IncomeHeader;