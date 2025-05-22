import { processImage } from "./processor.js";
import { updateTaskStatus } from "./repository.js";
import { createTaskLogger } from "@shared/loggers/taskLogger.js";
import type { TaskPayload } from "@libs/types/task.js";
import { parseError } from "@shared/utils/parseError.js";

export async function handleImageProcessingTask(
  payload: TaskPayload
): Promise<void> {
  const { taskId, filePath, displayId } = payload;
  const log = createTaskLogger("worker:image", { taskId, displayId });

  log.info("[START] Task received");

  await updateTaskStatus(taskId, "processing");
  log.info("[DB] Task status set to 'processing'");

  try {
    log.info("[PROCESS] Optimizing image...");
    const { originalMetadata, versions, processedAt } = await processImage(
      taskId,
      filePath
    );

    const finalData = { originalMetadata, versions, processedAt };

    await updateTaskStatus(taskId, "done", finalData);
    log.info("[DB] Task status set to 'done'");

    log.info("[DONE] Task processing completed");
    return;
  } catch (err) {
    const { message: errorMessage, cause } = parseError(err);

    await updateTaskStatus(taskId, "error", { errorMessage });

    log.error("[FAIL] Task processing failed", {
      error: errorMessage,
      cause,
    });

    throw new Error(errorMessage);
  }
}
