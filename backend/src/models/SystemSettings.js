import mongoose from "mongoose";

// Los textos de la página Eventos viven en la configuración existente.
// Cada versión es pequeña: títulos, descripciones, icono y un ID destacado.
const eventPageContentSchema = new mongoose.Schema(
  {
    heroEyebrow: { type: String, trim: true, maxlength: 90 },
    heroTitle: { type: String, trim: true, maxlength: 100 },
    heroHighlight: { type: String, trim: true, maxlength: 100 },
    heroDescription: { type: String, trim: true, maxlength: 600 },
    heroIcon: { type: String, enum: ["original", "calendar", "church", "users", "heart"] },
    featuredEyebrow: { type: String, trim: true, maxlength: 90 },
    featuredTitle: { type: String, trim: true, maxlength: 120 },
    listEyebrow: { type: String, trim: true, maxlength: 90 },
    listTitle: { type: String, trim: true, maxlength: 120 },
    listDescription: { type: String, trim: true, maxlength: 600 },
    invitationEyebrow: { type: String, trim: true, maxlength: 90 },
    invitationTitle: { type: String, trim: true, maxlength: 140 },
    invitationDescription: { type: String, trim: true, maxlength: 600 },
    invitationButtonText: { type: String, trim: true, maxlength: 60 },
    featuredEventId: { type: String, default: "" },
  },
  { _id: false, strict: true }
);

// Configuración única de la organización, independiente de sus sucursales.
const systemSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      enum: ["general"],
      default: "general",
    },
    institutionalName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 150,
      default: "Iglesia El Ancla Comunidad Cristiana",
    },
    publicName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
      default: "Iglesia El Ancla",
    },
    description: {
      type: String,
      trim: true,
      maxlength: 600,
      default: "",
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 150,
      default: "",
    },
    contactPhone: {
      type: String,
      trim: true,
      maxlength: 30,
      default: "",
    },
    // Dos versiones: borrador privado y contenido vigente para visitantes.
    eventsPage: {
      draft: { type: eventPageContentSchema, default: undefined },
      published: { type: eventPageContentSchema, default: undefined },
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true, collection: "system_settings" }
);

export default mongoose.model("SystemSettings", systemSettingsSchema);
