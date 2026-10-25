
/* =========================================================
   CONCILIACIÓN MANUAL DE DONACIONES - WEBPAY PLUS
   IGLESIA EL ANCLA
========================================================= */

// Importamos Mongoose para administrar la conexión.
import mongoose from "mongoose";

// Importamos nuestra configuración de MongoDB Atlas.
import connectDatabase from "../../config/database.js";

// Importamos el modelo de donaciones.
import Donacion from "../../models/Donacion.js";

// Importamos el servicio reutilizable encargado
// de consultar Transbank y procesar cada operación.
import {
    procesarConciliacionDonacion,
} from "../../services/webpay/procesamientoConciliacionService.js";


/* =========================================================
   CONFIGURACIÓN
========================================================= */

// Estados que todavía requieren conciliación.
const ESTADOS_PENDIENTES = [
    "pendiente",
    "iniciada",
    "confirmando",
    "revision",
];

// Limitamos las operaciones por ejecución.
const LIMITE_DONACIONES = 20;

// Por defecto trabajamos en modo simulación.
// Solo aplicamos cambios cuando se usa --aplicar.
const APLICAR_CAMBIOS = process.argv.includes("--aplicar");


/* =========================================================
   FUNCIÓN PRINCIPAL
========================================================= */

// Ejecutamos la conciliación manual de donaciones.
const conciliarDonaciones = async () => {

    try {

        /* =================================================
           VALIDAR AMBIENTE
        ================================================= */

        // Durante el desarrollo permitimos únicamente
        // operaciones del ambiente de integración.
        if (
            process.env.TRANSBANK_ENVIRONMENT !== "integration" ||
            process.env.NODE_ENV === "production"
        ) {
            throw new Error(
                "La conciliación de pruebas requiere el ambiente de integración."
            );
        }


        /* =================================================
           CONECTAR MONGODB
        ================================================= */

        // Establecemos la conexión con MongoDB Atlas.
        await connectDatabase();


        /* =================================================
           CONSULTAR DONACIONES PENDIENTES
        ================================================= */

        // Recuperamos las operaciones que requieren revisión.
        const donaciones = await Donacion.find({

            // Trabajamos solo con donaciones de prueba.
            ambiente: "integration",

            // Incluimos únicamente estados pendientes.
            estado: {
                $in: ESTADOS_PENDIENTES,
            },

        })

            // Priorizamos las operaciones más recientes.
            .sort({ createdAt: -1 })

            // Limitamos las consultas por ejecución.
            .limit(LIMITE_DONACIONES)

            // Seleccionamos los datos necesarios.
            // IMPORTANTE: incluimos el campo ambiente
            // para que el servicio valide la operación.
            .select(
                "+tokenWebpay ordenCompra idSesion monto estado ambiente createdAt"
            );


        /* =================================================
           MOSTRAR INFORMACIÓN GENERAL
        ================================================= */

        // Indicamos si se aplicarán cambios.
        console.log(
            APLICAR_CAMBIOS
                ? "\nMODO: APLICAR CAMBIOS"
                : "\nMODO: SIMULACIÓN"
        );

        // Informamos la cantidad de donaciones encontradas.
        console.log(
            "Donaciones encontradas:",
            donaciones.length
        );

        // Finalizamos si no existen operaciones pendientes.
        if (donaciones.length === 0) {

            console.log(
                "No existen donaciones pendientes para revisar."
            );

            return;
        }


        /* =================================================
           PROCESAR CADA DONACIÓN
        ================================================= */

        // Recorremos las operaciones encontradas.
        for (const donacion of donaciones) {

            // Mostramos la referencia sin revelar tokens.
            console.log("\n------------------------------");
            console.log("Orden:", donacion.ordenCompra);

            // Calculamos la antigüedad en minutos.
            const minutos = Math.floor(
                (
                    Date.now() -
                    donacion.createdAt.getTime()
                ) / 60000
            );

            console.log(
                "Antigüedad:",
                minutos,
                "minutos"
            );

            try {

                // Delegamos el procesamiento al servicio.
                //
                // Este servicio:
                // 1. Verifica el ambiente y el estado.
                // 2. Consulta Transbank.
                // 3. Comprueba orden, sesión y monto.
                // 4. Determina el nuevo estado.
                // 5. Actualiza MongoDB solo si está permitido.
                const resultado = await procesarConciliacionDonacion(
                    donacion,
                    {
                        aplicarCambios: APLICAR_CAMBIOS,
                    }
                );

                /* =========================================
                   MOSTRAR RESULTADO
                ========================================= */

                // Estado registrado antes del procesamiento.
                console.log(
                    "Estado actual:",
                    resultado.estadoAnterior
                );

                // Estado informado por Transbank.
                if (resultado.estadoTransbank) {

                    console.log(
                        "Estado Transbank:",
                        resultado.estadoTransbank
                    );
                }

                // Mostramos el nuevo estado si se propone.
                if (resultado.estadoPropuesto) {

                    console.log(
                        "Estado propuesto:",
                        resultado.estadoPropuesto
                    );
                }

                // Informamos el resultado del procesamiento.
                console.log(
                    resultado.mensaje
                );

            } catch {

                // Un error técnico nunca debe interpretarse
                // como aprobación ni rechazo de un aporte.
                console.error(
                    "No fue posible procesar esta donación. Sin cambios confirmados."
                );
            }
        }

    } catch {

        // Evitamos mostrar credenciales o tokens.
        console.error(
            "No fue posible ejecutar la conciliación."
        );

    } finally {

        // Cerramos la conexión al finalizar el script.
        await mongoose.disconnect();
    }
};


/* =========================================================
   EJECUCIÓN
========================================================= */

// Iniciamos el proceso de conciliación manual.
await conciliarDonaciones();
