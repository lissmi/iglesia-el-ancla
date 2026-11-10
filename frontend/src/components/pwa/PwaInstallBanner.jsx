
import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

import "../../styles/components/pwa/PwaInstallBanner.css";

// Clave para recordar temporalmente si se cerró el aviso.
const DISMISS_KEY = "el-ancla:pwa-install-dismissed";

// No volver a mostrar automáticamente durante siete días.
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000;

function PwaInstallBanner() {
  // Guarda el evento de instalación proporcionado por Chrome.
  const [installPrompt, setInstallPrompt] = useState(null);

  // Controla si la persona debe ver el aviso.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Comprueba si estamos dentro de una PWA instalada.
    const standalone = window.matchMedia(
      "(display-mode: standalone)"
    ).matches;

    // Si ya estamos en modo aplicación, no mostramos el aviso.
    if (standalone) return undefined;

    // Comprueba cuándo se descartó el aviso anteriormente.
    const dismissed = Number(
      localStorage.getItem(DISMISS_KEY) || 0
    );

    // Evita mostrarlo nuevamente demasiado pronto.
    const recentlyDismissed =
      Date.now() - dismissed < DISMISS_DURATION;

    // Recibe el evento cuando Chrome permite instalar la PWA.
    const handleBeforeInstall = (event) => {
      // Conserva la instalación para nuestro botón.
      event.preventDefault();

      // Guarda el evento para utilizarlo al hacer clic.
      setInstallPrompt(event);

      // Muestra el aviso solamente si no fue descartado.
      if (!recentlyDismissed) {
        setVisible(true);
      }
    };

    // Si se instala correctamente, ocultamos el aviso.
    const handleInstalled = () => {
      setVisible(false);
      setInstallPrompt(null);
      localStorage.removeItem(DISMISS_KEY);
    };

    // Escucha los eventos correspondientes.
    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstall
    );

    window.addEventListener(
      "appinstalled",
      handleInstalled
    );

    // Limpia los eventos al desmontar el componente.
    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstall
      );

      window.removeEventListener(
        "appinstalled",
        handleInstalled
      );
    };
  }, []);

  // Abre la ventana de instalación del navegador.
  const handleInstall = async () => {
    // Si Chrome no entregó un evento válido, no continuamos.
    if (!installPrompt) return;

    // Solo puede utilizarse una vez.
    const promptEvent = installPrompt;
    setInstallPrompt(null);
    setVisible(false);

    try {
      // Solicita al navegador mostrar la instalación.
      await promptEvent.prompt();

      // Espera la decisión del usuario.
      const result = await promptEvent.userChoice;

      // Si se rechazó, respetamos la decisión temporalmente.
      if (result.outcome !== "accepted") {
        localStorage.setItem(
          DISMISS_KEY,
          String(Date.now())
        );
      }
    } catch (error) {
      // Registra un problema sin impedir el uso de la web.
      console.warn(
        "No se pudo abrir la instalación:",
        error
      );
    }
  };

  // Cierra el aviso y recuerda la elección.
  const handleDismiss = () => {
    localStorage.setItem(
      DISMISS_KEY,
      String(Date.now())
    );

    setVisible(false);
  };

  // No renderiza nada si la instalación no está disponible.
  if (!visible || !installPrompt) return null;

  return (
    <aside
      className="pwa-install"
      aria-label="Instalar aplicación Iglesia El Ancla"
    >
      <button
        type="button"
        className="pwa-install__close"
        onClick={handleDismiss}
        aria-label="Cerrar aviso"
      >
        <X size={18} />
      </button>

      <div className="pwa-install__content">
        <img
          src="/logo-el-ancla.png"
          alt="Logo Iglesia El Ancla"
          className="pwa-install__logo"
        />

        <div>
          <h2>¡Lleva El Ancla contigo! ⚓</h2>

          <p>
            Instala gratis nuestra aplicación en tu
            teléfono y accede fácilmente a la comunidad.
          </p>
        </div>
      </div>

      <button
        type="button"
        className="pwa-install__button"
        onClick={handleInstall}
      >
        <Download size={17} />
        Instalar aplicación
      </button>
    </aside>
  );
}

export default PwaInstallBanner;
