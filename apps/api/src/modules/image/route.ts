import { FastifyInstance } from "fastify";
import { uploadHandler, statusHandler } from "./handler.js";

export async function imageRoutes(app: FastifyInstance): Promise<void> {
  app.route({
    method: "POST",
    url: "/upload",
    handler: uploadHandler,
  });

  app.route({
    method: "GET",
    url: "/status/:taskId",
    handler: statusHandler,
  });
}
