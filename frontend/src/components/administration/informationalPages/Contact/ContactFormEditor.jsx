
import EditableText from "../common/EditableText";

import "../../../../styles/components/administration/informationalPages/Contact/ContactFormEditor.css";

// =========================================================
// EDITOR DEL FORMULARIO DE CONTACTO
// IGLESIA EL ANCLA
// =========================================================

// Los campos del formulario son fijos.
// Solo se permite editar el título y subtítulo.

const FORM_FIELDS = [
    {
        key: "name",
        type: "text",
        multiline: false,
    },
    {
        key: "email",
        type: "email",
        multiline: false,
    },
    {
        key: "subject",
        type: "text",
        multiline: false,
    },
    {
        key: "message",
        type: "text",
        multiline: true,
    },
];

function ContactFormEditor({
    data,
    onChange,
    isPreview = false,
}) {

    // =====================================================
    // ACTUALIZAR SOLO TÍTULO Y SUBTÍTULO
    // =====================================================

    const handleFieldChange = (field, value) => {

        if (
            field !== "eyebrow" &&
            field !== "title"
        ) {
            return;
        }

        onChange?.(field, value);
    };

    // =====================================================
    // VALIDAR DATOS
    // =====================================================

    if (!data) {
        return null;
    }

    // =====================================================
    // RENDERIZAR CAMPOS FIJOS
    // =====================================================

    const renderFormField = ({
        key,
        type,
        multiline,
    }) => {

        const fieldData = data.fields?.[key];

        if (!fieldData) {
            return null;
        }

        const fieldId = `contact-editor-form-${key}`;

        return (
            <div
                key={key}
                className="contact-editor-form__field"
            >

                {/* Etiqueta fija. */}
                <label
                    className="contact-editor-form__label"
                    htmlFor={fieldId}
                >
                    {fieldData.label}
                </label>

                {/* Campo de visualización no editable. */}
                {multiline ? (

                    <textarea
                        id={fieldId}
                        className="contact-editor-form__input contact-editor-form__textarea"
                        placeholder={fieldData.placeholder}
                        rows={5}
                        disabled
                    />

                ) : (

                    <input
                        id={fieldId}
                        className="contact-editor-form__input"
                        type={type}
                        placeholder={fieldData.placeholder}
                        disabled
                    />

                )}

            </div>
        );
    };

    // =====================================================
    // RENDERIZADO PRINCIPAL
    // =====================================================

    return (
        <div
            className={`contact-editor-form ${
                isPreview
                    ? "contact-editor-form--preview"
                    : "contact-editor-form--editing"
            }`}
        >

            {/* ======================================= */}
            {/* ENCABEZADO EDITABLE */}
            {/* ======================================= */}

            <div className="contact-editor-form__header">

                {/* Subtítulo editable. */}
                <EditableText
                    as="p"
                    className="contact-editor-form__eyebrow"
                    value={data.eyebrow}
                    onChange={(value) =>
                        handleFieldChange(
                            "eyebrow",
                            value
                        )
                    }
                    label="Editar subtítulo del formulario"
                    disabled={isPreview}
                />

                {/* Título editable. */}
                <EditableText
                    as="h3"
                    className="contact-editor-form__title"
                    value={data.title}
                    onChange={(value) =>
                        handleFieldChange(
                            "title",
                            value
                        )
                    }
                    label="Editar título del formulario"
                    disabled={isPreview}
                />

            </div>

            {/* ======================================= */}
            {/* FORMULARIO FIJO */}
            {/* ======================================= */}

            <div className="contact-editor-form__fields">

                {/* Campos no editables. */}
                {FORM_FIELDS.map(renderFormField)}

                {/* =================================== */}
                {/* BOTÓN FIJO */}
                {/* =================================== */}

                <div className="contact-editor-form__submit-area">

                    <button
                        type="button"
                        className="contact-editor-form__submit"
                        disabled
                        title="Envío deshabilitado en el editor"
                    >
                        {data.submitText}
                    </button>

                </div>

                {/* =================================== */}
                {/* AVISO DE PRIVACIDAD FIJO */}
                {/* =================================== */}

                <p className="contact-editor-form__privacy">
                    {data.privacyText}
                </p>

            </div>

        </div>
    );
}

export default ContactFormEditor;
