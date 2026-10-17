
import { useEffect, useRef, useState } from "react";

import {
    ImagePlus,
    Pencil,
    Check,
    X,
    RotateCcw,
    AlertCircle,
} from "lucide-react";

import "../../../../styles/components/administration/informationalPages/common/EditableImage.css";

// =========================================================
// CONFIGURACIÓN DE IMÁGENES
// =========================================================

const MAX_FILE_SIZE = 1.5 * 1024 * 1024;

const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
];

// =========================================================
// COMPONENTE REUTILIZABLE EDITABLE IMAGE
// =========================================================

function EditableImage({
    src,
    alt = "",
    onChange,
    onAltChange,
    originalSrc,
    className = "",
    wrapperClassName = "",
    label = "Imagen",
    disabled = false,
}) {

    // Referencia al selector de archivos.
    const fileInputRef = useRef(null);

    // Imagen seleccionada temporalmente.
    const [preview, setPreview] = useState(null);

    // Texto alternativo temporal.
    const [draftAlt, setDraftAlt] = useState(alt);

    // Estado del editor.
    const [isEditing, setIsEditing] = useState(false);

    // Mensaje de validación.
    const [error, setError] = useState("");

    // Sincronizamos el texto alternativo externo.
    useEffect(() => {
        if (!isEditing) {
            setDraftAlt(alt);
        }
    }, [alt, isEditing]);

    // =====================================================
    // ABRIR EDITOR
    // =====================================================

    const handleStartEditing = () => {

        if (disabled) return;

        setPreview(null);
        setDraftAlt(alt);
        setError("");
        setIsEditing(true);
    };

    // =====================================================
    // SELECCIONAR ARCHIVO
    // =====================================================

    const handleFileChange = (event) => {

        const file = event.target.files?.[0];

        if (!file) return;

        setError("");

        // Validamos el formato.
        if (!ALLOWED_TYPES.includes(file.type)) {
            setError(
                "Formato no permitido. Utiliza JPG, PNG o WebP."
            );
            event.target.value = "";
            return;
        }

        // Validamos el tamaño.
        if (file.size > MAX_FILE_SIZE) {
            setError(
                "La imagen supera el tamaño máximo de 1,5 MB."
            );
            event.target.value = "";
            return;
        }

        // Convertimos la imagen en una URL temporal.
        const reader = new FileReader();

        reader.onload = () => {
            setPreview(reader.result);
        };

        reader.onerror = () => {
            setError(
                "No fue posible leer la imagen seleccionada."
            );
        };

        reader.readAsDataURL(file);

        // Permitimos volver a seleccionar el mismo archivo.
        event.target.value = "";
    };

    // =====================================================
    // CONFIRMAR CAMBIOS
    // =====================================================

    const handleSave = () => {

        if (preview) {
            onChange?.(preview);
        }

        if (draftAlt !== alt) {
            onAltChange?.(draftAlt.trim());
        }

        setPreview(null);
        setError("");
        setIsEditing(false);
    };

    // =====================================================
    // CANCELAR CAMBIOS
    // =====================================================

    const handleCancel = () => {
        setPreview(null);
        setDraftAlt(alt);
        setError("");
        setIsEditing(false);
    };

    // =====================================================
    // RESTAURAR IMAGEN ORIGINAL
    // =====================================================

    const handleRestore = () => {

        if (!originalSrc) return;

        setPreview(originalSrc);
        setError("");
    };

    // =====================================================
    // RENDERIZADO
    // =====================================================

    return (
        <div
            className={`editable-image ${wrapperClassName}`}
        >

            {/* Imagen actual o imagen en previsualización. */}
            <img
                src={preview || src}
                alt={draftAlt}
                className={className}
            />

            {/* Botón para comenzar a editar. */}
            {!disabled && !isEditing && (

                <button
                    type="button"
                    className="editable-image__edit-button"
                    onClick={handleStartEditing}
                    aria-label={`Editar ${label}`}
                    title={`Editar ${label}`}
                >
                    <Pencil size={16} />
                </button>

            )}

            {/* Panel de edición. */}
            {isEditing && (

                <div className="editable-image__panel">

                    <div className="editable-image__panel-header">

                        <div className="editable-image__panel-title">
                            <ImagePlus size={18} />
                            <span>{label}</span>
                        </div>

                        <button
                            type="button"
                            className="editable-image__close"
                            onClick={handleCancel}
                            aria-label="Cerrar editor de imagen"
                        >
                            <X size={17} />
                        </button>

                    </div>

                    {/* Selector de archivos. */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileChange}
                        className="editable-image__file-input"
                        aria-label={`Seleccionar ${label}`}
                    />

                    <button
                        type="button"
                        className="editable-image__upload-button"
                        onClick={() =>
                            fileInputRef.current?.click()
                        }
                    >
                        <ImagePlus size={17} />
                        Seleccionar imagen
                    </button>

                    <p className="editable-image__help">
                        JPG, PNG o WebP · Máximo 1,5 MB
                    </p>

                    {/* Texto alternativo. */}
                    <label className="editable-image__label">
                        Texto alternativo

                        <input
                            type="text"
                            value={draftAlt}
                            onChange={(event) =>
                                setDraftAlt(event.target.value)
                            }
                            placeholder="Describe la imagen"
                            className="editable-image__alt-input"
                        />
                    </label>

                    {/* Error de validación. */}
                    {error && (

                        <div
                            className="editable-image__error"
                            role="alert"
                        >
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>

                    )}

                    {/* Acciones. */}
                    <div className="editable-image__actions">

                        {originalSrc && (

                            <button
                                type="button"
                                className="editable-image__button editable-image__button--restore"
                                onClick={handleRestore}
                            >
                                <RotateCcw size={15} />
                                Restaurar
                            </button>

                        )}

                        <button
                            type="button"
                            className="editable-image__button editable-image__button--cancel"
                            onClick={handleCancel}
                        >
                            Cancelar
                        </button>

                        <button
                            type="button"
                            className="editable-image__button editable-image__button--save"
                            onClick={handleSave}
                            disabled={Boolean(error)}
                        >
                            <Check size={15} />
                            Confirmar
                        </button>

                    </div>

                </div>

            )}

        </div>
    );
}

export default EditableImage;
