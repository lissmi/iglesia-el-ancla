import { useMemo, useState } from "react";
import {
    BookOpen, CircleHelp, FileText, Globe2, Info, LockKeyhole,
    Pencil, Plus, Search, Trash2, Users, X, Save, RotateCcw,
} from "lucide-react";

import "../../../styles/components/administration/martin/MartinKnowledge.css";
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
    const { knowledgeEntries: entries, addKnowledgeEntry, updateKnowledgeEntry, deleteKnowledgeEntry } = useMartin();
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(null);
    const [notice, setNotice] = useState("");

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

    const saveEntry = (event) => {
        event.preventDefault();
        if (!form.title.trim() || !form.question.trim() || !form.answer.trim() || !form.source.trim()) {
            setNotice("Completa el título, la pregunta, la respuesta y la fuente antes de guardar.");
            return;
        }
        const cleaned = {
            ...form,
            title: form.title.trim(),
            question: form.question.trim(),
            answer: form.answer.trim(),
            source: form.source.trim(),
        };
        if (editingId) {
            updateKnowledgeEntry(editingId, cleaned);
        } else {
            addKnowledgeEntry(cleaned);
        }
        closeForm();
        setNotice("Registro actualizado en esta demostración. No se ha guardado en el servidor.");
    };

    const deleteEntry = (entry) => {
        if (!window.confirm(`¿Eliminar «${entry.title}» de esta demostración?`)) return;
        deleteKnowledgeEntry(entry.id);
        setNotice("Registro eliminado de esta demostración.");
    };

    const toggleStatus = (entry) => {
        const nextStatus = entry.status === "published" ? "draft" : "published";
        updateKnowledgeEntry(entry.id, { status: nextStatus });
        setNotice("Estado modificado solo en esta demostración; no habilita respuestas de GPT.");
    };

    return (
        <section className="martin-knowledge" aria-label="Base de conocimiento de Martín">
            <div className="martin-knowledge__notice">
                <Info size={19} aria-hidden="true" />
                <p><strong>Modo demostración.</strong> Estos registros son locales y se reinician al recargar la página. Incluso los marcados como «Aprobado» no están disponibles para Martín ni conectados a GPT.</p>
            </div>

            <div className="martin-knowledge__topbar">
                <div>
                    <h4>Contenidos autorizables</h4>
                    <p>Prepara respuestas verificadas y decide qué información podrá utilizar el asistente.</p>
                </div>
                <button className="martin-knowledge__primary" type="button" onClick={beginCreate}>
                    <Plus size={17} /> Añadir contenido
                </button>
            </div>

            <div className="martin-knowledge__metrics">
                <div><strong>{entries.length}</strong><span>Registros locales</span></div>
                <div><strong>{entries.filter((entry) => entry.status === "published").length}</strong><span>Aprobados en demo</span></div>
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

            {notice && <p className="martin-knowledge__feedback" role="status">{notice}</p>}

            <div className="martin-knowledge__list">
                {filteredEntries.length === 0 ? (
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
                                    {entry.status === "published" ? "Aprobado (demo)" : "Borrador"}
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
                                    <button type="button" onClick={() => toggleStatus(entry)}>{entry.status === "published" ? <RotateCcw size={15} /> : <LockKeyhole size={15} />}{entry.status === "published" ? "Volver a borrador" : "Aprobar en demo"}</button>
                                    <button type="button" onClick={() => beginEdit(entry)}><Pencil size={15} /> Editar</button>
                                    <button className="martin-knowledge__delete" type="button" onClick={() => deleteEntry(entry)}><Trash2 size={15} /> Eliminar</button>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>

            {form && (
                <div className="martin-knowledge__overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) closeForm(); }}>
                    <div className="martin-knowledge__modal" role="dialog" aria-modal="true" aria-labelledby="martin-knowledge-modal-title">
                        <div className="martin-knowledge__modal-heading">
                            <div><h4 id="martin-knowledge-modal-title">{editingId ? "Editar contenido" : "Nuevo contenido"}</h4><p>Registra información que deberá verificarse antes de su publicación real.</p></div>
                            <button type="button" aria-label="Cerrar formulario" onClick={closeForm}><X size={20} /></button>
                        </div>
                        <form onSubmit={saveEntry} className="martin-knowledge__form">
                            <label>Título<input value={form.title} onChange={(event) => updateField("title", event.target.value)} maxLength={120} required /></label>
                            <div className="martin-knowledge__form-grid">
                                <label>Categoría<select value={form.category} onChange={(event) => updateField("category", event.target.value)}>{Object.entries(CATEGORIES).map(([key, category]) => <option key={key} value={key}>{category.label}</option>)}</select></label>
                                <label>Audiencia<select value={form.audience} onChange={(event) => updateField("audience", event.target.value)}><option value="public">Visitantes y miembros</option><option value="members">Solo miembros</option></select></label>
                            </div>
                            <label>Pregunta habitual<input value={form.question} onChange={(event) => updateField("question", event.target.value)} maxLength={250} required /></label>
                            <label>Respuesta autorizable<textarea rows={5} value={form.answer} onChange={(event) => updateField("answer", event.target.value)} maxLength={2500} required /></label>
                            <label>Fuente o referencia<input value={form.source} onChange={(event) => updateField("source", event.target.value)} maxLength={250} placeholder="Documento, sección o referencia bíblica" required /></label>
                            <label>Estado<select value={form.status} onChange={(event) => updateField("status", event.target.value)}><option value="draft">Borrador</option><option value="published">Aprobado (solo demostración)</option></select></label>
                            <div className="martin-knowledge__form-actions">
                                <button type="button" className="martin-knowledge__secondary" onClick={closeForm}>Cancelar</button>
                                <button type="submit" className="martin-knowledge__primary"><Save size={16} /> Guardar en demo</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}

export default MartinKnowledge;
