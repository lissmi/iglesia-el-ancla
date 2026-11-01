// =========================================================
// API DEL CANCIONERO - IGLESIA EL ANCLA
// Las letras originales y los PDF se guardan en Google Drive.
// MongoDB almacena metadatos e identificadores, NO letras.
// =========================================================

// Definimos endpoints REST con Express.
import { Router } from "express";

// Verificamos identificadores de MongoDB.
import mongoose from "mongoose";

// Generamos nombres únicos para evitar colisiones.
import { randomUUID } from "node:crypto";

// Transmitimos PDFs al navegador sin guardarlos en disco.
import { pipeline } from "node:stream/promises";

// Reutilizamos la autenticación y los permisos ya implementados.
import authenticateUser from "../middleware/authenticateUser.js";
import authorizeRoles from "../middleware/authorizeRoles.js";

// Importamos el modelo y las categorías oficiales.
import Song, { SONG_CATEGORIES } from "../models/Song.js";

// Generamos el PDF a partir del texto escrito en React.
import { buildSongPdf } from "../services/songbook/songPdfService.js";

// Reutilizamos las operaciones de Drive en un servicio independiente.
import {
    uploadSongFile,
    getSongFileStream,
    readSongSource,
    deleteSongFile,
} from "../services/songbook/songDriveService.js";

// Creamos el router del cancionero.
const router = Router();

// Los tres tipos de usuario pueden consultar letras y PDF.
const readerRoles = ["member", "admin", "super_admin"];

// Crear, editar y eliminar exige permisos administrativos.
const writerRoles = ["admin", "super_admin"];

// Lista de orígenes permitidos para operaciones que modifican datos.
const allowedOrigins = new Set(
    ["http://localhost:3000", "https://iglesia-el-ancla.vercel.app",
        process.env.FRONTEND_URL, process.env.FRONTEND_URL_PRODUCTION]
        .filter(Boolean)
        .flatMap((value) => value.split(","))
        .map((value) => value.trim())
        .flatMap((value) => {
            try { return [new URL(value).origin]; } catch { return []; }
        })
);

// Comprobamos Origin como defensa complementaria para sesiones con cookies.
function validateOrigin(req, res, next) {
    if (!allowedOrigins.has(req.get("Origin"))) {
        return res.status(403).json({ success: false, message: "Origen no autorizado" });
    }
    next();
}

// Escapamos símbolos especiales introducidos en el buscador.
function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Validamos los datos tanto para crear como para editar canciones.
function validateInput(body) {
    // Exigimos un objeto JSON con los campos del formulario.
    if (!body || typeof body !== "object" || Array.isArray(body)) return null;

    // Rechazamos propiedades inesperadas.
    if (Object.keys(body).some((key) => !["title", "author", "category", "lyrics"].includes(key))) return null;

    // Comprobamos los tipos antes de llamar a métodos de texto.
    if (typeof body.title !== "string" || typeof body.lyrics !== "string") return null;
    if (body.author !== undefined && typeof body.author !== "string") return null;
    if (body.category !== undefined && typeof body.category !== "string") return null;

    // Eliminamos solo espacios exteriores, manteniendo estrofas y coros.
    const title = body.title.trim();
    const author = (body.author ?? "").trim();
    const category = (body.category ?? "General").trim();
    const lyrics = body.lyrics.replace(/\r\n/g, "\n").trim();

    // Limitamos los datos para evitar documentos enormes y abuso.
    if (!title || title.length > 160 || author.length > 160 ||
        !lyrics || lyrics.length > 15000 || !SONG_CATEGORIES.includes(category)) return null;

    // Devolvemos un objeto normalizado y validado.
    return { title, author, category, lyrics };
}

// Convertimos un registro de Mongoose en metadatos visibles.
function serializeSong(song) {
    return {
        _id: song._id,
        title: song.title,
        author: song.author,
        category: song.category,
        createdAt: song.createdAt,
        updatedAt: song.updatedAt,
    };
}

// Preparamos nombres legibles para almacenamiento y descarga.
function safeFilename(title) {
    return title.replace(/[\\/<>:"|?*\x00-\x1F]/g, "").trim().slice(0, 80) || "Cancion";
}

// Subimos el PDF generado y su TXT editable a Google Drive.
async function uploadSongDocuments(data) {
    // Acumulamos identificadores para limpiar subidas incompletas.
    const fileIds = [];

    try {
        // Generamos el PDF con el diseño de la iglesia.
        const pdfBuffer = await buildSongPdf(data);

        // Creamos un sufijo único para los nombres de los archivos.
        const name = `${safeFilename(data.title)}-${randomUUID().slice(0, 8)}`;

        // Guardamos el PDF que leerán y descargarán los miembros.
        const pdfFileId = await uploadSongFile(pdfBuffer, `${name}.pdf`, "application/pdf");
        fileIds.push(pdfFileId);

        // Guardamos una copia pequeña de texto para futuras ediciones.
        const sourceFileId = await uploadSongFile(
            Buffer.from(data.lyrics, "utf8"), `${name}.txt`, "text/plain"
        );
        fileIds.push(sourceFileId);

        // Devolvemos exclusivamente los identificadores de Drive.
        return { pdfFileId, sourceFileId };
    } catch (error) {
        // Eliminamos cualquier archivo creado si falla la segunda subida.
        await Promise.allSettled(fileIds.map(deleteSongFile));
        throw error;
    }
}

// Todas las rutas exigen sesión activa, incluidos los PDF.
router.use(authenticateUser);

// =========================================================
// GET /api/songbook/songs?q=...&category=...&page=...
// =========================================================
router.get("/", authorizeRoles(...readerRoles), async (req, res, next) => {
    try {
        // Leemos y limitamos el término de búsqueda.
        const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
        if (q.length > 80) return res.status(400).json({ success: false, message: "Búsqueda demasiado larga" });

        // Validamos la categoría solicitada.
        const category = req.query.category ?? "Todos";
        if (typeof category !== "string" || (category !== "Todos" && !SONG_CATEGORIES.includes(category))) {
            return res.status(400).json({ success: false, message: "Categoría no válida" });
        }

        // Limitamos la paginación para no devolver grandes catálogos.
        const requestedPage = Number(req.query.page);
        const page = Number.isSafeInteger(requestedPage) && requestedPage >= 1
            ? Math.min(requestedPage, 10000) : 1;
        const limit = 12;

        // Filtramos por categoría, título y autor, nunca por letra en MongoDB.
        const filter = {};
        if (category !== "Todos") filter.category = category;
        if (q) {
            const regex = new RegExp(escapeRegex(q), "i");
            filter.$or = [{ title: regex }, { author: regex }];
        }

        // Consultamos el total y solamente los metadatos públicos.
        const total = await Song.countDocuments(filter);
        const songs = await Song.find(filter)
            .select("title author category createdAt updatedAt")
            .sort({ title: 1, _id: 1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        // Evitamos que intermediarios guarden el catálogo privado.
        res.set("Cache-Control", "private, no-store");
        return res.json({ success: true, songs, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
    } catch (error) { next(error); }
});

// =========================================================
// GET /api/songbook/songs/:id/edit
// Solo administradores: recupera el texto fuente desde Drive.
// =========================================================
router.get("/:id/edit", authorizeRoles(...writerRoles), async (req, res, next) => {
    try {
        // Verificamos el ID antes de consultar la base de datos.
        if (!mongoose.isObjectIdOrHexString(req.params.id)) {
            return res.status(400).json({ success: false, message: "Identificador inválido" });
        }

        // Solicitamos el ID privado del archivo TXT original.
        const song = await Song.findById(req.params.id).select("+sourceFileId");
        if (!song) return res.status(404).json({ success: false, message: "Canción no encontrada" });

        // Recuperamos la letra desde Google Drive, no desde MongoDB.
        const lyrics = await readSongSource(song.sourceFileId);

        // Entregamos al editor los textos que puede modificar.
        res.set("Cache-Control", "private, no-store");
        return res.json({ success: true, song: { ...serializeSong(song), lyrics } });
    } catch (error) { next(error); }
});

// =========================================================
// GET /api/songbook/songs/:id/lyrics
// Permite leer la canción en React sin descargar su PDF.
// =========================================================
router.get("/:id/lyrics", authorizeRoles(...readerRoles), async (req, res, next) => {
    try {
        // Validamos el ID del libro de canciones antes de consultar MongoDB.
        if (!mongoose.isObjectIdOrHexString(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Identificador inválido",
            });
        }

        // Recuperamos únicamente la referencia privada del TXT almacenado.
        const song = await Song.findById(req.params.id).select("+sourceFileId");

        // No entregamos contenido si la canción ya no existe.
        if (!song) {
            return res.status(404).json({
                success: false,
                message: "Canción no encontrada",
            });
        }

        // Reutilizamos la función que lee el TXT original desde Drive.
        // Tiene un límite de bytes y conserva los saltos de línea.
        const lyrics = await readSongSource(song.sourceFileId);

        // Evitamos que navegadores y cachés compartidas almacenen la letra.
        res.set("Cache-Control", "private, no-store");
        res.set("X-Content-Type-Options", "nosniff");

        // No exponemos los IDs privados ni las credenciales institucionales.
        return res.status(200).json({
            success: true,
            lyrics,
        });
    } catch (error) {
        // Delegamos errores de Drive o MongoDB al controlador general.
        next(error);
    }
});

// =========================================================
// GET /api/songbook/songs/:id/pdf?download=1
// Devuelve el PDF en línea o como descarga autenticada.
// =========================================================
router.get("/:id/pdf", authorizeRoles(...readerRoles), async (req, res, next) => {
    try {
        // Verificamos el identificador del registro.
        if (!mongoose.isObjectIdOrHexString(req.params.id)) {
            return res.status(400).json({ success: false, message: "Identificador inválido" });
        }

        // Recuperamos el identificador privado del PDF.
        const song = await Song.findById(req.params.id).select("+pdfFileId");
        if (!song) return res.status(404).json({ success: false, message: "Canción no encontrada" });

        // Obtenemos el archivo mediante el OAuth del backend.
        const source = await getSongFileStream(song.pdfFileId);

        // Configuramos el nombre y el modo de visualización o descarga.
        const filename = `${safeFilename(song.title)}.pdf`;
        const disposition = req.query.download === "1" ? "attachment" : "inline";

        // Cabeceras para no exponer PDFs privados a cachés compartidas.
        res.set("Cache-Control", "private, no-store");
        res.set("X-Content-Type-Options", "nosniff");
        res.set("Content-Type", "application/pdf");
        res.set("Content-Disposition", `${disposition}; filename="${filename.replace(/[^\x20-\x7E]/g, "_")}"; filename*=UTF-8''${encodeURIComponent(filename)}`);

        // Transmitimos el PDF desde Drive al navegador.
        await pipeline(source, res);
    } catch (error) {
        // Si ya enviamos contenido, cerramos la descarga fallida.
        if (res.headersSent || res.destroyed) {
            if (!res.destroyed) res.destroy(error);
            return;
        }
        next(error);
    }
});

// =========================================================
// POST /api/songbook/songs - PUBLICAR NUEVA CANCIÓN
// =========================================================
router.post("/", authorizeRoles(...writerRoles), validateOrigin, async (req, res, next) => {
    // Conservar identificadores permite revertir fallos de MongoDB.
    let uploaded = null;
    let created = null;

    try {
        // Validamos título, autor, categoría y letra.
        const data = validateInput(req.body);
        if (!data) return res.status(400).json({ success: false, message: "Datos de canción inválidos" });

        // Generamos y subimos los dos archivos a Drive.
        uploaded = await uploadSongDocuments(data);

        // MongoDB recibe únicamente los metadatos y los IDs.
        created = await Song.create({
            title: data.title,
            author: data.author,
            category: data.category,
            ...uploaded,
            createdBy: req.user._id,
        });

        // Respondemos sin exponer los IDs privados.
        res.set("Cache-Control", "private, no-store");
        return res.status(201).json({ success: true, message: "Canción publicada correctamente", song: serializeSong(created) });
    } catch (error) {
        // Si MongoDB falló, retiramos ambos archivos recién creados.
        if (uploaded && !created) {
            const cleanup = await Promise.allSettled([
                deleteSongFile(uploaded.pdfFileId),
                deleteSongFile(uploaded.sourceFileId),
            ]);
            cleanup.forEach((result) => {
                if (result.status === "rejected") console.error("Error limpiando archivos de canción:", result.reason?.message);
            });
        }
        next(error);
    }
});

// =========================================================
// PATCH /api/songbook/songs/:id - REEMPLAZAR PDF Y LETRA
// =========================================================
router.patch("/:id", authorizeRoles(...writerRoles), validateOrigin, async (req, res, next) => {
    let uploaded = null;
    let saved = false;

    try {
        // Comprobamos que el registro y formulario sean válidos.
        if (!mongoose.isObjectIdOrHexString(req.params.id)) {
            return res.status(400).json({ success: false, message: "Identificador inválido" });
        }
        const data = validateInput(req.body);
        if (!data) return res.status(400).json({ success: false, message: "Datos de canción inválidos" });

        // Recuperamos referencias de los archivos anteriores.
        const current = await Song.findById(req.params.id).select("+pdfFileId +sourceFileId");
        if (!current) return res.status(404).json({ success: false, message: "Canción no encontrada" });

        // Generamos la versión PDF y TXT actualizada.
        uploaded = await uploadSongDocuments(data);

        // Actualizamos datos y referencias antes de limpiar versiones antiguas.
        const updated = await Song.findByIdAndUpdate(req.params.id, {
            title: data.title,
            author: data.author,
            category: data.category,
            ...uploaded,
        }, { new: true, runValidators: true });
        // Si desapareció el registro durante la edición, limpiamos los archivos nuevos.
        if (!updated) {
            const conflict = new Error("La canción ya no está disponible para editar");
            conflict.status = 409;
            throw conflict;
        }
        saved = true;

        // Después del guardado, retiramos los archivos reemplazados.
        const cleanup = await Promise.allSettled([
            deleteSongFile(current.pdfFileId),
            deleteSongFile(current.sourceFileId),
        ]);

        // Advertimos si algún proveedor no pudo retirar la versión anterior.
        const warning = cleanup.some((result) => result.status === "rejected");
        if (warning) console.error("Hay archivos anteriores del cancionero pendientes de limpieza");

        // Comunicamos que se actualizó, con advertencia si aplica.
        return res.json({
            success: true,
            message: warning
                ? "Canción actualizada. Hay archivos anteriores pendientes de limpieza."
                : "Canción actualizada correctamente",
            cleanupWarning: warning,
            song: serializeSong(updated),
        });
    } catch (error) {
        // Si MongoDB no llegó a actualizarse, borramos los archivos nuevos.
        if (uploaded && !saved) {
            await Promise.allSettled([
                deleteSongFile(uploaded.pdfFileId),
                deleteSongFile(uploaded.sourceFileId),
            ]);
        }
        next(error);
    }
});

// =========================================================
// DELETE /api/songbook/songs/:id - ELIMINACIÓN DEFINITIVA
// =========================================================
router.delete("/:id", authorizeRoles(...writerRoles), validateOrigin, async (req, res, next) => {
    try {
        // Validamos el identificador antes de consultar la canción.
        if (!mongoose.isObjectIdOrHexString(req.params.id)) {
            return res.status(400).json({ success: false, message: "Identificador inválido" });
        }

        // Recuperamos las referencias privadas del documento y texto.
        const song = await Song.findById(req.params.id).select("+pdfFileId +sourceFileId");
        if (!song) return res.status(404).json({ success: false, message: "Canción no encontrada" });

        // Intentamos borrar ambos archivos y permitimos reintentar si falla uno.
        const results = await Promise.allSettled([
            deleteSongFile(song.pdfFileId),
            deleteSongFile(song.sourceFileId),
        ]);

        // Conservamos el registro si algún archivo no pudo limpiarse.
        if (results.some((result) => result.status === "rejected")) {
            console.error("No fue posible limpiar todos los archivos de la canción");
            return res.status(502).json({
                success: false,
                message: "No se pudo completar la eliminación. Intenta nuevamente.",
            });
        }

        // Borramos de MongoDB solo después de limpiar Drive.
        await Song.findByIdAndDelete(req.params.id);

        // Informamos el resultado sin revelar el proveedor de almacenamiento.
        return res.json({ success: true, message: "Canción eliminada correctamente" });
    } catch (error) { next(error); }
});

// Exportamos el módulo para registrarlo en app.js.
export default router;
