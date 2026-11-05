import EditableText from "../common/EditableText";

import "../../../../styles/components/administration/informationalPages/Terms/TermsHeroEditor.css";

// =========================================================
// ENCABEZADO EDITABLE - TÉRMINOS Y CONDICIONES
// =========================================================

function TermsHeroEditor({
    data,
    onChange,
    isPreview = false,
}) {

    if (!data) {
        return null;
    }

    const handleChange = (field, value) => {
        onChange?.(field, value);
    };

    return (
        <section className="terms-editor-hero">

            <div className="terms-editor-hero__container">

                <EditableText
                    as="p"
                    className="terms-editor-hero__eyebrow"
                    value={data.eyebrow}
                    onChange={(value) =>
                        handleChange("eyebrow", value)
                    }
                    disabled={isPreview}
                    label="Editar categoría legal"
                />

                <div className="terms-editor-hero__heading">

                    <EditableText
                        as="h1"
                        className="terms-editor-hero__title"
                        value={data.title}
                        onChange={(value) =>
                            handleChange("title", value)
                        }
                        disabled={isPreview}
                        label="Editar título principal"
                    />

                    <EditableText
                        as="span"
                        className="terms-editor-hero__highlight"
                        value={data.highlightedTitle}
                        onChange={(value) =>
                            handleChange(
                                "highlightedTitle",
                                value
                            )
                        }
                        disabled={isPreview}
                        label="Editar título destacado"
                    />

                </div>

                <EditableText
                    as="p"
                    className="terms-editor-hero__description"
                    value={data.description}
                    onChange={(value) =>
                        handleChange("description", value)
                    }
                    multiline
                    disabled={isPreview}
                    label="Editar descripción del encabezado"
                />

                <div
                    className="terms-editor-hero__decoration"
                    aria-hidden="true"
                />

            </div>

        </section>
    );
}

export default TermsHeroEditor;
