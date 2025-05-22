import { randomUUID } from "crypto";
import * as fs from "fs";
import * as path from "path";
import { pipeline } from "stream/promises";
import { mkdir, stat } from "fs/promises";
import { createTask, findTaskById } from "./repository.js";
import { publishTaskToQueue } from "@libs/queue/publisher.js";
import { generateReadableId } from "@shared/generateReadableId";
import { createTaskLogger } from "@shared/loggers/taskLogger.js";
import type { TaskStatusResponse } from "../../types/task.js";
import type { MultipartFile } from "@fastify/multipart";

const uploadDir = process.env.UPLOAD_DIR || path.resolve("uploads");

export async function processUpload(file: MultipartFile): Promise<string> {
  if (!file || typeof file.file !== "object") {
    throw new Error("Invalid or missing file.");
  }

  const taskId = randomUUID();
  const displayId = generateReadableId();
  const log = createTaskLogger("API", { taskId, displayId });

  log.info("[UPLOAD] Upload received", { filename: file.filename });

  const savedPath = await saveTempImage(file, taskId, displayId);
  log.info("[UPLOAD] Temporary image saved", { path: savedPath });

  try {
    await createTask({
      taskId,
      displayId,
      originalFilename: file.filename,
      status: "pending",
    });
    log.info("[DB] Task registered in database");
  } catch (err) {
    log.error("[DB] Failed to register task", {
      error: (err as Error).message,
    });
    throw new Error("Failed to register task in database.");
  }

  try {
    await publishTaskToQueue({
      taskId,
      displayId,
      originalFilename: file.filename,
      filePath: savedPath,
    });
    log.info("[QUEUE] Task dispatched for processing");
  } catch (err) {
    log.error("[QUEUE] Failed to enqueue task", {
      error: (err as Error).message,
    });
    throw new Error("Failed to enqueue task.");
  }

  return taskId;
}

export async function getTaskStatus(
  taskId: string
): Promise<TaskStatusResponse | null> {
  const task = await findTaskById(taskId);
  if (!task) return null;

  return {
    taskId: task.taskId,
    status: task.status,
    versions: task.versions ?? [],
    errorMessage: task.errorMessage || null,
  };
}

export async function saveTempImage(
  data: MultipartFile,
  taskId: string,
  displayId: string
): Promise<string> {
  const log = createTaskLogger("API", { taskId, displayId });

  await mkdir(uploadDir, { recursive: true });

  const ext = path.extname(data.filename) || ".jpg";
  const filePath = path.join(uploadDir, `${taskId}${ext}`);
  const writeStream = fs.createWriteStream(filePath);

  try {
    await pipeline(data.file, writeStream);
  } catch (err) {
    log.error("[UPLOAD] Failed to save temporary image", {
      error: (err as Error).message,
    });
    throw new Error("Error saving temporary image.");
  }

  const { size } = await stat(filePath);
  if (size === 0) {
    log.warn("[UPLOAD] Invalid upload (0 bytes)");
    throw new Error("Invalid upload: image saved with 0 bytes.");
  }

  return filePath;
}
