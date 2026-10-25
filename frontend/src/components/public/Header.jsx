
import { useState } from "react";

// Importamos los componentes de navegación de React Router.
import {
    Link,
    NavLink,
} from "react-router-dom";

// Importamos el logo oficial de la iglesia.
import logoElAncla from "../../assets/images/logo-el-ancla.png";

// Importamos los estilos del encabezado público.
import "../../styles/components/public/Header.css";

// Componente principal del encabezado.
function Header() {

    // Controla si el menú móvil está abierto.
    const [menuOpen, setMenuOpen] = useState(false);

    // Alterna la visibilidad del menú móvil.
    const toggleMenu = () => {
        setMenuOpen(
            (previousState) => !previousState
        );
    };

    // Cierra el menú al seleccionar una opción.
    const closeMenu = () => {
        setMenuOpen(false);
    };

    // Asigna una clase CSS cuando el enlace está activo.
    const getNavigationClass = ({ isActive }) =>
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

                {/* Navegación exclusivamente pública. */}
                <nav
                    id="main-navigation"
                    className={`header__navigation ${menuOpen
                            ? "header__navigation--open"
                            : ""
                        }`}
                    aria-label="Navegación principal"
                >

                    {/* Página de inicio. */}
                    <NavLink
                        className={getNavigationClass}
                        to="/"
                        end
                        onClick={closeMenu}
                    >
                        Inicio
                    </NavLink>

                    {/* Información institucional. */}
                    <NavLink
                        className={getNavigationClass}
                        to="/nosotros"
                        onClick={closeMenu}
                    >
                        Nosotros
                    </NavLink>

                    {/* Eventos públicos de la iglesia. */}
                    <NavLink
                        className={getNavigationClass}
                        to="/eventos"
                        onClick={closeMenu}
                    >
                        Eventos
                    </NavLink>


                    {/* Enlace público hacia las donaciones. */}
                    <NavLink
                        to="/donaciones"
                        className={getNavigationClass}
                        onClick={closeMenu}
                    >
                        Donaciones
                    </NavLink>


                    {/* Información de contacto. */}
                    <NavLink
                        className={getNavigationClass}
                        to="/contacto"
                        onClick={closeMenu}
                    >
                        Contacto
                    </NavLink>

                    {/*
                     * Recursos y Recomendados fueron retirados.
                     * Ahora pertenecen exclusivamente al
                     * espacio privado de los miembros.
                     */}

                </nav>

                {/* Acciones laterales del encabezado. */}
                <div className="header__actions">

                    {/* Acceso público al inicio de sesión. */}
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

                    {/* Control del menú para dispositivos móviles. */}
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

// Exportamos el componente público.
export default Header;
