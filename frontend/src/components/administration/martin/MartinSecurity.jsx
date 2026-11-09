import { useEffect, useState } from "react";
import { ShieldCheck, Save, Info, RotateCcw } from "lucide-react";
import { useMartin } from "../../../context/martin/MartinContext";
import "../../../styles/components/administration/martin/MartinSecurity.css";
import "../../../styles/components/administration/martin/MartinSecurityPolish.css";

// Únicamente exponemos controles que el backend aplica realmente.
const CONTROLS = [
  ["memberDailyLimit", "Mensajes diarios por miembro", "Cantidad máxima de preguntas que puede hacer cada miembro al día.", 1, 100],
  ["adminDailyLimit", "Mensajes diarios por administrador", "Cantidad máxima de preguntas diarias para quienes administran la iglesia.", 1, 100],
  ["maxMessageLength", "Caracteres por mensaje", "Cantidad máxima de letras y espacios que puede escribir una persona.", 100, 700],
  ["abuseStrikeLimit", "Advertencias por abuso", "Cantidad de intentos indebidos antes de suspender temporalmente la conversación.", 2, 10],
  ["abuseBlockMinutes", "Duración de la pausa (minutos)", "Tiempo que Martín dejará de responder después de un uso indebido reiterado.", 5, 1440],
];

export default function MartinSecurity() {
  const { security, saveSecurity, isBackendConnected, isLoading, backendError } = useMartin();
  const [draft, setDraft] = useState({ ...security });
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  // Actualizamos los campos cuando MongoDB termina de responder.
  useEffect(() => { setDraft({ ...security }); }, [security]);

  const changed = CONTROLS.some(([key]) => Number(draft[key]) !== Number(security[key]));
  const update = (key, value) => { setDraft(current => ({ ...current, [key]: value })); setNotice(""); };

  const save = async (event) => {
    event.preventDefault();
    const next = { ...draft };
    for (const [key, label, , min, max] of CONTROLS) {
      const value = Number(next[key]);
      if (!Number.isInteger(value) || value < min || value > max) {
        setNotice(`Revisa «${label}»: debe estar entre ${min} y ${max}.`);
        return;
      }
      next[key] = value;
    }
    try {
      setSaving(true);
      await saveSecurity(next);
      setNotice("La configuración de seguridad se guardó correctamente.");
    } catch (error) {
      setNotice(error.response?.data?.message || "No fue posible guardar estos cambios.");
    } finally { setSaving(false); }
  };

  return (
    <div className="martin-security">
      <div className="martin-security__notice" role="note">
        <Info size={18} />
        <p>{isLoading ? "Cargando límites de Martín…" : isBackendConnected
          ? "Estos límites protegen el uso de Martín. Los visitantes no pueden conversar libremente y la protección de la información privada permanece siempre activa."
          : `No pudimos cargar los límites. ${backendError}`}</p>
      </div>
      <div className="martin-security__summary">
        <div className="martin-security__summary-item"><ShieldCheck size={22}/><div><strong>Protección obligatoria</strong><small>Protección de información privada e intentos de uso indebido</small></div></div>
      </div>
      <form onSubmit={save}>
        <section className="martin-security__panel">
          <div className="martin-security__panel-heading"><ShieldCheck size={22}/><div><h4>Seguridad y límites</h4><p>Establece cuántas preguntas puede recibir y cuándo debe hacer una pausa.</p></div></div>
          <div className="martin-security__limits-grid">
            {CONTROLS.map(([key, label, description, min, max]) => (
              <div className="martin-security__limit" key={key}>
                <label htmlFor={`martin-${key}`}>{label}</label>
                <p>{description}</p>
                <div className="martin-security__number-wrap">
                  <input id={`martin-${key}`} type="number" min={min} max={max} step="1" value={draft[key]} onChange={event => update(key, event.target.value)} disabled={!isBackendConnected || saving}/>
                  <span>Máx. {max}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
        {notice && <p role="status" className="martin-security__notice">{notice}</p>}
        <div className="martin-security__actions">
          <button
            className="martin-security__action-button martin-security__action-button--secondary"
            type="button"
            onClick={() => { setDraft({ ...security }); setNotice("Cambios descartados."); }}
            disabled={!changed || saving}
          >
            <RotateCcw size={17} aria-hidden="true" />
            Descartar cambios
          </button>
          <button
            className="martin-security__action-button martin-security__action-button--primary"
            type="submit"
            disabled={!changed || saving || !isBackendConnected}
          >
            <Save size={17} aria-hidden="true" />
            {saving ? "Guardando…" : "Guardar límites"}
          </button>
        </div>
      </form>
    </div>
  );
}
