
import EditableText from "../common/EditableText";

// Importamos el componente especializado en editar iconos.
import EditableIcon from "../common/EditableIcon";

// Importamos los datos originales para restaurar el icono.
import aboutDemoData from "../../../../data/informationalPages/aboutDemoData";

// Importamos los estilos de Nuestra convicción.
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

        // Notificamos al componente padre sobre el cambio.
        onChange?.(field, value);
    };

    // =====================================================
    // ACTUALIZAR PÁRRAFOS
    // =====================================================

    const handleParagraphChange = (index, value) => {

        // Copiamos los párrafos para no modificar las props.
        const updatedParagraphs = [
            ...(data.paragraphs || []),
        ];

        // Actualizamos únicamente el párrafo seleccionado.
        updatedParagraphs[index] = value;

        // Enviamos los nuevos párrafos al componente padre.
        handleFieldChange(
            "paragraphs",
            updatedParagraphs
        );
    };

    // =====================================================
    // RENDERIZADO PRINCIPAL
    // =====================================================

    return (
        <section
            className="about-editor-conviction"
            aria-label="Editar nuestra convicción"
        >

            <div className="about-editor-conviction__container">

                {/* ======================================= */}
                {/* ICONO EDITABLE DE NUESTRA CONVICCIÓN */}
                {/* ======================================= */}

                <div className="about-editor-conviction__icon-container">

                    <EditableIcon
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

                    {/* Subtítulo de la sección. */}
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

                    {/* Título principal de la sección. */}
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

                    {/* Contenedor de párrafos editables. */}
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
