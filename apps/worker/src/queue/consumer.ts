import amqplib from "amqplib";
import { logger } from "@shared/loggers/logger.js";
import { handleImageProcessingTask } from "../modules/image/service.js";
import type { TaskPayload } from "@libs/types/task.js";

function isRetryableError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;

  const retryablePhrases = [
    "ECONNREFUSED",
    "ENOTFOUND",
    "EAI_AGAIN",
    "timeout",
    "MongoNetworkError",
    "Failed to connect",
  ];

  return retryablePhrases.some((phrase) => err.message.includes(phrase));
}

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";
const QUEUE_NAME = "image-processing";

export async function startConsumer(): Promise<void> {
  try {
    const connection = await amqplib.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, { durable: true });
    logger.info(`[QUEUE] Listening on: ${QUEUE_NAME}`);

    channel.consume(QUEUE_NAME, async (msg) => {
      if (!msg) return;

      let payload: TaskPayload;
      const retries = msg.properties.headers?.["x-retries"] ?? 0;

      try {
        payload = JSON.parse(msg.content.toString());

        if (!payload.displayId) {
          logger.warn("[Worker] - Missing displayId. Discarding...");
          return channel.ack(msg);
        }
      } catch {
        logger.error("[Worker] - Invalid JSON payload");
        return channel.ack(msg);
      }

      try {
        await handleImageProcessingTask(payload);
        channel.ack(msg);
      } catch (err) {
        if (!isRetryableError(err) || retries >= 5) {
          logger.error("[Worker] - Non-retryable or max retries reached", {
            error: err instanceof Error ? err.message : err,
            taskId: payload.taskId,
            retries,
          });
          return channel.nack(msg, false, false);
        }

        logger.warn("[Worker] - Temporary failure. Retrying...", {
          taskId: payload.taskId,
          retries,
        });

        channel.sendToQueue(QUEUE_NAME, msg.content, {
          headers: { "x-retries": retries + 1 },
          persistent: true,
        });

        channel.ack(msg);
      }
    });
  } catch (err) {
    logger.error("[Worker] - RabbitMQ connection failed", {
      error: err instanceof Error ? err.message : err,
    });
    process.exit(1);
  }
}
