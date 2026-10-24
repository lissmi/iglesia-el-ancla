// =========================================================
// MI CUENTA: PÁGINA COMPARTIDA ENTRE LOS TRES ROLES
// =========================================================
// La identidad proviene de la cookie HttpOnly verificada en el backend.
// Nunca se recibe un id de usuario desde la URL ni desde el formulario.

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BadgeCheck,
  CalendarDays,
  KeyRound,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  UserRoundCog,
} from "lucide-react";
import api from "../../services/api";
import "../../styles/pages/account/MyAccount.css";

// Valores iniciales del formulario, antes de cargar los datos.
const emptyForm = {
  firstName: "",
  lastName: "",
  phone: "",
  birthDate: "",
};

const roleLabels = {
  member: "Miembro",
  admin: "Administrador",
  super_admin: "Superadministrador",
};

function MyAccount() {

  // Separamos los datos institucionales de los campos editables.
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Leemos únicamente el perfil de la sesión actualmente autenticada.
  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        const response = await api.get("/users/me/profile");
        if (!mounted) return;
        const data = response.data?.profile;
        if (!data) throw new Error("La respuesta no incluye el perfil");

        setProfile(data);
        setForm({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          phone: data.phone || "",
          birthDate: data.birthDate || "",
        });
      } catch (requestError) {
        if (mounted) {
          setError(requestError?.response?.data?.message || "No fue posible cargar tu cuenta.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProfile();
    return () => { mounted = false; };
  }, []);

  // Actualizamos solo un campo editable a la vez.
  function handleFieldChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setError("");
    setSuccess("");
  }

  // Enviamos únicamente los cuatro campos autorizados por el backend.
  async function handleSave(event) {
    event.preventDefault();
    if (saving) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.patch("/users/me/profile", {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
        birthDate: form.birthDate,
      });

      // Mostramos la versión confirmada por MongoDB, no un éxito supuesto.
      const updated = response.data?.profile;
      if (!response.data?.success || !updated) {
        throw new Error("El servidor no confirmó los cambios");
      }
      setProfile(updated);
      setForm({
        firstName: updated.firstName || "",
        lastName: updated.lastName || "",
        phone: updated.phone || "",
        birthDate: updated.birthDate || "",
      });
      setSuccess("Tus datos personales se actualizaron correctamente.");
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "No fue posible guardar tus cambios.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="my-account">
      <div className="my-account__container">

        <header className="my-account__heading">
          <span className="my-account__eyebrow">Mi espacio personal</span>
          <h1>Mi cuenta</h1>
          <p>Actualiza tus datos de contacto y revisa la seguridad de tu acceso a Iglesia El Ancla.</p>
        </header>

        {loading && <p role="status">Cargando los datos de tu cuenta...</p>}
        {!loading && error && !profile && <p className="my-account__notice my-account__notice--error" role="alert">{error}</p>}

        {!loading && profile && (
          <div className="my-account__columns">
            <section className="my-account__card" aria-labelledby="my-account-profile-title">
              <header className="my-account__card-heading">
                <span className="my-account__icon"><UserRoundCog size={22} aria-hidden="true" /></span>
                <div>
                  <h2 id="my-account-profile-title">Datos personales</h2>
                  <p>Estos datos se utilizarán para la comunicación y participación comunitaria.</p>
                </div>
              </header>

              <form onSubmit={handleSave} className="my-account__form">
                <div className="my-account__field-row">
                  <label className="my-account__field">
                    Nombre
                    <input name="firstName" type="text" value={form.firstName} onChange={handleFieldChange} minLength={2} maxLength={60} autoComplete="given-name" required disabled={saving} />
                  </label>
                  <label className="my-account__field">
                    Apellido
                    <input name="lastName" type="text" value={form.lastName} onChange={handleFieldChange} minLength={2} maxLength={60} autoComplete="family-name" required disabled={saving} />
                  </label>
                </div>

                <label className="my-account__field">
                  <span><Phone size={15} aria-hidden="true" /> Teléfono</span>
                  <input name="phone" type="tel" value={form.phone} onChange={handleFieldChange} maxLength={30} autoComplete="tel" placeholder="+56912345678" required disabled={saving} />
                </label>
                <label className="my-account__field">
                  <span><CalendarDays size={15} aria-hidden="true" /> Fecha de nacimiento</span>
                  <input name="birthDate" type="date" value={form.birthDate} onChange={handleFieldChange} max={new Date().toISOString().slice(0,10)} required disabled={saving} />
                </label>

                {error && <p className="my-account__notice my-account__notice--error" role="alert">{error}</p>}
                {success && <p className="my-account__notice my-account__notice--success" role="status">{success}</p>}

                <button className="my-account__save" type="submit" disabled={saving}>
                  <Save size={17} aria-hidden="true" /> {saving ? "Guardando..." : "Guardar cambios"}
                </button>
              </form>
            </section>

            <aside className="my-account__aside" aria-label="Identidad y seguridad">
              <section className="my-account__card" aria-labelledby="my-account-access-title">
                <header className="my-account__card-heading">
                  <span className="my-account__icon"><BadgeCheck size={22} aria-hidden="true" /></span>
                  <div><h2 id="my-account-access-title">Información de acceso</h2><p>Datos administrados por la iglesia.</p></div>
                </header>
                <dl className="my-account__details">
                  <div><dt><Mail size={15} aria-hidden="true" /> Correo electrónico</dt><dd>{profile.email}</dd></div>
                  <div><dt>Estado del correo</dt><dd>{profile.emailVerifiedAt ? "Verificado" : "Pendiente de verificación"}</dd></div>
                  <div><dt>Tipo de cuenta</dt><dd>{roleLabels[profile.role] || "Miembro"}</dd></div>
                  <div><dt>Sucursal principal</dt><dd>{profile.sucursalPrincipal || "Sin asignar"}</dd></div>
                </dl>
                <p className="my-account__helper">El correo, el rol y las sucursales no se modifican desde este formulario.</p>
              </section>

              <section className="my-account__card" aria-labelledby="my-account-security-title">
                <header className="my-account__card-heading">
                  <span className="my-account__icon my-account__icon--gold"><ShieldCheck size={22} aria-hidden="true" /></span>
                  <div><h2 id="my-account-security-title">Seguridad de tu cuenta</h2><p>Protege tus credenciales de acceso.</p></div>
                </header>
                <p className="my-account__helper">El cambio de contraseña requiere tu contraseña actual y un código enviado al correo verificado.</p>
                <Link className="my-account__security-link" to="/cambiar-contrasena">
                  <KeyRound size={18} aria-hidden="true" /> Cambiar contraseña
                </Link>
              </section>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

export default MyAccount;
