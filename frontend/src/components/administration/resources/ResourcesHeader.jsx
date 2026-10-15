
import { useNavigate } from "react-router-dom";

import {
    ArrowLeft,
    LibraryBig,
    Plus,
} from "lucide-react";

// =========================================================
// ESTILOS
// =========================================================

import "../../../styles/components/administration/resources/ResourcesHeader.css";

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function ResourcesHeader({ onCreateResource }) {

    // =====================================================
    // NAVEGACIÓN
    // =====================================================

    const navigate = useNavigate();

    function handleGoBack() {
        navigate(-1);
    }

    // =====================================================
    // INTERFAZ
    // =====================================================

    return (
        <header className="resources-header">

            {/* =========================================== */}
            {/* INFORMACIÓN PRINCIPAL */}
            {/* =========================================== */}

            <div className="resources-header__content">

                <span className="resources-header__eyebrow">
                    ADMINISTRACIÓN DE CONTENIDOS
                </span>

                <h1>
                    Gestión de recursos
                </h1>

                <p>
                    Organiza y administra los recursos bíblicos,
                    materiales de formación y contenidos digitales
                    disponibles para la comunidad de la iglesia.
                </p>

                {/* NAVEGACIÓN */}

                <button
                    type="button"
                    className="resources-header__back"
                    onClick={handleGoBack}
                >
                    <ArrowLeft
                        size={17}
                        aria-hidden="true"
                    />

                    Volver
                </button>

            </div>

            {/* =========================================== */}
            {/* ACCIONES */}
            {/* =========================================== */}

            <div className="resources-header__actions">

                <div className="resources-header__icon">
                    <LibraryBig
                        size={27}
                        strokeWidth={1.7}
                        aria-hidden="true"
                    />
                </div>

                <button
                    type="button"
                    className="resources-header__create"
                    onClick={onCreateResource}
                >
                    <Plus
                        size={18}
                        strokeWidth={2}
                        aria-hidden="true"
                    />

                    Nuevo recurso
                </button>

            </div>

        </header>
    );
}

export default ResourcesHeader;
