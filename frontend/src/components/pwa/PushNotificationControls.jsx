
/* =========================================================
   CONTROLES DE NOTIFICACIONES PUSH — EL ANCLA
   ========================================================= */

// Importamos los hooks para gestionar los estados.
import { useEffect, useState } from "react";

// Importamos los iconos para los botones y encabezado.
import {
  BellRing,
  BellOff,
  Send,
  LoaderCircle,
} from "lucide-react";

// Reutilizamos la instancia Axios con autenticación.
import api from "../../services/api";

// Importamos los estilos exclusivos del componente.
import "../../styles/components/pwa/PushNotificationControls.css";


// =========================================================
// CONVERSIÓN DE LA CLAVE VAPID
// =========================================================

// Convierte la clave pública a un formato compatible con PushManager.
function decodeVapidKey(base64url) {

  // Completamos el formato Base64 cuando corresponde.
  const padded =
    base64url + "=".repeat((4 - base64url.length % 4) % 4);

  // Convertimos Base64URL a Base64.
  const raw = atob(
    padded.replace(/-/g, "+").replace(/_/g, "/")
  );

  // Transformamos el resultado en bytes.
  return Uint8Array.from(
    raw,
    (char) => char.charCodeAt(0)
  );
}


// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

export default function PushNotificationControls() {

  // Determina si el navegador admite Web Push.
  const [supported, setSupported] = useState(true);

  // Indica si existe una suscripción en este navegador.
  const [enabled, setEnabled] = useState(false);

  // Bloquea los botones mientras se procesa una operación.
  const [busy, setBusy] = useState(false);

  // Guarda los mensajes de respuesta para el usuario.
  const [message, setMessage] = useState("");


  // =======================================================
  // COMPROBAR COMPATIBILIDAD
  // =======================================================

  useEffect(() => {

    // Evita actualizar estados después de desmontar el componente.
    let alive = true;

    // Comprobamos HTTPS y las APIs necesarias.
    const ok =
      window.isSecureContext &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;

    // Si el navegador no es compatible, informamos.
    if (!ok) {
      setSupported(false);
      return undefined;
    }

    // Consultamos si ya existe una suscripción.
    // Esto no solicita permisos al usuario.
    navigator.serviceWorker.ready
      .then((registration) =>
        registration.pushManager.getSubscription()
      )
      .then((subscription) => {
        if (alive) {
          setEnabled(Boolean(subscription));
        }
      })
      .catch(() => {
        if (alive) {
          setSupported(false);
        }
      });

    // Limpiamos la referencia al desmontar.
    return () => {
      alive = false;
    };

  }, []);


  // =======================================================
  // ACTIVAR NOTIFICACIONES
  // =======================================================

  async function activate() {

    // Bloqueamos acciones simultáneas.
    setBusy(true);
    setMessage("");

    try {

      // Pedimos permiso únicamente cuando se pulsa el botón.
      const permission = await Notification.requestPermission();

      // Respetamos la decisión del usuario.
      if (permission !== "granted") {
        setMessage(
          "No autorizaste los avisos. Puedes cambiarlos en los ajustes del navegador."
        );
        return;
      }

      // Solicitamos al backend la clave VAPID pública.
      const response = await api.get("/push/public-key");

      // Obtenemos nuestro Service Worker activo.
      const registration = await navigator.serviceWorker.ready;

      // Consultamos si el dispositivo ya tiene una suscripción.
      let subscription =
        await registration.pushManager.getSubscription();

      // Identificamos si será necesario crearla.
      const created = !subscription;

      // Registramos una suscripción si todavía no existe.
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: decodeVapidKey(
            response.data.data.publicKey
          ),
        });
      }

      try {

        // Asociamos la suscripción con el usuario autenticado.
        await api.post("/push/subscribe", {
          subscription: subscription.toJSON(),
        });

      } catch (error) {

        // Revertimos una suscripción nueva si MongoDB no pudo guardarla.
        if (created) {
          await subscription.unsubscribe();
        }

        throw error;
      }

      // Actualizamos el botón al estado activado.
      setEnabled(true);

      // Confirmamos la activación.
      setMessage("Avisos activados en este dispositivo. 💙");

    } catch (error) {

      // Mostramos una respuesta comprensible ante errores.
      setMessage(
        error.response?.data?.message ||
        "No se pudieron activar los avisos. Comprueba tu sesión y conexión."
      );

    } finally {

      // Habilitamos nuevamente los botones.
      setBusy(false);

    }
  }


  // =======================================================
  // DESACTIVAR NOTIFICACIONES
  // =======================================================

  async function deactivate() {

    setBusy(true);
    setMessage("");

    try {

      // Obtenemos el Service Worker registrado.
      const registration = await navigator.serviceWorker.ready;

      // Consultamos la suscripción actual.
      const subscription =
        await registration.pushManager.getSubscription();

      if (subscription) {

        // Eliminamos primero la asociación en MongoDB.
        await api.post("/push/unsubscribe", {
          endpoint: subscription.endpoint,
        });

        // Cancelamos la suscripción en este navegador.
        await subscription.unsubscribe();
      }

      // Cambiamos al estado desactivado.
      setEnabled(false);

      // Informamos al usuario.
      setMessage("Avisos desactivados en este dispositivo.");

    } catch (error) {

      // Evitamos afirmar que se desactivó si hubo un error.
      setMessage(
        error.response?.data?.message ||
        "No se pudieron desactivar los avisos."
      );

    } finally {

      setBusy(false);

    }
  }


  // =======================================================
  // ENVIAR NOTIFICACIÓN DE PRUEBA
  // =======================================================

  async function test() {

    setBusy(true);
    setMessage("");

    try {

      // Consultamos la suscripción del dispositivo.
      const registration = await navigator.serviceWorker.ready;

      const subscription =
        await registration.pushManager.getSubscription();

      // No enviamos pruebas sin una suscripción.
      if (!subscription) {
        throw new Error("No existe una suscripción activa.");
      }

      // Pedimos al backend enviar una prueba a este dispositivo.
      await api.post("/push/test", {
        endpoint: subscription.endpoint,
      });

      // Indicamos que el servidor aceptó el envío.
      setMessage(
        "Prueba enviada. Revisa las notificaciones de este dispositivo."
      );

    } catch (error) {

      setMessage(
        error.response?.data?.message ||
        error.message ||
        "No se pudo enviar la prueba."
      );

    } finally {

      setBusy(false);

    }
  }


  // =======================================================
  // INTERFAZ VISUAL
  // =======================================================

  return (
    <section
      className="push-controls"
      aria-label="Notificaciones al teléfono"
      aria-busy={busy}
    >

      {/* Encabezado e información principal. */}
      <div className="push-controls__header">

        {/* Icono institucional destacado. */}
        <span className="push-controls__icon">
          <BellRing size={20} aria-hidden="true" />
        </span>

        {/* Textos del apartado. */}
        <div className="push-controls__information">

          <h3 className="push-controls__title">
            Avisos en mi teléfono
          </h3>

          <p className="push-controls__description">
            Recibe avisos de El Ancla incluso cuando
            cierres la aplicación.
          </p>

        </div>
      </div>

      {/* Aviso para navegadores no compatibles. */}
      {!supported ? (

        <p className="push-controls__unsupported">
          Este navegador no permite activar notificaciones push.
        </p>

      ) : (

        <div className="push-controls__actions">

          {/* Si no está activado, ofrecemos activarlo. */}
          {!enabled ? (

            <button
              type="button"
              className="push-controls__button push-controls__button--primary"
              disabled={busy}
              onClick={activate}
            >

              {/* Mostramos un indicador durante la operación. */}
              {busy ? (
                <LoaderCircle
                  size={18}
                  className="push-controls__spinner"
                  aria-hidden="true"
                />
              ) : (
                <BellRing size={18} aria-hidden="true" />
              )}

              <span>
                {busy ? "Activando..." : "Activar avisos"}
              </span>

            </button>

          ) : (

            <>
              {/* Enviamos una prueba al dispositivo actual. */}
              <button
                type="button"
                className="push-controls__button push-controls__button--secondary"
                disabled={busy}
                onClick={test}
              >

                {busy ? (
                  <LoaderCircle
                    size={17}
                    className="push-controls__spinner"
                    aria-hidden="true"
                  />
                ) : (
                  <Send size={17} aria-hidden="true" />
                )}

                <span>
                  {busy ? "Procesando..." : "Enviar prueba"}
                </span>

              </button>

              {/* Permitimos cancelar los avisos voluntariamente. */}
              <button
                type="button"
                className="push-controls__button push-controls__button--danger"
                disabled={busy}
                onClick={deactivate}
              >

                <BellOff size={17} aria-hidden="true" />

                <span>Desactivar</span>

              </button>
            </>

          )}

        </div>

      )}

      {/* Mensajes accesibles para confirmar o informar errores. */}
      {message && (
        <p
          className="push-controls__message"
          role="status"
        >
          {message}
        </p>
      )}

    </section>
  );
}
