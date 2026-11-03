// =========================================================
// MIS ACTIVIDADES - MIEMBROS / IGLESIA EL ANCLA
// Consulta actividades reales y confirmaciones desde MongoDB.
// =========================================================

// Utilizamos hooks de React para sincronizar el panel con la API.
import { useCallback, useEffect, useMemo, useState } from "react";

// Reutilizamos los iconos del diseño actual.
import { CalendarDays, Clock3, MapPin, MonitorPlay, RefreshCw } from "lucide-react";

// Reutilizamos la única instancia Axios del proyecto (cookies HttpOnly).
import api from "../../services/api";

// Conservamos la tarjeta original para confirmar o cancelar asistencia.
import ActivityAttendanceCard from "../../components/member/activities/ActivityAttendanceCard";

// Conservamos el CSS existente de la página.
import "../../styles/pages/member/MemberActivities.css";

// Las reglas de verano/invierno se aplican mediante la zona oficial de Chile.
const TIME_ZONE = "America/Santiago";

// Intervalo visible inicial: próximas seis semanas.
// Las actividades son puntuales: no limitamos artificialmente a seis semanas.

// Recuperamos el día civil actual en Chile, independientemente del navegador.
function todayInChile() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const part = (name) => parts.find((item) => item.type === name)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

// Obtenemos la hora actual de Chile para ocultar ocurrencias ya iniciadas.
function currentTimeInChile() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE, hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date());
  const part = (name) => parts.find((item) => item.type === name)?.value;
  return `${part("hour")}:${part("minute")}`;
}

// Convertimos una fecha civil a UTC solo para hacer aritmética de calendario.
function civilDateToUtc(value) {
  return new Date(`${value}T12:00:00.000Z`);
}

// Mostramos la fecha con nombres de días y meses en español chileno.
function formatDate(value) {
  return new Intl.DateTimeFormat("es-CL", {
    weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  }).format(civilDateToUtc(value));
}

// Una actividad equivale a una sola fecha; no generamos repeticiones semanales.
function buildUpcomingOccurrences(activities, today) {
  const nowTime = currentTimeInChile();
  return activities
    // Las actividades anteriores o ya comenzadas no figuran como próximas.
    .filter((activity) => activity.date > today ||
      (activity.date === today && activity.time > nowTime))
    // occurrenceDate se mantiene como clave visual y para validar el envío.
    .map((activity) => ({ ...activity, occurrenceDate: activity.date }))
    // Orden cronológico para facilitar la consulta.
    .sort((a, b) => a.date.localeCompare(b.date) ||
      a.time.localeCompare(b.time) || a.title.localeCompare(b.title, "es-CL"));
}

// Obtenemos un mensaje legible sin filtrar detalles internos del backend.
function getErrorMessage(error) {
  return error?.response?.data?.message || error?.message || "No se pudo completar la operación";
}

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================
function MemberActivities() {
  // Contenido publicado proveniente del backend.
  const [activities, setActivities] = useState([]);

  // Identificadores de confirmaciones propias y cupos por fecha.
  const [attendance, setAttendance] = useState({ mine: [], counts: [] });

  // El listado puede funcionar aunque todavía no se haya instalado la API de asistencia.
  const [attendanceAvailable, setAttendanceAvailable] = useState(false);

  // Estados de carga y errores reales.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [savingKey, setSavingKey] = useState(null);

  // Conservamos un contador de refresco para reconsultar el servidor.
  const [refreshKey, setRefreshKey] = useState(0);

  // Consultamos el catálogo y las confirmaciones sin exponer otros miembros.
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    // Consultamos ambas APIs, sin permitir que un error de asistencia oculte los eventos.
    Promise.allSettled([
      api.get("/activities/member", { signal: controller.signal }),
      api.get("/activities/attendance/state", { signal: controller.signal }),
    ]).then(([activityResult, attendanceResult]) => {
      // No modificamos el estado cuando el componente ya se desmontó.
      if (controller.signal.aborted) return;

      // La consulta de eventos es indispensable para construir el listado.
      if (activityResult.status !== "fulfilled") throw activityResult.reason;
      if (!activityResult.value.data?.success || !Array.isArray(activityResult.value.data.activities)) {
        throw new Error("El servidor devolvió una lista de actividades inválida");
      }

      // Solo mostramos publicaciones reales recibidas del servidor.
      setActivities(activityResult.value.data.activities);

      // La API de asistencia es opcional para visualizar actividades.
      if (attendanceResult.status === "fulfilled" && attendanceResult.value.data?.success) {
        setAttendance({
          mine: attendanceResult.value.data.mine || [],
          counts: attendanceResult.value.data.counts || [],
        });
        setAttendanceAvailable(true);
      } else {
        // Nunca simulamos confirmaciones ni habilitamos botones sin respaldo real.
        setAttendance({ mine: [], counts: [] });
        setAttendanceAvailable(false);
      }
    }).catch((requestError) => {
      // Los errores de la consulta principal se muestran sin conservar datos antiguos.
      if (controller.signal.aborted) return;
      setActivities([]);
      setError(getErrorMessage(requestError));
    }).finally(() => {
      // Ocultamos el indicador de carga al terminar la consulta actual.
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [refreshKey]);

  // Calculamos próximas ocurrencias localmente a partir de actividades reales.
  const occurrences = useMemo(
    () => buildUpcomingOccurrences(activities, todayInChile()),
    [activities]
  );

  // Evitamos dobles clics sobre la misma fecha mientras guarda.
  const updateAttendance = useCallback(async (activity, shouldConfirm) => {
    const key = `${activity.id}:${activity.occurrenceDate}`;
    // No permitimos guardar confirmaciones sin una API de asistencia funcional.
    if (!attendanceAvailable) {
      setActionError("La confirmación de asistencia todavía no está disponible en el servidor.");
      return;
    }
    if (savingKey) return;
    setSavingKey(key);
    setActionError("");
    try {
      // Enviamos la fecha única de la actividad para validarla en el backend.
      if (shouldConfirm) {
        await api.post(`/activities/${activity.id}/attendance`, { occurrenceDate: activity.occurrenceDate });
      } else {
        await api.delete(`/activities/${activity.id}/attendance`, {
          params: { occurrenceDate: activity.occurrenceDate },
        });
      }

      // Volvemos a consultar el resultado real para actualizar cupos y botones.
      const response = await api.get("/activities/attendance/state");
      if (!response.data?.success) throw new Error("No se pudo actualizar el estado de asistencia");
      setAttendance({ mine: response.data.mine || [], counts: response.data.counts || [] });
    } catch (requestError) {
      setActionError(`${activity.title}: ${getErrorMessage(requestError)}`);
    } finally {
      setSavingKey(null);
    }
  }, [savingKey, attendanceAvailable]);

  return (
    <main className="member-events-page">
      {/* Encabezado original de la sección personal del miembro. */}
      <header className="member-events-page__header">
        <span>MI COMUNIDAD</span>
        <h1>Mis actividades</h1>
        <p>Conoce las próximas actividades de Iglesia El Ancla y administra tu participación.</p>
      </header>

      {/* Los errores no se confunden con una lista vacía. */}
      {error && (
        <div className="member-events-page__notice" role="alert">
          {error} {" "}
          <button type="button" onClick={() => setRefreshKey((value) => value + 1)}>
            <RefreshCw size={15} aria-hidden="true" /> Reintentar
          </button>
        </div>
      )}

      {/* Las actividades se muestran aunque la API opcional de confirmaciones no esté instalada. */}
      {!loading && !error && !attendanceAvailable && (
        <div className="member-events-page__notice" role="note">
          Puedes consultar las actividades publicadas. La confirmación de asistencia estará
          disponible cuando se habiliten las rutas de participación en el backend.
        </div>
      )}

      {/* Mensaje de error de una confirmación individual. */}
      {actionError && <div className="member-events-page__notice" role="alert">{actionError}</div>}

      {/* Diferenciamos carga, ausencia de actividades y listado real. */}
      {loading ? (
        <p role="status">Cargando actividades desde la iglesia...</p>
      ) : !error && occurrences.length === 0 ? (
        <div className="member-events-page__notice">
          No hay actividades próximas publicadas por la iglesia.
        </div>
      ) : !error ? (
        <section className="member-events-page__grid" aria-label="Próximas actividades">
          {occurrences.map((activity) => {
            // La clave combina el ID y el día único de la actividad.
            const key = `${activity.id}:${activity.occurrenceDate}`;

            // Identificamos si esta cuenta ya confirmó esta fecha.
            const isConfirmed = attendance.mine.some((item) =>
              item.activityId === activity.id && item.occurrenceDate === activity.occurrenceDate
            );

            // Recuperamos el total de asistentes sin consultar datos personales.
            const confirmedCount = attendance.counts.find((item) =>
              item.activityId === activity.id && item.occurrenceDate === activity.occurrenceDate
            )?.confirmed || 0;

            // La URL de reuniones solo se abre si su protocolo es seguro.
            const safeMeetingUrl = /^https?:\/\//i.test(activity.meetingUrl || "")
              ? activity.meetingUrl : null;

            return (
              <article className="member-events-page__event" key={key}>
                {/* La imagen es opcional y está alojada en Cloudinary. */}
                {activity.image?.url && (
                  <img
                    src={activity.image.url}
                    alt={activity.image.alt || `Portada de ${activity.title}`}
                    loading="lazy"
                    style={{ width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 14 }}
                  />
                )}
                <div className="member-events-page__event-info">
                  <span className="member-events-page__category">{activity.category || "ACTIVIDAD DE LA COMUNIDAD"}</span>
                  <h2>{activity.title}</h2>
                  {activity.description && <p>{activity.description}</p>}
                  <p><CalendarDays size={17} aria-hidden="true" />{formatDate(activity.occurrenceDate)}</p>
                  <p><Clock3 size={17} aria-hidden="true" />{activity.time}{activity.endTime ? ` – ${activity.endTime}` : ""} hrs</p>
                  <p>
                    {activity.modality === "Online" ? <MonitorPlay size={17} aria-hidden="true" /> : <MapPin size={17} aria-hidden="true" />}
                    {activity.modality}{activity.location ? ` · ${activity.location}` : ""}
                  </p>
                  
                  {safeMeetingUrl && <p><a href={safeMeetingUrl} target="_blank" rel="noopener noreferrer">Abrir reunión online</a></p>}
                </div>

                {/* Las acciones guardan la confirmación en el backend. */}
                <ActivityAttendanceCard
                  activity={activity}
                  isConfirmed={isConfirmed}
                  confirmedCount={confirmedCount}
                  isSaving={savingKey === key}
                  attendanceAvailable={attendanceAvailable}
                  onConfirm={() => updateAttendance(activity, true)}
                  onCancel={() => updateAttendance(activity, false)}
                />
              </article>
            );
          })}
        </section>
      ) : null}
    </main>
  );
}

// Exportamos la página para conservar la ruta existente del miembro.
export default MemberActivities;
