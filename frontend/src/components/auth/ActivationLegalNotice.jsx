// =========================================================
// AVISO LEGAL PREVIO A LA ACTIVACIÓN - IGLESIA EL ANCLA
// Archivo: frontend/src/components/auth/ActivationLegalNotice.jsx
// =========================================================

// Importamos Link para navegar por el sitio sin recargar la PWA.
import { Link } from "react-router-dom";

// Importamos los iconos utilizados por la interfaz.
import { ShieldCheck, ExternalLink, Info, ArrowRight } from "lucide-react";

// Utilizamos el contenido de respaldo revisado para mostrar en esta
// pantalla los documentos completos incluso si Drive no responde.
import termsDemoData from "../../data/informationalPages/termsDemoData";
import privacyDemoData from "../../data/informationalPages/privacyDemoData";

// Importamos estilos propios sin reemplazar la hoja original del proyecto.
import "../../styles/components/auth/ActivationLegalNotice.css";

// Muestra secciones completas sin permitir modificaciones del contenido.
function LegalDocumentPreview({ title, document }) {
  return (
    <details className="activation-legal__document">
      <summary>{title}</summary>
      <div className="activation-legal__document-content">
        <p>{document.information.introduction}</p>
        {document.sections.map((section) => (
          <section key={section.id}>
            <h4>{section.title}</h4>
            <p>{section.content}</p>
          </section>
        ))}
      </div>
    </details>
  );
}

// Recibimos el contenido desde el backend y las opciones controladas
// por la página principal. No guardamos aceptaciones en localStorage.
function ActivationLegalNotice({
  legal,
  accepted,
  onAcceptedChange,
  onContinue,
}) {
  return (
    <div className="activation-legal">
      <div className="activation-legal__intro">
        <Info size={19} aria-hidden="true" />
        <p>
          Antes de activar tu cuenta, revisa la información que ya fue
          registrada, cómo se tratarán tus datos y cuáles son los riesgos
          tecnológicos. Tú decides si quieres continuar.
        </p>
      </div>

      <section className="activation-legal__section" aria-labelledby="activation-data-heading">
        <h2 id="activation-data-heading">Cómo utilizaremos tus datos</h2>
        {legal.dataNotice.map((paragraph, index) => (
          <p key={`data-${index}`}>{paragraph}</p>
        ))}
      </section>

      <section className="activation-legal__section activation-legal__section--risk" aria-labelledby="activation-risk-heading">
        <div className="activation-legal__risk-heading">
          <ShieldCheck size={22} aria-hidden="true" />
          <h2 id="activation-risk-heading">{legal.securityHeading}</h2>
        </div>
        {/* Los seis párrafos de la cláusula se muestran sin recortes. */}
        {legal.securityParagraphs.map((paragraph, index) => (
          <p key={`risk-${index}`}>{paragraph}</p>
        ))}
      </section>

      <section className="activation-legal__section" aria-label="Documentación legal completa">
        <h2>Documentos que debes revisar</h2>
        <p>
          Puedes consultar los documentos completos aquí mismo y abrir también
          sus páginas públicas. La versión utilizada para esta activación es
          {" "}<strong>{legal.version}</strong>.
        </p>
        <div className="activation-legal__document-list">
          <LegalDocumentPreview
            title="Leer todos los Términos y Condiciones"
            document={termsDemoData}
          />
          <LegalDocumentPreview
            title="Leer toda la Política de Privacidad"
            document={privacyDemoData}
          />
        </div>
        <div className="activation-legal__links">
          <Link to={legal.termsPath} target="_blank" rel="noopener noreferrer">
            Términos y Condiciones <ExternalLink size={14} aria-hidden="true" />
          </Link>
          <Link to={legal.privacyPath} target="_blank" rel="noopener noreferrer">
            Política de Privacidad <ExternalLink size={14} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <label className="activation-legal__accept">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(event) => onAcceptedChange(event.target.checked)}
          required
        />
        <span>{legal.acknowledgement}</span>
      </label>

      <button
        type="button"
        className="activate-account-card__submit activation-legal__continue"
        disabled={!accepted}
        onClick={onContinue}
      >
        <ArrowRight size={18} aria-hidden="true" />
        Aceptar y continuar para crear mi contraseña
      </button>
      <p className="activation-legal__footnote">
        Si no deseas activar tu cuenta, puedes cerrar esta página sin marcar
        la casilla. La invitación vencerá a las 24 horas y tu registro
        provisional se eliminará automáticamente de la base de datos después
        del vencimiento, sin necesidad de solicitarlo.
      </p>
    </div>
  );
}

export default ActivationLegalNotice;
