
 // =========================================================
 // FRONTEND - APP.JS
 // =========================================================

 // Importamos las herramientas necesarias
 // para organizar las rutas de la aplicación.
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


 // =========================================================
 // PROTECCIÓN DE RUTAS
 // =========================================================

 // Comprueba la sesión y los roles autorizados.
 import ProtectedRoute from "./components/auth/ProtectedRoute";


 // =========================================================
 // LAYOUT ADMINISTRATIVO COMPARTIDO
 // =========================================================

 // Contiene el sidebar, el header
 // y el área de contenido administrativo.
 import AdminLayout from "./components/administration/layout/AdminLayout";


 // =========================================================
 // PÁGINAS PÚBLICAS
 // =========================================================

 import Home from "./pages/public/Home";

 import About from "./pages/public/About";

 import Contact from "./pages/public/Contact";

 import Events from "./pages/public/Events";

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


 // =========================================================
 // PÁGINAS DE MIEMBROS REGISTRADOS
 // =========================================================

 // Panel exclusivo de usuarios con rol "member".
 import MemberDashboard from "./pages/member/MemberDashboard";


 // =========================================================
 // PÁGINAS DEL ADMINISTRADOR
 // =========================================================

 // Página principal del administrador normal.
 import AdminHome from "./pages/admin/AdminHome";


 // =========================================================
 // PÁGINAS DEL SUPERADMINISTRADOR
 // =========================================================

 // Página principal del superadministrador.
 import SuperAdminHome from "./pages/super-admin/SuperAdminHome";


 // =========================================================
 // GESTIÓN DE USUARIOS - SUPERADMINISTRADOR
 // =========================================================

 // Nueva página para consultar y administrar
 // las cuentas registradas en el sistema.
 import UsersManagement from "./pages/super-admin/system/UsersManagement";


 // =========================================================
 // PÁGINAS ADMINISTRATIVAS COMPARTIDAS
 // =========================================================

 // Página de gestión de gastos.
 import ExpenseManagement from "./pages/administration/ExpenseManagement";


 // =========================================================
 // PÁGINA 404
 // =========================================================

 import NotFound from "./pages/public/NotFound";


 // =========================================================
 // LAYOUT PÚBLICO
 // =========================================================

 // Esta estructura es utilizada por las páginas
 // públicas de Iglesia El Ancla.
 //
 // Header: encabezado del sitio.
 // Outlet: página pública seleccionada.
 // Footer: pie de página.

 function PublicLayout() {

   return (
     <>

       <Header />

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


           {/* ================================================= */}
           {/* RUTAS PÚBLICAS */}
           {/* ================================================= */}

           {/* Todas las páginas de esta sección
               utilizan PublicLayout. */}

           <Route element={<PublicLayout />}>


             {/* Página principal. */}
             <Route
               path="/"
               element={<Home />}
             />


             {/* Nosotros. */}
             <Route
               path="/nosotros"
               element={<About />}
             />


             {/* Contacto. */}
             <Route
               path="/contacto"
               element={<Contact />}
             />


             {/* Eventos y actividades. */}
             <Route
               path="/eventos"
               element={<Events />}
             />


             {/* Contenidos recomendados. */}
             <Route
               path="/recomendados"
               element={<Recommendations />}
             />


             {/* Página principal de recursos. */}
             <Route
               path="/recursos"
               element={<Resources />}
             />


             {/* Estudios bíblicos. */}
             <Route
               path="/recursos/estudios"
               element={<BibleStudies />}
             />


             {/* Guía devocional personal. */}
             <Route
               path="/recursos/devocional"
               element={<PersonalDevotionalGuide />}
             />


             {/* Herramientas de estudio bíblico. */}
             <Route
               path="/recursos/biblia"
               element={<BibleStudyTools />}
             />


             {/* Libros del Antiguo Testamento. */}
             <Route
               path="/recursos/biblia/libros/antiguo-testamento"
               element={<OldTestamentBooks />}
             />


             {/* Libros del Nuevo Testamento. */}
             <Route
               path="/recursos/biblia/libros/nuevo-testamento"
               element={<NewTestamentBooks />}
             />


             {/* Detalle de un libro bíblico. */}
             <Route
               path="/recursos/biblia/libro/:slug"
               element={<BibleBookDetails />}
             />


             {/* Guías de oración. */}
             <Route
               path="/recursos/guias-oracion"
               element={<PrayerGuides />}
             />


             {/* Detalle de una guía de oración. */}
             <Route
               path="/recursos/guias-oracion/:slug"
               element={<PrayerGuideDetails />}
             />


             {/* Materiales de discipulado. */}
             <Route
               path="/recursos/discipulado"
               element={<DiscipleshipMaterials />}
             />


             {/* Detalle de material de discipulado. */}
             <Route
               path="/recursos/discipulado/:slug"
               element={<DiscipleshipMaterialDetails />}
             />


             {/* Preguntas frecuentes. */}
             <Route
               path="/recursos/preguntas-frecuentes"
               element={<FrequentlyAskedQuestions />}
             />


             {/* Materiales descargables. */}
             <Route
               path="/recursos/material-descargable"
               element={<DownloadableMaterials />}
             />


             {/* Detalle de material descargable. */}
             <Route
               path="/recursos/material-descargable/:slug"
               element={<DownloadableMaterialDetails />}
             />


           </Route>


           {/* ================================================= */}
           {/* LOGIN */}
           {/* ================================================= */}

           {/* El login utiliza su propio diseño
               y permanece fuera de PublicLayout. */}

           <Route
             path="/login"
             element={<Login />}
           />


           {/* ================================================= */}
           {/* RUTAS PROTEGIDAS - MIEMBROS */}
           {/* ================================================= */}

           {/* Solo se permite el acceso a usuarios
               autenticados con rol "member". */}

           <Route
             element={
               <ProtectedRoute
                 allowedRoles={["member"]}
               />
             }
           >

             {/* Panel principal del miembro. */}
             <Route
               path="/member"
               element={<MemberDashboard />}
             />

           </Route>


           {/* ================================================= */}
           {/* RUTAS PROTEGIDAS - ADMINISTRADOR */}
           {/* ================================================= */}

           {/* Solo se permite el acceso a usuarios
               autenticados con rol "admin". */}

           <Route
             element={
               <ProtectedRoute
                 allowedRoles={["admin"]}
               />
             }
           >

             {/* El administrador utiliza
                 el layout administrativo compartido. */}

             <Route
               path="/admin"
               element={<AdminLayout />}
             >

               {/* Página principal del administrador. */}
               <Route
                 index
                 element={<AdminHome />}
               />


               {/* Aquí incorporaremos posteriormente
                   los módulos compartidos:

                   - Registrar usuario.
                   - Eventos.
                   - Peticiones de oración.
                   - Miembros.
                   - Recursos.
                   - Otras herramientas administrativas.
               */}

             </Route>

           </Route>


           {/* ================================================= */}
           {/* RUTAS PROTEGIDAS - SUPERADMINISTRADOR */}
           {/* ================================================= */}

           {/* Solo se permite el acceso a usuarios
               autenticados con rol "super_admin".

               ProtectedRoute comprueba el acceso.

               AdminLayout muestra el menú lateral,
               el encabezado y el contenido interno.
           */}

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


               {/* ============================================= */}
               {/* INICIO DEL SUPERADMINISTRADOR */}
               {/* ============================================= */}

               <Route
                 index
                 element={<SuperAdminHome />}
               />


               {/* ============================================= */}
               {/* GESTIÓN DE GASTOS */}
               {/* ============================================= */}

               {/* Conservamos la ruta existente
                   para no afectar su funcionamiento. */}

               <Route
                 path="finanzas/gastos"
                 element={<ExpenseManagement />}
               />


               {/* ============================================= */}
               {/* GESTIÓN DE USUARIOS - NUEVA RUTA */}
               {/* ============================================= */}

               {/* Página exclusiva del superadministrador.

                   Dirección completa:

                   /super-admin/sistema/usuarios

                   Aquí se mostrarán posteriormente:

                   - Resumen de usuarios.
                   - Buscador y filtros.
                   - Tabla de cuentas.
                   - Herramientas de administración.
               */}

               <Route
                 path="sistema/usuarios"
                 element={<UsersManagement />}
               />


               {/* ============================================= */}
               {/* PRÓXIMOS MÓDULOS */}
               {/* ============================================= */}

               {/* Incorporaremos sus rutas cuando
                   construyamos las páginas:

                   - Registrar usuario.
                   - Administradores.
                   - Roles y permisos.
                   - Configuración.
               */}


             </Route>

           </Route>


           {/* ================================================= */}
           {/* RUTA 404 */}
           {/* ================================================= */}

           {/* Si ninguna ruta coincide,
               mostramos la página de error. */}

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
