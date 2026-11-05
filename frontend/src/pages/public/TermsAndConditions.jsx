// =========================================================
// TÉRMINOS Y CONDICIONES - CONTENIDO PUBLICADO DESDE DRIVE
// =========================================================

// Solo se usa para posicionar la página arriba al entrar a la ruta.
import { useEffect } from "react";

// Componente de lectura que ya utilizábamos en la página pública.
import TermsEditable from "../../components/administration/informationalPages/Terms/TermsEditable";

// Lee solo el TXT publicado a través del backend y api.js existentes.
import usePublicInformationalPage from "../../hooks/usePublicInformationalPage";

// Contenido inicial si no existe versión publicada o falla la consulta.
import termsDemoData from "../../data/informationalPages/termsDemoData";

// Conservamos el estilo original de la página pública.
import "../../styles/pages/public/TermsAndConditions.css";

function TermsAndConditions() {
  // El hook no devuelve nunca contenido del borrador administrativo.
  const { content } = usePublicInformationalPage("terminos-y-condiciones", termsDemoData);

  // Mantiene el comportamiento original al navegar a esta página.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="terms-public-page">
      {/* isPreview elimina todos los controles de edición del lector público. */}
      <TermsEditable content={content || termsDemoData} isPreview={true} />
    </main>
  );
}

export default TermsAndConditions;
