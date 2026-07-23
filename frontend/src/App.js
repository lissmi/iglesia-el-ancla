// Importamos las herramientas necesarias para crear las rutas.
import { BrowserRouter, Route, Routes } from "react-router-dom";

// Importamos la páginas públicas
import Home from "./pages/public/Home";
import About from "./pages/public/About";

// Importamos la páginas de usuarios registrados


// Importamos la páginas del admin


// Importamos la página 404
import NotFound from "./pages/public/NotFound";

// Creamos el componente principal.
function App() {
  // Retornamos el sistema de rutas de la aplicación.
  return (
    <BrowserRouter>
      {/* Agrupamos todas las rutas disponibles. */}
      <Routes>
        {/* Ruta correspondiente a página públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/nosotros" element={<About />} />

        {/* Ruta correspondiente a páginas de usuario registrado */}

        {/* Ruta correspondiente a páginas del admin */}

        {/* Cualquier ruta inexistente mostrará la página 404. */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

// Exportamos la aplicación.
export default App;