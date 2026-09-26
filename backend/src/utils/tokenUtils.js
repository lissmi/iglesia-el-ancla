// Importamos jsonwebtoken para crear
// y verificar los tokens de sesión.
import jwt from "jsonwebtoken";


// Definimos el emisor esperado del token.
//
// Esto permite comprobar que el token
// fue generado por nuestro propio backend.
const TOKEN_ISSUER =
  "iglesia-el-ancla-api";


// Definimos la aplicación
// que puede utilizar el token.
const TOKEN_AUDIENCE =
  "iglesia-el-ancla-app";


// Comprobamos si el backend
// está ejecutándose en producción.
const isProduction =
  process.env.NODE_ENV === "production";


// Definimos el nombre de la cookie.
//
// En producción utilizamos el prefijo __Host-,
// que exige HTTPS, path "/" y evita que
// otro subdominio configure esta misma cookie.
const AUTH_COOKIE_NAME =
  isProduction
    ? "__Host-el_ancla_session"
    : "el_ancla_session";


// Creamos una función para obtener
// el secreto utilizado por JWT.
const getJwtSecret = () => {

  // Obtenemos el secreto
  // desde las variables de entorno.
  const jwtSecret =
    process.env.JWT_SECRET;


  // Comprobamos que el secreto exista
  // y que sea una cadena de texto.
  if (
    typeof jwtSecret !== "string" ||
    !jwtSecret
  ) {
    throw new Error(
      "La variable JWT_SECRET no está definida"
    );
  }


  // Calculamos la longitud real
  // del secreto en bytes.
  const secretLength =
    Buffer.byteLength(
      jwtSecret,
      "utf8"
    );


  // Comprobamos que el secreto tenga
  // al menos 64 bytes.
  if (
    secretLength < 64
  ) {
    throw new Error(
      "JWT_SECRET debe tener al menos 64 bytes"
    );
  }


  // Retornamos el secreto validado.
  return jwtSecret;
};


// Creamos una función que valida
// la versión de sesión recibida.
const validateTokenVersion = (
  tokenVersion
) => {

  // Comprobamos que sea un número entero
  // igual o superior a cero.
  const tokenVersionIsValid =
    Number.isInteger(
      tokenVersion
    ) &&
    tokenVersion >= 0;


  // Si no es válida,
  // detenemos la operación.
  if (!tokenVersionIsValid) {
    throw new Error(
      "La versión de la sesión no es válida"
    );
  }
};


// Creamos una función que genera
// el token de cualquier usuario registrado.
const generateAuthToken = ({
  userId,
  tokenVersion = 0,
}) => {

  // Comprobamos que exista
  // el identificador del usuario.
  if (!userId) {
    throw new Error(
      "No se puede generar un token sin usuario"
    );
  }


  // Validamos la versión
  // de la sesión.
  validateTokenVersion(
    tokenVersion
  );


  // Obtenemos el secreto JWT
  // previamente validado.
  const jwtSecret =
    getJwtSecret();


  // Obtenemos la duración configurada.
  //
  // Si no existe, utilizamos dos horas.
  const expiresIn =
    process.env.JWT_EXPIRES_IN ||
    "2h";


  // Creamos y retornamos
  // el token firmado.
  return jwt.sign(
    {
      // Identificamos el contenido
      // como una sesión de usuario.
      type:
        "session",

      // Incluimos la versión utilizada
      // para invalidar sesiones anteriores.
      tokenVersion,
    },

    // Utilizamos el secreto
    // para firmar el token.
    jwtSecret,

    {
      // Guardamos el identificador del usuario
      // dentro del campo estándar subject.
      subject:
        userId.toString(),

      // Definimos cuánto durará el token.
      expiresIn,

      // Indicamos quién emitió el token.
      issuer:
        TOKEN_ISSUER,

      // Indicamos quién puede utilizarlo.
      audience:
        TOKEN_AUDIENCE,

      // Aceptamos únicamente
      // el algoritmo HS256.
      algorithm:
        "HS256",
    }
  );
};


// Creamos una función para verificar
// un token recibido desde la cookie.
const verifyAuthToken = (
  token
) => {

  // Comprobamos que el token exista
  // y sea una cadena de texto.
  if (
    typeof token !== "string" ||
    !token
  ) {
    throw new Error(
      "No se recibió un token de sesión"
    );
  }


  // Obtenemos el secreto
  // previamente validado.
  const jwtSecret =
    getJwtSecret();


  // Verificamos:
// - La firma.
// - La expiración.
// - El emisor.
// - La audiencia.
// - El algoritmo.
  const decodedToken =
    jwt.verify(
      token,
      jwtSecret,
      {
        // Exigimos el emisor esperado.
        issuer:
          TOKEN_ISSUER,

        // Exigimos la audiencia esperada.
        audience:
          TOKEN_AUDIENCE,

        // Aceptamos solamente HS256.
        algorithms: [
          "HS256",
        ],
      }
    );


  // Comprobamos que el contenido decodificado
  // sea un objeto y no una cadena.
  if (
    typeof decodedToken !== "object" ||
    decodedToken === null
  ) {
    throw new Error(
      "El contenido del token no es válido"
    );
  }


  // Comprobamos que corresponda
  // a una sesión de usuario.
  if (
    decodedToken.type !==
    "session"
  ) {
    throw new Error(
      "El tipo de token no es válido"
    );
  }


  // Comprobamos que exista
  // el identificador del usuario.
  if (
    typeof decodedToken.sub !== "string" ||
    !decodedToken.sub
  ) {
    throw new Error(
      "El token no contiene un usuario válido"
    );
  }


  // Validamos la versión incluida
  // dentro del token.
  validateTokenVersion(
    decodedToken.tokenVersion
  );


  // Retornamos el contenido
  // verificado del token.
  return decodedToken;
};


// Creamos una función que obtiene
// la duración de la cookie.
const getCookieMaxAge = () => {

  // Obtenemos la duración configurada
  // y la convertimos a número.
  const configuredMaxAge =
    Number(
      process.env
        .AUTH_COOKIE_MAX_AGE_MS ||
      7200000
    );


  // Comprobamos que sea:
// - Un número entero seguro.
// - Mayor que cero.
  const maxAgeIsValid =
    Number.isSafeInteger(
      configuredMaxAge
    ) &&
    configuredMaxAge > 0;


  // Si el valor no es válido,
  // utilizamos dos horas.
  if (!maxAgeIsValid) {
    return 7200000;
  }


  // Retornamos la duración validada.
  return configuredMaxAge;
};


// Creamos una función para obtener
// las opciones de la cookie de sesión.
const getAuthCookieOptions = () => {

  // Retornamos la configuración
  // segura de la cookie.
  return {
    // Impedimos que JavaScript del navegador
    // pueda leer directamente el token.
    httpOnly: true,

    // En producción la cookie solamente
    // podrá enviarse mediante HTTPS.
    secure:
      isProduction,

    // Durante el desarrollo utilizamos lax.
    //
    // En producción utilizamos none
    // porque el frontend y el backend
    // podrían estar en dominios diferentes.
    sameSite:
      isProduction
        ? "none"
        : "lax",

    // Permitimos enviar la cookie
    // a todas las rutas del backend.
    path:
      "/",

    // Definimos la duración
    // de la cookie.
    maxAge:
      getCookieMaxAge(),

    // Solicitamos al navegador dar
    // prioridad alta a esta cookie.
    priority:
      "high",
  };
};


// Creamos una función para obtener
// las opciones utilizadas al eliminar
// la cookie de sesión.
const getAuthCookieClearOptions = () => {

  // Obtenemos las opciones principales.
  const {
    // Separamos maxAge porque no debe
    // utilizarse al eliminar la cookie.
    maxAge,

    // Conservamos todas las demás opciones.
    ...clearOptions
  } = getAuthCookieOptions();


  // Evitamos una advertencia por
  // la variable extraída y no utilizada.
  void maxAge;


  // Retornamos las mismas opciones
  // con las que se creó la cookie.
  return clearOptions;
};


// Exportamos las herramientas necesarias
// para la autenticación general.
export {
  // Exportamos el nombre de la cookie.
  AUTH_COOKIE_NAME,

  // Exportamos la generación del token.
  generateAuthToken,

  // Exportamos la verificación del token.
  verifyAuthToken,

  // Exportamos las opciones
  // para crear la cookie.
  getAuthCookieOptions,

  // Exportamos las opciones
  // para eliminar la cookie.
  getAuthCookieClearOptions,
};