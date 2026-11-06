// =========================================================
// MODAL DE INSUMOS BÁSICOS - IGLESIA EL ANCLA
// Formulario breve: nombre, categoría, existencias, mínimo y notas.
// =========================================================
import { useEffect, useRef } from "react";
import { X, Save, PackagePlus } from "lucide-react";
import { basicSupplyCategories } from "../../../../data/basicSupplies/basicSuppliesDemoData";
import "../../../../styles/components/administration/basicSupplies/modals/BasicSupplyFormModal.css";

function BasicSupplyFormModal({
  isOpen, supplyForm, setSupplyForm, onSubmit, onClose,
  isEditing = false, isSaving = false,
}) {
  // El nombre recibe el foco al abrir el formulario.
  const firstInputRef = useRef(null);
  useEffect(() => {
    if (isOpen) firstInputRef.current?.focus();
  }, [isOpen]);

  // Escape solo cierra si no hay un guardado en curso.
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !isSaving) onClose?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSaving, onClose]);

  // Actualizamos una sola propiedad sin perder los demás valores.
  const updateField = (field, value) => {
    setSupplyForm((previous) => ({ ...previous, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div
      className="basic-supply-form__overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) onClose?.();
      }}
    >
      <div
        className="basic-supply-form"
        role="dialog"
        aria-modal="true"
        aria-labelledby="basic-supply-form-title"
      >
        <div className="basic-supply-form__header">
          <div className="basic-supply-form__heading">
            <div className="basic-supply-form__icon">
              <PackagePlus size={24} aria-hidden="true" />
            </div>
            <div>
              <h2 id="basic-supply-form-title">
                {isEditing ? "Editar insumo" : "Nuevo insumo"}
              </h2>
              <p>{isEditing ? "Actualiza la información de este insumo." : "Agrega un producto que utiliza nuestra iglesia."}</p>
            </div>
          </div>
          <button
            type="button" className="basic-supply-form__close"
            onClick={onClose} disabled={isSaving}
            aria-label="Cerrar formulario"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="basic-supply-form__grid">
            {/* Identifica claramente el producto o su presentación. */}
            <label className="basic-supply-form__field basic-supply-form__field--full">
              <span>Nombre del insumo *</span>
              <input
                ref={firstInputRef} type="text" required minLength={2} maxLength={120}
                placeholder="Ej. Paquete de papel higiénico"
                value={supplyForm.name}
                disabled={isSaving}
                onChange={(event) => updateField("name", event.target.value)}
              />
            </label>

            {/* Categoría utilizada para ordenar el inventario. */}
            <label className="basic-supply-form__field basic-supply-form__field--full">
              <span>Categoría *</span>
              <select
                value={supplyForm.category} required disabled={isSaving}
                onChange={(event) => updateField("category", event.target.value)}
              >
                {basicSupplyCategories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </label>

            {/* Al editar, el stock se modifica desde Entrada/Consumo. */}
            <label className="basic-supply-form__field">
              <span>{isEditing ? "Existencias actuales" : "Existencias iniciales"} *</span>
              <input
                type="number" min="0" max="1000000" step="1" required
                value={supplyForm.stock}
                disabled={isEditing || isSaving}
                onChange={(event) => updateField("stock", event.target.value)}
              />
            </label>

            {/* Cuando queden estas unidades o menos, se avisa a la comunidad. */}
            <label className="basic-supply-form__field">
              <span>Stock mínimo *</span>
              <input
                type="number" min="0" max="1000000" step="1" required
                value={supplyForm.minimumStock}
                disabled={isSaving}
                onChange={(event) => updateField("minimumStock", event.target.value)}
              />
            </label>

            <div className="basic-supply-form__field basic-supply-form__field--full">
              <small style={{ color: "#708897", lineHeight: 1.5 }}>
                Cuando las existencias lleguen al mínimo, la comunidad podrá ver que necesitamos reponer el insumo.
                {isEditing ? " Para cambiar las existencias, registra una entrada o un consumo desde el inventario." : ""}
              </small>
            </div>

            {/* Opcional. Las notas se muestran en la página del miembro. */}
            <label className="basic-supply-form__field basic-supply-form__field--full">
              <span>Observaciones (opcional)</span>
              <textarea
                rows="3" maxLength={500} disabled={isSaving}
                placeholder="Ej. Se utiliza en las reuniones de la iglesia."
                value={supplyForm.notes}
                onChange={(event) => updateField("notes", event.target.value)}
              />
              <small style={{ color: "#708897" }}>Estas observaciones serán visibles para los miembros.</small>
            </label>
          </div>

          <div className="basic-supply-form__footer">
            <button type="button" className="basic-supply-form__cancel" onClick={onClose} disabled={isSaving}>Cancelar</button>
            <button type="submit" className="basic-supply-form__submit" disabled={isSaving}>
              <Save size={17} aria-hidden="true" />
              {isSaving ? "Guardando..." : isEditing ? "Guardar cambios" : "Guardar insumo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default BasicSupplyFormModal;
