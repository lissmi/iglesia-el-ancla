import { Wallet, Info } from "lucide-react";
// =========================================================
// ESTILOS DEL COMPONENTE
// =========================================================

import "../../../styles/components/administration/finances/FinanceHeader.css";

// =========================================================
// COMPONENTE: FINANCE HEADER
// =========================================================

function FinanceHeader() {

    return (
        <section className="finance-header">

            {/* =========================================== */}
            {/* NAVEGACIÓN */}
            {/* =========================================== */}

            {/* =========================================== */}
            {/* CONTENIDO PRINCIPAL */}
            {/* =========================================== */}

            <div className="finance-header__content">

                <div className="finance-header__identity">

                    <div className="finance-header__icon">
                        <Wallet size={28} strokeWidth={1.8} />
                    </div>

                    <div className="finance-header__information">

                        <span className="finance-header__eyebrow">
                            Transparencia y administración
                        </span>

                        <h1 className="finance-header__title">
                            Resumen financiero
                        </h1>

                        <p className="finance-header__description">
                            Consulta el estado general de los
                            ingresos, gastos y recursos financieros
                            de nuestra comunidad.
                        </p>

                    </div>

                </div>

                {/* ======================================= */}
                {/* INDICADOR DE DEMOSTRACIÓN */}
                {/* ======================================= */}

                <div className="finance-header__demo">

                    <Info size={16} />

                    <span>
                        Datos de demostración
                    </span>

                </div>

            </div>

        </section>
    );
}

export default FinanceHeader;




