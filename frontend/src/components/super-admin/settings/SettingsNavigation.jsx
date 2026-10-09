
import {
  Building2,
  Church,
  LockKeyhole,
  SlidersHorizontal,
} from "lucide-react";

import "../../../styles/components/super-admin/settings/SettingsNavigation.css";

// =========================================================
// SECCIONES DISPONIBLES
// =========================================================

export const SETTINGS_SECTIONS = [
  {
    id: "general",
    title: "Información general",
    description: "Identidad y datos institucionales",
    icon: Church,
  },
  {
    id: "branches",
    title: "Sucursales",
    description: "Sedes y organización territorial",
    icon: Building2,
  },
  {
    id: "security",
    title: "Seguridad",
    description: "Sesiones y protección de cuentas",
    icon: LockKeyhole,
  },
  {
    id: "preferences",
    title: "Preferencias",
    description: "Parámetros de funcionamiento",
    icon: SlidersHorizontal,
  },
];

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function SettingsNavigation({
  activeSection,
  onSectionChange,
}) {
  return (
    <nav
      className="settings-navigation"
      aria-label="Secciones de configuración"
    >
      <div className="settings-navigation__heading">
        <span>CONFIGURACIÓN</span>
        <h2>Secciones</h2>
      </div>

      <div className="settings-navigation__items">
        {SETTINGS_SECTIONS.map((section) => {
          const Icon = section.icon;

          const isActive =
            activeSection === section.id;

          return (
            <button
              key={section.id}
              type="button"
              className={[
                "settings-navigation__item",
                isActive
                  ? "settings-navigation__item--active"
                  : "",
              ].join(" ")}
              onClick={() =>
                onSectionChange(section.id)
              }
              aria-current={
                isActive ? "page" : undefined
              }
            >
              <span className="settings-navigation__icon">
                <Icon
                  size={20}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              </span>

              <span className="settings-navigation__content">
                <strong>{section.title}</strong>
                <small>{section.description}</small>
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default SettingsNavigation;
