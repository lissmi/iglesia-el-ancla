
import EditableText from "../common/EditableText";

// Iconos originales utilizados en la página pública.
import ubicacionIcon from "../../../../assets/icons/ubicacion.png";
import escribenosIcon from "../../../../assets/icons/escribenos.png";
import reunionIcon from "../../../../assets/icons/reunion.png";

// CSS exclusivo de este componente.
import "../../../../styles/components/administration/informationalPages/Contact/ContactInformationEditor.css";

// =========================================================
// EDITOR DE INFORMACIÓN DE CONTACTO
// IGLESIA EL ANCLA
// =========================================================

function ContactInformationEditor({
    data,
    onChange,
    isPreview = false,
}) {

    // =====================================================
    // ACTUALIZAR CAMPOS DE LAS TARJETAS
    // =====================================================

    const handleCardChange = (
        cardKey,
        field,
        value
    ) => {

        if (!data || !data[cardKey]) {
            return;
        }

        // Conservamos las demás propiedades de la tarjeta.
        const updatedCard = {
            ...data[cardKey],
            [field]: value,
        };

        // Enviamos la tarjeta actualizada al componente padre.
        onChange?.(cardKey, updatedCard);
    };

    // =====================================================
    // COMPONENTE DE TEXTO EDITABLE
    // =====================================================

    const renderEditableField = (
        cardKey,
        field,
        value,
        as,
        className,
        label
    ) => {

        return (
            <EditableText
                as={as}
                className={className}
                value={value || ""}
                onChange={(newValue) =>
                    handleCardChange(
                        cardKey,
                        field,
                        newValue
                    )
                }
                label={label}
                disabled={isPreview}
            />
        );
    };

    // =====================================================
    // VALIDAR INFORMACIÓN
    // =====================================================

    if (!data) {
        return null;
    }

    const {
        location,
        email,
        schedule,
    } = data;

    // =====================================================
    // RENDERIZADO PRINCIPAL
    // =====================================================

    return (
        <section
            className="contact-editor-information"
            aria-label="Información de contacto de la iglesia"
        >

            <div className="contact-editor-information__container">

                {/* ======================================= */}
                {/* TARJETA 1 - DIRECCIÓN */}
                {/* ======================================= */}

                <article className="contact-editor-information__card">

                    <div
                        className="contact-editor-information__icon-wrapper"
                        aria-hidden="true"
                    >
                        <img
                            className="contact-editor-information__icon"
                            src={ubicacionIcon}
                            alt=""
                        />
                    </div>

                    <div className="contact-editor-information__content">

                        {renderEditableField(
                            "location",
                            "label",
                            location.label,
                            "p",
                            "contact-editor-information__label",
                            "Editar etiqueta de dirección"
                        )}

                        {renderEditableField(
                            "location",
                            "title",
                            location.title,
                            "h2",
                            "contact-editor-information__title",
                            "Editar título de dirección"
                        )}

                        <div className="contact-editor-information__details">

                            {renderEditableField(
                                "location",
                                "address",
                                location.address,
                                "p",
                                "contact-editor-information__description",
                                "Editar dirección"
                            )}

                            {renderEditableField(
                                "location",
                                "city",
                                location.city,
                                "p",
                                "contact-editor-information__description",
                                "Editar ciudad"
                            )}

                        </div>

                    </div>

                </article>

                {/* ======================================= */}
                {/* TARJETA 2 - CORREO ELECTRÓNICO */}
                {/* ======================================= */}

                <article className="contact-editor-information__card">

                    <div
                        className="contact-editor-information__icon-wrapper"
                        aria-hidden="true"
                    >
                        <img
                            className="contact-editor-information__icon"
                            src={escribenosIcon}
                            alt=""
                        />
                    </div>

                    <div className="contact-editor-information__content">

                        {renderEditableField(
                            "email",
                            "label",
                            email.label,
                            "p",
                            "contact-editor-information__label",
                            "Editar etiqueta de correo"
                        )}

                        {renderEditableField(
                            "email",
                            "title",
                            email.title,
                            "h2",
                            "contact-editor-information__title",
                            "Editar título de correo"
                        )}

                        {/* Correo editable en modo administración. */}
                        {!isPreview ? (

                            <EditableText
                                as="span"
                                className="contact-editor-information__email"
                                value={email.address}
                                onChange={(value) =>
                                    handleCardChange(
                                        "email",
                                        "address",
                                        value
                                    )
                                }
                                label="Editar correo institucional"
                            />

                        ) : (

                            <a
                                className="contact-editor-information__email"
                                href={`mailto:${email.address}`}
                            >
                                {email.address}
                            </a>

                        )}

                    </div>

                </article>

                {/* ======================================= */}
                {/* TARJETA 3 - HORARIO DE REUNIÓN */}
                {/* ======================================= */}

                <article className="contact-editor-information__card">

                    <div
                        className="contact-editor-information__icon-wrapper"
                        aria-hidden="true"
                    >
                        <img
                            className="contact-editor-information__icon contact-editor-information__icon--reunion"
                            src={reunionIcon}
                            alt=""
                        />
                    </div>

                    <div className="contact-editor-information__content">

                        {renderEditableField(
                            "schedule",
                            "label",
                            schedule.label,
                            "p",
                            "contact-editor-information__label",
                            "Editar etiqueta de reunión"
                        )}

                        {renderEditableField(
                            "schedule",
                            "title",
                            schedule.title,
                            "h2",
                            "contact-editor-information__title",
                            "Editar nombre de reunión"
                        )}

                        <div className="contact-editor-information__details">

                            {renderEditableField(
                                "schedule",
                                "dayAndTime",
                                schedule.dayAndTime,
                                "p",
                                "contact-editor-information__description",
                                "Editar día y horario"
                            )}

                            {renderEditableField(
                                "schedule",
                                "modality",
                                schedule.modality,
                                "p",
                                "contact-editor-information__description",
                                "Editar modalidad"
                            )}

                        </div>

                    </div>

                </article>

            </div>

        </section>
    );
}

export default ContactInformationEditor;
