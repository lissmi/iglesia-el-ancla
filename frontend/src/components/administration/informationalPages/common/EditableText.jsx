
import { useEffect, useRef, useState } from "react";
import { Check, Pencil, X } from "lucide-react";

import "../../../../styles/components/administration/informationalPages/common/EditableText.css";

// =========================================================
// COMPONENTE REUTILIZABLE PARA EDITAR TEXTOS
// =========================================================

function EditableText({
    value = "",
    onChange,
    as: Component = "p",
    className = "",
    multiline = false,
    placeholder = "Escribe aquí...",
    label = "Editar texto",
    disabled = false,
}) {

    // Controla si el texto está siendo editado.
    const [isEditing, setIsEditing] = useState(false);

    // Almacena temporalmente el texto mientras se edita.
    const [draft, setDraft] = useState(value ?? "");

    // Referencia al campo de edición.
    const inputRef = useRef(null);

    // Sincroniza el borrador cuando cambia el valor externo.
    useEffect(() => {
        if (!isEditing) {
            setDraft(value ?? "");
        }
    }, [value, isEditing]);

    // Enfoca automáticamente el campo al comenzar a editar.
    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
        }
    }, [isEditing]);

    // Activa el modo de edición.
    const handleStartEditing = () => {

        if (disabled) return;

        setDraft(value ?? "");
        setIsEditing(true);
    };

    // Confirma el nuevo texto.
    const handleSave = () => {

        if (disabled) return;

        const updatedValue = draft.trim();

        // No permitimos guardar textos completamente vacíos.
        if (!updatedValue) {
            return;
        }

        if (updatedValue !== value) {
            onChange?.(updatedValue);
        }

        setIsEditing(false);
    };

    // Cancela los cambios sin modificar el valor original.
    const handleCancel = () => {
        setDraft(value ?? "");
        setIsEditing(false);
    };

    // Permite guardar con Enter o cancelar con Escape.
    const handleKeyDown = (event) => {

        if (event.key === "Escape") {
            event.preventDefault();
            handleCancel();
            return;
        }

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {
            event.preventDefault();
            handleSave();
        }
    };

    // =====================================================
    // MODO EDICIÓN
    // =====================================================

    if (isEditing) {

        return (
            <div className="editable-text editable-text--editing">

                <div className="editable-text__editor">

                    {multiline ? (
                        <textarea
                            ref={inputRef}
                            className="editable-text__input editable-text__input--multiline"
                            value={draft}
                            onChange={(event) =>
                                setDraft(event.target.value)
                            }
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            aria-label={label}
                            rows={4}
                        />
                    ) : (
                        <input
                            ref={inputRef}
                            type="text"
                            className="editable-text__input"
                            value={draft}
                            onChange={(event) =>
                                setDraft(event.target.value)
                            }
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            aria-label={label}
                        />
                    )}

                    <div className="editable-text__actions">

                        <button
                            type="button"
                            className="editable-text__action editable-text__action--save"
                            onClick={handleSave}
                            disabled={!draft.trim()}
                            title="Confirmar cambio"
                            aria-label="Confirmar cambio"
                        >
                            <Check size={16} />
                        </button>

                        <button
                            type="button"
                            className="editable-text__action editable-text__action--cancel"
                            onClick={handleCancel}
                            title="Cancelar edición"
                            aria-label="Cancelar edición"
                        >
                            <X size={16} />
                        </button>

                    </div>

                </div>

                <span className="editable-text__hint">
                    Enter para confirmar · Esc para cancelar
                </span>

            </div>
        );
    }

    // =====================================================
    // MODO VISUALIZACIÓN
    // =====================================================

    return (
        <div
            className={`editable-text ${disabled ? "editable-text--disabled" : ""}`}
        >

            <Component className={className}>
                {value || placeholder}
            </Component>

            {!disabled && (
                <button
                    type="button"
                    className="editable-text__edit-button"
                    onClick={handleStartEditing}
                    aria-label={label}
                    title={label}
                >
                    <Pencil size={15} />
                </button>
            )}

        </div>
    );
}

export default EditableText;
