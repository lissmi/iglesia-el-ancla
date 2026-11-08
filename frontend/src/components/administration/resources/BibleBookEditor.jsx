// =========================================================
// EDITOR EXCLUSIVO DE CONTENIDO AUXILIAR DE LIBROS BÍBLICOS
// =========================================================
// Evita modificar la cantidad de capítulos, el nombre y el orden bíblico.
import { useEffect, useId, useRef, useState } from "react";
import { Plus, Save, Send, Trash2, X } from "lucide-react";
import {
  saveResourceEntryDraft, publishResourceEntry, permanentlyDeleteResourceEntry,
} from "../../../services/resourcesContentApi";

// Límites pensados para conservar intactas las 66 fichas originales.
const LIMITS = Object.freeze({
  theme: 150, description: 600, keyCharacters: 80, keyEvents: 150,
  keyThemes: 60, reference: 80, verseText: 400, suggestedStart: 80,
});
const MAX_ITEMS = Object.freeze({ description: 8, keyCharacters: 20, keyEvents: 25, keyThemes: 20 });

// Solo los campos informativos se envían a la API.
function editableContent(source) {
  return {
    theme: source.theme || "",
    description: [...(source.description || [])],
    keyCharacters: [...(source.keyCharacters || [])],
    keyEvents: [...(source.keyEvents || [])],
    keyThemes: [...(source.keyThemes || [])],
    featuredVerse: {
      reference: source.featuredVerse?.reference || "",
      text: source.featuredVerse?.text || "",
    },
    suggestedStart: source.suggestedStart || "",
  };
}

function BibleBookEditor({ book, record, onClose, onSaved }) {
  const id = useId();
  const modalRef = useRef(null);
  const closeRef = useRef(null);
  const sendingRef = useRef(false);
  // Se carga primero el borrador, después la publicación y finalmente el original.
  const [form, setForm] = useState(() => editableContent(record?.draft || record?.published || book));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Bloqueamos el desplazamiento de fondo mientras se edita.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    function onKeyDown(event) {
      if (event.key === "Escape" && !sendingRef.current) onClose();
      if (event.key !== "Tab") return;
      const focusable = Array.from(modalRef.current?.querySelectorAll('button:not(:disabled),input:not(:disabled),textarea:not(:disabled),a[href]') || []);
      if (!focusable.length) return;
      if (event.shiftKey && document.activeElement === focusable[0]) {
        event.preventDefault(); focusable.at(-1).focus();
      } else if (!event.shiftKey && document.activeElement === focusable.at(-1)) {
        event.preventDefault(); focusable[0].focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", onKeyDown); previousFocus?.focus?.(); };
  }, [onClose]);

  function updateField(field, value) { setForm((old) => ({ ...old, [field]: value })); }
  function updateList(field, index, value) {
    setForm((old) => ({ ...old, [field]: old[field].map((item, i) => i === index ? value : item) }));
  }
  function addItem(field) {
    if (form[field].length >= MAX_ITEMS[field]) return;
    setForm((old) => ({ ...old, [field]: [...old[field], ""] }));
  }
  function removeItem(field, index) {
    setForm((old) => ({ ...old, [field]: old[field].filter((_, i) => i !== index) }));
  }
  function editVerse(field, value) {
    setForm((old) => ({ ...old, featuredVerse: { ...old.featuredVerse, [field]: value } }));
  }

  // Validamos antes de enviar; el backend repite la comprobación.
  function cleanFields() {
    const clean = editableContent(form);
    clean.theme = clean.theme.trim();
    clean.suggestedStart = clean.suggestedStart.trim();
    clean.featuredVerse.reference = clean.featuredVerse.reference.trim();
    clean.featuredVerse.text = clean.featuredVerse.text.trim();
    if (!clean.theme || clean.theme.length > LIMITS.theme) throw Error("Escribe un tema principal de hasta 150 caracteres.");
    for (const field of ["description", "keyCharacters", "keyEvents", "keyThemes"]) {
      clean[field] = clean[field].map((text) => text.trim());
      if (clean[field].some((text) => !text || text.length > LIMITS[field])) {
        throw Error("Completa todos los textos de la sección o quita los elementos vacíos.");
      }
      if (clean[field].length > MAX_ITEMS[field]) throw Error("Se alcanzó el máximo de elementos de esta sección.");
    }
    if (!clean.description.length) throw Error("Agrega al menos un párrafo de descripción.");
    if (Boolean(clean.featuredVerse.reference) !== Boolean(clean.featuredVerse.text)) {
      throw Error("Completa el versículo y su referencia, o deja ambos vacíos.");
    }
    if (clean.featuredVerse.reference.length > LIMITS.reference || clean.featuredVerse.text.length > LIMITS.verseText ||
        clean.suggestedStart.length > LIMITS.suggestedStart) throw Error("Revisa los límites del versículo o de la lectura sugerida.");
    return clean;
  }

  async function save(publish) {
    if (sendingRef.current) return;
    sendingRef.current = true;
    setBusy(true);
    setError("");
    try {
      const content = cleanFields();
      const key = `book-${book.slug}`;
      const saved = await saveResourceEntryDraft("bible", key, content, false, record?.draftRevision || 0);
      if (publish) await publishResourceEntry("bible", key, saved.draftRevision);
      await onSaved(publish ? "La ficha ya está actualizada para los miembros." : "Borrador guardado. La comunidad sigue viendo la versión publicada.");
    } catch (failure) {
      // Si falló la publicación después de guardar, recargamos antes de reintentar.
      setError(failure?.response?.data?.message || failure?.message || "No pudimos guardar. Revisa los campos e intenta nuevamente.");
    } finally { sendingRef.current = false; setBusy(false); }
  }

  async function resetOriginal() {
    if (!record || sendingRef.current) return;
    const confirmed = window.confirm(`¿Restaurar la información original de ${book.name}? Se perderán los cambios guardados en esta ficha.`);
    if (!confirmed) return;
    sendingRef.current = true;
    setBusy(true);
    try {
      await permanentlyDeleteResourceEntry("bible", `book-${book.slug}`, record.draftRevision || 0);
      await onSaved("La ficha volvió a su contenido original.");
    } catch (failure) {
      setError(failure?.response?.data?.message || "No pudimos restaurar esta ficha.");
    } finally { sendingRef.current = false; setBusy(false); }
  }

  function textField(label, field, multiline = false) {
    const value = form[field];
    return <label className="bible-admin__field" key={field}>
      <span>{label}</span>
      {multiline ? <textarea rows={3} value={value} maxLength={LIMITS[field]} disabled={busy}
        onChange={(event) => updateField(field, event.target.value)} />
      : <input value={value} maxLength={LIMITS[field]} disabled={busy}
        onChange={(event) => updateField(field, event.target.value)} />}
      <small>{value.length}/{LIMITS[field]} caracteres</small>
    </label>;
  }

  function listField(field, heading, placeholder) {
    return <fieldset key={field} className="bible-admin__collection">
      <legend>{heading}</legend>
      {form[field].map((text, index) => <div key={`${field}-${index}`} className="bible-admin__list-item">
        <label>
          <span>{heading === "Descripción" ? `Párrafo ${index + 1}` : `Elemento ${index + 1}`}</span>
          {field === "description" ?
            <textarea rows={3} value={text} maxLength={LIMITS[field]} placeholder={placeholder} disabled={busy}
              onChange={(event) => updateList(field, index, event.target.value)} /> :
            <input value={text} maxLength={LIMITS[field]} placeholder={placeholder} disabled={busy}
              onChange={(event) => updateList(field, index, event.target.value)} />}
          <small>{text.length}/{LIMITS[field]} caracteres</small>
        </label>
        <button type="button" disabled={busy || (field === "description" && form[field].length === 1)}
          onClick={() => removeItem(field, index)} aria-label={`Quitar elemento ${index + 1} de ${heading}`} title="Quitar"><Trash2 size={17} /></button>
      </div>)}
      <button type="button" className="bible-admin__add" disabled={busy || form[field].length >= MAX_ITEMS[field]}
        onClick={() => addItem(field)}><Plus size={16}/> Añadir elemento ({form[field].length}/{MAX_ITEMS[field]})</button>
    </fieldset>;
  }

  return <div className="bible-admin__overlay" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}>
    <section ref={modalRef} className="bible-admin__modal" role="dialog" aria-modal="true" aria-labelledby={id}>
      <header className="bible-admin__modal-header">
        <div><small>FICHA INFORMATIVA · {book.testament}</small>
          <h2 id={id}>Editar {book.name}</h2>
          <p>{book.group} · {book.chapters} capítulos. Estos datos se mantienen automáticamente.</p>
        </div>
        <button type="button" ref={closeRef} className="bible-admin__close" disabled={busy} onClick={onClose} aria-label="Cerrar"><X size={20}/></button>
      </header>
      <div className="bible-admin__modal-body">
        {textField("Tema principal", "theme", true)}
        {listField("description", "Descripción", "Explica de qué trata este libro")}
        {listField("keyCharacters", "Personajes principales", "Personaje")}
        {listField("keyEvents", "Acontecimientos importantes", "Acontecimiento")}
        {listField("keyThemes", "Temas y enseñanzas", "Tema")}
        <fieldset className="bible-admin__collection"><legend>Versículo destacado</legend>
          <label className="bible-admin__field"><span>Referencia bíblica</span>
            <input value={form.featuredVerse.reference} maxLength={LIMITS.reference} disabled={busy}
              onChange={(event) => editVerse("reference", event.target.value)}/>
            <small>{form.featuredVerse.reference.length}/{LIMITS.reference} caracteres</small>
          </label>
          <label className="bible-admin__field"><span>Texto del versículo</span>
            <textarea rows={3} value={form.featuredVerse.text} maxLength={LIMITS.verseText} disabled={busy}
              onChange={(event) => editVerse("text", event.target.value)}/>
            <small>{form.featuredVerse.text.length}/{LIMITS.verseText} caracteres</small>
          </label>
        </fieldset>
        {textField("Lectura sugerida", "suggestedStart")}
        {error && <p role="alert" className="bible-admin__error">{error}</p>}
      </div>
      <footer className="bible-admin__modal-footer">
        {record && <button type="button" className="bible-admin__restore" disabled={busy} onClick={resetOriginal}>Restaurar original</button>}
        <span className="bible-admin__footer-spacer"/>
        <button type="button" disabled={busy} onClick={onClose}>Cancelar</button>
        <button type="button" disabled={busy} onClick={() => save(false)}><Save size={16}/> Guardar borrador</button>
        <button type="button" className="bible-admin__publish" disabled={busy} onClick={() => save(true)}><Send size={16}/> {busy ? "Guardando..." : "Guardar y publicar"}</button>
      </footer>
    </section>
  </div>;
}

export default BibleBookEditor;
