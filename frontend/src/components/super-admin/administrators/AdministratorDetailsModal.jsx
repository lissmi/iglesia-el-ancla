

import { useEffect, useRef } from "react";

import {
  X,
  ShieldCheck,
  Mail,
  Phone,
  CalendarDays,
  Building2,
  Clock3,
  LockKeyhole,
  Info,
} from "lucide-react";

import "../../../styles/components/super-admin/administrators/AdministratorDetailsModal.css";


// =========================================================
// FUNCIONES AUXILIARES
// =========================================================

const formatDate = (value) => {

  if (!value) return "No registrado";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "No registrado";
  }

  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
};


function DetailItem({ icon: Icon, label, value }) {

  return (
    <div className="administrator-details__item">
      <Icon size={17} aria-hidden="true" />

      <div>
        <span>{label}</span>
        <strong>{value || "No registrado"}</strong>
      </div>
    </div>
  );
}


// =========================================================
// MODAL
// =========================================================

function AdministratorDetailsModal({
  administrator,
  onClose,
}) {

  const dialogRef = useRef(null);
  const closeRef = useRef(null);

  const isSuperAdmin =
    administrator?.role === "super_admin";


  // =========================================================
  // ACCESIBILIDAD
  // =========================================================

  useEffect(() => {

    if (!administrator) return;

    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    closeRef.current?.focus();

    const handleKeyDown = (event) => {

      if (event.key === "Escape") {
        onClose();
      }

      if (event.key === "Tab") {

        const elements = Array.from(
          dialogRef.current?.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
          ) || []
        );

        if (!elements.length) return;

        const first = elements[0];
        const last = elements[elements.length - 1];

        if (
          event.shiftKey &&
          document.activeElement === first
        ) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          document.activeElement === last
        ) {
          event.preventDefault();
          first.focus();
        }
      }

    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus?.();
    };

  }, [administrator, onClose]);


  if (!administrator) return null;


  const fullName =
    `${administrator.firstName} ${administrator.lastName}`;

  const sucursales =
    Array.isArray(administrator.sucursales)
      ? administrator.sucursales
      : [];


  return (
    <div
      className="administrator-details__overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >

      <div
        className="administrator-details"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="administrator-details-title"
        tabIndex={-1}
      >

        <header className="administrator-details__header">

          <div>
            <span className="administrator-details__eyebrow">
              Gestión administrativa
            </span>

            <h2 id="administrator-details-title">
              Detalles del administrador
            </h2>

            <p>
              Información de la cuenta y sus accesos.
            </p>
          </div>

          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar detalles"
          >
            <X size={20} />
          </button>

        </header>


        <div className="administrator-details__body">

          <div className="administrator-details__profile">

            <div className="administrator-details__avatar">
              {administrator.firstName?.[0]}
              {administrator.lastName?.[0]}
            </div>

            <div>
              <h3>{fullName}</h3>
              <p>{administrator.email}</p>

              <span className="administrator-details__role">
                <ShieldCheck size={14} />

                {isSuperAdmin
                  ? "Superadministrador"
                  : "Administrador"}
              </span>
            </div>

          </div>


          {isSuperAdmin && (
            <div className="administrator-details__protected">
              <LockKeyhole size={18} />
              <span>
                Cuenta protegida. Su modificación
                requiere controles especiales.
              </span>
            </div>
          )}


          <section className="administrator-details__section">

            <h3>Información personal</h3>

            <div className="administrator-details__grid">

              <DetailItem
                icon={Mail}
                label="Correo electrónico"
                value={administrator.email}
              />

              <DetailItem
                icon={Phone}
                label="Teléfono"
                value={administrator.phone}
              />

              <DetailItem
                icon={CalendarDays}
                label="Fecha de nacimiento"
                value={formatDate(administrator.birthDate)}
              />

              <DetailItem
                icon={Clock3}
                label="Último inicio de sesión"
                value={formatDate(administrator.lastLoginAt)}
              />

            </div>

          </section>


          <section className="administrator-details__section">

            <h3>Sucursales autorizadas</h3>

            <div className="administrator-details__branches">

              {sucursales.length > 0 ? (

                sucursales.map((branch) => {

                  const branchId =
                    branch._id || branch.id;

                  const mainBranchId =
                    administrator.sucursalPrincipal?._id ||
                    administrator.sucursalPrincipal?.id ||
                    administrator.sucursalPrincipal;

                  const isMain =
                    String(branchId) === String(mainBranchId);

                  return (
                    <div
                      key={branchId}
                      className="administrator-details__branch"
                    >
                      <Building2 size={17} />

                      <div>
                        <strong>{branch.name}</strong>
                        <span>{branch.code}</span>
                      </div>

                      {isMain && (
                        <span className="administrator-details__main">
                          Principal
                        </span>
                      )}
                    </div>
                  );
                })

              ) : (

                <p className="administrator-details__empty">
                  No hay sucursales disponibles.
                </p>

              )}

            </div>

          </section>


          <section className="administrator-details__section">

            <h3>Estado de la cuenta</h3>

            <div className="administrator-details__grid">

              <DetailItem
                icon={ShieldCheck}
                label="Estado"
                value={
                  administrator.isActive
                    ? "Activa"
                    : "Desactivada"
                }
              />

              <DetailItem
                icon={CalendarDays}
                label="Fecha de registro"
                value={formatDate(administrator.createdAt)}
              />

            </div>

          </section>


          <div className="administrator-details__notice">
            <Info size={17} />
            <span>
              Esta ventana es solo de consulta.
              Si necesitas modificar una cuenta, utiliza
              la sección Gestión de usuarios.
            </span>
          </div>

        </div>


        <footer className="administrator-details__footer">

          <button type="button" onClick={onClose}>
            Cerrar
          </button>

        </footer>

      </div>

    </div>
  );
}

export default AdministratorDetailsModal;




