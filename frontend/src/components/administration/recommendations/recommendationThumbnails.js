
 // =========================================================
 // MINIATURAS AUTOMÁTICAS DE RECOMENDACIONES
 // =========================================================

 // Obtiene el identificador de un video de YouTube.
 export function getYouTubeVideoId(value) {
     try {
         const url = new URL(value);
         const host = url.hostname.toLowerCase();

         let id = null;

         if (
             host === "youtu.be" ||
             host === "www.youtu.be"
         ) {
             id = url.pathname.split("/")[1];

         } else if (
             [
                 "youtube.com",
                 "www.youtube.com",
                 "m.youtube.com",
                 "music.youtube.com",
                 "youtube-nocookie.com",
                 "www.youtube-nocookie.com",
             ].includes(host)
         ) {
             const parts = url.pathname
                 .split("/")
                 .filter(Boolean);

             if (parts[0] === "watch") {
                 id = url.searchParams.get("v");

             } else if (
                 ["shorts", "embed", "live", "v"].includes(parts[0])
             ) {
                 id = parts[1];
             }
         }

         return /^[a-zA-Z0-9_-]{11}$/.test(id || "")
             ? id
             : null;

     } catch {
         return null;
     }
 }


 // =========================================================
 // DETECCIÓN DE ENLACES DE SPOTIFY
 // =========================================================

 export function isSpotifyLink(value) {
     try {
         const url = new URL(value);

         const validHost = [
             "open.spotify.com",
             "play.spotify.com",
         ].includes(url.hostname.toLowerCase());

         const normalizedPath = url.pathname.replace(
             /^\/intl-[a-z]{2}\//,
             "/"
         );

         const validPath =
             /^\/(track|album|artist|playlist|episode|show)\/[a-zA-Z0-9]+\/?$/.test(
                 normalizedPath
             );

         return validHost && validPath;

     } catch {
         return false;
     }
 }


 // =========================================================
 // OBTENCIÓN AUTOMÁTICA DE MINIATURAS
 // =========================================================

 export async function resolveRecommendationThumbnail(
     link,
     signal
 ) {
     // Primero comprobamos si es un enlace de YouTube.
     const videoId = getYouTubeVideoId(link);

     if (videoId) {
         return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
     }

     // Si no es un enlace compatible con Spotify,
     // devolvemos una cadena vacía.
     if (!isSpotifyLink(link)) {
         return "";
     }

     // Consultamos los metadatos públicos de Spotify.
     const response = await fetch(
         `https://open.spotify.com/oembed?url=${encodeURIComponent(link)}`,
         { signal }
     );

     if (!response.ok) {
         throw new Error(
             "Spotify no devolvió una portada."
         );
     }

     const metadata = await response.json();

     if (!metadata.thumbnail_url) {
         throw new Error(
             "El contenido no tiene portada disponible."
         );
     }

     return metadata.thumbnail_url;
 }
