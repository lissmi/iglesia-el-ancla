import { useState } from "react";
import { useMartin, DEFAULT_MARTIN_SECURITY } from "../../../context/martin/MartinContext";
import {
    ShieldCheck,
    LockKeyhole,
    Gauge,
    MessageSquareWarning,
    AlertTriangle,
    RotateCcw,
    Save,
    Info,
    CheckCircle2,
    Server,
    EyeOff,
} from "lucide-react";

import "../../../styles/components/administration/martin/MartinSecurity.css";

const clampInteger = (value, min, max) => {
    const number = Number(value);
    if (!Number.isFinite(number)) return min;
    return Math.min(max, Math.max(min, Math.trunc(number)));
};

function SecurityToggle({ id, title, description, checked, onChange, locked = false }) {
    return (
        <div className="martin-security__setting">
            <div className="martin-security__setting-copy">
                <label htmlFor={id}>{title}</label>
                <p>{description}</p>
                {locked && <span className="martin-security__required">Protección obligatoria</span>}
            </div>
            <input
                id={id}
                type="checkbox"
                className="martin-security__switch"
                checked={checked}
                onChange={(event) => onChange(event.target.checked)}
                disabled={locked}
            />
        </div>
    );
}

function LimitField({ id, label, description, value, min, max, onChange }) {
    return (
        <div className="martin-security__limit">
            <label htmlFor={id}>{label}</label>
            <p>{description}</p>
            <div className="martin-security__number-wrap">
                <input
                    id={id}
                    type="number"
                    min={min}
                    max={max}
                    step="1"
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                />
                <span>Máx. {max}</span>
            </div>
        </div>
    );
}

function MartinSecurity() {
    const { security: applied, saveSecurity } = useMartin();
    const [draft, setDraft] = useState(() => ({ ...applied }));
    const [notice, setNotice] = useState("");

    const update = (key, value) => {
        setDraft((previous) => ({ ...previous, [key]: value }));
        setNotice("");
    };

    const hasChanges = JSON.stringify(draft) !== JSON.stringify(applied);

    const applyDemo = (event) => {
        event.preventDefault();
        const next = {
            ...draft,
            visitorDailyLimit: clampInteger(draft.visitorDailyLimit, 1, 100),
            memberDailyLimit: clampInteger(draft.memberDailyLimit, 1, 200),
            maxMessageLength: clampInteger(draft.maxMessageLength, 100, 2000),
            maxConversationTurns: clampInteger(draft.maxConversationTurns, 1, 30),
            fallbackMessage: draft.fallbackMessage.trim(),
        };
        if (!next.fallbackMessage) {
            setNotice("Debes escribir un mensaje para consultas fuera de alcance.");
            return;
        }
        try {
            saveSecurity(next);
            setDraft(next);
            setNotice("Configuración aplicada al frontend. No se ha guardado en la base de datos.");
        } catch (error) {
            setNotice(error.message || "No fue posible aplicar la configuración.");
        }
    };

    const discardChanges = () => {
        setDraft({ ...applied });
        setNotice("Se descartaron los cambios sin aplicar.");
    };

    const resetDefaults = () => {
        setDraft({ ...DEFAULT_MARTIN_SECURITY });
        setNotice("Valores predeterminados cargados. Pulsa «Aplicar configuración local» para confirmarlos.");
    };

    return (
        <div className="martin-security">
            <div className="martin-security__banner" role="note">
                <ShieldCheck size={23} aria-hidden="true" />
                <div>
                    <strong>Seguridad por diseño</strong>
                    <p>Martín solo deberá acceder a fuentes autorizadas. La autenticación, las restricciones y los límites de consumo se aplicarán en el backend, nunca exclusivamente en el navegador.</p>
                </div>
            </div>

            <div className="martin-security__summary" aria-label="Estado de implementación">
                <div className="martin-security__summary-item">
                    <span className="martin-security__summary-icon"><LockKeyhole size={19} /></span>
                    <div><strong>Datos privados</strong><small>Acceso no permitido</small></div>
                </div>
                <div className="martin-security__summary-item">
                    <span className="martin-security__summary-icon"><Gauge size={19} /></span>
                    <div><strong>Límites de uso</strong><small>Configuración de prueba</small></div>
                </div>
                <div className="martin-security__summary-item">
                    <span className="martin-security__summary-icon"><Server size={19} /></span>
                    <div><strong>Protección del servidor</strong><small>Pendiente de integración</small></div>
                </div>
            </div>

            <form onSubmit={applyDemo}>
                <section className="martin-security__panel" aria-labelledby="martin-security-scope">
                    <div className="martin-security__panel-heading">
                        <span className="martin-security__panel-icon"><MessageSquareWarning size={20} /></span>
                        <div>
                            <h4 id="martin-security-scope">Alcance de las respuestas</h4>
                            <p>Determina qué solicitudes debe aceptar o rechazar el asistente.</p>
                        </div>
                    </div>
                    <div className="martin-security__settings">
                        <SecurityToggle
                            id="martin-restrict-topics"
                            title="Limitar a temas de Iglesia El Ancla"
                            description="Rechazar consultas ajenas a la iglesia, sus actividades y los recursos bíblicos autorizados."
                            checked={draft.restrictToChurchTopics}
                            onChange={(value) => update("restrictToChurchTopics", value)}
                        />
                        <SecurityToggle
                            id="martin-reject-sensitive"
                            title="Rechazar solicitudes de información sensible"
                            description="Impedir respuestas que soliciten credenciales, datos internos o información privada."
                            checked={draft.rejectSensitiveRequests}
                            onChange={() => {}}
                            locked
                        />
                        <SecurityToggle
                            id="martin-avoid-personal"
                            title="Prohibir acceso a datos personales"
                            description="Martín no podrá consultar datos privados de miembros, administradores o donantes."
                            checked={draft.avoidPersonalData}
                            onChange={() => {}}
                            locked
                        />
                        <SecurityToggle
                            id="martin-injection"
                            title="Protección frente a manipulación de instrucciones"
                            description="Preparar la detección de intentos de cambiar el rol del asistente o revelar sus instrucciones."
                            checked={draft.blockPromptInjection}
                            onChange={(value) => update("blockPromptInjection", value)}
                        />
                    </div>
                </section>

                <section className="martin-security__panel" aria-labelledby="martin-security-limits">
                    <div className="martin-security__panel-heading">
                        <span className="martin-security__panel-icon"><Gauge size={20} /></span>
                        <div>
                            <h4 id="martin-security-limits">Límites de uso</h4>
                            <p>Valores propuestos para controlar el abuso y el consumo de la API.</p>
                        </div>
                    </div>
                    <div className="martin-security__limits-grid">
                        <LimitField
                            id="martin-visitor-limit"
                            label="Consultas diarias por visitante"
                            description="Cantidad máxima sugerida por sesión o identidad anónima."
                            value={draft.visitorDailyLimit}
                            min={1}
                            max={100}
                            onChange={(value) => update("visitorDailyLimit", value)}
                        />
                        <LimitField
                            id="martin-member-limit"
                            label="Consultas diarias por miembro"
                            description="Cantidad máxima sugerida por usuario autenticado."
                            value={draft.memberDailyLimit}
                            min={1}
                            max={200}
                            onChange={(value) => update("memberDailyLimit", value)}
                        />
                        <LimitField
                            id="martin-message-length"
                            label="Caracteres por mensaje"
                            description="Longitud máxima de una consulta enviada al asistente."
                            value={draft.maxMessageLength}
                            min={100}
                            max={2000}
                            onChange={(value) => update("maxMessageLength", value)}
                        />
                        <LimitField
                            id="martin-conversation-turns"
                            label="Mensajes por conversación"
                            description="Máximo de mensajes del usuario por conversación."
                            value={draft.maxConversationTurns}
                            min={1}
                            max={30}
                            onChange={(value) => update("maxConversationTurns", value)}
                        />
                    </div>
                    <p className="martin-security__hint"><Info size={15} /> Los límites diarios no sustituyen los límites por IP, los controles de concurrencia ni un presupuesto máximo de API configurado en el servidor.</p>
                </section>

                <section className="martin-security__panel" aria-labelledby="martin-security-monitoring">
                    <div className="martin-security__panel-heading">
                        <span className="martin-security__panel-icon"><EyeOff size={20} /></span>
                        <div>
                            <h4 id="martin-security-monitoring">Prevención y supervisión</h4>
                            <p>Opciones para preparar la detección de usos indebidos.</p>
                        </div>
                    </div>
                    <div className="martin-security__settings">
                        <SecurityToggle
                            id="martin-abuse-detection"
                            title="Detectar patrones de uso abusivo"
                            description="Identificar solicitudes repetitivas, intentos de extracción de información y actividad inusual."
                            checked={draft.enableAbuseDetection}
                            onChange={(value) => update("enableAbuseDetection", value)}
                        />
                        <SecurityToggle
                            id="martin-security-logs"
                            title="Registrar eventos de seguridad"
                            description="Guardar eventos técnicos mínimos, evitando almacenar datos personales o conversaciones completas sin necesidad."
                            checked={draft.logSecurityEvents}
                            onChange={(value) => update("logSecurityEvents", value)}
                        />
                    </div>
                </section>

                <section className="martin-security__panel" aria-labelledby="martin-security-response">
                    <div className="martin-security__panel-heading">
                        <span className="martin-security__panel-icon"><AlertTriangle size={20} /></span>
                        <div>
                            <h4 id="martin-security-response">Respuesta fuera de alcance</h4>
                            <p>Mensaje orientativo cuando una pregunta no corresponde a las funciones de Martín.</p>
                        </div>
                    </div>
                    <label className="martin-security__field-label" htmlFor="martin-fallback">Mensaje de respuesta</label>
                    <textarea
                        id="martin-fallback"
                        rows={3}
                        maxLength={400}
                        value={draft.fallbackMessage}
                        onChange={(event) => update("fallbackMessage", event.target.value)}
                    />
                    <small className="martin-security__char-count">{draft.fallbackMessage.length}/400 caracteres</small>
                </section>

                <div className="martin-security__footer">
                    <div className="martin-security__footer-copy">
                        <Info size={17} />
                        <span>Los cambios se comparten entre secciones mientras el panel permanezca abierto; no se guardan en MongoDB.</span>
                    </div>
                    <div className="martin-security__actions">
                        <button type="button" className="martin-security__button martin-security__button--text" onClick={resetDefaults}>
                            <RotateCcw size={16} /> Restaurar valores
                        </button>
                        <button type="button" className="martin-security__button martin-security__button--secondary" onClick={discardChanges} disabled={!hasChanges}>
                            Descartar
                        </button>
                        <button type="submit" className="martin-security__button martin-security__button--primary" disabled={!hasChanges}>
                            <Save size={16} /> Aplicar configuración local
                        </button>
                    </div>
                </div>
                {notice && (
                    <p className="martin-security__notice" role="status">
                        <CheckCircle2 size={17} /> {notice}
                    </p>
                )}
            </form>
        </div>
    );
}

export default MartinSecurity;
