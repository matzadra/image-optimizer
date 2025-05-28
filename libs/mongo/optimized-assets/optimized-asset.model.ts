import pkg from "mongoose";
const { model, models } = pkg;
import { OptimizedAssetSchema } from "./optimized-asset.schema.js";
import type { OptimizedAssetEntity } from "./optimized-asset.entity.js";
import type { HydratedDocument } from "mongoose";

export type OptimizedAssetDocument = HydratedDocument<OptimizedAssetEntity>;

export const OptimizedAssetModel =
  models.OptimizedAsset ||
  model<OptimizedAssetEntity>("OptimizedAsset", OptimizedAssetSchema);
