/* =========================================================
   EVENTOS PÚBLICOS - IGLESIA EL ANCLA
   Archivo: frontend/src/pages/public/Events.jsx

   UNA MISMA PRESENTACIÓN PARA DOS USOS:
   - Público: lee exclusivamente eventos y página publicados.
   - Editor: recibe datos por props y habilita lápices de edición.
   Nunca contiene eventos inventados ni datos de asistencia.
========================================================= */

// Hooks de React para la consulta pública y el selector de iconos.
import { useEffect, useMemo, useState } from "react";

// Enlaces internos sin recargar el sitio.
import { Link } from "react-router-dom";

// Iconos disponibles para la portada y acciones administrativas.
import {
  CalendarDays,
  Church,
  UsersRound,
  HeartHandshake,
  Pencil,
  Trash2,
  Star,
  Plus,
} from "lucide-react";

// Reutilizamos el editor de lápiz de las páginas informativas.
import EditableText from "../../components/administration/informationalPages/common/EditableText";

// Una sola instancia Axios para las consultas públicas.
import api from "../../services/api";

// Icono original de la iglesia y pictogramas decorativos existentes.
import eventosIcon from "../../assets/icons/eventos.png";
import ubicacionIcon from "../../assets/icons/ubicacion.png";
import actividadesIcon from "../../assets/icons/actividades.png";

// Conservar el diseño original de la página pública.
import "../../styles/pages/public/Events.css";

// Días semanales compatibles con Event.recurrence.daysOfWeek.
const WEEK_DAYS = [
  "domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado",
];

// Opciones de iconos de la portada; almacenamos solo la clave, no su imagen.
const HERO_ICONS = [
  { id: "original", label: "Icono original de El Ancla" },
  { id: "calendar", label: "Calendario" },
  { id: "church", label: "Iglesia" },
  { id: "users", label: "Comunidad" },
  { id: "heart", label: "Encuentro" },
];

const HERO_COMPONENTS = {
  calendar: CalendarDays,
  church: Church,
  users: UsersRound,
  heart: HeartHandshake,
};

// Nombres legibles para la recurrencia semanal sin convertir fechas a UTC.
function formatDays(days = []) {
  const validDays = [...new Set(days)]
    .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6)
    .sort((a, b) => a - b);

  if (!validDays.length) return "Días por confirmar";
  if (validDays.length === 7) return "Todos los días";

  const labels = validDays.map((day) => {
    const name = WEEK_DAYS[day];
    // lunes, martes, miércoles, jueves y viernes ya están en plural.
    return name.endsWith("s") ? name : `${name}s`;
  });

  return validDays.length === 1
    ? `Todos los ${labels[0]}`
    : `Todos los ${labels.join(", ")}`;
}

// Presentamos la recurrencia que realmente está guardada en MongoDB.
// Cuando no hay semanas concretas, no inventamos fechas para el visitante.
function formatRecurrence(recurrence) {
  if (!recurrence || recurrence.type !== "monthly") {
    return formatDays(recurrence?.daysOfWeek);
  }

  const weekday = recurrence.daysOfWeek?.[0];
  if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) {
    const count = recurrence.monthlyCount || 1;
    return `${count === 1 ? "Un encuentro" : `${count} encuentros`} al mes · fechas por confirmar`;
  }
  const day = WEEK_DAYS[weekday];
  const pluralDay = day.endsWith("s") ? day : `${day}s`;
  const count = recurrence.monthlyCount || 1;
  const positions = recurrence.weeksOfMonth;

  // Sin semanas definidas: mostramos solo cantidad y día habitual.
  if (!Array.isArray(positions) || positions.length === 0) {
    const numberWord = { 1: "Un", 2: "Dos", 3: "Tres", 4: "Cuatro" }[count] || String(count);
    return `${numberWord} ${count === 1 ? day : pluralDay} al mes · fechas por confirmar`;
  }

  // Con semanas fijas: primero/tercero, segundo/cuarto, último, etc.
  const ordinal = { 1: "primer", 2: "segundo", 3: "tercer", 4: "cuarto", "-1": "último" };
  const names = [...positions].sort((a, b) => (a === -1 ? 5 : a) - (b === -1 ? 5 : b))
    .map((week) => `${ordinal[week]} ${day}`);
  return `${names.join(" y ")} de cada mes`;
}

// Solo abrimos enlaces de reunión HTTP(S) válidos.
function safeExternalUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

// Presenta la ubicación sin confundir eventos online con una dirección física.
function locationLabel(event) {
  if (event.modality === "Online") return "Encuentro en línea";
  return event.location || "Lugar por confirmar";
}

// Unifica el acceso a los textos editables y su presentación pública.
function PageText({ value, onChange, editable, as = "p", className = "", multiline = false, label }) {
  return (
    <EditableText
      as={as}
      value={value || ""}
      onChange={onChange}
      disabled={!editable}
      className={className}
      multiline={multiline}
      label={label}
    />
  );
}

/* =========================================================
   COMPONENTE PRINCIPAL COMPARTIDO
========================================================= */
function Events({
  // En el administrador se pasan los eventos y la configuración del editor.
  eventData,
  pageData,
  // Los controles solo aparecen dentro de Gestión de eventos.
  editorMode = false,
  isPreview = false,
  onPageChange,
  onEditEvent,
  onCreateEvent,
  onChooseFeatured,
  // El panel muestra la confirmación antes de eliminar.
  onDeleteEvent,
}) {
  // El público realiza sus propias consultas; el editor recibe datos por props.
  const [publicEvents, setPublicEvents] = useState([]);
  const [publicPage, setPublicPage] = useState(null);
  const [loading, setLoading] = useState(!editorMode);
  const [error, setError] = useState("");
  const [iconMenuOpen, setIconMenuOpen] = useState(false);
  // El texto del botón se edita en un pequeño panel, nunca mediante prompt.
  const [buttonEditing, setButtonEditing] = useState(false);
  const [buttonDraft, setButtonDraft] = useState("");

  // En la página pública consultamos siempre la versión publicada.
  // Cuando el visitante regresa a la pestaña, renovamos la información
  // para que vea los eventos que se acaban de destacar o modificar.
  useEffect(() => {
    // El administrador ya recibe los datos desde el panel; no consultamos dos veces.
    if (editorMode) return undefined;

    // Conservamos la última solicitud para cancelar consultas superpuestas.
    let activeController = null;

    // Consultamos los eventos y la configuración pública del mismo backend.
    async function loadPublicContent() {
      // Una consulta nueva reemplaza la anterior, nunca al revés.
      activeController?.abort();
      const controller = new AbortController();
      activeController = controller;

      try {
        // Parámetro temporal para evitar respuestas intermedias almacenadas.
        const params = { refresh: Date.now() };

        // La vista pública no necesita iniciar sesión.
        const [eventsResponse, pageResponse] = await Promise.all([
          api.get("/events/public", { params, signal: controller.signal }),
          api.get("/events/page", { params, signal: controller.signal }),
        ]);

        // Validamos las respuestas antes de reemplazar los datos visibles.
        if (!Array.isArray(eventsResponse.data?.events) || !pageResponse.data?.page) {
          throw new Error("No pudimos cargar la programación en este momento.");
        }

        // Solo la consulta vigente modifica React.
        if (!controller.signal.aborted) {
          setPublicEvents(eventsResponse.data.events);
          setPublicPage(pageResponse.data.page);
          setError("");
        }
      } catch (fetchError) {
        // Las solicitudes reemplazadas no deben generar errores visibles.
        if (!controller.signal.aborted && fetchError?.code !== "ERR_CANCELED") {
          setError("No pudimos actualizar los eventos. Intenta actualizar la página.");
        }
      } finally {
        // Conservamos la página visible hasta que llegue la nueva respuesta.
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    // Recargamos al retornar a la página desde otra pestaña.
    function handleVisibilityChange() {
      if (document.visibilityState === "visible") loadPublicContent();
    }

    // Incluye cuando la ventana recupera el foco sin cambiar pestañas.
    window.addEventListener("focus", loadPublicContent);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Primera carga del sitio público.
    loadPublicContent();

    // Retiramos listeners y cancelamos peticiones al cerrar la página.
    return () => {
      activeController?.abort();
      window.removeEventListener("focus", loadPublicContent);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [editorMode]);

  // El modo visual reutiliza la misma estructura exacta que el público.
  const page = editorMode ? pageData : publicPage;
  const editable = editorMode && !isPreview;

  // La vista previa muestra solo eventos publicados, igual que un invitado.
  const visibleEvents = useMemo(() => {
    // Calculamos la fecha civil actual en Chile sin convertir las horas semanales.
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "America/Santiago",
      year: "numeric", month: "2-digit", day: "2-digit",
    }).formatToParts(new Date());
    const part = (type) => parts.find((item) => item.type === type)?.value;
    const today = `${part("year")}-${part("month")}-${part("day")}`;

    // Seleccionamos el arreglo dentro del memo para no crear uno por render.
    const allEvents = editorMode
      ? (Array.isArray(eventData) ? eventData : [])
      : publicEvents;

    return allEvents
      .filter((event) => {
        // El backend ya filtra la versión pública; esto replica el filtro
        // cuando se abre la vista previa dentro de administración.
        if (!editorMode || !isPreview) return true;
        return event.publicationStatus === "published" &&
          (!event.recurrence?.endDate || event.recurrence.endDate >= today);
      })
      // El administrador puede ver exactamente el mismo orden público.
      .sort((first, second) => {
        const firstKey = `${first.date || ""} ${first.time || ""}`;
        const secondKey = `${second.date || ""} ${second.time || ""}`;
        return firstKey.localeCompare(secondKey);
      });
  }, [eventData, publicEvents, editorMode, isPreview]);

  // El destacado se identifica por su ID; nunca repetimos la misma tarjeta.
  const featured = visibleEvents.find((event) => event.id === page?.featuredEventId)
    || visibleEvents.find((event) => event.publicationStatus === "published")
    || visibleEvents[0]
    || null;

  const otherEvents = visibleEvents.filter((event) => event.id !== featured?.id);
  const HeroIcon = HERO_COMPONENTS[page?.heroIcon];

  // Actualizamos solo el borrador en React; guardar/publicar sucede en el padre.
  const change = (key) => (value) => onPageChange?.(key, value);

  // Mientras se consulta MongoDB, evitamos mostrar reuniones ficticias.
  if (error && !editorMode) {
    return <div className="events events__loading" role="alert">{error}</div>;
  }

  if (!page || loading) {
    return <div className="events events__loading" role="status">Cargando eventos de la iglesia...</div>;
  }

  return (
    <div className={`events ${editable ? "events--editing" : ""}`}>
      <main>
        {/* ================================================== */}
        {/* PORTADA: LOS TEXTOS Y EL ICONO SE EDITAN CON LÁPIZ */}
        {/* ================================================== */}
        <section className="events-hero">
          <div className="events-hero__overlay" />
          <div className="events-hero__container">
            <div className="events-hero__content">
              <PageText
                value={page.heroEyebrow}
                onChange={change("heroEyebrow")}
                editable={editable}
                className="events-hero__eyebrow"
                label="Editar texto introductorio"
              />

              <div className="events-hero__title">
                <PageText
                  value={page.heroTitle}
                  onChange={change("heroTitle")}
                  editable={editable}
                  as="h1"
                  className="events-hero__title-line"
                  label="Editar título principal"
                />
                <PageText
                  value={page.heroHighlight}
                  onChange={change("heroHighlight")}
                  editable={editable}
                  as="p"
                  className="events-hero__title-highlight"
                  label="Editar título destacado"
                />
              </div>

              <PageText
                value={page.heroDescription}
                onChange={change("heroDescription")}
                editable={editable}
                className="events-hero__description"
                multiline
                label="Editar presentación de la página"
              />
            </div>

            <div className="events-hero__visual">
              <div className="events-hero__icon-circle events-edit__icon-holder">
                {HeroIcon ? (
                  <HeroIcon className="events-hero__icon events-hero__icon--lucide" strokeWidth={1.25} aria-hidden="true" />
                ) : (
                  <img className="events-hero__icon" src={eventosIcon} alt="" />
                )}

                {editable && (
                  <>
                    <button
                      type="button"
                      className="events-edit__pencil events-edit__icon-pencil"
                      onClick={() => setIconMenuOpen((previous) => !previous)}
                      aria-label="Cambiar icono de la portada"
                      aria-expanded={iconMenuOpen}
                    >
                      <Pencil size={17} aria-hidden="true" />
                    </button>
                    {iconMenuOpen && (
                      <div className="events-edit__icon-menu">
                        <strong>Icono de la portada</strong>
                        {HERO_ICONS.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => {
                              change("heroIcon")(option.id);
                              setIconMenuOpen(false);
                            }}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="events-hero__curve" />
        </section>

        {/* ================================================== */}
        {/* EVENTO DESTACADO: MISMO DISEÑO DE LA PÁGINA REAL */}
        {/* ================================================== */}
        <section className="events-featured" aria-labelledby="featured-event-title">
          <div className="events-featured__container">
            <div className="events-featured__header">
              <PageText
                value={page.featuredEyebrow}
                onChange={change("featuredEyebrow")}
                editable={editable}
                className="events-section__eyebrow"
                label="Editar texto de evento destacado"
              />
              <PageText
                value={page.featuredTitle}
                onChange={change("featuredTitle")}
                editable={editable}
                as="h2"
                className="events-section__title"
                label="Editar título de la sección destacada"
              />
            </div>

            {featured ? (
              <article className="featured-event events-edit__event-wrapper">
                <div className="featured-event__image-wrapper">
                  {featured.image?.url ? (
                    <img className="featured-event__image" src={featured.image.url} alt={`Imagen de ${featured.title}`} />
                  ) : (
                    <div className="events-edit__no-image"><CalendarDays size={54} aria-hidden="true" /></div>
                  )}
                  <span className="featured-event__category">{featured.category}</span>
                </div>
                <div className="featured-event__content">
                  <span className="featured-event__status events-card__status--available">
                    {featured.publicationStatus === "draft" ? "Borrador — vista administrativa" : "Encuentro recurrente"}
                  </span>
                  <h3 className="featured-event__title">{featured.title}</h3>
                  <p className="featured-event__description">{featured.description}</p>
                  <div className="featured-event__details">
                    <div className="featured-event__detail">
                      <img className="featured-event__detail-icon" src={actividadesIcon} alt="" aria-hidden="true" />
                      <div className="featured-event__detail-text">
                        <span className="featured-event__detail-label">Fecha y horario</span>
                        <strong className="featured-event__detail-value">
                          {formatRecurrence(featured.recurrence)} — {featured.time}{featured.endTime ? ` a ${featured.endTime}` : ""} hrs
                        </strong>
                      </div>
                    </div>
                    <div className="featured-event__detail">
                      <img className="featured-event__detail-icon" src={ubicacionIcon} alt="" aria-hidden="true" />
                      <div className="featured-event__detail-text">
                        <span className="featured-event__detail-label">Lugar</span>
                        <strong className="featured-event__detail-value">{locationLabel(featured)}</strong>
                      </div>
                    </div>
                  </div>
                  {/* Si la iglesia comparte el enlace de forma privada, orientamos al visitante. */}
                  {featured.modality !== "Presencial" && !safeExternalUrl(featured.meetingUrl) && (
                    <p className="events__online-note">
                      ¿Te gustaría participar? Escríbenos y con gusto te enviaremos el enlace para conectarte.
                    </p>
                  )}
                  <div className="featured-event__actions">
                    <Link className="featured-event__button featured-event__button--primary" to="/contacto" onClick={(event) => { if (editorMode) event.preventDefault(); }}>
                      {featured.modality !== "Presencial" && !safeExternalUrl(featured.meetingUrl)
                        ? "Solicitar enlace de acceso" : "Consultar información"}
                    </Link>
                    <Link className="featured-event__button featured-event__button--secondary" to="/nosotros" onClick={(event) => { if (editorMode) event.preventDefault(); }}>
                      Conócenos
                    </Link>
                  </div>
                </div>
                {editable && (
                  <>
                    {/* Abrimos el formulario existente; no duplicamos el editor. */}
                    <button
                      type="button"
                      className="events-edit__pencil events-edit__featured-pencil"
                      onClick={() => onEditEvent?.(featured)}
                      aria-label={`Editar evento destacado ${featured.title}`}
                      title="Editar evento destacado"
                    ><Pencil size={17} /></button>

                    {/* Pedimos confirmación antes de eliminar el destacado. */}
                    <button
                      type="button"
                      className="events-edit__pencil events-edit__featured-delete"
                      onClick={() => onDeleteEvent?.(featured)}
                      aria-label={`Eliminar evento ${featured.title}`}
                      title="Eliminar este evento"
                    ><Trash2 size={17} /></button>
                  </>
                )}
              </article>
            ) : (
              <div className="events-edit__empty-event">
                <CalendarDays size={30} aria-hidden="true" />
                <p>Aún no hay eventos disponibles para destacar.</p>
                {editable && (
                  <button type="button" onClick={onCreateEvent}><Plus size={16} /> Crear evento</button>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ================================================== */}
        {/* RESTO DE EVENTOS: PUBLICADOS EN LA MISMA COLECCIÓN */}
        {/* ================================================== */}
        <section className="events-upcoming" aria-labelledby="upcoming-events-title">
          <div className="events-upcoming__container">
            <div className="events-upcoming__header">
              <div>
                <PageText
                  value={page.listEyebrow}
                  onChange={change("listEyebrow")}
                  editable={editable}
                  className="events-section__eyebrow"
                  label="Editar encabezado de la programación"
                />
                <PageText
                  value={page.listTitle}
                  onChange={change("listTitle")}
                  editable={editable}
                  as="h2"
                  className="events-section__title"
                  label="Editar título de la programación"
                />
              </div>
              <PageText
                value={page.listDescription}
                onChange={change("listDescription")}
                editable={editable}
                className="events-upcoming__intro"
                multiline
                label="Editar introducción de eventos"
              />
            </div>

            <div className="events-upcoming__grid">
              {otherEvents.map((event) => {
                const meetingUrl = event.modality !== "Presencial"
                  ? safeExternalUrl(event.meetingUrl)
                  : null;
                return (
                  <article className="events-card events-edit__event-wrapper" key={event.id}>
                    <div className="events-card__image-wrapper">
                      {event.image?.url ? (
                        <img className="events-card__image" src={event.image.url} alt={`Imagen de ${event.title}`} loading="lazy" />
                      ) : (
                        <div className="events-edit__no-image"><CalendarDays size={38} aria-hidden="true" /></div>
                      )}
                      <span className="events-card__category">{event.category}</span>
                    </div>
                    <div className="events-card__content">
                      <span className="events-card__status events-card__status--available">
                        {event.publicationStatus === "draft" ? "Borrador — solo administración" : "Encuentro recurrente"}
                      </span>
                      <h3 className="events-card__title">{event.title}</h3>
                      <p className="events-card__description">{event.description}</p>
                      <div className="events-card__details">
                        <p className="events-card__detail"><strong>Días:</strong> {formatRecurrence(event.recurrence)}</p>
                        <p className="events-card__detail"><strong>Horario:</strong> {event.time}{event.endTime ? ` a ${event.endTime}` : ""} hrs</p>
                        <p className="events-card__detail"><strong>Lugar:</strong> {locationLabel(event)}</p>
                        <p className="events-card__detail"><strong>Modalidad:</strong> {event.modality}</p>
                      </div>
                      {/* Para reuniones sin URL pública, invitamos a escribir a la iglesia. */}
                      {event.modality !== "Presencial" && !meetingUrl && (
                        <p className="events__online-note">
                          ¿Te gustaría participar? Escríbenos y te enviaremos el enlace de acceso.
                        </p>
                      )}
                      {meetingUrl ? (
                        <a className="events-card__link" href={meetingUrl} target="_blank" rel="noopener noreferrer" onClick={(click) => { if (editorMode) click.preventDefault(); }}>
                          Participar en línea <span aria-hidden="true">→</span>
                        </a>
                      ) : (
                        <Link className="events-card__link" to="/contacto" onClick={(click) => { if (editorMode) click.preventDefault(); }}>
                          {event.modality !== "Presencial" ? "Solicitar enlace de acceso" : "Consultar por este evento"} <span aria-hidden="true">→</span>
                        </Link>
                      )}
                    </div>
                    {editable && (
                      <div className="events-edit__card-actions">
                        <button type="button" onClick={() => onEditEvent?.(event)} aria-label={`Editar ${event.title}`} title="Editar evento">
                          <Pencil size={17} />
                        </button>
                        <button type="button" onClick={() => onChooseFeatured?.(event.id)} title="Destacar en la página pública">
                          <Star size={16} /> Destacar
                        </button>
                        {/* El botón usa la confirmación que ya existe en el panel. */}
                        <button
                          type="button"
                          className="events-edit__delete-action"
                          onClick={() => onDeleteEvent?.(event)}
                          title="Eliminar este evento"
                          aria-label={`Eliminar evento ${event.title}`}
                        >
                          <Trash2 size={16} /> Eliminar
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
            {!otherEvents.length && (
              <div className="events-edit__empty-event">
                <p>Por ahora no hay otros eventos recurrentes publicados.</p>
                {editable && <button type="button" onClick={onCreateEvent}><Plus size={16} /> Agregar evento</button>}
              </div>
            )}
            {editable && otherEvents.length > 0 && (
              <button className="events-edit__add-event" type="button" onClick={onCreateEvent}>
                <Plus size={18} /> Agregar otro evento
              </button>
            )}
          </div>
        </section>

        {/* ================================================== */}
        {/* INVITACIÓN FINAL: EDITABLE SIN MODIFICAR LA RUTA */}
        {/* ================================================== */}
        <section className="events-invitation">
          <div className="events-invitation__container">
            <div className="events-invitation__content">
              <PageText value={page.invitationEyebrow} onChange={change("invitationEyebrow")} editable={editable} className="events-invitation__eyebrow" label="Editar texto de invitación" />
              <PageText value={page.invitationTitle} onChange={change("invitationTitle")} editable={editable} as="h2" className="events-invitation__title" label="Editar título de invitación" />
              <PageText value={page.invitationDescription} onChange={change("invitationDescription")} editable={editable} multiline className="events-invitation__description" label="Editar descripción de invitación" />
            </div>
            <div className="events-edit__invitation-action">
              <Link className="events-invitation__button" to="/contacto" onClick={(click) => { if (editorMode) click.preventDefault(); }}>
                {page.invitationButtonText}
              </Link>
              {editable && (
                <>
                  <button
                    type="button"
                    className="events-edit__pencil events-edit__button-pencil"
                    onClick={() => {
                      setButtonDraft(page.invitationButtonText);
                      setButtonEditing((previous) => !previous);
                    }}
                    aria-label="Editar texto del botón de contacto"
                    title="Editar texto del botón"
                  >
                    <Pencil size={16} />
                  </button>
                  {buttonEditing && (
                    <div className="events-edit__button-editor">
                      <label htmlFor="events-button-label">Texto del botón</label>
                      <input
                        id="events-button-label"
                        value={buttonDraft}
                        maxLength={60}
                        onChange={(event) => setButtonDraft(event.target.value)}
                      />
                      <div>
                        <button type="button" onClick={() => setButtonEditing(false)}>Cancelar</button>
                        <button type="button" onClick={() => {
                          if (buttonDraft.trim()) {
                            change("invitationButtonText")(buttonDraft.trim());
                            setButtonEditing(false);
                          }
                        }}>Aplicar</button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Events;
