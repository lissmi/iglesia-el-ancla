import { Clapperboard, Plus } from "lucide-react";
import "../../../styles/components/administration/recommendations/RecommendationsHeader.css";

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function RecommendationsHeader({ onCreateRecommendation }) {

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




