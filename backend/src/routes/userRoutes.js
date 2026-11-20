import { Router } from "express";
import mongoose from "mongoose";
import { createHash, randomBytes } from "node:crypto";
import rateLimit from "express-rate-limit";

import EmailVerificationCode from "../models/EmailVerificationCode.js";
import { hashPassword } from "../utils/passwordUtils.js";
import { sendInstitutionalEmail } from "../services/mail/gmailService.js";

import User from "../models/User.js";
import Sucursal from "../models/Sucursal.js";
import authenticateUser from "../middleware/authenticateUser.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import authorizeSucursal from "../middleware/authorizeSucursal.js";

// Protección independiente para la operación irreversible de eliminación.
import { comparePassword } from "../utils/passwordUtils.js";
import {
  AUTH_COOKIE_NAME,
  getAuthCookieClearOptions,
} from "../utils/tokenUtils.js";
import {
  DELETE_ACCOUNT_PHRASE,
  deleteMemberAccount,
} from "../services/accounts/accountDeletionService.js";


// =========================================================
// ROUTER DE GESTIÓN DE USUARIOS
// =========================================================

const router = Router();

// Todas las rutas requieren una sesión auténtica.
// La autorización por rol se aplica después según la operación.
router.use(authenticateUser);

// Nunca se incluyen contraseñas, tokens ni campos internos.
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

const BRANCH_PUBLIC_FIELDS = "code name slug isActive";

// =========================================================
// VALIDACIÓN DE ORIGEN PARA ESCRITURAS CON COOKIES
// =========================================================
// Defensa complementaria contra CSRF. Debe complementarse
// con tokens CSRF en la integración de producción.
const requireTrustedOrigin = (req, res, next) => {
  const origin = req.get("Origin");
  // Comparamos orígenes normalizados, no URLs con rutas ni / finales.
  let trustedOrigin;
  try {
    trustedOrigin = new URL(process.env.FRONTEND_URL || "http://localhost:3000").origin;
  } catch {
    return res.status(500).json({ success: false, message: "Origen web no configurado." });
  }

  if (origin !== trustedOrigin) {
    return res.status(403).json({
      success: false,
      message: "Origen de la solicitud no autorizado",
    });
  }

  return next();
};

// =========================================================
// FORMATO DE CONTACTO PARA EL REGISTRO Y PERFIL
// =========================================================

// El máximo de correo y teléfono también se valida en React.
const REGISTRATION_EMAIL_MAX_LENGTH = 50;

// El registro administrativo acepta móviles chilenos +56 9 con ocho dígitos.
// Para mantener el teléfono opcional, también se admite una cadena vacía.
const REGISTRATION_CHILE_MOBILE_PATTERN = /^\+56 9 [0-9]{4} [0-9]{4}$/;

// Validamos la estructura de correo y rechazamos dominios incompletos.
const REGISTRATION_EMAIL_PATTERN = /^[^\s@<>()[\],;:"\\]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

function isValidRegistrationEmail(value) {
  if (typeof value !== "string" || value.length > REGISTRATION_EMAIL_MAX_LENGTH) return false;
  const localPart = value.split("@")[0] || "";
  if (!localPart || localPart.length > 64 || localPart.startsWith(".") || localPart.endsWith(".") || localPart.includes("..")) return false;
  return REGISTRATION_EMAIL_PATTERN.test(value);
}

// La API no confía en el formulario: rechaza prefijos alterados,
// letras, más de ocho dígitos y números incompletos.
function isValidOptionalPhone(value) {
  return typeof value === "string" &&
    (value === "" || REGISTRATION_CHILE_MOBILE_PATTERN.test(value));
}

// =========================================================
// PERFIL PERSONAL: MI CUENTA (TODOS LOS ROLES)
// =========================================================
// Estas rutas deben ir antes de la restricción global super_admin.
// La identidad se obtiene de authenticateUser, nunca de un ID del cliente.

function serializeMyProfile(user) {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone || "",
    birthDate: user.birthDate
      ? user.birthDate.toISOString().slice(0, 10)
      : "",
    email: user.email,
    emailVerifiedAt: user.emailVerifiedAt ?? null,
    role: user.role,
    sucursalPrincipal: user.sucursalPrincipal?.name ?? null,
  };
}

// Devuelve únicamente el perfil del usuario que inició sesión.
router.get("/me/profile", async (req, res) => {
  res.set("Cache-Control", "no-store");
  return res.status(200).json({
    success: true,
    profile: serializeMyProfile(req.user),
  });
});

// Solo permite modificar nombre, apellido, teléfono y fecha de nacimiento.
// No acepta email, rol, estado, sucursales ni credenciales.
router.patch("/me/profile", requireTrustedOrigin, async (req, res, next) => {
  try {
    res.set("Cache-Control", "no-store");

    if (!req.is("application/json") || !req.body ||
      typeof req.body !== "object" || Array.isArray(req.body)) {
      return res.status(400).json({ success: false, message: "Datos inválidos" });
    }

    const allowed = ["firstName", "lastName", "phone", "birthDate"];
    const keys = Object.keys(req.body);
    if (keys.length !== allowed.length || allowed.some((key) => !Object.hasOwn(req.body, key))) {
      return res.status(400).json({
        success: false,
        message: "Solo puedes modificar nombre, apellido, teléfono y fecha de nacimiento",
      });
    }

    const { firstName, lastName, phone, birthDate } = req.body;
    if ([firstName, lastName, phone, birthDate].some((item) => typeof item !== "string")) {
      return res.status(400).json({ success: false, message: "Formato de datos no válido" });
    }

    const first = firstName.trim();
    const last = lastName.trim();
    const telephone = phone.trim();

    if (first.length < 2 || first.length > 60 || last.length < 2 || last.length > 60) {
      return res.status(400).json({
        success: false, message: "El nombre y apellido deben contener entre 2 y 60 caracteres",
      });
    }
    // El perfil también permite que el teléfono permanezca vacío.
    if (!isValidOptionalPhone(telephone)) {
      return res.status(400).json({
        success: false,
        message: "El teléfono debe tener entre 8 y 15 dígitos, sin letras, o quedar vacío",
      });
    }

    // Verificamos que sea una fecha calendario real en formato YYYY-MM-DD.
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
      return res.status(400).json({ success: false, message: "Fecha de nacimiento inválida" });
    }
    const date = new Date(`${birthDate}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== birthDate || date > new Date()) {
      return res.status(400).json({ success: false, message: "Fecha de nacimiento inválida" });
    }

    // req.user ya fue verificado por authenticateUser contra MongoDB.
    const user = req.user;
    user.firstName = first;
    user.lastName = last;
    user.phone = telephone || undefined;
    user.birthDate = date;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Tus datos personales fueron actualizados",
      profile: serializeMyProfile(user),
    });
  } catch (error) {
    return next(error);
  }
});

// =========================================================
// ELIMINACIÓN DEFINITIVA DE MI CUENTA (SOLO MEMBER)
// =========================================================

// Limitamos los intentos de contraseña y confirmación por dirección IP.
const deleteAccountLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Demasiados intentos. Inténtalo más tarde." },
});

// La identidad proviene de la cookie JWT, no de un ID enviado por el cliente.
router.post("/me/delete-account", requireTrustedOrigin, deleteAccountLimiter, async (req, res, next) => {
  try {
    // No guardamos en caché el resultado de una operación de cuenta.
    res.set("Cache-Control", "no-store");

    // Este flujo no debe destruir recursos propios de una cuenta administrativa.
    if (req.user.role !== "member") {
      return res.status(403).json({
        success: false,
        message: "Las cuentas administrativas requieren una revisión institucional para su eliminación.",
      });
    }

    // Rechazamos cargas incompletas, campos arbitrarios y cuerpos no JSON.
    if (!req.is("application/json") || !req.body ||
      typeof req.body !== "object" || Array.isArray(req.body) ||
      Object.keys(req.body).length !== 2 ||
      !Object.hasOwn(req.body, "confirmation") ||
      !Object.hasOwn(req.body, "password")) {
      return res.status(400).json({ success: false, message: "Solicitud de eliminación inválida." });
    }

    // El texto debe coincidir exactamente con lo mostrado en la pantalla.
    if (req.body.confirmation !== DELETE_ACCOUNT_PHRASE ||
      typeof req.body.password !== "string" ||
      req.body.password.length === 0 ||
      Buffer.byteLength(req.body.password, "utf8") > 72) {
      return res.status(400).json({ success: false, message: "La confirmación o contraseña no es válida." });
    }

    // La contraseña actual se recupera únicamente de la base de datos.
    const account = await User.findOne({ _id: req.user._id, role: "member", isActive: true })
      .select("+passwordHash");

    // No diferenciamos deliberadamente una cuenta inválida y una clave incorrecta.
    if (!account || !await comparePassword(req.body.password, account.passwordHash)) {
      return res.status(401).json({ success: false, message: "No pudimos verificar tu contraseña actual." });
    }

    // El servicio elimina datos personales y desvincula asientos contables cerrados.
    await deleteMemberAccount({
      userId: account._id,
      expectedPasswordHash: account.passwordHash,
    });

    // La cookie desaparece incluso si aún no ha caducado su JWT.
    res.clearCookie(AUTH_COOKIE_NAME, getAuthCookieClearOptions());

    // Ningún documento del perfil se incluye en esta respuesta.
    return res.status(200).json({
      success: true,
      message: "Tu cuenta y los datos personales eliminables se han retirado de la plataforma.",
    });
  } catch (error) {
    // Las reglas de conciliación y de auditoría devuelven errores controlados.
    if (error?.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    return next(error);
  }
});

// =========================================================
// CONSULTAS LIMITADAS A LA SUCURSAL (ADMIN / SUPER_ADMIN)
// =========================================================
// Estas rutas son independientes del listado institucional.
// Solo exponen miembros de la sede verificada por el servidor.
// No incluyen cuentas admin ni super_admin.
// IMPORTANTE: deben ir antes de la restricción global super_admin.

const MEMBER_BRANCH_FIELDS = [
  "firstName", "lastName", "email", "phone",
  "role", "isActive", "sucursalPrincipal", "sucursales",
].join(" ");

// GET /api/users/branch/:sucursalId/stats
router.get(
  "/branch/:sucursalId/stats",
  authorizeRoles("admin", "super_admin"),
  authorizeSucursal(),
  async (req, res, next) => {
    try {
      const scope = { role: "member", sucursales: req.sucursal._id };
      const [totalUsers, activeUsers, inactiveUsers] = await Promise.all([
        User.countDocuments(scope),
        User.countDocuments({ ...scope, isActive: true }),
        User.countDocuments({ ...scope, isActive: false }),
      ]);

      return res.status(200).json({
        success: true,
        sucursal: {
          id: req.sucursal._id,
          code: req.sucursal.code,
          name: req.sucursal.name,
        },
        stats: { totalUsers, activeUsers, inactiveUsers },
      });
    } catch (error) {
      return next(error);
    }
  }
);

// GET /api/users/branch/:sucursalId?page=1&limit=20
router.get(
  "/branch/:sucursalId",
  authorizeRoles("admin", "super_admin"),
  authorizeSucursal(),
  async (req, res, next) => {
    try {
      const parsePositiveInteger = (value, fallback) => {
        if (value === undefined) return fallback;
        if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) return null;
        const parsed = Number(value);
        return Number.isSafeInteger(parsed) ? parsed : null;
      };

      const page = parsePositiveInteger(req.query.page, 1);
      const limit = parsePositiveInteger(req.query.limit, 20);
      if (page === null || limit === null || limit > 50 || page > 10000) {
        return res.status(400).json({
          success: false,
          message: "Parámetros de paginación no válidos",
        });
      }

      // El filtro se construye con req.sucursal, previamente autorizada.
      // Nunca se confía en un id de sucursal dentro del cuerpo o query.
      const scope = { role: "member", sucursales: req.sucursal._id };
      const [users, total] = await Promise.all([
        User.find(scope)
          .select(MEMBER_BRANCH_FIELDS)
          .sort({ createdAt: -1, _id: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        User.countDocuments(scope),
      ]);

      // Evitamos exponer el listado de otras sedes asignadas
      // al miembro: solo mostramos la sede desde la cual se consulta.
      const safeUsers = users.map(({ sucursales, sucursalPrincipal, ...user }) => ({
        ...user,
        sucursal: req.sucursal._id,
        isPrincipalHere: String(sucursalPrincipal) === String(req.sucursal._id),
      }));

      return res.status(200).json({
        success: true,
        sucursal: {
          id: req.sucursal._id,
          code: req.sucursal.code,
          name: req.sucursal.name,
        },
        users: safeUsers,
        count: safeUsers.length,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    } catch (error) {
      return next(error);
    }
  }
);

// =========================================================
// DIRECTORIO REAL DE MIEMBROS - IGLESIA EL ANCLA
// Ruta de consulta de miembros reales para administración.
// Debe quedar antes del middleware exclusivo del superadministrador.
// =========================================================

// GET /api/users/members-directory?page=1&limit=100
// Permisos: admin y super_admin autenticados.
router.get(
  "/members-directory",
  authorizeRoles("admin", "super_admin"),
  async (req, res, next) => {
    try {
      // Evitamos que datos personales queden almacenados en cachés públicas.
      res.set("Cache-Control", "private, no-store");

      // Validamos números positivos para controlar la paginación.
      const readPositiveInteger = (value, fallback) => {
        if (value === undefined) return fallback;
        if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) return null;
        const number = Number(value);
        return Number.isSafeInteger(number) ? number : null;
      };

      // Cada petición devuelve como máximo cien miembros.
      const page = readPositiveInteger(req.query.page, 1);
      const limit = readPositiveInteger(req.query.limit, 100);
      if (page === null || page > 10000 || limit === null || limit > 100) {
        return res.status(400).json({
          success: false,
          message: "La paginación solicitada no es válida.",
        });
      }

      // Solo las personas con rol member pertenecen al directorio.
      const scope = { role: "member" };

      // Los administradores ordinarios ven solo las sedes que administran.
      // req.user.sucursales ya fue verificado por authenticateUser.
      if (req.user.role === "admin") {
        const allowedBranchIds = (req.user.sucursales || [])
          .filter((branch) => branch && branch.isActive)
          .map((branch) => branch._id);

        // Nunca consultamos el catálogo completo si faltan asignaciones.
        if (allowedBranchIds.length === 0) {
          return res.status(403).json({
            success: false,
            message: "No tienes una sede autorizada para consultar miembros.",
          });
        }

        // Un miembro presente en varias sedes aparece solo una vez.
        scope.sucursales = { $in: allowedBranchIds };
      }

      // Las cuentas super_admin tienen alcance institucional, igual que
      // el listado administrativo general ya existente en userRoutes.js.

      // Seleccionamos solo los datos usados por esta pantalla.
      const fields = "firstName lastName email phone birthDate role isActive createdAt sucursalPrincipal sucursales";

      // Contamos y consultamos con orden estable para la paginación.
      const [users, total] = await Promise.all([
        User.find(scope)
          .select(fields)
          .populate({ path: "sucursalPrincipal", select: "name" })
          .sort({ createdAt: -1, _id: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        User.countDocuments(scope),
      ]);

      // Adaptamos el esquema real al contrato visual de los componentes.
      const members = users.map((user) => ({
        id: String(user._id),
        name: [user.firstName, user.lastName].filter(Boolean).join(" "),
        email: user.email || "",
        phone: user.phone || "",
        role: "member",
        status: user.isActive ? "active" : "inactive",
        birthDate: user.birthDate instanceof Date
          ? user.birthDate.toISOString().slice(0, 10)
          : "",
        registeredAt: user.createdAt instanceof Date
          ? user.createdAt.toISOString().slice(0, 10)
          : "",
        // Los admins no ven nombres de sedes fuera de su alcance.
        branch: req.user.role === "super_admin"
          ? (user.sucursalPrincipal?.name || "Sin sede informada")
          : (() => {
            const principalId = String(user.sucursalPrincipal?._id || "");
            const visibleBranch = (req.user.sucursales || []).find(
              (branch) => (user.sucursales || []).some(
                (assignedId) => String(assignedId) === String(branch._id)
              )
            );
            const principalVisible = (req.user.sucursales || []).some(
              (branch) => String(branch._id) === principalId
            );
            return principalVisible
              ? (user.sucursalPrincipal?.name || "Sin sede informada")
              : (visibleBranch?.name || "Sin sede informada");
          })(),
      }));

      // No devolvemos credenciales, identificadores internos de auditoría
      // ni datos de seguridad de la cuenta.
      return res.status(200).json({
        success: true,
        members,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      // Dejamos los errores inesperados al middleware central de Express.
      return next(error);
    }
  }
);

// =========================================================
// REGISTRO SEGURO POR INVITACIÓN - IGLESIA EL ANCLA
// =========================================================
// Estas rutas comparten el modelo User y el correo institucional.
// Deben estar ANTES de la restricción exclusiva de super_admin.

// Devuelve únicamente las sedes donde el administrador puede
// registrar personas. El servidor decide cuáles están autorizadas.
router.get(
  "/registration-branches",
  authorizeRoles("admin", "super_admin"),
  async (req, res, next) => {
    try {
      res.set("Cache-Control", "private, no-store");
      const allowedIds = req.user.role === "admin"
        ? (req.user.sucursales || [])
          .filter((branch) => branch?.isActive)
          .map((branch) => branch._id)
        : null;

      const branches = await Sucursal.find({
        isActive: true,
        ...(allowedIds ? { _id: { $in: allowedIds } } : {}),
      })
        .select("code name")
        .sort({ code: 1 })
        .lean();

      return res.status(200).json({
        success: true,
        branches: branches.map((branch) => ({
          id: String(branch._id),
          code: branch.code,
          name: branch.name,
        })),
      });
    } catch (error) {
      return next(error);
    }
  }
);

// Límite por IP adicional a la autenticación y al control de rol.
const invitationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 25,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Demasiadas invitaciones. Intenta más tarde.",
  },
});

const INVITATION_LIFETIME_MS = 24 * 60 * 60 * 1000;
const INVITATION_RESEND_COOLDOWN_MS = 60 * 1000;

// Construimos un token aleatorio de 256 bits y guardamos solo su hash.
function makeInvitationToken() {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  return { token, tokenHash };
}

// Fecha civil completa sin desplazamientos horarios.
function parseRegistrationBirthDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value || date > new Date()
    ? null
    : date;
}


// =========================================================
// ENLACE PÚBLICO PARA ACTIVACIÓN DE CUENTAS
// =========================================================

// Generamos el enlace que recibirá el nuevo miembro.
// Utilizamos siempre el frontend público de la iglesia,
// incluso cuando el registro se realiza desde localhost.
function invitationLink(token) {

  // Definimos la dirección pública de activación.
  // Puede cambiarse desde las variables de entorno
  // sin modificar nuevamente el código.
  const activationUrl =
    process.env.ACTIVATION_FRONTEND_URL ||
    "https://iglesia-el-ancla.vercel.app";

  // Obtenemos el origen HTTPS de la página pública.
  const origin = new URL(activationUrl).origin;

  // Conservamos el token en el fragmento de la URL.
  // Este formato es el que utiliza nuestra página
  // para confirmar el correo y crear la contraseña.
  return `${origin}/activar-cuenta#token=${encodeURIComponent(token)}`;
}


// =========================================================
// DIAGNÓSTICO SEGURO DEL CORREO INSTITUCIONAL
// =========================================================
// Solo clasificamos el error. Nunca mostramos ni registramos
// tokens de Google, cabeceras HTTP, contraseñas o direcciones privadas.
function classifyInvitationMailError(error) {
  // Algunas respuestas de Google guardan el error en un objeto,
  // otras lo devuelven como texto. Consideramos ambos formatos.
  const googleError = error?.response?.data?.error;
  const googleCode = typeof googleError === "string"
    ? googleError
    : typeof googleError?.status === "string"
      ? googleError.status
      : "";

  // Este texto se utiliza solo para clasificar el fallo.
  // Nunca lo imprimimos ni lo devolvemos al navegador.
  const message = [
    error?.message,
    typeof googleError === "object" ? googleError?.message : "",
  ].filter((value) => typeof value === "string").join(" ");

  // Obtenemos el estado HTTP real de la llamada saliente a Google.
  // No debemos confundirlo con el HTTP 503 de nuestra propia API.
  const status = Number(error?.response?.status ?? error?.status ?? 0);
  const providerReason = googleError?.errors?.[0]?.reason;
  const networkCode = typeof error?.code === "string" ? error.code : "";

  // Autorización OAuth caducada o revocada.
  if (googleCode === "invalid_grant" || /\binvalid_grant\b|refresh token.*(?:expired|revoked)/i.test(message)) {
    return "GMAIL_AUTH_EXPIRED";
  }

  // No se ha conectado la cuenta institucional.
  if (/correo institucional aún no está conectado|correo institucional aun no esta conectado/i.test(message)) {
    return "GMAIL_NOT_CONNECTED";
  }

  // Configuración del remitente.
  if (/GMAIL_SENDER_EMAIL|no corresponde al correo institucional|correo institucional configurado no es válido/i.test(message)) {
    return "GMAIL_SENDER_CONFIGURATION";
  }

  // Configuración o descifrado de OAuth.
  if (/Faltan las credenciales OAuth|GOOGLE_TOKEN_ENCRYPTION_KEY|Unsupported state or unable to authenticate data/i.test(message)) {
    return "GMAIL_OAUTH_CONFIGURATION";
  }

  // Validaciones del destinatario y del mensaje, previas a Gmail API.
  if (/El destinatario no es válido|El campo to no es válido/i.test(message)) {
    return "GMAIL_RECIPIENT_INVALID";
  }
  if (/El contenido HTML no es válido|El campo (?:subject|text) no es válido/i.test(message)) {
    return "GMAIL_TEMPLATE_INVALID";
  }

  // Los límites de uso también pueden presentarse como HTTP 403.
  if (status === 429 || ["rateLimitExceeded", "userRateLimitExceeded", "dailyLimitExceeded"].includes(providerReason)) {
    return "GMAIL_RATE_LIMIT";
  }

  // Problemas de autorización y permisos.
  if (status === 401 || status === 403 || /no tiene permiso para enviar correos/i.test(message)) {
    return "GMAIL_PERMISSION_DENIED";
  }

  // Gmail rechazó el contenido de la solicitud enviada.
  if (status === 400) {
    return "GMAIL_BAD_REQUEST";
  }

  // Errores transitorios de conexión con el proveedor.
  if (["ETIMEDOUT", "ECONNRESET", "ENOTFOUND", "EAI_AGAIN", "ECONNREFUSED"].includes(networkCode)) {
    return "GMAIL_NETWORK_ERROR";
  }

  // Respuestas de servidor del proveedor.
  if (status >= 500 && status <= 599) {
    return "GMAIL_PROVIDER_UNAVAILABLE";
  }

  // Categoría genérica: necesitamos el diagnóstico seguro adicional.
  return "GMAIL_SEND_FAILED";
}

// Extraemos únicamente metadatos técnicos seguros para los logs de Vercel.
// No registramos el mensaje completo de Google porque podría incluir
// información del destinatario, cabeceras o detalles de autorización.
function safeInvitationMailDiagnostic(error) {
  const googleError = error?.response?.data?.error;
  const candidateStatus = Number(error?.response?.status ?? error?.status ?? 0);

  // Aceptamos solo un código HTTP válido; nunca mostramos el objeto completo.
  const providerHttpStatus = Number.isInteger(candidateStatus) &&
    candidateStatus >= 400 && candidateStatus <= 599
    ? candidateStatus
    : null;

  // Los códigos de error y razones de Google son identificadores técnicos.
  // La validación impide registrar cadenas largas o texto arbitrario.
  const safeIdentifier = (value) =>
    typeof value === "string" && /^[A-Za-z][A-Za-z0-9_.-]{0,63}$/.test(value)
      ? value
      : null;

  return {
    category: classifyInvitationMailError(error),
    providerHttpStatus,
    providerCode: safeIdentifier(
      typeof googleError === "string" ? googleError : googleError?.status
    ),
    providerReason: safeIdentifier(googleError?.errors?.[0]?.reason),
    networkCode: safeIdentifier(error?.code),
    // Identificamos dónde se produjo el fallo sin guardar el error completo.
    mailStage: safeIdentifier(error?.mailStage),
    errorName: safeIdentifier(error?.name),
    // Algunas bibliotecas envuelven errores reales en `cause`.
    causeName: safeIdentifier(error?.cause?.name),
    causeNetworkCode: safeIdentifier(error?.cause?.code),
    // Si es false, Gmail no devolvió una respuesta HTTP utilizable.
    hasProviderResponse: Boolean(error?.response),
  };
}

// Mensaje de orientación para el administrador; no revela datos internos.
function invitationErrorMessage(code, isResend = false) {
  const action = isResend ? "reenviar la invitación" : "completar el registro";
  if (["GMAIL_AUTH_EXPIRED", "GMAIL_NOT_CONNECTED", "GMAIL_PERMISSION_DENIED"].includes(code)) {
    return `No se pudo ${action}: es necesario revisar la conexión del correo institucional con Google. Comunícate con un superadministrador.`;
  }
  if (["GMAIL_SENDER_CONFIGURATION", "GMAIL_OAUTH_CONFIGURATION"].includes(code)) {
    return `No se pudo ${action}: el servicio de correo institucional necesita revisión de configuración.`;
  }
  return `No se pudo ${action} porque el correo institucional no confirmó el envío. Intenta más tarde.`;
}

// =========================================================
// PLANTILLA DEL CORREO DE BIENVENIDA - IGLESIA EL ANCLA
// =========================================================
// Se envía como HTML + texto plano con el servicio Gmail existente.
// Sin imágenes remotas, dependencias adicionales ni tokens en logs.

// Escapamos datos variables antes de insertarlos en una plantilla HTML.
// Así evitamos que un nombre ingresado en el formulario genere etiquetas.
function escapeInvitationHtml(value) {
  const entities = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return String(value ?? "").replace(/[&<>"']/g, (char) => entities[char]);
}


// =========================================================
// PLANTILLA HTML DEL CORREO DE BIENVENIDA
// IGLESIA EL ANCLA
// =========================================================

function buildInvitationEmailHtml({ firstName, link }) {

  // Protegemos el nombre del usuario antes de mostrarlo en HTML.
  const safeName = escapeInvitationHtml(firstName || "amigo/a");

  // Conservamos el enlace de activación individual y seguro.
  const safeLink = escapeInvitationHtml(link);

  // Enlazamos documentos públicos sin copiar el token de la invitación.
  const legalOrigin = new URL(link).origin;
  const safeTermsUrl = escapeInvitationHtml(`${legalOrigin}/terminos-y-condiciones`);
  const safePrivacyUrl = escapeInvitationHtml(`${legalOrigin}/politica-de-privacidad`);
  const safeContactUrl = escapeInvitationHtml(`${legalOrigin}/contacto`);

  // Utilizamos la URL pública del logotipo oficial.
  // Gmail no puede acceder a rutas internas de React ni a localhost.
  // El archivo debe existir en frontend/public/logo-el-ancla.png.
  const logoUrl = escapeInvitationHtml(
    "https://iglesia-el-ancla.vercel.app/logo-el-ancla.png"
  );

  // Construimos el correo utilizando tablas y estilos en línea
  // para mejorar su compatibilidad con los clientes de correo.
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Activa tu cuenta en Iglesia El Ancla</title>
</head>

<body style="margin:0;padding:0;background-color:#f4f5f5;font-family:Arial,Helvetica,sans-serif;color:#243c4d;">

  <!-- Texto previo que puede aparecer en la bandeja de entrada. -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    Bienvenido a Iglesia El Ancla. Confirma tu correo y crea tu contraseña para entrar a tu espacio.
  </div>

  <!-- Contenedor principal del correo. -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#f4f5f5;border-collapse:collapse;">
    <tr>
      <td align="center" style="padding:36px 14px 42px;">

        <!-- Tarjeta blanca del correo. -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="width:100%;max-width:600px;border-collapse:separate;background-color:#ffffff;border:1px solid #e6e7e5;border-radius:18px;overflow:hidden;">

          <!-- ========================================= -->
          <!-- ENCABEZADO CON LOGOTIPO OFICIAL -->
          <!-- ========================================= -->

          <tr>
            <td align="center" bgcolor="#23394c" style="padding:27px 28px 26px;background-color:#23394c;">

              <!-- Imagen real del logotipo de Iglesia El Ancla. -->
              <img
                src="${logoUrl}"
                alt="Logotipo oficial de Iglesia El Ancla"
                width="90"
                style="display:block;width:90px;max-width:90px;height:auto;margin:0 auto 13px;padding:6px;background-color:#ffffff;border:0;border-radius:12px;outline:none;text-decoration:none;"
              />

              <!-- Nombre institucional. -->
              <p style="margin:0 0 4px;color:#ffffff;font-family:Georgia,'Times New Roman',serif;font-size:25px;font-weight:bold;letter-spacing:.2px;">
                El Ancla
              </p>

              <!-- Identificación de la comunidad. -->
              <p style="margin:0;color:#d9e2e7;font-size:10px;font-weight:bold;letter-spacing:2.1px;text-transform:uppercase;">
                Comunidad Cristiana
              </p>

            </td>
          </tr>

          <!-- ========================================= -->
          <!-- MENSAJE DE BIENVENIDA -->
          <!-- ========================================= -->

          <tr>
            <td style="padding:36px 42px 14px;">

              <p style="margin:0 0 15px;color:#b67458;font-size:10px;font-weight:bold;letter-spacing:2.1px;text-transform:uppercase;">
                Bienvenido a nuestra comunidad
              </p>

              <h1 style="margin:0 0 22px;color:#23394c;font-family:Georgia,'Times New Roman',serif;font-size:31px;font-weight:normal;line-height:1.24;">
                ¡Tu espacio en El Ancla te espera!
              </h1>

              <!-- Saludo personalizado. -->
              <p style="margin:0 0 13px;color:#23394c;font-size:16px;font-weight:bold;line-height:1.6;">
                Hola, ${safeName}:
              </p>

              <p style="margin:0 0 14px;color:#596d79;font-size:14px;line-height:1.85;">
                Nos alegra darte la bienvenida a
                <strong style="color:#23394c;">Iglesia El Ancla</strong>.
                Un administrador ha registrado tu información para que puedas
                participar de nuestro espacio digital.
              </p>

              <p style="margin:0;color:#596d79;font-size:14px;line-height:1.85;">
                Solo falta un paso:
                <strong style="color:#23394c;">
                  confirmar tu correo y crear tu propia contraseña
                </strong>.
                Así mantendrás tu cuenta protegida desde el primer día.
              </p>

            </td>
          </tr>

          <!-- ========================================= -->
          <!-- INFORMACIÓN DE PRIVACIDAD PREVIA A LA DECISIÓN -->
          <!-- ========================================= -->
          <tr>
            <td style="padding:9px 42px 6px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f7f8f8;border:1px solid #e1e7e9;border-radius:11px;">
                <tr><td style="padding:17px 19px;">
                  <p style="margin:0 0 10px;color:#23394c;font-size:14px;font-weight:bold;line-height:1.5;">
                    Antes de decidir, conoce cómo usamos tus datos
                  </p>
                  <p style="margin:0 0 10px;color:#596d79;font-size:12px;line-height:1.8;">
                    Un administrador registró tu nombre, apellidos, correo, fecha de nacimiento y los datos necesarios de tu cuenta, para enviarte esta invitación y gestionar tu eventual participación en la plataforma.
                  </p>
                  <p style="margin:0 0 10px;color:#596d79;font-size:12px;line-height:1.8;">
                    Si aceptas, tus datos se utilizarán para administrar tu acceso y las funciones comunitarias correspondientes. Algunos proveedores tecnológicos podrán tratar la información necesaria para prestar el servicio. No se vende para publicidad comercial.
                  </p>
                  <p style="margin:0 0 10px;color:#596d79;font-size:12px;line-height:1.8;">
                    Ninguna plataforma conectada a Internet está libre de riesgos: pueden ocurrir ciberataques, accesos no autorizados o filtraciones incluso con medidas de seguridad. La aceptación no supone renunciar a tus derechos legales.
                  </p>
                  <p style="margin:0;color:#35677f;font-size:12px;line-height:1.8;">
                    <a href="${safeTermsUrl}" style="color:#35677f;text-decoration:underline;">Términos y Condiciones</a>
                    &nbsp;·&nbsp;
                    <a href="${safePrivacyUrl}" style="color:#35677f;text-decoration:underline;">Política de Privacidad</a>
                  </p>
                  <p style="margin:11px 0 0;color:#796b5e;font-size:12px;line-height:1.75;">
                    Al abrir tu invitación podrás revisar el aviso completo y decidir si aceptas antes de crear una contraseña. Si no deseas activar tu cuenta, no necesitas hacer nada: después de 24 horas el enlace vencerá y el registro provisional se eliminará automáticamente de nuestra base de datos. La eliminación puede presentar una breve demora técnica.
                  </p>
                </td></tr>
              </table>
            </td>
          </tr>

          <!-- ========================================= -->
          <!-- BOTÓN DE ACTIVACIÓN -->
          <!-- ========================================= -->

          <tr>
            <td align="center" style="padding:25px 42px 27px;">

              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="border-collapse:separate;">
                <tr>
                  <td align="center" bgcolor="#b67458" style="background-color:#b67458;border-radius:10px;">

                    <!-- Enlace seguro generado por el backend. -->
                    <a
                      href="${safeLink}"
                      target="_blank"
                      style="display:inline-block;padding:16px 28px;border-radius:10px;background-color:#b67458;color:#ffffff;font-size:14px;font-weight:bold;line-height:1.2;text-align:center;text-decoration:none;"
                    >
                      Activar mi cuenta &nbsp;→
                    </a>

                  </td>
                </tr>
              </table>

              <p style="margin:14px 0 0;color:#83929a;font-size:12px;line-height:1.6;">
                Después podrás ingresar con tu correo y nueva contraseña.
              </p>

            </td>
          </tr>

          <!-- ========================================= -->
          <!-- INFORMACIÓN DE SEGURIDAD -->
          <!-- ========================================= -->

          <tr>
            <td style="padding:0 42px 30px;">

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f7f3ed;border:1px solid #eadfce;border-radius:11px;">
                <tr>
                  <td style="padding:17px 19px;">

                    <p style="margin:0 0 6px;color:#755842;font-size:13px;font-weight:bold;line-height:1.5;">
                      🔒 Un enlace pensado para tu seguridad
                    </p>

                    <p style="margin:0;color:#796b5e;font-size:12px;line-height:1.75;">
                      Esta invitación vence en <strong>24 horas</strong>
                      y solo puede utilizarse <strong>una vez</strong>.
                      Si no la aceptas, la cuenta provisional se eliminará
                      automáticamente tras el vencimiento, sin necesidad de solicitarlo.
                      No compartas el enlace ni tu contraseña con otras personas.
                    </p>

                  </td>
                </tr>
              </table>

              <!-- Enlace alternativo por accesibilidad y compatibilidad. -->
              <p style="margin:23px 0 9px;color:#596d79;font-size:12px;line-height:1.7;">
                ¿El botón no se abre? Copia este enlace y pégalo en tu navegador:
              </p>

              <p style="margin:0;color:#35677f;font-size:11px;line-height:1.8;word-break:break-all;overflow-wrap:anywhere;">
                <a href="${safeLink}" style="color:#35677f;text-decoration:underline;word-break:break-all;">
                  ${safeLink}
                </a>
              </p>

            </td>
          </tr>

          <!-- ========================================= -->
          <!-- PIE INSTITUCIONAL -->
          <!-- ========================================= -->

          <tr>
            <td align="center" bgcolor="#f8f8f6" style="padding:25px 35px 27px;background-color:#f8f8f6;border-top:1px solid #e9ecec;">

              <p style="margin:0 0 9px;color:#23394c;font-family:Georgia,'Times New Roman',serif;font-size:17px;">
                Nos alegra caminar contigo.
              </p>

              <p style="margin:0 0 14px;color:#75858d;font-size:12px;line-height:1.7;">
                Si no esperabas esta invitación, puedes ignorarla.
                Tu cuenta no se activará y el registro pendiente caducará a las 24 horas.
              </p>

              <p style="margin:0 0 12px;color:#75858d;font-size:12px;line-height:1.7;">
                ¿Tienes otra consulta? <a href="${safeContactUrl}" style="color:#35677f;text-decoration:underline;">Visita nuestra página de Contacto</a>.
              </p>

              <p style="margin:0;color:#a2a7a9;font-size:10px;letter-spacing:1px;text-transform:uppercase;">
                Iglesia El Ancla · Comunidad Cristiana
              </p>

            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}


// Enviamos simultáneamente HTML y texto para mejor compatibilidad.
async function sendInvitationMail({ to, firstName, token }) {
  // Conservamos la generación de enlace del flujo actual.
  const link = invitationLink(token);
  const name = firstName?.trim() || "amigo/a";
  const legalOrigin = new URL(link).origin;

  // Gmail construirá automáticamente un correo multipart/alternative.
  // Los clientes que no muestren HTML usarán este texto completo.
  return sendInstitutionalEmail({
    to,
    subject: "¡Bienvenido a Iglesia El Ancla! | Activa tu cuenta",
    text: [
      `Hola, ${name}:`,
      "",
      "¡Bienvenido a la comunidad de Iglesia El Ancla!",
      "Un administrador ha registrado tu información para que puedas acceder a nuestro espacio digital.",
      "",
      "Información sobre tu invitación y privacidad:",
      "Un administrador registró tu nombre, apellidos, correo, fecha de nacimiento y datos de cuenta para preparar esta invitación.",
      "Si aceptas, utilizaremos tus datos para gestionar tu acceso y las funciones comunitarias que uses; los proveedores tecnológicos tendrán acceso solamente según su función.",
      "Ningún sistema informático ofrece seguridad absoluta: pueden existir ciberataques, filtraciones o accesos no autorizados. Tu aceptación no limita los derechos establecidos por ley.",
      `Términos y Condiciones: ${legalOrigin}/terminos-y-condiciones`,
      `Política de Privacidad: ${legalOrigin}/politica-de-privacidad`,
      "Antes de crear tu contraseña, podrás leer la advertencia completa y decidir si deseas aceptar.",
      "",
      "Para revisar las condiciones y, si estás de acuerdo, crear tu contraseña personal, abre este enlace:",
      link,
      "",
      "El enlace vence en 24 horas y solamente puede utilizarse una vez.",
      "Si no aceptas la invitación, no debes hacer nada: el registro provisional se eliminará automáticamente de nuestra base de datos después del vencimiento. La limpieza puede tardar brevemente.",
      "No compartas el enlace ni tu contraseña con otras personas.",
      "",
      "Para otras consultas, visita nuestra página de Contacto:",
      `${legalOrigin}/contacto`,
      "Si no esperabas esta invitación, puedes ignorar el mensaje.",
      "",
      "Nos alegra caminar contigo.",
      "Iglesia El Ancla · Comunidad Cristiana",
    ].join("\n"),
    html: buildInvitationEmailHtml({ firstName: name, link }),
  });
}

// Evitamos confiar en propiedades ajenas al formulario autorizado.
function validateRegistrationRequest(body, actor) {
  const expected = [
    "firstName", "lastName", "email", "phone", "birthDate",
    "role", "sucursales", "sucursalPrincipal",
  ];
  if (!body || typeof body !== "object" || Array.isArray(body) ||
    Object.keys(body).length !== expected.length ||
    expected.some((key) => !Object.hasOwn(body, key))) {
    return { error: "Los datos del formulario no son válidos." };
  }

  const { firstName, lastName, email, phone, birthDate, role,
    sucursales, sucursalPrincipal } = body;
  if ([firstName, lastName, email, phone, birthDate, role, sucursalPrincipal]
    .some((field) => typeof field !== "string")) {
    return { error: "El formato de los campos es incorrecto." };
  }

  const first = firstName.trim();
  const last = lastName.trim();
  const normalizedEmail = email.trim().toLowerCase();
  // El teléfono puede estar vacío.
  const normalizedPhone = phone.trim();

  // Solo validamos el formato cuando existe un número.
  if (!isValidOptionalPhone(normalizedPhone)) {
    return {
      error:
        "El celular debe comenzar con +56 9 y tener 8 dígitos más, o quedar vacío.",
    };
  }
  const birth = parseRegistrationBirthDate(birthDate);
  // Nombre, apellido y fecha conservan sus validaciones originales.
  if (first.length < 2 || first.length > 60 || last.length < 2 || last.length > 60 ||
    /[\x00-\x1f\x7f]/u.test(first) || /[\x00-\x1f\x7f]/u.test(last) || !birth) {
    return { error: "Revisa el nombre, los apellidos y la fecha de nacimiento." };
  }

  // El backend valida el correo aunque React ya lo haya comprobado.
  if (!isValidRegistrationEmail(normalizedEmail)) {
    return { error: "Ingresa un correo válido de máximo 50 caracteres." };
  }

  // El teléfono puede omitirse; si existe, rechazamos letras y excesos.
  if (!isValidOptionalPhone(normalizedPhone)) {
    return { error: "El celular debe comenzar con +56 9 y tener 8 dígitos más, o quedar vacío." };
  }

  // Un admin normal NUNCA puede crear otro administrador.
  if (!(role === "member" || (actor.role === "super_admin" && role === "admin"))) {
    return { error: "No tienes autorización para asignar ese rol." };
  }

  if (!Array.isArray(sucursales) || sucursales.length < 1 || sucursales.length > 50 ||
    sucursales.some((id) => typeof id !== "string" || !mongoose.isObjectIdOrHexString(id)) ||
    !mongoose.isObjectIdOrHexString(sucursalPrincipal)) {
    return { error: "Selecciona sucursales válidas." };
  }

  const uniqueIds = [...new Set(sucursales.map((id) => id.toLowerCase()))];
  if (uniqueIds.length !== sucursales.length ||
    !uniqueIds.includes(sucursalPrincipal.toLowerCase())) {
    return { error: "No repitas sucursales y elige una principal dentro de ellas." };
  }

  return {
    data: {
      firstName: first,
      lastName: last,
      email: normalizedEmail,
      phone: normalizedPhone || undefined,
      birthDate: birth,
      role,
      sucursales: uniqueIds,
      sucursalPrincipal: sucursalPrincipal.toLowerCase(),
    },
  };
}

// POST /api/users/register
// Un administrador crea una cuenta PENDIENTE y envía el enlace.
router.post(
  "/register",
  authorizeRoles("admin", "super_admin"),
  requireTrustedOrigin,
  invitationLimiter,
  async (req, res, next) => {
    let createdUser = null;
    let invitationCreated = false;
    try {
      res.set("Cache-Control", "private, no-store");
      if (!req.is("application/json")) {
        return res.status(415).json({ success: false, message: "Se requiere JSON." });
      }

      const validation = validateRegistrationRequest(req.body, req.user);
      if (validation.error) {
        return res.status(400).json({ success: false, message: validation.error });
      }
      const input = validation.data;

      // Verificamos sucursales activas y alcance real del administrador.
      const allowed = req.user.role === "admin"
        ? (req.user.sucursales || []).filter((branch) => branch?.isActive)
          .map((branch) => String(branch._id))
        : null;

      if (allowed && input.sucursales.some((id) => !allowed.includes(id))) {
        return res.status(403).json({ success: false, message: "No puedes registrar usuarios en esas sedes." });
      }

      const activeCount = await Sucursal.countDocuments({
        _id: { $in: input.sucursales },
        isActive: true,
      });
      if (activeCount !== input.sucursales.length) {
        return res.status(400).json({ success: false, message: "Hay sucursales inexistentes o inactivas." });
      }

      // Una cuenta caducada puede permanecer unos minutos en MongoDB
      // mientras el proceso TTL completa su barrido. Para permitir
      // volver a invitar ese correo, limpiamos solo la cuenta realmente
      // pendiente y caducada (nunca una cuenta activa o desactivada).
      const existingUser = await User.findOne({ email: input.email })
        .select("_id isActive emailVerifiedAt +invitationExpiresAt").lean();

      if (existingUser) {
        const expiredInvitation =
          !existingUser.isActive &&
          !existingUser.emailVerifiedAt &&
          existingUser.invitationExpiresAt instanceof Date &&
          existingUser.invitationExpiresAt <= new Date();

        if (!expiredInvitation) {
          return res.status(409).json({ success: false, message: "Ese correo ya tiene una cuenta registrada." });
        }

        const removed = await User.deleteOne({
          _id: existingUser._id,
          isActive: false,
          emailVerifiedAt: null,
          invitationExpiresAt: { $lte: new Date() },
        });

        if (removed.deletedCount !== 1) {
          return res.status(409).json({ success: false, message: "El registro anterior cambió de estado. Actualiza la página e intenta nuevamente." });
        }

        // El código vencido también tiene TTL independiente.
        // Lo retiramos ahora para que no quede un desafío huérfano.
        await EmailVerificationCode.deleteOne({
          user: existingUser._id,
          purpose: "verify_email",
        }).catch(() => {
          // La colección de desafíos también usa TTL propio.
          // Si falla esta limpieza adicional, el token ya no podrá
          // activar una cuenta borrada y caducará por sí mismo.
          console.warn("[REGISTRO] No se pudo retirar un desafío de invitación caducado.");
        });
      }

      // Nadie conoce esta contraseña aleatoria. Solo se reemplaza al activar.
      const unusablePassword = `${randomBytes(32).toString("hex")}Aa1!`;
      const passwordHash = await hashPassword(unusablePassword);

      // Ambas entidades usan exactamente el mismo vencimiento.
      // El índice TTL borrará el usuario provisional sin requerir
      // un proceso programado en Vercel ni intervención administrativa.
      const invitationExpiresAt = new Date(Date.now() + INVITATION_LIFETIME_MS);

      createdUser = await User.create({
        ...input,
        passwordHash,
        isActive: false,
        emailVerifiedAt: null,
        mustChangePassword: true,
        invitationExpiresAt,
      });

      const { token, tokenHash } = makeInvitationToken();
      await EmailVerificationCode.create({
        user: createdUser._id,
        purpose: "verify_email",
        codeHash: tokenHash,
        email: createdUser.email,
        expiresAt: invitationExpiresAt,
        lastSentAt: new Date(),
        consumedAt: null,
      });
      invitationCreated = true;

      // Solo confirmamos el envío cuando Gmail responde satisfactoriamente.
      try {
        await sendInvitationMail({ to: createdUser.email, firstName: createdUser.firstName, token });
      } catch (mailError) {
        // Registramos únicamente una categoría diagnóstica, nunca
        // el error original porque algunas respuestas OAuth contienen secretos.
        const mailErrorCode = classifyInvitationMailError(mailError);
        console.error("[REGISTRO][CORREO] Envío de invitación fallido:", safeInvitationMailDiagnostic(mailError));

        // Conservamos el comportamiento anterior: no dejamos una cuenta
        // pendiente si Gmail no confirmó el envío de la invitación.
        const cleanup = await Promise.allSettled([
          EmailVerificationCode.deleteOne({ user: createdUser._id, purpose: "verify_email" }),
          User.deleteOne({ _id: createdUser._id, isActive: false, emailVerifiedAt: null }),
        ]);

        // No afirmamos que el registro se revirtió si falló la limpieza.
        if (cleanup.some((result) => result.status === "rejected")) {
          console.error("[REGISTRO][CORREO] Revisión requerida: no se confirmó la limpieza de la cuenta pendiente.");
          return res.status(503).json({
            success: false,
            code: "REGISTRATION_REVIEW_REQUIRED",
            message: "No se pudo confirmar el envío ni la limpieza del registro. Solicita a un superadministrador revisar la cuenta antes de volver a registrarla.",
          });
        }

        return res.status(503).json({
          success: false,
          code: mailErrorCode,
          message: `${invitationErrorMessage(mailErrorCode)} La cuenta pendiente se revirtió; puedes volver a intentarlo cuando el correo funcione.`,
        });
      }

      return res.status(201).json({
        success: true,
        message: "Invitación enviada. El destinatario tiene 24 horas para activar su cuenta; de lo contrario, el registro provisional será eliminado automáticamente.",
        user: { id: String(createdUser._id), email: createdUser.email, role: createdUser.role },
      });
    } catch (error) {
      // Si falla antes del envío, evitamos cuentas pendientes huérfanas.
      if (createdUser && !invitationCreated) {
        await EmailVerificationCode.deleteOne({ user: createdUser._id, purpose: "verify_email" }).catch(() => { });
        await User.deleteOne({ _id: createdUser._id, isActive: false, emailVerifiedAt: null }).catch(() => { });
      }
      if (error?.code === 11000) {
        return res.status(409).json({ success: false, message: "Ese correo ya tiene una cuenta registrada." });
      }
      if (error?.name === "ValidationError") {

        // Identificamos los campos rechazados por Mongoose.
        // No mostramos valores privados ni contraseñas.
        const invalidFields = Object.keys(error.errors ?? {});

        // Dejamos la información técnica solo en la terminal.
        console.error(
          "[REGISTRO] Campos que fallaron validación:",
          invalidFields
        );

        // Enviamos una respuesta comprensible al administrador.
        return res.status(400).json({
          success: false,
          message:
            "No se pudo completar el registro. Revisa los datos ingresados.",
        });
      }
      return next(error);
    }
  }
);

// POST /api/users/:id/resend-invitation
// Permite reenviar solo invitaciones todavía vigentes.
// Vencidas las 24 horas, el usuario provisional se elimina mediante TTL.
router.post(
  "/:id/resend-invitation",
  authorizeRoles("admin", "super_admin"),
  requireTrustedOrigin,
  invitationLimiter,
  async (req, res, next) => {
    try {
      res.set("Cache-Control", "private, no-store");
      if (!mongoose.isObjectIdOrHexString(req.params.id) ||
        !req.is("application/json") || !req.body ||
        Object.keys(req.body).length !== 0) {
        return res.status(400).json({ success: false, message: "Solicitud no válida." });
      }

      const user = await User.findById(req.params.id)
        .select("+invitationExpiresAt");
      if (!user || user.isActive || user.emailVerifiedAt || user.deactivatedAt) {
        return res.status(409).json({ success: false, message: "La cuenta no está pendiente de activación." });
      }
      if (user.invitationExpiresAt && user.invitationExpiresAt <= new Date()) {
        return res.status(410).json({
          success: false,
          message: "La invitación ya venció. El registro provisional se eliminará automáticamente. Puedes registrar nuevamente a la persona después de la limpieza.",
        });
      }
      if (req.user.role === "admin") {
        const allowed = (req.user.sucursales || []).filter((branch) => branch?.isActive)
          .map((branch) => String(branch._id));
        if (!user.sucursales.some((id) => allowed.includes(String(id)))) {
          return res.status(403).json({ success: false, message: "No tienes autorización sobre ese usuario." });
        }
        if (user.role !== "member") {
          return res.status(403).json({ success: false, message: "No tienes autorización sobre ese rol." });
        }
      }

      const previous = await EmailVerificationCode.findOne({
        user: user._id, purpose: "verify_email",
      }).select("+codeHash");
      if (previous?.lastSentAt &&
        Date.now() - previous.lastSentAt.getTime() < INVITATION_RESEND_COOLDOWN_MS) {
        return res.status(429).json({ success: false, message: "Espera un minuto antes de reenviar." });
      }

      const { token, tokenHash } = makeInvitationToken();
      const nextExpiresAt = new Date(Date.now() + INVITATION_LIFETIME_MS);
      const nextSentAt = new Date();
      const previousUserExpiresAt = user.invitationExpiresAt;

      // Prolongamos el plazo del usuario antes de sustituir el token;
      // así el TTL no elimina una cuenta mientras se reenvía el correo.
      const userExtended = await User.updateOne(
        {
          _id: user._id,
          isActive: false,
          emailVerifiedAt: null,
          ...(previousUserExpiresAt ? { invitationExpiresAt: { $gt: new Date() } } : {}),
        },
        { $set: { invitationExpiresAt: nextExpiresAt } }
      );
      if (userExtended.modifiedCount !== 1) {
        return res.status(409).json({ success: false, message: "La cuenta dejó de estar pendiente o la invitación ya venció." });
      }

      // Si falla el reenvío, restauramos también la fecha de caducidad.
      async function restorePendingExpiry() {
        const original = previousUserExpiresAt
          ? { $set: { invitationExpiresAt: previousUserExpiresAt } }
          : { $unset: { invitationExpiresAt: "" } };
        await User.updateOne(
          { _id: user._id, isActive: false, emailVerifiedAt: null, invitationExpiresAt: nextExpiresAt },
          original
        ).catch(() => { });
      }

      try {
        await EmailVerificationCode.findOneAndUpdate(
        { user: user._id, purpose: "verify_email" },
        {
          $set: {
            codeHash: tokenHash,
            email: user.email,
            expiresAt: nextExpiresAt,
            lastSentAt: nextSentAt,
            attempts: 0,
            consumedAt: null,
          }, $setOnInsert: { user: user._id, purpose: "verify_email" }
        },
        { upsert: true, new: true, runValidators: true }
        );
      } catch (challengeError) {
        await restorePendingExpiry();
        throw challengeError;
      }

      try {
        await sendInvitationMail({ to: user.email, firstName: user.firstName, token });
      } catch (mailError) {
        const mailErrorCode = classifyInvitationMailError(mailError);
        console.error("[REGISTRO][CORREO] Reenvío de invitación fallido:", safeInvitationMailDiagnostic(mailError));

        // Restauramos la invitación anterior si todavía no se usó.
        const currentFilter = { user: user._id, purpose: "verify_email", codeHash: tokenHash };
        if (previous) {
          await EmailVerificationCode.updateOne(currentFilter, {
            $set: {
              codeHash: previous.codeHash,
              email: previous.email,
              expiresAt: previous.expiresAt,
              lastSentAt: previous.lastSentAt,
              attempts: previous.attempts,
              consumedAt: previous.consumedAt,
            }
          }).catch(() => { });
        } else {
          await EmailVerificationCode.deleteOne(currentFilter).catch(() => { });
        }
        await restorePendingExpiry();
        return res.status(503).json({
          success: false,
          code: mailErrorCode,
          message: invitationErrorMessage(mailErrorCode, true),
        });
      }

      return res.status(200).json({
        success: true,
        message: "Invitación reenviada. El destinatario dispone de 24 horas desde este nuevo envío para activar su cuenta.",
      });
    } catch (error) {
      return next(error);
    }
  }
);


// Las operaciones institucionales existentes siguen siendo
// exclusivas del superadministrador.
router.use(authorizeRoles("super_admin"));

// =========================================================
// ESTADÍSTICAS DE USUARIOS
// GET /api/users/stats
// =========================================================
router.get("/stats", async (req, res, next) => {
  try {
    const [totalUsers, activeUsers, inactiveUsers, administrators] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isActive: true }),
        User.countDocuments({ isActive: false }),
        User.countDocuments({ role: "admin" }),
      ]);

    return res.status(200).json({
      success: true,
      stats: { totalUsers, activeUsers, inactiveUsers, administrators },
    });
  } catch (error) {
    return next(error);
  }
});

// =========================================================
// DIRECTORIO DE ADMINISTRADORES
// GET /api/users/administrators
// =========================================================
// Consultamos exclusivamente las cuentas administrativas reales.
// Esta ruta hereda la protección de superadministrador del router.
// Evitamos el límite de 100 usuarios del listado general.
router.get("/administrators", async (req, res, next) => {
  try {
    res.set("Cache-Control", "no-store");

    // Seleccionamos únicamente los roles administrativos.
    const administrators = await User.find({
      role: { $in: ["admin", "super_admin"] },
    })
      .select(USER_PUBLIC_FIELDS)
      .populate({ path: "sucursales", select: BRANCH_PUBLIC_FIELDS })
      .populate({ path: "sucursalPrincipal", select: BRANCH_PUBLIC_FIELDS })
      .sort({ createdAt: -1 })
      .lean();

    // Resumimos los datos obtenidos sin inventar cifras.
    const summary = {
      total: administrators.length,
      administrators: administrators.filter((user) => user.role === "admin").length,
      superAdministrators: administrators.filter((user) => user.role === "super_admin").length,
      active: administrators.filter((user) => user.isActive === true).length,
      inactive: administrators.filter((user) => user.isActive === false).length,
    };

    return res.status(200).json({
      success: true,
      administrators,
      summary,
    });
  } catch (error) {
    return next(error);
  }
});

// =========================================================
// LISTADO DE USUARIOS
// GET /api/users
// =========================================================
router.get("/", async (req, res, next) => {
  try {
    const users = await User.find({})
      .select(USER_PUBLIC_FIELDS)
      .populate({ path: "sucursales", select: BRANCH_PUBLIC_FIELDS })
      .populate({ path: "sucursalPrincipal", select: BRANCH_PUBLIC_FIELDS })
      .sort({ createdAt: -1 })
      .limit(100);

    return res.status(200).json({
      success: true,
      users,
      count: users.length,
    });
  } catch (error) {
    return next(error);
  }
});

// =========================================================
// ACTUALIZAR ASIGNACIONES DE SUCURSALES
// PATCH /api/users/:id/sucursales
// =========================================================
// El cuerpo permitido es exclusivamente:
// {
//   "sucursales": ["<ObjectId sucursal>", ...],
//   "sucursalPrincipal": "<ObjectId sucursal>"
// }
// No actualiza roles, contraseñas ni otras propiedades.
router.patch("/:id/sucursales", requireTrustedOrigin, async (req, res, next) => {
  try {
    // Validamos identificador del usuario.
    if (!mongoose.isObjectIdOrHexString(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "El identificador del usuario no es válido",
      });
    }

    // Solo aceptamos los dos campos expresamente permitidos.
    const body = req.body;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return res.status(400).json({ success: false, message: "Datos inválidos" });
    }

    const fields = Object.keys(body);
    if (
      fields.length !== 2 ||
      !fields.includes("sucursales") ||
      !fields.includes("sucursalPrincipal")
    ) {
      return res.status(400).json({
        success: false,
        message: "Solo se permiten sucursales y sucursalPrincipal",
      });
    }

    const { sucursales, sucursalPrincipal } = body;

    if (
      !Array.isArray(sucursales) ||
      sucursales.length < 1 ||
      sucursales.length > 50 ||
      !sucursales.every((id) => typeof id === "string" && mongoose.isObjectIdOrHexString(id)) ||
      typeof sucursalPrincipal !== "string" ||
      !mongoose.isObjectIdOrHexString(sucursalPrincipal)
    ) {
      return res.status(400).json({
        success: false,
        message: "Debes indicar sucursales y una sede principal válidas",
      });
    }

    const ids = sucursales.map((id) => id.toLowerCase());
    const uniqueIds = [...new Set(ids)];

    if (uniqueIds.length !== ids.length) {
      return res.status(400).json({
        success: false,
        message: "No puedes repetir una sucursal en las asignaciones",
      });
    }

    if (!uniqueIds.includes(sucursalPrincipal.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "La sucursal principal debe estar entre las sucursales asignadas",
      });
    }

    // Buscamos el usuario, incluyendo tokenVersion para invalidar
    // sus sesiones anteriores cuando cambian las asignaciones.
    const user = await User.findById(req.params.id).select("+tokenVersion");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No se encontró el usuario",
      });
    }

    // Esta operación general no administra las cuentas privilegiadas.
    // Así evitamos modificar accidentalmente las sedes del super_admin.
    if (user.role === "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Las asignaciones del superadministrador requieren un procedimiento especial",
      });
    }

    // Todas las sucursales asignadas deben existir y estar activas.
    const activeBranches = await Sucursal.find({
      _id: { $in: uniqueIds },
      isActive: true,
    }).select("_id");

    if (activeBranches.length !== uniqueIds.length) {
      return res.status(400).json({
        success: false,
        message: "Una o más sucursales no existen o están inactivas",
      });
    }

    const previousIds = user.sucursales.map((id) => String(id)).sort();
    const nextIds = [...uniqueIds].sort();
    const principalChanged =
      String(user.sucursalPrincipal) !== sucursalPrincipal.toLowerCase();
    const assignmentsChanged =
      principalChanged || previousIds.join(",") !== nextIds.join(",");

    if (assignmentsChanged) {
      user.sucursales = uniqueIds;
      user.sucursalPrincipal = sucursalPrincipal;

      // Retiramos el acceso de sesiones anteriores, para que el usuario
      // deba iniciar sesión de nuevo con sus nuevas asignaciones.
      user.tokenVersion = (user.tokenVersion ?? 0) + 1;

      // save() ejecuta las validaciones propias de User.js.
      await user.save();
    }

    await user.populate([
      { path: "sucursales", select: BRANCH_PUBLIC_FIELDS },
      { path: "sucursalPrincipal", select: BRANCH_PUBLIC_FIELDS },
    ]);

    // No enviamos tokenVersion ni otros datos sensibles en la respuesta.
    const safeUser = await User.findById(user._id)
      .select(USER_PUBLIC_FIELDS)
      .populate({ path: "sucursales", select: BRANCH_PUBLIC_FIELDS })
      .populate({ path: "sucursalPrincipal", select: BRANCH_PUBLIC_FIELDS });

    return res.status(200).json({
      success: true,
      message: assignmentsChanged
        ? "Asignaciones actualizadas. Las sesiones anteriores del usuario fueron invalidadas."
        : "Las asignaciones no presentaban cambios",
      user: safeUser,
    });
  } catch (error) {
    if (error?.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Los datos de asignación no superaron las validaciones",
      });
    }
    return next(error);
  }
});


// =========================================================
// EDICIÓN ADMINISTRATIVA DE DATOS PERSONALES Y ROL
// PATCH /api/users/:id
// =========================================================
// No modificamos correos desde aquí: cambiar un correo exige
// comprobar nuevamente su titularidad mediante un flujo propio.
router.patch("/:id", requireTrustedOrigin, async (req, res, next) => {
  try {
    res.set("Cache-Control", "no-store");
    if (!mongoose.isObjectIdOrHexString(req.params.id)) {
      return res.status(400).json({ success: false, message: "Identificador inválido." });
    }
    if (!req.is("application/json") || !req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      return res.status(400).json({ success: false, message: "Se requiere un objeto JSON." });
    }
    const allowed = ["firstName", "lastName", "phone", "birthDate", "role"];
    if (Object.keys(req.body).length !== allowed.length || allowed.some(key => !Object.hasOwn(req.body, key))) {
      return res.status(400).json({ success: false, message: "Campos de edición no permitidos." });
    }
    const { firstName, lastName, phone, birthDate, role } = req.body;
    if ([firstName, lastName, phone, birthDate, role].some(value => typeof value !== "string")) {
      return res.status(400).json({ success: false, message: "Formato de campos inválido." });
    }
    const first = firstName.trim();
    const last = lastName.trim();
    const telephone = phone.trim();
    if (first.length < 2 || first.length > 60 || last.length < 2 || last.length > 60 ||
        /[\x00-\x1f\x7f]/u.test(first + last) || !isValidOptionalPhone(telephone) ||
        !["member", "admin"].includes(role)) {
      return res.status(400).json({ success: false, message: "Nombre, teléfono o rol no válidos." });
    }
    const date = parseRegistrationBirthDate(birthDate);
    if (!date) return res.status(400).json({ success: false, message: "Fecha de nacimiento inválida." });
    // Restringimos de forma atómica la edición a cuentas no privilegiadas.
    // No permitimos que se edite la propia cuenta del superadministrador.
    if (String(req.user._id) === req.params.id) {
      return res.status(403).json({ success: false, message: "Utiliza Mi cuenta para modificar tu perfil." });
    }
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, role: { $ne: "super_admin" } },
      {
        $set: { firstName: first, lastName: last, phone: telephone, birthDate: date, role },
        // Cualquier edición administrativa invalida sesiones antiguas.
        $inc: { tokenVersion: 1 },
      },
      { new: true, runValidators: true, context: "query" }
    ).select(USER_PUBLIC_FIELDS)
      .populate({ path: "sucursales", select: BRANCH_PUBLIC_FIELDS })
      .populate({ path: "sucursalPrincipal", select: BRANCH_PUBLIC_FIELDS });
    if (!user) return res.status(404).json({ success: false, message: "Usuario no encontrado o protegido." });
    return res.json({ success: true, message: "Datos actualizados; sesiones anteriores revocadas.", user });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Los datos no cumplen las validaciones." });
    }
    return next(error);
  }
});

// =========================================================
// ACTIVAR O DESACTIVAR CUENTAS EXISTENTES
// PATCH /api/users/:id/status
// =========================================================
router.patch("/:id/status", requireTrustedOrigin, async (req, res, next) => {
  try {
    res.set("Cache-Control", "no-store");
    if (!mongoose.isObjectIdOrHexString(req.params.id)) {
      return res.status(400).json({ success: false, message: "Identificador inválido." });
    }
    if (!req.is("application/json") || !req.body || typeof req.body !== "object" ||
        Array.isArray(req.body) || Object.keys(req.body).length !== 1 ||
        typeof req.body.isActive !== "boolean") {
      return res.status(400).json({ success: false, message: "Indica únicamente isActive como booleano." });
    }
    if (String(req.user._id) === req.params.id) {
      return res.status(403).json({ success: false, message: "No puedes desactivar tu propia cuenta." });
    }
    // La condición de rol se comprueba en la misma operación de MongoDB.
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, role: { $ne: "super_admin" }, isActive: { $ne: req.body.isActive } },
      {
        $set: {
          isActive: req.body.isActive,
          deactivatedAt: req.body.isActive ? null : new Date(),
        },
        $inc: { tokenVersion: 1 },
      },
      { new: true, runValidators: true }
    ).select(USER_PUBLIC_FIELDS)
      .populate({ path: "sucursales", select: BRANCH_PUBLIC_FIELDS })
      .populate({ path: "sucursalPrincipal", select: BRANCH_PUBLIC_FIELDS });
    if (!user) {
      return res.status(409).json({ success: false, message: "No se aplicó el cambio: cuenta protegida, inexistente o estado ya modificado. Actualiza el listado." });
    }
    return res.json({ success: true, message: req.body.isActive ? "Cuenta habilitada." : "Cuenta desactivada y sesiones revocadas.", user });
  } catch (error) { return next(error); }
});

export default router;
