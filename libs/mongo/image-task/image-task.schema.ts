import pkg from "mongoose";
import { OriginalMetadataSchema } from "./schemas/original-metadata.schema.js";
import { VersionInfoSchema } from "./schemas/version-info.schema.js";

const { Schema } = pkg;

export const ImageTaskSchema = new Schema(
  {
    displayId: { type: String, required: true },
    taskId: { type: String, required: true, unique: true },
    originalFilename: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "done", "error"],
      required: true,
    },
    originalMetadata: OriginalMetadataSchema,
    processedAt: { type: Date },
    errorMessage: { type: String },
    versions: [VersionInfoSchema],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
