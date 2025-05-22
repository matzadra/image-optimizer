import type { LoggerOptions } from "pino";

export function getLoggerOptions(): LoggerOptions {
  return {
    level: "info",
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
      },
    },
    serializers: {
      req(request) {
        return {
          method: request.method,
          url: request.url,
          parameters: request.params,
          headers: request.headers,
        };
      },
      res(reply) {
        return {
          statusCode: reply.statusCode,
        };
      },
    },
  };
}
