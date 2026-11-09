// =========================================================
// IMPORTACIONES
// =========================================================

// Herramientas para consultar información y administrar la interfaz.
import { useCallback, useEffect, useMemo, useState } from "react";

// Iconos que conservan el estilo visual de El Ancla.
import {
  AlertCircle,
  Info,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

// Componentes existentes del módulo.
import AdministratorsSummary from "../../../components/super-admin/administrators/AdministratorsSummary";
import AdministratorsFilters from "../../../components/super-admin/administrators/AdministratorsFilters";
import AdministratorsTable from "../../../components/super-admin/administrators/AdministratorsTable";
import AdministratorDetailsModal from "../../../components/super-admin/administrators/AdministratorDetailsModal";

// Servicio que obtiene las cuentas reales mediante la sesión actual.
import { getAdministrators } from "../../../services/administratorsApi";

// Estilos originales y complementarios de esta página.
import "../../../styles/pages/super-admin/system/AdministratorsManagement.css";
import "../../../styles/pages/super-admin/system/AdministratorsManagementConnected.css";

// =========================================================
// MENSAJES DE ERROR COMPRENSIBLES
// =========================================================

const getFriendlyError = (error) => {
  // Una sesión vencida requiere volver a iniciar sesión.
  if (error?.response?.status === 401) {
    return "Tu sesión terminó. Inicia sesión nuevamente para consultar las cuentas.";
  }

  // Solo una cuenta de superadministrador puede acceder al directorio.
  if (error?.response?.status === 403) {
    return "Tu cuenta no tiene autorización para consultar esta información.";
  }

  // No exponemos detalles técnicos o internos del servidor al usuario.
  return "No pudimos cargar las cuentas. Comprueba tu conexión e inténtalo nuevamente.";
};

// =========================================================
// PÁGINA PRINCIPAL
// =========================================================

function AdministratorsManagement() {
  // Campos utilizados para buscar y filtrar las cuentas.
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");

  // Almacenamos la lista auténtica recuperada del sistema.
  const [administrators, setAdministrators] = useState([]);

  // Estados de carga y aviso de errores.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);

  // Administrador seleccionado para ver sus detalles.
  const [selectedAdministrator, setSelectedAdministrator] = useState(null);

  // =========================================================
  // OBTENER CUENTAS REALES
  // =========================================================

  const loadAdministrators = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      // Solicitamos exclusivamente las cuentas con permisos administrativos.
      const result = await getAdministrators();

      // Comprobamos que el servidor devuelva el formato esperado.
      if (!Array.isArray(result?.administrators)) {
        throw new Error("Respuesta de cuentas no válida");
      }

      // Sustituimos los datos anteriores por los datos actuales.
      setAdministrators(result.administrators);
      setHasLoaded(true);
    } catch (requestError) {
      // No confundimos un fallo de conexión con la ausencia de cuentas.
      setError(getFriendlyError(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtenemos la información al entrar a la página.
  useEffect(() => {
    loadAdministrators();
  }, [loadAdministrators]);

  // =========================================================
  // ABRIR Y CERRAR DETALLES
  // =========================================================

  const handleViewAdministrator = useCallback((user) => {
    setSelectedAdministrator(user);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedAdministrator(null);
  }, []);

  // =========================================================
  // FILTRAR CUENTAS REALES
  // =========================================================

  const filteredAdministrators = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("es-CL");

    return administrators.filter((user) => {
      // Unimos el nombre para permitir búsquedas por nombre completo.
      const fullName = [user.firstName, user.lastName]
        .filter(Boolean)
        .join(" ");

      // La sucursal puede no estar asignada a algunas cuentas.
      const branchNames = Array.isArray(user.sucursales)
        ? user.sucursales.map((branch) => branch?.name || "").join(" ")
        : "";

      // Incluimos también la sucursal principal cuando esté disponible.
      const mainBranchName = user.sucursalPrincipal?.name || "";

      // Buscamos por nombre, correo o sucursal.
      const matchesSearch =
        !normalizedSearch ||
        [fullName, user.email || "", branchNames, mainBranchName].some(
          (value) => value.toLocaleLowerCase("es-CL").includes(normalizedSearch)
        );

      // Filtramos de acuerdo con el rol seleccionado.
      const matchesRole = role === "all" || user.role === role;

      // Filtramos según el estado real de la cuenta.
      const matchesStatus =
        status === "all" ||
        (status === "active" && user.isActive === true) ||
        (status === "inactive" && user.isActive === false);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [administrators, search, role, status]);

  // =========================================================
  // LIMPIAR FILTROS
  // =========================================================

  const handleClearFilters = () => {
    setSearch("");
    setRole("all");
    setStatus("all");
  };

  // =========================================================
  // INTERFAZ
  // =========================================================

  return (
    <main className="administrators-management">
      {/* Ubicación dentro del panel de administración. */}
      <div className="administrators-management__navigation">
        <span className="administrators-management__breadcrumb">
          Sistema / Administradores
        </span>
      </div>

      {/* Encabezado de la página. */}
      <header className="administrators-management__header">
        <div className="administrators-management__heading">
          <div className="administrators-management__heading-icon">
            <ShieldCheck size={25} aria-hidden="true" />
          </div>

          <div>
            <span className="administrators-management__eyebrow">
              CONTROL DEL SISTEMA
            </span>
            <h1>Administradores</h1>
            <p>
              Consulta las personas que pueden administrar la plataforma
              y las sucursales a las que tienen acceso.
            </p>
          </div>
        </div>

        <span className="administrators-management__access">
          <LockKeyhole size={14} aria-hidden="true" />
          Solo superadministrador
        </span>
      </header>

      {/* Mensaje dirigido a quienes administran la iglesia. */}
      <div className="administrators-management__demo" role="note">
        <Info size={18} aria-hidden="true" />
        <p>
          <strong>Cuentas de la iglesia:</strong>{" "}
          Aquí puedes consultar la información actual de las personas
          con acceso administrativo. Para cambiar sus datos, rol o estado,
          utiliza la sección Gestión de usuarios.
        </p>
      </div>

      {/* Permite solicitar la información más reciente sin salir de la página. */}
      <div className="administrators-connected__toolbar">
        <span>
          {loading
            ? "Actualizando cuentas..."
            : hasLoaded
              ? "Información actualizada desde las cuentas registradas"
              : "Información pendiente de consultar"}
        </span>

        <button
          type="button"
          onClick={loadAdministrators}
          disabled={loading}
        >
          <RefreshCw size={16} aria-hidden="true" />
          {loading ? "Actualizando..." : "Actualizar información"}
        </button>
      </div>

      {/* Nunca presentamos cero usuarios como resultado de un error de carga. */}
      {error && (
        <div className="administrators-connected__error" role="alert">
          <AlertCircle size={19} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {loading && !hasLoaded && (
        <p className="administrators-connected__message" role="status">
          Cargando las cuentas administrativas...
        </p>
      )}

      {/* Mostramos los indicadores y la tabla solo cuando existen datos consultados. */}
      {hasLoaded && (
        <>
          {/* Las estadísticas se calculan a partir de todas las cuentas reales. */}
          <AdministratorsSummary administrators={administrators} />

          {/* Listado que conserva los filtros y la tabla originales. */}
          <section className="administrators-management__panel">
            <div className="administrators-management__panel-header">
              <div>
                <h2>
                  <UsersRound size={19} aria-hidden="true" />
                  Cuentas administrativas
                </h2>
                <p>
                  Administradores y superadministradores registrados en
                  la plataforma.
                </p>
              </div>

              <span className="administrators-management__count">
                {filteredAdministrators.length} resultados
              </span>
            </div>

            <AdministratorsFilters
              search={search}
              role={role}
              status={status}
              onSearchChange={setSearch}
              onRoleChange={setRole}
              onStatusChange={setStatus}
              onClear={handleClearFilters}
            />

            <AdministratorsTable
              administrators={filteredAdministrators}
              onView={handleViewAdministrator}
            />
          </section>
        </>
      )}

      {/* Información de protección en lenguaje claro y no técnico. */}
      <aside className="administrators-management__security">
        <LockKeyhole size={20} aria-hidden="true" />

        <div>
          <strong>Protección de cuentas administrativas</strong>
          <p>
            Solo las personas autorizadas pueden administrar la iglesia.
            La plataforma comprueba los permisos de cada cuenta antes de
            permitir cambios importantes. Las cuentas de superadministrador
            cuentan con protección adicional.
          </p>
          <p>
            Esta página es de consulta: aquí no se modifican cuentas
            ni se cambian permisos.
          </p>
        </div>
      </aside>

      {/* Ventana de información detallada del administrador seleccionado. */}
      {selectedAdministrator && (
        <AdministratorDetailsModal
          administrator={selectedAdministrator}
          onClose={handleCloseModal}
        />
      )}
    </main>
  );
}

export default AdministratorsManagement;
