
import ContactHeroEditor from "./ContactHeroEditor";
import ContactInformationEditor from "./ContactInformationEditor";
import ContactMainEditor from "./ContactMainEditor";
import ContactFormEditor from "./ContactFormEditor";

import "../../../../styles/components/administration/informationalPages/Contact/ContactEditable.css";

// =========================================================
// PÁGINA CONTACTO EDITABLE
// IGLESIA EL ANCLA
// =========================================================

function ContactEditable({
    content,
    onChange,
    isPreview = false,
}) {

    // =====================================================
    // ACTUALIZAR UNA SECCIÓN
    // =====================================================

    const handleSectionChange = (
        section,
        field,
        value
    ) => {

        if (!content || !content[section]) {
            return;
        }

        // Creamos una nueva versión de la sección.
        const updatedSection = {
            ...content[section],
            [field]: value,
        };

        // Creamos una nueva versión del contenido.
        const updatedContent = {
            ...content,
            [section]: updatedSection,
        };

        // Comunicamos el cambio al editor principal.
        onChange?.(updatedContent);
    };

    // =====================================================
    // VALIDAR CONTENIDO
    // =====================================================

    if (!content) {
        return null;
    }

    // =====================================================
    // RENDERIZADO PRINCIPAL
    // =====================================================

    return (
        <div
            className={`contact-editable ${
                isPreview
                    ? "contact-editable--preview"
                    : "contact-editable--editing"
            }`}
        >

            {/* ======================================= */}
            {/* 1. ENCABEZADO PRINCIPAL */}
            {/* ======================================= */}

            <ContactHeroEditor
                data={content.hero}
                isPreview={isPreview}
                onChange={(field, value) =>
                    handleSectionChange(
                        "hero",
                        field,
                        value
                    )
                }
            />

            {/* ======================================= */}
            {/* 2. TARJETAS DE INFORMACIÓN */}
            {/* ======================================= */}

            <ContactInformationEditor
                data={content.information}
                isPreview={isPreview}
                onChange={(field, value) =>
                    handleSectionChange(
                        "information",
                        field,
                        value
                    )
                }
            />

            {/* ======================================= */}
            {/* 3. INFORMACIÓN Y FORMULARIO */}
            {/* ======================================= */}

            <section
                className="contact-editable__main"
                aria-label="Formulario e información de contacto"
            >

                <div className="contact-editable__main-container">

                    {/* Columna izquierda. */}
                    <ContactMainEditor
                        data={content.main}
                        isPreview={isPreview}
                        onChange={(field, value) =>
                            handleSectionChange(
                                "main",
                                field,
                                value
                            )
                        }
                    />

                    {/* Columna derecha. */}
                    <ContactFormEditor
                        data={content.form}
                        isPreview={isPreview}
                        onChange={(field, value) =>
                            handleSectionChange(
                                "form",
                                field,
                                value
                            )
                        }
                    />

                </div>

            </section>

        </div>
    );
}

export default ContactEditable;
