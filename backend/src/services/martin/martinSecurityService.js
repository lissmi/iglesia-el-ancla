// Protección de Martín con un único modelo y registros mínimos sin contenido de chat.
import Martin from "../../models/Martin.js";

// Clave diaria en horario de Chile, no en el huso horario del servidor.
const chileDay = (date = new Date()) => new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Santiago", year: "numeric", month: "2-digit", day: "2-digit",
}).format(date);
const expiresInDays = (days) => new Date(Date.now() + days * 86400000);
const securityKey = (userId) => `security:${String(userId)}`;

// Una única fila por día acumula el número de consultas, bloqueos y errores.
// No se guardan las preguntas, las respuestas, las IP ni el identificador del usuario.
export async function recordMartinEvent(type, _category, _summary) {
  const field = { request: "requestCount", blocked: "blockedCount", error: "errorCount" }[type];
  if (!field) return;
  const day = chileDay();
  const key = `stats:${day}`;
  // No ocultamos el error: si falla el almacenamiento de estadísticas,
  // el flujo superior puede informar una indisponibilidad de forma segura.
  await Martin.findOneAndUpdate(
    { kind: "daily_stats", key },
    {
      $inc: { [field]: 1 },
      $setOnInsert: { kind: "daily_stats", key, day, expiresAt: expiresInDays(366) },
    },
    { upsert: true, new: false, setDefaultsOnInsert: false }
  );
}

// Comprobamos la suspensión por fecha efectiva, sin confiar en el TTL.
export async function getMartinBlock(userId) {
  const state = await Martin.findOne({ kind: "security", key: securityKey(userId) }).lean();
  return state?.blockedUntil && state.blockedUntil > new Date() ? state.blockedUntil : null;
}

// Incrementamos advertencias atómicamente por cuenta, con ventana de 15 minutos.
export async function registerMartinViolation(userId, config, category) {
  const now = new Date();
  const cutoff = new Date(now.getTime() - 15 * 60000);
  const key = securityKey(userId);
  const filter = { kind: "security", key };

  // Creamos una sola vez el registro por usuario, tolerando solicitudes concurrentes.
  try {
    await Martin.updateOne(filter, {
      $setOnInsert: {
        kind: "security", key, user: userId, strikes: 0,
        windowStartedAt: now, expiresAt: expiresInDays(2),
      },
    }, { upsert: true });
  } catch (error) {
    if (error.code !== 11000) throw error;
  }

  // Reiniciamos las advertencias cuando terminó la ventana anterior.
  await Martin.updateOne({ ...filter, windowStartedAt: { $lt: cutoff } }, {
    $set: { strikes: 0, windowStartedAt: now, blockedUntil: null },
  });

  // Contamos esta infracción de forma atómica.
  const updated = await Martin.findOneAndUpdate(filter, {
    $inc: { strikes: 1 },
    $set: { expiresAt: expiresInDays(2) },
  }, { new: true });

  const blocked = updated.strikes >= config.abuseStrikeLimit;
  if (blocked) {
    // Una infracción reiterada activa una pausa temporal, no elimina la cuenta.
    await Martin.updateOne(filter, {
      $set: { blockedUntil: new Date(now.getTime() + config.abuseBlockMinutes * 60000) },
    });
  }
  await recordMartinEvent("blocked", "security", category === "attack"
    ? "Intento de manipular las instrucciones"
    : "Solicitud de información reservada");
  return { blocked };
}

// Indicadores agrupados. Un documento por fecha, sin registros individuales.
export async function getMartinActivity() {
  const today = chileDay();
  const month = today.slice(0, 7);
  const rows = await Martin.find({ kind: "daily_stats" })
    .sort({ day: -1 }).limit(370).lean();
  const sum = (list, field) => list.reduce((total, item) => total + (item[field] || 0), 0);
  const monthRows = rows.filter((item) => item.day?.startsWith(month));
  return {
    metrics: {
      todayRequests: sum(rows.filter((item) => item.day === today), "requestCount"),
      monthRequests: sum(monthRows, "requestCount"),
      blockedRequests: sum(monthRows, "blockedCount"),
      estimatedCostUsd: null,
    },
    // Una fila por día y categoría; se agregan cantidades pero no textos privados.
    events: rows.flatMap((item) => [
      ["request", "chat", "Consultas atendidas", item.requestCount],
      ["blocked", "security", "Solicitudes rechazadas", item.blockedCount],
      ["error", "provider", "Consultas no completadas", item.errorCount],
    ].filter(([, , , count]) => count > 0).map(([type, category, summary, count]) => ({
      id: `${item.key}:${type}`, type, category, summary, count,
      createdAt: item.updatedAt || item.createdAt, day: item.day,
    }))),
  };
}
