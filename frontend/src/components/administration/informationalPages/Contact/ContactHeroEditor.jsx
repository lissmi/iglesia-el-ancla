import EditableText from "../common/EditableText";

import "../../../../styles/components/administration/informationalPages/Contact/ContactHeroEditor.css";

// =========================================================
// EDITOR DEL HERO DE CONTACTO
// IGLESIA EL ANCLA
// =========================================================

function ContactHeroEditor({
    data,
    onChange,
    isPreview = false,
}) {

    // =====================================================
    // ACTUALIZAR CAMPOS
    // =====================================================

    const handleFieldChange = (field, value) => {

        // Comunicamos los cambios al contenedor padre.
        onChange?.(field, value);
    };

    // =====================================================
    // VALIDAR DATOS
    // =====================================================

    if (!data) {
        return null;
    }

    // =====================================================
    // RENDERIZADO PRINCIPAL
    // =====================================================

    return (
        <section
            className={`contact-editor-hero ${
                isPreview
                    ? "contact-editor-hero--preview"
                    : "contact-editor-hero--editing"
            }`}
            aria-label="Encabezado de la página Contacto"
        >

            {/* ======================================= */}
            {/* CAPA DECORATIVA */}
            {/* ======================================= */}

            <div
                className="contact-editor-hero__overlay"
                aria-hidden="true"
            />

            {/* ======================================= */}
            {/* CONTENIDO PRINCIPAL */}
            {/* ======================================= */}

            <div className="contact-editor-hero__container">

                {/* Texto introductorio. */}
                <EditableText
                    as="p"
                    className="contact-editor-hero__eyebrow"
                    value={data.eyebrow}
                    onChange={(value) =>
                        handleFieldChange(
                            "eyebrow",
                            value
                        )
                    }
                    label="Editar texto introductorio"
                    disabled={isPreview}
                />

                {/* =================================== */}
                {/* TÍTULO PRINCIPAL */}
                {/* =================================== */}

                <div className="contact-editor-hero__heading">

                    <EditableText
                        as="h1"
                        className="contact-editor-hero__title"
                        value={data.title}
                        onChange={(value) =>
                            handleFieldChange(
                                "title",
                                value
                            )
                        }
                        label="Editar título principal"
                        disabled={isPreview}
                    />

                    <EditableText
                        as="span"
                        className="contact-editor-hero__title-highlight"
                        value={data.highlightedTitle}
                        onChange={(value) =>
                            handleFieldChange(
                                "highlightedTitle",
                                value
                            )
                        }
                        label="Editar texto destacado"
                        disabled={isPreview}
                    />

                </div>

                {/* =================================== */}
                {/* DESCRIPCIÓN */}
                {/* =================================== */}

                <EditableText
                    as="p"
                    className="contact-editor-hero__description"
                    value={data.description}
                    onChange={(value) =>
                        handleFieldChange(
                            "description",
                            value
                        )
                    }
                    label="Editar descripción del encabezado"
                    multiline
                    disabled={isPreview}
                />

            </div>

            {/* ======================================= */}
            {/* CURVA DECORATIVA INFERIOR */}
            {/* ======================================= */}

            <div
                className="contact-editor-hero__curve"
                aria-hidden="true"
            />

        </section>
    );
}

export default ContactHeroEditor;
