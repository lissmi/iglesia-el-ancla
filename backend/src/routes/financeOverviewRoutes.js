// =========================================================
// RESUMEN FINANCIERO DE SOLO LECTURA - IGLESIA EL ANCLA
// No expone movimientos individuales, donantes ni comprobantes.
// =========================================================

import { Router } from "express";
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";

import Income from "../models/Income.js";
import Expense from "../models/Expense.js";
import authenticateUser from "../middleware/authenticateUser.js";
import authorizeRoles from "../middleware/authorizeRoles.js";

const router = Router();

// La misma consulta consolidada funciona para miembros y administradores.
router.use(authenticateUser, authorizeRoles("member", "admin", "super_admin"));

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const SHORT_MONTHS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];
const INCOME_NAMES = {
  tithes: "Diezmos", offerings: "Ofrendas", donations: "Donaciones",
  activities: "Actividades", other: "Otros ingresos",
};
const MONEY = new Intl.NumberFormat("es-CL", {
  style: "currency", currency: "CLP", maximumFractionDigits: 0,
});

// Obtenemos el día civil en Chile, incluso si el servidor está en otro huso horario.
function chileToday() {
  const pieces = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Santiago", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const find = (type) => pieces.find((piece) => piece.type === type)?.value;
  return `${find("year")}-${find("month")}-${find("day")}`;
}

// Nunca interpolamos valores arbitrarios del navegador en consultas MongoDB.
function parseFilters(query) {
  const current = chileToday();
  const yearText = String(query.year ?? current.slice(0, 4));
  const period = String(query.period ?? "year");
  const monthText = String(query.month ?? Number(current.slice(5, 7)));
  if (!/^\d{4}$/.test(yearText) || Number(yearText) < 2000 || Number(yearText) > 2100) {
    const error = new Error("Selecciona un año válido");
    error.status = 400;
    throw error;
  }
  if (period !== "year" && period !== "month") {
    const error = new Error("Selecciona un período válido");
    error.status = 400;
    throw error;
  }
  if (!/^(?:[1-9]|1[0-2])$/.test(monthText)) {
    const error = new Error("Selecciona un mes válido");
    error.status = 400;
    throw error;
  }
  const year = Number(yearText);
  const month = Number(monthText);
  const start = period === "month"
    ? `${year}-${String(month).padStart(2, "0")}-01`
    : `${year}-01-01`;
  const end = period === "month"
    ? `${year}-${String(month).padStart(2, "0")}-31`
    : `${year}-12-31`;
  return { year, month, period, start, end, today: current };
}

// Los años se obtienen como grupos de MongoDB: nunca descargamos documentos
// individuales para encontrar las opciones del selector.
async function getAvailableYears(selectedYear, currentYear) {
  const yearPipeline = [
    { $match: { deletedAt: null } },
    { $group: { _id: { $substrBytes: ["$date", 0, 4] } } },
  ];
  const [fromIncomes, fromExpenses] = await Promise.all([
    Income.aggregate(yearPipeline),
    Expense.aggregate(yearPipeline),
  ]);
  const all = new Set([selectedYear, currentYear]);
  [...fromIncomes, ...fromExpenses].forEach(({ _id }) => {
    if (/^\d{4}$/.test(String(_id)) && Number(_id) >= 2000 && Number(_id) <= 2100) {
      all.add(Number(_id));
    }
  });
  return [...all].sort((a, b) => b - a);
}

// Un único cálculo alimenta la pantalla, el PDF y el Excel.
// Se agrupa en MongoDB para no trasladar información personal a la PWA.
async function buildSummary(filters) {
  const { year, month, period, start, end, today } = filters;
  const incomeMatch = {
    deletedAt: null,
    status: "received",
    date: { $gte: start, $lte: end < today ? end : today },
  };
  const expenseMatch = {
    deletedAt: null,
    status: { $in: ["Pagado", "Pendiente"] },
    date: { $gte: start, $lte: end },
  };

  const incomePipeline = [
    { $match: incomeMatch },
    { $group: {
      _id: { month: { $substrBytes: ["$date", 5, 2] }, category: "$category" },
      amount: { $sum: "$amount" },
    } },
  ];
  const expensePipeline = [
    { $match: expenseMatch },
    { $group: {
      _id: { month: { $substrBytes: ["$date", 5, 2] }, category: "$category" },
      paid: { $sum: { $cond: [
        { $and: [{ $eq: ["$status", "Pagado"] }, { $lte: ["$date", today] }] },
        "$amount", 0,
      ] } },
      pending: { $sum: { $cond: [{ $eq: ["$status", "Pendiente"] }, "$amount", 0] } },
    } },
  ];

  const [incomeGroups, expenseGroups, availableYears] = await Promise.all([
    Income.aggregate(incomePipeline),
    Expense.aggregate(expensePipeline),
    getAvailableYears(year, Number(today.slice(0, 4))),
  ]);

  // Inicializamos el año completo o el mes consultado con importes cero.
  const monthNumbers = period === "year" ? Array.from({ length: 12 }, (_, i) => i + 1) : [month];
  const monthlyData = monthNumbers.map((number) => ({
    month: SHORT_MONTHS[number - 1], monthNumber: number,
    income: 0, expenses: 0, pending: 0,
  }));
  const monthlyByNumber = new Map(monthlyData.map((row) => [row.monthNumber, row]));
  const incomeByCategory = new Map();
  const expenseByCategory = new Map();

  for (const row of incomeGroups) {
    const number = Number(row._id.month);
    const amount = Number(row.amount);
    if (!Number.isFinite(amount)) continue;
    const monthRow = monthlyByNumber.get(number);
    if (monthRow) monthRow.income += amount;
    const category = String(row._id.category);
    incomeByCategory.set(category, (incomeByCategory.get(category) || 0) + amount);
  }
  for (const row of expenseGroups) {
    const number = Number(row._id.month);
    const paid = Number(row.paid);
    const pending = Number(row.pending);
    if (!Number.isFinite(paid) || !Number.isFinite(pending)) continue;
    const monthRow = monthlyByNumber.get(number);
    if (monthRow) {
      monthRow.expenses += paid;
      monthRow.pending += pending;
    }
    const category = String(row._id.category);
    if (paid > 0) expenseByCategory.set(category, (expenseByCategory.get(category) || 0) + paid);
  }

  const income = monthlyData.reduce((sum, row) => sum + row.income, 0);
  const expenses = monthlyData.reduce((sum, row) => sum + row.expenses, 0);
  const pending = monthlyData.reduce((sum, row) => sum + row.pending, 0);
  const balance = income - expenses;
  const distribution = (map, names = null) => [...map.entries()]
    .filter(([, value]) => value > 0)
    .map(([key, value]) => ({ name: names?.[key] || key, value }))
    .sort((a, b) => b.value - a.value);

  return {
    year, period, month,
    periodLabel: period === "month" ? `${MONTHS[month - 1]} de ${year}` : `Año ${year}`,
    income, expenses, balance, pending,
    projectedBalance: balance - pending,
    incomeDistribution: distribution(incomeByCategory, INCOME_NAMES),
    expenseDistribution: distribution(expenseByCategory),
    monthlyData,
    availableYears,
    hasMovements: income > 0 || expenses > 0 || pending > 0,
    generatedAt: new Date().toISOString(),
  };
}

// Autenticación de solo lectura: sin comprobar ni retornar datos personales.
router.get("/", async (req, res, next) => {
  try {
    const data = await buildSummary(parseFilters(req.query));
    res.set("Cache-Control", "private, no-store");
    return res.status(200).json({ success: true, data });
  } catch (error) { return next(error); }
});

// Encabezado común de descarga: no permitir almacenamiento compartido ni sniffing.
function downloadHeaders(res, filename, mime) {
  res.set("Cache-Control", "private, no-store");
  res.set("X-Content-Type-Options", "nosniff");
  res.set("Content-Disposition", `attachment; filename="${filename}"`);
  res.type(mime);
}
function fileName(data, extension) {
  const stamp = data.period === "month" ? `-${String(data.month).padStart(2, "0")}` : "-anual";
  return `el-ancla-resumen-financiero-${data.year}${stamp}.${extension}`;
}

// PDF: imprimimos solo las cifras agregadas, nunca las operaciones individuales.
function drawPdf(document, data) {
  const left = 48;
  const right = 547;
  let y = 45;
  const ensure = (height) => {
    if (y + height > 775) { document.addPage(); y = 48; }
  };
  const heading = (text) => {
    ensure(35);
    document.font("Helvetica-Bold").fontSize(12).fillColor("#17384c").text(text, left, y);
    y += 25;
  };
  const row = (label, value, emphasize = false) => {
    ensure(23);
    document.font(emphasize ? "Helvetica-Bold" : "Helvetica").fontSize(10)
      .fillColor("#263f4f").text(label, left + 9, y, { width: 310, lineBreak: false });
    document.font(emphasize ? "Helvetica-Bold" : "Helvetica").text(value, 370, y, {
      width: 166, align: "right", lineBreak: false,
    });
    y += 21;
    document.moveTo(left, y - 4).lineTo(right, y - 4).strokeColor("#e5edf1").lineWidth(0.5).stroke();
  };

  document.rect(0, 0, 595, 8).fill("#2c8199");
  document.fillColor("#17384c").font("Helvetica-Bold").fontSize(18)
    .text("Iglesia El Ancla", left, y);
  y += 27;
  document.fontSize(14).text("Resumen financiero", left, y);
  y += 24;
  document.font("Helvetica").fontSize(10).fillColor("#587383")
    .text(`Período: ${data.periodLabel}`, left, y);
  y += 19;
  document.text(`Generado: ${new Intl.DateTimeFormat("es-CL", { dateStyle: "long", timeZone: "America/Santiago" }).format(new Date(data.generatedAt))}`, left, y);
  y += 32;

  heading("Panorama general");
  row("Ingresos recibidos", MONEY.format(data.income));
  row("Gastos pagados", MONEY.format(data.expenses));
  row("Balance del período", MONEY.format(data.balance), true);
  row("Pagos pendientes", MONEY.format(data.pending));
  row("Balance considerando pagos pendientes", MONEY.format(data.projectedBalance), true);
  y += 22;

  heading("Ingresos y gastos por mes");
  for (const entry of data.monthlyData) {
    // Cada mes imprime dos líneas para facilitar la lectura.
    ensure(38);
    row(`${entry.month} · Ingresos`, MONEY.format(entry.income));
    row(`${entry.month} · Gastos`, MONEY.format(entry.expenses));
  }
  y += 17;

  heading("Origen de los ingresos");
  if (data.incomeDistribution.length === 0) row("Sin ingresos registrados", "—");
  for (const entry of data.incomeDistribution) row(entry.name, MONEY.format(entry.value));
  y += 17;
  heading("Destino de los gastos");
  if (data.expenseDistribution.length === 0) row("Sin gastos pagados", "—");
  for (const entry of data.expenseDistribution) row(entry.name, MONEY.format(entry.value));
  y += 23;
  ensure(68);
  document.font("Helvetica").fontSize(9).fillColor("#587383")
    .text("Este reporte presenta cifras generales de los movimientos registrados en la iglesia. " +
      "El balance es la diferencia entre ingresos recibidos y gastos pagados del período; " +
      "no equivale necesariamente al saldo disponible en cuentas o efectivo.", left, y, { width: 490 });
}

router.get("/export/pdf", async (req, res, next) => {
  try {
    const data = await buildSummary(parseFilters(req.query));
    downloadHeaders(res, fileName(data, "pdf"), "application/pdf");
    const document = new PDFDocument({ size: "A4", margin: 48, compress: true });
    document.on("error", (error) => {
      console.error("Error al generar PDF financiero:", error.message);
      if (!res.headersSent) next(error);
      else res.destroy(error);
    });
    document.pipe(res);
    drawPdf(document, data);
    document.end();
  } catch (error) { if (!res.headersSent) return next(error); return res.destroy(error); }
});

// Excel: los valores son números reales, no texto con formato de moneda.
function styleHeader(cells) {
  cells.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF17384C" } };
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.alignment = { vertical: "middle" };
  });
  cells.height = 24;
}
async function makeWorkbook(data) {
  const book = new ExcelJS.Workbook();
  book.creator = "Iglesia El Ancla";
  book.title = `Resumen financiero - ${data.periodLabel}`;
  book.created = new Date(data.generatedAt);
  const currencyFormat = '"$" #,##0;[Red]-"$" #,##0';
  const styleNumber = (sheet, colIndex, startRow) => {
    for (let row = startRow; row <= sheet.rowCount; row++) {
      sheet.getCell(row, colIndex).numFmt = currencyFormat;
    }
  };

  const summary = book.addWorksheet("Resumen", { views: [{ state: "frozen", ySplit: 4 }] });
  summary.columns = [{ width: 37 }, { width: 23 }];
  summary.mergeCells("A1:B1");
  summary.getCell("A1").value = "IGLESIA EL ANCLA · RESUMEN FINANCIERO";
  summary.getCell("A1").font = { bold: true, size: 15, color: { argb: "FF17384C" } };
  summary.getCell("A2").value = "Período";
  summary.getCell("B2").value = data.periodLabel;
  summary.getCell("A3").value = "Fecha de emisión";
  summary.getCell("B3").value = new Date(data.generatedAt);
  summary.getCell("B3").numFmt = "dd/mm/yyyy hh:mm";
  summary.addRow([]);
  summary.addRow(["Indicador", "Monto (CLP)"]);
  styleHeader(summary.getRow(5));
  [
    ["Ingresos recibidos", data.income],
    ["Gastos pagados", data.expenses],
    ["Balance del período", data.balance],
    ["Pagos pendientes", data.pending],
    ["Balance considerando pagos pendientes", data.projectedBalance],
  ].forEach((item) => summary.addRow(item));
  styleNumber(summary, 2, 6);
  summary.getCell("A12").value = "Los valores son totales generales; no incluyen información personal ni comprobantes.";
  summary.mergeCells("A12:B12");
  summary.getCell("A13").value = "El balance no representa necesariamente el saldo bancario o en efectivo.";
  summary.mergeCells("A13:B13");

  const monthly = book.addWorksheet("Por mes", { views: [{ state: "frozen", ySplit: 3 }] });
  monthly.columns = [{ width: 19 }, { width: 20 }, { width: 20 }, { width: 20 }];
  monthly.mergeCells("A1:D1");
  monthly.getCell("A1").value = `Movimientos por mes · ${data.periodLabel}`;
  monthly.getCell("A1").font = { bold: true, size: 14, color: { argb: "FF17384C" } };
  monthly.getRow(3).values = ["Mes", "Ingresos", "Gastos pagados", "Pagos pendientes"];
  styleHeader(monthly.getRow(3));
  data.monthlyData.forEach((item) => monthly.addRow([
    MONTHS[item.monthNumber - 1], item.income, item.expenses, item.pending,
  ]));
  for (let column = 2; column <= 4; column++) styleNumber(monthly, column, 4);
  monthly.autoFilter = { from: "A3", to: "D3" };

  const categories = book.addWorksheet("Por categoría", { views: [{ state: "frozen", ySplit: 3 }] });
  categories.columns = [{ width: 21 }, { width: 38 }, { width: 22 }];
  categories.mergeCells("A1:C1");
  categories.getCell("A1").value = `Origen y destino de los recursos · ${data.periodLabel}`;
  categories.getCell("A1").font = { bold: true, size: 14, color: { argb: "FF17384C" } };
  categories.getRow(3).values = ["Tipo", "Categoría", "Monto (CLP)"];
  styleHeader(categories.getRow(3));
  data.incomeDistribution.forEach(({ name, value }) => categories.addRow(["Ingreso", name, value]));
  data.expenseDistribution.forEach(({ name, value }) => categories.addRow(["Gasto", name, value]));
  styleNumber(categories, 3, 4);
  categories.autoFilter = { from: "A3", to: "C3" };
  return book;
}

router.get("/export/excel", async (req, res, next) => {
  try {
    const data = await buildSummary(parseFilters(req.query));
    const workbook = await makeWorkbook(data);
    const buffer = await workbook.xlsx.writeBuffer();
    downloadHeaders(res, fileName(data, "xlsx"),
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    return res.send(Buffer.from(buffer));
  } catch (error) { return next(error); }
});

export default router;
