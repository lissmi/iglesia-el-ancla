
/* =========================================================
   PRUEBAS DEL PROCESAMIENTO DE CONCILIACIÓN
   IGLESIA EL ANCLA
========================================================= */

// Importamos el sistema de pruebas de Node.js.
import test from "node:test";

// Importamos las herramientas de verificación.
import assert from "node:assert/strict";

// Importamos el servicio de procesamiento.
import {
    procesarConciliacionDonacion,
} from "../../src/services/webpay/procesamientoConciliacionService.js";


/* =========================================================
   DATOS SIMULADOS
========================================================= */

// Creamos una donación ficticia.
// No existe en MongoDB Atlas.
const donacionBase = {
    _id: "ID-SIMULADO",
    ordenCompra: "ANCLA-1234567890abcdef",
    idSesion: "SES-PRUEBA",
    monto: 5000,
    ambiente: "integration",
    estado: "iniciada",
    tokenWebpay: null,
    createdAt: new Date(),
};


/* =========================================================
   PRUEBA 1: AMBIENTE INCORRECTO
========================================================= */

test("Impide procesar donaciones de otro ambiente", async () => {

    const donacion = {
        ...donacionBase,
        ambiente: "production",
    };

    const resultado = await procesarConciliacionDonacion(
        donacion
    );

    assert.equal(resultado.actualizado, false);

    assert.equal(resultado.estadoTransbank, null);

    assert.equal(
        resultado.mensaje,
        "Donación no válida para conciliación."
    );
});


/* =========================================================
   PRUEBA 2: OPERACIÓN FINALIZADA
========================================================= */

test("No vuelve a procesar una donación aprobada", async () => {

    const donacion = {
        ...donacionBase,
        estado: "aprobada",
    };

    const resultado = await procesarConciliacionDonacion(
        donacion
    );

    assert.equal(resultado.actualizado, false);

    assert.equal(resultado.estadoTransbank, null);

    assert.equal(
        resultado.mensaje,
        "Operación ya finalizada."
    );
});


/* =========================================================
   PRUEBA 3: OPERACIÓN SIN TOKEN
========================================================= */

test("No consulta Transbank cuando falta el token", async () => {

    const resultado = await procesarConciliacionDonacion(
        donacionBase
    );

    assert.equal(resultado.actualizado, false);

    assert.equal(resultado.estadoTransbank, null);

    assert.equal(
        resultado.mensaje,
        "Sin token: requiere revisión."
    );
});


/* =========================================================
   PRUEBA 4: IDENTIFICADOR INTERNO AUSENTE
========================================================= */

test("Rechaza una donación sin identificador interno", async () => {

    const donacion = {
        ...donacionBase,
        _id: null,
    };

    const resultado = await procesarConciliacionDonacion(
        donacion
    );

    assert.equal(resultado.actualizado, false);

    assert.equal(
        resultado.mensaje,
        "Donación no válida para conciliación."
    );
});


/* =========================================================
   DATOS PARA PRUEBAS CON TRANSBANK SIMULADO
========================================================= */

// Creamos una donación ficticia con un token de prueba.
const donacionConToken = {
    ...donacionBase,
    tokenWebpay: "TOKEN_SIMULADO",
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
};

// Creamos una respuesta compatible con nuestra operación.
const crearRespuestaSimulada = (cambios = {}) => ({
    buy_order: donacionConToken.ordenCompra,
    session_id: donacionConToken.idSesion,
    amount: donacionConToken.monto,
    status: "AUTHORIZED",
    response_code: 0,
    ...cambios,
});


/* =========================================================
   PRUEBA 5: AUTORIZACIÓN SIMULADA
========================================================= */

test("Simula un pago aprobado sin modificar MongoDB", async () => {

    const resultado = await procesarConciliacionDonacion(
        donacionConToken,
        { aplicarCambios: false },
        {
            consultarEstado: async (token) => {

                assert.equal(token, "TOKEN_SIMULADO");

                return crearRespuestaSimulada();
            },
        }
    );

    assert.equal(resultado.estadoTransbank, "AUTHORIZED");
    assert.equal(resultado.estadoPropuesto, "aprobada");
    assert.equal(resultado.actualizado, false);
});


/* =========================================================
   PRUEBA 6: RECHAZO SIMULADO
========================================================= */

test("Simula un pago rechazado sin modificar MongoDB", async () => {

    const resultado = await procesarConciliacionDonacion(
        donacionConToken,
        { aplicarCambios: false },
        {
            consultarEstado: async () =>
                crearRespuestaSimulada({
                    status: "FAILED",
                    response_code: -1,
                }),
        }
    );

    assert.equal(resultado.estadoTransbank, "FAILED");
    assert.equal(resultado.estadoPropuesto, "rechazada");
    assert.equal(resultado.actualizado, false);
});


/* =========================================================
   PRUEBA 7: MONTO INCONGRUENTE
========================================================= */

test("Impide conciliar una respuesta con monto incorrecto", async () => {

    const resultado = await procesarConciliacionDonacion(
        donacionConToken,
        { aplicarCambios: false },
        {
            consultarEstado: async () =>
                crearRespuestaSimulada({
                    amount: 10000,
                }),
        }
    );

    assert.equal(resultado.estadoPropuesto, null);
    assert.equal(resultado.actualizado, false);

    assert.equal(
        resultado.mensaje,
        "Los datos de la transacción no coinciden."
    );
});


/* =========================================================
   PRUEBA 8: ACTUALIZACIÓN CORRECTA EN MONGODB
========================================================= */

test("Guarda correctamente una donación aprobada", async () => {

    // Contamos las actualizaciones realizadas.
    let actualizaciones = 0;

    const resultado = await procesarConciliacionDonacion(
        donacionConToken,
        {
            aplicarCambios: true,
        },
        {
            // Simulamos una autorización de Transbank.
            consultarEstado: async () =>
                crearRespuestaSimulada(),

            // Simulamos la actualización de MongoDB.
            actualizarDonacion: async (filtro, campos) => {

                actualizaciones++;

                // Comprobamos el filtro de seguridad.
                assert.equal(
                    filtro._id,
                    donacionConToken._id
                );

                assert.equal(
                    filtro.estado,
                    "iniciada"
                );

                assert.equal(
                    filtro.ambiente,
                    "integration"
                );

                // Verificamos los datos a guardar.
                assert.equal(campos.estado, "aprobada");
                assert.equal(campos.codigoRespuesta, 0);

                assert.ok(
                    campos.fechaConfirmacion instanceof Date
                );

                // Simulamos una actualización exitosa.
                return {
                    estado: "aprobada",
                };
            },
        }
    );

    assert.equal(actualizaciones, 1);
    assert.equal(resultado.actualizado, true);
    assert.equal(resultado.estadoPropuesto, "aprobada");
});


/* =========================================================
   PRUEBA 9: SIMULACIÓN SIN ESCRITURAS
========================================================= */

test("No modifica MongoDB en modo simulación", async () => {

    let actualizaciones = 0;

    const resultado = await procesarConciliacionDonacion(
        donacionConToken,
        {
            aplicarCambios: false,
        },
        {
            consultarEstado: async () =>
                crearRespuestaSimulada(),

            // Esta función nunca debería ejecutarse.
            actualizarDonacion: async () => {

                actualizaciones++;

                return {
                    estado: "aprobada",
                };
            },
        }
    );

    assert.equal(actualizaciones, 0);
    assert.equal(resultado.actualizado, false);
    assert.equal(resultado.estadoPropuesto, "aprobada");
});


/* =========================================================
   PRUEBA 10: CONCILIACIONES SIMULTÁNEAS
========================================================= */

test("Evita dos actualizaciones simultáneas", async () => {

    // Simulamos el estado del documento en MongoDB.
    let estadoGuardado = "iniciada";

    // Contamos las modificaciones exitosas.
    let escrituras = 0;

    // Dependencias compartidas entre dos procesos.
    const dependencias = {

        consultarEstado: async () =>
            crearRespuestaSimulada(),

        // Simulamos una actualización condicional atómica.
        actualizarDonacion: async (filtro, campos) => {

            // Si el estado ya cambió, no actualizamos.
            if (estadoGuardado !== filtro.estado) {
                return null;
            }

            // Simulamos el cambio de estado.
            estadoGuardado = campos.estado;

            escrituras++;

            return {
                estado: estadoGuardado,
            };
        },
    };

    // Simulamos dos conciliaciones de la misma operación.
    const resultados = await Promise.all([

        procesarConciliacionDonacion(
            donacionConToken,
            { aplicarCambios: true },
            dependencias
        ),

        procesarConciliacionDonacion(
            donacionConToken,
            { aplicarCambios: true },
            dependencias
        ),

    ]);

    // Solo una operación debe haber modificado el estado.
    assert.equal(escrituras, 1);

    // El estado final debe ser aprobado.
    assert.equal(estadoGuardado, "aprobada");

    // Exactamente un proceso debe informar éxito.
    assert.equal(
        resultados.filter(
            (resultado) => resultado.actualizado
        ).length,
        1
    );
});


/* =========================================================
   PRUEBA 11: ACTUALIZACIÓN NO REALIZADA
========================================================= */

test("No informa éxito si MongoDB no actualiza", async () => {

    const resultado = await procesarConciliacionDonacion(
        donacionConToken,
        {
            aplicarCambios: true,
        },
        {
            consultarEstado: async () =>
                crearRespuestaSimulada(),

            // Simulamos que MongoDB no encontró
            // un documento que coincida con el filtro.
            actualizarDonacion: async () => null,
        }
    );

    assert.equal(resultado.actualizado, false);

    assert.equal(
        resultado.mensaje,
        "La operación cambió durante la conciliación."
    );
});
