
import { Link } from "react-router-dom";

import {
  UserPlus,
  ArrowLeft,
  ShieldCheck,
  Info,
} from "lucide-react";

import RegisterUserForm from "../../components/administration/users/RegisterUserForm";


import "../../styles/pages/administration/RegisterUser.css";



function RegisterUser() {

  return (

    <main className="register-user-page">

      {/* ================================================= */}
      {/* NAVEGACIÓN */}
      {/* ================================================= */}

      <div className="register-user-page__navigation">

        <Link
          to="/super-admin"
          className="register-user-page__back"
        >
          <ArrowLeft size={17} />
          Volver al panel
        </Link>

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
              Prepara una nueva cuenta para un miembro
              o administrador de Iglesia El Ancla.
            </p>

          </div>

        </div>


        <span className="register-user-page__badge">
          <ShieldCheck size={15} />
          Superadministrador
        </span>

      </header>


      {/* ================================================= */}
      {/* INFORMACIÓN DE DEMOSTRACIÓN */}
      {/* ================================================= */}

      <div className="register-user-page__demo-notice">

        <Info size={18} />

        <p>
          <strong>Modo demostración:</strong>{" "}
          puedes completar el formulario y probar
          sus validaciones. Los datos no se enviarán
          al servidor ni se guardarán.
        </p>

      </div>


      {/* ================================================= */}
      {/* FORMULARIO */}
      {/* ================================================= */}

      <RegisterUserForm mode="super_admin" />

    </main>

  );

}

export default RegisterUser;
