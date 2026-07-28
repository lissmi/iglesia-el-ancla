// =====================================================
// MATERIAL DESCARGABLE
// =====================================================
//
// Este archivo contiene la información de los documentos,
// guías y recursos que podrán descargarse desde la PWA.
//
// Los archivos PDF deberán guardarse más adelante en:
//
// public/downloads/
//
// Ejemplo:
//
// public/downloads/guia-primeros-pasos-fe.pdf
//
// Luego podrán descargarse utilizando una ruta como:
//
// /downloads/guia-primeros-pasos-fe.pdf
// =====================================================

const downloadableMaterials = [
    {
        id: "material-1",

        slug: "guia-primeros-pasos-fe",

        title:
            "Guía: Primeros pasos en la fe",

        category:
            "Discipulado",

        format:
            "PDF",

        pages:
            12,

        fileSize:
            "Próximamente",

        available:
            false,

        filePath:
            "/downloads/guia-primeros-pasos-fe.pdf",

        summary:
            "Una guía sencilla para quienes desean comenzar a conocer la fe cristiana y fortalecer su relación con Dios.",

        description: [
            "Este material presenta algunos fundamentos esenciales de la vida cristiana de una manera clara y cercana.",
            "Puede utilizarse de forma personal, en pequeños grupos o como apoyo para acompañar a una persona que está dando sus primeros pasos en la fe.",
        ],

        includedContent: [
            "Qué significa comenzar una vida con Cristo.",
            "La importancia de leer la Biblia.",
            "Cómo comenzar a orar.",
            "La vida en comunidad.",
            "Preguntas de reflexión personal.",
        ],

        recommendedFor: [
            "Personas nuevas en la fe.",
            "Grupos de discipulado inicial.",
            "Acompañamiento personal.",
        ],

        relatedMaterials: [
            "como-estudiar-la-biblia",
            "guia-practica-oracion",
        ],
    },

    {
        id: "material-2",

        slug:
            "como-estudiar-la-biblia",

        title:
            "Cómo estudiar la Biblia",

        category:
            "Estudio bíblico",

        format:
            "PDF",

        pages:
            15,

        fileSize:
            "Próximamente",

        available:
            false,

        filePath:
            "/downloads/como-estudiar-la-biblia.pdf",

        summary:
            "Una guía práctica para aprender a leer, observar, comprender y aplicar un pasaje bíblico.",

        description: [
            "Este recurso entrega pasos sencillos para acercarse a la Biblia de manera ordenada y reflexiva.",
            "Incluye recomendaciones que pueden aplicarse tanto al estudio personal como al trabajo en grupos pequeños.",
        ],

        includedContent: [
            "Cómo escoger un pasaje bíblico.",
            "Observación del texto.",
            "Comprensión del contexto.",
            "Aplicación personal.",
            "Ejercicio práctico guiado.",
        ],

        recommendedFor: [
            "Personas que desean estudiar la Biblia.",
            "Grupos pequeños.",
            "Líderes y discipuladores.",
        ],

        relatedMaterials: [
            "plan-lectura-evangelio-juan",
            "hoja-estudio-biblico",
        ],
    },

    {
        id: "material-3",

        slug:
            "guia-practica-oracion",

        title:
            "Guía práctica de oración",

        category:
            "Oración",

        format:
            "PDF",

        pages:
            10,

        fileSize:
            "Próximamente",

        available:
            false,

        filePath:
            "/downloads/guia-practica-oracion.pdf",

        summary:
            "Un recurso para aprender a organizar un tiempo personal de oración y expresar nuestras necesidades delante de Dios.",

        description: [
            "Esta guía busca ayudar a quienes desean comenzar o fortalecer su vida de oración.",
            "Contiene orientaciones, ejemplos y espacios para escribir peticiones, agradecimientos y reflexiones personales.",
        ],

        includedContent: [
            "Preparación para un tiempo de oración.",
            "Adoración y gratitud.",
            "Confesión y reflexión.",
            "Peticiones personales.",
            "Oración por otras personas.",
        ],

        recommendedFor: [
            "Uso personal.",
            "Reuniones de oración.",
            "Grupos de discipulado.",
        ],

        relatedMaterials: [
            "diario-peticiones-oracion",
            "guia-primeros-pasos-fe",
        ],
    },

    {
        id: "material-4",

        slug:
            "diario-peticiones-oracion",

        title:
            "Diario de peticiones de oración",

        category:
            "Oración",

        format:
            "PDF imprimible",

        pages:
            20,

        fileSize:
            "Próximamente",

        available:
            false,

        filePath:
            "/downloads/diario-peticiones-oracion.pdf",

        summary:
            "Páginas imprimibles para registrar peticiones, respuestas y motivos de agradecimiento.",

        description: [
            "Este diario permite llevar un registro sencillo de las peticiones presentadas en oración.",
            "También ofrece espacios para anotar respuestas, aprendizajes y motivos de gratitud.",
        ],

        includedContent: [
            "Registro de peticiones personales.",
            "Peticiones por familiares y amigos.",
            "Espacio para respuestas recibidas.",
            "Motivos de agradecimiento.",
            "Reflexiones semanales.",
        ],

        recommendedFor: [
            "Uso personal.",
            "Familias.",
            "Grupos de oración.",
        ],

        relatedMaterials: [
            "guia-practica-oracion",
            "plan-devocional-siete-dias",
        ],
    },

    {
        id: "material-5",

        slug:
            "plan-devocional-siete-dias",

        title:
            "Plan devocional de 7 días",

        category:
            "Devocional",

        format:
            "PDF",

        pages:
            14,

        fileSize:
            "Próximamente",

        available:
            false,

        filePath:
            "/downloads/plan-devocional-siete-dias.pdf",

        summary:
            "Siete días de lecturas bíblicas, reflexión, oración y aplicación práctica.",

        description: [
            "Este plan devocional fue pensado para ayudar a establecer un momento diario con Dios.",
            "Cada día incluye una lectura bíblica, una breve reflexión, preguntas y una oración orientativa.",
        ],

        includedContent: [
            "Lectura bíblica diaria.",
            "Reflexión breve.",
            "Preguntas personales.",
            "Aplicación práctica.",
            "Oración diaria.",
        ],

        recommendedFor: [
            "Personas que comienzan un hábito devocional.",
            "Jóvenes y adultos.",
            "Uso individual o familiar.",
        ],

        relatedMaterials: [
            "diario-peticiones-oracion",
            "plan-lectura-evangelio-juan",
        ],
    },

    {
        id: "material-6",

        slug:
            "plan-lectura-evangelio-juan",

        title:
            "Plan de lectura del Evangelio de Juan",

        category:
            "Lectura bíblica",

        format:
            "PDF imprimible",

        pages:
            8,

        fileSize:
            "Próximamente",

        available:
            false,

        filePath:
            "/downloads/plan-lectura-evangelio-juan.pdf",

        summary:
            "Un plan organizado para leer y reflexionar sobre el Evangelio de Juan.",

        description: [
            "El plan divide el Evangelio de Juan en lecturas diarias y propone preguntas sencillas para acompañar cada capítulo.",
            "Puede utilizarse como material personal o como apoyo para un grupo de lectura bíblica.",
        ],

        includedContent: [
            "Calendario de lectura.",
            "Capítulos organizados por día.",
            "Preguntas de observación.",
            "Espacio para anotaciones.",
            "Seguimiento del avance.",
        ],

        recommendedFor: [
            "Nuevos creyentes.",
            "Grupos de estudio bíblico.",
            "Lectura personal.",
        ],

        relatedMaterials: [
            "como-estudiar-la-biblia",
            "hoja-estudio-biblico",
        ],
    },

    {
        id: "material-7",

        slug:
            "hoja-estudio-biblico",

        title:
            "Hoja para estudio bíblico",

        category:
            "Estudio bíblico",

        format:
            "PDF imprimible",

        pages:
            4,

        fileSize:
            "Próximamente",

        available:
            false,

        filePath:
            "/downloads/hoja-estudio-biblico.pdf",

        summary:
            "Una plantilla reutilizable para registrar observaciones, enseñanzas y aplicaciones de un pasaje bíblico.",

        description: [
            "Esta hoja puede imprimirse y utilizarse cada vez que se estudie un capítulo o pasaje de la Biblia.",
            "Su estructura ayuda a observar el texto, identificar su mensaje y pensar en una aplicación concreta.",
        ],

        includedContent: [
            "Datos del pasaje.",
            "Palabras o ideas importantes.",
            "Observaciones del texto.",
            "Enseñanza principal.",
            "Aplicación personal.",
        ],

        recommendedFor: [
            "Estudio bíblico personal.",
            "Grupos pequeños.",
            "Talleres de formación.",
        ],

        relatedMaterials: [
            "como-estudiar-la-biblia",
            "plan-lectura-evangelio-juan",
        ],
    },

    {
        id: "material-8",

        slug:
            "guia-reunion-familiar",

        title:
            "Guía para una reunión familiar",

        category:
            "Familia",

        format:
            "PDF",

        pages:
            9,

        fileSize:
            "Próximamente",

        available:
            false,

        filePath:
            "/downloads/guia-reunion-familiar.pdf",

        summary:
            "Una propuesta sencilla para compartir un tiempo de lectura bíblica, conversación y oración en familia.",

        description: [
            "Este recurso busca ayudar a las familias a generar espacios de conversación y crecimiento espiritual en el hogar.",
            "La guía puede adaptarse según las edades, el tiempo disponible y las necesidades de cada familia.",
        ],

        includedContent: [
            "Bienvenida y conversación inicial.",
            "Lectura bíblica.",
            "Preguntas para conversar.",
            "Actividad familiar.",
            "Tiempo de oración.",
        ],

        recommendedFor: [
            "Familias.",
            "Matrimonios.",
            "Adultos responsables de niños.",
        ],

        relatedMaterials: [
            "plan-devocional-siete-dias",
            "tarjetas-versiculos-familia",
        ],
    },

    {
        id: "material-9",

        slug:
            "tarjetas-versiculos-familia",

        title:
            "Tarjetas de versículos para la familia",

        category:
            "Familia",

        format:
            "PDF imprimible",

        pages:
            12,

        fileSize:
            "Próximamente",

        available:
            false,

        filePath:
            "/downloads/tarjetas-versiculos-familia.pdf",

        summary:
            "Tarjetas imprimibles con referencias bíblicas para leer, memorizar y conversar en familia.",

        description: [
            "Las tarjetas fueron pensadas para utilizarse en distintos momentos del día y facilitar conversaciones sobre la Palabra de Dios.",
            "Pueden recortarse, guardarse o colocarse en espacios visibles del hogar.",
        ],

        includedContent: [
            "Versículos sobre amor.",
            "Versículos sobre confianza.",
            "Versículos sobre gratitud.",
            "Versículos sobre oración.",
            "Preguntas para conversar.",
        ],

        recommendedFor: [
            "Familias con niños.",
            "Reuniones familiares.",
            "Memorización bíblica.",
        ],

        relatedMaterials: [
            "guia-reunion-familiar",
            "plan-devocional-siete-dias",
        ],
    },

    {
        id: "material-10",

        slug:
            "guia-compartir-fe",

        title:
            "Guía para compartir tu fe",

        category:
            "Evangelismo",

        format:
            "PDF",

        pages:
            13,

        fileSize:
            "Próximamente",

        available:
            false,

        filePath:
            "/downloads/guia-compartir-fe.pdf",

        summary:
            "Una guía respetuosa y práctica para conversar con otras personas acerca de la fe cristiana.",

        description: [
            "Este material busca ayudar a compartir la fe con claridad, amor y respeto.",
            "Incluye recomendaciones para escuchar a otras personas, comunicar el mensaje cristiano y responder preguntas con humildad.",
        ],

        includedContent: [
            "La importancia de escuchar.",
            "Cómo contar tu testimonio.",
            "Presentación sencilla del evangelio.",
            "Cómo responder preguntas.",
            "Oración y acompañamiento.",
        ],

        recommendedFor: [
            "Personas que desean compartir su fe.",
            "Grupos de discipulado.",
            "Equipos de evangelismo.",
        ],

        relatedMaterials: [
            "guia-primeros-pasos-fe",
            "como-estudiar-la-biblia",
        ],
    },
];

// =====================================================
// CATEGORÍAS DISPONIBLES
// =====================================================

export const downloadableMaterialCategories = [
    "Todos",
    ...new Set(
        downloadableMaterials.map(
            (material) => material.category
        )
    ),
];

// =====================================================
// BÚSQUEDA POR SLUG
// =====================================================

export const getDownloadableMaterialBySlug = (slug) =>
    downloadableMaterials.find(
        (material) => material.slug === slug
    );

// =====================================================
// MATERIALES RELACIONADOS
// =====================================================

export const getRelatedDownloadableMaterials = (
    relatedSlugs = []
) =>
    downloadableMaterials.filter((material) =>
        relatedSlugs.includes(material.slug)
    );

// =====================================================
// EXPORTACIÓN PRINCIPAL
// =====================================================

export default downloadableMaterials;