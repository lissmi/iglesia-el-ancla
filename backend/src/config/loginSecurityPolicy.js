// =========================================================
// POLÍTICA CENTRALIZADA DE PROTECCIÓN DEL INICIO DE SESIÓN
// =========================================================
// Los valores definidos aquí serán utilizados por el login
// y por el endpoint informativo del panel de Seguridad.
//
// IMPORTANTE:
// Este archivo no contiene contraseñas, secretos JWT
// ni información individual de los usuarios.

// Cantidad de contraseñas incorrectas permitidas antes
// de bloquear temporalmente una cuenta.
const MAX_LOGIN_ATTEMPTS = 5;

// Duración del bloqueo de una cuenta: 15 minutos.
const ACCOUNT_LOCK_TIME_MS = 15 * 60 * 1000;

// Ventana de observación del limitador por dirección IP.
const LOGIN_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

// Solicitudes máximas por IP en esa ventana.
const LOGIN_RATE_LIMIT_MAX_REQUESTS = 10;

// Exportamos constantes reutilizables para que la política
// no se duplique entre rutas y componentes del backend.
export {
  MAX_LOGIN_ATTEMPTS,
  ACCOUNT_LOCK_TIME_MS,
  LOGIN_RATE_LIMIT_WINDOW_MS,
  LOGIN_RATE_LIMIT_MAX_REQUESTS,
};
