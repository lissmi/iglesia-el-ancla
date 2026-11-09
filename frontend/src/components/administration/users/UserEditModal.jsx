// Editor administrativo: correo y sedes se gestionan por flujos separados.
import { useState } from "react";
import { X, Save } from "lucide-react";
import UserEditConfirmModal from "./UserEditConfirmModal";
import "../../../styles/pages/administration/UsersManagementConnected.css";

const formatDate = (value) =>
  value
    ? new Date(value).toISOString().slice(0, 10)
    : "";

function UserEditModal({ user, onClose, onSave }) {
  // Copiamos los campos editables; nunca alteramos las credenciales.
  const [values, setValues] = useState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    phone: user.phone || "",
    birthDate: formatDate(user.birthDate),
    role: user.role || "member",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showSaveConfirmation, setShowSaveConfirmation] =
    useState(false);

  const change = (event) => {
    setValues((old) => ({
      ...old,
      [event.target.name]: event.target.value,
    }));
  };

  const submit = (event) => {
    event.preventDefault();

    if (saving || user.role === "super_admin") {
      return;
    }

    setShowSaveConfirmation(true);
  };

  const confirmSave = async () => {
    if (saving || user.role === "super_admin") {
      return;
    }

    setSaving(true);
    setError("");

    try {
      await onSave(user, {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        phone: values.phone.trim(),
        birthDate: values.birthDate,
        role: values.role,
      });

      setShowSaveConfirmation(false);
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Error al guardar."
      );
      setShowSaveConfirmation(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div
        className="users-connected__overlay"
        onMouseDown={(event) => {
          if (
            event.target === event.currentTarget &&
            !saving
          ) {
            onClose();
          }
        }}
      >
        <div
          className="users-connected__modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="users-edit-title"
        >
          <div className="users-connected__modal-header">
            <div>
              <h2 id="users-edit-title">Editar usuario</h2>
              <p>
                Los cambios se guardarán en MongoDB.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>
          </div>

          <form
            onSubmit={submit}
            className="users-connected__form"
          >
            <label>
              Nombres
              <input
                name="firstName"
                value={values.firstName}
                onChange={change}
                required
                minLength={2}
                maxLength={60}
              />
            </label>

            <label>
              Apellidos
              <input
                name="lastName"
                value={values.lastName}
                onChange={change}
                required
                minLength={2}
                maxLength={60}
              />
            </label>

            <label>
              Correo (no editable)
              <input value={user.email || ""} disabled />
            </label>

            <label>
              Celular chileno (opcional)
              <input
                name="phone"
                value={values.phone}
                onChange={change}
                placeholder="+56 9 1234 5678"
              />
            </label>

            <label>
              Fecha de nacimiento
              <input
                type="date"
                name="birthDate"
                value={values.birthDate}
                onChange={change}
                max={new Date().toISOString().slice(0, 10)}
                required
              />
            </label>

            <label>
              Rol
              <select
                name="role"
                value={values.role}
                onChange={change}
                disabled={user.role === "super_admin"}
              >
                <option value="member">Miembro</option>
                <option value="admin">Administrador</option>
              </select>
            </label>

            <p className="users-connected__hint">
              La dirección de correo y las sucursales
              requieren sus operaciones específicas.
              No se modifican desde este formulario.
            </p>

            {error && (
              <p
                className="users-connected__error"
                role="alert"
              >
                {error}
              </p>
            )}

            <div className="users-connected__actions">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={
                  saving || user.role === "super_admin"
                }
              >
                <Save size={16} />
                {saving
                  ? "Guardando..."
                  : "Guardar cambios"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showSaveConfirmation && (
        <UserEditConfirmModal
          user={user}
          processing={saving}
          onConfirm={confirmSave}
          onClose={() => {
            if (!saving) {
              setShowSaveConfirmation(false);
            }
          }}
        />
      )}
    </>
  );
}

export default UserEditModal;
