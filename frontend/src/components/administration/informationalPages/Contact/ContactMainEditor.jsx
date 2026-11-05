import EditableText from "../common/EditableText";

import facebookIcon from "../../../../assets/icons/fb.png";
import instagramIcon from "../../../../assets/icons/insta.png";

import "../../../../styles/components/administration/informationalPages/Contact/ContactMainEditor.css";

// =========================================================
// EDITOR DE INFORMACIÓN PRINCIPAL DE CONTACTO
// IGLESIA EL ANCLA
// =========================================================

// Solo permitimos enlaces HTTPS para redes sociales.
const isValidSocialUrl = (url) => {
    try {
        const parsedUrl = new URL(url);

        return parsedUrl.protocol === "https:";
    } catch {
        return false;
    }
};

function ContactMainEditor({
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
    // ACTUALIZAR RECOMENDACIONES
    // =====================================================

    const handleNoticeChange = (field, value) => {

        handleFieldChange("notice", {
            ...data.notice,
            [field]: value,
        });
    };

    const handleNoticeItemChange = (index, value) => {

        const updatedItems = data.notice.items.map(
            (item, itemIndex) =>
                itemIndex === index ? value : item
        );

        handleNoticeChange("items", updatedItems);
    };

    // =====================================================
    // ACTUALIZAR REDES SOCIALES
    // =====================================================

    const handleSocialChange = (field, value) => {

        handleFieldChange("social", {
            ...data.social,
            [field]: value,
        });
    };

    const handleSocialNetworkChange = (
        network,
        field,
        value
    ) => {

        handleSocialChange(network, {
            ...data.social[network],
            [field]: value,
        });
    };

    // =====================================================
    // RENDERIZAR RED SOCIAL
    // =====================================================

    const renderSocialNetwork = (
        network,
        icon,
        name
    ) => {

        const socialData = data.social[network];

        if (!socialData) {
            return null;
        }

        const validUrl = isValidSocialUrl(
            socialData.url
        );

        return (
            <div
                className="contact-editor-main__social-item"
                key={network}
            >

                {/* Vista previa: enlace funcional. */}
                {isPreview ? (

                    validUrl ? (

                        <a
                            className="contact-editor-main__social-link"
                            href={socialData.url}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <img
                                src={icon}
                                alt=""
                                aria-hidden="true"
                            />

                            <span>
                                {socialData.label}
                            </span>
                        </a>

                    ) : (

                        <span className="contact-editor-main__social-link contact-editor-main__social-link--invalid">
                            <img
                                src={icon}
                                alt=""
                                aria-hidden="true"
                            />

                            <span>
                                {socialData.label}
                            </span>
                        </span>

                    )

                ) : (

                    <>
                        {/* Nombre visible de la red social. */}
                        <div className="contact-editor-main__social-link">

                            <img
                                src={icon}
                                alt=""
                                aria-hidden="true"
                            />

                            <EditableText
                                as="span"
                                className="contact-editor-main__social-name"
                                value={socialData.label}
                                onChange={(value) =>
                                    handleSocialNetworkChange(
                                        network,
                                        "label",
                                        value
                                    )
                                }
                                label={`Editar nombre de ${name}`}
                            />

                        </div>

                        {/* Campo de configuración del enlace. */}
                        <div className="contact-editor-main__social-settings">

                            <label>
                                Enlace de {name}
                            </label>

                            <EditableText
                                as="span"
                                className="contact-editor-main__social-url"
                                value={socialData.url}
                                onChange={(value) => {
                                    if (!isValidSocialUrl(value)) {
                                        return;
                                    }

                                    handleSocialNetworkChange(
                                        network,
                                        "url",
                                        value
                                    );
                                }}
                                placeholder={`https://${network}.com/...`}
                                label={`Editar enlace de ${name}`}
                            />

                        </div>
                    </>

                )}

            </div>
        );
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
        <div className="contact-editor-main">

            {/* ======================================= */}
            {/* ENCABEZADO */}
            {/* ======================================= */}

            <EditableText
                as="p"
                className="contact-editor-main__eyebrow"
                value={data.eyebrow}
                onChange={(value) =>
                    handleFieldChange(
                        "eyebrow",
                        value
                    )
                }
                label="Editar subtítulo de contacto"
                disabled={isPreview}
            />

            <EditableText
                as="h2"
                className="contact-editor-main__title"
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
                as="p"
                className="contact-editor-main__description"
                value={data.description}
                onChange={(value) =>
                    handleFieldChange(
                        "description",
                        value
                    )
                }
                label="Editar descripción"
                multiline
                disabled={isPreview}
            />

            {/* ======================================= */}
            {/* TARJETA DE RECOMENDACIONES */}
            {/* ======================================= */}

            <div className="contact-editor-main__notice">

                <EditableText
                    as="h3"
                    className="contact-editor-main__notice-title"
                    value={data.notice.title}
                    onChange={(value) =>
                        handleNoticeChange(
                            "title",
                            value
                        )
                    }
                    label="Editar título de recomendaciones"
                    disabled={isPreview}
                />

                <ul className="contact-editor-main__notice-list">

                    {data.notice.items.map((item, index) => (

                        <li key={index}>

                            <EditableText
                                as="span"
                                className="contact-editor-main__notice-item"
                                value={item}
                                onChange={(value) =>
                                    handleNoticeItemChange(
                                        index,
                                        value
                                    )
                                }
                                label={`Editar recomendación ${index + 1}`}
                                disabled={isPreview}
                            />

                        </li>

                    ))}

                </ul>

            </div>

            {/* ======================================= */}
            {/* REDES SOCIALES */}
            {/* ======================================= */}

            <div className="contact-editor-main__social">

                <EditableText
                    as="p"
                    className="contact-editor-main__social-title"
                    value={data.social.title}
                    onChange={(value) =>
                        handleSocialChange(
                            "title",
                            value
                        )
                    }
                    label="Editar título de redes sociales"
                    disabled={isPreview}
                />

                <div className="contact-editor-main__social-links">

                    {renderSocialNetwork(
                        "facebook",
                        facebookIcon,
                        "Facebook"
                    )}

                    {renderSocialNetwork(
                        "instagram",
                        instagramIcon,
                        "Instagram"
                    )}

                </div>

            </div>

        </div>
    );
}

export default ContactMainEditor;
