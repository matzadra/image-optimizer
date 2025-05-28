import { ImageTaskModel } from "@libs/mongo/image-task/image-task.model.js";
import type { ImageTaskEntity } from "@libs/mongo/image-task/image-task.entity.js";
import type {
  TaskStatus,
  OriginalMetadata,
  VersionInfo,
} from "@libs/types/task.js";

type UpdateTaskData = {
  originalMetadata?: OriginalMetadata;
  processedAt?: Date;
  errorMessage?: string;
  versions?: VersionInfo[];
};

export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus,
  data?: UpdateTaskData
): Promise<ImageTaskEntity | null> {
  return ImageTaskModel.findOneAndUpdate(
    { taskId },
    {
      status,
      ...data,
    },
    { new: true }
  );
}
