//backend/src/middleware/authenticateUser.js

// Importamos Mongoose para validar
// el identificador contenido en el token.
import mongoose from "mongoose";


// Importamos el modelo común
// de miembros y administradores.
import User from "../models/User.js";


// Importamos el modelo de sucursales.
//
// Lo utilizaremos para obtener
// la información completa de las
// sucursales relacionadas con el usuario.
import Sucursal from "../models/Sucursal.js";


// Importamos el nombre de la cookie
// y el verificador del JWT actual.
import {
  AUTH_COOKIE_NAME,
  verifyAuthToken,
} from "../utils/tokenUtils.js";


// =========================================================
// AUTENTICACIÓN DEL USUARIO
// =========================================================

// Este middleware comprueba que:
//
// - Exista una cookie de sesión.
// - El JWT sea válido.
// - El usuario continúe existiendo.
// - La cuenta permanezca activa.
// - La sesión no haya sido invalidada.
// - Exista al menos una sucursal activa.
// - La sucursal principal continúe activa.
const authenticateUser = async (
  req,
  res,
  next
) => {

  try {

    // =====================================================
    // OBTENEMOS EL TOKEN
    // =====================================================

    // Leemos el JWT desde
    // la cookie HttpOnly.
    const token =
      req.cookies?.[AUTH_COOKIE_NAME];


    // Si no existe una cookie,
    // el usuario no tiene una
    // sesión autenticada.
    if (!token) {

      return res.status(401).json({
        success: false,

        message:
          "Debes iniciar sesión",
      });
    }


    // =====================================================
    // VERIFICAMOS EL JWT
    // =====================================================

    // Verificamos:
    //
    // - Firma.
    // - Expiración.
    // - Emisor.
    // - Audiencia.
    const decoded =
      verifyAuthToken(
        token
      );


    // =====================================================
    // VALIDAMOS EL IDENTIFICADOR
    // =====================================================

    // El identificador incluido
    // en el JWT debe ser un
    // ObjectId válido de MongoDB.
    if (
      !mongoose.isObjectIdOrHexString(
        decoded.sub
      )
    ) {

      return res.status(401).json({
        success: false,

        message:
          "La sesión no es válida",
      });
    }


    // =====================================================
    // BUSCAMOS EL USUARIO ACTUAL
    // =====================================================

    // Buscamos nuevamente al usuario
    // directamente en MongoDB.
    //
    // No confiamos solamente
    // en la información del JWT.
    const user =
      await User.findById(
        decoded.sub
      )


        // Recuperamos los campos internos necesarios
        // para comprobar y mantener la integridad
        // de la cuenta autenticada.
        //
        // tokenVersion:
        // Permite validar la vigencia de la sesión.
        //
        // superAdminSlot:
        // Permite conservar la posición asignada
        // al superadministrador cuando Mongoose
        // valida nuevamente el documento.
        //
        // Ambos campos mantienen select: false
        // en el esquema y no deben enviarse
        // al frontend.

        .select(
          "+tokenVersion +superAdminSlot"
        )



        // Obtenemos las sucursales
        // relacionadas con el usuario.
        .populate({
          path:
            "sucursales",

          model:
            Sucursal,

          select:
            "code name slug timezone isActive",
        })


        // Obtenemos también
        // la sucursal principal.
        .populate({
          path:
            "sucursalPrincipal",

          model:
            Sucursal,

          select:
            "code name slug timezone isActive",
        });


    // =====================================================
    // VALIDAMOS LA CUENTA
    // =====================================================

    // Una cuenta eliminada
    // o desactivada no puede
    // continuar usando su sesión.
    if (
      !user ||
      !user.isActive
    ) {

      return res.status(401).json({
        success: false,

        message:
          "La sesión no es válida",
      });
    }


    // =====================================================
    // VALIDAMOS LA VERSIÓN DEL TOKEN
    // =====================================================

    // tokenVersion permite invalidar
    // sesiones anteriores cuando:
    //
    // - Cambia la contraseña.
    // - Cambia el rol.
    // - Se desactiva la cuenta.
    // - Se cierran todas las sesiones.
    if (
      user.tokenVersion !==
      decoded.tokenVersion
    ) {

      return res.status(401).json({
        success: false,

        message:
          "La sesión no es válida",
      });
    }


    // =====================================================
    // VALIDAMOS LAS SUCURSALES
    // =====================================================

    // Dejamos solamente las sucursales
    // que actualmente se encuentran activas.
    const activeSucursales =
      user.sucursales.filter(
        (sucursal) =>
          sucursal &&
          sucursal.isActive
      );


    // El usuario debe mantener
    // al menos una sucursal activa.
    if (
      activeSucursales.length === 0
    ) {

      return res.status(401).json({
        success: false,

        message:
          "La sesión no es válida",
      });
    }


    // La sucursal principal
    // también debe seguir activa.
    if (
      !user.sucursalPrincipal ||
      !user.sucursalPrincipal.isActive
    ) {

      return res.status(401).json({
        success: false,

        message:
          "La sesión no es válida",
      });
    }


    // Reemplazamos el arreglo original
    // por las sucursales activas.
    user.sucursales =
      activeSucursales;


    // =====================================================
    // GUARDAMOS EL USUARIO AUTENTICADO
    // =====================================================

    // Dejamos el usuario verificado
    // disponible para las siguientes
    // protecciones o controladores.
    req.user =
      user;


    // Continuamos hacia
    // la siguiente función.
    return next();

  } catch (error) {

    // Un JWT vencido, alterado
    // o mal formado no autoriza
    // el acceso.
    return res.status(401).json({
      success: false,

      message:
        "La sesión no es válida o ha expirado",
    });
  }
};


// Exportamos el middleware
// para utilizarlo en rutas protegidas.
export default authenticateUser;