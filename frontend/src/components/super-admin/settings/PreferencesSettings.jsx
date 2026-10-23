// =========================================================
// PREFERENCIAS — RESUMEN SIMPLE Y ÚTIL PARA SUPERADMIN
// =========================================================
// Se muestran datos reales de rutas ya existentes.
// No se crean preferencias ficticias ni nuevos modelos.

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowUpRight,
  Bell,
  Building2,
  Church,
  Clock3,
  Mail,
  RefreshCw,
  Settings2,
  Smartphone,
} from "lucide-react";

import api from "../../../services/api";
import { useNotifications } from "../../../context/notifications/NotificationsContext";
import "../../../styles/components/super-admin/settings/PreferencesSettings.css";

function friendlyTimezone(value) {
  if (value === "America/Santiago") return "Hora de Chile continental";
  if (value === "Pacific/Easter") return "Hora de Rapa Nui";
  if (!value) return "Sin configurar";
  return value.split("/").pop().replace(/_/g, " ");
}

function PreferencesSettings({ onSectionChange }) {
  const { unreadCount } = useNotifications();

  const [general, setGeneral] = useState(null);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((value) => value + 1), []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadInformation() {
      setLoading(true);
      setError("");

      try {
        const [settingsResponse, branchesResponse] = await Promise.all([
          api.get("/system/settings/general", { signal: controller.signal }),
          api.get("/system/branches", { signal: controller.signal }),
        ]);

        if (
          settingsResponse.data?.success !== true ||
          !settingsResponse.data?.settings ||
          branchesResponse.data?.success !== true ||
          !Array.isArray(branchesResponse.data?.branches)
        ) {
          throw new Error("No fue posible obtener la información de configuración.");
        }

        if (!controller.signal.aborted) {
          setGeneral(settingsResponse.data.settings);
          setBranches(branchesResponse.data.branches);
        }
      } catch (requestError) {
        if (controller.signal.aborted || requestError.code === "ERR_CANCELED") return;
        setError(
          requestError.response?.status === 401
            ? "Tu sesión ha expirado. Inicia sesión nuevamente."
            : requestError.response?.data?.message ||
                "No fue posible cargar la información. Intenta actualizar."
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadInformation();
    return () => controller.abort();
  }, [refreshKey]);

  const activeBranches = useMemo(
    () => branches.filter((branch) => branch.isActive),
    [branches]
  );
  const mainBranch =
    activeBranches.find((branch) => branch.isHeadquarters) || activeBranches[0];

  const displayName = general?.publicName || "Iglesia El Ancla";
  const contactEmail = general?.contactEmail || "Sin correo de contacto configurado";
  const timezone = friendlyTimezone(mainBranch?.timezone);

  return (
    <section className="preferences-settings" aria-labelledby="preferences-title">
      <header className="preferences-settings__header">
        <div className="preferences-settings__heading">
          <span className="preferences-settings__heading-icon">
            <Settings2 size={22} aria-hidden="true" />
          </span>
          <div>
            <h2 id="preferences-title">Preferencias generales</h2>
            <p>Información y accesos útiles para administrar la iglesia.</p>
          </div>
        </div>
        <button type="button" className="preferences-settings__refresh" onClick={refresh} disabled={loading}>
          <RefreshCw size={15} aria-hidden="true" />
          {loading ? "Consultando..." : "Actualizar"}
        </button>
      </header>

      {error && (
        <div className="preferences-settings__alert" role="alert">
          <AlertCircle size={18} aria-hidden="true" />
          <span>{error}</span>
          <button type="button" onClick={refresh}>Reintentar</button>
        </div>
      )}

      <div className="preferences-settings__grid">
        <article className="preferences-settings__card">
          <div className="preferences-settings__card-heading">
            <span className="preferences-settings__icon"><Church size={20} aria-hidden="true" /></span>
            <div><h3>Identidad y contacto</h3><p>Información de la iglesia que puedes mantener actualizada.</p></div>
          </div>
          <div className="preferences-settings__content">
            <strong>{loading ? "Consultando..." : error ? "No disponible" : displayName}</strong>
            <span className="preferences-settings__detail"><Mail size={15} aria-hidden="true" />{loading ? "Consultando..." : error ? "No disponible" : contactEmail}</span>
          </div>
          <button type="button" className="preferences-settings__action" onClick={() => onSectionChange?.("general")}>
            Editar información <ArrowUpRight size={15} aria-hidden="true" />
          </button>
        </article>

        <article className="preferences-settings__card">
          <div className="preferences-settings__card-heading">
            <span className="preferences-settings__icon"><Building2 size={20} aria-hidden="true" /></span>
            <div><h3>Sucursales y horarios</h3><p>Revisa las sedes y la zona horaria que utilizan.</p></div>
          </div>
          <div className="preferences-settings__content">
            <strong>{loading ? "Consultando..." : error ? "No disponible" : `${activeBranches.length} ${activeBranches.length === 1 ? "sucursal activa" : "sucursales activas"}`}</strong>
            <span className="preferences-settings__detail"><Clock3 size={15} aria-hidden="true" />{loading ? "Consultando..." : error ? "No disponible" : timezone}</span>
          </div>
          <button type="button" className="preferences-settings__action" onClick={() => onSectionChange?.("branches")}>
            Administrar sucursales <ArrowUpRight size={15} aria-hidden="true" />
          </button>
        </article>

        <article className="preferences-settings__card">
          <div className="preferences-settings__card-heading">
            <span className="preferences-settings__icon"><Bell size={20} aria-hidden="true" /></span>
            <div><h3>Notificaciones</h3><p>Avisos que requieren atención dentro del panel.</p></div>
          </div>
          <div className="preferences-settings__content">
            <strong>{unreadCount === 0 ? "Todo al día" : `${unreadCount} ${unreadCount === 1 ? "aviso pendiente" : "avisos pendientes"}`}</strong>
            <span className="preferences-settings__help">Puedes revisar los avisos desde la campana del encabezado.</span>
          </div>
        </article>

        <article className="preferences-settings__card">
          <div className="preferences-settings__card-heading">
            <span className="preferences-settings__icon"><Smartphone size={20} aria-hidden="true" /></span>
            <div><h3>Aplicación de la iglesia</h3><p>Accede a la página que utilizan los visitantes y miembros.</p></div>
          </div>
          <div className="preferences-settings__content">
            <strong>Página pública</strong>
            <span className="preferences-settings__help">Comprueba cómo se presenta la información a la comunidad.</span>
          </div>
          <Link to="/" className="preferences-settings__action">
            Ver página de inicio <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </article>
      </div>
    </section>
  );
}

export default PreferencesSettings;
