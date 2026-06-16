// src/middlewares/error.middleware.ts
import { Request, Response, NextFunction } from "express";
import { ApiError } from "../errors/ApiError";
import { UniqueConstraintError, ForeignKeyConstraintError } from "sequelize";
import { ForbiddenError } from "@casl/ability";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let status_code = 500;
  let message = "Internal Server Error";
  let details: any = undefined;

  /**
   * Custom application errors
   */
  if (err instanceof ApiError) {
    status_code = err.status_code;
    message = err.message;
    details = (err as any).details;
  } else if (err.name === "SequelizeValidationError") {
    /**
     * Sequelize validation
     */
    status_code = 400;
    message = "Validation error";
    details = err.errors.map((e: any) => ({
      field: e.path,
      message: e.message,
    }));
  } else if (err instanceof UniqueConstraintError) {
    /**
     * Unique constraint violation → 409
     */
    status_code = 409;
    message = "Resource already exists";
    details = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));
  } else if (err instanceof ForeignKeyConstraintError) {
    /**
     * Foreign key violation → 404
     */
    status_code = 404;
    message = "Referenced resource not found";
  } else if (err instanceof ForbiddenError) {
    status_code = 403;
    message = "Forbidden";
    details = err.message;
  }
  if (status_code === 500) {
    /**
     * Log only unexpected errors
     */
    console.error("UNEXPECTED ERROR:", err);
  }

  return res.status(status_code).json({
    success: false,
    message,
    ...(details && { details }),
  });
};
