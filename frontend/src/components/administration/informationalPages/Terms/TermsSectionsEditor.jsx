import EditableText from "../common/EditableText";

import "../../../../styles/components/administration/informationalPages/Terms/TermsSectionsEditor.css";

// =========================================================
// SECCIONES EDITABLES - TÉRMINOS Y CONDICIONES
// =========================================================

function TermsSectionsEditor({
    information,
    sections = [],
    onInformationChange,
    onSectionsChange,
    isPreview = false,
}) {

    // =====================================================
    // ACTUALIZAR UNA SECCIÓN DEL DOCUMENTO
    // =====================================================

    const handleSectionChange = (id, field, value) => {

        const updatedSections = sections.map((section) => {

            if (section.id !== id) {
                return section;
            }

            return {
                ...section,
                [field]: value,
            };
        });

        onSectionsChange?.(updatedSections);
    };

    if (!information) {
        return null;
    }

    return (
        <section className="terms-editor-document">

            <div className="terms-editor-document__container">

                {/* ===================================== */}
                {/* ÍNDICE LATERAL */}
                {/* ===================================== */}

                <aside className="terms-editor-document__sidebar">

                    <div className="terms-editor-document__sidebar-card">

                        <h2>
                            Contenido
                        </h2>

                        <nav aria-label="Índice de términos y condiciones">

                            {sections.map((section, index) => (

                                <a
                                    key={section.id}
                                    href={`#term-section-${section.id}`}
                                >
                                    <span>
                                        {String(index + 1).padStart(2, "0")}
                                    </span>

                                    {section.title}
                                </a>

                            ))}

                        </nav>

                    </div>

                </aside>

                {/* ===================================== */}
                {/* CONTENIDO PRINCIPAL */}
                {/* ===================================== */}

                <div className="terms-editor-document__content">

                    <div className="terms-editor-document__intro">

                        {/* La fecha de actualización es editable en ambas páginas legales. */}
                        <EditableText
                            as="p"
                            className="terms-editor-document__intro-text"
                            value={information.lastUpdated}
                            onChange={(value) => onInformationChange?.("lastUpdated", value)}
                            disabled={isPreview}
                            label="Editar fecha de actualización del documento"
                        />

                        <EditableText
                            as="p"
                            className="terms-editor-document__intro-text"
                            value={information.introduction}
                            onChange={(value) =>
                                onInformationChange?.(
                                    "introduction",
                                    value
                                )
                            }
                            multiline
                            disabled={isPreview}
                            label="Editar introducción"
                        />

                    </div>

                    {/* ===================================== */}
                    {/* SECCIONES NUMERADAS */}
                    {/* ===================================== */}

                    {sections.map((section, index) => (

                        <article
                            id={`term-section-${section.id}`}
                            key={section.id}
                            className="terms-editor-document__section"
                        >

                            <div className="terms-editor-document__section-heading">

                                <span className="terms-editor-document__number">
                                    {String(index + 1).padStart(2, "0")}
                                </span>

                                <EditableText
                                    as="h2"
                                    className="terms-editor-document__section-title"
                                    value={section.title}
                                    onChange={(value) =>
                                        handleSectionChange(
                                            section.id,
                                            "title",
                                            value
                                        )
                                    }
                                    disabled={isPreview}
                                    label={`Editar título de sección ${index + 1}`}
                                />

                            </div>

                            <EditableText
                                as="p"
                                className="terms-editor-document__section-content"
                                value={section.content}
                                onChange={(value) =>
                                    handleSectionChange(
                                        section.id,
                                        "content",
                                        value
                                    )
                                }
                                multiline
                                disabled={isPreview}
                                label={`Editar contenido de sección ${index + 1}`}
                            />

                        </article>

                    ))}

                </div>

            </div>

        </section>
    );
}

export default TermsSectionsEditor;
