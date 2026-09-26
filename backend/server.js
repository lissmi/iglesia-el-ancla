// Importamos dotenv para cargar
// las variables del archivo .env
// cuando trabajamos de forma local.
import dotenv from "dotenv";

// Importamos la aplicación de Express.
import app from "./src/app.js";

// Importamos la función que conecta con MongoDB.
import connectDatabase from "./src/config/database.js";


// Verificamos si estamos ejecutando
// el backend en producción.
const isProduction =
  process.env.NODE_ENV === "production";


// Si NO estamos en producción,
// cargamos las variables desde backend/.env.
//
// En Vercel no necesitamos un archivo .env físico,
// porque las variables están configuradas
// directamente en la plataforma.
if (!isProduction) {
  dotenv.config();
}


// Definimos el puerto del servidor.
//
// En desarrollo local, si no existe PORT,
// utilizamos el puerto 5000.
//
// En Vercel, la plataforma puede asignar
// el puerto automáticamente.
const PORT =
  process.env.PORT || 5000;


// Creamos la función principal
// encargada de iniciar el backend.
const startServer = async () => {
  try {
    // Primero establecemos
    // la conexión con MongoDB.
    await connectDatabase();


    // Iniciamos Express únicamente
    // si MongoDB se conectó correctamente.
    app.listen(PORT, () => {
      // Si estamos trabajando localmente,
      // mostramos la dirección completa.
      if (!isProduction) {
        console.log(
          `Servidor de El Ancla funcionando en http://localhost:${PORT}`
        );
      } else {
        // En producción mostramos un mensaje
        // más general, ya que la URL real
        // la administra Vercel.
        console.log(
          `Servidor de El Ancla funcionando en producción en el puerto ${PORT}`
        );
      }
    });

  } catch (error) {
    // Mostramos un mensaje controlado
    // si el servidor no puede iniciarse.
    console.error(
      "No se pudo iniciar el servidor:",
      error.message
    );


    // Cerramos el proceso indicando
    // que ocurrió un error.
    process.exit(1);
  }
};


// Ejecutamos la función principal.
startServer();