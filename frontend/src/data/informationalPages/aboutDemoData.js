
/* ========================================================= */
/* IGLESIA EL ANCLA - CONTENIDO EDITABLE DE NOSOTROS */
/* ========================================================= */

// Fotografías originales.
import iglesiaElAncla from "../../assets/images/iglesia-el-ancla.png";
import pastorSebastian from "../../assets/images/seba.jpg";

// Iconos originales.
import comunidadIcon from "../../assets/icons/comunidad.png";
import feIcon from "../../assets/icons/fe.png";
import propositoIcon from "../../assets/icons/proposito.png";
import esperanzaIcon from "../../assets/icons/esperanza.png";
import servimosIcon from "../../assets/icons/servimos.png";
import crecemosIcon from "../../assets/icons/crecemos.png";
import misionIcon from "../../assets/icons/mision.png";
import visionIcon from "../../assets/icons/vision.png";
import conviccionIcon from "../../assets/icons/conviccion.png";

// =========================================================
// CONTENIDO INICIAL
// =========================================================

export const aboutDemoData = {

    // -----------------------------------------------------
    // 1. PRESENTACIÓN PRINCIPAL
    // -----------------------------------------------------

    hero: {
        eyebrow: "El Ancla Comunidad Cristiana",
        title: "Firmes en Cristo,",
        highlightedTitle: "anclados en Su Palabra.",
        description:
            "Somos una iglesia cristiana que busca glorificar a Dios en todo. Creemos que la Biblia es nuestra autoridad para la fe y la vida, que la salvación es por gracia mediante la fe en Jesucristo, y que el evangelio transforma a quienes Dios llama a vivir para Su gloria.",
        verse:
            "“Tenemos como firme y segura ancla del alma la esperanza.”",
        verseReference: "Hebreos 6:19",
    },

    // -----------------------------------------------------
    // 2. QUIÉNES SOMOS
    // -----------------------------------------------------

    intro: {
        eyebrow: "Quiénes somos",
        title: "Cristo es nuestro centro",

        paragraphs: [
            "Existimos para glorificar a Dios haciendo discípulos que amen a Cristo, vivan conforme a Su Palabra y reflejen el evangelio en cada área de su vida.",

            "Como iglesia, buscamos crecer juntos en el conocimiento de Dios mediante la enseñanza fiel de las Escrituras, la oración, la comunión y el servicio mutuo. Deseamos ser una familia de fe donde cada persona encuentre ánimo para seguir a Cristo y oportunidades para servir con los dones que Él ha dado.",

            "Creemos que la iglesia es el lugar donde Dios forma a Su pueblo, fortalece su fe y lo envía a anunciar el evangelio con amor y verdad.",
        ],

        image: iglesiaElAncla,
        imageAlt: "Comunidad de la Iglesia El Ancla reunida",

        imageCaption:
            "Caminamos juntos para conocer más a Cristo, amar Su Palabra y vivir el evangelio cada día.",
    },

    // -----------------------------------------------------
    // 3. MISIÓN Y VISIÓN
    // -----------------------------------------------------

    purpose: {
        mission: {
            icon: misionIcon,
            eyebrow: "Nuestra misión",
            title: "Compartir el amor de Dios",

            description:
                "Existimos para glorificar a Dios haciendo discípulos de Jesucristo mediante la proclamación fiel de Su Palabra, la vida en comunidad y el servicio, para que personas de toda edad conozcan a Cristo, crezcan en madurez y participen en la extensión del evangelio.",
        },

        vision: {
            icon: visionIcon,
            eyebrow: "Nuestra visión",
            title: "Ser una comunidad firme y cercana",

            description:
                "Anhelamos ser una comunidad cristiana profundamente arraigada en el evangelio, reconocida por su fidelidad a las Escrituras, su amor fraternal y su compromiso con hacer discípulos que hagan discípulos, para la gloria de Dios.",
        },
    },

    // -----------------------------------------------------
    // 4. NUESTRA CONVICCIÓN
    // -----------------------------------------------------

    conviction: {
        icon: conviccionIcon,
        eyebrow: "Nuestra convicción",
        title: "Fundamentados en la Palabra de Dios",

        paragraphs: [
            "Creemos que la Palabra de Dios es suficiente para conducir a las personas al conocimiento de Cristo, transformarlas a Su imagen y equiparlas para toda buena obra.",

            "Por eso, buscamos que cada ministerio, enseñanza y decisión de nuestra iglesia esté fundamentado en las Escrituras y centrado en el evangelio.",
        ],
    },

    // -----------------------------------------------------
    // 5. NUESTROS VALORES
    // -----------------------------------------------------

    values: {
        eyebrow: "Lo que guía nuestro caminar",
        title: "Nuestros valores",

        description:
            "Estos principios representan la forma en que deseamos vivir nuestra fe y relacionarnos como comunidad.",

        items: [
            {
                id: "community",
                title: "Comunidad",
                description:
                    "Queremos ser una familia espiritual donde cada persona pueda sentirse acompañada.",
                icon: comunidadIcon,
                alt: "Icono que representa la comunidad",
            },
            {
                id: "faith",
                title: "Fe",
                description:
                    "Creemos en Dios, en su Palabra y en el poder transformador de Jesucristo.",
                icon: feIcon,
                alt: "Icono que representa la fe",
            },
            {
                id: "purpose",
                title: "Propósito",
                description:
                    "Buscamos vivir con sentido, amar a Dios y servir a quienes nos rodean.",
                icon: propositoIcon,
                alt: "Icono que representa el propósito",
            },
            {
                id: "hope",
                title: "Esperanza",
                description:
                    "Confiamos en que Jesús es nuestra esperanza firme en cada etapa de la vida.",
                icon: esperanzaIcon,
                alt: "Icono que representa la esperanza",
            },
            {
                id: "service",
                title: "Servicio",
                description:
                    "Deseamos servir con humildad, generosidad y amor dentro y fuera de la iglesia.",
                icon: servimosIcon,
                alt: "Icono que representa el servicio",
            },
            {
                id: "growth",
                title: "Crecimiento",
                description:
                    "Anhelamos crecer juntos en la fe, la Palabra y nuestra relación con Dios.",
                icon: crecemosIcon,
                alt: "Icono que representa el crecimiento espiritual",
            },
        ],
    },

    // -----------------------------------------------------
    // 6. NUESTRO PASTOR
    // -----------------------------------------------------

    pastor: {
        eyebrow: "Un mensaje de nuestro pastor",
        name: "Sebastián Ortiz",
        role: "Pastor de El Ancla Comunidad Cristiana",

        image: pastorSebastian,
        imageAlt: "Pastor Sebastián Ortiz",

        paragraphs: [
            "Todos necesitamos una esperanza firme.",

            "Esa esperanza no está en una iglesia ni en una persona, sino en Jesucristo.",

            "Si nos visitas, deseamos que encuentres una comunidad que ama a Dios, ama Su Palabra y quiere caminar contigo hacia Él.",
        ],
    },

    // -----------------------------------------------------
    // 7. INVITACIÓN FINAL
    // -----------------------------------------------------

    invitation: {
        eyebrow: "Queremos conocerte",

        title:
            "Hay un lugar para ti en nuestra comunidad",

        description:
            "Puedes visitarnos, participar en nuestras actividades o escribirnos para resolver cualquier duda antes de acompañarnos.",

        primaryButton: {
            text: "Ver eventos y actividades",
            path: "/eventos",
        },

        secondaryButton: {
            text: "Contactarnos",
            path: "/contacto",
        },
    },
};

export default aboutDemoData;
