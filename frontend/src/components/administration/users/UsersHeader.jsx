
import { Link } from "react-router-dom";

// =========================================================
// IMPORTACIÓN DE ICONOS
// =========================================================

import {
  ArrowLeft,
  ShieldCheck,
  UsersRound,
} from "lucide-react";


// =========================================================
// ESTILOS DEL COMPONENTE
// =========================================================

import "../../../styles/components/administration/users/UsersHeader.css";


// =========================================================
// COMPONENTE USERS HEADER
// =========================================================

// Este componente representa el encabezado
// de la página de gestión de usuarios.
//
// Recibe una propiedad:
//
// backPath: ruta a la que debe regresar
// el usuario al presionar "Volver al panel".
//
// De esta manera podemos reutilizar
// el componente sin establecer una ruta fija.

function UsersHeader({
  backPath = "/super-admin",
}) {

  return (

    <header className="users-header">


      {/* ================================================= */}
      {/* CONTENIDO PRINCIPAL */}
      {/* ================================================= */}

      <div className="users-header__content">


        {/* Identificador del módulo. */}
        <span className="users-header__eyebrow">

          <ShieldCheck
            size={15}
            strokeWidth={2}
            aria-hidden="true"
          />

          Administración del sistema

        </span>


        {/* Título de la página. */}
        <h1 className="users-header__title">
          Gestión de usuarios
        </h1>


        {/* Descripción del módulo. */}
        <p className="users-header__description">

          Consulta y administra las cuentas registradas
          en Iglesia El Ancla, supervisa su estado
          y gestiona la información de acceso al sistema.

        </p>


        {/* ============================================= */}
        {/* NAVEGACIÓN */}
        {/* ============================================= */}

        <div className="users-header__actions">

          <Link
            className="users-header__back"
            to={backPath}
          >

            <ArrowLeft
              size={17}
              strokeWidth={2}
              aria-hidden="true"
            />

            <span>
              Volver al panel
            </span>

          </Link>

        </div>

      </div>


      {/* ================================================= */}
      {/* ICONO DEL MÓDULO */}
      {/* ================================================= */}

      <div
        className="users-header__icon"
        aria-hidden="true"
      >

        <UsersRound
          size={30}
          strokeWidth={1.7}
        />

      </div>

    </header>
  );
}


// Exportamos el componente para utilizarlo
// dentro de UsersManagement.jsx.
export default UsersHeader;
