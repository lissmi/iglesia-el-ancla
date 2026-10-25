
/* =========================================================
   DIAGNÓSTICO DE WEBPAY PLUS
   IGLESIA EL ANCLA
========================================================= */

// Importamos Mongoose para cerrar la conexión al terminar.
import mongoose from "mongoose";

// Importamos la conexión existente con MongoDB Atlas.
import connectDatabase from "../../config/database.js";

// Importamos nuestro modelo de donaciones.
import Donacion from "../../models/Donacion.js";

// Importamos el cliente de Transbank en modo integración.
import {
  crearTransaccionWebpay,
} from "../../services/webpay/webpay.js";


/* =========================================================
   CONSULTAR LA ÚLTIMA DONACIÓN DE PRUEBA
========================================================= */

// Creamos una función asíncrona de diagnóstico.
const diagnosticarWebpay = async () => {

  try {

    // Conectamos con MongoDB Atlas.
    await connectDatabase();

    // Buscamos la última donación creada en integración.
    const donacion = await Donacion.findOne({
      ambiente: "integration",
    })

      // Ordenamos desde la más reciente.
      .sort({ createdAt: -1 })

      // Recuperamos el token, normalmente oculto.
      .select(
        "+tokenWebpay ordenCompra idSesion monto estado createdAt"
      );

    // Comprobamos si existe una donación.
    if (!donacion) {
      console.log("No existen donaciones de prueba.");
      return;
    }

    // Mostramos únicamente información no secreta.
    console.log("\nDATOS EN MONGODB:");

    console.log({
      ordenCompra: donacion.ordenCompra,
      monto: donacion.monto,
      estado: donacion.estado,
      fecha: donacion.createdAt,
    });

    // Comprobamos si existe un token almacenado.
    if (!donacion.tokenWebpay) {
      console.log("Esta donación no tiene token Webpay.");
      return;
    }

    // Obtenemos el cliente configurado de Transbank.
    const transaccion = crearTransaccionWebpay();

    // Consultamos el estado mediante la API oficial.
    // status() no realiza cobros ni confirma pagos.
    const respuesta = await transaccion.status(
      donacion.tokenWebpay
    );

    // Mostramos el resultado sin imprimir el token.
    console.log("\nRESPUESTA DE TRANSBANK:");

    console.log({
      estado: respuesta.status,

      codigoRespuesta: respuesta.response_code ?? null,

      montoCoincide:
        respuesta.amount === donacion.monto,

      ordenCoincide:
        respuesta.buy_order === donacion.ordenCompra,

      sesionCoincide:
        respuesta.session_id === donacion.idSesion,
    });

  } catch (error) {

    // Mostramos un diagnóstico controlado.
    // No imprimimos tokens ni credenciales.
    console.error(
      "No se pudo consultar el estado en Transbank."
    );

    // Mostramos el código HTTP cuando está disponible.
    console.error(
      "Código:",
      error?.response?.status ??
      error?.statusCode ??
      "No disponible"
    );

  } finally {

    // Cerramos la conexión con MongoDB.
    await mongoose.disconnect();

  }
};

// Ejecutamos el diagnóstico.
await diagnosticarWebpay();
