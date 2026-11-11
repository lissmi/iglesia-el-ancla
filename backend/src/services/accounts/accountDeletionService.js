// =========================================================
// EL ANCLA - ELIMINACIÓN PRIVADA Y ATÓMICA DE UNA CUENTA
// Ruta: backend/src/services/accounts/accountDeletionService.js
// =========================================================

// Reutilizamos la transacción de Mongoose sobre MongoDB Atlas.
import mongoose from "mongoose";

// La cuenta es el único documento cuya identidad autoriza la operación.
import User from "../../models/User.js";

// Los intentos de pago necesitan una reconciliación antes de desvincularse.
import Donacion from "../../models/Donacion.js";

// Importamos exclusivamente modelos que contienen vínculos a miembros.
import PrayerRequest from "../../models/PrayerRequest.js";
import ActivityConfirmation from "../../models/ActivityConfirmation.js";
import Volunteer from "../../models/Volunteer.js";
import VolunteerAssignment from "../../models/VolunteerAssignment.js";
import BasicSupply from "../../models/BasicSupply.js";
import EmailVerificationCode from "../../models/EmailVerificationCode.js";
import PushSubscription from "../../models/PushSubscription.js";
import Martin from "../../models/Martin.js";
import DeletionLog from "../../models/DeletionLog.js";

// Los siguientes documentos institucionales pueden tener autores administrativos.
// No podemos borrar una antigua cuenta administrativa sin revisar esta trazabilidad.
import Activity from "../../models/Activity.js";
import Event from "../../models/Event.js";
import Income from "../../models/Income.js";
import Expense from "../../models/Expense.js";
import LibraryBook from "../../models/LibraryBook.js";
import Song from "../../models/Song.js";
import Recommendation from "../../models/Recommendation.js";
import ResourceContent from "../../models/ResourceContent.js";
import Belonging, { BelongingMovement } from "../../models/Belonging.js";
import InformationalPage from "../../models/InformationalPage.js";
import SystemSettings from "../../models/SystemSettings.js";

// Definimos la frase exacta, también verificada por el servidor.
export const DELETE_ACCOUNT_PHRASE = "quiero eliminar mi cuenta";

// La operación de Webpay debe finalizar antes de que se pierda la identidad del aportante.
const UNRESOLVED_DONATION_STATES = [
  "pendiente", "iniciada", "confirmando", "revision", "error",
];

// Creamos errores explícitos que las rutas pueden traducir a respuestas HTTP.
function accountError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

// Comprobamos que no queden registros institucionales de autoría de este usuario.
// Este caso puede darse si alguna vez fue administrador y luego cambió de rol.
async function assertNoInstitutionalAuthorship(userId, session) {
  const models = [
    Activity, Event, Income, Expense, LibraryBook, Song,
    Recommendation, ResourceContent, Belonging, BelongingMovement,
    InformationalPage, SystemSettings, BasicSupply, VolunteerAssignment,
  ];

  // Recorremos las colecciones únicamente al eliminar la cuenta.
  for (const model of models) {
    const count = await model.countDocuments({
      $or: [
        { createdBy: userId }, { updatedBy: userId },
        { deletedBy: userId }, { draftUpdatedBy: userId },
        { publishedBy: userId }, { by: userId },
        { "history.by": userId }, { "movements.by": userId },
      ],
    }).session(session);

    // Requiere revisión/traspaso; evitamos dejar auditorías institucionales huérfanas.
    if (count > 0) {
      throw accountError(
        409,
        "Esta cuenta tiene registros institucionales asociados. Solicita al equipo de la iglesia que revise su eliminación."
      );
    }
  }

  // Los administradores pueden haber creado perfiles para otros miembros.
  // Si fueron degradados de rol, su autoría no se puede retirar automáticamente.
  const managedVolunteers = await Volunteer.countDocuments({
    createdBy: userId,
    userId: { $ne: userId },
  }).session(session);
  if (managedVolunteers > 0) {
    throw accountError(409, "Existen registros de voluntariado gestionados por esta cuenta que requieren revisión.");
  }

  // Protegemos las peticiones de terceros que el usuario pudo editar cuando era admin.
  const editedPrayers = await PrayerRequest.countDocuments({
    updatedBy: userId,
    createdBy: { $ne: userId },
  }).session(session);
  if (editedPrayers > 0) {
    throw accountError(409, "Existen peticiones ajenas editadas por esta cuenta que requieren revisión.");
  }

  // Los movimientos de stock también requieren trazabilidad institucional.
  const movementCount = await BasicSupply.countDocuments({
    "movements.by": userId,
  }).session(session);
  if (movementCount > 0) {
    throw accountError(409, "Hay movimientos de inventario que requieren revisión antes de eliminar la cuenta.");
  }
}

// Realizamos todos los cambios de MongoDB en una sola transacción.
// Si falla cualquier paso, no se confirma ninguna eliminación parcial.
export async function deleteMemberAccount({ userId, expectedPasswordHash }) {
  // No aceptamos IDs proporcionados por el navegador.
  if (!mongoose.isObjectIdOrHexString(userId) || !expectedPasswordHash) {
    throw accountError(401, "No se pudo verificar tu sesión.");
  }

  // Ejecutamos el conjunto completo con soporte de transacciones de Atlas.
  await mongoose.connection.transaction(async (session) => {
    // Revalidamos identidad, rol y credencial por si cambiaron en paralelo.
    const account = await User.findOne({
      _id: userId,
      role: "member",
      isActive: true,
      passwordHash: expectedPasswordHash,
    }).select("+passwordHash").session(session);

    // Ni administradores ni superadministradores pueden autodestruir su auditoría.
    if (!account) {
      throw accountError(409, "La cuenta cambió o no puede eliminarse mediante este procedimiento.");
    }

    // Evitamos romper una conciliación activa con Transbank.
    const unresolved = await Donacion.countDocuments({
      usuario: account._id,
      estado: { $in: UNRESOLVED_DONATION_STATES },
    }).session(session);

    // El miembro debe esperar la resolución del pago, sin perder sus fondos ni registros.
    if (unresolved > 0) {
      throw accountError(
        409,
        "Tienes aportes en proceso de verificación. Cuando finalice su conciliación, podrás eliminar tu cuenta."
      );
    }

    // Revisamos que el miembro no tenga antiguos registros de responsabilidad administrativa.
    await assertNoInstitutionalAuthorship(account._id, session);

    // Eliminamos peticiones propias, incluidas notas y datos sensibles que contienen.
    await PrayerRequest.deleteMany({ createdBy: account._id }, { session });

    // Retiramos sus participaciones de oración de las peticiones de terceros.
    await PrayerRequest.updateMany(
      { prayingMembers: account._id },
      { $pull: { prayingMembers: account._id } },
      { session }
    );

    // Quitamos confirmaciones y aportes prometidos a actividades comunitarias.
    await ActivityConfirmation.deleteMany({ member: account._id }, { session });

    // Eliminamos el perfil de voluntariado del miembro.
    await Volunteer.deleteMany({ userId: account._id }, { session });

    // Retiramos el miembro de turnos compartidos sin borrar los turnos institucionales.
    await VolunteerAssignment.updateMany(
      { "participants.userId": account._id },
      { $pull: { participants: { userId: account._id } } },
      { session }
    );

    // Tratamos los turnos heredados, que almacenaban el miembro en volunteerId.
    await VolunteerAssignment.updateMany(
      { volunteerId: account._id },
      { $set: { volunteerId: null, respondedAt: null } },
      { session }
    );

    // Cancelamos sus compromisos pendientes de insumos sin alterar el stock real.
    await BasicSupply.updateMany(
      { "pledges.member": account._id },
      { $pull: { pledges: { member: account._id } }, $inc: { __v: 1 } },
      { session }
    );

    // Borramos códigos temporales, suscripciones push y cuotas de Martín.
    await EmailVerificationCode.deleteMany({ user: account._id }, { session });
    await PushSubscription.deleteMany({ user: account._id }, { session });
    await Martin.deleteMany({ user: account._id }, { session });

    // Quitamos referencias del usuario en logs de eliminaciones previas.
    // No eliminamos auditorías institucionales de terceros; el filtro se limita al miembro.
    await DeletionLog.deleteMany({
      $or: [
        { createdBy: account._id },
        { updatedBy: account._id },
        { deletedBy: account._id },
        { "financialEdits.by": account._id },
      ],
    }, { session });

    // Los registros de Transbank ya finalizados conservan datos de conciliación.
    // Sólo se retira el vínculo con la cuenta: no se destruyen asientos de pago.
    // Usamos el driver nativo porque Donacion.usuario es inmutable en Mongoose.
    await Donacion.collection.updateMany(
      { usuario: account._id },
      { $set: { usuario: null }, $unset: { tokenWebpay: "" } },
      { session }
    );

    // Eliminamos físicamente al usuario al final de la transacción.
    const deleted = await User.deleteOne({
      _id: account._id,
      role: "member",
      isActive: true,
      passwordHash: expectedPasswordHash,
    }, { session });

    // Si otra operación modificó la cuenta, se revierte toda la transacción.
    if (deleted.deletedCount !== 1) {
      throw accountError(409, "La cuenta cambió durante la operación. Vuelve a intentarlo.");
    }
  });

  // El resultado sólo se informa después de confirmar el commit en MongoDB.
  return { success: true };
}
