// Contenidos autorizados de Martín. Se utiliza el mismo modelo y colección `martins`.
import { randomUUID } from "node:crypto";
import Martin from "../../models/Martin.js";

const CATEGORIES = ["institutional", "resources", "biblical", "faq"];
const AUDIENCES = ["public", "members"];
const STATUSES = ["draft", "published"];

// Solo retornamos campos de conocimiento; nunca exponemos identificadores internos de usuario.
const toPublicEntry = (entry) => ({
  id: String(entry._id), title: entry.title, category: entry.knowledgeCategory,
  audience: entry.knowledgeAudience, status: entry.knowledgeStatus,
  question: entry.question, answer: entry.answer, source: entry.source,
  createdAt: entry.createdAt, updatedAt: entry.updatedAt,
});

// Rechazamos campos inesperados y textos vacíos; no aceptamos HTML ni instrucciones especiales.
export function validateKnowledgeInput(body, partial = false) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("Revisa la información del contenido.");
  }
  const fields = ["title", "category", "audience", "status", "question", "answer", "source"];
  if (Object.keys(body).some((field) => !fields.includes(field))) {
    throw new Error("El contenido incluye datos que no podemos guardar.");
  }
  if (!partial && fields.some((field) => !(field in body))) {
    throw new Error("Completa todos los campos antes de guardar.");
  }
  const cleaned = {};
  for (const [name, max] of Object.entries({ title: 120, question: 250, answer: 2500, source: 250 })) {
    if (!(name in body)) continue;
    if (typeof body[name] !== "string" || !body[name].trim() || body[name].length > max || /[\u0000-\u001F]/.test(body[name])) {
      throw new Error(`Revisa el campo ${name}: debe contener texto válido.`);
    }
    cleaned[name] = body[name].trim();
  }
  for (const [name, choices] of Object.entries({ category: CATEGORIES, audience: AUDIENCES, status: STATUSES })) {
    if (!(name in body)) continue;
    if (typeof body[name] !== "string" || !choices.includes(body[name])) {
      throw new Error(`Selecciona una opción válida para ${name}.`);
    }
    cleaned[name] = body[name];
  }
  if (Object.keys(cleaned).length === 0) throw new Error("No hay cambios para guardar.");
  return cleaned;
}

export async function listKnowledge() {
  const entries = await Martin.find({ kind: "knowledge" }).sort({ updatedAt: -1 }).limit(250).lean();
  return entries.map(toPublicEntry);
}

export async function createKnowledge(body) {
  const data = validateKnowledgeInput(body);
  const entry = await Martin.create({
    kind: "knowledge", key: `knowledge:${randomUUID()}`,
    title: data.title, knowledgeCategory: data.category,
    knowledgeAudience: data.audience, knowledgeStatus: data.status,
    question: data.question, answer: data.answer, source: data.source,
  });
  return toPublicEntry(entry);
}

// La restricción `kind` impide editar accidentalmente configuración o contadores.
export async function updateKnowledge(id, body) {
  const data = validateKnowledgeInput(body, true);
  const patch = {};
  for (const [field, value] of Object.entries(data)) {
    patch[({category: "knowledgeCategory", audience: "knowledgeAudience", status: "knowledgeStatus"})[field] || field] = value;
  }
  const result = await Martin.findOneAndUpdate(
    { _id: id, kind: "knowledge" }, { $set: patch }, { new: true, runValidators: true }
  ).lean();
  return result ? toPublicEntry(result) : null;
}

export async function deleteKnowledge(id) {
  const result = await Martin.deleteOne({ _id: id, kind: "knowledge" });
  return result.deletedCount === 1;
}

// Selección ligera y acotada: se envían a Gemini solamente respuestas aprobadas relevantes.
// No utilizamos textos de miembros, donaciones ni información privada de la base de datos.
const common = new Set(["como", "para", "cuando", "donde", "sobre", "tiene", "puedo", "quiero", "cuales", "iglesia", "martin", "ancla", "hola", "favor", "saber", "informacion"]);
function tokens(text) {
  return [...new Set(String(text).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().match(/[a-z0-9]{4,}/g) || [])]
    .filter((word) => !common.has(word));
}
export async function findRelevantKnowledge(message) {
  const searchWords = tokens(message);
  if (!searchWords.length) return [];
  // Límite de lectura acotado para la versión inicial; índice por estado y tipo.
  const entries = await Martin.find({ kind: "knowledge", knowledgeStatus: "published", knowledgeAudience: { $in: ["public", "members"] } })
    .sort({ updatedAt: -1 }).limit(200).lean();
  return entries.map((entry) => {
    const haystack = tokens(`${entry.title} ${entry.question} ${entry.knowledgeCategory}`);
    const score = searchWords.filter((word) => haystack.includes(word)).length;
    return { entry, score };
  }).filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score).slice(0, 3)
    .map(({ entry }) => ({ question: entry.question, answer: entry.answer, source: entry.source }));
}
