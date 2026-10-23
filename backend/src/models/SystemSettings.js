import mongoose from "mongoose";

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
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true, collection: "system_settings" }
);

export default mongoose.model("SystemSettings", systemSettingsSchema);
