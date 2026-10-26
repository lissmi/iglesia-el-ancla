// =========================================================
// NAVEGACIÓN CONSISTENTE PARA PÁGINAS PÚBLICAS Y MIEMBROS
// =========================================================
// Este componente vive en los layouts, no dentro de cada página.
// Genera las migas de pan y un único enlace de regreso al padre.
// Nunca usa navigate(-1): funciona incluso al abrir una URL directa.

import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";
import "../../../styles/components/shared/layout/SiteNavigation.css";


/* =========================================================
   ETIQUETAS DE NAVEGACIÓN DE PÁGINAS PÚBLICAS
========================================================= */

// Definimos los títulos de las páginas públicas.
// SiteNavigation utiliza estos datos para generar
// automáticamente el botón de regreso y las migas de pan.
const PUBLIC_TITLES = {
  "/login": "Iniciar sesión",
  "/nosotros": "Nosotros",
  "/eventos": "Eventos",

  // Incluimos el módulo público de aportes voluntarios.
  // Permite utilizar la navegación compartida
  // tanto desde el sitio público como desde miembros.
  "/donaciones": "Donaciones",

  "/contacto": "Contacto",
  "/terminos-y-condiciones": "Términos y condiciones",
  "/politica-de-privacidad": "Política de privacidad",
};


// Etiquetas de las secciones privadas de primer nivel.
const MEMBER_TITLES = {
  "mi-cuenta": "Mi cuenta",
  "eventos": "Mis eventos",
  "peticiones-oracion": "Peticiones de oración",
  "finanzas": "Resumen financiero",
  "recomendados": "Recomendados",
  "recursos": "Recursos",
};

// Nombre visible para cada subsección del catálogo de recursos.
const RESOURCE_TITLES = {
  "estudios": "Estudios bíblicos",
  "devocional": "Guía devocional",
  "biblia": "Herramientas bíblicas",
  "guias-oracion": "Guías de oración",
  "discipulado": "Discipulado",
  "preguntas-frecuentes": "Preguntas frecuentes",
  "material-descargable": "Material descargable",
};

// Crea un elemento de navegación sin divulgar información del usuario.
const crumb = (label, to) => ({ label, to });

// Construye la ruta completa sin depender del historial del navegador.
function buildNavigation(pathname) {
  const path = pathname.replace(/\/+$/, "") || "/";

  // La portada pública es el punto de entrada y no tiene ruta padre.
  if (path === "/") return null;

  // Páginas públicas: Inicio > página actual.
  if (PUBLIC_TITLES[path]) {
    return [crumb("Inicio", "/"), crumb(PUBLIC_TITLES[path], path)];
  }

  // Solo mostramos esta navegación en páginas del área comunitaria.
  if (path !== "/member" && !path.startsWith("/member/")) return null;

  // Inicio del miembro: Inicio > Mi espacio.
  if (path === "/member") {
    return [crumb("Inicio", "/"), crumb("Mi espacio", "/member")];
  }

  const segments = path.slice("/member/".length).split("/");
  const section = segments[0];
  const crumbs = [crumb("Mi espacio", "/member")];
  const sectionPath = `/member/${section}`;

  // Página privada de primer nivel.
  crumbs.push(crumb(MEMBER_TITLES[section] || "Sección", sectionPath));

  // Si no es un recurso anidado, ya tenemos la jerarquía completa.
  if (section !== "recursos" || segments.length === 1) return crumbs;

  const resourceSection = segments[1];
  const resourcePath = `/member/recursos/${resourceSection}`;
  crumbs.push(crumb(RESOURCE_TITLES[resourceSection] || "Material", resourcePath));

  // Recursos simples, sin nivel adicional.
  if (segments.length === 2) return crumbs;

  // Dentro de Biblia existe un nivel más: Antiguo/Nuevo Testamento o ficha.
  if (resourceSection === "biblia") {
    if (segments[2] === "libros" && segments[3]) {
      const label = segments[3] === "antiguo-testamento"
        ? "Antiguo Testamento"
        : segments[3] === "nuevo-testamento"
          ? "Nuevo Testamento"
          : "Libros bíblicos";
      crumbs.push(crumb(label, path));
    } else if (segments[2] === "libro") {
      crumbs.push(crumb("Detalle del libro", path));
    }
    return crumbs;
  }

  // Otras fichas: detalles de guía, discipulado o descarga.
  const detailLabel = resourceSection === "guias-oracion"
    ? "Detalle de guía"
    : resourceSection === "discipulado"
      ? "Detalle de material"
      : resourceSection === "material-descargable"
        ? "Detalle de descarga"
        : "Detalle";
  crumbs.push(crumb(detailLabel, path));
  return crumbs;
}

function SiteNavigation() {
  // Cambiar de URL actualiza automáticamente los enlaces y etiquetas.
  const { pathname } = useLocation();
  const breadcrumbs = buildNavigation(pathname);

  // No insertamos una barra vacía en la portada pública.
  if (!breadcrumbs) return null;

  // El padre del elemento actual es el destino estable de regreso.
  const parent = breadcrumbs[breadcrumbs.length - 2];

  return (
    <nav className="site-navigation" aria-label="Ubicación y regreso">
      <div className="site-navigation__container">
        {/* Control único de retorno, compartido por todos los módulos. */}
        {parent && (
          <Link className="site-navigation__back" to={parent.to}>
            <ArrowLeft size={17} aria-hidden="true" />
            <span>Volver a {parent.label}</span>
          </Link>
        )}

        {/* Indicación accesible de la jerarquía actual. */}
        <ol className="site-navigation__trail">
          {breadcrumbs.map((item, index) => {
            const isCurrent = index === breadcrumbs.length - 1;
            return (
              <li className="site-navigation__item" key={`${item.to}-${index}`}>
                {index > 0 && <ChevronRight size={14} aria-hidden="true" />}
                {isCurrent ? (
                  <span aria-current="page">{item.label}</span>
                ) : (
                  <Link to={item.to}>{item.label}</Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}

export default SiteNavigation;
