//backend/src/routes/loginRoutes.js

// Importamos Router para crear
// las rutas de inicio de sesión.
import {
    Router,
} from "express";


// Importamos express-rate-limit para limitar
// los intentos enviados desde una dirección IP.
import rateLimit from "express-rate-limit";


// Importamos el modelo único de usuarios.
//
// Este modelo contiene miembros,
// administradores y superadministradores.
import User from "../models/User.js";


// Importamos el modelo Sucursal.
//
// Lo utilizaremos expresamente en populate()
// para obtener la información de las sucursales.
import Sucursal from "../models/Sucursal.js";


// Importamos las funciones relacionadas
// con las contraseñas.
import {
    comparePassword,
    hashPassword,
} from "../utils/passwordUtils.js";


// Importamos las funciones relacionadas
// con el token y la cookie de sesión.
//
// Estos nombres reemplazarán las antiguas
// funciones exclusivas del administrador.
import {
    AUTH_COOKIE_NAME,
    generateAuthToken,
    getAuthCookieOptions,
    getAuthCookieClearOptions,
} from "../utils/tokenUtils.js";

// Importamos el middleware que comprueba
// si existe una sesión válida.
import authenticateUser from "../middleware/authenticateUser.js";

// Importamos las políticas de bloqueo centralizadas.
// El login y la futura vista de Seguridad usarán estos mismos valores.
import {
    MAX_LOGIN_ATTEMPTS,
    ACCOUNT_LOCK_TIME_MS,
    LOGIN_RATE_LIMIT_WINDOW_MS,
    LOGIN_RATE_LIMIT_MAX_REQUESTS,
} from "../config/loginSecurityPolicy.js";




// Creamos el router de inicio de sesión.
const router = Router();


// Creamos un mensaje genérico.
//
// Usaremos el mismo mensaje cuando:
// - El correo no exista.
// - La contraseña sea incorrecta.
// - La cuenta esté bloqueada.
// - La cuenta esté desactivada.
//
// Esto ayuda a impedir que una persona
// descubra qué correos están registrados.
const LOGIN_FAILED_MESSAGE =
    "No fue posible iniciar sesión con las credenciales proporcionadas";


// Creamos una contraseña ficticia cifrada.
//
// La utilizaremos cuando el correo no exista,
// reduciendo diferencias en los tiempos
// de respuesta del servidor.
const dummyPasswordHashPromise =
    hashPassword(
        "DummyAccessPassword1!"
    );


// =========================================================
// LÍMITE DE INTENTOS POR DIRECCIÓN IP
// =========================================================

// Creamos un límite específico
// para el endpoint de inicio de sesión.
const loginLimiter = rateLimit({
    // Utilizamos una ventana
    // de quince minutos.
    windowMs:
        LOGIN_RATE_LIMIT_WINDOW_MS,

    // Permitimos diez solicitudes
    // por dirección IP.
    limit: LOGIN_RATE_LIMIT_MAX_REQUESTS,

    // Enviamos encabezados modernos
    // informando el límite.
    standardHeaders:
        "draft-8",

    // Desactivamos los encabezados antiguos.
    legacyHeaders: false,

    // Los accesos exitosos no cuentan
    // dentro del límite.
    skipSuccessfulRequests: true,

    // Retornamos una respuesta
    // JSON controlada.
    message: {
        success: false,

        message:
            "Se realizaron demasiados intentos. Inténtalo nuevamente más tarde.",
    },
});


// =========================================================
// REGISTRO DE INTENTOS FALLIDOS
// =========================================================

// Creamos una función que registra
// un intento fallido de acceso.
const registerFailedLogin = async (
    user
) => {

    // Obtenemos la fecha actual.
    const currentDate =
        new Date();


    // Comprobamos si existía
    // un bloqueo anterior ya vencido.
    const previousLockExpired =
        user.lockUntil &&
        user.lockUntil <= currentDate;


    // Si el bloqueo anterior terminó,
    // comenzamos el contador desde cero.
    const currentAttempts =
        previousLockExpired
            ? 0
            : user.loginAttempts || 0;


    // Sumamos el nuevo intento.
    const newAttempts =
        currentAttempts + 1;


    // Preparamos los campos
    // que serán actualizados.
    const updateData = {
        loginAttempts:
            newAttempts,
    };


    // Si se alcanzó el límite,
    // bloqueamos temporalmente la cuenta.
    if (
        newAttempts >=
        MAX_LOGIN_ATTEMPTS
    ) {
        updateData.lockUntil =
            new Date(
                Date.now() +
                ACCOUNT_LOCK_TIME_MS
            );
    } else if (
        previousLockExpired
    ) {

        // Si el bloqueo anterior venció,
        // eliminamos su fecha.
        updateData.lockUntil =
            null;
    }


    // Actualizamos solamente
    // los datos de autenticación.
    await User.updateOne(
        {
            _id: user._id,
        },
        {
            $set: updateData,
        }
    );
};


// =========================================================
// INICIO DE SESIÓN GENERAL
// =========================================================

// Creamos el endpoint:
//
// POST /api/auth/login
//
// Esta ruta permitirá iniciar sesión a:
// - Miembros.
// - Administradores.
// - Superadministradores.
router.post(
    "/login",

    // Aplicamos el límite
    // específico del login.
    loginLimiter,

    // Creamos el controlador
    // de la ruta.
    async (
        req,
        res,
        next
    ) => {

        try {
            // Obtenemos las credenciales
            // enviadas desde React.
            const {
                email,
                password,
            } = req.body;


            // Comprobamos que el correo
            // sea una cadena no vacía.
            if (
                typeof email !== "string" ||
                !email.trim()
            ) {
                return res.status(400).json({
                    success: false,

                    message:
                        "Debes ingresar el correo electrónico",
                });
            }


            // Evitamos procesar correos
            // excesivamente largos.
            if (
                email.trim().length > 150
            ) {
                return res.status(400).json({
                    success: false,

                    message:
                        "El correo electrónico ingresado no es válido",
                });
            }


            // Comprobamos que la contraseña
            // sea una cadena no vacía.
            if (
                typeof password !== "string" ||
                !password
            ) {
                return res.status(400).json({
                    success: false,

                    message:
                        "Debes ingresar la contraseña",
                });
            }


            // bcrypt procesa como máximo
            // 72 bytes de una contraseña.
            //
            // Rechazamos valores más largos
            // para evitar truncamientos silenciosos.
            if (
                Buffer.byteLength(
                    password,
                    "utf8"
                ) > 72
            ) {
                return res.status(400).json({
                    success: false,

                    message:
                        "La contraseña ingresada no es válida",
                });
            }


            // Normalizamos el correo recibido.
            const normalizedEmail =
                email
                    .trim()
                    .toLowerCase();


            // Buscamos la cuenta sin importar
            // si corresponde a un miembro,
            // administrador o superadministrador.
            const user =
                await User.findOne({
                    email:
                        normalizedEmail,
                })

                    // Seleccionamos manualmente
                    // los campos privados necesarios
                    // para comprobar el acceso.
                    .select(
                        "+passwordHash +loginAttempts +lockUntil +tokenVersion"
                    )

                    // Obtenemos las sucursales
                    // relacionadas con el usuario.
                    .populate({
                        // Campo que será poblado.
                        path:
                            "sucursales",

                        // Modelo relacionado.
                        model:
                            Sucursal,

                        // Campos que necesitamos.
                        select:
                            "code name slug timezone isActive",
                    })

                    // Obtenemos la sucursal
                    // principal del usuario.
                    .populate({
                        // Campo que será poblado.
                        path:
                            "sucursalPrincipal",

                        // Modelo relacionado.
                        model:
                            Sucursal,

                        // Campos que necesitamos.
                        select:
                            "code name slug timezone isActive",
                    });


            // Si el correo no existe,
            // realizamos una comparación ficticia.
            if (!user) {
                // Esperamos el hash
                // ficticio preparado.
                const dummyPasswordHash =
                    await dummyPasswordHashPromise;


                // Ejecutamos una comparación
                // para reducir diferencias
                // en los tiempos de respuesta.
                await comparePassword(
                    password,
                    dummyPasswordHash
                );


                // Retornamos el mensaje genérico.
                return res.status(401).json({
                    success: false,

                    message:
                        LOGIN_FAILED_MESSAGE,
                });
            }


            // Obtenemos el momento actual.
            const currentDate =
                new Date();


            // Comprobamos si la cuenta
            // está temporalmente bloqueada.
            const accountIsLocked =
                user.lockUntil &&
                user.lockUntil >
                currentDate;


            // Rechazamos una cuenta bloqueada
            // utilizando el mensaje genérico.
            if (accountIsLocked) {
                return res.status(401).json({
                    success: false,

                    message:
                        LOGIN_FAILED_MESSAGE,
                });
            }


            // Comparamos la contraseña recibida
            // con el hash almacenado.
            const passwordIsValid =
                await comparePassword(
                    password,
                    user.passwordHash
                );


            // Si la contraseña es incorrecta,
            // registramos el intento fallido.
            if (!passwordIsValid) {
                await registerFailedLogin(
                    user
                );


                // Retornamos el mensaje genérico.
                return res.status(401).json({
                    success: false,

                    message:
                        LOGIN_FAILED_MESSAGE,
                });
            }


            // Impedimos el acceso
            // si la cuenta está desactivada.
            if (!user.isActive) {
                return res.status(401).json({
                    success: false,

                    message:
                        LOGIN_FAILED_MESSAGE,
                });
            }


            // Dejamos solamente
            // las sucursales activas.
            const activeSucursales =
                user.sucursales.filter(
                    (sucursal) =>
                        sucursal &&
                        sucursal.isActive
                );


            // Comprobamos que el usuario
            // tenga al menos una sucursal activa.
            if (
                activeSucursales.length === 0
            ) {
                return res.status(401).json({
                    success: false,

                    message:
                        LOGIN_FAILED_MESSAGE,
                });
            }


            // Comprobamos que la sucursal
            // principal exista y esté activa.
            if (
                !user.sucursalPrincipal ||
                !user.sucursalPrincipal.isActive
            ) {
                return res.status(401).json({
                    success: false,

                    message:
                        LOGIN_FAILED_MESSAGE,
                });
            }


            // Reiniciamos los intentos fallidos
            // y registramos el acceso exitoso.
            await User.updateOne(
                {
                    _id: user._id,
                },
                {
                    $set: {
                        loginAttempts: 0,
                        lockUntil: null,
                        lastLoginAt:
                            currentDate,
                    },
                }
            );


            // Obtenemos la versión actual
            // de las sesiones del usuario.
            const tokenVersion =
                user.tokenVersion ?? 0;


            // Generamos un token general.
            //
            // No incluimos el rol dentro del token,
            // porque el middleware lo comprobará
            // directamente en MongoDB.
            const token =
                generateAuthToken({
                    userId:
                        user._id,

                    tokenVersion,
                });


            // Guardamos el token dentro
            // de una cookie HttpOnly.
            res.cookie(
                AUTH_COOKIE_NAME,
                token,
                getAuthCookieOptions()
            );


            // Creamos un mapa cerrado
            // que relaciona cada rol
            // con su página principal.
            //
            // Esto nos permite diferenciar
            // correctamente entre:
            //
            // - Miembro.
            // - Administrador.
            // - Superadministrador.
            const destinationsByRole = {
                // Los miembros registrados
                // ingresan a su área privada.
                member: "/member",

                // Los administradores normales
                // ingresan al panel limitado.
                admin: "/admin",

                // Los superadministradores
                // ingresan al panel completo.
                super_admin: "/super-admin",
            };


            // Obtenemos la ruta correspondiente
            // al rol actual del usuario.
            //
            // El rol proviene de MongoDB,
            // no del navegador.
            const destination =
                destinationsByRole[
                user.role
                ];


            // Retornamos solamente
            // información segura y necesaria.
            return res.status(200).json({
                success: true,

                message:
                    "Inicio de sesión realizado correctamente",

                // Esta dirección sirve solamente
                // para la navegación de React.
                //
                // La autorización real siempre
                // será comprobada por el backend.
                destination,

                user: {
                    // Identificador del usuario.
                    id:
                        user._id,

                    // Nombre.
                    firstName:
                        user.firstName,

                    // Apellido.
                    lastName:
                        user.lastName,

                    // Nombre completo.
                    fullName:
                        `${user.firstName} ${user.lastName}`,

                    // Correo.
                    email:
                        user.email,

                    // Fecha de verificación del correo electrónico.
                    // null significa que todavía no está verificado.
                    emailVerifiedAt:
                        user.emailVerifiedAt ?? null,

                    // Rol actual.
                    role:
                        user.role,

                    // Indica si debe cambiar
                    // la contraseña temporal.
                    mustChangePassword:
                        user.mustChangePassword,

                    // Sucursal principal.
                    sucursalPrincipal:
                        user.sucursalPrincipal,

                    // Sucursales relacionadas.
                    sucursales:
                        activeSucursales,
                },
            });
        } catch (error) {

            // Enviamos cualquier error inesperado
            // al middleware global.
            next(error);
        }
    }
);


// =========================================================
// SESIÓN ACTUAL
// =========================================================

// Creamos el endpoint:
//
// GET /api/auth/me
//
// Esta ruta permite saber qué usuario
// tiene actualmente una sesión válida.
//
// A diferencia del login,
// aquí no recibimos correo ni contraseña.
//
// El usuario se obtiene directamente
// desde la cookie JWT mediante authenticateUser.
router.get(
    "/me",

    // Primero comprobamos
    // que exista una sesión válida.
    authenticateUser,

    // Si la sesión es válida,
    // authenticateUser habrá dejado
    // el usuario actual dentro de req.user.
    async (
        req,
        res,
        next
    ) => {

        try {

            // Obtenemos el usuario
            // previamente autenticado.
            const user =
                req.user;


            // Retornamos solamente
            // la información necesaria
            // para identificar la sesión.
            return res.status(200).json({
                success: true,

                user: {

                    // Identificador.
                    id:
                        user._id,

                    // Nombre.
                    firstName:
                        user.firstName,

                    // Apellido.
                    lastName:
                        user.lastName,

                    // Nombre completo.
                    fullName:
                        `${user.firstName} ${user.lastName}`,

                    // Correo electrónico.
                    email:
                        user.email,

                    // Fecha en que se verificó el correo.
                    // null indica que la verificación está pendiente.
                    emailVerifiedAt:
                        user.emailVerifiedAt ?? null,

                    // Rol actual.
                    role:
                        user.role,

                    // Indica si el usuario
                    // debe cambiar su contraseña.
                    mustChangePassword:
                        user.mustChangePassword,

                    // Sucursal principal.
                    sucursalPrincipal:
                        user.sucursalPrincipal,

                    // Sucursales asignadas.
                    sucursales:
                        user.sucursales,
                },
            });

        } catch (error) {

            // Enviamos cualquier error inesperado
            // al middleware global de errores.
            return next(error);
        }
    }
);

// =========================================================
// CIERRE DE SESIÓN
// =========================================================

// Creamos el endpoint:
//
// POST /api/auth/logout
//
// Esta ruta elimina la cookie
// que contiene la sesión del usuario.
//
// No necesitamos recibir correo,
// contraseña ni ningún otro dato.
router.post(
    "/logout",

    (
        req,
        res
    ) => {

        // Eliminamos la cookie
        // utilizando las mismas opciones
        // con las que fue creada.
        res.clearCookie(
            AUTH_COOKIE_NAME,
            getAuthCookieClearOptions()
        );


        // Confirmamos al frontend
        // que el cierre de sesión
        // se realizó correctamente.
        return res.status(200).json({
            success: true,

            message:
                "Sesión cerrada correctamente",
        });
    }
);


// Exportamos el router
// para montarlo dentro de app.js.
export default router;