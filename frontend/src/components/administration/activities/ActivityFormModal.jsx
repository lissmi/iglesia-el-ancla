

import {
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import {
  CalendarDays,
  Check,
  Clock3,
  ImagePlus,
  Info,
  Save,
  Trash2,
  X,
} from "lucide-react";

import "../../../styles/components/administration/events/EventFormModal.css";

// =========================================================
// CONFIGURACIONES DEL FORMULARIO
// =========================================================

const CATEGORIES = [
  "Bingo", "Lota", "Encuentro", "Taller", "Jóvenes",
  "Niños", "Actividad solidaria", "Convivencia",
  "Actividad especial", "Otro",
];



// =========================================================
// ESTADO INICIAL
// =========================================================

// Tipos MIME permitidos.
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Límite de tamaño de imagen: 5 MiB.
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function createInitialForm() {
  return {
    title: "",
    description: "",
    category: "Actividad especial",

    date: "",
    time: "",
    endTime: "",

    modality: "Presencial",
    location: "",
    meetingUrl: "",

    requiresConfirmation: false,
    capacity: "",

    publicationStatus: "draft",

  };
}

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================

function ActivityFormModal({
  isOpen,
  onClose,
  onSave,
  activityToEdit = null,
  isSaving = false,
}) {
  const formId = useId();

  const [form, setForm] = useState(createInitialForm);
  const [errors, setErrors] = useState({});

  // =========================================================
  // ESTADO DE LA IMAGEN DEL EVENTO
  // =========================================================

  // Guarda el archivo real seleccionado.
  // Más adelante este archivo será enviado al backend
  // mediante FormData para subirlo a Cloudinary.
  const [imageFile, setImageFile] = useState(null);

  // Guarda la imagen que mostramos como vista previa.
  // En edición también puede contener la URL de Cloudinary.
  const [imagePreview, setImagePreview] = useState("");

  // Indica si el administrador decidió eliminar
  // una imagen que ya tenía la actividad.
  const [removeImage, setRemoveImage] = useState(false);

  // Nos permite limpiar manualmente el input file.
  const imageInputRef = useRef(null);

  const isEditing = Boolean(activityToEdit);

  // =========================================================
  // CARGAR DATOS PARA CREACIÓN O EDICIÓN
  // =========================================================

  useEffect(() => {
    // Si el modal está cerrado, no hacemos nada.
    if (!isOpen) return;

    // Limpiamos cualquier archivo seleccionado anteriormente.
    setImageFile(null);

    // Reiniciamos la intención de eliminar imagen.
    setRemoveImage(false);

    // Limpiamos el input file.
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }

    // Si estamos editando una actividad existente.
    if (activityToEdit) {
      // Cargamos todos sus datos.
      setForm({
        ...createInitialForm(),
        ...activityToEdit,

        capacity: activityToEdit.capacity ?? "",
      });

      // Si la actividad ya posee imagen,
      // utilizamos su URL como vista previa.
      setImagePreview(
        activityToEdit.image?.url ?? ""
      );
    } else {
      // Si estamos creando una actividad,
      // comenzamos con el formulario vacío.
      setForm(createInitialForm());

      // Tampoco existe imagen previa.
      setImagePreview("");
    }

    // Limpiamos errores anteriores.
    setErrors({});
  }, [isOpen, activityToEdit]);

  // =========================================================
  // ACTUALIZACIÓN DE CAMPOS
  // =========================================================

  function updateField(name, value) {
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: undefined,
    }));
  }

  // =========================================================
  // SELECCIONAR IMAGEN
  // =========================================================

  function handleImageChange(event) {
    // Obtenemos el primer archivo seleccionado.
    const file = event.target.files?.[0];

    // Si el usuario canceló el selector,
    // simplemente terminamos.
    if (!file) return;

    // Comprobamos que realmente sea
    // uno de los formatos permitidos.
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrors((previous) => ({
        ...previous,
        image:
          "La imagen debe estar en formato JPG, PNG o WEBP.",
      }));

      // Limpiamos el input.
      event.target.value = "";

      return;
    }

    // Comprobamos el tamaño del archivo.
    if (file.size > MAX_IMAGE_SIZE) {
      setErrors((previous) => ({
        ...previous,
        image:
          "La imagen no puede superar los 5 MB.",
      }));

      // Limpiamos el input.
      event.target.value = "";

      return;
    }

    // Creamos un lector de archivos.
    const reader = new FileReader();

    // Cuando termina de leer la imagen...
    reader.onload = () => {
      // Guardamos el archivo original.
      setImageFile(file);

      // Guardamos temporalmente la imagen
      // codificada para mostrar la vista previa.
      setImagePreview(reader.result);

      // Si anteriormente se había marcado
      // para eliminar la imagen, cancelamos esa acción.
      setRemoveImage(false);

      // Limpiamos cualquier error de imagen.
      setErrors((previous) => ({
        ...previous,
        image: undefined,
      }));
    };

    // Si existiera algún problema leyendo el archivo.
    reader.onerror = () => {
      setImageFile(null);
      if (imageInputRef.current) imageInputRef.current.value = "";
      setErrors((previous) => ({
        ...previous,
        image:
          "No se pudo leer la imagen seleccionada.",
      }));
    };

    // Leemos temporalmente el archivo.
    // Esto es solamente para la vista previa.
    reader.readAsDataURL(file);
  }


  // =========================================================
  // ELIMINAR IMAGEN
  // =========================================================

  function handleRemoveImage() {
    // Eliminamos el archivo nuevo seleccionado.
    setImageFile(null);

    // Quitamos la vista previa.
    setImagePreview("");

    // Indicamos que debe eliminarse la imagen
    // existente cuando se guarde la actividad.
    setRemoveImage(true);

    // Limpiamos el input.
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }

    // Limpiamos errores relacionados con imagen.
    setErrors((previous) => ({
      ...previous,
      image: undefined,
    }));
  }

  // =========================================================
  // VALIDACIONES
  // =========================================================

  function validateForm() {
    const nextErrors = {};

    if (!form.title.trim()) {
      nextErrors.title =
        "Debes ingresar el nombre de la actividad.";
    }

    if (!form.description.trim()) {
      nextErrors.description =
        "Debes ingresar una descripción.";
    }

    if (!form.date) {
      nextErrors.date =
        "Selecciona la fecha de inicio.";
    }

    if (!form.time) {
      nextErrors.time =
        "Selecciona la hora de inicio.";
    }

    if (
      form.endTime &&
      form.time &&
      form.endTime <= form.time
    ) {
      nextErrors.endTime =
        "La hora de término debe ser posterior al inicio.";
    }

    if (
      form.modality !== "Online" &&
      !form.location.trim()
    ) {
      nextErrors.location =
        "Indica dónde se realizará la actividad.";
    }

    if (
      form.modality !== "Presencial" &&
      !form.meetingUrl.trim()
    ) {
      nextErrors.meetingUrl =
        "Ingresa el enlace de acceso.";
    }

    if (
      form.meetingUrl.trim() &&
      form.modality !== "Presencial"
    ) {
      try {
        const url = new URL(form.meetingUrl.trim());

        if (!["https:", "http:"].includes(url.protocol)) {
          nextErrors.meetingUrl =
            "Utiliza un enlace HTTP o HTTPS válido.";
        }
      } catch {
        nextErrors.meetingUrl =
          "Ingresa una URL válida, incluyendo https://.";
      }
    }

    if (
      form.capacity !== "" &&
      (
        !Number.isInteger(Number(form.capacity)) ||
        Number(form.capacity) <= 0
      )
    ) {
      nextErrors.capacity =
        "Los cupos deben ser un número entero positivo.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  // =========================================================
  // GUARDAR
  // =========================================================

  async function handleSubmit(event) {
    event.preventDefault();

    // Bloqueamos envíos duplicados.
    if (isSaving || !validateForm()) return;

    const normalizedEvent = {
      ...form,

      title: form.title.trim(),
      description: form.description.trim(),
      location: form.location.trim(),
      meetingUrl: form.meetingUrl.trim(),

      capacity:
        form.capacity === ""
          ? null
          : Number(form.capacity),


    };

    // Enviamos los datos a la página, que los persiste mediante API.
    try {
      await onSave({
        // Enviamos todos los campos normalizados del formulario.
        ...normalizedEvent,

        // Se enviará en FormData solo cuando se seleccione una imagen.
        imageFile,

        // La vista previa es local: no se guarda en MongoDB.
        imagePreview,

        // Indicamos si debe eliminarse la portada existente.
        removeImage,
      });
    } catch (error) {
      // Conservamos el modal abierto e informamos el error del servidor.
      setErrors((previous) => ({
        ...previous,
        submit: error.message || "No fue posible guardar la actividad.",
      }));
    }
  }

  // =========================================================
  // CONTROL DE VISIBILIDAD
  // =========================================================

  if (!isOpen) return null;

  // =========================================================
  // INTERFAZ
  // =========================================================

  return (
    <div
      className="event-form-modal__overlay"
      onMouseDown={(event) => {
        if (!isSaving && event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="event-form-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${formId}-title`}
      >

        {/* ============================================= */}
        {/* ENCABEZADO */}
        {/* ============================================= */}

        <header className="event-form-modal__header">
          <div className="event-form-modal__header-icon">
            <CalendarDays
              size={24}
              aria-hidden="true"
            />
          </div>

          <div className="event-form-modal__header-content">
            <span>GESTIÓN DE ACTIVIDADES</span>

            <h2 id={`${formId}-title`}>
              {isEditing
                ? "Editar actividad"
                : "Nueva actividad"}
            </h2>

            <p>
              {isEditing
                ? "Actualiza la información de esta actividad."
                : "Completa los datos para registrar una nueva actividad."}
            </p>
          </div>

          <button
            className="event-form-modal__close"
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Cerrar formulario"
          >
            <X size={21} />
          </button>
        </header>

        {/* ============================================= */}
        {/* FORMULARIO */}
        {/* ============================================= */}

        <form
          className="event-form-modal__form"
          onSubmit={handleSubmit}
          aria-busy={isSaving}
          noValidate
        >

          {/* =========================================== */}
          {/* INFORMACIÓN GENERAL */}
          {/* =========================================== */}

          <section className="event-form-modal__section">
            <div className="event-form-modal__section-heading">
              <Info size={19} aria-hidden="true" />

              <h3>Información general</h3>
            </div>

            <div className="event-form-modal__grid">

              <div className="event-form-modal__field event-form-modal__field--full">
                <label htmlFor={`${formId}-title-input`}>
                  Nombre de la actividad *
                </label>

                <input
                  id={`${formId}-title-input`}
                  type="text"
                  value={form.title}
                  maxLength={120}
                  onChange={(event) =>
                    updateField("title", event.target.value)
                  }
                  placeholder="Ej. Encuentro de jóvenes"
                  aria-invalid={Boolean(errors.title)}
                />

                {errors.title && (
                  <small className="event-form-modal__error">
                    {errors.title}
                  </small>
                )}
              </div>

              <div className="event-form-modal__field">
                <label htmlFor={`${formId}-category`}>
                  Categoría *
                </label>

                <select
                  id={`${formId}-category`}
                  value={form.category}
                  onChange={(event) =>
                    updateField("category", event.target.value)
                  }
                >
                  {CATEGORIES.map((category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="event-form-modal__field">
                <label htmlFor={`${formId}-status`}>
                  Estado de publicación
                </label>

                <select
                  id={`${formId}-status`}
                  value={form.publicationStatus}
                  onChange={(event) =>
                    updateField(
                      "publicationStatus",
                      event.target.value
                    )
                  }
                >
                  <option value="draft">
                    Borrador
                  </option>

                  <option value="published">
                    Publicado
                  </option>
                </select>
              </div>

              {/* Todas las actividades publicadas se muestran en Mis actividades. */}
              <div className="event-form-modal__field event-form-modal__field--full">
                <label htmlFor={`${formId}-description`}>
                  Descripción *
                </label>

                <textarea
                  id={`${formId}-description`}
                  rows={4}
                  maxLength={2000}
                  value={form.description}
                  onChange={(event) =>
                    updateField(
                      "description",
                      event.target.value
                    )
                  }
                  placeholder="Describe brevemente la actividad..."
                  aria-invalid={Boolean(errors.description)}
                />

                {errors.description && (
                  <small className="event-form-modal__error">
                    {errors.description}
                  </small>
                )}
              </div>

              {/* Imagen opcional de la actividad: misma interfaz para crear o editar. */}
              <div className="event-form-modal__field event-form-modal__field--full">
                <label htmlFor={`${formId}-image`}>Imagen de la actividad (opcional)</label>

                {/* Este input conserva el archivo real, listo para la futura API. */}
                <input
                  ref={imageInputRef}
                  id={`${formId}-image`}
                  className="event-form-modal__image-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  aria-invalid={Boolean(errors.image)}
                  aria-describedby={`${formId}-image-hint`}
                />

                {imagePreview ? (
                  <div className="event-form-modal__image-preview">
                    <div className="event-form-modal__image-preview-frame">
                      <img
                        src={imagePreview}
                        alt={`Vista previa de ${form.title || "la actividad"}`}
                      />
                    </div>

                    <div className="event-form-modal__image-preview-info">
                      <strong>Imagen de la actividad</strong>
                      <span>Puedes cambiarla o quitarla antes de guardar.</span>

                      <div className="event-form-modal__image-actions">
                        <button
                          type="button"
                          className="event-form-modal__image-change"
                          onClick={() => imageInputRef.current?.click()}
                        >
                          <ImagePlus size={17} aria-hidden="true" />
                          Cambiar imagen
                        </button>

                        <button
                          type="button"
                          className="event-form-modal__image-remove"
                          onClick={handleRemoveImage}
                        >
                          <Trash2 size={17} aria-hidden="true" />
                          Quitar imagen
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="event-form-modal__image-upload"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <span className="event-form-modal__image-upload-icon">
                      <ImagePlus size={26} aria-hidden="true" />
                    </span>
                    <span className="event-form-modal__image-upload-content">
                      <strong>Agregar imagen</strong>
                      <small>JPG, PNG o WEBP · Máximo 5 MB</small>
                    </span>
                  </button>
                )}

                {errors.image && (
                  <small className="event-form-modal__error" role="alert">
                    {errors.image}
                  </small>
                )}
                <small id={`${formId}-image-hint`} className="event-form-modal__hint">
                  La imagen es opcional y podrá utilizarse como portada de la actividad.
                </small>
              </div>

            </div>
          </section>

          {/* =========================================== */}
          {/* FECHA Y RECURRENCIA */}
          {/* =========================================== */}

          <section className="event-form-modal__section">
            <div className="event-form-modal__section-heading">
              <CalendarDays size={19} aria-hidden="true" />

              <h3>Programación de la actividad</h3>
            </div>

            <div className="event-form-modal__grid">

              {/* Las actividades son puntuales; la recurrencia se gestiona en Eventos. */}
              <div className="event-form-modal__field event-form-modal__field--full">
                <small className="event-form-modal__hint">
                  Esta actividad se programa para una sola fecha.
                  Los eventos recurrentes se gestionan en «Gestión de eventos».
                </small>
              </div>

              <div className="event-form-modal__field">
                <label htmlFor={`${formId}-date`}>
                  Fecha de la actividad *
                </label>

                <input
                  id={`${formId}-date`}
                  type="date"
                  value={form.date}
                  onChange={(event) =>
                    updateField("date", event.target.value)
                  }
                  aria-invalid={Boolean(errors.date)}
                />

                {errors.date && (
                  <small className="event-form-modal__error">
                    {errors.date}
                  </small>
                )}
              </div>

              <div className="event-form-modal__field">
                <label htmlFor={`${formId}-time`}>
                  Hora de inicio *
                </label>

                <input
                  id={`${formId}-time`}
                  type="time"
                  value={form.time}
                  onChange={(event) =>
                    updateField("time", event.target.value)
                  }
                  aria-invalid={Boolean(errors.time)}
                />

                {errors.time && (
                  <small className="event-form-modal__error">
                    {errors.time}
                  </small>
                )}
              </div>

              <div className="event-form-modal__field">
                <label htmlFor={`${formId}-end-time`}>
                  Hora de término
                </label>

                <input
                  id={`${formId}-end-time`}
                  type="time"
                  value={form.endTime}
                  onChange={(event) =>
                    updateField(
                      "endTime",
                      event.target.value
                    )
                  }
                  aria-invalid={Boolean(errors.endTime)}
                />

                {errors.endTime && (
                  <small className="event-form-modal__error">
                    {errors.endTime}
                  </small>
                )}
              </div>

            </div>
          </section>

          {/* =========================================== */}
          {/* MODALIDAD Y UBICACIÓN */}
          {/* =========================================== */}

          <section className="event-form-modal__section">
            <div className="event-form-modal__section-heading">
              <Clock3 size={19} aria-hidden="true" />

              <h3>Modalidad y ubicación</h3>
            </div>

            <div className="event-form-modal__grid">

              <div className="event-form-modal__field event-form-modal__field--full">
                <label htmlFor={`${formId}-modality`}>
                  Modalidad *
                </label>

                <select
                  id={`${formId}-modality`}
                  value={form.modality}
                  onChange={(event) =>
                    updateField(
                      "modality",
                      event.target.value
                    )
                  }
                >
                  <option value="Presencial">
                    Presencial
                  </option>

                  <option value="Online">
                    Online
                  </option>

                  <option value="Híbrida">
                    Híbrida
                  </option>
                </select>
              </div>

              {form.modality !== "Online" && (
                <div className="event-form-modal__field event-form-modal__field--full">
                  <label htmlFor={`${formId}-location`}>
                    Lugar *
                  </label>

                  <input
                    id={`${formId}-location`}
                    type="text"
                    value={form.location}
                    onChange={(event) =>
                      updateField(
                        "location",
                        event.target.value
                      )
                    }
                    placeholder="Ej. Iglesia El Ancla"
                  />

                  {errors.location && (
                    <small className="event-form-modal__error">
                      {errors.location}
                    </small>
                  )}
                </div>
              )}

              {form.modality !== "Presencial" && (
                <div className="event-form-modal__field event-form-modal__field--full">
                  <label htmlFor={`${formId}-url`}>
                    Enlace de reunión *
                  </label>

                  <input
                    id={`${formId}-url`}
                    type="url"
                    value={form.meetingUrl}
                    onChange={(event) =>
                      updateField(
                        "meetingUrl",
                        event.target.value
                      )
                    }
                    placeholder="https://..."
                  />

                  {errors.meetingUrl && (
                    <small className="event-form-modal__error">
                      {errors.meetingUrl}
                    </small>
                  )}
                </div>
              )}

            </div>
          </section>

          {/* =========================================== */}
          {/* ASISTENCIA */}
          {/* =========================================== */}

          <section className="event-form-modal__section">
            <div className="event-form-modal__section-heading">
              <Check size={19} aria-hidden="true" />

              <h3>Confirmación de asistencia</h3>
            </div>

            <label className="event-form-modal__checkbox">
              <input
                type="checkbox"
                checked={form.requiresConfirmation}
                onChange={(event) =>
                  updateField(
                    "requiresConfirmation",
                    event.target.checked
                  )
                }
              />

              <span>
                Permitir que los miembros confirmen
                su asistencia a esta actividad.
              </span>
            </label>

            {form.requiresConfirmation && (
              <div className="event-form-modal__field event-form-modal__capacity">
                <label htmlFor={`${formId}-capacity`}>
                  Cupos disponibles (opcional)
                </label>

                <input
                  id={`${formId}-capacity`}
                  type="number"
                  min="1"
                  step="1"
                  value={form.capacity}
                  onChange={(event) =>
                    updateField(
                      "capacity",
                      event.target.value
                    )
                  }
                  placeholder="Sin límite"
                />

                {errors.capacity && (
                  <small className="event-form-modal__error">
                    {errors.capacity}
                  </small>
                )}
              </div>
            )}
          </section>

          {/* =========================================== */}
          {/* ACCIONES */}
          {/* =========================================== */}

          {errors.submit && (
            <p className="event-form-modal__error" role="alert">
              {errors.submit}
            </p>
          )}

          <footer className="event-form-modal__actions">
            <button
              className="event-form-modal__cancel"
              type="button"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancelar
            </button>

            <button
              className="event-form-modal__submit"
              type="submit"
              disabled={isSaving}
            >
              <Save size={18} aria-hidden="true" />

              {isSaving
                ? "Guardando..."
                : isEditing
                  ? "Guardar cambios"
                  : "Crear actividad"}
            </button>
          </footer>

        </form>
      </div>
    </div>
  );
}

export default ActivityFormModal;
