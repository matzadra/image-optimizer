import mongoose, { Schema, Document } from "mongoose";

import type {
  TaskStatus,
  VersionInfo,
  OriginalMetadata,
} from "@libs/types/task.js";

export type ImageTaskDocument = Document & {
  displayId?: string;
  taskId: string;
  originalFilename: string;
  status: TaskStatus;
  originalMetadata?: OriginalMetadata;
  processedAt?: Date;
  errorMessage?: string;
  versions?: VersionInfo[];
  createdAt: Date;
  updatedAt: Date;
};

const ImageTaskSchema = new Schema<ImageTaskDocument>(
  {
    displayId: { type: String, required: true },
    taskId: { type: String, required: true, unique: true },
    originalFilename: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "done", "error"],
      required: true,
    },
    originalMetadata: {
      width: Number,
      height: Number,
      mimetype: String,
      exif: { type: Schema.Types.Mixed },
    },
    processedAt: { type: Date },
    errorMessage: { type: String },
    versions: [
      {
        label: { type: String, required: true },
        path: { type: String, required: true },
        width: { type: Number, required: true },
        height: { type: Number, required: true },
        sizeInBytes: { type: Number, required: true },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const ImageTaskModel = mongoose.model<ImageTaskDocument>(
  "ImageTask",
  ImageTaskSchema
);
