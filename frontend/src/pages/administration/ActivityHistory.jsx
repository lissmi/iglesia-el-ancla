// =========================================================
// HISTORIAL DE ACTIVIDAD - IGLESIA EL ANCLA
// Archivo: frontend/src/pages/administration/ActivityHistory.jsx
// =========================================================

// Consultamos la actividad cuando cambian filtros o página.
import { useEffect, useState } from "react";

// Reutilizamos la iconografía del diseño administrativo original.
import { History, Info, LockKeyhole, ShieldCheck } from "lucide-react";

// Usamos la instancia Axios global de la aplicación.
import api from "../../services/api";

// Reutilizamos los filtros y la tabla existentes.
import ActivityFilters from "../../components/administration/activity/ActivityFilters";
import ActivityTable from "../../components/administration/activity/ActivityTable";

// Conservamos el CSS original: no se cambia la identidad visual.
import "../../styles/pages/administration/ActivityHistory.css";

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================
function ActivityHistory() {
  // Filtro textual por administrador, correo o nombre del contenido.
  const [search, setSearch] = useState("");

  // Fecha civil seleccionada por el administrador en Chile.
  const [selectedDate, setSelectedDate] = useState("");

  // Página del historial que queremos consultar.
  const [page, setPage] = useState(1);

  // Actividades reales unificadas por el backend.
  const [activities, setActivities] = useState([]);

  // Total de movimientos que coinciden con los filtros.
  const [total, setTotal] = useState(0);

  // Cantidad de páginas calculadas en el backend.
  const [pages, setPages] = useState(1);

  // Indicador visible mientras esperamos la API.
  const [loading, setLoading] = useState(true);

  // Mensaje de error recuperable, si falla la consulta.
  const [error, setError] = useState("");

  // Permite reintentar sin recargar toda la aplicación.
  const [refreshKey, setRefreshKey] = useState(0);

  // =========================================================
  // CONSULTA DEL HISTORIAL GLOBAL
  // =========================================================
  useEffect(() => {
    // Cancelamos peticiones anteriores cuando cambian los filtros.
    const controller = new AbortController();

    // Indicamos que inició una nueva consulta.
    setLoading(true);
    setError("");

    // Evitamos una petición HTTP por cada pulsación rápida.
    const timer = setTimeout(async () => {
      try {
        // La ruta combina creación, última edición y eliminaciones.
        const response = await api.get("/activity-history", {
          params: {
            page,
            ...(search.trim() ? { q: search.trim() } : {}),
            ...(selectedDate ? { date: selectedDate } : {}),
          },
          signal: controller.signal,
        });

        // Descartamos respuestas canceladas u obsoletas.
        if (controller.signal.aborted) return;

        // Verificamos el contrato esperado de la API.
        if (!response.data?.success || !Array.isArray(response.data?.activities)) {
          throw new Error("El servidor devolvió un historial inválido");
        }

        // Mostramos únicamente los registros reales del servidor.
        setActivities(response.data.activities);
        setTotal(response.data.total ?? 0);
        setPages(Math.max(1, response.data.pages ?? 1));
      } catch (requestError) {
        // Una cancelación normal no debe convertirse en un error visible.
        if (controller.signal.aborted) return;

        // No dejamos datos antiguos cuando la consulta falla.
        setActivities([]);
        setTotal(0);
        setPages(1);

        // Mostramos información útil para diagnosticar la falla.
        setError(
          requestError.response?.data?.message ||
          requestError.message ||
          "No se pudo cargar el historial de actividad"
        );
      } finally {
        // Cerramos el indicador únicamente para la consulta vigente.
        if (!controller.signal.aborted) setLoading(false);
      }
    }, search.trim() ? 300 : 0);

    // Liberamos recursos al cambiar filtros o abandonar la página.
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search, selectedDate, page, refreshKey]);

  // =========================================================
  // FILTROS
  // =========================================================
  function handleSearchChange(value) {
    // Actualizamos el texto y regresamos a la primera página.
    setSearch(value);
    setPage(1);
  }

  function handleDateChange(value) {
    // Actualizamos la fecha y regresamos a la primera página.
    setSelectedDate(value);
    setPage(1);
  }

  function handleResetFilters() {
    // Restauramos la búsqueda general sin filtros.
    setSearch("");
    setSelectedDate("");
    setPage(1);
  }

  // =========================================================
  // INTERFAZ: CONSERVAMOS EL DISEÑO ORIGINAL
  // =========================================================
  return (
    <div className="activity-history-page">
      {/* Encabezado original de auditoría administrativa. */}
      <header className="activity-history-page__header">
        <div>
          <span className="activity-history-page__eyebrow">
            ADMINISTRACIÓN / AUDITORÍA
          </span>

          <h1>
            <History size={29} strokeWidth={1.8} aria-hidden="true" />
            Historial de actividad
          </h1>

          <p>
            Consulta quién publicó, modificó por última vez o eliminó contenido
            del sistema, y cuándo se realizó cada acción registrada.
          </p>
        </div>

        <div className="activity-history-page__badge">
          <ShieldCheck size={17} aria-hidden="true" />
          <span>Solo lectura</span>
        </div>
      </header>

      {/* Informamos con precisión la cobertura del historial liviano. */}
      <div className="activity-history-page__notice" role="note">
        <Info size={20} aria-hidden="true" />
        <div>
          <strong>Actividad real del sistema</strong>
          <p>
            Se muestran las publicaciones y últimas ediciones de los recursos
            que todavía existen, junto con las eliminaciones registradas.
            No se conserva el detalle de cada edición anterior.
          </p>
        </div>
      </div>

      {/* Mismos filtros del historial original. */}
      <ActivityFilters
        search={search}
        onSearchChange={handleSearchChange}
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        onReset={handleResetFilters}
      />

      {/* Diferenciamos claramente errores, carga y datos disponibles. */}
      {error ? (
        <div className="activity-history-page__notice" role="alert">
          <Info size={20} aria-hidden="true" />
          <div>
            <strong>No se pudo cargar el historial</strong>
            <p>{error}</p>
            <button type="button" onClick={() => setRefreshKey((n) => n + 1)}>
              Reintentar
            </button>
          </div>
        </div>
      ) : loading ? (
        <p role="status">Cargando actividad del sistema...</p>
      ) : (
        <>
          {/* Tabla original con contenido dinámico. */}
          <ActivityTable activities={activities} total={total} />

          {/* Mostramos navegación solo si existe más de una página. */}
          {pages > 1 && (
            <nav
              aria-label="Páginas del historial"
              style={{ display: "flex", gap: "12px", alignItems: "center", justifyContent: "flex-end", marginTop: "18px" }}
            >
              <button
                type="button"
                className="activity-filters__reset"
                disabled={page <= 1}
                onClick={() => setPage((previous) => Math.max(1, previous - 1))}
              >
                Anterior
              </button>

              <span>Página {page} de {pages}</span>

              <button
                type="button"
                className="activity-filters__reset"
                disabled={page >= pages}
                onClick={() => setPage((previous) => Math.min(pages, previous + 1))}
              >
                Siguiente
              </button>
            </nav>
          )}
        </>
      )}

      {/* Conservamos el pie de seguridad de la página original. */}
      <footer className="activity-history-page__footer">
        <LockKeyhole size={18} aria-hidden="true" />
        <p>
          Este historial es exclusivamente de consulta. Las responsabilidades de
          creación y edición se obtienen de los documentos originales y las
          eliminaciones se conservan mediante registros protegidos del backend.
        </p>
      </footer>
    </div>
  );
}

// Exportamos la página para conservar las rutas de React Router.
export default ActivityHistory;
