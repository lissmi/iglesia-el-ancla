/* =========================================================
   RUTAS DE DONACIONES - IGLESIA EL ANCLA
========================================================= */

// Importamos Express para crear las rutas.
import express from "express";

// Importamos el limitador de solicitudes.
import rateLimit from "express-rate-limit";



/* =========================================================
   SERVICIOS DE DONACIONES - WEBPAY PLUS
========================================================= */

// Importamos las operaciones del servicio Webpay.
import {
    iniciarDonacion,
    confirmarDonacion,
    identificarRetornoNoCompletado,
} from "../services/webpay/donacionService.js";


// Importamos el modelo para consultar resultados.
import Donacion from "../models/Donacion.js";

// Protegemos el historial y los aportes asociados a una cuenta.
import authenticateUser from "../middleware/authenticateUser.js";



/* =========================================================
   CONFIGURACIÓN DEL ROUTER
========================================================= */

// Creamos el enrutador de donaciones.
const router = express.Router();


/* =========================================================
   PROTECCIÓN CONTRA SOLICITUDES EXCESIVAS
========================================================= */

// Aplicamos un límite específico a la creación de pagos.
const donacionLimiter = rateLimit({

    // Establecemos una ventana de 15 minutos.
    windowMs: 15 * 60 * 1000,

    // Permitimos hasta 10 intentos por IP.
    limit: 10,

    // Utilizamos los encabezados modernos.
    standardHeaders: "draft-8",

    // Desactivamos los encabezados antiguos.
    legacyHeaders: false,

    // Respuesta cuando se supera el límite.
    message: {
        success: false,
        message:
            "Se realizaron demasiados intentos. Intenta nuevamente más tarde.",
    },
});


/* =========================================================
   CONTROLADOR: INICIAR DONACIÓN
========================================================= */

// Controlador público para iniciar un aporte voluntario.
const iniciarDonacionController = async (req, res) => {

    try {

        // Obtenemos el monto enviado por el frontend.
        const monto = req.body?.monto;

        // Validamos que sea un número entero.
        // No aceptamos cadenas de texto ni decimales.
        if (!Number.isInteger(monto)) {

            return res.status(400).json({
                success: false,
                message:
                    "Debes ingresar un monto entero válido.",
            });

        }

        // Validamos los límites permitidos.
        if (monto < 1000 || monto > 5000000) {

            return res.status(400).json({
                success: false,
                message:
                    "El aporte debe estar entre $1.000 y $5.000.000.",
            });

        }

        // Ejecutamos el servicio que:
        // 1. Registra la donación en MongoDB.
        // 2. Crea la transacción en Transbank.
        // 3. Guarda el token recibido.
        const resultado = await iniciarDonacion(monto);

        // Evitamos que el navegador almacene
        // en caché la respuesta con el token.
        res.set("Cache-Control", "no-store");

        // Entregamos los datos necesarios para
        // continuar hacia el formulario de Webpay.
        return res.status(201).json({

            success: true,

            message:
                "La transacción de aporte fue iniciada correctamente.",

            data: {

                // Número de referencia de la operación.
                ordenCompra: resultado.ordenCompra,

                // Monto validado por el servidor.
                monto: resultado.monto,

                // Dirección del formulario de Transbank.
                url: resultado.url,

                // Token temporal de la transacción.
                token: resultado.token,

            },

        });

    } catch (error) {

        // Registramos un mensaje controlado
        // para facilitar la depuración del servidor.
        console.error(
            "Error al iniciar donación:",
            error.message
        );

        // No exponemos detalles internos ni
        // información de MongoDB o Transbank.
        return res.status(503).json({

            success: false,

            message:
                "No fue posible iniciar el aporte en este momento.",

        });

    }

};


/* =========================================================
   HISTORIAL PRIVADO DEL MIEMBRO
========================================================= */

// El identificador del usuario se obtiene exclusivamente de su sesión.
router.get("/mis-donaciones", authenticateUser, async (req, res) => {
    res.set("Cache-Control", "no-store");
    try {
        // Paginación evita cargar un historial ilimitado.
        const requestedPage = Number(req.query.page || 1);
        if (!Number.isSafeInteger(requestedPage) || requestedPage < 1 || requestedPage > 100000) {
            return res.status(400).json({ success: false, message: "La página solicitada no es válida." });
        }
        const page = requestedPage;
        const perPage = 10;
        const filter = { usuario: req.user._id, estado: "aprobada" };
        const [items, count, summary] = await Promise.all([
            Donacion.find(filter)
                .select("ordenCompra monto moneda estado fechaConfirmacion ambiente createdAt")
                .sort({ createdAt: -1, _id: -1 })
                .skip((page - 1) * perPage)
                .limit(perPage)
                .lean(),
            Donacion.countDocuments(filter),
            Donacion.aggregate([
                { $match: filter },
                { $group: { _id: null, total: { $sum: "$monto" }, cantidad: { $sum: 1 } } },
            ]),
        ]);
        return res.status(200).json({
            success: true,
            donations: items.map((item) => ({
                id: String(item._id),
                reference: item.ordenCompra,
                amount: item.monto,
                currency: item.moneda,
                status: item.estado,
                date: item.fechaConfirmacion || item.createdAt,
                environment: item.ambiente,
            })),
            summary: {
                total: summary[0]?.total || 0,
                count: summary[0]?.cantidad || 0,
            },
            pagination: { page, perPage, total: count, pages: Math.ceil(count / perPage) },
        });
    } catch (error) {
        console.error("Error al consultar donaciones personales:", error.message);
        return res.status(500).json({ success: false, message: "No pudimos consultar tus aportes. Inténtalo nuevamente." });
    }
});

/* =========================================================
   INICIAR UN APORTE ASOCIADO A LA SESIÓN ACTUAL
========================================================= */

// Esta ruta convive con la ruta pública: los visitantes pueden seguir donando.
router.post("/iniciar-miembro", authenticateUser, donacionLimiter, async (req, res) => {
    res.set("Cache-Control", "no-store");
    const monto = req.body?.monto;
    if (!Number.isInteger(monto) || monto < 1000 || monto > 5000000) {
        return res.status(400).json({ success: false, message: "Ingresa un monto válido entre $1.000 y $5.000." });
    }
    try {
        // Nunca se recibe el identificador de usuario desde React.
        const result = await iniciarDonacion(monto, req.user._id);
        return res.status(201).json({
            success: true,
            data: {
                ordenCompra: result.ordenCompra,
                monto: result.monto,
                url: result.url,
                token: result.token,
            },
        });
    } catch (error) {
        console.error("Error al iniciar aporte de miembro:", error.message);
        return res.status(503).json({ success: false, message: "No pudimos iniciar el aporte en este momento. Inténtalo nuevamente." });
    }
});


/* =========================================================
   RUTA PÚBLICA: INICIAR DONACIÓN
========================================================= */

// POST /api/donaciones/iniciar
//
// Esta ruta NO requiere iniciar sesión.
// Puede utilizarse por:
// - Visitantes.
// - Miembros registrados.
// - Administradores.
// - Superadministradores.
//
// Todos utilizan el mismo flujo de aportes.
router.post(
    "/iniciar",
    donacionLimiter,
    iniciarDonacionController
);



/* =========================================================
   CONTROLADOR: RETORNO DE WEBPAY PLUS
========================================================= */

// Recibe al usuario cuando regresa desde Transbank.
const retornoWebpayController = async (req, res) => {

    // Impedimos almacenar la respuesta en caché.
    res.set("Cache-Control", "no-store");

    // Evitamos enviar datos del retorno mediante Referer.
    res.set("Referrer-Policy", "no-referrer");

    // Inicialmente no tenemos una donación identificada.
    let ordenCompra = null;

    try {

        // Transbank puede utilizar GET o POST dependiendo
        // del resultado y del ambiente.
        const parametros =
            req.method === "GET"
                ? req.query
                : req.body;


       
        // Obtenemos el token del flujo normal.
        const tokenWebpay = parametros?.token_ws;

        // Obtenemos los parámetros de cancelación o timeout.
        const tokenCancelacion = parametros?.TBK_TOKEN;
        const ordenRetorno = parametros?.TBK_ORDEN_COMPRA;
        const sesionRetorno = parametros?.TBK_ID_SESION;

        // Detectamos si Transbank envió parámetros
        // asociados con cancelación, timeout o error.
        const tieneParametrosEspeciales =
            [
                "TBK_TOKEN",
                "TBK_ORDEN_COMPRA",
                "TBK_ID_SESION",
            ].some((campo) =>
                Object.prototype.hasOwnProperty.call(
                    parametros || {},
                    campo
                )
            );

        /* =====================================================
           CASO 1: RETORNO NORMAL
        ===================================================== */

        // Confirmamos únicamente cuando recibimos token_ws
        // sin parámetros adicionales de retorno especial.
        if (
            typeof tokenWebpay === "string" &&
            !tieneParametrosEspeciales
        ) {

            // El servicio verifica la operación con Transbank.
            const resultado = await confirmarDonacion(
                tokenWebpay
            );

            // Recuperamos la referencia identificada.
            ordenCompra = resultado.ordenCompra;

        }

        /* =====================================================
           CASO 2: CANCELACIÓN, TIMEOUT O ERROR
        ===================================================== */

        // En estos casos identificamos la operación,
        // pero no damos por confirmado ni anulado el pago.
        else if (
            typeof ordenRetorno === "string" &&
            typeof sesionRetorno === "string"
        ) {

            // Consultamos la donación con los identificadores
            // almacenados previamente en MongoDB.
            const resultado =
                await identificarRetornoNoCompletado({

                    // TBK_TOKEN puede no existir en un timeout.
                    token:
                        tokenCancelacion === undefined
                            ? undefined
                            : tokenCancelacion,

                    // Referencia de la operación.
                    ordenCompra: ordenRetorno,

                    // Identificador de la sesión.
                    idSesion: sesionRetorno,
                });

            // Recuperamos la orden, si fue identificada.
            ordenCompra = resultado.ordenCompra;

        }

        // Si los parámetros no corresponden a un retorno
        // reconocido, no modificamos datos financieros.

    } catch (error) {

        // No imprimimos tokens ni información bancaria.
        console.error(
            "No fue posible procesar el retorno de Webpay."
        );

    }

    /* =====================================================
       REDIRECCIÓN HACIA EL FRONTEND
    ===================================================== */

    // Construimos la dirección de la página de resultados.
    const urlResultado = new URL(
        "/donaciones/resultado",
        process.env.FRONTEND_URL || "http://localhost:3000"
    );

    // Solo enviamos la referencia cuando la identificamos.
    if (ordenCompra) {
        urlResultado.searchParams.set(
            "orden",
            ordenCompra
        );
    }

    // Redirigimos con HTTP 303 para que el navegador
    // consulte la página de resultados mediante GET.
    return res.redirect(
        303,
        urlResultado.toString()
    );
};



/* =========================================================
   RUTAS DE RETORNO DE WEBPAY
========================================================= */

// Permite el retorno GET de Transbank.
router.get(
    "/webpay/retorno",
    retornoWebpayController
);

// Permite el retorno POST de Transbank.
router.post(
    "/webpay/retorno",
    retornoWebpayController
);


/* =========================================================
   CONSULTAR RESULTADO DE UNA DONACIÓN
========================================================= */

// Devuelve información limitada para la pantalla pública.
router.get(
    "/resultado/:ordenCompra",
    async (req, res) => {

        // Evitamos que se almacenen estados financieros en caché.
        res.set("Cache-Control", "no-store");

        // Recuperamos la referencia enviada en la URL.
        const { ordenCompra } = req.params;

        // Verificamos el formato utilizado por nuestra aplicación.
        if (!/^ANCLA-[a-f0-9]{16}$/.test(ordenCompra)) {
            return res.status(400).json({
                success: false,
                message: "Referencia de donación inválida.",
            });
        }

        try {

            // Buscamos únicamente los campos públicos necesarios.
            const donacion = await Donacion.findOne({
                ordenCompra,
            }).select("ordenCompra monto estado");

            // Respondemos cuando la referencia no existe.
            if (!donacion) {
                return res.status(404).json({
                    success: false,
                    message: "Donación no encontrada.",
                });
            }

            // Devolvemos el estado guardado en MongoDB.
            return res.status(200).json({
                success: true,
                data: {
                    ordenCompra: donacion.ordenCompra,
                    monto: donacion.monto,
                    estado: donacion.estado,
                },
            });

        } catch (error) {

            // Protegemos los detalles internos del servidor.
            return res.status(500).json({
                success: false,
                message: "No fue posible consultar la donación.",
            });
        }
    }
);


/* =========================================================
   EXPORTACIÓN
========================================================= */

// Exportamos las rutas para registrarlas en app.js.
export default router;