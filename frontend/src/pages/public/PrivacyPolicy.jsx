// =========================================================
// POLÍTICA DE PRIVACIDAD - CONTENIDO PUBLICADO DESDE DRIVE
// =========================================================

// Desplazamiento al inicio al entrar a la página pública.
import { useEffect } from "react";

// Componente existente que presenta la política sin editarla.
import PrivacyEditable from "../../components/administration/informationalPages/Privacy/PrivacyEditable";

// Lee el archivo publicado usando la API centralizada del frontend.
import usePublicInformationalPage from "../../hooks/usePublicInformationalPage";

// Mantiene un contenido de respaldo hasta tener una publicación.
import privacyDemoData from "../../data/informationalPages/privacyDemoData";

// Conserva la hoja CSS usada hasta ahora por ambas páginas legales.
import "../../styles/pages/public/TermsAndConditions.css";

function PrivacyPolicy() {
  // El usuario público no recibe contenidos aún en borrador.
  const { content } = usePublicInformationalPage("politica-de-privacidad", privacyDemoData);

  // Conservamos el posicionamiento original en la parte superior.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="terms-public-page">
      {/* Reutiliza el lector existente con el modo edición deshabilitado. */}
      <PrivacyEditable content={content || privacyDemoData} isPreview={true} />
    </main>
  );
}

export default PrivacyPolicy;
