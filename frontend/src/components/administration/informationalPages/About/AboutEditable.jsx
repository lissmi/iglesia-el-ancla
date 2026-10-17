
import AboutHeroEditor from "./AboutHeroEditor";
import AboutIntroEditor from "./AboutIntroEditor";
import AboutPurposeEditor from "./AboutPurposeEditor";
import AboutConvictionEditor from "./AboutConvictionEditor";
import AboutValuesEditor from "./AboutValuesEditor";
import AboutPastorEditor from "./AboutPastorEditor";
import AboutInvitationEditor from "./AboutInvitationEditor";

import "../../../../styles/components/administration/informationalPages/About/AboutEditable.css";

// =========================================================
// CONTENEDOR EDITABLE DE LA PÁGINA NOSOTROS
// IGLESIA EL ANCLA
// =========================================================

function AboutEditable({
    content,
    onChange,
    isPreview = false,
}) {

    // =====================================================
    // ACTUALIZAR CAMPOS DE UNA SECCIÓN
    // =====================================================

    const handleSectionChange = (
        section,
        field,
        value
    ) => {

        if (!content || !content[section]) {
            return;
        }

        // Creamos una nueva versión del contenido.
        // No modificamos directamente las props.
        const updatedContent = {
            ...content,

            [section]: {
                ...content[section],
                [field]: value,
            },
        };

        // Enviamos los cambios al contenedor padre.
        onChange?.(updatedContent);
    };

    // =====================================================
    // ACTUALIZAR OBJETOS ANIDADOS
    // =====================================================
    // Se utiliza específicamente para Misión y Visión.
    // =====================================================

    const handleNestedSectionChange = (
        section,
        subsection,
        field,
        value
    ) => {

        if (
            !content ||
            !content[section] ||
            !content[section][subsection]
        ) {
            return;
        }

        const updatedContent = {
            ...content,

            [section]: {
                ...content[section],

                [subsection]: {
                    ...content[section][subsection],
                    [field]: value,
                },
            },
        };

        onChange?.(updatedContent);
    };

    // =====================================================
    // VALIDAR CONTENIDO
    // =====================================================

    if (!content) {
        return (
            <div
                className="about-editable__empty"
                role="status"
            >
                <h2>No se pudo cargar la página Nosotros</h2>

                <p>
                    No hay información disponible para
                    mostrar en el editor.
                </p>
            </div>
        );
    }

    // =====================================================
    // RENDERIZADO DE LAS SIETE SECCIONES
    // =====================================================

    return (
        <div
            className={`about-editable ${
                isPreview
                    ? "about-editable--preview"
                    : "about-editable--editing"
            }`}
        >

            {/* ======================================= */}
            {/* 1. PRESENTACIÓN PRINCIPAL */}
            {/* ======================================= */}

            <AboutHeroEditor
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
            {/* 2. QUIÉNES SOMOS */}
            {/* ======================================= */}

            <AboutIntroEditor
                data={content.intro}
                isPreview={isPreview}
                onChange={(field, value) =>
                    handleSectionChange(
                        "intro",
                        field,
                        value
                    )
                }
            />

            {/* ======================================= */}
            {/* 3. MISIÓN Y VISIÓN */}
            {/* ======================================= */}

            <AboutPurposeEditor
                data={content.purpose}
                isPreview={isPreview}
                onChange={(subsection, field, value) =>
                    handleNestedSectionChange(
                        "purpose",
                        subsection,
                        field,
                        value
                    )
                }
            />

            {/* ======================================= */}
            {/* 4. NUESTRA CONVICCIÓN */}
            {/* ======================================= */}

            <AboutConvictionEditor
                data={content.conviction}
                isPreview={isPreview}
                onChange={(field, value) =>
                    handleSectionChange(
                        "conviction",
                        field,
                        value
                    )
                }
            />

            {/* ======================================= */}
            {/* 5. NUESTROS VALORES */}
            {/* ======================================= */}

            <AboutValuesEditor
                data={content.values}
                isPreview={isPreview}
                onChange={(field, value) =>
                    handleSectionChange(
                        "values",
                        field,
                        value
                    )
                }
            />

            {/* ======================================= */}
            {/* 6. PRESENTACIÓN DEL PASTOR */}
            {/* ======================================= */}

            <AboutPastorEditor
                data={content.pastor}
                isPreview={isPreview}
                onChange={(field, value) =>
                    handleSectionChange(
                        "pastor",
                        field,
                        value
                    )
                }
            />

            {/* ======================================= */}
            {/* 7. INVITACIÓN FINAL */}
            {/* ======================================= */}

            <AboutInvitationEditor
                data={content.invitation}
                isPreview={isPreview}
                onChange={(field, value) =>
                    handleSectionChange(
                        "invitation",
                        field,
                        value
                    )
                }
            />

        </div>
    );
}

export default AboutEditable;
