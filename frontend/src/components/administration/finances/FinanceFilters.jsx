// =========================================================
// FILTROS DEL RESUMEN FINANCIERO - IGLESIA EL ANCLA
// Permiten consultar un año o un mes concreto.
// =========================================================

import { CalendarDays } from "lucide-react";
import "../../../styles/components/administration/finances/FinanceFilters.css";

const MONTH_NAMES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function FinanceFilters({
    selectedYear, setSelectedYear,
    selectedPeriod, setSelectedPeriod,
    selectedMonth, setSelectedMonth,
    availableYears = [],
    disabled = false,
}) {
    return (
        <section className="finance-filters" aria-label="Período del resumen financiero">
            <div className="finance-filters__heading">
                <div className="finance-filters__icon">
                    <CalendarDays size={20} aria-hidden="true" />
                </div>
                <div className="finance-filters__heading-text">
                    <strong>Período de consulta</strong>
                    <span>Elige el año o mes que deseas conocer.</span>
                </div>
            </div>
            <div className="finance-filters__controls">
                <label className="finance-filters__field">
                    <span>Período</span>
                    <select value={selectedPeriod} disabled={disabled}
                        onChange={(event) => setSelectedPeriod(event.target.value)}>
                        <option value="year">Año completo</option>
                        <option value="month">Un mes</option>
                    </select>
                </label>
                <label className="finance-filters__field">
                    <span>Año</span>
                    <select value={selectedYear} disabled={disabled}
                        onChange={(event) => setSelectedYear(Number(event.target.value))}>
                        {availableYears.map((year) => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </label>
                {selectedPeriod === "month" && (
                    <label className="finance-filters__field">
                        <span>Mes</span>
                        <select value={selectedMonth} disabled={disabled}
                            onChange={(event) => setSelectedMonth(Number(event.target.value))}>
                            {MONTH_NAMES.map((label, index) => (
                                <option key={label} value={index + 1}>{label}</option>
                            ))}
                        </select>
                    </label>
                )}
            </div>
        </section>
    );
}

export default FinanceFilters;
