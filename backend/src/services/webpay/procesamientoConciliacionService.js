
/* =========================================================
   PROCESAMIENTO DE CONCILIACIÓN - WEBPAY PLUS
   IGLESIA EL ANCLA
========================================================= */

// Importamos el modelo de donaciones.
import Donacion from "../../models/Donacion.js";

// Importamos el cliente configurado de Transbank.
import {
    crearTransaccionWebpay,
} from "./webpay.js";

// Importamos las reglas centralizadas de conciliación.
import {
    determinarEstadoConciliacion,
} from "./conciliacionService.js";


/* =========================================================
   PROCESAR UNA DONACIÓN PENDIENTE
========================================================= */

// Procesa una operación previamente recuperada de MongoDB.
//
// aplicarCambios = false:
// Consulta Transbank, pero no modifica MongoDB.
//
// aplicarCambios = true:
// Permite actualizar la operación cuando corresponde.
//
// La conexión con MongoDB debe estar inicializada
// por el script o proceso que invoque este servicio.


/* =========================================================
   PROCESAR UNA DONACIÓN PENDIENTE
========================================================= */

// Recibimos la donación, las opciones de ejecución
// y las dependencias necesarias para el procesamiento.
export const procesarConciliacionDonacion = async (
    donacion,
    { aplicarCambios = false } = {},
    {
        // Por defecto consultamos Transbank realmente.
        // En las pruebas podemos sustituir esta función.
        consultarEstado = async (token) => {

            const transaccion = crearTransaccionWebpay();

            return transaccion.status(token);
        },

        // Por defecto actualizamos MongoDB Atlas.
        // En las pruebas utilizaremos una función simulada.
        actualizarDonacion = async (filtro, campos) => {

            return Donacion.findOneAndUpdate(
                filtro,
                {
                    $set: campos,
                },
                {
                    new: true,
                }
            );
        },

    } = {}
) => {



    // Restringimos este procesamiento al ambiente
    // de integración mientras seguimos desarrollando.
    if (
        process.env.TRANSBANK_ENVIRONMENT !== "integration" ||
        process.env.NODE_ENV === "production"
    ) {
        throw new Error(
            "La conciliación de pruebas solo está disponible en integración."
        );
    }

    // Preparamos el resultado de la operación.
    // No incluimos el token de Transbank.
    const resultado = {
        ordenCompra: donacion?.ordenCompra || null,
        estadoAnterior: donacion?.estado || null,
        estadoTransbank: null,
        estadoPropuesto: null,
        actualizado: false,
        mensaje: "",
    };

    // Solo procesamos donaciones válidas
    // correspondientes al ambiente de integración.
    if (
        !donacion?._id ||
        donacion.ambiente !== "integration"
    ) {
        resultado.mensaje = "Donación no válida para conciliación.";
        return resultado;
    }

    // Nunca procesamos nuevamente operaciones finalizadas.
    if (
        ["aprobada", "rechazada", "anulada"].includes(
            donacion.estado
        )
    ) {
        resultado.mensaje = "Operación ya finalizada.";
        return resultado;
    }

    // Para consultar el proveedor necesitamos
    // el token almacenado en MongoDB.
    if (!donacion.tokenWebpay) {
        resultado.mensaje = "Sin token: requiere revisión.";
        return resultado;
    }

    /* =====================================================
       CONSULTAR TRANSBANK
    ===================================================== */

    // Consultamos el estado mediante la dependencia configurada.
    //
    // Durante el funcionamiento normal utilizamos Transbank.
    // Durante las pruebas podemos utilizar una respuesta simulada.
    const respuesta = await consultarEstado(
        donacion.tokenWebpay
    );

    // Registramos el estado recibido.
    resultado.estadoTransbank = respuesta.status;

    /* =====================================================
       VALIDAR IDENTIFICADORES
    ===================================================== */

    // Comparamos los identificadores y el monto
    // con la operación registrada en nuestra BD.
    const datosCoinciden =
        respuesta.buy_order === donacion.ordenCompra &&
        respuesta.session_id === donacion.idSesion &&
        respuesta.amount === donacion.monto;

    // Ante una inconsistencia, nunca actualizamos.
    if (!datosCoinciden) {
        resultado.mensaje = "Los datos de la transacción no coinciden.";
        return resultado;
    }

    /* =====================================================
       DETERMINAR EL NUEVO ESTADO
    ===================================================== */

    // Utilizamos las reglas que ya validamos
    // mediante nuestras pruebas automatizadas.
    const nuevoEstado = determinarEstadoConciliacion(
        donacion,
        respuesta
    );

    // Si no se propone ningún cambio,
    // mantenemos el registro original.
    if (!nuevoEstado) {
        resultado.mensaje = "Sin cambios necesarios.";
        return resultado;
    }

    // Guardamos el estado propuesto.
    resultado.estadoPropuesto = nuevoEstado;

    /* =====================================================
       MODO SIMULACIÓN
    ===================================================== */

    // No escribimos en MongoDB salvo que
    // se autorice expresamente aplicar cambios.
    if (!aplicarCambios) {
        resultado.mensaje = "Simulación: sin modificaciones.";
        return resultado;
    }

    /* =====================================================
       PREPARAR ACTUALIZACIÓN
    ===================================================== */

    // Preparamos los campos que se actualizarán.
    const campos = {
        estado: nuevoEstado,
    };

    // Cuando existe un resultado definitivo,
    // almacenamos sus datos de conciliación.
    if (nuevoEstado !== "revision") {

        // Registramos el momento de conciliación.
        campos.fechaConfirmacion = new Date();

        // Guardamos el código financiero de respuesta.
        campos.codigoRespuesta =
            Number.isInteger(respuesta.response_code)
                ? respuesta.response_code
                : null;

        // Guardamos la autorización cuando exista.
        campos.codigoAutorizacion =
            typeof respuesta.authorization_code === "string"
                ? respuesta.authorization_code
                : null;
    }


    // Actualizamos la donación utilizando la dependencia
    // configurada para el procesamiento.
    //
    // Durante el funcionamiento normal se utiliza MongoDB.
    // Durante las pruebas podremos simular la actualización.
    const actualizada = await actualizarDonacion(
        {
            // Identificador único del documento.
            _id: donacion._id,

            // Ambiente de integración.
            ambiente: "integration",

            // El estado debe coincidir con el consultado.
            // Esto permite utilizar una actualización condicional.
            estado: donacion.estado,
        },

        // Campos que queremos actualizar.
        campos
    );

    // Confirmamos si la operación fue actualizada.
    resultado.actualizado = Boolean(actualizada);

    // Informamos el resultado sin exponer datos sensibles.
    resultado.mensaje = actualizada
        ? "Actualización realizada."
        : "La operación cambió durante la conciliación.";

    // Devolvemos el resultado del procesamiento.
    return resultado;

};
