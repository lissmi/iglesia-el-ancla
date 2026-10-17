
import {
    ArrowLeft,
    Eye,
    EyeOff,
    Save,
    Send,
    RotateCcw,
    LoaderCircle,
    CheckCircle2,
    AlertCircle,
    CircleDot,
    FilePenLine,
} from "lucide-react";

import "../../../../styles/components/administration/informationalPages/common/EditorToolbar.css";

// =========================================================
// BARRA DE HERRAMIENTAS DEL EDITOR ADMINISTRATIVO
// =========================================================

function EditorToolbar({

    // Información de la página.
    pageTitle = "Página informativa",
    pageDescription = "Administra el contenido de esta página.",

    // Estado de edición.
    hasChanges = false,
    isSaving = false,
    isPublishing = false,
    isPreview = false,
    lastSaved = null,

    // Mensajes de resultado.
    message = "",
    messageType = "success",

    // Acciones recibidas desde el editor principal.
    onBack,
    onSave,
    onPublish,
    onDiscard,
    onTogglePreview,

}) {

    // Evitamos acciones simultáneas.
    const isBusy = isSaving || isPublishing;

    // =====================================================
    // FORMATEAR FECHA DEL ÚLTIMO GUARDADO
    // =====================================================

    const formatLastSaved = (dateValue) => {

        if (!dateValue) return null;

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return null;
        }

        return new Intl.DateTimeFormat("es-CL", {
            dateStyle: "short",
            timeStyle: "short",
        }).format(date);
    };

    const formattedLastSaved = formatLastSaved(lastSaved);

    // =====================================================
    // RENDERIZADO
    // =====================================================

    return (
        <section
            className="editor-toolbar"
            aria-label="Herramientas de edición"
        >

            {/* =========================================== */}
            {/* ENCABEZADO */}
            {/* =========================================== */}

            <div className="editor-toolbar__header">

                <div className="editor-toolbar__heading">

                    <div className="editor-toolbar__icon">
                        <FilePenLine size={23} />
                    </div>

                    <div className="editor-toolbar__heading-content">

                        <span className="editor-toolbar__eyebrow">
                            Administración de contenido
                        </span>

                        <h1 className="editor-toolbar__title">
                            Editar: {pageTitle}
                        </h1>

                        <p className="editor-toolbar__description">
                            {pageDescription}
                        </p>

                    </div>

                </div>

                {/* Indicador del estado actual. */}
                <div
                    className={`editor-toolbar__status ${
                        hasChanges
                            ? "editor-toolbar__status--unsaved"
                            : "editor-toolbar__status--saved"
                    }`}
                    role="status"
                >

                    {hasChanges ? (
                        <>
                            <CircleDot size={15} />
                            <span>Cambios sin guardar</span>
                        </>
                    ) : (
                        <>
                            <CheckCircle2 size={15} />
                            <span>Sin cambios pendientes</span>
                        </>
                    )}

                </div>

            </div>

            {/* =========================================== */}
            {/* ACCIONES */}
            {/* =========================================== */}

            <div className="editor-toolbar__actions">

                <div className="editor-toolbar__actions-group">

                    <button
                        type="button"
                        className="editor-toolbar__button editor-toolbar__button--neutral"
                        onClick={onBack}
                        disabled={isBusy || !onBack}
                    >
                        <ArrowLeft size={17} />
                        <span>Volver</span>
                    </button>

                    <button
                        type="button"
                        className={`editor-toolbar__button editor-toolbar__button--neutral ${
                            isPreview
                                ? "editor-toolbar__button--selected"
                                : ""
                        }`}
                        onClick={onTogglePreview}
                        disabled={isBusy || !onTogglePreview}
                        aria-pressed={isPreview}
                    >
                        {isPreview ? (
                            <EyeOff size={17} />
                        ) : (
                            <Eye size={17} />
                        )}

                        <span>
                            {isPreview
                                ? "Salir de vista previa"
                                : "Vista previa"}
                        </span>
                    </button>

                    <button
                        type="button"
                        className="editor-toolbar__button editor-toolbar__button--neutral"
                        onClick={onDiscard}
                        disabled={isBusy || !hasChanges || !onDiscard}
                    >
                        <RotateCcw size={17} />
                        <span>Descartar cambios</span>
                    </button>

                </div>

                <div className="editor-toolbar__actions-group">

                    <button
                        type="button"
                        className="editor-toolbar__button editor-toolbar__button--save"
                        onClick={onSave}
                        disabled={isBusy || !hasChanges || !onSave}
                    >

                        {isSaving ? (
                            <LoaderCircle
                                size={17}
                                className="editor-toolbar__spinner"
                            />
                        ) : (
                            <Save size={17} />
                        )}

                        <span>
                            {isSaving
                                ? "Guardando..."
                                : "Guardar borrador"}
                        </span>

                    </button>

                    <button
                        type="button"
                        className="editor-toolbar__button editor-toolbar__button--publish"
                        onClick={onPublish}
                        disabled={isBusy || !onPublish}
                    >

                        {isPublishing ? (
                            <LoaderCircle
                                size={17}
                                className="editor-toolbar__spinner"
                            />
                        ) : (
                            <Send size={17} />
                        )}

                        <span>
                            {isPublishing
                                ? "Publicando..."
                                : "Publicar"}
                        </span>

                    </button>

                </div>

            </div>

            {/* =========================================== */}
            {/* INFORMACIÓN Y MENSAJES */}
            {/* =========================================== */}

            {(formattedLastSaved || message) && (

                <div className="editor-toolbar__feedback">

                    {formattedLastSaved && (

                        <span className="editor-toolbar__last-saved">
                            Último borrador guardado: {formattedLastSaved}
                        </span>

                    )}

                    {message && (

                        <div
                            className={`editor-toolbar__message ${
                                messageType === "error"
                                    ? "editor-toolbar__message--error"
                                    : "editor-toolbar__message--success"
                            }`}
                            role={messageType === "error" ? "alert" : "status"}
                        >

                            {messageType === "error" ? (
                                <AlertCircle size={16} />
                            ) : (
                                <CheckCircle2 size={16} />
                            )}

                            <span>{message}</span>

                        </div>

                    )}

                </div>

            )}

        </section>
    );
}

export default EditorToolbar;
