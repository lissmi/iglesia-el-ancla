// Importamos dotenv para cargar las variables de entorno.
import dotenv from "dotenv";

// Importamos path para construir rutas compatibles con Windows, Linux y Vercel.
import path from "node:path";

// Importamos fileURLToPath para obtener la ruta real del archivo actual.
import { fileURLToPath } from "node:url";

// Importamos la aplicación de Express.
import app from "./app.js";

// Importamos la función que conecta con MongoDB.
import connectDatabase from "./config/database.js";

// Obtenemos la ruta completa del archivo server.js.
const __filename = fileURLToPath(import.meta.url);

// Obtenemos la carpeta donde se encuentra server.js.
const __dirname = path.dirname(__filename);

// Cargamos el archivo .env ubicado en la raíz de backend.
dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

// Definimos el puerto del servidor.
// Si no existe PORT en el archivo .env, usamos 5000.
const PORT = process.env.PORT || 5000;

// Función principal para iniciar el backend.
const startServer = async () => {
  try {
    // Primero intentamos conectarnos con MongoDB.
    await connectDatabase();

    // Solo iniciamos Express si la conexión fue exitosa.
    app.listen(PORT, () => {
      // Mostramos un mensaje confirmando que el servidor está funcionando.
      console.log(
        `Servidor de El Ancla funcionando en http://localhost:${PORT}`
      );
    });
  } catch (error) {
    // Mostramos el error si el servidor no puede iniciar.
    console.error("No se pudo iniciar el servidor:", error.message);

    // Cerramos el proceso indicando que ocurrió un error.
    process.exit(1);
  }
};

// Ejecutamos la función que inicia el servidor.
startServer();