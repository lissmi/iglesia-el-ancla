// =========================================================
// ADMINISTRACIÓN DE LAS FICHAS DE LOS 66 LIBROS BÍBLICOS
// =========================================================
// Los libros permanecen en el frontend; solo editamos los textos auxiliares.
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BookOpen, Eye, Pencil, Search } from "lucide-react";
import originalOld from "../../../data/bible/oldTestamentBooks";
import originalNew from "../../../data/bible/newTestamentBooks";
import "../../../styles/components/administration/resources/BibleBooksAdmin.css";

const BOOKS = [...originalOld, ...originalNew];

// Permite buscar libros aunque se escriban sin tildes.
const normalize = (value) => String(value || "")
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .toLocaleLowerCase("es").trim();

function BibleBooksAdmin({ entries = [] }) {
  const [query, setQuery] = useState("");
  const [testament, setTestament] = useState("todos");
  const navigate = useNavigate();
  const location = useLocation();
  const adminBase = location.pathname.startsWith("/super-admin/") ? "/super-admin" : "/admin";

  // Relacionamos cada libro con la edición guardada, si existe.
  const records = useMemo(() => new Map(entries.map((item) => [item.key, item])), [entries]);

  // El orden lo determina la Biblia original, nunca la fecha de edición.
  const books = useMemo(() => BOOKS.filter((book) => {
    const matchesTestament = testament === "todos" ||
      book.testament === (testament === "antiguo" ? "Antiguo Testamento" : "Nuevo Testamento");
    const searchable = normalize([book.name, book.group, book.theme].join(" "));
    return matchesTestament && searchable.includes(normalize(query));
  }), [query, testament]);

  const editedCount = BOOKS.filter((book) => records.has(`book-${book.slug}`)).length;

  return (
    <section className="bible-admin" aria-labelledby="bible-admin-title">
      <div className="bible-admin__header">
        <div>
          <span className="bible-admin__eyebrow">CONTENIDO DE APOYO</span>
          <h2 id="bible-admin-title">Información de los 66 libros bíblicos</h2>
          <p>Edita los resúmenes, enseñanzas, personajes y versículos que acompañan a cada libro. El nombre y el número de capítulos permanecen iguales.</p>
        </div>
        <div className="bible-admin__summary">
          <strong>{editedCount}</strong><span>libros con cambios guardados</span>
        </div>
      </div>
      <div className="bible-admin__filters">
        <label className="bible-admin__search">
          <Search size={18} aria-hidden="true" />
          <input value={query} type="search" placeholder="Buscar un libro bíblico..." aria-label="Buscar un libro bíblico" onChange={(event) => setQuery(event.target.value)} />
        </label>
        <label>
          <span className="bible-admin__filter-label">Testamento</span>
          <select value={testament} onChange={(event) => setTestament(event.target.value)} aria-label="Filtrar por testamento">
            <option value="todos">Ambos testamentos</option>
            <option value="antiguo">Antiguo Testamento</option>
            <option value="nuevo">Nuevo Testamento</option>
          </select>
        </label>
      </div>
      <p className="bible-admin__count">{books.length} {books.length === 1 ? "libro encontrado" : "libros encontrados"}</p>
      <div className="bible-admin__grid">
        {books.map((book) => {
          const record = records.get(`book-${book.slug}`);
          const hasDraft = Boolean(record?.draft && record.draftRevision > record.publishedRevision);
          const title = book.name;
          const summary = record?.published?.theme ?? book.theme;
          return (
            <article key={book.slug} className="bible-admin__card">
              <div className="bible-admin__card-top">
                <span className="bible-admin__icon"><BookOpen size={22} aria-hidden="true" /></span>
                <span className={`bible-admin__status${hasDraft ? " bible-admin__status--draft" : ""}`}>
                  {hasDraft ? "Cambios sin publicar" : "Publicado"}
                </span>
              </div>
              <small>{book.testament} · {book.group}</small>
              <h3>{title}</h3>
              <p>{summary}</p>
              <div className="bible-admin__card-footer">
                <span>{book.chapters} {book.chapters === 1 ? "capítulo" : "capítulos"}</span>
                <div className="bible-admin__actions">
                  <a href={`/member/recursos/biblia/libro/${book.slug}`} target="_blank" rel="noopener noreferrer" title={`Ver la ficha publicada de ${title}`} aria-label={`Ver ficha publicada de ${title}`}><Eye size={17}/></a>
                  <button type="button" onClick={() => navigate(`${adminBase}/recursos/biblia/libro/${book.slug}/editar`)} title={`Editar información de ${title}`} aria-label={`Editar información de ${title}`}><Pencil size={17}/></button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {!books.length && <p className="bible-admin__empty">No encontramos libros con esos filtros.</p>}

    </section>
  );
}

export default BibleBooksAdmin;
