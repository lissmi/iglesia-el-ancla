
/* =========================================================
   API DEL CANCIONERO - IGLESIA EL ANCLA
   Archivo: backend/src/routes/songRoutes.js

   - MongoDB almacena metadatos y referencias privadas.
   - Google Drive almacena los PDF y archivos TXT.
   - Spotify es un enlace opcional, no un archivo de audio.
   - Los miembros pueden consultar letras y descargar PDF.
   - Administradores pueden crear, editar y eliminar canciones.
========================================================= */

// Importamos Express para definir los endpoints REST.
import { Router } from "express";

// Mongoose permite validar identificadores de MongoDB.
import mongoose from "mongoose";

// Generamos nombres únicos para los documentos de Drive.
import { randomUUID } from "node:crypto";

// Transmitimos los PDF sin guardarlos en el servidor.
import { pipeline } from "node:stream/promises";

// Reutilizamos la autenticación del proyecto.
import authenticateUser from "../middleware/authenticateUser.js";

// Reutilizamos la autorización por roles.
import authorizeRoles from "../middleware/authorizeRoles.js";

// Importamos el modelo y las categorías oficiales.
import Song, { SONG_CATEGORIES } from "../models/Song.js";

// Registramos las eliminaciones en el historial administrativo.
import { deleteResourceWithAudit } from "../services/audit/deletionService.js";

// Servicio existente que genera el PDF de cada canción.
import { buildSongPdf } from "../services/songbook/songPdfService.js";

// Servicios existentes para trabajar con Google Drive.
import {
    uploadSongFile,
    getSongFileStream,
    readSongSource,
    deleteSongFile,
} from "../services/songbook/songDriveService.js";

// Creamos el router principal.
const router = Router();

// Miembros y administradores pueden consultar el cancionero.
const readerRoles = ["member", "admin", "super_admin"];

// Solamente administradores pueden modificar canciones.
const writerRoles = ["admin", "super_admin"];


/* =========================================================
   PROTECCIÓN DE ORIGEN
========================================================= */

// Construimos la lista de orígenes autorizados.
const allowedOrigins = new Set(
    [
        "http://localhost:3000",
        "https://iglesia-el-ancla.vercel.app",
        process.env.FRONTEND_URL,
        process.env.FRONTEND_URL_PRODUCTION,
    ]
        // Ignoramos variables vacías.
        .filter(Boolean)

        // Permitimos varias direcciones separadas por coma.
        .flatMap((value) => value.split(","))

        // Eliminamos espacios innecesarios.
        .map((value) => value.trim())

        // Normalizamos las direcciones autorizadas.
        .flatMap((value) => {
            try {
                return [new URL(value).origin];
            } catch {
                return [];
            }
        })
);

// Protegemos las operaciones con cookies contra orígenes no autorizados.
function validateOrigin(req, res, next) {

    // Consultamos el origen enviado por el navegador.
    const origin = req.get("Origin");

    // Rechazamos solicitudes cuyo origen no esté autorizado.
    if (!allowedOrigins.has(origin)) {
        return res.status(403).json({
            success: false,
            message: "Origen no autorizado",
        });
    }

    // Continuamos con la operación.
    return next();
}


/* =========================================================
   UTILIDADES GENERALES
========================================================= */

// Escapamos caracteres especiales usados en expresiones regulares.
function escapeRegex(value) {

    // Impedimos que el buscador interprete patrones arbitrarios.
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Preparamos nombres seguros para archivos PDF y TXT.
function safeFilename(title) {

    // Quitamos símbolos que pueden ocasionar problemas.
    return (
        title
            .replace(/[\\/<>:"|?*\x00-\x1F]/g, "")
            .trim()
            .slice(0, 80) || "Cancion"
    );
}


/* =========================================================
   VALIDACIÓN DE ENLACES DE SPOTIFY
========================================================= */

// Comprobamos y normalizamos enlaces oficiales de pistas.
function normalizeSpotifyTrackUrl(value) {

    // La canción puede publicarse sin Spotify.
    if (value === undefined || value === "") {
        return "";
    }

    // El enlace debe ser texto y respetar el límite del modelo.
    if (
        typeof value !== "string" ||
        value.length > 300
    ) {
        return null;
    }

    // Eliminamos espacios al principio y al final.
    const text = value.trim();

    // Un campo vacío representa ausencia de enlace.
    if (!text) {
        return "";
    }

    try {

        // Interpretamos el enlace mediante URL.
        const url = new URL(text);

        // Aceptamos enlaces normales y enlaces regionales.
        // Ejemplo: /track/ID o /intl-es/track/ID.
        const match = url.pathname.match(
            /^\/(?:intl-[a-z]{2}(?:-[a-z]{2})?\/)?track\/([a-zA-Z0-9]{22})\/?$/
        );

        // Validamos el protocolo, dominio y formato de pista.
        if (
            url.protocol !== "https:" ||
            url.hostname !== "open.spotify.com" ||
            url.port ||
            url.username ||
            url.password ||
            !match
        ) {
            return null;
        }

        // Guardamos solamente el enlace normalizado.
        // Eliminamos parámetros de seguimiento innecesarios.
        return `https://open.spotify.com/track/${match[1]}`;

    } catch {

        // Rechazamos direcciones que no sean URL válidas.
        return null;
    }
}


/* =========================================================
   VALIDACIÓN DEL FORMULARIO DE CANCIONES
========================================================= */

// Validamos y normalizamos los datos recibidos desde React.
function validateInput(body) {

    // Exigimos un objeto JSON.
    if (
        !body ||
        typeof body !== "object" ||
        Array.isArray(body)
    ) {
        return null;
    }

    // Campos que el administrador está autorizado a enviar.
    const allowedFields = [
        "title",
        "author",
        "category",
        "lyrics",
        "spotifyUrl",
    ];

    // Rechazamos propiedades desconocidas.
    if (
        Object.keys(body).some(
            (key) => !allowedFields.includes(key)
        )
    ) {
        return null;
    }

    // El título y la letra son obligatorios y deben ser texto.
    if (
        typeof body.title !== "string" ||
        typeof body.lyrics !== "string"
    ) {
        return null;
    }

    // El autor opcional debe ser texto cuando exista.
    if (
        body.author !== undefined &&
        typeof body.author !== "string"
    ) {
        return null;
    }

    // La categoría debe ser texto cuando se envíe.
    if (
        body.category !== undefined &&
        typeof body.category !== "string"
    ) {
        return null;
    }

    // Normalizamos el título.
    const title = body.title.trim();

    // Normalizamos el autor opcional.
    const author = (body.author ?? "").trim();

    // Utilizamos General cuando no se indicó una categoría.
    const category = (body.category ?? "General").trim();

    // Conservamos los saltos de línea de las letras.
    const lyrics = body.lyrics
        .replace(/\r\n/g, "\n")
        .trim();

    // Comprobamos el enlace opcional de Spotify.
    const spotifyUrl = normalizeSpotifyTrackUrl(
        body.spotifyUrl
    );

    // Validamos los límites y categorías permitidas.
    if (
        !title ||
        title.length > 160 ||
        author.length > 160 ||
        !lyrics ||
        lyrics.length > 15000 ||
        !SONG_CATEGORIES.includes(category)
    ) {
        return null;
    }

    // Rechazamos específicamente enlaces de Spotify inválidos.
    if (spotifyUrl === null) {

        // Preparamos un mensaje comprensible para el formulario.
        const error = new Error(
            "Ingresa un enlace HTTPS de una pista de Spotify (open.spotify.com/track/...)."
        );

        // Indicamos que el problema está en los datos recibidos.
        error.status = 400;

        // Delegamos el tratamiento al controlador.
        throw error;
    }

    // Entregamos los valores validados y normalizados.
    return {
        title,
        author,
        category,
        lyrics,

        // La ausencia del campo mantiene compatibilidad
        // con clientes que aún no utilizan Spotify.
        ...(Object.hasOwn(body, "spotifyUrl")
            ? { spotifyUrl }
            : {}),
    };
}


/* =========================================================
   SERIALIZACIÓN SEGURA
========================================================= */

// Preparamos los metadatos visibles para React.
function serializeSong(song) {

    // Nunca enviamos los identificadores privados de Drive.
    return {
        _id: song._id,
        title: song.title,
        author: song.author,
        category: song.category,

        // El enlace aparece vacío cuando no está configurado.
        spotifyUrl: song.spotifyUrl || "",

        // Conservamos las fechas para el catálogo.
        createdAt: song.createdAt,
        updatedAt: song.updatedAt,
    };
}


/* =========================================================
   GENERACIÓN Y SUBIDA DE DOCUMENTOS A GOOGLE DRIVE
========================================================= */

// Generamos el PDF y almacenamos una copia TXT editable.
async function uploadSongDocuments(data) {

    // Guardamos identificadores para limpiar subidas incompletas.
    const fileIds = [];

    try {

        // Generamos el PDF con el diseño institucional.
        const pdfBuffer = await buildSongPdf(data);

        // Construimos un nombre único para los archivos.
        const name =
            `${safeFilename(data.title)}-${randomUUID().slice(0, 8)}`;

        // Subimos el PDF a Google Drive.
        const pdfFileId = await uploadSongFile(
            pdfBuffer,
            `${name}.pdf`,
            "application/pdf"
        );

        // Conservamos el identificador para posibles reversiones.
        fileIds.push(pdfFileId);

        // Generamos la copia TXT con la letra original.
        const sourceBuffer = Buffer.from(
            data.lyrics,
            "utf8"
        );

        // Subimos el TXT a Google Drive.
        const sourceFileId = await uploadSongFile(
            sourceBuffer,
            `${name}.txt`,
            "text/plain"
        );

        // Conservamos también el identificador del TXT.
        fileIds.push(sourceFileId);

        // Retornamos solamente los identificadores de Drive.
        return {
            pdfFileId,
            sourceFileId,
        };

    } catch (error) {

        // Si falla una subida, retiramos los archivos ya creados.
        await Promise.allSettled(
            fileIds.map(deleteSongFile)
        );

        // Propagamos el error original.
        throw error;
    }
}


/* =========================================================
   AUTENTICACIÓN GENERAL DEL CANCIONERO
========================================================= */

// Todas las rutas del cancionero requieren sesión activa.
router.use(authenticateUser);


/* =========================================================
   GET /api/songbook/songs
   CONSULTA DEL CATÁLOGO
========================================================= */

// Devuelve canciones paginadas y filtradas por categoría.
router.get(
    "/",
    authorizeRoles(...readerRoles),

    async (req, res, next) => {
        try {

            // Recuperamos el término de búsqueda.
            const q =
                typeof req.query.q === "string"
                    ? req.query.q.trim()
                    : "";

            // Limitamos el tamaño del buscador.
            if (q.length > 80) {
                return res.status(400).json({
                    success: false,
                    message: "Búsqueda demasiado larga",
                });
            }

            // Recuperamos la categoría seleccionada.
            const category =
                req.query.category ?? "Todos";

            // Solo admitimos categorías conocidas.
            if (
                typeof category !== "string" ||
                (
                    category !== "Todos" &&
                    !SONG_CATEGORIES.includes(category)
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Categoría no válida",
                });
            }

            // Convertimos la página solicitada en un número.
            const requestedPage = Number(req.query.page);

            // Limitamos las páginas a enteros positivos.
            const page =
                Number.isSafeInteger(requestedPage) &&
                requestedPage >= 1
                    ? Math.min(requestedPage, 10000)
                    : 1;

            // Cantidad máxima de canciones por página.
            const limit = 12;

            // Construimos los filtros de MongoDB.
            const filter = {};

            // Aplicamos la categoría cuando no sea Todos.
            if (category !== "Todos") {
                filter.category = category;
            }

            // Aplicamos la búsqueda por título o autor.
            if (q) {

                // Interpretamos el texto literalmente.
                const regex = new RegExp(
                    escapeRegex(q),
                    "i"
                );

                // Solo buscamos metadatos, nunca la letra.
                filter.$or = [
                    { title: regex },
                    { author: regex },
                ];
            }

            // Consultamos la cantidad de canciones.
            const total = await Song.countDocuments(filter);

            // Recuperamos únicamente los metadatos necesarios.
            const songs = await Song.find(filter)

                // Incluimos el nuevo enlace opcional.
                .select(
                    "title author category spotifyUrl createdAt updatedAt"
                )

                // Ordenamos alfabéticamente.
                .sort({
                    title: 1,
                    _id: 1,
                })

                // Saltamos las páginas anteriores.
                .skip((page - 1) * limit)

                // Limitamos la respuesta.
                .limit(limit)

                // Recuperamos objetos simples.
                .lean();

            // Evitamos almacenar este catálogo privado en caché.
            res.set(
                "Cache-Control",
                "private, no-store"
            );

            // Enviamos el catálogo y su paginación.
            return res.json({
                success: true,
                songs,
                total,
                page,
                pages: Math.max(
                    1,
                    Math.ceil(total / limit)
                ),
            });

        } catch (error) {

            // Enviamos errores al middleware general.
            return next(error);
        }
    }
);


/* =========================================================
   GET /api/songbook/songs/:id/edit
   RECUPERACIÓN DE DATOS PARA ADMINISTRADORES
========================================================= */

router.get(
    "/:id/edit",
    authorizeRoles(...writerRoles),

    async (req, res, next) => {
        try {

            // Validamos el identificador de MongoDB.
            if (
                !mongoose.isObjectIdOrHexString(req.params.id)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Identificador inválido",
                });
            }

            // Consultamos la canción y su referencia privada al TXT.
            const song = await Song.findById(
                req.params.id
            ).select("+sourceFileId");

            // Confirmamos que existe la canción.
            if (!song) {
                return res.status(404).json({
                    success: false,
                    message: "Canción no encontrada",
                });
            }

            // Recuperamos la letra desde Google Drive.
            const lyrics = await readSongSource(
                song.sourceFileId
            );

            // Evitamos almacenar los datos de edición en caché.
            res.set(
                "Cache-Control",
                "private, no-store"
            );

            // Enviamos metadatos, Spotify y letra.
            return res.json({
                success: true,
                song: {
                    ...serializeSong(song),
                    lyrics,
                },
            });

        } catch (error) {
            return next(error);
        }
    }
);


/* =========================================================
   GET /api/songbook/songs/:id/lyrics
   LECTURA DE LETRAS PARA MIEMBROS
========================================================= */

router.get(
    "/:id/lyrics",
    authorizeRoles(...readerRoles),

    async (req, res, next) => {
        try {

            // Validamos el identificador de la canción.
            if (
                !mongoose.isObjectIdOrHexString(req.params.id)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Identificador inválido",
                });
            }

            // Consultamos la referencia del TXT privado.
            const song = await Song.findById(
                req.params.id
            ).select("+sourceFileId");

            // Confirmamos que la canción esté disponible.
            if (!song) {
                return res.status(404).json({
                    success: false,
                    message: "Canción no encontrada",
                });
            }

            // Recuperamos la letra desde Google Drive.
            const lyrics = await readSongSource(
                song.sourceFileId
            );

            // Impedimos almacenar letras en cachés compartidas.
            res.set(
                "Cache-Control",
                "private, no-store"
            );

            // Impedimos que el navegador interprete otro tipo de contenido.
            res.set(
                "X-Content-Type-Options",
                "nosniff"
            );

            // Devolvemos la letra conservando saltos de línea.
            return res.status(200).json({
                success: true,
                lyrics,
            });

        } catch (error) {

            // Delegamos errores de MongoDB o Google Drive.
            return next(error);
        }
    }
);


/* =========================================================
   GET /api/songbook/songs/:id/pdf?download=1
   LECTURA Y DESCARGA DEL PDF
========================================================= */

router.get(
    "/:id/pdf",
    authorizeRoles(...readerRoles),

    async (req, res, next) => {
        try {

            // Validamos el identificador solicitado.
            if (
                !mongoose.isObjectIdOrHexString(req.params.id)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Identificador inválido",
                });
            }

            // Recuperamos la referencia privada del PDF.
            const song = await Song.findById(
                req.params.id
            ).select("+pdfFileId");

            // Respondemos si el documento no está disponible.
            if (!song) {
                return res.status(404).json({
                    success: false,
                    message: "Canción no encontrada",
                });
            }

            // Solicitamos el flujo del PDF a Google Drive.
            const source = await getSongFileStream(
                song.pdfFileId
            );

            // Generamos el nombre que recibirá el navegador.
            const filename =
                `${safeFilename(song.title)}.pdf`;

            // Determinamos si se descarga o se abre en línea.
            const disposition =
                req.query.download === "1"
                    ? "attachment"
                    : "inline";

            // Deshabilitamos la caché del PDF privado.
            res.set(
                "Cache-Control",
                "private, no-store"
            );

            // Impedimos interpretaciones incorrectas del contenido.
            res.set(
                "X-Content-Type-Options",
                "nosniff"
            );

            // Indicamos que el archivo es un PDF.
            res.set(
                "Content-Type",
                "application/pdf"
            );

            // Configuramos nombre compatible con caracteres internacionales.
            res.set(
                "Content-Disposition",
                `${disposition}; filename="${filename.replace(/[^\x20-\x7E]/g, "_")}"; filename*=UTF-8''${encodeURIComponent(filename)}`
            );

            // Enviamos el PDF en streaming.
            await pipeline(source, res);

        } catch (error) {

            // Una descarga iniciada no puede responder con JSON.
            if (
                res.headersSent ||
                res.destroyed
            ) {

                // Cerramos la conexión si todavía está abierta.
                if (!res.destroyed) {
                    res.destroy(error);
                }

                return;
            }

            // Si aún no enviamos contenido, delegamos el error.
            return next(error);
        }
    }
);


/* =========================================================
   POST /api/songbook/songs
   PUBLICACIÓN DE UNA CANCIÓN
========================================================= */

router.post(
    "/",
    authorizeRoles(...writerRoles),
    validateOrigin,

    async (req, res, next) => {

        // Identificadores de los archivos recién subidos.
        let uploaded = null;

        // Documento guardado en MongoDB.
        let created = null;

        try {

            // Validamos título, autor, categoría, letra y Spotify.
            const data = validateInput(req.body);

            // Rechazamos formularios inválidos.
            if (!data) {
                return res.status(400).json({
                    success: false,
                    message: "Datos de canción inválidos",
                });
            }

            // Generamos y subimos PDF y TXT a Drive.
            uploaded = await uploadSongDocuments(data);

            // Guardamos únicamente metadatos y referencias.
            created = await Song.create({

                // Información principal de la canción.
                title: data.title,
                author: data.author,
                category: data.category,

                // Guardamos Spotify solo cuando existe un enlace.
                ...(data.spotifyUrl
                    ? { spotifyUrl: data.spotifyUrl }
                    : {}),

                // Guardamos los identificadores privados de Drive.
                ...uploaded,

                // El creador se obtiene desde la sesión.
                createdBy: req.user._id,
            });

            // Evitamos la caché de información administrativa.
            res.set(
                "Cache-Control",
                "private, no-store"
            );

            // Confirmamos la publicación.
            return res.status(201).json({
                success: true,
                message: "Canción publicada correctamente",
                song: serializeSong(created),
            });

        } catch (error) {

            // Si MongoDB falló, retiramos los archivos recién subidos.
            if (uploaded && !created) {

                // Intentamos eliminar el PDF y el TXT.
                const cleanup = await Promise.allSettled([
                    deleteSongFile(uploaded.pdfFileId),
                    deleteSongFile(uploaded.sourceFileId),
                ]);

                // Registramos las limpiezas que fallaron.
                cleanup.forEach((result) => {
                    if (result.status === "rejected") {
                        console.error(
                            "Error limpiando archivos de canción:",
                            result.reason?.message
                        );
                    }
                });
            }

            // Propagamos el error original.
            return next(error);
        }
    }
);


/* =========================================================
   PATCH /api/songbook/songs/:id
   EDICIÓN DE CANCIÓN Y ENLACE DE SPOTIFY
========================================================= */

router.patch(
    "/:id",
    authorizeRoles(...writerRoles),
    validateOrigin,

    async (req, res, next) => {

        // Referencias de los archivos nuevos.
        let uploaded = null;

        // Indicador de que MongoDB confirmó la actualización.
        let saved = false;

        try {

            // Validamos el identificador de la canción.
            if (
                !mongoose.isObjectIdOrHexString(req.params.id)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Identificador inválido",
                });
            }

            // Validamos todos los datos enviados.
            const data = validateInput(req.body);

            // Evitamos procesar formularios inválidos.
            if (!data) {
                return res.status(400).json({
                    success: false,
                    message: "Datos de canción inválidos",
                });
            }

            // Identificamos al administrador autenticado.
            const adminId =
                req.user?._id || req.user?.id;

            // Verificamos que su identificador sea válido.
            if (!mongoose.isValidObjectId(adminId)) {
                return res.status(401).json({
                    success: false,
                    message: "No se pudo identificar al administrador",
                });
            }

            // Recuperamos la canción y sus referencias anteriores.
            const current = await Song.findById(
                req.params.id
            ).select("+pdfFileId +sourceFileId");

            // Respondemos si la canción no existe.
            if (!current) {
                return res.status(404).json({
                    success: false,
                    message: "Canción no encontrada",
                });
            }

            // Generamos las versiones nuevas del PDF y TXT.
            uploaded = await uploadSongDocuments(data);

            // =================================================
            // PREPARAR ACTUALIZACIÓN DE METADATOS
            // =================================================

            // Construimos los cambios autorizados.
            const changes = {
                $set: {

                    // Información de la canción.
                    title: data.title,
                    author: data.author,
                    category: data.category,

                    // Nuevas referencias de Google Drive.
                    ...uploaded,

                    // Registramos al último editor.
                    updatedBy: adminId,
                },
            };

            // =================================================
            // ACTUALIZAR SPOTIFY CUANDO SE ENVÍE EL CAMPO
            // =================================================

            // Un cliente anterior puede no enviar spotifyUrl.
            // En ese caso conservamos el enlace que ya exista.
            if (Object.hasOwn(data, "spotifyUrl")) {

                // Si el administrador proporcionó un enlace.
                if (data.spotifyUrl) {

                    // Guardamos la URL previamente validada.
                    changes.$set.spotifyUrl =
                        data.spotifyUrl;

                } else {

                    // Si dejó el campo vacío, eliminamos el dato.
                    // Así MongoDB no guarda cadenas vacías.
                    changes.$unset = {
                        spotifyUrl: 1,
                    };
                }
            }

            // =================================================
            // GUARDAR CAMBIOS EN MONGODB
            // =================================================

            // Actualizamos la canción y validamos sus campos.
            const updated = await Song.findByIdAndUpdate(
                req.params.id,
                changes,
                {
                    new: true,
                    runValidators: true,
                }
            );

            // Si se eliminó durante la edición, evitamos continuar.
            if (!updated) {

                // Construimos un error de conflicto.
                const conflict = new Error(
                    "La canción ya no está disponible para editar"
                );

                // Indicamos que el registro cambió.
                conflict.status = 409;

                // Activamos la limpieza de los archivos nuevos.
                throw conflict;
            }

            // Confirmamos que MongoDB guardó los cambios.
            saved = true;

            // =================================================
            // LIMPIEZA DE VERSIONES ANTERIORES
            // =================================================

            // Retiramos los documentos anteriores de Google Drive.
            const cleanup = await Promise.allSettled([
                deleteSongFile(current.pdfFileId),
                deleteSongFile(current.sourceFileId),
            ]);

            // Comprobamos si falló alguna eliminación.
            const warning = cleanup.some(
                (result) => result.status === "rejected"
            );

            // Dejamos evidencia para gestionar archivos pendientes.
            if (warning) {
                console.error(
                    "Hay archivos anteriores del cancionero pendientes de limpieza"
                );
            }

            // =================================================
            // RESPUESTA AL ADMINISTRADOR
            // =================================================

            // Evitamos almacenar información privada en caché.
            res.set(
                "Cache-Control",
                "private, no-store"
            );

            // Confirmamos la edición.
            return res.status(200).json({
                success: true,

                // Informamos si existe limpieza pendiente.
                message: warning
                    ? "Canción actualizada. Hay archivos anteriores pendientes de limpieza."
                    : "Canción actualizada correctamente",

                // El frontend puede mostrar esta advertencia.
                cleanupWarning: warning,

                // Devolvemos los metadatos actualizados.
                song: serializeSong(updated),
            });

        } catch (error) {

            // Si MongoDB no guardó, retiramos los archivos nuevos.
            if (uploaded && !saved) {

                // Intentamos limpiar PDF y TXT sin ocultar el error.
                await Promise.allSettled([
                    deleteSongFile(uploaded.pdfFileId),
                    deleteSongFile(uploaded.sourceFileId),
                ]);
            }

            // Delegamos el problema al controlador global.
            return next(error);
        }
    }
);


/* =========================================================
   DELETE /api/songbook/songs/:id
   ELIMINACIÓN DEFINITIVA CON AUDITORÍA
========================================================= */

router.delete(
    "/:id",
    authorizeRoles(...writerRoles),
    validateOrigin,

    async (req, res, next) => {
        try {

            // Validamos el identificador recibido.
            if (
                !mongoose.isObjectIdOrHexString(req.params.id)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Identificador inválido",
                });
            }

            // Recuperamos la canción y referencias de Drive.
            const song = await Song.findById(
                req.params.id
            ).select("+pdfFileId +sourceFileId");

            // Confirmamos la existencia del registro.
            if (!song) {
                return res.status(404).json({
                    success: false,
                    message: "Canción no encontrada",
                });
            }

            // Intentamos eliminar ambos archivos de Drive.
            const results = await Promise.allSettled([
                deleteSongFile(song.pdfFileId),
                deleteSongFile(song.sourceFileId),
            ]);

            // Conservamos el registro cuando Drive falla.
            if (
                results.some(
                    (result) => result.status === "rejected"
                )
            ) {

                // Registramos el error de almacenamiento.
                console.error(
                    "No fue posible limpiar todos los archivos de la canción"
                );

                // Informamos que la eliminación no se completó.
                return res.status(502).json({
                    success: false,
                    message:
                        "No se pudo completar la eliminación. Intenta nuevamente.",
                });
            }

            // Eliminamos el documento y registramos el borrado.
            await deleteResourceWithAudit({

                // Modelo del cancionero.
                model: Song,

                // Identificador del registro eliminado.
                resourceId: song._id,

                // Tipo utilizado por el historial global.
                resourceType: "song",

                // Administrador responsable de la eliminación.
                deletedBy:
                    req.user?._id || req.user?.id,
            });

            // Evitamos cachés con información eliminada.
            res.set(
                "Cache-Control",
                "private, no-store"
            );

            // Confirmamos la eliminación.
            return res.status(200).json({
                success: true,
                message: "Canción eliminada correctamente",
            });

        } catch (error) {

            // Delegamos errores de MongoDB o Drive.
            return next(error);
        }
    }
);


/* =========================================================
   EXPORTACIÓN
========================================================= */

// Exportamos el router para registrarlo en app.js.
export default router;
