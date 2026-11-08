// =============================================================
// EDITOR VISUAL DE LIBROS BÍBLICOS - IGLESIA EL ANCLA
// =============================================================
// Reutiliza la página real que ve el miembro. No replica su diseño.
// Los 66 libros y sus datos estructurales permanecen definidos en React.
// MongoDB conserva únicamente los textos de apoyo modificados.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, RotateCcw, Save, Send } from "lucide-react";
import originalOld from "../../data/bible/oldTestamentBooks";
import originalNew from "../../data/bible/newTestamentBooks";
import BibleBookDetails from "../member/resources/BibleBookDetails";
import {
  getAdminResourceContent, saveResourceEntryDraft,
  publishResourceEntry, permanentlyDeleteResourceEntry,
} from "../../services/resourcesContentApi";
import "../../styles/pages/administration/BibleBookInlineEditor.css";

const ALL_BOOKS = [...originalOld, ...originalNew];
const LIMITS = { theme: 150, description: 600, keyCharacters: 80, keyEvents: 150,
  keyThemes: 60, reference: 80, verseText: 400, suggestedStart: 80 };
const MAX_ITEMS = { description: 8, keyCharacters: 20, keyEvents: 25, keyThemes: 20 };

// Solo estas propiedades pueden enviarse al backend.
function toEditable(source) {
  return {
    theme: String(source?.theme ?? ""),
    description: Array.isArray(source?.description) ? [...source.description] : [String(source?.description ?? "")],
    keyCharacters: [...(source?.keyCharacters || [])],
    keyEvents: [...(source?.keyEvents || [])],
    keyThemes: [...(source?.keyThemes || [])],
    featuredVerse: {
      reference: String(source?.featuredVerse?.reference ?? ""),
      text: String(source?.featuredVerse?.text ?? ""),
    },
    suggestedStart: String(source?.suggestedStart ?? ""),
  };
}

// Validación previa a la misma validación definitiva del servidor.
function validate(form) {
  const content = toEditable(form);
  content.theme = content.theme.trim();
  if (!content.theme || content.theme.length > LIMITS.theme) {
    throw new Error("El tema principal debe tener entre 1 y 150 caracteres.");
  }
  for (const field of ["description", "keyCharacters", "keyEvents", "keyThemes"]) {
    content[field] = content[field].map((item) => String(item).trim());
    if (content[field].length > MAX_ITEMS[field] ||
      (field === "description" && !content[field].length) ||
      content[field].some((value) => !value || value.length > LIMITS[field])) {
      throw new Error(`Revisa ${field === "description" ? "la descripción" : "los elementos de " + field}: hay campos vacíos o textos demasiado largos.`);
    }
  }
  content.featuredVerse.reference = content.featuredVerse.reference.trim();
  content.featuredVerse.text = content.featuredVerse.text.trim();
  if (content.featuredVerse.reference.length > LIMITS.reference ||
      content.featuredVerse.text.length > LIMITS.verseText ||
      Boolean(content.featuredVerse.reference) !== Boolean(content.featuredVerse.text)) {
    throw new Error("Completa el versículo destacado y su referencia, o deja ambos vacíos.");
  }
  content.suggestedStart = content.suggestedStart.trim();
  if (content.suggestedStart.length > LIMITS.suggestedStart) {
    throw new Error("La lectura sugerida supera los 80 caracteres.");
  }
  return content;
}

function BibleBookInlineEditor() {
  const { slug } = useParams();
  const location = useLocation();
  const adminBase = location.pathname.startsWith("/super-admin/") ? "/super-admin" : "/admin";
  const listPath = `${adminBase}/recursos/bible`;
  const originalBook = useMemo(() => ALL_BOOKS.find((item) => item.slug === slug), [slug]);
  const [form, setForm] = useState(null);
  const [savedContent, setSavedContent] = useState(null);
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const sendingRef = useRef(false);

  // Cargamos el borrador existente sin mostrarlo a los miembros.
  const refresh = useCallback(async (resetEditor = true) => {
    if (!originalBook) { setLoading(false); return; }
    const result = await getAdminResourceContent("bible");
    const currentRecord = (result.entries || []).find((item) => item.key === `book-${slug}`) || null;
    const currentContent = toEditable(currentRecord?.draft || currentRecord?.published || originalBook);
    setRecord(currentRecord);
    if (resetEditor) {
      setForm(currentContent);
      setSavedContent(currentContent);
    }
  }, [originalBook, slug]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setForm(null);
    setSavedContent(null);
    setError("");
    setMessage("");
    setPreview(false);
    // Esta consulta solamente se hace al abrir o cambiar el libro.
    refresh().catch((failure) => {
      if (active) setError(failure?.response?.data?.message || "No pudimos cargar la ficha para editarla.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [refresh]);

  const dirty = form !== null && savedContent !== null &&
    JSON.stringify(form) !== JSON.stringify(savedContent);

  // Advertimos si el administrador intenta cerrar la pestaña con cambios pendientes.
  useEffect(() => {
    if (!dirty) return undefined;
    const guard = (event) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [dirty]);

  const beforeNavigate = (event) => {
    if (busy || (dirty && !window.confirm("Tienes cambios sin guardar. ¿Quieres salir sin guardarlos?"))) {
      event.preventDefault();
    }
  };

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const updateVerse = (field, value) => setForm((current) => ({ ...current,
    featuredVerse: { ...current.featuredVerse, [field]: value } }));

  const save = async (publish) => {
    if (sendingRef.current || !originalBook || !form) return;
    sendingRef.current = true;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const content = validate(form);
      const saved = await saveResourceEntryDraft(
        "bible", `book-${slug}`, content, false, record?.draftRevision || 0,
      );
      // Publicamos la revisión recién creada, nunca una revisión antigua.
      if (publish) await publishResourceEntry("bible", `book-${slug}`, saved.draftRevision);
      await refresh(false);
      setForm(content);
      setSavedContent(content);
      setMessage(publish
        ? "Los cambios ya están publicados y disponibles para los miembros."
        : "Borrador guardado. Los miembros siguen viendo la versión publicada.");
    } catch (failure) {
      setError(failure?.response?.data?.message || failure?.message || "No pudimos guardar la ficha. Intenta nuevamente.");
      // Si guardar funcionó pero publicar falló, actualizamos la revisión antes de reintentar.
      try { await refresh(false); } catch { /* El error principal ya está visible. */ }
    } finally { sendingRef.current = false; setBusy(false); }
  };

  const restore = async () => {
    if (sendingRef.current || !record || !originalBook) return;
    if (!window.confirm(`¿Restaurar la información original de ${originalBook.name}? Se perderán los cambios guardados para este libro.`)) return;
    sendingRef.current = true;
    setBusy(true);
    setError("");
    try {
      await permanentlyDeleteResourceEntry("bible", `book-${slug}`, record.draftRevision || 0);
      await refresh();
      setMessage("Se restauró la información original de este libro.");
    } catch (failure) {
      setError(failure?.response?.data?.message || "No pudimos restaurar la información original.");
    } finally { sendingRef.current = false; setBusy(false); }
  };

  if (!originalBook) return <main className="bible-visual-editor__state"><h1>Libro no encontrado</h1>
    <Link to={listPath}>Volver a libros bíblicos</Link></main>;

  return (
    <div className="bible-visual-editor">
      <div className="bible-visual-editor__toolbar" role="region" aria-label="Opciones de edición del libro bíblico">
        <div className="bible-visual-editor__heading">
          <Link to={listPath} onClick={beforeNavigate} aria-label="Volver a los libros bíblicos"><ArrowLeft size={20}/></Link>
          <div><span>EDICIÓN VISUAL · {originalBook.testament}</span><strong>{originalBook.name}</strong></div>
          <span className={`bible-visual-editor__status${dirty ? " bible-visual-editor__status--pending" : ""}`}>
            {dirty ? "Cambios sin guardar" : record?.draftRevision > record?.publishedRevision ? "Borrador pendiente" : "Sin cambios pendientes"}
          </span>
        </div>
        <div className="bible-visual-editor__actions">
          <button type="button" disabled={loading || busy} onClick={() => setPreview((old) => !old)}>
            {preview ? <EyeOff size={17} /> : <Eye size={17} />}
            {preview ? "Volver a editar" : "Vista previa"}
          </button>
          <button type="button" disabled={!record || busy || loading} onClick={restore} title="Restaurar contenido original">
            <RotateCcw size={17} /> Restaurar
          </button>
          <button type="button" disabled={loading || busy || !form} onClick={() => save(false)}>
            <Save size={17}/> Guardar borrador
          </button>
          <button type="button" className="bible-visual-editor__publish" disabled={loading || busy || !form} onClick={() => save(true)}>
            <Send size={17}/> {busy ? "Guardando..." : "Guardar y publicar"}
          </button>
        </div>
      </div>
      <div className="bible-visual-editor__notice-bar">
        {loading ? <p role="status">Cargando información del libro...</p> :
          <p>{preview ? "Vista previa: así verá la comunidad esta ficha cuando se publique." :
            "Pasa el cursor sobre un texto y selecciona el lápiz para modificarlo en la página."}</p>}
        {message && <p className="bible-visual-editor__success" role="status">{message}</p>}
        {error && <p className="bible-visual-editor__error" role="alert">{error}</p>}
      </div>
      {form && !loading && (
        <BibleBookDetails key={slug} bookOverride={{ ...originalBook, ...form }} showHeader={false}
          editor={{
            adminBase, listPath, busy, beforeNavigate, preview,
            setField: updateField, setVerse: updateVerse,
          }} />
      )}
      <div className="bible-visual-editor__bottom">
        <Link to={listPath} onClick={beforeNavigate}><ArrowLeft size={17}/> Volver al listado</Link>
        <span>{originalBook.chapters} capítulos · {originalBook.group}</span>
      </div>
    </div>
  );
}

export default BibleBookInlineEditor;
