// Importamos las herramientas necesarias
// para crear y organizar las rutas.
import {
  BrowserRouter,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";


// Importamos el pie de página
// utilizado solamente en el sitio público.
import Footer from "./components/public/Footer";


// Importamos el layout general
// utilizado por todas las páginas administrativas.
import AdminLayout from "./components/admin/layout/AdminLayout";


// =========================================================
// PÁGINAS PÚBLICAS
// =========================================================

// Importamos la página principal.
import Home from "./pages/public/Home";

// Importamos la página Nosotros.
import About from "./pages/public/About";

// Importamos la página de contacto.
import Contact from "./pages/public/Contact";

// Importamos la página de eventos.
import Events from "./pages/public/Events";

// Importamos la página de contenidos recomendados.
import Recommendations from "./pages/public/Recommendations";

// Importamos la página principal de recursos.
import Resources from "./pages/public/Resources";

// Importamos la página de estudios bíblicos.
import BibleStudies from "./pages/public/resources/BibleStudies";

// Importamos la guía devocional personal.
import PersonalDevotionalGuide from "./pages/public/resources/PersonalDevotionalGuide";

// Importamos la página de herramientas de estudio bíblico.
import BibleStudyTools from "./pages/public/resources/BibleStudyTools";

// Importamos la página de libros del Antiguo Testamento.
import OldTestamentBooks from "./pages/public/resources/OldTestamentBooks";

// Importamos la página de libros del Nuevo Testamento.
import NewTestamentBooks from "./pages/public/resources/NewTestamentBooks";

// Importamos la página reutilizable
// para mostrar el detalle de un libro bíblico.
import BibleBookDetails from "./pages/public/resources/BibleBookDetails";

// Importamos la página de guías de oración.
import PrayerGuides from "./pages/public/resources/PrayerGuides";

// Importamos la página reutilizable
// para mostrar el detalle de una guía.
import PrayerGuideDetails from "./pages/public/resources/PrayerGuideDetails";

// Importamos la página de materiales de discipulado.
import DiscipleshipMaterials from "./pages/public/resources/DiscipleshipMaterials";

// Importamos la página reutilizable
// para mostrar un material de discipulado.
import DiscipleshipMaterialDetails from "./pages/public/resources/DiscipleshipMaterialDetails";

// Importamos la página de preguntas frecuentes.
import FrequentlyAskedQuestions from "./pages/public/resources/FrequentlyAskedQuestions";

// Importamos la página de materiales descargables.
import DownloadableMaterials from "./pages/public/resources/DownloadableMaterials";

// Importamos la página reutilizable
// para mostrar un material descargable.
import DownloadableMaterialDetails from "./pages/public/resources/DownloadableMaterialDetails";


// =========================================================
// PÁGINAS DE USUARIOS REGISTRADOS
// =========================================================

// Más adelante importaremos aquí
// las páginas destinadas a los miembros registrados.


// =========================================================
// PÁGINAS ADMINISTRATIVAS
// =========================================================

// Importamos la página principal del administrador.
import AdminDashboard from "./pages/admin/AdminDashboard";

// Importamos la página de gestión de gastos.
import ExpenseManagement from "./pages/admin/ExpenseManagement";


// =========================================================
// PÁGINA 404
// =========================================================

// Importamos la página que se mostrará
// cuando una ruta pública no exista.
import NotFound from "./pages/public/NotFound";


// =========================================================
// LAYOUT PÚBLICO
// =========================================================

// Creamos una estructura sencilla para las páginas públicas.
//
// Outlet mostrará la página pública seleccionada.
// Footer aparecerá debajo de todas las páginas públicas.
function PublicLayout() {

  // Retornamos la estructura pública.
  return (
    <>

      {/* Mostramos la página pública correspondiente. */}
      <Outlet />

      {/* Mostramos el pie de página público. */}
      <Footer />

    </>
  );
}


// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

// Creamos el componente principal de la aplicación.
function App() {

  // Retornamos todo el sistema de rutas.
  return (

    // BrowserRouter permite que React controle
    // la navegación sin recargar completamente el sitio.
    <BrowserRouter>

      {/* Creamos el contenedor general de la aplicación. */}
      <div className="app">

        {/* Routes mostrará únicamente
            la página asociada a la URL actual. */}
        <Routes>


          {/* ================================================= */}
          {/* RUTAS PÚBLICAS */}
          {/* ================================================= */}

          {/* Todas las rutas contenidas aquí
              utilizarán PublicLayout y mostrarán el Footer. */}
          <Route element={<PublicLayout />}>

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


            {/* Ruta correspondiente
                a los contenidos recomendados. */}
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


            {/* Ruta correspondiente
                a la guía devocional personal. */}
            <Route
              path="/recursos/devocional"
              element={<PersonalDevotionalGuide />}
            />


            {/* Ruta principal de Biblia
                y herramientas de estudio. */}
            <Route
              path="/recursos/biblia"
              element={<BibleStudyTools />}
            />


            {/* Ruta que muestra todos los libros
                del Antiguo Testamento. */}
            <Route
              path="/recursos/biblia/libros/antiguo-testamento"
              element={<OldTestamentBooks />}
            />


            {/* Ruta que muestra todos los libros
                del Nuevo Testamento. */}
            <Route
              path="/recursos/biblia/libros/nuevo-testamento"
              element={<NewTestamentBooks />}
            />


            {/* Ruta reutilizable que muestra
                el detalle de un libro bíblico. */}
            <Route
              path="/recursos/biblia/libro/:slug"
              element={<BibleBookDetails />}
            />


            {/* Ruta correspondiente a las guías de oración. */}
            <Route
              path="/recursos/guias-oracion"
              element={<PrayerGuides />}
            />


            {/* Ruta reutilizable que muestra
                una guía de oración específica. */}
            <Route
              path="/recursos/guias-oracion/:slug"
              element={<PrayerGuideDetails />}
            />


            {/* Ruta correspondiente
                a los materiales de discipulado. */}
            <Route
              path="/recursos/discipulado"
              element={<DiscipleshipMaterials />}
            />


            {/* Ruta reutilizable que muestra
                un material de discipulado. */}
            <Route
              path="/recursos/discipulado/:slug"
              element={<DiscipleshipMaterialDetails />}
            />


            {/* Ruta correspondiente
                a las preguntas frecuentes. */}
            <Route
              path="/recursos/preguntas-frecuentes"
              element={<FrequentlyAskedQuestions />}
            />


            {/* Ruta correspondiente
                a los materiales descargables. */}
            <Route
              path="/recursos/material-descargable"
              element={<DownloadableMaterials />}
            />


            {/* Ruta reutilizable que muestra el detalle
                de un material descargable. */}
            <Route
              path="/recursos/material-descargable/:slug"
              element={<DownloadableMaterialDetails />}
            />


            {/* Cualquier ruta pública inexistente
                mostrará la página 404 y el Footer. */}
            <Route
              path="*"
              element={<NotFound />}
            />

          </Route>


          {/* ================================================= */}
          {/* RUTAS DE USUARIOS REGISTRADOS */}
          {/* ================================================= */}

          {/* Más adelante agregaremos aquí
              el layout y las páginas para miembros. */}


          {/* ================================================= */}
          {/* RUTAS ADMINISTRATIVAS */}
          {/* ================================================= */}

          {/* Todas las rutas administrativas utilizarán
              el sidebar y el encabezado de AdminLayout. */}
          <Route
            path="/admin"
            element={<AdminLayout />}
          >

            {/* La ruta /admin mostrará
                la página principal del administrador. */}
            <Route
              index
              element={<AdminDashboard />}
            />


            {/* La ruta /admin/finanzas/gastos mostrará
                el módulo existente de gestión de gastos. */}
            <Route
              path="finanzas/gastos"
              element={<ExpenseManagement />}
            />

          </Route>

        </Routes>

      </div>

    </BrowserRouter>
  );
}


// Exportamos la aplicación para utilizarla desde index.js.
export default App;