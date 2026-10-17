
/* ========================================================= */
/* PÁGINAS INFORMATIVAS - DATOS DE DEMOSTRACIÓN */
/* ========================================================= */

// Estas páginas corresponden a los contenidos
// institucionales y legales del sitio web.
//
// Los datos se reemplazarán posteriormente
// por información almacenada en MongoDB.

export const initialInformationalPages = [

    {
        id: "PAGE-001",
        slug: "nosotros",
        title: "Nosotros",
        description:
            "Historia, identidad, misión y visión de la Iglesia El Ancla.",
        category: "Institucional",
        publicPath: "/nosotros",
        status: "published",
        editable: true,
        updatedAt: null,
    },

    {
        id: "PAGE-002",
        slug: "contacto",
        title: "Contacto",
        description:
            "Información de contacto y medios de comunicación de la iglesia.",
        category: "Institucional",
        publicPath: "/contacto",
        status: "published",
        editable: true,
        updatedAt: null,
    },

    {
        id: "PAGE-003",
        slug: "terminos-y-condiciones",
        title: "Términos y condiciones",
        description:
            "Condiciones generales de utilización de la plataforma.",
        category: "Legal",
        publicPath: "/terminos-y-condiciones",
        status: "pending",
        editable: true,
        updatedAt: null,
    },

    {
        id: "PAGE-004",
        slug: "politica-de-privacidad",
        title: "Política de privacidad",
        description:
            "Información sobre el tratamiento y protección de datos personales.",
        category: "Legal",
        publicPath: "/politica-de-privacidad",
        status: "pending",
        editable: true,
        updatedAt: null,
    },

];

// =========================================================
// CATEGORÍAS
// =========================================================

export const informationalPageCategories = [
    "Institucional",
    "Legal",
];

// =========================================================
// ESTADOS
// =========================================================

export const informationalPageStatuses = {
    published: "Publicada",
    draft: "Borrador",
    pending: "Pendiente",
};
