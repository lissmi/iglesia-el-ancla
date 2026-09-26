import { useState } from "react";
import {
    Link,
    NavLink,
} from "react-router-dom";

import logoElAncla from "../../assets/images/logo-el-ancla.png";

import "../../styles/components/public/Header.css";

function Header() {
    const [menuOpen, setMenuOpen] =
        useState(false);

    const toggleMenu = () => {
        setMenuOpen(
            (previousState) => !previousState
        );
    };

    const closeMenu = () => {
        setMenuOpen(false);
    };

    /*
     * Agrega la clase activa únicamente cuando
     * NavLink detecta que la ruta corresponde
     * a la página actual.
     */
    const getNavigationClass = ({
        isActive,
    }) =>
        isActive
            ? "header__link header__link--active"
            : "header__link";

    return (
        <header className="header">
            <div className="header__container">
                {/* Logo e inicio. */}
                <Link
                    className="header__brand"
                    to="/"
                    onClick={closeMenu}
                    aria-label="Ir al inicio de El Ancla Comunidad Cristiana"
                >
                    <img
                        className="header__logo"
                        src={logoElAncla}
                        alt="Logo de El Ancla Comunidad Cristiana"
                    />
                </Link>

                {/* Navegación principal. */}
                <nav
                    id="main-navigation"
                    className={`header__navigation ${menuOpen
                            ? "header__navigation--open"
                            : ""
                        }`}
                    aria-label="Navegación principal"
                >
                    <NavLink
                        className={getNavigationClass}
                        to="/"
                        end
                        onClick={closeMenu}
                    >
                        Inicio
                    </NavLink>

                    <NavLink
                        className={getNavigationClass}
                        to="/nosotros"
                        onClick={closeMenu}
                    >
                        Nosotros
                    </NavLink>

                    <NavLink
                        className={getNavigationClass}
                        to="/recomendados"
                        onClick={closeMenu}
                    >
                        Recomendados
                    </NavLink>

                    <NavLink
                        className={getNavigationClass}
                        to="/eventos"
                        onClick={closeMenu}
                    >
                        Eventos
                    </NavLink>

                    <NavLink
                        className={getNavigationClass}
                        to="/recursos"
                        onClick={closeMenu}
                    >
                        Recursos
                    </NavLink>

                    <NavLink
                        className={getNavigationClass}
                        to="/contacto"
                        onClick={closeMenu}
                    >
                        Contacto
                    </NavLink>


                </nav>

                {/* Acciones laterales. */}
                <div className="header__actions">

                    {/* Enlace público para iniciar sesión. */}
                    <NavLink
                        className={({ isActive }) =>
                            isActive
                                ? "header__login-button header__login-button--active"
                                : "header__login-button"
                        }
                        to="/login"
                        onClick={closeMenu}
                    >
                        Iniciar sesión
                    </NavLink>

                    {/* Botón para abrir o cerrar el menú en dispositivos móviles. */}
                    <button
                        className={`header__menu-button ${menuOpen
                                ? "header__menu-button--open"
                                : ""
                            }`}
                        type="button"
                        onClick={toggleMenu}
                        aria-label={
                            menuOpen
                                ? "Cerrar menú"
                                : "Abrir menú"
                        }
                        aria-expanded={menuOpen}
                        aria-controls="main-navigation"
                    >
                        <span className="header__menu-line" />
                        <span className="header__menu-line" />
                        <span className="header__menu-line" />
                    </button>

                </div>
            </div>
        </header>
    );
}

export default Header;