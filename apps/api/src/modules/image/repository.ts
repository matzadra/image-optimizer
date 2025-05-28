import { ImageTaskModel } from "@libs/mongo/image-task/image-task.model.js";
import type { ImageTaskEntity } from "@libs/mongo/image-task/image-task.entity.js";
import type { TaskStatus } from "@libs/types/task.js";

export type CreateTaskInput = {
  taskId: string;
  displayId: string;
  originalFilename: string;
  status: TaskStatus;
};

export async function createTask(
  data: CreateTaskInput
): Promise<ImageTaskEntity> {
  return ImageTaskModel.create(data);
}

export async function findTaskById(
  taskId: string
): Promise<ImageTaskEntity | null> {
  return ImageTaskModel.findOne({ taskId });
}

export async function countOptimizedAssets(taskIds: string[]): Promise<number> {
  return ImageTaskModel.countDocuments({
    taskId: { $in: taskIds },
    status: "done",
  });
}

export async function findOptimizedAssets(
  taskIds: string[],
  pagination: { limit: number; offset: number }
): Promise<ImageTaskEntity[]> {
  const { limit, offset } = pagination;

  return ImageTaskModel.find({
    taskId: { $in: taskIds },
    status: "done",
  })
    .skip(offset)
    .limit(limit)
    .lean();
}
