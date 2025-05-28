import pkg from "mongoose";
const { Schema } = pkg;

export const OptimizedAssetSchema = new Schema(
  {
    clientId: { type: String, required: true },
    taskId: { type: String, required: true },
    type: {
      type: String,
      enum: ["exclusive", "selected"],
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
  },
  {
    collection: "optimized_assets",
  }
);

OptimizedAssetSchema.index({ clientId: 1, taskId: 1 }, { unique: true });
