// =========================================================
// ENLACES OFICIALES DE GOOGLE MAPS — EL ANCLA
// Separar estas funciones facilita comprobar que el destino
// es correcto y evita repetir direcciones por el frontend.
// =========================================================

// Creamos una dirección completa con los datos publicados desde Drive.
export function buildDestination(location) {
  // Aceptamos únicamente texto; no confiamos en objetos externos inesperados.
  const address = typeof location?.address === "string" ? location.address.trim() : "";

  // Leemos la ciudad y el país desde la misma publicación.
  const city = typeof location?.city === "string" ? location.city.trim() : "";

  // Unimos ambas partes y limitamos su longitud para formar enlaces razonables.
  return [address, city].filter(Boolean).join(", ").slice(0, 300);
}

// Construimos la URL oficial multiplataforma para obtener indicaciones.
export function buildDirectionsUrl(location) {
  // Calculamos el destino sin inventar coordenadas geográficas.
  const destination = buildDestination(location);

  // Si no hay una dirección válida, no abrimos Maps hacia un sitio ambiguo.
  if (!destination) return "";

  // URLSearchParams codifica correctamente acentos, espacios y comas.
  const parameters = new URLSearchParams({
    api: "1",
    destination,
    dir_action: "navigate",
  });

  // Google Maps utiliza la ubicación del usuario si está disponible y autorizada.
  return `https://www.google.com/maps/dir/?${parameters.toString()}`;
}

// Validamos una URL de inserción copiada desde «Compartir» de Google Maps.
export function validateSharedEmbedUrl(input) {
  // No aceptamos valores vacíos ni cadenas excesivamente grandes.
  if (typeof input !== "string" || !input.trim() || input.length > 12000) return "";

  try {
    // La URL se analiza antes de usarla como src de un iframe.
    const url = new URL(input.trim());

    // Permitimos únicamente HTTPS y los servidores genuinos de Google Maps.
    if (url.protocol !== "https:" || !["www.google.com", "google.com"].includes(url.hostname)) return "";

    // Admitimos únicamente la ruta pública de inserción de Google Maps.
    if (url.pathname !== "/maps/embed") return "";

    // Devolvemos la dirección normalizada y validada.
    return url.href;
  } catch {
    // No mostramos el iframe cuando la URL introducida no es válida.
    return "";
  }
}

// Construimos la URL de Maps Embed API cuando existe una clave restringida.
export function buildOfficialEmbedUrl(location, apiKey) {
  // Recuperamos el destino publicado para evitar direcciones duplicadas.
  const destination = buildDestination(location);

  // Una clave de API para navegador puede ser visible, pero debe estar restringida.
  const key = typeof apiKey === "string" ? apiKey.trim() : "";

  // La API oficial necesita clave y destino.
  if (!destination || !key) return "";

  // Parámetros documentados por Google para Maps Embed API (place).
  const parameters = new URLSearchParams({
    key,
    q: destination,
    zoom: "16",
    language: "es",
    region: "CL",
  });

  // La API muestra un mapa y señala el lugar indicado en q.
  return `https://www.google.com/maps/embed/v1/place?${parameters.toString()}`;
}

// Obtenemos una vista previa utilizable incluso antes de crear una clave de Google Cloud.
export function buildFallbackEmbedUrl(location) {
  // Google Maps interpreta la dirección como una búsqueda de ubicación.
  const destination = buildDestination(location);

  // Evitamos crear iframes para destinos desconocidos.
  if (!destination) return "";

  // Este enlace sin clave es un método de inserción antiguo (no la Embed API).
  // Recomendamos configurar la Embed API o una URL oficial compartida en producción.
  const parameters = new URLSearchParams({
    q: destination,
    z: "16",
    output: "embed",
  });

  return `https://maps.google.com/maps?${parameters.toString()}`;
}
