// =========================================================
// CONFIRMACIÓN DE ACTIVACIÓN / DESACTIVACIÓN DE SUCURSAL
// =========================================================
import { useEffect, useId, useRef } from "react";
import { AlertTriangle, Building2, LoaderCircle, Power, PowerOff, X } from "lucide-react";
import "../../../styles/components/super-admin/settings/BranchStatusModal.css";

function BranchStatusModal({ isOpen, branch, isSaving, serverError, onClose, onConfirm }) {
  const titleId = useId();
  const cancelRef = useRef(null);
  useEffect(() => {
    if (!isOpen) return undefined;
    const previous = document.activeElement;
    cancelRef.current?.focus();
    const handleKey = (event) => { if (event.key === "Escape" && !isSaving) onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => { document.removeEventListener("keydown", handleKey); previous?.focus?.(); };
  }, [isOpen, isSaving, onClose]);

  if (!isOpen || !branch) return null;
  const activating = !branch.isActive;
  const blocked = !activating && branch.isHeadquarters;

  return (
    <div className="branch-status__overlay" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !isSaving) onClose();
    }}>
      <section className="branch-status" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <header className="branch-status__header">
          <span className="branch-status__icon">{activating ? <Power size={24}/> : <PowerOff size={24}/>}</span>
          <div><h2 id={titleId}>{activating ? "Activar sucursal" : "Desactivar sucursal"}</h2><p>Confirma el cambio de estado operativo.</p></div>
          <button type="button" className="branch-status__close" onClick={onClose} disabled={isSaving} aria-label="Cerrar"><X size={19}/></button>
        </header>
        <div className="branch-status__body">
          <div className="branch-status__branch"><Building2 size={20}/><div><strong>{branch.name}</strong><span>{branch.code}</span></div></div>
          <p>{activating
            ? "La sucursal volverá a estar disponible para las operaciones permitidas por el sistema."
            : "La sucursal dejará de estar operativa. El servidor impedirá desactivarla si tiene usuarios asignados."}</p>
          {blocked && <div className="branch-status__warning" role="alert"><AlertTriangle size={19}/> La sede principal no se puede desactivar.</div>}
          {serverError && <div className="branch-status__warning" role="alert"><AlertTriangle size={19}/><span>{serverError}</span></div>}
        </div>
        <footer className="branch-status__actions">
          <button ref={cancelRef} type="button" className="branch-status__cancel" onClick={onClose} disabled={isSaving}>Cancelar</button>
          <button type="button" className={`branch-status__confirm ${activating ? "branch-status__confirm--enable" : "branch-status__confirm--disable"}`} onClick={onConfirm} disabled={isSaving || blocked}>
            {isSaving ? <LoaderCircle className="branch-status__spin" size={16}/> : activating ? <Power size={16}/> : <PowerOff size={16}/>}
            {isSaving ? "Guardando..." : activating ? "Sí, activar sucursal" : "Sí, desactivar sucursal"}
          </button>
        </footer>
      </section>
    </div>
  );
}
export default BranchStatusModal;
