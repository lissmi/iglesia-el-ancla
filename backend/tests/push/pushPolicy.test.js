// Pruebas locales sin red ni MongoDB para la política de avisos.
import test from "node:test";
import assert from "node:assert/strict";
import { chileClock, addCivilDays, needsActivityConfirmation, occursToday, makeSafePayload } from "../../src/services/push/pushPolicy.js";

test("El día chileno usa zona America/Santiago, sin depender de Vercel", () => {
  const c = chileClock(new Date("2026-11-10T15:00:00Z"));
  assert.equal(c.date, "2026-11-10");
  assert.equal(c.time, "12:00");
});

test("El horario de verano no altera los días civiles", () => {
  assert.equal(addCivilDays("2026-09-05", 1), "2026-09-06");
});

test("Confirmar asistencia detiene el recordatorio", () => {
  const a = { publicationStatus: "published", requiresConfirmation: true, date: "2026-11-13", time: "19:00" };
  const c = { date: "2026-11-10", time: "12:00" };
  assert.equal(needsActivityConfirmation(a, false, c), true);
  assert.equal(needsActivityConfirmation(a, true, c), false);
});

test("No recordamos actividades en borrador, pasadas o de fecha lejana", () => {
  const c = { date: "2026-11-10", time: "12:00" };
  const base = { publicationStatus: "published", requiresConfirmation: true, date: "2026-11-10", time: "11:00" };
  assert.equal(needsActivityConfirmation(base, false, c), false);
  assert.equal(needsActivityConfirmation({ ...base, date: "2026-12-10" }, false, c), false);
  assert.equal(needsActivityConfirmation({ ...base, publicationStatus: "draft", date: "2026-11-11" }, false, c), false);
});

test("Un evento mensual sin fechas precisas no genera recordatorios", () => {
  const e = { publicationStatus: "published", date: "2026-01-01", recurrence: { type: "monthly", daysOfWeek: [2] } };
  assert.equal(occursToday(e, "2026-11-10"), false);
});

test("El texto del teléfono omite detalles personales", () => {
  for (const kind of ["activity", "event", "prayer", "supply", "confirmation", "gathering"]) {
    const payload = makeSafePayload(kind);
    assert.match(payload.url, /^\/(member|eventos)/);
    assert.doesNotMatch(JSON.stringify(payload), /nombre de usuario|descripci[oó]n personal|diagn[oó]stico/i);
  }
});
