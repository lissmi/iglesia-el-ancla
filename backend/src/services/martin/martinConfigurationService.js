// Servicio de lectura y actualización de la configuración, sin secretos.
import Martin from "../../models/Martin.js";

// Valores de inicio de un solo documento de configuración.
// Los registros de cuota, actividad y seguridad no reciben estos campos.
const DEFAULT_CONFIGURATION = {
  kind: "configuration",
  key: "configuration:main",
  enabled: false,
  audiences: { visitors: true, members: true },
  capabilities: {
    churchInformation: true,
    resourceSearch: true,
    biblicalGuidance: true,
    navigationHelp: true,
  },
  welcomeMessage: "¡Hola! Soy Martín ⚓. Puedo ayudarte a conocer Iglesia El Ancla y encontrar recursos bíblicos.",
  outOfScopeMessage: "Puedo acompañarte con preguntas sobre la Biblia y nuestra iglesia. ⚓",
  memberDailyLimit: 10,
  adminDailyLimit: 20,
  maxMessageLength: 700,
  abuseStrikeLimit: 3,
  abuseBlockMinutes: 30,
};

export const getMartinConfiguration = async () => {
  // Inserción segura y única: MongoDB aplica el índice de `key`.
  // No dependemos de los defaults de Mongoose al realizar el upsert.
  return Martin.findOneAndUpdate(
    { kind: "configuration", key: "configuration:main" },
    { $setOnInsert: DEFAULT_CONFIGURATION },
    { upsert: true, new: true, setDefaultsOnInsert: false, runValidators: true }
  ).lean();
};

const ensureBoolean = (value) => typeof value === "boolean";
const ensureString = (value, max) => typeof value === "string" && value.trim().length > 0 && value.length <= max;
const ensureInt = (value, min, max) => Number.isInteger(value) && value >= min && value <= max;

export function validateMartinConfiguration(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("La configuración enviada no es válida.");
  const flattened = {};
  const allowed = ["enabled", "audiences", "capabilities", "welcomeMessage", "outOfScopeMessage", "memberDailyLimit", "adminDailyLimit", "maxMessageLength", "abuseStrikeLimit", "abuseBlockMinutes"];
  if (Object.keys(body).some((key) => !allowed.includes(key))) throw new Error("La configuración contiene campos no permitidos.");
  if ("enabled" in body) { if (!ensureBoolean(body.enabled)) throw new Error("La disponibilidad debe ser válida."); flattened.enabled = body.enabled; }
  for (const [group, names] of Object.entries({ audiences: ["visitors", "members"], capabilities: ["churchInformation", "resourceSearch", "biblicalGuidance", "navigationHelp"] })) {
    if (!(group in body)) continue;
    const obj = body[group];
    if (!obj || typeof obj !== "object" || Array.isArray(obj) || Object.keys(obj).some(key => !names.includes(key))) throw new Error("Las opciones seleccionadas no son válidas.");
    for (const [key, value] of Object.entries(obj)) { if (!ensureBoolean(value)) throw new Error("Las opciones deben activarse o desactivarse."); flattened[`${group}.${key}`] = value; }
  }
  for (const [key, max] of Object.entries({ welcomeMessage: 500, outOfScopeMessage: 400 })) {
    if (key in body) { if (!ensureString(body[key], max)) throw new Error("Escribe un mensaje válido para Martín."); flattened[key] = body[key].trim(); }
  }
  for (const [key, [min, max]] of Object.entries({ memberDailyLimit: [1,100], adminDailyLimit: [1,100], maxMessageLength: [100,700], abuseStrikeLimit: [2,10], abuseBlockMinutes: [5,1440] })) {
    if (key in body) { if (!ensureInt(body[key], min, max)) throw new Error(`El valor ${key} está fuera de rango.`); flattened[key] = body[key]; }
  }
  if (Object.keys(flattened).length === 0) throw new Error("Selecciona al menos una configuración para guardar.");
  return flattened;
}

export async function updateMartinConfiguration(body) {
  const patch = validateMartinConfiguration(body);
  // Garantizamos primero que la configuración esté creada con todos sus campos.
  // Así evitamos conflictos entre $set (subcampos) y $setOnInsert (objetos completos).
  await getMartinConfiguration();
  return Martin.findOneAndUpdate(
    { kind: "configuration", key: "configuration:main" },
    { $set: patch },
    { new: true, runValidators: true, upsert: false }
  ).lean();
}

export function publicMartinConfiguration(config) {
  // Nunca enviamos claves privadas ni nombres de modelos al navegador.
  const { enabled, audiences, capabilities, welcomeMessage, outOfScopeMessage, memberDailyLimit, adminDailyLimit, maxMessageLength, abuseStrikeLimit, abuseBlockMinutes } = config;
  return { enabled, audiences, capabilities, welcomeMessage, outOfScopeMessage, memberDailyLimit, adminDailyLimit, maxMessageLength, abuseStrikeLimit, abuseBlockMinutes };
}
