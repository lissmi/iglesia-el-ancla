// =========================================================
// MIS ACTIVIDADES - IGLESIA EL ANCLA
// Una tarjeta resume la publicación; la ficha muestra todo ordenado.
// La asistencia y las cooperaciones se guardan en MongoDB mediante api.js.
// =========================================================

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays, Clock3, MapPin, MonitorPlay, RefreshCw,
  Eye, X, Gift, UsersRound, CheckCircle2, Image as ImageIcon,
} from "lucide-react";
import api from "../../services/api";
import ActivityAttendanceCard from "../../components/member/activities/ActivityAttendanceCard";
import "../../styles/pages/member/MemberActivities.css";

const TIME_ZONE = "America/Santiago";

// El backend utiliza fechas civiles (YYYY-MM-DD), no instantes UTC.
function chileDateParts() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (type) => parts.find((part) => part.type === type)?.value;
  return { date: `${get("year")}-${get("month")}-${get("day")}`, time: `${get("hour")}:${get("minute")}` };
}

function formatDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return "Sin fecha";
  return new Intl.DateTimeFormat("es-CL", {
    weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00.000Z`));
}

function safeUrl(value) {
  try {
    const url = new URL(value || "");
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch { return null; }
}

function messageFrom(error) {
  return error?.response?.data?.message || error?.message || "No se pudo completar la operación.";
}

function MemberActivities() {
  const [activities, setActivities] = useState([]);
  const [attendance, setAttendance] = useState({ mine: [], counts: [] });
  const [attendanceAvailable, setAttendanceAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [savingKey, setSavingKey] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [contributions, setContributions] = useState(null);
  const [contributionDraft, setContributionDraft] = useState({});
  const [contributionLoading, setContributionLoading] = useState(false);
  const [contributionSaving, setContributionSaving] = useState(false);
  const [contributionError, setContributionError] = useState("");
  const [contributionRefresh, setContributionRefresh] = useState(0);
  const closeRef = useRef(null);

  // La consulta pública del miembro nunca recibe borradores administrativos.
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    Promise.allSettled([
      api.get("/activities/member", { signal: controller.signal }),
      api.get("/activities/attendance/state", { signal: controller.signal }),
    ]).then(([activitiesResponse, attendanceResponse]) => {
      if (controller.signal.aborted) return;
      if (activitiesResponse.status !== "fulfilled") throw activitiesResponse.reason;
      if (!activitiesResponse.value.data?.success ||
          !Array.isArray(activitiesResponse.value.data.activities)) {
        throw new Error("El servidor devolvió una lista de actividades inválida.");
      }
      setActivities(activitiesResponse.value.data.activities);
      const available = attendanceResponse.status === "fulfilled" &&
        attendanceResponse.value.data?.success === true;
      setAttendanceAvailable(available);
      setAttendance(available ? {
        mine: attendanceResponse.value.data.mine || [],
        counts: attendanceResponse.value.data.counts || [],
      } : { mine: [], counts: [] });
    }).catch((requestError) => {
      if (!controller.signal.aborted) { setActivities([]); setError(messageFrom(requestError)); }
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [refreshKey]);

  const upcoming = useMemo(() => {
    const now = chileDateParts();
    return activities.filter((activity) => activity.date > now.date ||
      (activity.date === now.date && activity.time > now.time))
      .map((activity) => ({ ...activity, occurrenceDate: activity.date }))
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  }, [activities]);
  const selected = upcoming.find((item) => item.id === selectedId) || null;
  const selectedIsConfirmed = selected ? attendance.mine.some((row) =>
    row.activityId === selected.id && row.occurrenceDate === selected.date) : false;

  // Al abrir la ficha consultamos cupos y aportes propios, sin nombres de terceros.
  useEffect(() => {
    if (!selectedId) return undefined;
    const controller = new AbortController();
    setContributionLoading(true);
    setContributionError("");
    api.get(`/activities/${encodeURIComponent(selectedId)}/attendance/contributions`, {
      signal: controller.signal,
    }).then(({ data }) => {
      if (controller.signal.aborted) return;
      if (!data?.success) throw new Error("No se pudieron consultar las cooperaciones.");
      setContributions(data);
      setContributionDraft(Object.fromEntries((data.mine || []).map((entry) => [entry.itemId, entry.quantity])));
    }).catch((requestError) => {
      if (!controller.signal.aborted) { setContributions(null); setContributionError(messageFrom(requestError)); }
    }).finally(() => { if (!controller.signal.aborted) setContributionLoading(false); });
    return () => controller.abort();
  }, [selectedId, contributionRefresh]);

  // Accesibilidad: enfocamos el cierre y bloqueamos el desplazamiento de fondo.
  useEffect(() => {
    if (!selectedId) return undefined;
    const originalOverflow = document.body.style.overflow;
    const oldFocus = document.activeElement;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !contributionSaving && !savingKey) setSelectedId(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = originalOverflow;
      oldFocus?.focus?.();
    };
  }, [selectedId, contributionSaving, savingKey]);

  // Un miembro confirma o cancela exclusivamente su propia asistencia.
  const updateAttendance = useCallback(async (activity, shouldConfirm) => {
    if (!attendanceAvailable || savingKey) return;
    const key = `${activity.id}:${activity.occurrenceDate}`;
    setSavingKey(key);
    setActionError("");
    try {
      if (shouldConfirm) {
        await api.post(`/activities/${activity.id}/attendance`, { occurrenceDate: activity.occurrenceDate });
      } else {
        await api.delete(`/activities/${activity.id}/attendance`, {
          params: { occurrenceDate: activity.occurrenceDate },
        });
      }
      const { data } = await api.get("/activities/attendance/state");
      if (!data?.success) throw new Error("No se pudo actualizar la asistencia.");
      setAttendance({ mine: data.mine || [], counts: data.counts || [] });
      // Al cancelar, los aportes comprometidos se liberan automáticamente.
      setContributionRefresh((number) => number + 1);
    } catch (requestError) { setActionError(`${activity.title}: ${messageFrom(requestError)}`); }
    finally { setSavingKey(null); }
  }, [savingKey, attendanceAvailable]);

  // Actualiza cantidades en la ficha; cero significa retirar ese aporte.
  function changeContribution(itemId, quantity) {
    setContributionDraft((current) => ({ ...current, [itemId]: Number(quantity) }));
    setContributionError("");
  }

  async function saveContributions() {
    if (!selected || !selectedIsConfirmed || contributionSaving) return;
    const selectedRows = Object.entries(contributionDraft)
      .filter(([, quantity]) => Number(quantity) > 0)
      .map(([itemId, quantity]) => ({ itemId, quantity: Number(quantity) }));
    if (selectedRows.length > 5) {
      setContributionError("Puedes escoger hasta cinco tipos de aporte.");
      return;
    }
    setContributionSaving(true);
    setContributionError("");
    try {
      await api.patch(`/activities/${selected.id}/attendance/contributions`, { contributions: selectedRows });
      setContributionRefresh((number) => number + 1);
    } catch (requestError) { setContributionError(messageFrom(requestError)); }
    finally { setContributionSaving(false); }
  }

  return (
    <main className="member-events-page">
      <header className="member-events-page__header">
        <span>MI COMUNIDAD</span>
        <h1>Mis actividades</h1>
        <p>Descubre nuestras próximas actividades, revisa los detalles y organiza tu participación.</p>
      </header>
      {error && <div className="member-events-page__notice" role="alert">
        {error} <button type="button" onClick={() => setRefreshKey((n) => n + 1)}>
          <RefreshCw size={15} /> Reintentar
        </button>
      </div>}
      {actionError && <div className="member-events-page__notice" role="alert">{actionError}</div>}
      {loading ? <p role="status">Cargando actividades...</p>
        : !error && upcoming.length === 0 ? <div className="member-events-page__notice">No hay actividades próximas publicadas.</div>
          : !error && (
            <section className="member-events-page__grid" aria-label="Actividades próximas">
              {upcoming.map((activity) => {
                const confirmed = attendance.mine.some((row) =>
                  row.activityId === activity.id && row.occurrenceDate === activity.date);
                const excerpt = (activity.description || "").replace(/\s+/g, " ").trim();
                return (
                  <article className="member-events-page__event" key={activity.id}>
                    <div className="member-events-page__cover">
                      {activity.image?.url ? <img src={activity.image.url}
                        alt={activity.image.alt || `Imagen de ${activity.title}`} loading="lazy" />
                        : <ImageIcon size={32} aria-hidden="true" />}
                    </div>
                    <div className="member-events-page__event-info">
                      <span className="member-events-page__category">{activity.category}</span>
                      <h2>{activity.title}</h2>
                      <p className="member-events-page__excerpt">
                        {excerpt.length > 155 ? `${excerpt.slice(0, 155).trim()}…` : excerpt}
                      </p>
                      <div className="member-events-page__meta">
                        <span><CalendarDays size={16} /> {formatDate(activity.date)}</span>
                        <span><Clock3 size={16} /> {activity.time} hrs</span>
                        <span>{activity.modality === "Online" ? <MonitorPlay size={16} /> : <MapPin size={16} />}
                          {activity.modality}{activity.location ? ` · ${activity.location}` : ""}</span>
                      </div>
                      <div className="member-events-page__card-footer">
                        {confirmed ? <span className="member-events-page__confirmed"><CheckCircle2 size={15} /> Confirmado</span>
                          : <span className="member-events-page__pending">{activity.requiresConfirmation ? "Confirma tu asistencia" : "Actividad abierta"}</span>}
                        {activity.cooperation?.enabled && <span className="member-events-page__cooperation-badge"><Gift size={15} /> Con cooperación</span>}
                        <button type="button" className="member-events-page__details-button"
                          onClick={() => { setSelectedId(activity.id); setContributions(null); setContributionError(""); }}>
                          <Eye size={17} /> Ver detalles
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          )}

      {/* Ficha en pantalla completa: el miembro no recibe opciones de administración. */}
      {selected && (
        <div className="member-events-page__modal-overlay" onMouseDown={(e) => {
          if (e.target === e.currentTarget && !savingKey && !contributionSaving) setSelectedId(null);
        }}>
          <section className="member-events-page__modal" role="dialog" aria-modal="true"
            aria-labelledby="member-activity-details-title">
            <header className="member-events-page__modal-header">
              <div><span className="member-events-page__category">FICHA DE ACTIVIDAD · {selected.category}</span>
                <h2 id="member-activity-details-title">{selected.title}</h2></div>
              <button ref={closeRef} type="button" className="member-events-page__modal-close"
                aria-label="Cerrar detalles" onClick={() => setSelectedId(null)}><X size={21} /></button>
            </header>
            <div className="member-events-page__modal-body">
              {selected.image?.url && <img className="member-events-page__modal-image"
                src={selected.image.url} alt={selected.image.alt || "Imagen de actividad"} />}
              <section className="member-events-page__detail-section">
                <h3>Descripción</h3>
                <p className="member-events-page__description">{selected.description}</p>
              </section>
              <section className="member-events-page__detail-section">
                <h3><CalendarDays size={18} /> Programación</h3>
                <dl className="member-events-page__detail-grid">
                  <div><dt>Fecha de la actividad</dt><dd>{formatDate(selected.date)}</dd></div>
                  <div><dt><Clock3 size={15} /> Horario</dt><dd>{selected.time}{selected.endTime ? ` – ${selected.endTime}` : ""} hrs</dd></div>
                </dl>
              </section>
              <section className="member-events-page__detail-section">
                <h3>{selected.modality === "Online" ? <MonitorPlay size={18} /> : <MapPin size={18} />} Modalidad y acceso</h3>
                <dl className="member-events-page__detail-grid">
                  <div><dt>Modalidad</dt><dd>{selected.modality}</dd></div>
                  {selected.modality !== "Online" && <div><dt>Ubicación</dt><dd>{selected.location || "Por confirmar"}</dd></div>}
                  {selected.modality !== "Presencial" && <div><dt>Acceso a la reunión</dt>
                    <dd>{safeUrl(selected.meetingUrl) ? <a href={safeUrl(selected.meetingUrl)} target="_blank" rel="noopener noreferrer">Abrir reunión online</a>
                      : "Solicita el enlace a los líderes de la iglesia."}</dd></div>}
                </dl>
              </section>
              <section className="member-events-page__detail-section">
                <h3><UsersRound size={18} /> Participación</h3>
                <ActivityAttendanceCard
                  activity={selected}
                  isConfirmed={selectedIsConfirmed}
                  confirmedCount={attendance.counts.find((row) =>
                    row.activityId === selected.id && row.occurrenceDate === selected.date)?.confirmed || 0}
                  isSaving={savingKey === `${selected.id}:${selected.date}`}
                  attendanceAvailable={attendanceAvailable}
                  onConfirm={() => updateAttendance(selected, true)}
                  onCancel={() => updateAttendance(selected, false)}
                />
                {actionError && <p className="member-events-page__inline-error" role="alert">{actionError}</p>}
              </section>
              {selected.cooperation?.enabled && (
                <section className="member-events-page__detail-section">
                  <h3><Gift size={18} /> Cooperación para esta actividad</h3>
                  <p className="member-events-page__detail-help">
                    Si quieres colaborar, selecciona los aportes que llevarás. Los cupos se actualizan para evitar repeticiones.
                  </p>
                  {!selectedIsConfirmed ? <p className="member-events-page__cooperation-help">Primero confirma tu asistencia para registrar lo que llevarás.</p>
                    : contributionLoading ? <p role="status">Consultando aportes disponibles...</p>
                      : contributions?.enabled ? (
                        <div className="member-events-page__contributions">
                          {(contributions.items || []).map((item) => {
                            const mine = (contributions.mine || []).find((row) => row.itemId === item.id)?.quantity || 0;
                            const allowed = Math.min(20, Math.max(0, item.maxQuantity - item.reserved + mine));
                            const remaining = Math.max(0, item.maxQuantity - item.reserved);
                            return <label key={item.id} className="member-events-page__contribution-row">
                              <span><strong>{item.name}</strong><small>{item.reserved} de {item.maxQuantity} comprometidos · {remaining} disponibles</small></span>
                              <select value={contributionDraft[item.id] || 0}
                                onChange={(e) => changeContribution(item.id, e.target.value)}
                                aria-label={`Cantidad de ${item.name}`} disabled={contributionSaving}>
                                {Array.from({ length: allowed + 1 }, (_, number) => (
                                  <option key={number} value={number}>{number === 0 ? "No llevaré" : number}</option>
                                ))}
                              </select>
                            </label>;
                          })}
                          <button className="member-events-page__save-contributions" type="button"
                            disabled={contributionSaving} onClick={saveContributions}>
                            <CheckCircle2 size={17} /> {contributionSaving ? "Guardando..." : "Guardar mi cooperación"}
                          </button>
                          <button className="member-events-page__refresh-contributions" type="button"
                            onClick={() => setContributionRefresh((n) => n + 1)} disabled={contributionSaving}>
                            <RefreshCw size={15} /> Actualizar cupos
                          </button>
                        </div>
                      ) : <p>La cooperación no está disponible temporalmente.</p>}
                  {contributionError && <p className="member-events-page__inline-error" role="alert">{contributionError}</p>}
                </section>
              )}
            </div>
            <footer className="member-events-page__modal-footer">
              <button type="button" onClick={() => setSelectedId(null)} disabled={Boolean(savingKey) || contributionSaving}>Cerrar</button>
            </footer>
          </section>
        </div>
      )}
    </main>
  );
}

export default MemberActivities;
