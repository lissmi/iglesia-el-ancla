// =========================================================
// LAYOUT DE LAS PÁGINAS PÚBLICAS - IGLESIA EL ANCLA
// =========================================================

// Outlet muestra la página pública elegida desde App.js.
// useLocation permite ocultar el regreso solamente en Inicio.
import { Outlet, useLocation } from "react-router-dom";

// Header dinámico: el de visitantes o el de miembros según sesión.
import SessionAwareHeader from "../../shared/layout/SessionAwareHeader";

// Componente compartido de regreso y migas de pan.
import SiteNavigation from "../../shared/layout/SiteNavigation";

// Footer institucional que ya utiliza el sitio público.
import Footer from "../Footer";

// CSS exclusivo de este layout público.
import "../../../styles/components/public/layout/PublicLayout.css";

// Agrupamos las páginas informativas bajo la misma estructura.
function PublicLayout() {
  // Detectamos la ruta pública actual.
  const { pathname } = useLocation();

  // Inicio no necesita botón de volver ni migas de pan.
  const isHome = pathname === "/";

  return (
    <div className="public-layout">
      {/* Conservamos el encabezado correspondiente a la sesión. */}
      <SessionAwareHeader />

      {/* En las páginas internas el regreso ocupa una franja propia,
          independiente de los fondos y superposiciones de cada hero. */}
      {!isHome && (
        <div className="public-layout__navigation">
          <SiteNavigation />
        </div>
      )}

      {/* Las páginas Inicio, Nosotros, Eventos y Contacto se mantienen. */}
      <main className="public-layout__content">
        <Outlet />
      </main>

      {/* Mismo Footer que ya tienen los visitantes y miembros. */}
      <Footer />
    </div>
  );
}

export default PublicLayout;
