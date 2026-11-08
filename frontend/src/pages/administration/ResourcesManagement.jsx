// =========================================================
// ADMINISTRACIÓN REAL DE RECURSOS - IGLESIA EL ANCLA
// =========================================================
// Los contenidos originales siguen en React. MongoDB registra únicamente
// sus ediciones y los materiales agregados por los administradores.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, BookOpen, ExternalLink, RotateCcw, Save, Send, Undo2 } from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

import ResourcesHeader from "../../components/administration/resources/ResourcesHeader";
import ResourcesSummary from "../../components/administration/resources/ResourcesSummary";
import ResourcesCategories, { RESOURCE_CATEGORIES } from "../../components/administration/resources/ResourcesCategories";
import ResourcesToolbar from "../../components/administration/resources/ResourcesToolbar";
import ResourcesList from "../../components/administration/resources/ResourcesList";
import ResourceFormModal from "../../components/administration/resources/ResourceFormModal";
import ResourceDetailsModal from "../../components/administration/resources/ResourceDetailsModal";
import ResourceDeleteModal from "../../components/administration/resources/ResourceDeleteModal";
import BibleBooksAdmin from "../../components/administration/resources/BibleBooksAdmin";

import { RESOURCE_CONTENT_DEFAULTS, RESOURCE_CONTENT_ORDER } from "../../data/resources/resourceCatalogDefaults";
import {
  resourceEntryKey, getAdminResourceContent,
  saveResourcePageDraft, publishResourcePage,
  saveResourceEntryDraft, publishResourceEntry,
  hideResourceEntry, permanentlyDeleteResourceEntry, restoreResourceEntry,
  saveDownloadFileDraft, downloadDiscipleshipPdf, downloadPrayerGuidePdf,
} from "../../services/resourcesContentApi";
// Reutilizamos las mismas ilustraciones que identifican los recursos del miembro.
import bibliaImage from "../../assets/images/resources/biblia-estudio.png";
import estudiosImage from "../../assets/images/resources/estudios-biblicos.png";
import devocionalImage from "../../assets/images/resources/guia-devocional.png";
import discipuladoImage from "../../assets/images/resources/discipulado.png";
import oracionImage from "../../assets/images/resources/guia-oracion.png";
import descargablesImage from "../../assets/images/resources/material-descargable.png";
import preguntasImage from "../../assets/images/resources/preguntas-frecuentes.png";
import "../../styles/pages/administration/ResourcesManagement.css";

const RESOURCE_SECTION_IMAGES = {
  bible: bibliaImage, studies: estudiosImage, devotionals: devocionalImage,
  discipleship: discipuladoImage, prayer_guides: oracionImage,
  downloads: descargablesImage, faq: preguntasImage,
};

const categoryNames = Object.fromEntries(RESOURCE_CATEGORIES.map(({ id, name }) => [id, name]));
const neutralRemote = { page: null, entries: [] };

// Evitamos que dos estudios nuevos tengan identificadores iguales.
function blankResource(section) {
  const template = RESOURCE_CONTENT_DEFAULTS[section].items[0];
  if (!template) throw new Error("No encontramos una estructura de material para esta sección");
  const content = structuredClone(template);
  const key = `new-${crypto.randomUUID()}`;
  // Un descargable nuevo no hereda las listas técnicas del material original.
  if (section === "downloads") {
    return { key, category: section, isBuiltin: false, isNew: true,
      expectedRevision: 0, id: `${section}:${key}`,
      content: { title: "", category: content.category || "Discipulado",
        includedContent: "", description: "" } };
  }
  // Preservamos la estructura de cada categoría, pero vaciamos su contenido.
  const reset = (item) => {
    if (Array.isArray(item)) return item.length ? [reset(item[0])] : [];
    if (item && typeof item === "object") {
      return Object.fromEntries(Object.entries(item).map(([k, v]) =>
        [k, k === "id" ? `new-${crypto.randomUUID()}` : reset(v)]));
    }
    if (typeof item === "boolean") return false;
    if (typeof item === "number") return 0;
    return "";
  };
  const empty = reset(content);
  if ("id" in empty) empty.id = key;
  if ("slug" in empty) empty.slug = key;
  // Las listas y filtros deben reconocer inmediatamente una categoría.
  if ("category" in empty) empty.category = content.category;
  if ("level" in empty) empty.level = content.level;
  if (section === "prayer_guides") delete empty.duration;
  if ("format" in empty) empty.format = content.format;
  // Las rutas, relaciones y campos técnicos se gestionan automáticamente.
  if ("links" in empty) empty.links = [];
  if ("relatedMaterials" in empty) empty.relatedMaterials = [];
  if ("filePath" in empty) empty.filePath = "";
  if ("available" in empty) empty.available = false;
  if (section === "devotionals") empty.number = ""; // Se asignará al crear el paso.
  if ("title" in empty) empty.title = "";
  if ("question" in empty) empty.question = "";
  return { key, content: empty, category: section, isBuiltin: false,
    isNew: true, expectedRevision: 0, id: `${section}:${key}` };
}

// Solo extraemos texto para las tarjetas: nunca entregamos objetos como hijos React.
function summaryFor(content) {
  if (typeof content.summary === "string") return content.summary;
  if (typeof content.description === "string") return content.description.slice(0, 350);
  if (Array.isArray(content.description)) return content.description.filter((p) => typeof p === "string").join(" ").slice(0, 350);
  if (typeof content.purpose === "string") return content.purpose;
  if (Array.isArray(content.answer)) return content.answer.filter((p) => typeof p === "string").join(" ").slice(0, 350);
  return "";
}

// El modelo inicial se toma de los archivos existentes, no de registros duplicados.
function buildResourceCards(remoteBySection) {
  return RESOURCE_CONTENT_ORDER.flatMap((section) => {
    const initial = RESOURCE_CONTENT_DEFAULTS[section].items;
    const rows = remoteBySection[section]?.entries || [];
    const map = new Map(rows.map((item) => [item.key, item]));
    const baseKeys = new Set(initial.map(resourceEntryKey));
    const originals = initial.map((item) => {
      const key = resourceEntryKey(item);
      const record = map.get(key);
      const content = record?.draft || record?.published ?
        { ...item, ...(record.draft || record.published) } : item;
      const hasUnpublishedChanges = Boolean(record?.draftRevision > record?.publishedRevision);
      return {
        id: `${section}:${key}`, key, category: section, content,
        title: content.title || content.question || "Sin título",
        description: section === "downloads" ?
          (Array.isArray(content.description) ? content.description.join(" ") : String(content.description || "")).slice(0, 120) : summaryFor(content),
        author: content.author || "", reference: content.reference || "",
        isBuiltin: true, isNew: false, hidden: record?.hidden || false,
        hasDbRecord: Boolean(record),
        expectedRevision: record?.draftRevision || 0,
        publishedRevision: record?.publishedRevision || 0,
        publishedTitle: record?.published?.title || item.title,
        status: hasUnpublishedChanges ? "draft" : "published",
        hasPublishedVersion: true, hasUnpublishedChanges,
        createdAt: record?.updatedAt || "",
      };
    });
    const custom = rows.filter((item) => item.isCustom && !baseKeys.has(item.key)).map((record) => {
      const content = { id: record.key, slug: record.key, ...(record.draft || record.published || {}) };
      const hasUnpublishedChanges = record.draftRevision > record.publishedRevision;
      return {
        id: `${section}:${record.key}`, key: record.key, category: section, content,
        title: content.title || content.question || "Sin título",
        description: section === "downloads" ?
          (Array.isArray(content.description) ? content.description.join(" ") : String(content.description || "")).slice(0, 120) : summaryFor(content),
        author: content.author || "", isBuiltin: false, isNew: false,
        hasDbRecord: true,
        hidden: record.hidden, expectedRevision: record.draftRevision || 0,
        publishedRevision: record.publishedRevision || 0,
        publishedTitle: record.published?.title || content.title || "Material de discipulado",
        status: hasUnpublishedChanges ? "draft" : "published",
        hasPublishedVersion: Boolean(record.publishedRevision), hasUnpublishedChanges,
        createdAt: record.updatedAt || "",
      };
    });
    return [...originals, ...custom];
  });
}

function ResourcesManagement() {
  const [remote, setRemote] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // Bloqueo inmediato: evita descargas simultáneas por clics repetidos.
  const downloadingPdfLock = useRef(false);
  // Identifica la tarjeta que está preparando el documento.
  const [downloadingPdfKey, setDownloadingPdfKey] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  // Cada categoría se abre en su propia ruta de administración.
  const { section } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const basePath = location.pathname.startsWith("/super-admin") ? "/super-admin" : "/admin";
  const selectedCategory = RESOURCE_CONTENT_ORDER.includes(section) ? section : "all";
  const isCategoryPage = selectedCategory !== "all";
  const [externalCounts, setExternalCounts] = useState({ solidarity_library: null, songbook: null });
  // En Biblia separamos las 66 fichas de libros de las seis herramientas.
  const [bibleView, setBibleView] = useState("books");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [pageDraft, setPageDraft] = useState(RESOURCE_CONTENT_DEFAULTS.studies.heading);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Los otros dos módulos tienen API propia: solo consultamos sus cantidades.
      const [data, countResults] = await Promise.all([
        Promise.all(RESOURCE_CONTENT_ORDER.map((section) => getAdminResourceContent(section))),
        Promise.allSettled([
          api.get("/library/books"),
          api.get("/songbook/songs", { params: { page: 1 } }),
        ]),
      ]);
      setExternalCounts({
        solidarity_library: countResults[0].status === "fulfilled" &&
          Array.isArray(countResults[0].value.data?.books)
          ? countResults[0].value.data.books.length : null,
        songbook: countResults[1].status === "fulfilled" &&
          Number.isSafeInteger(countResults[1].value.data?.total)
          ? countResults[1].value.data.total : null,
      });
      setRemote(Object.fromEntries(RESOURCE_CONTENT_ORDER.map((section, index) => [section, data[index]])));
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "No pudimos consultar los contenidos. Intenta actualizar.");
      throw requestError;
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh().catch(() => {}); }, [refresh]);
  const selected = isCategoryPage ? selectedCategory : "studies";
  const activeData = remote[selected] || neutralRemote;
  useEffect(() => {
    if (!isCategoryPage) return;
    const fallback = RESOURCE_CONTENT_DEFAULTS[selectedCategory]?.heading;
    setPageDraft({ ...fallback, ...(remote[selectedCategory]?.page?.draft || remote[selectedCategory]?.page?.published || {}) });
  }, [selectedCategory, remote, isCategoryPage]);

  const resources = useMemo(() => buildResourceCards(remote), [remote]);
  const hidden = useMemo(() => resources.filter((item) => item.hidden), [resources]);
  const available = useMemo(() => resources.filter((item) => !item.hidden), [resources]);
  const displayed = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("es");
    return available.filter((item) =>
      (selectedCategory === "all" || item.category === selectedCategory) &&
      (statusFilter === "all" || item.status === statusFilter) &&
      (!term || [item.title, item.description, item.author, categoryNames[item.category]]
        .join(" ").toLocaleLowerCase("es").includes(term))
    ).sort((a, b) => {
      // En la guía devocional ordenamos de forma numérica, no por fecha.
      if (selectedCategory === "devotionals" && sortOrder === "step") {
        return Number(a.content.number) - Number(b.content.number);
      }
      if (sortOrder === "title-asc") return a.title.localeCompare(b.title, "es");
      if (sortOrder === "title-desc") return b.title.localeCompare(a.title, "es");
      const diff = new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      return sortOrder === "oldest" ? diff : -diff;
    });
  }, [available, selectedCategory, statusFilter, search, sortOrder]);

  // Al abrir otra categoría mostramos el catálogo completo de esa sección.
  useEffect(() => {
    setSearch("");
    setStatusFilter("all");
    setSortOrder(selectedCategory === "devotionals" ? "step" : "newest");
  }, [selectedCategory]);

  function clearFilters() { setSearch(""); setStatusFilter("all");
    setSortOrder(selectedCategory === "devotionals" ? "step" : "newest"); }
  function openNew() {
    const section = selectedCategory === "all" ? "studies" : selectedCategory;
    try {
      const item = blankResource(section);
      if (section === "devotionals") {
        // Incluimos originales, nuevos y ocultos: cada paso conserva su número.
        const taken = resources.filter((resource) => resource.category === "devotionals")
          .map((resource) => Number(resource.content?.number))
          .filter((number) => Number.isSafeInteger(number) && number > 0);
        const nextNumber = Math.max(7, ...taken) + 1;
        if (nextNumber > 999) throw new Error("La guía alcanzó el máximo de pasos permitidos.");
        item.content.number = String(nextNumber).padStart(2, "0");
      }
      setEditing(item);
    }
    catch (failure) { setError(failure.message); }
  }

  async function storeEntry(resource, form, publish, documentFile = null) {
    setSaving(true);
    setNotice("");
    try {
      const saved = resource.category === "downloads" && documentFile
        ? await saveDownloadFileDraft(resource.key, form, !resource.isBuiltin, resource.expectedRevision, documentFile)
        : await saveResourceEntryDraft(resource.category, resource.key, form,
          !resource.isBuiltin, resource.expectedRevision);
      if (publish) await publishResourceEntry(resource.category, resource.key, saved.draftRevision);
      await refresh();
      setEditing(null);
      setNotice(publish ? "Los cambios ya están disponibles para la comunidad." :
        "Borrador guardado. Los miembros seguirán viendo la última versión publicada.");
    } catch (requestError) {
      setError(requestError?.response?.data?.message || requestError?.message || "No pudimos guardar el recurso.");
      throw requestError;
    } finally { setSaving(false); }
  }

  async function storeHeading(publish) {
    setSaving(true);
    setError(""); setNotice("");
    try {
      const saved = await saveResourcePageDraft(selected, pageDraft, activeData.page?.draftRevision || 0);
      if (publish) await publishResourcePage(selected, saved.draftRevision);
      await refresh();
      setNotice(publish ? "Encabezado actualizado para la comunidad." : "Encabezado guardado como borrador.");
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "No pudimos guardar el encabezado.");
    } finally { setSaving(false); }
  }

  // Ocultar conserva el registro y el archivo: puede restaurarse después.
  async function confirmHide(item) {
    setSaving(true);
    setError(""); setNotice("");
    try {
      const response = await hideResourceEntry(item.category, item.key, item.isBuiltin,
        item.expectedRevision);
      await refresh();
      setDeleting(null);
      setNotice(response.message || "Material oculto para los miembros.");
    } catch (failure) {
      setError(failure?.response?.data?.message || "No se pudo ocultar el material.");
      throw failure;
    } finally { setSaving(false); }
  }

  // Eliminar borra el registro; en originales restaurará el contenido de React.
  async function confirmPermanentDelete(item) {
    setSaving(true);
    setError(""); setNotice("");
    try {
      const response = await permanentlyDeleteResourceEntry(item.category, item.key,
        item.expectedRevision);
      await refresh();
      setDeleting(null);
      setNotice(response.message || "Se realizó el cambio solicitado.");
    } catch (failure) {
      setError(failure?.response?.data?.message || "No se pudo eliminar el documento.");
      throw failure;
    } finally { setSaving(false); }
  }

  async function restore(item) {
    setSaving(true);
    try { await restoreResourceEntry(item.category, item.key); await refresh();
      setNotice("El material vuelve a estar disponible para la comunidad."); }
    catch (failure) { setError(failure?.response?.data?.message || "No se pudo recuperar el material."); }
    finally { setSaving(false); }
  }

  // Descarga el estudio publicado usando el mismo generador de PDF del área de miembros.
  async function downloadStudyPdf(resource) {
    // La misma acción sirve para Discipulado y Guías de oración.
    if (!["discipleship", "prayer_guides"].includes(resource?.category) || downloadingPdfLock.current) return;

    // Un material añadido por un administrador debe publicarse primero.
    if (!resource.isBuiltin && !resource.hasPublishedVersion) {
      setError("Publica este material antes de descargarlo en PDF.");
      return;
    }

    downloadingPdfLock.current = true;
    setError("");
    setDownloadingPdfKey(resource.id);

    try {
      const downloadPdf = resource.category === "prayer_guides" ? downloadPrayerGuidePdf : downloadDiscipleshipPdf;
      // Si hay una publicación guardada, el servidor recupera SU versión pública.
      // No enviamos el borrador que podría estar editándose en Administración.
      if (resource.publishedRevision > 0) {
        await downloadPdf({
          id: resource.key,
          title: resource.publishedTitle || resource.title,
          driveStored: true,
        });
      } else {
        // Los materiales originales todavía viven en React y no necesitan Drive.
        const original = RESOURCE_CONTENT_DEFAULTS[resource.category].items.find(
          (item) => resourceEntryKey(item) === resource.key
        );

        if (!original) {
          throw new Error("No encontramos el contenido original de este material.");
        }

        await downloadPdf(original);
      }
    } catch (failure) {
      // Mostramos un mensaje sencillo, sin mencionar servicios técnicos.
      setError(failure?.message || "No pudimos descargar el material. Intenta nuevamente.");
    } finally {
      // React vuelve a habilitar el botón tanto en éxito como en error.
      downloadingPdfLock.current = false;
      setDownloadingPdfKey(null);
    }
  }

  // Vista previa de lo que ya está publicado: nunca muestra un borrador privado.
  const publicHeading = {
    ...RESOURCE_CONTENT_DEFAULTS[selected].heading,
    ...(activeData.page?.published || {}),
  };
  const memberSectionPaths = {
    bible: "biblia", studies: "estudios", devotionals: "devocional",
    discipleship: "discipulado", prayer_guides: "guias-oracion",
    downloads: "material-descargable", faq: "preguntas-frecuentes",
  };
  const countInCategory = available.filter((item) => item.category === selectedCategory).length;

  return (
    <main className="resources-management">
      <ResourcesHeader onCreateResource={isCategoryPage && selectedCategory !== "bible" ? openNew : undefined} />
      <div className="resources-management__content">
        {error && <p className="resource-cms__alert resource-cms__alert--error" role="alert">{error}</p>}
        {notice && <p className="resource-cms__alert" role="status">{notice}</p>}
        <div className="resource-cms__actions">
          <p>Los textos originales se conservan. Aquí puedes editarlos y publicar nuevos materiales.</p>
          <button type="button" onClick={() => refresh().catch(() => {})} disabled={loading || saving}>
            <RotateCcw size={16} /> {loading ? "Actualizando..." : "Actualizar recursos"}
          </button>
        </div>
        {!isCategoryPage ? (
          <>
            <ResourcesSummary resources={available} externalCounts={externalCounts}
              bibleEntries={remote.bible?.entries || []} />
            <ResourcesCategories resources={available} externalCounts={externalCounts}
              selectedCategory="all" />
          </>
        ) : (
          <>
            <button className="resource-cms__back" type="button"
              onClick={() => navigate(`${basePath}/recursos`)}>
              <ArrowLeft size={17} aria-hidden="true" /> Volver a las categorías
            </button>
            {/* El encabezado visible al administrador muestra la versión pública. */}
            <section className="resource-cms__category-hero" aria-label="Vista de la sección">
              <div className="resource-cms__category-copy">
                <span className="resource-cms__category-eyebrow">
                  {publicHeading.eyebrow || "Recursos de nuestra comunidad"}
                </span>
                <h2>{publicHeading.title} {publicHeading.highlight && <em>{publicHeading.highlight}</em>}</h2>
                <p>{publicHeading.description}</p>
                <div className="resource-cms__category-links">
                  <span>{selectedCategory === "bible" ? "66 libros bíblicos y 6 herramientas de estudio" : `${countInCategory} ${countInCategory === 1 ? "material" : "materiales"} en esta sección`}</span>
                  <Link to={`/member/recursos/${memberSectionPaths[selected]}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={15} aria-hidden="true" /> Ver la página del miembro
                  </Link>
                </div>
              </div>
              <div className="resource-cms__category-art" aria-hidden="true">
                <img src={RESOURCE_SECTION_IMAGES[selected]} alt="" />
              </div>
            </section>
            <details className="resource-cms__page-details">
              <summary>Editar título, subtítulo y presentación de la sección</summary>
              <section className="resource-cms__page-editor" aria-labelledby="resource-cms-page-title">
            <div className="resource-cms__section-heading">
              <BookOpen size={22} />
              <div><h2 id="resource-cms-page-title">Encabezado de {RESOURCE_CONTENT_DEFAULTS[selected].name}</h2>
                <p>Modifica el título, subtítulo y presentación que leerán los miembros.</p></div>
            </div>
            <div className="resource-cms__form-grid">
              {[["eyebrow", "Texto superior"], ["title", "Título de la página"],
                ["highlight", "Frase destacada (opcional)"], ["description", "Descripción de la página"]].map(([key, label]) => (
                <label className={key === "description" ? "resource-cms__full-field" : ""} key={key}>
                  <span>{label}</span>
                  {key === "description" ? <textarea rows={3} value={pageDraft[key] || ""} disabled={saving}
                    onChange={(event) => setPageDraft((old) => ({ ...old, [key]: event.target.value }))} /> :
                    <input value={pageDraft[key] || ""} disabled={saving}
                      onChange={(event) => setPageDraft((old) => ({ ...old, [key]: event.target.value }))} />}
                </label>
              ))}
            </div>
            <div className="resource-cms__page-actions">
              <small>Un borrador no modifica la versión que ve la comunidad.</small>
              <button type="button" disabled={saving || loading} onClick={() => storeHeading(false)}><Save size={16} /> Guardar borrador</button>
              <button type="button" className="resource-cms__primary" disabled={saving || loading} onClick={() => storeHeading(true)}>
                <Send size={16} /> Guardar y publicar
              </button>
            </div>
              </section>
            </details>
            {selectedCategory === "bible" && (
              <div className="resource-cms__bible-tabs" role="group" aria-label="Tipo de contenido bíblico">
                <button type="button" aria-pressed={bibleView === "books"} onClick={() => setBibleView("books")}>Libros bíblicos (66)</button>
                <button type="button" aria-pressed={bibleView === "tools"} onClick={() => setBibleView("tools")}>Herramientas de estudio (6)</button>
              </div>
            )}
            {selectedCategory === "bible" && bibleView === "books" && (
              <BibleBooksAdmin entries={activeData.entries || []} onSaved={refresh} />
            )}
            {(selectedCategory !== "bible" || bibleView === "tools") && (
            <>
            <ResourcesToolbar search={search} onSearchChange={setSearch} statusFilter={statusFilter}
          onStatusChange={setStatusFilter} sortOrder={sortOrder} onSortChange={setSortOrder}
          devotionalMode={selectedCategory === "devotionals"} onClearFilters={clearFilters} />
        <ResourcesList resources={displayed} totalResources={available.length}
          categoryName={selectedCategory === "all" ? "Todos los recursos" : RESOURCE_CONTENT_DEFAULTS[selected].name}
          categoryLabels={categoryNames} onView={setViewing} onEdit={setEditing}
          onDelete={setDeleting} onDownloadPdf={downloadStudyPdf}
          downloadingPdfKey={downloadingPdfKey} />
        {hidden.some((item) => item.category === selectedCategory) && (
          <section className="resource-cms__hidden"><h2>Materiales ocultos</h2>
            <p>Los documentos siguen guardados, pero los miembros no pueden verlos ni descargarlos.</p>
            {hidden.filter((item) => item.category === selectedCategory).map((item) => (
              <div className="resource-cms__hidden-row" key={item.id}>
                <span>{item.title}</span>
                <div className="resource-cms__hidden-actions">
                  <button type="button" disabled={saving} onClick={() => restore(item)}>
                    <Undo2 size={15} /> Volver a mostrar
                  </button>
                  <button type="button" className="resource-cms__danger-action"
                    disabled={saving} onClick={() => setDeleting(item)}>
                    {item.isBuiltin ? "Eliminar cambios guardados" : "Eliminar definitivamente"}
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}
            </>
            )}
          </>
        )}
      </div>
      <ResourceFormModal isOpen={Boolean(editing)} resource={editing} categoryName={categoryNames[editing?.category]}
        reservedStepNumbers={resources.filter((item) => item.category === "devotionals" &&
          item.key !== editing?.key).map((item) => Number(item.content?.number))
          .filter((number) => Number.isSafeInteger(number) && number > 0)}
        saving={saving} onClose={() => { if (!saving) setEditing(null); }}
        onSaveDraft={(resource, content, file) => storeEntry(resource, content, false, file)}
        onSaveAndPublish={(resource, content, file) => storeEntry(resource, content, true, file)} />
      <ResourceDetailsModal resource={viewing} onClose={() => setViewing(null)} onEdit={(item) => { setViewing(null); setEditing(item); }} />
      <ResourceDeleteModal resource={deleting} onClose={() => { if (!saving) setDeleting(null); }}
        onHide={confirmHide} onDeletePermanently={confirmPermanentDelete} />
    </main>
  );
}

export default ResourcesManagement;
