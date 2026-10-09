
import { Router } from "express";

import User from "../models/User.js";

import authenticateUser from "../middleware/authenticateUser.js";

import authorizeRoles from "../middleware/authorizeRoles.js";


// =========================================================
// ROUTER DE GESTIÓN DE USUARIOS
// =========================================================

const router = Router();


// =========================================================
// PROTECCIÓN GENERAL
// =========================================================

// Todas las rutas de este archivo requieren:
//
// 1. Una sesión autenticada.
// 2. El rol de superadministrador.
//
// El rol se comprueba en el backend.

router.use(
    authenticateUser,
    authorizeRoles("super_admin")
);


// =========================================================
// CAMPOS PERMITIDOS EN LAS CONSULTAS
// =========================================================

// Seleccionamos únicamente los campos que
// necesita el panel de gestión de usuarios.
//
// No incluimos contraseñas, tokens,
// intentos fallidos ni información interna.

const USER_PUBLIC_FIELDS = [
    "firstName",
    "lastName",
    "email",
    "phone",
    "birthDate",
    "role",
    "sucursales",
    "sucursalPrincipal",
    "isActive",
    "deactivatedAt",
    "lastLoginAt",
    "createdAt",
    "updatedAt",
].join(" ");


// =========================================================
// ESTADÍSTICAS DE USUARIOS
// =========================================================

// GET /api/users/stats
//
// Retorna las cantidades que necesita
// el componente UsersSummary.jsx.

router.get(
    "/stats",

    async (req, res, next) => {

        try {

            // Ejecutamos las consultas en paralelo.
            const [
                totalUsers,
                activeUsers,
                inactiveUsers,
                administrators,
            ] = await Promise.all([

                User.countDocuments(),

                User.countDocuments({
                    isActive: true,
                }),

                User.countDocuments({
                    isActive: false,
                }),

                User.countDocuments({
                    role: "admin",
                }),

            ]);


            // Retornamos las estadísticas.
            return res.status(200).json({

                success: true,

                stats: {
                    totalUsers,
                    activeUsers,
                    inactiveUsers,
                    administrators,
                },

            });

        } catch (error) {

            return next(error);

        }

    }
);


// =========================================================
// LISTADO DE USUARIOS
// =========================================================

// GET /api/users
//
// Obtiene las cuentas registradas,
// ordenadas desde la más reciente.
//
// Por ahora no implementaremos filtros
// desde MongoDB, porque UsersTable.jsx
// ya dispone de filtros locales.
//
// Posteriormente podremos incorporar
// paginación y filtros del servidor.

router.get(
    "/",

    async (req, res, next) => {

        try {

            // Consultamos las cuentas registradas.
            const users = await User.find({})

                // Limitamos los campos retornados.
                .select(USER_PUBLIC_FIELDS)

                // Obtenemos los datos de las sucursales.
                .populate({
                    path: "sucursales",
                    select: "code name slug isActive",
                })

                // Obtenemos la sucursal principal.
                .populate({
                    path: "sucursalPrincipal",
                    select: "code name slug isActive",
                })

                // Mostramos primero las cuentas recientes.
                .sort({
                    createdAt: -1,
                })

                // Límite temporal para evitar
                // respuestas excesivamente grandes.
                .limit(100);


            // Retornamos el resultado.
            return res.status(200).json({

                success: true,

                users,

                count: users.length,

            });

        } catch (error) {

            return next(error);

        }

    }
);


// =========================================================
// EXPORTACIÓN
// =========================================================

export default router;
