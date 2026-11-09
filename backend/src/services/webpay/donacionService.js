/* =========================================================
   SERVICIO DE DONACIONES - WEBPAY PLUS
========================================================= */

// Importamos herramientas criptográficas de Node.js.
// Se utilizan para generar identificadores impredecibles.
import { randomBytes, randomUUID } from "node:crypto";

// Importamos el modelo de donaciones de MongoDB.
import Donacion from "../../models/Donacion.js";

// Importamos el cliente Webpay configurado anteriormente.
import { crearTransaccionWebpay } from "./webpay.js";


/* =========================================================
   LÍMITES DE LOS APORTES
========================================================= */

// Definimos el monto mínimo permitido en pesos chilenos.
const MONTO_MINIMO = 1000;

// Definimos el monto máximo permitido en pesos chilenos.
const MONTO_MAXIMO = 5000000;


/* =========================================================
   GENERACIÓN DE IDENTIFICADORES
========================================================= */

// Generamos una orden de compra única por cada intento.
const generarOrdenCompra = () => {

    // Generamos 16 caracteres hexadecimales aleatorios.
    const identificador = randomBytes(8).toString("hex");

    // Devolvemos una orden de 22 caracteres.
    return `ANCLA-${identificador}`;
};


// Generamos un identificador de sesión para Webpay.
const generarIdSesion = () => {

    // Utilizamos UUID para reducir colisiones.
    return `SES-${randomUUID()}`;
};


/* =========================================================
   VALIDACIÓN DE MONTOS
========================================================= */

// Validamos el monto recibido desde el frontend.
// Nunca debemos confiar solamente en React.
const validarMonto = (monto) => {

    // Solo permitimos números enteros.
    if (!Number.isInteger(monto)) {
        throw new Error(
            "El monto debe ser un número entero."
        );
    }

    // Verificamos que el monto esté dentro del rango.
    if (
        monto < MONTO_MINIMO ||
        monto > MONTO_MAXIMO
    ) {
        throw new Error(
            "El monto indicado está fuera del rango permitido."
        );
    }
};


/* =========================================================
   URL DE RETORNO
========================================================= */

// Obtenemos la URL donde regresará el usuario
// después de pasar por Webpay.
const obtenerUrlRetorno = () => {

    // Leemos la URL configurada en el servidor.
    const url = process.env.WEBPAY_RETURN_URL;

    // Comprobamos que la variable esté definida.
    if (!url) {
        throw new Error(
            "Falta configurar WEBPAY_RETURN_URL."
        );
    }

    // Analizamos la URL para validar su formato.
    const urlAnalizada = new URL(url);

    // Permitimos HTTP exclusivamente en localhost
    // durante el desarrollo de integración.
    const esLocal =
        process.env.TRANSBANK_ENVIRONMENT === "integration" &&
        urlAnalizada.protocol === "http:" &&
        ["localhost", "127.0.0.1"].includes(
            urlAnalizada.hostname
        );

    // Las demás direcciones deben utilizar HTTPS.
    if (
        urlAnalizada.protocol !== "https:" &&
        !esLocal
    ) {
        throw new Error(
            "La URL de retorno debe utilizar HTTPS, excepto localhost en integración."
        );
    }

    // Devolvemos la dirección validada.
    return urlAnalizada.toString();
};


/* =========================================================
   CREACIÓN DE TRANSACCIÓN
========================================================= */

// Función principal para iniciar un aporte voluntario.
export const iniciarDonacion = async (monto, usuarioId = null) => {

    // Primero verificamos el monto solicitado.
    validarMonto(monto);

    // Obtenemos la dirección de retorno del pago.
    const returnUrl = obtenerUrlRetorno();

    // Generamos identificadores propios.
    const ordenCompra = generarOrdenCompra();
    const idSesion = generarIdSesion();

    // Registramos el intento antes de contactar a Webpay.
    const donacion = await Donacion.create({

        // Asociamos solamente una cuenta validada por el servidor.
        usuario: usuarioId,

        // Orden que identifica esta transacción.
        ordenCompra,

        // Identificador de sesión de Webpay.
        idSesion,

        // Monto solicitado por el usuario.
        monto,

        // Estado inicial del aporte.
        estado: "pendiente",

        // Ambiente de pruebas.
        ambiente: "integration",

    });

    // Variable que almacenará la respuesta de Transbank.
    let respuestaWebpay;

    try {

        // Creamos el cliente utilizando nuestra configuración.
        const transaccion = crearTransaccionWebpay();

        // Solicitamos a Transbank iniciar una transacción.
        respuestaWebpay = await transaccion.create(
            ordenCompra,
            idSesion,
            monto,
            returnUrl
        );

        // Comprobamos que Transbank haya entregado
        // los datos necesarios para continuar.
        if (
            typeof respuestaWebpay?.token !== "string" ||
            !respuestaWebpay.token ||
            typeof respuestaWebpay?.url !== "string" ||
            !respuestaWebpay.url
        ) {
            throw new Error(
                "Transbank no entregó una respuesta válida."
            );
        }

    } catch (error) {

        // Si no obtuvimos una transacción utilizable,
        // marcamos el intento como error técnico.
        // No representa un rechazo bancario.
        try {
            await Donacion.updateOne(
                {
                    _id: donacion._id,
                    estado: "pendiente",
                },
                {
                    $set: { estado: "error" },
                }
            );
        } catch {
            // Si falla este registro, conservamos el error original.
            // Una tarea de conciliación podrá revisar el pendiente.
        }

        // Devolvemos un mensaje controlado sin exponer
        // detalles internos de Transbank.
        throw new Error(
            "No fue posible iniciar el aporte. Inténtalo nuevamente."
        );
    }

    // Guardamos el token entregado por Transbank.
    donacion.tokenWebpay = respuestaWebpay.token;

    // Indicamos que la transacción fue iniciada.
    donacion.estado = "iniciada";

    // Persistimos la actualización en MongoDB.
    // Si falla, no enviamos un enlace de pago al usuario.
    await donacion.save();

    // Entregamos únicamente los datos necesarios
    // para continuar el proceso desde el frontend.
    return {

        // Identificador público de referencia.
        ordenCompra: donacion.ordenCompra,

        // Monto original validado.
        monto: donacion.monto,

        // Token que deberá enviarse a Webpay.
        token: respuestaWebpay.token,

        // Dirección del formulario de pago de Transbank.
        url: respuestaWebpay.url,

    };
};


/* =========================================================
   CONFIRMAR DONACIÓN CON TRANSBANK
========================================================= */

// Confirma una transacción utilizando el token de Webpay.
export const confirmarDonacion = async (token) => {

    // Rechazamos tokens vacíos o con formato inesperado.
    if (
        typeof token !== "string" ||
        !/^[a-zA-Z0-9]{1,64}$/.test(token)
    ) {
        return { estado: "revision", ordenCompra: null };
    }

    // Localizamos el intento registrado en MongoDB.
    const donacion = await Donacion.findOne({
        tokenWebpay: token,
    });

    // Si no existe, no podemos confirmar el aporte.
    if (!donacion) {
        return { estado: "revision", ordenCompra: null };
    }

    // Evitamos volver a confirmar una operación ya finalizada.
    if (
        ["aprobada", "rechazada", "anulada"].includes(
            donacion.estado
        )
    ) {
        return {
            estado: donacion.estado,
            ordenCompra: donacion.ordenCompra,
        };
    }

    // Solamente las operaciones iniciadas pueden confirmarse.
    if (donacion.estado !== "iniciada") {
        return {
            estado: "revision",
            ordenCompra: donacion.ordenCompra,
        };
    }

    // Reservamos la confirmación de manera atómica.
    // Si otra solicitud se adelantó, esta no repetirá el commit.
    const operacion = await Donacion.findOneAndUpdate(
        {
            _id: donacion._id,
            estado: "iniciada",
        },
        {
            $set: { estado: "confirmando" },
        },
        {
            new: true,
        }
    );

    // Si no logramos reservarla, no llamamos a Transbank.
    if (!operacion) {
        return {
            estado: "revision",
            ordenCompra: donacion.ordenCompra,
        };
    }

    try {

        // Obtenemos el cliente configurado de Webpay Plus.
        const transaccion = crearTransaccionWebpay();

        // Confirmamos el resultado financiero con Transbank.
        const respuesta = await transaccion.commit(token);

        // Comparamos todos los identificadores y el monto.
        // Una respuesta incongruente nunca se aprueba.
        const datosCoinciden =
            respuesta.buy_order === donacion.ordenCompra &&
            respuesta.session_id === donacion.idSesion &&
            respuesta.amount === donacion.monto;

        // Comprobamos autorización explícita.
        const autorizada =
            respuesta.status === "AUTHORIZED" &&
            respuesta.response_code === 0;

        // Determinamos nuestro estado interno.
        let nuevoEstado = "revision";

        if (datosCoinciden) {
            if (autorizada) {
                nuevoEstado = "aprobada";
            } else if (respuesta.status === "FAILED") {
                nuevoEstado = "rechazada";
            } else if (
                ["REVERSED", "NULLIFIED"].includes(respuesta.status)
            ) {
                nuevoEstado = "anulada";
            }
        }

        // Guardamos únicamente campos financieros necesarios.
        const actualizada = await Donacion.findOneAndUpdate(
            {
                _id: donacion._id,
                estado: "confirmando",
            },
            {
                $set: {
                    estado: nuevoEstado,

                    codigoRespuesta:
                        Number.isInteger(respuesta.response_code)
                            ? respuesta.response_code
                            : null,

                    codigoAutorizacion:
                        typeof respuesta.authorization_code === "string"
                            ? respuesta.authorization_code
                            : null,

                    fechaConfirmacion:
                        nuevoEstado === "revision"
                            ? null
                            : new Date(),
                },
            },
            { new: true }
        );

        // Si falla la persistencia, no declaramos éxito.
        if (!actualizada) {
            throw new Error("No se pudo guardar la confirmación.");
        }

        // Entregamos el estado registrado por el backend.
        return {
            estado: actualizada.estado,
            ordenCompra: actualizada.ordenCompra,
        };

    } catch (error) {

        // Evitamos registrar tokens o datos bancarios en logs.
        console.error(
            "No fue posible completar la verificación de Webpay."
        );

        // Un error de conexión o persistencia no significa
        // necesariamente que el pago haya sido rechazado.
        try {
            await Donacion.updateOne(
                {
                    _id: donacion._id,
                    estado: "confirmando",
                },
                {
                    $set: { estado: "revision" },
                }
            );
        } catch {
            // La operación queda pendiente de conciliación.
        }

        // Nunca mostramos éxito ante un resultado desconocido.
        return {
            estado: "revision",
            ordenCompra: donacion.ordenCompra,
        };
    }
};




/* =========================================================
   IDENTIFICAR CANCELACIÓN O RETORNO INCOMPLETO
========================================================= */

// Procesamos los datos enviados al regresar desde Webpay.
export const identificarRetornoNoCompletado = async ({
    token,
    ordenCompra,
    idSesion,
}) => {

    // Validamos el formato de la orden de compra.
    if (
        typeof ordenCompra !== "string" ||
        !/^ANCLA-[a-f0-9]{16}$/.test(ordenCompra)
    ) {
        return { estado: "revision", ordenCompra: null };
    }

    // Validamos el identificador de sesión.
    if (
        typeof idSesion !== "string" ||
        idSesion.length < 1 ||
        idSesion.length > 61
    ) {
        return { estado: "revision", ordenCompra: null };
    }

    // Distinguimos si Webpay devolvió un token de cancelación.
    const tieneToken = token !== undefined;

    // Cuando hay token, verificamos su formato.
    if (
        tieneToken &&
        (
            typeof token !== "string" ||
            !/^[a-zA-Z0-9]{1,64}$/.test(token)
        )
    ) {
        return { estado: "revision", ordenCompra: null };
    }

    // Buscamos la transacción por sus identificadores.
    const filtro = {
        ordenCompra,
        idSesion,
    };

    // Si el retorno incluye token, exigimos coincidencia.
    if (tieneToken) {
        filtro.tokenWebpay = token;
    }

    // Recuperamos la donación y su token de Webpay.
    // El token normalmente está excluido de las consultas,
    // pero aquí lo necesitamos para verificar la operación.
    const donacion = await Donacion.findOne(filtro)
        .select("+tokenWebpay");

    // Rechazamos cualquier retorno no identificable.
    if (!donacion) {
        return { estado: "revision", ordenCompra: null };
    }

    // Nunca modificamos una transacción ya finalizada.
    if (
        ["aprobada", "rechazada", "anulada"].includes(
            donacion.estado
        )
    ) {
        return {
            estado: donacion.estado,
            ordenCompra: donacion.ordenCompra,
        };
    }


    /* =========================================================
       CASO: TIEMPO DE PAGO AGOTADO
    ========================================================= */

    // Transbank puede regresar sin TBK_TOKEN cuando
    // el usuario supera el tiempo permitido de pago.
    if (!tieneToken) {

        // No volvemos a procesar una operación cuyo
        // estado ya cambió o no dispone de token.
        if (
            donacion.estado !== "iniciada" ||
            !donacion.tokenWebpay
        ) {
            return {
                estado: donacion.estado,
                ordenCompra: donacion.ordenCompra,
            };
        }

        try {

            // Creamos el cliente de Webpay Plus.
            const transaccion = crearTransaccionWebpay();

            // Consultamos el resultado del proveedor.
            // Esta operación no ejecuta pagos ni commit().
            const respuesta = await transaccion.status(
                donacion.tokenWebpay
            );

            // Comprobamos los datos de la operación.
            const datosCoinciden =
                respuesta.buy_order === donacion.ordenCompra &&
                respuesta.session_id === donacion.idSesion &&
                respuesta.amount === donacion.monto;

            // Nunca actualizamos operaciones incongruentes.
            if (!datosCoinciden) {
                return {
                    estado: "revision",
                    ordenCompra: donacion.ordenCompra,
                };
            }

            // INITIALIZED no demuestra una autorización.
            // Dejamos la operación en revisión para
            // continuar su conciliación posteriormente.
            if (respuesta.status === "INITIALIZED") {

                // Actualizamos solo si continúa iniciada.
                const actualizada = await Donacion.findOneAndUpdate(
                    {
                        _id: donacion._id,
                        estado: "iniciada",
                    },
                    {
                        $set: {
                            estado: "revision",
                        },
                    },
                    {
                        new: true,
                    }
                );

                // Si otra solicitud cambió el estado,
                // conservamos su resultado sin sobrescribirlo.
                return {
                    estado: actualizada?.estado || "revision",
                    ordenCompra: donacion.ordenCompra,
                };
            }

            // Otros estados requieren conciliación.
            // No confirmamos ni rechazamos aquí.
            return {
                estado: "revision",
                ordenCompra: donacion.ordenCompra,
            };

        } catch {

            // Un problema técnico no implica rechazo.
            console.error(
                "No fue posible verificar el tiempo de espera de Webpay."
            );

            return {
                estado: "revision",
                ordenCompra: donacion.ordenCompra,
            };
        }
    }


    // Solamente procesamos cancelaciones de operaciones iniciadas.
    if (donacion.estado !== "iniciada") {
        return {
            estado: "revision",
            ordenCompra: donacion.ordenCompra,
        };
    }

    try {

        // Obtenemos el cliente oficial de Webpay.
        const transaccion = crearTransaccionWebpay();

        // Consultamos el estado sin ejecutar commit().
        const respuesta = await transaccion.status(token);

        // Verificamos que Transbank devuelva la misma
        // orden, sesión y monto guardados en MongoDB.
        const datosCoinciden =
            respuesta.buy_order === donacion.ordenCompra &&
            respuesta.session_id === donacion.idSesion &&
            respuesta.amount === donacion.monto;

        // No modificamos el pago si hay diferencias.
        if (!datosCoinciden) {
            return {
                estado: "revision",
                ordenCompra: donacion.ordenCompra,
            };
        }

        // El retorno con TBK_TOKEN indica que el usuario
        // abandonó el flujo normal de pago.
        // Solo registramos cancelación si el proveedor
        // no informa autorización ni procesamiento definitivo.
        if (respuesta.status === "INITIALIZED") {

            // Actualizamos únicamente si continúa iniciada.
            const actualizada = await Donacion.findOneAndUpdate(
                {
                    _id: donacion._id,
                    estado: "iniciada",
                },
                {
                    $set: {
                        estado: "anulada",
                    },
                },
                {
                    new: true,
                }
            );

            // Si otra solicitud modificó el estado,
            // no sobreescribimos su resultado.
            return {
                estado: actualizada?.estado || "revision",
                ordenCompra: donacion.ordenCompra,
            };
        }

        // Si la operación aparece autorizada o con otro
        // estado, no la declaramos cancelada.
        // Requiere verificar su situación financiera.
        return {
            estado: "revision",
            ordenCompra: donacion.ordenCompra,
        };

    } catch (error) {

        // No exponemos tokens ni detalles internos.
        console.error(
            "No se pudo verificar el retorno de Webpay."
        );

        // Un error técnico no equivale a cancelación.
        return {
            estado: "revision",
            ordenCompra: donacion.ordenCompra,
        };
    }
};