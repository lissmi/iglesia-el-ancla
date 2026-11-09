// Modelo único de Martín: una colección con documentos de configuración, cuotas, seguridad y actividad.
import mongoose from "mongoose";

const { Schema } = mongoose;
// Los valores iniciales de configuración los establece martinConfigurationService.js.
// No usamos defaults dependientes de `this`: Mongoose puede evaluarlos sin documento en un upsert.

const martinSchema = new Schema({
  // Discriminador lógico para conservar cada registro pequeño e independiente.
  kind: { type: String, required: true, enum: ["configuration", "usage", "security", "event", "knowledge", "daily_stats"] },
  // Identificador único para configuración y para registros de uso o seguridad.
  key: { type: String, required: true, unique: true, immutable: true },
  // La configuración solo existe en el documento kind=configuration.
  enabled: { type: Boolean, default: undefined },
  audiences: {
    visitors: { type: Boolean, default: undefined },
    members: { type: Boolean, default: undefined },
  },
  capabilities: {
    churchInformation: { type: Boolean, default: undefined },
    resourceSearch: { type: Boolean, default: undefined },
    biblicalGuidance: { type: Boolean, default: undefined },
    navigationHelp: { type: Boolean, default: undefined },
  },
  welcomeMessage: { type: String, default: undefined, maxlength: 500 },
  outOfScopeMessage: { type: String, default: undefined, maxlength: 400 },
  memberDailyLimit: { type: Number, default: undefined, min: 1, max: 100 },
  adminDailyLimit: { type: Number, default: undefined, min: 1, max: 100 },
  maxMessageLength: { type: Number, default: undefined, min: 100, max: 700 },
  abuseStrikeLimit: { type: Number, default: undefined, min: 2, max: 10 },
  abuseBlockMinutes: { type: Number, default: undefined, min: 5, max: 1440 },
  // Respuestas revisadas por administración. Solo las publicadas se ofrecen a Martín.
  title: { type: String, trim: true, maxlength: 120 },
  knowledgeCategory: { type: String, enum: ["institutional", "resources", "biblical", "faq"] },
  knowledgeAudience: { type: String, enum: ["public", "members"] },
  knowledgeStatus: { type: String, enum: ["draft", "published"] },
  question: { type: String, trim: true, maxlength: 250 },
  answer: { type: String, trim: true, maxlength: 2500 },
  source: { type: String, trim: true, maxlength: 250 },
  // Datos mínimos de cuota y suspensión, vinculados a un usuario.
  user: { type: Schema.Types.ObjectId, ref: "User" },
  day: { type: String, match: /^\d{4}-\d{2}-\d{2}$/ },
  count: { type: Number, min: 0 },
  strikes: { type: Number, min: 0 },
  windowStartedAt: Date,
  blockedUntil: Date,
  // Estadísticas agrupadas: un solo documento por día, sin mensajes ni identidades.
  requestCount: { type: Number, min: 0 },
  blockedCount: { type: Number, min: 0 },
  errorCount: { type: Number, min: 0 },
  // Campos legados: no se crearán más registros individuales de actividad.
  // Actividad operativa sin almacenar conversaciones ni IP.
  eventType: { type: String, enum: ["request", "blocked", "error"] },
  category: { type: String, enum: ["chat", "quota", "access", "topic", "security", "provider"] },
  summary: { type: String, maxlength: 120 },
  // El TTL elimina registros temporales; configuración no tiene expiresAt.
  expiresAt: Date,
}, { timestamps: true, versionKey: false, collection: "martins" });

// Indexación por tipo para métricas sin revisar toda la colección.
martinSchema.index({ kind: 1, eventType: 1, createdAt: -1 });
martinSchema.index({ kind: 1, knowledgeStatus: 1, updatedAt: -1 });
// La eliminación TTL es eventual; los servicios también validan fechas.
martinSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.Martin || mongoose.model("Martin", martinSchema);
