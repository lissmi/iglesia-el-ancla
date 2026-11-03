// =========================================================
// RUTAS - BIBLIOTECA SOLIDARIA / IGLESIA EL ANCLA
// Cloudinary (portadas) + Google Drive (PDF/Word) + MongoDB
// =========================================================

// Importamos Express para declarar los endpoints.
import { Router } from "express";

// Importamos Multer para recibir archivos del formulario.
import multer from "multer";

// Comprobamos la firma binaria de los archivos recibidos.
import { fileTypeFromBuffer } from "file-type";

// JSZip nos ayuda a reconocer la estructura interna de DOCX.
import JSZip from "jszip";

// Usamos crypto para evitar nombres duplicados en almacenamiento.
import { randomUUID } from "node:crypto";

// Usamos path para identificar la extensión del documento.
import path from "node:path";

// Convertimos los buffers en flujos hacia Google Drive.
import { Readable } from "node:stream";

// Enviamos las descargas sin almacenar el archivo en el servidor.
import { pipeline } from "node:stream/promises";

// Validamos los identificadores utilizados por MongoDB.
import mongoose from "mongoose";

// Reutilizamos el modelo simplificado de la biblioteca.
import LibraryBook from "../models/LibraryBook.js";

// Reutilizamos los middleware de seguridad existentes.
import authenticateUser from "../middleware/authenticateUser.js";
import authorizeRoles from "../middleware/authorizeRoles.js";

// Reutilizamos las conexiones ya preparadas para el proyecto.
import cloudinary from "../services/cloudinary/cloudinary.js";
import { getGoogleDriveClient } from "../services/drive/googleDrive.js";

// Compartimos el registro de eliminaciones con eventos y canciones.
import { deleteResourceWithAudit } from "../services/audit/deletionService.js";

// Creamos un router independiente para la biblioteca.
const router = Router();

// Permitimos consultar y descargar a los tres roles registrados.
const readerRoles = ["member", "admin", "super_admin"];

// Solo los administradores pueden publicar libros.
const publisherRoles = ["admin", "super_admin"];

// Limitamos el peso de las portadas a 5 MB.
const MAX_COVER_SIZE = 5 * 1024 * 1024;

// Limitamos cada documento a 20 MB en esta primera versión.
const MAX_DOCUMENT_SIZE = 20 * 1024 * 1024;

// Relacionamos las extensiones permitidas con su tipo MIME real.
const DOCUMENT_TYPES = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

// Categorías oficiales: deben coincidir con LibraryBook.js y React.
const BOOK_CATEGORIES = new Set([
    "General",
    "Estudio bíblico",
    "Vida cristiana",
    "Devocionales",
    "Oración",
    "Discipulado",
    "Familia y comunidad",
    "Literatura infantil",
]);

// Configuramos las direcciones permitidas para enviar formularios.
const allowedOrigins = new Set(
    [
        "http://localhost:3000",
        "https://iglesia-el-ancla.vercel.app",
        process.env.FRONTEND_URL,
        process.env.FRONTEND_URL_PRODUCTION,
    ]
        .filter(Boolean)
        .flatMap((value) => value.split(","))
        .map((value) => value.trim())
        .filter(Boolean)
        .map((value) => {
            try {
                return new URL(value).origin;
            } catch {
                return null;
            }
        })
        .filter(Boolean)
);

// Comprobamos el Origin para reducir solicitudes CSRF con cookies.
function validateRequestOrigin(req, res, next) {
    // Los formularios del navegador incluyen este encabezado.
    const origin = req.get("Origin");

    // Rechazamos solicitudes de orígenes no autorizados.
    if (!origin || !allowedOrigins.has(origin)) {
        return res.status(403).json({
            success: false,
            message: "Origen de solicitud no autorizado",
        });
    }

    // Continuamos si el origen coincide con los configurados.
    next();
}

// Multer recibe los archivos temporalmente en memoria.
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        // El límite individual máximo corresponde al documento.
        fileSize: MAX_DOCUMENT_SIZE,

        // Una portada y un documento como máximo.
        files: 2,

        // Título, autor, categoría y descripción.
        fields: 4,

        // Máximo de 6 partes: cuatro campos y dos archivos.
        parts: 6,
    },
}).fields([
    // Portada enviada por el formulario administrativo.
    { name: "cover", maxCount: 1 },

    // Conservamos el nombre actual para no romper el frontend.
    { name: "pdf", maxCount: 1 },

    // También aceptamos el nombre más genérico para Word.
    { name: "document", maxCount: 1 },
]);

// Convertimos los errores de Multer en respuestas comprensibles.
function receiveFiles(req, res, next) {
    upload(req, res, (error) => {
        if (error) {
            return res.status(400).json({
                success: false,
                message: "Archivos inválidos o demasiado grandes (máximo 20 MB por documento)",
            });
        }

        next();
    });
}

// Validamos las imágenes independientemente de su extensión.
async function validateCover(cover) {
    // Exigimos una imagen presente y no vacía.
    if (!cover?.buffer?.length) {
        throw new Error("Debes adjuntar una imagen de portada");
    }

    // Aplicamos el límite menor de 5 MB para las portadas.
    if (cover.size > MAX_COVER_SIZE) {
        throw new Error("La portada no puede superar los 5 MB");
    }

    // Leemos el formato real a partir de sus bytes.
    const detectedType = await fileTypeFromBuffer(cover.buffer);

    // Aceptamos únicamente formatos rasterizados conocidos.
    if (!["image/jpeg", "image/png", "image/webp"].includes(detectedType?.mime)) {
        throw new Error("La portada debe ser JPG, PNG o WebP");
    }
}

// Determinamos el formato del documento y validamos su contenido.
async function validateDocument(documentFile) {
    // Exigimos un documento real con contenido.
    if (!documentFile?.buffer?.length) {
        throw new Error("Debes adjuntar un documento PDF o Word");
    }

    // Confirmamos que no exceda el tamaño permitido.
    if (documentFile.size > MAX_DOCUMENT_SIZE) {
        throw new Error("El documento no puede superar los 20 MB");
    }

    // Extraemos la extensión declarada por el archivo.
    const format = path.extname(documentFile.originalname || "")
        .slice(1)
        .toLowerCase();

    // Rechazamos formatos ajenos a la biblioteca.
    if (!Object.hasOwn(DOCUMENT_TYPES, format)) {
        throw new Error("Solo se admiten archivos PDF, DOC y DOCX");
    }

    // Comprobamos la firma real del archivo.
    const detectedType = await fileTypeFromBuffer(documentFile.buffer);

    // El PDF debe identificarse como PDF.
    if (format === "pdf" && detectedType?.mime !== "application/pdf") {
        throw new Error("El contenido no corresponde a un PDF válido");
    }

    // DOCX es un contenedor ZIP con archivos propios de Word.
    if (format === "docx") {
        // Admitimos la detección específica o la firma ZIP general.
        const validMime = [
            DOCUMENT_TYPES.docx,
            "application/zip",
        ].includes(detectedType?.mime);

        // Un DOCX legítimo debe contener estas entradas.
        let validStructure = false;

        if (validMime) {
            try {
                const zip = await JSZip.loadAsync(documentFile.buffer);
                validStructure = Boolean(
                    zip.file("[Content_Types].xml") &&
                    zip.file("word/document.xml")
                );
            } catch {
                validStructure = false;
            }
        }

        if (!validStructure) {
            throw new Error("El archivo DOCX no tiene una estructura de Word válida");
        }
    }

    // Los DOC antiguos utilizan la firma binaria OLE/Compound File.
    if (format === "doc") {
        // Identificamos la cabecera OLE característica.
        const oleSignature = Buffer.from("d0cf11e0a1b11ae1", "hex");

        // También verificamos el directorio típico de documentos Word.
        const wordStreamName = Buffer.from("WordDocument", "utf16le");

        if (
            !documentFile.buffer.subarray(0, 8).equals(oleSignature) ||
            !documentFile.buffer.includes(wordStreamName)
        ) {
            throw new Error("El archivo DOC no parece un documento Word válido");
        }
    }

    // Entregamos solo el formato corto que guardará MongoDB.
    return format;
}

// Subimos una portada a Cloudinary sin pasar por el disco local.
function uploadCoverToCloudinary(buffer) {
    return new Promise((resolve, reject) => {
        // Cloudinary recibe una transmisión binaria.
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "el-ancla/biblioteca/portadas",
                public_id: randomUUID(),
                resource_type: "image",
                overwrite: false,
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );

        // Enviamos los bytes de la imagen.
        stream.end(buffer);
    });
}

// Construimos un nombre seguro para almacenar el archivo en Drive.
function makeDocumentName(title, format) {
    // Retiramos caracteres no adecuados para nombres de archivo.
    const safeTitle = title
        .replace(/[\\/<>:"|?*\x00-\x1F]/g, "")
        .trim()
        .slice(0, 80) || "Libro";

    // Agregamos un sufijo único para evitar colisiones.
    return `${safeTitle}-${randomUUID().slice(0, 8)}.${format}`;
}

// Definimos el nombre descargable a partir del título guardado.
function makeDownloadName(title, format) {
    // Evitamos caracteres especiales de rutas en el nombre.
    const safeTitle = title
        .replace(/[\\/<>:"|?*\x00-\x1F]/g, "")
        .trim()
        .slice(0, 100) || "Libro";

    return `${safeTitle}.${format}`;
}

// El catálogo muestra únicamente los metadatos necesarios.
function serializeBook(book) {
    return {
        _id: book._id,
        title: book.title,
        author: book.author,
        category: book.category,
        description: book.description,
        coverUrl: book.coverUrl,
        document: { format: book.document?.format },
        createdAt: book.createdAt,
    };
}

// Exigimos sesión válida en todos los endpoints siguientes.
router.use(authenticateUser);

// =========================================================
// GET /api/library/books - CONSULTAR CATÁLOGO
// =========================================================
router.get("/", authorizeRoles(...readerRoles), async (req, res, next) => {
    try {
        // Consultamos solo campos seguros para el catálogo.
        const books = await LibraryBook.find()
            .select("title author category description coverUrl document.format createdAt")
            .sort({ createdAt: -1 })
            .lean();

        // No permitimos caché compartida de datos autenticados.
        res.set("Cache-Control", "private, no-store");

        // Excluimos expresamente los identificadores privados.
        return res.json({
            success: true,
            books: books.map(serializeBook),
        });
    } catch (error) {
        next(error);
    }
});

// =========================================================
// POST /api/library/books - PUBLICAR LIBRO
// =========================================================
router.post(
    "/",
    authorizeRoles(...publisherRoles),
    validateRequestOrigin,
    receiveFiles,
    async (req, res, next) => {
        // Conservamos identificadores para limpiar subidas incompletas.
        let uploadedCover = null;
        let uploadedDriveId = null;
        let createdBook = null;

        try {
            // Recuperamos los datos enviados por el administrador.
            const { title, author, category, description } = req.body;

            // Exigimos los campos bibliográficos y validamos longitudes.
            const validFields =
                typeof title === "string" &&
                typeof author === "string" &&
                Boolean(title.trim()) &&
                Boolean(author.trim()) &&
                title.trim().length <= 150 &&
                author.trim().length <= 120 &&
                (category === undefined ||
                    (typeof category === "string" && category.trim().length <= 80)) &&
                (description === undefined ||
                    (typeof description === "string" && description.trim().length <= 1000));

            if (!validFields) {
                return res.status(400).json({
                    success: false,
                    message: "Título, autor, categoría o descripción inválidos",
                });
            }

            // No permitimos crear categorías arbitrarias desde solicitudes directas.
            if (!BOOK_CATEGORIES.has(category?.trim() || "General")) {
                return res.status(400).json({
                    success: false,
                    message: "Selecciona una categoría oficial de la biblioteca",
                });
            }

            // Obtenemos la portada y el documento (nombre actual o nuevo).
            const cover = req.files?.cover?.[0];
            const documentFile = req.files?.document?.[0] || req.files?.pdf?.[0];

            // Rechazamos formularios con dos documentos.
            if (req.files?.document?.length && req.files?.pdf?.length) {
                return res.status(400).json({
                    success: false,
                    message: "Adjunta solamente un documento",
                });
            }

            // Validamos antes de subir a los proveedores externos.
            let format;
            try {
                await validateCover(cover);
                format = await validateDocument(documentFile);
            } catch (validationError) {
                return res.status(400).json({
                    success: false,
                    message: validationError.message,
                });
            }

            // Verificamos que la sesión contenga el usuario publicador.
            const adminId = req.user?._id || req.user?.id;

            if (!mongoose.isValidObjectId(adminId)) {
                return res.status(401).json({
                    success: false,
                    message: "No se pudo identificar al administrador",
                });
            }

            // Comprobamos que la carpeta de Google Drive esté configurada.
            const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

            if (!folderId) {
                throw new Error("Falta configurar GOOGLE_DRIVE_FOLDER_ID");
            }

            // 1) Guardamos la portada en Cloudinary.
            uploadedCover = await uploadCoverToCloudinary(cover.buffer);

            // 2) Enviamos el documento privado a Google Drive.
            const drive = getGoogleDriveClient();
            const driveResponse = await drive.files.create({
                requestBody: {
                    name: makeDocumentName(title.trim(), format),
                    parents: [folderId],
                },
                media: {
                    mimeType: DOCUMENT_TYPES[format],
                    body: Readable.from(documentFile.buffer),
                },
                fields: "id",
            });

            // Guardamos el ID necesario para la futura descarga.
            uploadedDriveId = driveResponse.data.id;

            if (!uploadedDriveId) {
                throw new Error("Google Drive no devolvió el identificador del archivo");
            }

            // 3) Guardamos solo los metadatos mínimos en MongoDB.
            createdBook = await LibraryBook.create({
                title: title.trim(),
                author: author.trim(),
                category: category?.trim() || "General",
                description: description?.trim() || "",
                coverUrl: uploadedCover.secure_url,
                coverPublicId: uploadedCover.public_id,
                document: {
                    fileId: uploadedDriveId,
                    format,
                },
                createdBy: adminId,
            });

            // Devolvemos al frontend únicamente los campos públicos.
            res.set("Cache-Control", "private, no-store");
            return res.status(201).json({
                success: true,
                message: "Libro publicado correctamente",
                book: serializeBook(createdBook),
            });
        } catch (error) {
            // Si ya se guardó el libro, evitamos borrar sus archivos.
            if (!createdBook) {
                // Intentamos limpiar los archivos subidos parcialmente.
                const cleanup = [];

                if (uploadedCover?.public_id) {
                    cleanup.push(
                        cloudinary.uploader.destroy(uploadedCover.public_id, {
                            resource_type: "image",
                        })
                    );
                }

                if (uploadedDriveId) {
                    cleanup.push(
                        getGoogleDriveClient().files.delete({
                            fileId: uploadedDriveId,
                        })
                    );
                }

                // Una falla de limpieza no oculta el error original.
                const results = await Promise.allSettled(cleanup);

                for (const result of results) {
                    if (result.status === "rejected") {
                        console.error("No se pudo limpiar un archivo:", result.reason?.message);
                    }
                }
            }

            next(error);
        }
    }
);

// =========================================================
// UTILIDADES DE ELIMINACIÓN EN PROVEEDORES EXTERNOS
// =========================================================

// Elimina una portada por su identificador privado de Cloudinary.
async function removeCloudinaryCover(publicId) {
    // Omitimos la operación cuando el libro no tiene referencia.
    if (!publicId) return;

    // Invalidamos copias almacenadas en caché por la CDN.
    const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: "image",
        invalidate: true,
    });

    // Cloudinary informa mediante un resultado incluso sin lanzar error.
    if (!["ok", "not found"].includes(result?.result)) {
        throw new Error(`Cloudinary no pudo borrar la portada (${result?.result || "sin resultado"})`);
    }
}

// Elimina un documento de Drive creado por nuestra aplicación.
async function removeDriveDocument(fileId) {
    // Evitamos intentar eliminar identificadores vacíos.
    if (!fileId) return;

    try {
        // El permiso drive.file autoriza operaciones en archivos creados por la app.
        await getGoogleDriveClient().files.delete({ fileId });
    } catch (error) {
        // Un 404 indica que el documento ya no existe: no es una falla pendiente.
        if (error?.response?.status === 404 || error?.code === 404) return;
        throw error;
    }
}

// Intentamos eliminar ambos archivos sin cancelar el resto si falla uno.
async function cleanupExternalFiles({ coverPublicId, driveFileId }, reason) {
    const tasks = [];

    if (coverPublicId) {
        tasks.push({
            provider: "Cloudinary",
            id: coverPublicId,
            execute: () => removeCloudinaryCover(coverPublicId),
        });
    }

    if (driveFileId) {
        tasks.push({
            provider: "Google Drive",
            id: driveFileId,
            execute: () => removeDriveDocument(driveFileId),
        });
    }

    // Promise.allSettled permite tratar los errores por proveedor.
    const results = await Promise.allSettled(tasks.map((task) => task.execute()));
    const failures = [];

    results.forEach((result, index) => {
        if (result.status === "rejected") {
            // El registro en el servidor permite recuperar referencias de limpieza.
            console.error(`[Biblioteca: ${reason}] Limpieza pendiente en ${tasks[index].provider}:`, {
                id: tasks[index].id,
                error: result.reason?.message,
            });
            failures.push(tasks[index].provider);
        }
    });

    return failures;
}

// =========================================================
// PATCH /api/library/books/:id - EDITAR LIBRO
// =========================================================

router.patch(
    "/:id",
    authorizeRoles(...publisherRoles),
    validateRequestOrigin,
    receiveFiles,
    async (req, res, next) => {
        // Guardamos los nuevos archivos para revertir una edición fallida.
        let newCover = null;
        let newDriveId = null;
        let saved = false;

        try {
            // Comprobamos el ID enviado antes de consultar MongoDB.
            if (!mongoose.isValidObjectId(req.params.id)) {
                return res.status(400).json({
                    success: false,
                    message: "Identificador de libro inválido",
                });
            }

            // Cargamos los identificadores privados necesarios para reemplazos.
            const book = await LibraryBook.findById(req.params.id)
                .select("+coverPublicId +document.fileId");

            if (!book) {
                return res.status(404).json({
                    success: false,
                    message: "Libro no encontrado",
                });
            }

            // Identificamos al administrador desde la sesión protegida del backend.
            const adminId = req.user?._id || req.user?.id;

            // Rechazamos la edición si la sesión no contiene un ObjectId válido.
            if (!mongoose.isValidObjectId(adminId)) {
                return res.status(401).json({
                    success: false,
                    message: "No se pudo identificar al administrador",
                });
            }

            // Exigimos los mismos campos bibliográficos que al crear un libro.
            const { title, author, category, description } = req.body;
            const validFields =
                typeof title === "string" &&
                typeof author === "string" &&
                Boolean(title.trim()) &&
                Boolean(author.trim()) &&
                title.trim().length <= 150 &&
                author.trim().length <= 120 &&
                (category === undefined ||
                    (typeof category === "string" && category.trim().length <= 80)) &&
                (description === undefined ||
                    (typeof description === "string" && description.trim().length <= 1000));

            if (!validFields) {
                return res.status(400).json({
                    success: false,
                    message: "Título, autor, categoría o descripción inválidos",
                });
            }

            // Normalizamos y validamos la categoría contra la lista oficial.
            const normalizedCategory = category?.trim() || "General";
            if (!BOOK_CATEGORIES.has(normalizedCategory)) {
                return res.status(400).json({
                    success: false,
                    message: "Selecciona una categoría oficial de la biblioteca",
                });
            }

            // Ambos nombres de archivo se admiten por compatibilidad con React.
            const cover = req.files?.cover?.[0];
            const documentFile = req.files?.document?.[0] || req.files?.pdf?.[0];

            if (req.files?.document?.length && req.files?.pdf?.length) {
                return res.status(400).json({
                    success: false,
                    message: "Adjunta solamente un documento",
                });
            }

            // En edición, los archivos son OPCIONALES; si existen, se validan.
            if (cover) await validateCover(cover);
            const format = documentFile ? await validateDocument(documentFile) : null;

            // Conservamos referencias antiguas para la limpieza posterior.
            const oldCoverId = book.coverPublicId;
            const oldDriveId = book.document?.fileId;

            // Primero almacenamos los nuevos archivos, sin eliminar los anteriores.
            if (cover) {
                newCover = await uploadCoverToCloudinary(cover.buffer);
            }

            if (documentFile) {
                const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
                if (!folderId) throw new Error("Falta GOOGLE_DRIVE_FOLDER_ID");

                // Drive recibe los archivos en la carpeta institucional privada.
                const result = await getGoogleDriveClient().files.create({
                    requestBody: {
                        name: makeDocumentName(title.trim(), format),
                        parents: [folderId],
                    },
                    media: {
                        mimeType: DOCUMENT_TYPES[format],
                        body: Readable.from(documentFile.buffer),
                    },
                    fields: "id",
                });

                newDriveId = result.data?.id;
                if (!newDriveId) {
                    throw new Error("Google Drive no devolvió el identificador del documento");
                }
            }

            // Actualizamos la información bibliográfica del libro.
            book.title = title.trim();
            book.author = author.trim();
            book.category = normalizedCategory;
            book.description = description?.trim() || "";

            // Solo reemplazamos las referencias de archivos que cambiaron.
            if (newCover) {
                book.coverUrl = newCover.secure_url;
                book.coverPublicId = newCover.public_id;
            }

            if (newDriveId) {
                book.document.fileId = newDriveId;
                book.document.format = format;
            }

            // Registramos quién modificó este libro usando la sesión autenticada.
            // No alteramos createdBy ni creamos un documento de historial.
            book.updatedBy = adminId;

            // Guardamos primero MongoDB, para conservar la versión antigua si falla.
            await book.save();
            saved = true;

            // Solo después del guardado eliminamos los archivos anteriores.
            const cleanupFailures = await cleanupExternalFiles(
                {
                    coverPublicId: newCover ? oldCoverId : null,
                    driveFileId: newDriveId ? oldDriveId : null,
                },
                "reemplazo"
            );

            // Respondemos con campos seguros, sin identificadores privados.
            res.set("Cache-Control", "private, no-store");
            return res.json({
                success: true,
                message: "Libro actualizado correctamente",
                ...(cleanupFailures.length > 0 && {
                    warning: "Los cambios se guardaron, pero hay archivos antiguos pendientes de limpieza.",
                }),
                book: serializeBook(book),
            });
        } catch (error) {
            // Si falló antes de guardar, retiramos solo los archivos recién subidos.
            if (!saved) {
                await cleanupExternalFiles(
                    {
                        coverPublicId: newCover?.public_id,
                        driveFileId: newDriveId,
                    },
                    "edición fallida"
                );
            }

            // Los datos del libro original permanecen vigentes si no se guardó.
            next(error);
        }
    }
);

// =========================================================
// DELETE /api/library/books/:id - ELIMINACIÓN DE LOS TRES SERVICIOS
// =========================================================

router.delete(
    "/:id",
    // Solo administradores pueden eliminar publicaciones.
    authorizeRoles(...publisherRoles),

    // Verificamos el origen para mitigar solicitudes CSRF.
    validateRequestOrigin,

    async (req, res, next) => {
        try {
            // Validamos el identificador antes de consultar MongoDB.
            if (!mongoose.isValidObjectId(req.params.id)) {
                return res.status(400).json({
                    success: false,
                    message: "Identificador de libro inválido",
                });
            }

            // Buscamos el libro SIN eliminarlo todavía de MongoDB.
            // Recuperamos expresamente los identificadores privados.
            const book = await LibraryBook.findById(req.params.id)
                .select("+coverPublicId +document.fileId");

            // Informamos si el libro ya no existe.
            if (!book) {
                return res.status(404).json({
                    success: false,
                    message: "El libro ya no existe en la biblioteca",
                });
            }

            // Los dos identificadores son necesarios para limpiar proveedores.
            if (!book.coverPublicId || !book.document?.fileId) {
                return res.status(409).json({
                    success: false,
                    message: "Este libro no tiene todas sus referencias de almacenamiento. Revisa el registro antes de eliminarlo.",
                });
            }

            // Eliminamos primero la portada y el documento externos.
            // Promise.allSettled permite intentar ambos, incluso si uno falla.
            // Los ayudantes consideran 'not found' como borrado exitoso,
            // por lo que esta operación se puede reintentar con seguridad.
            const cleanupFailures = await cleanupExternalFiles(
                {
                    coverPublicId: book.coverPublicId,
                    driveFileId: book.document.fileId,
                },
                "eliminación"
            );

            // Si un servicio falló, conservamos el registro y sus IDs
            // para que el administrador pueda reintentar más tarde.
            if (cleanupFailures.length > 0) {
                res.set("Cache-Control", "private, no-store");

                return res.status(502).json({
                    success: false,
                    message:
                        `No se completó la eliminación en ${cleanupFailures.join(" y ")}. ` +
                        "El registro se conserva para poder reintentar. " +
                        "Algún archivo podría haberse eliminado durante el intento.",
                });
            }

            // Solo al confirmar ambas eliminaciones quitamos el registro
            // de MongoDB. Así no perdemos las referencias si un servicio falla.
            // Conservamos el historial y eliminamos el documento de forma atómica.
            // El responsable se obtiene de la sesión, no del formulario.
            await deleteResourceWithAudit({
                model: LibraryBook,
                resourceId: book._id,
                resourceType: "book",
                deletedBy: req.user?._id || req.user?.id,
            });

            // Evitamos almacenar datos de administración en cachés.
            res.set("Cache-Control", "private, no-store");

            // Confirmamos el borrado de los tres sistemas.
            return res.json({
                success: true,
                message: "Libro eliminado de MongoDB, Cloudinary y Google Drive correctamente.",
            });
        } catch (error) {
            // Si MongoDB falla tras borrar archivos, el registro sigue
            // disponible para volver a ejecutar la operación.
            next(error);
        }
    }
);

// =========================================================
// GET /api/library/books/:id/download - DESCARGA PROTEGIDA
// =========================================================
router.get(
    "/:id/download",
    authorizeRoles(...readerRoles),
    async (req, res, next) => {
        try {
            // Validamos el identificador de MongoDB.
            if (!mongoose.isValidObjectId(req.params.id)) {
                return res.status(400).json({
                    success: false,
                    message: "Identificador de libro inválido",
                });
            }

            // Incluimos expresamente el ID privado de Google Drive.
            const book = await LibraryBook.findById(req.params.id)
                .select("+document.fileId");

            if (!book) {
                return res.status(404).json({
                    success: false,
                    message: "Libro no encontrado",
                });
            }

            // El archivo debe conservar su referencia de Drive.
            const fileId = book.document?.fileId;
            const format = book.document?.format;

            if (!fileId || !DOCUMENT_TYPES[format]) {
                return res.status(500).json({
                    success: false,
                    message: "El archivo de este libro no está disponible",
                });
            }

            // Drive entrega un flujo binario, sin hacer público el archivo.
            const drive = getGoogleDriveClient();
            const driveResponse = await drive.files.get(
                { fileId, alt: "media" },
                { responseType: "stream" }
            );

            // Obligamos al navegador a descargar el documento.
            res.attachment(makeDownloadName(book.title, format));
            res.set("Content-Type", DOCUMENT_TYPES[format]);
            res.set("X-Content-Type-Options", "nosniff");
            res.set("Cache-Control", "private, no-store");

            // Entregamos el documento mientras llega desde Drive.
            await pipeline(driveResponse.data, res);
        } catch (error) {
            // Si ya empezó el flujo, no podemos enviar otro JSON.
            if (res.headersSent || res.destroyed) {
                console.error("Error durante la descarga:", error.message);
                if (!res.destroyed) res.destroy(error);
                return;
            }

            next(error);
        }
    }
);

// Exportamos las rutas para registrarlas en Express.
export default router;
