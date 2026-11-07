// =========================================================
// GUÍAS DE ORACIÓN — PDF BAJO DEMANDA · IGLESIA EL ANCLA
// =========================================================
// PDFKit se utiliza desde el backend y no guarda documentos nuevos en Drive.
// Solo renderizamos los textos de la guía publicada u original, sin HTML.
import PDFDocument from "pdfkit";

// Paleta de colores que ya utiliza el material educativo de la iglesia.
const COLORS = Object.freeze({
  ink: "#203747",
  accent: "#387F99",
  gold: "#A98150",
  muted: "#566C7C",
  line: "#DEE7EB",
});

// Los campos inesperados no deben convertirse en texto imprimible.
const asText = (value) => typeof value === "string" ? value.trim() : "";
const asList = (value) => Array.isArray(value)
  ? value.filter((item) => asText(item)) : [];

// Reservamos espacio para títulos y evitamos comenzar secciones al pie.
function ensureSpace(pdf, required = 70) {
  const bottom = pdf.page.height - pdf.page.margins.bottom;
  if (pdf.y + required > bottom) pdf.addPage();
}

// Mostramos los encabezados en el mismo estilo que Discipulado.
function section(pdf, title) {
  ensureSpace(pdf, 80);
  pdf.moveDown(0.85);
  pdf.font("Helvetica-Bold").fontSize(14).fillColor(COLORS.ink)
    .text(title, { lineGap: 2 });
  pdf.moveDown(0.5);
}

// Cada texto puede ocupar varias páginas; PDFKit administra los saltos.
function paragraph(pdf, value) {
  const text = asText(value);
  if (!text) return;
  pdf.font("Helvetica").fontSize(10.6).fillColor(COLORS.ink)
    .text(text, { lineGap: 4, align: "left" });
  pdf.moveDown(0.6);
}

// Lista de puntos de oración con numeración legible.
function numberedList(pdf, points) {
  asList(points).forEach((point, index) => {
    ensureSpace(pdf, 40);
    pdf.font("Helvetica").fontSize(10.6).fillColor(COLORS.ink)
      .text(`${index + 1}.  ${point}`, { indent: 13, lineGap: 4 });
    pdf.moveDown(0.4);
  });
}

// Genera un stream PDF; la ruta HTTP lo envía directamente al navegador.
export function createPrayerGuidePdf(guide) {
  const pdf = new PDFDocument({
    size: "A4",
    margins: { top: 54, bottom: 62, left: 55, right: 55 },
    bufferPages: true,
    info: {
      Title: asText(guide?.title) || "Guía de oración",
      Author: "Iglesia El Ancla Comunidad Cristiana",
      Subject: "Guía de oración para la comunidad cristiana",
    },
  });

  // Portada integrada para no desperdiciar una página completa.
  pdf.font("Helvetica-Bold").fontSize(9).fillColor(COLORS.accent)
    .text("IGLESIA EL ANCLA  ·  GUÍAS DE ORACIÓN");
  pdf.moveDown(0.9);
  pdf.moveTo(55, pdf.y).lineTo(pdf.page.width - 55, pdf.y)
    .strokeColor(COLORS.gold).lineWidth(1.4).stroke();
  pdf.moveDown(1.2);
  pdf.font("Helvetica-Bold").fontSize(23).fillColor(COLORS.ink)
    .text(asText(guide?.title) || "Guía de oración", { lineGap: 4 });
  pdf.moveDown(0.45);

  // Solo información editorial; nunca IDs ni datos privados de Drive.
  if (asText(guide?.category)) {
    pdf.font("Helvetica").fontSize(9).fillColor(COLORS.muted)
      .text(guide.category);
    pdf.moveDown(0.7);
  }
  paragraph(pdf, guide?.summary);

  // Introducción completa, sin acortar los párrafos de la guía.
  if (asList(guide?.description).length) {
    section(pdf, "Antes de comenzar");
    asList(guide.description).forEach((item) => paragraph(pdf, item));
  }

  // Versículo y referencia bíblica, cuando estén presentes.
  if (asText(guide?.keyVerse?.text) || asText(guide?.keyVerse?.reference)) {
    section(pdf, "Palabra para acompañarte");
    paragraph(pdf, guide.keyVerse.text);
    if (asText(guide.keyVerse.reference)) {
      pdf.font("Helvetica-Bold").fontSize(10.2).fillColor(COLORS.accent)
        .text(guide.keyVerse.reference);
      pdf.moveDown(0.4);
    }
  }

  // Puntos que orientan el tiempo de oración.
  if (asList(guide?.prayerPoints).length) {
    section(pdf, "Puntos para orientar tu oración");
    numberedList(pdf, guide.prayerPoints);
  }

  // Oración sugerida completa.
  if (asText(guide?.samplePrayer)) {
    section(pdf, "Oración de ejemplo");
    paragraph(pdf, guide.samplePrayer);
  }

  // Pie institucional y numeración en todas las páginas.
  const pages = pdf.bufferedPageRange();
  for (let index = 0; index < pages.count; index += 1) {
    pdf.switchToPage(pages.start + index);
    const y = pdf.page.height - 43;
    pdf.moveTo(55, y - 12).lineTo(pdf.page.width - 55, y - 12)
      .strokeColor(COLORS.line).lineWidth(0.7).stroke();
    pdf.font("Helvetica").fontSize(8).fillColor(COLORS.muted)
      .text("Iglesia El Ancla · Guías de oración", 55, y, { lineBreak: false });
    pdf.font("Helvetica").fontSize(8).fillColor(COLORS.muted)
      .text(`${index + 1} / ${pages.count}`, pdf.page.width - 110, y,
        { width: 55, align: "right", lineBreak: false });
  }

  // El controlador conecta el stream y posteriormente ejecuta pdf.end().
  return pdf;
}
