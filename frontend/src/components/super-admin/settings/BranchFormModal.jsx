// Formulario claro y seguro para crear o editar las sedes de la iglesia.
import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Building2, LoaderCircle, Save, X } from "lucide-react";
import locations from "../../../data/locations/chileLocations.json";
import "../../../styles/components/super-admin/settings/BranchFormModal.css";
import "../../../styles/components/super-admin/settings/BranchFormModalChile.css";

// Estos valores son fijos para todas las sucursales en Chile.
const COUNTRY = "Chile";
const TIMEZONE = "America/Santiago";
const PHONE_PREFIX = "+56 9 ";

const EMPTY_FORM = {
  name: "",
  contactEmail: "",
  phoneDigits: "",
  address: {
    street: "",
    number: "",
    sector: "",
    region: "",
    city: "",
  },
};

const regionNames = Object.keys(locations);

// Convertimos teléfonos ya existentes al bloque de ocho números editables.
function extractPhoneDigits(value) {
  const normalized = String(value || "").replace(/\D/g, "");
  if (normalized.startsWith("569") && normalized.length === 11) {
    return normalized.slice(3);
  }
  if (normalized.startsWith("9") && normalized.length === 9) {
    return normalized.slice(1);
  }
  return normalized.length === 8 ? normalized : "";
}

function createInitialForm(branch) {
  if (!branch) {
    return { ...EMPTY_FORM, address: { ...EMPTY_FORM.address } };
  }

  return {
    name: branch.name || "",
    contactEmail: branch.contactEmail || "",
    phoneDigits: extractPhoneDigits(branch.contactPhone),
    address: {
      ...EMPTY_FORM.address,
      ...(branch.address || {}),
      region: branch.address?.region || "",
      city: branch.address?.city || "",
    },
  };
}

function BranchFormModal({
  branch,
  isOpen,
  onClose,
  onSave,
  isSaving = false,
  serverError = "",
}) {
  const [form, setForm] = useState(() => createInitialForm(branch));
  const [validationError, setValidationError] = useState("");
  const isEditing = Boolean(branch);

  // Las ciudades cambian según la región seleccionada.
  const availableCities = useMemo(
    () => locations[form.address.region] || [],
    [form.address.region]
  );

  useEffect(() => {
    if (!isOpen) return;
    setForm(createInitialForm(branch));
    setValidationError("");
  }, [isOpen, branch]);

  // Cerramos con Escape únicamente si no hay un guardado en curso.
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !isSaving) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSaving, onClose]);

  if (!isOpen) return null;

  const setValue = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setValidationError("");
  };

  const setAddress = (key, value) => {
    setForm((previous) => ({
      ...previous,
      address: {
        ...previous.address,
        [key]: value,
        ...(key === "region" ? { city: "" } : {}),
      },
    }));
    setValidationError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isSaving) return;
    setValidationError("");

    const name = form.name.trim();
    const address = Object.fromEntries(
      Object.entries(form.address).map(([key, value]) => [key, value.trim()])
    );
    const email = form.contactEmail.trim().toLowerCase();

    if (name.length < 3 || name.length > 150) {
      setValidationError("El nombre de la sede debe tener entre 3 y 150 caracteres.");
      return;
    }
    if (!/^[\p{L}\p{M}0-9 .,#°ºª'/-]{2,100}$/u.test(address.street)) {
      setValidationError("Escribe una calle válida (entre 2 y 100 caracteres).");
      return;
    }
    if (!/^\d{1,8}$/.test(address.number)) {
      setValidationError("El número de la dirección debe contener solo números (máximo 8).");
      return;
    }
    if (address.sector && !/^[\p{L}\p{M}0-9 .,#°ºª'/-]{1,100}$/u.test(address.sector)) {
      setValidationError("Revisa el sector o barrio de la dirección.");
      return;
    }
    if (!regionNames.includes(address.region) || !availableCities.includes(address.city)) {
      setValidationError("Selecciona una región y una ciudad de la lista.");
      return;
    }
    if (email && !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@gmail\.com$/i.test(email)) {
      setValidationError("El correo de contacto debe terminar en @gmail.com.");
      return;
    }
    if (form.phoneDigits && !/^\d{8}$/.test(form.phoneDigits)) {
      setValidationError("Ingresa los ocho números del celular, después de +56 9.");
      return;
    }

    // No enviamos campos técnicos ni código: el sistema los genera por sí solo.
    onSave({
      name,
      contactEmail: email,
      contactPhone: form.phoneDigits ? `+569${form.phoneDigits}` : "",
      address,
    });
  };

  return (
    <div
      className="branch-form__overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) onClose();
      }}
    >
      <section
        className="branch-form"
        role="dialog"
        aria-modal="true"
        aria-labelledby="branch-form-title"
      >
        <header className="branch-form__header">
          <div className="branch-form__identity">
            <Building2 size={22} aria-hidden="true" />
            <div>
              <h2 id="branch-form-title">
                {isEditing ? "Editar sucursal" : "Registrar sucursal"}
              </h2>
              <p>
                {isEditing
                  ? `Actualiza los datos de ${branch.name}`
                  : "Agrega una nueva sede de Iglesia El Ancla"}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="branch-form__close"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Cerrar formulario"
          >
            <X size={21} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="branch-form__body">
          <div className="branch-form__grid">
            <label className="branch-form__field branch-form__field--wide">
              <span>Nombre de la sucursal *</span>
              <input
                value={form.name}
                onChange={(event) => setValue("name", event.target.value)}
                maxLength={150}
                minLength={3}
                placeholder="Por ejemplo: El Ancla - Viña del Mar"
                required
                disabled={isSaving}
              />
            </label>
          </div>

          <h3>Dirección de la sede</h3>
          <div className="branch-form__grid">
            <label className="branch-form__field">
              <span>Región *</span>
              <select
                value={form.address.region}
                onChange={(event) => setAddress("region", event.target.value)}
                required
                disabled={isSaving}
              >
                <option value="">Selecciona una región</option>
                {regionNames.map((region) => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </label>

            <label className="branch-form__field">
              <span>Ciudad *</span>
              <select
                value={form.address.city}
                onChange={(event) => setAddress("city", event.target.value)}
                required
                disabled={isSaving || !form.address.region}
              >
                <option value="">
                  {form.address.region ? "Selecciona una ciudad" : "Primero elige una región"}
                </option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </label>

            <label className="branch-form__field">
              <span>Calle *</span>
              <input
                value={form.address.street}
                onChange={(event) => setAddress("street", event.target.value)}
                minLength={2}
                maxLength={100}
                placeholder="Nombre de la calle"
                required
                disabled={isSaving}
              />
            </label>

            <label className="branch-form__field">
              <span>Número *</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{1,8}"
                value={form.address.number}
                onChange={(event) => setAddress("number", event.target.value.replace(/\D/g, "").slice(0, 8))}
                maxLength={8}
                placeholder="Solo números"
                required
                disabled={isSaving}
              />
            </label>

            <label className="branch-form__field branch-form__field--wide">
              <span>Sector o barrio (opcional)</span>
              <input
                value={form.address.sector}
                onChange={(event) => setAddress("sector", event.target.value)}
                maxLength={100}
                placeholder="Por ejemplo: Playa Ancha"
                disabled={isSaving}
              />
            </label>

            <label className="branch-form__field branch-form__field--wide">
              <span>País</span>
              <input value={COUNTRY} readOnly aria-readonly="true" className="branch-form__readonly" />
            </label>
          </div>

          <h3>Datos de contacto</h3>
          <div className="branch-form__grid">
            <label className="branch-form__field">
              <span>Correo de contacto (opcional)</span>
              <input
                type="email"
                value={form.contactEmail}
                onChange={(event) => setValue("contactEmail", event.target.value)}
                maxLength={150}
                placeholder="ejemplo@gmail.com"
                disabled={isSaving}
              />
            </label>

            <label className="branch-form__field">
              <span>Celular de contacto (opcional)</span>
              <span className="branch-form-chile__phone">
                <span className="branch-form-chile__phone-prefix">{PHONE_PREFIX}</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{8}"
                  value={form.phoneDigits}
                  onChange={(event) => setValue("phoneDigits", event.target.value.replace(/\D/g, "").slice(0, 8))}
                  maxLength={8}
                  placeholder="12345678"
                  disabled={isSaving}
                  aria-label="Ocho números del celular después de +56 9"
                />
              </span>
            </label>
          </div>

          {(validationError || serverError) && (
            <div className="branch-form__error" role="alert">
              <AlertCircle size={18} aria-hidden="true" />
              <span>{validationError || serverError}</span>
            </div>
          )}

          <div className="branch-form__notice">
            El código de la nueva sucursal se asignará automáticamente al registrarla.
            Todas las sedes utilizan la hora de Chile continental ({TIMEZONE}).
          </div>

          <footer className="branch-form__actions">
            <button type="button" className="branch-form__cancel" onClick={onClose} disabled={isSaving}>
              Cancelar
            </button>
            <button type="submit" className="branch-form__save" disabled={isSaving}>
              {isSaving ? <LoaderCircle size={17} className="branch-form__spin" /> : <Save size={17} />}
              {isSaving ? "Guardando..." : isEditing ? "Guardar cambios" : "Registrar sucursal"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

export default BranchFormModal;
