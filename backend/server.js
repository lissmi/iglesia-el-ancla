// Importamos dotenv para cargar
// las variables del archivo .env
// cuando trabajamos de forma local.
import dotenv from "dotenv";

// Importamos la aplicación de Express.
import app from "./src/app.js";

// Importamos la función que conecta
// con MongoDB.
import connectDatabase from "./src/config/database.js";


// Comprobamos si estamos ejecutando
// el backend en producción.
const isProduction =
  process.env.NODE_ENV === "production";


// En desarrollo local cargamos
// las variables desde backend/.env.
//
// En Vercel las variables ya existen
// directamente en process.env.
if (!isProduction) {
  dotenv.config();
}


// Creamos una función para conectar
// la aplicación con MongoDB.
//
// Esto permite reutilizar la conexión
// tanto en local como en Vercel.
const initializeDatabase = async () => {
  try {
    // Intentamos conectar con MongoDB.
    await connectDatabase();

    // Informamos que la conexión
    // se realizó correctamente.
    console.log(
      "Base de datos inicializada correctamente."
    );
  } catch (error) {
    // Mostramos el error sin exponer
    // información sensible.
    console.error(
      "No se pudo conectar con MongoDB:",
      error.message
    );

    // Propagamos el error para que
    // Vercel pueda manejar correctamente
    // el fallo de inicialización.
    throw error;
  }
};


// Inicializamos la conexión
// con MongoDB.
await initializeDatabase();


// Si NO estamos en producción,
// iniciamos el servidor localmente.
if (!isProduction) {
  // Definimos el puerto local.
  const PORT =
    process.env.PORT || 5000;


  // Iniciamos Express en localhost.
  app.listen(
    PORT,
    () => {
      console.log(
        `Servidor de El Ancla funcionando en http://localhost:${PORT}`
      );
    }
  );
}


// Exportamos la aplicación Express.
//
// Vercel utiliza este export para
// ejecutar el backend como servicio.
export default app;