// =========================================================
// HISTORIAL GLOBAL DE ACTIVIDAD - IGLESIA EL ANCLA
// Archivo: backend/src/routes/activityHistoryRoutes.js
// =========================================================
// Esta ruta UNE información existente, sin generar logs extra:
// - Creación de las actividades, libros y canciones vigentes.
// - Última edición de cada recurso vigente, si tiene updatedBy.
// - Eliminaciones conservadas en la colección deletionlogs.
// No pretende reconstruir cada modificación histórica.

// Importamos Express para definir la ruta de solo lectura.
import { Router } from "express";

// Los modelos indican los nombres reales de las colecciones de MongoDB.
import Activity from "../models/Activity.js";
import LibraryBook from "../models/LibraryBook.js";
import Song from "../models/Song.js";
import DeletionLog from "../models/DeletionLog.js";
import User from "../models/User.js";

// Reutilizamos la autenticación y autorización del proyecto.
import authenticateUser from "../middleware/authenticateUser.js";
import authorizeRoles from "../middleware/authorizeRoles.js";

// Construimos un router exclusivo para consultas administrativas.
const router = Router();

// Exigimos una sesión administrativa antes de consultar el historial.
router.use(authenticateUser, authorizeRoles("admin", "super_admin"));

// La API entrega un número limitado de movimientos por página.
const PAGE_SIZE = 25;

// Formato civil de Chile para las consultas por fecha.
const CHILE_TIME_ZONE = "America/Santiago";

// Evitamos que la búsqueda del usuario se interprete como una expresión compleja.
function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Construimos las dos actividades posibles de un recurso aún existente.
function currentResourceActivityPipeline(resourceType) {
  return [
    {
      // Generamos una entrada de creación y, si corresponde, una de última edición.
      $project: {
        entries: {
          $concatArrays: [
            [
              {
                resourceId: "$_id",
                resourceType,
                resourceTitle: "$title",
                action: "created",
                actorId: "$createdBy",
                occurredAt: "$createdAt",
              },
            ],
            {
              // Solo hay edición cuando updatedBy existe de verdad.
              $cond: [
                {
                  $and: [
                    { $ne: [{ $ifNull: ["$updatedBy", null] }, null] },
                    { $ne: [{ $ifNull: ["$updatedAt", null] }, null] },
                  ],
                },
                [
                  {
                    resourceId: "$_id",
                    resourceType,
                    resourceTitle: "$title",
                    action: "updated",
                    actorId: "$updatedBy",
                    occurredAt: "$updatedAt",
                  },
                ],
                [],
              ],
            },
          ],
        },
      },
    },
    // Cada entrada pasa a ser una fila independiente del historial.
    { $unwind: "$entries" },
    // Dejamos solamente los campos que requiere la consulta global.
    { $replaceRoot: { newRoot: "$entries" } },
  ];
}

// Convertimos las eliminaciones a la misma estructura de actividad.
const deletedResourcePipeline = [
  {
    $project: {
      _id: 0,
      resourceId: 1,
      resourceType: 1,
      resourceTitle: 1,
      action: { $literal: "deleted" },
      actorId: "$deletedBy",
      occurredAt: "$deletedAt",
    },
  },
];

// Recuperamos los nombres de los administradores solo para los registros visibles.
function actorName(actor) {
  if (!actor) return "Cuenta no disponible";
  return [actor.firstName, actor.lastName].filter(Boolean).join(" ") || "Sin nombre";
}

// Preparamos la descripción en español que aparecía en la tabla original.
function describeActivity(activity) {
  const resourceNames = {
    activity: "la actividad",
    event: "el evento",
    book: "el libro",
    song: "la canción",
  };
  const resourceName = resourceNames[activity.resourceType] || "el contenido";
  const verb = activity.action === "created"
    ? (activity.resourceType === "activity" ? "Creó" : "Publicó")
    : activity.action === "updated"
      ? "Modificó"
      : "Eliminó";
  return `${verb} ${resourceName} «${activity.resourceTitle || "Sin título"}».`;
}

// =========================================================
// GET /api/activity-history?page=1&q=...&date=YYYY-MM-DD
// =========================================================
router.get("/", async (req, res, next) => {
  try {
    // Validamos el número de página para evitar consultas abusivas.
    const page = Number(req.query.page ?? 1);
    if (!Number.isSafeInteger(page) || page < 1 || page > 10000) {
      return res.status(400).json({ success: false, message: "Página no válida" });
    }

    // Validamos el texto buscado y limitamos su longitud.
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    if (q.length > 80 || (req.query.q !== undefined && typeof req.query.q !== "string")) {
      return res.status(400).json({ success: false, message: "Búsqueda no válida" });
    }

    // Validamos la fecha local recibida desde el selector del frontend.
    const date = req.query.date === undefined ? "" : req.query.date;
    if (typeof date !== "string" || (date && !/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(date))) {
      return res.status(400).json({ success: false, message: "Fecha no válida" });
    }
    if (date) {
      const check = new Date(`${date}T12:00:00.000Z`);
      if (Number.isNaN(check.getTime()) || check.toISOString().slice(0, 10) !== date) {
        return res.status(400).json({ success: false, message: "Fecha inexistente" });
      }
    }

    // Comenzamos con las actividades puntuales vigentes.
    const pipeline = currentResourceActivityPipeline("activity");

    // Incorporamos los movimientos inferidos de los libros existentes.
    pipeline.push({
      $unionWith: {
        coll: LibraryBook.collection.name,
        pipeline: currentResourceActivityPipeline("book"),
      },
    });

    // Incorporamos los movimientos inferidos de las canciones existentes.
    pipeline.push({
      $unionWith: {
        coll: Song.collection.name,
        pipeline: currentResourceActivityPipeline("song"),
      },
    });

    // Incorporamos las eliminaciones que sí tienen auditoría permanente.
    pipeline.push({
      $unionWith: {
        coll: DeletionLog.collection.name,
        pipeline: deletedResourcePipeline,
      },
    });

    // La fecha se compara en America/Santiago, no por día UTC.
    // Filtramos antes del lookup para disminuir lecturas de usuarios.
    if (date) {
      pipeline.push({
        $match: {
          $expr: {
            $eq: [
              { $dateToString: { format: "%Y-%m-%d", date: "$occurredAt", timezone: CHILE_TIME_ZONE } },
              date,
            ],
          },
        },
      });
    }

    // Resolvemos quién realizó cada acción utilizando la colección de usuarios.
    pipeline.push({
      $lookup: {
        from: User.collection.name,
        localField: "actorId",
        foreignField: "_id",
        as: "actor",
        pipeline: [
          { $project: { firstName: 1, lastName: 1, email: 1 } },
        ],
      },
    });
    pipeline.push({ $unwind: { path: "$actor", preserveNullAndEmptyArrays: true } });

    // Generamos un texto de búsqueda sobre nombre y apellido combinados.
    pipeline.push({
      $addFields: {
        actorFullName: {
          $trim: {
            input: {
              $concat: [
                { $ifNull: ["$actor.firstName", ""] },
                " ",
                { $ifNull: ["$actor.lastName", ""] },
              ],
            },
          },
        },
        // Expresiones para buscar también las acciones en español.
        actionSearchText: {
          $switch: {
            branches: [
              { case: { $eq: ["$action", "created"] }, then: "creó publicó creación publicación" },
              { case: { $eq: ["$action", "updated"] }, then: "modificó actualizó edición" },
              { case: { $eq: ["$action", "deleted"] }, then: "eliminó borró eliminación" },
            ],
            default: "actividad",
          },
        },
        resourceSearchText: {
          $switch: {
            branches: [
              { case: { $eq: ["$resourceType", "activity"] }, then: "actividad" },
              { case: { $eq: ["$resourceType", "event"] }, then: "evento" },
              { case: { $eq: ["$resourceType", "book"] }, then: "libro" },
              { case: { $eq: ["$resourceType", "song"] }, then: "canción" },
            ],
            default: "recurso",
          },
        },
      },
    });

    // Aplicamos la búsqueda sobre título, cuenta responsable y acción.
    if (q) {
      const regex = new RegExp(escapeRegex(q), "i");
      pipeline.push({
        $match: {
          $or: [
            { resourceTitle: regex },
            { actorFullName: regex },
            { "actor.email": regex },
            { action: regex },
            { resourceType: regex },
            { actionSearchText: regex },
            { resourceSearchText: regex },
          ],
        },
      });
    }

    // Calculamos la cantidad y la página sobre el MISMO conjunto combinado.
    pipeline.push({
      $facet: {
        totalItems: [{ $count: "value" }],
        rows: [
          { $sort: { occurredAt: -1, resourceId: -1, action: 1 } },
          { $skip: (page - 1) * PAGE_SIZE },
          { $limit: PAGE_SIZE },
          {
            $project: {
              _id: 0,
              resourceId: 1,
              resourceType: 1,
              resourceTitle: 1,
              action: 1,
              occurredAt: 1,
              actor: 1,
            },
          },
        ],
      },
    });

    // Leemos el resultado desde MongoDB sin crear nuevas colecciones.
    const [result] = await Activity.aggregate(pipeline);
    const total = result?.totalItems?.[0]?.value || 0;
    const rows = result?.rows || [];

    // Evitamos cachear información de auditoría administrativa.
    res.set("Cache-Control", "private, no-store");

    // Respetamos los campos que ya consume ActivityTable.jsx.
    return res.json({
      success: true,
      activities: rows.map((entry) => ({
        id: `${entry.resourceType}:${entry.resourceId}:${entry.action}`,
        actorName: actorName(entry.actor),
        actorEmail: entry.actor?.email || "—",
        createdAt: entry.occurredAt,
        action: entry.action,
        description: describeActivity(entry),
      })),
      total,
      page,
      pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    });
  } catch (error) {
    // El middleware global responde ante errores de consulta.
    next(error);
  }
});

// Exportamos el router protegido para registrarlo en app.js.
export default router;
