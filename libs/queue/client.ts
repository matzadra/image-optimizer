import * as amqplib from "amqplib";
import { Channel } from "amqplib";
import { logger } from "@shared/loggers/logger.js";

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";
const QUEUE_NAME = "image-processing";

let channel: Channel | null = null;

export async function getChannel(): Promise<Channel> {
  if (channel) return channel;

  try {
    const connection = await amqplib.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    logger.info("[RabbitMQ] - Channel connected and queue asserted");

    return channel;
  } catch (err) {
    logger.error("[RabbitMQ] - Failed to connect:", err);
    throw err;
  }
}
