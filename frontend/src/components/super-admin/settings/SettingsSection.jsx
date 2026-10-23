// =========================================================
// CONTENEDOR DE CONFIGURACIÓN — IGLESIA EL ANCLA
// =========================================================

import { Info } from "lucide-react";
import GeneralSettings from "./GeneralSettings";
import BranchSettings from "./BranchSettings";
import SecuritySettings from "./SecuritySettings";
import PreferencesSettings from "./PreferencesSettings";

import "../../../styles/components/super-admin/settings/SettingsSection.css";

const SECTION_COMPONENTS = {
  general: GeneralSettings,
  branches: BranchSettings,
  security: SecuritySettings,
  preferences: PreferencesSettings,
};

const SECTION_MESSAGES = {
  general: "La información institucional se guarda y administra desde esta sección.",
  branches: "Los datos de las sedes y sus horarios se administran desde Sucursales.",
  security: "Las medidas de seguridad se aplican automáticamente para proteger las cuentas.",
  preferences: "Resumen de información y accesos útiles. Los cambios se realizan desde su sección correspondiente.",
};

function SettingsSection({ activeSection, onSectionChange }) {
  const SectionComponent = SECTION_COMPONENTS[activeSection] || GeneralSettings;

  return (
    <section className="settings-section">
      <SectionComponent onSectionChange={onSectionChange} />
      <div className="settings-section__footer">
        <Info size={17} aria-hidden="true" />
        <span>{SECTION_MESSAGES[activeSection] || SECTION_MESSAGES.general}</span>
      </div>
    </section>
  );
}

export default SettingsSection;
