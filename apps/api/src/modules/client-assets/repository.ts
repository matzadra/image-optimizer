import { OptimizedAssetModel } from "@libs/mongo/optimized-assets/optimized-asset.model";

export async function getWhitelistedTaskIds(
  clientId: string
): Promise<string[]> {
  const entries = await OptimizedAssetModel.find({ clientId })
    .select("taskId")
    .lean();

  return entries.map((entry) => entry.taskId);
}
