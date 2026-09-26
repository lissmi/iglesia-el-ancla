// Importamos la aplicación de Express.
//
// Toda la configuración de seguridad,
// rutas, CORS, cookies y middlewares
// permanece dentro de app.js.
import app from "./src/app.js";


// Importamos la función encargada
// de conectar el backend con MongoDB.
import connectDatabase from "./src/config/database.js";


// Guardamos la promesa de conexión.
//
// Esto evita crear una conexión nueva
// con MongoDB en cada solicitud cuando
// Vercel reutiliza la misma instancia.
let databaseConnection;


// Creamos una función que garantiza
// que MongoDB esté conectado antes
// de procesar una solicitud.
const ensureDatabaseConnection = async () => {

  // Si todavía no existe una conexión
  // iniciada, comenzamos una.
  if (!databaseConnection) {
    databaseConnection =
      connectDatabase();
  }


  // Esperamos que la conexión
  // termine correctamente.
  await databaseConnection;
};


// Creamos el handler que Vercel
// ejecutará para cada solicitud HTTP.
const handler = async (
  req,
  res
) => {

  try {

    // Comprobamos primero
    // la conexión con MongoDB.
    await ensureDatabaseConnection();


    // Una aplicación Express también
    // funciona como manejador HTTP.
    //
    // Entregamos la solicitud y respuesta
    // directamente a Express.
    return app(
      req,
      res
    );

  } catch (error) {

    // Registramos el problema en
    // los logs internos de Vercel.
    console.error(
      "Error al inicializar el backend:",
      error.message
    );


    // Respondemos de manera controlada
    // sin exponer información sensible.
    return res
      .status(500)
      .json({
        success: false,

        message:
          "No fue posible iniciar el servicio.",
      });
  }
};


// Exportamos explícitamente una función.
//
// Este es el punto que Vercel necesita
// para ejecutar el servicio backend.
export default handler;