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
import FirstVisit from "./pages/public/FirstVisit";

// Importamos las páginas de usuarios registrados.

// Importamos las páginas del administrador.

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
          {/* Rutas correspondientes a páginas públicas. */}
          <Route path="/" element={<Home />} />
          <Route path="/nosotros" element={<About />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="/eventos" element={<Events />} />
          <Route path="/recomendados" element={<Recommendations />} />
          <Route path="/recursos" element={<Resources />} />
          <Route path="/recursos/estudios" element={<BibleStudies />} />
          <Route path="/recursos/devocional" element={<PersonalDevotionalGuide />} />
          <Route path="/recursos/biblia" element={<BibleStudyTools />} />
          <Route path="/recursos/biblia/libros/antiguo-testamento" element={<OldTestamentBooks />} />
          <Route path="/recursos/biblia/libros/nuevo-testamento" element={<NewTestamentBooks />} />
          <Route path="/recursos/biblia/libro/:slug" element={<BibleBookDetails />} />
          <Route path="/recursos/guias-oracion" element={<PrayerGuides />} />
          <Route path="/recursos/guias-oracion/:slug" element={<PrayerGuideDetails />} />
          <Route path="/recursos/discipulado" element={<DiscipleshipMaterials />} />
          <Route path="/recursos/discipulado/:slug" element={<DiscipleshipMaterialDetails />} />
          <Route path="/recursos/preguntas-frecuentes" element={<FrequentlyAskedQuestions />} />
          <Route path="/recursos/material-descargable" element={<DownloadableMaterials />} />
          <Route path="/recursos/material-descargable/:slug" element={<DownloadableMaterialDetails />} />
          <Route path="/primera-visita" element={<FirstVisit />} />

          {/* Rutas correspondientes a usuarios registrados. */}

          {/* Rutas correspondientes al administrador. */}

          {/* Cualquier ruta inexistente mostrará la página 404. */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        {/* Footer visible en todas las páginas de la aplicación. */}
        <Footer />
      </div>
    </BrowserRouter>
  );
}

// Exportamos la aplicación.
export default App;