// Importamos Axios para realizar
// solicitudes HTTP al backend.
import axios from "axios";


// Creamos una instancia reutilizable
// para toda la aplicación.
const api = axios.create({
  // Obtenemos la URL desde el .env del frontend.
  //
  // Si no existe, utilizamos el backend local.
  baseURL:
    process.env.REACT_APP_API_URL ||
    "http://localhost:5000/api",

  // Permitimos que el navegador envíe
  // y reciba cookies HttpOnly.
  withCredentials: true,

  // Definimos un tiempo máximo
  // de espera de diez segundos.
  timeout: 10000,

  // Indicamos que enviaremos
  // y recibiremos información JSON.
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});


// Exportamos la instancia para utilizarla
// en login, gastos, eventos y demás módulos.
export default api;
