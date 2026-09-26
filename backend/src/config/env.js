// Importamos dotenv para cargar
// las variables de entorno.
import dotenv from "dotenv";

// Importamos path para construir
// una ruta compatible con distintos sistemas.
import path from "node:path";

// Importamos fileURLToPath para conocer
// la ubicación real de este archivo.
import {
  fileURLToPath,
} from "node:url";


// Obtenemos la ruta completa
// del archivo env.js.
const __filename = fileURLToPath(
  import.meta.url
);


// Obtenemos la carpeta config.
const __dirname = path.dirname(
  __filename
);


// Cargamos el archivo .env ubicado
// en la raíz de backend.
const environmentResult = dotenv.config({
  path: path.resolve(
    __dirname,
    "../../.env"
  ),
});


// Si el archivo no puede cargarse,
// detenemos el inicio del backend.
if (environmentResult.error) {
  throw new Error(
    `No se pudo cargar el archivo .env: ${environmentResult.error.message}`
  );
}