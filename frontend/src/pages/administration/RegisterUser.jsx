import { UserPlus, ShieldCheck, Info } from "lucide-react";
import { useLocation } from "react-router-dom";
import RegisterUserForm from "../../components/administration/users/RegisterUserForm";


import "../../styles/pages/administration/RegisterUser.css";



function RegisterUser() {
  // Compartimos la página entre administradores y superadministradores.
  const { pathname } = useLocation();
  const isSuperAdmin = pathname.startsWith("/super-admin/");

  return (

    <main className="register-user-page">

      {/* ================================================= */}
      {/* NAVEGACIÓN */}
      {/* ================================================= */}

      <div className="register-user-page__navigation">

        

        <span className="register-user-page__breadcrumb">
          Sistema / Registrar usuario
        </span>

      </div>


      {/* ================================================= */}
      {/* ENCABEZADO */}
      {/* ================================================= */}

      <header className="register-user-page__header">

        <div className="register-user-page__header-main">

          <span className="register-user-page__icon">
            <UserPlus size={25} />
          </span>

          <div>

            <span className="register-user-page__eyebrow">
              ADMINISTRACIÓN DE CUENTAS
            </span>

            <h1>Registrar usuario</h1>

            <p>
              Registra a nuevos integrantes y envíales una invitación
              para confirmar su correo y crear su contraseña.
            </p>

          </div>

        </div>


        <span className="register-user-page__badge">
          <ShieldCheck size={15} />
          {isSuperAdmin ? "Superadministrador" : "Administrador"}
        </span>

      </header>


      {/* ================================================= */}
      {/* INFORMACIÓN DE ACTIVACIÓN */}
      {/* ================================================= */}

      <div className="register-user-page__demo-notice">

        <Info size={18} />

        <p>
          <strong>Registro por invitación:</strong>{" "}
          el nuevo usuario recibirá un correo de confirmación.
          Su cuenta no tendrá acceso hasta crear una contraseña personal.
          Recuérdale revisar también la carpeta de spam.
        </p>

      </div>


      {/* ================================================= */}
      {/* FORMULARIO */}
      {/* ================================================= */}

      <RegisterUserForm mode={isSuperAdmin ? "super_admin" : "admin"} />

    </main>

  );

}

export default RegisterUser;








