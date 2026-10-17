
import { useEffect, useMemo, useState } from "react";
import {
    useNavigate,
    useParams,
    useLocation,
} from "react-router-dom";

import EditorToolbar from "../../components/administration/informationalPages/common/EditorToolbar";
import AboutEditable from "../../components/administration/informationalPages/About/AboutEditable";

import aboutDemoData from "../../data/informationalPages/aboutDemoData";

import "../../styles/pages/administration/InformationalPageEditor.css";

import ContactEditable from "../../components/administration/informationalPages/Contact/ContactEditable";

import contactDemoData from "../../data/informationalPages/contactDemoData";

import ConfirmationModal from "../../components/administration/informationalPages/common/ConfirmationModal";

import TermsEditable from "../../components/administration/informationalPages/Terms/TermsEditable";

import termsDemoData from "../../data/informationalPages/termsDemoData";

import PrivacyEditable from "../../components/administration/informationalPages/Privacy/PrivacyEditable";

import privacyDemoData from "../../data/informationalPages/privacyDemoData";

// =========================================================
// EDITOR ADMINISTRATIVO DE PÁGINAS INFORMATIVAS
// IGLESIA EL ANCLA
// =========================================================

// Por ahora solamente Nosotros tiene editor implementado.
// Contacto, Términos y Privacidad se agregarán después.
const PAGE_CONFIG = {
    nosotros: {
        title: "Nosotros",
        description:
            "Administra la información institucional de la iglesia.",
        initialData: aboutDemoData,
    },

    contacto: {
        title: "Contacto",
        description:
            "Administra los datos de contacto, horarios, redes sociales y formulario de la iglesia.",
        initialData: contactDemoData,
    },

    "terminos-y-condiciones": {
        title: "Términos y Condiciones",

        description:
            "Administra las condiciones generales de uso de la plataforma digital de Iglesia El Ancla.",

        initialData: termsDemoData,
    },

    "politica-de-privacidad": {
        title: "Política de privacidad",
        description:
            "Administra la información sobre el tratamiento y protección de datos personales de Iglesia El Ancla.",
        initialData: privacyDemoData,
    },
};

// =========================================================
// UTILIDADES
// =========================================================

// Crea una copia independiente de los datos.
const cloneData = (data) => {
    return structuredClone(data);
};

// Compara los contenidos del borrador y el editor.
// Los objetos tienen una estructura estable.
const isSameContent = (first, second) => {
    return JSON.stringify(first) === JSON.stringify(second);
};

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function InformationalPageEditor() {

    const navigate = useNavigate();
    const location = useLocation();
    const { slug } = useParams();

    // =====================================================
    // CONFIGURACIÓN DE LA PÁGINA
    // =====================================================

    const pageConfig = PAGE_CONFIG[slug];

    // Conservamos el contexto administrativo.
    const adminBasePath = location.pathname.startsWith(
        "/super-admin/"
    )
        ? "/super-admin"
        : "/admin";

    // =====================================================
    // ESTADOS
    // =====================================================

    // Contenido que se muestra y modifica.
    const [content, setContent] = useState(null);

    // Último borrador guardado en memoria.
    const [savedContent, setSavedContent] = useState(null);

    // Vista previa sin controles de edición.
    const [isPreview, setIsPreview] = useState(false);

    // Fecha del último guardado.
    const [lastSaved, setLastSaved] = useState(null);

    // Mensajes informativos.
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");

    // Acción pendiente de confirmación: "discard", "back" o null.
    const [confirmationAction, setConfirmationAction] = useState(null);

    // =====================================================
    // CARGAR CONTENIDO INICIAL
    // =====================================================

    useEffect(() => {

        if (!pageConfig) {
            setContent(null);
            setSavedContent(null);
            return;
        }

        const initialContent = cloneData(
            pageConfig.initialData
        );

        setContent(initialContent);
        setSavedContent(cloneData(initialContent));

        setIsPreview(false);
        setLastSaved(null);
        setMessage("");

    }, [slug, pageConfig]);

    // =====================================================
    // DETECTAR CAMBIOS PENDIENTES
    // =====================================================

    const hasChanges = useMemo(() => {

        if (!content || !savedContent) {
            return false;
        }

        return !isSameContent(
            content,
            savedContent
        );

    }, [content, savedContent]);

    // =====================================================
    // ACTUALIZAR CONTENIDO
    // =====================================================

    const handleContentChange = (updatedContent) => {

        setContent(updatedContent);

        // Eliminamos mensajes anteriores al modificar.
        setMessage("");
    };

    // =====================================================
    // GUARDAR BORRADOR TEMPORAL
    // =====================================================

    const handleSave = () => {

        if (!content || !hasChanges) {
            return;
        }

        // Copia en memoria del borrador actual.
        setSavedContent(cloneData(content));

        setLastSaved(new Date());

        setMessage(
            "Borrador guardado temporalmente en esta sesión del editor."
        );

        setMessageType("success");
    };

    // =====================================================
    // DESCARTAR CAMBIOS
    // =====================================================

    const handleDiscard = () => {
        if (!savedContent || !hasChanges) {
            return;
        }

        setConfirmationAction("discard");
    };

    const handleCancelConfirmation = () => {
        setConfirmationAction(null);
    };

    const handleConfirmAction = () => {
        if (confirmationAction === "discard") {
            if (savedContent) {
                setContent(cloneData(savedContent));

                setMessage(
                    "Se restauró el último borrador guardado."
                );

                setMessageType("success");
            }
        }

        if (confirmationAction === "back") {
            navigate(
                `${adminBasePath}/paginas-informativas`
            );
        }

        setConfirmationAction(null);
    };

    // =====================================================
    // ALTERNAR VISTA PREVIA
    // =====================================================

    const handleTogglePreview = () => {
        setIsPreview((previous) => !previous);
        setMessage("");
    };

    // =====================================================
    // REGRESAR AL LISTADO
    // =====================================================

    const handleBack = () => {
        if (hasChanges) {
            setConfirmationAction("back");
            return;
        }

        navigate(
            `${adminBasePath}/paginas-informativas`
        );
    };

    // =====================================================
    // PÁGINA NO IMPLEMENTADA
    // =====================================================

    if (!pageConfig) {

        return (
            <main className="informational-page-editor">

                <div className="informational-page-editor__unavailable">

                    <h1>
                        Editor no disponible
                    </h1>

                    <p>
                        Esta página informativa todavía
                        no cuenta con un editor implementado.
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                `${adminBasePath}/paginas-informativas`
                            )
                        }
                    >
                        Volver a páginas informativas
                    </button>

                </div>

            </main>
        );
    }

    // =====================================================
    // RENDERIZADO PRINCIPAL
    // =====================================================

    return (
        <main className="informational-page-editor">

            {/* ======================================= */}
            {/* BARRA DE HERRAMIENTAS */}
            {/* ======================================= */}

            <EditorToolbar
                pageTitle={pageConfig.title}
                pageDescription={pageConfig.description}
                hasChanges={hasChanges}
                isSaving={false}
                isPublishing={false}
                isPreview={isPreview}
                lastSaved={lastSaved}
                message={message}
                messageType={messageType}
                onBack={handleBack}
                onSave={handleSave}
                onDiscard={handleDiscard}
                onTogglePreview={handleTogglePreview}

                // Publicación deshabilitada:
                // todavía no existe integración backend.
                onPublish={undefined}
            />

            {/* ======================================= */}
            {/* ÁREA DE EDICIÓN */}
            {/* ======================================= */}

            <div className="informational-page-editor__workspace">

                {/* Encabezado del área de trabajo. */}
                <div className="informational-page-editor__workspace-header">

                    <div>
                        <span className="informational-page-editor__eyebrow">
                            Editor visual
                        </span>

                        <h2 className="informational-page-editor__workspace-title">
                            {pageConfig.title}
                        </h2>

                        <p className="informational-page-editor__workspace-description">
                            {isPreview
                                ? "Vista previa del contenido actual."
                                : "Selecciona los controles de edición para modificar el contenido."}
                        </p>
                    </div>

                    <span className="informational-page-editor__mode">
                        {isPreview
                            ? "Vista previa"
                            : "Modo edición"}
                    </span>

                </div>

                {/* =================================== */}
                {/* CONTENIDO EDITABLE */}
                {/* =================================== */}

                <div className="informational-page-editor__canvas">

                    {slug === "nosotros" && (
                        <AboutEditable
                            content={content}
                            onChange={handleContentChange}
                            isPreview={isPreview}
                        />
                    )}

                    {slug === "contacto" && (
                        <ContactEditable
                            content={content}
                            onChange={handleContentChange}
                            isPreview={isPreview}
                        />
                    )}

                    {slug === "terminos-y-condiciones" && (
                        <TermsEditable
                            content={content}
                            onChange={handleContentChange}
                            isPreview={isPreview}
                        />
                    )}

                    {slug === "politica-de-privacidad" && (
                        <PrivacyEditable
                            content={content}
                            onChange={handleContentChange}
                            isPreview={isPreview}
                        />
                    )}

                </div>

                {/* =================================== */}
                {/* PIE DEL EDITOR */}
                {/* =================================== */}

                <div className="informational-page-editor__footer">

                    <p>
                        Los cambios realizados aquí no
                        modifican la página pública.
                    </p>

                    <span>
                        {hasChanges
                            ? "Cambios pendientes"
                            : "Sin cambios pendientes"}
                    </span>

                </div>

            </div>

            <ConfirmationModal
                isOpen={confirmationAction !== null}
                title={
                    confirmationAction === "discard"
                        ? "¿Descartar los cambios?"
                        : "¿Salir del editor?"
                }
                description={
                    confirmationAction === "discard"
                        ? "Los cambios no guardados se perderán y se restaurará el último borrador guardado. Esta acción no se puede deshacer."
                        : "Tienes cambios sin guardar. Si sales ahora, perderás las modificaciones realizadas."
                }
                confirmText={
                    confirmationAction === "discard"
                        ? "Descartar cambios"
                        : "Salir sin guardar"
                }
                cancelText={
                    confirmationAction === "discard"
                        ? "Seguir editando"
                        : "Permanecer aquí"
                }
                onConfirm={handleConfirmAction}
                onCancel={handleCancelConfirmation}
            />

        </main>
    );
}

export default InformationalPageEditor;
