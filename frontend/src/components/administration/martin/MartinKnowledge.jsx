
import { useEffect, useMemo, useRef, useState } from "react";
import {
    BookOpen, CircleHelp, FileText, Globe2, Info, LockKeyhole,
    Pencil, Plus, Search, Trash2, Users, X, Save, RotateCcw, AlertTriangle,
} from "lucide-react";

import "../../../styles/components/administration/martin/MartinKnowledge.css";
import "../../../styles/components/administration/martin/MartinKnowledgeConfirm.css";
import { useMartin } from "../../../context/martin/MartinContext";

const EMPTY_FORM = {
    title: "", category: "institutional", audience: "public", status: "draft",
    question: "", answer: "", source: "",
};

const CATEGORIES = {
    institutional: { label: "Información institucional", icon: Globe2 },
    resources: { label: "Recursos y estudios", icon: BookOpen },
    biblical: { label: "Orientación bíblica", icon: FileText },
    faq: { label: "Preguntas frecuentes", icon: CircleHelp },
};

function MartinKnowledge() {
    const { knowledgeEntries: entries, knowledgeError, isKnowledgeLoading,
        addKnowledgeEntry, updateKnowledgeEntry, deleteKnowledgeEntry } = useMartin();
    const [isSaving, setIsSaving] = useState(false);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(null);
    const [notice, setNotice] = useState("");
    // El registro que se eliminará solo se borra después de la confirmación.
    const [entryToDelete, setEntryToDelete] = useState(null);
    // Guardamos la referencia al botón que cancela la eliminación.
    const cancelDeleteRef = useRef(null);

    // Al abrir la ventana llevamos el foco al botón más seguro.
    useEffect(() => {
        if (!entryToDelete) return undefined;
        cancelDeleteRef.current?.focus();
        const handleEscape = (event) => {
            if (event.key === "Escape") setEntryToDelete(null);
        };
        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [entryToDelete]);

    const filteredEntries = useMemo(() => entries.filter((entry) => {
        const matchesCategory = categoryFilter === "all" || entry.category === categoryFilter;
        const text = `${entry.title} ${entry.question} ${entry.answer} ${entry.source}`.toLocaleLowerCase("es");
        return matchesCategory && text.includes(search.trim().toLocaleLowerCase("es"));
    }), [entries, categoryFilter, search]);

    const beginCreate = () => {
        setEditingId(null);
        setForm({ ...EMPTY_FORM });
        setNotice("");
    };

    const beginEdit = (entry) => {
        setEditingId(entry.id);
        setForm({ ...entry });
        setNotice("");
    };

    const closeForm = () => {
        setForm(null);
        setEditingId(null);
    };

    const updateField = (field, value) => setForm((previous) => ({ ...previous, [field]: value }));

    const saveEntry = async (event) => {
        event.preventDefault();
        if (!form.title.trim() || !form.question.trim() || !form.answer.trim() || !form.source.trim()) {
            setNotice("Completa el título, la pregunta, la respuesta y la fuente antes de guardar.");
            return;
        }
        // Enviamos únicamente los campos editables, sin identificadores internos.
        const cleaned = {
            title: form.title.trim(),
            category: form.category,
            audience: form.audience,
            status: form.status,
            question: form.question.trim(),
            answer: form.answer.trim(),
            source: form.source.trim(),
        };
        setIsSaving(true);
        try {
            if (editingId) {
                await updateKnowledgeEntry(editingId, cleaned);
            } else {
                await addKnowledgeEntry(cleaned);
            }
            closeForm();
            setNotice("Contenido guardado correctamente. Tus cambios se conservarán al volver a entrar.");
        } catch (error) {
            setNotice(error.response?.data?.message || "No pudimos guardar el contenido. Inténtalo nuevamente.");
        } finally {
            setIsSaving(false);
        }
    };

    // Abrimos la confirmación sin eliminar el contenido todavía.
    const deleteEntry = (entry) => {
        setEntryToDelete(entry);
    };

    // Eliminamos el contenido solo después de la confirmación explícita.
    const confirmDelete = async () => {
        if (!entryToDelete || isSaving) return;
        setIsSaving(true);
        try {
            await deleteKnowledgeEntry(entryToDelete.id);
            setEntryToDelete(null);
            setNotice("Contenido eliminado correctamente.");
        } catch (error) {
            setNotice(error.response?.data?.message || "No pudimos eliminar el contenido. Inténtalo nuevamente.");
        } finally { setIsSaving(false); }
    };

    const toggleStatus = async (entry) => {
        if (isSaving) return;
        const nextStatus = entry.status === "published" ? "draft" : "published";
        setIsSaving(true);
        try {
            await updateKnowledgeEntry(entry.id, { status: nextStatus });
            setNotice(nextStatus === "published"
                ? "Contenido revisado. Martín podrá utilizarlo cuando resulte útil para responder."
                : "Contenido guardado como borrador. Martín dejará de utilizarlo.");
        } catch (error) {
            setNotice(error.response?.data?.message || "No pudimos cambiar el estado. Inténtalo nuevamente.");
        } finally { setIsSaving(false); }
    };

    return (
        <section className="martin-knowledge" aria-label="Base de conocimiento de Martín">
            <div className="martin-knowledge__notice">
                <Info size={19} aria-hidden="true" />
                <p><strong>Información revisada:</strong> los contenidos se guardan de forma segura. Martín solo utiliza las respuestas marcadas como «Revisado» cuando estén relacionadas con la pregunta de un miembro.</p>
            </div>

            <div className="martin-knowledge__topbar">
                <div>
                    <h4>Información para Martín</h4>
                    <p>Revisa preguntas habituales y prepara respuestas claras para nuestra comunidad.</p>
                </div>
                <button className="martin-knowledge__primary" type="button" onClick={beginCreate}>
                    <Plus size={17} /> Añadir contenido
                </button>
            </div>

            <div className="martin-knowledge__metrics">
                <div><strong>{entries.length}</strong><span>Contenidos guardados</span></div>
                <div><strong>{entries.filter((entry) => entry.status === "published").length}</strong><span>Revisados</span></div>
                <div><strong>{entries.filter((entry) => entry.status === "draft").length}</strong><span>Borradores</span></div>
            </div>

            <div className="martin-knowledge__filters">
                <label className="martin-knowledge__search">
                    <Search size={18} aria-hidden="true" />
                    <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar preguntas, respuestas o fuentes" aria-label="Buscar contenidos" />
                </label>
                <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} aria-label="Filtrar por categoría">
                    <option value="all">Todas las categorías</option>
                    {Object.entries(CATEGORIES).map(([key, category]) => <option key={key} value={key}>{category.label}</option>)}
                </select>
            </div>

            {knowledgeError && <p className="martin-knowledge__feedback" role="alert">{knowledgeError}</p>}
            {notice && <p className="martin-knowledge__feedback" role="status">{notice}</p>}

            <div className="martin-knowledge__list">
                {isKnowledgeLoading ? (
                    <div className="martin-knowledge__empty"><BookOpen size={27} /><strong>Cargando contenidos...</strong></div>
                ) : filteredEntries.length === 0 ? (
                    <div className="martin-knowledge__empty"><BookOpen size={27} /><strong>No se encontraron contenidos</strong><span>Prueba otros filtros o agrega un nuevo registro.</span></div>
                ) : filteredEntries.map((entry) => {
                    const category = CATEGORIES[entry.category] || CATEGORIES.faq;
                    const CategoryIcon = category.icon;
                    return (
                        <article className="martin-knowledge__entry" key={entry.id}>
                            <div className="martin-knowledge__entry-heading">
                                <span className="martin-knowledge__entry-icon"><CategoryIcon size={20} /></span>
                                <div className="martin-knowledge__entry-title">
                                    <h5>{entry.title}</h5>
                                    <span>{category.label}</span>
                                </div>
                                <span className={`martin-knowledge__status martin-knowledge__status--${entry.status}`}>
                                    {entry.status === "published" ? "Revisado" : "Borrador"}
                                </span>
                            </div>
                            <p className="martin-knowledge__question">{entry.question}</p>
                            <p className="martin-knowledge__answer">{entry.answer}</p>
                            <div className="martin-knowledge__source"><FileText size={15} /> Fuente: {entry.source}</div>
                            <div className="martin-knowledge__entry-footer">
                                <span className="martin-knowledge__audience">
                                    {entry.audience === "public" ? <Globe2 size={15} /> : <Users size={15} />}
                                    {entry.audience === "public" ? "Visitantes y miembros" : "Solo miembros"}
                                </span>
                                <div className="martin-knowledge__actions">
                                    <button type="button" onClick={() => toggleStatus(entry)} disabled={isSaving}>{entry.status === "published" ? <RotateCcw size={15} /> : <LockKeyhole size={15} />}{entry.status === "published" ? "Volver a borrador" : "Marcar como revisado"}</button>
                                    <button type="button" onClick={() => beginEdit(entry)} disabled={isSaving}><Pencil size={15} /> Editar</button>
                                    <button className="martin-knowledge__delete" type="button" onClick={() => deleteEntry(entry)} disabled={isSaving}><Trash2 size={15} /> Eliminar</button>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>

            {entryToDelete && (
                <div
                    className="martin-knowledge-confirm__overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) setEntryToDelete(null);
                    }}
                >
                    <div
                        className="martin-knowledge-confirm__dialog"
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="martin-confirm-delete-title"
                        aria-describedby="martin-confirm-delete-description"
                    >
                        <button
                            className="martin-knowledge-confirm__close"
                            type="button"
                            onClick={() => setEntryToDelete(null)}
                            aria-label="Cerrar ventana"
                        >
                            <X size={20} aria-hidden="true" />
                        </button>
                        <div className="martin-knowledge-confirm__icon" aria-hidden="true">
                            <AlertTriangle size={25} />
                        </div>
                        <h4 id="martin-confirm-delete-title">¿Eliminar este contenido?</h4>
                        <p id="martin-confirm-delete-description">
                            Vas a quitar <strong>«{entryToDelete.title}»</strong> de esta lista.
                            Esta acción no se puede deshacer.
                        </p>
                        <div className="martin-knowledge-confirm__actions">
                            <button
                                type="button"
                                className="martin-knowledge-confirm__cancel"
                                ref={cancelDeleteRef}
                                onClick={() => setEntryToDelete(null)}
                            >
                                Conservar contenido
                            </button>
                            <button
                                type="button"
                                className="martin-knowledge-confirm__delete"
                                onClick={confirmDelete} disabled={isSaving}
                            >
                                <Trash2 size={17} aria-hidden="true" />
                                Sí, eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {form && (
                <div className="martin-knowledge__overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) closeForm(); }}>
                    <div className="martin-knowledge__modal" role="dialog" aria-modal="true" aria-labelledby="martin-knowledge-modal-title">
                        <div className="martin-knowledge__modal-heading">
                            <div><h4 id="martin-knowledge-modal-title">{editingId ? "Editar contenido" : "Nuevo contenido"}</h4><p>Escribe información clara y comprueba que sea correcta antes de aprobarla.</p></div>
                            <button type="button" aria-label="Cerrar formulario" onClick={closeForm}><X size={20} /></button>
                        </div>
                        <form onSubmit={saveEntry} className="martin-knowledge__form">
                            <label>Título<input value={form.title} onChange={(event) => updateField("title", event.target.value)} maxLength={120} required /></label>
                            <div className="martin-knowledge__form-grid">
                                <label>Categoría<select value={form.category} onChange={(event) => updateField("category", event.target.value)}>{Object.entries(CATEGORIES).map(([key, category]) => <option key={key} value={key}>{category.label}</option>)}</select></label>
                                <label>Audiencia<select value={form.audience} onChange={(event) => updateField("audience", event.target.value)}><option value="public">Visitantes y miembros</option><option value="members">Solo miembros</option></select></label>
                            </div>
                            <label>Pregunta habitual<input value={form.question} onChange={(event) => updateField("question", event.target.value)} maxLength={250} required /></label>
                            <label>Respuesta sugerida<textarea rows={5} value={form.answer} onChange={(event) => updateField("answer", event.target.value)} maxLength={2500} required /></label>
                            <label>Fuente o referencia<input value={form.source} onChange={(event) => updateField("source", event.target.value)} maxLength={250} placeholder="Documento, sección o referencia bíblica" required /></label>
                            <label>Estado<select value={form.status} onChange={(event) => updateField("status", event.target.value)}><option value="draft">Borrador</option><option value="published">Revisado</option></select></label>
                            <div className="martin-knowledge__form-actions">
                                <button type="button" className="martin-knowledge__secondary" onClick={closeForm}>Cancelar</button>
                                <button type="submit" className="martin-knowledge__primary" disabled={isSaving}><Save size={16} /> {isSaving ? "Guardando..." : "Guardar contenido"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}

export default MartinKnowledge;



