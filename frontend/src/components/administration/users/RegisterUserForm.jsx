
import { useState } from "react";

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
// DATOS DE DEMOSTRACIÓN
// =========================================================

// Estas sucursales son temporales.
// Posteriormente las obtendremos desde MongoDB.

const DEMO_BRANCHES = [
  {
    id: "demo-suc-001",
    code: "SUC-001",
    name: "El Ancla - Playa Ancha",
  },
];


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
  sucursales: ["demo-suc-001"],
  sucursalPrincipal: "demo-suc-001",
};


// =========================================================
// FUNCIONES AUXILIARES
// =========================================================

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

  if (
    !email ||
    email.length > 150 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    errors.email =
      "Ingresa un correo electrónico válido.";
  }

  if (
    !phone ||
    phone.length > 30 ||
    !/^\+?[0-9\s()-]{8,30}$/.test(phone)
  ) {
    errors.phone =
      "Ingresa un teléfono válido.";
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
  mode = "super_admin",
  branches = DEMO_BRANCHES,
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

  const [showDemoSuccess, setShowDemoSuccess] =
    useState(false);


  // =========================================================
  // PERMISOS VISUALES
  // =========================================================

  // En el futuro estos permisos también deberán
  // comprobarse en el backend.

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
    Object.keys(errors).length > 0;


  // =========================================================
  // ACTUALIZAR CAMPOS
  // =========================================================

  const handleChange = (event) => {

    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: undefined,
    }));

    setShowConfirmation(false);
    setShowDemoSuccess(false);
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
    setShowDemoSuccess(false);
  };


  // =========================================================
  // LIMPIAR FORMULARIO
  // =========================================================

  const handleReset = () => {

    setFormData({
      ...EMPTY_FORM,
      sucursales: [...EMPTY_FORM.sucursales],
    });

    setErrors({});
    setShowConfirmation(false);
    setShowDemoSuccess(false);
  };


  // =========================================================
  // VALIDAR FORMULARIO
  // =========================================================

  const handleSubmit = (event) => {

    event.preventDefault();

    setShowDemoSuccess(false);

    const validationErrors = validateForm(formData);

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setShowConfirmation(false);
      return;
    }

    // Solo mostramos la confirmación.
    // No enviamos datos al backend.
    setShowConfirmation(true);
  };


  // =========================================================
  // CONFIRMACIÓN DE DEMOSTRACIÓN
  // =========================================================

  const handleDemoConfirm = () => {

    // Volvemos a validar por seguridad visual.
    const validationErrors = validateForm(formData);

    setErrors(validationErrors);

    if (
      Object.keys(validationErrors).length > 0 ||
      (!isSuperAdmin && formData.role !== "member")
    ) {
      setShowConfirmation(false);
      return;
    }

    setShowConfirmation(false);
    setShowDemoSuccess(true);
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
                  maxLength={150}
                  aria-invalid={Boolean(errors.email)}
                />

                {errors.email && (
                  <small className="register-user-form__error">
                    {errors.email}
                  </small>
                )}

              </div>


              <div className="register-user-form__field">

                <label htmlFor="register-phone">
                  <Phone size={14} />
                  Teléfono <span>*</span>
                </label>

                <input
                  id="register-phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+56 9 1234 5678"
                  autoComplete="tel"
                  maxLength={30}
                  aria-invalid={Boolean(errors.phone)}
                />

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
                En la versión definitiva, el sistema
                gestionará el acceso inicial mediante
                un proceso seguro. Esta demostración
                no genera contraseñas ni invitaciones.
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
                <strong>Confirmar registro de demostración</strong>
              </div>

              <p>
                Se ha validado la información de
                <strong> {fullName}</strong>.
                ¿Deseas visualizar el resultado
                de la simulación?
              </p>

              <div className="register-user-form__confirmation-actions">

                <button
                  type="button"
                  className="register-user-form__button-secondary"
                  onClick={() => setShowConfirmation(false)}
                >
                  Volver
                </button>

                <button
                  type="button"
                  className="register-user-form__button-primary"
                  onClick={handleDemoConfirm}
                >
                  <CheckCircle2 size={17} />
                  Confirmar demostración
                </button>

              </div>

            </div>

          )}


          {/* ============================================= */}
          {/* RESULTADO DE DEMOSTRACIÓN */}
          {/* ============================================= */}

          {showDemoSuccess && (

            <div
              className="register-user-form__demo-success"
              role="status"
            >

              <CheckCircle2 size={21} />

              <div>
                <strong>Formulario validado correctamente</strong>
                <p>
                  Demostración completada. No se creó
                  ninguna cuenta ni se almacenaron datos.
                </p>
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
            >
              <RotateCcw size={17} />
              Limpiar formulario
            </button>

            <button
              type="submit"
              className="register-user-form__button-primary"
            >
              <UserPlus size={17} />
              Revisar registro
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
            <span>Estado inicial previsto</span>
            <strong>Activo</strong>
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
            Vista previa únicamente. Ninguna cuenta
            será creada durante esta etapa.
          </span>
        </div>

      </aside>

    </div>

  );
}

export default RegisterUserForm;
