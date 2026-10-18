import { useState } from "react";
import { useMartin } from "../../../context/martin/MartinContext";
import {
    Bot, Globe2, Users, BookOpen, Search, Map, Church,
    MessageSquareText, Save, RotateCcw, Info, ShieldCheck,
} from "lucide-react";

import "../../../styles/components/administration/martin/MartinSettings.css";

const cloneSettings = (settings) => ({
    ...settings,
    audiences: { ...settings.audiences },
    capabilities: { ...settings.capabilities },
});

const CAPABILITIES = [
    { key: "churchInformation", icon: Church, title: "Información institucional", description: "Horarios, reuniones, contacto y primera visita." },
    { key: "resourceSearch", icon: Search, title: "Búsqueda de recursos", description: "Encontrar estudios, guías y materiales publicados." },
    { key: "biblicalGuidance", icon: BookOpen, title: "Orientación bíblica", description: "Ayudar a localizar versículos y comprender pasajes." },
    { key: "navigationHelp", icon: Map, title: "Ayuda de navegación", description: "Orientar a los usuarios dentro de la plataforma." },
];

function SettingSwitch({ checked, onChange, label, description, icon: Icon, disabled = false }) {
    return (
        <label className={`martin-settings__switch-row${disabled ? " martin-settings__switch-row--disabled" : ""}`}>
            <span className="martin-settings__switch-icon"><Icon size={19} strokeWidth={1.8} /></span>
            <span className="martin-settings__switch-copy">
                <strong>{label}</strong>
                <small>{description}</small>
            </span>
            <input
                className="martin-settings__switch-input"
                type="checkbox"
                checked={checked}
                onChange={(event) => onChange(event.target.checked)}
                disabled={disabled}
                aria-label={label}
            />
            <span className="martin-settings__switch-track" aria-hidden="true" />
        </label>
    );
}

/**
 * Configuración local de demostración.
 * El backend deberá validar y persistir estos valores antes de habilitar Martín.
 */
function MartinSettings() {
    const { settings: savedSettings, saveSettings } = useMartin();
    const [settings, setSettings] = useState(() => cloneSettings(savedSettings));
    const [notice, setNotice] = useState("");

    const hasChanges = JSON.stringify(settings) !== JSON.stringify(savedSettings);

    const setAudience = (key, value) => {
        setSettings((previous) => ({
            ...previous,
            audiences: { ...previous.audiences, [key]: value },
        }));
        setNotice("");
    };

    const setCapability = (key, value) => {
        setSettings((previous) => ({
            ...previous,
            capabilities: { ...previous.capabilities, [key]: value },
        }));
        setNotice("");
    };

    const saveLocally = (event) => {
        event.preventDefault();
        if (settings.enabled && !Object.values(settings.audiences).some(Boolean)) {
            setNotice("Selecciona al menos un tipo de usuario antes de habilitar a Martín.");
            return;
        }
        try {
            saveSettings(settings);
            setNotice("Configuración aplicada al estado compartido del frontend. No se ha guardado en la base de datos.");
        } catch (error) {
            setNotice(error.message || "No fue posible aplicar la configuración.");
        }
    };

    const discardChanges = () => {
        setSettings(cloneSettings(savedSettings));
        setNotice("Cambios sin aplicar descartados.");
    };

    return (
        <form className="martin-settings" onSubmit={saveLocally}>
            <div className="martin-settings__banner" role="note">
                <Info size={18} />
                <p>Configuración de frontend: los cambios aplicados se comparten entre secciones mientras permanezca abierta la administración. No se guardan en MongoDB ni habilitan a Martín para usuarios.</p>
            </div>

            <section className="martin-settings__section" aria-labelledby="martin-availability-title">
                <div className="martin-settings__section-heading">
                    <span className="martin-settings__section-icon"><Bot size={21} /></span>
                    <div>
                        <h4 id="martin-availability-title">Disponibilidad general</h4>
                        <p>Controla si Martín podrá estar habilitado cuando se integre el asistente.</p>
                    </div>
                </div>
                <SettingSwitch
                    checked={settings.enabled}
                    onChange={(value) => { setSettings((previous) => ({ ...previous, enabled: value })); setNotice(""); }}
                    label="Habilitar Martín"
                    description="Interruptor general del asistente (sin efecto público todavía)."
                    icon={Bot}
                />
                <div className="martin-settings__status">
                    <span className={`martin-settings__status-dot${settings.enabled ? " martin-settings__status-dot--enabled" : ""}`} />
                    {settings.enabled ? "Habilitación seleccionada (solo demostración)" : "Deshabilitado"}
                </div>
            </section>

            <section className="martin-settings__section" aria-labelledby="martin-audiences-title">
                <div className="martin-settings__section-heading">
                    <span className="martin-settings__section-icon"><Users size={21} /></span>
                    <div>
                        <h4 id="martin-audiences-title">Usuarios que podrán utilizarlo</h4>
                        <p>Determina en qué experiencias de la PWA aparecerá Martín.</p>
                    </div>
                </div>
                <div className="martin-settings__switch-list">
                    <SettingSwitch checked={settings.audiences.visitors} onChange={(value) => setAudience("visitors", value)} label="Visitantes y público general" description="Información pública sobre Iglesia El Ancla." icon={Globe2} />
                    <SettingSwitch checked={settings.audiences.members} onChange={(value) => setAudience("members", value)} label="Miembros registrados" description="Información pública y recursos autorizados para miembros." icon={Users} />
                </div>
            </section>

            <section className="martin-settings__section" aria-labelledby="martin-capabilities-title">
                <div className="martin-settings__section-heading">
                    <span className="martin-settings__section-icon"><ShieldCheck size={21} /></span>
                    <div>
                        <h4 id="martin-capabilities-title">Funciones permitidas</h4>
                        <p>Selecciona las tareas que Martín podrá realizar. La autorización efectiva se validará en el backend.</p>
                    </div>
                </div>
                <div className="martin-settings__switch-list">
                    {CAPABILITIES.map(({ key, icon, title, description }) => (
                        <SettingSwitch key={key} checked={settings.capabilities[key]} onChange={(value) => setCapability(key, value)} label={title} description={description} icon={icon} />
                    ))}
                </div>
            </section>

            <section className="martin-settings__section" aria-labelledby="martin-messages-title">
                <div className="martin-settings__section-heading">
                    <span className="martin-settings__section-icon"><MessageSquareText size={21} /></span>
                    <div>
                        <h4 id="martin-messages-title">Mensajes del asistente</h4>
                        <p>Personaliza los textos visibles para visitantes y miembros.</p>
                    </div>
                </div>
                <div className="martin-settings__fields">
                    <label htmlFor="martin-welcome">Mensaje de bienvenida</label>
                    <textarea id="martin-welcome" rows={4} maxLength={500} value={settings.welcomeMessage} onChange={(event) => { setSettings((previous) => ({ ...previous, welcomeMessage: event.target.value })); setNotice(""); }} required />
                    <span className="martin-settings__counter">{settings.welcomeMessage.length}/500 caracteres</span>
                    <label htmlFor="martin-out-of-scope">Respuesta para consultas fuera de alcance</label>
                    <textarea id="martin-out-of-scope" rows={3} maxLength={400} value={settings.outOfScopeMessage} onChange={(event) => { setSettings((previous) => ({ ...previous, outOfScopeMessage: event.target.value })); setNotice(""); }} required />
                    <span className="martin-settings__counter">{settings.outOfScopeMessage.length}/400 caracteres</span>
                </div>
            </section>

            {notice && <p className="martin-settings__notice" role="status">{notice}</p>}
            <div className="martin-settings__actions">
                <button type="button" className="martin-settings__button martin-settings__button--secondary" onClick={discardChanges} disabled={!hasChanges}><RotateCcw size={16} /> Descartar cambios</button>
                <button type="submit" className="martin-settings__button martin-settings__button--primary" disabled={!hasChanges}><Save size={16} /> Aplicar configuración local</button>
            </div>
        </form>
    );
}

export default MartinSettings;
