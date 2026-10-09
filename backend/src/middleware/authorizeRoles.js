
/* ========================================================= */
/* MIDDLEWARE DE AUTORIZACIÓN POR ROLES */
/* ========================================================= */

// Este middleware comprueba si el usuario autenticado
// tiene permiso para acceder a una ruta determinada.
//
// IMPORTANTE:
//
// authenticateUser debe ejecutarse primero,
// porque es quien obtiene el usuario desde
// la sesión y lo incorpora a req.user.


// =========================================================
// CREAR MIDDLEWARE
// =========================================================

const authorizeRoles = (...allowedRoles) => {

    // Retornamos un middleware compatible con Express.
    return (req, res, next) => {

        // =================================================
        // COMPROBAR AUTENTICACIÓN
        // =================================================

        // Si authenticateUser no ha proporcionado
        // un usuario, rechazamos la solicitud.

        if (!req.user) {

            return res.status(401).json({

                success: false,

                message:
                    "Debes iniciar sesión para acceder a este recurso",

            });

        }


        // =================================================
        // OBTENER ROL ACTUAL
        // =================================================

        // El rol proviene del usuario autenticado
        // por el backend, no de un valor enviado
        // desde el navegador.

        const userRole = req.user.role;


        // =================================================
        // COMPROBAR AUTORIZACIÓN
        // =================================================

        const hasPermission =
            allowedRoles.includes(userRole);


        // Si el rol no está autorizado,
        // impedimos continuar con la solicitud.

        if (!hasPermission) {

            return res.status(403).json({

                success: false,

                message:
                    "No tienes permisos para realizar esta operación",

            });

        }


        // =================================================
        // AUTORIZACIÓN CORRECTA
        // =================================================

        // Permitimos que Express continúe
        // con el siguiente middleware
        // o controlador.

        return next();

    };

};


// =========================================================
// EXPORTACIÓN
// =========================================================

export default authorizeRoles;
