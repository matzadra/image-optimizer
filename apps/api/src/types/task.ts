export type TaskStatusResponse = {
  taskId: string;
  status: "pending" | "processing" | "done" | "error";
  versions: {
    label: string;
    path: string;
    width: number;
    height: number;
    sizeInBytes: number;
  }[];
  errorMessage: string | null;
};
