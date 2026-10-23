// =========================================================
// CONSULTA ADMINISTRATIVA DE LA POLÍTICA DE BLOQUEO
// =========================================================
// GET /api/system/login-security-policy
// Solo lectura. No devuelve intentos, direcciones IP ni datos
// personales de cuentas registradas.

import { Router } from "express";

import authenticateUser from "../middleware/authenticateUser.js";
import authorizeRoles from "../middleware/authorizeRoles.js";

import {
  MAX_LOGIN_ATTEMPTS,
  ACCOUNT_LOCK_TIME_MS,
  LOGIN_RATE_LIMIT_WINDOW_MS,
  LOGIN_RATE_LIMIT_MAX_REQUESTS,
} from "../config/loginSecurityPolicy.js";

const router = Router();

// Protegemos todas las rutas de este router.
router.use(authenticateUser, authorizeRoles("super_admin"));

// =========================================================
// GET / — PARÁMETROS VIGENTES DE PROTECCIÓN DEL LOGIN
// =========================================================
router.get("/", (req, res) => {
  // La configuración administrativa no debe quedar almacenada
  // en cachés compartidas ni en el navegador.
  res.set("Cache-Control", "no-store");

  return res.status(200).json({
    success: true,
    policy: {
      accountLock: {
        maxFailedAttempts: MAX_LOGIN_ATTEMPTS,
        lockDurationMs: ACCOUNT_LOCK_TIME_MS,
      },
      ipRateLimit: {
        windowMs: LOGIN_RATE_LIMIT_WINDOW_MS,
        maxRequests: LOGIN_RATE_LIMIT_MAX_REQUESTS,
        successfulRequestsExcluded: true,
      },
      readOnly: true,
    },
  });
});

export default router;
