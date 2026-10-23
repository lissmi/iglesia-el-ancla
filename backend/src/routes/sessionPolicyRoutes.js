// =========================================================
// CONSULTA DE POLÍTICA DE SESIÓN (SOLO LECTURA)
// =========================================================
// No devuelve tokens, cookies de sesión ni claves de firma.
// Las duraciones provienen de la misma configuración usada
// por tokenUtils.js; la duración JWT se presenta tal cual
// fue configurada y la cookie en milisegundos.

import { Router } from "express";

import authenticateUser from "../middleware/authenticateUser.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import { getAuthCookieOptions } from "../utils/tokenUtils.js";

const router = Router();

// Solo el superadministrador puede consultar la política.
router.use(authenticateUser, authorizeRoles("super_admin"));

// GET /api/system/session-policy
router.get("/", (req, res, next) => {
  try {
    // Se usa el mismo valor de expiración que generateAuthToken.
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "2h";

    // La duración se obtiene de la configuración real de la cookie.
    const cookieOptions = getAuthCookieOptions();

    // Impedimos almacenar datos de configuración administrativa.
    res.set("Cache-Control", "no-store");

    return res.status(200).json({
      success: true,
      policy: {
        jwtExpiresIn,
        cookieMaxAgeMs: cookieOptions.maxAge,
        httpOnly: cookieOptions.httpOnly,
        secure: cookieOptions.secure,
        sameSite: cookieOptions.sameSite,
        sessionVersioning: true,
        editable: false,
      },
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
