// Importamos useState para controlar los campos y mensajes del formulario.
import { useState } from "react";


// Importamos el icono de ubicación.
import ubicacionIcon from "../../assets/icons/ubicacion.png";

// Importamos el icono de ayuda o contacto.
import escribenosIcon from "../../assets/icons/escribenos.png";

// Importamos el icono de reunion.
import reunionIcon from "../../assets/icons/reunion.png";

// Importamos el icono de Facebook.
import facebookIcon from "../../assets/icons/fb.png";

// Importamos el icono de Instagram.
import instagramIcon from "../../assets/icons/insta.png";

// Importamos los estilos exclusivos de la página Contacto.
import "../../styles/pages/public/Contact.css";

// Creamos la página pública de contacto.
function Contact() {
    // Guardamos el correo oficial de la iglesia.
    // IMPORTANTE: reemplaza este valor cuando tengas el correo real.
    const churchEmail = "comunidadcristiana.elancla@gmail.com";

    // Guardamos la información escrita en el formulario.
    const [formData, setFormData] = useState({
        // Nombre de la persona.
        name: "",

        // Correo de la persona.
        email: "",

        // Asunto del mensaje.
        subject: "",

        // Contenido principal del mensaje.
        message: "",
    });

    // Guardamos cualquier mensaje de validación.
    const [formStatus, setFormStatus] = useState("");

    // Actualizamos el campo correspondiente cuando la persona escribe.
    const handleChange = (event) => {
        // Obtenemos el nombre y el valor del campo modificado.
        const { name, value } = event.target;

        // Actualizamos solamente el campo correspondiente.
        setFormData((previousFormData) => ({
            // Conservamos los demás campos.
            ...previousFormData,

            // Reemplazamos el campo modificado.
            [name]: value,
        }));

        // Limpiamos un mensaje anterior al volver a escribir.
        setFormStatus("");
    };

    // Procesamos el envío inicial del formulario.
    const handleSubmit = (event) => {
        // Evitamos que el navegador recargue la página.
        event.preventDefault();

        // Verificamos que todos los campos obligatorios tengan información.
        if (
            !formData.name.trim() ||
            !formData.email.trim() ||
            !formData.subject.trim() ||
            !formData.message.trim()
        ) {
            // Mostramos una advertencia si falta información.
            setFormStatus("Por favor, completa todos los campos del formulario.");

            // Detenemos la función.
            return;
        }

        // Construimos el asunto que aparecerá en el correo.
        const emailSubject = `${formData.subject} — Mensaje de ${formData.name}`;

        // Construimos el contenido completo del correo.
        const emailBody = `
Nombre: ${formData.name}
Correo de contacto: ${formData.email}

Mensaje:
${formData.message}
    `.trim();

        // Creamos el enlace mailto codificando caracteres especiales.
        const mailtoLink = `mailto:${churchEmail}?subject=${encodeURIComponent(
            emailSubject
        )}&body=${encodeURIComponent(emailBody)}`;

        // Informamos que se abrirá la aplicación de correo.
        setFormStatus("Abriendo tu aplicación de correo…");

        // Abrimos el enlace de correo en la misma ventana.
        window.location.href = mailtoLink;
    };

    // Retornamos la estructura visual de la página.
    return (
        // Contenedor principal de Contacto.
        <div className="contact">

            {/* Contenido principal de la página. */}
            <main>
                {/* Encabezado principal de Contacto. */}
                <section className="contact-hero">
                    {/* Capa decorativa del encabezado. */}
                    <div className="contact-hero__overlay"></div>

                    {/* Contenedor central del encabezado. */}
                    <div className="contact-hero__container">
                        {/* Texto introductorio pequeño. */}
                        <p className="contact-hero__eyebrow">
                            El Ancla Comunidad Cristiana
                        </p>

                        {/* Título principal. */}
                        <h1 className="contact-hero__title">
                            Estamos aquí
                            <span className="contact-hero__title-highlight">
                                para escucharte
                            </span>
                        </h1>

                        {/* Presentación de la página. */}
                        <p className="contact-hero__description">
                            Puedes escribirnos para resolver tus dudas, conocer nuestras
                            actividades o recibir orientación antes de visitarnos.
                        </p>
                    </div>

                    {/* Curva decorativa inferior. */}
                    <div className="contact-hero__curve"></div>
                </section>

                {/* Sección con información rápida de contacto. */}
                <section className="contact-information">
                    {/* Contenedor central. */}
                    <div className="contact-information__container">
                        {/* Tarjeta de ubicación. */}
                        <article className="contact-information__card">
                            {/* Contenedor del icono. */}
                            <div className="contact-information__icon-wrapper">
                                {/* Icono de ubicación. */}
                                <img
                                    className="contact-information__icon"
                                    src={ubicacionIcon}
                                    alt=""
                                    aria-hidden="true"
                                />
                            </div>

                            {/* Contenido textual. */}
                            <div className="contact-information__content">
                                {/* Etiqueta de la tarjeta. */}
                                <p className="contact-information__label">
                                    Dirección
                                </p>

                                {/* Dirección de la iglesia. */}
                                <h2 className="contact-information__title">
                                    Visítanos en Playa Ancha
                                </h2>

                                {/* Dirección completa. */}
                                <p className="contact-information__description">
                                    Artillería 199, Playa Ancha
                                    <br />
                                    Valparaíso, Chile
                                </p>
                            </div>
                        </article>

                        {/* Tarjeta de correo electrónico. */}
                        <article className="contact-information__card">
                            {/* Contenedor del icono. */}
                            <div className="contact-information__icon-wrapper">
                                {/* Icono de contacto. */}
                                <img
                                    className="contact-information__icon"
                                    src={escribenosIcon}
                                    alt=""
                                    aria-hidden="true"
                                />
                            </div>

                            {/* Contenido textual. */}
                            <div className="contact-information__content">
                                {/* Etiqueta de la tarjeta. */}
                                <p className="contact-information__label">
                                    Escríbenos
                                </p>

                                {/* Título de la tarjeta. */}
                                <h2 className="contact-information__title">
                                    Comunícate con nosotros
                                </h2>

                                {/* Enlace directo al correo. */}
                                <a
                                    className="contact-information__email"
                                    href={`mailto:${churchEmail}`}
                                >
                                    {churchEmail}
                                </a>
                            </div>
                        </article>

                        {/* Tarjeta de horarios. */}
                        <article className="contact-information__card">
                            {/* Contenedor decorativo con un número. */}
                            <div className="contact-information__schedule-icon">
                                {/* Texto decorativo. */}
                                <img
                                    className="contact-information__icon_reunion"
                                    src={reunionIcon}
                                    alt=""
                                    aria-hidden="true"
                                />
                            </div>

                            {/* Contenido textual. */}
                            <div className="contact-information__content">
                                {/* Etiqueta de la tarjeta. */}
                                <p className="contact-information__label">
                                    Reunión principal
                                </p>

                                {/* Título del horario. */}
                                <h2 className="contact-information__title">
                                    Culto general
                                </h2>

                                {/* Horario provisional. */}
                                <p className="contact-information__description">
                                    Domingo — 11:00 hrs
                                    <br />
                                    Modalidad presencial
                                </p>
                            </div>
                        </article>
                    </div>
                </section>

                {/* Sección principal con formulario y datos adicionales. */}
                <section className="contact-main">
                    {/* Contenedor de dos columnas. */}
                    <div className="contact-main__container">
                        {/* Columna con información introductoria. */}
                        <div className="contact-main__content">
                            {/* Texto introductorio. */}
                            <p className="contact-section__eyebrow">
                                Hablemos
                            </p>

                            {/* Título principal de la sección. */}
                            <h2 className="contact-section__title">
                                Envíanos tu mensaje
                            </h2>

                            {/* Explicación del formulario. */}
                            <p className="contact-main__description">
                                Completa el formulario y se abrirá tu aplicación de correo con el
                                mensaje preparado.
                            </p>

                            {/* Bloque con recomendaciones. */}
                            <div className="contact-main__notice">
                                {/* Título del aviso. */}
                                <h3 className="contact-main__notice-title">
                                    ¿En qué podemos ayudarte?
                                </h3>

                                {/* Lista de posibles consultas. */}
                                <ul className="contact-main__notice-list">
                                    {/* Primera opción. */}
                                    <li>Información para visitar la iglesia.</li>

                                    {/* Segunda opción. */}
                                    <li>Consultas sobre reuniones y actividades.</li>

                                    {/* Tercera opción. */}
                                    <li>Orientación para participar por primera vez.</li>

                                    {/* Cuarta opción. */}
                                    <li>Información general de la comunidad.</li>
                                </ul>
                            </div>

                            {/* Bloque de redes sociales. */}
                            <div className="contact-social">
                                {/* Título de redes sociales. */}
                                <p className="contact-social__title">
                                    También puedes seguirnos
                                </p>

                                {/* Enlaces sociales. */}
                                <div className="contact-social__links">
                                    {/* Enlace de Facebook. */}
                                    <a
                                        className="contact-social__link"
                                        href="https://www.facebook.com/elanclacomunidad"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="Visitar Facebook de El Ancla"
                                    >
                                        {/* Icono de Facebook. */}
                                        <img
                                            className="contact-social__icon"
                                            src={facebookIcon}
                                            alt=""
                                            aria-hidden="true"
                                        />

                                        {/* Nombre de la red social. */}
                                        <span>Facebook</span>
                                    </a>

                                    {/* Enlace de Instagram. */}
                                    <a
                                        className="contact-social__link"
                                        href="https://www.instagram.com/el.ancla.comunidad.cristiana/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="Visitar Instagram de El Ancla"
                                    >
                                        {/* Icono de Instagram. */}
                                        <img
                                            className="contact-social__icon"
                                            src={instagramIcon}
                                            alt=""
                                            aria-hidden="true"
                                        />

                                        {/* Nombre de la red social. */}
                                        <span>Instagram</span>
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Formulario de contacto. */}
                        <form
                            className="contact-form"
                            onSubmit={handleSubmit}
                            noValidate
                        >
                            {/* Encabezado interior del formulario. */}
                            <div className="contact-form__header">
                                {/* Texto pequeño. */}
                                <p className="contact-form__eyebrow">
                                    Formulario de contacto
                                </p>

                                {/* Título interior. */}
                                <h2 className="contact-form__title">
                                    Cuéntanos cómo podemos ayudarte
                                </h2>
                            </div>

                            {/* Grupo del nombre. */}
                            <div className="contact-form__group">
                                {/* Etiqueta del nombre. */}
                                <label
                                    className="contact-form__label"
                                    htmlFor="contact-name"
                                >
                                    Nombre completo
                                </label>

                                {/* Campo del nombre. */}
                                <input
                                    className="contact-form__input"
                                    id="contact-name"
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Escribe tu nombre"
                                    autoComplete="name"
                                    maxLength="80"
                                    required
                                />
                            </div>

                            {/* Grupo del correo. */}
                            <div className="contact-form__group">
                                {/* Etiqueta del correo. */}
                                <label
                                    className="contact-form__label"
                                    htmlFor="contact-email"
                                >
                                    Correo electrónico
                                </label>

                                {/* Campo del correo. */}
                                <input
                                    className="contact-form__input"
                                    id="contact-email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="nombre@correo.cl"
                                    autoComplete="email"
                                    maxLength="120"
                                    required
                                />
                            </div>

                            {/* Grupo del asunto. */}
                            <div className="contact-form__group">
                                {/* Etiqueta del asunto. */}
                                <label
                                    className="contact-form__label"
                                    htmlFor="contact-subject"
                                >
                                    Asunto
                                </label>

                                {/* Campo del asunto. */}
                                <input
                                    className="contact-form__input"
                                    id="contact-subject"
                                    name="subject"
                                    type="text"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    placeholder="¿Sobre qué deseas escribirnos?"
                                    maxLength="120"
                                    required
                                />
                            </div>

                            {/* Grupo del mensaje. */}
                            <div className="contact-form__group">
                                {/* Etiqueta del mensaje. */}
                                <label
                                    className="contact-form__label"
                                    htmlFor="contact-message"
                                >
                                    Mensaje
                                </label>

                                {/* Área del mensaje. */}
                                <textarea
                                    className="contact-form__textarea"
                                    id="contact-message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="Escribe aquí tu mensaje"
                                    rows="7"
                                    maxLength="1500"
                                    required
                                ></textarea>

                                {/* Contador de caracteres. */}
                                <span className="contact-form__counter">
                                    {formData.message.length}/1500
                                </span>
                            </div>

                            {/* Mensaje de validación o estado. */}
                            {formStatus && (
                                <p
                                    className="contact-form__status"
                                    role="status"
                                    aria-live="polite"
                                >
                                    {formStatus}
                                </p>
                            )}

                            {/* Botón de envío. */}
                            <button
                                className="contact-form__submit"
                                type="submit"
                            >
                                Preparar correo
                            </button>

                            {/* Explicación sobre el tratamiento actual. */}
                            <p className="contact-form__privacy">
                                El sitio todavía no almacena esta información. El mensaje se
                                preparará en tu aplicación de correo.
                            </p>
                        </form>
                    </div>
                </section>
            </main>
        </div>
    );
}

// Exportamos la página para utilizarla desde App.js.
export default Contact;