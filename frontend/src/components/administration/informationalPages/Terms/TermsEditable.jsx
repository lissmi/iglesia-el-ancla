import TermsHeroEditor from "./TermsHeroEditor";
import TermsSectionsEditor from "./TermsSectionsEditor";

import "../../../../styles/components/administration/informationalPages/Terms/TermsEditable.css";

// =========================================================
// PÁGINA TÉRMINOS Y CONDICIONES EDITABLE
// IGLESIA EL ANCLA
// =========================================================

function TermsEditable({
    content,
    onChange,
    isPreview = false,
}) {

    // =====================================================
    // ACTUALIZAR CAMPOS DE UNA SECCIÓN
    // =====================================================

    const handleSectionChange = (section, field, value) => {

        if (!content || !content[section]) {
            return;
        }

        onChange?.({
            ...content,
            [section]: {
                ...content[section],
                [field]: value,
            },
        });
    };

    // =====================================================
    // ACTUALIZAR SECCIONES DEL DOCUMENTO
    // =====================================================

    const handleSectionsChange = (updatedSections) => {

        onChange?.({
            ...content,
            sections: updatedSections,
        });
    };

    // =====================================================
    // VALIDAR CONTENIDO
    // =====================================================

    if (!content) {
        return null;
    }

    // =====================================================
    // RENDERIZADO
    // =====================================================

    return (
        <div
            className={`terms-editable ${
                isPreview
                    ? "terms-editable--preview"
                    : "terms-editable--editing"
            }`}
        >

            <TermsHeroEditor
                data={content.hero}
                isPreview={isPreview}
                onChange={(field, value) =>
                    handleSectionChange("hero", field, value)
                }
            />

            <TermsSectionsEditor
                information={content.information}
                sections={content.sections}
                isPreview={isPreview}
                onInformationChange={(field, value) =>
                    handleSectionChange(
                        "information",
                        field,
                        value
                    )
                }
                onSectionsChange={handleSectionsChange}
            />

        </div>
    );
}

export default TermsEditable;
