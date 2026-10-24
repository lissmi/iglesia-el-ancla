

import { Link } from "react-router-dom";

import EditableText from "../common/EditableText";

import "../../../../styles/components/administration/informationalPages/About/AboutInvitationEditor.css";

// =========================================================
// EDITOR DE INVITACIÓN FINAL - IGLESIA EL ANCLA
// =========================================================

const AVAILABLE_ROUTES = [
    { value: "/", label: "Inicio" },
    { value: "/nosotros", label: "Nosotros" },
    { value: "/eventos", label: "Eventos" },
    { value: "/contacto", label: "Contacto" },
];

function AboutInvitationEditor({
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
    // ACTUALIZAR BOTONES
    // =====================================================

    const handleButtonChange = (buttonKey, field, value) => {

        const updatedButton = {
            ...data[buttonKey],
            [field]: value,
        };

        handleFieldChange(
            buttonKey,
            updatedButton
        );
    };

    // =====================================================
    // RENDERIZAR BOTÓN EDITABLE
    // =====================================================

    const renderButton = (buttonKey, variant, label) => {

        const button = data[buttonKey];

        if (!button) {
            return null;
        }

        return (
            <div
                className={`about-editor-invitation__button-editor about-editor-invitation__button-editor--${variant}`}
            >

                <div className="about-editor-invitation__button-content">

                    <EditableText
                        as="span"
                        className="about-editor-invitation__button-text"
                        value={button.text}
                        onChange={(value) =>
                            handleButtonChange(
                                buttonKey,
                                "text",
                                value
                            )
                        }
                        label={`Editar texto del botón ${label}`}
                        disabled={isPreview}
                    />

                </div>

                {/* En vista previa el botón navega normalmente. */}
                {isPreview ? (

                    <Link
                        to={button.path}
                        className={`about-editor-invitation__preview-link about-editor-invitation__preview-link--${variant}`}
                    >
                        {button.text}
                    </Link>

                ) : (

                    <div className="about-editor-invitation__route-control">

                        <label
                            htmlFor={`invitation-route-${buttonKey}`}
                            className="about-editor-invitation__route-label"
                        >
                            Destino del botón
                        </label>

                        <select
                            id={`invitation-route-${buttonKey}`}
                            className="about-editor-invitation__route-select"
                            value={button.path}
                            onChange={(event) =>
                                handleButtonChange(
                                    buttonKey,
                                    "path",
                                    event.target.value
                                )
                            }
                        >
                            {AVAILABLE_ROUTES.map((route) => (

                                <option
                                    key={route.value}
                                    value={route.value}
                                >
                                    {route.label}
                                </option>

                            ))}
                        </select>

                    </div>

                )}

            </div>
        );
    };

    // =====================================================
    // RENDERIZADO PRINCIPAL
    // =====================================================

    return (
        <section
            className="about-editor-invitation"
            aria-label="Editar invitación final"
        >

            <div className="about-editor-invitation__container">

                {/* ======================================= */}
                {/* CONTENIDO PRINCIPAL */}
                {/* ======================================= */}

                <div className="about-editor-invitation__content">

                    <EditableText
                        as="span"
                        className="about-editor-invitation__eyebrow"
                        value={data.eyebrow}
                        onChange={(value) =>
                            handleFieldChange(
                                "eyebrow",
                                value
                            )
                        }
                        label="Editar subtítulo de invitación"
                        disabled={isPreview}
                    />

                    <EditableText
                        as="h2"
                        className="about-editor-invitation__title"
                        value={data.title}
                        onChange={(value) =>
                            handleFieldChange(
                                "title",
                                value
                            )
                        }
                        label="Editar título de invitación"
                        disabled={isPreview}
                    />

                    <EditableText
                        as="p"
                        className="about-editor-invitation__description"
                        value={data.description}
                        onChange={(value) =>
                            handleFieldChange(
                                "description",
                                value
                            )
                        }
                        label="Editar descripción de invitación"
                        multiline
                        disabled={isPreview}
                    />

                </div>

                {/* ======================================= */}
                {/* BOTONES DE INVITACIÓN */}
                {/* ======================================= */}

                <div className="about-editor-invitation__actions">

                    {renderButton(
                        "primaryButton",
                        "primary",
                        "principal"
                    )}

                    {renderButton(
                        "secondaryButton",
                        "secondary",
                        "secundario"
                    )}

                </div>

            </div>

        </section>
    );
}

export default AboutInvitationEditor;




