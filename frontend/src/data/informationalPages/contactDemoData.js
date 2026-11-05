/* ========================================================= */
/* DATOS DEMOSTRATIVOS - PÁGINA CONTACTO */
/* IGLESIA EL ANCLA */
/* ========================================================= */

// Estos datos se utilizan exclusivamente en el editor
// administrativo. No modifican la página pública.

const contactDemoData = {

    // =====================================================
    // ENCABEZADO PRINCIPAL
    // =====================================================

    hero: {
        eyebrow: "El Ancla Comunidad Cristiana",

        title: "Estamos aquí",

        highlightedTitle: "para escucharte",

        description:
            "Puedes escribirnos para resolver tus dudas, conocer nuestras actividades o recibir orientación antes de visitarnos.",
    },

    // =====================================================
    // TARJETAS DE INFORMACIÓN
    // =====================================================

    information: {

        location: {
            label: "Dirección",
            title: "Visítanos en Playa Ancha",
            address: "Artillería 199, Playa Ancha",
            city: "Valparaíso, Chile",
        },

        email: {
            label: "Escríbenos",
            title: "Comunícate con nosotros",
            address: "comunidadcristiana.elancla@gmail.com",
        },

        schedule: {
            label: "Reunión principal",
            title: "Culto general",
            dayAndTime: "Domingo — 11:00 hrs",
            modality: "Modalidad presencial",
        },
    },

    // =====================================================
    // SECCIÓN PRINCIPAL
    // =====================================================

    main: {
        eyebrow: "Hablemos",

        title: "Envíanos tu mensaje",

        description:
            "Completa el formulario y se abrirá tu aplicación de correo con el mensaje preparado.",

        notice: {
            title: "¿En qué podemos ayudarte?",

            items: [
                "Información para visitar la iglesia.",
                "Consultas sobre reuniones y actividades.",
                "Orientación para participar por primera vez.",
                "Información general de la comunidad.",
            ],
        },

        social: {
            title: "También puedes seguirnos",

            facebook: {
                label: "Facebook",
                url: "https://www.facebook.com/elanclacomunidad",
            },

            instagram: {
                label: "Instagram",
                url: "https://www.instagram.com/el.ancla.comunidad.cristiana/",
            },
        },
    },

    // =====================================================
    // FORMULARIO DE CONTACTO
    // =====================================================

    form: {
        eyebrow: "Formulario de contacto",

        title: "Cuéntanos cómo podemos ayudarte",

        fields: {
            name: {
                label: "Nombre completo",
                placeholder: "Escribe tu nombre",
            },

            email: {
                label: "Correo electrónico",
                placeholder: "nombre@correo.cl",
            },

            subject: {
                label: "Asunto",
                placeholder: "¿Sobre qué deseas escribirnos?",
            },

            message: {
                label: "Mensaje",
                placeholder: "Escribe aquí tu mensaje",
            },
        },

        submitText: "Preparar correo",

        privacyText:
            "El sitio todavía no almacena esta información. El mensaje se preparará en tu aplicación de correo.",
    },
};

export default contactDemoData;
