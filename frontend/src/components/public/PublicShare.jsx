// =========================================================
// SECCIÓN PARA COMPARTIR LA PWA EN EL HOME PÚBLICO
// =========================================================
// No exige iniciar sesión ni requiere rutas nuevas en el backend.
// Reutiliza el QR local que ya generamos para la aplicación.

// useState permite informar al visitante del resultado de las acciones.
import { useState } from "react";

// Importamos iconos que ya utiliza el resto de la aplicación.
import {
  Check,
  Copy,
  Download,
  MessageCircle,
  QrCode,
  Share2,
} from "lucide-react";

// Cargamos los estilos de este componente desde la carpeta habitual.
import "../../styles/components/public/PublicShare.css";

// La dirección compartida siempre corresponde al inicio público, nunca al panel privado.
const SITE_URL = "https://iglesia-el-ancla.vercel.app/";

// Utilizamos el QR incluido en public/images, sin llamar a generadores externos.
const QR_IMAGE_URL = `${process.env.PUBLIC_URL || ""}/images/qr-el-ancla.png`;

// Definimos el mensaje que puede enviarse mediante las opciones del teléfono.
const SHARE_MESSAGE = "Conoce Iglesia El Ancla Comunidad Cristiana ⚓";

// Preparamos los enlaces oficiales de compartir de cada red compatible con URLs web.
const WHATSAPP_URL = `https://wa.me/?text=${encodeURIComponent(`${SHARE_MESSAGE} ${SITE_URL}`)}`;
const FACEBOOK_URL = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SITE_URL)}`;

// =========================================================
// ICONOS DE REDES SOCIALES (SIN DEPENDENCIAS ADICIONALES)
// =========================================================
// lucide-react no incluye iconos de marcas como Facebook o Instagram
// en la versión utilizada por el proyecto. Los dibujamos con SVG
// dentro de este componente para evitar errores de importación.

// Icono identificativo de Facebook.
function FacebookIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      {/* Silueta simplificada de la letra f. */}
      <path d="M14.1 21v-7.2h2.5l.4-3.1h-2.9V8.8c0-.9.2-1.5 1.5-1.5H17V4.5c-.7-.1-1.5-.2-2.4-.2-2.4 0-4.1 1.5-4.1 4.3v2.1H8v3.1h2.5V21h3.6Z" />
    </svg>
  );
}

// Icono identificativo de Instagram.
function InstagramIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {/* Contorno de la cámara. */}
      <rect x="3" y="3" width="18" height="18" rx="5" />
      {/* Lente principal. */}
      <circle cx="12" cy="12" r="4" />
      {/* Punto indicador superior. */}
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Componente público que sustituye el antiguo banner de notificaciones.
function PublicShare() {
  // Guarda mensajes breves como «Enlace copiado» para evitar alertas invasivas.
  const [feedback, setFeedback] = useState("");

  // Copia el enlace y utiliza una alternativa si falta la API moderna.
  async function handleCopyLink() {
    try {
      // La API del portapapeles se utiliza preferentemente en HTTPS.
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(SITE_URL);
      } else {
        // Creamos un campo temporal para navegadores sin clipboard.writeText.
        const temporaryInput = document.createElement("textarea");
        temporaryInput.value = SITE_URL;
        temporaryInput.setAttribute("readonly", "");
        temporaryInput.style.position = "fixed";
        temporaryInput.style.opacity = "0";
        document.body.appendChild(temporaryInput);
        temporaryInput.select();

        // Comprobamos si el navegador realmente realizó la copia.
        const copied = document.execCommand("copy");
        temporaryInput.remove();
        if (!copied) throw new Error("No fue posible copiar el enlace");
      }

      // Confirmamos al usuario que puede pegar el enlace en cualquier aplicación.
      setFeedback("¡Enlace copiado! Ya puedes pegarlo donde quieras.");
    } catch {
      // Si copiar falla, mostramos la URL para que pueda seleccionarse manualmente.
      setFeedback(`No fue posible copiar automáticamente. Usa este enlace: ${SITE_URL}`);
    }
  }

  // Abre el menú nativo para elegir WhatsApp, Instagram u otra app compatible.
  async function handleNativeShare() {
    // Si el navegador admite Web Share, solicitamos el menú nativo.
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: "Iglesia El Ancla",
          text: SHARE_MESSAGE,
          url: SITE_URL,
        });
        return;
      } catch (error) {
        // Cerrar voluntariamente el menú no debe mostrar un error.
        if (error?.name === "AbortError") return;
      }
    }

    // En computadores o navegadores incompatibles, copiamos el enlace.
    await handleCopyLink();
  }

  return (
    // Mantiene un bloque visual propio dentro del Home, sin botones flotantes.
    <section className="public-share-section" aria-labelledby="public-share-section-title">
      {/* Presentamos el QR a la izquierda como elemento destacado de la sección. */}
      <div className="public-share-section__visual">
        <div className="public-share-section__ring">
          <div className="public-share-section__qr-frame">
            <img
              className="public-share-section__qr"
              src={QR_IMAGE_URL}
              alt="Código QR para visitar la página pública de Iglesia El Ancla"
              width="218"
              height="218"
              loading="lazy"
            />
          </div>
        </div>
        {/* Esta leyenda indica cómo utilizar el QR sin abrir otra pantalla. */}
        <span className="public-share-section__scan-hint">
          <QrCode size={17} aria-hidden="true" /> Escanea y descubre El Ancla
        </span>
      </div>

      {/* Reemplaza el contenido informativo sobre notificaciones. */}
      <div className="public-share-section__content">
        <p className="public-share-section__eyebrow">COMPARTE NUESTRA COMUNIDAD</p>
        <h2 className="public-share-section__title" id="public-share-section-title">
          Comparte El Ancla
        </h2>
        <p className="public-share-section__description">
          Invita a tus familiares y amigos a conocer nuestra iglesia, sus actividades y recursos.
          Comparte el enlace, muestra el código QR o descárgalo para imprimirlo.
        </p>

        {/* Acciones principales: compartir, copiar y descargar la imagen. */}
        <div className="public-share-section__actions">
          <button
            type="button"
            className="public-share-section__button public-share-section__button--primary"
            onClick={handleNativeShare}
          >
            <Share2 size={19} aria-hidden="true" /> Compartir PWA
          </button>
          <button
            type="button"
            className="public-share-section__button public-share-section__button--secondary"
            onClick={handleCopyLink}
          >
            <Copy size={18} aria-hidden="true" /> Copiar enlace
          </button>
          <a
            className="public-share-section__button public-share-section__button--secondary"
            href={QR_IMAGE_URL}
            download="QR-Iglesia-El-Ancla.png"
          >
            <Download size={18} aria-hidden="true" /> Descargar QR
          </a>
        </div>

        {/* Enlaces de WhatsApp y Facebook; Instagram necesita cargar el QR manualmente. */}
        <div className="public-share-section__social" aria-label="Opciones para redes sociales">
          <span className="public-share-section__social-label">Compártelo también en:</span>
          <a
            className="public-share-section__social-link"
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Compartir enlace de El Ancla por WhatsApp"
          >
            <MessageCircle size={18} aria-hidden="true" /> WhatsApp
          </a>
          <a
            className="public-share-section__social-link"
            href={FACEBOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Compartir enlace de El Ancla en Facebook"
          >
            <FacebookIcon size={18} /> Facebook
          </a>
          <a
            className="public-share-section__social-link"
            href={QR_IMAGE_URL}
            download="QR-Iglesia-El-Ancla.png"
            aria-label="Descargar imagen QR para compartir en una historia de Instagram"
            title="Descarga el QR y publícalo desde la app de Instagram"
          >
            <InstagramIcon size={18} /> Instagram (QR)
          </a>
        </div>

        {/* Explicamos el límite real de Instagram sin fingir un envío automático. */}
        <p className="public-share-section__note">
          Para Instagram, descarga el QR y publícalo en una historia desde la aplicación.
        </p>

        {/* El lector de pantalla recibe la confirmación después de copiar. */}
        <p className="public-share-section__feedback" role="status" aria-live="polite">
          {feedback ? <><Check size={15} aria-hidden="true" /> {feedback}</> : null}
        </p>
      </div>
    </section>
  );
}

// Exportamos el componente para mostrarlo una única vez en Home.jsx.
export default PublicShare;
