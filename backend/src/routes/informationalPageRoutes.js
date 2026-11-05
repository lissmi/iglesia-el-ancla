// =========================================================
// API DE PÁGINAS INFORMATIVAS - IGLESIA EL ANCLA
// Borradores y publicaciones en Drive; autenticación centralizada.
// =========================================================

import { Router } from "express";
import { randomUUID } from "node:crypto";
import multer from "multer";
import { fileTypeFromBuffer } from "file-type";

import {
  INFORMATIONAL_PAGE_SLUGS,
  informationalPagesDrive,
} from "../services/drive/informationalPagesDriveService.js";
import authenticateUser from "../middleware/authenticateUser.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import validateRequestOrigin from "../middleware/validateRequestOrigin.js";
import cloudinary from "../services/cloudinary/cloudinary.js";
import { cleanupUploadedInformationalImages } from "../services/cloudinary/informationalPagesImages.js";

const router = Router();
const ALLOWED_SLUGS = new Set(INFORMATIONAL_PAGE_SLUGS);
const MAX_CONTENT_BYTES = 120 * 1024;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_INTERNAL_ROUTES = new Set(["/", "/nosotros", "/eventos", "/contacto"]);

// =========================================================
// REGLAS DE CONTENIDO PERMITIDO
// Se rechazan campos nuevos, prototipos y tipos inesperados.
// Los textos se guardan como texto plano, nunca como HTML.
// =========================================================

// Reglas de un objeto con propiedades explícitas.
const object = (properties) => ({ type: "object", properties });

// Reglas de un arreglo con elementos homogéneos y límites.
const array = (element, maxItems = 20) => ({ type: "array", element, maxItems });

// Reglas de texto; el límite es en caracteres JavaScript.
const string = (maxLength = 5000) => ({ type: "string", maxLength });

// Reglas especiales para imágenes y enlaces.
const image = () => ({ type: "image" });
const email = () => ({ type: "email" });
const https = () => ({ type: "https" });
const path = () => ({ type: "path" });

const hero = object({
  eyebrow: string(150),
  title: string(200),
  highlightedTitle: string(200),
  description: string(2500),
});

const imageBlock = object({
  icon: image(),
  eyebrow: string(150),
  title: string(200),
  description: string(3500),
});

const documentRules = object({
  hero,
  information: object({
    lastUpdated: string(150),
    introduction: string(6000),
  }),
  sections: array(object({
    id: string(60),
    title: string(250),
    content: string(15000),
  }), 40),
});

const RULES = {
  nosotros: object({
    hero: object({
      ...hero.properties,
      verse: string(2000),
      verseReference: string(150),
    }),
    intro: object({
      eyebrow: string(150),
      title: string(250),
      paragraphs: array(string(6000), 12),
      image: image(),
      imageAlt: string(300),
      imageCaption: string(600),
    }),
    purpose: object({
      mission: imageBlock,
      vision: imageBlock,
    }),
    conviction: object({
      icon: image(),
      eyebrow: string(150),
      title: string(250),
      paragraphs: array(string(6000), 12),
    }),
    values: object({
      eyebrow: string(150),
      title: string(250),
      description: string(1500),
      items: array(object({
        id: string(60),
        title: string(150),
        description: string(1800),
        icon: image(),
        alt: string(300),
      }), 15),
    }),
    pastor: object({
      eyebrow: string(150),
      name: string(200),
      role: string(250),
      image: image(),
      imageAlt: string(300),
      paragraphs: array(string(6000), 12),
    }),
    invitation: object({
      eyebrow: string(150),
      title: string(250),
      description: string(2500),
      primaryButton: object({ text: string(100), path: path() }),
      secondaryButton: object({ text: string(100), path: path() }),
    }),
  }),

  contacto: object({
    hero,
    information: object({
      location: object({
        label: string(120), title: string(200), address: string(300), city: string(200),
      }),
      email: object({ label: string(120), title: string(200), address: email() }),
      schedule: object({
        label: string(120), title: string(200), dayAndTime: string(250), modality: string(150),
      }),
    }),
    main: object({
      eyebrow: string(150), title: string(200), description: string(2000),
      notice: object({ title: string(250), items: array(string(600), 20) }),
      social: object({
        title: string(200),
        facebook: object({ label: string(150), url: https() }),
        instagram: object({ label: string(150), url: https() }),
      }),
    }),
    form: object({
      eyebrow: string(150), title: string(250),
      fields: object({
        name: object({ label: string(150), placeholder: string(200) }),
        email: object({ label: string(150), placeholder: string(200) }),
        subject: object({ label: string(150), placeholder: string(200) }),
        message: object({ label: string(150), placeholder: string(200) }),
      }),
      submitText: string(150),
      privacyText: string(1200),
    }),
  }),

  "terminos-y-condiciones": documentRules,
  "politica-de-privacidad": documentRules,
};

// Construye una respuesta 400 sin revelar datos internos.
function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

// Extrae valores seguros, descartando cualquier instancia con prototipo raro.
function validateNode(value, rule, label) {
  if (rule.type === "object") {
    if (!value || typeof value !== "object" || Array.isArray(value) ||
      Object.getPrototypeOf(value) !== Object.prototype) {
      throw badRequest(`${label}: se esperaba un objeto`);
    }
    const actualKeys = Object.keys(value);
    const allowedKeys = Object.keys(rule.properties);
    if (actualKeys.length !== allowedKeys.length ||
      actualKeys.some((key) => !Object.hasOwn(rule.properties, key))) {
      throw badRequest(`${label}: faltan campos o existen campos no permitidos`);
    }
    const output = {};
    for (const key of allowedKeys) {
      Object.defineProperty(output, key, {
        value: validateNode(value[key], rule.properties[key], `${label}.${key}`),
        enumerable: true, writable: true, configurable: true,
      });
    }
    return output;
  }

  if (rule.type === "array") {
    if (!Array.isArray(value) || value.length < 1 || value.length > rule.maxItems) {
      throw badRequest(`${label}: cantidad de elementos inválida`);
    }
    const result = value.map((entry, index) => validateNode(entry, rule.element, `${label}[${index}]`));
    if (result.every((entry) => entry && typeof entry === "object" && "id" in entry)) {
      const uniqueIds = new Set(result.map((entry) => entry.id));
      if (uniqueIds.size !== result.length) {
        throw badRequest(`${label}: existen identificadores repetidos`);
      }
    }
    return result;
  }

  if (typeof value !== "string") {
    throw badRequest(`${label}: debe ser texto`);
  }
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > (rule.maxLength || 2048)) {
    throw badRequest(`${label}: el texto está vacío o supera el límite`);
  }

  if (label.endsWith(".id") && !/^[A-Za-z0-9_-]+$/.test(trimmed)) {
    throw badRequest(`${label}: identificador inválido`);
  }
  if (rule.type === "image") {
    // Imágenes persistentes de Cloudinary o recursos incorporados en el build.
    // No aceptamos base64, javascript: ni enlaces arbitrarios.
    const slug = label.split(".")[0];
    // Las rutas de los arreglos llegan como values.items[0].icon.
    const fieldPath = label.slice(slug.length + 1).replace(/\[(\d+)\]/g, ".$1");
    const builtinFields = new Set([
      "intro.image", "purpose.mission.icon", "purpose.vision.icon",
      "conviction.icon", "pastor.image",
      ...Array.from({ length: 6 }, (_, index) => `values.items.${index}.icon`),
    ]);
    // Las imágenes originales tienen un identificador estable, no una URL de build.
    const builtin = slug === "nosotros" &&
      trimmed.startsWith(`builtin:${slug}.`) &&
      builtinFields.has(fieldPath) &&
      trimmed === `builtin:${slug}.${fieldPath}`;
    const uploaded = /^https:\/\/res\.cloudinary\.com\/[\w-]+\/image\/upload\//.test(trimmed);
    // Compatibilidad con documentos antiguos que ya contenían assets locales.
    const legacyLocal = /^\/(?:static\/media|assets|images)\/[\w./%-]+$/.test(trimmed);
    if (!builtin && !uploaded && !legacyLocal) {
      throw badRequest(`${label}: primero debes subir la imagen`);
    }
  }
  if (rule.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    throw badRequest(`${label}: correo electrónico inválido`);
  }
  if (rule.type === "https") {
    try {
      if (new URL(trimmed).protocol !== "https:") throw new Error("Protocolo inválido");
    } catch {
      throw badRequest(`${label}: se requiere una URL HTTPS válida`);
    }
  }
  if (rule.type === "path" && !ALLOWED_INTERNAL_ROUTES.has(trimmed)) {
    throw badRequest(`${label}: ruta interna no permitida`);
  }
  return trimmed;
}

// Comprueba que se recibió un JSON acotado, conforme al editor de la página.
function readContent(req, slug) {
  if (!req.is("application/json") || !req.body || typeof req.body !== "object" ||
    Array.isArray(req.body) || Object.keys(req.body).some((key) =>
      !["content", "expectedRevision"].includes(key))) {
    throw badRequest("Se espera content y expectedRevision en un objeto JSON");
  }
  const expectedRevision = req.body.expectedRevision;
  if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0) {
    throw badRequest("La revisión del borrador no es válida");
  }
  const raw = JSON.stringify(req.body.content);
  if (!raw || Buffer.byteLength(raw, "utf8") > MAX_CONTENT_BYTES) {
    throw badRequest("El contenido supera el límite de 120 KB");
  }
  const content = validateNode(req.body.content, RULES[slug], slug);
  return { content, expectedRevision };
}

// Comprueba que el slug pertenezca al catálogo administrativo autorizado.
router.param("slug", (req, res, next, slug) => {
  if (!ALLOWED_SLUGS.has(slug)) {
    return res.status(404).json({ success: false, message: "Página no encontrada" });
  }
  return next();
});

// =========================================================
// API PÚBLICA: SOLO TEXTO PUBLICADO EN GOOGLE DRIVE
// =========================================================

// GET /api/informational-pages/:slug
router.get("/:slug", async (req, res, next) => {
  try {
    const result = await informationalPagesDrive.loadPublished(req.params.slug);
    // Nunca se entregan rutas de archivos, IDs de Drive ni credenciales.
    res.set("Cache-Control", "no-store");
    return res.json({
      success: true,
      ...result,
      content: result.content ? validateNode(result.content, RULES[req.params.slug], req.params.slug) : null,
    });
  } catch (error) {
    return next(error);
  }
});

// Estas rutas solo son accesibles con sesión y rol administrativo.
router.use("/admin", authenticateUser, authorizeRoles("admin", "super_admin"));

// GET /api/informational-pages/admin/statuses
router.get("/admin/statuses", async (_req, res, next) => {
  try {
    const pages = await informationalPagesDrive.listStatuses();
    res.set("Cache-Control", "no-store");
    return res.json({ success: true, pages });
  } catch (error) {
    return next(error);
  }
});

// GET /api/informational-pages/admin/:slug
router.get("/admin/:slug", async (req, res, next) => {
  try {
    const result = await informationalPagesDrive.loadAdmin(req.params.slug);
    res.set("Cache-Control", "no-store");
    return res.json({
      success: true,
      ...result,
      draft: result.draft ? validateNode(result.draft, RULES[req.params.slug], req.params.slug) : null,
      published: result.published ? validateNode(result.published, RULES[req.params.slug], req.params.slug) : null,
    });
  } catch (error) {
    return next(error);
  }
});

// PUT /api/informational-pages/admin/:slug/draft
router.put("/admin/:slug/draft", validateRequestOrigin, async (req, res, next) => {
  try {
    // La validación del formulario conserva las reglas de la versión anterior.
    const { content, expectedRevision } = readContent(req, req.params.slug);
    const result = await informationalPagesDrive.saveDraft(
      req.params.slug,
      content,
      expectedRevision,
      req.user?._id
    );
    return res.json({
      success: true,
      message: "Borrador guardado correctamente en Google Drive",
      ...result,
    });
  } catch (error) {
    return next(error);
  }
});

// POST /api/informational-pages/admin/:slug/publish
router.post("/admin/:slug/publish", validateRequestOrigin, async (req, res, next) => {
  try {
    const expectedRevision = req.body?.expectedRevision;
    if (!req.is("application/json") || !Number.isSafeInteger(expectedRevision) ||
      expectedRevision < 1 || Object.keys(req.body || {}).some((key) => key !== "expectedRevision")) {
      throw badRequest("Debes indicar una revisión válida del borrador");
    }
    const result = await informationalPagesDrive.publishDraft(
      req.params.slug,
      expectedRevision,
      req.user?._id
    );
    return res.json({
      success: true,
      message: "Página publicada desde Google Drive",
      ...result,
    });
  } catch (error) {
    return next(error);
  }
});

// =========================================================
// SUBIDA DE IMÁGENES: REUTILIZA CLOUDINARY
// =========================================================

const receiveImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: 1, fields: 0, parts: 1 },
}).single("image");

// Convierte la subida de Multer a un error 400 controlado.
function acceptImage(req, res, next) {
  return receiveImage(req, res, (error) => {
    if (error) return next(badRequest("Imagen inválida o superior a 5 MB"));
    return next();
  });
}

// POST /api/informational-pages/admin/:slug/image
router.post("/admin/:slug/image", validateRequestOrigin, acceptImage, async (req, res, next) => {
  try {
    const uploaded = req.file;
    if (!uploaded?.buffer || uploaded.size > MAX_IMAGE_BYTES) {
      throw badRequest("Selecciona una imagen JPG, PNG o WebP de máximo 5 MB");
    }
    const detected = await fileTypeFromBuffer(uploaded.buffer);
    if (!ALLOWED_IMAGE_TYPES.has(detected?.mime)) {
      throw badRequest("El contenido de la imagen no es JPG, PNG ni WebP válido");
    }
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET) {
      const error = new Error("Cloudinary no está configurado en el backend");
      error.status = 503;
      throw error;
    }

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({
        folder: `el-ancla/informational-pages/${req.params.slug}`,
        public_id: randomUUID(),
        resource_type: "image",
        overwrite: false,
      }, (error, result) => error ? reject(error) : resolve(result));
      stream.end(uploaded.buffer);
    });

    return res.status(201).json({ success: true, url: uploadResult.secure_url });
  } catch (error) {
    return next(error);
  }
});

// POST /api/informational-pages/admin/:slug/images/cleanup
// Únicamente retira archivos recién subidos que NO aparecen en ningún TXT
// del borrador ni de la publicación. Se usa al fallar un guardado.
router.post("/admin/:slug/images/cleanup", validateRequestOrigin, async (req, res, next) => {
  try {
    const urls = req.body?.urls;
    if (!Array.isArray(urls) || urls.length < 1 || urls.length > 20 ||
        urls.some((url) => typeof url !== "string" || url.length > 1000)) {
      throw badRequest("Se necesita una lista válida de imágenes para limpiar");
    }
    const { draft, published } = await informationalPagesDrive.loadAdmin(req.params.slug);
    const result = await cleanupUploadedInformationalImages({
      slug: req.params.slug,
      candidates: urls,
      retained: [draft, published],
    });
    return res.json({ success: true, ...result });
  } catch (error) { return next(error); }
});

export default router;
