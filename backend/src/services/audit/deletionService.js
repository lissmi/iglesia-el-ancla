// =========================================================
// SERVICIO CENTRAL DE ELIMINACIONES CON AUDITORÍA
// Archivo: backend/src/services/audit/deletionService.js
// =========================================================

// Importamos Mongoose para ejecutar una transacción de MongoDB.
import mongoose from "mongoose";

// Reutilizamos el modelo liviano de eliminaciones.
import DeletionLog from "../../models/DeletionLog.js";


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
    const resourceTitle = String(deleted.title || "").trim().slice(0, 160);

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
