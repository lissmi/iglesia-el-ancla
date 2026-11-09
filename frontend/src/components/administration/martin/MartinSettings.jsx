
import { useState, useEffect } from "react";
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
 * Las opciones se guardan en la configuración de la iglesia.
 * El servidor comprueba los permisos antes de aplicar los cambios.
 */
function MartinSettings() {
    const { settings: savedSettings, saveSettings, isBackendConnected, isLoading, backendError } = useMartin();
    const [settings, setSettings] = useState(() => cloneSettings(savedSettings));
    const [notice, setNotice] = useState("");
    const [saving, setSaving] = useState(false);
    // Evita que el interruptor muestre un estado no guardado.
    const [savingAvailability, setSavingAvailability] = useState(false);
    useEffect(() => { setSettings(cloneSettings(savedSettings)); }, [savedSettings]);

    const hasChanges = JSON.stringify(settings) !== JSON.stringify(savedSettings);

    // La disponibilidad general se guarda de inmediato, sin exigir otro clic.
    // También se guardan los demás cambios visibles si el formulario fue editado.
    const toggleAvailability = async (enabled) => {
        // No enviamos solicitudes repetidas ni cambios con el servidor desconectado.
        if (saving || savingAvailability || !isBackendConnected || isLoading) return;

        const previousSettings = cloneSettings(settings);
        const nextSettings = { ...cloneSettings(settings), enabled };

        // Si se habilita Martín, debe haber al menos un público seleccionado.
        if (enabled && !Object.values(nextSettings.audiences).some(Boolean)) {
            setNotice("Selecciona quién podrá utilizar a Martín antes de activarlo.");
            return;
        }

        setSavingAvailability(true);
        setNotice("Guardando el cambio de Martín…");

        try {
            // Esperamos que el servidor confirme el guardado en MongoDB.
            await saveSettings(nextSettings);
            setNotice(enabled
                ? "Martín quedó activado. Los cambios ya están guardados."
                : "Martín quedó desactivado. Los cambios ya están guardados.");
        } catch (error) {
            // Ante un error, mostramos la configuración anterior, sin fingir éxito.
            setSettings(previousSettings);
            setNotice(error.response?.data?.message ||
                "No pudimos guardar el cambio. Inténtalo nuevamente.");
        } finally {
            setSavingAvailability(false);
        }
    };

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

    const saveConfiguration = async (event) => {
        event.preventDefault();
        if (settings.enabled && !Object.values(settings.audiences).some(Boolean)) {
            setNotice("Selecciona al menos un tipo de usuario antes de habilitar a Martín.");
            return;
        }
        try {
            if (savingAvailability) return;
            setSaving(true);
            await saveSettings(settings);
            setNotice("Los cambios se guardaron correctamente y ya se aplican en Martín.");
        } catch (error) {
            setNotice(error.response?.data?.message || error.message || "No fue posible guardar la configuración.");
        } finally { setSaving(false); }
    };

    const discardChanges = () => {
        setSettings(cloneSettings(savedSettings));
        setNotice("Cambios sin aplicar descartados.");
    };

    return (
        <form className="martin-settings" onSubmit={saveConfiguration}>
            <div className="martin-settings__banner" role="note">
                <Info size={18} />
                <p>{isLoading ? "Consultando la configuración de Martín…" : isBackendConnected ? "Los cambios que guardes se aplicarán a Martín. Las visitas sin iniciar sesión solo podrán ver un saludo y opciones de ayuda." : `No pudimos cargar la configuración. ${backendError}`}</p>
            </div>

            <section className="martin-settings__section" aria-labelledby="martin-availability-title">
                <div className="martin-settings__section-heading">
                    <span className="martin-settings__section-icon"><Bot size={21} /></span>
                    <div>
                        <h4 id="martin-availability-title">Disponibilidad general</h4>
                        <p>Decide si Martín puede responder a los usuarios registrados.</p>
                    </div>
                </div>
                <SettingSwitch
                    checked={settings.enabled}
                    onChange={toggleAvailability}
                    label="Habilitar Martín"
                    description="Este cambio se guarda automáticamente al pulsar el interruptor."
                    disabled={savingAvailability || saving || !isBackendConnected || isLoading}
                    icon={Bot}
                />
                <div className="martin-settings__status">
                    <span className={`martin-settings__status-dot${settings.enabled ? " martin-settings__status-dot--enabled" : ""}`} />
                    {savingAvailability ? "Guardando cambio…" : settings.enabled ? "Martín habilitado" : "Martín desactivado"}
                </div>
            </section>

            <section className="martin-settings__section" aria-labelledby="martin-audiences-title">
                <div className="martin-settings__section-heading">
                    <span className="martin-settings__section-icon"><Users size={21} /></span>
                    <div>
                        <h4 id="martin-audiences-title">Usuarios que podrán utilizarlo</h4>
                        <p>Selecciona quién podrá ver a Martín y recibir su ayuda.</p>
                    </div>
                </div>
                <div className="martin-settings__switch-list">
                    <SettingSwitch checked={settings.audiences.visitors} onChange={(value) => setAudience("visitors", value)} label="Visitantes y público general" description="Pueden ver un saludo y elegir opciones de ayuda, sin conversar libremente." icon={Globe2} />
                    <SettingSwitch checked={settings.audiences.members} onChange={(value) => setAudience("members", value)} label="Miembros registrados" description="Información pública y recursos autorizados para miembros." icon={Users} />
                </div>
            </section>

            <section className="martin-settings__section" aria-labelledby="martin-capabilities-title">
                <div className="martin-settings__section-heading">
                    <span className="martin-settings__section-icon"><ShieldCheck size={21} /></span>
                    <div>
                        <h4 id="martin-capabilities-title">Funciones permitidas</h4>
                        <p>Elige los temas en los que Martín puede ayudar a la comunidad.</p>
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
                <button type="button" className="martin-settings__button martin-settings__button--secondary" onClick={discardChanges} disabled={!hasChanges || saving || savingAvailability}><RotateCcw size={16} /> Descartar cambios</button>
                <button type="submit" className="martin-settings__button martin-settings__button--primary" disabled={!hasChanges || saving || savingAvailability || !isBackendConnected}><Save size={16} /> Guardar configuración</button>
            </div>
        </form>
    );
}

export default MartinSettings;




