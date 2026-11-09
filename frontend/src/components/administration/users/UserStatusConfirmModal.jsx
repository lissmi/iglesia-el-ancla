// Modal de confirmación para activar o desactivar cuentas desde el panel.
import { useEffect, useRef } from "react";
import { LockKeyhole, UnlockKeyhole, X, AlertCircle, LoaderCircle } from "lucide-react";
import "../../../styles/components/administration/users/UserStatusConfirmModal.css";

function UserStatusConfirmModal({ user, processing = false, onConfirm, onClose }) {
  // Determinamos la acción según el estado real almacenado en MongoDB.
  const enabling = user?.isActive === false;
  // Identificamos a la persona sin mostrar datos sensibles innecesarios.
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email || "este usuario";
  // El botón de cancelar se enfoca al abrir: es la opción menos destructiva.
  const cancelButton = useRef(null);
  // Recordamos el elemento previamente enfocado para restaurar la navegación.
  const previousFocus = useRef(null);

  useEffect(() => {
    // Guardamos el foco antes de presentar el diálogo.
    previousFocus.current = document.activeElement;
    // Evitamos el desplazamiento accidental de la página de fondo.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Situamos el foco en el botón seguro.
    cancelButton.current?.focus();
    // Retiramos los efectos al cerrar la ventana.
    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus.current?.focus?.();
    };
  }, []);

  // Mientras la solicitud está activa, no se permite cancelar a mitad del proceso.
  useEffect(() => {
    const onKeyDown = (event) => {
      // Escape cierra únicamente cuando no hay una operación pendiente.
      if (event.key === "Escape") {
        event.preventDefault();
        if (!processing) onClose();
      }
      // Mantenemos el foco dentro del diálogo para navegación accesible.
      if (event.key === "Tab") {
        const modal = document.getElementById("user-status-confirm-dialog");
        const focusable = [...(modal?.querySelectorAll('button:not([disabled])') || [])];
        if (!focusable.length) { event.preventDefault(); return; }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault(); last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault(); first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [processing, onClose]);

  return (
    <div
      className="user-status-confirm__overlay"
      onMouseDown={(event) => {
        // Un clic fuera del diálogo lo cierra, pero nunca confirma la acción.
        if (event.target === event.currentTarget && !processing) onClose();
      }}
    >
      <div
        id="user-status-confirm-dialog"
        className="user-status-confirm__dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="user-status-confirm-title"
        aria-describedby="user-status-confirm-description"
      >
        <button type="button" className="user-status-confirm__close" aria-label="Cerrar ventana" onClick={onClose} disabled={processing}>
          <X size={19} aria-hidden="true" />
        </button>
        <div className={`user-status-confirm__icon ${enabling ? "user-status-confirm__icon--enable" : "user-status-confirm__icon--disable"}`}>
          {enabling ? <UnlockKeyhole size={26} strokeWidth={1.8} aria-hidden="true" /> : <LockKeyhole size={26} strokeWidth={1.8} aria-hidden="true" />}
        </div>
        <span className="user-status-confirm__eyebrow">Administración de usuarios</span>
        <h2 id="user-status-confirm-title">{enabling ? "¿Activar esta cuenta?" : "¿Desactivar esta cuenta?"}</h2>
        <p id="user-status-confirm-description" className="user-status-confirm__description">
          {enabling
            ? <>Vas a permitir que <strong>{displayName}</strong> vuelva a iniciar sesión en El Ancla.</>
            : <>Vas a desactivar el acceso de <strong>{displayName}</strong> a la plataforma El Ancla.</>}
        </p>
        <div className="user-status-confirm__note">
          <AlertCircle size={19} aria-hidden="true" />
          <p>{enabling
            ? "La cuenta volverá a estar habilitada. La persona deberá iniciar sesión con sus credenciales."
            : "Las sesiones anteriores quedarán revocadas. Sus datos y su historial permanecerán guardados."}</p>
        </div>
        <div className="user-status-confirm__actions">
          <button type="button" className="user-status-confirm__cancel" onClick={onClose} disabled={processing} ref={cancelButton}>
            Cancelar
          </button>
          <button type="button" className={`user-status-confirm__accept ${enabling ? "user-status-confirm__accept--enable" : ""}`} onClick={onConfirm} disabled={processing}>
            {processing ? <LoaderCircle className="user-status-confirm__spinner" size={18} aria-hidden="true" /> : enabling ? <UnlockKeyhole size={17} aria-hidden="true" /> : <LockKeyhole size={17} aria-hidden="true" />}
            {processing ? "Procesando..." : enabling ? "Sí, activar cuenta" : "Sí, desactivar cuenta"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserStatusConfirmModal;
