
import { useEffect, useState } from "react";
import api from "../../../services/api";

import {
  UserRound,
  Mail,
  Phone,
  CalendarDays,
  ShieldCheck,
  Building2,
  ClipboardCheck,
  RotateCcw,
  UserPlus,
  Info,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import "../../../styles/components/administration/users/RegisterUserForm.css";


// =========================================================
// FORMULARIO INICIAL
// =========================================================

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  birthDate: "",
  role: "member",
  sucursales: [],
  sucursalPrincipal: "",
};


// =========================================================
// FUNCIONES AUXILIARES
// =========================================================

// =========================================================
// REGLAS DE FORMATO COMPARTIDAS CON EL BACKEND
// =========================================================

// Máximo de caracteres del correo institucional o personal.
const EMAIL_MAX_LENGTH = 50;

// En el formulario solo se escriben los ocho dígitos del móvil chileno.
// El prefijo +56 9 es fijo y se agrega únicamente al enviar el registro.
const CHILE_MOBILE_PREFIX = "+56 9";
const CHILE_MOBILE_DIGITS = 8;

// El correo exige un nombre, @ y un dominio completo sin espacios.
const EMAIL_PATTERN = /^[^\s@<>()[\],;:"\\]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

// Validamos estructura y longitudes antes de aceptar el correo.
function isValidRegistrationEmail(value) {
  if (typeof value !== "string" || value.length > EMAIL_MAX_LENGTH) return false;
  const localPart = value.split("@")[0] || "";
  if (!localPart || localPart.length > 64 || localPart.startsWith(".") || localPart.endsWith(".") || localPart.includes("..")) return false;
  return EMAIL_PATTERN.test(value);
}

// No se exige teléfono; si se indica, debe contener exactamente ocho números.
// La indicación +56 9 se muestra fija en el formulario y no se puede alterar.
function isValidOptionalPhone(value) {
  return typeof value === "string" && (value === "" || /^\d{8}$/.test(value));
}

// Convertimos los ocho dígitos al formato que guardará el backend.
// Cuando el campo está vacío, NO enviamos el prefijo solo.
function formatChileMobileForApi(digits) {
  if (!digits) return "";
  return `${CHILE_MOBILE_PREFIX} ${digits.slice(0, 4)} ${digits.slice(4)}`;
}

const getRoleLabel = (role) => {
  return role === "admin"
    ? "Administrador"
    : "Miembro";
};


const validateForm = (values) => {

  const errors = {};

  const firstName = values.firstName.trim();
  const lastName = values.lastName.trim();
  const email = values.email.trim();
  const phone = values.phone.trim();

  if (firstName.length < 2 || firstName.length > 60) {
    errors.firstName =
      "Los nombres deben tener entre 2 y 60 caracteres.";
  }

  if (lastName.length < 2 || lastName.length > 60) {
    errors.lastName =
      "Los apellidos deben tener entre 2 y 60 caracteres.";
  }

  // El correo es obligatorio, debe tener formato válido y máximo 50 caracteres.
  if (!isValidRegistrationEmail(email)) {
    errors.email = "Ingresa un correo válido (ej. nombre@correo.cl, máximo 50 caracteres).";
  }

  // El teléfono es opcional, pero no permitimos números incompletos.
  if (!isValidOptionalPhone(phone)) {
    errors.phone = "Escribe los 8 números del celular o deja el campo vacío.";
  }

  if (!values.birthDate) {

    errors.birthDate =
      "La fecha de nacimiento es obligatoria.";

  } else {

    const date = new Date(
      `${values.birthDate}T00:00:00Z`
    );

    const isValidDate =
      !Number.isNaN(date.getTime()) &&
      date.toISOString().slice(0, 10) ===
        values.birthDate;

    if (!isValidDate || date > new Date()) {
      errors.birthDate =
        "La fecha de nacimiento no es válida.";
    }

  }

  if (!["member", "admin"].includes(values.role)) {
    errors.role = "Selecciona un rol válido.";
  }

  if (values.sucursales.length === 0) {
    errors.sucursales =
      "Selecciona al menos una sucursal.";
  }

  if (
    !values.sucursalPrincipal ||
    !values.sucursales.includes(
      values.sucursalPrincipal
    )
  ) {
    errors.sucursalPrincipal =
      "Selecciona una sucursal principal válida.";
  }

  return errors;
};


// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function RegisterUserForm({
  mode = "admin",
}) {

  // =========================================================
  // ESTADOS
  // =========================================================

  const [formData, setFormData] = useState({
    ...EMPTY_FORM,
    sucursales: [...EMPTY_FORM.sucursales],
  });

  const [errors, setErrors] = useState({});

  const [showConfirmation, setShowConfirmation] =
    useState(false);

  // Sucursales reales autorizadas para la cuenta administradora.
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [branchesError, setBranchesError] = useState("");
  const [reloadBranches, setReloadBranches] = useState(0);

  // Controlamos el envío para evitar registros duplicados.
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(null);
  const [resendLoading, setResendLoading] = useState(false);

  // La API entrega únicamente las sedes permitidas para este administrador.
  useEffect(() => {
    const controller = new AbortController();
    setLoadingBranches(true);
    setBranchesError("");

    api.get("/users/registration-branches", { signal: controller.signal })
      .then(({ data }) => {
        if (!data?.success || !Array.isArray(data.branches)) {
          throw new Error("No fue posible obtener las sucursales.");
        }
        const received = data.branches;
        setBranches(received);
        setFormData((previous) => {
          const valid = previous.sucursales.filter((id) =>
            received.some((branch) => branch.id === id)
          );
          // Seleccionamos la única sede disponible automáticamente.
          const selected = valid.length === 0 && received.length === 1
            ? [received[0].id]
            : valid;
          return {
            ...previous,
            sucursales: selected,
            sucursalPrincipal: selected.includes(previous.sucursalPrincipal)
              ? previous.sucursalPrincipal
              : selected[0] || "",
          };
        });
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setBranchesError(error.response?.data?.message || error.message || "No se cargaron las sedes.");
        setBranches([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingBranches(false);
      });

    return () => controller.abort();
  }, [reloadBranches]);


  // =========================================================
  // PERMISOS VISUALES
  // =========================================================

  // El backend verifica nuevamente el rol y las sucursales reales.

  const isSuperAdmin = mode === "super_admin";

  const availableRoles = isSuperAdmin
    ? [
        { value: "member", label: "Miembro" },
        { value: "admin", label: "Administrador" },
      ]
    : [
        { value: "member", label: "Miembro" },
      ];


  // =========================================================
  // INFORMACIÓN PARA LA VISTA PREVIA
  // =========================================================

  const fullName = [
    formData.firstName.trim(),
    formData.lastName.trim(),
  ].filter(Boolean).join(" ");

  const initials = fullName
    ? fullName
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("")
    : "EA";

  const mainBranch = branches.find(
    (branch) =>
      String(branch.id || branch._id) ===
      formData.sucursalPrincipal
  );

  const hasErrors =
    Object.values(errors).some(Boolean);


  // =========================================================
  // ACTUALIZAR CAMPOS
  // =========================================================

  const handleChange = (event) => {

    const { name, value } = event.target;

    // El correo se escribe sin espacios y se mantiene dentro del límite.
    let nextValue = name === "email"
      ? value.replace(/\s/g, "").slice(0, EMAIL_MAX_LENGTH)
      : value;

    if (name === "phone") {
      // Aceptamos solo dígitos aunque se peguen letras o separadores.
      let digits = value.replace(/\D/g, "");

      // Si pegaron un número chileno completo, quitamos el prefijo 569.
      if (digits.startsWith("569") && digits.length === 11) {
        digits = digits.slice(3);
      }

      // El administrador solo puede ingresar los ocho dígitos restantes.
      nextValue = digits.slice(0, CHILE_MOBILE_DIGITS);
    }

    setFormData((previous) => ({
      ...previous,
      [name]: nextValue,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: undefined,
    }));

    setShowConfirmation(false);
    setServerError("");
    setRegistrationSuccess(null);
  };


  // =========================================================
  // SELECCIONAR SUCURSALES
  // =========================================================

  const handleBranchChange = (branchId, checked) => {

    setFormData((previous) => {

      const selected = checked
        ? [...new Set([...previous.sucursales, branchId])]
        : previous.sucursales.filter(
            (id) => id !== branchId
          );

      const mainBranchId =
        selected.includes(previous.sucursalPrincipal)
          ? previous.sucursalPrincipal
          : selected[0] || "";

      return {
        ...previous,
        sucursales: selected,
        sucursalPrincipal: mainBranchId,
      };

    });

    setErrors((previous) => ({
      ...previous,
      sucursales: undefined,
      sucursalPrincipal: undefined,
    }));

    setShowConfirmation(false);
    setServerError("");
    setRegistrationSuccess(null);
  };


  // =========================================================
  // LIMPIAR FORMULARIO
  // =========================================================

  const handleReset = () => {

    // Conservamos la única sucursal cuando solo hay una disponible.
    const selected = branches.length === 1 ? [branches[0].id] : [];
    setFormData({
      ...EMPTY_FORM,
      sucursales: selected,
      sucursalPrincipal: selected[0] || "",
    });

    setErrors({});
    setShowConfirmation(false);
    setServerError("");
    setRegistrationSuccess(null);
  };


  // =========================================================
  // VALIDAR FORMULARIO
  // =========================================================

  const handleSubmit = (event) => {

    event.preventDefault();

    setServerError("");

    if (loadingBranches || branchesError || isSubmitting || registrationSuccess) return;

    const validationErrors = validateForm(formData);

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setShowConfirmation(false);
      return;
    }

    // Mostramos un resumen antes de crear la cuenta de verdad.
    setShowConfirmation(true);
  };


  // =========================================================
  // REGISTRO REAL + INVITACIÓN POR CORREO
  // =========================================================

  const handleConfirmRegister = async () => {
    if (isSubmitting || loadingBranches || registrationSuccess) return;

    const validationErrors = validateForm(formData);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0 ||
        (!isSuperAdmin && formData.role !== "member")) {
      setShowConfirmation(false);
      return;
    }

    setIsSubmitting(true);
    setServerError("");
    try {
      // Enviamos los campos autorizados, nunca una contraseña.
      const { data } = await api.post("/users/register", {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        // El servidor recibe un formato único; vacío si no hay teléfono.
        phone: formatChileMobileForApi(formData.phone),
        birthDate: formData.birthDate,
        role: formData.role,
        sucursales: formData.sucursales,
        sucursalPrincipal: formData.sucursalPrincipal,
      }, { timeout: 30000 });

      if (!data?.success || !data?.user?.id) {
        throw new Error("El servidor no confirmó la invitación.");
      }
      setRegistrationSuccess({ userId: data.user.id, message: data.message });
      setShowConfirmation(false);
    } catch (error) {
      setShowConfirmation(false);
      setServerError(error.response?.data?.message || error.message ||
        "No se pudo registrar la cuenta. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reenvío seguro para cuentas que continúan pendientes de activación.
  const handleResendInvitation = async () => {
    if (!registrationSuccess?.userId || resendLoading) return;
    setResendLoading(true);
    setServerError("");
    try {
      const { data } = await api.post(
        `/users/${registrationSuccess.userId}/resend-invitation`,
        {},
        { timeout: 30000 }
      );
      setRegistrationSuccess((previous) => ({ ...previous, message: data.message }));
    } catch (error) {
      setServerError(error.response?.data?.message || "No se pudo reenviar la invitación.");
    } finally {
      setResendLoading(false);
    }
  };

  // =========================================================
  // INTERFAZ
  // =========================================================

  return (

    <div className="register-user-layout">

      {/* ================================================= */}
      {/* FORMULARIO */}
      {/* ================================================= */}

      <div className="register-user-form-card">

        <form onSubmit={handleSubmit} noValidate>

          {/* ============================================= */}
          {/* INFORMACIÓN PERSONAL */}
          {/* ============================================= */}

          <section className="register-user-form__section">

            <div className="register-user-form__section-header">

              <span className="register-user-form__section-icon">
                <UserRound size={19} />
              </span>

              <div>
                <h2>Información personal</h2>
                <p>
                  Datos básicos de identificación del usuario.
                </p>
              </div>

            </div>


            <div className="register-user-form__grid">

              <div className="register-user-form__field">

                <label htmlFor="register-first-name">
                  Nombres <span>*</span>
                </label>

                <input
                  id="register-first-name"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Ej. María Fernanda"
                  autoComplete="given-name"
                  maxLength={60}
                  aria-invalid={Boolean(errors.firstName)}
                />

                {errors.firstName && (
                  <small className="register-user-form__error">
                    {errors.firstName}
                  </small>
                )}

              </div>


              <div className="register-user-form__field">

                <label htmlFor="register-last-name">
                  Apellidos <span>*</span>
                </label>

                <input
                  id="register-last-name"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Ej. González Pérez"
                  autoComplete="family-name"
                  maxLength={60}
                  aria-invalid={Boolean(errors.lastName)}
                />

                {errors.lastName && (
                  <small className="register-user-form__error">
                    {errors.lastName}
                  </small>
                )}

              </div>


              <div className="register-user-form__field">

                <label htmlFor="register-birth-date">
                  <CalendarDays size={14} />
                  Fecha de nacimiento <span>*</span>
                </label>

                <input
                  id="register-birth-date"
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  max={new Date().toISOString().slice(0, 10)}
                  aria-invalid={Boolean(errors.birthDate)}
                />

                {errors.birthDate && (
                  <small className="register-user-form__error">
                    {errors.birthDate}
                  </small>
                )}

              </div>

            </div>

          </section>


          {/* ============================================= */}
          {/* CONTACTO */}
          {/* ============================================= */}

          <section className="register-user-form__section">

            <div className="register-user-form__section-header">

              <span className="register-user-form__section-icon">
                <Mail size={19} />
              </span>

              <div>
                <h2>Información de contacto</h2>
                <p>
                  Datos que permitirán contactar al usuario.
                </p>
              </div>

            </div>


            <div className="register-user-form__grid">

              <div className="register-user-form__field">

                <label htmlFor="register-email">
                  <Mail size={14} />
                  Correo electrónico <span>*</span>
                </label>

                <input
                  id="register-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="usuario@correo.cl"
                  autoComplete="email"
                  maxLength={EMAIL_MAX_LENGTH}
                  inputMode="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  aria-invalid={Boolean(errors.email)}
                />

                <small className="register-user-form__hint">
                  Ejemplo: nombre@correo.cl · Máximo 50 caracteres.
                </small>

                {errors.email && (
                  <small className="register-user-form__error">
                    {errors.email}
                  </small>
                )}

              </div>


              <div className="register-user-form__field">

                <label htmlFor="register-phone">
                  <Phone size={14} />
                  Teléfono (opcional)
                </label>

                {/* Prefijo de Chile permanente: el campo editable tiene solo 8 dígitos. */}
                <div className="register-user-form__phone-control">
                  <span className="register-user-form__phone-prefix" aria-hidden="true">
                    +56 9
                  </span>
                  <input
                    id="register-phone"
                    className="register-user-form__phone-input"
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="12345678"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={CHILE_MOBILE_DIGITS}
                    pattern="[0-9]{8}"
                    aria-label="Ocho dígitos del número de celular, después de +56 9"
                    aria-describedby="register-phone-hint"
                    aria-invalid={Boolean(errors.phone)}
                  />
                </div>

                <small id="register-phone-hint" className="register-user-form__hint">
                  Opcional. Ingresa solo los 8 dígitos restantes ({formData.phone.length}/8).
                </small>

                {errors.phone && (
                  <small className="register-user-form__error">
                    {errors.phone}
                  </small>
                )}

              </div>

            </div>

          </section>


          {/* ============================================= */}
          {/* CONFIGURACIÓN DE CUENTA */}
          {/* ============================================= */}

          <section className="register-user-form__section">

            <div className="register-user-form__section-header">

              <span className="register-user-form__section-icon">
                <ShieldCheck size={19} />
              </span>

              <div>
                <h2>Configuración de cuenta</h2>
                <p>
                  Define el nivel de acceso y la sucursal.
                </p>
              </div>

            </div>


            <div className="register-user-form__field">

              <label htmlFor="register-role">
                Rol del usuario <span>*</span>
              </label>

              <select
                id="register-role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                aria-invalid={Boolean(errors.role)}
              >

                {availableRoles.map((role) => (
                  <option
                    key={role.value}
                    value={role.value}
                  >
                    {role.label}
                  </option>
                ))}

              </select>

              <p className="register-user-form__hint">
                {formData.role === "admin"
                  ? "El administrador podrá acceder a las funciones administrativas autorizadas."
                  : "El miembro tendrá acceso a su espacio personal dentro de la comunidad."}
              </p>

              {errors.role && (
                <small className="register-user-form__error">
                  {errors.role}
                </small>
              )}

            </div>


            {/* =========================================== */}
            {/* SUCURSALES */}
            {/* =========================================== */}

            <div className="register-user-form__branches">

              <div className="register-user-form__subheading">
                <Building2 size={17} />
                <strong>Sucursales asignadas</strong>
              </div>

              <p className="register-user-form__hint">
                Selecciona las sucursales a las que
                pertenecerá el usuario.
              </p>


              {loadingBranches && <p role="status" className="register-user-form__hint">Cargando sucursales disponibles...</p>}
              {branchesError && (
                <div className="register-user-form__validation" role="alert">
                  <AlertCircle size={16} /> {branchesError}
                  <button type="button" onClick={() => setReloadBranches((n) => n + 1)}>Reintentar</button>
                </div>
              )}
              {!loadingBranches && !branchesError && branches.length === 0 && (
                <p className="register-user-form__hint">No tienes sucursales disponibles para el registro.</p>
              )}

              <div className="register-user-form__branch-list">

                {branches.map((branch) => {

                  const branchId = String(
                    branch.id || branch._id
                  );

                  const checked =
                    formData.sucursales.includes(branchId);

                  return (

                    <label
                      className="register-user-form__branch"
                      key={branchId}
                    >

                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) =>
                          handleBranchChange(
                            branchId,
                            event.target.checked
                          )
                        }
                      />

                      <span className="register-user-form__branch-info">
                        <strong>{branch.name}</strong>
                        <small>{branch.code}</small>
                      </span>

                      {checked && (
                        <CheckCircle2 size={18} />
                      )}

                    </label>

                  );

                })}

              </div>

              {errors.sucursales && (
                <small className="register-user-form__error">
                  {errors.sucursales}
                </small>
              )}

            </div>


            {/* =========================================== */}
            {/* SUCURSAL PRINCIPAL */}
            {/* =========================================== */}

            <div className="register-user-form__field">

              <label htmlFor="register-main-branch">
                Sucursal principal <span>*</span>
              </label>

              <select
                id="register-main-branch"
                name="sucursalPrincipal"
                value={formData.sucursalPrincipal}
                onChange={handleChange}
                aria-invalid={
                  Boolean(errors.sucursalPrincipal)
                }
              >

                <option value="">
                  Seleccionar sucursal
                </option>

                {branches
                  .filter((branch) =>
                    formData.sucursales.includes(
                      String(branch.id || branch._id)
                    )
                  )
                  .map((branch) => (

                    <option
                      key={branch.id || branch._id}
                      value={String(branch.id || branch._id)}
                    >
                      {branch.name}
                    </option>

                  ))}

              </select>

              {errors.sucursalPrincipal && (
                <small className="register-user-form__error">
                  {errors.sucursalPrincipal}
                </small>
              )}

            </div>

          </section>


          {/* ============================================= */}
          {/* AVISO DE SEGURIDAD */}
          {/* ============================================= */}

          <div className="register-user-form__notice">

            <Info size={19} />

            <div>
              <strong>Activación de la cuenta</strong>
              <p>
                Al confirmar el registro, enviaremos una invitación al correo
                indicado. La cuenta permanecerá pendiente hasta que la persona
                confirme su dirección y cree una contraseña segura.
                El administrador no conocerá esa contraseña.
              </p>
            </div>

          </div>


          {/* ============================================= */}
          {/* ERRORES */}
          {/* ============================================= */}

          {hasErrors && (

            <div
              className="register-user-form__validation"
              role="alert"
            >
              <AlertCircle size={17} />
              Revisa los campos señalados antes de continuar.
            </div>

          )}


          {/* ============================================= */}
          {/* CONFIRMACIÓN */}
          {/* ============================================= */}

          {showConfirmation && (

            <div className="register-user-form__confirmation">

              <div className="register-user-form__confirmation-title">
                <ClipboardCheck size={20} />
                <strong>Confirmar nuevo registro</strong>
              </div>

              <p>
                Vas a registrar a <strong> {fullName}</strong> con el rol
                de {getRoleLabel(formData.role).toLowerCase()}.
                Se enviará un correo a <strong>{formData.email}</strong> para
                confirmar la cuenta y crear su contraseña. ¿Continuar?
              </p>

              <div className="register-user-form__confirmation-actions">

                <button
                  type="button"
                  className="register-user-form__button-secondary"
                  onClick={() => setShowConfirmation(false)}
                  disabled={isSubmitting}
                >
                  Volver
                </button>

                <button
                  type="button"
                  className="register-user-form__button-primary"
                  onClick={handleConfirmRegister}
                  disabled={isSubmitting}
                >
                  <CheckCircle2 size={17} />
                  {isSubmitting ? "Registrando y enviando correo..." : "Registrar y enviar invitación"}
                </button>

              </div>

            </div>

          )}


          {/* ============================================= */}
          {/* RESULTADO REAL DEL REGISTRO */}
          {/* ============================================= */}

          {serverError && (
            <div className="register-user-form__validation" role="alert">
              <AlertCircle size={18} aria-hidden="true" />
              <span>{serverError}</span>
            </div>
          )}

          {registrationSuccess && (
            <div className="register-user-form__success" role="status">
              <CheckCircle2 size={21} aria-hidden="true" />
              <div>
                <strong>Registro realizado. Invitación enviada.</strong>
                <p>{registrationSuccess.message}</p>
                <p>Indícale que revise su correo y la carpeta de spam. Su cuenta se activará cuando establezca su contraseña.</p>
                <button
                  type="button"
                  className="register-user-form__button-secondary register-user-form__resend"
                  onClick={handleResendInvitation}
                  disabled={resendLoading}
                >
                  <Mail size={15} aria-hidden="true" />
                  {resendLoading ? "Reenviando..." : "Reenviar invitación"}
                </button>
              </div>
            </div>
          )}

          {/* ============================================= */}
          {/* ACCIONES */}
          {/* ============================================= */}

          <div className="register-user-form__actions">

            <button
              type="button"
              className="register-user-form__button-secondary"
              onClick={handleReset}
              disabled={isSubmitting}
            >
              <RotateCcw size={17} />
              Limpiar formulario
            </button>

            <button
              type="submit"
              className="register-user-form__button-primary"
              disabled={isSubmitting || loadingBranches || Boolean(branchesError) || branches.length === 0 || Boolean(registrationSuccess)}
            >
              <UserPlus size={17} />
              {isSubmitting ? "Enviando invitación..." : "Revisar registro"}
            </button>

          </div>

        </form>

      </div>


      {/* ================================================= */}
      {/* PANEL LATERAL DE VISTA PREVIA */}
      {/* ================================================= */}

      <aside className="register-user-preview">

        <div className="register-user-preview__heading">
          <ClipboardCheck size={18} />
          <h2>Vista previa de cuenta</h2>
        </div>

        <p className="register-user-preview__description">
          La información se actualiza mientras
          completas el formulario.
        </p>


        <div className="register-user-preview__profile">

          <div className="register-user-preview__avatar">
            {initials}
          </div>

          <strong>
            {fullName || "Nuevo usuario"}
          </strong>

          <span>
            {formData.email || "Correo sin ingresar"}
          </span>

          <div className="register-user-preview__role">
            <ShieldCheck size={14} />
            {getRoleLabel(formData.role)}
          </div>

        </div>


        <div className="register-user-preview__details">

          <div>
            <span>Estado inicial de la cuenta</span>
            <strong>Pendiente de confirmación</strong>
          </div>

          <div>
            <span>Rol asignado</span>
            <strong>{getRoleLabel(formData.role)}</strong>
          </div>

          <div>
            <span>Sucursal principal</span>
            <strong>
              {mainBranch?.name || "Sin seleccionar"}
            </strong>
          </div>

          <div>
            <span>Sucursales seleccionadas</span>
            <strong>{formData.sucursales.length}</strong>
          </div>

        </div>


        <div className="register-user-preview__footer">
          <Info size={16} />
          <span>
            El acceso permanecerá deshabilitado hasta que el usuario
            confirme su correo y establezca una contraseña personal.
          </span>
        </div>

      </aside>

    </div>

  );
}

export default RegisterUserForm;
