

import { useState } from "react";

import { Link } from "react-router-dom";

import {
  ArrowLeft,
  Info,
  Settings,
  ShieldCheck,
} from "lucide-react";

// =========================================================
// COMPONENTES
// =========================================================

import SettingsNavigation from "../../../components/super-admin/settings/SettingsNavigation";

import SettingsSection from "../../../components/super-admin/settings/SettingsSection";

// =========================================================
// ESTILOS
// =========================================================

import "../../../styles/pages/super-admin/system/SystemSettings.css";

// =========================================================
// PÁGINA PRINCIPAL
// =========================================================

function SystemSettings() {
  // Controla la sección seleccionada.
  // No representa datos persistidos.

  const [activeSection, setActiveSection] =
    useState("general");

  return (
    <div className="system-settings-page">

      {/* ============================================= */}
      {/* VOLVER AL PANEL */}
      {/* ============================================= */}

      <div className="system-settings-page__navigation">
        <Link
          to="/super-admin"
          className="system-settings-page__back"
        >
          <ArrowLeft
            size={17}
            strokeWidth={2}
            aria-hidden="true"
          />

          <span>Volver al panel</span>
        </Link>
      </div>

      {/* ============================================= */}
      {/* ENCABEZADO */}
      {/* ============================================= */}

      <header className="system-settings-page__header">
        <div>
          <span className="system-settings-page__eyebrow">
            SISTEMA / CONFIGURACIÓN
          </span>

          <h1>Configuración del sistema</h1>

          <p>
            Consulta la información institucional,
            las sucursales y los parámetros generales
            de funcionamiento de Iglesia El Ancla.
          </p>
        </div>

        <div className="system-settings-page__badge">
          <ShieldCheck
            size={17}
            aria-hidden="true"
          />

          <span>Solo superadministrador</span>
        </div>
      </header>

      {/* ============================================= */}
      {/* AVISO DE ESTADO */}
      {/* ============================================= */}

      <div
        className="system-settings-page__notice"
        role="note"
      >
        <Info
          size={20}
          aria-hidden="true"
        />

        <div>
          <strong>Administración de la iglesia</strong>

          <p>
            Consulta y administra la información de la iglesia
            desde cada sección. Algunas funciones avanzadas
            se incorporarán por etapas.
          </p>
        </div>
      </div>

      {/* ============================================= */}
      {/* ÁREA DE CONFIGURACIÓN */}
      {/* ============================================= */}

      <div className="system-settings-page__layout">

        {/* Menú de secciones */}

        <SettingsNavigation
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        {/* Contenido seleccionado */}

        <SettingsSection
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

      </div>

      {/* ============================================= */}
      {/* INFORMACIÓN INFERIOR */}
      {/* ============================================= */}

      <footer className="system-settings-page__footer">
        <Settings
          size={17}
          aria-hidden="true"
        />

        <span>
          La configuración institucional se administra con
          permisos especiales para el superadministrador.
        </span>
      </footer>

    </div>
  );
}

export default SystemSettings;
