// Importamos React para utilizar sus funcionalidades.
import React from "react";

// Importamos ReactDOM para renderizar la aplicación.
import ReactDOM from "react-dom/client";

// Importamos los estilos globales.
import "./index.css";

// Importamos el componente principal de la PWA.
import App from "./App";

// Importamos el registro de instalación y servicio offline.
// Conservamos el comportamiento existente de la PWA.
import { registerElAnclaPwa } from "./pwa/registerElAnclaPwa";

// Importamos la firma para la consola del navegador.
// Se mostrará sin importar la ruta en que entre el visitante.
import { showElAnclaConsoleSignature } from "./utils/consoleSignature";

// Buscamos el elemento principal de React en public/index.html.
const rootElement = document.getElementById("root");

// Creamos la raíz principal de React.
const root = ReactDOM.createRoot(rootElement);

// Renderizamos la aplicación usando StrictMode.
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Habilitamos el manifiesto y la instalación de la PWA.
// El Service Worker se registra en compilaciones de producción.
registerElAnclaPwa();

// Mostramos la firma una vez cada vez que se carga la aplicación.
// No depende de /login, /member, /admin ni de otras rutas.
showElAnclaConsoleSignature();
