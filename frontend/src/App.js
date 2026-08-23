// Importamos las herramientas necesarias para crear las rutas.
import { BrowserRouter, Route, Routes } from "react-router-dom";

// Importamos el pie de página que estará presente en todo el sitio.
import Footer from "./components/public/Footer";

// Importamos las páginas públicas.
import Home from "./pages/public/Home";
import About from "./pages/public/About";
import Contact from "./pages/public/Contact";
import Events from "./pages/public/Events";
import Recommendations from "./pages/public/Recommendations";
import Resources from "./pages/public/Resources";
import BibleStudies from "./pages/public/resources/BibleStudies";
import PersonalDevotionalGuide from "./pages/public/resources/PersonalDevotionalGuide";
import BibleStudyTools from "./pages/public/resources/BibleStudyTools";
import OldTestamentBooks from "./pages/public/resources/OldTestamentBooks";
import NewTestamentBooks from "./pages/public/resources/NewTestamentBooks";
import BibleBookDetails from "./pages/public/resources/BibleBookDetails";
import PrayerGuides from "./pages/public/resources/PrayerGuides";
import PrayerGuideDetails from "./pages/public/resources/PrayerGuideDetails";
import DiscipleshipMaterials from "./pages/public/resources/DiscipleshipMaterials";
import DiscipleshipMaterialDetails from "./pages/public/resources/DiscipleshipMaterialDetails";
import FrequentlyAskedQuestions from "./pages/public/resources/FrequentlyAskedQuestions";
import DownloadableMaterials from "./pages/public/resources/DownloadableMaterials";
import DownloadableMaterialDetails from "./pages/public/resources/DownloadableMaterialDetails";


// Importamos las páginas de usuarios registrados.


// Importamos las páginas del administrador.

// Importamos la página de gestión de gastos financieros.
import ExpenseManagement from "./pages/admin/ExpenseManagement";


// Importamos la página 404.
import NotFound from "./pages/public/NotFound";


// Creamos el componente principal.
function App() {

  // Retornamos el sistema de rutas y el Footer general.
  return (

    // BrowserRouter permite que React controle la navegación del sitio.
    <BrowserRouter>

      {/* Contenedor general de la aplicación. */}
      <div className="app">

        {/* Routes mostrará solamente la página asociada a la URL actual. */}
        <Routes>

          {/* ================================================= */}
          {/* RUTAS PÚBLICAS */}
          {/* ================================================= */}

          {/* Ruta correspondiente a la página principal. */}
          <Route
            path="/"
            element={<Home />}
          />

          {/* Ruta correspondiente a la página Nosotros. */}
          <Route
            path="/nosotros"
            element={<About />}
          />

          {/* Ruta correspondiente a la página de contacto. */}
          <Route
            path="/contacto"
            element={<Contact />}
          />

          {/* Ruta correspondiente a eventos y actividades. */}
          <Route
            path="/eventos"
            element={<Events />}
          />

          {/* Ruta correspondiente a los contenidos recomendados. */}
          <Route
            path="/recomendados"
            element={<Recommendations />}
          />

          {/* Ruta principal de recursos. */}
          <Route
            path="/recursos"
            element={<Resources />}
          />

          {/* Ruta correspondiente a estudios bíblicos. */}
          <Route
            path="/recursos/estudios"
            element={<BibleStudies />}
          />

          {/* Ruta correspondiente a la guía devocional personal. */}
          <Route
            path="/recursos/devocional"
            element={<PersonalDevotionalGuide />}
          />

          {/* Ruta principal de Biblia y herramientas de estudio. */}
          <Route
            path="/recursos/biblia"
            element={<BibleStudyTools />}
          />

          {/* Ruta que muestra todos los libros del Antiguo Testamento. */}
          <Route
            path="/recursos/biblia/libros/antiguo-testamento"
            element={<OldTestamentBooks />}
          />

          {/* Ruta que muestra todos los libros del Nuevo Testamento. */}
          <Route
            path="/recursos/biblia/libros/nuevo-testamento"
            element={<NewTestamentBooks />}
          />

          {/* Ruta reutilizable para mostrar el detalle de un libro bíblico. */}
          <Route
            path="/recursos/biblia/libro/:slug"
            element={<BibleBookDetails />}
          />

          {/* Ruta correspondiente a las guías de oración. */}
          <Route
            path="/recursos/guias-oracion"
            element={<PrayerGuides />}
          />

          {/* Ruta reutilizable para mostrar una guía de oración específica. */}
          <Route
            path="/recursos/guias-oracion/:slug"
            element={<PrayerGuideDetails />}
          />

          {/* Ruta correspondiente a los materiales de discipulado. */}
          <Route
            path="/recursos/discipulado"
            element={<DiscipleshipMaterials />}
          />

          {/* Ruta reutilizable para mostrar un material de discipulado. */}
          <Route
            path="/recursos/discipulado/:slug"
            element={<DiscipleshipMaterialDetails />}
          />

          {/* Ruta correspondiente a las preguntas frecuentes. */}
          <Route
            path="/recursos/preguntas-frecuentes"
            element={<FrequentlyAskedQuestions />}
          />

          {/* Ruta correspondiente a los materiales descargables. */}
          <Route
            path="/recursos/material-descargable"
            element={<DownloadableMaterials />}
          />

          {/* Ruta reutilizable para mostrar el detalle
              de un material descargable. */}
          <Route
            path="/recursos/material-descargable/:slug"
            element={<DownloadableMaterialDetails />}
          />


          {/* ================================================= */}
          {/* RUTAS DE USUARIOS REGISTRADOS */}
          {/* ================================================= */}



          {/* ================================================= */}
          {/* RUTAS DEL ADMINISTRADOR */}
          {/* ================================================= */}

          {/* Ruta correspondiente a la gestión administrativa
              de los gastos financieros de la iglesia. */}
          <Route
            path="/admin/finanzas/gastos"
            element={<ExpenseManagement />}
          />


          {/* ================================================= */}
          {/* RUTA 404 */}
          {/* ================================================= */}

          {/* Cualquier ruta inexistente mostrará la página 404. */}
          <Route
            path="*"
            element={<NotFound />}
          />

        </Routes>

        {/* Footer visible en todas las páginas de la aplicación. */}
        <Footer />

      </div>

    </BrowserRouter>
  );
}


// Exportamos la aplicación.
export default App;