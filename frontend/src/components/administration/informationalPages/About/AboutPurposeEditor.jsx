
import EditableText from "../common/EditableText";
// Importamos el editor especializado de iconos.
import EditableIcon from "../common/EditableIcon";

import aboutDemoData from "../../../../data/informationalPages/aboutDemoData";

import "../../../../styles/components/administration/informationalPages/About/AboutPurposeEditor.css";

// =========================================================
// EDITOR DE MISIÓN Y VISIÓN - IGLESIA EL ANCLA
// =========================================================

function AboutPurposeEditor({
    data,
    onChange,
    isPreview = false,
}) {

    // =====================================================
    // ACTUALIZAR CAMPOS DE MISIÓN O VISIÓN
    // =====================================================

    const handleFieldChange = (section, field, value) => {

        // Notificamos al componente padre sobre el cambio.
        // El padre administra el estado general del editor.
        onChange?.(section, field, value);
    };

    // =====================================================
    // CONFIGURACIÓN DE LAS TARJETAS
    // =====================================================

    const cards = [
        {
            key: "mission",
            label: "Misión",
            content: data.mission,
            originalIcon: aboutDemoData.purpose.mission.icon,
        },
        {
            key: "vision",
            label: "Visión",
            content: data.vision,
            originalIcon: aboutDemoData.purpose.vision.icon,
        },
    ];

    // =====================================================
    // RENDERIZADO
    // =====================================================

    return (
        <section
            className="about-editor-purpose"
            aria-label="Editar misión y visión"
        >

            <div className="about-editor-purpose__container">

                {/* ======================================= */}
                {/* TARJETAS DE MISIÓN Y VISIÓN */}
                {/* ======================================= */}

                <div className="about-editor-purpose__grid">

                    {cards.map((card) => (

                        <article
                            key={card.key}
                            className={`about-editor-purpose__card about-editor-purpose__card--${card.key}`}
                        >

                            {/* Icono editable de Misión o Visión. */}
                            <div className="about-editor-purpose__icon-container">

                                <EditableIcon
                                    src={card.content.icon}
                                    alt={`Icono de ${card.label}`}
                                    originalSrc={card.originalIcon}
                                    className="about-editor-purpose__icon"
                                    wrapperClassName="about-editor-purpose__editable-icon"
                                    label={`Icono de ${card.label}`}
                                    disabled={isPreview}
                                    onChange={(image) =>
                                        handleFieldChange(
                                            card.key,
                                            "icon",
                                            image
                                        )
                                    }
                                />

                            </div>

                            {/* SUBTÍTULO */}
                            <EditableText
                                as="span"
                                className="about-editor-purpose__eyebrow"
                                value={card.content.eyebrow}
                                onChange={(value) =>
                                    handleFieldChange(
                                        card.key,
                                        "eyebrow",
                                        value
                                    )
                                }
                                label={`Editar subtítulo de ${card.label}`}
                                disabled={isPreview}
                            />

                            {/* TÍTULO */}
                            <EditableText
                                as="h2"
                                className="about-editor-purpose__title"
                                value={card.content.title}
                                onChange={(value) =>
                                    handleFieldChange(
                                        card.key,
                                        "title",
                                        value
                                    )
                                }
                                label={`Editar título de ${card.label}`}
                                disabled={isPreview}
                            />

                            {/* DESCRIPCIÓN */}
                            <EditableText
                                as="p"
                                className="about-editor-purpose__description"
                                value={card.content.description}
                                onChange={(value) =>
                                    handleFieldChange(
                                        card.key,
                                        "description",
                                        value
                                    )
                                }
                                label={`Editar descripción de ${card.label}`}
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

export default AboutPurposeEditor;
