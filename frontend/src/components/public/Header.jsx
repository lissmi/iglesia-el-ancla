// Importamos useState para controlar la apertura del menú móvil.
import { useState } from "react";

// Importamos el logo oficial de El Ancla.
import logoElAncla from "../../assets/images/logo-el-ancla.png";

// Importamos los estilos exclusivos del Header.
import "../../styles/components/public/Header.css";

// Creamos el componente Header.
function Header() {
  // Guardamos si el menú móvil está abierto o cerrado.
  const [menuOpen, setMenuOpen] = useState(false);

  // Esta función alterna el estado del menú.
  const toggleMenu = () => {
    // Cambiamos el estado anterior por su valor contrario.
    setMenuOpen((previousState) => !previousState);
  };

  // Esta función cierra el menú móvil.
  const closeMenu = () => {
    // Establecemos el estado como falso.
    setMenuOpen(false);
  };

  // Retornamos la estructura del encabezado.
  return (
    // Representa el encabezado principal de la aplicación.
    <header className="header">
      {/* Contenedor que centra y limita el ancho del Header. */}
      <div className="header__container">
        {/* Enlace que contiene la identidad visual de la iglesia. */}
        <a
          className="header__brand"
          href="/"
          onClick={closeMenu}
          aria-label="Ir al inicio de El Ancla Comunidad Cristiana"
        >
          {/* Mostramos el logo oficial. */}
          <img
            className="header__logo"
            src={logoElAncla}
            alt="Logo de El Ancla Comunidad Cristiana"
          />
        </a>

        {/* Navegación principal. */}
        <nav
          id="main-navigation"
          className={`header__navigation ${
            menuOpen ? "header__navigation--open" : ""
          }`}
          aria-label="Navegación principal"
        >
          {/* Enlace de inicio. */}
          <a
            className="header__link header__link--active"
            href="/"
            onClick={closeMenu}
          >
            Inicio
          </a>

          {/* Enlace institucional. */}
          <a
            className="header__link"
            href="/nosotros"
            onClick={closeMenu}
          >
            Nosotros
          </a>

          {/* Enlace de actividades. */}
          <a
            className="header__link"
            href="/actividades"
            onClick={closeMenu}
          >
            Actividades
          </a>

          {/* Enlace de eventos. */}
          <a
            className="header__link"
            href="/eventos"
            onClick={closeMenu}
          >
            Eventos
          </a>

          {/* Enlace de recursos. */}
          <a
            className="header__link"
            href="/recursos"
            onClick={closeMenu}
          >
            Recursos
          </a>

          {/* Enlace de galería. */}
          <a
            className="header__link"
            href="/galeria"
            onClick={closeMenu}
          >
            Galería
          </a>

          {/* Enlace de contacto. */}
          <a
            className="header__link"
            href="/contacto"
            onClick={closeMenu}
          >
            Contacto
          </a>

          {/* Botón para personas nuevas, visible dentro del menú móvil. */}
          <a
            className="header__join-button header__join-button--mobile"
            href="/primera-visita"
            onClick={closeMenu}
          >
            Primera vez aquí
          </a>
        </nav>

        {/* Acciones ubicadas a la derecha del Header. */}
        <div className="header__actions">
          {/* Botón visible solamente en escritorio. */}
          <a
            className="header__join-button header__join-button--desktop"
            href="/primera-visita"
          >
            Primera vez aquí
          </a>

          {/* Botón hamburguesa para tablets y celulares. */}
          <button
            className={`header__menu-button ${
              menuOpen ? "header__menu-button--open" : ""
            }`}
            type="button"
            onClick={toggleMenu}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            aria-controls="main-navigation"
          >
            {/* Primera línea del icono hamburguesa. */}
            <span className="header__menu-line"></span>

            {/* Segunda línea del icono hamburguesa. */}
            <span className="header__menu-line"></span>

            {/* Tercera línea del icono hamburguesa. */}
            <span className="header__menu-line"></span>
          </button>
        </div>
      </div>
    </header>
  );
}

// Exportamos el Header para usarlo en otras páginas.
export default Header;