// Detalles del bien, sin información de ubicación ni adquisición.
import { useEffect, useRef } from "react";
import { ClipboardList, Package, Pencil, X } from "lucide-react";
import { belongingsCategories, belongingsConditions } from "../../../data/belongings/belongingsDemoData";
import "../../../styles/components/administration/belongings/BelongingDetailModal.css";

function BelongingDetailModal({ isOpen, belonging, onClose, onEdit }) {
  const closeRef = useRef(null);
  useEffect(() => {
    if (!isOpen || !belonging) return undefined;
    const scroll = document.body.style.overflow;
    const focus = document.activeElement;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const escape = (event) => { if (event.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", escape);
    return () => { document.body.style.overflow = scroll; document.removeEventListener("keydown", escape); focus?.focus?.(); };
  }, [isOpen, belonging, onClose]);
  if (!isOpen || !belonging) return null;
  const category = belongingsCategories.find((x) => x.id === belonging.categoryId)?.name || "Sin categoría";
  const condition = belongingsConditions.find((x) => x.value === belonging.condition)?.label || "Sin estado";
  const details = [
    { label: "Categoría", value: category, icon: ClipboardList },
    { label: "Cantidad", value: `${belonging.quantity} ${belonging.quantity === 1 ? "unidad" : "unidades"}`, icon: Package },
    { label: "Estado de conservación", value: condition, icon: ClipboardList },
  ];
  return (
    <div className="belonging-detail-modal__overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <section className="belonging-detail-modal" role="dialog" aria-modal="true" aria-labelledby="belonging-detail-title">
        <header className="belonging-detail-modal__header">
          <div className="belonging-detail-modal__heading">
            <div className="belonging-detail-modal__icon"><Package size={24} aria-hidden="true" /></div>
            <div>
              <span className="belonging-detail-modal__code">{belonging.code}</span>
              <h2 id="belonging-detail-title">{belonging.name}</h2>
              <span className={`belonging-detail-modal__condition belonging-detail-modal__condition--${belonging.condition}`}>{condition}</span>
            </div>
          </div>
          <button ref={closeRef} type="button" className="belonging-detail-modal__close" onClick={onClose} aria-label="Cerrar detalles"><X size={21} /></button>
        </header>
        <div className="belonging-detail-modal__body">
          <h3>Información general</h3>
          <div className="belonging-detail-modal__grid">
            {details.map(({ label, value, icon: Icon }) => (
              <div className="belonging-detail-modal__field" key={label}>
                <span className="belonging-detail-modal__field-label"><Icon size={15} aria-hidden="true" />{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          <div className="belonging-detail-modal__description">
            <h3>Observaciones</h3>
            <p>{belonging.description || "No se han agregado observaciones."}</p>
          </div>
        </div>
        <footer className="belonging-detail-modal__footer">
          <button type="button" className="belonging-detail-modal__secondary" onClick={onClose}>Cerrar</button>
          <button type="button" className="belonging-detail-modal__primary" onClick={() => onEdit?.(belonging)} disabled={!onEdit}>
            <Pencil size={16} /> Editar bien
          </button>
        </footer>
      </section>
    </div>
  );
}
export default BelongingDetailModal;
