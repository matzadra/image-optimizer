import { FastifyRequest, FastifyReply } from "fastify";
import { processUpload, getTaskStatus } from "./service.js";
import { withContext, logger } from "@shared/loggers/logger.js";
import type { UploadResponse, ErrorResponse } from "../../types/response.js";

export async function uploadHandler(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<FastifyReply> {
  const data = await request.file();

  if (!data) {
    const error: ErrorResponse = { error: "No file uploaded" };
    return reply.status(400).send(error);
  }

  if (!data.mimetype.startsWith("image/")) {
    const error: ErrorResponse = { error: "Unsupported file type" };
    return reply.status(415).send(error);
  }

  try {
    const taskId = await processUpload(data);
    const log = withContext("API", { taskId });

    log.info("[UPLOAD] Task registered and queued successfully");

    const response: UploadResponse = { taskId, status: "pending" };
    return reply.status(202).send(response);
  } catch (err) {
    const log = withContext("API", {});
    log.error("[UPLOAD] Failed to process file", {
      error: (err as Error).message,
    });

    const error: ErrorResponse = { error: "Internal server error" };
    return reply.status(500).send(error);
  }
}

export async function statusHandler(
  request: FastifyRequest<{ Params: { taskId: string } }>,
  reply: FastifyReply
): Promise<FastifyReply> {
  const { taskId } = request.params;

  if (!/^[a-f0-9\-]{36}$/.test(taskId)) {
    const error: ErrorResponse = { error: "Invalid taskId format" };
    return reply.status(400).send(error);
  }

  const log = withContext("API", { taskId });

  try {
    const result = await getTaskStatus(taskId);

    if (!result) {
      const error: ErrorResponse = { error: "Task not found" };
      return reply.status(404).send(error);
    }

    return reply.send(result);
  } catch (err) {
    log.error("[STATUS] Failed to retrieve task", {
      error: (err as Error).message,
    });

    const error: ErrorResponse = { error: "Internal server error" };
    return reply.status(500).send(error);
  }
}
