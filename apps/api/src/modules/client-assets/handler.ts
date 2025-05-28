import { FastifyRequest, FastifyReply } from "fastify";
import { getClientAssets } from "./service.js";
import { withContext } from "@shared/loggers/logger.js";

type ClientAssetsQuery = {
  clientId: string;
  limit?: number;
  offset?: number;
};

export async function getClientAssetsHandler(
  req: FastifyRequest<{ Querystring: ClientAssetsQuery }>,
  reply: FastifyReply
) {
  const { clientId, limit = 50, offset = 0 } = req.query;
  const log = withContext("ClientAssetsHandler", { clientId });

  if (!clientId) {
    log.warn("Request without clientId");
    return reply.status(400).send({ error: "Missing clientId" });
  }

  log.info("Fetching client assets with pagination", { limit, offset });

  const { total, data } = await getClientAssets(clientId, { limit, offset });

  return reply.send({
    total,
    count: data.length,
    offset,
    limit,
    data,
  });
}
