
import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  X,
  UserRound,
  Mail,
  Phone,
  CalendarDays,
  ShieldCheck,
  Building2,
  Save,
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";

import "../../../styles/components/administration/users/UserEditModal.css";


// =========================================================
// FUNCIONES AUXILIARES
// =========================================================

// Convertimos fechas a YYYY-MM-DD para
// utilizarlas en un input type="date".

const formatInputDate = (value) => {

  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  // Usamos componentes UTC para evitar que
  // la fecha cambie por la zona horaria.
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
};


// =========================================================
// OBTENER VALORES INICIALES
// =========================================================

const getInitialValues = (user) => {

  // Si el modelo tiene firstName y lastName,
  // los utilizamos directamente.
  //
  // No dividimos un nombre completo por espacios:
  // hacerlo podría alterar apellidos compuestos.

  return {
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    birthDate: formatInputDate(user?.birthDate),
    role: user?.role || "member",
    branches: Array.isArray(user?.branches)
      ? user.branches
      : [],
  };
};


// =========================================================
// VALIDACIÓN DEL FORMULARIO
// =========================================================

const validateForm = (values) => {

  const errors = {};

  if (!values.firstName.trim()) {
    errors.firstName = "Ingresa los nombres del usuario.";
  }

  if (!values.lastName.trim()) {
    errors.lastName = "Ingresa los apellidos del usuario.";
  }

  if (!values.email.trim()) {

    errors.email = "Ingresa el correo electrónico.";

  } else if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())
  ) {

    errors.email = "Ingresa un correo electrónico válido.";

  }

  if (
    values.phone.trim() &&
    !/^\+?[\d\s()-]{7,20}$/.test(values.phone.trim())
  ) {
    errors.phone = "Ingresa un número de teléfono válido.";
  }

  if (
    !["member", "admin"].includes(values.role)
  ) {
    errors.role = "Selecciona un rol permitido.";
  }

  if (values.birthDate) {

    const date = new Date(`${values.birthDate}T00:00:00Z`);

    if (
      Number.isNaN(date.getTime()) ||
      date > new Date()
    ) {
      errors.birthDate = "Ingresa una fecha válida.";
    }

  }

  return errors;
};


// =========================================================
// COMPONENTE USER EDIT MODAL
// =========================================================

// Propiedades:
//
// user: usuario seleccionado.
// branches: sucursales disponibles.
// onClose: cerrar formulario.
// onSave: guardar los cambios.
//
// onSave recibirá un objeto con los datos
// modificados y deberá devolver una promesa
// cuando integremos el backend.

function UserEditModal({
  user,
  branches = [],
  onClose,
  onSave,
}) {

  // =========================================================
  // REFERENCIAS
  // =========================================================

  const modalRef = useRef(null);

  const closeButtonRef = useRef(null);


  // =========================================================
  // ESTADOS
  // =========================================================

  const [formData, setFormData] = useState(
    () => getInitialValues(user)
  );

  const [errors, setErrors] = useState({});

  const [isSaving, setIsSaving] = useState(false);

  const [saveError, setSaveError] = useState("");

  const [showConfirmation, setShowConfirmation] = useState(false);


  // =========================================================
  // DATOS INICIALES
  // =========================================================

  const initialValues = getInitialValues(user);

  const isProtectedAccount =
    user?.role === "super_admin";


  // =========================================================
  // DETECTAR MODIFICACIONES
  // =========================================================

  const hasChanges =
    JSON.stringify(formData) !==
    JSON.stringify(initialValues);


  // =========================================================
  // ACTUALIZAR FORMULARIO
  // =========================================================

  useEffect(() => {

    setFormData(getInitialValues(user));

    setErrors({});

    setSaveError("");

    setShowConfirmation(false);

  }, [user]);


  // =========================================================
  // CONTROL DE MODAL
  // =========================================================

  useEffect(() => {

    if (!user) {
      return;
    }

    const previousFocus = document.activeElement;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    closeButtonRef.current?.focus();


    const handleKeyDown = (event) => {

      if (event.key === "Escape" && !isSaving) {

        event.preventDefault();

        handleRequestClose();

      }

      if (event.key === "Tab") {

        const elements = modalRef.current?.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        if (!elements?.length) {
          return;
        }

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

    // La lógica de cierre se mantiene dentro
    // del ciclo de vida de este modal.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isSaving, hasChanges, showConfirmation]);


  // =========================================================
  // MODIFICAR CAMPOS
  // =========================================================

  const handleChange = (event) => {

    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: undefined,
    }));

    setSaveError("");

  };


  // =========================================================
  // MODIFICAR SUCURSALES
  // =========================================================

  const handleBranchChange = (branchId, checked) => {

    setFormData((previous) => {

      const updatedBranches = checked
        ? [...previous.branches, branchId]
        : previous.branches.filter(
            (id) => id !== branchId
          );

      return {
        ...previous,
        branches: updatedBranches,
      };

    });

  };


  // =========================================================
  // SOLICITAR CIERRE
  // =========================================================

  const handleRequestClose = () => {

    if (isSaving) {
      return;
    }

    if (showConfirmation) {
      setShowConfirmation(false);
      return;
    }

    if (hasChanges) {

      const shouldClose = window.confirm(
        "Tienes cambios sin guardar. ¿Deseas descartarlos?"
      );

      if (!shouldClose) {
        return;
      }

    }

    onClose?.();

  };


  // =========================================================
  // VALIDAR ANTES DE GUARDAR
  // =========================================================

  const handleSubmit = (event) => {

    event.preventDefault();

    if (
      isProtectedAccount ||
      isSaving ||
      !onSave ||
      !hasChanges
    ) {
      return;
    }

    const validationErrors = validateForm(formData);

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setShowConfirmation(true);

  };


  // =========================================================
  // CONFIRMAR GUARDADO
  // =========================================================

  const handleConfirmSave = async () => {

    if (
      isProtectedAccount ||
      isSaving ||
      !onSave
    ) {
      return;
    }

    setIsSaving(true);
    setSaveError("");

    try {

      // Normalizamos los datos antes de enviarlos.
      const updatedData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        birthDate: formData.birthDate || null,
        role: formData.role,
        branches: formData.branches,
      };

      // El callback deberá ejecutar la actualización
      // real en el backend cuando esté implementada.
      await onSave(user, updatedData);

      setShowConfirmation(false);

      onClose?.();

    } catch (error) {

      setSaveError(
        error?.message ||
        "No fue posible guardar los cambios."
      );

      setShowConfirmation(false);

    } finally {

      setIsSaving(false);

    }

  };


  // =========================================================
  // NO RENDERIZAR SIN USUARIO
  // =========================================================

  if (!user) {
    return null;
  }


  // =========================================================
  // INTERFAZ
  // =========================================================

  return (

    <div
      className="user-edit-modal__overlay"
      onMouseDown={(event) => {

        if (event.target === event.currentTarget) {
          handleRequestClose();
        }

      }}
    >

      <div
        className="user-edit-modal"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-edit-modal-title"
        tabIndex={-1}
      >


        {/* ================================================= */}
        {/* ENCABEZADO */}
        {/* ================================================= */}

        <header className="user-edit-modal__header">

          <div>

            <span className="user-edit-modal__eyebrow">
              Administración de cuentas
            </span>

            <h2 id="user-edit-modal-title">
              Editar usuario
            </h2>

            <p>
              Actualiza la información personal
              y administrativa de la cuenta.
            </p>

          </div>


          <button
            type="button"
            className="user-edit-modal__close"
            onClick={handleRequestClose}
            disabled={isSaving}
            aria-label="Cerrar edición de usuario"
            ref={closeButtonRef}
          >

            <X size={20} aria-hidden="true" />

          </button>

        </header>


        {/* ================================================= */}
        {/* CUENTA PROTEGIDA */}
        {/* ================================================= */}

        {isProtectedAccount && (

          <div className="user-edit-modal__warning">

            <ShieldCheck
              size={20}
              aria-hidden="true"
            />

            <p>
              Las cuentas de superadministrador
              no pueden modificarse desde
              este formulario.
            </p>

          </div>

        )}


        {/* ================================================= */}
        {/* FORMULARIO */}
        {/* ================================================= */}

        <form
          id="user-edit-form"
          className="user-edit-modal__form"
          onSubmit={handleSubmit}
          noValidate
        >


          {/* ================================================= */}
          {/* INFORMACIÓN PERSONAL */}
          {/* ================================================= */}

          <section className="user-edit-modal__section">

            <div className="user-edit-modal__section-heading">

              <UserRound size={18} aria-hidden="true" />

              <h3>Información personal</h3>

            </div>


            <div className="user-edit-modal__grid">


              {/* NOMBRES */}

              <div className="user-edit-modal__field">

                <label htmlFor="edit-user-first-name">
                  Nombres *
                </label>

                <input
                  id="edit-user-first-name"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={isSaving || isProtectedAccount}
                  autoComplete="given-name"
                  aria-invalid={Boolean(errors.firstName)}
                />

                {errors.firstName && (
                  <span className="user-edit-modal__error">
                    {errors.firstName}
                  </span>
                )}

              </div>


              {/* APELLIDOS */}

              <div className="user-edit-modal__field">

                <label htmlFor="edit-user-last-name">
                  Apellidos *
                </label>

                <input
                  id="edit-user-last-name"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={isSaving || isProtectedAccount}
                  autoComplete="family-name"
                  aria-invalid={Boolean(errors.lastName)}
                />

                {errors.lastName && (
                  <span className="user-edit-modal__error">
                    {errors.lastName}
                  </span>
                )}

              </div>


              {/* CORREO */}

              <div className="user-edit-modal__field">

                <label htmlFor="edit-user-email">

                  <Mail size={14} aria-hidden="true" />

                  Correo electrónico *

                </label>

                <input
                  id="edit-user-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isSaving || isProtectedAccount}
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                />

                {errors.email && (
                  <span className="user-edit-modal__error">
                    {errors.email}
                  </span>
                )}

              </div>


              {/* TELÉFONO */}

              <div className="user-edit-modal__field">

                <label htmlFor="edit-user-phone">

                  <Phone size={14} aria-hidden="true" />

                  Teléfono

                </label>

                <input
                  id="edit-user-phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={isSaving || isProtectedAccount}
                  autoComplete="tel"
                  placeholder="+56 9 1234 5678"
                  aria-invalid={Boolean(errors.phone)}
                />

                {errors.phone && (
                  <span className="user-edit-modal__error">
                    {errors.phone}
                  </span>
                )}

              </div>


              {/* FECHA DE NACIMIENTO */}

              <div className="user-edit-modal__field">

                <label htmlFor="edit-user-birth-date">

                  <CalendarDays size={14} aria-hidden="true" />

                  Fecha de nacimiento

                </label>

                <input
                  id="edit-user-birth-date"
                  name="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={handleChange}
                  disabled={isSaving || isProtectedAccount}
                  aria-invalid={Boolean(errors.birthDate)}
                />

                {errors.birthDate && (
                  <span className="user-edit-modal__error">
                    {errors.birthDate}
                  </span>
                )}

              </div>

            </div>

          </section>


          {/* ================================================= */}
          {/* INFORMACIÓN ADMINISTRATIVA */}
          {/* ================================================= */}

          <section className="user-edit-modal__section">

            <div className="user-edit-modal__section-heading">

              <ShieldCheck size={18} aria-hidden="true" />

              <h3>Información administrativa</h3>

            </div>


            <div className="user-edit-modal__grid">


              {/* ROL */}

              <div className="user-edit-modal__field">

                <label htmlFor="edit-user-role">
                  Rol asignado *
                </label>

                <select
                  id="edit-user-role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  disabled={isSaving || isProtectedAccount}
                  aria-invalid={Boolean(errors.role)}
                >

                  <option value="member">
                    Miembro
                  </option>

                  <option value="admin">
                    Administrador
                  </option>

                </select>

                {errors.role && (
                  <span className="user-edit-modal__error">
                    {errors.role}
                  </span>
                )}

              </div>

            </div>


            {/* ============================================= */}
            {/* SUCURSALES AUTORIZADAS */}
            {/* ============================================= */}

            <div className="user-edit-modal__branches">

              <div className="user-edit-modal__branches-heading">

                <Building2
                  size={16}
                  aria-hidden="true"
                />

                <strong>
                  Sucursales autorizadas
                </strong>

              </div>


              {branches.length === 0 ? (

                <p className="user-edit-modal__branches-empty">
                  Todavía no se ha cargado el catálogo
                  de sucursales disponibles.
                </p>

              ) : (

                <div className="user-edit-modal__branch-list">

                  {branches.map((branch) => {

                    const branchId =
                      branch._id || branch.id;

                    const branchName =
                      branch.name ||
                      branch.nombre ||
                      "Sucursal sin nombre";

                    const isSelected =
                      formData.branches.includes(branchId);

                    return (

                      <label
                        className="user-edit-modal__branch"
                        key={branchId}
                      >

                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={isSaving || isProtectedAccount}
                          onChange={(event) => {
                            handleBranchChange(
                              branchId,
                              event.target.checked
                            );
                          }}
                        />

                        <span>
                          {branchName}
                        </span>

                      </label>

                    );

                  })}

                </div>

              )}

            </div>

          </section>


          {/* ================================================= */}
          {/* ERRORES GENERALES */}
          {/* ================================================= */}

          {saveError && (

            <div
              className="user-edit-modal__save-error"
              role="alert"
            >

              <AlertCircle
                size={18}
                aria-hidden="true"
              />

              <span>
                {saveError}
              </span>

            </div>

          )}


          {/* ================================================= */}
          {/* AVISO DE CAMBIOS */}
          {/* ================================================= */}

          {hasChanges && !showConfirmation && (

            <div className="user-edit-modal__changes">

              <AlertCircle
                size={17}
                aria-hidden="true"
              />

              <span>
                Tienes modificaciones pendientes de guardar.
              </span>

            </div>

          )}


          {/* ================================================= */}
          {/* CONFIRMACIÓN */}
          {/* ================================================= */}

          {showConfirmation && (

            <div className="user-edit-modal__confirmation">

              <div className="user-edit-modal__confirmation-heading">

                <ShieldCheck
                  size={19}
                  aria-hidden="true"
                />

                <strong>
                  Confirmar modificaciones
                </strong>

              </div>

              <p>
                ¿Deseas guardar los cambios realizados
                en esta cuenta?
              </p>

              <div className="user-edit-modal__confirmation-actions">

                <button
                  type="button"
                  className="user-edit-modal__cancel-confirm"
                  disabled={isSaving}
                  onClick={() => {
                    setShowConfirmation(false);
                  }}
                >
                  Volver
                </button>

                <button
                  type="button"
                  className="user-edit-modal__confirm"
                  disabled={isSaving}
                  onClick={handleConfirmSave}
                >

                  {isSaving ? (

                    <>
                      <LoaderCircle
                        className="user-edit-modal__spinner"
                        size={16}
                        aria-hidden="true"
                      />

                      Guardando...
                    </>

                  ) : (

                    <>
                      <CheckCircle2
                        size={16}
                        aria-hidden="true"
                      />

                      Confirmar
                    </>

                  )}

                </button>

              </div>

            </div>

          )}

        </form>


        {/* ================================================= */}
        {/* PIE DEL MODAL */}
        {/* ================================================= */}

        <footer className="user-edit-modal__footer">

          <button
            type="button"
            className="user-edit-modal__cancel"
            disabled={isSaving}
            onClick={handleRequestClose}
          >
            Cancelar
          </button>


          {!showConfirmation && (

            <button
              type="submit"
              form="user-edit-form"
              className="user-edit-modal__save"
              disabled={
                isSaving ||
                isProtectedAccount ||
                !hasChanges ||
                !onSave
              }
            >

              <Save
                size={17}
                aria-hidden="true"
              />

              Guardar cambios

            </button>

          )}

        </footer>

      </div>

    </div>
  );
}


// =========================================================
// EXPORTACIÓN
// =========================================================

export default UserEditModal;
