
import {
  BrowserRouter,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";

// =========================================================
// COMPONENTES DEL SITIO PÚBLICO
// =========================================================

import Header from "./components/public/Header";
import Footer from "./components/public/Footer";
import GlobalBackButton from "./components/public/GlobalBackButton";

// =========================================================
// PROTECCIÓN DE RUTAS
// =========================================================

// Comprueba la sesión y los roles autorizados.
// Esta protección se conserva para cada tipo de usuario.

import ProtectedRoute from "./components/auth/ProtectedRoute";

// =========================================================
// LAYOUT ADMINISTRATIVO COMPARTIDO
// =========================================================

import AdminLayout from "./components/administration/layout/AdminLayout";

// =========================================================
// RUTAS ADMINISTRATIVAS COMPARTIDAS
// =========================================================

// Centraliza los módulos que pueden utilizar
// tanto admin como super_admin.

import SharedAdminRoutes from "./routes/SharedAdminRoutes";


// =========================================================
// PÁGINAS PÚBLICAS
// =========================================================

import Home from "./pages/public/Home";
import About from "./pages/public/About";
import Contact from "./pages/public/Contact";
import Events from "./pages/public/Events";
import TermsAndConditions from "./pages/public/TermsAndConditions";
import PrivacyPolicy from "./pages/public/PrivacyPolicy";
import Recommendations from "./pages/public/Recommendations";
import Resources from "./pages/public/Resources";


// =========================================================
// PÁGINAS DE RECURSOS
// =========================================================

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


// =========================================================
// LOGIN PÚBLICO
// =========================================================

import Login from "./pages/public/Login";

// Página compartida para cambiar la contraseña de la propia cuenta.
import ChangePassword from "./pages/auth/ChangePassword";



// =========================================================
// PÁGINAS DE MIEMBROS REGISTRADOS
// =========================================================

import MemberDashboard from "./pages/member/MemberDashboard";
import MemberEvents from "./pages/member/MemberEvents";
import MemberPrayerRequests from "./pages/member/MemberPrayerRequests";
import FinanceOverview from "./pages/administration/FinanceOverview";

// =========================================================
// PÁGINAS DEL ADMINISTRADOR NORMAL
// =========================================================

import AdminHome from "./pages/admin/AdminHome";

// =========================================================
// PÁGINAS DEL SUPERADMINISTRADOR
// =========================================================

import SuperAdminHome from "./pages/super-admin/SuperAdminHome";
import AdministratorsManagement from "./pages/super-admin/system/AdministratorsManagement";
import RolesPermissions from "./pages/super-admin/system/RolesPermissions";
import SystemSettings from "./pages/super-admin/system/SystemSettings";

// =========================================================
// OTROS MÓDULOS ADMINISTRATIVOS
// =========================================================

// Conservamos la ruta actual de gastos.



// =========================================================
// PÁGINA 404
// =========================================================

import NotFound from "./pages/public/NotFound";

// =========================================================
// LAYOUT PÚBLICO
// =========================================================

// Estructura utilizada por las páginas públicas.
//
// Header: encabezado.
// Outlet: página seleccionada.
// Footer: pie de página.

function PublicLayout() {
  return (
    <>
      <Header />

      {/* Navegación global entre páginas públicas. */}
      <GlobalBackButton />

      <main>
        <Outlet />
      </main>

      <Footer />
    </>
  );
}

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>

          {/* ============================================= */}
          {/* RUTAS PÚBLICAS */}
          {/* ============================================= */}

          <Route element={<PublicLayout />}>

            <Route
              path="/"
              element={<Home />}
            />

            <Route
              path="/nosotros"
              element={<About />}
            />

            <Route
              path="/contacto"
              element={<Contact />}
            />

            <Route
              path="/eventos"
              element={<Events />}
            />

            <Route
              path="/terminos-y-condiciones"
              element={<TermsAndConditions />}
            />

            <Route
              path="/politica-de-privacidad"
              element={<PrivacyPolicy />}
            />

            <Route
              path="/recomendados"
              element={<Recommendations />}
            />

            <Route
              path="/recursos"
              element={<Resources />}
            />

            {/* ========================================= */}
            {/* RECURSOS BÍBLICOS */}
            {/* ========================================= */}

            <Route
              path="/recursos/estudios"
              element={<BibleStudies />}
            />

            <Route
              path="/recursos/devocional"
              element={<PersonalDevotionalGuide />}
            />

            <Route
              path="/recursos/biblia"
              element={<BibleStudyTools />}
            />

            <Route
              path="/recursos/biblia/libros/antiguo-testamento"
              element={<OldTestamentBooks />}
            />

            <Route
              path="/recursos/biblia/libros/nuevo-testamento"
              element={<NewTestamentBooks />}
            />

            <Route
              path="/recursos/biblia/libro/:slug"
              element={<BibleBookDetails />}
            />

            <Route
              path="/recursos/guias-oracion"
              element={<PrayerGuides />}
            />

            <Route
              path="/recursos/guias-oracion/:slug"
              element={<PrayerGuideDetails />}
            />

            <Route
              path="/recursos/discipulado"
              element={<DiscipleshipMaterials />}
            />

            <Route
              path="/recursos/discipulado/:slug"
              element={<DiscipleshipMaterialDetails />}
            />

            <Route
              path="/recursos/preguntas-frecuentes"
              element={<FrequentlyAskedQuestions />}
            />

            <Route
              path="/recursos/material-descargable"
              element={<DownloadableMaterials />}
            />

            <Route
              path="/recursos/material-descargable/:slug"
              element={<DownloadableMaterialDetails />}
            />

          </Route>

          {/* ============================================= */}
          {/* LOGIN PÚBLICO */}
          {/* ============================================= */}

          {/* No utiliza PublicLayout. */}

          <Route
            path="/login"
            element={<Login />}
          />


          {/* ============================================= */}
          {/* RUTAS PROTEGIDAS - ESPACIO PERSONAL */}
          {/* ============================================= */}

          {/* Los miembros y administradores pueden acceder
    a las funciones de participación. */}

          <Route
            element={
              <ProtectedRoute
                allowedRoles={["member", "admin", "super_admin"]}
              />
            }
          >
            {/* ============================================= */}
            {/* CAMBIO DE CONTRASEÑA PERSONAL */}
            {/* ============================================= */}

            {/* La misma página sirve para miembros,
                administradores y superadministradores.
                ProtectedRoute exige una sesión válida. */}
            <Route
              path="/cambiar-contrasena"
              element={<ChangePassword />}
            />

            {/* ============================================= */}
            {/* ESPACIO PERSONAL DE LA COMUNIDAD */}
            {/* ============================================= */}

            {/* Los miembros, administradores y superadministradores
    pueden acceder a su espacio personal. */}

            <Route
              path="/member"
              element={
                <ProtectedRoute
                  allowedRoles={["member", "admin", "super_admin"]}
                />
              }
            >
              <Route
                index
                element={<MemberDashboard />}
              />
            </Route>

            {/* =========================================== */}
            {/* ACTIVIDADES PERSONALES */}
            {/* =========================================== */}

            <Route
              path="/member/eventos"
              element={<MemberEvents />}
            />

            {/* =========================================== */}
            {/* PETICIONES DE ORACIÓN */}
            {/* =========================================== */}

            <Route
              path="/member/peticiones-oracion"
              element={<MemberPrayerRequests />}
            />

            {/* =========================================== */}
            {/* RESUMEN FINANCIERO DE LA COMUNIDAD */}
            {/* =========================================== */}

            {/* Disponible para miembros, administradores
    y superadministradores. */}

            <Route
              path="/member/finanzas"
              element={<FinanceOverview />}
            />

          </Route>


          {/* ============================================= */}
          {/* RUTAS PROTEGIDAS - ADMINISTRADOR */}
          {/* ============================================= */}

          {/* Acceso exclusivo al rol admin. */}

          <Route
            element={
              <ProtectedRoute
                allowedRoles={["admin"]}
              />
            }
          >

            <Route
              path="/admin"
              element={<AdminLayout />}
            >

              {/* Página principal del administrador */}

              <Route
                index
                element={<AdminHome />}
              />

              {/* ===================================== */}
              {/* RUTAS ADMINISTRATIVAS COMPARTIDAS */}
              {/* ===================================== */}

              {/* Se reutilizan las mismas páginas
                  y componentes administrativos. */}

              {SharedAdminRoutes()}

              {/* Aquí agregaremos módulos exclusivos
                  del administrador normal si fuera
                  necesario en el futuro. */}

            </Route>

          </Route>

          {/* ============================================= */}
          {/* RUTAS PROTEGIDAS - SUPERADMINISTRADOR */}
          {/* ============================================= */}

          {/* Acceso exclusivo al rol super_admin. */}

          <Route
            element={
              <ProtectedRoute
                allowedRoles={["super_admin"]}
              />
            }
          >

            <Route
              path="/super-admin"
              element={<AdminLayout />}
            >

              {/* ===================================== */}
              {/* INICIO DEL SUPERADMINISTRADOR */}
              {/* ===================================== */}

              <Route
                index
                element={<SuperAdminHome />}
              />

              {/* ===================================== */}
              {/* RUTAS ADMINISTRATIVAS COMPARTIDAS */}
              {/* ===================================== */}

              {/* Mismas definiciones utilizadas
                  por el administrador normal. */}

              {SharedAdminRoutes()}

              {/* ===================================== */}
              {/* GESTIÓN DE GASTOS */}
              {/* ===================================== */}

              {/* Conservamos su ubicación actual. */}

              {/* ===================================== */}
              {/* MÓDULOS EXCLUSIVOS DE SUPER_ADMIN */}
              {/* ===================================== */}

              <Route
                path="sistema/administradores"
                element={<AdministratorsManagement />}
              />

              <Route
                path="sistema/roles-permisos"
                element={<RolesPermissions />}
              />

              <Route
                path="sistema/configuracion"
                element={<SystemSettings />}
              />


            </Route>

          </Route>

          {/* ============================================= */}
          {/* RUTA 404 */}
          {/* ============================================= */}

          <Route
            path="*"
            element={<NotFound />}
          />

        </Routes>
      </div>
    </BrowserRouter>
  );
}

// =========================================================
// EXPORTACIÓN
// =========================================================

export default App;
