// =============================================================
// EDICIÓN VISUAL DE LAS FICHAS BÍBLICAS
// =============================================================
// Los componentes muestran el MISMO contenido de la ficha del miembro.
// Los lápices aparecen únicamente cuando la página está en modo edición.
// Los cambios se reflejan al escribir; cancelar devuelve el valor anterior.
import { useEffect, useId, useRef, useState } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import "../../../styles/components/administration/resources/BibleInlineEditable.css";

// Campo de texto editable en el lugar donde se muestra en la ficha.
export function BibleInlineText({
  value = "", onChange, label, maxLength, as: Tag = "p",
  className = "", multiline = false, disabled = false, inline = false, prefix = "", suffix = "",
}) {
  const [editing, setEditing] = useState(false);
  const inputId = useId();
  const previousValue = useRef("");
  const fieldRef = useRef(null);

  useEffect(() => {
    if (editing) fieldRef.current?.focus();
  }, [editing]);

  const start = () => {
    if (disabled) return;
    previousValue.current = String(value ?? "");
    setEditing(true);
  };
  const cancel = () => {
    onChange(previousValue.current);
    setEditing(false);
  };
  const finish = () => setEditing(false);
  const handleKeys = (event) => {
    if (event.key === "Escape") { event.preventDefault(); cancel(); }
    if (!multiline && event.key === "Enter") { event.preventDefault(); finish(); }
    if (multiline && event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault(); finish();
    }
  };

  const Wrapper = inline ? "span" : "div";
  return (
    <Wrapper className={`bible-inline-edit${inline ? " bible-inline-edit--inline" : ""}${editing ? " bible-inline-edit--active" : ""}`}>
      <Tag className={className}>{value ? `${prefix}${value}${suffix}` : "Escribe aquí el contenido de esta sección."}</Tag>
      {!editing && (
        <button type="button" className="bible-inline-edit__pencil" onClick={start}
          disabled={disabled} title={`Editar ${label}`} aria-label={`Editar ${label}`}>
          <Pencil size={16} aria-hidden="true" />
        </button>
      )}
      {editing && (
        <span className="bible-inline-edit__panel">
          <label className="bible-inline-edit__label" htmlFor={inputId}>{label}</label>
          {multiline ? (
            <textarea ref={fieldRef} id={inputId} rows={3} value={value}
              maxLength={maxLength} onChange={(event) => onChange(event.target.value)}
              onKeyDown={handleKeys} disabled={disabled} />
          ) : (
            <input ref={fieldRef} id={inputId} value={value}
              maxLength={maxLength} onChange={(event) => onChange(event.target.value)}
              onKeyDown={handleKeys} disabled={disabled} />
          )}
          <span className="bible-inline-edit__controls">
            <small>{String(value).length}/{maxLength} caracteres</small>
            <button type="button" onClick={cancel} disabled={disabled} title="Cancelar este cambio"><X size={16} /> Cancelar</button>
            <button type="button" onClick={finish} disabled={disabled} title="Aceptar este cambio"><Check size={16} /> Listo</button>
          </span>
        </span>
      )}
    </Wrapper>
  );
}

// Colección de párrafos, personajes, acontecimientos o temas.
// Mientras se modifica, la lista permanece visible como vista previa real.
export function BibleInlineList({
  values = [], onChange, label, maxLength, maxItems, type = "bullets", disabled = false,
}) {
  const [editing, setEditing] = useState(false);
  const original = useRef([]);
  const firstInputRef = useRef(null);
  const safeValues = Array.isArray(values) ? values : [];

  useEffect(() => {
    if (editing) firstInputRef.current?.focus();
  }, [editing]);

  const start = () => {
    if (disabled) return;
    original.current = [...safeValues];
    setEditing(true);
  };
  const cancel = () => { onChange(original.current); setEditing(false); };
  const update = (index, value) => onChange(safeValues.map((item, i) => i === index ? value : item));
  const remove = (index) => onChange(safeValues.filter((_, i) => i !== index));
  const add = () => { if (safeValues.length < maxItems) onChange([...safeValues, ""]); };

  return (
    <div className={`bible-inline-edit bible-inline-edit--list${editing ? " bible-inline-edit--active" : ""}`}>
      {type === "paragraphs" ? (
        <div className="bible-inline-edit__paragraphs">
          {safeValues.map((text, index) => <p key={index}>{text || (editing ? "Nuevo párrafo..." : "")}</p>)}
        </div>
      ) : type === "tags" ? (
        <div className="book-details-info-card__tags">
          {safeValues.map((text, index) => <span key={index}>{text || "Nuevo tema..."}</span>)}
        </div>
      ) : (
        <ul className="book-details-info-card__list">
          {safeValues.map((text, index) => <li key={index}>{text || "Nuevo elemento..."}</li>)}
        </ul>
      )}
      {!editing && (
        <button type="button" className="bible-inline-edit__pencil" onClick={start}
          disabled={disabled} title={`Editar ${label}`} aria-label={`Editar ${label}`}>
          <Pencil size={16} aria-hidden="true" />
        </button>
      )}
      {editing && (
        <div className="bible-inline-edit__panel bible-inline-edit__panel--list">
          <strong className="bible-inline-edit__label">{label}</strong>
          {safeValues.map((text, index) => (
            <div className="bible-inline-edit__row" key={index}>
              {type === "paragraphs" ? (
                <textarea ref={index === 0 ? firstInputRef : undefined} rows={3} value={text}
                  aria-label={`${label}, elemento ${index + 1}`} maxLength={maxLength}
                  onChange={(event) => update(index, event.target.value)} disabled={disabled} />
              ) : (
                <input ref={index === 0 ? firstInputRef : undefined} value={text}
                  aria-label={`${label}, elemento ${index + 1}`} maxLength={maxLength}
                  onChange={(event) => update(index, event.target.value)} disabled={disabled} />
              )}
              <small>{text.length}/{maxLength}</small>
              <button type="button" disabled={disabled || (type === "paragraphs" && safeValues.length === 1)}
                onClick={() => remove(index)} title="Quitar elemento" aria-label={`Quitar elemento ${index + 1} de ${label}`}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <div className="bible-inline-edit__controls">
            <button type="button" disabled={disabled || safeValues.length >= maxItems} onClick={add}>
              <Plus size={16} /> Añadir ({safeValues.length}/{maxItems})
            </button>
            <span className="bible-inline-edit__flex" />
            <button type="button" disabled={disabled} onClick={cancel}><X size={16} /> Cancelar</button>
            <button type="button" disabled={disabled} onClick={() => setEditing(false)}><Check size={16} /> Listo</button>
          </div>
        </div>
      )}
    </div>
  );
}
