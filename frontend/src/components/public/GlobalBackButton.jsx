
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import "../../styles/components/public/GlobalBackButton.css";

// =========================================================
// BOTÓN GLOBAL VOLVER - IGLESIA EL ANCLA
// =========================================================

function GlobalBackButton() {

    const navigate = useNavigate();
    const location = useLocation();

    // =====================================================
    // OCULTAR EN LA PÁGINA DE INICIO
    // =====================================================

    if (location.pathname === "/") {
        return null;
    }

    // =====================================================
    // NAVEGACIÓN SEGURA
    // =====================================================

    const handleBack = () => {

        // React Router guarda el índice de navegación
        // en el historial del navegador.

        const historyIndex = window.history.state?.idx;

        if (
            typeof historyIndex === "number" &&
            historyIndex > 0
        ) {
            navigate(-1);
            return;
        }

        // Si no existe navegación previa dentro
        // de la aplicación, regresar al inicio.

        navigate("/", { replace: true });
    };

    // =====================================================
    // RENDERIZADO
    // =====================================================

    return (
        <div className="global-back">

            <div className="global-back__container">

                <button
                    type="button"
                    className="global-back__button"
                    onClick={handleBack}
                    aria-label="Volver a la página anterior"
                >
                    <ArrowLeft size={18} strokeWidth={2} />

                    <span>Volver</span>
                </button>

            </div>

        </div>
    );
}

export default GlobalBackButton;
