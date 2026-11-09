/* =========================================================
   MODELO DE DONACIONES - IGLESIA EL ANCLA
========================================================= */

// Importamos Mongoose para definir el modelo de MongoDB.
import mongoose from "mongoose";


/* =========================================================
   ESQUEMA DE DONACIONES
========================================================= */

// Creamos el esquema que representa cada intento de aporte.
const donacionSchema = new mongoose.Schema(

    {
        // Cuenta que inició el aporte mientras tenía una sesión válida.
        // Los aportes de visitantes permanecen sin usuario asociado.
        usuario: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
            immutable: true,
        },

        // Identificador único de la transacción.
        ordenCompra: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            maxlength: 26,
            immutable: true,
        },

        // Identificador de sesión enviado a Transbank.
        idSesion: {
            type: String,
            required: true,
            trim: true,
            maxlength: 61,
            immutable: true,
        },

        // Cantidad aportada en pesos chilenos.
        monto: {
            type: Number,
            required: true,
            min: 1000,
            max: 5000000,
            immutable: true,

            // Solo aceptamos valores enteros.
            validate: {
                validator: Number.isInteger,
                message: "El monto debe ser un número entero.",
            },
        },

        // Moneda utilizada para el aporte.
        moneda: {
            type: String,
            enum: ["CLP"],
            default: "CLP",
            immutable: true,
        },


        // Estado de cada intento de donación.
        estado: {
            type: String,

            // Estados permitidos por nuestra aplicación.
            enum: [
                "pendiente",    // Se creó el intento en MongoDB.
                "iniciada",     // Transbank entregó un token.
                "confirmando",  // El backend está verificando el pago.
                "aprobada",     // Pago autorizado y validado.
                "rechazada",    // Pago rechazado.
                "anulada",      // Operación cancelada o revertida.
                "revision",     // Resultado incierto; requiere conciliación.
                "error",        // Error técnico al iniciar.
            ],

            // Estado predeterminado.
            default: "pendiente",

            // El campo siempre debe existir.
            required: true,
        },


        // Medio utilizado para realizar el pago.
        proveedorPago: {
            type: String,
            enum: ["webpay_plus"],
            default: "webpay_plus",
            immutable: true,
        },

        // Ambiente donde se originó la transacción.
        ambiente: {
            type: String,
            enum: ["integration", "production"],
            default: "integration",
            immutable: true,
        },

        // Token entregado al crear la transacción.
        // Se excluye de las consultas normales.
        tokenWebpay: {
            type: String,
            maxlength: 64,
            select: false,
        },

        // Código de autorización de Transbank.
        codigoAutorizacion: {
            type: String,
            default: null,
        },

        // Código de respuesta de la autorización.
        codigoRespuesta: {
            type: Number,
            default: null,
        },

        // Fecha en que se verificó el resultado.
        fechaConfirmacion: {
            type: Date,
            default: null,
        },
    },

    {
        // Crea automáticamente createdAt y updatedAt.
        timestamps: true,

        // Nombre explícito de la colección MongoDB.
        collection: "donaciones",

        // Impide guardar campos no definidos.
        strict: true,
    }
);


/* =========================================================
   ÍNDICE PARA CONSULTAS ADMINISTRATIVAS
========================================================= */

// Facilita consultar donaciones por estado y fecha.
donacionSchema.index({ usuario: 1, createdAt: -1 });

donacionSchema.index({
    estado: 1,
    createdAt: -1,
});


/* =========================================================
   CREACIÓN Y EXPORTACIÓN DEL MODELO
========================================================= */

// Registramos el modelo utilizando el esquema definido.
const Donacion = mongoose.model(
    "Donacion",
    donacionSchema
);

// Exportamos el modelo para utilizarlo en los servicios.
export default Donacion;