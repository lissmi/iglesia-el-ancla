// =========================================================
// FORMULARIO DE CREACIÓN Y EDICIÓN DE SUCURSALES
// =========================================================
import { useEffect, useState } from "react";
import { AlertCircle, Building2, LoaderCircle, Save, X } from "lucide-react";
import "../../../styles/components/super-admin/settings/BranchFormModal.css";

const EMPTY_FORM = {
  code: "", name: "", slug: "", contactEmail: "", contactPhone: "",
  timezone: "America/Santiago",
  address: { street: "", number: "", sector: "", city: "", region: "", country: "Chile" },
};

const FIELDS = [
  { key: "street", label: "Calle", required: true },
  { key: "number", label: "Número", required: true },
  { key: "sector", label: "Sector o barrio" },
  { key: "city", label: "Ciudad", required: true },
  { key: "region", label: "Región", required: true },
  { key: "country", label: "País", required: true },
];

function createInitialForm(branch) {
  if (!branch) return { ...EMPTY_FORM, address: { ...EMPTY_FORM.address } };
  return {
    code: branch.code || "", name: branch.name || "", slug: branch.slug || "",
    contactEmail: branch.contactEmail || "", contactPhone: branch.contactPhone || "",
    timezone: branch.timezone || "America/Santiago",
    address: { ...EMPTY_FORM.address, ...(branch.address || {}) },
  };
}

function BranchFormModal({ branch, isOpen, onClose, onSave, isSaving, serverError }) {
  const [form, setForm] = useState(() => createInitialForm(branch));
  const [validationError, setValidationError] = useState("");
  const isEditing = Boolean(branch);

  // Reiniciamos el formulario al abrir otra sucursal o crear una nueva.
  useEffect(() => {
    if (!isOpen) return;
    setForm(createInitialForm(branch));
    setValidationError("");
  }, [isOpen, branch]);

  // Escape cierra el modal siempre que no se esté guardando.
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !isSaving) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, isSaving, onClose]);

  if (!isOpen) return null;

  const setValue = (key, value) => setForm((previous) => ({ ...previous, [key]: value }));
  const setAddress = (key, value) => setForm((previous) => ({
    ...previous, address: { ...previous.address, [key]: value },
  }));

  const handleSubmit = (event) => {
    event.preventDefault();
    setValidationError("");
    const data = {
      name: form.name.trim(), slug: form.slug.trim().toLowerCase(),
      contactEmail: form.contactEmail.trim().toLowerCase(),
      contactPhone: form.contactPhone.trim(), timezone: form.timezone.trim(),
      address: Object.fromEntries(Object.entries(form.address).map(([key, value]) => [key, value.trim()])),
    };
    if (!isEditing && !/^SUC-\d{3,}$/.test(form.code.trim().toUpperCase())) {
      setValidationError("El código debe tener el formato SUC-002."); return;
    }
    if (data.name.length < 3 || data.name.length > 150) {
      setValidationError("El nombre debe tener entre 3 y 150 caracteres."); return;
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) {
      setValidationError("El slug debe contener letras minúsculas, números y guiones."); return;
    }
    if (["street", "number", "city", "region", "country"].some((key) => !data.address[key])) {
      setValidationError("Completa calle, número, ciudad, región y país."); return;
    }
    if (data.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail)) {
      setValidationError("El correo de contacto no es válido."); return;
    }
    if (data.contactPhone && !/^\+?[0-9\s()-]{7,30}$/.test(data.contactPhone)) {
      setValidationError("El teléfono debe incluir entre 7 y 30 caracteres válidos."); return;
    }
    try { new Intl.DateTimeFormat("es-CL", { timeZone: data.timezone }); }
    catch { setValidationError("Ingresa una zona horaria IANA válida, por ejemplo America/Santiago."); return; }
    if (!isEditing) data.code = form.code.trim().toUpperCase();
    onSave(data);
  };

  return (
    <div className="branch-form__overlay" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !isSaving) onClose();
    }}>
      <section className="branch-form" role="dialog" aria-modal="true" aria-labelledby="branch-form-title">
        <header className="branch-form__header">
          <div className="branch-form__identity"><Building2 size={22} /><div>
            <h2 id="branch-form-title">{isEditing ? "Editar sucursal" : "Registrar sucursal"}</h2>
            <p>{isEditing ? `Actualiza los datos de ${branch.code}` : "Crea una nueva sede para Iglesia El Ancla"}</p>
          </div></div>
          <button type="button" className="branch-form__close" onClick={onClose} disabled={isSaving} aria-label="Cerrar formulario"><X size={21}/></button>
        </header>
        <form onSubmit={handleSubmit} className="branch-form__body">
          <div className="branch-form__grid">
            <label className="branch-form__field"><span>Código de sucursal *</span><input value={form.code} onChange={(e) => setValue("code", e.target.value)} placeholder="SUC-002" disabled={isEditing || isSaving} maxLength={30} required /></label>
            <label className="branch-form__field"><span>Nombre *</span><input value={form.name} onChange={(e) => setValue("name", e.target.value)} maxLength={150} disabled={isSaving} required /></label>
            <label className="branch-form__field branch-form__field--wide"><span>Slug (URL) *</span><input value={form.slug} onChange={(e) => setValue("slug", e.target.value)} placeholder="iglesia-el-ancla-vina-del-mar" maxLength={150} disabled={isSaving} required /></label>
          </div>
          <h3>Dirección de la sede</h3>
          <div className="branch-form__grid">
            {FIELDS.map((field) => <label className="branch-form__field" key={field.key}>
              <span>{field.label}{field.required ? " *" : ""}</span>
              <input value={form.address[field.key]} onChange={(e) => setAddress(field.key, e.target.value)} maxLength={field.key === "number" ? 20 : 100} required={Boolean(field.required)} disabled={isSaving}/>
            </label>)}
          </div>
          <h3>Contacto y horarios</h3>
          <div className="branch-form__grid">
            <label className="branch-form__field"><span>Correo de contacto</span><input type="email" value={form.contactEmail} onChange={(e) => setValue("contactEmail", e.target.value)} maxLength={150} disabled={isSaving} /></label>
            <label className="branch-form__field"><span>Teléfono</span><input type="tel" value={form.contactPhone} onChange={(e) => setValue("contactPhone", e.target.value)} maxLength={30} disabled={isSaving} placeholder="+56912345678" /></label>
            <label className="branch-form__field branch-form__field--wide"><span>Zona horaria IANA *</span><input value={form.timezone} onChange={(e) => setValue("timezone", e.target.value)} maxLength={80} disabled={isSaving} required /></label>
          </div>
          {(validationError || serverError) && <div className="branch-form__error" role="alert"><AlertCircle size={18}/><span>{validationError || serverError}</span></div>}
          <div className="branch-form__notice">El código de una sucursal no se puede modificar después de registrarla. La sede principal y el estado operativo se gestionan con reglas separadas.</div>
          <footer className="branch-form__actions">
            <button type="button" className="branch-form__cancel" onClick={onClose} disabled={isSaving}>Cancelar</button>
            <button type="submit" className="branch-form__save" disabled={isSaving}>{isSaving ? <LoaderCircle size={17} className="branch-form__spin"/> : <Save size={17}/>} {isSaving ? "Guardando..." : (isEditing ? "Guardar cambios" : "Registrar sucursal")}</button>
          </footer>
        </form>
      </section>
    </div>
  );
}

export default BranchFormModal;
