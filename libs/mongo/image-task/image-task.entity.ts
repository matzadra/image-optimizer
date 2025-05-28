import type { Document } from "mongoose";
import type {
  TaskStatus,
  VersionInfo,
  OriginalMetadata,
} from "@libs/types/task.js";

export type ImageTaskEntity = Document & {
  displayId: string;
  taskId: string;
  originalFilename: string;
  status: TaskStatus;
  originalMetadata?: OriginalMetadata;
  processedAt?: Date;
  errorMessage?: string;
  versions?: VersionInfo[];
  createdAt: Date;
  updatedAt: Date;
};
