import { useState } from "react";
import { Bot, LayoutDashboard, Settings2, BookOpen, ShieldCheck, Activity, ChevronRight } from "lucide-react";
import "../../../styles/pages/administration/martin/MartinManagement.css";

import MartinOverview from "../../../components/administration/martin/MartinOverview";

import MartinSettings from "../../../components/administration/martin/MartinSettings";

import MartinKnowledge from "../../../components/administration/martin/MartinKnowledge";

import MartinSecurity from "../../../components/administration/martin/MartinSecurity";

import MartinActivity from "../../../components/administration/martin/MartinActivity";
import { useMartin } from "../../../context/martin/MartinContext";

// =========================================================
// ADMINISTRACIÓN DEL ASISTENTE MARTÍN
// IGLESIA EL ANCLA
// =========================================================

const managementSections = [
    {
        id: "overview",
        label: "Resumen general",
        description:
            "Consulta el estado del asistente y sus principales indicadores.",
        icon: LayoutDashboard,
    },
    {
        id: "settings",
        label: "Configuración",
        description:
            "Administra la disponibilidad y las funciones permitidas de Martín.",
        icon: Settings2,
    },
    {
        id: "knowledge",
        label: "Base de conocimiento",
        description:
            "Organiza las fuentes y los contenidos que Martín podrá utilizar.",
        icon: BookOpen,
    },
    {
        id: "security",
        label: "Seguridad y límites",
        description:
            "Define restricciones de uso y medidas de protección.",
        icon: ShieldCheck,
    },
    {
        id: "activity",
        label: "Actividad y estadísticas",
        description:
            "Supervisa el uso del asistente y sus consultas.",
        icon: Activity,
    },
];

function MartinManagement() {

    // =====================================================
    // ESTADO DE LA SECCIÓN SELECCIONADA
    // =====================================================

    const [activeSection, setActiveSection] = useState(
        "overview"
    );

    // El estado que mostramos proviene de la configuración guardada.
    const { settings, isLoading, isBackendConnected } = useMartin();
    const assistantStatus = isLoading
        ? "Consultando estado"
        : !isBackendConnected
            ? "No disponible"
            : settings.enabled
                ? "Activo"
                : "Desactivado";

    const selectedSection =
        managementSections.find(
            (section) => section.id === activeSection
        ) || managementSections[0];

    const SelectedIcon = selectedSection.icon;

    // =====================================================
    // RENDERIZADO
    // =====================================================

    return (
        <div className="martin-management">

            {/* ========================================= */}
            {/* ENCABEZADO PRINCIPAL */}
            {/* ========================================= */}

            <header className="martin-management__header">

                

                <div className="martin-management__header-content">

                    <div className="martin-management__heading">

                        <span className="martin-management__eyebrow">
                            Administración del asistente
                        </span>

                        <h1>
                            Gestión de <span>Martín</span>
                        </h1>

                        <p>
                            Configura, supervisa y administra
                            el asistente virtual de Iglesia
                            El Ancla desde un espacio centralizado.
                        </p>

                    </div>

                    <div
                        className="martin-management__identity"
                        aria-hidden="true"
                    >
                        <Bot size={32} strokeWidth={1.6} />
                    </div>

                </div>

            </header>

            {/* ========================================= */}
            {/* INFORMACIÓN DEL ASISTENTE */}
            {/* ========================================= */}

            <section className="martin-management__intro">

                <div className="martin-management__intro-icon">
                    <Bot size={25} strokeWidth={1.7} />
                </div>

                <div className="martin-management__intro-content">

                    <div className="martin-management__intro-title">

                        <h2>Martín, asistente virtual</h2>

                        <span className="martin-management__status">
                            {assistantStatus}
                        </span>

                    </div>

                    <p>
                        Martín ayuda a conocer nuestra iglesia, sus actividades y
                        los recursos bíblicos. Los visitantes pueden consultar
                        opciones de ayuda; las conversaciones están reservadas
                        para personas con una cuenta autorizada.
                    </p>

                </div>

            </section>

            {/* ========================================= */}
            {/* NAVEGACIÓN DE ADMINISTRACIÓN */}
            {/* ========================================= */}

            <section className="martin-management__workspace">

                <div className="martin-management__workspace-heading">

                    <div>
                        <h2>Centro de administración</h2>

                        <p>
                            Selecciona una sección para administrar
                            las capacidades del asistente.
                        </p>
                    </div>

                </div>

                <div className="martin-management__layout">

                    {/* MENÚ INTERNO */}

                    <nav
                        className="martin-management__navigation"
                        aria-label="Secciones de administración de Martín"
                    >

                        {managementSections.map((section) => {

                            const Icon = section.icon;

                            const isActive =
                                activeSection === section.id;

                            return (
                                <button
                                    key={section.id}
                                    type="button"
                                    className={
                                        `martin-management__nav-item ${isActive
                                            ? "martin-management__nav-item--active"
                                            : ""
                                        }`
                                    }
                                    onClick={() =>
                                        setActiveSection(section.id)
                                    }
                                    aria-current={
                                        isActive ? "page" : undefined
                                    }
                                >
                                    <Icon
                                        size={19}
                                        strokeWidth={1.8}
                                    />

                                    <span>{section.label}</span>

                                    <ChevronRight
                                        className="martin-management__nav-arrow"
                                        size={16}
                                    />
                                </button>
                            );
                        })}

                    </nav>

                    {/* CONTENIDO DE LA SECCIÓN */}

                    <div className="martin-management__content">

                        <div className="martin-management__content-heading">

                            <div className="martin-management__content-icon">
                                <SelectedIcon
                                    size={23}
                                    strokeWidth={1.8}
                                />
                            </div>

                            <div>
                                <h3>{selectedSection.label}</h3>

                                <p>
                                    {selectedSection.description}
                                </p>
                            </div>

                        </div>

                        {activeSection === "overview" ? (
                            <MartinOverview onNavigate={setActiveSection} />
                        ) : activeSection === "settings" ? (
                            <MartinSettings />
                        ) : activeSection === "knowledge" ? (
                            <MartinKnowledge />
                        ) : activeSection === "security" ? (
                            <MartinSecurity />
                        ) : activeSection === "activity" ? (
                            <MartinActivity />
                        ) : null}

                    </div>

                </div>

            </section>



        </div>
    );
}

export default MartinManagement;
