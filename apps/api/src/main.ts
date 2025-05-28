import Fastify, { FastifyInstance } from "fastify";
import multipart from "@fastify/multipart";
import { imageRoutes } from "./modules/image/route.js";
import { connectToMongo } from "@libs/mongo/connection.js";
import { getLoggerOptions } from "./config/logger.js";
import { clientAssetsRoutes } from "./modules/client-assets/route.js";

export const app: FastifyInstance = Fastify({
  logger: getLoggerOptions(),
});

app.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

app.get("/health", async () => {
  return { status: "ok" };
});

app.register(imageRoutes);
app.register(clientAssetsRoutes);

async function start(): Promise<void> {
  try {
    await connectToMongo("API");
    app.log.info("[API] Connected to MongoDB");

    const port = Number(process.env.PORT) || 3000;

    await app.listen({ port, host: "0.0.0.0" });
    app.log.info(`[API] Server listening on port ${port}`);
  } catch (err) {
    app.log.error({ err }, "[API] Failed to start");
    process.exit(1);
  }
}

start();
