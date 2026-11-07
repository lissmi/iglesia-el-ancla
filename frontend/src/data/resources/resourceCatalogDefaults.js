// =========================================================
// CATÁLOGO DE CONTENIDO INICIAL DE LA IGLESIA
// =========================================================
// Reutilizamos los materiales originales, sin copiarlos a la BD.
import bibleStudies from "./bibleStudies";
import bibleStudyTools from "./bibleStudyTools";
import devotionalSteps from "./devotionalSteps";
import discipleshipMaterials from "./discipleshipMaterials";
import prayerGuides from "./prayerGuides";
import downloadableMaterials from "./downloadableMaterials";
import frequentlyAskedQuestions from "./frequentlyAskedQuestions";

export const RESOURCE_CONTENT_ORDER = [
  "bible", "studies", "devotionals", "discipleship", "prayer_guides", "downloads", "faq",
];

// Título y subtítulos de los encabezados visibles para los miembros.
// Las imágenes, botones y diseño siguen funcionando como hasta ahora.
export const RESOURCE_CONTENT_DEFAULTS = {
  bible: {
    name: "Biblia y herramientas de estudio",
    heading: {
      eyebrow: "Conoce y comprende la Palabra",
      title: "Biblia y herramientas",
      highlight: "para tu estudio",
      description: "Descubre recursos sencillos para conocer la estructura de la Biblia, comprender mejor sus libros y estudiar cada pasaje con mayor atención.",
    },
    items: bibleStudyTools,
  },
  studies: {
    name: "Estudios bíblicos",
    heading: {
      eyebrow: "Crecer en la Palabra",
      title: "Estudios bíblicos",
      highlight: "para aprender y reflexionar",
      description: "Encuentra estudios sencillos para conocer mejor la Biblia, reflexionar en sus enseñanzas y aplicarlas a tu vida diaria.",
    },
    items: bibleStudies,
  },
  devotionals: {
    name: "Guía devocional",
    heading: {
      eyebrow: "Un momento diario con Dios",
      title: "Guía para tu",
      highlight: "devocional personal",
      description: "Aprende a preparar un tiempo sencillo de lectura bíblica, reflexión y oración que puedas incorporar a tu vida cotidiana.",
    },
    items: devotionalSteps,
  },
  discipleship: {
    name: "Material de discipulado",
    heading: {
      eyebrow: "Formación cristiana",
      title: "Material de discipulado",
      highlight: "",
      description: "Encuentra contenidos preparados para fortalecer tu fe, comprender la Biblia y avanzar en tu caminar cristiano.",
    },
    items: discipleshipMaterials,
  },
  prayer_guides: {
    name: "Guías de oración",
    heading: {
      eyebrow: "Guía espiritual",
      title: "Guías de oración",
      highlight: "",
      description: "Encuentra orientaciones prácticas para fortalecer tu vida de oración, acompañar momentos difíciles y acercarte más a Dios.",
    },
    items: prayerGuides,
  },
  downloads: {
    name: "Material descargable",
    heading: {
      eyebrow: "Documentos y guías",
      title: "Material descargable",
      highlight: "",
      description: "Descarga documentos, guías, planes de lectura y recursos prácticos para estudiar, imprimir o utilizar cuando los necesites.",
    },
    items: downloadableMaterials,
  },
  faq: {
    name: "Preguntas frecuentes",
    heading: {
      eyebrow: "Información general",
      title: "Preguntas frecuentes",
      highlight: "",
      description: "Encuentra respuestas sencillas sobre reuniones, actividades, primeras visitas, participación y otros aspectos de nuestra comunidad.",
    },
    items: frequentlyAskedQuestions,
  },
};
