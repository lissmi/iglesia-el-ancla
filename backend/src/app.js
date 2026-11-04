/* ========================================================= */
/* IMPORTACIONES */
/* ========================================================= */

// Importamos Express para crear la aplicación.
import express from "express";

// Importamos CORS para permitir solicitudes
// desde el frontend autorizado.
import cors from "cors";

// Importamos Helmet para agregar encabezados
// de seguridad a las respuestas.
import helmet from "helmet";

// Importamos Morgan para mostrar las solicitudes
// recibidas durante el desarrollo.
import morgan from "morgan";

// Importamos express-rate-limit para limitar
// las solicitudes recibidas por la API.
import rateLimit from "express-rate-limit";

// Importamos cookie-parser para leer
// las cookies enviadas por el navegador.
import cookieParser from "cookie-parser";

// Importamos la gestión de actividades puntuales para miembros.
import activitiesRoutes from "./routes/activitiesRoutes.js";

// Importamos las rutas del historial global de actividad.
// Incluye creaciones, últimas modificaciones y eliminaciones.
import activityHistoryRoutes from "./routes/activityHistoryRoutes.js";


/* ========================================================= */
/* IMPORTACIÓN DE RUTAS */
/* ========================================================= */

// Rutas generales de autenticación.
//
// Permiten iniciar y cerrar sesión a:
// - Miembros.
// - Administradores.
// - Superadministradores.
import loginRoutes from "./routes/loginRoutes.js";

// Rutas de gestión de usuarios.
import userRoutes from "./routes/userRoutes.js";

// Rutas de configuración institucional.
import systemSettingsRoutes from "./routes/systemSettingsRoutes.js";

// Rutas de administración de sucursales.
import sucursalRoutes from "./routes/sucursalRoutes.js";

// =========================================================
// POLÍTICAS DE SEGURIDAD DEL SISTEMA
// =========================================================

// Permite consultar la configuración efectiva
// de las sesiones desde el panel superadministrativo.
import sessionPolicyRoutes from "./routes/sessionPolicyRoutes.js";

// =========================================================
// POLÍTICAS DE BLOQUEO DE CUENTAS
// =========================================================

// Permite consultar las políticas de seguridad
// que protegen el inicio de sesión.
import loginSecurityPolicyRoutes from "./routes/loginSecurityPolicyRoutes.js";

// =========================================================
// PROTECCIÓN DE CUENTAS ADMINISTRATIVAS
// =========================================================

// Ruta protegida para consultar el estado
// de las medidas de seguridad administrativas.
import administratorProtectionRoutes from "./routes/administratorProtectionRoutes.js";

// =========================================================
// CAMBIO SEGURO DE CONTRASEÑA
// =========================================================

// Rutas de gestión de contraseña
// para usuarios autenticados.
import passwordRoutes from "./routes/passwordRoutes.js";

// =========================================================
// AUTORIZACIÓN OAUTH 2.0 DE GOOGLE
// =========================================================

// Rutas para conectar el correo institucional
// mediante una autorización segura de Google.
import googleOAuthRoutes from "./routes/googleOAuthRoutes.js";


/* =========================================================
   RUTAS DE DONACIONES Y WEBPAY PLUS
========================================================= */

// Importamos las rutas públicas de aportes voluntarios.
import donacionRoutes from "./routes/donacionRoutes.js";

// Importamos la API de Biblioteca Solidaria.
import libraryRoutes from "./routes/libraryRoutes.js";

// API de canciones: genera PDF y los almacena en Drive.
import songRoutes from "./routes/songRoutes.js";

// Importamos los eventos recurrentes visibles en la página pública.
import eventRoutes from "./routes/eventRoutes.js";

// Importamos la gestión de peticiones de oración.
import prayerRequestRoutes from "./routes/prayerRequestRoutes.js";

// Importamos la ruta pública para activar cuentas nuevas.
import accountActivationRoutes from "./routes/accountActivationRoutes.js";

/* ========================================================= */
/* CREACIÓN DE LA APLICACIÓN */
/* ========================================================= */

// Creamos la aplicación Express.
const app = express();

// Desactivamos el encabezado X-Powered-By
// para no revelar innecesariamente
// la tecnología utilizada por el servidor.
app.disable("x-powered-by");


// =========================================================
// CONFIGURACIÓN DEL PROXY
// =========================================================

// En producción confiamos en el primer proxy
// del proveedor de alojamiento.
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}


// =========================================================
// CONFIGURACIÓN DE CORS
// =========================================================

// Permitimos solicitudes únicamente
// desde el frontend autorizado.
app.use(
  cors({
    // Dirección del frontend.
    origin:
      process.env.FRONTEND_URL ||
      "http://localhost:3000",

    // Permitimos que el navegador
    // envíe las cookies de sesión.
    credentials: true,

    // Métodos HTTP autorizados.
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    // Encabezados permitidos.
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-CSRF-Token",
    ],
  })
);


// =========================================================
// ENCABEZADOS DE SEGURIDAD
// =========================================================

// Agregamos encabezados HTTP
// de protección mediante Helmet.
app.use(
  helmet()
);


// =========================================================
// PROCESAMIENTO DE SOLICITUDES
// =========================================================

// Procesamos solicitudes con contenido JSON.
app.use(
  express.json({
    limit: "1mb",
  })
);

// Procesamos datos enviados
// desde formularios tradicionales.
app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  })
);

// Habilitamos la lectura de cookies.
app.use(
  cookieParser()
);



/* =========================================================
   REGISTRO SEGURO DE SOLICITUDES HTTP
========================================================= */

// Registramos las solicitudes únicamente en desarrollo.
if (process.env.NODE_ENV === "development") {

  // Creamos un token personalizado para mostrar
  // solamente la ruta, sin los parámetros de la URL.
  morgan.token("ruta-segura", (req) => {

    // Obtenemos la dirección solicitada.
    const ruta = req.originalUrl || req.url || "/";

    // Eliminamos la cadena de consulta.
    // Así no imprimimos token_ws, TBK_TOKEN ni otros datos.
    return ruta.split("?")[0];

  });

  // Registramos método, ruta, estado y tiempo de respuesta.
  app.use(
    morgan(
      ":method :ruta-segura :status :response-time ms - :res[content-length]"
    )
  );
}



// =========================================================
// LÍMITE GENERAL DE SOLICITUDES
// =========================================================

// Limitamos las solicitudes a la API
// para reducir abusos y tráfico excesivo.
const apiLimiter = rateLimit({

  // Ventana de quince minutos.
  windowMs: 15 * 60 * 1000,

  // Máximo de solicitudes por IP.
  limit: 200,

  // Encabezados modernos.
  standardHeaders: "draft-8",

  // Desactivamos encabezados antiguos.
  legacyHeaders: false,

  // Mensaje al superar el límite.
  message: {
    success: false,
    message:
      "Se realizaron demasiadas solicitudes. Intente nuevamente más tarde.",
  },
});

// Aplicamos el límite a todas
// las rutas que comiencen con /api.
app.use(
  "/api",
  apiLimiter
);


// =========================================================
// RUTAS GENERALES
// =========================================================

// Ruta principal para comprobar
// que la API está funcionando.
app.get(
  "/api",
  (req, res) => {

    return res.status(200).json({
      success: true,
      message:
        "API de Iglesia El Ancla funcionando correctamente",
    });
  }
);


// =========================================================
// ESTADO DEL SERVIDOR
// =========================================================

// Permite comprobar si Express
// está respondiendo correctamente.
app.get(
  "/api/status",
  (req, res) => {

    return res.status(200).json({
      success: true,
      status: "online",
      environment:
        process.env.NODE_ENV ||
        "development",
      timestamp: new Date().toISOString(),
    });
  }
);


// =========================================================
// RUTAS DE AUTENTICACIÓN
// =========================================================

// Registro de las rutas de autenticación.
//
// Ejemplo:
// POST /api/auth/login
//
// La autenticación utiliza las cookies
// de sesión configuradas en el backend.
app.use(
  "/api/auth",
  loginRoutes
);



// =========================================================
// CONEXIÓN DEL CORREO INSTITUCIONAL
// =========================================================

// Permite iniciar la autorización OAuth de Google.
//
// El acceso está restringido al superadministrador.
// Todavía no implementamos el retorno de Google.

app.use(
  "/api/auth/google",
  googleOAuthRoutes
);

// =========================================================
// GESTIÓN DE CONTRASEÑAS
// =========================================================

// Permite cambiar la contraseña de la
// propia cuenta mediante una sesión válida.
//
// Las comprobaciones de identidad y contraseña
// se realizan dentro de passwordRoutes.js.

app.use(
  "/api/auth",
  passwordRoutes
);

// =========================================================
// RUTAS DE GESTIÓN DE USUARIOS
// =========================================================

// Permiten consultar y administrar
// la información de los usuarios.
//
// Los permisos correspondientes
// se validan dentro de userRoutes.js.
app.use(
  "/api/users",
  userRoutes
);


// =========================================================
// CONFIGURACIÓN INSTITUCIONAL
// =========================================================

// Permite consultar y actualizar
// la información general de Iglesia El Ancla.
//
// Endpoints:
//
// GET   /api/system/settings/general
// PATCH /api/system/settings/general
//
// Estas operaciones requieren:
// - Sesión autenticada.
// - Rol super_admin.
//
// Los permisos deben validarse
// dentro de systemSettingsRoutes.js.
app.use(
  "/api/system/settings",
  systemSettingsRoutes
);


// =========================================================
// ADMINISTRACIÓN DE SUCURSALES
// =========================================================

// Registramos las rutas de gestión
// de sucursales de Iglesia El Ancla.
//
// Endpoints:
//
// GET   /api/system/branches
// GET   /api/system/branches/:id
// POST  /api/system/branches
// PATCH /api/system/branches/:id
// PATCH /api/system/branches/:id/status
//
// Estas operaciones requieren:
// - Sesión autenticada.
// - Rol super_admin.
//
// El backend debe verificar los permisos,
// validar los datos y proteger las
// relaciones existentes con los usuarios.
app.use(
  "/api/system/branches",
  sucursalRoutes
);

// =========================================================
// POLÍTICA DE DURACIÓN DE SESIONES
// =========================================================

// Endpoint protegido para consultar
// la política de autenticación del servidor.
//
// La ruta exige super_admin mediante
// sus propios middlewares de seguridad.

app.use(
  "/api/system/session-policy",
  sessionPolicyRoutes
);


// =========================================================
// CONSULTA DE POLÍTICAS DE BLOQUEO DE CUENTAS
// =========================================================

// Endpoint de solo lectura.
//
// La autenticación y autorización exclusiva
// del superadministrador se comprueban
// dentro de loginSecurityPolicyRoutes.js.

app.use(
  "/api/system/login-security-policy",
  loginSecurityPolicyRoutes
);


// =========================================================
// CONSULTA DE PROTECCIÓN DE ADMINISTRADORES
// =========================================================

// Permite consultar las protecciones administrativas.
//
// La autenticación y autorización exclusiva
// del superadministrador se realizan
// dentro de administratorProtectionRoutes.js.

app.use(
  "/api/system/administrator-protection",
  administratorProtectionRoutes
);


/* =========================================================
   DONACIONES VOLUNTARIAS - WEBPAY PLUS
========================================================= */

// Registramos las rutas de aportes voluntarios.
//
// Endpoint disponible:
// POST /api/donaciones/iniciar
//
// Las rutas públicas no requieren autenticación.
// El módulo aplica validación y limitación de solicitudes.
app.use(
  "/api/donaciones",
  donacionRoutes
);

// Registramos la API de Biblioteca Solidaria.
app.use("/api/library/books", libraryRoutes);

// Catálogo protegido y administración del Cancionero de Alabanzas.
app.use("/api/songbook/songs", songRoutes);

// =========================================================
// GESTIÓN DE ACTIVIDADES PUNTUALES
// =========================================================

// Conectamos exclusivamente las actividades internas (no eventos públicos).
app.use("/api/activities", activitiesRoutes);

// =========================================================
// GESTIÓN DE EVENTOS PÚBLICOS RECURRENTES
// =========================================================

// Los visitantes consultan eventos publicados.
// Los administradores pueden crearlos, editarlos y eliminarlos.
app.use("/api/events", eventRoutes);

// =========================================================
// HISTORIAL GLOBAL DE ACTIVIDAD
// =========================================================

// Consultamos creaciones, últimas modificaciones y eliminaciones.
// La autenticación y los permisos se validan dentro del router.
app.use("/api/activity-history", activityHistoryRoutes);

// Conectamos la API de peticiones de oración.
app.use("/api/prayer-requests", prayerRequestRoutes);

// Permitimos completar la activación sin una sesión previa.
app.use("/api/auth/account-activation", accountActivationRoutes);

// =========================================================
// RUTAS INEXISTENTES (404)
// =========================================================

// Este middleware debe estar ubicado
// DESPUÉS de todas las rutas válidas.
//
// Se ejecuta únicamente cuando ninguna
// de las rutas anteriores coincide.
app.use(
  (req, res) => {

    return res.status(404).json({
      success: false,
      message:
        `La ruta ${req.originalUrl} no existe`,
    });
  }
);


// =========================================================
// MANEJO GLOBAL DE ERRORES
// =========================================================

// Este middleware recibe los errores
// enviados desde las rutas y controladores.
app.use(
  (error, req, res, next) => {

    // Registramos el error en el servidor.
    console.error(error);

    // Obtenemos el código HTTP correspondiente.
    const statusCode =
      error.status ||
      error.statusCode ||
      500;

    // Identificamos el entorno.
    const isProduction =
      process.env.NODE_ENV === "production";

    // Evitamos exponer detalles internos
    // cuando ocurre un error 500 en producción.
    const responseMessage =
      isProduction && statusCode === 500
        ? "Ocurrió un error interno en el servidor"
        : error.message ||
        "Ocurrió un error interno en el servidor";

    // Retornamos una respuesta controlada.
    return res.status(statusCode).json({
      success: false,
      message: responseMessage,
    });
  }
);


// =========================================================
// EXPORTACIÓN
// =========================================================

// Exportamos la aplicación Express.
//
// server.js se encarga de inicializar
// MongoDB y levantar el servidor.
export default app;
