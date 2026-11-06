// =========================================================
// RESUMEN FINANCIERO - IGLESIA EL ANCLA
// Lectura exclusivamente de totales consolidados desde MongoDB.
// Este componente se comparte entre /member y los paneles administrativos.
// =========================================================

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Info, LoaderCircle } from "lucide-react";

// La PWA utiliza siempre el mismo cliente Axios y la cookie HttpOnly.
import api from "../../services/api";

import FinanceHeader from "../../components/administration/finances/FinanceHeader";
import FinanceSummary from "../../components/administration/finances/FinanceSummary";
import FinanceEvolutionChart from "../../components/administration/finances/FinanceEvolutionChart";
import FinanceDistributionCharts from "../../components/administration/finances/FinanceDistributionCharts";
import FinanceBalance from "../../components/administration/finances/FinanceBalance";
import FinanceTransparency from "../../components/administration/finances/FinanceTransparency";
import FinanceFilters from "../../components/administration/finances/FinanceFilters";

import "../../styles/pages/administration/FinanceOverview.css";

function FinanceOverview() {
    // La fecha de referencia inicial se obtiene en Chile continental.
    const nowInChile = useMemo(() => {
        const parts = new Intl.DateTimeFormat("en-US", {
            timeZone: "America/Santiago",
            year: "numeric", month: "numeric",
        }).formatToParts(new Date());
        const find = (type) => Number(parts.find((part) => part.type === type)?.value);
        return { year: find("year"), month: find("month") };
    }, []);

    const [selectedYear, setSelectedYear] = useState(nowInChile.year);
    const [selectedMonth, setSelectedMonth] = useState(nowInChile.month);
    const [selectedPeriod, setSelectedPeriod] = useState("year");
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [exportError, setExportError] = useState("");
    const [downloading, setDownloading] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);
    const [years, setYears] = useState([nowInChile.year]);

    // Cambiar el período o actualizar la página vuelve a consultar cifras reales.
    useEffect(() => {
        const controller = new AbortController();
        async function loadReport() {
            setLoading(true);
            setError("");
            setReport(null); // No dejamos visibles cifras del período anterior.
            try {
                const response = await api.get("/finance-overview", {
                    params: { year: selectedYear, period: selectedPeriod, month: selectedMonth },
                    signal: controller.signal,
                });
                if (!response.data?.success || !response.data?.data) {
                    throw new Error("No recibimos el resumen esperado");
                }
                if (!controller.signal.aborted) {
                    const result = response.data.data;
                    setReport(result);
                    setYears(result.availableYears || [nowInChile.year]);
                }
            } catch (requestError) {
                if (!controller.signal.aborted) {
                    setError(requestError?.response?.data?.message ||
                        "No pudimos consultar el resumen en este momento. Puedes intentarlo nuevamente.");
                }
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }
        loadReport();
        return () => controller.abort();
    }, [selectedYear, selectedPeriod, selectedMonth, refreshKey, nowInChile.year]);

    // El backend devuelve únicamente totales: ninguna ficha individual llega a miembros.
    const financialData = report?.hasMovements ? report : null;
    const availableYears = [...new Set([selectedYear, nowInChile.year, ...years])]
        .sort((first, second) => second - first);

    // Descargamos mediante Axios para enviar la cookie de sesión de forma segura.
    // PDFKit y ExcelJS generan el archivo en Express, no en el navegador.
    async function downloadReport(format) {
        if (!report || downloading) return;
        setDownloading(format);
        setExportError("");
        try {
            const endpoint = format === "pdf" ? "pdf" : "excel";
            const extension = format === "pdf" ? "pdf" : "xlsx";
            const response = await api.get(`/finance-overview/export/${endpoint}`, {
                params: { year: selectedYear, period: selectedPeriod, month: selectedMonth },
                responseType: "blob",
                timeout: 60000,
            });
            const mime = format === "pdf"
                ? "application/pdf"
                : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            const objectUrl = URL.createObjectURL(new Blob([response.data], { type: mime }));
            const filename = `el-ancla-resumen-financiero-${selectedYear}-${
                selectedPeriod === "month" ? String(selectedMonth).padStart(2, "0") : "anual"
            }.${extension}`;
            const anchor = document.createElement("a");
            anchor.href = objectUrl;
            anchor.download = filename;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
        } catch {
            setExportError("No pudimos preparar el archivo. Por favor, vuelve a intentarlo.");
        } finally {
            setDownloading("");
        }
    }

    return (
        <main className="finance-overview">
            <div className="finance-overview__container">
                <FinanceHeader
                    onDownloadPdf={() => downloadReport("pdf")}
                    onDownloadExcel={() => downloadReport("excel")}
                    onRefresh={() => setRefreshKey((value) => value + 1)}
                    downloading={downloading}
                    disabled={loading || !report}
                />

                <FinanceFilters
                    selectedYear={selectedYear}
                    setSelectedYear={setSelectedYear}
                    selectedPeriod={selectedPeriod}
                    setSelectedPeriod={setSelectedPeriod}
                    selectedMonth={selectedMonth}
                    setSelectedMonth={setSelectedMonth}
                    availableYears={availableYears}
                />

                {/* Carga, errores y ausencia de movimientos se muestran con mensajes cercanos. */}
                {loading && (
                    <div className="finance-overview__state" role="status">
                        <LoaderCircle size={21} aria-hidden="true" />
                        <span>Estamos preparando tu resumen financiero...</span>
                    </div>
                )}
                {!loading && error && (
                    <div className="finance-overview__state finance-overview__state--error" role="alert">
                        <AlertCircle size={21} aria-hidden="true" />
                        <span>{error}</span>
                        <button type="button" onClick={() => setRefreshKey((value) => value + 1)}>
                            Volver a intentar
                        </button>
                    </div>
                )}
                {!loading && report && !report.hasMovements && (
                    <div className="finance-overview__state" role="status">
                        <Info size={21} aria-hidden="true" />
                        <span>Aún no hay ingresos o gastos registrados para este período.</span>
                    </div>
                )}
                {exportError && (
                    <div className="finance-overview__state finance-overview__state--error" role="alert">
                        <AlertCircle size={19} aria-hidden="true" />
                        <span>{exportError}</span>
                    </div>
                )}

                {/* Mostramos el contenido únicamente cuando terminó la consulta. */}
                {!loading && !error && (
                    <>
                        <FinanceSummary data={financialData} />
                        <div className="finance-overview__charts-grid">
                            <div className="finance-overview__panel--wide">
                                <FinanceEvolutionChart data={financialData} />
                            </div>
                        </div>
                        <FinanceDistributionCharts data={financialData} />
                        <div className="finance-overview__bottom-grid">
                            <FinanceBalance data={financialData} />
                            <FinanceTransparency />
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}

export default FinanceOverview;
