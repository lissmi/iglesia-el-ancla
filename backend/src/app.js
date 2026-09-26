


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
// la cantidad de solicitudes por dirección IP.
import rateLimit from "express-rate-limit";


// Importamos cookie-parser para poder leer
// las cookies enviadas por el navegador.
import cookieParser from "cookie-parser";


// Importamos las rutas generales
// de inicio de sesión.
//
// Estas rutas servirán para:
// - Miembros.
// - Administradores.
// - Superadministradores.
import loginRoutes from "./routes/loginRoutes.js";


// Creamos la aplicación de Express.
const app = express();


// Desactivamos el encabezado X-Powered-By.
//
// Evitamos revelar innecesariamente
// que el servidor utiliza Express.
app.disable(
  "x-powered-by"
);


// Si el backend se encuentra en producción,
// confiamos en el primer proxy del alojamiento.
//
// Esto será útil cuando despleguemos
// el backend en un servicio como Render.
if (
  process.env.NODE_ENV ===
  "production"
) {
  app.set(
    "trust proxy",
    1
  );
}


// =========================================================
// CONFIGURACIÓN DE CORS
// =========================================================

// Configuramos CORS.
//
// Solamente permitimos solicitudes
// desde la dirección definida en FRONTEND_URL.
app.use(
  cors({
    // Definimos el frontend autorizado.
    origin:
      process.env.FRONTEND_URL ||
      "http://localhost:3000",

    // Permitimos enviar y recibir cookies
    // entre frontend y backend.
    credentials: true,

    // Definimos los métodos HTTP permitidos.
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    // Definimos los encabezados
    // permitidos desde el frontend.
    allowedHeaders: [
      "Content-Type",
      "Authorization",

      // Dejamos preparado este encabezado
      // para la futura protección CSRF.
      "X-CSRF-Token",
    ],
  })
);


// =========================================================
// SEGURIDAD Y PROCESAMIENTO DE DATOS
// =========================================================

// Agregamos encabezados de seguridad
// a todas las respuestas del servidor.
app.use(
  helmet()
);


// Permitimos recibir información
// enviada en formato JSON.
app.use(
  express.json({
    // Limitamos el tamaño del contenido
    // para reducir solicitudes excesivas.
    limit: "1mb",
  })
);


// Permitimos recibir información enviada
// desde formularios tradicionales.
app.use(
  express.urlencoded({
    // Permitimos procesar objetos sencillos.
    extended: true,

    // Aplicamos el mismo límite
    // utilizado para JSON.
    limit: "1mb",
  })
);


// Permitimos leer las cookies
// enviadas por el navegador.
app.use(
  cookieParser()
);


// =========================================================
// REGISTRO DE SOLICITUDES
// =========================================================

// Mostramos las solicitudes recibidas
// solamente durante el desarrollo.
if (
  process.env.NODE_ENV ===
  "development"
) {
  app.use(
    morgan("dev")
  );
}


// =========================================================
// LÍMITE GENERAL DE LA API
// =========================================================

// Creamos un límite general.
//
// Cada dirección IP podrá realizar
// hasta 200 solicitudes en quince minutos.
const apiLimiter = rateLimit({
  // Duración de la ventana.
  windowMs:
    15 * 60 * 1000,

  // Cantidad máxima de solicitudes.
  limit: 200,

  // Utilizamos encabezados modernos.
  standardHeaders:
    "draft-8",

  // Desactivamos encabezados antiguos.
  legacyHeaders: false,

  // Retornamos una respuesta JSON
  // cuando se supera el límite.
  message: {
    success: false,

    message:
      "Se realizaron demasiadas solicitudes. Intente nuevamente más tarde.",
  },
});


// Aplicamos el límite general a todas
// las rutas que comiencen con /api.
app.use(
  "/api",
  apiLimiter
);


// =========================================================
// RUTAS GENERALES
// =========================================================

// Ruta inicial para comprobar
// que la API funciona.
app.get(
  "/api",
  (
    req,
    res
  ) => {

    // Retornamos una respuesta exitosa.
    res.status(200).json({
      success: true,

      message:
        "API de Iglesia El Ancla funcionando correctamente",
    });
  }
);


// Ruta para comprobar
// el estado actual del servidor.
app.get(
  "/api/status",
  (
    req,
    res
  ) => {

    // Retornamos información básica
    // sobre el servidor.
    res.status(200).json({
      success: true,

      status:
        "online",

      environment:
        process.env.NODE_ENV ||
        "development",

      timestamp:
        new Date().toISOString(),
    });
  }
);


// =========================================================
// RUTAS GENERALES DE AUTENTICACIÓN
// =========================================================

// Registramos las rutas de autenticación.
//
// Como loginRoutes contiene:
//
// router.post("/login", ...)
//
// La dirección completa será:
//
// POST /api/auth/login
app.use(
  "/api/auth",
  loginRoutes
);


// =========================================================
// RUTAS ADMINISTRATIVAS
// =========================================================

// Más adelante registraremos aquí
// las rutas administrativas protegidas.
//
// Ejemplo futuro:
//
// import adminRoutes
//   from "./routes/adminRoutes.js";
//
// app.use(
//   "/api/admin",
//   adminRoutes
// );


// =========================================================
// RUTAS INEXISTENTES
// =========================================================

// Este middleware se ejecuta cuando
// ninguna ruta anterior coincide.
app.use(
  (
    req,
    res
  ) => {

    // Retornamos un error 404.
    res.status(404).json({
      success: false,

      message:
        `La ruta ${req.originalUrl} no existe`,
    });
  }
);


// =========================================================
// MANEJO GLOBAL DE ERRORES
// =========================================================

// Este middleware recibe errores enviados
// desde cualquier ruta o controlador.
app.use(
  (
    error,
    req,
    res,
    next
  ) => {

    // Mostramos el error en la terminal
    // para poder revisarlo durante el desarrollo.
    console.error(error);


    // Obtenemos el código HTTP del error.
    const statusCode =
      error.status ||
      error.statusCode ||
      500;


    // Comprobamos si estamos
    // trabajando en producción.
    const isProduction =
      process.env.NODE_ENV ===
      "production";


    // En producción no mostramos detalles
    // de errores internos.
    const responseMessage =
      isProduction &&
      statusCode === 500
        ? "Ocurrió un error interno en el servidor"
        : error.message ||
          "Ocurrió un error interno en el servidor";


    // Retornamos una respuesta controlada.
    res
      .status(statusCode)
      .json({
        success: false,

        message:
          responseMessage,
      });
  }
);


// Exportamos la aplicación para utilizarla
// dentro de server.js.
export default app;