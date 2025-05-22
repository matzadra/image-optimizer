import { getChannel } from "./client.js";
import type { TaskPayload } from "@libs/types/task.js";
import { logger } from "@shared/loggers/logger.js";

const QUEUE_NAME = "image-processing";

export async function publishTaskToQueue(payload: TaskPayload): Promise<void> {
  try {
    const channel = await getChannel();
    const buffer = Buffer.from(JSON.stringify(payload));

    const success = channel.sendToQueue(QUEUE_NAME, buffer, {
      persistent: true,
    });

    if (!success) {
      logger.warn("[QUEUE] Task dispatch not confirmed by broker");
    } else {
      logger.info("[QUEUE] Task dispatched", {
        taskId: payload.taskId,
        displayId: payload.displayId,
      });
    }
  } catch (err) {
    logger.error("[QUEUE] Failed to dispatch task", {
      error: err instanceof Error ? err.message : err,
      taskId: payload.taskId,
    });
    throw err;
  }
}
