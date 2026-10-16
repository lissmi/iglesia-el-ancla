
import { CalendarDays } from "lucide-react";

// =========================================================
// ESTILOS
// =========================================================

import "../../../styles/components/administration/finances/FinanceFilters.css";

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function FinanceFilters({
    selectedYear,
    setSelectedYear,
    selectedPeriod,
    setSelectedPeriod,
    availableYears,
}) {

    return (

        <section
            className="finance-filters"
            aria-label="Filtros financieros"
        >

            {/* =========================================== */}
            {/* ENCABEZADO */}
            {/* =========================================== */}

            <div className="finance-filters__heading">

                <div className="finance-filters__icon">

                    <CalendarDays
                        size={20}
                        aria-hidden="true"
                    />

                </div>

                <div className="finance-filters__heading-text">

                    <strong>
                        Período de consulta
                    </strong>

                    <span>
                        Selecciona el período que
                        deseas visualizar.
                    </span>

                </div>

            </div>

            {/* =========================================== */}
            {/* CONTROLES */}
            {/* =========================================== */}

            <div className="finance-filters__controls">

                {/* ======================================= */}
                {/* FILTRO DE PERÍODO */}
                {/* ======================================= */}

                <label className="finance-filters__field">

                    <span>
                        Período
                    </span>

                    <select
                        value={selectedPeriod}
                        onChange={(event) =>
                            setSelectedPeriod(event.target.value)
                        }
                    >

                        <option value="year">
                            Año completo
                        </option>

                        <option value="month">
                            Mes actual
                        </option>

                    </select>

                </label>

                {/* ======================================= */}
                {/* FILTRO DE AÑO */}
                {/* ======================================= */}

                <label className="finance-filters__field">

                    <span>
                        Año
                    </span>

                    <select
                        value={selectedYear}
                        onChange={(event) =>
                            setSelectedYear(
                                Number(event.target.value)
                            )
                        }
                    >

                        {availableYears.map((year) => (

                            <option
                                key={year}
                                value={year}
                            >
                                {year}
                            </option>

                        ))}

                    </select>

                </label>

            </div>

        </section>

    );
}

export default FinanceFilters;
