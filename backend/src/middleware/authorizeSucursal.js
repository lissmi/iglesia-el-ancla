// =========================================================
// AUTORIZACIÓN DE ACCESO A UNA SUCURSAL
// =========================================================
// Uso previsto (después de authenticateUser y authorizeRoles):
// router.get('/:sucursalId/...', authenticateUser,
//   authorizeRoles('admin', 'super_admin'),
//   authorizeSucursal(), controlador);
//
// La sucursal siempre se identifica mediante un parámetro
// explícito de la ruta. Nunca se elige silenciosamente desde
// req.body, req.query o la sucursal principal del usuario.

import mongoose from 'mongoose';
import Sucursal from '../models/Sucursal.js';

// Extraemos un identificador tanto de ObjectId como de un
// documento poblado de Mongoose.
const getId = (value) => {
  const candidate = value?._id ?? value;
  return candidate?.toString?.() ?? null;
};

// Permite elegir un nombre de parámetro distinto de sucursalId
// cuando la ruta lo necesita. No concede privilegios adicionales
// a super_admin: cada sede operativa debe estar asignada al usuario.
const authorizeSucursal = ({ param = 'sucursalId' } = {}) => {
  if (typeof param !== 'string' || !/^[a-zA-Z][a-zA-Z0-9_]*$/.test(param)) {
    throw new TypeError('El nombre del parámetro de sucursal no es válido');
  }

  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Debes iniciar sesión para acceder a este recurso',
        });
      }

      // No aceptamos identificadores proporcionados a través de
      // cuerpos o consultas, ni usamos una sede por defecto.
      const requestedId = req.params?.[param];
      if (typeof requestedId !== 'string' || !mongoose.isObjectIdOrHexString(requestedId)) {
        return res.status(400).json({
          success: false,
          message: 'El identificador de la sucursal no es válido',
        });
      }

      // Validación basada en las asignaciones verificadas durante
      // authenticateUser, no en un rol declarado por el navegador.
      const assigned = Array.isArray(req.user.sucursales)
        ? req.user.sucursales
        : [];
      const hasAssignment = assigned.some((branch) => getId(branch) === requestedId);

      // Usamos una respuesta uniforme para no confirmar si
      // una sede no autorizada existe o no.
      if (!hasAssignment) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a esta sucursal',
        });
      }

      // Consultamos el estado actual. Las asignaciones pueden
      // haber cambiado desde la autenticación de la solicitud.
      const sucursal = await Sucursal.findOne({
        _id: requestedId,
        isActive: true,
      }).select('_id code name slug timezone isActive');

      if (!sucursal) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a esta sucursal',
        });
      }

      // El controlador ya no necesita volver a interpretar
      // un ID recibido del cliente para determinar el alcance.
      req.sucursal = sucursal;
      return next();
    } catch (error) {
      return next(error);
    }
  };
};

export default authorizeSucursal;
