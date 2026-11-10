// =========================================================
// MAPA PÚBLICO DE CONTACTO — IGLESIA EL ANCLA
// Integra un mapa de tamaño moderado y un enlace de direcciones.
// No necesita acceso a MongoDB, sesión ni permisos de ubicación de la PWA.
// =========================================================

// Importamos iconos ya disponibles en el proyecto.
import { ExternalLink, MapPin, Navigation } from "lucide-react";

// Importamos funciones independientes que crean enlaces seguros a Google Maps.
import {
  buildDestination,
  buildDirectionsUrl,
  buildOfficialEmbedUrl,
  buildFallbackEmbedUrl,
  validateSharedEmbedUrl,
} from "../../utils/googleMapsLinks";

// Agregamos únicamente los estilos exclusivos de la nueva sección.
import "../../styles/components/public/ContactLocationMap.css";

// Creamos el componente que recibe la dirección publicada desde Contact.jsx.
function ContactLocationMap({ location }) {
  // Transformamos la dirección y la ciudad en un solo destino.
  const destination = buildDestination(location);

  // Formamos el enlace oficial que abre indicaciones en la app o web de Maps.
  const directionsUrl = buildDirectionsUrl(location);

  // Leemos una posible clave pública configurada en el frontend de React.
  // IMPORTANTE: Google exige restringir esta clave por dominio y por API.
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_EMBED_API_KEY || "";

  // Admitimos también la URL generada por Google Maps > Compartir > Insertar un mapa.
  const sharedEmbedUrl = validateSharedEmbedUrl(
    process.env.REACT_APP_GOOGLE_MAPS_EMBED_URL || ""
  );

  // Prioridad: API oficial; inserción compartida; enlace clásico sin clave.
  // El último funciona como alternativa, pero Google no garantiza esa modalidad.
  const embeddedMapUrl =
    buildOfficialEmbedUrl(location, apiKey) ||
    sharedEmbedUrl ||
    buildFallbackEmbedUrl(location);

  // Sin dirección no mostramos un mapa que pudiera señalar otro sitio.
  if (!destination || !directionsUrl) return null;

  // Mostramos la sección pública después de las tarjetas de contacto.
  return (
    <section className="contact-location-map" aria-labelledby="contact-map-title">
      <div className="contact-location-map__container">
        {/* Presentamos el mapa y la información en dos columnas en escritorio. */}
        <div className="contact-location-map__grid">
          {/* La información visible no depende de que Google cargue correctamente. */}
          <div className="contact-location-map__details">
            {/* Etiqueta breve alineada con la identidad visual del proyecto. */}
            <span className="contact-location-map__eyebrow">VISÍTANOS</span>

            {/* Título principal de esta sección. */}
            <h2 className="contact-location-map__title" id="contact-map-title">
              Estamos más cerca de lo que crees
            </h2>

            {/* Invitación amable para visitantes nuevos. */}
            <p className="contact-location-map__description">
              ¡Nos encantará recibirte! Revisa dónde nos encontramos y
              abre Google Maps para elegir la mejor ruta hasta nuestra iglesia.
            </p>

            {/* Dirección exacta tomada del contenido institucional publicado. */}
            <p className="contact-location-map__address">
              <MapPin size={19} strokeWidth={1.8} aria-hidden="true" />
              <span>{destination}</span>
            </p>

            {/* El navegador decide si abre la aplicación de Maps o su sitio web. */}
            <a
              className="contact-location-map__directions"
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Cómo llegar a Iglesia El Ancla con Google Maps"
            >
              <Navigation size={19} strokeWidth={2} aria-hidden="true" />
              <span>Cómo llegar</span>
              <ExternalLink size={16} strokeWidth={1.8} aria-hidden="true" />
            </a>

            {/* Avisamos que no es necesario escribir nuevamente el destino. */}
            <p className="contact-location-map__hint">
              El destino ya estará seleccionado en Google Maps.
            </p>
          </div>

          {/* El mapa es una vista previa; no intentamos navegar dentro de React. */}
          <div className="contact-location-map__map-wrapper">
            {/* Cargamos el iframe únicamente cuando aparece cerca de la pantalla. */}
            <iframe
              className="contact-location-map__iframe"
              title="Mapa de ubicación de Iglesia El Ancla en Google Maps"
              src={embeddedMapUrl}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
            {/* Este pie sigue visible si el mapa requiere apertura externa. */}
            <div className="contact-location-map__map-footer">
              <span>Ubicación de Iglesia El Ancla</span>
              <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
                Abrir en Maps <ExternalLink size={14} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Permitimos utilizar el componente desde la página pública de Contacto.
export default ContactLocationMap;
