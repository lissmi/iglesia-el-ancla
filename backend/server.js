// Cargamos las variables de entorno
// antes de iniciar el resto del backend.
import "./src/config/env.js";

// Importamos la aplicación de Express.
import app from "./src/app.js";

// Importamos la función que conecta con MongoDB.
import connectDatabase from "./src/config/database.js";


// Definimos el puerto del servidor.
//
// Si no existe PORT en el archivo .env,
// utilizamos el puerto 5000.
const PORT = process.env.PORT || 5000;


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

      // Mostramos la dirección local.
      console.log(
        `Servidor de El Ancla funcionando en http://localhost:${PORT}`
      );
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