import { ImageTaskModel } from "@libs/mongo/imageTask.model.js";
import type {
  TaskStatus,
  OriginalMetadata,
  VersionInfo,
  ImageTaskDocument,
} from "@libs/mongo/imageTask.model.js";

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
): Promise<ImageTaskDocument | null> {
  return ImageTaskModel.findOneAndUpdate(
    { taskId },
    {
      status,
      ...data,
    },
    { new: true }
  );
}
