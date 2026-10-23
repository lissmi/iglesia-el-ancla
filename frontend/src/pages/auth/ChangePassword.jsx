// =========================================================
// PÁGINA DE CAMBIO DE CONTRASEÑA
// =========================================================
// Página compartida por miembros, administradores y
// superadministradores. El acceso se protegerá en App.js.
// Las validaciones sensibles se realizan en el backend.

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import api from "../../services/api";
import ChangePasswordForm from "../../components/auth/ChangePasswordForm";
import "../../styles/pages/auth/ChangePassword.css";

function ChangePassword() {
  // La página se comparte entre tres roles, por lo que consultamos
  // la sesión para ofrecer un regreso seguro al panel correspondiente.
  const [returnPath, setReturnPath] = useState("/member");

  useEffect(() => {
    let mounted = true;

    const loadDestination = async () => {
      try {
        const response = await api.get("/auth/me");
        const role = response.data?.user?.role;

        const pathsByRole = {
          member: "/member",
          admin: "/admin",
          super_admin: "/super-admin",
        };

        if (mounted) {
          setReturnPath(pathsByRole[role] || "/member");
        }
      } catch {
        // ProtectedRoute controla el acceso a esta página.
        // Si la consulta falla, conservamos un destino interno seguro.
      }
    };

    loadDestination();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="change-password-page">
      <div className="change-password-page__container">
        {/* Regreso al panel de la cuenta, sin depender del historial. */}
        <Link className="change-password-page__back" to={returnPath}>
          <ArrowLeft size={18} strokeWidth={1.8} aria-hidden="true" />
          Volver a mi panel
        </Link>

        <div className="change-password-page__intro">
          <span className="change-password-page__eyebrow">
            <LockKeyhole size={16} aria-hidden="true" />
            Seguridad de tu cuenta
          </span>
          <h1>Protege tu acceso</h1>
          <p>
            Elige una contraseña segura para mantener protegida tu
            información y la de la comunidad.
          </p>
        </div>

        <ChangePasswordForm />

        <p className="change-password-page__footer">
          Iglesia El Ancla · Comunidad Cristiana
        </p>
      </div>
    </main>
  );
}

export default ChangePassword;
