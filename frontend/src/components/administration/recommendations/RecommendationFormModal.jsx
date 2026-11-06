import { useEffect, useId, useRef, useState } from "react";
import { getYouTubeVideoId, isSpotifyLink, resolveRecommendationThumbnail } from "./recommendationThumbnails";
import { X, Save, ImagePlus } from "lucide-react";
import { RECOMMENDATION_CATEGORIES } from "./RecommendationsCategories";
import "../../../styles/components/administration/recommendations/RecommendationFormModal.css";
// Estilos adicionales para el nuevo selector de archivos.
import "../../../styles/components/administration/recommendations/RecommendationFormUpload.css";

const CONTENT_CATEGORIES = RECOMMENDATION_CATEGORIES.filter(
    (category) => category.id !== "kids_youth"
);

const EMPTY_FORM = {
    title: "",
    category: "books",
    creator: "",
    description: "",
    reason: "",
    image: "",
    link: "",
    audience: ["general"],
    status: "draft",
    featured: false,
};

function buildInitialForm(recommendation) {
    if (!recommendation) return { ...EMPTY_FORM, audience: ["general"] };

    const audience = Array.isArray(recommendation.audience)
        ? recommendation.audience
        : recommendation.audience
            ? [recommendation.audience]
            : ["general"];

    return {
        ...EMPTY_FORM,
        ...recommendation,
        title: recommendation.title ?? "",
        category: CONTENT_CATEGORIES.some((item) => item.id === recommendation.category)
            ? recommendation.category
            : "books",
        creator: recommendation.creator ?? "",
        description: recommendation.description ?? "",
        reason: recommendation.reason ?? "",
        image: recommendation.image ?? "",
        link: recommendation.link ?? "",
        audience,
        status: recommendation.status === "published" ? "published" : "draft",
        featured: recommendation.featured === true,
    };
}

function RecommendationFormModal({
    isOpen = false,
    recommendation = null,
    onClose,
    onSave,
}) {
    const [form, setForm] = useState(() => buildInitialForm(recommendation));
    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    // Archivo seleccionado; se enviará únicamente al backend, no a MongoDB.
    const [imageFile, setImageFile] = useState(null);
    // URL temporal exclusiva para la vista previa del archivo local.
    const [localPreview, setLocalPreview] = useState("");
    const [thumbnailRetry, setThumbnailRetry] = useState(0);
    const [thumbnailState, setThumbnailState] = useState("idle");
    const [thumbnailMessage, setThumbnailMessage] = useState("");
    const manualImageRef = useRef(false);
    const titleId = useId();
    const isEditing = Boolean(recommendation);

    useEffect(() => {
        if (!isOpen) return;
        setForm(buildInitialForm(recommendation));
        // Cada apertura comienza sin una nueva imagen pendiente.
        setImageFile(null);
        setThumbnailRetry(0);
        setErrors({});
        setIsSaving(false);
        setThumbnailState("idle");
        setThumbnailMessage("");
        manualImageRef.current = Boolean(recommendation?.image);
    }, [isOpen, recommendation]);

    // Genera una vista previa local y revoca su URL al reemplazar la imagen.
    useEffect(() => {
        if (!imageFile) {
            setLocalPreview("");
            return undefined;
        }
        const objectUrl = URL.createObjectURL(imageFile);
        setLocalPreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [imageFile]);

    useEffect(() => {
        if (!isOpen) return undefined;
        function handleKeyDown(event) {
            if (event.key === "Escape" && !isSaving) onClose?.();
        }
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, isSaving, onClose]);

    // Resuelve la portada al cambiar el enlace. No reemplaza una portada manual.
    useEffect(() => {
        if (!isOpen) return undefined;
        const link = form.link.trim();
        const supported = Boolean(getYouTubeVideoId(link)) || isSpotifyLink(link);
        if (!supported || manualImageRef.current || imageFile) {
            // Si el enlace ya no es YouTube/Spotify, retiramos la portada automática.
            if (!supported && !manualImageRef.current && !imageFile) {
                setForm((previous) => previous.image ? { ...previous, image: "" } : previous);
            }
            setThumbnailState("idle");
            setThumbnailMessage("");
            return undefined;
        }

        const controller = new AbortController();
        const timeout = setTimeout(async () => {
            setThumbnailState("loading");
            setThumbnailMessage("");
            try {
                const thumbnail = await resolveRecommendationThumbnail(link, controller.signal);
                if (!controller.signal.aborted && !manualImageRef.current) {
                    setForm((previous) => previous.link.trim() === link
                        ? { ...previous, image: thumbnail }
                        : previous);
                    setThumbnailState("success");
                }
            } catch (error) {
                if (!controller.signal.aborted) {
                    setThumbnailState("error");
                    setThumbnailMessage("No se pudo obtener la portada automáticamente. Puedes ingresar una URL manualmente.");
                }
            }
        }, 450);
        return () => {
            clearTimeout(timeout);
            controller.abort();
        };
    }, [isOpen, form.link, imageFile, thumbnailRetry]);

    if (!isOpen) return null;

    function updateField(field, value) {
        setForm((previous) => ({ ...previous, [field]: value }));
        setErrors((previous) => ({ ...previous, [field]: undefined }));
    }

    // Cambia la portada manualmente escribiendo una URL externa.
    function handleImageUrlChange(value) {
        // Una URL manual reemplaza cualquier archivo pendiente.
        setImageFile(null);
        manualImageRef.current = Boolean(value.trim());
        updateField("image", value);
    }

    // Selecciona una imagen local para subirla a Cloudinary al guardar.
    function handleImageFileChange(event) {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;
        // Restringimos formato y tamaño antes de enviar al backend.
        if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
            setErrors((previous) => ({ ...previous, image: "Formato permitido: JPG, PNG o WebP." }));
            return;
        }
        if (file.size > 1_500_000) {
            setErrors((previous) => ({ ...previous, image: "La portada no puede superar 1,5 MB." }));
            return;
        }
        manualImageRef.current = true;
        setImageFile(file);
        setErrors((previous) => ({ ...previous, image: undefined }));
    }

    // Recupera la miniatura automática si el contenido es YouTube o Spotify.
    function handleUseAutomaticThumbnail() {
        setImageFile(null);
        manualImageRef.current = false;
        updateField("image", "");
        setThumbnailRetry((value) => value + 1);
    }

    function updateAudience(value, checked) {
        setForm((previous) => {
            const nextAudience = checked
                ? [...new Set([...previous.audience, value])]
                : previous.audience.filter((item) => item !== value);
            return { ...previous, audience: nextAudience };
        });
        setErrors((previous) => ({ ...previous, audience: undefined }));
    }

    function validate() {
        const nextErrors = {};
        if (!form.title.trim()) nextErrors.title = "Ingresa un título.";
        if (!form.creator.trim()) nextErrors.creator = "Ingresa el autor, artista o creador.";
        if (!form.description.trim()) nextErrors.description = "Ingresa una descripción.";
        if (!form.reason.trim()) nextErrors.reason = "Explica por qué se recomienda este contenido.";
        if (!CONTENT_CATEGORIES.some((item) => item.id === form.category)) {
            nextErrors.category = "Selecciona una categoría válida.";
        }
        if (!form.audience.length) nextErrors.audience = "Selecciona al menos un público objetivo.";
        // No publicamos enlaces vacíos: son recomendaciones a sitios externos.
        if (form.status === "published" && !form.link.trim()) {
            nextErrors.link = "Para publicar debes indicar el enlace al contenido.";
        }
        // Una publicación debe conducir realmente a una fuente externa.
        if (form.status === "published" && !form.link.trim()) {
            nextErrors.link = "Para publicar debes ingresar el enlace al contenido.";
        }
        for (const field of ["image", "link"]) {
            const value = form[field].trim();
            if (value) {
                try {
                    const url = new URL(value);
                    if (url.protocol !== "https:") throw new Error("Protocolo inválido");
                } catch {
                    nextErrors[field] = "Ingresa una dirección URL válida (https://...).";
                }
            }
        }
        return nextErrors;
    }

    async function handleSubmit(event) {
        event.preventDefault();
        if (isSaving) return;
        const nextErrors = validate();
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) return;

        // Solo enviamos campos editables, nunca id, fechas ni datos de auditoría.
        const payload = {
            title: form.title.trim(),
            category: form.category,
            creator: form.creator.trim(),
            description: form.description.trim(),
            reason: form.reason.trim(),
            // Un archivo nuevo tiene prioridad sobre la URL de portada anterior.
            image: imageFile ? "" : form.image.trim(),
            link: form.link.trim(),
            audience: [...form.audience],
            status: form.status,
            featured: form.featured,
        };

        if (!onSave) return;
        try {
            setIsSaving(true);
            // Enviamos el registro de texto y el archivo por separado.
            await onSave(payload, imageFile);
            onClose?.();
        } catch (error) {
            setErrors((previous) => ({
                ...previous,
                submit: error?.message || "No se pudo guardar la recomendación.",
            }));
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div
            className="recommendation-form-modal__overlay"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !isSaving) onClose?.();
            }}
        >
            <section
                className="recommendation-form-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
            >
                <div className="recommendation-form-modal__header">
                    <div>
                        <span className="recommendation-form-modal__eyebrow">Gestión de recomendados</span>
                        <h2 id={titleId}>{isEditing ? "Editar recomendación" : "Nueva recomendación"}</h2>
                        <p>Completa los datos que se mostrarán en el catálogo de la comunidad.</p>
                    </div>
                    <button type="button" className="recommendation-form-modal__close" onClick={onClose} disabled={isSaving} aria-label="Cerrar formulario">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="recommendation-form-modal__body">
                        <div className="recommendation-form-modal__grid">
                            <div className="recommendation-form-modal__field recommendation-form-modal__field--full">
                                <label htmlFor="recommendation-title">Título <span>*</span></label>
                                <input id="recommendation-title" value={form.title} onChange={(event) => updateField("title", event.target.value)} maxLength={160} aria-invalid={Boolean(errors.title)} placeholder="Ej. Ansiosos por nada" />
                                {errors.title && <small className="recommendation-form-modal__error">{errors.title}</small>}
                            </div>

                            <div className="recommendation-form-modal__field">
                                <label htmlFor="recommendation-category">Categoría <span>*</span></label>
                                <select id="recommendation-category" value={form.category} onChange={(event) => updateField("category", event.target.value)} aria-invalid={Boolean(errors.category)}>
                                    {CONTENT_CATEGORIES.map((category) => (
                                        <option key={category.id} value={category.id}>{category.name}</option>
                                    ))}
                                </select>
                                {errors.category && <small className="recommendation-form-modal__error">{errors.category}</small>}
                            </div>

                            <div className="recommendation-form-modal__field">
                                <label htmlFor="recommendation-creator">Autor, artista o creador <span>*</span></label>
                                <input id="recommendation-creator" value={form.creator} onChange={(event) => updateField("creator", event.target.value)} maxLength={160} aria-invalid={Boolean(errors.creator)} placeholder="Ej. Max Lucado" />
                                {errors.creator && <small className="recommendation-form-modal__error">{errors.creator}</small>}
                            </div>

                            <div className="recommendation-form-modal__field recommendation-form-modal__field--full">
                                <label htmlFor="recommendation-description">Descripción <span>*</span></label>
                                <textarea id="recommendation-description" rows={3} value={form.description} onChange={(event) => updateField("description", event.target.value)} maxLength={1500} aria-invalid={Boolean(errors.description)} placeholder="Describe el contenido de la recomendación." />
                                {errors.description && <small className="recommendation-form-modal__error">{errors.description}</small>}
                            </div>

                            <div className="recommendation-form-modal__field recommendation-form-modal__field--full">
                                <label htmlFor="recommendation-reason">¿Por qué lo recomendamos? <span>*</span></label>
                                <textarea id="recommendation-reason" rows={3} value={form.reason} onChange={(event) => updateField("reason", event.target.value)} maxLength={1500} aria-invalid={Boolean(errors.reason)} placeholder="Explica el valor de este material para la comunidad." />
                                {errors.reason && <small className="recommendation-form-modal__error">{errors.reason}</small>}
                            </div>

                            <div className="recommendation-form-modal__field recommendation-form-modal__field--full">
                                <label htmlFor="recommendation-image">URL de la portada</label>
                                <div className="recommendation-form-modal__input-icon">
                                    <ImagePlus size={18} aria-hidden="true" />
                                    <input id="recommendation-image" type="url" value={form.image} onChange={(event) => handleImageUrlChange(event.target.value)} aria-invalid={Boolean(errors.image)} placeholder="https://ejemplo.com/portada.jpg" />
                                </div>
                                {errors.image && <small className="recommendation-form-modal__error">{errors.image}</small>}
                                <small>Se usará una URL cuando esté disponible. Los archivos propios se subirán a Cloudinary.</small>
                                {/* Selección de un archivo local opcional. */}
                                <label htmlFor="recommendation-image-file">O subir una portada desde tu equipo</label>
                                <input id="recommendation-image-file" type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handleImageFileChange} />
                                {imageFile && <small role="status">Archivo seleccionado: {imageFile.name} (se subirá al guardar).</small>}
                                {/* Restablecer miniatura de la fuente cuando no se requiere imagen propia. */}
                                {(getYouTubeVideoId(form.link) || isSpotifyLink(form.link)) && (
                                    <button type="button" onClick={handleUseAutomaticThumbnail}>
                                        Usar portada automática
                                    </button>
                                )}
                                {thumbnailState === "loading" && <small role="status">Buscando portada...</small>}
                                {thumbnailState === "success" && <small role="status">Portada detectada automáticamente.</small>}
                                {thumbnailMessage && <small role="status">{thumbnailMessage}</small>}
                                {(localPreview || form.image) && (
                                    <div className="recommendation-form-modal__image-preview">
                                        <img src={localPreview || form.image} alt="Vista previa de la portada" onError={(event) => { event.currentTarget.style.display = "none"; }} />
                                    </div>
                                )}
                            </div>

                            <div className="recommendation-form-modal__field recommendation-form-modal__field--full">
                                <label htmlFor="recommendation-link">Enlace de la recomendación</label>
                                <input id="recommendation-link" type="url" value={form.link} onChange={(event) => updateField("link", event.target.value)} aria-invalid={Boolean(errors.link)} placeholder="https://..." />
                                {errors.link && <small className="recommendation-form-modal__error">{errors.link}</small>}
                            </div>

                            <fieldset className="recommendation-form-modal__fieldset recommendation-form-modal__field--full">
                                <legend>Público objetivo <span>*</span></legend>
                                <div className="recommendation-form-modal__checks">
                                    <label><input type="checkbox" checked={form.audience.includes("general")} onChange={(event) => updateAudience("general", event.target.checked)} /> Público general</label>
                                    <label><input type="checkbox" checked={form.audience.includes("kids_youth")} onChange={(event) => updateAudience("kids_youth", event.target.checked)} /> Niños y jóvenes</label>
                                </div>
                                {errors.audience && <small className="recommendation-form-modal__error">{errors.audience}</small>}
                            </fieldset>

                            <div className="recommendation-form-modal__field">
                                <label htmlFor="recommendation-status">Estado de publicación</label>
                                <select id="recommendation-status" value={form.status} onChange={(event) => updateField("status", event.target.value)}>
                                    <option value="draft">Borrador</option>
                                    <option value="published">Publicada</option>
                                </select>
                            </div>

                            <div className="recommendation-form-modal__field recommendation-form-modal__field--featured">
                                <label className="recommendation-form-modal__featured-check">
                                    <input type="checkbox" checked={form.featured} onChange={(event) => updateField("featured", event.target.checked)} />
                                    <span>Marcar como destacada</span>
                                </label>
                                <small>Se mostrará en la selección especial cuando esté publicada.</small>
                            </div>
                        </div>
                    </div>

                    <div className="recommendation-form-modal__footer">
                        {errors.submit && <p className="recommendation-form-modal__submit-error" role="alert">{errors.submit}</p>}
                        <button className="recommendation-form-modal__cancel" type="button" onClick={onClose} disabled={isSaving}>Cancelar</button>
                        <button className="recommendation-form-modal__save" type="submit" disabled={isSaving || !onSave}>
                            <Save size={17} aria-hidden="true" />
                            {isSaving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear recomendación"}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}

export default RecommendationFormModal;
