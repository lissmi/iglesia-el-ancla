
import { useEffect, useRef } from "react";

import {
  X,
  UserRound,
  Mail,
  Phone,
  CalendarDays,
  ShieldCheck,
  Clock3,
  LockKeyhole,
  Building2,
} from "lucide-react";

import "../../../styles/components/administration/users/UserDetailsModal.css";


// =========================================================
// FUNCIONES AUXILIARES
// =========================================================

// Obtiene el nombre del usuario considerando
// distintas estructuras posibles del modelo.

const getUserName = (user) => {

  const fullName =
    user?.name ||
    user?.fullName ||
    [
      user?.firstName,
      user?.lastName,
    ].filter(Boolean).join(" ");

  return fullName?.trim() || "Sin nombre";
};


// =========================================================
// INICIALES DEL USUARIO
// =========================================================

const getInitials = (name) => {

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
};


// =========================================================
// FORMATEAR FECHAS
// =========================================================

const formatDate = (value) => {

  if (!value) {
    return "No registrada";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "No registrada";
  }

  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};


// =========================================================
// FORMATEAR ROL
// =========================================================

const getRoleLabel = (role) => {

  const labels = {
    member: "Miembro",
    admin: "Administrador",
    super_admin: "Superadministrador",
  };

  return labels[role] || "Sin asignar";
};


// =========================================================
// COMPONENTE DE INFORMACIÓN
// =========================================================

// Reutilizamos este componente para mostrar
// campos individuales dentro del modal.

function UserDetailField({
  icon: Icon,
  label,
  value,
}) {

  return (

    <div className="user-details-modal__field">

      <div className="user-details-modal__field-label">

        <Icon
          size={15}
          strokeWidth={1.8}
          aria-hidden="true"
        />

        <span>
          {label}
        </span>

      </div>

      <strong className="user-details-modal__field-value">
        {value || "No registrado"}
      </strong>

    </div>
  );
}


// =========================================================
// MODAL DE DETALLES DE USUARIO
// =========================================================

// Propiedades:
//
// user: objeto con la información de la cuenta.
// onClose: función que cierra el modal.
//
// Si user es null, no se muestra el componente.

function UserDetailsModal({
  user,
  onClose,
}) {

  // =========================================================
  // REFERENCIAS
  // =========================================================

  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);


  // =========================================================
  // EFECTOS DEL MODAL
  // =========================================================

  useEffect(() => {

    if (!user) {
      return;
    }

    // Guardamos el elemento que tenía el foco
    // antes de abrir el modal.
    const previousFocus = document.activeElement;

    // Bloqueamos el desplazamiento del fondo.
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    // Enfocamos el botón de cierre.
    closeButtonRef.current?.focus();


    // =====================================================
    // CONTROL DE TECLADO
    // =====================================================

    const handleKeyDown = (event) => {

      // Cerrar mediante Escape.
      if (event.key === "Escape") {

        event.preventDefault();

        onClose?.();

        return;
      }

      // Mantener el foco dentro del modal.
      if (event.key === "Tab") {

        const focusableElements =
          modalRef.current?.querySelectorAll(
            'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          );

        if (!focusableElements?.length) {
          return;
        }

        const firstElement = focusableElements[0];

        const lastElement =
          focusableElements[focusableElements.length - 1];

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


    document.addEventListener(
      "keydown",
      handleKeyDown
    );


    // =====================================================
    // LIMPIEZA
    // =====================================================

    return () => {

      document.body.style.overflow = previousOverflow;

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      previousFocus?.focus?.();

    };

  }, [user, onClose]);


  // =========================================================
  // NO RENDERIZAR SIN USUARIO
  // =========================================================

  if (!user) {
    return null;
  }


  // =========================================================
  // DATOS DEL USUARIO
  // =========================================================

  const userName = getUserName(user);

  const initials = getInitials(userName);

  const isBlocked = user.isBlocked === true;

  const roleLabel = getRoleLabel(user.role);

  // Normalizamos la información de sucursales
  // cuando exista en el objeto recibido.

  const branches = Array.isArray(user.branches)
    ? user.branches
    : [];

  const branchNames = branches
    .map((branch) => {

      if (typeof branch === "string") {
        return branch;
      }

      return branch.name || branch.nombre || "";

    })
    .filter(Boolean)
    .join(", ");


  // =========================================================
  // CERRAR DESDE EL FONDO
  // =========================================================

  const handleOverlayClick = (event) => {

    if (event.target === event.currentTarget) {
      onClose?.();
    }

  };


  // =========================================================
  // INTERFAZ
  // =========================================================

  return (

    <div
      className="user-details-modal__overlay"
      onMouseDown={handleOverlayClick}
    >

      <div
        className="user-details-modal"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-details-modal-title"
        aria-describedby="user-details-modal-description"
        tabIndex={-1}
      >


        {/* ================================================= */}
        {/* ENCABEZADO */}
        {/* ================================================= */}

        <header className="user-details-modal__header">

          <div>

            <span className="user-details-modal__eyebrow">
              Administración de cuentas
            </span>

            <h2 id="user-details-modal-title">
              Detalles del usuario
            </h2>

            <p id="user-details-modal-description">
              Información registrada de la cuenta seleccionada.
            </p>

          </div>


          <button
            className="user-details-modal__close"
            type="button"
            aria-label="Cerrar detalles del usuario"
            onClick={onClose}
            ref={closeButtonRef}
          >

            <X
              size={20}
              strokeWidth={2}
              aria-hidden="true"
            />

          </button>

        </header>


        {/* ================================================= */}
        {/* PERFIL DEL USUARIO */}
        {/* ================================================= */}

        <div className="user-details-modal__profile">

          <div className="user-details-modal__avatar">
            {initials}
          </div>


          <div className="user-details-modal__profile-info">

            <h3>
              {userName}
            </h3>

            <span className="user-details-modal__profile-email">
              {user.email || "Sin correo registrado"}
            </span>


            <div className="user-details-modal__badges">

              <span
                className={`
                  user-details-modal__role
                  user-details-modal__role--${user.role || "unknown"}
                `}
              >
                {roleLabel}
              </span>


              <span
                className={`
                  user-details-modal__status
                  ${
                    isBlocked
                      ? "user-details-modal__status--blocked"
                      : "user-details-modal__status--active"
                  }
                `}
              >
                {isBlocked ? "Bloqueado" : "Activo"}
              </span>

            </div>

          </div>

        </div>


        {/* ================================================= */}
        {/* INFORMACIÓN PERSONAL */}
        {/* ================================================= */}

        <section className="user-details-modal__section">

          <div className="user-details-modal__section-heading">

            <UserRound
              size={18}
              strokeWidth={1.8}
              aria-hidden="true"
            />

            <h3>
              Información personal
            </h3>

          </div>


          <div className="user-details-modal__grid">

            <UserDetailField
              icon={UserRound}
              label="Nombre completo"
              value={userName}
            />

            <UserDetailField
              icon={Mail}
              label="Correo electrónico"
              value={user.email}
            />

            <UserDetailField
              icon={Phone}
              label="Teléfono"
              value={user.phone}
            />

            <UserDetailField
              icon={CalendarDays}
              label="Fecha de nacimiento"
              value={formatDate(user.birthDate)}
            />

          </div>

        </section>


        {/* ================================================= */}
        {/* INFORMACIÓN DE LA CUENTA */}
        {/* ================================================= */}

        <section className="user-details-modal__section">

          <div className="user-details-modal__section-heading">

            <ShieldCheck
              size={18}
              strokeWidth={1.8}
              aria-hidden="true"
            />

            <h3>
              Información de la cuenta
            </h3>

          </div>


          <div className="user-details-modal__grid">

            <UserDetailField
              icon={ShieldCheck}
              label="Rol asignado"
              value={roleLabel}
            />

            <UserDetailField
              icon={LockKeyhole}
              label="Estado de acceso"
              value={isBlocked ? "Bloqueado" : "Activo"}
            />

            <UserDetailField
              icon={CalendarDays}
              label="Fecha de registro"
              value={formatDate(user.createdAt)}
            />

            <UserDetailField
              icon={Clock3}
              label="Último acceso"
              value={formatDate(user.lastLogin)}
            />

            <UserDetailField
              icon={Building2}
              label="Sucursales autorizadas"
              value={branchNames || "Sin información"}
            />

          </div>

        </section>


        {/* ================================================= */}
        {/* INFORMACIÓN DE SEGURIDAD */}
        {/* ================================================= */}

        <div className="user-details-modal__notice">

          <LockKeyhole
            size={18}
            strokeWidth={1.8}
            aria-hidden="true"
          />

          <p>
            Esta ventana permite consultar la información
            de la cuenta. La edición de datos y la
            administración de permisos se realizarán
            mediante funcionalidades independientes.
          </p>

        </div>


        {/* ================================================= */}
        {/* PIE DEL MODAL */}
        {/* ================================================= */}

        <footer className="user-details-modal__footer">

          <button
            className="user-details-modal__done"
            type="button"
            onClick={onClose}
          >
            Cerrar
          </button>

        </footer>

      </div>

    </div>
  );
}


// =========================================================
// EXPORTACIÓN
// =========================================================

export default UserDetailsModal;
