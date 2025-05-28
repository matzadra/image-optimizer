import { getWhitelistedTaskIds } from "./repository.js";
import {
  countOptimizedAssets,
  findOptimizedAssets,
} from "@modules/image/repository.js";
import { withContext } from "@shared/loggers/logger.js";
import type { ImageTaskEntity } from "@libs/mongo/image-task/image-task.entity";

type PaginationParams = {
  limit: number;
  offset: number;
};

export async function getClientAssets(
  clientId: string,
  pagination: PaginationParams
) {
  const log = withContext("ClientAssetsService", { clientId });
  const { limit, offset } = pagination;

  log.info("Searching whitelisted taskIds");
  const taskIds = await getWhitelistedTaskIds(clientId);
  log.info(`Found ${taskIds.length} whitelisted taskIds`);

  if (taskIds.length === 0) {
    return { total: 0, data: [] as ImageTaskEntity[] };
  }

  log.info("Searching for completed ImageTasks with pagination");

  const total = await countOptimizedAssets(taskIds);
  const data = await findOptimizedAssets(taskIds, { limit, offset });

  log.info(`Returning ${data.length}/${total} assets`);
  return { total, data };
}
