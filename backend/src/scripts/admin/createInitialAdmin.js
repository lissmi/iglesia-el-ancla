// Cargamos las variables de entorno
// antes de utilizar la conexión con MongoDB.
import "../config/env.js";


// Importamos mongoose para cerrar
// correctamente la conexión al terminar.
import mongoose from "mongoose";


// Importamos crypto para generar
// una contraseña temporal aleatoria y segura.
import crypto from "node:crypto";


// Importamos la función encargada
// de conectar el backend con MongoDB.
import connectDatabase from "../config/database.js";


// Importamos el modelo de sucursales.
import Sucursal from "../models/Sucursal.js";


// Importamos el modelo único de usuarios.
//
// Este modelo incluye miembros,
// administradores y superadministradores.
import User from "../models/User.js";


// Importamos la utilidad
// encargada de cifrar contraseñas.
import {
    hashPassword,
} from "../utils/passwordUtils.js";


// Creamos una función que obtiene
// un argumento enviado desde la terminal.
//
// Ejemplo:
//
// --firstName=Lisett
const getCommandArgument = (
    argumentName
) => {

    // Creamos el prefijo
    // que queremos encontrar.
    const prefix =
        `--${argumentName}=`;


    // Buscamos el argumento dentro
    // de los parámetros de la terminal.
    const argument =
        process.argv.find(
            (currentArgument) =>
                currentArgument.startsWith(
                    prefix
                )
        );


    // Si el argumento no existe,
    // retornamos una cadena vacía.
    if (!argument) {
        return "";
    }


    // Eliminamos el prefijo
    // y retornamos el valor recibido.
    return argument
        .slice(prefix.length)
        .trim();
};


// Creamos una función que genera
// una contraseña temporal segura.
const generateTemporaryPassword = () => {

    // Generamos 18 bytes aleatorios
    // utilizando el módulo criptográfico de Node.
    const randomPart =
        crypto
            .randomBytes(18)
            .toString("base64url");


    // Agregamos diferentes tipos
    // de caracteres para cumplir
    // las reglas de contraseña.
    const temporaryPassword =
        `${randomPart}aA1!`;


    // Retornamos la contraseña generada.
    return temporaryPassword;
};


// Creamos una función que convierte
// la fecha recibida desde la terminal.
//
// El formato obligatorio será:
//
// AAAA-MM-DD
const parseBirthDate = (
    birthDateValue
) => {

    // Comprobamos que exista
    // una fecha de nacimiento.
    if (!birthDateValue) {
        throw new Error(
            "Debes proporcionar --birthDate utilizando el formato AAAA-MM-DD"
        );
    }


    // Comprobamos la estructura
    // general de la fecha.
    const birthDatePattern =
        /^\d{4}-\d{2}-\d{2}$/;


    // Rechazamos formatos diferentes.
    if (
        !birthDatePattern.test(
            birthDateValue
        )
    ) {
        throw new Error(
            "La fecha de nacimiento debe utilizar el formato AAAA-MM-DD"
        );
    }


    // Separamos el año,
    // el mes y el día.
    const [
        yearValue,
        monthValue,
        dayValue,
    ] = birthDateValue.split("-");


    // Convertimos los valores
    // recibidos a números.
    const year = Number(yearValue);
    const month = Number(monthValue);
    const day = Number(dayValue);


    // Creamos la fecha utilizando UTC.
    //
    // Usamos las 12:00 para reducir problemas
    // de visualización por zona horaria.
    const parsedBirthDate =
        new Date(
            Date.UTC(
                year,
                month - 1,
                day,
                12,
                0,
                0
            )
        );


    // Comprobamos que JavaScript no haya
    // corregido automáticamente una fecha inválida.
    //
    // Por ejemplo:
    // 2026-02-31 no debe convertirse en marzo.
    const dateIsValid =
        parsedBirthDate.getUTCFullYear() ===
            year &&
        parsedBirthDate.getUTCMonth() ===
            month - 1 &&
        parsedBirthDate.getUTCDate() ===
            day;


    // Rechazamos fechas inexistentes.
    if (!dateIsValid) {
        throw new Error(
            "La fecha de nacimiento ingresada no existe"
        );
    }


    // Comprobamos que la fecha
    // no pertenezca al futuro.
    if (
        parsedBirthDate >
        new Date()
    ) {
        throw new Error(
            "La fecha de nacimiento no puede estar en el futuro"
        );
    }


    // Retornamos la fecha preparada
    // para guardarse en MongoDB.
    return parsedBirthDate;
};


// Creamos una función que normaliza
// el número telefónico.
const normalizePhone = (
    phoneValue
) => {

    // Comprobamos que exista
    // un número telefónico.
    if (!phoneValue) {
        throw new Error(
            "Debes proporcionar --phone"
        );
    }


    // Eliminamos espacios,
    // guiones y paréntesis.
    let normalizedPhone =
        phoneValue.replace(
            /[\s()-]/g,
            ""
        );


    // Si se ingresó un número móvil chileno
    // sin código de país, agregamos +56.
    //
    // Ejemplo:
    // 931458575
    // se convierte en:
    // +56931458575
    if (
        /^9\d{8}$/.test(
            normalizedPhone
        )
    ) {
        normalizedPhone =
            `+56${normalizedPhone}`;
    }


    // Si se ingresó el código de Chile
    // sin el signo +, lo agregamos.
    //
    // Ejemplo:
    // 56931458575
    // se convierte en:
    // +56931458575
    if (
        /^56\d{9}$/.test(
            normalizedPhone
        )
    ) {
        normalizedPhone =
            `+${normalizedPhone}`;
    }


    // Utilizamos una validación compatible
    // con números telefónicos internacionales.
    const internationalPhonePattern =
        /^\+[1-9]\d{7,14}$/;


    // Rechazamos números
    // que no tengan un formato válido.
    if (
        !internationalPhonePattern.test(
            normalizedPhone
        )
    ) {
        throw new Error(
            "El teléfono debe utilizar un formato válido, por ejemplo +56912345678"
        );
    }


    // Retornamos el teléfono normalizado.
    return normalizedPhone;
};


// Creamos una función que comprueba
// los datos recibidos desde la terminal.
const validateArguments = ({
    firstName,
    lastName,
    email,
    confirmation,
}) => {

    // Comprobamos que exista el nombre.
    if (!firstName) {
        throw new Error(
            "Debes proporcionar --firstName"
        );
    }


    // Comprobamos que exista el apellido.
    if (!lastName) {
        throw new Error(
            "Debes proporcionar --lastName"
        );
    }


    // Comprobamos que exista el correo.
    if (!email) {
        throw new Error(
            "Debes proporcionar --email"
        );
    }


    // Comprobamos que el correo tenga
    // una estructura básica válida.
    if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            email
        )
    ) {
        throw new Error(
            "El correo electrónico ingresado no es válido"
        );
    }


    // Exigimos una confirmación explícita
    // para evitar ejecutar el script por accidente.
    if (
        confirmation !==
        "CREATE_INITIAL_ADMIN"
    ) {
        throw new Error(
            "Debes confirmar la operación con --confirm=CREATE_INITIAL_ADMIN"
        );
    }
};


// Creamos la función principal
// encargada de crear al superadministrador.
const createInitialAdmin = async () => {

    // Obtenemos el nombre
    // desde la terminal.
    const firstName =
        getCommandArgument(
            "firstName"
        );


    // Obtenemos el apellido
    // desde la terminal.
    const lastName =
        getCommandArgument(
            "lastName"
        );


    // Obtenemos la fecha de nacimiento
    // en formato AAAA-MM-DD.
    const birthDateValue =
        getCommandArgument(
            "birthDate"
        );


    // Obtenemos el teléfono.
    const phoneValue =
        getCommandArgument(
            "phone"
        );


    // Obtenemos y normalizamos el correo.
    const email =
        getCommandArgument(
            "email"
        ).toLowerCase();


    // Obtenemos la confirmación
    // de seguridad.
    const confirmation =
        getCommandArgument(
            "confirm"
        );


    // Validamos el nombre,
    // apellido, correo y confirmación.
    validateArguments({
        firstName,
        lastName,
        email,
        confirmation,
    });


    // Convertimos y validamos
    // la fecha de nacimiento.
    const birthDate =
        parseBirthDate(
            birthDateValue
        );


    // Normalizamos y validamos
    // el teléfono recibido.
    const phone =
        normalizePhone(
            phoneValue
        );


    // Establecemos la conexión
    // con MongoDB.
    await connectDatabase();


    // Esperamos a que Mongoose prepare
    // los índices del modelo User.
    //
    // Esto incluye el índice único
    // de las posiciones de superadministrador.
    await User.init();


    // Buscamos si ya existe
    // un superadministrador.
    const existingSuperAdmin =
        await User.exists({
            role: "super_admin",
        });


    // Impedimos ejecutar nuevamente
    // el proceso inicial.
    if (existingSuperAdmin) {
        throw new Error(
            "Ya existe un superadministrador. El script inicial no puede ejecutarse nuevamente."
        );
    }


    // Comprobamos si el correo recibido
    // ya pertenece a otra cuenta.
    const existingUserWithEmail =
        await User.exists({
            email,
        });


    // Impedimos utilizar
    // un correo repetido.
    if (existingUserWithEmail) {
        throw new Error(
            "Ya existe un usuario registrado con ese correo electrónico."
        );
    }


    // Buscamos si la sucursal inicial
    // ya existe en MongoDB.
    let sucursal =
        await Sucursal.findOne({
            code: "SUC-001",
        });


    // Si la sucursal todavía no existe,
    // la creamos con la información
    // de la iglesia de Valparaíso.
    if (!sucursal) {
        sucursal =
            await Sucursal.create({
                // Código permanente
                // de la primera sucursal.
                code: "SUC-001",

                // Nombre de la sucursal.
                name:
                    "Iglesia El Ancla - Valparaíso",

                // Nombre utilizado
                // dentro de las URL.
                slug:
                    "iglesia-el-ancla-valparaiso",

                // Dirección física
                // de la iglesia.
                address: {
                    // Nombre de la calle.
                    street:
                        "Artillería",

                    // Número de la dirección.
                    number:
                        "199",

                    // Sector de la ciudad.
                    sector:
                        "Playa Ancha",

                    // Ciudad.
                    city:
                        "Valparaíso",

                    // Región.
                    region:
                        "Región de Valparaíso",

                    // País.
                    country:
                        "Chile",
                },

                // Correo público
                // todavía no definido.
                contactEmail: "",

                // Teléfono público
                // todavía no definido.
                contactPhone: "",

                // Zona horaria utilizada
                // por la sucursal.
                timezone:
                    "America/Santiago",

                // Indicamos que corresponde
                // a la sede principal.
                isHeadquarters: true,

                // Dejamos activa la sucursal.
                isActive: true,
            });
    }


    // Comprobamos que la sucursal
    // encontrada continúe activa.
    if (!sucursal.isActive) {
        throw new Error(
            "La sucursal SUC-001 está desactivada y no puede asignarse al superadministrador."
        );
    }


    // Generamos una contraseña temporal
    // que no fue escrita en ningún archivo.
    const temporaryPassword =
        generateTemporaryPassword();


    // Ciframos la contraseña temporal
    // antes de crear el usuario.
    const passwordHash =
        await hashPassword(
            temporaryPassword
        );


    // Creamos el primer usuario
    // con permisos de superadministrador.
    const user =
        await User.create({
            // Nombre recibido
            // desde la terminal.
            firstName,

            // Apellido recibido
            // desde la terminal.
            lastName,

            // Fecha de nacimiento validada.
            birthDate,

            // Teléfono normalizado.
            phone,

            // Correo normalizado.
            email,

            // Guardamos solamente
            // el hash de la contraseña.
            passwordHash,

            // Asignamos el nivel
            // máximo de acceso.
            role:
                "super_admin",

            // Asignamos la primera sucursal.
            sucursales: [
                sucursal._id,
            ],

            // Definimos Valparaíso
            // como sucursal principal.
            sucursalPrincipal:
                sucursal._id,

            // Ocupamos la primera de las
            // dos posiciones permitidas.
            superAdminSlot: 1,

            // Dejamos activa la cuenta.
            isActive: true,

            // El correo se considera verificado
            // porque la cuenta fue creada mediante
            // el script interno del servidor.
            emailVerifiedAt:
                new Date(),

            // Exigiremos cambiar la contraseña
            // después del primer inicio de sesión.
            mustChangePassword: true,

            // La primera versión
            // de sus sesiones será cero.
            tokenVersion: 0,
        });


    // Mostramos un separador visual.
    console.log(
        "\n========================================"
    );


    // Informamos que el proceso terminó.
    console.log(
        "SUPERADMINISTRADOR INICIAL CREADO"
    );


    // Mostramos el identificador
    // de la sucursal relacionada.
    console.log(
        `Sucursal: ${sucursal.code} - ${sucursal.name}`
    );


    // Mostramos el nombre completo
    // del nuevo usuario.
    console.log(
        `Usuario: ${user.fullName}`
    );


    // Mostramos el rol asignado.
    console.log(
        `Rol: ${user.role}`
    );


    // Mostramos el correo de acceso.
    console.log(
        `Correo: ${user.email}`
    );


    // Mostramos la contraseña temporal
    // una sola vez.
    console.log(
        `Contraseña temporal: ${temporaryPassword}`
    );


    // Recordamos que debe guardarse
    // temporalmente en un lugar seguro.
    console.log(
        "Guarda esta contraseña de forma segura."
    );


    // Informamos que deberá cambiarse
    // durante el primer acceso.
    console.log(
        "El sistema solicitará cambiarla durante el primer acceso."
    );


    // Cerramos el separador visual.
    console.log(
        "========================================\n"
    );
};


// Ejecutamos la función principal.
createInitialAdmin()

    // Si todo finaliza correctamente,
    // mostramos una confirmación.
    .then(() => {
        console.log(
            "Configuración inicial finalizada correctamente."
        );
    })

    // Si ocurre un error,
    // mostramos un mensaje controlado.
    .catch((error) => {
        console.error(
            "No se pudo completar la configuración inicial:"
        );

        console.error(
            error.message
        );

        // Indicamos que el proceso
        // terminó con error.
        process.exitCode = 1;
    })

    // Sin importar el resultado,
    // cerramos la conexión con MongoDB.
    .finally(async () => {
        await mongoose.disconnect();
    });