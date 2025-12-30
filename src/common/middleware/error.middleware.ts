import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { BaseException } from '../exceptions';
import { errorResponse } from '../utils/response.util';
import logger from '../utils/logger.util';
import config from '../../config/env';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error(err);

  // Handle custom exceptions
  if (err instanceof BaseException) {
    errorResponse(res, err.message, err.statusCode);
    return;
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
    return;
  }

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        errorResponse(res, 'A record with this value already exists', 409);
        return;
      case 'P2025':
        errorResponse(res, 'Record not found', 404);
        return;
      case 'P2003':
        errorResponse(res, 'Foreign key constraint failed', 400);
        return;
      default:
        errorResponse(res, 'Database error', 500);
        return;
    }
  }

  // Handle JWT errors
  if (err instanceof TokenExpiredError) {
    errorResponse(res, 'Token has expired', 401);
    return;
  }

  if (err instanceof JsonWebTokenError) {
    errorResponse(res, 'Invalid token', 401);
    return;
  }

  // Default error
  const message = config.isDevelopment ? err.message : 'Internal server error';
  errorResponse(res, message, 500);
};
