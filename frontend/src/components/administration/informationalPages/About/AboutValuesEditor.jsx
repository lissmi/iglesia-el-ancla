import EditableText from "../common/EditableText";
import EditableImage from "../common/EditableImage";

import aboutDemoData from "../../../../data/informationalPages/aboutDemoData";

import "../../../../styles/components/administration/informationalPages/About/AboutValuesEditor.css";

// =========================================================
// EDITOR DE NUESTROS VALORES - IGLESIA EL ANCLA
// =========================================================

function AboutValuesEditor({
    data,
    onChange,
    isPreview = false,
}) {

    // =====================================================
    // ACTUALIZAR CAMPOS GENERALES
    // =====================================================

    const handleFieldChange = (field, value) => {
        onChange?.(field, value);
    };

    // =====================================================
    // ACTUALIZAR UN VALOR ESPECÍFICO
    // =====================================================

    const handleValueChange = (id, field, value) => {

        const updatedItems = (data.items || []).map(
            (item) => {

                if (item.id !== id) {
                    return item;
                }

                return {
                    ...item,
                    ...(field === "__batch__" ? value : { [field]: value }),
                };
            }
        );

        handleFieldChange("items", updatedItems);
    };

    // =====================================================
    // OBTENER ICONO ORIGINAL
    // =====================================================

    const getOriginalIcon = (id) => {

        const originalItem =
            aboutDemoData.values.items.find(
                (item) => item.id === id
            );

        return originalItem?.icon;
    };

    // =====================================================
    // RENDERIZADO
    // =====================================================

    return (
        <section
            className="about-editor-values"
            aria-label="Editar valores de la iglesia"
        >

            <div className="about-editor-values__container">

                {/* ======================================= */}
                {/* ENCABEZADO DE LA SECCIÓN */}
                {/* ======================================= */}

                <div className="about-editor-values__header">

                    <EditableText
                        as="span"
                        className="about-editor-values__eyebrow"
                        value={data.eyebrow}
                        onChange={(value) =>
                            handleFieldChange(
                                "eyebrow",
                                value
                            )
                        }
                        label="Editar subtítulo de valores"
                        disabled={isPreview}
                    />

                    <EditableText
                        as="h2"
                        className="about-editor-values__title"
                        value={data.title}
                        onChange={(value) =>
                            handleFieldChange(
                                "title",
                                value
                            )
                        }
                        label="Editar título de valores"
                        disabled={isPreview}
                    />

                    <EditableText
                        as="p"
                        className="about-editor-values__description"
                        value={data.description}
                        onChange={(value) =>
                            handleFieldChange(
                                "description",
                                value
                            )
                        }
                        label="Editar descripción de valores"
                        multiline
                        disabled={isPreview}
                    />

                </div>

                {/* ======================================= */}
                {/* TARJETAS DE VALORES */}
                {/* ======================================= */}

                <div className="about-editor-values__grid">

                    {(data.items || []).map((item, index) => (

                        <article
                            key={item.id}
                            className="about-editor-values__card"
                        >

                            {/* Número identificador. */}
                            <span className="about-editor-values__number">
                                {String(index + 1).padStart(2, "0")}
                            </span>

                            {/* Icono editable. */}
                            <div className="about-editor-values__icon-container">

                                <EditableImage
                                    src={item.icon}
                                    alt={item.alt}
                                    originalSrc={getOriginalIcon(item.id)}
                                    className="about-editor-values__icon"
                                    wrapperClassName="about-editor-values__editable-icon"
                                    label={`Icono del valor ${item.title}`}
                                    disabled={isPreview}
                                    onImageAndAltChange={(icon, alt) =>
                                        handleValueChange(item.id, "__batch__", {
                                            icon,
                                            alt,
                                        })
                                    }
                                />

                            </div>

                            {/* Título del valor. */}
                            <EditableText
                                as="h3"
                                className="about-editor-values__card-title"
                                value={item.title}
                                onChange={(value) =>
                                    handleValueChange(
                                        item.id,
                                        "title",
                                        value
                                    )
                                }
                                label={`Editar título del valor ${index + 1}`}
                                disabled={isPreview}
                            />

                            {/* Descripción del valor. */}
                            <EditableText
                                as="p"
                                className="about-editor-values__card-description"
                                value={item.description}
                                onChange={(value) =>
                                    handleValueChange(
                                        item.id,
                                        "description",
                                        value
                                    )
                                }
                                label={`Editar descripción de ${item.title}`}
                                multiline
                                disabled={isPreview}
                            />

                        </article>

                    ))}

                </div>

            </div>

        </section>
    );
}

export default AboutValuesEditor;
