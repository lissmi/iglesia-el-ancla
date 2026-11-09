import { useEffect, useRef } from "react";
import {
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  Save,
  X,
} from "lucide-react";
import "../../../styles/components/administration/users/UserEditConfirmModal.css";

function UserEditConfirmModal({
  user,
  processing = false,
  onConfirm,
  onClose,
}) {
  const cancelButtonRef = useRef(null);
  const previousFocusRef = useRef(null);

  const displayName = [
    user?.firstName,
    user?.lastName,
  ]
    .filter(Boolean)
    .join(" ") || user?.email || "este usuario";

  useEffect(() => {
    previousFocusRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus?.();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();

        if (!processing) {
          onClose?.();
        }
      }

      if (event.key === "Tab") {
        const modal = document.getElementById(
          "user-edit-confirm-dialog"
        );

        const focusableElements = [
          ...(modal?.querySelectorAll(
            'button:not([disabled])'
          ) || []),
        ];

        if (!focusableElements.length) {
          event.preventDefault();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement =
          focusableElements[
            focusableElements.length - 1
          ];

        if (
          event.shiftKey &&
          document.activeElement === firstElement
        ) {
          event.preventDefault();
          lastElement.focus();
        } else if (
          !event.shiftKey &&
          document.activeElement === lastElement
        ) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [processing, onClose]);

  return (
    <div
      className="user-edit-confirm__overlay"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !processing
        ) {
          onClose?.();
        }
      }}
    >
      <div
        id="user-edit-confirm-dialog"
        className="user-edit-confirm__dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="user-edit-confirm-title"
        aria-describedby="user-edit-confirm-description"
      >
        <button
          type="button"
          className="user-edit-confirm__close"
          onClick={onClose}
          disabled={processing}
          aria-label="Cerrar ventana"
        >
          <X size={19} aria-hidden="true" />
        </button>

        <div className="user-edit-confirm__icon">
          <Save
            size={26}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </div>

        <span className="user-edit-confirm__eyebrow">
          Administración de usuarios
        </span>

        <h2 id="user-edit-confirm-title">
          ¿Guardar estos cambios?
        </h2>

        <p
          id="user-edit-confirm-description"
          className="user-edit-confirm__description"
        >
          Vas a actualizar la información de
          <strong> {displayName}</strong> en la plataforma
          El Ancla.
        </p>

        <div className="user-edit-confirm__note">
          <AlertCircle size={19} aria-hidden="true" />

          <p>
            Los cambios se guardarán en MongoDB.
            Las sesiones anteriores de esta cuenta
            quedarán cerradas y la persona deberá
            volver a iniciar sesión.
          </p>
        </div>

        <div className="user-edit-confirm__actions">
          <button
            type="button"
            className="user-edit-confirm__cancel"
            onClick={onClose}
            disabled={processing}
            ref={cancelButtonRef}
          >
            Volver
          </button>

          <button
            type="button"
            className="user-edit-confirm__accept"
            onClick={onConfirm}
            disabled={processing}
          >
            {processing ? (
              <>
                <LoaderCircle
                  className="user-edit-confirm__spinner"
                  size={18}
                  aria-hidden="true"
                />
                Guardando...
              </>
            ) : (
              <>
                <CheckCircle2
                  size={17}
                  aria-hidden="true"
                />
                Sí, guardar cambios
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserEditConfirmModal;
