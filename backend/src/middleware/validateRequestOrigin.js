// =========================================================
// PROTECCIÓN DE ORIGEN PARA OPERACIONES CON COOKIES
// Reutilizable en los módulos administrativos.
// =========================================================

// Reunimos los dominios del frontend habilitados en este entorno.
const configuredOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_PRODUCTION,
];

// La dirección local solo se permite expresamente en desarrollo.
if (process.env.NODE_ENV !== "production") {
  configuredOrigins.push("http://localhost:3000");
}

// Normalizamos los valores para comparar orígenes exactos.
const allowedOrigins = new Set(
  configuredOrigins
    .filter(Boolean)
    .flatMap((entry) => entry.split(","))
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      try {
        return new URL(entry).origin;
      } catch {
        return null;
      }
    })
    .filter(Boolean)
);

// Rechazamos modificaciones desde una página ajena a la PWA.
export default function validateRequestOrigin(req, res, next) {
  // El navegador envía Origin en solicitudes de formularios/API.
  const origin = req.get("Origin");

  // Requerimos un origen presente y reconocido; no usamos comodines.
  if (!origin || !allowedOrigins.has(origin)) {
    return res.status(403).json({
      success: false,
      message: "Origen de solicitud no autorizado",
    });
  }

  // Continuamos si la petición procede del frontend autorizado.
  return next();
}
