// =========================================================
// GOOGLE OAUTH 2.0 — AUTORIZACIÓN INSTITUCIONAL DE GMAIL
// =========================================================
// POST /api/auth/google/connect: inicia la autorización.
// GET  /api/auth/google/callback: valida y almacena el permiso.
// Nunca devuelve tokens ni códigos OAuth al navegador.

import { Router } from "express";
import { randomBytes, timingSafeEqual } from "node:crypto";

import authenticateUser from "../middleware/authenticateUser.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import {
  getGoogleOAuthClient,
  GMAIL_SCOPES,
} from "../services/mail/googleOAuthClient.js";
import { saveGoogleMailConnection } from "../services/mail/googleMailConnectionService.js";

const router = Router();
const OAUTH_STATE_COOKIE = "el_ancla_google_oauth_state";
const STATE_MAX_AGE_MS = 10 * 60 * 1000;
const isProduction = process.env.NODE_ENV === "production";

// La cookie solo se usa en estas rutas y nunca es accesible a JS.
const stateCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  path: "/api/auth/google",
};

// Además de gmail.send pedimos solo la identidad básica del correo.
// No solicitamos permisos para leer la bandeja.
const IDENTITY_SCOPES = ["openid", "email"];
const REQUIRED_GMAIL_SCOPE = "https://www.googleapis.com/auth/gmail.send";

function requireTrustedOrigin(req, res, next) {
  const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:3000";
  if (req.get("Origin") !== allowedOrigin) {
    return res.status(403).json({
      success: false,
      message: "Origen de la solicitud no autorizado",
    });
  }
  return next();
}

function statesMatch(received, expected) {
  if (
    typeof received !== "string" ||
    typeof expected !== "string" ||
    !/^[a-f0-9]{64}$/.test(received) ||
    !/^[a-f0-9]{64}$/.test(expected)
  ) return false;

  return timingSafeEqual(
    Buffer.from(received, "hex"),
    Buffer.from(expected, "hex")
  );
}

function safeCallbackResponse(res, status, message) {
  return res.status(status).json({ success: status === 200, message });
}

// =========================================================
// INICIAR AUTORIZACIÓN: SOLO SUPERADMINISTRADOR
// =========================================================
router.post(
  "/connect",
  authenticateUser,
  authorizeRoles("super_admin"),
  requireTrustedOrigin,
  (req, res, next) => {
    try {
      const state = randomBytes(32).toString("hex");
      const oauthClient = getGoogleOAuthClient();

      const authorizationUrl = oauthClient.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: [...new Set([...GMAIL_SCOPES, ...IDENTITY_SCOPES])],
        state,
      });

      res.cookie(OAUTH_STATE_COOKIE, state, {
        ...stateCookieOptions,
        maxAge: STATE_MAX_AGE_MS,
      });
      res.set("Cache-Control", "no-store");
      return res.status(200).json({ success: true, authorizationUrl });
    } catch (error) {
      return next(error);
    }
  }
);

// =========================================================
// RETORNO DE GOOGLE: VERIFICAR ESTADO, IDENTIDAD Y PERMISOS
// =========================================================
router.get(
  "/callback",
  authenticateUser,
  authorizeRoles("super_admin"),
  async (req, res) => {
    res.set("Cache-Control", "no-store");
    res.set("Referrer-Policy", "no-referrer");

    const expectedState = req.cookies?.[OAUTH_STATE_COOKIE];
    res.clearCookie(OAUTH_STATE_COOKIE, stateCookieOptions);

    if (!statesMatch(req.query.state, expectedState)) {
      return safeCallbackResponse(
        res, 403, "No se pudo verificar la solicitud de autorización de Google"
      );
    }

    if (req.query.error) {
      return safeCallbackResponse(res, 400, "La autorización de Google fue cancelada");
    }

    if (typeof req.query.code !== "string" || !req.query.code) {
      return safeCallbackResponse(res, 400, "Google no devolvió un código de autorización válido");
    }

    try {
      const oauthClient = getGoogleOAuthClient();

      // El código solo se usa una vez y nunca se almacena ni imprime.
      const { tokens } = await oauthClient.getToken(req.query.code);

      // Se necesita un token renovable para enviar correos sin sesión abierta.
      if (typeof tokens.refresh_token !== "string" || !tokens.refresh_token) {
        return safeCallbackResponse(res, 400, "Google no proporcionó autorización permanente. Intenta conectar la cuenta nuevamente");
      }

      if (typeof tokens.id_token !== "string" || !tokens.id_token) {
        return safeCallbackResponse(res, 400, "No fue posible verificar la identidad de la cuenta Google");
      }

      // Verificamos firma, audiencia y validez del token de identidad.
      const ticket = await oauthClient.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const identity = ticket.getPayload();
      const actualEmail = identity?.email?.trim().toLowerCase();
      const senderEmail = process.env.GMAIL_SENDER_EMAIL?.trim().toLowerCase();

      if (!identity?.email_verified || !actualEmail || actualEmail !== senderEmail) {
        return safeCallbackResponse(res, 403, "La cuenta Google autorizada no corresponde al correo institucional");
      }

      // Google informa qué permisos concedió realmente el usuario.
      // No suponemos que se concedieron todos los solicitados.
      const grantedScopes = typeof tokens.scope === "string"
        ? tokens.scope.split(/\s+/).filter(Boolean)
        : [];

      if (!grantedScopes.includes(REQUIRED_GMAIL_SCOPE)) {
        return safeCallbackResponse(res, 403, "Google no autorizó el permiso necesario para enviar correos");
      }

      // El servicio cifra el refresh token antes de guardar en MongoDB.
      await saveGoogleMailConnection({
        senderEmail: actualEmail,
        refreshToken: tokens.refresh_token,
        scopes: grantedScopes,
      });

      return safeCallbackResponse(res, 200, "Correo institucional conectado correctamente");
    } catch (error) {
      // Nunca imprimimos aquí el error completo: algunas respuestas de
      // proveedores externos pueden contener datos sensibles.
      console.error("No se pudo completar la autorización institucional de Gmail");
      return safeCallbackResponse(res, 502, "No se pudo completar la conexión con Google. Vuelve a intentarlo");
    }
  }
);

export default router;
