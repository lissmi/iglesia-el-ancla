
import {
    Scale,
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    Info,
} from "lucide-react";

// =========================================================
// ESTILOS
// =========================================================

import "../../../styles/components/administration/finances/FinanceBalance.css";

// =========================================================
// FORMATO DE MONEDA CHILENA
// =========================================================

// Todos los montos se presentan en pesos chilenos,
// sin decimales, siguiendo el formato regional.

const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0,
    }).format(amount);
};

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function FinanceBalance({ data = null }) {

    // =====================================================
    // DISPONIBILIDAD DE INFORMACIÓN
    // =====================================================

    // FinanceOverview proporciona los datos ya
    // procesados según el año y período seleccionado.
    //
    // Si data es null, no existen registros de
    // demostración para el período consultado.

    const hasData = data !== null;

    // =====================================================
    // INDICADORES FINANCIEROS
    // =====================================================

    // El balance corresponde a:
    //
    // Ingresos - Gastos efectivamente pagados.
    //
    // Los pagos pendientes se consideran únicamente
    // para calcular el balance proyectado.

    const income = data?.income ?? 0;

    const expenses = data?.expenses ?? 0;

    const pending = data?.pending ?? 0;

    const balance = data?.balance ?? 0;

    const projectedBalance =
        data?.projectedBalance ?? 0;

    // =====================================================
    // ESTADO DEL BALANCE
    // =====================================================

    // Identificamos si el resultado es positivo,
    // negativo o equilibrado.

    const balanceStatus = balance > 0
        ? "positive"
        : balance < 0
            ? "negative"
            : "neutral";

    const balanceStatusLabel = balance > 0
        ? "Balance positivo"
        : balance < 0
            ? "Balance negativo"
            : "Balance equilibrado";

    // =====================================================
    // INTERFAZ PRINCIPAL
    // =====================================================

    return (

        <section className="finance-balance">

            {/* =========================================== */}
            {/* ENCABEZADO */}
            {/* =========================================== */}

            <div className="finance-balance__header">

                <div>

                    <h2>
                        Balance financiero
                    </h2>

                    <p>
                        Resultado general del período
                        seleccionado.
                    </p>

                </div>

                <div className="finance-balance__header-icon">

                    <Scale
                        size={21}
                        aria-hidden="true"
                    />

                </div>

            </div>

            {/* =========================================== */}
            {/* CONTENIDO FINANCIERO */}
            {/* =========================================== */}

            {hasData ? (

                <>
                    {/* =================================== */}
                    {/* BALANCE PRINCIPAL */}
                    {/* =================================== */}

                    <div
                        className={`finance-balance__highlight finance-balance__highlight--${balanceStatus}`}
                    >

                        <div className="finance-balance__highlight-label">

                            <Wallet
                                size={18}
                                aria-hidden="true"
                            />

                            <span>
                                Balance del período
                            </span>

                        </div>

                        <strong>
                            {formatCurrency(balance)}
                        </strong>

                        <span
                            className={`finance-balance__status finance-balance__status--${balanceStatus}`}
                        >
                            {balanceStatusLabel}
                        </span>

                    </div>

                    {/* =================================== */}
                    {/* DETALLE DE MOVIMIENTOS */}
                    {/* =================================== */}

                    <div className="finance-balance__details">

                        {/* INGRESOS */}

                        <div className="finance-balance__detail">

                            <div className="finance-balance__detail-label">

                                <ArrowUpRight
                                    size={17}
                                    aria-hidden="true"
                                />

                                <span>
                                    Ingresos
                                </span>

                            </div>

                            <strong>
                                {formatCurrency(income)}
                            </strong>

                        </div>

                        {/* GASTOS */}

                        <div className="finance-balance__detail">

                            <div className="finance-balance__detail-label">

                                <ArrowDownRight
                                    size={17}
                                    aria-hidden="true"
                                />

                                <span>
                                    Gastos pagados
                                </span>

                            </div>

                            <strong>
                                {formatCurrency(expenses)}
                            </strong>

                        </div>

                        {/* PAGOS PENDIENTES */}

                        <div className="finance-balance__detail">

                            <div className="finance-balance__detail-label">

                                <Scale
                                    size={17}
                                    aria-hidden="true"
                                />

                                <span>
                                    Pagos pendientes
                                </span>

                            </div>

                            <strong>
                                {formatCurrency(pending)}
                            </strong>

                        </div>

                    </div>

                    {/* =================================== */}
                    {/* BALANCE PROYECTADO */}
                    {/* =================================== */}

                    <div className="finance-balance__projection">

                        <span>
                            Balance después de considerar
                            los pagos pendientes
                        </span>

                        <strong>
                            {formatCurrency(projectedBalance)}
                        </strong>

                    </div>

                </>

            ) : (

                /* ======================================= */
                /* ESTADO SIN DATOS */
                /* ======================================= */

                <div className="finance-balance__empty">

                    <Info
                        size={25}
                        aria-hidden="true"
                    />

                    <strong>
                        Sin datos de demostración
                    </strong>

                    <p>
                        No existe información financiera
                        disponible para el período
                        seleccionado.
                    </p>

                </div>

            )}

            {/* =========================================== */}
            {/* NOTA INFORMATIVA */}
            {/* =========================================== */}

            <p className="finance-balance__note">

                <Info
                    size={15}
                    aria-hidden="true"
                />

                <span>
                    Valores ficticios utilizados para
                    el diseño. El balance no representa
                    necesariamente el saldo bancario
                    o efectivo real.
                </span>

            </p>

        </section>

    );
}

export default FinanceBalance;
