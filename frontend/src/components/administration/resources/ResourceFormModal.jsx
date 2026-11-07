// =========================================================
// EDITOR DE RECURSOS - IGLESIA EL ANCLA
// =========================================================
// Los administradores editan contenido, no rutas ni datos técnicos.
// Los PDF de descargables se guardan en Google Drive mediante el backend.
import { useEffect, useId, useRef, useState } from "react";
import { FileText, Plus, Save, Send, Trash2, UploadCloud, X } from "lucide-react";
import { RESOURCE_CONTENT_DEFAULTS } from "../../../data/resources/resourceCatalogDefaults";
import "../../../styles/components/administration/resources/ResourceFormModal.css";

const LABELS = Object.freeze({
  title: "Título", question: "Pregunta", answer: "Respuesta", category: "Categoría", level: "Nivel",
  summary: "Resumen", description: "Descripción", purpose: "Propósito", author: "Autor",
  content: "Lecciones y contenido", paragraphs: "Párrafos",
  questions: "Preguntas", application: "Aplicación práctica", reflection: "Para reflexionar",
  reflectionQuestions: "Preguntas de reflexión", objectives: "Objetivos", topics: "Temas principales",
  keyVerse: "Versículo destacado", reference: "Referencia bíblica", text: "Texto",
  prayerPoints: "Puntos de oración", samplePrayer: "Oración de ejemplo",
  practicalActivity: "Actividad práctica", steps: "Pasos", includedContent: "Este material incluye",
  highlightedInfo: "Información destacada", passage: "Pasaje bíblico",
  introduction: "Introducción", recommendation: "Recomendación", tips: "Consejos",
  reminder: "Recordatorio", featured: "Destacado", number: "Número del paso", heading: "Subtítulo",
});

// Estas propiedades las controla la aplicación. No se pide su edición.
const HIDDEN = new Set([
  "id", "slug", "links", "relatedMaterials", "filePath", "driveFileId",
  "pdfName", "available", "fileSize", "fileBytes", "format", "pages", "lessons",
]);
const LONG_TEXT = new Set([
  "description", "summary", "purpose", "application", "introduction", "reminder",
  "samplePrayer", "highlightedInfo", "text", "recommendation", "reflection",
  "paragraphs", "reflectionQuestions", "objectives", "steps", "prayerPoints", "answer",
]);
const ARRAY_TEMPLATES = {
  content: { id: "", title: "", paragraphs: [""], reflection: "" },
  questions: "", paragraphs: "", description: "", steps: "",
};
// Límites editoriales definidos para los descargables de la iglesia.
const DOWNLOAD_LIMITS = Object.freeze({ title: 50, includedContent: 200, description: 300 });
// Límites cómodos para textos completos; solo título y resumen van al catálogo.
// Los párrafos y la oración sugerida se guardarán en TXT, no en MongoDB.
const PRAYER_GUIDE_LIMITS = Object.freeze({
  title: 80, summary: 240, description: 6000, reference: 120,
  text: 1500, prayerPoints: 1200, samplePrayer: 10000,
});
const PRAYER_GUIDE_LIST_LIMITS = Object.freeze({ description: 20, prayerPoints: 40 });
const MAX_DOCUMENT_BYTES = 4 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = new Set(["pdf", "doc", "docx"]);

// Estudios bíblicos y Discipulado comparten tres niveles claros para la comunidad.
const STUDY_LEVELS = Object.freeze(["Inicial", "Intermedio", "Avanzado"]);

// Límites para que los pasos devocionales sean breves y fáciles de leer.
// Estos mismos valores se comprueban nuevamente en el backend.
const DEVOTIONAL_LIMITS = Object.freeze({
  title: 50, summary: 120, description: 400, tips: 120, reminder: 180,
});
const MAX_DEVOTIONAL_TIPS = 8;
const MAX_DEVOTIONAL_STEPS = 999;

// Las preguntas frecuentes se guardan directamente en MongoDB.
// Cada respuesta es un párrafo breve; no necesitamos generar un TXT en Drive.
const FAQ_LIMITS = Object.freeze({
  question: 80, answer: 200, highlightedInfo: 250,
});
const MAX_FAQ_ANSWERS = 5;

// Los campos informativos son breves; cada lección admite explicaciones extensas.
// El estudio completo se conservará en un TXT privado, no en la base de datos.
const DISCIPLESHIP_LIMITS = Object.freeze({
  title: 50, category: 60, summary: 180, description: 1500,
  objectives: 300, topics: 80, reference: 90, text: 1500,
  paragraphs: 6000, reflection: 1200, reflectionQuestions: 600,
  steps: 450,
});
const DISCIPLESHIP_LIST_LIMITS = Object.freeze({
  content: 40, description: 12, objectives: 30, topics: 30,
  paragraphs: 30, reflectionQuestions: 30, steps: 30,
});
// Títulos de lecciones o actividades pueden ser más extensos que el título del material.
function discipleshipInputLimit(name, path) {
  if (name === "title" && path.length > 1) return 100;
  return DISCIPLESHIP_LIMITS[name];
}


function fieldCounter(value, limit) {
  return `${value.length}/${limit} caracteres`;
}

function titleOf(key) {
  return LABELS[key] || key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
}

// Las categorías se toman del catálogo original: no admitimos nombres libres.
function categoryOptions(section, current) {
  const original = RESOURCE_CONTENT_DEFAULTS[section]?.items || [];
  const options = [...new Set(original.map((item) => item.category).filter(Boolean))];
  if (current && !options.includes(current)) options.push(current);
  return options;
}

function emptyFrom(example) {
  if (typeof example === "string") return "";
  if (typeof example === "number") return 0;
  if (typeof example === "boolean") return false;
  if (Array.isArray(example)) return example.length ? [emptyFrom(example[0])] : [];
  if (example && typeof example === "object") {
    const result = Object.fromEntries(Object.entries(example).map(([key, value]) => [key, emptyFrom(value)]));
    if ("id" in result) result.id = `new-${crypto.randomUUID()}`;
    return result;
  }
  return "";
}

function changeAtPath(source, path, value) {
  const copy = structuredClone(source);
  let node = copy;
  for (let index = 0; index < path.length - 1; index += 1) node = node[path[index]];
  node[path[path.length - 1]] = value;
  // Al añadir o quitar lecciones, el número se obtiene automáticamente.
  if (path[0] === "content" && Array.isArray(copy.content) && "lessons" in copy) {
    copy.lessons = copy.content.length;
  }
  return copy;
}

function ContentField({ name, value, path, update, disabled, section,
  reservedStepNumbers = [], depth = 0 }) {
  // Duración ya no forma parte de los estudios; tampoco la mostramos en la edición.
  if (HIDDEN.has(name) || (["studies", "discipleship", "prayer_guides"].includes(section) && name === "duration")) return null;

  // El listado tendrá un título descriptivo y cada pregunta individual, uno breve.
  const label = section === "studies" && name === "questions"
    ? Array.isArray(value) ? "Preguntas para reflexionar" : "Pregunta"
    : section === "faq" && name === "answer"
      ? Array.isArray(value) ? "Respuestas" : "Respuesta"
      : titleOf(name);

  if (Array.isArray(value)) {
    const example = value[0] ?? ARRAY_TEMPLATES[name] ?? "";
    return (
      <fieldset className="resource-edit-modal__collection">
        <legend>{label}</legend>
        {value.map((entry, index) => (
          <div className="resource-edit-modal__collection-item" key={entry?.id ?? index}>
            <div className="resource-edit-modal__collection-heading">
              <strong>{name === "content" ? `Lección ${index + 1}`
                : section === "studies" && name === "questions" ? `Pregunta ${index + 1}`
                : section === "faq" && name === "answer" ? `Respuesta ${index + 1}`
                : `${label} ${index + 1}`}</strong>
              <button type="button" disabled={disabled}
                onClick={() => update(path, value.filter((_, position) => position !== index))}>
                <Trash2 size={15} /> Quitar
              </button>
            </div>
            <ContentField name={typeof entry === "object" ? "contenido" : name} value={entry}
              path={[...path, index]} update={update} disabled={disabled} section={section}
              reservedStepNumbers={reservedStepNumbers} depth={depth + 1} />
          </div>
        ))}
        <button type="button" className="resource-edit-modal__add-row"
          disabled={disabled || value.length >= (
            section === "devotionals" && name === "tips" ? MAX_DEVOTIONAL_TIPS :
            section === "discipleship" ? (DISCIPLESHIP_LIST_LIMITS[name] || 30) :
            section === "prayer_guides" ? (PRAYER_GUIDE_LIST_LIMITS[name] || 40) :
            section === "faq" && name === "answer" ? MAX_FAQ_ANSWERS : 100
          )}
          onClick={() => update(path, [...value, emptyFrom(example)])}>
          <Plus size={15} /> {name === "content" ? "Agregar lección" : "Añadir elemento"}
        </button>
      </fieldset>
    );
  }

  if (value && typeof value === "object") {
    return (
      <fieldset className="resource-edit-modal__group">
        {depth > 0 && <legend>{label}</legend>}
        <div className="resource-edit-modal__fields">
          {Object.entries(value).filter(([key]) => !HIDDEN.has(key) &&
            !(["studies", "discipleship", "prayer_guides"].includes(section) && key === "duration")).map(([key, part]) => (
            <ContentField key={key} name={key} value={part} path={[...path, key]}
              update={update} disabled={disabled} section={section}
              reservedStepNumbers={reservedStepNumbers} depth={depth + 1} />
          ))}
        </div>
      </fieldset>
    );
  }

  if (typeof value === "boolean") {
    return <label className="resource-edit-modal__check">
      <input type="checkbox" disabled={disabled} checked={value}
        onChange={(event) => update(path, event.target.checked)} />
      <span>{label}</span>
    </label>;
  }

  // Un selector evita errores al escribir el nivel de un estudio bíblico.
  if ((section === "studies" || section === "discipleship") && name === "level") {
    // Algunos estudios antiguos utilizan «Todos los niveles».
    // Se debe elegir uno de los tres niveles sin cambiarlo automáticamente.
    const selectedLevel = STUDY_LEVELS.includes(value) ? value : "";
    return (
      <label className="resource-edit-modal__field">
        <span>Nivel</span>
        <select value={selectedLevel} disabled={disabled} required
          onChange={(event) => update(path, event.target.value)}>
          <option value="" disabled>Selecciona un nivel</option>
          {STUDY_LEVELS.map((level) => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
        {!selectedLevel && (
          <small>Selecciona el nivel recomendado para este estudio.</small>
        )}
      </label>
    );
  }

  // El número del paso no se escribe: se elige dentro de la secuencia.
  // Los números utilizados por otros pasos se reservan para evitar duplicaciones.
  if (section === "devotionals" && name === "number") {
    const currentNumber = Number(value);
    const used = new Set(reservedStepNumbers);
    const last = Math.min(MAX_DEVOTIONAL_STEPS, Math.max(
      7, currentNumber || 0, ...reservedStepNumbers
    ));
    return (
      <label className="resource-edit-modal__field">
        <span>Número del paso</span>
        <select value={Number.isInteger(currentNumber) && currentNumber > 0 ? currentNumber : ""}
          disabled={disabled} required
          onChange={(event) => update(path, String(event.target.value).padStart(2, "0"))}>
          <option value="" disabled>Selecciona el paso</option>
          {Array.from({ length: last }, (_, index) => index + 1).map((number) => (
            <option key={number} value={number}
              disabled={used.has(number) && number !== currentNumber}>
              Paso {number}{used.has(number) && number !== currentNumber ? " · En uso" : ""}
            </option>
          ))}
        </select>
        <small>Los números ocupados no pueden repetirse. Al añadir un paso se habilita el siguiente.</small>
      </label>
    );
  }

  if (name === "category") {
    const options = categoryOptions(section, value);
    return (
      <label className="resource-edit-modal__field">
        <span>Categoría</span>
        <select value={value || ""} disabled={disabled} required
          onChange={(event) => update(path, event.target.value)}>
          <option value="" disabled>Selecciona una categoría</option>
          {options.map((option) => <option value={option} key={option}>{option}</option>)}
        </select>
      </label>
    );
  }

  // Los límites también se aplican a cada consejo dentro de la lista.
  const limit = section === "devotionals" ? DEVOTIONAL_LIMITS[name]
    : section === "discipleship" ? discipleshipInputLimit(name, path)
    : section === "prayer_guides" ? PRAYER_GUIDE_LIMITS[name]
    : section === "faq" ? FAQ_LIMITS[name] : undefined;
  const multiline = typeof value === "string" && (LONG_TEXT.has(name) || value.length >= 100);
  return (
    <label className="resource-edit-modal__field">
      <span>{label}</span>
      {multiline ? (
        <textarea rows={Math.min(6, Math.max(3, Math.ceil(value.length / 100)))} value={value}
          maxLength={limit} disabled={disabled}
          onChange={(event) => update(path, event.target.value)} />
      ) : (
        <input type={typeof value === "number" ? "number" : "text"} value={value ?? ""}
          min={typeof value === "number" ? 0 : undefined} maxLength={limit}
          disabled={disabled}
          onChange={(event) => update(path, typeof value === "number" ? Number(event.target.value) : event.target.value)} />
      )}
      {limit && typeof value === "string" && (
        <small className="resource-edit-modal__counter">{fieldCounter(value, limit)}</small>
      )}
    </label>
  );
}

// Los administradores escriben cuatro campos y seleccionan PDF o Word.
// El backend guarda solo las referencias técnicas y detecta el formato real.
function DownloadableFields({ form, update, file, setFile, disabled, resource }) {
  const options = categoryOptions("downloads", form.category);
  const description = Array.isArray(form.description)
    ? form.description.join("\n\n") : (form.description || "");
  const contents = Array.isArray(form.includedContent)
    ? form.includedContent.join("\n") : (form.includedContent || "");
  const hasFile = Boolean(form.driveFileId || form.driveStored || form.available || resource.hasFile);
  const format = String(form.format || "").toLowerCase();
  const fileKind = format === "pdf" ? "PDF" : ["doc", "docx"].includes(format) ? "Word" : "documento";

  return (
    <div className="resource-edit-modal__download-fields">
      {/* El título es corto para que las tarjetas sean fáciles de leer. */}
      <label className="resource-edit-modal__field">
        <span>Título *</span>
        <input value={form.title || ""} maxLength={DOWNLOAD_LIMITS.title} disabled={disabled}
          required onChange={(event) => update(["title"], event.target.value)} />
        <small className="resource-edit-modal__counter">{fieldCounter(form.title || "", DOWNLOAD_LIMITS.title)}</small>
      </label>

      {/* Las categorías provienen del catálogo, nunca de texto libre. */}
      <label className="resource-edit-modal__field">
        <span>Categoría *</span>
        <select required value={form.category || ""} disabled={disabled}
          onChange={(event) => update(["category"], event.target.value)}>
          <option value="" disabled>Seleccionar categoría</option>
          {options.map((option) => <option value={option} key={option}>{option}</option>)}
        </select>
      </label>

      {/* El administrador puede separar temas con saltos de línea, hasta 200 caracteres. */}
      <label className="resource-edit-modal__field">
        <span>Este material incluye</span>
        <textarea rows={3} maxLength={DOWNLOAD_LIMITS.includedContent}
          value={contents} disabled={disabled}
          placeholder="Por ejemplo: Lecturas bíblicas, preguntas y actividades"
          onChange={(event) => update(["includedContent"], event.target.value)} />
        <small className="resource-edit-modal__counter">{fieldCounter(contents, DOWNLOAD_LIMITS.includedContent)}</small>
      </label>

      {/* Descripción resumida del material; no se guarda otro resumen repetido. */}
      <label className="resource-edit-modal__field">
        <span>Descripción *</span>
        <textarea rows={4} maxLength={DOWNLOAD_LIMITS.description}
          value={description} disabled={disabled} required
          placeholder="Explica brevemente para qué sirve este material."
          onChange={(event) => update(["description"], event.target.value)} />
        <small className="resource-edit-modal__counter">{fieldCounter(description, DOWNLOAD_LIMITS.description)}</small>
      </label>

      {/* El sistema valida el formato y almacena el archivo en Drive. */}
      <div className="resource-edit-modal__pdf">
        <label className="resource-edit-modal__field">
          <span>Archivo PDF o Word {resource.isNew ? "*" : "(si deseas reemplazarlo)"}</span>
          <span className="resource-edit-modal__file-button">
            <UploadCloud size={19} /> Seleccionar documento
            <input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              disabled={disabled} onChange={(event) => setFile(event.target.files?.[0] || null)} />
          </span>
        </label>
        <p className="resource-edit-modal__pdf-feedback">
          {file ? `Seleccionado: ${file.name}` : hasFile
            ? `Ya hay un ${fileKind} registrado. Puedes mantenerlo o reemplazarlo.`
            : "Selecciona el documento que compartirás con la comunidad."}
        </p>
        <p className="resource-edit-modal__pdf-help">
          <FileText size={16} /> Formatos PDF, DOC y DOCX. Máximo 4 MB. Se guarda en Google Drive.
        </p>
      </div>
    </div>
  );
}

function ResourceFormModal({ isOpen, resource = null, categoryName = "Recurso",
  reservedStepNumbers = [], onClose, onSaveDraft, onSaveAndPublish, saving = false }) {
  const [form, setForm] = useState({});
  const [documentFile, setDocumentFile] = useState(null);
  const [error, setError] = useState("");
  const titleId = useId();
  const modalRef = useRef(null);
  const closeRef = useRef(null);
  // Bloqueo inmediato: evita envíos duplicados antes de que React actualice «saving».
  const submittingRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;
    setForm(structuredClone(resource?.content || {}));
    setDocumentFile(null);
    setError("");
    submittingRef.current = false;
  }, [isOpen, resource]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const oldOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !saving) onClose?.();
      if (event.key !== "Tab") return;
      const focusable = Array.from(modalRef.current?.querySelectorAll(
        'button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled])'
      ) || []);
      if (!focusable.length) return;
      if (event.shiftKey && document.activeElement === focusable[0]) {
        event.preventDefault(); focusable[focusable.length - 1].focus();
      } else if (!event.shiftKey && document.activeElement === focusable[focusable.length - 1]) {
        event.preventDefault(); focusable[0].focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = oldOverflow;
      previousFocus?.focus?.();
    };
  }, [isOpen, saving, onClose]);

  if (!isOpen || !resource) return null;
  const isDownload = resource.category === "downloads";
  const update = (path, value) => setForm((old) => changeAtPath(old, path, value));

  async function submit(publish) {
    // Los clics muy rápidos no deben iniciar varias cargas a Google Drive.
    if (saving || submittingRef.current) return;
    const title = form.title || form.question;
    if (!title?.trim()) { setError("Escribe el título o la pregunta."); return; }
    // Validamos el nivel también antes de guardar un borrador.
    const isStudy = resource.category === "studies";
    if ((isStudy || resource.category === "discipleship") && !STUDY_LEVELS.includes(form.level)) {
      setError("Selecciona un nivel: Inicial, Intermedio o Avanzado.");
      return;
    }
    // Revisamos estos límites antes de enviar el formulario.
    if (resource.category === "devotionals") {
      const stepNumber = Number(form.number);
      if (!Number.isSafeInteger(stepNumber) || stepNumber < 1 ||
          stepNumber > MAX_DEVOTIONAL_STEPS || reservedStepNumbers.includes(stepNumber)) {
        setError("Selecciona un número de paso disponible."); return;
      }
      for (const [field, maxLength] of Object.entries(DEVOTIONAL_LIMITS)) {
        if (field === "tips") continue;
        if (typeof form[field] !== "string" || form[field].trim().length > maxLength) {
          setError(`Revisa ${titleOf(field).toLowerCase()}: máximo ${maxLength} caracteres.`); return;
        }
      }
      if (!Array.isArray(form.tips) || form.tips.length > MAX_DEVOTIONAL_TIPS ||
          form.tips.some((tip) => typeof tip !== "string" || tip.trim().length > DEVOTIONAL_LIMITS.tips)) {
        setError("Puedes agregar hasta 8 consejos de máximo 120 caracteres cada uno."); return;
      }
      if (!form.summary.trim() || !form.description.trim()) {
        setError("Completa el resumen y la descripción del paso."); return;
      }
    }
    // Preguntas frecuentes: textos breves almacenados directamente en MongoDB.
    if (resource.category === "faq") {
      if (typeof form.question !== "string" || !form.question.trim() ||
          form.question.trim().length > FAQ_LIMITS.question) {
        setError("La pregunta debe tener entre 1 y 80 caracteres."); return;
      }
      if (!form.category?.trim()) {
        setError("Selecciona una categoría."); return;
      }
      if (!Array.isArray(form.answer) || form.answer.length < 1 ||
          form.answer.length > MAX_FAQ_ANSWERS || form.answer.some(
            (part) => typeof part !== "string" || part.trim().length < 12 ||
              part.trim().length > FAQ_LIMITS.answer
          )) {
        setError("Escribe entre 1 y 5 respuestas de 12 a 200 caracteres cada una."); return;
      }
      if (form.highlightedInfo !== undefined &&
          (typeof form.highlightedInfo !== "string" ||
            form.highlightedInfo.trim().length > FAQ_LIMITS.highlightedInfo)) {
        setError("La información destacada admite hasta 250 caracteres."); return;
      }
    }
    // En Discipulado limitamos los textos cortos, pero damos espacio para
    // explicaciones, lecciones y ejercicios amplios.
    if (resource.category === "discipleship") {
      function checkDeep(value, name = "", path = []) {
        if (Array.isArray(value)) {
          const maxItems = DISCIPLESHIP_LIST_LIMITS[name] || 30;
          if (value.length > maxItems) throw new Error(`Puedes agregar hasta ${maxItems} elementos en ${titleOf(name)}.`);
          value.forEach((part, index) => checkDeep(part, name, [...path, index]));
        } else if (value && typeof value === "object") {
          Object.entries(value).forEach(([key, part]) => checkDeep(part, key, [...path, key]));
        } else if (typeof value === "string") {
          const maxLength = discipleshipInputLimit(name, path);
          if (maxLength && value.trim().length > maxLength) {
            throw new Error(`${titleOf(name)} admite hasta ${maxLength} caracteres.`);
          }
        }
      }
      try {
        checkDeep(form);
        if (form.title.trim().length > DISCIPLESHIP_LIMITS.title || !form.summary?.trim()) {
          throw new Error("Completa el título (máximo 50 caracteres) y el resumen.");
        }
        if (!form.category?.trim()) throw new Error("Selecciona una categoría.");
        if (!Array.isArray(form.content) || !form.content.length) {
          throw new Error("Agrega al menos una lección al material.");
        }
        if (form.content.some((lesson) => !lesson?.title?.trim() ||
            !Array.isArray(lesson.paragraphs) ||
            !lesson.paragraphs.some((paragraph) => typeof paragraph === "string" && paragraph.trim().length >= 12))) {
          throw new Error("Cada lección necesita un título y al menos un párrafo explicativo.");
        }
      } catch (failure) { setError(failure.message); return; }
    }
    // Evitamos enviar textos desproporcionados al crear o editar guías.
    if (resource.category === "prayer_guides") {
      const fields = ["title", "summary", "samplePrayer"];
      for (const field of fields) {
        const value = String(form[field] || "").trim();
        if (!value || value.length > PRAYER_GUIDE_LIMITS[field]) {
          setError(`${titleOf(field)}: escribe un texto de máximo ${PRAYER_GUIDE_LIMITS[field]} caracteres.`);
          return;
        }
      }
      if (!form.category?.trim()) { setError("Selecciona una categoría."); return; }
      const textLists = ["description", "prayerPoints"];
      for (const name of textLists) {
        const values = form[name];
        if (!Array.isArray(values) || !values.length ||
            values.length > PRAYER_GUIDE_LIST_LIMITS[name] ||
            values.some((value) => typeof value !== "string" || value.length > PRAYER_GUIDE_LIMITS[name])) {
          setError(`Revisa ${titleOf(name).toLowerCase()}: límite de ${PRAYER_GUIDE_LIMITS[name]} caracteres por elemento.`);
          return;
        }
      }
      for (const field of ["reference", "text"]) {
        if (String(form.keyVerse?.[field] || "").length > PRAYER_GUIDE_LIMITS[field]) {
          setError(`El versículo admite máximo ${PRAYER_GUIDE_LIMITS[field]} caracteres en ${titleOf(field).toLowerCase()}.`);
          return;
        }
      }
    }
    if (isDownload) {
      const description = Array.isArray(form.description)
        ? form.description.join("\n\n").trim() : String(form.description || "").trim();
      const included = Array.isArray(form.includedContent)
        ? form.includedContent.join("\n").trim() : String(form.includedContent || "").trim();
      if (title.trim().length > DOWNLOAD_LIMITS.title) {
        setError("El título no puede superar 50 caracteres."); return;
      }
      if (!form.category?.trim()) { setError("Selecciona una categoría."); return; }
      if (included.length > DOWNLOAD_LIMITS.includedContent) {
        setError("'Este material incluye' no puede superar 200 caracteres."); return;
      }
      if (description.length < 12 || description.length > DOWNLOAD_LIMITS.description) {
        setError("La descripción debe tener entre 12 y 300 caracteres."); return;
      }
      if (documentFile) {
        const extension = documentFile.name.split(".").pop().toLowerCase();
        if (!ACCEPTED_EXTENSIONS.has(extension) || documentFile.size > MAX_DOCUMENT_BYTES || documentFile.size < 100) {
          setError("Selecciona un PDF o Word válido de hasta 4 MB."); return;
        }
      }
      if (publish && resource.isNew && !documentFile && !form.driveFileId && !form.available) {
        setError("Para publicar un material nuevo, primero selecciona su documento."); return;
      }
    }
    setError("");
    submittingRef.current = true;
    try {
      // La duración ya no corresponde a Estudios, Discipulado ni Guías de oración.
      // La retiramos también del envío si alguna edición antigua la conserva.
      const contentToSave = isStudy || ["discipleship", "prayer_guides"].includes(resource.category)
        ? Object.fromEntries(Object.entries(form).filter(([key]) => key !== "duration"))
        : form;
      if (publish) await onSaveAndPublish?.(resource, contentToSave, documentFile);
      else await onSaveDraft?.(resource, contentToSave, documentFile);
    } catch (failure) {
      setError(failure?.response?.data?.message || failure?.message || "No pudimos guardar el material.");
    } finally {
      // Permitimos reintentar únicamente cuando terminó la solicitud anterior.
      submittingRef.current = false;
    }
  }

  return (
    <div className="resource-edit-modal__overlay" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !saving) onClose?.();
    }}>
      <section ref={modalRef} className="resource-edit-modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <header className="resource-edit-modal__header">
          <div>
            <small>GESTIÓN DE RECURSOS · {categoryName}</small>
            <h2 id={titleId}>{resource.isNew ? "Agregar contenido" : "Editar contenido"}</h2>
            <p>{isDownload ? "Completa los datos y selecciona el PDF o Word que podrán descargar los miembros." :
              "Actualiza lo que leerá la comunidad y revisa tus cambios antes de publicarlos."}</p>
          </div>
          <button ref={closeRef} type="button" className="resource-edit-modal__close"
            onClick={onClose} disabled={saving} aria-label="Cerrar editor"><X size={20} /></button>
        </header>
        <div className="resource-edit-modal__body">
          {isDownload ? (
            <DownloadableFields form={form} update={update} file={documentFile} setFile={setDocumentFile}
              disabled={saving} resource={resource} />
          ) : (
            <>
              <ContentField name="material" value={form} path={[]} update={update}
                disabled={saving} section={resource.category}
                reservedStepNumbers={reservedStepNumbers} />
              {resource.category === "discipleship" && Array.isArray(form.content) && (
                <>
                  <p className="resource-edit-modal__auto-count">Lecciones del material: <strong>{form.content.length}</strong> (se cuentan solas).</p>
                  <p className="resource-edit-modal__auto-count">Puedes desarrollar cada lección con varios párrafos. Los cambios se mostrarán a la comunidad únicamente después de publicarlos.</p>
                </>
              )}
            </>
          )}
          {error && <p className="resource-edit-modal__error" role="alert">{error}</p>}
        </div>
        <footer className="resource-edit-modal__footer">
          <button type="button" className="resource-edit-modal__cancel" disabled={saving} onClick={onClose}>Cancelar</button>
          <button type="button" className="resource-edit-modal__draft" disabled={saving} onClick={() => submit(false)}>
            <Save size={16} /> Guardar borrador
          </button>
          <button type="button" className="resource-edit-modal__publish" disabled={saving} onClick={() => submit(true)}>
            <Send size={16} /> {saving ? "Guardando..." : "Guardar y publicar"}
          </button>
        </footer>
      </section>
    </div>
  );
}

export default ResourceFormModal;
