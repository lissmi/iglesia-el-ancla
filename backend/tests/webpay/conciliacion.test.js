
/* =========================================================
   PRUEBAS DEL SERVICIO DE CONCILIACIÓN
   IGLESIA EL ANCLA
========================================================= */

// Importamos las herramientas de pruebas de Node.js.
import test from "node:test";

// Importamos las comprobaciones de resultados.
import assert from "node:assert/strict";

// Importamos la función que queremos probar.
import {
    determinarEstadoConciliacion,
} from "../../src/services/webpay/conciliacionService.js";


/* =========================================================
   DATOS DE PRUEBA
========================================================= */

// Definimos una fecha fija para que los resultados
// no dependan del momento de ejecución.
const ahora = new Date("2026-10-25T12:00:00.000Z");

// Simulamos una donación creada hace 30 minutos.
const donacion = {
    ordenCompra: "ANCLA-1234567890abcdef",
    idSesion: "SES-PRUEBA",
    monto: 5000,
    estado: "iniciada",
    createdAt: new Date(
        ahora.getTime() - 30 * 60 * 1000
    ),
};

// Simulamos los identificadores que devuelve Transbank.
const respuestaBase = {
    buy_order: donacion.ordenCompra,
    session_id: donacion.idSesion,
    amount: donacion.monto,
};


/* =========================================================
   PRUEBA 1: PAGO APROBADO
========================================================= */

test("Reconoce un pago autorizado", () => {

    const respuesta = {
        ...respuestaBase,
        status: "AUTHORIZED",
        response_code: 0,
    };

    const resultado = determinarEstadoConciliacion(
        donacion,
        respuesta,
        ahora
    );

    assert.equal(resultado, "aprobada");
});


/* =========================================================
   PRUEBA 2: PAGO RECHAZADO
========================================================= */

test("Reconoce un pago rechazado", () => {

    const respuesta = {
        ...respuestaBase,
        status: "FAILED",
        response_code: -1,
    };

    const resultado = determinarEstadoConciliacion(
        donacion,
        respuesta,
        ahora
    );

    assert.equal(resultado, "rechazada");
});


/* =========================================================
   PRUEBA 3: OPERACIÓN ANTIGUA SIN AUTORIZACIÓN
========================================================= */

test("Envía a revisión una operación antigua", () => {

    const respuesta = {
        ...respuestaBase,
        status: "INITIALIZED",
        response_code: null,
    };

    const resultado = determinarEstadoConciliacion(
        donacion,
        respuesta,
        ahora
    );

    assert.equal(resultado, "revision");
});


/* =========================================================
   PRUEBA 4: OPERACIÓN RECIENTE
========================================================= */

test("No modifica una operación reciente", () => {

    const reciente = {
        ...donacion,
        createdAt: new Date(
            ahora.getTime() - 5 * 60 * 1000
        ),
    };

    const respuesta = {
        ...respuestaBase,
        status: "INITIALIZED",
    };

    const resultado = determinarEstadoConciliacion(
        reciente,
        respuesta,
        ahora
    );

    assert.equal(resultado, null);
});


/* =========================================================
   PRUEBA 5: IDENTIFICADORES INCONGRUENTES
========================================================= */

test("No modifica una orden diferente", () => {

    const respuesta = {
        ...respuestaBase,
        buy_order: "ANCLA-0000000000000000",
        status: "AUTHORIZED",
        response_code: 0,
    };

    const resultado = determinarEstadoConciliacion(
        donacion,
        respuesta,
        ahora
    );

    assert.equal(resultado, null);
});


/* =========================================================
   PRUEBA 6: DONACIÓN YA APROBADA
========================================================= */

test("No modifica una donación finalizada", () => {

    const finalizada = {
        ...donacion,
        estado: "aprobada",
    };

    const respuesta = {
        ...respuestaBase,
        status: "FAILED",
        response_code: -1,
    };

    const resultado = determinarEstadoConciliacion(
        finalizada,
        respuesta,
        ahora
    );

    assert.equal(resultado, null);
});


/* =========================================================
   PRUEBA 7: OPERACIÓN YA EN REVISIÓN
========================================================= */

test("No repite una revisión sin novedades", () => {

    const pendiente = {
        ...donacion,
        estado: "revision",
    };

    const respuesta = {
        ...respuestaBase,
        status: "INITIALIZED",
    };

    const resultado = determinarEstadoConciliacion(
        pendiente,
        respuesta,
        ahora
    );

    assert.equal(resultado, null);
});


/* =========================================================
   PRUEBA 8: AUTORIZACIÓN CON CÓDIGO INCORRECTO
========================================================= */

test("No aprueba una autorización con código distinto de cero", () => {

    const respuesta = {
        ...respuestaBase,
        status: "AUTHORIZED",
        response_code: -1,
    };

    const resultado = determinarEstadoConciliacion(
        donacion,
        respuesta,
        ahora
    );

    assert.equal(resultado, null);
});


/* =========================================================
   PRUEBA 9: MONTO DIFERENTE
========================================================= */

test("No modifica una donación con monto diferente", () => {

    const respuesta = {
        ...respuestaBase,
        amount: 10000,
        status: "AUTHORIZED",
        response_code: 0,
    };

    const resultado = determinarEstadoConciliacion(
        donacion,
        respuesta,
        ahora
    );

    assert.equal(resultado, null);
});


/* =========================================================
   PRUEBA 10: SESIÓN DIFERENTE
========================================================= */

test("No modifica una donación con sesión diferente", () => {

    const respuesta = {
        ...respuestaBase,
        session_id: "SES-OTRA-SESION",
        status: "AUTHORIZED",
        response_code: 0,
    };

    const resultado = determinarEstadoConciliacion(
        donacion,
        respuesta,
        ahora
    );

    assert.equal(resultado, null);
});


/* =========================================================
   PRUEBA 11: RECUPERACIÓN DE DONACIÓN EN REVISIÓN
========================================================= */

test("Recupera una aprobación confirmada durante la revisión", () => {

    const pendiente = {
        ...donacion,
        estado: "revision",
    };

    const respuesta = {
        ...respuestaBase,
        status: "AUTHORIZED",
        response_code: 0,
    };

    const resultado = determinarEstadoConciliacion(
        pendiente,
        respuesta,
        ahora
    );

    assert.equal(resultado, "aprobada");
});
