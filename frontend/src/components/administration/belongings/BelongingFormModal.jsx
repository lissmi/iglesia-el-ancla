// =========================================================
// NUEVO BIEN / EDITAR BIEN - FORMULARIO SIMPLIFICADO
// Solo nombre, categoría, unidades, estado y observaciones opcionales.
// =========================================================
import { useEffect, useRef, useState } from "react";
import { PackagePlus, Pencil, X } from "lucide-react";
import {
  belongingsCategories, belongingsConditions,
} from "../../../data/belongings/belongingsDemoData";
import "../../../styles/components/administration/belongings/BelongingFormModal.css";

const blank = () => ({
  name: "", categoryId: "", quantity: 1,
  condition: "good", description: "",
});

function BelongingFormModal({ isOpen, belonging = null, onClose, onSave }) {
  const [form, setForm] = useState(blank);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const dialogRef = useRef(null);
  const isEditing = Boolean(belonging);

  useEffect(() => {
    if (!isOpen) return;
    setForm(belonging ? {
      name: belonging.name || "",
      categoryId: belonging.categoryId || "",
      quantity: belonging.quantity ?? 1,
      condition: belonging.condition || "good",
      description: belonging.description || "",
    } : blank());
    setError("");
    setSaving(false);
  }, [isOpen, belonging]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const escape = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        // No cerramos mientras MongoDB procesa la solicitud.
        if (!saving) onClose?.();
      }
    };
    document.addEventListener("keydown", escape);
    return () => { document.body.style.overflow = previous; document.removeEventListener("keydown", escape); };
  }, [isOpen, saving, onClose]);

  if (!isOpen) return null;

  const change = (event) => {
    const { name, value } = event.target;
    // Cada bien tiene una cantidad libre de unidades enteras.
    setForm((old) => ({ ...old, [name]: value }));
    setError("");
  };

  const submit = async (event) => {
    event.preventDefault();
    if (saving) return;
    const quantity = Number(form.quantity);
    if (form.name.trim().length < 2) { setError("Escribe el nombre del bien."); return; }
    if (!form.categoryId) { setError("Selecciona una categoría."); return; }
    if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 100000) { setError("Indica una cantidad válida."); return; }
    setSaving(true);
    setError("");
    try {
      await onSave?.({ ...form, name: form.name.trim(), description: form.description.trim(), quantity });
    } catch (cause) {
      setError(cause?.message || "No pudimos guardar el bien. Inténtalo nuevamente.");
    } finally { setSaving(false); }
  };

  return (
    <div className="belonging-form-modal__overlay" onMouseDown={(e) => {
      if (e.target === e.currentTarget && !saving) onClose?.();
    }}>
      <section ref={dialogRef} className="belonging-form-modal" role="dialog" aria-modal="true" aria-labelledby="belonging-form-title">
        <header className="belonging-form-modal__header">
          <div className="belonging-form-modal__heading">
            <div className="belonging-form-modal__icon">
              {isEditing ? <Pencil size={21} aria-hidden="true" /> : <PackagePlus size={21} aria-hidden="true" />}
            </div>
            <div>
              <h2 id="belonging-form-title">{isEditing ? "Editar bien" : "Registrar nuevo bien"}</h2>
              <p>{isEditing ? "Actualiza la información del bien." : "Agrega un bien al inventario de la iglesia."}</p>
            </div>
          </div>
          <button type="button" className="belonging-form-modal__close" onClick={onClose} disabled={saving} aria-label="Cerrar formulario">
            <X size={21} aria-hidden="true" />
          </button>
        </header>
        <form className="belonging-form-modal__form" onSubmit={submit}>
          <div className="belonging-form-modal__body">
            <div className="belonging-form-modal__field">
              <label htmlFor="belonging-name">Nombre del bien *</label>
              <input id="belonging-name" name="name" value={form.name} onChange={change} maxLength={120} required disabled={saving} placeholder="Ej. Sillas plásticas" />
            </div>
            <div className="belonging-form-modal__grid">
              <div className="belonging-form-modal__field">
                <label htmlFor="belonging-category">Categoría *</label>
                <select id="belonging-category" name="categoryId" value={form.categoryId} onChange={change} required disabled={saving}>
                  <option value="">Selecciona una categoría</option>
                  {belongingsCategories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </div>
              <div className="belonging-form-modal__field">
                <label htmlFor="belonging-quantity">Cantidad (unidades) *</label>
                <input id="belonging-quantity" type="number" name="quantity" min="1" max="100000" step="1" value={form.quantity} onChange={change} disabled={saving} required />
              </div>
              <div className="belonging-form-modal__field">
                <label htmlFor="belonging-condition">Estado de conservación *</label>
                <select id="belonging-condition" name="condition" value={form.condition} onChange={change} disabled={saving}>
                  {belongingsConditions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </div>
            </div>
            <div className="belonging-form-modal__field">
              <label htmlFor="belonging-description">Observaciones (opcional)</label>
              <textarea id="belonging-description" name="description" rows={3} maxLength={1000} value={form.description} onChange={change} disabled={saving} placeholder="Algún detalle que sea útil recordar..." />
            </div>
            {error && <p style={{ color: "#a23f35", fontSize: "13px" }} role="alert">{error}</p>}
          </div>
          <footer className="belonging-form-modal__footer">
            <button type="button" className="belonging-form-modal__cancel" onClick={onClose} disabled={saving}>Cancelar</button>
            <button type="submit" className="belonging-form-modal__save" disabled={saving}>{saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Registrar bien"}</button>
          </footer>
        </form>
      </section>
    </div>
  );
}
export default BelongingFormModal;
