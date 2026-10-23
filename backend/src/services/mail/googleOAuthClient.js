
import { google } from "googleapis";

// =========================================================
// CLIENTE OAUTH 2.0 DE GOOGLE
// =========================================================

// Obtenemos la configuración desde las variables
// de entorno del servidor, nunca desde React.

const getGoogleOAuthClient = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  // Comprobamos que las credenciales estén configuradas.
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "Faltan las credenciales OAuth de Google"
    );
  }

  // Creamos un cliente nuevo para cada operación.
  return new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );
};

// =========================================================
// PERMISOS NECESARIOS
// =========================================================

// Solo solicitaremos autorización para enviar correos.
// No necesitamos leer la bandeja de entrada.

const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.send",
];

export {
  getGoogleOAuthClient,
  GMAIL_SCOPES,
};
