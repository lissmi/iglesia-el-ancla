// =========================================================
// SERVICIO CENTRAL DE ELIMINACIONES CON AUDITORÍA
// Archivo: backend/src/services/audit/deletionService.js
// =========================================================

// Importamos Mongoose para ejecutar una transacción de MongoDB.
import mongoose from "mongoose";

// Reutilizamos el modelo liviano de eliminaciones.
import DeletionLog from "../../models/DeletionLog.js";

// Reutilizamos la conexión Cloudinary ya configurada por el proyecto.
import cloudinary from "../cloudinary/cloudinary.js";


/* =========================================================
   TIPOS DE RECURSOS ADMITIDOS EN LA AUDITORÍA
========================================================= */

// Definimos los recursos que pueden eliminarse con historial.
const RESOURCE_TYPES = new Set([
  "activity",        // Actividades de la comunidad.
  "event",           // Eventos públicos recurrentes.
  "book",            // Libros de Biblioteca Solidaria.
  "song",            // Canciones del cancionero.
  "prayer_request",  // Peticiones de oración.
  "basic_supply",    // Insumos básicos del inventario.
  "belonging",       // Bienes físicos de la iglesia.
]);


// Creamos un error con código HTTP para el manejador de Express.
function httpError(status, message) {
  // Construimos el error con un mensaje comprensible.
  const error = new Error(message);
  // Conservamos el código HTTP esperado.
  error.status = status;
  // Entregamos el error al controlador.
  return error;
}

// Borra un recurso y registra la eliminación en una misma transacción.
export async function deleteResourceWithAudit({
  // Modelo Mongoose autorizado por el backend, nunca por React.
  model,
  // Identificador del documento que el administrador quiere borrar.
  resourceId,
  // Tipo del recurso eliminado: activity, event (público), book o song.
  resourceType,
  // Identificador obtenido exclusivamente de la sesión autenticada.
  deletedBy,
  // Limpieza adicional de relaciones; se ejecuta en la misma transacción.
  onDelete,
}) {
  // Limitamos los tipos admitidos por la auditoría.
  if (!RESOURCE_TYPES.has(resourceType)) {
    throw httpError(400, "Tipo de recurso no admitido en el historial");
  }

  // Verificamos que el modelo permita buscar y eliminar documentos.
  if (!model || typeof model.findOneAndDelete !== "function") {
    throw httpError(500, "Modelo de recurso no configurado");
  }

  // Validamos el ID del recurso antes de llamar a MongoDB.
  if (!mongoose.isObjectIdOrHexString(resourceId)) {
    throw httpError(400, "Identificador del recurso inválido");
  }

  // Confirmamos que el administrador fue identificado por la sesión.
  if (!mongoose.isObjectIdOrHexString(deletedBy)) {
    throw httpError(401, "No se pudo identificar al administrador");
  }

  // Inicializamos la colección/índice antes de iniciar la transacción.
  // Evitamos que la primera eliminación intente crear la colección dentro.
  await DeletionLog.init();

  // La transacción asegura que ambas escrituras se confirmen juntas.
  const log = await mongoose.connection.transaction(async (session) => {
    // Eliminamos dentro de la transacción y obtenemos el documento antiguo.
    const deleted = await model.findOneAndDelete(
      { _id: resourceId },
      { session }
    );

    // Si el recurso no existe, no creamos un registro falso.
    if (!deleted) {
      throw httpError(404, "El recurso ya no existe");
    }

    // Guardamos solamente el título, nunca el documento completo.
    const resourceTitle = String(deleted.title || deleted.name || "").trim().slice(0, 160);

    // Exigimos los datos mínimos que hacen útil el historial.
    if (!resourceTitle || !deleted.createdBy) {
      throw httpError(409, "El recurso no tiene datos suficientes para auditar su eliminación");
    }

    // Creamos el registro en la MISMA transacción.
    const [createdLog] = await DeletionLog.create(
      [{
        // Tipo de contenido borrado.
        resourceType,
        // Identificador original para seguimiento posterior.
        resourceId: deleted._id,
        // Nombre visible del contenido eliminado.
        resourceTitle,
        // Administrador creador del contenido.
        createdBy: deleted.createdBy,
        // Incluimos el último editor solo si existía.
        ...(deleted.updatedBy ? { updatedBy: deleted.updatedBy } : {}),
        // Responsable de la eliminación identificado en la sesión.
        deletedBy,
        // Fecha registrada por el servidor.
        deletedAt: new Date(),
      }],
      { session }
    );

    // Permite retirar confirmaciones de una actividad sin afectar a otros módulos.
    if (onDelete) await onDelete({ session, deleted });

    // Entregamos el log para confirmar el resultado de la transacción.
    return createdLog;
  });

  // Solo llegamos aquí si MongoDB confirmó el borrado Y el historial.
  return log;
}


// =========================================================
// ELIMINACIÓN DEFINITIVA DE MOVIMIENTOS FINANCIEROS
// Reutilizamos deletionlogs: sin nueva colección ni controllers.
// =========================================================


// Carpetas exactas que pertenecen a este módulo.
// Nunca aceptamos IDs arbitrarios de Cloudinary desde el navegador.
const CLOUDINARY_PREFIX = Object.freeze({
  income: "el-ancla/finanzas/ingresos-comprobantes/",
  expense: "el-ancla/finanzas/gastos-comprobantes/",
});

// Recuperamos las referencias del comprobante actual y de versiones anteriores.
// Los history.changes son internos: fueron generados por el backend.
function receiptIds(document, type) {
  const ids = new Set();
  const prefix = CLOUDINARY_PREFIX[type];
  const collect = (value) => {
    const id = value?.publicId;
    if (typeof id === "string" && id.startsWith(prefix) && id.length <= 250) {
      ids.add(id);
    }
  };

  collect(document.receipt);
  for (const event of document.history || []) {
    for (const change of event.changes || []) {
      if (change.field !== "receipt") continue;
      collect(change.before);
      collect(change.after);
    }
  }
  return [...ids];
}

// Mantiene quién editó y cuándo, sin duplicar montos, notas ni comprobantes.
// Para auditoría solo preservamos el nombre de los campos modificados.
function minimalEdits(document) {
  return (document.history || [])
    .filter((entry) => entry.action === "updated" && entry.by && entry.at)
    .map((entry) => ({
      by: entry.by,
      at: entry.at,
      fields: [...new Set((entry.changes || [])
        .map((change) => String(change.field || "").slice(0, 40))
        .filter(Boolean))].slice(0, 15),
    }));
}

// Se invoca únicamente DESPUÉS de confirmar el borrado en MongoDB.
// Ante un fallo, los IDs pendientes permanecen en DeletionLog para revisión.
// No añadimos un script independiente: la limpieza normal se realiza aquí.
async function cleanupFinancialReceipts(logId) {
  const log = await DeletionLog.findById(logId)
    .select("resourceType +pendingCloudinaryIds").lean();
  if (!log || !["income", "expense"].includes(log.resourceType)) {
    throw httpError(404, "Registro financiero de eliminación no encontrado");
  }

  const prefix = CLOUDINARY_PREFIX[log.resourceType];
  let pending = 0;
  for (const publicId of log.pendingCloudinaryIds || []) {
    // Protección adicional: no borrar recursos ajenos al módulo.
    if (!publicId.startsWith(prefix)) {
      pending += 1;
      continue;
    }
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: "image", type: "authenticated", invalidate: true,
      });
      // «not found» es éxito idempotente: el recurso ya no existe.
      if (!["ok", "not found"].includes(result?.result)) {
        pending += 1;
        continue;
      }
      await DeletionLog.updateOne({ _id: log._id }, {
        $pull: { pendingCloudinaryIds: publicId },
      });
    } catch (error) {
      pending += 1;
      console.error("Limpieza de comprobante financiero pendiente:", error.message);
    }
  }
  return { cleanupPending: pending > 0, pendingFiles: pending };
}

// Borra físicamente el documento y crea su constancia mínima EN UNA TRANSACCIÓN.
// Si MongoDB falla, el movimiento original permanece y no se tocan imágenes.
export async function deleteFinancialMovement({
  model, resourceType, resourceId, expectedVersion, deletedBy,
}) {
  // Las operaciones financieras requieren anulación previa en el servidor.
  const REQUIRED_STATUS = { income: "cancelled", expense: "Anulado" };
  const statusRequired = REQUIRED_STATUS[resourceType];
  if (!statusRequired) {
    throw httpError(400, "Tipo de movimiento financiero inválido");
  }
  // Solo aceptamos los modelos suministrados por nuestras rutas protegidas.
  if (!model || typeof model.findOneAndDelete !== "function") {
    throw httpError(500, "Modelo financiero no configurado");
  }
  if (!mongoose.isObjectIdOrHexString(resourceId)) {
    throw httpError(400, "Identificador de movimiento inválido");
  }
  if (!Number.isSafeInteger(expectedVersion) || expectedVersion < 0) {
    throw httpError(400, "Versión de movimiento inválida");
  }
  if (!mongoose.isObjectIdOrHexString(deletedBy)) {
    throw httpError(401, "No se identificó al administrador");
  }

  // Evita intentar crear por primera vez la colección durante la transacción.
  await DeletionLog.init();

  const logId = await mongoose.connection.transaction(async (session) => {
    // La versión evita que se borre un registro modificado simultáneamente.
    const deleted = await model.findOneAndDelete(
      {
        _id: resourceId,
        deletedAt: null,
        __v: expectedVersion,
        status: statusRequired, // No se puede omitir desde React.
      },
      { session }
    );
    if (!deleted) {
      // Ofrecemos un error claro sin relajar la condición de borrado atómico.
      const current = await model.findOne({ _id: resourceId, deletedAt: null })
        .select("status __v").session(session).lean();
      if (current && current.status !== statusRequired) {
        throw httpError(409, resourceType === "income"
          ? "Debes cambiar el ingreso a Anulado antes de eliminarlo"
          : "Debes cambiar el gasto a Anulado antes de eliminarlo");
      }
      throw httpError(409, "El movimiento cambió o ya no existe. Recarga la página");
    }

    const document = deleted.toObject();
    const resourceTitle = String(
      resourceType === "income" ? document.concept : document.description
    ).trim().slice(0, 160);
    if (!resourceTitle || !document.createdBy || !document.createdAt) {
      throw httpError(409, "Faltan datos indispensables para auditar la eliminación");
    }

    const [log] = await DeletionLog.create([{
      resourceType,
      resourceId: document._id,
      resourceTitle,
      createdBy: document.createdBy,
      ...(document.updatedBy ? { updatedBy: document.updatedBy } : {}),
      deletedBy,
      deletedAt: new Date(),
      resourceCreatedAt: document.createdAt,
      financialEdits: minimalEdits(document),
      // IDs temporales necesarios para limpiar Cloudinary tras el commit.
      pendingCloudinaryIds: receiptIds(document, resourceType),
    }], { session });

    return log._id;
  });

  // La eliminación está confirmada. Cloudinary no participa en transacciones;
  // cualquier fallo queda registrado para un reintento seguro.
  try {
    return { deleted: true, ...(await cleanupFinancialReceipts(logId)) };
  } catch (error) {
    console.error("No fue posible completar la limpieza del comprobante:", error.message);
    return { deleted: true, cleanupPending: true };
  }
}
