import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clapperboard, Plus } from "lucide-react";

import "../../../styles/components/administration/recommendations/RecommendationsHeader.css";

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function RecommendationsHeader({ onCreateRecommendation }) {
    const navigate = useNavigate();

    function handleGoBack() {
        navigate(-1);
    }

    return (
        <header className="recommendations-header">
            <div className="recommendations-header__content">
                <span className="recommendations-header__eyebrow">
                    ADMINISTRACIÓN DE CONTENIDOS
                </span>

                <h1>Gestión de recomendados</h1>

                <p>
                    Organiza y administra libros, música, películas, series y
                    otros contenidos recomendados para la comunidad.
                </p>

                <button
                    type="button"
                    className="recommendations-header__back"
                    onClick={handleGoBack}
                >
                    <ArrowLeft size={17} aria-hidden="true" />
                    Volver
                </button>
            </div>

            <div className="recommendations-header__actions">
                <div className="recommendations-header__icon">
                    <Clapperboard size={27} strokeWidth={1.7} aria-hidden="true" />
                </div>

                <button
                    type="button"
                    className="recommendations-header__create"
                    onClick={onCreateRecommendation}
                    disabled={!onCreateRecommendation}
                >
                    <Plus size={18} strokeWidth={2} aria-hidden="true" />
                    Nueva recomendación
                </button>
            </div>
        </header>
    );
}

export default RecommendationsHeader;
