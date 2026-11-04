// =========================================================
// MIEMBROS DE LA IGLESIA - IGLESIA EL ANCLA
// Archivo: frontend/src/pages/administration/MembersManagement.jsx
// Directorio administrativo de consulta, conectado a usuarios reales.
// =========================================================

// React permite consultar la API y calcular estadísticas reales.
import { useEffect, useMemo, useState } from "react";

// Iconografía existente, sin agregar componentes duplicados.
import { RefreshCw, ShieldCheck, UsersRound } from "lucide-react";

// Reutilizamos Axios y las cookies de sesión del proyecto.
import api from "../../services/api";

// Componentes visuales existentes del módulo.
import MembersSummary from "../../components/administration/members/MembersSummary";
import MembersBirthdays from "../../components/administration/members/MembersBirthdays";
import MembersDirectory from "../../components/administration/members/MembersDirectory";
import MemberDetailsModal from "../../components/administration/members/MemberDetailsModal";

// Conservamos el estilo actual de la página.
import "../../styles/pages/administration/MembersManagement.css";

// El servidor limita cada respuesta a 100 personas como máximo.
const PAGE_SIZE = 100;

// Obtenemos el mes y el año actuales en Chile, no en UTC.
function getCurrentMonthInChile() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  return { year, month };
}

// No filtramos datos reales por suposiciones sobre la respuesta.
function getErrorMessage(error) {
  return error?.response?.data?.message ||
    error?.message ||
    "No se pudo consultar el directorio de miembros.";
}

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================
function MembersManagement() {
  // Miembros obtenidos exclusivamente desde MongoDB.
  const [members, setMembers] = useState([]);

  // Miembro seleccionado desde el listado o los cumpleaños.
  const [selectedMember, setSelectedMember] = useState(null);

  // Estado de la consulta, reintento y posibles errores.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // =======================================================
  // CARGAR TODOS LOS MIEMBROS AUTORIZADOS
  // =======================================================
  useEffect(() => {
    // Evitamos aplicar respuestas de consultas ya canceladas.
    const controller = new AbortController();

    // Indicamos que se está consultando información real.
    setLoading(true);
    setError("");

    async function loadMembers() {
      try {
        // Paginamos para no truncar la lista después de 100 usuarios.
        const allMembers = [];
        let page = 1;
        let totalPages = 1;

        while (page <= totalPages) {
          // La API decide el alcance por el rol y las sedes de la sesión.
          const response = await api.get("/users/members-directory", {
            params: { page, limit: PAGE_SIZE },
            signal: controller.signal,
          });

          // Validamos el contrato antes de mostrar información.
          const data = response.data;
          if (!data?.success || !Array.isArray(data.members) ||
              !Number.isInteger(data.pagination?.totalPages)) {
            throw new Error("El servidor devolvió un directorio inválido.");
          }

          // Conservamos únicamente cuentas cuyo rol real sea member.
          allMembers.push(...data.members.filter((user) => user.role === "member"));

          // El servidor devuelve la cantidad total de páginas disponibles.
          totalPages = data.pagination.totalPages;
          page += 1;
        }

        // No actualizamos React después de cerrar o cambiar la página.
        if (controller.signal.aborted) return;

        // El listado, los cumpleaños y los indicadores comparten estos datos.
        setMembers(allMembers);
      } catch (requestError) {
        // Cancelar una consulta es normal al desmontar el componente.
        if (controller.signal.aborted || requestError?.code === "ERR_CANCELED") return;

        // Nunca dejamos visibles datos obsoletos cuando falla la API.
        setMembers([]);
        setError(getErrorMessage(requestError));
      } finally {
        // Solo la consulta vigente puede cerrar el estado de carga.
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    // Ejecutamos la consulta al abrir la página o pulsar Reintentar.
    loadMembers();

    // Cancelamos solicitudes pendientes al abandonar la página.
    return () => controller.abort();
  }, [refreshKey]);

  // =======================================================
  // ESTADÍSTICAS REALES
  // =======================================================
  const summary = useMemo(() => {
    // Utilizamos el calendario de Chile para definir el mes actual.
    const { year, month } = getCurrentMonthInChile();

    // No se suman cuentas administrativas.
    const total = members.length;

    // isActive del modelo User se convierte en active/inactive en la API.
    const active = members.filter((member) => member.status === "active").length;

    // Comparar mes evita problemas de zonas horarias en cumpleaños.
    const birthdays = members.filter((member) =>
      typeof member.birthDate === "string" && member.birthDate.slice(5, 7) === month
    ).length;

    // createdAt se normaliza a registeredAt en el backend.
    const newMembers = members.filter((member) =>
      typeof member.registeredAt === "string" &&
      member.registeredAt.slice(0, 7) === `${year}-${month}`
    ).length;

    return { total, active, birthdays, newMembers };
  }, [members]);

  // Cerramos la ficha sin alterar los datos del directorio.
  function closeMemberProfile() {
    setSelectedMember(null);
  }

  // =======================================================
  // INTERFAZ EXISTENTE CON DATOS REALES
  // =======================================================
  return (
    <main className="members-management">
      {/* Encabezado que ya utiliza el diseño administrativo. */}
      <header className="members-management__header">
        <div className="members-management__heading">
          <span className="members-management__eyebrow">
            GESTIÓN DE LA COMUNIDAD
          </span>

          <h1>Miembros de la iglesia</h1>

          <p>
            Consulta la información de los miembros registrados y facilita
            el acompañamiento de nuestra comunidad.
          </p>

          {/* Consultamos otra vez si los usuarios cambiaron desde otro módulo. */}
          <button
            type="button"
            className="members-management__back"
            onClick={() => setRefreshKey((value) => value + 1)}
            disabled={loading}
          >
            <RefreshCw size={16} aria-hidden="true" />
            {loading ? "Actualizando..." : "Actualizar directorio"}
          </button>
        </div>

        <div className="members-management__header-icon">
          <UsersRound size={29} strokeWidth={1.7} aria-hidden="true" />
        </div>
      </header>

      {/* No mostramos estadísticas falsas mientras el servidor responde. */}
      {loading ? (
        <div className="members-management__notice" role="status">
          <RefreshCw size={19} aria-hidden="true" />
          <p>Cargando los miembros registrados...</p>
        </div>
      ) : error ? (
        // Si la sesión no tiene permisos o la API falla, se explica el motivo.
        <div className="members-management__notice" role="alert">
          <ShieldCheck size={19} aria-hidden="true" />
          <p>{error}</p>
        </div>
      ) : (
        <>
          {/* Las cuatro tarjetas se calculan desde el listado real. */}
          <MembersSummary summary={summary} />

          {/* Los cumpleaños se obtienen de User.birthDate. */}
          <MembersBirthdays
            members={members}
            onViewMember={setSelectedMember}
          />

          {/* El directorio conserva búsqueda, filtros y paginación local. */}
          <MembersDirectory
            members={members}
            onViewMember={setSelectedMember}
          />

          {/* La consulta es administrativa y no permite editar cuentas. */}
          <div className="members-management__notice">
            <ShieldCheck size={19} aria-hidden="true" />
            <p>
              Este directorio es exclusivamente de consulta. La modificación
              de cuentas, roles y permisos se realiza desde Gestión de usuarios.
            </p>
          </div>
        </>
      )}

      {/* Reutilizamos el modal actual con datos entregados por la API. */}
      {selectedMember && (
        <MemberDetailsModal
          member={selectedMember}
          onClose={closeMemberProfile}
        />
      )}
    </main>
  );
}

// Mantenemos el mismo nombre de exportación para SharedAdminRoutes.
export default MembersManagement;
