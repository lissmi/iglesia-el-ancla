// Lectura bíblica pública para Martín: solo datos JSON locales, sin Gemini ni MongoDB.
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { getBibleIndex, getBibleVerse } from "../services/bible/bibleLocalService.js";

const router = Router();
// Limitamos el volumen público para proteger al servidor sin exigir login.
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 60,
  standardHeaders: "draft-8", legacyHeaders: false,
  message: { success: false, message: "¡Hay muchas lecturas en este momento! 💙 Intenta nuevamente dentro de un ratito." } });
router.use(limiter);
router.use((_req, res, next) => { res.set("Cache-Control", "public, max-age=300"); next(); });

// Solo entregamos identificadores, nombres y cantidad de capítulos.
router.get("/libros", async (_req, res) => {
  try {
    const index = await getBibleIndex();
    return res.json({ success: true, data: { libros: index.libros.map(({id, nombre, capitulos}) => ({id, nombre, capitulos})) } });
  } catch (_error) {
    return res.status(503).json({ success: false, message: "¡Ups! No pude abrir la Biblia ahora. ¿Lo intentamos más tarde? 💙" });
  }
});

// Entregamos exclusivamente UN versículo; no aceptamos rutas a archivos arbitrarios.
router.get("/versiculo/:libro/:capitulo/:versiculo", async (req, res) => {
  const { libro, capitulo, versiculo } = req.params;
  if (!/^[a-z0-9-]{1,35}$/.test(libro) ||
      !/^[1-9][0-9]{0,2}$/.test(capitulo) ||
      !/^[1-9][0-9]{0,2}$/.test(versiculo)) {
    return res.status(400).json({ success: false, message: "Revisa la referencia y volvamos a intentarlo. 📖" });
  }
  try {
    const result = await getBibleVerse(libro, Number(capitulo), Number(versiculo));
    return res.json({ success: true, data: { referencia: result.referencia, texto: result.texto, version: result.version } });
  } catch (error) {
    if (error.status === 404 || error.status === 400) return res.status(404).json({ success: false, message: "No encontré ese versículo. ¿Probamos con otra referencia? 😊" });
    return res.status(503).json({ success: false, message: "¡Ups! No pude abrir ese pasaje ahora. Inténtalo un poquito más tarde. ⚓" });
  }
});
export default router;
