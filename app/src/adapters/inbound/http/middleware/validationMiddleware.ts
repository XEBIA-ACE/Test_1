import { Request, Response, NextFunction } from 'express';
import { ValidationException } from '../../../../domain/exceptions/ValidationException';

export function validateBody(requiredFields: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const errors: string[] = [];
    for (const field of requiredFields) {
      if (req.body[field] === undefined || req.body[field] === null) {
        errors.push(`Field '${field}' is required`);
      }
    }
    if (errors.length > 0) {
      next(new ValidationException(errors));
      return;
    }
    next();
  };
}
