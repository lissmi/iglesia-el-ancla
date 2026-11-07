// =========================================================
// PDF DE DISCIPULADO — IGLESIA EL ANCLA
// =========================================================
// Genera un PDF en memoria a partir de un estudio ya seleccionado.
// No crea archivos en Drive ni agrega documentos a MongoDB.
// PDFKit ya está incluido entre las dependencias del backend.
import PDFDocument from "pdfkit";

// Colores utilizados por la interfaz de la iglesia.
const COLORS = Object.freeze({
  ink: "#203747",
  accent: "#387F99",
  gold: "#A98150",
  muted: "#566C7C",
  line: "#DEE7EB",
});

// Normalizamos únicamente para mostrar información; no alteramos el estudio.
const asText = (value) => typeof value === "string" ? value.trim() : "";
const asList = (value) => Array.isArray(value) ? value.filter((item) => asText(item)) : [];

// Agrega un espacio antes del próximo bloque para que no quede cortado.
function ensureSpace(pdf, points = 75) {
  const bottom = pdf.page.height - pdf.page.margins.bottom;
  if (pdf.y + points > bottom) pdf.addPage();
}

// Títulos de las secciones: siempre comienzan con espacio suficiente.
function section(pdf, title) {
  ensureSpace(pdf, 78);
  pdf.moveDown(0.9);
  pdf.font("Helvetica-Bold").fontSize(14).fillColor(COLORS.ink)
    .text(title, { lineGap: 2 });
  pdf.moveDown(0.45);
}

// Párrafo normal, con separación legible e interlineado moderado.
function paragraph(pdf, text) {
  const value = asText(text);
  if (!value) return;
  pdf.font("Helvetica").fontSize(10.6).fillColor(COLORS.ink)
    .text(value, { lineGap: 4, align: "left" });
  pdf.moveDown(0.55);
}

// Lista numerada o con viñetas, sin utilizar HTML ni contenido sin filtrar.
function list(pdf, values, numbered = false) {
  asList(values).forEach((value, index) => {
    ensureSpace(pdf, 30);
    pdf.font("Helvetica").fontSize(10.4).fillColor(COLORS.ink)
      .text(`${numbered ? `${index + 1}.` : "•"}  ${value}`, {
        indent: 12, lineGap: 3,
      });
    pdf.moveDown(0.3);
  });
}

// Escribe un subtítulo introductorio opcional.
function subheading(pdf, value) {
  if (!asText(value)) return;
  ensureSpace(pdf, 46);
  pdf.font("Helvetica-Bold").fontSize(11).fillColor(COLORS.accent)
    .text(value, { lineGap: 3 });
  pdf.moveDown(0.4);
}

// Construimos el documento a partir del contenido publicado o el original.
export function createDiscipleshipPdf(material) {
  const pdf = new PDFDocument({
    size: "A4",
    margins: { top: 54, bottom: 62, left: 55, right: 55 },
    bufferPages: true,
    info: {
      Title: asText(material?.title) || "Material de discipulado",
      Author: "Iglesia El Ancla Comunidad Cristiana",
      Subject: "Material de discipulado para formación cristiana",
    },
  });

  // Encabezado institucional y nombre del material.
  pdf.font("Helvetica-Bold").fontSize(9).fillColor(COLORS.accent)
    .text("IGLESIA EL ANCLA  ·  MATERIAL DE DISCIPULADO");
  pdf.moveDown(0.9);
  pdf.moveTo(55, pdf.y).lineTo(pdf.page.width - 55, pdf.y)
    .strokeColor(COLORS.gold).lineWidth(1.4).stroke();
  pdf.moveDown(1.2);
  pdf.font("Helvetica-Bold").fontSize(23).fillColor(COLORS.ink)
    .text(asText(material.title) || "Material de discipulado", { lineGap: 4 });
  pdf.moveDown(0.4);

  // Mostramos únicamente información editorial; nunca IDs o rutas privadas.
  const details = [asText(material.category),
    asText(material.level) ? `Nivel ${material.level}` : "",
    Array.isArray(material.content) ? `${material.content.length} lecciones` : ""]
    .filter(Boolean).join("   ·   ");
  if (details) {
    pdf.font("Helvetica").fontSize(9).fillColor(COLORS.muted).text(details);
    pdf.moveDown(0.8);
  }
  paragraph(pdf, material.summary);

  // Descripción introductoria y objetivos del estudio.
  if (asList(material.description).length) {
    section(pdf, "Presentación");
    asList(material.description).forEach((item) => paragraph(pdf, item));
  }
  if (asList(material.objectives).length) {
    section(pdf, "Objetivos");
    list(pdf, material.objectives);
  }
  if (asList(material.topics).length) {
    section(pdf, "Temas principales");
    list(pdf, material.topics);
  }
  if (material.keyVerse && (asText(material.keyVerse.reference) || asText(material.keyVerse.text))) {
    section(pdf, "Versículo destacado");
    subheading(pdf, material.keyVerse.reference);
    paragraph(pdf, material.keyVerse.text);
  }

  // Todas las lecciones conservan sus párrafos y reflexiones originales.
  (Array.isArray(material.content) ? material.content : []).forEach((lesson, index) => {
    ensureSpace(pdf, 118);
    section(pdf, `Lección ${index + 1}. ${asText(lesson?.title)}`);
    asList(lesson?.paragraphs).forEach((item) => paragraph(pdf, item));
    if (asText(lesson?.reflection)) {
      subheading(pdf, "Para reflexionar");
      paragraph(pdf, lesson.reflection);
    }
  });

  // Preguntas y aplicación práctica para el trabajo personal o grupal.
  if (asList(material.reflectionQuestions).length) {
    section(pdf, "Preguntas para reflexionar");
    list(pdf, material.reflectionQuestions, true);
  }
  if (material.practicalActivity) {
    section(pdf, "Actividad práctica");
    subheading(pdf, material.practicalActivity.title);
    paragraph(pdf, material.practicalActivity.description);
    list(pdf, material.practicalActivity.steps, true);
  }

  // Pie de página con numeración. Se agrega después de terminar el contenido,
  // de modo que las páginas generadas automáticamente también se numeren.
  const pages = pdf.bufferedPageRange();
  for (let index = 0; index < pages.count; index += 1) {
    pdf.switchToPage(pages.start + index);
    const y = pdf.page.height - 43;
    pdf.moveTo(55, y - 12).lineTo(pdf.page.width - 55, y - 12)
      .strokeColor(COLORS.line).lineWidth(0.7).stroke();
    pdf.font("Helvetica").fontSize(8).fillColor(COLORS.muted)
      .text("Iglesia El Ancla · Material educativo", 55, y, {
        lineBreak: false,
      });
    pdf.font("Helvetica").fontSize(8).fillColor(COLORS.muted)
      .text(`${index + 1} / ${pages.count}`, pdf.page.width - 110, y, {
        width: 55, align: "right", lineBreak: false,
      });
  }

  // La ruta HTTP conecta el flujo antes de llamar a end().
  return pdf;
}
