// Martín: visitantes solo ven un saludo; Gemini exige siempre sesión válida.
import { Router } from "express";
import mongoose from "mongoose";
import martinBibleRoutes from "./martinBibleRoutes.js";
import { listKnowledge, createKnowledge, updateKnowledge, deleteKnowledge } from "../services/martin/martinKnowledgeService.js";
import rateLimit from "express-rate-limit";
import authenticateUser from "../middleware/authenticateUser.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import { classifyLocalMessage, generateMartinAnswer, getDailyUsage, reserveDailyMessage } from "../services/martin/martinService.js";
import { getMartinConfiguration, updateMartinConfiguration, publicMartinConfiguration } from "../services/martin/martinConfigurationService.js";
import { getMartinBlock, registerMartinViolation, recordMartinEvent, getMartinActivity } from "../services/martin/martinSecurityService.js";

import { getMartinGuidedMenu, getMartinGuidedReply } from "../services/martin/martinGuidedService.js";

const router = Router();
const roles = ["member", "admin", "super_admin"];
const managementRoles = ["admin", "super_admin"];
const ipLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: "draft-8", legacyHeaders: false,
  message: { success: false, message: "Martín está recibiendo muchas consultas. Intenta más tarde." } });
router.use((_req, res, next) => { res.set("Cache-Control", "no-store"); next(); });

// Biblia pública: lectura de JSON locales, sin sesiones ni Gemini.
router.use("/biblia", martinBibleRoutes);

// Menú guiado público: no consulta MongoDB ni consume Gemini.
router.get("/menu", (_req, res) => res.json({ success: true, data: getMartinGuidedMenu() }));
router.get("/menu/:option", (req, res) => {
  const answer = getMartinGuidedReply(req.params.option);
  if (!answer) return res.status(404).json({ success: false, message: "No encontré esa opción. ¿Quieres elegir otra? ⚓" });
  return res.json({ success: true, data: answer });
});

// Un visitante NO puede enviar preguntas: esta ruta nunca llama a Gemini.
router.get("/saludo", async (_req, res, next) => {
  try {
    const config = await getMartinConfiguration();
    return res.json({ success: true, data: { available: config.enabled && config.audiences.visitors,
      message: config.enabled && config.audiences.visitors ? config.welcomeMessage : "Martín volverá pronto. ⚓",
      options: ["Conoce nuestra iglesia", "Horarios y actividades", "Iniciar sesión"] } });
  } catch (_error) {
    const menu = getMartinGuidedMenu();
    return res.json({ success: true, data: { available: false, message: menu.message, options: menu.options.map(option => option.titulo) } });
  }
});

// Solo administradores pueden consultar/editar las opciones y estadísticas.
router.get("/admin/configuracion", authenticateUser, authorizeRoles(...managementRoles), async (_req, res, next) => {
  try { const data = await getMartinConfiguration(); return res.json({ success: true, data: publicMartinConfiguration(data) }); }
  catch (error) { return next(error); }
});
router.patch("/admin/configuracion", authenticateUser, authorizeRoles(...managementRoles), async (req, res, next) => {
  try {
    const expectedOrigin = process.env.FRONTEND_URL || "http://localhost:3000";
    if (req.get("Origin") !== expectedOrigin) return res.status(403).json({ success: false, message: "No se pudo validar el origen." });
    const data = await updateMartinConfiguration(req.body);
    return res.json({ success: true, message: "Los cambios de Martín se guardaron correctamente.", data: publicMartinConfiguration(data) });
  } catch (error) { if (/configuración|opciones|mensaje|valor|Selecciona|disponibilidad/i.test(error.message)) return res.status(400).json({ success: false, message: error.message }); return next(error); }
});
router.get("/admin/actividad", authenticateUser, authorizeRoles(...managementRoles), async (_req, res, next) => {
  try { return res.json({ success: true, data: await getMartinActivity() }); }
  catch (error) { return next(error); }
});

// Los contenidos pueden administrarse únicamente desde cuentas con permisos.
// Verificamos el origen de los cambios porque la sesión se envía mediante cookies.
function checkManagementOrigin(req, res, next) {
  const allowed = process.env.FRONTEND_URL || "http://localhost:3000";
  if (req.get("Origin") !== allowed) return res.status(403).json({ success: false, message: "No se pudo comprobar la solicitud." });
  return next();
}
function validateKnowledgeId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "No se encontró el contenido solicitado." });
  return next();
}
router.get("/admin/conocimientos", authenticateUser, authorizeRoles(...managementRoles), async (_req, res, next) => {
  try { return res.json({ success: true, data: await listKnowledge() }); } catch (error) { return next(error); }
});
router.post("/admin/conocimientos", authenticateUser, authorizeRoles(...managementRoles), checkManagementOrigin, async (req, res, next) => {
  try { return res.status(201).json({ success: true, data: await createKnowledge(req.body), message: "Contenido guardado correctamente." }); }
  catch (error) { if (error.message?.includes("campo") || /contenido|Completa|Selecciona|cambios/i.test(error.message)) return res.status(400).json({ success: false, message: error.message }); return next(error); }
});
router.patch("/admin/conocimientos/:id", authenticateUser, authorizeRoles(...managementRoles), checkManagementOrigin, validateKnowledgeId, async (req, res, next) => {
  try {
    const entry = await updateKnowledge(req.params.id, req.body);
    if (!entry) return res.status(404).json({ success: false, message: "El contenido ya no está disponible." });
    return res.json({ success: true, data: entry, message: "Cambios guardados correctamente." });
  } catch (error) { if (error.message?.includes("campo") || /contenido|Completa|Selecciona|cambios/i.test(error.message)) return res.status(400).json({ success: false, message: error.message }); return next(error); }
});
router.delete("/admin/conocimientos/:id", authenticateUser, authorizeRoles(...managementRoles), checkManagementOrigin, validateKnowledgeId, async (req, res, next) => {
  try {
    const removed = await deleteKnowledge(req.params.id);
    if (!removed) return res.status(404).json({ success: false, message: "El contenido ya no está disponible." });
    return res.json({ success: true, message: "Contenido eliminado correctamente." });
  } catch (error) { return next(error); }
});

// A partir de aquí todas las consultas requieren autenticación.
router.use(authenticateUser, authorizeRoles(...roles), ipLimiter);
router.get("/estado", async (req, res, next) => {
  try {
    const config = await getMartinConfiguration();
    const usage = await getDailyUsage(req.user._id, req.user.role, config);
    const blockedUntil = await getMartinBlock(req.user._id);
    return res.json({ success: true, data: { available: Boolean(process.env.GEMINI_API_KEY) && config.enabled && config.audiences.members && !blockedUntil,
      blockedUntil, ...usage } });
  } catch (_error) { return res.status(503).json({ success: false, message: "¡Ups! Ahora no puedo conversar contigo. ¿Me visitas un poquito más tarde? ⚓" }); }
});
router.post("/chat", async (req, res, next) => {
  try {
    const expectedOrigin = process.env.FRONTEND_URL || "http://localhost:3000";
    if (req.get("Origin") !== expectedOrigin) return res.status(403).json({ success: false, message: "No se pudo validar el origen." });
    const config = await getMartinConfiguration();
    if (!config.enabled || !config.audiences.members) return res.status(503).json({ success: false, message: "Martín está descansando por ahora. ⚓" });
    const blockedUntil = await getMartinBlock(req.user._id);
    if (blockedUntil) return res.status(429).json({ success: false, message: "Hemos pausado temporalmente este chat por seguridad. Puedes intentarlo más tarde.", data: { blockedUntil } });
    const body = req.body;
    if (!body || typeof body !== "object" || Array.isArray(body) || Object.keys(body).some(key => !["message", "history"].includes(key)) ||
      typeof body.message !== "string" || body.message.trim().length < 2 || body.message.length > config.maxMessageLength ||
      /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(body.message)) {
      return res.status(400).json({ success: false, message: `Escribe una consulta de entre 2 y ${config.maxMessageLength} caracteres.` });
    }
    // El historial es opcional, breve y nunca se utiliza para conceder permisos.
    const history = body.history === undefined ? [] : body.history;
    if (!Array.isArray(history) || history.length > 6 || history.some((entry) =>
      !entry || typeof entry !== "object" || Array.isArray(entry) ||
      Object.keys(entry).some((key) => !["role", "text"].includes(key)) ||
      !["user", "model"].includes(entry.role) ||
      typeof entry.text !== "string" || entry.text.length < 1 || entry.text.length > 1600 ||
      /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(entry.text))) {
      return res.status(400).json({ success: false, message: "¿Podemos intentar de nuevo esa pregunta? 😊" });
    }
    // Descartamos contextos que incluyan intentos reconocibles de revelar secretos.
    // Gemini nunca recibe autoridad del historial, aunque el cliente lo modifique.
    const safeHistory = history.filter((entry) => classifyLocalMessage(entry.text) !== "private" && classifyLocalMessage(entry.text) !== "attack");
    const kind = classifyLocalMessage(body.message);
    if (kind === "private" || kind === "attack") {
      const incident = await registerMartinViolation(req.user._id, config, kind);
      return res.status(403).json({ success: false, message: incident.blocked
        ? "Hemos pausado el chat por seguridad. Puedes volver a intentarlo más tarde."
        : "Por seguridad, no puedo atender esa solicitud. Puedo ayudarte con la Biblia y nuestra iglesia." });
    }
    if (kind === "offtopic") return res.json({ success: true, data: { answer: config.outOfScopeMessage, fromAI: false } });
    if (!process.env.GEMINI_API_KEY) return res.status(503).json({ success: false, message: "Martín no está disponible por ahora." });
    const quota = await reserveDailyMessage(req.user._id, req.user.role, config);
    if (!quota.allowed) { await recordMartinEvent("blocked", "quota", "Límite diario de consultas alcanzado");
      return res.status(429).json({ success: false, message: "Has utilizado tus mensajes de hoy. ¡Podemos conversar mañana! ⚓", data: quota }); }
    try {
      const answer = await generateMartinAnswer(body.message.trim(), config, safeHistory);
      await recordMartinEvent("request", "chat", "Consulta atendida correctamente");
      return res.json({ success: true, data: { answer, fromAI: true, remaining: quota.remaining } });
    } catch { await recordMartinEvent("error", "provider", "Servicio de respuestas no disponible");
      return res.status(503).json({ success: false, message: "Martín necesita un pequeño descanso. Intenta nuevamente más tarde.", data: { remaining: quota.remaining } }); }
  } catch (error) { return res.status(503).json({ success: false, message: "¡Ups! Ahora no puedo conversar contigo. ¿Me visitas un poquito más tarde? ⚓" }); }
});
// Fallo inesperado en autenticación o almacenamiento: nunca mostramos trazas técnicas.
router.use((_error, _req, res, _next) => res.status(503).json({
  success: false,
  message: "¡Ups! Ahora no puedo conversar contigo. ¿Me visitas un poquito más tarde? ⚓",
}));
export default router;
