// =========================================================
// CONTENEDOR DE LAS SECCIONES DE CONFIGURACIÓN
// =========================================================
import {
  Clock3,
  Database,
  Info,
  Mail,
  Settings2,
  Smartphone,
} from "lucide-react";

import GeneralSettings from "./GeneralSettings";
import BranchSettings from "./BranchSettings";
import SecuritySettings from "./SecuritySettings";

import "../../../styles/components/super-admin/settings/SettingsSection.css";

// Tarjeta temporal: únicamente para las preferencias pendientes.
function SettingCard({ icon: Icon, title, description, status = "Pendiente de integración" }) {
  return (
    <article className="settings-section__option">
      <div className="settings-section__option-icon">
        <Icon size={21} strokeWidth={1.8} aria-hidden="true" />
      </div>
      <div className="settings-section__option-content">
        <h3>{title}</h3>
        <p>{description}</p>
        <span>{status}</span>
      </div>
    </article>
  );
}

// =========================================================
// PREFERENCIAS — VISTA DE REFERENCIA
// =========================================================
// Por ahora se conserva intacta su funcionalidad informativa.
function PreferencesSettings() {
  return (
    <>
      <div className="settings-section__title">
        <Settings2 size={23} aria-hidden="true" />
        <div>
          <h2>Preferencias generales</h2>
          <p>Parámetros de funcionamiento de la aplicación.</p>
        </div>
      </div>
      <div className="settings-section__options">
        <SettingCard icon={Smartphone} title="Aplicación PWA" description="Opciones futuras de presentación, instalación y actualización de la aplicación." />
        <SettingCard icon={Mail} title="Notificaciones" description="Preferencias futuras para comunicaciones y avisos del sistema." />
        <SettingCard icon={Clock3} title="Zona horaria" description="Configuración de horarios y fechas por sucursal." />
        <SettingCard icon={Database} title="Parámetros generales" description="Configuraciones operativas que podrán almacenarse y administrarse desde el backend." />
      </div>
    </>
  );
}

const SECTION_COMPONENTS = {
  general: GeneralSettings,
  branches: BranchSettings,
  security: SecuritySettings,
  preferences: PreferencesSettings,
};

function SettingsSection({ activeSection }) {
  const SectionComponent = SECTION_COMPONENTS[activeSection] || GeneralSettings;

  const messages = {
    general: "Los datos institucionales se consultan y actualizan en MongoDB mediante rutas protegidas para superadministradores.",
    branches: "Las sucursales y sus asignaciones se administran mediante rutas protegidas y se almacenan en MongoDB.",
    security: "Las políticas de seguridad se aplican en el backend. Esta vista es informativa y todavía no permite modificarlas.",
    preferences: "Esta sección es de referencia. Las preferencias aún no se pueden modificar desde la interfaz.",
  };

  return (
    <section className="settings-section">
      <SectionComponent />
      <div className="settings-section__footer">
        <Info size={17} aria-hidden="true" />
        <span>{messages[activeSection] || messages.general}</span>
      </div>
    </section>
  );
}

export default SettingsSection;
