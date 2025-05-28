import { Schema } from "mongoose";

export const VersionInfoSchema = new Schema(
  {
    label: { type: String, required: true },
    path: { type: String, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    sizeInBytes: { type: Number, required: true },
  },
  { _id: false }
);
