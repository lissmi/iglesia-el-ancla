
import { NotificationsProvider } from "./context/notifications/NotificationsContext";
import MartinWidget from "./components/martin/MartinWidget";
// Control global de lectura asistida, disponible en todas las rutas.
import AccessibilityReader from "./components/accessibility/AccessibilityReader";
// Invitación a instalar la PWA cuando el navegador lo permita.
import PwaInstallBanner from "./components/pwa/PwaInstallBanner";
// Tema visual compartido entre todas las rutas de la PWA.
import { ThemeProvider } from "./context/theme/ThemeContext";
import ThemeSwitcher from "./components/theme/ThemeSwitcher";
// Cargamos las variables y ajustes visuales globales una sola vez.
import "./styles/theme/GlobalTheme.css";


import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

// =========================================================
// LAYOUT COMPARTIDO DEL SITIO PÚBLICO
// =========================================================

// Agrupa el Header dinámico, la navegación pública, las páginas y el Footer.
import PublicLayout from "./components/public/layout/PublicLayout";

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
import Donaciones from "./pages/public/Donaciones";
import DonacionResultado from "./pages/public/DonacionResultado";

// Página donde el nuevo miembro confirma su cuenta.
import ActivateAccount from "./pages/auth/ActivateAccount";

// =========================================================
// LOGIN PÚBLICO
// =========================================================

import Login from "./pages/public/Login";

// Recuperación pública por Gmail, enlazada desde el interior del login.
import ForgotPassword from "./pages/auth/ForgotPassword";

// Página compartida para cambiar la contraseña de la propia cuenta.
import ChangePassword from "./pages/auth/ChangePassword";

// Página reutilizable de edición de datos personales.
import MyAccount from "./pages/account/MyAccount";



// =========================================================
// PÁGINAS DE MIEMBROS REGISTRADOS
// =========================================================

// Encabezado único para cualquier usuario en el área de miembros.
import MemberLayout from "./components/member/layout/MemberLayout";

import MemberDashboard from "./pages/member/MemberDashboard";
import MemberDonations from "./pages/member/MemberDonations";
import MemberActivities from "./pages/member/MemberActivities";
import MemberPrayerRequests from "./pages/member/MemberPrayerRequests";
// Necesidades reales de inventario y colaboración.
import MemberBasicSupplies from "./pages/member/MemberBasicSupplies";
// Página privada para confirmar turnos de servicio.
import MemberVolunteerAssignments from "./pages/member/MemberVolunteerAssignments";

// =========================================================
// CONTENIDOS EXCLUSIVOS DE MIEMBROS REGISTRADOS
// =========================================================

import Recommendations from "./pages/member/Recommendations";
import Resources from "./pages/member/Resources";
import BibleStudies from "./pages/member/resources/BibleStudies";
import PersonalDevotionalGuide from "./pages/member/resources/PersonalDevotionalGuide";
import BibleStudyTools from "./pages/member/resources/BibleStudyTools";
import OldTestamentBooks from "./pages/member/resources/OldTestamentBooks";
import NewTestamentBooks from "./pages/member/resources/NewTestamentBooks";
import BibleBookDetails from "./pages/member/resources/BibleBookDetails";
// Página que presenta un capítulo de nuestra Biblia local.
import BibleReader from "./pages/member/resources/BibleReader";
import PrayerGuides from "./pages/member/resources/PrayerGuides";
import PrayerGuideDetails from "./pages/member/resources/PrayerGuideDetails";
import DiscipleshipMaterials from "./pages/member/resources/DiscipleshipMaterials";
import DiscipleshipMaterialDetails from "./pages/member/resources/DiscipleshipMaterialDetails";
import FrequentlyAskedQuestions from "./pages/member/resources/FrequentlyAskedQuestions";
import DownloadableMaterials from "./pages/member/resources/DownloadableMaterials";
import DownloadableMaterialDetails from "./pages/member/resources/DownloadableMaterialDetails";
import SolidarityLibrary from "./pages/member/resources/SolidarityLibrary";
// Cancionero privado de alabanzas para los tres roles autenticados.
import Songbook from "./pages/member/resources/Songbook";

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
// COMPONENTE PRINCIPAL
// =========================================================

function App() {
  return (
    <ThemeProvider>
    <BrowserRouter>
      {/* Una sola bandeja de notificaciones para toda la navegación. */}
      <NotificationsProvider>
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
              path="/donaciones"
              element={<Donaciones />}
            />

            <Route
              path="/donaciones/resultado"
              element={<DonacionResultado />}
            />

            <Route
              path="/terminos-y-condiciones"
              element={<TermsAndConditions />}
            />

            <Route
              path="/politica-de-privacidad"
              element={<PrivacyPolicy />}
            />

            {/* Login también utiliza Header, navegación y Footer públicos. */}
            <Route
              path="/login"
              element={<Login />}
            />

            {/* Recuperación por Gmail disponible sin iniciar sesión. */}
            <Route path="/recuperar-contrasena" element={<ForgotPassword />} />

            {/* Activación por invitación, disponible sin iniciar sesión. */}
            <Route
              path="/activar-cuenta"
              element={<ActivateAccount />}
            />

            {/* Recursos y Recomendados ya no son públicos.
                Están definidos bajo /member y protegidos por sesión. */}

          </Route>

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

            {/* Todas estas rutas heredan la validación de sesión
                y roles del ProtectedRoute padre. */}
            <Route path="/member" element={<MemberLayout />}>

              {/* Inicio del espacio personal. */}
              <Route index element={<MemberDashboard />} />

              {/* Recomendaciones exclusivas de miembros registrados. */}
              <Route path="recomendados" element={<Recommendations />} />

              {/* Recursos exclusivos de miembros registrados. */}
              <Route path="recursos" element={<Resources />} />
              <Route path="recursos/estudios" element={<BibleStudies />} />
              <Route path="recursos/devocional" element={<PersonalDevotionalGuide />} />
              <Route path="recursos/biblia" element={<BibleStudyTools />} />
              <Route path="recursos/biblia/libros/antiguo-testamento" element={<OldTestamentBooks />} />
              <Route path="recursos/biblia/libros/nuevo-testamento" element={<NewTestamentBooks />} />
              <Route path="recursos/biblia/libro/:slug" element={<BibleBookDetails />} />
              {/* El miembro elige libro y capítulo; evitamos enlaces 404. */}
              <Route path="recursos/biblia/leer/:slug/:chapter" element={<BibleReader />} />
              <Route path="recursos/guias-oracion" element={<PrayerGuides />} />
              <Route path="recursos/guias-oracion/:slug" element={<PrayerGuideDetails />} />
              <Route path="recursos/discipulado" element={<DiscipleshipMaterials />} />
              <Route path="recursos/discipulado/:slug" element={<DiscipleshipMaterialDetails />} />
              <Route path="recursos/preguntas-frecuentes" element={<FrequentlyAskedQuestions />} />
              <Route path="recursos/material-descargable" element={<DownloadableMaterials />} />
              <Route path="recursos/material-descargable/:slug" element={<DownloadableMaterialDetails />} />
              <Route path="recursos/biblioteca-solidaria" element={<SolidarityLibrary />} />
              {/* Letras de canciones almacenadas como PDF en Google Drive. */}
              <Route path="recursos/cancionero" element={<Songbook />} />

              {/* Todas estas páginas comparten el encabezado de miembros. */}
              <Route path="mi-cuenta" element={<MyAccount />} />
              <Route path="actividades" element={<MemberActivities />} />
              <Route path="peticiones-oracion" element={<MemberPrayerRequests />} />
              <Route path="voluntariado" element={<MemberVolunteerAssignments />} />
              <Route path="mis-donaciones" element={<MemberDonations />} />
              <Route path="finanzas" element={<FinanceOverview />} />
              <Route path="insumos-basicos" element={<MemberBasicSupplies />} />

            </Route>

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

{/* Selector de apariencia que acompaña al usuario en todas las páginas. */}
<ThemeSwitcher />

{/* Martín aparece en la PWA sin modificar las rutas existentes. */}
        <MartinWidget />

        {/* Lectura asistida independiente de Martín y de las rutas de usuario. */}
        <AccessibilityReader />

        {/* Invitación a instalar la PWA desde el navegador, sin cambiar de ruta. */}
        <PwaInstallBanner />
      </div>
      </NotificationsProvider>
    </BrowserRouter>
    </ThemeProvider>
  );
}

// =========================================================
// EXPORTACIÓN
// =========================================================

export default App;




