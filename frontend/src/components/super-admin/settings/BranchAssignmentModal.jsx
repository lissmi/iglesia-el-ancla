// =========================================================
// MODAL DE ASIGNACIÓN DE SUCURSALES — PASO 3
// =========================================================
// Interfaz y validaciones locales.
// El componente padre realizará la solicitud PATCH en el paso siguiente.

import { useEffect, useId, useMemo, useState } from "react";
import { AlertCircle, Building2, Check, LoaderCircle, ShieldCheck, X } from "lucide-react";
import "../../../styles/components/super-admin/settings/BranchAssignmentModal.css";

// Admite identificadores de MongoDB y objetos poblados por Mongoose.
const getId = (value) => String(value?._id ?? value?.id ?? value ?? "");
const getName = (user) => [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Usuario";

function BranchAssignmentModal({ user, branches = [], onClose, onSave, saving = false, serverError = "" }) {
  const titleId = useId();
  const descriptionId = useId();

  // Solamente se pueden seleccionar sucursales activas.
  const activeBranches = useMemo(() => branches.filter((branch) => branch.isActive), [branches]);
  const validBranchIds = useMemo(() => new Set(activeBranches.map(getId)), [activeBranches]);

  // Los datos se inicializan desde la cuenta seleccionada.
  const [selectedIds, setSelectedIds] = useState(() =>
    [...new Set((user?.sucursales || []).map(getId))].filter((id) => validBranchIds.has(id))
  );
  const [primaryId, setPrimaryId] = useState(() => getId(user?.sucursalPrincipal));
  const [validationError, setValidationError] = useState("");

  const isProtected = user?.role === "super_admin";
  const canEdit = Boolean(user) && !isProtected && !saving;

  // Bloqueamos el desplazamiento y permitimos salir con Escape.
  useEffect(() => {
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onEscape = (event) => {
      if (event.key === "Escape" && !saving) onClose?.();
    };
    document.addEventListener("keydown", onEscape);
    return () => {
      document.body.style.overflow = oldOverflow;
      document.removeEventListener("keydown", onEscape);
    };
  }, [onClose, saving]);

  if (!user) return null;

  const toggleBranch = (branchId) => {
    if (!canEdit || !validBranchIds.has(branchId)) return;
    setValidationError("");
    setSelectedIds((previous) => {
      if (previous.includes(branchId)) {
        const next = previous.filter((id) => id !== branchId);
        if (primaryId === branchId) setPrimaryId(next[0] || "");
        return next;
      }
      if (!primaryId || !previous.includes(primaryId)) setPrimaryId(branchId);
      return [...previous, branchId];
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canEdit) return;
    if (selectedIds.length === 0) {
      setValidationError("Debes seleccionar al menos una sucursal activa.");
      return;
    }
    if (!selectedIds.includes(primaryId)) {
      setValidationError("La sucursal principal debe estar entre las asignadas.");
      return;
    }
    setValidationError("");
    // El padre enviará estos datos al endpoint protegido:
    // PATCH /api/users/:id/sucursales
    await onSave?.({ sucursales: selectedIds, sucursalPrincipal: primaryId });
  };

  return (
    <div className="branch-assignment-modal__overlay" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !saving) onClose?.();
    }}>
      <section className="branch-assignment-modal" role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId}>
        <header className="branch-assignment-modal__header">
          <div className="branch-assignment-modal__heading">
            <span className="branch-assignment-modal__heading-icon"><Building2 size={23} aria-hidden="true" /></span>
            <div>
              <span className="branch-assignment-modal__eyebrow">ADMINISTRACIÓN DE SUCURSALES</span>
              <h2 id={titleId}>Asignar sucursales</h2>
              <p id={descriptionId}>{getName(user)} · {user.email}</p>
            </div>
          </div>
          <button className="branch-assignment-modal__close" type="button" onClick={onClose} disabled={saving} aria-label="Cerrar formulario">
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="branch-assignment-modal__body">
            <div className="branch-assignment-modal__notice">
              <ShieldCheck size={19} aria-hidden="true" />
              <span>{isProtected
                ? "La asignación de una cuenta superadministradora está protegida y no puede editarse aquí."
                : "Selecciona las sedes autorizadas y designa una como principal. Solo aparecen sucursales activas."}</span>
            </div>

            <div className="branch-assignment-modal__section-title">
              <strong>Sucursales disponibles</strong>
              <small>{selectedIds.length} seleccionada(s)</small>
            </div>

            {activeBranches.length === 0 ? (
              <p className="branch-assignment-modal__empty">No hay sucursales activas disponibles.</p>
            ) : (
              <div className="branch-assignment-modal__list">
                {activeBranches.map((branch) => {
                  const id = getId(branch);
                  const checked = selectedIds.includes(id);
                  return (
                    <div className="branch-assignment-modal__branch" key={id}>
                      <label className="branch-assignment-modal__branch-selector">
                        <input type="checkbox" checked={checked} disabled={!canEdit} onChange={() => toggleBranch(id)} />
                        <span className="branch-assignment-modal__branch-text">
                          <strong>{branch.name}</strong>
                          <small>{branch.code}{branch.isHeadquarters ? " · Sede principal de la iglesia" : ""}</small>
                        </span>
                      </label>
                      <label className="branch-assignment-modal__primary">
                        <input
                          type="radio"
                          name="sucursalPrincipal"
                          value={id}
                          checked={primaryId === id && checked}
                          disabled={!canEdit || !checked}
                          onChange={() => { setPrimaryId(id); setValidationError(""); }}
                        />
                        <span>Principal</span>
                      </label>
                    </div>
                  );
                })}
              </div>
            )}

            {(validationError || serverError) && (
              <p className="branch-assignment-modal__error" role="alert">
                <AlertCircle size={17} aria-hidden="true" /> {validationError || serverError}
              </p>
            )}
          </div>

          <footer className="branch-assignment-modal__footer">
            <button type="button" className="branch-assignment-modal__cancel" onClick={onClose} disabled={saving}>Cancelar</button>
            <button type="submit" className="branch-assignment-modal__save" disabled={!canEdit || activeBranches.length === 0}>
              {saving ? <LoaderCircle className="branch-assignment-modal__spinner" size={17} aria-hidden="true" /> : <Check size={17} aria-hidden="true" />}
              {saving ? "Guardando..." : "Guardar asignaciones"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

export default BranchAssignmentModal;
