// =========================================================
// NUEVO MOVIMIENTO: REVISAR ESTADO O AJUSTAR CANTIDAD
// No hay traslados porque no administramos ubicaciones.
// =========================================================
import { useEffect, useState } from "react";
import { ArrowLeftRight, ClipboardCheck, Save, X } from "lucide-react";
import { belongingsConditions } from "../../../data/belongings/belongingsDemoData";
import "../../../styles/components/administration/belongings/BelongingMovementModal.css";

const blank = () => ({ belongingId: "", type: "inspection", newCondition: "good", delta: "1", description: "" });

function BelongingMovementModal({ isOpen, belongings = [], onClose, onSave }) {
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setForm(blank());
    setSaving(false);
    setError("");
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const escape = (event) => { if (event.key === "Escape" && !saving) onClose?.(); };
    document.addEventListener("keydown", escape);
    return () => { document.body.style.overflow = overflow; document.removeEventListener("keydown", escape); };
  }, [isOpen, saving, onClose]);

  if (!isOpen) return null;
  const selected = belongings.find((x) => x.id === form.belongingId);
  const change = (event) => {
    setForm((old) => ({ ...old, [event.target.name]: event.target.value }));
    setError("");
  };

  async function submit(event) {
    event.preventDefault();
    if (saving) return;
    if (!selected) return setError("Selecciona un bien.");
    const delta = Number(form.delta);
    if (form.type === "adjustment" && (!Number.isSafeInteger(delta) || delta === 0)) return setError("El ajuste debe ser un número entero distinto de cero.");
    if (form.type === "adjustment" && selected.quantity + delta < 1) return setError("No puedes dejar el inventario con menos de una unidad.");
    setSaving(true);
    try {
      await onSave?.({ belongingId: selected.id, type: form.type, description: form.description.trim(),
        ...(form.type === "inspection" ? { newCondition: form.newCondition } : { delta }) });
      onClose?.();
    } catch (cause) { setError(cause?.message || "No fue posible registrar el movimiento."); }
    finally { setSaving(false); }
  }

  return (
    <div className="belonging-movement-modal__overlay" onMouseDown={(e) => { if (e.target === e.currentTarget && !saving) onClose?.(); }}>
      <section className="belonging-movement-modal" role="dialog" aria-modal="true" aria-labelledby="movement-modal-title">
        <header className="belonging-movement-modal__header">
          <div className="belonging-movement-modal__heading">
            <span className="belonging-movement-modal__icon"><ArrowLeftRight size={23} aria-hidden="true" /></span>
            <div><h2 id="movement-modal-title">Registrar movimiento</h2><p>Actualiza la cantidad o revisa el estado de un bien.</p></div>
          </div>
          <button type="button" className="belonging-movement-modal__close" onClick={onClose} disabled={saving} aria-label="Cerrar"><X size={20} /></button>
        </header>
        <form className="belonging-movement-modal__form" onSubmit={submit}>
          <div className="belonging-movement-modal__body">
            <div className="belonging-movement-modal__field">
              <label htmlFor="movement-belonging">Bien del inventario *</label>
              <select id="movement-belonging" name="belongingId" value={form.belongingId} onChange={change} disabled={saving} required>
                <option value="">Selecciona un bien</option>
                {belongings.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}
              </select>
            </div>
            {selected && <div className="belonging-movement-modal__current">
              <div><span>Cantidad actual</span><strong>{selected.quantity}</strong></div>
            </div>}
            <div className="belonging-movement-modal__field">
              <label>Tipo de movimiento *</label>
              <div className="belonging-movement-modal__types">
                <button type="button" className={`belonging-movement-modal__type ${form.type === "inspection" ? "belonging-movement-modal__type--active" : ""}`} onClick={() => setForm((x) => ({ ...x, type: "inspection" }))} disabled={saving} aria-pressed={form.type === "inspection"}>
                  <ClipboardCheck size={20} /><strong>Revisión</strong><span>Estado del bien</span>
                </button>
                <button type="button" className={`belonging-movement-modal__type ${form.type === "adjustment" ? "belonging-movement-modal__type--active" : ""}`} onClick={() => setForm((x) => ({ ...x, type: "adjustment" }))} disabled={saving} aria-pressed={form.type === "adjustment"}>
                  <ArrowLeftRight size={20} /><strong>Ajuste</strong><span>Sumar o descontar unidades</span>
                </button>
              </div>
            </div>
            {form.type === "inspection" ? (
              <div className="belonging-movement-modal__field">
                <label htmlFor="movement-condition">Estado observado *</label>
                <select id="movement-condition" name="newCondition" value={form.newCondition} onChange={change} disabled={saving}>
                  {belongingsConditions.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}
                </select>
              </div>
            ) : (
              <div className="belonging-movement-modal__field">
                <label htmlFor="movement-delta">Unidades a sumar o descontar *</label>
                <input id="movement-delta" name="delta" type="number" step="1" value={form.delta} onChange={change} disabled={saving} required />
                <small>Ejemplo: 3 para agregar o -2 para descontar.</small>
              </div>
            )}
            <div className="belonging-movement-modal__field">
              <label htmlFor="movement-description">Observaciones (opcional)</label>
              <textarea id="movement-description" name="description" maxLength={1000} rows={3} value={form.description} onChange={change} disabled={saving} placeholder="Explica brevemente el movimiento..." />
            </div>
            <p style={{ color: "#607889", fontSize: "12px" }}>El sistema registrará automáticamente quién realizó el movimiento.</p>
            {error && <div className="belonging-movement-modal__error" role="alert">{error}</div>}
          </div>
          <footer className="belonging-movement-modal__footer">
            <button type="button" className="belonging-movement-modal__cancel" onClick={onClose} disabled={saving}>Cancelar</button>
            <button type="submit" className="belonging-movement-modal__submit" disabled={saving}><Save size={17} />{saving ? "Registrando..." : "Registrar movimiento"}</button>
          </footer>
        </form>
      </section>
    </div>
  );
}
export default BelongingMovementModal;
