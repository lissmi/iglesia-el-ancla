
import EditableText from "../common/EditableText";
import EditableImage from "../common/EditableImage";

import aboutDemoData from "../../../../data/informationalPages/aboutDemoData";

import "../../../../styles/components/administration/informationalPages/About/AboutPastorEditor.css";

// =========================================================
// EDITOR DE PRESENTACIÓN DEL PASTOR
// IGLESIA EL ANCLA
// =========================================================

function AboutPastorEditor({
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

        // Creamos una copia para no modificar directamente
        // los datos recibidos desde el componente padre.
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
            className="about-editor-pastor"
            aria-label="Editar presentación del pastor"
        >

            <div className="about-editor-pastor__container">

                {/* ======================================= */}
                {/* FOTOGRAFÍA DEL PASTOR */}
                {/* ======================================= */}

                <div className="about-editor-pastor__media">

                    <div className="about-editor-pastor__image-frame">

                        <EditableImage
                            src={data.image}
                            alt={data.imageAlt}
                            originalSrc={aboutDemoData.pastor.image}
                            className="about-editor-pastor__image"
                            wrapperClassName="about-editor-pastor__editable-image"
                            label="Fotografía del pastor"
                            disabled={isPreview}
                            onChange={(image) =>
                                handleFieldChange(
                                    "image",
                                    image
                                )
                            }
                            onAltChange={(alt) =>
                                handleFieldChange(
                                    "imageAlt",
                                    alt
                                )
                            }
                        />

                    </div>

                    {/* Elemento decorativo. */}
                    <div
                        className="about-editor-pastor__image-decoration"
                        aria-hidden="true"
                    />

                </div>

                {/* ======================================= */}
                {/* INFORMACIÓN DEL PASTOR */}
                {/* ======================================= */}

                <div className="about-editor-pastor__content">

                    {/* Subtítulo. */}
                    <EditableText
                        as="span"
                        className="about-editor-pastor__eyebrow"
                        value={data.eyebrow}
                        onChange={(value) =>
                            handleFieldChange(
                                "eyebrow",
                                value
                            )
                        }
                        label="Editar subtítulo del pastor"
                        disabled={isPreview}
                    />

                    {/* Nombre. */}
                    <EditableText
                        as="h2"
                        className="about-editor-pastor__name"
                        value={data.name}
                        onChange={(value) =>
                            handleFieldChange(
                                "name",
                                value
                            )
                        }
                        label="Editar nombre del pastor"
                        disabled={isPreview}
                    />

                    {/* Cargo o función. */}
                    <EditableText
                        as="span"
                        className="about-editor-pastor__role"
                        value={data.role}
                        onChange={(value) =>
                            handleFieldChange(
                                "role",
                                value
                            )
                        }
                        label="Editar cargo del pastor"
                        disabled={isPreview}
                    />

                    {/* Separador decorativo. */}
                    <div
                        className="about-editor-pastor__divider"
                        aria-hidden="true"
                    />

                    {/* Párrafos de presentación. */}
                    <div className="about-editor-pastor__paragraphs">

                        {(data.paragraphs || []).map(
                            (paragraph, index) => (

                                <EditableText
                                    key={index}
                                    as="p"
                                    className="about-editor-pastor__paragraph"
                                    value={paragraph}
                                    onChange={(value) =>
                                        handleParagraphChange(
                                            index,
                                            value
                                        )
                                    }
                                    label={`Editar párrafo ${index + 1} del pastor`}
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

export default AboutPastorEditor;
