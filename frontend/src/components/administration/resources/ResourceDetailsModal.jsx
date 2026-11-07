// =========================================================
// VISTA PREVIA COMPLETA DE UN RECURSO - IGLESIA EL ANCLA
// =========================================================
// Los materiales actuales son objetos con párrafos, listas y lecciones.
// Nunca insertamos el objeto completo directamente como hijo de React.
import { useEffect, useId, useRef } from "react";
import { BookOpen, Pencil, X, Link2, Info, FileText } from "lucide-react";
import { RESOURCE_CATEGORIES } from "./ResourcesCategories";
import "../../../styles/components/administration/resources/ResourceDetailsModal.css";


/* ========================================================= */
/* ETIQUETAS EN ESPAÑOL PARA LA VISTA PREVIA */
/* ========================================================= */

// Traducimos las claves internas a nombres fáciles de comprender.
const FIELD_LABELS = {
  title: "Título",
  description: "Descripción",
  purpose: "Propósito",
  level: "Nivel recomendado",
  duration: "Duración aproximada",
  passage: "Lectura bíblica",
  introduction: "Introducción",

  // Preguntas de estudios bíblicos y discipulado.
  questions: "Preguntas para reflexionar",
  reflectionQuestions: "Preguntas para reflexionar",

  application: "Aplicación práctica",
  objectives: "Objetivos",
  topics: "Temas principales",
  content: "Contenido del estudio",
  paragraphs: "Lectura",
  reflection: "Para reflexionar",
  lessons: "Lecciones",

  // Referencias y contenidos bíblicos.
  keyVerse: "Versículo destacado",
  reference: "Referencia bíblica",
  text: "Texto",

  // Guías devocionales.
  tips: "Consejos prácticos",
  reminder: "Para recordar",
  recommendation: "Recomendación",

  // Guías de oración.
  prayerPoints: "Puntos de oración",
  samplePrayer: "Oración sugerida",

  // Material descargable.
  includedContent: "Contenido incluido",
  recommendedFor: "Recomendado para",
  relatedMaterials: "Materiales relacionados",
  highlightedInfo: "Información destacada",
  available: "Disponible para descargar",
  format: "Formato",
  pages: "Páginas",
  fileSize: "Tamaño del archivo",
  filePath: "Archivo de descarga",

  // Actividades y pasos.
  practicalActivity: "Actividad práctica",
  number: "Paso",
  steps: "Pasos",

  // Información general.
  answer: "Respuesta",
  links: "Enlaces de interés",
  category: "Categoría",
};


const HIDDEN_FIELDS = new Set([
  "id", "slug", "title", "question", "summary", "featured",
  "driveFileId", "filePath", "links", "relatedMaterials", "pdfName", "fileBytes",
  "pages", "fileSize", "recommendedFor", "available", "driveStored",
]);
const PARAGRAPH_FIELDS = new Set(["description", "answer", "paragraphs"]);

function fieldLabel(key) {
  return FIELD_LABELS[key] || key.replace(/([A-Z])/g, " $1").replace(/^./, (first) => first.toUpperCase());
}

// Solo convertimos en enlaces activos las direcciones confiables.
function safeHref(value) {
  if (typeof value !== "string") return null;
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")) return value;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch { return null; }
}

// El mismo renderizador funciona para estudios, guías, devocionales y preguntas.
function PreviewValue({ value, field, depth = 0 }) {
  if (value === null || value === undefined || value === "") return null;

  if (typeof value === "string") {
    if (field === "includedContent") {
      return <ul className="resource-cms-preview__list">
        {value.split("\n").map((line) => line.trim()).filter(Boolean).map((line, index) => (
          <li key={index}>{line}</li>
        ))}
      </ul>;
    }
    const href = ["filePath", "path", "url", "link"].includes(field) ? safeHref(value) : null;
    return href ? (
      <a className="resource-cms-preview__link" href={href} target="_blank" rel="noopener noreferrer">
        <Link2 size={15} aria-hidden="true" /> Abrir enlace
      </a>
    ) : <p className="resource-cms-preview__paragraph">{value}</p>;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return <p className="resource-cms-preview__paragraph">{typeof value === "boolean" ? (value ? "Sí" : "No") : value}</p>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return <p className="resource-cms-preview__paragraph">No se ha añadido contenido.</p>;
    // Las descripciones y respuestas deben leerse como párrafos, no como viñetas.
    if (PARAGRAPH_FIELDS.has(field) && value.every((item) => typeof item === "string")) {
      return <div>{value.map((paragraph, index) => <p className="resource-cms-preview__paragraph" key={index}>{paragraph}</p>)}</div>;
    }
    if (value.every((item) => typeof item !== "object")) {
      return <ul className="resource-cms-preview__list">
        {value.map((item, index) => <li key={index}>{String(item)}</li>)}
      </ul>;
    }
    return <div className="resource-cms-preview__items">
      {value.map((item, index) => (
        <article className="resource-cms-preview__item" key={item?.id ?? index}>
          <strong>{item?.title || item?.label || `${fieldLabel(field)} ${index + 1}`}</strong>
          {/* Cada elemento se desarrolla dentro de su propia tarjeta. */}
          {item && typeof item === "object" ? (
            Object.entries(item).filter(([key]) => !["id", "title", "label"].includes(key)).map(([key, part]) => (
              <div className="resource-cms-preview__subsection" key={key}>
                <span>{fieldLabel(key)}</span>
                <PreviewValue value={part} field={key} depth={depth + 1} />
              </div>
            ))
          ) : <PreviewValue value={item} field={field} depth={depth + 1} />}
        </article>
      ))}
    </div>;
  }

  if (typeof value === "object") {
    // Una referencia bíblica se presenta como cita, no como objeto de JavaScript.
    if (field === "keyVerse" && (value.reference || value.text)) {
      return <blockquote className="resource-cms-preview__verse">
        {value.text && <p>{value.text}</p>}
        {value.reference && <cite>{value.reference}</cite>}
      </blockquote>;
    }
    return <div className="resource-cms-preview__nested">
      {Object.entries(value).filter(([key]) => key !== "id").map(([key, part]) => (
        <div className="resource-cms-preview__subsection" key={key}>
          <span>{fieldLabel(key)}</span>
          <PreviewValue value={part} field={key} depth={depth + 1} />
        </div>
      ))}
    </div>;
  }
  return null;
}

function ResourceDetailsModal({ resource, onClose, onEdit }) {
  const titleId = useId();
  const closeRef = useRef(null);
  const modalRef = useRef(null);

  // Gestionamos foco, Escape y bloqueo de desplazamiento del fondo.
  useEffect(() => {
    if (!resource) return undefined;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    function handleKeys(event) {
      if (event.key === "Escape") { event.preventDefault(); onClose?.(); }
      if (event.key !== "Tab") return;
      const focusables = Array.from(modalRef.current?.querySelectorAll('button:not(:disabled), a[href]') || []);
      if (!focusables.length) return;
      if (event.shiftKey && document.activeElement === focusables[0]) {
        event.preventDefault(); focusables[focusables.length - 1].focus();
      } else if (!event.shiftKey && document.activeElement === focusables[focusables.length - 1]) {
        event.preventDefault(); focusables[0].focus();
      }
    }
    document.addEventListener("keydown", handleKeys);
    return () => {
      document.removeEventListener("keydown", handleKeys);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, [resource, onClose]);

  if (!resource) return null;
  const content = resource.content && typeof resource.content === "object" ? resource.content : {};
  const category = RESOURCE_CATEGORIES.find((item) => item.id === resource.category);
  const summary = typeof content.summary === "string" ? content.summary : resource.description;
  const isDraft = resource.hasUnpublishedChanges || resource.status === "draft";

  return <div className="resource-details-modal__overlay" onMouseDown={(event) => {
    if (event.target === event.currentTarget) onClose?.();
  }}>
    <section ref={modalRef} className="resource-details-modal resource-cms-preview" role="dialog"
      aria-modal="true" aria-labelledby={titleId}>
      <header className="resource-details-modal__header">
        <div>
          <span className="resource-details-modal__eyebrow">VISTA PREVIA DE RECURSO</span>
          <h2 id={titleId}>{resource.title || "Sin título"}</h2>
          <div className="resource-details-modal__badges">
            <span className="resource-details-modal__category">{category?.name || "Recurso"}</span>
            <span className={`resource-details-modal__status resource-details-modal__status--${isDraft ? "draft" : "published"}`}>
              {isDraft ? (resource.hasPublishedVersion ? "Cambios sin publicar" : "Borrador") : "Publicado"}
            </span>
          </div>
        </div>
        <button ref={closeRef} type="button" className="resource-details-modal__close"
          onClick={onClose} aria-label="Cerrar vista previa"><X size={20} /></button>
      </header>
      <div className="resource-details-modal__body">
        <p className="resource-cms-preview__intro">{summary || "Consulta los detalles de este recurso."}</p>
        {isDraft && <div className="resource-cms-preview__notice"><Info size={17} /> Estás viendo el borrador del administrador. La comunidad seguirá viendo la última versión publicada.</div>}
        {Object.entries(content).filter(([key]) => !HIDDEN_FIELDS.has(key)).map(([key, value]) => (
          <section className="resource-details-modal__section resource-cms-preview__section" key={key}>
            <h3><FileText size={17} aria-hidden="true" />{fieldLabel(key)}</h3>
            <PreviewValue value={value} field={key} />
          </section>
        ))}
        {!Object.keys(content).length && <div className="resource-cms-preview__notice"><BookOpen size={17} /> No hay información adicional.</div>}
      </div>
      <footer className="resource-details-modal__footer">
        <button type="button" className="resource-details-modal__secondary" onClick={onClose}>Cerrar</button>
        <button type="button" className="resource-details-modal__primary" onClick={() => onEdit?.(resource)} disabled={!onEdit}>
          <Pencil size={16} aria-hidden="true" /> Editar recurso
        </button>
      </footer>
    </section>
  </div>;
}

export default ResourceDetailsModal;
