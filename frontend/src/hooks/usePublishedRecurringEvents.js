// =========================================================
// EVENTOS HABITUALES PUBLICADOS — FUENTE ÚNICA
// Comparte los datos reales entre la portada del miembro
// y el resumen administrativo, sin duplicar horarios.
// =========================================================

import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

// Mongoose usa el mismo índice que JavaScript: 0 es domingo.
const WEEKDAYS = [
  "Domingo", "Lunes", "Martes", "Miércoles",
  "Jueves", "Viernes", "Sábado",
];

// Devuelve un texto fiel a la recurrencia registrada.
// Nunca inventa una fecha concreta para encuentros mensuales.
export function getEventDayLabel(event) {
  const recurrence = event?.recurrence;
  const days = Array.isArray(recurrence?.daysOfWeek)
    ? [...new Set(recurrence.daysOfWeek)]
        .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6)
        .sort((a, b) => a - b)
    : [];

  if (recurrence?.type === "monthly") {
    const quantity = Number(recurrence.monthlyCount);
    const frequency = Number.isInteger(quantity) && quantity > 0
      ? `${quantity} ${quantity === 1 ? "vez" : "veces"} al mes`
      : "Mensual";

    // Los días indicados se muestran, sin suponer en qué semanas ocurren.
    return days.length
      ? `${frequency} · ${days.map((day) => WEEKDAYS[day]).join(", ")}`
      : `${frequency} · fechas por confirmar`;
  }

  return days.length
    ? days.map((day) => WEEKDAYS[day]).join(", ")
    : "Día por confirmar";
}

// Conserva exactamente la hora local almacenada por el backend.
export function getEventTimeLabel(event) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(event?.time || "")
    ? event.time
    : "Por confirmar";
}

// Ordena las reuniones semanales de domingo a sábado;
// los eventos mensuales aparecen después, sin fechas inventadas.
function eventSort(a, b) {
  const rank = (event) => event.recurrence?.type === "weekly" ? 0 : 1;
  const typeDifference = rank(a) - rank(b);
  if (typeDifference !== 0) return typeDifference;

  const firstDay = (event) => {
    const days = event.recurrence?.daysOfWeek;
    const validDays = Array.isArray(days)
      ? days.filter((day) => Number.isInteger(day) && day >= 0 && day <= 6)
      : [];
    return validDays.length ? Math.min(...validDays) : 7;
  };

  return firstDay(a) - firstDay(b) ||
    String(a.time || "").localeCompare(String(b.time || "")) ||
    String(a.title).localeCompare(String(b.title), "es");
}

// Consulta solo GET /api/events/public: los borradores y eventos
// ya terminados se filtran en el servidor.
export default function usePublishedRecurringEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        setLoading(true);
        setError(false);

        // La instancia API ya administra la URL base y las cookies.
        const response = await api.get("/events/public", {
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        // Nunca usamos el arreglo estático anterior como respaldo.
        if (response.data?.success !== true || !Array.isArray(response.data.events)) {
          throw new Error("Formato de eventos inesperado");
        }

        setEvents(response.data.events.filter((event) =>
          event && typeof event.title === "string" &&
          typeof event.id === "string" &&
          event.publicationStatus === "published"
        ));
      } catch (requestError) {
        if (controller.signal.aborted) return;
        console.error("No se pudieron consultar los eventos públicos:", requestError);
        setEvents([]);
        setError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, []);

  const orderedEvents = useMemo(() => [...events].sort(eventSort), [events]);

  return { events: orderedEvents, loading, error };
}
