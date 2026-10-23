// =========================================================
// INFORMACIÓN GENERAL — CONFIGURACIÓN INSTITUCIONAL
// =========================================================

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Church,
  LoaderCircle,
  Mail,
  Phone,
  RotateCcw,
  Save,
  ShieldCheck,
} from "lucide-react";

// Utilizamos la instancia compartida (baseURL y cookies HttpOnly).
import api from "../../../services/api";
import "../../../styles/components/super-admin/settings/GeneralSettings.css";

// Deben coincidir con la respuesta del backend.
const EMPTY_SETTINGS = Object.freeze({
  institutionalName: "",
  publicName: "",
  description: "",
  contactEmail: "",
  contactPhone: "",
});

const FIELDS = Object.keys(EMPTY_SETTINGS);

function normalizeSettings(source) {
  return Object.fromEntries(
    FIELDS.map((field) => [field, typeof source?.[field] === "string" ? source[field] : ""])
  );
}

function validateSettings(values) {
  const errors = {};
  const name = values.institutionalName.trim();
  const publicName = values.publicName.trim();
  const description = values.description.trim();
  const email = values.contactEmail.trim();
  const phone = values.contactPhone.trim();

  if (name.length < 3 || name.length > 150) errors.institutionalName = "Debe tener entre 3 y 150 caracteres.";
  if (publicName.length < 2 || publicName.length > 100) errors.publicName = "Debe tener entre 2 y 100 caracteres.";
  if (description.length > 600) errors.description = "Máximo 600 caracteres.";
  if (email && (email.length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    errors.contactEmail = "Ingresa un correo válido (máximo 150 caracteres).";
  }
  if (phone && (phone.length > 30 || !/^\+?[0-9\s()-]{7,30}$/.test(phone))) {
    errors.contactPhone = "Ingresa un teléfono válido (7 a 30 caracteres).";
  }
  return errors;
}

function GeneralSettings() {
  const [values, setValues] = useState({ ...EMPTY_SETTINGS });
  const [savedValues, setSavedValues] = useState({ ...EMPTY_SETTINGS });
  const [updatedAt, setUpdatedAt] = useState(null);
  const [configured, setConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const loadSettings = useCallback(async (signal) => {
    setLoading(true);
    setLoadError("");
    setFeedback(null);
    try {
      const response = await api.get("/system/settings/general", { signal });
      if (response.data?.success !== true || !response.data?.settings) {
        throw new Error("El servidor no devolvió una configuración válida.");
      }
      const parsed = normalizeSettings(response.data.settings);
      setValues(parsed);
      setSavedValues(parsed);
      setUpdatedAt(response.data.settings.updatedAt || null);
      setConfigured(Boolean(response.data.configured));
      setSubmitted(false);
    } catch (error) {
      if (error.code === "ERR_CANCELED" || error.name === "CanceledError") return;
      setLoadError(error.response?.data?.message || error.message || "No fue posible cargar los datos institucionales.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadSettings(controller.signal);
    return () => controller.abort();
  }, [loadSettings]);

  const errors = useMemo(() => validateSettings(values), [values]);
  const hasChanges = FIELDS.some((field) => values[field] !== savedValues[field]);
  const canSave = !loading && !loadError && !saving && hasChanges && Object.keys(errors).length === 0;

  const updateField = (event) => {
    const { name, value } = event.target;
    if (!FIELDS.includes(name)) return;
    setValues((previous) => ({ ...previous, [name]: value }));
    setFeedback(null);
  };

  const resetChanges = () => {
    setValues({ ...savedValues });
    setSubmitted(false);
    setFeedback(null);
  };

  const saveSettings = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (!canSave) return;
    setSaving(true);
    setFeedback(null);
    try {
      const payload = Object.fromEntries(FIELDS.map((field) => [field, values[field].trim()]));
      const response = await api.patch("/system/settings/general", payload);
      if (response.data?.success !== true || !response.data?.settings) {
        throw new Error("El servidor no confirmó los cambios.");
      }
      const parsed = normalizeSettings(response.data.settings);
      setValues(parsed);
      setSavedValues(parsed);
      setUpdatedAt(response.data.settings.updatedAt || null);
      setConfigured(true);
      setSubmitted(false);
      setFeedback({ type: "success", message: "Información institucional guardada correctamente." });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.response?.data?.message || error.message || "No fue posible guardar los cambios.",
      });
    } finally {
      setSaving(false);
    }
  };

  const disabled = loading || saving || Boolean(loadError);
  const showError = (field) => submitted && errors[field];
  const lastUpdated = updatedAt && !Number.isNaN(new Date(updatedAt).getTime())
    ? new Intl.DateTimeFormat("es-CL", { dateStyle: "medium", timeStyle: "short" }).format(new Date(updatedAt))
    : "Todavía no se han guardado cambios";

  return (
    <section className="general-settings" aria-labelledby="general-settings-title">
      <header className="general-settings__header">
        <div className="general-settings__heading-icon"><Church size={23} aria-hidden="true" /></div>
        <div>
          <h2 id="general-settings-title">Información institucional</h2>
          <p>Administra los datos generales que identifican a Iglesia El Ancla en todas sus sucursales.</p>
        </div>
      </header>

      <div className="general-settings__meta">
        <span className="general-settings__meta-label"><ShieldCheck size={16} aria-hidden="true" /> Solo superadministrador</span>
        <span>{configured ? "Configuración guardada" : "Valores iniciales del sistema"}</span>
        <span>Última actualización: {lastUpdated}</span>
      </div>

      {loading && <div className="general-settings__message" role="status"><LoaderCircle className="general-settings__spin" size={19} /> Cargando configuración desde el servidor…</div>}

      {loadError && (
        <div className="general-settings__message general-settings__message--error" role="alert">
          <AlertCircle size={19} />
          <span>{loadError}</span>
          <button type="button" onClick={() => loadSettings()}>Reintentar</button>
        </div>
      )}

      {!loading && !loadError && (
        <form onSubmit={saveSettings} noValidate>
          <div className="general-settings__form-grid">
            <div className="general-settings__field general-settings__field--wide">
              <label htmlFor="institutionalName">Nombre institucional <span aria-hidden="true">*</span></label>
              <input id="institutionalName" name="institutionalName" value={values.institutionalName} onChange={updateField} maxLength={150} disabled={disabled} aria-invalid={Boolean(showError("institutionalName"))} aria-describedby={showError("institutionalName") ? "institutionalName-error" : undefined} />
              {showError("institutionalName") && <small id="institutionalName-error" className="general-settings__field-error">{errors.institutionalName}</small>}
            </div>

            <div className="general-settings__field general-settings__field--wide">
              <label htmlFor="publicName">Nombre público <span aria-hidden="true">*</span></label>
              <input id="publicName" name="publicName" value={values.publicName} onChange={updateField} maxLength={100} disabled={disabled} aria-invalid={Boolean(showError("publicName"))} aria-describedby={showError("publicName") ? "publicName-error" : undefined} />
              <small>Se podrá mostrar en encabezados y páginas públicas cuando conectemos esos módulos.</small>
              {showError("publicName") && <small id="publicName-error" className="general-settings__field-error">{errors.publicName}</small>}
            </div>

            <div className="general-settings__field general-settings__field--wide">
              <label htmlFor="description">Descripción institucional</label>
              <textarea id="description" name="description" rows={4} value={values.description} onChange={updateField} maxLength={600} disabled={disabled} placeholder="Describe brevemente la identidad y misión de la comunidad." aria-invalid={Boolean(showError("description"))} aria-describedby={showError("description") ? "description-error" : undefined} />
              <small>{values.description.length} / 600 caracteres</small>
              {showError("description") && <small id="description-error" className="general-settings__field-error">{errors.description}</small>}
            </div>

            <div className="general-settings__field">
              <label htmlFor="contactEmail"><Mail size={15} aria-hidden="true" /> Correo institucional</label>
              <input id="contactEmail" name="contactEmail" type="email" autoComplete="email" value={values.contactEmail} onChange={updateField} maxLength={150} disabled={disabled} placeholder="contacto@ejemplo.cl" aria-invalid={Boolean(showError("contactEmail"))} aria-describedby={showError("contactEmail") ? "contactEmail-error" : undefined} />
              {showError("contactEmail") && <small id="contactEmail-error" className="general-settings__field-error">{errors.contactEmail}</small>}
            </div>

            <div className="general-settings__field">
              <label htmlFor="contactPhone"><Phone size={15} aria-hidden="true" /> Teléfono institucional</label>
              <input id="contactPhone" name="contactPhone" type="tel" autoComplete="tel" value={values.contactPhone} onChange={updateField} maxLength={30} disabled={disabled} placeholder="+56 9 1234 5678" aria-invalid={Boolean(showError("contactPhone"))} aria-describedby={showError("contactPhone") ? "contactPhone-error" : undefined} />
              {showError("contactPhone") && <small id="contactPhone-error" className="general-settings__field-error">{errors.contactPhone}</small>}
            </div>
          </div>

          <div className="general-settings__note">
            <AlertCircle size={19} aria-hidden="true" />
            <p>La dirección y los datos de cada sede se administrarán en <strong>Sucursales</strong>. Esta sección modifica únicamente la información común de la organización.</p>
          </div>

          {feedback && (
            <div className={`general-settings__message general-settings__message--${feedback.type}`} role={feedback.type === "error" ? "alert" : "status"}>
              {feedback.type === "success" ? <CheckCircle2 size={19} /> : <AlertCircle size={19} />}
              <span>{feedback.message}</span>
            </div>
          )}

          <footer className="general-settings__footer">
            <span>{hasChanges ? "Tienes cambios sin guardar." : "No hay cambios pendientes."}</span>
            <div className="general-settings__actions">
              <button type="button" className="general-settings__reset" onClick={resetChanges} disabled={!hasChanges || saving}><RotateCcw size={17} /> Descartar cambios</button>
              <button type="submit" className="general-settings__save" disabled={!canSave}><>{saving ? <LoaderCircle className="general-settings__spin" size={17} /> : <Save size={17} />} {saving ? "Guardando…" : "Guardar cambios"}</></button>
            </div>
          </footer>
        </form>
      )}
    </section>
  );
}

export default GeneralSettings;
