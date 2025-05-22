export type TaskStatus = "pending" | "processing" | "done" | "error";

export type VersionInfo = {
  label: "low" | "medium" | "high";
  path: string;
  width: number;
  height: number;
  sizeInBytes: number;
};

export type TaskPayload = {
  taskId: string;
  displayId: string;
  originalFilename: string;
  filePath: string;
};

export type TaskStatusResponse = {
  taskId: string;
  status: TaskStatus;
  versions: VersionInfo[];
  errorMessage: string | null;
};

export type ProcessedImageResult = {
  originalMetadata: OriginalMetadata;
  versions: VersionInfo[];
  processedAt: Date;
};

export type ExifData = {
  Make?: string;
  Model?: string;
  ISO?: number;
  LensModel?: string;
  ExposureTime?: number;
  FNumber?: number;
  FocalLength?: number;
  [key: string]: string | number | boolean | undefined;
};

export type OriginalMetadata = {
  width: number;
  height: number;
  mimetype: string;
  exif?: ExifData;
};
