import { useMemo, useState } from "react";
import {
    Activity, BarChart3, CalendarDays, Clock3,
    Download, Filter, ChevronDown, Info, MessageSquareText, Search,
    ShieldAlert, Wallet, X,
} from "lucide-react";

import "../../../styles/components/administration/martin/MartinActivity.css";
import { useMartin } from "../../../context/martin/MartinContext";

// Los indicadores se muestran por día y no incluyen el texto de las conversaciones.
const EVENT_TYPES = {
    request: "Consulta",
    blocked: "Solicitud bloqueada",
    error: "Error técnico",
};

const formatDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "—"
        : new Intl.DateTimeFormat("es-CL", {
              dateStyle: "short",
              timeStyle: "short",
          }).format(date);
};

const formatNumber = (value) =>
    typeof value === "number" && Number.isFinite(value)
        ? new Intl.NumberFormat("es-CL").format(value)
        : "—";

function MetricCard({ icon: Icon, label, value, description }) {
    return (
        <article className="martin-activity__metric">
            <div className="martin-activity__metric-top">
                <span>{label}</span>
                <span className="martin-activity__metric-icon"><Icon size={18} /></span>
            </div>
            <strong>{value}</strong>
            <small>{description}</small>
        </article>
    );
}

function MartinActivity() {
    const { activityEvents: events, activityMetrics: metrics, isBackendConnected } = useMartin();
    const [search, setSearch] = useState("");
    const [type, setType] = useState("all");
    const [period, setPeriod] = useState("7");

    // No se incluyen mensajes completos, datos personales ni direcciones IP.
    // Cada registro debe venir saneado y autorizado desde el backend.
    const filteredEvents = useMemo(() => {
        const safeEvents = Array.isArray(events) ? events : [];
        const days = Number(period);
        const now = Date.now();
        return safeEvents
            .filter((event) => {
                if (type !== "all" && event.type !== type) return false;
                if (days > 0) {
                    const timestamp = new Date(event.createdAt).getTime();
                    if (!Number.isFinite(timestamp) || timestamp > now || now - timestamp > days * 86400000) return false;
                }
                const term = search.trim().toLocaleLowerCase("es-CL");
                return !term || [event.id, event.category, event.summary, EVENT_TYPES[event.type]]
                    .filter(Boolean)
                    .some((field) => String(field).toLocaleLowerCase("es-CL").includes(term));
            })
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [events, search, type, period]);

    const exportCsv = () => {
        if (!filteredEvents.length) return;
        const rows = [
            ["Día", "Tipo", "Categoría", "Descripción", "Cantidad"],
            ...filteredEvents.map((event) => [
                event.day ?? "", EVENT_TYPES[event.type] ?? "Evento",
                event.category ?? "", event.summary ?? "", event.count ?? 0,
            ]),
        ];
        const csv = "\uFEFF" + rows.map((row) => row.map((value) =>
            `"${String(value).replace(/^[=+@\-\t\r]/, "' $&").replace(/"/g, '""')}"`
        ).join(";")).join("\r\n");
        const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
        const link = document.createElement("a");
        link.href = url;
        link.download = "martin-actividad.csv";
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="martin-activity">
            <div className="martin-activity__heading">
                <div>
                    <span className="martin-activity__eyebrow">Supervisión</span>
                    <h4>Actividad y estadísticas</h4>
                    <p>Revisa cuánto se utiliza Martín y las solicitudes que se han bloqueado.</p>
                </div>
                <span className="martin-activity__phase"><Clock3 size={14} /> {isBackendConnected ? "Información actualizada" : "No se pudo actualizar"}</span>
            </div>

            <div className="martin-activity__metrics">
                <MetricCard icon={MessageSquareText} label="Consultas de hoy" value={formatNumber(metrics?.todayRequests)} description="Preguntas recibidas durante el día" />
                <MetricCard icon={CalendarDays} label="Consultas del mes" value={formatNumber(metrics?.monthRequests)} description="Preguntas recibidas este mes" />
                <MetricCard icon={ShieldAlert} label="Solicitudes bloqueadas" value={formatNumber(metrics?.blockedRequests)} description="Consultas rechazadas para proteger a la comunidad" />
                <MetricCard icon={Wallet} label="Costo registrado" value={typeof metrics?.estimatedCostUsd === "number" ? `US$ ${metrics.estimatedCostUsd.toFixed(2)}` : "—"} description="Sin información de costos disponible" />
            </div>

            <section className="martin-activity__panel" aria-labelledby="martin-activity-events-title">
                <div className="martin-activity__panel-head">
                    <div>
                        <h4 id="martin-activity-events-title"><Activity size={19} /> Registro de actividad</h4>
                        <p>Resumen diario sin guardar ni mostrar conversaciones privadas.</p>
                    </div>
                    <button className="martin-activity__export" type="button" onClick={exportCsv} disabled={!filteredEvents.length} title={!filteredEvents.length ? "No hay registros para exportar" : "Exportar registros filtrados"}>
                        <Download size={16} /> Exportar CSV
                    </button>
                </div>

                <div className="martin-activity__filters">
                    <label className="martin-activity__search">
                        <Search size={17} />
                        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por categoría o descripción" aria-label="Buscar eventos" />
                        {search && <button type="button" onClick={() => setSearch("")} aria-label="Limpiar búsqueda"><X size={15} /></button>}
                    </label>
                    <label className="martin-activity__select">
                        <Filter size={16} />
                        <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Filtrar tipo de evento">
                            <option value="all">Todos los eventos</option>
                            <option value="request">Consultas</option>
                            <option value="blocked">Bloqueos</option>
                            <option value="error">Errores técnicos</option>
                        </select>
                        <ChevronDown className="martin-activity__select-chevron" size={16} aria-hidden="true" />
                    </label>
                    <label className="martin-activity__select">
                        <CalendarDays size={16} />
                        <select value={period} onChange={(e) => setPeriod(e.target.value)} aria-label="Filtrar período">
                            <option value="7">Últimos 7 días</option>
                            <option value="30">Últimos 30 días</option>
                            <option value="90">Últimos 90 días</option>
                            <option value="0">Todo el historial</option>
                        </select>
                        <ChevronDown className="martin-activity__select-chevron" size={16} aria-hidden="true" />
                    </label>
                </div>

                {filteredEvents.length ? (
                    <div className="martin-activity__table-wrap">
                        <table className="martin-activity__table">
                            <thead><tr><th>Día</th><th>Evento</th><th>Categoría</th><th>Descripción</th><th>Cantidad</th></tr></thead>
                            <tbody>{filteredEvents.map((event, index) => (
                                <tr key={event.id ?? index}>
                                    <td>{event.day || formatDate(event.createdAt)}</td>
                                    <td><span className={`martin-activity__type martin-activity__type--${EVENT_TYPES[event.type] ? event.type : "other"}`}>{EVENT_TYPES[event.type] ?? "Evento"}</span></td>
                                    <td>{event.category || "—"}</td>
                                    <td>{event.summary || "—"}</td>
                                    <td>{formatNumber(event.count ?? 0)}</td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                ) : (
                    <div className="martin-activity__empty">
                        <BarChart3 size={30} strokeWidth={1.5} />
                        <h5>{events.length ? "No hay eventos que coincidan" : "Todavía no hay estadísticas registradas"}</h5>
                        <p>{events.length ? "Prueba cambiando los filtros de búsqueda." : "Cuando Martín reciba consultas, aquí verás un resumen de cada día."}</p>
                    </div>
                )}
                <div className="martin-activity__table-footer">{filteredEvents.length} {filteredEvents.length === 1 ? "fila" : "filas"} en la selección</div>
            </section>

            <div className="martin-activity__notice">
                <Info size={18} />
                <p><strong>Privacidad:</strong> esta sección muestra un resumen del uso de Martín, sin enseñar las conversaciones privadas. El costo del servicio no se calcula en esta pantalla.</p>
            </div>
        </div>
    );
}

export default MartinActivity;
