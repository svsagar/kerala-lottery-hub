import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../config/logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = (
  err: Error | AppError | ZodError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.error(err);

  // Zod validation error
  if (err instanceof ZodError) {
    return res.status(400).json({
      status: 'error',
      error: 'Validation error',
      details: err.errors,
      timestamp: new Date(),
    });
  }

  // Application error
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      error: err.message,
      details: err.details,
      timestamp: new Date(),
    });
  }

  // Unknown error
  res.status(500).json({
    status: 'error',
    error: 'Internal server error',
    timestamp: new Date(),
  });
};
