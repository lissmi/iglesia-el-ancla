
/* =========================================================
   AUDITORÍA DE DONACIONES PENDIENTES - WEBPAY PLUS
========================================================= */

// Importamos Mongoose para cerrar la conexión al finalizar.
import mongoose from "mongoose";

// Importamos nuestra conexión existente con MongoDB Atlas.
import connectDatabase from "../../config/database.js";

// Importamos el modelo que almacena las donaciones.
import Donacion from "../../models/Donacion.js";

// Importamos el cliente oficial de Webpay configurado.
import {
  crearTransaccionWebpay,
} from "../../services/webpay/webpay.js";


/* =========================================================
   ESTADOS QUE REQUIEREN REVISIÓN
========================================================= */

// Definimos los estados que todavía no son definitivos.
const ESTADOS_PENDIENTES = [
  "pendiente",
  "iniciada",
  "confirmando",
  "revision",
];


/* =========================================================
   AUDITORÍA DE TRANSACCIONES
========================================================= */

// Creamos la función principal de auditoría.
const auditarDonaciones = async () => {

  try {

    // Conectamos con MongoDB Atlas.
    await connectDatabase();

    // Buscamos las operaciones no finalizadas
    // realizadas en ambiente de integración.
    const donaciones = await Donacion.find({
      ambiente: "integration",
      estado: { $in: ESTADOS_PENDIENTES },
    })

      // Revisamos primero las operaciones antiguas.
      .sort({ createdAt: 1 })

      // Limitamos el número de consultas por ejecución.
      .limit(20)

      // Recuperamos el token, normalmente oculto.
      .select(
        "+tokenWebpay ordenCompra idSesion monto estado createdAt"
      );

    // Informamos la cantidad de operaciones encontradas.
    console.log(
      `\nDonaciones pendientes encontradas: ${donaciones.length}`
    );

    // Terminamos cuando no hay operaciones pendientes.
    if (donaciones.length === 0) {
      return;
    }

    // Creamos el cliente oficial de Webpay.
    const transaccion = crearTransaccionWebpay();

    // Revisamos cada operación individualmente.
    for (const donacion of donaciones) {

      // Mostramos su referencia, nunca su token.
      console.log("\n------------------------------");
      console.log("Orden:", donacion.ordenCompra);
      console.log("Monto:", donacion.monto);
      console.log("Estado MongoDB:", donacion.estado);

      // Calculamos cuánto tiempo ha transcurrido
      // desde la creación de la operación.
      const antiguedadMinutos = Math.floor(
        (Date.now() - donacion.createdAt.getTime()) /
        60000
      );

      // Mostramos la antigüedad de la transacción.
      console.log(
        "Antigüedad:", antiguedadMinutos, "minutos"
      );

      // Si aún no tiene token, no podemos consultar Webpay.
      if (!donacion.tokenWebpay) {
        console.log("Sin token de Transbank.");
        continue;
      }

      try {

        // Consultamos el estado actual sin ejecutar commit().
        const respuesta = await transaccion.status(
          donacion.tokenWebpay
        );

        // Verificamos que corresponda a nuestra operación.
        const datosCoinciden =
          respuesta.buy_order === donacion.ordenCompra &&
          respuesta.session_id === donacion.idSesion &&
          respuesta.amount === donacion.monto;

        // Mostramos únicamente el estado y las verificaciones.
        console.log("Estado Transbank:", respuesta.status);
        console.log(
          "Código respuesta:",
          respuesta.response_code ?? "No disponible"
        );
        console.log("Datos coinciden:", datosCoinciden);

        // Advertimos cuando hay una autorización
        // que todavía no está reflejada como aprobada.
        if (
          datosCoinciden &&
          respuesta.status === "AUTHORIZED" &&
          respuesta.response_code === 0
        ) {
          console.log(
            "ATENCIÓN: requiere conciliación financiera."
          );
        }

      } catch {

        // Un error de consulta no significa rechazo.
        console.log(
          "No fue posible consultar esta operación."
        );
      }
    }

  } catch {

    // Evitamos mostrar credenciales o datos sensibles.
    console.error(
      "Ocurrió un error durante la auditoría."
    );

  } finally {

    // Cerramos la conexión con MongoDB Atlas.
    await mongoose.disconnect();
  }
};


// Ejecutamos la auditoría.
await auditarDonaciones();
