// =========================================================
// PÁGINA PÚBLICA CONTACTO - IGLESIA EL ANCLA
// Contenido publicado desde Drive y formulario mailto original.
// =========================================================

// Estado del formulario: nombre, correo, asunto y mensaje.
import { useState } from "react";

// Hook que lee únicamente el contenido publicado de Contacto.
import usePublicInformationalPage from "../../hooks/usePublicInformationalPage";

// Contenido inicial cuando todavía no existe un TXT publicado.
import contactDemoData from "../../data/informationalPages/contactDemoData";

// Iconos originales del diseño público.
import ubicacionIcon from "../../assets/icons/ubicacion.png";
import escribenosIcon from "../../assets/icons/escribenos.png";
import reunionIcon from "../../assets/icons/reunion.png";
import facebookIcon from "../../assets/icons/fb.png";
import instagramIcon from "../../assets/icons/insta.png";

// Importamos la sección independiente del mapa, sin modificar el formulario existente.
import ContactLocationMap from "../../components/public/ContactLocationMap";

// Construimos el enlace oficial de Google Maps a partir de la dirección publicada.
import { buildDirectionsUrl } from "../../utils/googleMapsLinks";

// Estilos originales; no introducimos los del editor administrativo.
import "../../styles/pages/public/Contact.css";

// Acepta solo URL HTTPS antes de convertirla en enlace externo.
function secureSocialUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" ? parsed.href : null;
  } catch {
    return null;
  }
}

// Componente público de contacto de la iglesia.
function Contact() {
  // Consulta la publicación mediante el servicio Axios compartido.
  const { content } = usePublicInformationalPage("contacto", contactDemoData);

  // Usa los datos iniciales mientras se recupera la publicación.
  const page = content || contactDemoData;

  // Correo al que se dirigirá el formulario y enlace de la tarjeta.
  const churchEmail = page.information.email.address;

  // Obtenemos la ubicación publicada para el mapa y el botón «Cómo llegar».
  const churchLocation = page.information.location;

  // Google Maps abrirá el destino ya definido, sin pedir que escriban la dirección.
  const directionsUrl = buildDirectionsUrl(churchLocation);

  // El formulario no se persiste en MongoDB ni en Drive.
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  // Mensaje informativo o de validación del formulario.
  const [formStatus, setFormStatus] = useState("");

  // Actualiza únicamente el campo que el visitante editó.
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setFormStatus("");
  };

  // Conserva el comportamiento original: abrir el programa de correo.
  const handleSubmit = (event) => {
    event.preventDefault();

    // Rechazamos mensajes incompletos sin abrir el cliente de correo.
    if (!formData.name.trim() || !formData.email.trim() ||
        !formData.subject.trim() || !formData.message.trim()) {
      setFormStatus("Por favor, completa todos los campos del formulario.");
      return;
    }

    // Se prepara el asunto sin enviar información a la API propia.
    const emailSubject = `${formData.subject} — Mensaje de ${formData.name}`;

    // Se identifica al remitente en el cuerpo del correo.
    const emailBody = `Nombre: ${formData.name}\nCorreo de contacto: ${formData.email}\n\nMensaje:\n${formData.message}`;

    // Cada componente se codifica para construir un mailto válido.
    const mailtoLink = `mailto:${churchEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    // Se informa al visitante que debe enviar el correo desde su aplicación.
    setFormStatus("Abriendo tu aplicación de correo…");
    window.location.href = mailtoLink;
  };

  // La sección principal conserva la estructura y clases del Contact.css.
  return (
    <div className="contact">
      <main>
        {/* ===================================================== */}
        {/* 1. ENCABEZADO PUBLICADO */}
        {/* ===================================================== */}
        <section className="contact-hero">
          <div className="contact-hero__overlay" aria-hidden="true" />
          <div className="contact-hero__container">
            <p className="contact-hero__eyebrow">{page.hero.eyebrow}</p>
            <h1 className="contact-hero__title">
              {page.hero.title}{" "}
              <span className="contact-hero__title-highlight">
                {page.hero.highlightedTitle}
              </span>
            </h1>
            <p className="contact-hero__description">{page.hero.description}</p>
          </div>
          <div className="contact-hero__curve" aria-hidden="true" />
        </section>

        {/* ===================================================== */}
        {/* 2. TARJETAS: DIRECCIÓN, CORREO Y HORARIOS */}
        {/* ===================================================== */}
        <section className="contact-information">
          <div className="contact-information__container">
            <article className="contact-information__card">
              <div className="contact-information__icon-wrapper">
                <img className="contact-information__icon" src={ubicacionIcon} alt="" aria-hidden="true" />
              </div>
              <div className="contact-information__content">
                <p className="contact-information__label">{page.information.location.label}</p>
                <h2 className="contact-information__title">{page.information.location.title}</h2>
                <p className="contact-information__description">
                  {page.information.location.address}
                  <br />
                  {page.information.location.city}
                </p>

                {/* Ofrecemos indicaciones incluso antes de bajar hasta el mapa. */}
                {directionsUrl && (
                  <a
                    className="contact-location-map__quick-link"
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Cómo llegar en Google Maps
                  </a>
                )}
              </div>
            </article>

            <article className="contact-information__card">
              <div className="contact-information__icon-wrapper">
                <img className="contact-information__icon" src={escribenosIcon} alt="" aria-hidden="true" />
              </div>
              <div className="contact-information__content">
                <p className="contact-information__label">{page.information.email.label}</p>
                <h2 className="contact-information__title">{page.information.email.title}</h2>
                <a className="contact-information__email" href={`mailto:${churchEmail}`}>
                  {churchEmail}
                </a>
              </div>
            </article>

            <article className="contact-information__card">
              <div className="contact-information__schedule-icon">
                <img className="contact-information__icon_reunion" src={reunionIcon} alt="" aria-hidden="true" />
              </div>
              <div className="contact-information__content">
                <p className="contact-information__label">{page.information.schedule.label}</p>
                <h2 className="contact-information__title">{page.information.schedule.title}</h2>
                <p className="contact-information__description">
                  {page.information.schedule.dayAndTime}
                  <br />
                  {page.information.schedule.modality}
                </p>
              </div>
            </article>
          </div>
        </section>

        {/* ===================================================== */}
        {/* 3. MAPA PÚBLICO Y DIRECCIONES HASTA LA IGLESIA */}
        {/* ===================================================== */}
        <ContactLocationMap location={churchLocation} />

        {/* ===================================================== */}
        {/* 4. INFORMACIÓN, REDES SOCIALES Y FORMULARIO */}
        {/* ===================================================== */}
        <section className="contact-main">
          <div className="contact-main__container">
            <div className="contact-main__content">
              <p className="contact-section__eyebrow">{page.main.eyebrow}</p>
              <h2 className="contact-section__title">{page.main.title}</h2>
              <p className="contact-main__description">{page.main.description}</p>

              <div className="contact-main__notice">
                <h3 className="contact-main__notice-title">{page.main.notice.title}</h3>
                <ul className="contact-main__notice-list">
                  {page.main.notice.items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="contact-social">
                <p className="contact-social__title">{page.main.social.title}</p>
                <div className="contact-social__links">
                  {[
                    { key: "facebook", icon: facebookIcon, data: page.main.social.facebook },
                    { key: "instagram", icon: instagramIcon, data: page.main.social.instagram },
                  ].map(({ key, icon, data }) => {
                    // No se dibuja un enlace externo si su URL no es HTTPS.
                    const href = secureSocialUrl(data.url);
                    if (!href) return null;
                    return (
                      <a
                        key={key}
                        className="contact-social__link"
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Visitar ${data.label} de El Ancla`}
                      >
                        <img className="contact-social__icon" src={icon} alt="" aria-hidden="true" />
                        <span>{data.label}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* El formulario público sigue siendo interactivo; no se usa ContactFormEditor. */}
            <form className="contact-form" onSubmit={handleSubmit} noValidate>
              <div className="contact-form__header">
                <p className="contact-form__eyebrow">{page.form.eyebrow}</p>
                <h2 className="contact-form__title">{page.form.title}</h2>
              </div>

              <div className="contact-form__group">
                <label className="contact-form__label" htmlFor="contact-name">
                  {page.form.fields.name.label}
                </label>
                <input
                  className="contact-form__input"
                  id="contact-name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={page.form.fields.name.placeholder}
                  autoComplete="name"
                  maxLength={80}
                  required
                />
              </div>

              <div className="contact-form__group">
                <label className="contact-form__label" htmlFor="contact-email">
                  {page.form.fields.email.label}
                </label>
                <input
                  className="contact-form__input"
                  id="contact-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={page.form.fields.email.placeholder}
                  autoComplete="email"
                  maxLength={120}
                  required
                />
              </div>

              <div className="contact-form__group">
                <label className="contact-form__label" htmlFor="contact-subject">
                  {page.form.fields.subject.label}
                </label>
                <input
                  className="contact-form__input"
                  id="contact-subject"
                  name="subject"
                  type="text"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder={page.form.fields.subject.placeholder}
                  maxLength={120}
                  required
                />
              </div>

              <div className="contact-form__group">
                <label className="contact-form__label" htmlFor="contact-message">
                  {page.form.fields.message.label}
                </label>
                <textarea
                  className="contact-form__textarea"
                  id="contact-message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder={page.form.fields.message.placeholder}
                  rows={7}
                  maxLength={1500}
                  required
                />
                <span className="contact-form__counter">
                  {formData.message.length}/1500
                </span>
              </div>

              {formStatus && (
                <p className="contact-form__status" role="status" aria-live="polite">
                  {formStatus}
                </p>
              )}

              <button className="contact-form__submit" type="submit">
                {page.form.submitText}
              </button>
              <p className="contact-form__privacy">{page.form.privacyText}</p>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}

// Conservamos la exportación y la ruta pública ya registrada en App.js.
export default Contact;
