
/* =========================================================
   CONCILIACIÓN AUTOMÁTICA - WEBPAY PLUS
   IGLESIA EL ANCLA
========================================================= */

// Importamos la conexión con MongoDB Atlas.
import connectDatabase from "../../config/database.js";

// Importamos el modelo de donaciones.
import Donacion from "../../models/Donacion.js";

// Reutilizamos nuestro servicio de procesamiento.
import {
    procesarConciliacionDonacion,
} from "../../services/webpay/procesamientoConciliacionService.js";


/* =========================================================
   CONFIGURACIÓN
========================================================= */

// Revisamos las operaciones cada 20 minutos.
const INTERVALO_MS = 20 * 60 * 1000;

// Procesamos hasta 20 operaciones por ejecución.
const LIMITE_DONACIONES = 20;

// Estados que requieren seguimiento.
const ESTADOS_PENDIENTES = [
    "pendiente",
    "iniciada",
    "confirmando",
    "revision",
];

// Impedimos ejecutar dos ciclos simultáneamente
// dentro de este mismo proceso.
let ejecutando = false;


/* =========================================================
   EJECUTAR CICLO DE CONCILIACIÓN
========================================================= */

const ejecutarConciliacion = async () => {

    // Evitamos superponer ciclos en este proceso.
    if (ejecutando) {
        console.log("Conciliación anterior todavía en ejecución.");
        return;
    }

    // Marcamos el proceso como ocupado.
    ejecutando = true;

    try {

        console.log("\n================================");
        console.log("INICIANDO CONCILIACIÓN AUTOMÁTICA");
        console.log("================================");

        // Recuperamos las operaciones pendientes.
        const donaciones = await Donacion.find({
            ambiente: "integration",
            estado: { $in: ESTADOS_PENDIENTES },
        })
            .sort({ createdAt: -1 })
            .limit(LIMITE_DONACIONES)
            .select(
                "+tokenWebpay ordenCompra idSesion monto estado ambiente createdAt"
            );

        console.log(
            "Operaciones encontradas:",
            donaciones.length
        );

        // Contadores del ciclo.
        let actualizadas = 0;
        let errores = 0;

        // Procesamos las operaciones individualmente.
        for (const donacion of donaciones) {

            try {

                // Utilizamos el servicio que ya probamos.
                const resultado = await procesarConciliacionDonacion(
                    donacion,
                    {
                        aplicarCambios: true,
                    }
                );

                // Contabilizamos las actualizaciones.
                if (resultado.actualizado) {
                    actualizadas++;
                }

                // Mostramos únicamente datos no sensibles.
                console.log({
                    orden: resultado.ordenCompra,
                    estadoAnterior: resultado.estadoAnterior,
                    estadoPropuesto: resultado.estadoPropuesto,
                    actualizado: resultado.actualizado,
                });

            } catch {

                // Un error no interrumpe las demás operaciones.
                errores++;

                console.error(
                    "No fue posible conciliar una operación."
                );
            }
        }

        // Mostramos el resumen de la ejecución.
        console.log("\nCONCILIACIÓN FINALIZADA");
        console.log("Actualizadas:", actualizadas);
        console.log("Errores:", errores);

    } catch {

        console.error(
            "Error general durante la conciliación."
        );

    } finally {

        // Permitimos que se ejecute el próximo ciclo.
        ejecutando = false;
    }
};


/* =========================================================
   INICIALIZACIÓN
========================================================= */

// Este trabajador es exclusivo para integración local.
// Nunca debe activarse accidentalmente en producción.
if (
    process.env.TRANSBANK_ENVIRONMENT !== "integration" ||
    process.env.NODE_ENV !== "development"
) {
    throw new Error(
        "La conciliación automática local requiere integración y NODE_ENV=development."
    );
}

// Establecemos la conexión con MongoDB.
await connectDatabase();

// Ejecutamos una primera revisión.
await ejecutarConciliacion();

// Programamos las revisiones posteriores.
setInterval(() => {
    void ejecutarConciliacion();
}, INTERVALO_MS);

// Informamos que el proceso permanece activo.
console.log(
    "\nConciliación automática activa cada 20 minutos."
);
console.log(
    "Presiona Ctrl+C para detener el proceso."
);
