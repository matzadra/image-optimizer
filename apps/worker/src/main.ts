import { connectToMongo } from "@libs/mongo/connection.js";
import { startConsumer } from "./queue/consumer.js";
import { logger } from "@shared/loggers/logger.js";

async function start() {
  try {
    logger.info("[worker] Starting worker...");

    await connectToMongo("Worker");
    logger.info("[worker] Connected to MongoDB");

    await startConsumer();
    logger.info("[worker] Consumer started");
  } catch (err) {
    logger.error("[worker] Fatal error:", err);
    process.exit(1);
  }
}

start();
