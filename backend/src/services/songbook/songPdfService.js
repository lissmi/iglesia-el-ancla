// =========================================================
// GENERADOR DE PDF - CANCIONERO IGLESIA EL ANCLA
// =========================================================

// PDFKit crea el documento sin guardar archivos locales.
import PDFDocument from "pdfkit";

// Construimos un PDF a partir del formulario del administrador.
export function buildSongPdf({ title, author, category, lyrics }) {
    // Devolvemos el PDF completo como un Buffer para enviarlo a Drive.
    return new Promise((resolve, reject) => {
        // Configuramos el formato A4 y los metadatos del documento.
        const pdf = new PDFDocument({
            size: "A4",
            margin: 58,
            info: {
                Title: title,
                Author: author || "Iglesia El Ancla",
                Subject: "Cancionero de Alabanzas - Iglesia El Ancla",
            },
        });

        // Conservamos en memoria las partes generadas por PDFKit.
        const chunks = [];

        // Acumulamos cada fragmento del PDF.
        pdf.on("data", (chunk) => chunks.push(chunk));

        // Si falla la generación, propagamos el error.
        pdf.on("error", reject);

        // Al finalizar, unimos los fragmentos en un archivo PDF.
        pdf.on("end", () => resolve(Buffer.concat(chunks)));

        // Encabezado institucional en azul marino.
        pdf.font("Helvetica-Bold")
            .fontSize(10)
            .fillColor("#24364b")
            .text("IGLESIA EL ANCLA", { characterSpacing: 1.5 });

        // Línea decorativa en dorado.
        pdf.moveDown(0.6)
            .strokeColor("#c6a15b")
            .lineWidth(1.2)
            .moveTo(58, pdf.y)
            .lineTo(537, pdf.y)
            .stroke();

        // Nombre de la canción, con salto automático de líneas.
        pdf.moveDown(1.2)
            .font("Times-Bold")
            .fontSize(23)
            .fillColor("#24364b")
            .text(title, { lineGap: 5 });

        // Mostramos autor y categoría sin ocupar otra tabla.
        pdf.moveDown(0.4)
            .font("Helvetica")
            .fontSize(10)
            .fillColor("#64748b")
            .text(author || "Autor no indicado")
            .text(`Categoría: ${category}`);

        // Separación entre encabezado y letra.
        pdf.moveDown(1.5)
            .font("Times-Roman")
            .fontSize(13)
            .fillColor("#24364b");

        // Preservamos estrofas y saltos de línea escritos por el admin.
        pdf.text(lyrics, { lineGap: 6, paragraphGap: 4, align: "left" });

        // Terminamos la escritura del documento.
        pdf.end();
    });
}
