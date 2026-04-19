// src/middlewares/error.middleware.ts
import { Request, Response, NextFunction } from "express";
import { ApiError } from "../errors/ApiError";
// import { ValidationError } from "../errors/ValidationError";
// import { ConflictError } from "../errors/ConflictError";
// import { NotFoundError } from "../errors/NotFoundError";
import { UniqueConstraintError, ForeignKeyConstraintError } from "sequelize";
import { ForbiddenError } from "@casl/ability";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode = 500;
  let message = "Internal Server Error";
  let details: any = undefined;

  /**
   * Custom application errors
   */
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    details = (err as any).details;
  } else if (err.name === "SequelizeValidationError") {
    /**
     * Sequelize validation
     */
    statusCode = 400;
    message = "Validation error";
    details = err.errors.map((e: any) => ({
      field: e.path,
      message: e.message,
    }));
  } else if (err instanceof UniqueConstraintError) {
    /**
     * Unique constraint violation → 409
     */
    statusCode = 409;
    message = "Resource already exists";
    details = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));
  } else if (err instanceof ForeignKeyConstraintError) {
    /**
     * Foreign key violation → 404
     */
    statusCode = 404;
    message = "Referenced resource not found";
  } else if (err instanceof ForbiddenError) {
    statusCode = 403;
    message = "Forbidden";
  }
  if (statusCode === 500) {
    /**
     * Log only unexpected errors
     */
    console.error("UNEXPECTED ERROR:", err);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(details && { details }),
  });
};
