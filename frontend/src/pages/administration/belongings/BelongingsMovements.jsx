// =========================================================
// HISTORIAL DE MOVIMIENTOS DE LOS BIENES - DATOS REALES
// Los movimientos están almacenados en MongoDB.
// =========================================================
import { useMemo, useState } from "react";
import { ArrowLeftRight, ClipboardCheck, ClipboardList, FilePlus2, Search, Eye, Pencil, Trash2, X, AlertTriangle, RotateCcw, } from "lucide-react";
import BelongingMovementModal from "../../../components/administration/belongings/BelongingMovementModal";
import { useBelongings } from "../../../context/belongings/BelongingsContext";
import { belongingsMovementTypes } from "../../../data/belongings/belongingsDemoData";
import "../../../styles/pages/administration/belongings/BelongingsMovements.css";

function BelongingsMovements() {
  const { movements, belongings, loading, busy, error, reload, registerMovement, updateMovement, deleteMovement } = useBelongings();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [form, setForm] = useState({ date: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");

  // Se conserva el nombre del bien aunque no se repita en cada movimiento.
  const belongingFor = (id) => belongings.find((b) => b.id === id);
  const typeLabel = (value) => belongingsMovementTypes[value] || value;
  const formatDate = (value) => value && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? `${value.slice(8, 10)}/${value.slice(5, 7)}/${value.slice(0, 4)}` : "Sin fecha";


  /* =========================================================
     FILTRADO Y ORDENAMIENTO DE MOVIMIENTOS
     ========================================================= */

  // Memorizamos los resultados para evitar cálculos innecesarios.
  const filtered = useMemo(() => {

    // Normalizamos el texto de búsqueda.
    const normalizedSearch = search.trim().toLocaleLowerCase("es");

    // Filtramos los movimientos registrados.
    return movements
      .filter((item) => {

        // Buscamos directamente el bien asociado al movimiento.
        const belonging = belongings.find(
          (b) => b.id === item.belongingId
        );

        // Unificamos los campos que pueden buscarse.
        const combined = [
          belonging?.name,
          belonging?.code,
          item.description,
          item.performedBy,
        ]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase("es");

        // Comprobamos el tipo de movimiento.
        const matchesType =
          !type || item.type === type;

        // Comprobamos el término de búsqueda.
        const matchesSearch =
          combined.includes(normalizedSearch);

        // Incluimos solamente los resultados coincidentes.
        return matchesType && matchesSearch;
      })

      // Ordenamos por fecha, desde la más reciente.
      .sort((a, b) =>
        String(b.date).localeCompare(String(a.date))
      );

  }, [movements, belongings, search, type]);


  const close = () => { if (saving) return; setViewing(null); setEditing(null); setDeleting(null); setActionError(""); };
  const openEdit = (item) => { setViewing(null); setEditing(item); setForm({ date: item.date, description: item.description || "" }); setActionError(""); };
  async function saveEdit(event) {
    event.preventDefault();
    if (!editing || saving) return;
    setSaving(true); setActionError("");
    try { await updateMovement(editing.id, form); setEditing(null); }
    catch (cause) { setActionError(cause.message || "No pudimos guardar el cambio."); }
    finally { setSaving(false); }
  }
  async function confirmDelete() {
    if (!deleting || saving) return;
    setSaving(true); setActionError("");
    try { await deleteMovement(deleting.id); setDeleting(null); }
    catch (cause) { setActionError(cause.message || "No pudimos eliminar el movimiento."); }
    finally { setSaving(false); }
  }

  return (
    <div className="belongings-movements">

      {/* ===================================================== */}
      {/* ENCABEZADO DEL HISTORIAL DE MOVIMIENTOS */}
      {/* ===================================================== */}

      <header className="belongings-movements__header">

        {/* Información principal de la página. */}
        <div>
          <span className="belongings-movements__eyebrow">
            Administración de bienes
          </span>

          <h1>Movimientos del inventario</h1>

          <p>
            Consulta las revisiones y los cambios de cantidad
            registrados por los administradores.
          </p>
        </div>

        {/* Agrupamos las acciones del encabezado. */}
        <div className="belongings-movements__header-actions">

          {/* Actualiza los movimientos desde MongoDB. */}
          <button
            type="button"
            className="belongings-movements__refresh"
            onClick={() => reload().catch(() => { })}
            disabled={loading || busy}
          >
            <RotateCcw
              size={17}
              strokeWidth={1.9}
              aria-hidden="true"
              className={
                loading
                  ? "belongings-movements__refresh-icon--loading"
                  : ""
              }
            />

            <span>
              {loading
                ? "Actualizando..."
                : "Actualizar movimientos"}
            </span>
          </button>

          {/* Abre el formulario para registrar un movimiento. */}
          <button
            type="button"
            className="belongings-movements__add"
            onClick={() => setIsCreateOpen(true)}
            disabled={loading || busy}
          >
            <FilePlus2 size={18} aria-hidden="true" />

            <span>Registrar movimiento</span>
          </button>

        </div>

      </header>

      {/* Mostramos los errores de consulta. */}
      {error && (
        <p role="alert" style={{ color: "#a23f35" }}>
          {error}
        </p>
      )}

      <section className="belongings-movements__stats">
        <article className="belongings-movements__stat"><ArrowLeftRight size={22} /><strong>{movements.length}</strong><span>Movimientos registrados</span></article>
        <article className="belongings-movements__stat"><ClipboardCheck size={22} /><strong>{movements.filter((x) => x.type === "inspection").length}</strong><span>Revisiones de estado</span></article>
        <article className="belongings-movements__stat"><ClipboardList size={22} /><strong>{movements.filter((x) => x.type === "adjustment").length}</strong><span>Ajustes de cantidad</span></article>
      </section>
      <section className="belongings-movements__filters" aria-label="Filtros de movimientos">
        <div className="belongings-movements__search"><Search size={18} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} type="search" placeholder="Buscar bien, código o comentario..." aria-label="Buscar movimientos" />
        </div>
        <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Tipo de movimiento">
          <option value="">Todos los movimientos</option>
          {Object.entries(belongingsMovementTypes).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </section>
      <section className="belongings-movements__history">
        <div className="belongings-movements__history-header"><h2>Historial de movimientos</h2><span>{filtered.length} resultados</span></div>
        {loading ? <div className="belongings-movements__empty" role="status">Cargando movimientos...</div> :
          filtered.length ? <div className="belongings-movements__table-scroll">
            <table><thead><tr>
              <th>Fecha</th><th>Movimiento</th><th>Bien</th><th>Cantidad / cambio</th><th>Registrado por</th><th>Observación</th><th>Acciones</th>
            </tr></thead><tbody>
                {filtered.map((item) => <tr key={item.id}>
                  <td>{formatDate(item.date)}</td>
                  <td><span className="belongings-movements__type">{typeLabel(item.type)}</span></td>
                  <td><div className="belongings-movements__item">
                    <strong>{belongingFor(item.belongingId)?.name || "Bien eliminado"}</strong>
                    <span>{belongingFor(item.belongingId)?.code || "—"}</span>
                  </div></td>
                  <td>{item.type === "adjustment" ? `${item.delta > 0 ? "+" : ""}${item.delta}` : item.quantity}</td>
                  <td>{item.performedBy || "Administrador"}</td>
                  <td>{item.description || "—"}</td>
                  <td><div className="belongings-movements__actions">
                    <button type="button" className="belongings-movements__action" onClick={() => setViewing(item)} aria-label="Ver movimiento"><Eye size={17} /></button>
                    <button type="button" className="belongings-movements__action" onClick={() => openEdit(item)} aria-label="Editar movimiento"><Pencil size={16} /></button>
                    <button type="button" className="belongings-movements__action belongings-movements__action--delete" onClick={() => { setDeleting(item); setActionError(""); }} aria-label="Eliminar movimiento"><Trash2 size={17} /></button>
                  </div></td>
                </tr>)}
              </tbody></table>
          </div> : <div className="belongings-movements__empty">
            <ArrowLeftRight size={32} /><h3>No se encontraron movimientos</h3>
            <p>Cuando registres una revisión o un ajuste, aparecerá aquí.</p>
          </div>}
      </section>
      <BelongingMovementModal isOpen={isCreateOpen} belongings={belongings} onClose={() => setIsCreateOpen(false)} onSave={registerMovement} />
      {viewing && <div className="belongings-movements__modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
        <section className="belongings-movements__modal" role="dialog" aria-modal="true" aria-labelledby="movement-detail-title">
          <header className="belongings-movements__modal-header"><div>
            <span className="belongings-movements__modal-eyebrow">{typeLabel(viewing.type)}</span>
            <h2 id="movement-detail-title">Detalle del movimiento</h2>
          </div><button type="button" className="belongings-movements__modal-close" onClick={close}><X size={20} /></button></header>
          <div className="belongings-movements__detail-grid">
            <div><span>Bien</span><strong>{belongingFor(viewing.belongingId)?.name || "Sin registro"}</strong></div>
            <div><span>Fecha</span><strong>{formatDate(viewing.date)}</strong></div>
            <div><span>Registrado por</span><strong>{viewing.performedBy || "Administrador"}</strong></div>
            <div><span>Cantidad / cambio</span><strong>{viewing.type === "adjustment" ? `${viewing.delta > 0 ? "+" : ""}${viewing.delta}` : viewing.quantity}</strong></div>
          </div>
          <div className="belongings-movements__detail-description"><span>Observación</span><p>{viewing.description || "Sin observación"}</p></div>
          <div className="belongings-movements__modal-actions">
            <button type="button" className="belongings-movements__button-secondary" onClick={close}>Cerrar</button>
            <button type="button" className="belongings-movements__button-primary" onClick={() => openEdit(viewing)}><Pencil size={16} />Editar</button>
          </div>
        </section></div>}
      {editing && <div className="belongings-movements__modal-overlay">
        <section className="belongings-movements__modal" role="dialog" aria-modal="true" aria-labelledby="movement-edit-title">
          <header className="belongings-movements__modal-header"><div><h2 id="movement-edit-title">Corregir registro</h2></div>
            <button type="button" className="belongings-movements__modal-close" disabled={saving} onClick={close}><X size={20} /></button></header>
          <p className="belongings-movements__modal-help">Puedes corregir la fecha y el comentario. No cambiaremos la cantidad ni el estado actual del bien.</p>
          <form onSubmit={saveEdit}>
            <div className="belongings-movements__form-grid">
              <label>Fecha<input type="date" value={form.date} onChange={(e) => setForm((x) => ({ ...x, date: e.target.value }))} disabled={saving} required /></label>
              <label className="belongings-movements__form-full">Observación<textarea rows={3} maxLength={1000} value={form.description} onChange={(e) => setForm((x) => ({ ...x, description: e.target.value }))} disabled={saving} /></label>
            </div>
            {actionError && <p role="alert" className="belongings-movements__error">{actionError}</p>}
            <div className="belongings-movements__modal-actions">
              <button type="button" className="belongings-movements__button-secondary" disabled={saving} onClick={close}>Cancelar</button>
              <button type="submit" className="belongings-movements__button-primary" disabled={saving}>{saving ? "Guardando..." : "Guardar cambios"}</button>
            </div>
          </form>
        </section></div>}
      {deleting && <div className="belongings-movements__modal-overlay">
        <section className="belongings-movements__modal belongings-movements__modal--delete" role="alertdialog" aria-modal="true" aria-labelledby="movement-delete-title">
          <header className="belongings-movements__modal-header"><span className="belongings-movements__danger-icon"><Trash2 size={22} /></span>
            <button type="button" className="belongings-movements__modal-close" disabled={saving} onClick={close}><X size={20} /></button></header>
          <h2 id="movement-delete-title">¿Eliminar este movimiento?</h2>
          <p>Eliminarás el registro de <strong>{typeLabel(deleting.type)}</strong> de manera definitiva.</p>
          <div className="belongings-movements__delete-summary">
            <strong>{belongingFor(deleting.belongingId)?.name || "Bien sin registro"}</strong>
            <span>{formatDate(deleting.date)}</span>
          </div>
          <div className="belongings-movements__warning"><AlertTriangle size={19} />
            <p>El historial desaparecerá, pero esto no revertirá automáticamente cambios ya realizados en la cantidad o el estado del bien.</p>
          </div>
          {actionError && <p role="alert" className="belongings-movements__error">{actionError}</p>}
          <div className="belongings-movements__modal-actions">
            <button type="button" className="belongings-movements__button-secondary" disabled={saving} onClick={close}>Cancelar</button>
            <button type="button" className="belongings-movements__button-danger" disabled={saving} onClick={confirmDelete}><Trash2 size={17} />{saving ? "Eliminando..." : "Eliminar definitivamente"}</button>
          </div>
        </section></div>}
    </div>
  );
}
export default BelongingsMovements;
