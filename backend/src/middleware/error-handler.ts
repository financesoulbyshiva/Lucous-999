import { Request, Response, NextFunction } from "express";
import env from "../config/env";

export interface CustomError extends Error {
  status?: number;
  statusCode?: number;
}

export function errorHandler(
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void | Response {
  console.error("Unhandled error:", err);

  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.status || err.statusCode || 500;
  const message =
    statusCode === 500 && env.isProduction
      ? "Internal server error"
      : err.message || "An unexpected error occurred";

  return res.status(statusCode).json({
    success: false,
    message,
    ...(env.isDevelopment && err.stack ? { stack: err.stack } : {}),
  });
}

export default errorHandler;
