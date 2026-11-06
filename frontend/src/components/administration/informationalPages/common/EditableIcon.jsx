
import { useEffect, useId, useRef, useState } from "react";

import {
    Check,
    ImageOff,
    Pencil,
    RotateCcw,
    Upload,
    X,
} from "lucide-react";

import "../../../../styles/components/administration/informationalPages/common/EditableIcon.css";

// =========================================================
// EDITOR DE ICONOS - IGLESIA EL ANCLA
// =========================================================

// Tamaño máximo permitido: 1,5 MB.
const MAX_FILE_SIZE = 1_500_000;

// Formatos de imagen permitidos.
const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
];

function EditableIcon({
    src,
    alt = "",
    originalSrc,
    className = "",
    wrapperClassName = "",
    label = "Icono",
    disabled = false,
    onChange,
    onImageAndAltChange,
}) {

    // Referencia a la ventana modal nativa.
    const dialogRef = useRef(null);

    // Referencia al lector de archivos.
    const readerRef = useRef(null);

    // Identificador único para el selector de archivos.
    const fileInputId = useId();

    // Identifica si el componente permite editar el ALT.
    const canEditAlt =
        typeof onImageAndAltChange === "function";

    // Imagen que se está preparando.
    const [draftImage, setDraftImage] = useState(src || "");

    // Texto alternativo en edición.
    const [draftAlt, setDraftAlt] = useState(alt || "");

    // Mensaje de validación.
    const [error, setError] = useState("");

    // Controla errores de carga de la imagen original.
    const [imageError, setImageError] = useState(false);

    // Controla errores de la vista previa.
    const [draftImageError, setDraftImageError] = useState(false);

    // Reinicia el error cuando cambia la imagen principal.
    useEffect(() => {
        setImageError(false);
    }, [src]);

    // =====================================================
    // ABRIR EDITOR
    // =====================================================

    const handleOpen = () => {

        // Evita abrir el editor durante la vista previa.
        if (disabled) return;

        // Recupera los valores actuales.
        setDraftImage(src || "");
        setDraftAlt(alt || "");

        // Limpia los mensajes anteriores.
        setError("");
        setDraftImageError(false);

        // Abre la ventana modal sobre el resto de la página.
        if (!dialogRef.current?.open) {
            dialogRef.current?.showModal();
        }
    };

    // =====================================================
    // CERRAR EDITOR
    // =====================================================

    const handleClose = () => {

        // Cancela una lectura de archivo todavía activa.
        if (
            readerRef.current &&
            readerRef.current.readyState === FileReader.LOADING
        ) {
            readerRef.current.abort();
        }

        // Cierra la ventana sin modificar los datos.
        dialogRef.current?.close();
    };

    // =====================================================
    // SELECCIONAR IMAGEN
    // =====================================================

    const handleFileChange = (event) => {

        // Obtiene el archivo elegido.
        const file = event.target.files?.[0];

        // Permite seleccionar nuevamente el mismo archivo.
        event.target.value = "";

        // Termina cuando no se seleccionó ningún archivo.
        if (!file) return;

        // Comprueba el formato del archivo.
        if (!ALLOWED_TYPES.includes(file.type)) {
            setError("Selecciona una imagen JPG, PNG o WebP.");
            return;
        }

        // Comprueba que no exceda el tamaño permitido.
        if (file.size > MAX_FILE_SIZE) {
            setError("La imagen no puede superar 1,5 MB.");
            return;
        }

        // Limpia errores anteriores.
        setError("");

        // Crea un lector para mostrar la imagen localmente.
        const reader = new FileReader();

        // Conserva la referencia del lector.
        readerRef.current = reader;

        // Procesa la imagen cuando termina la lectura.
        reader.onload = () => {

            // Comprueba que el resultado sea una cadena.
            if (typeof reader.result !== "string") {
                setError("No se pudo procesar la imagen.");
                return;
            }

            // Guarda temporalmente la imagen seleccionada.
            setDraftImage(reader.result);

            // Permite visualizar la nueva imagen.
            setDraftImageError(false);
        };

        // Controla errores durante la lectura.
        reader.onerror = () => {
            setError("Ocurrió un error al leer el archivo.");
        };

        // Convierte el archivo a una URL de datos.
        reader.readAsDataURL(file);
    };

    // =====================================================
    // RESTAURAR ICONO ORIGINAL
    // =====================================================

    const handleRestore = () => {

        // Evita restaurar cuando no hay imagen original.
        if (!originalSrc) return;

        // Recupera la imagen predeterminada.
        setDraftImage(originalSrc);

        // Elimina los mensajes de error.
        setError("");
        setDraftImageError(false);
    };

    // =====================================================
    // CONFIRMAR CAMBIOS
    // =====================================================

    const handleConfirm = () => {

        // Comprueba que exista una imagen.
        if (!draftImage) {
            setError("Debes seleccionar una imagen.");
            return;
        }

        // Valida la descripción cuando es editable.
        if (canEditAlt && !draftAlt.trim()) {
            setError("Escribe un texto alternativo para la imagen.");
            return;
        }

        // Actualiza imagen y descripción conjuntamente.
        if (canEditAlt) {
            onImageAndAltChange(draftImage, draftAlt.trim());
        } else {

            // Actualiza solamente la imagen.
            onChange?.(draftImage);
        }

        // Cierra el editor después de confirmar.
        handleClose();
    };

    // =====================================================
    // RENDERIZADO
    // =====================================================

    return (
        <div className={`editable-icon ${wrapperClassName}`}>

            {/* Icono visible dentro de la página. */}
            {src && !imageError ? (
                <img
                    src={src}
                    alt={alt || label}
                    className={className}
                    onError={() => setImageError(true)}
                />
            ) : (
                <span
                    className="editable-icon__placeholder"
                    title="No se pudo cargar el icono"
                >
                    <ImageOff size={26} />
                </span>
            )}

            {/* Botón que abre el editor. */}
            {!disabled && (
                <button
                    type="button"
                    className="editable-icon__trigger"
                    onClick={handleOpen}
                    aria-label={`Editar ${label}`}
                    title={`Cambiar ${label}`}
                >
                    <Pencil size={15} />
                </button>
            )}

            {/* Ventana modal independiente del contenedor. */}
            <dialog
                ref={dialogRef}
                className="editable-icon__dialog"
                aria-label={`Editar ${label}`}
                onClose={() => setError("")}
            >

                {/* Encabezado del editor. */}
                <div className="editable-icon__dialog-header">

                    <div className="editable-icon__heading">
                        <span className="editable-icon__eyebrow">
                            Editor de imagen
                        </span>

                        <h3 className="editable-icon__title">
                            {label}
                        </h3>

                        <p className="editable-icon__subtitle">
                            Personaliza el icono de esta sección.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="editable-icon__close"
                        onClick={handleClose}
                        aria-label="Cerrar editor"
                    >
                        <X size={19} />
                    </button>

                </div>

                {/* Contenido del editor. */}
                <div className="editable-icon__dialog-body">

                    {/* Vista previa de la imagen seleccionada. */}
                    <div className="editable-icon__preview">

                        <span className="editable-icon__field-label">
                            Vista previa
                        </span>

                        <div className="editable-icon__preview-frame">

                            {draftImage && !draftImageError ? (
                                <img
                                    src={draftImage}
                                    alt={draftAlt || label}
                                    onError={() => setDraftImageError(true)}
                                />
                            ) : (
                                <ImageOff size={36} />
                            )}

                        </div>

                    </div>

                    {/* Selector para subir una nueva imagen. */}
                    <div className="editable-icon__upload-field">

                        <span className="editable-icon__field-label">
                            Cambiar imagen
                        </span>

                        <input
                            id={fileInputId}
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp"
                            className="editable-icon__file-input"
                            onChange={handleFileChange}
                        />

                        <label
                            htmlFor={fileInputId}
                            className="editable-icon__upload-button"
                        >
                            <Upload size={18} />
                            Seleccionar imagen
                        </label>

                        <p className="editable-icon__hint">
                            Formatos JPG, PNG o WebP. Máximo 1,5 MB.
                        </p>

                    </div>

                    {/* Texto alternativo para los iconos que lo admiten. */}
                    {canEditAlt && (
                        <div className="editable-icon__alt-field">

                            <label
                                htmlFor={`${fileInputId}-alt`}
                                className="editable-icon__field-label"
                            >
                                Texto alternativo
                            </label>

                            <input
                                id={`${fileInputId}-alt`}
                                type="text"
                                value={draftAlt}
                                maxLength={180}
                                onChange={(event) =>
                                    setDraftAlt(event.target.value)
                                }
                                placeholder="Describe brevemente el icono"
                            />

                        </div>
                    )}

                    {/* Mensajes de validación. */}
                    {error && (
                        <p
                            className="editable-icon__error"
                            role="alert"
                        >
                            {error}
                        </p>
                    )}

                </div>

                {/* Acciones del editor. */}
                <div className="editable-icon__dialog-footer">

                    <button
                        type="button"
                        className="editable-icon__restore"
                        onClick={handleRestore}
                        disabled={!originalSrc}
                    >
                        <RotateCcw size={16} />
                        Restaurar
                    </button>

                    <div className="editable-icon__footer-actions">

                        <button
                            type="button"
                            className="editable-icon__cancel"
                            onClick={handleClose}
                        >
                            Cancelar
                        </button>

                        <button
                            type="button"
                            className="editable-icon__confirm"
                            onClick={handleConfirm}
                        >
                            <Check size={17} />
                            Confirmar
                        </button>

                    </div>

                </div>

            </dialog>

        </div>
    );
}

export default EditableIcon;
