// Importamos bcryptjs para cifrar
// y comparar contraseñas.
import bcrypt from "bcryptjs";


// Definimos el costo utilizado por bcrypt.
//
// Un valor de 12 ofrece un equilibrio razonable
// entre seguridad y tiempo de procesamiento.
const BCRYPT_ROUNDS = 12;


// Definimos el largo mínimo permitido.
const MIN_PASSWORD_LENGTH = 12;


// Bcrypt procesa como máximo 72 bytes.
//
// No es exactamente lo mismo que 72 caracteres,
// porque algunos símbolos pueden utilizar varios bytes.
const MAX_PASSWORD_BYTES = 72;


// Creamos una función que valida
// si una contraseña cumple las reglas de seguridad.
const validatePassword = (password) => {

  // Creamos un arreglo para guardar
  // todos los problemas encontrados.
  const errors = [];


  // Comprobamos que la contraseña
  // realmente sea un texto.
  if (typeof password !== "string") {
    return {
      isValid: false,
      errors: [
        "La contraseña debe ser una cadena de texto",
      ],
    };
  }


  // Comprobamos la cantidad mínima de caracteres.
  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push(
      `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`
    );
  }


  // Calculamos el tamaño real
  // de la contraseña en bytes UTF-8.
  const passwordBytes = Buffer.byteLength(
    password,
    "utf8"
  );


  // Evitamos superar el límite procesado por bcrypt.
  if (passwordBytes > MAX_PASSWORD_BYTES) {
    errors.push(
      "La contraseña no puede superar los 72 bytes"
    );
  }


  // Comprobamos que exista al menos
  // una letra minúscula.
  if (!/[a-záéíóúñ]/u.test(password)) {
    errors.push(
      "La contraseña debe incluir al menos una letra minúscula"
    );
  }


  // Comprobamos que exista al menos
  // una letra mayúscula.
  if (!/[A-ZÁÉÍÓÚÑ]/u.test(password)) {
    errors.push(
      "La contraseña debe incluir al menos una letra mayúscula"
    );
  }


  // Comprobamos que exista al menos un número.
  if (!/\d/u.test(password)) {
    errors.push(
      "La contraseña debe incluir al menos un número"
    );
  }


  // Comprobamos que exista al menos
  // un carácter especial.
  if (
    !/[!@#$%^&*(),.?":{}|<>_\-+=/\\[\];'`~]/u.test(
      password
    )
  ) {
    errors.push(
      "La contraseña debe incluir al menos un carácter especial"
    );
  }


  // Retornamos el resultado completo
  // de la validación.
  return {
    // Será válido solamente si no existen errores.
    isValid: errors.length === 0,

    // Entregamos todos los errores encontrados.
    errors,
  };
};


// Creamos una función que cifra
// una contraseña segura.
const hashPassword = async (password) => {

  // Validamos la contraseña antes de cifrarla.
  const validation = validatePassword(password);


  // Si no cumple las reglas,
  // detenemos el proceso.
  if (!validation.isValid) {

    // Creamos un error con un mensaje comprensible.
    const error = new Error(
      validation.errors.join(". ")
    );


    // Agregamos un código interno para identificarlo.
    error.code = "INVALID_PASSWORD";


    // Lanzamos el error.
    throw error;
  }


  // Generamos el hash utilizando bcrypt.
  //
  // bcrypt incorporará automáticamente
  // una sal aleatoria dentro del resultado.
  const passwordHash = await bcrypt.hash(
    password,
    BCRYPT_ROUNDS
  );


  // Retornamos solamente el hash.
  return passwordHash;
};


// Creamos una función para comparar
// la contraseña ingresada con el hash almacenado.
const comparePassword = async (
  password,
  passwordHash
) => {

  // Evitamos ejecutar bcrypt si alguno
  // de los valores no es válido.
  if (
    typeof password !== "string" ||
    typeof passwordHash !== "string" ||
    !password ||
    !passwordHash
  ) {
    return false;
  }


  // bcrypt cifra internamente la contraseña
  // y la compara con el hash guardado.
  const passwordsMatch = await bcrypt.compare(
    password,
    passwordHash
  );


  // Retornamos true o false.
  return passwordsMatch;
};


// Exportamos las funciones para reutilizarlas
// en el script inicial y en el endpoint de login.
export {
  validatePassword,
  hashPassword,
  comparePassword,
};