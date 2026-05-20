import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { env } from "../config/env";

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error(err.message, { stack: err.stack, path: req.path });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  const isPrismaError = err.name?.startsWith("Prisma");
  if (isPrismaError) {
    return res.status(400).json({
      success: false,
      message: "Database operation failed",
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({ success: false, message: `Route ${req.path} not found` });
};
