
/* =========================================================
   CONFIGURACIÓN DE TRANSBANK - WEBPAY PLUS
========================================================= */

// Importamos el paquete completo de Transbank.
// Utilizamos esta forma para mantener compatibilidad
// con CommonJS dentro de nuestro proyecto ES Modules.
import transbankSdk from "transbank-sdk";

// Extraemos los componentes necesarios del SDK.
const {
  Environment,
  IntegrationApiKeys,
  IntegrationCommerceCodes,
  Options,
  WebpayPlus,
} = transbankSdk;


/* =========================================================
   CREACIÓN DEL CLIENTE WEBPAY
========================================================= */

// Creamos una función que configura y devuelve
// un cliente para realizar transacciones de Webpay.
export const crearTransaccionWebpay = () => {

  // Obtenemos el ambiente establecido en el archivo .env.
  const ambiente = process.env.TRANSBANK_ENVIRONMENT;

  // Permitimos únicamente el ambiente de integración.
  // Así evitamos activar pagos reales accidentalmente.
  if (ambiente !== "integration") {
    throw new Error(
      "Webpay no está configurado para el ambiente de integración."
    );
  }

  // Creamos las opciones de conexión con Transbank.
  const opciones = new Options(

    // Código de comercio oficial para pruebas.
    IntegrationCommerceCodes.WEBPAY_PLUS,

    // Clave de API oficial para pruebas.
    IntegrationApiKeys.WEBPAY,

    // Ambiente de integración de Transbank.
    Environment.Integration
  );

  // Creamos una instancia de Webpay Plus.
  const transaccion = new WebpayPlus.Transaction(opciones);

  // Devolvemos el cliente configurado.
  return transaccion;
};
