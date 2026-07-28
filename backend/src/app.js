// Importamos Express para crear la aplicación.
import express from "express";

// Importamos CORS para permitir solicitudes
// desde el frontend.
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

// Creamos la aplicación de Express.
const app = express();

// Configuramos CORS.
// Solo permitimos solicitudes desde la URL
// definida en el archivo .env.
app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        credentials: true,
    })
);

// Agregamos encabezados de seguridad.
app.use(helmet());

// Permitimos recibir datos en formato JSON.
app.use(
    express.json({
        limit: "10mb",
    })
);

// Permitimos recibir datos enviados desde formularios.
app.use(
    express.urlencoded({
        extended: true,
        limit: "10mb",
    })
);

// Mostramos información de las solicitudes
// solamente durante el desarrollo.
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// Creamos un límite general de solicitudes.
// Cada dirección IP podrá realizar hasta
// 200 solicitudes cada 15 minutos.
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message:
            "Se realizaron demasiadas solicitudes. Intente nuevamente más tarde.",
    },
});

// Aplicamos el límite a todas las rutas que
// comiencen con /api.
app.use("/api", apiLimiter);

// Ruta inicial para comprobar que la API funciona.
app.get("/api", (req, res) => {
    res.status(200).json({
        success: true,
        message:
            "API de Iglesia El Ancla funcionando correctamente",
    });
});

// Ruta de comprobación del estado del servidor.
app.get("/api/status", (req, res) => {
    res.status(200).json({
        success: true,
        status: "online",
        environment:
            process.env.NODE_ENV || "development",
        timestamp: new Date().toISOString(),
    });
});

// Middleware para rutas que no existen.
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `La ruta ${req.originalUrl} no existe`,
    });
});

// Middleware global para manejar errores.
app.use((error, req, res, next) => {
    console.error(error);

    res.status(error.status || 500).json({
        success: false,
        message:
            error.message ||
            "Ocurrió un error interno en el servidor",
    });
});

// Exportamos la aplicación para utilizarla
// dentro de server.js.
export default app;