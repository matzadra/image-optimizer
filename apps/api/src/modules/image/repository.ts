import { ImageTaskModel } from "@libs/mongo/imageTask.model.js";
import type {
  TaskStatus,
  ImageTaskDocument,
} from "@libs/mongo/imageTask.model.js";

export type CreateTaskInput = {
  taskId: string;
  displayId: string;
  originalFilename: string;
  status: TaskStatus;
};

export async function createTask(
  data: CreateTaskInput
): Promise<ImageTaskDocument> {
  return ImageTaskModel.create(data);
}

export async function findTaskById(
  taskId: string
): Promise<ImageTaskDocument | null> {
  return ImageTaskModel.findOne({ taskId });
}
