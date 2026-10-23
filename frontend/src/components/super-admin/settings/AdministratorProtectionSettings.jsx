// =========================================================
// PROTECCIÓN DE ADMINISTRADORES — CONSULTA INFORMATIVA
// =========================================================
// No permite crear administradores, cambiar roles o editar
// cuentas. Las medidas mostradas provienen del backend.

import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  UsersRound,
} from "lucide-react";

import api from "../../../services/api";
import "../../../styles/components/super-admin/settings/AdministratorProtectionSettings.css";

const OPERATION_LABELS = [
  ["createAdministrator", "Creación de administradores"],
  ["changeRole", "Cambio de roles"],
  ["deactivateAdministrator", "Desactivación de administradores"],
  ["privilegedAccountChanges", "Modificación de cuentas privilegiadas"],
  ["auditTrail", "Auditoría de operaciones administrativas"],
];

function Status({ active, trueLabel = "Implementado", falseLabel = "Pendiente" }) {
  return (
    <span className={`administrator-protection__status ${active ? "administrator-protection__status--active" : "administrator-protection__status--pending"}`}>
      {active ? <CheckCircle2 size={14} aria-hidden="true" /> : <Clock3 size={14} aria-hidden="true" />}
      {active ? trueLabel : falseLabel}
    </span>
  );
}

function ProtectionRow({ title, description, active, trueLabel, falseLabel }) {
  return (
    <li className="administrator-protection__row">
      <div className="administrator-protection__row-copy">
        <strong>{title}</strong>
        {description && <p>{description}</p>}
      </div>
      <Status active={active} trueLabel={trueLabel} falseLabel={falseLabel} />
    </li>
  );
}

function isValidProtection(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;

  const flags = [
    value.globalUsersRestrictedToSuperAdmin,
    value.branchAssignmentRestrictedToSuperAdmin,
    value.superAdminBranchAssignmentBlocked,
    value.sessionVersioning?.available,
    value.sessionVersioning?.appliedOnBranchAssignmentChange,
    value.sessionVersioning?.appliedOnRoleChange,
    value.sessionVersioning?.appliedOnDeactivation,
    value.superAdminSlots?.modelConstraintDefined,
    value.superAdminSlots?.databaseIndexVerified,
  ];

  return (
    Array.isArray(value.allowedRoles) &&
    value.allowedRoles.every((role) => typeof role === "string") &&
    Array.isArray(value.superAdminSlots?.permitted) &&
    value.superAdminSlots.permitted.every(Number.isInteger) &&
    flags.every((flag) => typeof flag === "boolean") &&
    value.operations &&
    typeof value.operations === "object" &&
    OPERATION_LABELS.every(([key]) => typeof value.operations[key] === "string")
  );
}

function AdministratorProtectionSettings() {
  const [protection, setProtection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProtection() {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/system/administrator-protection", {
          signal: controller.signal,
        });

        const result = response.data;
        if (result?.success !== true || !isValidProtection(result.protection)) {
          throw new Error("El servidor devolvió una configuración administrativa incompleta.");
        }

        if (!controller.signal.aborted) setProtection(result.protection);
      } catch (requestError) {
        if (controller.signal.aborted || requestError.code === "ERR_CANCELED") return;
        setProtection(null);
        setError(
          requestError.response?.data?.message ||
          requestError.message ||
          "No se pudo consultar la protección de administradores."
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadProtection();
    return () => controller.abort();
  }, [revision]);

  return (
    <section className="administrator-protection" aria-labelledby="administrator-protection-title">
      <header className="administrator-protection__header">
        <div className="administrator-protection__heading">
          <span className="administrator-protection__heading-icon">
            <ShieldCheck size={22} aria-hidden="true" />
          </span>
          <div>
            <h3 id="administrator-protection-title">Protección de administradores</h3>
            <p>Estado de las restricciones administrativas del servidor.</p>
          </div>
        </div>
        <button
          className="administrator-protection__refresh"
          type="button"
          disabled={loading}
          onClick={() => setRevision((current) => current + 1)}
        >
          <RefreshCw size={16} aria-hidden="true" /> Actualizar
        </button>
      </header>

      {loading && (
        <p className="administrator-protection__feedback" role="status">
          Consultando las protecciones del sistema…
        </p>
      )}

      {!loading && error && (
        <div className="administrator-protection__error" role="alert">
          <AlertCircle size={19} aria-hidden="true" /> <p>{error}</p>
        </div>
      )}

      {!loading && protection && (
        <>
          <div className="administrator-protection__summary">
            <div>
              <UsersRound size={18} aria-hidden="true" />
              <span>Roles admitidos</span>
              <strong>{protection.allowedRoles.join(" · ")}</strong>
            </div>
            <div>
              <ShieldAlert size={18} aria-hidden="true" />
              <span>Posiciones de superadministrador</span>
              <strong>{protection.superAdminSlots.permitted.join(" y ")}</strong>
            </div>
          </div>

          <div className="administrator-protection__group">
            <h4>Restricciones existentes</h4>
            <ul className="administrator-protection__rows">
              <ProtectionRow title="Acceso al listado global de usuarios" active={protection.globalUsersRestrictedToSuperAdmin} description="Reservado al rol super_admin." />
              <ProtectionRow title="Asignación de sucursales" active={protection.branchAssignmentRestrictedToSuperAdmin} description="La operación administrativa está restringida al superadministrador." />
              <ProtectionRow title="Asignaciones de cuentas super_admin" active={protection.superAdminBranchAssignmentBlocked} description="El endpoint ordinario impide cambiar sus sucursales." />
              <ProtectionRow title="Restricción de posiciones en el modelo" active={protection.superAdminSlots.modelConstraintDefined} description="El esquema define las posiciones permitidas." />
              <ProtectionRow title="Índice único verificado en MongoDB" active={protection.superAdminSlots.databaseIndexVerified} falseLabel="Sin verificar" description="Definir un índice en el esquema no confirma su existencia en la base de datos." />
              <ProtectionRow title="Versionado de sesiones disponible" active={protection.sessionVersioning.available} />
              <ProtectionRow title="Invalidación al cambiar sucursales" active={protection.sessionVersioning.appliedOnBranchAssignmentChange} />
            </ul>
          </div>

          <div className="administrator-protection__group">
            <h4>Operaciones privilegiadas</h4>
            <ul className="administrator-protection__rows">
              {OPERATION_LABELS.map(([key, label]) => (
                <ProtectionRow
                  key={key}
                  title={label}
                  active={protection.operations[key] === "implemented"}
                  falseLabel={protection.operations[key] === "pending" ? "Pendiente" : "No verificado"}
                />
              ))}
              <ProtectionRow title="Invalidación por cambio de rol" active={protection.sessionVersioning.appliedOnRoleChange} />
              <ProtectionRow title="Invalidación por desactivación" active={protection.sessionVersioning.appliedOnDeactivation} />
            </ul>
          </div>

          <div className="administrator-protection__notice">
            <ShieldCheck size={18} aria-hidden="true" />
            <p>
              Vista de solo lectura. Este reporte describe controles declarados por el backend;
              no verifica por sí solo los índices de la base de datos ni sustituye pruebas de autorización.
              Las operaciones pendientes no pueden realizarse desde este componente.
            </p>
          </div>
        </>
      )}
    </section>
  );
}

export default AdministratorProtectionSettings;
