
import {
  Building2,
  CheckCircle2,
  Church,
  Clock3,
  Database,
  Info,
  LockKeyhole,
  Mail,
  MapPin,
  Settings2,
  ShieldAlert,
  Smartphone,
  UsersRound,
} from "lucide-react";

import "../../../styles/components/super-admin/settings/SettingsSection.css";

// =========================================================
// COMPONENTE AUXILIAR: CAMPO DE INFORMACIÓN
// =========================================================

function InformationField({ label, value, note }) {
  return (
    <div className="settings-section__field">
      <span>{label}</span>

      <strong>{value || "Por configurar"}</strong>

      {note && <small>{note}</small>}
    </div>
  );
}

// =========================================================
// COMPONENTE AUXILIAR: TARJETA DE CONFIGURACIÓN
// =========================================================

function SettingCard({
  icon: Icon,
  title,
  description,
  status = "Pendiente de integración",
}) {
  return (
    <article className="settings-section__option">
      <div className="settings-section__option-icon">
        <Icon
          size={21}
          strokeWidth={1.8}
          aria-hidden="true"
        />
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
// INFORMACIÓN GENERAL
// =========================================================

function GeneralSettings() {
  return (
    <>
      <div className="settings-section__title">
        <Church size={23} aria-hidden="true" />

        <div>
          <h2>Información institucional</h2>
          <p>
            Datos generales que identifican
            a Iglesia El Ancla.
          </p>
        </div>
      </div>

      <div className="settings-section__fields">
        <InformationField
          label="Nombre institucional"
          value="Iglesia El Ancla Comunidad Cristiana"
        />

        <InformationField
          label="Sede de referencia"
          value="Playa Ancha, Valparaíso"
        />

        <InformationField
          label="Correo institucional"
          note="Se incorporará cuando esté confirmado."
        />

        <InformationField
          label="Teléfono institucional"
          note="Se incorporará cuando esté confirmado."
        />
      </div>

      <div className="settings-section__subheading">
        <h3>Datos de contacto y presentación</h3>
        <p>
          Estos parámetros podrán utilizarse en
          las páginas públicas de la aplicación.
        </p>
      </div>

      <div className="settings-section__options">
        <SettingCard
          icon={Mail}
          title="Información de contacto"
          description="Administración futura de correos, teléfonos y medios de contacto institucional."
        />

        <SettingCard
          icon={MapPin}
          title="Ubicación y direcciones"
          description="Gestión futura de las ubicaciones que se muestran a los visitantes."
        />
      </div>
    </>
  );
}

// =========================================================
// SUCURSALES
// =========================================================

function BranchSettings() {
  return (
    <>
      <div className="settings-section__title">
        <Building2 size={23} aria-hidden="true" />

        <div>
          <h2>Gestión de sucursales</h2>
          <p>
            Organización de sedes y asignación
            territorial de usuarios.
          </p>
        </div>
      </div>

      <div className="settings-section__branch">
        <div className="settings-section__branch-icon">
          <Church size={25} aria-hidden="true" />
        </div>

        <div className="settings-section__branch-content">
          <strong>El Ancla — Playa Ancha</strong>
          <span>Valparaíso, Chile</span>
          <small>
            Sede de referencia del proyecto.
            Los datos operativos se cargarán
            desde MongoDB.
          </small>
        </div>

        <span className="settings-section__reference">
          Referencia
        </span>
      </div>

      <div className="settings-section__subheading">
        <h3>Administración de sedes</h3>
        <p>
          El sistema deberá utilizar el modelo
          Sucursal existente en el backend.
        </p>
      </div>

      <div className="settings-section__options">
        <SettingCard
          icon={Building2}
          title="Registro de sucursales"
          description="Consultar, crear y actualizar sedes autorizadas."
        />

        <SettingCard
          icon={UsersRound}
          title="Usuarios por sucursal"
          description="Consultar las sucursales asignadas y la sede principal de cada usuario."
        />

        <SettingCard
          icon={Database}
          title="Estado de las sucursales"
          description="Gestionar la activación y desactivación de sedes con validaciones de integridad."
        />
      </div>
    </>
  );
}

// =========================================================
// SEGURIDAD
// =========================================================

function SecuritySettings() {
  return (
    <>
      <div className="settings-section__title">
        <LockKeyhole size={23} aria-hidden="true" />

        <div>
          <h2>Seguridad del sistema</h2>
          <p>
            Políticas de autenticación y
            protección de cuentas.
          </p>
        </div>
      </div>

      <div className="settings-section__security-notice">
        <ShieldAlert size={20} aria-hidden="true" />

        <p>
          Las políticas de seguridad deben aplicarse
          en el servidor. Los controles de esta
          sección no están habilitados hasta
          implementar y verificar sus endpoints.
        </p>
      </div>

      <div className="settings-section__options">
        <SettingCard
          icon={Clock3}
          title="Duración de las sesiones"
          description="Consultar y administrar políticas de expiración de sesión, sin exponer secretos JWT."
        />

        <SettingCard
          icon={LockKeyhole}
          title="Bloqueo de cuentas"
          description="Definir reglas de intentos fallidos, bloqueos temporales y recuperación."
        />

        <SettingCard
          icon={ShieldAlert}
          title="Protección de administradores"
          description="Restringir cambios de rol y operaciones sobre cuentas privilegiadas."
        />

        <SettingCard
          icon={CheckCircle2}
          title="Verificación de cuentas"
          description="Revisar las políticas de verificación y cambio obligatorio de contraseña."
        />
      </div>
    </>
  );
}

// =========================================================
// PREFERENCIAS
// =========================================================

function PreferencesSettings() {
  return (
    <>
      <div className="settings-section__title">
        <Settings2 size={23} aria-hidden="true" />

        <div>
          <h2>Preferencias generales</h2>
          <p>
            Parámetros de funcionamiento
            de la aplicación.
          </p>
        </div>
      </div>

      <div className="settings-section__options">
        <SettingCard
          icon={Smartphone}
          title="Aplicación PWA"
          description="Opciones futuras de presentación, instalación y actualización de la aplicación."
        />

        <SettingCard
          icon={Mail}
          title="Notificaciones"
          description="Preferencias futuras para comunicaciones y avisos del sistema."
        />

        <SettingCard
          icon={Clock3}
          title="Zona horaria"
          description="Configuración de horarios y fechas por sucursal."
        />

        <SettingCard
          icon={Database}
          title="Parámetros generales"
          description="Configuraciones operativas que podrán almacenarse y administrarse desde el backend."
        />
      </div>
    </>
  );
}

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

const SECTION_COMPONENTS = {
  general: GeneralSettings,
  branches: BranchSettings,
  security: SecuritySettings,
  preferences: PreferencesSettings,
};

function SettingsSection({ activeSection }) {
  const SectionComponent =
    SECTION_COMPONENTS[activeSection] ||
    GeneralSettings;

  return (
    <section className="settings-section">
      <SectionComponent />

      <div className="settings-section__footer">
        <Info size={17} aria-hidden="true" />

        <span>
          Vista de referencia. No se realizan
          modificaciones en la base de datos.
        </span>
      </div>
    </section>
  );
}

export default SettingsSection;
