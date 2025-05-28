import pkg from "mongoose";
import { ImageTaskSchema } from "./image-task.schema";
import type { ImageTaskEntity } from "./image-task.entity";

const { model } = pkg;

export const ImageTaskModel = model<ImageTaskEntity>(
  "ImageTask",
  ImageTaskSchema
);
