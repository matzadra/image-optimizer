export type OptimizedAssetEntity = {
  clientId: string;
  taskId: string;
  type: "exclusive" | "selected";
  createdAt: Date;
};
