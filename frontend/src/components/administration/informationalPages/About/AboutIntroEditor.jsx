import EditableText from "../common/EditableText";
import EditableImage from "../common/EditableImage";

import aboutDemoData from "../../../../data/informationalPages/aboutDemoData";

import "../../../../styles/components/administration/informationalPages/About/AboutIntroEditor.css";

// =========================================================
// EDITOR DE LA SECCIÓN QUIÉNES SOMOS
// =========================================================

function AboutIntroEditor({
    data,
    onChange,
    isPreview = false,
}) {

    // =====================================================
    // ACTUALIZAR CAMPOS INDIVIDUALES
    // =====================================================

    const handleFieldChange = (field, value) => {
        onChange?.(field, value);
    };

    // =====================================================
    // ACTUALIZAR PÁRRAFOS
    // =====================================================

    const handleParagraphChange = (index, value) => {

        const updatedParagraphs = [
            ...(data.paragraphs || []),
        ];

        updatedParagraphs[index] = value;

        handleFieldChange(
            "paragraphs",
            updatedParagraphs
        );
    };

    // =====================================================
    // RENDERIZADO
    // =====================================================

    return (
        <section
            className="about-editor-intro"
            aria-label="Editar sección Quiénes somos"
        >

            <div className="about-editor-intro__container">

                {/* ======================================= */}
                {/* CONTENIDO TEXTUAL */}
                {/* ======================================= */}

                <div className="about-editor-intro__content">

                    <EditableText
                        as="span"
                        className="about-editor-intro__eyebrow"
                        value={data.eyebrow}
                        onChange={(value) =>
                            handleFieldChange(
                                "eyebrow",
                                value
                            )
                        }
                        label="Editar subtítulo de Quiénes somos"
                        disabled={isPreview}
                    />

                    <EditableText
                        as="h2"
                        className="about-editor-intro__title"
                        value={data.title}
                        onChange={(value) =>
                            handleFieldChange(
                                "title",
                                value
                            )
                        }
                        label="Editar título de Quiénes somos"
                        disabled={isPreview}
                    />

                    {/* Párrafos editables. */}
                    <div className="about-editor-intro__paragraphs">

                        {(data.paragraphs || []).map(
                            (paragraph, index) => (

                                <EditableText
                                    key={index}
                                    as="p"
                                    className="about-editor-intro__paragraph"
                                    value={paragraph}
                                    onChange={(value) =>
                                        handleParagraphChange(
                                            index,
                                            value
                                        )
                                    }
                                    label={`Editar párrafo ${index + 1}`}
                                    multiline
                                    disabled={isPreview}
                                />

                            )
                        )}

                    </div>

                </div>

                {/* ======================================= */}
                {/* FOTOGRAFÍA Y PIE DE IMAGEN */}
                {/* ======================================= */}

                <div className="about-editor-intro__media">

                    <EditableImage
                        src={data.image}
                        alt={data.imageAlt}
                        originalSrc={aboutDemoData.intro.image}
                        className="about-editor-intro__image"
                        label="Fotografía de la comunidad"
                        disabled={isPreview}
                        onImageAndAltChange={(image, alt) =>
                            handleFieldChange("__batch__", {
                                image,
                                imageAlt: alt,
                            })
                        }
                    />

                    <EditableText
                        as="p"
                        className="about-editor-intro__caption"
                        value={data.imageCaption}
                        onChange={(value) =>
                            handleFieldChange(
                                "imageCaption",
                                value
                            )
                        }
                        label="Editar pie de fotografía"
                        multiline
                        disabled={isPreview}
                    />

                </div>

            </div>

        </section>
    );
}

export default AboutIntroEditor;
