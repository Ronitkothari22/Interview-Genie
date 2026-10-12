import type { NextFunction, Request, Response } from "express";

/** Error carrying an HTTP status code for the error handler to surface. */
export class HttpError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.details = details;
  }
}

/** 404 handler — runs when no route matched. */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: "Not Found",
    path: req.originalUrl,
  });
}

/** Central error handler — must keep the 4-arg signature for Express. */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const status = err instanceof HttpError ? err.status : 500;
  const message = err instanceof Error ? err.message : "Internal Server Error";

  if (status >= 500) {
    console.error("[error]", err);
  }

  res.status(status).json({
    error: message,
    ...(err instanceof HttpError && err.details !== undefined ? { details: err.details } : {}),
  });
}
