// Importamos React para utilizar sus funcionalidades.
import React from "react";

// Importamos ReactDOM para renderizar la aplicación.
import ReactDOM from "react-dom/client";

// Importamos los estilos globales.
import "./index.css";

// Importamos el componente principal.
import App from "./App";

// Buscamos el elemento root dentro de public/index.html.
const rootElement = document.getElementById("root");

// Creamos la raíz principal de React.
const root = ReactDOM.createRoot(rootElement);

// Renderizamos la aplicación.
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);