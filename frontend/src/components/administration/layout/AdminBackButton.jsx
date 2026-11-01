/* =========================================================
   BOTÓN VOLVER GLOBAL - ADMINISTRACIÓN
   IGLESIA EL ANCLA
   ========================================================= */

// Importamos las herramientas de navegación de React Router.
import { useLocation, useNavigate } from "react-router-dom";

// Importamos el icono de flecha.
import { ArrowLeft } from "lucide-react";

// Importamos los estilos del botón global.
import "../../../styles/components/administration/layout/AdminBackButton.css";

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function AdminBackButton() {

    // Permite navegar entre las páginas del proyecto.
    const navigate = useNavigate();

    // Obtiene la ruta actual del navegador.
    const location = useLocation();

    // Eliminamos las barras finales de la ruta.
    const pathname =
        location.pathname.replace(/\/+$/, "") || "/";

    // Identificamos si estamos en el panel Superadmin.
    const isSuperAdmin =
        pathname === "/super-admin" ||
        pathname.startsWith("/super-admin/");

    // Identificamos si estamos en el panel Admin.
    const isAdmin =
        pathname === "/admin" ||
        pathname.startsWith("/admin/");

    // Definimos la ruta principal correspondiente al rol.
    const basePath = isSuperAdmin
        ? "/super-admin"
        : isAdmin
            ? "/admin"
            : null;

    // No mostramos el botón fuera de administración.
    if (!basePath) {
        return null;
    }

    // No mostramos el botón en el dashboard principal.
    if (pathname === basePath) {
        return null;
    }

    // El editor tiene un botón propio que protege los cambios
    // sin guardar. Ocultamos aquí el regreso global para evitar
    // duplicados y no eludir su modal de confirmación.
    if (/^\/(?:admin|super-admin)\/paginas-informativas\/editar\/[^/]+$/.test(pathname)) {
        return null;
    }

    // =====================================================
    // CALCULAR LA RUTA ANTERIOR
    // =====================================================

    // Obtenemos los segmentos internos de la ruta.
    const segments = pathname
        .slice(basePath.length)
        .split("/")
        .filter(Boolean);

    // Eliminamos el último segmento para volver al padre.
    const parentSegments = segments.slice(0, -1);

    // Las rutas /sistema/* no tienen una página /sistema
    // registrada en SharedAdminRoutes. Regresan al dashboard.
    // Para las demás rutas usamos su sección superior.
    const backPath = segments[0] === "sistema"
        ? basePath
        : parentSegments.length > 0
            ? `${basePath}/${parentSegments.join("/")}`
            : basePath;

    // =====================================================
    // NAVEGACIÓN
    // =====================================================

    // Regresamos a la sección administrativa superior.
    const handleGoBack = () => {
        navigate(backPath);
    };

    // =====================================================
    // INTERFAZ
    // =====================================================

    return (
        <nav
            className="admin-back-navigation"
            aria-label="Navegación de regreso"
        >
            <button
                type="button"
                className="admin-back-navigation__button"
                onClick={handleGoBack}
                aria-label="Volver a la sección anterior"
            >
                {/* Icono de navegación. */}
                <ArrowLeft
                    size={18}
                    strokeWidth={1.8}
                    aria-hidden="true"
                />

                {/* Texto del botón. */}
                <span>Volver</span>
            </button>
        </nav>
    );
}

// Exportamos el componente reutilizable.
export default AdminBackButton;




