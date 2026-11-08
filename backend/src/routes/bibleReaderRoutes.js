// =========================================================
// API LOCAL DE LA BIBLIA — LECTURA POR CAPÍTULOS
// =========================================================

// Importamos el router de Express.
import { Router } from "express";

// Reutilizamos la cookie de sesión y la comprobación de usuarios activos.
import authenticateUser from "../middleware/authenticateUser.js";

// Permitimos acceso a los tres roles registrados en El Ancla.
import authorizeRoles from "../middleware/authorizeRoles.js";

// Consultamos exclusivamente los JSON locales de la traducción disponible.
import { getBibleIndex, getBibleVersion, getBibleChapter, getBibleVerse } from "../services/bible/bibleLocalService.js";

// Creamos un router independiente que no modifica otras rutas del proyecto.
const router = Router();

// La lectura requiere una sesión válida; el cliente no puede saltarse esta comprobación.
router.use(authenticateUser, authorizeRoles("member", "admin", "super_admin"));

// Las respuestas del lector son personales y no quedan en cachés intermedias.
router.use((_req, res, next) => {
  res.set("Cache-Control", "private, no-store, max-age=0");
  next();
});

// Convertimos errores conocidos en respuestas adecuadas sin mostrar rutas internas.
function respondToBibleError(error, res, next) {
  if (Number.isInteger(error.status) && error.status >= 400 && error.status < 600) {
    return res.status(error.status).json({ success: false, message: error.message });
  }
  // Los errores de archivos ausentes o JSON corrupto se registran solo en el servidor.
  console.error("Error al consultar los archivos de la Biblia:", error.message);
  return res.status(503).json({
    success: false,
    message: "No pudimos cargar esta lectura. Intenta nuevamente en unos momentos.",
  });
}

// GET /api/bible-reader/version — nombre y características de la traducción.
router.get("/version", async (_req, res) => {
  try {
    const data = await getBibleVersion();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return respondToBibleError(error, res);
  }
});

// GET /api/bible-reader/books — lista de los libros disponibles.
router.get("/books", async (_req, res) => {
  try {
    const index = await getBibleIndex();
    return res.status(200).json({
      success: true,
      data: {
        version: index.version,
        nombreVersion: index.nombre,
        libros: index.libros.map(({ id, nombre, testamento, capitulos }) => ({
          id, nombre, testamento, capitulos,
        })),
      },
    });
  } catch (error) {
    return respondToBibleError(error, res);
  }
});

// GET /api/bible-reader/books/genesis/chapters/1 — texto completo de Génesis 1.
router.get("/books/:slug/chapters/:chapter", async (req, res) => {
  // Antes de consultar datos, validamos la sintaxis del capítulo.
  if (!/^[1-9][0-9]{0,2}$/.test(req.params.chapter)) {
    return res.status(400).json({
      success: false,
      message: "Selecciona un capítulo válido.",
    });
  }

  try {
    // El servicio comprueba que el libro y capítulo figuren en nuestro índice.
    const data = await getBibleChapter(req.params.slug, Number(req.params.chapter));
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return respondToBibleError(error, res);
  }
});

// GET /api/bible-reader/books/juan/chapters/3/verses/16
// Devuelve únicamente el versículo solicitado y su referencia.
router.get("/books/:slug/chapters/:chapter/verses/:verse", async (req, res) => {
  // Rechazamos números negativos, decimales o cadenas extrañas.
  if (!/^[1-9][0-9]{0,2}$/.test(req.params.chapter) ||
      !/^[1-9][0-9]{0,2}$/.test(req.params.verse)) {
    return res.status(400).json({
      success: false,
      message: "Selecciona un capítulo y versículo válidos.",
    });
  }

  try {
    // El servicio confirma también que el libro exista y la sesión esté autorizada.
    const data = await getBibleVerse(
      req.params.slug,
      Number(req.params.chapter),
      Number(req.params.verse)
    );
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return respondToBibleError(error, res);
  }
});

// Exportamos el router para registrarlo una sola vez en app.js.
export default router;
