import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '../types/api-types.js';

export default function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', error);

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  
  const response: ErrorResponse = {
    statusCode,
    message: error.message || 'Something went wrong',
    error: error.name || 'InternalServerError',
    timestamp: new Date().toISOString(),
    path: req.path,
  };

  if (process.env.NODE_ENV === 'development') {
    (response as any).stack = error.stack;
  }

  res.status(statusCode).json({
    success: false,
    error: response
  });
}