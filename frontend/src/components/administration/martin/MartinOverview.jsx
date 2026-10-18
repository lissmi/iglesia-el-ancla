import { useMartin } from "../../../context/martin/MartinContext";

import {
    Activity,
    ArrowRight,
    BookOpen,
    Bot,
    CalendarDays,
    CircleHelp,
    Clock3,
    Globe2,
    MessageCircle,
    ShieldCheck,
    Users,
} from "lucide-react";

import "../../../styles/components/administration/martin/MartinOverview.css";

// Los datos provienen del contexto compartido (solo frontend).
// El estado operativo seguirá siendo "En desarrollo" hasta integrar el backend.
const statusLabels = {
    development: "En desarrollo",
    active: "Activo",
    paused: "Pausado",
};

const capabilities = [
    {
        key: "publicEnabled",
        icon: Globe2,
        title: "Información institucional",
        description: "Horarios, actividades, contacto y orientación para visitantes.",
    },
    {
        key: "membersEnabled",
        icon: Users,
        title: "Atención a miembros",
        description: "Orientación dentro de los recursos y espacios de la comunidad.",
    },
    {
        key: "bibleEnabled",
        icon: BookOpen,
        title: "Orientación bíblica",
        description: "Búsqueda de pasajes y explicaciones basadas en fuentes autorizadas.",
    },
    {
        key: "resourcesEnabled",
        icon: CircleHelp,
        title: "Búsqueda de recursos",
        description: "Ayuda para encontrar estudios, guías y materiales publicados.",
    },
];

function MartinOverview({ onNavigate }) {
    const { overview, settings, isBackendConnected } = useMartin();
    const data = overview;

    // Configuración local ≠ disponibilidad operativa.
    const configuredEnabled = Boolean(settings.enabled);
    const isOperational = Boolean(isBackendConnected && data.status === "active");

    const metrics = [
        {
            id: "today",
            label: "Consultas de hoy",
            value: data.todayRequests,
            icon: MessageCircle,
        },
        {
            id: "month",
            label: "Consultas del mes",
            value: data.monthRequests,
            icon: Activity,
        },
        {
            id: "cost",
            label: "Consumo estimado",
            value: data.estimatedCost,
            icon: CalendarDays,
        },
        {
            id: "last",
            label: "Última actividad",
            value: data.lastActivity,
            icon: Clock3,
        },
    ];

    const displayMetric = (metric) => {
        if (metric.value === null || metric.value === undefined) {
            return "Sin datos";
        }
        if (typeof metric.value === "number") {
            return metric.value.toLocaleString("es-CL");
        }
        return String(metric.value);
    };

    return (
        <div className="martin-overview">
            <section className="martin-overview__status-panel" aria-label="Estado de Martín">
                <div className="martin-overview__status-icon" aria-hidden="true">
                    <Bot size={27} strokeWidth={1.7} />
                </div>
                <div className="martin-overview__status-copy">
                    <div className="martin-overview__status-heading">
                        <h4>Estado del asistente</h4>
                        <span className={`martin-overview__status martin-overview__status--${data.status}`}>
                            {statusLabels[data.status] || "Sin configurar"}
                        </span>
                    </div>
                    <p>
                        {isOperational
                            ? "Martín se encuentra disponible para los públicos autorizados."
                            : configuredEnabled
                                ? "Martín está habilitado en la configuración local, pero aún no está publicado ni conectado al backend."
                                : "Martín está desactivado en la configuración local. Su conexión y publicación se realizarán en etapas posteriores."}
                    </p>
                </div>
            </section>

            <section className="martin-overview__section" aria-labelledby="martin-overview-metrics">
                <div className="martin-overview__section-heading">
                    <div>
                        <h4 id="martin-overview-metrics">Indicadores de uso</h4>
                        <p>Las estadísticas reales estarán disponibles cuando conectemos el servicio.</p>
                    </div>
                </div>
                <div className="martin-overview__metrics">
                    {metrics.map((metric) => {
                        const Icon = metric.icon;
                        return (
                            <article className="martin-overview__metric" key={metric.id}>
                                <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
                                <strong>{displayMetric(metric)}</strong>
                                <span>{metric.label}</span>
                            </article>
                        );
                    })}
                </div>
            </section>

            <section className="martin-overview__section" aria-labelledby="martin-overview-capabilities">
                <div className="martin-overview__section-heading">
                    <div>
                        <h4 id="martin-overview-capabilities">Funciones del asistente</h4>
                        <p>Funciones seleccionadas en la configuración local. No están disponibles públicamente.</p>
                    </div>
                    {onNavigate && (
                        <button
                            type="button"
                            className="martin-overview__section-link"
                            onClick={() => onNavigate("settings")}
                        >
                            Configurar <ArrowRight size={16} />
                        </button>
                    )}
                </div>
                <div className="martin-overview__capabilities">
                    {capabilities.map((capability) => {
                        const Icon = capability.icon;
                        const enabled = Boolean(data[capability.key]);
                        return (
                            <article className="martin-overview__capability" key={capability.key}>
                                <span className="martin-overview__capability-icon" aria-hidden="true">
                                    <Icon size={19} strokeWidth={1.8} />
                                </span>
                                <div className="martin-overview__capability-body">
                                    <div className="martin-overview__capability-title">
                                        <h5>{capability.title}</h5>
                                        <span className={enabled ? "martin-overview__tag martin-overview__tag--enabled" : "martin-overview__tag"}>
                                            {enabled ? "Configurada" : "No configurada"}
                                        </span>
                                    </div>
                                    <p>{capability.description}</p>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </section>

            <section className="martin-overview__security" aria-label="Protección del asistente">
                <ShieldCheck size={21} strokeWidth={1.8} aria-hidden="true" />
                <div>
                    <h4>Acceso controlado a la información</h4>
                    <p>
                        Martín se diseñará para consultar únicamente fuentes autorizadas.
                        No tendrá acceso directo a MongoDB ni a información administrativa o personal.
                        Estas protecciones todavía deben implementarse y verificarse en el backend.
                    </p>
                </div>
                {onNavigate && (
                    <button
                        type="button"
                        onClick={() => onNavigate("security")}
                        className="martin-overview__security-link"
                    >
                        Ver seguridad <ArrowRight size={16} />
                    </button>
                )}
            </section>
        </div>
    );
}

export default MartinOverview;
