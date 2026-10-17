
import EditableText from "../common/EditableText";
import EditableImage from "../common/EditableImage";

import aboutDemoData from "../../../../data/informationalPages/aboutDemoData";

import "../../../../styles/components/administration/informationalPages/About/AboutConvictionEditor.css";

// =========================================================
// EDITOR DE NUESTRA CONVICCIÓN - IGLESIA EL ANCLA
// =========================================================

function AboutConvictionEditor({
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
            className="about-editor-conviction"
            aria-label="Editar nuestra convicción"
        >

            <div className="about-editor-conviction__container">

                {/* ======================================= */}
                {/* ICONO DE LA SECCIÓN */}
                {/* ======================================= */}

                <div className="about-editor-conviction__icon-container">

                    <EditableImage
                        src={data.icon}
                        alt="Icono de nuestra convicción"
                        originalSrc={aboutDemoData.conviction.icon}
                        className="about-editor-conviction__icon"
                        wrapperClassName="about-editor-conviction__editable-icon"
                        label="Icono de nuestra convicción"
                        disabled={isPreview}
                        onChange={(image) =>
                            handleFieldChange(
                                "icon",
                                image
                            )
                        }
                    />

                </div>

                {/* ======================================= */}
                {/* CONTENIDO TEXTUAL */}
                {/* ======================================= */}

                <div className="about-editor-conviction__content">

                    {/* Subtítulo. */}
                    <EditableText
                        as="span"
                        className="about-editor-conviction__eyebrow"
                        value={data.eyebrow}
                        onChange={(value) =>
                            handleFieldChange(
                                "eyebrow",
                                value
                            )
                        }
                        label="Editar subtítulo de nuestra convicción"
                        disabled={isPreview}
                    />

                    {/* Título. */}
                    <EditableText
                        as="h2"
                        className="about-editor-conviction__title"
                        value={data.title}
                        onChange={(value) =>
                            handleFieldChange(
                                "title",
                                value
                            )
                        }
                        label="Editar título de nuestra convicción"
                        disabled={isPreview}
                    />

                    {/* Párrafos. */}
                    <div className="about-editor-conviction__paragraphs">

                        {(data.paragraphs || []).map(
                            (paragraph, index) => (

                                <EditableText
                                    key={index}
                                    as="p"
                                    className="about-editor-conviction__paragraph"
                                    value={paragraph}
                                    onChange={(value) =>
                                        handleParagraphChange(
                                            index,
                                            value
                                        )
                                    }
                                    label={`Editar párrafo ${index + 1} de nuestra convicción`}
                                    multiline
                                    disabled={isPreview}
                                />

                            )
                        )}

                    </div>

                </div>

            </div>

        </section>
    );
}

export default AboutConvictionEditor;
