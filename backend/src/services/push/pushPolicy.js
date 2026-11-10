// =========================================================
// REGLAS PURAS DE AVISOS AUTOMÁTICOS — IGLESIA EL ANCLA
// No consultan MongoDB ni envían notificaciones: son testeables.
// =========================================================

// La hora de Chile determina el día del límite de recordatorios.
export const PUSH_TIME_ZONE = "America/Santiago";

// Extraemos año, mes, día y hora sin depender del huso del servidor Vercel.
export function chileClock(now = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: PUSH_TIME_ZONE, year: "numeric", month: "2-digit",
    day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  });
  const parts = Object.fromEntries(formatter.formatToParts(now).map(({ type, value }) => [type, value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
}

// Suma días civiles manteniendo fechas YYYY-MM-DD, incluso con cambio de horario de verano.
export function addCivilDays(date, count) {
  const d = new Date(`${date}T12:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + count);
  return d.toISOString().slice(0, 10);
}

// Nunca insistimos sobre una actividad ya pasada, cancelada o confirmada.
export function needsActivityConfirmation(activity, confirmed, now, horizonDays = 14) {
  if (activity?.publicationStatus !== "published" || activity?.requiresConfirmation !== true || confirmed) return false;
  if (typeof activity.date !== "string" || typeof activity.time !== "string") return false;
  if (activity.date < now.date || activity.date > addCivilDays(now.date, horizonDays)) return false;
  if (activity.date === now.date && activity.time <= now.time) return false;
  return true;
}

// Calculamos solo recurrencias con días y semanas precisos, sin inventar fechas.
export function occursToday(event, day) {
  if (event?.publicationStatus !== "published" || !event?.recurrence) return false;
  if (event.date > day || (event.recurrence.endDate && event.recurrence.endDate < day)) return false;
  const d = new Date(`${day}T12:00:00.000Z`);
  const weekday = d.getUTCDay();
  if (!event.recurrence.daysOfWeek?.includes(weekday)) return false;
  if (event.recurrence.type === "weekly") return true;
  if (event.recurrence.type !== "monthly") return false;
  const weeks = event.recurrence.weeksOfMonth || [];
  if (!weeks.length) return false;
  const weekNumber = Math.floor((d.getUTCDate() - 1) / 7) + 1;
  const nextWeek = new Date(d.getTime() + 7 * 86400000);
  return weeks.includes(weekNumber) || (weeks.includes(-1) && nextWeek.getUTCMonth() !== d.getUTCMonth());
}

// Los textos del sistema Android/Windows no contienen datos personales ni detalles sensibles.
export const PUSH_MESSAGES = Object.freeze({
  activity: {
    title: "Hay novedades en El Ancla ⚓",
    body: "¡Te invitamos a conocer una nueva actividad de nuestra comunidad! 💙",
    url: "/member/actividades",
  },
  activityChange: {
    title: "Actualización de actividades ⚓",
    body: "Actualizamos la programación. Puedes revisar los detalles en la aplicación. 💙",
    url: "/member/actividades",
  },
  event: {
    title: "Una nueva reunión en El Ancla ⚓",
    body: "¡Te invitamos a revisar nuestras próximas reuniones! 💙",
    url: "/eventos",
  },
  eventChange: {
    title: "Cambios en nuestra programación ⚓",
    body: "Tenemos una actualización de horarios. Puedes revisarla en El Ancla. 💙",
    url: "/eventos",
  },
  prayer: {
    title: "Acompañémonos en oración 💙",
    body: "Hay una nueva petición comunitaria. Puedes acompañarla desde El Ancla.",
    url: "/member/peticiones-oracion",
  },
  privatePrayer: {
    title: "Un aviso para el equipo de El Ancla ⚓",
    body: "Hay una solicitud privada pendiente de revisión en el panel.",
    url: "/admin/peticiones-oracion",
  },
  supply: {
    title: "Entre todos podemos ayudar 💙",
    body: "La comunidad necesita algunos insumos. Puedes conocerlos en El Ancla.",
    url: "/member/insumos-basicos",
  },
  confirmation: {
    title: "¿Nos ayudas con tu confirmación? 💙",
    body: "Tienes una actividad pendiente de confirmar. Tu respuesta nos ayuda mucho a organizarnos. ¡Gracias!",
    url: "/member/actividades",
  },
  gathering: {
    title: "Hoy nos encontramos en El Ancla ⚓",
    body: "¡Te esperamos con mucho cariño! Revisa el horario en nuestras actividades.",
    url: "/eventos",
  },
});

// Un mismo dispositivo sustituye la notificación de cada categoría, sin acumular tarjetas idénticas.
export function makeSafePayload(kind) {
  const entry = PUSH_MESSAGES[kind];
  if (!entry) throw new Error("Tipo de aviso automático no reconocido");
  return { ...entry, tag: `el-ancla-${kind}` };
}
