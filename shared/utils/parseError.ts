export function parseError(err: unknown): {
  message: string;
  cause: string | null | unknown;
} {
  if (err instanceof Error) {
    return { message: err.message, cause: err.stack };
  }

  if (typeof err === "string") {
    return { message: err, cause: null };
  }

  return { message: "Unknown error", cause: err };
}
