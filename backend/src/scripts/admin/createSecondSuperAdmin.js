
/**
 * =========================================================
 * IGLESIA EL ANCLA ⚓
 * CREACIÓN DEL SEGUNDO SUPERADMINISTRADOR
 * =========================================================
 *
 * Ubicación:
 * backend/src/scripts/admin/createSecondSuperAdmin.js
 *
 * Ejecución desde backend:
 * npm run setup:second-super-admin
 *
 * SEGURIDAD:
 * - Requiere autorización institucional.
 * - Solo permite crear el superadministrador del slot 2.
 * - No modifica al primer superadministrador.
 * - Evita duplicar correos y posiciones.
 * - Genera una contraseña temporal aleatoria.
 * - Almacena únicamente su hash bcrypt.
 * - Exige cambiar la contraseña temporal.
 * - No envía credenciales por correo.
 *
 * IMPORTANTE:
 * Las variables de entorno se cargan mediante
 * --env-file desde package.json.
 *
 * No necesitamos importar config/env.js.
 */

// Importamos Mongoose para administrar y cerrar la conexión.
import mongoose from "mongoose";

// Importamos la función criptográfica para generar contraseñas.
import { randomBytes } from "node:crypto";

// Importamos readline para solicitar datos por terminal.
import { createInterface } from "node:readline/promises";

// Importamos la conexión a MongoDB.
// Subimos dos niveles: admin → scripts → src.
import connectDatabase from "../../config/database.js";

// Importamos el modelo institucional de usuarios.
import User from "../../models/User.js";

// Importamos el modelo institucional de sucursales.
import Sucursal from "../../models/Sucursal.js";

// Importamos la función existente de cifrado de contraseñas.
import { hashPassword } from "../../utils/passwordUtils.js";

// =========================================================
// CONFIGURACIÓN DEL SEGUNDO SUPERADMINISTRADOR
// =========================================================

// Establecemos el correo autorizado para esta creación.
const TARGET_EMAIL = "s.ortiz.oyarzun@gmail.com";

// Reservamos la posición número dos.
const TARGET_SLOT = 2;

// =========================================================
// PROTECCIÓN CONTRA EJECUCIONES AUTOMÁTICAS
// =========================================================

// Comprobamos que exista una terminal interactiva.
if (!process.stdin.isTTY) {

  // Informamos que no se permiten ejecuciones automatizadas.
  console.error(
    "Este script debe ejecutarse manualmente desde una terminal interactiva."
  );

  // Indicamos que la ejecución terminó con un error.
  process.exitCode = 1;

} else {

  // Creamos la interfaz para solicitar información al operador.
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // =========================================================
  // VALIDACIÓN DE FECHA DE NACIMIENTO
  // =========================================================

  // Definimos una función que valida una fecha civil.
  const parseBirthDate = (value) => {

    // Exigimos el formato AAAA-MM-DD.
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new Error(
        "La fecha de nacimiento debe tener el formato AAAA-MM-DD."
      );
    }

    // Separamos el año, mes y día.
    const [year, month, day] = value.split("-").map(Number);

    // Construimos la fecha utilizando mediodía UTC.
    const date = new Date(
      Date.UTC(year, month - 1, day, 12)
    );

    // Comprobamos que JavaScript no haya corregido una fecha imposible.
    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      throw new Error(
        "La fecha de nacimiento ingresada no existe."
      );
    }

    // Impedimos registrar fechas posteriores al momento actual.
    if (date > new Date()) {
      throw new Error(
        "La fecha de nacimiento no puede pertenecer al futuro."
      );
    }

    // Retornamos la fecha validada.
    return date;
  };

  // =========================================================
  // VALIDACIÓN DEL NOMBRE Y APELLIDOS
  // =========================================================

  // Definimos una función para validar nombres.
  const validateName = (value, label) => {

    // Eliminamos espacios innecesarios al inicio y final.
    const normalized = value.trim();

    // Respetamos los límites del esquema User.
    if (
      normalized.length < 2 ||
      normalized.length > 60
    ) {
      throw new Error(
        `${label} debe tener entre 2 y 60 caracteres.`
      );
    }

    // Retornamos el texto validado.
    return normalized;
  };

  // =========================================================
  // CREACIÓN DEL SEGUNDO SUPERADMINISTRADOR
  // =========================================================

  // Definimos la función principal del script.
  const main = async () => {

    // Mostramos información general de la operación.
    console.log(
      "\n⚓ Iglesia El Ancla | Segundo superadministrador"
    );

    // Informamos el correo de la cuenta que será creada.
    console.log(`Correo: ${TARGET_EMAIL}`);

    // Recordamos el nivel de acceso que tendrá esta cuenta.
    console.log(
      "Esta cuenta tendrá permisos institucionales máximos."
    );

    // Solicitamos verificar la autorización antes de continuar.
    console.log(
      "Verifica previamente la autorización y la titularidad del correo.\n"
    );

    // =====================================================
    // SOLICITUD DE DATOS PERSONALES
    // =====================================================

    // Solicitamos y validamos el nombre real.
    const firstName = validateName(
      await rl.question("Nombre real: "),
      "El nombre"
    );

    // Solicitamos y validamos los apellidos.
    const lastName = validateName(
      await rl.question("Apellido(s) real(es): "),
      "El apellido"
    );

    // Solicitamos la fecha de nacimiento.
    const birthDateInput = await rl.question(
      "Fecha de nacimiento (AAAA-MM-DD): "
    );

    // Convertimos la fecha recibida a un objeto Date válido.
    const birthDate = parseBirthDate(
      birthDateInput.trim()
    );

    // =====================================================
    // CONFIRMACIÓN DE SEGURIDAD
    // =====================================================

    // Exigimos una confirmación explícita.
    const confirmation = await rl.question(
      "Escribe CREAR SEGUNDO SUPERADMIN para confirmar: "
    );

    // Cancelamos la operación si no coincide exactamente.
    if (confirmation !== "CREAR SEGUNDO SUPERADMIN") {
      throw new Error(
        "Operación cancelada: no se recibió la confirmación exacta."
      );
    }

    // =====================================================
    // CONEXIÓN A MONGODB
    // =====================================================

    // Utilizamos la conexión existente del backend.
    await connectDatabase();

    // Esperamos que Mongoose prepare los índices únicos.
    await User.init();

    // =====================================================
    // VALIDACIÓN DE SUPERADMINISTRADORES EXISTENTES
    // =====================================================

    // Contamos los superadministradores registrados.
    const superAdminCount = await User.countDocuments({
      role: "super_admin",
    });

    // Debe existir exactamente un superadministrador.
    if (superAdminCount !== 1) {
      throw new Error(
        `Se esperaba un solo superadministrador; se encontraron ${superAdminCount}. No se modificó nada.`
      );
    }

    // Buscamos al superadministrador que ocupa el primer cupo.
    const founder = await User.findOne({
      role: "super_admin",
      superAdminSlot: 1,
    })
      // Seleccionamos únicamente los datos necesarios.
      .select(
        "firstName lastName email sucursalPrincipal sucursales isActive"
      )
      // Evitamos crear un documento Mongoose innecesario.
      .lean();

    // Verificamos que el primer superadministrador exista y esté activo.
    if (!founder || !founder.isActive) {
      throw new Error(
        "No existe un superadministrador inicial activo en el slot 1."
      );
    }

    // Comprobamos que la segunda posición esté disponible.
    const secondSlotOccupied = await User.exists({
      superAdminSlot: TARGET_SLOT,
    });

    // Impedimos ocupar una posición que ya pertenece a otra cuenta.
    if (secondSlotOccupied) {
      throw new Error(
        "La segunda posición de superadministrador ya está ocupada."
      );
    }

    // =====================================================
    // VALIDACIÓN DE CORREO ELECTRÓNICO
    // =====================================================

    // Buscamos si ya existe una cuenta con el mismo correo.
    const existingUser = await User.exists({
      email: TARGET_EMAIL,
    });

    // Evitamos crear usuarios duplicados o sobrescribirlos.
    if (existingUser) {
      throw new Error(
        `Ya existe una cuenta registrada con ${TARGET_EMAIL}. No se realizaron cambios.`
      );
    }

    // =====================================================
    // VALIDACIÓN DE SUCURSAL
    // =====================================================

    // Buscamos la sucursal principal del primer superadministrador.
    const branch = await Sucursal.findById(
      founder.sucursalPrincipal
    )
      // Recuperamos únicamente sus datos identificadores y estado.
      .select("name code isActive")
      // Obtenemos un objeto simple.
      .lean();

    // Exigimos que la sucursal exista y esté activa.
    if (!branch || !branch.isActive) {
      throw new Error(
        "La sucursal principal del superadministrador inicial no está activa."
      );
    }

    // =====================================================
    // GENERACIÓN DE CONTRASEÑA TEMPORAL
    // =====================================================

    // Generamos 24 bytes criptográficamente aleatorios.
    const randomPart = randomBytes(24).toString(
      "base64url"
    );

    // Añadimos caracteres para cumplir la política de contraseñas.
    const temporaryPassword = `${randomPart}aA1!`;

    // Ciframos la contraseña mediante bcrypt.
    const passwordHash = await hashPassword(
      temporaryPassword
    );

    // =====================================================
    // CREACIÓN DEL USUARIO EN MONGODB
    // =====================================================

    // Insertamos exclusivamente la segunda cuenta.
    const newUser = await User.create({

      // Nombre real proporcionado por el operador.
      firstName,

      // Apellidos reales proporcionados por el operador.
      lastName,

      // Fecha de nacimiento validada.
      birthDate,

      // Correo autorizado.
      email: TARGET_EMAIL,

      // Guardamos únicamente el hash, nunca la contraseña original.
      passwordHash,

      // Asignamos permisos de superadministrador.
      role: "super_admin",

      // Asignamos la segunda posición institucional.
      superAdminSlot: TARGET_SLOT,

      // Relacionamos la cuenta con la sucursal existente.
      sucursales: [branch._id],

      // Establecemos su sucursal principal.
      sucursalPrincipal: branch._id,

      // Permitimos iniciar sesión.
      isActive: true,

      // El operador debe haber comprobado la titularidad del correo.
      emailVerifiedAt: new Date(),

      // Obligamos al usuario a reemplazar la contraseña temporal.
      mustChangePassword: true,

      // Establecemos la versión inicial de sesiones.
      tokenVersion: 0,
    });

    // =====================================================
    // RESULTADO DE LA OPERACIÓN
    // =====================================================

    // Confirmamos que la cuenta se creó correctamente.
    console.log(
      "\n✅ Segundo superadministrador creado correctamente."
    );

    // Mostramos el nombre registrado.
    console.log(
      `Usuario: ${newUser.firstName} ${newUser.lastName}`
    );

    // Mostramos el correo asociado.
    console.log(
      `Correo: ${newUser.email}`
    );

    // Mostramos el rol y la posición asignada.
    console.log(
      `Rol: ${newUser.role} (posición 2)`
    );

    // Mostramos la sucursal principal asignada.
    console.log(
      `Sucursal principal: ${branch.code} - ${branch.name}`
    );

    // Advertimos que la siguiente información es confidencial.
    console.log(
      "\n🔐 CONTRASEÑA TEMPORAL (se mostrará únicamente en esta ejecución):"
    );

    // Mostramos la contraseña generada para entregarla al titular.
    console.log(temporaryPassword);

    // Recordamos que no debe compartirse públicamente.
    console.log(
      "\nEntrégala por un canal privado; nunca la subas a GitHub ni la compartas en capturas."
    );

    // Recordamos que el usuario debe establecer una contraseña propia.
    console.log(
      "La cuenta deberá cambiar su contraseña en el primer acceso.\n"
    );
  };

  // =========================================================
  // EJECUCIÓN Y CONTROL DE ERRORES
  // =========================================================

  // Intentamos realizar la creación de la cuenta.
  try {

    // Ejecutamos la función principal.
    await main();

  } catch (error) {

    // Identificamos los errores de índices únicos de MongoDB.
    if (error?.code === 11000) {

      // Informamos que el correo o el cupo ya están ocupados.
      console.error(
        "No se creó la cuenta: el correo o el cupo de superadministrador ya está registrado."
      );

    } else {

      // Mostramos el error ocurrido, sin imprimir credenciales.
      console.error(
        `No se completó la creación: ${error.message}`
      );
    }

    // Indicamos un resultado de ejecución fallida.
    process.exitCode = 1;

  } finally {

    // Cerramos la interfaz de preguntas.
    rl.close();

    // Cerramos la conexión a MongoDB si fue abierta.
    await mongoose.disconnect();
  }
}
