

import EditableText from "../common/EditableText";

import "../../../../styles/components/administration/informationalPages/About/AboutHeroEditor.css";

// =========================================================
// EDITOR DE LA SECCIÓN HERO - NOSOTROS
// =========================================================

function AboutHeroEditor({
    data,
    onChange,
    isPreview = false,
}) {

    // Actualiza un campo específico de la sección Hero.
    const handleFieldChange = (field, value) => {
        onChange?.(field, value);
    };

    return (
        <section
            className="about-hero about-editor-hero"
            aria-label="Presentación principal de Nosotros"
        >

            <div className="about-hero__container">

                {/* ======================================= */}
                {/* ETIQUETA SUPERIOR */}
                {/* ======================================= */}

                <EditableText
                    as="span"
                    className="about-hero__eyebrow"
                    value={data.eyebrow}
                    onChange={(value) =>
                        handleFieldChange("eyebrow", value)
                    }
                    label="Editar etiqueta superior"
                    disabled={isPreview}
                />

                {/* ======================================= */}
                {/* TÍTULO PRINCIPAL */}
                {/* ======================================= */}

                <div className="about-editor-hero__heading">

                    <EditableText
                        as="h1"
                        className="about-hero__title"
                        value={data.title}
                        onChange={(value) =>
                            handleFieldChange("title", value)
                        }
                        label="Editar título principal"
                        disabled={isPreview}
                    />

                    <EditableText
                        as="span"
                        className="about-hero__highlight"
                        value={data.highlightedTitle}
                        onChange={(value) =>
                            handleFieldChange(
                                "highlightedTitle",
                                value
                            )
                        }
                        label="Editar título destacado"
                        disabled={isPreview}
                    />

                </div>

                {/* ======================================= */}
                {/* DESCRIPCIÓN */}
                {/* ======================================= */}

                <EditableText
                    as="p"
                    className="about-hero__description"
                    value={data.description}
                    onChange={(value) =>
                        handleFieldChange("description", value)
                    }
                    label="Editar descripción principal"
                    multiline
                    disabled={isPreview}
                />

                {/* ======================================= */}
                {/* VERSÍCULO BÍBLICO */}
                {/* ======================================= */}

                <div className="about-editor-hero__verse">

                    <EditableText
                        as="p"
                        className="about-hero__verse"
                        value={data.verse}
                        onChange={(value) =>
                            handleFieldChange("verse", value)
                        }
                        label="Editar versículo bíblico"
                        multiline
                        disabled={isPreview}
                    />

                    <EditableText
                        as="span"
                        className="about-hero__verse-reference"
                        value={data.verseReference}
                        onChange={(value) =>
                            handleFieldChange(
                                "verseReference",
                                value
                            )
                        }
                        label="Editar referencia bíblica"
                        disabled={isPreview}
                    />

                </div>

            </div>

        </section>
    );
}

export default AboutHeroEditor;
