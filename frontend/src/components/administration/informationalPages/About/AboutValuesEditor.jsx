
import EditableText from "../common/EditableText";

// Importamos el editor especializado en iconos.
import EditableIcon from "../common/EditableIcon";

// Importamos los datos originales de la página.
import aboutDemoData from "../../../../data/informationalPages/aboutDemoData";

// Importamos los estilos de Nuestros valores.
import "../../../../styles/components/administration/informationalPages/About/AboutValuesEditor.css";

// =========================================================
// EDITOR DE NUESTROS VALORES - IGLESIA EL ANCLA
// =========================================================

function AboutValuesEditor({
    data,
    onChange,
    isPreview = false,
}) {

    // =====================================================
    // ACTUALIZAR CAMPOS GENERALES
    // =====================================================

    const handleFieldChange = (field, value) => {

        // Notificamos los cambios al componente padre.
        onChange?.(field, value);
    };

    // =====================================================
    // ACTUALIZAR UN VALOR ESPECÍFICO
    // =====================================================

    const handleValueChange = (id, field, value) => {

        // Recorremos los valores de la iglesia.
        const updatedItems = (data.items || []).map(
            (item) => {

                // Conservamos los elementos no seleccionados.
                if (item.id !== id) {
                    return item;
                }

                // Actualizamos solamente el elemento seleccionado.
                return {
                    ...item,

                    // Permite actualizar icono y alt juntos.
                    ...(field === "__batch__"
                        ? value
                        : { [field]: value }
                    ),
                };
            }
        );

        // Enviamos la colección actualizada al padre.
        handleFieldChange(
            "items",
            updatedItems
        );
    };

    // =====================================================
    // OBTENER ICONO ORIGINAL DE CADA VALOR
    // =====================================================

    const getOriginalIcon = (id) => {

        // Buscamos el valor original mediante su identificador.
        const originalItem =
            aboutDemoData.values.items.find(
                (item) => item.id === id
            );

        // Devolvemos el icono predeterminado.
        return originalItem?.icon;
    };

    // =====================================================
    // RENDERIZADO PRINCIPAL
    // =====================================================

    return (
        <section
            className="about-editor-values"
            aria-label="Editar valores de la iglesia"
        >

            <div className="about-editor-values__container">

                {/* ======================================= */}
                {/* ENCABEZADO DE LA SECCIÓN */}
                {/* ======================================= */}

                <div className="about-editor-values__header">

                    {/* Subtítulo. */}
                    <EditableText
                        as="span"
                        className="about-editor-values__eyebrow"
                        value={data.eyebrow}
                        onChange={(value) =>
                            handleFieldChange(
                                "eyebrow",
                                value
                            )
                        }
                        label="Editar subtítulo de valores"
                        disabled={isPreview}
                    />

                    {/* Título principal. */}
                    <EditableText
                        as="h2"
                        className="about-editor-values__title"
                        value={data.title}
                        onChange={(value) =>
                            handleFieldChange(
                                "title",
                                value
                            )
                        }
                        label="Editar título de valores"
                        disabled={isPreview}
                    />

                    {/* Descripción general. */}
                    <EditableText
                        as="p"
                        className="about-editor-values__description"
                        value={data.description}
                        onChange={(value) =>
                            handleFieldChange(
                                "description",
                                value
                            )
                        }
                        label="Editar descripción de valores"
                        multiline
                        disabled={isPreview}
                    />

                </div>

                {/* ======================================= */}
                {/* TARJETAS DE NUESTROS VALORES */}
                {/* ======================================= */}

                <div className="about-editor-values__grid">

                    {(data.items || []).map((item, index) => (

                        <article
                            key={item.id}
                            className="about-editor-values__card"
                        >

                            {/* Número identificador del valor. */}
                            <span className="about-editor-values__number">
                                {String(index + 1).padStart(2, "0")}
                            </span>

                            {/* ================================= */}
                            {/* ICONO EDITABLE DEL VALOR */}
                            {/* ================================= */}

                            <div className="about-editor-values__icon-container">

                                <EditableIcon
                                    src={item.icon}
                                    alt={item.alt}
                                    originalSrc={getOriginalIcon(item.id)}
                                    className="about-editor-values__icon"
                                    wrapperClassName="about-editor-values__editable-icon"
                                    label={`Icono del valor ${item.title}`}
                                    disabled={isPreview}
                                    onImageAndAltChange={(icon, alt) =>
                                        handleValueChange(
                                            item.id,
                                            "__batch__",
                                            {
                                                icon,
                                                alt,
                                            }
                                        )
                                    }
                                />

                            </div>

                            {/* ================================= */}
                            {/* TÍTULO DEL VALOR */}
                            {/* ================================= */}

                            <EditableText
                                as="h3"
                                className="about-editor-values__card-title"
                                value={item.title}
                                onChange={(value) =>
                                    handleValueChange(
                                        item.id,
                                        "title",
                                        value
                                    )
                                }
                                label={`Editar título del valor ${index + 1}`}
                                disabled={isPreview}
                            />

                            {/* ================================= */}
                            {/* DESCRIPCIÓN DEL VALOR */}
                            {/* ================================= */}

                            <EditableText
                                as="p"
                                className="about-editor-values__card-description"
                                value={item.description}
                                onChange={(value) =>
                                    handleValueChange(
                                        item.id,
                                        "description",
                                        value
                                    )
                                }
                                label={`Editar descripción de ${item.title}`}
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

export default AboutValuesEditor;
