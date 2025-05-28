import { Schema } from "mongoose";

export const OriginalMetadataSchema = new Schema(
  {
    width: Number,
    height: Number,
    mimetype: String,
    exif: { type: Schema.Types.Mixed },
  },
  { _id: false }
);
