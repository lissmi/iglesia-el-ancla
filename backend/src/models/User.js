//backend/src/models/User.js

// Importamos mongoose para crear
// el esquema y modelo de los usuarios.
import mongoose from "mongoose";


// Extraemos Schema desde mongoose
// para escribir el modelo de forma más clara.
const {
    Schema,
} = mongoose;


// Creamos el esquema principal
// de todos los usuarios registrados.
//
// Este modelo incluirá:
// - Miembros.
// - Administradores.
// - Superadministradores.
const userSchema = new Schema(
    {
        // Nombre del usuario.
        firstName: {
            type: String,

            required: [
                true,
                "El nombre del usuario es obligatorio",
            ],

            trim: true,

            minlength: [
                2,
                "El nombre debe tener al menos 2 caracteres",
            ],

            maxlength: [
                60,
                "El nombre no puede superar los 60 caracteres",
            ],
        },


        // Apellido del usuario.
        lastName: {
            type: String,

            required: [
                true,
                "El apellido del usuario es obligatorio",
            ],

            trim: true,

            minlength: [
                2,
                "El apellido debe tener al menos 2 caracteres",
            ],

            maxlength: [
                60,
                "El apellido no puede superar los 60 caracteres",
            ],
        },


        // Fecha de nacimiento del usuario.
        //
        // Nos permitirá crear posteriormente
        // el calendario y los recordatorios
        // de cumpleaños de la iglesia.
        birthDate: {
            type: Date,

            required: [
                true,
                "La fecha de nacimiento del usuario es obligatoria",
            ],

            validate: {
                validator: function (value) {

                    // Si todavía no existe un valor,
                    // required se encargará del error.
                    if (!value) {
                        return true;
                    }

                    // La fecha no puede pertenecer
                    // al futuro.
                    return value <= new Date();
                },

                message:
                    "La fecha de nacimiento no puede estar en el futuro",
            },
        },


        // Teléfono de contacto del usuario.
        //
        // Recomendamos guardarlo utilizando
        // el formato internacional.
        //
        // Ejemplo chileno:
        // +56912345678
        phone: {
            type: String,

            required: [
                true,
                "El teléfono del usuario es obligatorio",
            ],

            trim: true,

            maxlength: [
                30,
                "El teléfono no puede superar los 30 caracteres",
            ],

            match: [
                /^\+?[0-9\s()-]{8,30}$/,
                "El número telefónico no es válido",
            ],
        },


        // Correo utilizado para iniciar sesión.
        //
        // Será único para todos los usuarios,
        // independientemente de su rol.
        email: {
            type: String,

            required: [
                true,
                "El correo electrónico es obligatorio",
            ],

            unique: true,

            trim: true,

            lowercase: true,

            maxlength: [
                150,
                "El correo no puede superar los 150 caracteres",
            ],

            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                "El correo electrónico no es válido",
            ],
        },


        // Contraseña cifrada del usuario.
        //
        // Nunca guardaremos la contraseña original.
        passwordHash: {
            type: String,

            required: [
                true,
                "La contraseña cifrada es obligatoria",
            ],

            // Impedimos que el hash aparezca
            // automáticamente en las consultas.
            select: false,
        },


        // Nivel de acceso general del usuario.
        //
        // member:
        // Puede ingresar al área de miembros.
        //
        // admin:
        // Puede ingresar al panel administrativo
        // y gestionar las sucursales autorizadas.
        //
        // super_admin:
        // Puede gestionar administradores
        // y eliminar usuarios.
        role: {
            type: String,

            required: true,

            enum: {
                values: [
                    "member",
                    "admin",
                    "super_admin",
                ],

                message:
                    "El rol seleccionado no es válido",
            },

            // Todas las cuentas nuevas comienzan
            // como miembros normales.
            default: "member",

            index: true,
        },


        // Sucursales relacionadas con el usuario.
        //
        // Para un miembro representa las sucursales
        // en las que participa.
        //
        // Para un administrador representa las
        // sucursales que puede gestionar.
        sucursales: [
            {
                // Guardamos el ObjectId
                // de la sucursal.
                type: Schema.Types.ObjectId,

                // Relacionamos el identificador
                // con el modelo Sucursal.
                ref: "Sucursal",

                // Cada identificador incluido
                // debe tener un valor.
                required: true,
            },
        ],


        // Sucursal principal del usuario.
        //
        // En el caso de los miembros será
        // su congregación principal.
        //
        // En el caso de los administradores será
        // la sucursal seleccionada inicialmente.
        sucursalPrincipal: {
            type: Schema.Types.ObjectId,

            ref: "Sucursal",

            required: [
                true,
                "La sucursal principal es obligatoria",
            ],

            index: true,
        },


        // Posición exclusiva de superadministrador.
        //
        // Solamente existirán las posiciones
        // 1 y 2, impidiendo tener más de
        // dos superadministradores.
        superAdminSlot: {
            type: Number,

            enum: {
                values: [
                    1,
                    2,
                ],

                message:
                    "La posición de superadministrador debe ser 1 o 2",
            },

            // Los miembros y administradores normales
            // no tendrán este campo.
            default: undefined,

            // Ocultamos este dato interno
            // en las consultas normales.
            select: false,
        },


        // Determina si el usuario
        // puede iniciar sesión.
        //
        // Si cambia a false, el usuario
        // no podrá acceder a ninguna sección.
        isActive: {
            type: Boolean,

            default: true,

            index: true,
        },


        // Fecha en que la cuenta fue
        // desactivada administrativamente.
        deactivatedAt: {
            type: Date,

            default: null,
        },


        // Motivo opcional por el que
        // se desactivó la cuenta.
        deactivationReason: {
            type: String,

            trim: true,

            maxlength: [
                300,
                "El motivo de desactivación no puede superar los 300 caracteres",
            ],

            default: "",
        },


        // Fecha en que se verificó
        // el correo electrónico.
        //
        // La utilizaremos posteriormente
        // en el sistema de invitaciones.
        emailVerifiedAt: {
            type: Date,

            default: null,
        },


        // Cuenta los intentos consecutivos
        // de acceso fallidos.
        loginAttempts: {
            type: Number,

            default: 0,

            min: 0,

            select: false,
        },


        // Fecha hasta la que permanecerá
        // bloqueada temporalmente la cuenta.
        lockUntil: {
            type: Date,

            default: null,

            select: false,
        },


        // Fecha del último inicio
        // de sesión exitoso.
        lastLoginAt: {
            type: Date,

            default: null,
        },


        // Fecha del último cambio
        // de contraseña.
        passwordChangedAt: {
            type: Date,

            default: Date.now,

            select: false,
        },


        // Indica si el usuario debe cambiar
        // su contraseña durante el próximo acceso.
        //
        // Las cuentas creadas por un administrador
        // comenzarán con una contraseña temporal.
        mustChangePassword: {
            type: Boolean,

            default: true,
        },


        // Número utilizado para invalidar
        // las sesiones anteriores del usuario.
        //
        // Aumentaremos este número cuando:
        // - Cambie su contraseña.
        // - Cambie su rol.
        // - Se desactive su cuenta.
        // - Cierre todas sus sesiones.
        tokenVersion: {
            type: Number,

            default: 0,

            min: 0,

            select: false,
        },
    },
    {
        // Creamos automáticamente
        // createdAt y updatedAt.
        timestamps: true,

        // Guardamos todos los usuarios
        // dentro de la colección users.
        collection: "users",

        // Permitimos propiedades virtuales
        // al transformar el documento en JSON.
        toJSON: {
            virtuals: true,
        },

        // Permitimos propiedades virtuales
        // al transformarlo en un objeto normal.
        toObject: {
            virtuals: true,
        },
    }
);


// Creamos una propiedad virtual
// que une el nombre y el apellido.
//
// Esta propiedad no se guarda en MongoDB.
userSchema
    .virtual("fullName")
    .get(function () {

        // Retornamos el nombre completo.
        return `${this.firstName} ${this.lastName}`;
    });


// Validamos que cada usuario tenga
// al menos una sucursal relacionada.
userSchema
    .path("sucursales")
    .validate(
        function (sucursales) {

            // La validación será correcta
            // si existe al menos una sucursal.
            return (
                Array.isArray(sucursales) &&
                sucursales.length > 0
            );
        },

        "El usuario debe tener al menos una sucursal"
    );


// Antes de validar el documento,
// comprobamos la sucursal principal
// y la posición del superadministrador.
userSchema.pre(
    "validate",
    function () {

        // Evitamos errores si todavía
        // no existe el arreglo.
        const sucursales =
            Array.isArray(this.sucursales)
                ? this.sucursales
                : [];


        // Convertimos los identificadores
        // de las sucursales a texto.
        const identificadoresSucursales =
            sucursales.map(
                (sucursal) => {

                    // Si la sucursal fue poblada,
                    // utilizamos su propiedad _id.
                    const sucursalId =
                        sucursal?._id ??
                        sucursal;

                    // Convertimos el identificador
                    // en una cadena comparable.
                    return sucursalId?.toString();
                }
            );


        // Si existe una sucursal principal,
        // obtenemos su identificador.
        const sucursalPrincipalId =
            this.sucursalPrincipal?._id ??
            this.sucursalPrincipal;


        // Convertimos el identificador
        // principal a texto.
        const identificadorSucursalPrincipal =
            sucursalPrincipalId?.toString();


        // Comprobamos que la sucursal principal
        // aparezca dentro de las sucursales asignadas.
        const incluyeSucursalPrincipal =
            identificadoresSucursales.includes(
                identificadorSucursalPrincipal
            );


        // Si no está incluida, generamos
        // un error de validación.
        if (
            identificadorSucursalPrincipal &&
            !incluyeSucursalPrincipal
        ) {
            this.invalidate(
                "sucursalPrincipal",
                "La sucursal principal debe estar incluida en las sucursales asignadas"
            );
        }


        // Si el usuario es superadministrador,
        // debe ocupar una de las dos posiciones.
        if (
            this.role === "super_admin" &&
            ![
                1,
                2,
            ].includes(this.superAdminSlot)
        ) {
            this.invalidate(
                "superAdminSlot",
                "El superadministrador debe ocupar la posición 1 o 2"
            );
        }


        // Si el usuario no es superadministrador,
        // eliminamos cualquier posición anterior.
        if (
            this.role !== "super_admin"
        ) {
            this.superAdminSlot = undefined;
        }
    }
);


// Creamos un índice para consultar usuarios
// por sucursal, rol y estado.
userSchema.index({
    sucursales: 1,
    role: 1,
    isActive: 1,
});


// Creamos un índice para facilitar
// futuros listados de cumpleaños.
userSchema.index({
    birthDate: 1,
    isActive: 1,
});


// Creamos un índice único parcial.
//
// Solamente indexará documentos que tengan
// una posición numérica de superadministrador.
//
// Como las únicas posiciones permitidas son
// 1 y 2, MongoDB impedirá que existan
// más de dos superadministradores.
userSchema.index(
    {
        superAdminSlot: 1,
    },
    {
        unique: true,

        partialFilterExpression: {
            superAdminSlot: {
                $type: "number",
            },
        },
    }
);


// Antes de entregar información como JSON,
// eliminamos los datos internos sensibles
// que pudieran haber sido seleccionados.
userSchema.set(
    "toJSON",
    {
        virtuals: true,

        transform: function (
            document,
            returnedObject
        ) {

            // Eliminamos el hash
            // de la contraseña.
            delete returnedObject.passwordHash;

            // Eliminamos los intentos fallidos.
            delete returnedObject.loginAttempts;

            // Eliminamos la fecha de bloqueo.
            delete returnedObject.lockUntil;

            // Eliminamos la fecha interna
            // del cambio de contraseña.
            delete returnedObject.passwordChangedAt;

            // Eliminamos la versión utilizada
            // para invalidar sesiones.
            delete returnedObject.tokenVersion;

            // Eliminamos la posición interna
            // de superadministrador.
            delete returnedObject.superAdminSlot;

            // Eliminamos la versión
            // interna de MongoDB.
            delete returnedObject.__v;

            // Retornamos el objeto limpio.
            return returnedObject;
        },
    }
);


// Creamos el modelo User.
const User = mongoose.model(
    "User",
    userSchema
);


// Exportamos el modelo para utilizarlo
// en autenticación, usuarios y administración.
export default User;