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
// API central de borradores, publicaciones e imágenes del backend.
import {
    getAdminInformationalPage,
    saveInformationalPageDraft,
    publishInformationalPage,
    prepareInformationalImages,
    resolveInformationalImages,
    cleanupPendingInformationalImages,
    informationalPageError,
} from "../../services/informationalPagesApi";


// =========================================================
// EDITOR ADMINISTRATIVO DE PÁGINAS INFORMATIVAS
// IGLESIA EL ANCLA
// =========================================================

// Las cuatro páginas cuentan con editor visual.
// El contenido persistente se obtiene del backend.
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

    // Controla los procesos reales contra Google Drive y Cloudinary.
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [draftRevision, setDraftRevision] = useState(0);
    const [publishedRevision, setPublishedRevision] = useState(0);
    const [publishedAt, setPublishedAt] = useState(null);

    // =====================================================
    // CARGAR EL BORRADOR REAL DESDE GOOGLE DRIVE
    // =====================================================

    useEffect(() => {
        let active = true;

        async function loadPage() {
            setIsLoading(true);
            setContent(null);
            setSavedContent(null);
            setMessage("");
            setIsPreview(false);

            if (!pageConfig) {
                setIsLoading(false);
                return;
            }

            try {
                // Una página nunca editada arranca desde los datos originales.
                const data = await getAdminInformationalPage(slug);
                if (!active) return;

                const initial = resolveInformationalImages(
                    slug,
                    data.draft || data.published || pageConfig.initialData
                );

                setContent(initial);
                setSavedContent(cloneData(initial));
                setLastSaved(data.lastSaved || null);
                setDraftRevision(data.draftRevision || 0);
                setPublishedRevision(data.publishedRevision || 0);
                setPublishedAt(data.publishedAt || null);
            } catch (error) {
                if (!active) return;
                // No se habilita la edición si no podemos leer la versión real.
                setMessage(informationalPageError(error));
                setMessageType("error");
            } finally {
                if (active) setIsLoading(false);
            }
        }

        loadPage();
        return () => { active = false; };
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

        setContent((previous) =>
            typeof updatedContent === "function"
                ? updatedContent(previous)
                : updatedContent
        );

        // Eliminamos mensajes anteriores al modificar.
        setMessage("");
    };

    // =====================================================
    // GUARDAR UN BORRADOR REAL EN GOOGLE DRIVE
    // =====================================================

    // Se reutiliza al guardar manualmente y al publicar cambios pendientes.
    const persistDraft = async (snapshot, revision) => {
        // Solo las imágenes nuevas (data:image/...) se suben a Cloudinary.
        // Las existentes y los iconos predeterminados nunca se reenvían.
        const { content: prepared, uploadedUrls } =
            await prepareInformationalImages(slug, snapshot);

        let result;
        try {
            result = await saveInformationalPageDraft(slug, prepared, revision);
        } catch (error) {
            // El servidor comprueba si Drive ya referencia esos archivos
            // antes de borrarlos; protege los guardados parcialmente exitosos.
            try {
                await cleanupPendingInformationalImages(slug, uploadedUrls);
            } catch (cleanupError) {
                console.error("Limpieza de imágenes pendiente:", cleanupError);
            }
            throw error;
        }

        // En el editor mostramos las imágenes del build, no los marcadores TXT.
        const visibleContent = resolveInformationalImages(slug, prepared);
        setContent(cloneData(visibleContent));
        setSavedContent(cloneData(visibleContent));
        setDraftRevision(result.draftRevision);
        setLastSaved(result.lastSaved);

        return { revision: result.draftRevision, content: visibleContent };
    };

    const handleSave = async () => {
        if (!content || !hasChanges || isSaving || isPublishing) return;

        setIsSaving(true);
        setMessage("");
        try {
            await persistDraft(cloneData(content), draftRevision);
            setMessage("Borrador guardado correctamente en Google Drive.");
            setMessageType("success");
        } catch (error) {
            setMessage(informationalPageError(error));
            setMessageType("error");
        } finally {
            setIsSaving(false);
        }
    };

    // =====================================================
    // PUBLICAR CONTENIDO REAL
    // =====================================================

    const performPublish = async () => {
        if (!content || isSaving || isPublishing) return;

        setIsPublishing(true);
        setMessage("");
        try {
            // La publicación siempre parte de una versión guardada.
            // Si es la primera vez, también guardamos el contenido inicial.
            let revision = draftRevision;
            if (hasChanges || draftRevision === 0) {
                const saved = await persistDraft(cloneData(content), revision);
                revision = saved.revision;
            }

            const result = await publishInformationalPage(slug, revision);
            setPublishedRevision(result.publishedRevision);
            setPublishedAt(result.publishedAt);
            setMessage("La página fue publicada. Los visitantes verán la versión actualizada al cargarla.");
            setMessageType("success");
        } catch (error) {
            // El borrador permanece guardado si la publicación falla.
            setMessage(informationalPageError(error));
            setMessageType("error");
        } finally {
            setIsPublishing(false);
        }
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
        // Capturamos la acción y cerramos el modal antes del flujo asíncrono.
        const action = confirmationAction;
        setConfirmationAction(null);

        if (action === "publish") {
            void performPublish();
            return;
        }

        if (action === "discard" && savedContent) {
            setContent(cloneData(savedContent));
            setMessage("Se restauró el último borrador guardado.");
            setMessageType("success");
        }

        if (action === "back") {
            navigate(`${adminBasePath}/paginas-informativas`);
        }
    };

    // Exigimos confirmación porque publicar afecta al sitio público.
    const handleRequestPublish = () => {
        if (content && !isSaving && !isPublishing) {
            setConfirmationAction("publish");
        }
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

    // Si Google Drive no respondió, no se permite editar datos desconocidos.
    if (isLoading || !content) {
        return (
            <main className="informational-page-editor">
                <div className="informational-page-editor__unavailable" role="status">
                    <h2>{isLoading ? "Cargando página..." : "No se pudo cargar el editor"}</h2>
                    <p>{isLoading
                        ? "Consultando el borrador guardado en Google Drive."
                        : message || "Comprueba la conexión con el backend e inténtalo de nuevo."}</p>
                    {!isLoading && (
                        <button type="button" onClick={() => window.location.reload()}>
                            Reintentar
                        </button>
                    )}
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
                isSaving={isSaving}
                isPublishing={isPublishing}
                isPreview={isPreview || isSaving || isPublishing}
                lastSaved={lastSaved}
                message={message}
                messageType={messageType}
                onBack={handleBack}
                onSave={handleSave}
                onDiscard={handleDiscard}
                onTogglePreview={handleTogglePreview}

                onPublish={handleRequestPublish}
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
                            isPreview={isPreview || isSaving || isPublishing}
                        />
                    )}

                    {slug === "contacto" && (
                        <ContactEditable
                            content={content}
                            onChange={handleContentChange}
                            isPreview={isPreview || isSaving || isPublishing}
                        />
                    )}

                    {slug === "terminos-y-condiciones" && (
                        <TermsEditable
                            content={content}
                            onChange={handleContentChange}
                            isPreview={isPreview || isSaving || isPublishing}
                        />
                    )}

                    {slug === "politica-de-privacidad" && (
                        <PrivacyEditable
                            content={content}
                            onChange={handleContentChange}
                            isPreview={isPreview || isSaving || isPublishing}
                        />
                    )}

                </div>

                {/* =================================== */}
                {/* PIE DEL EDITOR */}
                {/* =================================== */}

                <div className="informational-page-editor__footer">

                    <p>
                        {publishedAt
                            ? `Publicado el ${new Date(publishedAt).toLocaleDateString("es-CL")}. `
                            : "Sin publicación desde este editor. "}
                        El borrador solo es visible públicamente después de publicar.
                    </p>

                    <span>
                        {hasChanges
                            ? "Cambios pendientes"
                            : draftRevision > publishedRevision
                                ? "Borrador no publicado"
                                : "Contenido sincronizado"}
                    </span>

                </div>

            </div>

            <ConfirmationModal
                isOpen={confirmationAction !== null}
                title={
                    confirmationAction === "discard"
                        ? "¿Descartar los cambios?"
                        : confirmationAction === "publish"
                            ? "¿Publicar esta página?"
                            : "¿Salir del editor?"
                }
                description={
                    confirmationAction === "discard"
                        ? "Se restaurará el último borrador guardado en Google Drive. Los cambios no guardados se perderán."
                        : confirmationAction === "publish"
                            ? ["terminos-y-condiciones", "politica-de-privacidad"].includes(slug)
                                ? "El documento quedará disponible para todos. Comprueba que el contenido legal haya sido revisado y aprobado por la iglesia antes de publicarlo."
                                : "Los visitantes podrán ver el contenido actualizado. Si existen cambios sin guardar, primero se guardará el borrador."
                            : "Tienes cambios sin guardar. Si sales ahora, perderás las modificaciones realizadas."
                }
                confirmText={
                    confirmationAction === "discard"
                        ? "Descartar cambios"
                        : confirmationAction === "publish"
                            ? "Sí, publicar"
                            : "Salir sin guardar"
                }
                cancelText={
                    confirmationAction === "discard"
                        ? "Seguir editando"
                        : confirmationAction === "publish"
                            ? "Revisar antes"
                            : "Permanecer aquí"
                }
                onConfirm={handleConfirmAction}
                onCancel={handleCancelConfirmation}
            />

        </main>
    );
}

export default InformationalPageEditor;
