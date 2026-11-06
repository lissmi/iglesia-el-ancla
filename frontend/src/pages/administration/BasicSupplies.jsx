// =========================================================
// ADMINISTRACIÓN DE INSUMOS BÁSICOS - IGLESIA EL ANCLA
// Todas las cantidades provienen de MongoDB, nunca de datos de prueba.
// =========================================================
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Package,
  HandHeart,
  ShoppingCart,
  TrendingUp,
  RefreshCw,
  CheckCircle2,
  Clock3,
  Users,
  PackageCheck,
  AlertTriangle, // Advertencia en la eliminación irreversible.
  Trash2, // Icono del botón para eliminar un insumo.
  Info,
  X,
  Loader2,
} from "lucide-react";
import {
  createBasicSupply, updateBasicSupply, listBasicSuppliesAdmin,
  registerBasicSupplyMovement, deleteBasicSupply,
  deliverBasicSupplyPledge, basicSupplyApiError,
} from "../../services/basicSuppliesApi";
import {
  getBasicSupplyStatus, getBasicSupplySuggestedQuantity,
} from "../../data/basicSupplies/basicSuppliesDemoData";
import "../../styles/pages/administration/BasicSupplies.css";
import BasicSuppliesHeader from "../../components/administration/basicSupplies/BasicSuppliesHeader";
import BasicSuppliesSummary from "../../components/administration/basicSupplies/BasicSuppliesSummary";
import BasicSuppliesInventory from "../../components/administration/basicSupplies/BasicSuppliesInventory";
import BasicSuppliesNeeds from "../../components/administration/basicSupplies/BasicSuppliesNeeds";
import BasicSuppliesShopping from "../../components/administration/basicSupplies/BasicSuppliesShopping";
import BasicSuppliesForecast from "../../components/administration/basicSupplies/BasicSuppliesForecast";
import BasicSupplyFormModal from "../../components/administration/basicSupplies/modals/BasicSupplyFormModal";
import BasicSupplyMovementModal from "../../components/administration/basicSupplies/modals/BasicSupplyMovementModal";

// Formulario limpio reutilizado al crear y editar.
const blankSupply = () => ({
  name: "", category: "Alimentos", stock: "0", minimumStock: "2", notes: "",
});

function BasicSupplies() {
  const [supplies, setSupplies] = useState([]);
  const [movementHistory, setMovementHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("inventory");
  const [showSupplyModal, setShowSupplyModal] = useState(false);
  const [editingSupply, setEditingSupply] = useState(null);
  const [supplyForm, setSupplyForm] = useState(blankSupply);
  const [movementSupply, setMovementSupply] = useState(null);
  const [movementType, setMovementType] = useState("income");
  const [movementQuantity, setMovementQuantity] = useState("1");
  const [shoppingSelection, setShoppingSelection] = useState([]);

  // Identifica el compromiso que estamos confirmando para informar al administrador.
  const [confirmingCommitment, setConfirmingCommitment] = useState("");

  // Controlamos nuestra ventana de confirmación, sin alertas nativas del navegador.
  const [deliveryConfirmation, setDeliveryConfirmation] = useState(null);
  const [deliveryError, setDeliveryError] = useState("");
  const deliveryDialogRef = useRef(null);
  const deliveryCancelRef = useRef(null);

  // Guardamos el insumo que el administrador quiere eliminar.
  // Su selección NO elimina nada hasta confirmar en el diálogo.
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const deleteDialogRef = useRef(null);
  const deleteCancelRef = useRef(null);

  // Cerramos la confirmación de eliminación solo si no hay una petición en curso.
  const closeDeleteConfirmation = () => {
    if (busy) return;
    setDeleteConfirmation(null);
    setDeleteError("");
  };

  // La confirmación de eliminación comparte los mismos criterios de
  // accesibilidad que el modal existente de recepción: foco y teclado.
  useEffect(() => {
    // Si el diálogo está cerrado, no instalamos eventos globales.
    if (!deleteConfirmation) return undefined;

    // Conservamos el foco y el estado de desplazamiento de la página.
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (!busy) deleteCancelRef.current?.focus();

    const handleKeyDown = (event) => {
      // Escape cancela, salvo cuando MongoDB está procesando la eliminación.
      if (event.key === "Escape") {
        event.preventDefault();
        if (!busy) {
          setDeleteConfirmation(null);
          setDeleteError("");
        }
      }

      // Mantenemos la navegación por Tab dentro de la ventana abierta.
      if (event.key !== "Tab") return;
      const buttons = Array.from(
        deleteDialogRef.current?.querySelectorAll('button:not([disabled])') || []
      );
      if (!buttons.length) {
        event.preventDefault();
        return;
      }
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, [deleteConfirmation, busy]);

  // Cerramos la ventana solamente cuando no se está registrando una entrega.
  const closeDeliveryConfirmation = () => {
    if (busy) return;
    setDeliveryConfirmation(null);
    setDeliveryError("");
  };

  // Conservamos el foco dentro del diálogo y permitimos cerrarlo con Escape.
  useEffect(() => {
    if (!deliveryConfirmation) return undefined;

    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (!busy) deliveryCancelRef.current?.focus();

    const handleDialogKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (!busy) {
          setDeliveryConfirmation(null);
          setDeliveryError("");
        }
      }

      if (event.key !== "Tab") return;

      const buttons = Array.from(
        deliveryDialogRef.current?.querySelectorAll('button:not([disabled])') || []
      );
      if (!buttons.length) {
        event.preventDefault();
        return;
      }
      const first = buttons[0];
      const last = buttons[buttons.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleDialogKeyDown);
    return () => {
      document.removeEventListener("keydown", handleDialogKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, [deliveryConfirmation, busy]);

  // Consultamos el mismo catálogo que utilizan todas las operaciones.
  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await listBasicSuppliesAdmin();
      setSupplies(response.supplies || []);
      setMovementHistory(response.movements || []);
    } catch (cause) { setError(basicSupplyApiError(cause)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { reload(); }, [reload]);

  // Calculamos las métricas usando solo registros persistidos.
  const summary = useMemo(() => {
    const low = supplies.filter((s) => getBasicSupplyStatus(s) === "low").length;
    const out = supplies.filter((s) => getBasicSupplyStatus(s) === "out").length;
    return { total: supplies.length, low, out, available: supplies.length - low - out, needsAttention: low + out };
  }, [supplies]);
  const filteredSupplies = useMemo(() => supplies.filter((s) =>
    (s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase())) &&
    (categoryFilter === "all" || s.category === categoryFilter) &&
    (statusFilter === "all" || getBasicSupplyStatus(s) === statusFilter)
  ), [supplies, search, categoryFilter, statusFilter]);
  const needsSupplies = useMemo(() => supplies.filter((s) => getBasicSupplyStatus(s) !== "available"), [supplies]);
  const shoppingSupplies = supplies.filter((s) => shoppingSelection.includes(s.id));

  // Los compromisos YA vienen en la respuesta de GET /basic-supplies/admin.
  // El backend los obtiene desde MongoDB e incorpora el nombre del miembro.
  // No necesitamos crear otro endpoint ni guardar datos duplicados en React.
  const pendingCommitments = useMemo(() => {
    return supplies
      .flatMap((supply) => (supply.pledges || []).map((pledge) => {
        // El campo member llega poblado con firstName y lastName.
        // Si la cuenta fue eliminada, mostramos un nombre genérico.
        const member = pledge.member;
        const memberId = typeof member === "string"
          ? member
          : member?._id || "";

        const memberName = member && typeof member === "object"
          ? [member.firstName, member.lastName].filter(Boolean).join(" ")
          : "";

        return {
          key: `${supply.id}-${memberId || "sin-cuenta"}`,
          supply,
          pledge,
          memberId,
          memberName: memberName || "Miembro no disponible",
          quantity: Number(pledge.quantity) || 0,
          createdAt: pledge.createdAt || null,
        };
      }))
      // Mostramos primero a quienes llevan más tiempo esperando la entrega.
      .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
  }, [supplies]);

  // Resumen para que los encargados vean rápidamente las ayudas pendientes.
  const pledgedUnits = pendingCommitments.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // Fecha legible para personas de la comunidad.
  const formatCommitmentDate = (value) => {
    if (!value) return "Fecha no disponible";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Fecha no disponible";

    return new Intl.DateTimeFormat("es-CL", {
      timeZone: "America/Santiago",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  function openCreate() { setEditingSupply(null); setSupplyForm(blankSupply()); setShowSupplyModal(true); }
  function openEdit(s) {
    setEditingSupply(s);
    setSupplyForm({
      name: s.name, category: s.category,
      stock: String(s.stock), minimumStock: String(s.minimumStock), notes: s.notes || "",
    });
    setShowSupplyModal(true);
  }
  async function execute(operation, successText) {
    if (busy) return false;
    setBusy(true); setError(""); setMessage("");
    try { await operation(); await reload(); setMessage(successText); return true; }
    catch (cause) { setError(basicSupplyApiError(cause)); return false; }
    finally { setBusy(false); }
  }
  async function handleSave(event) {
    event.preventDefault();
    const data = {
      name: supplyForm.name.trim(), category: supplyForm.category,
      minimumStock: Number(supplyForm.minimumStock), notes: supplyForm.notes.trim(),
    };
    // El formulario de edición no altera las existencias directamente.
    if (!editingSupply) data.stock = Number(supplyForm.stock);
    const saved = await execute(() => editingSupply
      ? updateBasicSupply(editingSupply.id, data, editingSupply.__v)
      : createBasicSupply(data), editingSupply ? "Insumo actualizado." : "Insumo registrado.");
    if (saved) { setShowSupplyModal(false); setEditingSupply(null); }
  }
  async function handleMovement(event) {
    event.preventDefault();
    if (!movementSupply) return;
    const quantity = Number(movementQuantity);
    const saved = await execute(() => registerBasicSupplyMovement(movementSupply.id, movementType, quantity), "Movimiento registrado.");
    if (saved) { setMovementSupply(null); setMovementQuantity("1"); }
  }
  function openMovement(s, type) { setMovementSupply(s); setMovementType(type); setMovementQuantity("1"); }
  // Abre el diálogo sin borrar el insumo ni cambiar el stock.
  // Si hay colaboraciones pendientes, el diálogo avisará y bloqueará el borrado.
  function handleDelete(supply) {
    if (!supply || busy) return;
    setDeleteError("");
    setDeleteConfirmation({
      id: supply.id,
      name: supply.name,
      category: supply.category,
      stock: supply.stock,
      pendingPledges: (supply.pledges || []).length,
    });
  }

  // La eliminación definitiva ocurre solamente después del segundo clic.
  async function handleConfirmDelete() {
    if (!deleteConfirmation || busy) return;

    // No permitimos borrar insumos que alguien todavía ofreció entregar.
    if (deleteConfirmation.pendingPledges > 0) {
      setDeleteError("Primero confirma o resuelve las colaboraciones pendientes de este insumo.");
      return;
    }

    setBusy(true);
    setDeleteError("");
    setError("");
    setMessage("");

    try {
      // Reutilizamos la petición DELETE y las validaciones del backend.
      await deleteBasicSupply(deleteConfirmation.id);

      // Actualizamos el inventario desde MongoDB, sin datos simulados.
      await reload();

      // Cerramos el diálogo únicamente cuando el DELETE se confirmó.
      setDeleteConfirmation(null);
      setMessage("Insumo eliminado definitivamente.");
    } catch (cause) {
      // Mostramos los errores de eliminación dentro de la ventana abierta.
      setDeleteError(basicSupplyApiError(cause));
    } finally {
      setBusy(false);
    }
  }
  // Al hacer clic en «Confirmar recepción» solo abrimos nuestro diálogo.
  // NO modificamos el inventario hasta aceptar la confirmación.
  function handleDeliver(supply, pledge) {
    if (busy) return;

    const member = pledge.member;
    const memberId = typeof member === "string" ? member : member?._id;
    const memberName = typeof member === "object" && member
      ? [member.firstName, member.lastName].filter(Boolean).join(" ")
      : "este miembro";

    if (!memberId) {
      setError("No encontramos la cuenta de esta persona. Revisa su registro antes de confirmar.");
      return;
    }

    setDeliveryError("");
    setDeliveryConfirmation({
      supplyId: supply.id,
      supplyName: supply.name,
      memberId,
      memberName: memberName || "este miembro",
      quantity: Number(pledge.quantity) || 0,
    });
  }

  // Confirmamos únicamente la entrega seleccionada y consultamos el stock real.
  async function handleConfirmDelivery() {
    if (!deliveryConfirmation || busy) return;

    const { supplyId, memberId } = deliveryConfirmation;
    setConfirmingCommitment(`${supplyId}-${memberId}`);
    setBusy(true);
    setDeliveryError("");
    setError("");
    setMessage("");

    try {
      // El backend controla que este compromiso no se confirme dos veces.
      await deliverBasicSupplyPledge(supplyId, memberId);
      // Volvemos a consultar MongoDB para mostrar las existencias actualizadas.
      await reload();
      setDeliveryConfirmation(null);
      setMessage("Entrega confirmada. Actualizamos las existencias del insumo.");
    } catch (cause) {
      // El error se muestra dentro del diálogo, no detrás de la ventana.
      setDeliveryError(basicSupplyApiError(cause));
    } finally {
      setConfirmingCommitment("");
      setBusy(false);
    }
  }
  function toggleShopping(id) { setShoppingSelection((old) => old.includes(id) ? old.filter((x) => x !== id) : [...old, id]); }
  function generateShoppingList() { setShoppingSelection(needsSupplies.map((s) => s.id)); setActiveTab("shopping"); }
  async function handleCopyShoppingList() {
    const content = shoppingSupplies.map((s) => `• ${s.name}: ${getBasicSupplySuggestedQuantity(s)} unidades`).join("\n");
    try { await navigator.clipboard.writeText(`Lista de compras - Iglesia El Ancla\n\n${content}`); setMessage("Lista copiada."); }
    catch { setError("No se pudo copiar la lista."); }
  }

  return (
    <main className="basic-supplies">
      <div className="basic-supplies__container">
        <BasicSuppliesHeader onAddSupply={openCreate} />
        <div className="basic-supply-live__tools">
          <span>Inventario de la comunidad</span>
          <button type="button" onClick={reload} disabled={loading || busy}><RefreshCw size={16} /> Actualizar</button>
        </div>
        {error && <p className="basic-supply-live__error" role="alert">{error}</p>}
        {message && <p className="basic-supply-live__success" role="status">{message}</p>}
        {loading ? <p role="status">Cargando insumos de la iglesia...</p> : <>
          <BasicSuppliesSummary summary={summary} />
          <nav className="basic-supplies__tabs" aria-label="Secciones de insumos básicos">
            {[
              { id: "inventory", label: "Inventario", icon: Package },
              { id: "needs", label: "Necesidades", icon: HandHeart },
              { id: "commitments", label: "Colaboraciones", icon: Users },
              { id: "shopping", label: "Lista de compras", icon: ShoppingCart },
              { id: "forecast", label: "Movimientos", icon: TrendingUp },
            ].map(({ id, label, icon: Icon }) =>
              <button
                key={id}
                type="button"
                className={`basic-supplies__tab ${activeTab === id ? "basic-supplies__tab--active" : ""}`}
                onClick={() => setActiveTab(id)}
              >
                <Icon size={17} aria-hidden="true" />
                {label}
                {/* El número se actualiza tras las confirmaciones de entrega. */}
                {id === "commitments" && pendingCommitments.length > 0 && (
                  <span className="basic-supply-collab__tab-count">
                    {pendingCommitments.length}
                  </span>
                )}
              </button>
            )}
          </nav>
          {activeTab === "inventory" && <BasicSuppliesInventory
            filteredSupplies={filteredSupplies} search={search} setSearch={setSearch}
            categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter}
            statusFilter={statusFilter} setStatusFilter={setStatusFilter}
            onOpenMovement={openMovement} onEditSupply={openEdit} onDeleteSupply={handleDelete} />}
          {/* Las necesidades y las colaboraciones se consultan por separado. */}
          {activeTab === "needs" && (
            <BasicSuppliesNeeds
              needsSupplies={needsSupplies}
              shoppingSelection={shoppingSelection}
              onToggleShoppingSupply={toggleShopping}
              onGenerateShoppingList={generateShoppingList}
            />
          )}

          {/* Lista administrativa de miembros que ofrecieron insumos. */}
          {activeTab === "commitments" && (
            <section className="basic-supply-collab" aria-labelledby="basic-supply-collab-title">
              <header className="basic-supply-collab__header">
                <div>
                  <span className="basic-supply-collab__eyebrow">
                    <HandHeart size={16} aria-hidden="true" />
                    Ayuda de nuestra comunidad
                  </span>
                  <h2 id="basic-supply-collab-title">
                    Colaboraciones pendientes de recibir
                  </h2>
                  <p>
                    Aquí puedes ver quién se ofreció a colaborar. Confirma cada
                    entrega solamente cuando los productos hayan llegado a la iglesia.
                  </p>
                </div>
                <button
                  className="basic-supply-collab__refresh"
                  type="button"
                  onClick={reload}
                  disabled={loading || busy}
                >
                  <RefreshCw size={16} aria-hidden="true" />
                  Actualizar
                </button>
              </header>

              <div className="basic-supply-collab__metrics">
                <div>
                  <span>Colaboraciones pendientes</span>
                  <strong>{pendingCommitments.length}</strong>
                </div>
                <div>
                  <span>Unidades ofrecidas</span>
                  <strong>{pledgedUnits}</strong>
                </div>
              </div>

              {pendingCommitments.length === 0 ? (
                <div className="basic-supply-collab__empty">
                  <CheckCircle2 size={29} aria-hidden="true" />
                  <strong>No hay entregas pendientes</strong>
                  <p>Cuando algún miembro se anote para colaborar, aparecerá aquí.</p>
                </div>
              ) : (
                <div className="basic-supply-collab__list">
                  {pendingCommitments.map((item) => (
                    <article className="basic-supply-collab__item" key={item.key}>
                      <div className="basic-supply-collab__item-main">
                        <div className="basic-supply-collab__person">
                          <Users size={17} aria-hidden="true" />
                          <strong>{item.memberName}</strong>
                        </div>
                        <h3>{item.supply.name}</h3>
                        <span className="basic-supply-collab__category">
                          {item.supply.category}
                        </span>
                        <div className="basic-supply-collab__date">
                          <Clock3 size={14} aria-hidden="true" />
                          Se anotó el {formatCommitmentDate(item.createdAt)}
                        </div>
                      </div>

                      <div className="basic-supply-collab__item-side">
                        <div className="basic-supply-collab__quantity">
                          <strong>{item.quantity}</strong>
                          <span>{item.quantity === 1 ? "unidad ofrecida" : "unidades ofrecidas"}</span>
                        </div>
                        <span className="basic-supply-collab__stock">
                          En la iglesia: {item.supply.stock} unidades
                        </span>
                        <button
                          type="button"
                          className="basic-supply-collab__confirm"
                          onClick={() => handleDeliver(item.supply, item.pledge)}
                          disabled={busy || !item.memberId}
                          title={!item.memberId ? "La cuenta ya no está disponible" : "Confirmar entrega recibida"}
                        >
                          <CheckCircle2 size={17} aria-hidden="true" />
                          {confirmingCommitment === item.key
                            ? "Confirmando..."
                            : "Confirmar recepción"}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              <p className="basic-supply-collab__notice">
                Las unidades ofrecidas todavía no se cuentan como existencias.
                Se agregarán al inventario cuando confirmes su recepción.
              </p>
            </section>
          )}
          {activeTab === "shopping" && <BasicSuppliesShopping shoppingSupplies={shoppingSupplies}
            onGenerateShoppingList={generateShoppingList} onToggleShoppingSupply={toggleShopping}
            onCopyShoppingList={handleCopyShoppingList} />}
          {activeTab === "forecast" && <BasicSuppliesForecast movementHistory={movementHistory} />}
        </>}
      </div>
      {/* Confirmación de recepción con el diseño propio de El Ancla. */}
      {deliveryConfirmation && (
        <div
          className="basic-supply-receipt-confirm__overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDeliveryConfirmation();
          }}
        >
          <section
            ref={deliveryDialogRef}
            className="basic-supply-receipt-confirm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="basic-supply-receipt-confirm-title"
            aria-describedby="basic-supply-receipt-confirm-description"
          >
            <header className="basic-supply-receipt-confirm__header">
              <div className="basic-supply-receipt-confirm__icon">
                <PackageCheck size={26} strokeWidth={1.8} aria-hidden="true" />
              </div>
              <div className="basic-supply-receipt-confirm__heading">
                <span>COLABORACIÓN DE LA COMUNIDAD</span>
                <h2 id="basic-supply-receipt-confirm-title">Confirmar recepción</h2>
              </div>
              <button
                type="button"
                className="basic-supply-receipt-confirm__close"
                onClick={closeDeliveryConfirmation}
                disabled={busy}
                aria-label="Cerrar sin confirmar"
              >
                <X size={19} aria-hidden="true" />
              </button>
            </header>

            <div className="basic-supply-receipt-confirm__body">
              <p id="basic-supply-receipt-confirm-description" className="basic-supply-receipt-confirm__intro">
                ¿Ya recibimos esta colaboración en la iglesia? Revisa los datos antes de confirmar.
              </p>

              <div className="basic-supply-receipt-confirm__details">
                <div>
                  <span>Persona que colaboró</span>
                  <strong>{deliveryConfirmation.memberName}</strong>
                </div>
                <div>
                  <span>Insumo recibido</span>
                  <strong>{deliveryConfirmation.supplyName}</strong>
                </div>
                <div>
                  <span>Cantidad entregada</span>
                  <strong>
                    {deliveryConfirmation.quantity} {deliveryConfirmation.quantity === 1 ? "unidad" : "unidades"}
                  </strong>
                </div>
              </div>

              <div className="basic-supply-receipt-confirm__notice">
                <Info size={18} aria-hidden="true" />
                <p>
                  Al confirmar, sumaremos esta cantidad a las existencias y la colaboración
                  dejará de aparecer entre las entregas pendientes.
                </p>
              </div>

              {deliveryError && (
                <p className="basic-supply-receipt-confirm__error" role="alert">
                  {deliveryError}
                </p>
              )}
            </div>

            <footer className="basic-supply-receipt-confirm__footer">
              <button
                ref={deliveryCancelRef}
                type="button"
                className="basic-supply-receipt-confirm__cancel"
                onClick={closeDeliveryConfirmation}
                disabled={busy}
              >
                Volver
              </button>
              <button
                type="button"
                className="basic-supply-receipt-confirm__submit"
                onClick={handleConfirmDelivery}
                disabled={busy}
              >
                {busy ? (
                  <Loader2 className="basic-supply-receipt-confirm__spinner" size={18} aria-hidden="true" />
                ) : (
                  <CheckCircle2 size={18} aria-hidden="true" />
                )}
                {busy ? "Confirmando..." : "Sí, confirmar recepción"}
              </button>
            </footer>
          </section>
        </div>
      )}

      {/* Confirmación de borrado: reutiliza el diseño del modal de recepción. */}
      {deleteConfirmation && (
        <div
          className="basic-supply-receipt-confirm__overlay basic-supply-delete-confirm__overlay"
          onMouseDown={(event) => {
            // Un clic fuera del diálogo equivale a cancelar, si no está borrando.
            if (event.target === event.currentTarget) closeDeleteConfirmation();
          }}
        >
          <section
            ref={deleteDialogRef}
            className="basic-supply-receipt-confirm basic-supply-receipt-confirm--delete"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="basic-supply-delete-confirm-title"
            aria-describedby="basic-supply-delete-confirm-description"
          >
            <header className="basic-supply-receipt-confirm__header">
              <div className="basic-supply-receipt-confirm__icon basic-supply-delete-confirm__icon">
                <Trash2 size={25} strokeWidth={1.8} aria-hidden="true" />
              </div>

              <div className="basic-supply-receipt-confirm__heading">
                <span>INVENTARIO DE LA IGLESIA</span>
                <h2 id="basic-supply-delete-confirm-title">¿Eliminar este insumo?</h2>
              </div>

              <button
                type="button"
                className="basic-supply-receipt-confirm__close"
                onClick={closeDeleteConfirmation}
                disabled={busy}
                aria-label="Cerrar sin eliminar"
              >
                <X size={19} aria-hidden="true" />
              </button>
            </header>

            <div className="basic-supply-receipt-confirm__body">
              <p
                id="basic-supply-delete-confirm-description"
                className="basic-supply-receipt-confirm__intro"
              >
                Revisa el insumo seleccionado antes de continuar. Si lo eliminas,
                desaparecerá del inventario y no podrás recuperarlo.
              </p>

              <div className="basic-supply-receipt-confirm__details">
                <div>
                  <span>Insumo seleccionado</span>
                  <strong>{deleteConfirmation.name}</strong>
                </div>
                <div>
                  <span>Categoría</span>
                  <strong>{deleteConfirmation.category || "Sin categoría"}</strong>
                </div>
                <div>
                  <span>Existencias actuales</span>
                  <strong>{deleteConfirmation.stock ?? 0} unidades</strong>
                </div>
              </div>

              <div className="basic-supply-receipt-confirm__notice basic-supply-delete-confirm__notice">
                <AlertTriangle size={19} aria-hidden="true" />
                <p>
                  {deleteConfirmation.pendingPledges > 0
                    ? `Hay ${deleteConfirmation.pendingPledges} ${deleteConfirmation.pendingPledges === 1 ? "colaboración pendiente" : "colaboraciones pendientes"} para este insumo. Primero confirma o resuelve esas entregas.`
                    : "Esta acción es definitiva y no se puede deshacer. El registro del insumo dejará de estar disponible."}
                </p>
              </div>

              {/* Los errores permanecen a la vista, sin cerrar el diálogo. */}
              {deleteError && (
                <p className="basic-supply-receipt-confirm__error" role="alert">
                  {deleteError}
                </p>
              )}
            </div>

            <footer className="basic-supply-receipt-confirm__footer">
              <button
                ref={deleteCancelRef}
                type="button"
                className="basic-supply-receipt-confirm__cancel"
                onClick={closeDeleteConfirmation}
                disabled={busy}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="basic-supply-receipt-confirm__submit basic-supply-delete-confirm__submit"
                onClick={handleConfirmDelete}
                disabled={busy || deleteConfirmation.pendingPledges > 0}
              >
                {busy ? (
                  <Loader2 className="basic-supply-receipt-confirm__spinner" size={17} aria-hidden="true" />
                ) : (
                  <Trash2 size={17} aria-hidden="true" />
                )}
                {busy ? "Eliminando..." : "Sí, eliminar definitivamente"}
              </button>
            </footer>
          </section>
        </div>
      )}

      <BasicSupplyFormModal isOpen={showSupplyModal} supplyForm={supplyForm} setSupplyForm={setSupplyForm}
        onSubmit={handleSave} onClose={() => !busy && setShowSupplyModal(false)}
        isEditing={!!editingSupply} isSaving={busy} />
      <BasicSupplyMovementModal supply={movementSupply} movementType={movementType} movementQuantity={movementQuantity}
        setMovementQuantity={setMovementQuantity} currentStock={supplies.find((s) => s.id === movementSupply?.id)?.stock ?? 0}
        onSubmit={handleMovement} onClose={() => !busy && setMovementSupply(null)} isSaving={busy} />
    </main>
  );
}
export default BasicSupplies;
