import pino from "pino";

export const logger = pino({
  level: "info",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname",
    },
  },
  base: null,
});

export function withContext(origin: string, context: Record<string, unknown>) {
  return {
    info: (msg: string, extra: Record<string, unknown> = {}) =>
      logger.info({ origin, ...context, ...extra }, msg),
    error: (msg: string, extra: Record<string, unknown> = {}) =>
      logger.error({ origin, ...context, ...extra }, msg),
    warn: (msg: string, extra: Record<string, unknown> = {}) =>
      logger.warn({ origin, ...context, ...extra }, msg),
    debug: (msg: string, extra: Record<string, unknown> = {}) =>
      logger.debug({ origin, ...context, ...extra }, msg),
  };
}
