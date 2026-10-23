// =========================================================
// GESTIÓN DE SUCURSALES — CONSULTA, REGISTRO Y EDICIÓN
// =========================================================
import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Building2, CheckCircle2, LoaderCircle, Plus, RefreshCw, ShieldCheck } from "lucide-react";
import api from "../../../services/api";
import BranchCard from "./BranchCard";
import BranchFormModal from "./BranchFormModal";
import BranchStatusModal from "./BranchStatusModal";

// Consulta de usuarios y sucursales asignadas (solo lectura).
import BranchUsersAssignments from "./BranchUsersAssignments";
import "../../../styles/components/super-admin/settings/BranchSettings.css";

function BranchSettings() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [editingBranch, setEditingBranch] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [success, setSuccess] = useState("");
  // Estado independiente para confirmar cambios de activación.
  const [statusBranch, setStatusBranch] = useState(null);
  const [changingStatus, setChangingStatus] = useState(false);
  const [statusError, setStatusError] = useState("");

  const handleRefresh = useCallback(() => setReloadKey((key) => key + 1), []);
  const openCreate = () => { setEditingBranch(null); setSaveError(""); setFormOpen(true); };
  const openEdit = (branch) => { setEditingBranch(branch); setSaveError(""); setFormOpen(true); };
  const closeForm = () => { if (!saving) { setFormOpen(false); setEditingBranch(null); setSaveError(""); } };

  useEffect(() => {
    const controller = new AbortController();
    const loadBranches = async () => {
      setLoading(true); setError("");
      try {
        const response = await api.get("/system/branches", { signal: controller.signal });
        if (!response.data?.success || !Array.isArray(response.data?.branches)) {
          throw new Error("El servidor devolvió una respuesta inesperada.");
        }
        if (!controller.signal.aborted) setBranches(response.data.branches);
      } catch (requestError) {
        if (controller.signal.aborted || requestError.code === "ERR_CANCELED") return;
        const status = requestError.response?.status;
        setError(status === 401 ? "La sesión ha expirado. Inicia sesión nuevamente."
          : status === 403 ? "No tienes autorización para consultar las sucursales."
          : requestError.response?.data?.message || requestError.message || "No fue posible consultar las sucursales.");
        setBranches([]);
      } finally { if (!controller.signal.aborted) setLoading(false); }
    };
    loadBranches();
    return () => controller.abort();
  }, [reloadKey]);

  const handleSave = async (payload) => {
    if (saving) return;
    setSaving(true); setSaveError(""); setSuccess("");
    try {
      const response = editingBranch
        ? await api.patch(`/system/branches/${editingBranch.id}`, payload)
        : await api.post("/system/branches", payload);
      if (!response.data?.success || !response.data?.branch) throw new Error("Respuesta de guardado inesperada.");
      const savedBranch = response.data.branch;
      setBranches((previous) => editingBranch
        ? previous.map((item) => item.id === savedBranch.id ? savedBranch : item)
        : [...previous, savedBranch].sort((a, b) => Number(b.isHeadquarters) - Number(a.isHeadquarters) || a.code.localeCompare(b.code)));
      setFormOpen(false); setEditingBranch(null);
      setSuccess(editingBranch ? "Sucursal actualizada correctamente." : "Sucursal registrada correctamente.");
    } catch (requestError) {
      const status = requestError.response?.status;
      setSaveError(status === 401 ? "Tu sesión ha expirado. Vuelve a iniciar sesión."
        : status === 403 ? "No tienes permiso para realizar esta operación o el origen fue rechazado."
        : requestError.response?.data?.message || requestError.message || "No fue posible guardar la sucursal.");
    } finally { setSaving(false); }
  };

  // El modal exige confirmación antes de enviar cualquier modificación.
  const openStatusModal = (branch) => {
    setStatusError("");
    setStatusBranch(branch);
  };

  const closeStatusModal = () => {
    if (changingStatus) return;
    setStatusBranch(null);
    setStatusError("");
  };

  const handleConfirmStatus = async () => {
    if (!statusBranch || changingStatus || (statusBranch.isActive && statusBranch.isHeadquarters)) return;
    const target = !statusBranch.isActive;
    setChangingStatus(true);
    setStatusError("");
    setSuccess("");
    try {
      const response = await api.patch(
        `/system/branches/${statusBranch.id}/status`,
        { isActive: target }
      );
      if (!response.data?.success || !response.data?.branch) {
        throw new Error("El servidor no confirmó el cambio de estado.");
      }
      // Actualizamos solo con el documento confirmado por el backend.
      const saved = response.data.branch;
      setBranches((previous) => previous.map((item) => item.id === saved.id ? saved : item));
      setStatusBranch(null);
      setSuccess(target ? "Sucursal activada correctamente." : "Sucursal desactivada correctamente.");
    } catch (requestError) {
      const status = requestError.response?.status;
      setStatusError(status === 401 ? "Tu sesión ha expirado. Inicia sesión nuevamente."
        : status === 403 ? "No tienes autorización para realizar esta operación."
        : requestError.response?.data?.message || requestError.message || "No fue posible cambiar el estado.");
    } finally {
      setChangingStatus(false);
    }
  };

  const activeCount = branches.filter((branch) => branch.isActive).length;
  return (
    <div className="branch-settings">
      <div className="branch-settings__heading">
        <div className="branch-settings__title"><Building2 size={24} aria-hidden="true" />
          <div><h2>Gestión de sucursales</h2><p>Administra las sedes registradas en Iglesia El Ancla.</p></div>
        </div>
        <div className="branch-settings__actions">
          <button className="branch-settings__refresh" type="button" onClick={handleRefresh} disabled={loading || saving}><RefreshCw size={16} className={loading ? "branch-settings__spinning" : ""}/> Actualizar</button>
          <button className="branch-settings__create" type="button" onClick={openCreate} disabled={loading || Boolean(error) || saving}><Plus size={17}/> Registrar sucursal</button>
        </div>
      </div>
      <div className="branch-settings__notice" role="note"><ShieldCheck size={18} aria-hidden="true"/><span>Registro y edición disponibles solo para superadministradores. La sede principal no puede desactivarse y las sedes con usuarios asignados están protegidas desde el servidor.</span></div>
      {success && <div className="branch-settings__success" role="status"><CheckCircle2 size={18}/>{success}</div>}
      {loading ? <div className="branch-settings__feedback" role="status"><LoaderCircle size={25} className="branch-settings__spinning"/> Cargando sucursales...</div>
        : error ? <div className="branch-settings__feedback branch-settings__feedback--error" role="alert"><AlertCircle size={22}/><span>{error}</span><button type="button" onClick={handleRefresh}>Reintentar</button></div>
        : <>
          <div className="branch-settings__summary" aria-label="Resumen de sucursales"><span><strong>{branches.length}</strong> sucursales registradas</span><span><strong>{activeCount}</strong> activas</span><span><strong>{branches.length-activeCount}</strong> inactivas</span></div>
          {branches.length ? <div className="branch-settings__list">{branches.map((branch) => <BranchCard key={branch.id || branch.code} branch={branch} onEdit={openEdit} onChangeStatus={openStatusModal} disabled={changingStatus || saving}/>)}</div>
            : <div className="branch-settings__feedback" role="status">No hay sucursales registradas. Utiliza «Registrar sucursal» para agregar la primera.</div>}
        </>}
      {/* Listado de usuarios y sedes autorizadas. */}
      {!loading && !error && (
        <BranchUsersAssignments branches={branches} />
      )}

      <BranchStatusModal
        branch={statusBranch}
        isOpen={Boolean(statusBranch)}
        isSaving={changingStatus}
        serverError={statusError}
        onClose={closeStatusModal}
        onConfirm={handleConfirmStatus}
      />
      <BranchFormModal isOpen={formOpen} branch={editingBranch} onClose={closeForm} onSave={handleSave} isSaving={saving} serverError={saveError}/>
    </div>
  );
}
export default BranchSettings;
