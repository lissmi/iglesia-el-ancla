// =========================================================
// LAYOUT COMÚN DE MIEMBROS (member, admin y super_admin)
// =========================================================

// Outlet renderiza la página seleccionada dentro del área de miembros.
// useOutletContext obtiene el usuario autenticado por ProtectedRoute.
import { Outlet, useOutletContext } from "react-router-dom";

// Reutilizamos el encabezado comunitario para los tres roles.
import MemberHeader from "./MemberHeader";

// Unificamos el botón de regreso y el breadcrumb en todas las páginas.
import SiteNavigation from "../../shared/layout/SiteNavigation";

// Reutilizamos el Footer institucional que también usa la web pública.
import Footer from "../../public/Footer";

// Importamos los estilos exclusivos de este layout.
import "../../../styles/components/member/layout/MemberLayout.css";

// Estructura visual compartida por todas las rutas /member.
function MemberLayout() {
  // La sesión y el rol ya fueron verificados por ProtectedRoute.
  const { user } = useOutletContext() || {};

  return (
    <div className="member-layout">
      {/* Encabezado con navegación y acciones según el usuario. */}
      <MemberHeader user={user} />

      {/* Navegación única para toda el área comunitaria. */}
      <SiteNavigation />

      {/* Espacio flexible para la página privada que se esté visitando. */}
      <div className="member-layout__content">
        {/* Conservamos el usuario validado para cada página hija. */}
        <Outlet context={{ user }} />
      </div>

      {/* Footer público compartido, visible en todas las rutas /member. */}
      <Footer />
    </div>
  );
}

// Permite reutilizar el layout desde App.js.
export default MemberLayout;
