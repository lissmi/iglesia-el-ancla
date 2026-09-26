//frontend/src/App.js

// Importamos las herramientas necesarias
// para crear y organizar las rutas.
import {
  BrowserRouter,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";


// =========================================================
// COMPONENTES DEL SITIO PÚBLICO
// =========================================================

// Importamos el encabezado
// utilizado solamente en el sitio público.
import Header from "./components/public/Header";


// Importamos el pie de página
// utilizado solamente en el sitio público.
import Footer from "./components/public/Footer";


// =========================================================
// PROTECCIÓN DE RUTAS
// =========================================================

// Importamos el componente encargado
// de comprobar:
//
// - La existencia de una sesión válida.
// - El usuario autenticado.
// - El rol autorizado para cada área.
import ProtectedRoute from "./components/auth/ProtectedRoute";


// =========================================================
// LAYOUT DEL SUPER ADMINISTRADOR
// =========================================================

// Importamos el layout administrativo
// utilizado por la sesión del super administrador.
//
// Este layout contiene elementos compartidos
// como:
//
// - Sidebar.
// - Header.
// - Área de contenido.
import AdminLayout from "./components/super-admin/layout/AdminLayout";


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


// Importamos la página
// de contenidos recomendados.
import Recommendations from "./pages/public/Recommendations";


// Importamos la página principal
// de recursos.
import Resources from "./pages/public/Resources";


// Importamos la página
// de estudios bíblicos.
import BibleStudies from "./pages/public/resources/BibleStudies";


// Importamos la guía
// devocional personal.
import PersonalDevotionalGuide from "./pages/public/resources/PersonalDevotionalGuide";


// Importamos la página de herramientas
// de estudio bíblico.
import BibleStudyTools from "./pages/public/resources/BibleStudyTools";


// Importamos la página de libros
// del Antiguo Testamento.
import OldTestamentBooks from "./pages/public/resources/OldTestamentBooks";


// Importamos la página de libros
// del Nuevo Testamento.
import NewTestamentBooks from "./pages/public/resources/NewTestamentBooks";


// Importamos la página reutilizable
// para mostrar el detalle
// de un libro bíblico.
import BibleBookDetails from "./pages/public/resources/BibleBookDetails";


// Importamos la página
// de guías de oración.
import PrayerGuides from "./pages/public/resources/PrayerGuides";


// Importamos la página reutilizable
// para mostrar el detalle
// de una guía.
import PrayerGuideDetails from "./pages/public/resources/PrayerGuideDetails";


// Importamos la página
// de materiales de discipulado.
import DiscipleshipMaterials from "./pages/public/resources/DiscipleshipMaterials";


// Importamos la página reutilizable
// para mostrar un material
// de discipulado.
import DiscipleshipMaterialDetails from "./pages/public/resources/DiscipleshipMaterialDetails";


// Importamos la página
// de preguntas frecuentes.
import FrequentlyAskedQuestions from "./pages/public/resources/FrequentlyAskedQuestions";


// Importamos la página
// de materiales descargables.
import DownloadableMaterials from "./pages/public/resources/DownloadableMaterials";


// Importamos la página reutilizable
// para mostrar un material descargable.
import DownloadableMaterialDetails from "./pages/public/resources/DownloadableMaterialDetails";


// Importamos la página pública
// de inicio de sesión.
import Login from "./pages/public/Login";


// =========================================================
// PÁGINAS DE MIEMBROS REGISTRADOS
// =========================================================

// Importamos el panel principal
// de los miembros registrados.
//
// Esta página será utilizada
// por usuarios con rol "member".
import MemberDashboard from "./pages/member/MemberDashboard";


// =========================================================
// PÁGINAS DEL ADMINISTRADOR
// =========================================================

// Importamos la página principal
// del administrador.
//
// Esta página será utilizada
// por usuarios con rol "admin".
import AdminHome from "./pages/admin/AdminHome";


// =========================================================
// PÁGINAS DEL SUPER ADMINISTRADOR
// =========================================================

// Importamos la página principal
// del super administrador.
//
// Esta página reúne:
//
// - Funciones personales como miembro.
// - Herramientas administrativas.
// - Funciones exclusivas del super administrador.
import SuperAdminHome from "./pages/super-admin/SuperAdminHome";


// Importamos la página
// de gestión de gastos.
import ExpenseManagement from "./pages/super-admin/ExpenseManagement";


// =========================================================
// PÁGINA 404
// =========================================================

// Importamos la página que se mostrará
// cuando una ruta no exista.
import NotFound from "./pages/public/NotFound";


// =========================================================
// LAYOUT PÚBLICO
// =========================================================

// Creamos la estructura compartida
// por todas las páginas públicas.
function PublicLayout() {

  // Retornamos la estructura
  // completa del sitio público.
  return (
    <>

      {/* Mostramos el encabezado
          en todas las páginas públicas. */}
      <Header />


      {/* Outlet mostrará la página
          correspondiente según
          la dirección visitada. */}
      <main>
        <Outlet />
      </main>


      {/* Mostramos el pie de página
          en todas las páginas públicas. */}
      <Footer />

    </>
  );
}


// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

// Creamos el componente principal
// de la aplicación.
function App() {

  // Retornamos todo
  // el sistema de rutas.
  return (

    // BrowserRouter permite que React
    // controle la navegación
    // sin recargar completamente el sitio.
    <BrowserRouter>

      {/* Creamos el contenedor
          general de la aplicación. */}
      <div className="app">

        {/* Routes mostrará únicamente
            la página asociada
            a la URL actual. */}
        <Routes>


          {/* ================================================= */}
          {/* RUTAS PÚBLICAS */}
          {/* ================================================= */}

          {/* Todas estas rutas
              utilizan PublicLayout. */}
          <Route
            element={
              <PublicLayout />
            }
          >


            {/* Página principal pública. */}
            <Route
              path="/"
              element={
                <Home />
              }
            />


            {/* Página Nosotros. */}
            <Route
              path="/nosotros"
              element={
                <About />
              }
            />


            {/* Página de contacto. */}
            <Route
              path="/contacto"
              element={
                <Contact />
              }
            />


            {/* Página de eventos
                y actividades. */}
            <Route
              path="/eventos"
              element={
                <Events />
              }
            />


            {/* Página de contenidos
                recomendados. */}
            <Route
              path="/recomendados"
              element={
                <Recommendations />
              }
            />


            {/* Página principal
                de recursos. */}
            <Route
              path="/recursos"
              element={
                <Resources />
              }
            />


            {/* Estudios bíblicos. */}
            <Route
              path="/recursos/estudios"
              element={
                <BibleStudies />
              }
            />


            {/* Guía devocional personal. */}
            <Route
              path="/recursos/devocional"
              element={
                <PersonalDevotionalGuide />
              }
            />


            {/* Biblia y herramientas
                de estudio. */}
            <Route
              path="/recursos/biblia"
              element={
                <BibleStudyTools />
              }
            />


            {/* Libros del
                Antiguo Testamento. */}
            <Route
              path="/recursos/biblia/libros/antiguo-testamento"
              element={
                <OldTestamentBooks />
              }
            />


            {/* Libros del
                Nuevo Testamento. */}
            <Route
              path="/recursos/biblia/libros/nuevo-testamento"
              element={
                <NewTestamentBooks />
              }
            />


            {/* Detalle reutilizable
                de un libro bíblico. */}
            <Route
              path="/recursos/biblia/libro/:slug"
              element={
                <BibleBookDetails />
              }
            />


            {/* Guías de oración. */}
            <Route
              path="/recursos/guias-oracion"
              element={
                <PrayerGuides />
              }
            />


            {/* Detalle de una
                guía de oración. */}
            <Route
              path="/recursos/guias-oracion/:slug"
              element={
                <PrayerGuideDetails />
              }
            />


            {/* Materiales
                de discipulado. */}
            <Route
              path="/recursos/discipulado"
              element={
                <DiscipleshipMaterials />
              }
            />


            {/* Detalle de material
                de discipulado. */}
            <Route
              path="/recursos/discipulado/:slug"
              element={
                <DiscipleshipMaterialDetails />
              }
            />


            {/* Preguntas frecuentes. */}
            <Route
              path="/recursos/preguntas-frecuentes"
              element={
                <FrequentlyAskedQuestions />
              }
            />


            {/* Materiales descargables. */}
            <Route
              path="/recursos/material-descargable"
              element={
                <DownloadableMaterials />
              }
            />


            {/* Detalle de material
                descargable. */}
            <Route
              path="/recursos/material-descargable/:slug"
              element={
                <DownloadableMaterialDetails />
              }
            />


          </Route>


          {/* ================================================= */}
          {/* LOGIN */}
          {/* ================================================= */}

          {/* Login permanece fuera
              del layout público.

              De esta forma conserva
              su diseño independiente. */}
          <Route
            path="/login"
            element={
              <Login />
            }
          />


          {/* ================================================= */}
          {/* RUTAS PROTEGIDAS - MIEMBRO */}
          {/* ================================================= */}

          {/*
            ProtectedRoute consultará:

            GET /api/auth/me

            y solamente permitirá continuar
            si la cuenta autenticada posee:

            role === "member"
          */}
          <Route
            element={
              <ProtectedRoute
                allowedRoles={[
                  "member",
                ]}
              />
            }
          >

            {/* Página principal
                del miembro registrado. */}
            <Route
              path="/member"
              element={
                <MemberDashboard />
              }
            />

          </Route>


          {/* ================================================= */}
          {/* RUTAS PROTEGIDAS - ADMINISTRADOR */}
          {/* ================================================= */}

          {/*
            Esta sección solamente
            puede ser utilizada
            por cuentas con rol:

            admin
          */}
          <Route
            element={
              <ProtectedRoute
                allowedRoles={[
                  "admin",
                ]}
              />
            }
          >

            {/* Página principal
                del administrador. */}
            <Route
              path="/admin"
              element={
                <AdminHome />
              }
            />

          </Route>


          {/* ================================================= */}
          {/* RUTAS PROTEGIDAS - SUPER ADMINISTRADOR */}
          {/* ================================================= */}

          {/*
            Esta sección solamente
            puede ser utilizada
            por cuentas con rol:

            super_admin

            Primero ProtectedRoute comprueba
            la sesión y el rol.

            Después AdminLayout crea
            el sidebar y el header.

            Finalmente Outlet muestra
            la página interna correspondiente.
          */}
          <Route
            element={
              <ProtectedRoute
                allowedRoles={[
                  "super_admin",
                ]}
              />
            }
          >

            <Route
              path="/super-admin"
              element={
                <AdminLayout />
              }
            >


              {/* Página principal
                  del super administrador. */}
              <Route
                index
                element={
                  <SuperAdminHome />
                }
              />


              {/* Gestión de gastos
                  del super administrador. */}
              <Route
                path="finanzas/gastos"
                element={
                  <ExpenseManagement />
                }
              />


            </Route>

          </Route>


          {/* ================================================= */}
          {/* RUTA 404 */}
          {/* ================================================= */}

          {/* Esta ruta debe permanecer
              siempre al final.

              Si ninguna ruta anterior coincide,
              React mostrará NotFound. */}
          <Route
            path="*"
            element={
              <NotFound />
            }
          />


        </Routes>

      </div>

    </BrowserRouter>
  );
}


// Exportamos la aplicación
// para utilizarla desde index.js.
export default App;