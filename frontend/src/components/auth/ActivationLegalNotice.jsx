// =========================================================
// AVISO BREVE Y ACEPTACIÓN DE CONDICIONES - IGLESIA EL ANCLA
// Archivo: frontend/src/components/auth/ActivationLegalNotice.jsx
// =========================================================

// Link permite navegar a las páginas legales sin recargar la aplicación.
import { Link } from "react-router-dom";

// Utilizamos iconos para distinguir el aviso y la acción de continuar.
import { Info, ExternalLink, ArrowRight } from "lucide-react";

// Conservamos el archivo de estilos propio del aviso.
import "../../styles/components/auth/ActivationLegalNotice.css";

// La página de activación controla el estado del checkbox y el cambio de paso.
// Este componente no almacena ninguna aceptación por sí mismo.
function ActivationLegalNotice({ legal, accepted, onAcceptedChange, onContinue }) {
  return (
    <div className="activation-legal">
      {/* Informamos de forma breve y enlazamos los documentos completos. */}
      <section className="activation-legal__intro" aria-label="Información antes de activar la cuenta">
        <Info size={19} aria-hidden="true" />

        <div className="activation-legal__copy">
          <p>
            Antes de activar tu cuenta, te invitamos a leer nuestros{" "}
            <Link to={legal.termsPath} target="_blank" rel="noopener noreferrer">
              Términos y Condiciones <ExternalLink size={13} aria-hidden="true" />
            </Link>{" "}
            y nuestra{" "}
            <Link to={legal.privacyPath} target="_blank" rel="noopener noreferrer">
              Política de Privacidad <ExternalLink size={13} aria-hidden="true" />
            </Link>.
            {" "}Allí explicamos qué datos utiliza la plataforma, para qué se usan,
            cómo se protegen y cuáles son los posibles riesgos tecnológicos.
          </p>

          <p>
            Si prefieres no activar tu cuenta, no necesitas hacer nada: la
            invitación vencerá a las 24 horas y tu registro provisional se
            eliminará automáticamente después del vencimiento.
          </p>
        </div>
      </section>

      {/* La casilla comienza sin marcarse; el usuario debe aceptarla expresamente. */}
      <label className="activation-legal__accept">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(event) => onAcceptedChange(event.target.checked)}
          required
        />
        {/* Mantenemos el texto oficial obtenido del backend. */}
        <span>{legal.acknowledgement}</span>
      </label>

      {/* El primer paso no permite crear contraseñas hasta aceptar. */}
      <button
        type="button"
        className="activate-account-card__submit activation-legal__continue"
        disabled={!accepted}
        onClick={onContinue}
      >
        <ArrowRight size={18} aria-hidden="true" />
        Aceptar y continuar
      </button>
    </div>
  );
}

export default ActivationLegalNotice;
