// Cargamos las variables del archivo .env
// cuando trabajamos localmente.
//
// En Vercel las variables ya existen en process.env.
// dotenv NO reemplaza esas variables por defecto,
// por lo que también es seguro en producción.
import "dotenv/config";


// Importamos la aplicación de Express.
//
// Aquí se encuentran:
// - CORS.
// - Helmet.
// - Rate limiting.
// - Cookies.
// - Rutas.
// - Manejo de errores.
import app from "./src/app.js";


// Importamos la función encargada
// de conectar con MongoDB Atlas.
import connectDatabase from "./src/config/database.js";


// Detectamos si estamos ejecutando
// la aplicación en producción.
const isProduction =
  process.env.NODE_ENV === "production";


// Definimos el puerto.
//
// Este puerto se utiliza principalmente
// durante el desarrollo local.
const PORT =
  process.env.PORT || 5000;


// Creamos la función encargada
// de inicializar los servicios necesarios
// antes de recibir solicitudes.
const initializeApplication = async () => {
  try {

    // Conectamos primero con MongoDB.
    await connectDatabase();


    // Informamos que la base de datos
    // quedó disponible correctamente.
    console.log(
      "Base de datos inicializada correctamente."
    );


    // En desarrollo local debemos abrir
    // manualmente el puerto con app.listen().
    //
    // En Vercel NO lo hacemos porque
    // Vercel administra el servidor HTTP.
    if (!isProduction) {

      app.listen(
        PORT,
        () => {
          console.log(
            `Servidor de El Ancla funcionando en http://localhost:${PORT}`
          );
        }
      );
    }

  } catch (error) {

    // Registramos un mensaje controlado
    // cuando falla la inicialización.
    console.error(
      "No se pudo iniciar el backend:",
      error.message
    );


    // Propagamos el error para impedir
    // que el backend funcione sin conexión
    // a los servicios necesarios.
    throw error;
  }
};


// Inicializamos MongoDB y el servidor
// según el entorno actual.
await initializeApplication();


// Exportamos la aplicación Express.
//
// Vercel reconoce este export como
// el servidor HTTP de nuestro servicio backend.
export default app;