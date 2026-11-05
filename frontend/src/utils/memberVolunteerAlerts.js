// =========================================================
// AVISOS DE VOLUNTARIADO DERIVADOS DE TURNOS REALES
// No se guardan avisos nuevos en MongoDB.
// =========================================================

// Trabajamos con fechas civiles de Chile, igual que el backend.
export function getTodayChile() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
}

// Avanzar días desde el mediodía UTC evita problemas de horario de verano.
function addDays(dateOnly, days) {
  const date = new Date(`${dateOnly}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

// Formato accesible para las tarjetas y la campana.
export function formatVolunteerDate(dateOnly) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly || "")) return "Fecha por confirmar";
  const [year, month, day] = dateOnly.split("-").map(Number);
  return new Intl.DateTimeFormat("es-CL", {
    weekday: "long", day: "numeric", month: "long",
  }).format(new Date(year, month - 1, day, 12));
}

// Devuelve avisos únicamente de las asignaciones de la sesión autenticada.
export function deriveVolunteerAlerts(assignments) {
  if (!Array.isArray(assignments)) return [];
  const today = getTodayChile();
  const nextWeek = addDays(today, 7);

  return assignments
    .filter((item) => item?.id && item?.date >= today)
    .filter((item) => item.status === "pending" ||
      (item.date <= nextWeek && (item.status === "confirmed" || item.status === "cancelled")))
    .map((item) => ({
      id: `volunteer:${item.id}:${item.date}:${item.startTime}:${item.status}`,
      assignmentId: item.id,
      title: item.status === "pending" ? "Tienes un turno por confirmar" :
        item.status === "cancelled" ? "Se canceló un turno de servicio" : "Se acerca tu turno de servicio",
      message: `${item.title} · ${formatVolunteerDate(item.date)} · ${item.startTime} hrs`,
      status: item.status,
      date: item.date,
      startTime: item.startTime,
      to: "/member/voluntariado",
    }))
    .sort((a, b) => {
      // Primero lo pendiente; después los avisos por proximidad del turno.
      const aPriority = a.status === "pending" ? 0 : a.status === "cancelled" ? 1 : 2;
      const bPriority = b.status === "pending" ? 0 : b.status === "cancelled" ? 1 : 2;
      return aPriority - bPriority || `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`);
    });
}
