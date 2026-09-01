import { Request, Response, NextFunction } from 'express';
import { ProductNotFoundException } from '../../../../domain/exceptions/ProductNotFoundException';
import { ValidationException } from '../../../../domain/exceptions/ValidationException';

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ProductNotFoundException) {
    res.status(404).json({ error: err.message });
    return;
  }
  if (err instanceof ValidationException) {
    res.status(400).json({ error: err.message, details: err.errors });
    return;
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
}
