import { FastifyInstance } from "fastify";
import { getClientAssetsHandler } from "./handler.js";

export async function clientAssetsRoutes(app: FastifyInstance) {
  app.get("/assets", getClientAssetsHandler);
}
