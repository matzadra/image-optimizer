import mongoose from "mongoose";
import { logger } from "@shared/loggers/logger.js";

const mongoUrl =
  process.env.MONGO_URL || "mongodb://mongo:27017/image-optimizer";

export async function connectToMongo(context: string = "App") {
  try {
    await mongoose.connect(mongoUrl);
    logger.info(`${context} - Connected to MongoDB`);
  } catch (err) {
    logger.error(`${context} - Failed to connect to MongoDB:`, err);
    process.exit(1);
  }
}
