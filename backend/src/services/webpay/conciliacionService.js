
/* =========================================================
   SERVICIO DE CONCILIACIÓN - WEBPAY PLUS
   IGLESIA EL ANCLA
========================================================= */

// Tiempo mínimo para revisar operaciones sin autorización.
const UMBRAL_REVISION_MINUTOS = 20;


/* =========================================================
   DETERMINAR ESTADO DE UNA DONACIÓN
========================================================= */

// Esta función evalúa el resultado de Transbank.
// No modifica MongoDB ni ejecuta pagos.
export const determinarEstadoConciliacion = (
  donacion,
  respuesta,
  ahora = new Date()
) => {

  // Comprobamos que existan los datos necesarios.
  if (!donacion || !respuesta || !donacion.createdAt) {
    return null;
  }

  // Nunca modificamos operaciones ya finalizadas.
  if (
    ["aprobada", "rechazada", "anulada"].includes(
      donacion.estado
    )
  ) {
    return null;
  }

  // Verificamos la identidad de la transacción.
  const datosCoinciden =
    respuesta.buy_order === donacion.ordenCompra &&
    respuesta.session_id === donacion.idSesion &&
    respuesta.amount === donacion.monto;

  // Si algún identificador es distinto, no actualizamos.
  if (!datosCoinciden) {
    return null;
  }

  // Calculamos la antigüedad de la operación.
  const antiguedadMinutos = Math.floor(
    (
      ahora.getTime() -
      new Date(donacion.createdAt).getTime()
    ) / 60000
  );

  // Rechazamos fechas inválidas o futuras.
  if (
    !Number.isFinite(antiguedadMinutos) ||
    antiguedadMinutos < 0
  ) {
    return null;
  }

  // Autorización financiera explícita.
  if (
    respuesta.status === "AUTHORIZED" &&
    respuesta.response_code === 0
  ) {
    return "aprobada";
  }

  // Rechazo informado por Transbank.
  if (
    respuesta.status === "FAILED" &&
    Number.isInteger(respuesta.response_code) &&
    respuesta.response_code !== 0
  ) {
    return "rechazada";
  }

  // Anulación informada por el proveedor.
  if (
    ["REVERSED", "NULLIFIED"].includes(respuesta.status)
  ) {
    return "anulada";
  }

  // Una operación antigua sin resultado definitivo
  // pasa a revisión, sin declararse rechazada.
  if (
    respuesta.status === "INITIALIZED" &&
    antiguedadMinutos >= UMBRAL_REVISION_MINUTOS &&
    donacion.estado !== "revision"
  ) {
    return "revision";
  }

  // No se propone ninguna modificación.
  return null;
};
