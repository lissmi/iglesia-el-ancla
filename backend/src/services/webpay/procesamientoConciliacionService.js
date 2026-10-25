
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
   DEPENDENCIAS DEL PROCESAMIENTO
========================================================= */

// Procesamos la operación utilizando las dependencias
// reales de manera predeterminada.
//
// El tercer argumento permite utilizar una consulta
// simulada durante nuestras pruebas automatizadas.
export const procesarConciliacionDonacion = async (
    donacion,
    { aplicarCambios = false } = {},
    {
        consultarEstado = async (token) => {

            // Creamos el cliente real de Transbank.
            const transaccion = crearTransaccionWebpay();

            // Consultamos el estado de la operación.
            return transaccion.status(token);
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

    /* =====================================================
       ACTUALIZACIÓN ATÓMICA EN MONGODB
    ===================================================== */

    // Actualizamos únicamente si la operación
    // conserva el estado consultado originalmente.
    //
    // Esto evita sobrescribir cambios realizados
    // por otra solicitud durante el procesamiento.
    const actualizada = await Donacion.findOneAndUpdate(
        {
            _id: donacion._id,
            ambiente: "integration",
            estado: donacion.estado,
        },
        {
            $set: campos,
        },
        {
            new: true,
        }
    );

    // Informamos si se aplicó el cambio.
    resultado.actualizado = Boolean(actualizada);

    resultado.mensaje = actualizada
        ? "Actualización realizada."
        : "La operación cambió durante la conciliación.";

    // Devolvemos el resultado sin información sensible.
    return resultado;
};
